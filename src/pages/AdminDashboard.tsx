import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import ReportsMap from "@/components/admin/ReportsMap";
import {
  Leaf,
  LayoutDashboard,
  FileText,
  Users,
  BarChart3,
  Settings,
  LogOut,
  Search,
  Filter,
  MapPin,
  Clock,
  AlertTriangle,
  CheckCircle,
  Loader2,
  ChevronRight,
  Eye,
  UserCheck,
  Map,
} from "lucide-react";

interface Report {
  id: string;
  tracking_id: string;
  category: string;
  title: string;
  status: "submitted" | "assigned" | "in_progress" | "resolved" | "closed";
  priority: "low" | "medium" | "high" | "emergency" | null;
  created_at: string;
  address: string;
  lga: { name: string } | null;
}

interface Stats {
  total: number;
  submitted: number;
  inProgress: number;
  resolved: number;
}

const statusColors: Record<string, string> = {
  submitted: "bg-yellow-500",
  assigned: "bg-blue-500",
  in_progress: "bg-orange-500",
  resolved: "bg-green-500",
  closed: "bg-gray-500",
};

const priorityColors: Record<string, string> = {
  low: "bg-gray-400",
  medium: "bg-yellow-500",
  high: "bg-orange-500",
  emergency: "bg-red-500",
};

const categoryLabels: Record<string, string> = {
  illegal_dumping: "Illegal Dumping",
  blocked_drainage: "Blocked Drainage",
  open_defecation: "Open Defecation",
  noise_pollution: "Noise Pollution",
  sanitation_issues: "Sanitation Issues",
  environmental_nuisance: "Environmental Nuisance",
};

const AdminDashboard = () => {
  const { user, userRole, signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("overview");
  const [reports, setReports] = useState<Report[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, submitted: 0, inProgress: 0, resolved: 0 });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }
    
    if (userRole && userRole !== "admin" && userRole !== "super_admin" && userRole !== "field_officer") {
      toast({
        title: "Access Denied",
        description: "You don't have permission to access the admin dashboard.",
        variant: "destructive",
      });
      navigate("/");
      return;
    }

    fetchReports();
    fetchStats();

    // Set up realtime subscription
    const channel = supabase
      .channel('reports-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'reports' },
        () => {
          fetchReports();
          fetchStats();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, userRole, navigate]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('reports')
        .select(`
          id,
          tracking_id,
          category,
          title,
          status,
          priority,
          created_at,
          address,
          lga:lgas(name)
        `)
        .order('created_at', { ascending: false });

      if (statusFilter !== "all") {
        query = query.eq('status', statusFilter as "submitted" | "assigned" | "in_progress" | "resolved" | "closed");
      }

      if (searchQuery) {
        query = query.or(`tracking_id.ilike.%${searchQuery}%,title.ilike.%${searchQuery}%`);
      }

      const { data, error } = await query;

      if (error) throw error;
      setReports((data || []) as Report[]);
    } catch (error: any) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const { data: allReports } = await supabase.from('reports').select('status');
      
      if (allReports) {
        setStats({
          total: allReports.length,
          submitted: allReports.filter(r => r.status === 'submitted').length,
          inProgress: allReports.filter(r => r.status === 'in_progress' || r.status === 'assigned').length,
          resolved: allReports.filter(r => r.status === 'resolved' || r.status === 'closed').length,
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const updateReportStatus = async (reportId: string, newStatus: "submitted" | "assigned" | "in_progress" | "resolved" | "closed") => {
    try {
      const { error } = await supabase
        .from('reports')
        .update({ status: newStatus })
        .eq('id', reportId);

      if (error) throw error;

      // Create update record
      await supabase.from('report_updates').insert([{
        report_id: reportId,
        updated_by: user?.id,
        new_status: newStatus,
        notes: `Status updated to ${newStatus}`,
      }]);

      toast({
        title: "Status Updated",
        description: `Report status changed to ${newStatus}`,
      });

      fetchReports();
      fetchStats();
    } catch (error: any) {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const updateReportPriority = async (reportId: string, newPriority: "low" | "medium" | "high" | "emergency") => {
    try {
      const { error } = await supabase
        .from('reports')
        .update({ priority: newPriority })
        .eq('id', reportId);

      if (error) throw error;

      toast({
        title: "Priority Updated",
        description: `Report priority changed to ${newPriority}`,
      });

      fetchReports();
    } catch (error: any) {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchReports();
  }, [statusFilter, searchQuery]);

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-secondary/30 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-foreground text-background hidden lg:flex flex-col">
        <div className="p-6 border-b border-background/10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary rounded-lg">
              <Leaf className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <p className="font-serif font-bold">ECSRS</p>
              <p className="text-xs text-background/60">Admin Panel</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <button
            onClick={() => setActiveTab("overview")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              activeTab === "overview" ? "bg-primary text-primary-foreground" : "text-background/70 hover:bg-background/10"
            }`}
          >
            <LayoutDashboard className="w-5 h-5" />
            Overview
          </button>
          <button
            onClick={() => setActiveTab("reports")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              activeTab === "reports" ? "bg-primary text-primary-foreground" : "text-background/70 hover:bg-background/10"
            }`}
          >
            <FileText className="w-5 h-5" />
            Reports
          </button>
          <button
            onClick={() => setActiveTab("analytics")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              activeTab === "analytics" ? "bg-primary text-primary-foreground" : "text-background/70 hover:bg-background/10"
            }`}
          >
            <BarChart3 className="w-5 h-5" />
            Analytics
          </button>
          <button
            onClick={() => setActiveTab("map")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
              activeTab === "map" ? "bg-primary text-primary-foreground" : "text-background/70 hover:bg-background/10"
            }`}
          >
            <Map className="w-5 h-5" />
            GIS Map
          </button>
          {userRole === "super_admin" && (
            <button
              onClick={() => setActiveTab("users")}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === "users" ? "bg-primary text-primary-foreground" : "text-background/70 hover:bg-background/10"
              }`}
            >
              <Users className="w-5 h-5" />
              User Management
            </button>
          )}
        </nav>

        <div className="p-4 border-t border-background/10">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-background/70 hover:bg-background/10 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Header */}
        <header className="bg-background border-b border-border p-4 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-serif font-bold text-foreground">
                {activeTab === "overview" && "Dashboard Overview"}
                {activeTab === "reports" && "Reports Management"}
                {activeTab === "analytics" && "Analytics"}
                {activeTab === "map" && "GIS Map View"}
                {activeTab === "users" && "User Management"}
              </h1>
              <p className="text-muted-foreground text-sm">
                Welcome back, {user?.email}
              </p>
            </div>
            <Button variant="outline" onClick={() => navigate("/")}>
              View Public Site
            </Button>
          </div>
        </header>

        {/* Content */}
        <div className="p-6">
          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Stats Cards */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-background rounded-xl p-6 border border-border">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Reports</p>
                      <p className="text-3xl font-bold text-foreground">{stats.total}</p>
                    </div>
                    <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                      <FileText className="w-6 h-6 text-primary" />
                    </div>
                  </div>
                </div>

                <div className="bg-background rounded-xl p-6 border border-border">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Pending Review</p>
                      <p className="text-3xl font-bold text-yellow-600">{stats.submitted}</p>
                    </div>
                    <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                      <Clock className="w-6 h-6 text-yellow-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-background rounded-xl p-6 border border-border">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">In Progress</p>
                      <p className="text-3xl font-bold text-orange-600">{stats.inProgress}</p>
                    </div>
                    <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                      <AlertTriangle className="w-6 h-6 text-orange-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-background rounded-xl p-6 border border-border">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Resolved</p>
                      <p className="text-3xl font-bold text-green-600">{stats.resolved}</p>
                    </div>
                    <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Reports */}
              <div className="bg-background rounded-xl border border-border">
                <div className="p-4 border-b border-border flex items-center justify-between">
                  <h2 className="font-semibold text-foreground">Recent Reports</h2>
                  <Button variant="ghost" size="sm" onClick={() => setActiveTab("reports")}>
                    View All <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
                <div className="divide-y divide-border">
                  {loading ? (
                    <div className="p-8 text-center">
                      <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
                    </div>
                  ) : reports.slice(0, 5).map((report) => (
                    <div key={report.id} className="p-4 hover:bg-secondary/50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-sm text-primary font-medium">
                              {report.tracking_id}
                            </span>
                            <Badge className={`${statusColors[report.status]} text-white text-xs`}>
                              {report.status.replace('_', ' ')}
                            </Badge>
                          </div>
                          <p className="text-foreground font-medium mt-1">{report.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {categoryLabels[report.category]} • {report.lga?.name || 'Unknown LGA'}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">
                            {new Date(report.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                  {!loading && reports.length === 0 && (
                    <div className="p-8 text-center text-muted-foreground">
                      No reports found
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Reports Tab */}
          {activeTab === "reports" && (
            <div className="space-y-6">
              {/* Filters */}
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    placeholder="Search by tracking ID or title..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-48">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="submitted">Submitted</SelectItem>
                    <SelectItem value="assigned">Assigned</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Reports Table */}
              <div className="bg-background rounded-xl border border-border overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-secondary/50">
                      <tr>
                        <th className="text-left p-4 font-medium text-foreground">Tracking ID</th>
                        <th className="text-left p-4 font-medium text-foreground">Title</th>
                        <th className="text-left p-4 font-medium text-foreground">Category</th>
                        <th className="text-left p-4 font-medium text-foreground">LGA</th>
                        <th className="text-left p-4 font-medium text-foreground">Status</th>
                        <th className="text-left p-4 font-medium text-foreground">Priority</th>
                        <th className="text-left p-4 font-medium text-foreground">Date</th>
                        <th className="text-left p-4 font-medium text-foreground">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {loading ? (
                        <tr>
                          <td colSpan={8} className="p-8 text-center">
                            <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
                          </td>
                        </tr>
                      ) : reports.map((report) => (
                        <tr key={report.id} className="hover:bg-secondary/30 transition-colors">
                          <td className="p-4">
                            <span className="font-mono text-sm text-primary font-medium">
                              {report.tracking_id}
                            </span>
                          </td>
                          <td className="p-4 max-w-[200px] truncate">{report.title}</td>
                          <td className="p-4 text-sm">{categoryLabels[report.category]}</td>
                          <td className="p-4 text-sm">{report.lga?.name || '-'}</td>
                          <td className="p-4">
                            <Select
                              value={report.status}
                              onValueChange={(value) => updateReportStatus(report.id, value as "submitted" | "assigned" | "in_progress" | "resolved" | "closed")}
                            >
                              <SelectTrigger className="h-8 w-32">
                                <Badge className={`${statusColors[report.status]} text-white text-xs`}>
                                  {report.status.replace('_', ' ')}
                                </Badge>
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="submitted">Submitted</SelectItem>
                                <SelectItem value="assigned">Assigned</SelectItem>
                                <SelectItem value="in_progress">In Progress</SelectItem>
                                <SelectItem value="resolved">Resolved</SelectItem>
                                <SelectItem value="closed">Closed</SelectItem>
                              </SelectContent>
                            </Select>
                          </td>
                          <td className="p-4">
                            <Select
                              value={report.priority || 'medium'}
                              onValueChange={(value) => updateReportPriority(report.id, value as "low" | "medium" | "high" | "emergency")}
                            >
                              <SelectTrigger className="h-8 w-28">
                                <Badge className={`${priorityColors[report.priority || 'medium']} text-white text-xs`}>
                                  {report.priority || 'medium'}
                                </Badge>
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="low">Low</SelectItem>
                                <SelectItem value="medium">Medium</SelectItem>
                                <SelectItem value="high">High</SelectItem>
                                <SelectItem value="emergency">Emergency</SelectItem>
                              </SelectContent>
                            </Select>
                          </td>
                          <td className="p-4 text-sm text-muted-foreground">
                            {new Date(report.created_at).toLocaleDateString()}
                          </td>
                          <td className="p-4">
                            <Button variant="ghost" size="sm">
                              <Eye className="w-4 h-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {!loading && reports.length === 0 && (
                  <div className="p-8 text-center text-muted-foreground">
                    No reports found matching your criteria
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === "analytics" && (
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Reports by Category */}
                <div className="bg-background rounded-xl border border-border p-6">
                  <h3 className="font-semibold text-foreground mb-4">Reports by Category</h3>
                  <div className="space-y-4">
                    {Object.entries(categoryLabels).map(([key, label]) => {
                      const count = reports.filter(r => r.category === key).length;
                      const percentage = stats.total ? Math.round((count / stats.total) * 100) : 0;
                      return (
                        <div key={key} className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>{label}</span>
                            <span className="text-muted-foreground">{count} ({percentage}%)</span>
                          </div>
                          <div className="h-2 bg-secondary rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary transition-all duration-300"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Reports by Status */}
                <div className="bg-background rounded-xl border border-border p-6">
                  <h3 className="font-semibold text-foreground mb-4">Reports by Status</h3>
                  <div className="space-y-4">
                    {['submitted', 'assigned', 'in_progress', 'resolved', 'closed'].map((status) => {
                      const count = reports.filter(r => r.status === status).length;
                      const percentage = stats.total ? Math.round((count / stats.total) * 100) : 0;
                      return (
                        <div key={status} className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="capitalize">{status.replace('_', ' ')}</span>
                            <span className="text-muted-foreground">{count} ({percentage}%)</span>
                          </div>
                          <div className="h-2 bg-secondary rounded-full overflow-hidden">
                            <div
                              className={`h-full ${statusColors[status]} transition-all duration-300`}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Resolution Rate */}
              <div className="bg-background rounded-xl border border-border p-6">
                <h3 className="font-semibold text-foreground mb-4">Resolution Performance</h3>
                <div className="grid sm:grid-cols-3 gap-6 text-center">
                  <div>
                    <p className="text-4xl font-bold text-primary">
                      {stats.total ? Math.round((stats.resolved / stats.total) * 100) : 0}%
                    </p>
                    <p className="text-muted-foreground">Resolution Rate</p>
                  </div>
                  <div>
                    <p className="text-4xl font-bold text-foreground">24hrs</p>
                    <p className="text-muted-foreground">Avg Response Time</p>
                  </div>
                  <div>
                    <p className="text-4xl font-bold text-green-600">{stats.resolved}</p>
                    <p className="text-muted-foreground">Total Resolved</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Map Tab */}
          {activeTab === "map" && (
            <div className="space-y-6">
              <div className="bg-background rounded-xl border border-border p-6">
                <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Map className="w-5 h-5 text-primary" />
                  Reports Geographic Distribution
                </h3>
                <p className="text-muted-foreground text-sm mb-6">
                  View all environmental complaints on the map. Hotspots indicate areas with 3 or more reports.
                </p>
                <ReportsMap />
              </div>
            </div>
          )}

          {/* Users Tab */}
          {activeTab === "users" && userRole === "super_admin" && (
            <div className="bg-background rounded-xl border border-border p-6">
              <h3 className="font-semibold text-foreground mb-4">User Management</h3>
              <p className="text-muted-foreground">
                User management features coming soon. You'll be able to manage field officers, 
                assign LGAs, and set permissions.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
