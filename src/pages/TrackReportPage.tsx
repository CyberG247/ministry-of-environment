import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import {
  Search,
  Clock,
  CheckCircle,
  AlertTriangle,
  Loader2,
  MapPin,
  Calendar,
  FileText,
  UserCheck,
  ArrowRight,
  ImageIcon,
} from "lucide-react";

interface ReportUpdate {
  id: string;
  created_at: string;
  new_status: string;
  previous_status: string | null;
  notes: string | null;
}

interface Report {
  id: string;
  tracking_id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  priority: string | null;
  address: string | null;
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
  resolution_notes: string | null;
  media_urls: string[] | null;
  resolution_media_urls: string[] | null;
  lga: { name: string } | null;
}

const statusConfig: Record<string, { color: string; bgColor: string; icon: typeof Clock; label: string }> = {
  submitted: { color: "text-yellow-600", bgColor: "bg-yellow-100", icon: Clock, label: "Submitted" },
  assigned: { color: "text-blue-600", bgColor: "bg-blue-100", icon: UserCheck, label: "Assigned" },
  in_progress: { color: "text-orange-600", bgColor: "bg-orange-100", icon: AlertTriangle, label: "In Progress" },
  resolved: { color: "text-green-600", bgColor: "bg-green-100", icon: CheckCircle, label: "Resolved" },
  closed: { color: "text-gray-600", bgColor: "bg-gray-100", icon: CheckCircle, label: "Closed" },
};

const categoryLabels: Record<string, string> = {
  illegal_dumping: "Illegal Dumping",
  blocked_drainage: "Blocked Drainage",
  open_defecation: "Open Defecation",
  noise_pollution: "Noise Pollution",
  sanitation_issues: "Sanitation Issues",
  environmental_nuisance: "Environmental Nuisance",
};

const TrackReportPage = () => {
  const [searchParams] = useSearchParams();
  const [trackingId, setTrackingId] = useState("");
  const [report, setReport] = useState<Report | null>(null);
  const [updates, setUpdates] = useState<ReportUpdate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);

  // Check URL for tracking ID on mount
  useEffect(() => {
    const idFromUrl = searchParams.get("id");
    if (idFromUrl) {
      setTrackingId(idFromUrl.toUpperCase());
      // Trigger search after setting the ID
      setTimeout(() => {
        handleSearchWithId(idFromUrl.toUpperCase());
      }, 100);
    }
  }, [searchParams]);

  const handleSearchWithId = async (id: string) => {
    if (!id.trim()) return;
    
    setLoading(true);
    setError(null);
    setSearched(true);

    try {
      const { data: reportData, error: reportError } = await supabase
        .from("reports")
        .select(`
          id,
          tracking_id,
          title,
          description,
          category,
          status,
          priority,
          address,
          created_at,
          updated_at,
          resolved_at,
          resolution_notes,
          media_urls,
          resolution_media_urls,
          lga:lgas(name)
        `)
        .eq("tracking_id", id.trim().toUpperCase())
        .single();

      if (reportError) {
        if (reportError.code === "PGRST116") {
          setError("No report found with this tracking ID. Please check and try again.");
        } else {
          setError("An error occurred while searching. Please try again.");
        }
        setReport(null);
        setUpdates([]);
        return;
      }

      setReport(reportData as Report);

      const { data: updatesData } = await supabase
        .from("report_updates")
        .select("*")
        .eq("report_id", reportData.id)
        .order("created_at", { ascending: true });

      setUpdates(updatesData || []);
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      setReport(null);
      setUpdates([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    handleSearchWithId(trackingId);
  };

  const getStatusStep = (status: string) => {
    const steps = ["submitted", "assigned", "in_progress", "resolved", "closed"];
    return steps.indexOf(status);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-24 pb-16">
        <div className="container-gov">
          {/* Search Section */}
          <div className="max-w-3xl mx-auto mb-12">
            <div className="text-center mb-8">
              <span className="inline-block px-4 py-1.5 bg-primary/10 text-primary text-sm font-semibold rounded-full mb-4">
                Track Your Report
              </span>
              <h1 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-4">
                Check Report Status
              </h1>
              <p className="text-lg text-muted-foreground">
                Enter your tracking ID to view the current status, timeline updates, and resolution details.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Enter Tracking ID (e.g., ECSRS-2024-0001)"
                  value={trackingId}
                  onChange={(e) => setTrackingId(e.target.value.toUpperCase())}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="h-14 pl-12 text-lg"
                />
              </div>
              <Button 
                onClick={handleSearch} 
                disabled={loading || !trackingId.trim()}
                size="lg"
                className="h-14 px-8"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    Track
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Error State */}
          {error && searched && (
            <div className="max-w-3xl mx-auto">
              <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-6 text-center">
                <AlertTriangle className="w-12 h-12 text-destructive mx-auto mb-4" />
                <p className="text-destructive font-medium">{error}</p>
              </div>
            </div>
          )}

          {/* Report Details */}
          {report && (
            <div className="max-w-4xl mx-auto space-y-8">
              {/* Status Progress Bar */}
              <div className="bg-background rounded-2xl border border-border p-6 md:p-8">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Tracking ID</p>
                    <p className="font-mono text-xl font-bold text-primary">{report.tracking_id}</p>
                  </div>
                  <Badge className={`${statusConfig[report.status]?.bgColor} ${statusConfig[report.status]?.color} text-sm px-4 py-2`}>
                    {statusConfig[report.status]?.label || report.status}
                  </Badge>
                </div>

                {/* Progress Steps */}
                <div className="relative">
                  <div className="absolute top-5 left-0 right-0 h-1 bg-border rounded-full" />
                  <div 
                    className="absolute top-5 left-0 h-1 bg-primary rounded-full transition-all duration-500"
                    style={{ width: `${(getStatusStep(report.status) / 4) * 100}%` }}
                  />
                  <div className="relative flex justify-between">
                    {["submitted", "assigned", "in_progress", "resolved"].map((step, index) => {
                      const isActive = getStatusStep(report.status) >= index;
                      const Icon = statusConfig[step].icon;
                      return (
                        <div key={step} className="flex flex-col items-center">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center z-10 transition-colors ${
                            isActive ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
                          }`}>
                            <Icon className="w-5 h-5" />
                          </div>
                          <span className={`text-xs mt-2 font-medium ${isActive ? "text-primary" : "text-muted-foreground"}`}>
                            {statusConfig[step].label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Report Info Grid */}
              <div className="grid md:grid-cols-2 gap-6">
                {/* Report Details Card */}
                <div className="bg-background rounded-2xl border border-border p-6">
                  <h2 className="font-serif font-bold text-lg text-foreground mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-primary" />
                    Report Details
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Title</p>
                      <p className="font-medium text-foreground">{report.title}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Category</p>
                      <p className="font-medium text-foreground">{categoryLabels[report.category] || report.category}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Description</p>
                      <p className="text-foreground">{report.description}</p>
                    </div>
                    {report.address && (
                      <div>
                        <p className="text-sm text-muted-foreground">Location</p>
                        <p className="text-foreground flex items-center gap-1">
                          <MapPin className="w-4 h-4 text-primary" />
                          {report.address}
                        </p>
                      </div>
                    )}
                    {report.lga && (
                      <div>
                        <p className="text-sm text-muted-foreground">LGA</p>
                        <p className="font-medium text-foreground">{report.lga.name}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Timeline Card */}
                <div className="bg-background rounded-2xl border border-border p-6">
                  <h2 className="font-serif font-bold text-lg text-foreground mb-4 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-primary" />
                    Timeline
                  </h2>
                  <div className="space-y-4">
                    {/* Initial submission */}
                    <div className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-3 h-3 rounded-full bg-primary" />
                        <div className="w-0.5 flex-1 bg-border" />
                      </div>
                      <div className="pb-4">
                        <p className="font-medium text-foreground">Report Submitted</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(report.created_at).toLocaleDateString('en-NG', {
                            dateStyle: 'medium'
                          })} at {new Date(report.created_at).toLocaleTimeString('en-NG', {
                            timeStyle: 'short'
                          })}
                        </p>
                      </div>
                    </div>

                    {/* Updates */}
                    {updates.map((update, index) => (
                      <div key={update.id} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className="w-3 h-3 rounded-full bg-primary" />
                          {index < updates.length - 1 && <div className="w-0.5 flex-1 bg-border" />}
                        </div>
                        <div className="pb-4">
                          <p className="font-medium text-foreground">
                            Status changed to {statusConfig[update.new_status]?.label || update.new_status}
                          </p>
                          {update.notes && (
                            <p className="text-sm text-foreground mt-1">{update.notes}</p>
                          )}
                          <p className="text-sm text-muted-foreground">
                            {new Date(update.created_at).toLocaleDateString('en-NG', {
                              dateStyle: 'medium'
                            })} at {new Date(update.created_at).toLocaleTimeString('en-NG', {
                              timeStyle: 'short'
                            })}
                          </p>
                        </div>
                      </div>
                    ))}

                    {/* Resolution */}
                    {report.resolved_at && (
                      <div className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className="w-3 h-3 rounded-full bg-green-500" />
                        </div>
                        <div>
                          <p className="font-medium text-green-600">Issue Resolved</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(report.resolved_at).toLocaleDateString('en-NG', {
                              dateStyle: 'medium'
                            })}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Resolution Details */}
              {report.resolution_notes && (
                <div className="bg-green-50 dark:bg-green-950/20 rounded-2xl border border-green-200 dark:border-green-900 p-6">
                  <h2 className="font-serif font-bold text-lg text-green-800 dark:text-green-400 mb-4 flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    Resolution Details
                  </h2>
                  <p className="text-green-900 dark:text-green-300">{report.resolution_notes}</p>
                  
                  {/* Resolution Media */}
                  {report.resolution_media_urls && report.resolution_media_urls.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm font-medium text-green-800 dark:text-green-400 mb-2 flex items-center gap-2">
                        <ImageIcon className="w-4 h-4" />
                        Resolution Evidence
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {report.resolution_media_urls.map((url, index) => (
                          <a
                            key={index}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-20 h-20 rounded-lg overflow-hidden border border-green-200 dark:border-green-800 hover:opacity-80 transition-opacity"
                          >
                            <img src={url} alt={`Resolution ${index + 1}`} className="w-full h-full object-cover" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Original Media */}
              {report.media_urls && report.media_urls.length > 0 && (
                <div className="bg-background rounded-2xl border border-border p-6">
                  <h2 className="font-serif font-bold text-lg text-foreground mb-4 flex items-center gap-2">
                    <ImageIcon className="w-5 h-5 text-primary" />
                    Submitted Evidence
                  </h2>
                  <div className="flex flex-wrap gap-4">
                    {report.media_urls.map((url, index) => (
                      <a
                        key={index}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-24 h-24 rounded-lg overflow-hidden border border-border hover:opacity-80 transition-opacity"
                      >
                        <img src={url} alt={`Evidence ${index + 1}`} className="w-full h-full object-cover" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Empty State */}
          {!report && !error && !loading && searched && (
            <div className="max-w-3xl mx-auto text-center">
              <Search className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Enter your tracking ID to view report status</p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default TrackReportPage;
