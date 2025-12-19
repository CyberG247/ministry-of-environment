import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

interface Report {
  id: string;
  tracking_id: string;
  category: string;
  title: string;
  status: string;
  priority: string | null;
  created_at: string;
  address: string;
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

export const exportToPDF = (reports: Report[], title: string = 'Environmental Reports') => {
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(18);
  doc.setTextColor(0, 87, 51); // Nigerian green
  doc.text('ECSRS - Environmental Complaints', 14, 20);
  doc.text('Surveillance & Reporting System', 14, 28);
  
  doc.setFontSize(14);
  doc.setTextColor(0, 0, 0);
  doc.text(title, 14, 40);
  
  doc.setFontSize(10);
  doc.setTextColor(128, 128, 128);
  doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 48);
  doc.text(`Total Reports: ${reports.length}`, 14, 54);
  
  // Table
  const tableData = reports.map(report => [
    report.tracking_id,
    report.title.substring(0, 30) + (report.title.length > 30 ? '...' : ''),
    categoryLabels[report.category] || report.category,
    report.lga?.name || '-',
    report.status.replace('_', ' '),
    report.priority || 'medium',
    new Date(report.created_at).toLocaleDateString(),
  ]);
  
  autoTable(doc, {
    startY: 60,
    head: [['Tracking ID', 'Title', 'Category', 'LGA', 'Status', 'Priority', 'Date']],
    body: tableData,
    styles: {
      fontSize: 8,
      cellPadding: 2,
    },
    headStyles: {
      fillColor: [0, 87, 51],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
    },
    alternateRowStyles: {
      fillColor: [245, 250, 245],
    },
    columnStyles: {
      0: { fontStyle: 'bold', textColor: [0, 87, 51] },
      4: { fontStyle: 'bold' },
    },
  });
  
  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text(
      `Page ${i} of ${pageCount} - Kano State Ministry of Environment`,
      doc.internal.pageSize.width / 2,
      doc.internal.pageSize.height - 10,
      { align: 'center' }
    );
  }
  
  doc.save(`ecsrs-reports-${new Date().toISOString().split('T')[0]}.pdf`);
};

export const exportToExcel = (reports: Report[], title: string = 'Environmental Reports') => {
  const worksheetData = reports.map(report => ({
    'Tracking ID': report.tracking_id,
    'Title': report.title,
    'Category': categoryLabels[report.category] || report.category,
    'LGA': report.lga?.name || '-',
    'Address': report.address || '-',
    'Status': report.status.replace('_', ' '),
    'Priority': report.priority || 'medium',
    'Date Submitted': new Date(report.created_at).toLocaleString(),
  }));
  
  const worksheet = XLSX.utils.json_to_sheet(worksheetData);
  
  // Set column widths
  worksheet['!cols'] = [
    { wch: 18 },  // Tracking ID
    { wch: 40 },  // Title
    { wch: 20 },  // Category
    { wch: 15 },  // LGA
    { wch: 30 },  // Address
    { wch: 12 },  // Status
    { wch: 10 },  // Priority
    { wch: 20 },  // Date
  ];
  
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Reports');
  
  // Add summary sheet
  const summaryData = [
    { 'Metric': 'Total Reports', 'Value': reports.length },
    { 'Metric': 'Submitted', 'Value': reports.filter(r => r.status === 'submitted').length },
    { 'Metric': 'Assigned', 'Value': reports.filter(r => r.status === 'assigned').length },
    { 'Metric': 'In Progress', 'Value': reports.filter(r => r.status === 'in_progress').length },
    { 'Metric': 'Resolved', 'Value': reports.filter(r => r.status === 'resolved').length },
    { 'Metric': 'Closed', 'Value': reports.filter(r => r.status === 'closed').length },
    { 'Metric': 'Generated On', 'Value': new Date().toLocaleString() },
  ];
  
  const summarySheet = XLSX.utils.json_to_sheet(summaryData);
  summarySheet['!cols'] = [{ wch: 15 }, { wch: 25 }];
  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');
  
  XLSX.writeFile(workbook, `ecsrs-reports-${new Date().toISOString().split('T')[0]}.xlsx`);
};
