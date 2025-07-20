
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Download, FileImage, FileText, Table, Share2 } from 'lucide-react';
import { toast } from 'sonner';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface DashboardExportProps {
  dashboard: any;
}

const DashboardExport: React.FC<DashboardExportProps> = ({ dashboard }) => {
  const [isExporting, setIsExporting] = useState(false);

  const exportToPNG = async () => {
    setIsExporting(true);
    try {
      const element = document.querySelector('.layout');
      if (!element) {
        throw new Error('Dashboard not found');
      }

      const canvas = await html2canvas(element as HTMLElement, {
        backgroundColor: '#ffffff',
        scale: 2
      });
      
      const link = document.createElement('a');
      link.download = `${dashboard.name}-${new Date().toISOString().split('T')[0]}.png`;
      link.href = canvas.toDataURL();
      link.click();
      
      toast.success('Dashboard exported as PNG');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export dashboard');
    } finally {
      setIsExporting(false);
    }
  };

  const exportToPDF = async () => {
    setIsExporting(true);
    try {
      const element = document.querySelector('.layout');
      if (!element) {
        throw new Error('Dashboard not found');
      }

      const canvas = await html2canvas(element as HTMLElement, {
        backgroundColor: '#ffffff',
        scale: 1.5
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('l', 'mm', 'a4');
      
      const imgWidth = 297;
      const pageHeight = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      
      let position = 0;
      
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
      
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      
      pdf.save(`${dashboard.name}-${new Date().toISOString().split('T')[0]}.pdf`);
      toast.success('Dashboard exported as PDF');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export dashboard');
    } finally {
      setIsExporting(false);
    }
  };

  const exportToExcel = () => {
    // Mock Excel export - in real implementation, collect table data and export
    const csvData = dashboard.widgets
      .filter((w: any) => w.type === 'table')
      .map((w: any) => `${w.title},${w.config.value || 'N/A'}`)
      .join('\n');
    
    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${dashboard.name}-data.csv`;
    link.click();
    window.URL.revokeObjectURL(url);
    
    toast.success('Dashboard data exported as CSV');
  };

  const shareDashboard = () => {
    const shareUrl = `${window.location.origin}/dashboard/${dashboard.id}`;
    navigator.clipboard.writeText(shareUrl);
    toast.success('Dashboard link copied to clipboard');
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" disabled={isExporting}>
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={exportToPNG}>
          <FileImage className="h-4 w-4 mr-2" />
          Export as PNG
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportToPDF}>
          <FileText className="h-4 w-4 mr-2" />
          Export as PDF
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportToExcel}>
          <Table className="h-4 w-4 mr-2" />
          Export Data (CSV)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={shareDashboard}>
          <Share2 className="h-4 w-4 mr-2" />
          Share Dashboard
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default DashboardExport;
