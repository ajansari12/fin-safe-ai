
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { CalendarIcon, Download, FileText, Printer } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { getBoardReports, generateBoardReport, BoardReport } from "@/services/appetite-breach-service";
import { toast } from "@/hooks/use-toast";

const BoardReportGenerator: React.FC = () => {
  const [reports, setReports] = useState<BoardReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportType, setReportType] = useState<'weekly' | 'monthly' | 'quarterly' | 'annual'>('monthly');
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [selectedReport, setSelectedReport] = useState<BoardReport | null>(null);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      setIsLoading(true);
      const data = await getBoardReports();
      setReports(data);
    } catch (error) {
      console.error('Error loading reports:', error);
      toast({
        title: "Error",
        description: "Failed to load board reports",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGenerateReport = async () => {
    if (!startDate || !endDate) {
      toast({
        title: "Error",
        description: "Please select start and end dates",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsGenerating(true);
      await generateBoardReport({
        report_period_start: startDate.toISOString().split('T')[0],
        report_period_end: endDate.toISOString().split('T')[0],
        report_type: reportType
      });
      toast({
        title: "Success",
        description: "Board report generated successfully",
      });
      loadReports();
    } catch (error) {
      console.error('Error generating report:', error);
      toast({
        title: "Error",
        description: "Failed to generate board report",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePrintReport = (report: BoardReport) => {
    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Risk Appetite Board Report</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
            .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
            .section { margin-bottom: 30px; }
            .metric { display: inline-block; margin: 10px 20px; text-align: center; }
            .metric-value { font-size: 2em; font-weight: bold; color: #333; }
            .metric-label { font-size: 0.9em; color: #666; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
            th { background-color: #f5f5f5; }
            .status-critical { color: #dc2626; font-weight: bold; }
            .status-warning { color: #d97706; font-weight: bold; }
            .status-good { color: #059669; font-weight: bold; }
            @media print { body { margin: 0; } }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Risk Appetite Board Report</h1>
            <p>Period: ${format(new Date(report.report_period_start), 'MMM dd, yyyy')} - ${format(new Date(report.report_period_end), 'MMM dd, yyyy')}</p>
            <p>Generated: ${format(new Date(report.created_at), 'MMM dd, yyyy HH:mm')}</p>
          </div>

          <div class="section">
            <h2>Executive Summary</h2>
            <div class="metric">
              <div class="metric-value">${report.risk_posture_score || 0}</div>
              <div class="metric-label">Risk Posture Score</div>
            </div>
            <div class="metric">
              <div class="metric-value ${(report.report_data?.criticalBreaches || 0) > 0 ? 'status-critical' : 'status-good'}">
                ${report.report_data?.criticalBreaches || 0}
              </div>
              <div class="metric-label">Critical Breaches</div>
            </div>
            <div class="metric">
              <div class="metric-value">${report.report_data?.totalBreaches || 0}</div>
              <div class="metric-label">Total Breaches</div>
            </div>
            <div class="metric">
              <div class="metric-value ${(report.report_data?.resolvedBreaches || 0) > 0 ? 'status-good' : 'status-warning'}">
                ${report.report_data?.resolvedBreaches || 0}
              </div>
              <div class="metric-label">Resolved</div>
            </div>
          </div>

          <div class="section">
            <h2>Key Findings</h2>
            <p>${report.key_findings || 'No specific findings recorded for this period.'}</p>
          </div>

          <div class="section">
            <h2>Recommendations</h2>
            <p>${report.recommendations || 'No specific recommendations at this time.'}</p>
          </div>

          <div class="section">
            <h2>Risk Metrics Summary</h2>
            <table>
              <thead>
                <tr>
                  <th>Metric</th>
                  <th>Value</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Critical Breaches</td>
                  <td>${report.report_data?.criticalBreaches || 0}</td>
                  <td class="${(report.report_data?.criticalBreaches || 0) > 0 ? 'status-critical' : 'status-good'}">
                    ${(report.report_data?.criticalBreaches || 0) > 0 ? 'Attention Required' : 'Good'}
                  </td>
                </tr>
                <tr>
                  <td>Warning Breaches</td>
                  <td>${report.report_data?.warningBreaches || 0}</td>
                  <td class="${(report.report_data?.warningBreaches || 0) > 2 ? 'status-warning' : 'status-good'}">
                    ${(report.report_data?.warningBreaches || 0) > 2 ? 'Monitor Closely' : 'Acceptable'}
                  </td>
                </tr>
                <tr>
                  <td>Resolution Rate</td>
                  <td>${report.report_data?.totalBreaches > 0 ? Math.round((report.report_data?.resolvedBreaches / report.report_data?.totalBreaches) * 100) : 100}%</td>
                  <td class="${report.report_data?.totalBreaches > 0 && (report.report_data?.resolvedBreaches / report.report_data?.totalBreaches) < 0.8 ? 'status-warning' : 'status-good'}">
                    ${report.report_data?.totalBreaches > 0 && (report.report_data?.resolvedBreaches / report.report_data?.totalBreaches) < 0.8 ? 'Needs Improvement' : 'Good'}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="section">
            <p><strong>Report Status:</strong> ${report.status}</p>
            <p><strong>Generated by:</strong> ${report.generated_by_name || 'System'}</p>
            ${report.approved_by_name ? `<p><strong>Approved by:</strong> ${report.approved_by_name}</p>` : ''}
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.print();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-500';
      case 'pending_approval': return 'bg-yellow-500';
      case 'published': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Board Report Generator</CardTitle>
          <CardDescription>
            Generate comprehensive board-level risk appetite reports
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div>
              <label className="text-sm font-medium">Report Type</label>
              <Select value={reportType} onValueChange={(value: any) => setReportType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="quarterly">Quarterly</SelectItem>
                  <SelectItem value="annual">Annual</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Start Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={setStartDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <label className="text-sm font-medium">End Date</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, "PPP") : "Pick a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="flex items-end">
              <Button 
                onClick={handleGenerateReport}
                disabled={isGenerating || !startDate || !endDate}
                className="w-full"
              >
                <FileText className="mr-2 h-4 w-4" />
                {isGenerating ? 'Generating...' : 'Generate Report'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Generated Reports</CardTitle>
          <CardDescription>
            View and manage previously generated board reports
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-4">Loading reports...</div>
          ) : reports.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No reports generated yet
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Period</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Risk Score</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Generated</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reports.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell>
                      {format(new Date(report.report_period_start), 'MMM dd')} - {format(new Date(report.report_period_end), 'MMM dd, yyyy')}
                    </TableCell>
                    <TableCell className="capitalize">{report.report_type}</TableCell>
                    <TableCell>
                      <span className={`font-mono ${
                        (report.risk_posture_score || 0) < 50 ? 'text-red-600' :
                        (report.risk_posture_score || 0) < 75 ? 'text-yellow-600' : 'text-green-600'
                      }`}>
                        {report.risk_posture_score || 0}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(report.status)}>
                        {report.status.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {format(new Date(report.created_at), 'MMM dd, yyyy')}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handlePrintReport(report)}
                        >
                          <Printer className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedReport(report)}
                        >
                          <FileText className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Report Preview Dialog */}
      <Dialog open={!!selectedReport} onOpenChange={() => setSelectedReport(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Board Report Preview</DialogTitle>
            <DialogDescription>
              {selectedReport && `${selectedReport.report_type} report for ${format(new Date(selectedReport.report_period_start), 'MMM dd')} - ${format(new Date(selectedReport.report_period_end), 'MMM dd, yyyy')}`}
            </DialogDescription>
          </DialogHeader>
          
          {selectedReport && (
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-4">
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-2xl font-bold">{selectedReport.risk_posture_score || 0}</div>
                  <div className="text-sm text-muted-foreground">Risk Posture Score</div>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-2xl font-bold text-red-600">{selectedReport.report_data?.criticalBreaches || 0}</div>
                  <div className="text-sm text-muted-foreground">Critical Breaches</div>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-2xl font-bold">{selectedReport.report_data?.totalBreaches || 0}</div>
                  <div className="text-sm text-muted-foreground">Total Breaches</div>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{selectedReport.report_data?.resolvedBreaches || 0}</div>
                  <div className="text-sm text-muted-foreground">Resolved</div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Executive Summary</h3>
                <p className="text-muted-foreground">
                  {selectedReport.executive_summary || 'No executive summary provided.'}
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Key Findings</h3>
                <p className="text-muted-foreground">
                  {selectedReport.key_findings || 'No specific findings recorded for this period.'}
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Recommendations</h3>
                <p className="text-muted-foreground">
                  {selectedReport.recommendations || 'No specific recommendations at this time.'}
                </p>
              </div>

              <div className="flex gap-2">
                <Button onClick={() => selectedReport && handlePrintReport(selectedReport)}>
                  <Printer className="mr-2 h-4 w-4" />
                  Print Report
                </Button>
                <Button variant="outline" onClick={() => setSelectedReport(null)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BoardReportGenerator;
