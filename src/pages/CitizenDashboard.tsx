import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  FileText, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Plus, 
  Bell,
  Eye,
  Calendar,
  MapPin
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import { format } from "date-fns";

interface Report {
  id: string;
  tracking_id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  priority: string;
  address: string | null;
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
}

const statusColors: Record<string, string> = {
  submitted: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  under_review: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  in_progress: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
  resolved: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  closed: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300",
};

const CitizenDashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchReports();
    }
  }, [user]);

  const fetchReports = async () => {
    try {
      const { data, error } = await supabase
        .from("reports")
        .select("*")
        .eq("reporter_id", user?.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setReports(data || []);
    } catch (error) {
      console.error("Error fetching reports:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStats = () => {
    const total = reports.length;
    const pending = reports.filter(r => ["submitted", "under_review"].includes(r.status)).length;
    const inProgress = reports.filter(r => r.status === "in_progress").length;
    const resolved = reports.filter(r => ["resolved", "closed"].includes(r.status)).length;
    return { total, pending, inProgress, resolved };
  };

  const stats = getStats();

  const filterReports = (status: string) => {
    if (status === "all") return reports;
    if (status === "pending") return reports.filter(r => ["submitted", "under_review"].includes(r.status));
    if (status === "active") return reports.filter(r => r.status === "in_progress");
    if (status === "resolved") return reports.filter(r => ["resolved", "closed"].includes(r.status));
    return reports;
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8 pt-24">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-serif font-bold text-foreground">My Reports</h1>
            <p className="text-muted-foreground mt-1">
              Track and manage all your submitted reports
            </p>
          </div>
          <div className="flex gap-3 mt-4 md:mt-0">
            <Button variant="outline" onClick={() => navigate("/notifications")}>
              <Bell className="w-4 h-4 mr-2" />
              Notifications
            </Button>
            <Button onClick={() => navigate("/submit-report")}>
              <Plus className="w-4 h-4 mr-2" />
              New Report
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <FileText className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.total}</p>
                  <p className="text-xs text-muted-foreground">Total Reports</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                  <Clock className="w-5 h-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.pending}</p>
                  <p className="text-xs text-muted-foreground">Pending</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-orange-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.inProgress}</p>
                  <p className="text-xs text-muted-foreground">In Progress</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.resolved}</p>
                  <p className="text-xs text-muted-foreground">Resolved</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Reports List */}
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="all">All Reports ({reports.length})</TabsTrigger>
            <TabsTrigger value="pending">Pending ({stats.pending})</TabsTrigger>
            <TabsTrigger value="active">In Progress ({stats.inProgress})</TabsTrigger>
            <TabsTrigger value="resolved">Resolved ({stats.resolved})</TabsTrigger>
          </TabsList>

          {["all", "pending", "active", "resolved"].map((tab) => (
            <TabsContent key={tab} value={tab}>
              {filterReports(tab).length === 0 ? (
                <Card>
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <FileText className="w-12 h-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground text-center">
                      {tab === "all" 
                        ? "You haven't submitted any reports yet"
                        : `No ${tab} reports`}
                    </p>
                    {tab === "all" && (
                      <Button className="mt-4" onClick={() => navigate("/submit-report")}>
                        <Plus className="w-4 h-4 mr-2" />
                        Submit Your First Report
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-4">
                  {filterReports(tab).map((report) => (
                    <Card key={report.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="outline" className="text-xs">
                                {report.tracking_id}
                              </Badge>
                              <Badge className={statusColors[report.status]}>
                                {report.status.replace("_", " ")}
                              </Badge>
                              <Badge variant="secondary" className="text-xs">
                                {report.category.replace("_", " ")}
                              </Badge>
                            </div>
                            <h3 className="font-semibold text-foreground">{report.title}</h3>
                            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                              {report.description}
                            </p>
                            <div className="flex flex-wrap gap-4 mt-3 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {format(new Date(report.created_at), "MMM d, yyyy")}
                              </span>
                              {report.address && (
                                <span className="flex items-center gap-1">
                                  <MapPin className="w-3 h-3" />
                                  {report.address}
                                </span>
                              )}
                            </div>
                          </div>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => navigate(`/track?id=${report.tracking_id}`)}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
};

export default CitizenDashboard;
