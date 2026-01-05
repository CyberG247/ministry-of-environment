import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { FileText, Loader2, TrendingUp, PieChart, BarChart3 } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format, startOfMonth, endOfMonth, subMonths } from 'date-fns';

interface Report {
  id: string;
  tracking_id: string;
  category: string;
  title: string;
  status: string;
  priority: string | null;
  created_at: string;
  resolved_at: string | null;
  address: string | null;
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

const MonthlyReportExport = () => {
  const [open, setOpen] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Generate last 12 months options
  const monthOptions = Array.from({ length: 12 }, (_, i) => {
    const date = subMonths(new Date(), i);
    return {
      value: format(date, 'yyyy-MM'),
      label: format(date, 'MMMM yyyy'),
    };
  });

  useEffect(() => {
    if (open && !selectedMonth) {
      setSelectedMonth(monthOptions[0].value);
    }
  }, [open]);

  const generatePDF = async () => {
    if (!selectedMonth) {
      toast({
        title: 'Select Month',
        description: 'Please select a month to generate the report',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      // Parse selected month
      const [year, month] = selectedMonth.split('-').map(Number);
      const monthStart = startOfMonth(new Date(year, month - 1));
      const monthEnd = endOfMonth(new Date(year, month - 1));

      // Fetch reports for the month
      const { data: reports, error: reportsError } = await supabase
        .from('reports')
        .select('*')
        .gte('created_at', monthStart.toISOString())
        .lte('created_at', monthEnd.toISOString())
        .order('created_at', { ascending: false });

      if (reportsError) throw reportsError;

      // Fetch LGAs
      const { data: lgas } = await supabase.from('lgas').select('id, name');
      const lgaMap = new Map((lgas || []).map(l => [l.id, l.name]));

      // Create PDF
      const doc = new jsPDF();
      const monthName = format(monthStart, 'MMMM yyyy');

      // Header with logo and title
      doc.setFillColor(0, 87, 51);
      doc.rect(0, 0, 210, 40, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(22);
      doc.setFont('helvetica', 'bold');
      doc.text('ECSRS Monthly Report', 14, 18);

      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text('Environmental Complaints Surveillance & Reporting System', 14, 26);
      doc.text(`Kano State Ministry of Environment`, 14, 33);

      // Report title
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text(`Monthly Commissioner's Report - ${monthName}`, 14, 52);

      doc.setFontSize(10);
      doc.setTextColor(128, 128, 128);
      doc.setFont('helvetica', 'normal');
      doc.text(`Generated on: ${format(new Date(), 'PPP p')}`, 14, 60);

      // Calculate statistics
      const totalReports = reports?.length || 0;
      const resolvedReports = reports?.filter(r => r.status === 'resolved' || r.status === 'closed').length || 0;
      const pendingReports = reports?.filter(r => r.status === 'submitted').length || 0;
      const inProgressReports = reports?.filter(r => r.status === 'in_progress' || r.status === 'assigned').length || 0;
      const resolutionRate = totalReports > 0 ? ((resolvedReports / totalReports) * 100).toFixed(1) : '0';

      // Category breakdown
      const categoryCount: Record<string, number> = {};
      reports?.forEach(r => {
        categoryCount[r.category] = (categoryCount[r.category] || 0) + 1;
      });

      // Priority breakdown
      const priorityCount: Record<string, number> = { low: 0, medium: 0, high: 0, emergency: 0 };
      reports?.forEach(r => {
        if (r.priority) {
          priorityCount[r.priority] = (priorityCount[r.priority] || 0) + 1;
        }
      });

      // LGA breakdown
      const lgaCount: Record<string, number> = {};
      reports?.forEach(r => {
        if (r.lga_id) {
          const lgaName = lgaMap.get(r.lga_id) || 'Unknown';
          lgaCount[lgaName] = (lgaCount[lgaName] || 0) + 1;
        }
      });

      // Executive Summary Section
      doc.setFontSize(14);
      doc.setTextColor(0, 87, 51);
      doc.setFont('helvetica', 'bold');
      doc.text('Executive Summary', 14, 75);

      doc.setDrawColor(0, 87, 51);
      doc.line(14, 78, 196, 78);

      // Stats boxes
      const drawStatBox = (x: number, y: number, label: string, value: string, color: [number, number, number]) => {
        doc.setFillColor(245, 250, 245);
        doc.roundedRect(x, y, 42, 25, 3, 3, 'F');
        doc.setFontSize(18);
        doc.setTextColor(...color);
        doc.setFont('helvetica', 'bold');
        doc.text(value, x + 21, y + 12, { align: 'center' });
        doc.setFontSize(8);
        doc.setTextColor(100, 100, 100);
        doc.setFont('helvetica', 'normal');
        doc.text(label, x + 21, y + 20, { align: 'center' });
      };

      drawStatBox(14, 85, 'Total Reports', totalReports.toString(), [0, 87, 51]);
      drawStatBox(60, 85, 'Resolved', resolvedReports.toString(), [34, 197, 94]);
      drawStatBox(106, 85, 'Pending', pendingReports.toString(), [245, 158, 11]);
      drawStatBox(152, 85, 'Resolution Rate', `${resolutionRate}%`, [59, 130, 246]);

      // Category Breakdown
      doc.setFontSize(12);
      doc.setTextColor(0, 87, 51);
      doc.setFont('helvetica', 'bold');
      doc.text('Reports by Category', 14, 125);

      const categoryData = Object.entries(categoryCount).map(([cat, count]) => [
        categoryLabels[cat] || cat,
        count.toString(),
        `${((count / totalReports) * 100).toFixed(1)}%`,
      ]);

      autoTable(doc, {
        startY: 130,
        head: [['Category', 'Count', 'Percentage']],
        body: categoryData,
        theme: 'striped',
        styles: { fontSize: 9, cellPadding: 3 },
        headStyles: { fillColor: [0, 87, 51], textColor: [255, 255, 255] },
        columnStyles: {
          0: { cellWidth: 80 },
          1: { cellWidth: 30, halign: 'center' },
          2: { cellWidth: 30, halign: 'center' },
        },
      });

      // Priority Breakdown
      let currentY = (doc as any).lastAutoTable.finalY + 15;

      doc.setFontSize(12);
      doc.setTextColor(0, 87, 51);
      doc.setFont('helvetica', 'bold');
      doc.text('Reports by Priority', 14, currentY);

      const priorityData = Object.entries(priorityCount)
        .filter(([_, count]) => count > 0)
        .map(([priority, count]) => [
          priority.charAt(0).toUpperCase() + priority.slice(1),
          count.toString(),
          `${((count / totalReports) * 100).toFixed(1)}%`,
        ]);

      autoTable(doc, {
        startY: currentY + 5,
        head: [['Priority', 'Count', 'Percentage']],
        body: priorityData,
        theme: 'striped',
        styles: { fontSize: 9, cellPadding: 3 },
        headStyles: { fillColor: [0, 87, 51], textColor: [255, 255, 255] },
        columnStyles: {
          0: { cellWidth: 80 },
          1: { cellWidth: 30, halign: 'center' },
          2: { cellWidth: 30, halign: 'center' },
        },
      });

      // LGA Breakdown (New Page if needed)
      currentY = (doc as any).lastAutoTable.finalY + 15;
      if (currentY > 230) {
        doc.addPage();
        currentY = 20;
      }

      doc.setFontSize(12);
      doc.setTextColor(0, 87, 51);
      doc.setFont('helvetica', 'bold');
      doc.text('Reports by Local Government Area', 14, currentY);

      const lgaData = Object.entries(lgaCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 15)
        .map(([lga, count]) => [
          lga,
          count.toString(),
          `${((count / totalReports) * 100).toFixed(1)}%`,
        ]);

      autoTable(doc, {
        startY: currentY + 5,
        head: [['LGA', 'Count', 'Percentage']],
        body: lgaData,
        theme: 'striped',
        styles: { fontSize: 9, cellPadding: 3 },
        headStyles: { fillColor: [0, 87, 51], textColor: [255, 255, 255] },
        columnStyles: {
          0: { cellWidth: 100 },
          1: { cellWidth: 30, halign: 'center' },
          2: { cellWidth: 30, halign: 'center' },
        },
      });

      // Detailed Reports List (New Page)
      doc.addPage();

      doc.setFillColor(0, 87, 51);
      doc.rect(0, 0, 210, 20, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('Detailed Report Listing', 14, 13);

      const tableData = (reports || []).map(report => [
        report.tracking_id,
        report.title.substring(0, 25) + (report.title.length > 25 ? '...' : ''),
        categoryLabels[report.category] || report.category,
        lgaMap.get(report.lga_id || '') || '-',
        report.status.replace('_', ' '),
        report.priority || 'medium',
        format(new Date(report.created_at), 'MMM dd, yyyy'),
      ]);

      autoTable(doc, {
        startY: 28,
        head: [['Tracking ID', 'Title', 'Category', 'LGA', 'Status', 'Priority', 'Date']],
        body: tableData,
        styles: { fontSize: 7, cellPadding: 2 },
        headStyles: { fillColor: [0, 87, 51], textColor: [255, 255, 255], fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [245, 250, 245] },
        columnStyles: {
          0: { fontStyle: 'bold', textColor: [0, 87, 51] },
          4: { fontStyle: 'bold' },
        },
      });

      // Footer on all pages
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(128, 128, 128);
        doc.text(
          `Page ${i} of ${pageCount} | ECSRS - Kano State Ministry of Environment | Confidential`,
          doc.internal.pageSize.width / 2,
          doc.internal.pageSize.height - 10,
          { align: 'center' }
        );
      }

      // Save the PDF
      doc.save(`ecsrs-monthly-report-${selectedMonth}.pdf`);

      toast({
        title: 'Report Generated',
        description: `Monthly report for ${monthName} has been downloaded`,
      });

      setOpen(false);
    } catch (error: any) {
      console.error('Error generating PDF:', error);
      toast({
        title: 'Export Failed',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <FileText className="w-4 h-4" />
          Monthly Report
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Generate Monthly Commissioner's Report</DialogTitle>
          <DialogDescription>
            Create a comprehensive PDF report with statistics, charts, and detailed breakdown for the selected month.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          <div className="space-y-2">
            <Label>Select Month</Label>
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a month..." />
              </SelectTrigger>
              <SelectContent>
                {monthOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="bg-secondary/50 rounded-lg p-4 space-y-3">
            <p className="text-sm font-medium text-foreground">Report includes:</p>
            <div className="grid gap-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" />
                <span>Executive summary with key metrics</span>
              </div>
              <div className="flex items-center gap-2">
                <PieChart className="w-4 h-4 text-primary" />
                <span>Category and priority breakdown</span>
              </div>
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-primary" />
                <span>LGA performance analysis</span>
              </div>
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary" />
                <span>Complete report listing</span>
              </div>
            </div>
          </div>

          <Button
            onClick={generatePDF}
            disabled={loading || !selectedMonth}
            className="w-full"
          >
            {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Generate PDF Report
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MonthlyReportExport;
