import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {
  Leaf,
  FileText,
  CheckCircle,
  Clock,
  TrendingUp,
  MapPin,
  BarChart3,
  ArrowRight,
  Loader2,
  Shield,
} from "lucide-react";

interface Stats {
  total: number;
  submitted: number;
  inProgress: number;
  resolved: number;
  byCategory: Record<string, number>;
  byLga: { name: string; count: number }[];
}

interface ResolvedReport {
  id: string;
  tracking_id: string;
  title: string;
  category: string;
  resolved_at: string;
  lga: { name: string } | null;
}

const categoryLabels: Record<string, string> = {
  illegal_dumping: "Illegal Dumping",
  blocked_drainage: "Blocked Drainage",
  open_defecation: "Open Defecation",
  noise_pollution: "Noise Pollution",
  sanitation_issues: "Sanitation Issues",
  environmental_nuisance: "Environmental Nuisance",
};

const categoryIcons: Record<string, string> = {
  illegal_dumping: "🗑️",
  blocked_drainage: "🚰",
  open_defecation: "🚽",
  noise_pollution: "🔊",
  sanitation_issues: "🧹",
  environmental_nuisance: "⚠️",
};

const PublicStats = () => {
  const [stats, setStats] = useState<Stats>({
    total: 0,
    submitted: 0,
    inProgress: 0,
    resolved: 0,
    byCategory: {},
    byLga: [],
  });
  const [recentResolved, setRecentResolved] = useState<ResolvedReport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPublicStats();
  }, []);

  const fetchPublicStats = async () => {
    try {
      // Fetch all reports for stats (only status and category needed)
      const { data: reports } = await supabase
        .from('reports')
        .select('status, category, lga_id');

      if (reports) {
        const byCategory: Record<string, number> = {};
        reports.forEach(r => {
          byCategory[r.category] = (byCategory[r.category] || 0) + 1;
        });

        setStats({
          total: reports.length,
          submitted: reports.filter(r => r.status === 'submitted').length,
          inProgress: reports.filter(r => r.status === 'in_progress' || r.status === 'assigned').length,
          resolved: reports.filter(r => r.status === 'resolved' || r.status === 'closed').length,
          byCategory,
          byLga: [],
        });
      }

      // Fetch recently resolved reports
      const { data: resolved } = await supabase
        .from('reports')
        .select(`
          id,
          tracking_id,
          title,
          category,
          resolved_at,
          lga:lgas(name)
        `)
        .in('status', ['resolved', 'closed'])
        .not('resolved_at', 'is', null)
        .order('resolved_at', { ascending: false })
        .limit(10);

      if (resolved) {
        setRecentResolved(resolved as ResolvedReport[]);
      }

      // Fetch LGA stats
      const { data: lgas } = await supabase
        .from('lgas')
        .select('id, name');

      if (lgas && reports) {
        const lgaMap: Record<string, string> = {};
        lgas.forEach(l => { lgaMap[l.id] = l.name; });

        const lgaCounts: Record<string, number> = {};
        reports.forEach(r => {
          if (r.lga_id) {
            const name = lgaMap[r.lga_id] || 'Unknown';
            lgaCounts[name] = (lgaCounts[name] || 0) + 1;
          }
        });

        const byLga = Object.entries(lgaCounts)
          .map(([name, count]) => ({ name, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5);

        setStats(prev => ({ ...prev, byLga }));
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const resolutionRate = stats.total > 0 
    ? Math.round((stats.resolved / stats.total) * 100) 
    : 0;

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="bg-primary text-primary-foreground py-16">
        <div className="container-gov">
          <div className="text-center max-w-3xl mx-auto">
            <Badge className="bg-primary-foreground/20 text-primary-foreground mb-4">
              <Shield className="w-3 h-3 mr-1" />
              Public Transparency Dashboard
            </Badge>
            <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">
              Environmental Reports Statistics
            </h1>
            <p className="text-lg text-primary-foreground/80">
              Track the progress of environmental complaints across Kano State. 
              This dashboard shows real-time statistics on reported issues and their resolution status.
            </p>
          </div>
        </div>
      </section>

      {/* Main Stats */}
      <section className="py-12 -mt-8">
        <div className="container-gov">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
                <div className="bg-background rounded-xl p-6 border border-border shadow-md">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Reports</p>
                      <p className="text-4xl font-bold text-foreground">{stats.total}</p>
                    </div>
                    <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center">
                      <FileText className="w-7 h-7 text-primary" />
                    </div>
                  </div>
                </div>

                <div className="bg-background rounded-xl p-6 border border-border shadow-md">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Under Review</p>
                      <p className="text-4xl font-bold text-yellow-600">{stats.submitted}</p>
                    </div>
                    <div className="w-14 h-14 bg-yellow-100 rounded-xl flex items-center justify-center">
                      <Clock className="w-7 h-7 text-yellow-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-background rounded-xl p-6 border border-border shadow-md">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">In Progress</p>
                      <p className="text-4xl font-bold text-orange-600">{stats.inProgress}</p>
                    </div>
                    <div className="w-14 h-14 bg-orange-100 rounded-xl flex items-center justify-center">
                      <TrendingUp className="w-7 h-7 text-orange-600" />
                    </div>
                  </div>
                </div>

                <div className="bg-background rounded-xl p-6 border border-border shadow-md">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Resolved</p>
                      <p className="text-4xl font-bold text-green-600">{stats.resolved}</p>
                    </div>
                    <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center">
                      <CheckCircle className="w-7 h-7 text-green-600" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Resolution Rate Banner */}
              <div className="bg-gradient-to-r from-primary to-primary/80 rounded-xl p-8 text-primary-foreground mb-12">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                  <div>
                    <h2 className="text-2xl font-serif font-bold mb-2">Resolution Rate</h2>
                    <p className="text-primary-foreground/80">
                      Our team is actively working to resolve environmental issues reported by citizens
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-6xl font-bold">{resolutionRate}%</p>
                    <p className="text-sm text-primary-foreground/70">of reports resolved</p>
                  </div>
                </div>
              </div>

              {/* Reports by Category */}
              <div className="grid lg:grid-cols-2 gap-8 mb-12">
                <div className="bg-background rounded-xl border border-border p-6 shadow-md">
                  <div className="flex items-center gap-2 mb-6">
                    <BarChart3 className="w-5 h-5 text-primary" />
                    <h3 className="font-serif font-bold text-lg">Reports by Category</h3>
                  </div>
                  <div className="space-y-4">
                    {Object.entries(categoryLabels).map(([key, label]) => {
                      const count = stats.byCategory[key] || 0;
                      const percentage = stats.total ? Math.round((count / stats.total) * 100) : 0;
                      return (
                        <div key={key} className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="flex items-center gap-2">
                              <span>{categoryIcons[key]}</span>
                              <span>{label}</span>
                            </span>
                            <span className="text-muted-foreground font-medium">{count}</span>
                          </div>
                          <div className="h-2 bg-secondary rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary transition-all duration-500"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="bg-background rounded-xl border border-border p-6 shadow-md">
                  <div className="flex items-center gap-2 mb-6">
                    <MapPin className="w-5 h-5 text-primary" />
                    <h3 className="font-serif font-bold text-lg">Top Reporting Areas</h3>
                  </div>
                  {stats.byLga.length > 0 ? (
                    <div className="space-y-4">
                      {stats.byLga.map((lga, index) => (
                        <div key={lga.name} className="flex items-center gap-4">
                          <span className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                            {index + 1}
                          </span>
                          <div className="flex-1">
                            <p className="font-medium text-foreground">{lga.name}</p>
                            <p className="text-sm text-muted-foreground">{lga.count} reports</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-8">
                      No location data available yet
                    </p>
                  )}
                </div>
              </div>

              {/* Recently Resolved */}
              <div className="bg-background rounded-xl border border-border shadow-md">
                <div className="p-6 border-b border-border flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <h3 className="font-serif font-bold text-lg">Recently Resolved Cases</h3>
                  </div>
                  <Badge className="bg-green-100 text-green-700">
                    {recentResolved.length} cases
                  </Badge>
                </div>
                <div className="divide-y divide-border">
                  {recentResolved.length > 0 ? (
                    recentResolved.map((report) => (
                      <div key={report.id} className="p-4 hover:bg-secondary/30 transition-colors">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xl">{categoryIcons[report.category]}</span>
                              <span className="font-mono text-sm text-primary font-medium">
                                {report.tracking_id}
                              </span>
                            </div>
                            <p className="font-medium text-foreground">{report.title}</p>
                            <p className="text-sm text-muted-foreground">
                              {categoryLabels[report.category]} • {report.lga?.name || 'Unknown LGA'}
                            </p>
                          </div>
                          <div className="text-right">
                            <Badge className="bg-green-100 text-green-700 mb-1">Resolved</Badge>
                            <p className="text-xs text-muted-foreground">
                              {report.resolved_at && new Date(report.resolved_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-8 text-center text-muted-foreground">
                      No resolved cases yet
                    </div>
                  )}
                </div>
              </div>

              {/* CTA */}
              <div className="text-center mt-12">
                <h3 className="text-xl font-serif font-bold text-foreground mb-4">
                  Have an environmental issue to report?
                </h3>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button asChild size="lg" className="gap-2">
                    <Link to="/submit-report">
                      Submit a Report
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="lg">
                    <Link to="/track">Track Your Report</Link>
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default PublicStats;
