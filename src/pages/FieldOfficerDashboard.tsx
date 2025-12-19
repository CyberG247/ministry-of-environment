import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Leaf,
  MapPin,
  Clock,
  AlertTriangle,
  CheckCircle,
  Loader2,
  LogOut,
  RefreshCw,
  Camera,
  FileText,
  ChevronRight,
  Menu,
  X,
} from "lucide-react";

interface Report {
  id: string;
  tracking_id: string;
  category: string;
  title: string;
  description: string;
  status: "submitted" | "assigned" | "in_progress" | "resolved" | "closed";
  priority: "low" | "medium" | "high" | "emergency" | null;
  created_at: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
  media_urls: string[];
  lga: { name: string } | null;
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

const FieldOfficerDashboard = () => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [updateNotes, setUpdateNotes] = useState("");
  const [updating, setUpdating] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate("/auth");
      return;
    }

    fetchAssignedReports();

    const channel = supabase
      .channel('field-officer-reports')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'reports' },
        () => fetchAssignedReports()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, navigate]);

  const fetchAssignedReports = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('reports')
        .select(`
          id,
          tracking_id,
          category,
          title,
          description,
          status,
          priority,
          created_at,
          address,
          latitude,
          longitude,
          media_urls,
          lga:lgas(name)
        `)
        .eq('assigned_officer_id', user?.id)
        .order('priority', { ascending: false })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setReports((data || []) as Report[]);
    } catch (error: any) {
      console.error('Error fetching reports:', error);
      toast({
        title: "Error",
        description: "Failed to fetch assigned reports",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateReportStatus = async (newStatus: "in_progress" | "resolved") => {
    if (!selectedReport) return;

    setUpdating(true);
    try {
      const updateData: any = { status: newStatus };
      
      if (newStatus === "resolved") {
        updateData.resolved_at = new Date().toISOString();
        updateData.resolution_notes = updateNotes;
      }

      const { error } = await supabase
        .from('reports')
        .update(updateData)
        .eq('id', selectedReport.id);

      if (error) throw error;

      await supabase.from('report_updates').insert([{
        report_id: selectedReport.id,
        updated_by: user?.id,
        previous_status: selectedReport.status,
        new_status: newStatus,
        notes: updateNotes || `Status updated to ${newStatus}`,
      }]);

      toast({
        title: "Status Updated",
        description: `Report marked as ${newStatus.replace('_', ' ')}`,
      });

      setSelectedReport(null);
      setUpdateNotes("");
      fetchAssignedReports();
    } catch (error: any) {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate("/");
  };

  const stats = {
    total: reports.length,
    pending: reports.filter(r => r.status === 'assigned').length,
    inProgress: reports.filter(r => r.status === 'in_progress').length,
    resolved: reports.filter(r => r.status === 'resolved' || r.status === 'closed').length,
  };

  return (
    <div className="min-h-screen bg-secondary/30">
      {/* Mobile Header */}
      <header className="bg-primary text-primary-foreground p-4 sticky top-0 z-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary-foreground/10 rounded-lg">
              <Leaf className="w-5 h-5" />
            </div>
            <div>
              <p className="font-serif font-bold text-sm">ECSRS</p>
              <p className="text-xs text-primary-foreground/70">Field Officer</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={fetchAssignedReports}
              className="text-primary-foreground hover:bg-primary-foreground/10"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMenuOpen(!menuOpen)}
              className="text-primary-foreground hover:bg-primary-foreground/10"
            >
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {menuOpen && (
          <div className="absolute top-full left-0 right-0 bg-foreground border-t border-background/10 p-4">
            <div className="space-y-2">
              <p className="text-sm text-background/70">{user?.email}</p>
              <Button
                variant="ghost"
                onClick={handleLogout}
                className="w-full justify-start text-background/80 hover:bg-background/10"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        )}
      </header>

      {/* Stats Cards */}
      <div className="p-4 grid grid-cols-2 gap-3">
        <div className="bg-background rounded-xl p-4 border border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats.total}</p>
              <p className="text-xs text-muted-foreground">Assigned</p>
            </div>
          </div>
        </div>

        <div className="bg-background rounded-xl p-4 border border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-xl flex items-center justify-center">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
              <p className="text-xs text-muted-foreground">Pending</p>
            </div>
          </div>
        </div>

        <div className="bg-background rounded-xl p-4 border border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-orange-600">{stats.inProgress}</p>
              <p className="text-xs text-muted-foreground">In Progress</p>
            </div>
          </div>
        </div>

        <div className="bg-background rounded-xl p-4 border border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">{stats.resolved}</p>
              <p className="text-xs text-muted-foreground">Resolved</p>
            </div>
          </div>
        </div>
      </div>

      {/* Cases List */}
      <div className="p-4">
        <h2 className="font-serif font-bold text-foreground mb-4">Assigned Cases</h2>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : reports.length === 0 ? (
          <div className="bg-background rounded-xl border border-border p-8 text-center">
            <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No cases assigned to you yet</p>
          </div>
        ) : (
          <div className="space-y-3">
            {reports.map((report) => (
              <div
                key={report.id}
                onClick={() => setSelectedReport(report)}
                className="bg-background rounded-xl border border-border p-4 active:bg-secondary/50 transition-colors cursor-pointer"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-xs text-primary font-medium">
                        {report.tracking_id}
                      </span>
                      {report.priority === 'emergency' && (
                        <Badge className="bg-red-500 text-white text-xs animate-pulse">
                          URGENT
                        </Badge>
                      )}
                    </div>
                    <p className="font-medium text-foreground text-sm line-clamp-1">
                      {report.title}
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                </div>

                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                  <MapPin className="w-3 h-3" />
                  <span className="line-clamp-1">{report.address || report.lga?.name || 'Unknown location'}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Badge className={`${statusColors[report.status]} text-white text-xs`}>
                    {report.status.replace('_', ' ')}
                  </Badge>
                  <Badge className={`${priorityColors[report.priority || 'medium']} text-white text-xs`}>
                    {report.priority || 'medium'}
                  </Badge>
                  <span className="text-xs text-muted-foreground ml-auto">
                    {new Date(report.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Report Detail Modal */}
      <Dialog open={!!selectedReport} onOpenChange={() => setSelectedReport(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          {selectedReport && (
            <>
              <DialogHeader>
                <DialogTitle className="font-serif">
                  {selectedReport.tracking_id}
                </DialogTitle>
                <DialogDescription>
                  {categoryLabels[selectedReport.category]}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-foreground mb-1">{selectedReport.title}</h4>
                  <p className="text-sm text-muted-foreground">{selectedReport.description}</p>
                </div>

                <div className="flex items-center gap-2">
                  <Badge className={`${statusColors[selectedReport.status]} text-white`}>
                    {selectedReport.status.replace('_', ' ')}
                  </Badge>
                  <Badge className={`${priorityColors[selectedReport.priority || 'medium']} text-white`}>
                    {selectedReport.priority || 'medium'}
                  </Badge>
                </div>

                <div className="bg-secondary/50 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm text-foreground">{selectedReport.address || 'No address provided'}</p>
                      <p className="text-xs text-muted-foreground">
                        {selectedReport.lga?.name}
                        {selectedReport.latitude && selectedReport.longitude && (
                          <a
                            href={`https://www.google.com/maps?q=${selectedReport.latitude},${selectedReport.longitude}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary ml-2 underline"
                          >
                            Open in Maps
                          </a>
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                {selectedReport.media_urls && selectedReport.media_urls.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-2 flex items-center gap-2">
                      <Camera className="w-4 h-4" />
                      Attached Media ({selectedReport.media_urls.length})
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                      {selectedReport.media_urls.map((url, index) => (
                        <a
                          key={index}
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="aspect-square rounded-lg bg-secondary overflow-hidden"
                        >
                          <img
                            src={url}
                            alt={`Evidence ${index + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {(selectedReport.status === 'assigned' || selectedReport.status === 'in_progress') && (
                  <div className="border-t border-border pt-4">
                    <p className="text-sm font-medium mb-2">Update Status</p>
                    <Textarea
                      placeholder="Add notes about your progress or resolution..."
                      value={updateNotes}
                      onChange={(e) => setUpdateNotes(e.target.value)}
                      className="mb-3"
                      rows={3}
                    />
                    <div className="flex gap-2">
                      {selectedReport.status === 'assigned' && (
                        <Button
                          onClick={() => updateReportStatus('in_progress')}
                          disabled={updating}
                          className="flex-1 bg-orange-500 hover:bg-orange-600"
                        >
                          {updating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                          Start Work
                        </Button>
                      )}
                      <Button
                        onClick={() => updateReportStatus('resolved')}
                        disabled={updating}
                        className="flex-1 bg-green-600 hover:bg-green-700"
                      >
                        {updating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                        Mark Resolved
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setSelectedReport(null)}>
                  Close
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FieldOfficerDashboard;
