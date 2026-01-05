import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend
} from 'recharts';
import { TrendingUp, TrendingDown, Clock, CheckCircle, AlertTriangle, FileText } from 'lucide-react';
import { format, subDays, startOfDay, endOfDay, eachDayOfInterval, subMonths, startOfMonth, endOfMonth, eachMonthOfInterval } from 'date-fns';

interface Report {
  id: string;
  category: string;
  status: string;
  priority: string | null;
  created_at: string;
  resolved_at: string | null;
  lga_id: string | null;
}

interface LGA {
  id: string;
  name: string;
}

const categoryLabels: Record<string, string> = {
  illegal_dumping: 'Illegal Dumping',
  blocked_drainage: 'Blocked Drainage',
  open_defecation: 'Open Defecation',
  noise_pollution: 'Noise Pollution',
  sanitation_issues: 'Sanitation Issues',
  environmental_nuisance: 'Environmental Nuisance',
};

const COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

const AnalyticsDashboard = () => {
  const [reports, setReports] = useState<Report[]>([]);
  const [lgas, setLgas] = useState<LGA[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30');

  useEffect(() => {
    fetchData();
  }, [timeRange]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const daysAgo = parseInt(timeRange);
      const startDate = subDays(new Date(), daysAgo).toISOString();

      const [reportsRes, lgasRes] = await Promise.all([
        supabase
          .from('reports')
          .select('id, category, status, priority, created_at, resolved_at, lga_id')
          .gte('created_at', startDate),
        supabase.from('lgas').select('id, name'),
      ]);

      if (reportsRes.data) setReports(reportsRes.data);
      if (lgasRes.data) setLgas(lgasRes.data);
    } catch (error) {
      console.error('Error fetching analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Calculate trends over time
  const getTrendData = () => {
    const daysAgo = parseInt(timeRange);
    const dates = eachDayOfInterval({
      start: subDays(new Date(), daysAgo),
      end: new Date(),
    });

    return dates.map(date => {
      const dayStart = startOfDay(date);
      const dayEnd = endOfDay(date);
      
      const submitted = reports.filter(r => {
        const createdAt = new Date(r.created_at);
        return createdAt >= dayStart && createdAt <= dayEnd;
      }).length;

      const resolved = reports.filter(r => {
        if (!r.resolved_at) return false;
        const resolvedAt = new Date(r.resolved_at);
        return resolvedAt >= dayStart && resolvedAt <= dayEnd;
      }).length;

      return {
        date: format(date, 'MMM dd'),
        submitted,
        resolved,
      };
    });
  };

  // Reports by category
  const getCategoryData = () => {
    const categoryCount: Record<string, number> = {};
    reports.forEach(r => {
      categoryCount[r.category] = (categoryCount[r.category] || 0) + 1;
    });

    return Object.entries(categoryCount).map(([category, count]) => ({
      name: categoryLabels[category] || category,
      value: count,
    }));
  };

  // Reports by status
  const getStatusData = () => {
    const statusCount: Record<string, number> = {};
    reports.forEach(r => {
      statusCount[r.status] = (statusCount[r.status] || 0) + 1;
    });

    return Object.entries(statusCount).map(([status, count]) => ({
      status: status.replace('_', ' '),
      count,
    }));
  };

  // Reports by priority
  const getPriorityData = () => {
    const priorityCount: Record<string, number> = { low: 0, medium: 0, high: 0, emergency: 0 };
    reports.forEach(r => {
      if (r.priority) {
        priorityCount[r.priority] = (priorityCount[r.priority] || 0) + 1;
      }
    });

    return Object.entries(priorityCount).map(([priority, count]) => ({
      priority: priority.charAt(0).toUpperCase() + priority.slice(1),
      count,
    }));
  };

  // Reports by LGA
  const getLgaData = () => {
    const lgaCount: Record<string, number> = {};
    reports.forEach(r => {
      if (r.lga_id) {
        lgaCount[r.lga_id] = (lgaCount[r.lga_id] || 0) + 1;
      }
    });

    return lgas.map(lga => ({
      name: lga.name,
      count: lgaCount[lga.id] || 0,
    })).filter(item => item.count > 0).sort((a, b) => b.count - a.count).slice(0, 10);
  };

  // Calculate stats
  const totalReports = reports.length;
  const resolvedReports = reports.filter(r => r.status === 'resolved' || r.status === 'closed').length;
  const pendingReports = reports.filter(r => r.status === 'submitted').length;
  const inProgressReports = reports.filter(r => r.status === 'in_progress' || r.status === 'assigned').length;
  const resolutionRate = totalReports > 0 ? ((resolvedReports / totalReports) * 100).toFixed(1) : '0';

  // Calculate avg resolution time
  const getAvgResolutionTime = () => {
    const resolvedWithTime = reports.filter(r => r.resolved_at);
    if (resolvedWithTime.length === 0) return 'N/A';

    const totalHours = resolvedWithTime.reduce((acc, r) => {
      const created = new Date(r.created_at).getTime();
      const resolved = new Date(r.resolved_at!).getTime();
      return acc + (resolved - created) / (1000 * 60 * 60);
    }, 0);

    const avgHours = totalHours / resolvedWithTime.length;
    if (avgHours < 24) return `${avgHours.toFixed(1)} hours`;
    return `${(avgHours / 24).toFixed(1)} days`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const trendData = getTrendData();
  const categoryData = getCategoryData();
  const statusData = getStatusData();
  const priorityData = getPriorityData();
  const lgaData = getLgaData();

  return (
    <div className="space-y-6">
      {/* Time Range Filter */}
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-foreground">Analytics Overview</h2>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
            <SelectItem value="90">Last 90 days</SelectItem>
            <SelectItem value="180">Last 6 months</SelectItem>
            <SelectItem value="365">Last year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <FileText className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalReports}</p>
                <p className="text-xs text-muted-foreground">Total Reports</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{resolutionRate}%</p>
                <p className="text-xs text-muted-foreground">Resolution Rate</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
                <Clock className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{getAvgResolutionTime()}</p>
                <p className="text-xs text-muted-foreground">Avg Resolution</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{pendingReports}</p>
                <p className="text-xs text-muted-foreground">Pending</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reports Trend Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Reports Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="colorSubmitted" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorResolved" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="date" className="text-xs" />
                <YAxis className="text-xs" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--background))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }} 
                />
                <Legend />
                <Area type="monotone" dataKey="submitted" name="Submitted" stroke="#3b82f6" fillOpacity={1} fill="url(#colorSubmitted)" />
                <Area type="monotone" dataKey="resolved" name="Resolved" stroke="#22c55e" fillOpacity={1} fill="url(#colorResolved)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Charts Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Category Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Reports by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    labelLine={false}
                  >
                    {categoryData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--background))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }} 
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Reports by Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statusData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis type="number" className="text-xs" />
                  <YAxis type="category" dataKey="status" className="text-xs" width={80} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--background))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }} 
                  />
                  <Bar dataKey="count" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Priority Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Reports by Priority</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={priorityData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="priority" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--background))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }} 
                  />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {priorityData.map((entry, index) => {
                      const colors = { Low: '#9ca3af', Medium: '#f59e0b', High: '#f97316', Emergency: '#ef4444' };
                      return <Cell key={`cell-${index}`} fill={colors[entry.priority as keyof typeof colors] || '#3b82f6'} />;
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* LGA Performance */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Top LGAs by Reports</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={lgaData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis type="number" className="text-xs" />
                  <YAxis type="category" dataKey="name" className="text-xs" width={100} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--background))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }} 
                  />
                  <Bar dataKey="count" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
