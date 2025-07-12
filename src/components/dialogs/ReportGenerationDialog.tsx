import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Download, Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ReportGenerationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const ReportGenerationDialog: React.FC<ReportGenerationDialogProps> = ({
  open,
  onOpenChange
}) => {
  const [reportType, setReportType] = useState<string>('');
  const [period, setPeriod] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const reportTypes = [
    { value: 'operational', label: 'Operational Dashboard Report', description: 'Real-time metrics and KPI summary' },
    { value: 'compliance', label: 'Compliance Report', description: 'Regulatory compliance status and gaps' },
    { value: 'executive', label: 'Executive Summary', description: 'High-level risk and performance overview' },
    { value: 'incident', label: 'Incident Analysis Report', description: 'Detailed incident trends and response times' },
    { value: 'control', label: 'Control Effectiveness Report', description: 'Control testing results and recommendations' }
  ];

  const periods = [
    { value: 'last-24h', label: 'Last 24 Hours' },
    { value: 'last-week', label: 'Last Week' },
    { value: 'last-month', label: 'Last Month' },
    { value: 'last-quarter', label: 'Last Quarter' },
    { value: 'ytd', label: 'Year to Date' }
  ];

  const handleGenerate = async (action: 'download' | 'email') => {
    if (!reportType || !period) {
      toast({
        title: "Missing Information",
        description: "Please select both report type and time period.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    
    // Simulate report generation
    setTimeout(() => {
      setIsGenerating(false);
      
      if (action === 'download') {
        toast({
          title: "Report Generated",
          description: "Your report has been generated and download will start shortly.",
        });
        // TODO: Implement actual report download
      } else {
        toast({
          title: "Report Sent",
          description: "The report has been sent to your email address.",
        });
        // TODO: Implement email functionality
      }
      
      onOpenChange(false);
    }, 3000);
  };

  const selectedReportType = reportTypes.find(r => r.value === reportType);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Generate Report</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          <div>
            <Label htmlFor="reportType">Report Type *</Label>
            <Select value={reportType} onValueChange={setReportType}>
              <SelectTrigger>
                <SelectValue placeholder="Select report type" />
              </SelectTrigger>
              <SelectContent>
                {reportTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            {selectedReportType && (
              <Card className="mt-3">
                <CardContent className="pt-4">
                  <div className="flex items-start gap-3">
                    <FileText className="h-5 w-5 mt-0.5 text-primary" />
                    <div>
                      <p className="font-medium">{selectedReportType.label}</p>
                      <p className="text-sm text-muted-foreground">
                        {selectedReportType.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <div>
            <Label htmlFor="period">Time Period *</Label>
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger>
                <SelectValue placeholder="Select time period" />
              </SelectTrigger>
              <SelectContent>
                {periods.map((p) => (
                  <SelectItem key={p.value} value={p.value}>
                    {p.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {isGenerating && (
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                  <span>Generating report...</span>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex justify-end gap-2">
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isGenerating}
            >
              Cancel
            </Button>
            <Button 
              variant="outline"
              onClick={() => handleGenerate('email')}
              disabled={isGenerating || !reportType || !period}
              className="flex items-center gap-2"
            >
              <Mail className="h-4 w-4" />
              Email Report
            </Button>
            <Button 
              onClick={() => handleGenerate('download')}
              disabled={isGenerating || !reportType || !period}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Download
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};