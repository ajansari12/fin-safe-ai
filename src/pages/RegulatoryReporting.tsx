import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { reportingService, ReportInstance, ReportTemplate } from '@/services/regulatory-reporting/reporting-service';
import { dataAggregationService } from '@/services/regulatory-reporting/data-aggregation-service';
import { reportValidationService } from '@/services/regulatory-reporting/report-validation-service';
import { 
  FileText, 
  Calendar, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Plus,
  Download,
  Eye,
  Edit,
  Send
} from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

const RegulatoryReporting = () => {
  const [reports, setReports] = useState<ReportInstance[]>([]);
  const [templates, setTemplates] = useState<ReportTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<ReportInstance | null>(null);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [reportsData, templatesData, dashboardInfo] = await Promise.all([
        reportingService.getReportInstances(),
        reportingService.getReportTemplates(),
        reportingService.getReportingDashboardData(),
      ]);
      
      setReports(reportsData);
      setTemplates(templatesData);
      setDashboardData(dashboardInfo);
    } catch (error) {
      console.error('Error loading regulatory reporting data:', error);
      toast({
        title: "Error",
        description: "Failed to load regulatory reporting data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted':
      case 'accepted':
        return 'bg-success';
      case 'approved':
        return 'bg-primary';
      case 'review':
        return 'bg-warning';
      case 'rejected':
        return 'bg-destructive';
      case 'in_progress':
        return 'bg-info';
      default:
        return 'bg-muted';
    }
  };

  const getDaysUntilDue = (dueDate: string) => {
    const due = new Date(dueDate);
    const now = new Date();
    const diffTime = due.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const handleGenerateReport = async (templateId: string) => {
    try {
      const template = templates.find(t => t.id === templateId);
      if (!template) return;

      // Create new report instance
      const reportInstance = await reportingService.createReportInstance({
        template_id: templateId,
        instance_name: `${template.template_name} - ${format(new Date(), 'MMM yyyy')}`,
        reporting_period_start: format(new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1), 'yyyy-MM-dd'),
        reporting_period_end: format(new Date(new Date().getFullYear(), new Date().getMonth(), 0), 'yyyy-MM-dd'),
        due_date: format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
        status: 'draft',
      });

      // Start data aggregation
      const aggregatedData = await dataAggregationService.aggregateDataForReport(
        templateId,
        reportInstance.reporting_period_start,
        reportInstance.reporting_period_end
      );

      // Update report with aggregated data
      await reportingService.updateReportInstance(reportInstance.id, {
        aggregated_data: aggregatedData,
        status: 'in_progress',
      });

      toast({
        title: "Report Generated",
        description: `${template.template_name} has been generated successfully`,
      });

      loadData();
    } catch (error) {
      console.error('Error generating report:', error);
      toast({
        title: "Error",
        description: "Failed to generate report",
        variant: "destructive",
      });
    }
  };

  const handleValidateReport = async (reportId: string) => {
    try {
      const report = reports.find(r => r.id === reportId);
      if (!report) return;

      const template = templates.find(t => t.id === report.template_id);
      if (!template) return;

      const validationSummary = await reportValidationService.validateReport(
        reportId,
        report.aggregated_data,
        template.template_type
      );

      toast({
        title: "Validation Complete",
        description: `${validationSummary.passed}/${validationSummary.totalRules} rules passed`,
        variant: validationSummary.overallStatus === 'failed' ? 'destructive' : 'default',
      });

      loadData();
    } catch (error) {
      console.error('Error validating report:', error);
      toast({
        title: "Error",
        description: "Failed to validate report",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Regulatory Reporting</h1>
          <p className="text-muted-foreground">
            Automated regulatory report generation and submission
          </p>
        </div>
      </div>

      {/* Dashboard Cards */}
      {dashboardData && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData.totalReports}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Reports</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData.pendingReports}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Overdue</CardTitle>
              <AlertTriangle className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{dashboardData.overdue}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Submitted</CardTitle>
              <CheckCircle className="h-4 w-4 text-success" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-success">{dashboardData.submitted}</div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="reports" className="space-y-4">
        <TabsList>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="schedules">Schedules</TabsTrigger>
        </TabsList>

        <TabsContent value="reports" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Report Instances</h2>
            <Button onClick={() => {/* Open create report dialog */}}>
              <Plus className="mr-2 h-4 w-4" />
              New Report
            </Button>
          </div>

          <div className="grid gap-4">
            {reports.map((report) => {
              const template = templates.find(t => t.id === report.template_id);
              const daysUntilDue = getDaysUntilDue(report.due_date);
              const isOverdue = daysUntilDue < 0;

              return (
                <Card key={report.id} className={isOverdue ? 'border-destructive' : ''}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">{report.instance_name}</CardTitle>
                        <CardDescription>
                          {template?.regulatory_framework} • 
                          Period: {format(new Date(report.reporting_period_start), 'MMM dd')} - 
                          {format(new Date(report.reporting_period_end), 'MMM dd, yyyy')}
                        </CardDescription>
                      </div>
                      <Badge className={getStatusColor(report.status)}>
                        {report.status.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center">
                          <Calendar className="mr-2 h-4 w-4" />
                          Due: {format(new Date(report.due_date), 'MMM dd, yyyy')}
                        </span>
                        {isOverdue ? (
                          <span className="text-destructive font-medium">
                            {Math.abs(daysUntilDue)} days overdue
                          </span>
                        ) : (
                          <span className="text-muted-foreground">
                            {daysUntilDue} days remaining
                          </span>
                        )}
                      </div>

                      {report.validation_results?.summary && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span>Validation Progress</span>
                            <span>{report.validation_results.summary.completionPercentage}%</span>
                          </div>
                          <Progress value={report.validation_results.summary.completionPercentage} />
                        </div>
                      )}

                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => setSelectedReport(report)}>
                          <Eye className="mr-2 h-4 w-4" />
                          View
                        </Button>
                        <Button variant="outline" size="sm">
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleValidateReport(report.id)}
                        >
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Validate
                        </Button>
                        {report.status === 'approved' && (
                          <Button size="sm">
                            <Send className="mr-2 h-4 w-4" />
                            Submit
                          </Button>
                        )}
                        <Button variant="outline" size="sm">
                          <Download className="mr-2 h-4 w-4" />
                          Export
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="templates" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Report Templates</h2>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Template
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {templates.map((template) => (
              <Card key={template.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{template.template_name}</CardTitle>
                    {template.is_system_template && (
                      <Badge variant="secondary">System</Badge>
                    )}
                  </div>
                  <CardDescription>{template.regulatory_framework}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {template.description}
                    </p>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        onClick={() => handleGenerateReport(template.id)}
                        className="flex-1"
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Generate
                      </Button>
                      <Button variant="outline" size="sm">
                        <Eye className="mr-2 h-4 w-4" />
                        View
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="schedules" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Report Schedules</h2>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              New Schedule
            </Button>
          </div>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Report scheduling coming soon</p>
                <p className="text-sm">Automated report generation based on regulatory deadlines</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RegulatoryReporting;