import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  FileText, 
  Calendar, 
  Upload, 
  Download, 
  CheckCircle, 
  AlertTriangle, 
  Clock,
  Eye,
  Edit,
  Send,
  BarChart3
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface RegulatoryReport {
  id: string;
  report_type: string;
  reporting_period: string;
  due_date: string;
  submission_date?: string;
  report_status: 'draft' | 'in_review' | 'approved' | 'submitted' | 'rejected';
  report_data: any;
  validation_results?: any;
  reviewer_notes?: string;
  submission_reference?: string;
  created_at: string;
  updated_at: string;
}

const RegulatoryReportingHub: React.FC = () => {
  const [reports, setReports] = useState<RegulatoryReport[]>([]);
  const [selectedReport, setSelectedReport] = useState<RegulatoryReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newReport, setNewReport] = useState({
    report_type: '',
    reporting_period: '',
    due_date: ''
  });
  const { toast } = useToast();

  const reportTypes = [
    { value: 'osfi_e21', label: 'OSFI E-21 Risk Report', description: 'Operational Risk Capital Requirements' },
    { value: 'basel_iii', label: 'Basel III Capital Report', description: 'Capital Adequacy Assessment' },
    { value: 'ccar', label: 'CCAR Stress Test', description: 'Comprehensive Capital Analysis' },
    { value: 'dfast', label: 'DFAST Report', description: 'Dodd-Frank Stress Testing' },
    { value: 'icaap', label: 'ICAAP Assessment', description: 'Internal Capital Adequacy' },
    { value: 'recovery_plan', label: 'Recovery Plan', description: 'Recovery and Resolution Planning' }
  ];

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('regulatory_reports')
        .select('*')
        .order('due_date', { ascending: true });

      if (error) throw error;
      setReports(data || []);
    } catch (error) {
      console.error('Error loading reports:', error);
      toast({
        title: "Error",
        description: "Failed to load regulatory reports",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createReport = async () => {
    try {
      const { error } = await supabase
        .from('regulatory_reports')
        .insert([{
          ...newReport,
          report_data: {},
          validation_results: {}
        }]);

      if (error) throw error;

      toast({
        title: "Report Created",
        description: "New regulatory report has been created"
      });

      setShowCreateForm(false);
      setNewReport({ report_type: '', reporting_period: '', due_date: '' });
      loadReports();
    } catch (error) {
      console.error('Error creating report:', error);
      toast({
        title: "Error",
        description: "Failed to create report",
        variant: "destructive"
      });
    }
  };

  const updateReportStatus = async (reportId: string, status: string) => {
    try {
      const updateData: any = { report_status: status };
      
      if (status === 'submitted') {
        updateData.submission_date = new Date().toISOString().split('T')[0];
        updateData.submission_reference = `REF-${Date.now()}`;
      }

      const { error } = await supabase
        .from('regulatory_reports')
        .update(updateData)
        .eq('id', reportId);

      if (error) throw error;

      toast({
        title: "Status Updated",
        description: `Report status updated to ${status}`
      });

      loadReports();
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: "Error",
        description: "Failed to update report status",
        variant: "destructive"
      });
    }
  };

  const generateReport = async (reportId: string) => {
    try {
      // Simulate report generation with mock data
      const mockReportData = {
        capital_ratios: {
          cet1_ratio: 12.5,
          tier1_ratio: 14.2,
          total_capital_ratio: 16.8
        },
        risk_weighted_assets: 45000000000,
        stress_test_results: {
          baseline_scenario: { loss_rate: 0.025 },
          adverse_scenario: { loss_rate: 0.048 },
          severely_adverse_scenario: { loss_rate: 0.087 }
        },
        operational_risk_metrics: {
          operational_losses: 2500000,
          key_risk_indicators: [
            { name: 'Transaction Volume', value: 98.5, threshold: 95 },
            { name: 'System Uptime', value: 99.8, threshold: 99.5 }
          ]
        }
      };

      const { error } = await supabase
        .from('regulatory_reports')
        .update({
          report_data: mockReportData,
          validation_results: { status: 'valid', checks_passed: 15, checks_failed: 0 }
        })
        .eq('id', reportId);

      if (error) throw error;

      toast({
        title: "Report Generated",
        description: "Regulatory report data has been generated successfully"
      });

      loadReports();
    } catch (error) {
      console.error('Error generating report:', error);
      toast({
        title: "Error",
        description: "Failed to generate report",
        variant: "destructive"
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted': return 'bg-green-500';
      case 'approved': return 'bg-blue-500';
      case 'in_review': return 'bg-yellow-500';
      case 'rejected': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getReportTypeLabel = (type: string) => {
    const reportType = reportTypes.find(rt => rt.value === type);
    return reportType ? reportType.label : type.toUpperCase();
  };

  const getDaysUntilDue = (dueDate: string) => {
    const due = new Date(dueDate);
    const now = new Date();
    const diffTime = due.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Regulatory Reporting Hub</h1>
          <p className="text-muted-foreground">
            Automated regulatory compliance reporting and submission
          </p>
        </div>
        <Button onClick={() => setShowCreateForm(true)}>
          <FileText className="h-4 w-4 mr-2" />
          New Report
        </Button>
      </div>

      {/* Create Report Form */}
      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Regulatory Report</CardTitle>
            <CardDescription>Initialize a new regulatory reporting process</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Report Type</label>
                <Select 
                  value={newReport.report_type} 
                  onValueChange={(value) => setNewReport(prev => ({ ...prev, report_type: value }))}
                >
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
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Reporting Period</label>
                <Input
                  placeholder="e.g., Q3 2024"
                  value={newReport.reporting_period}
                  onChange={(e) => setNewReport(prev => ({ ...prev, reporting_period: e.target.value }))}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Due Date</label>
                <Input
                  type="date"
                  value={newReport.due_date}
                  onChange={(e) => setNewReport(prev => ({ ...prev, due_date: e.target.value }))}
                />
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button onClick={createReport}>Create Report</Button>
              <Button variant="outline" onClick={() => setShowCreateForm(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Reports Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
            <FileText className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{reports.length}</div>
            <p className="text-xs text-muted-foreground">All regulatory reports</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Due Soon</CardTitle>
            <Clock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {reports.filter(r => getDaysUntilDue(r.due_date) <= 7 && r.report_status !== 'submitted').length}
            </div>
            <p className="text-xs text-muted-foreground">Within 7 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Submitted</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {reports.filter(r => r.report_status === 'submitted').length}
            </div>
            <p className="text-xs text-muted-foreground">Successfully submitted</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Edit className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {reports.filter(r => ['draft', 'in_review'].includes(r.report_status)).length}
            </div>
            <p className="text-xs text-muted-foreground">Requires attention</p>
          </CardContent>
        </Card>
      </div>

      {/* Reports List */}
      <Card>
        <CardHeader>
          <CardTitle>Regulatory Reports</CardTitle>
          <CardDescription>Manage and track all regulatory reporting requirements</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {reports.map((report) => {
              const daysUntilDue = getDaysUntilDue(report.due_date);
              const isOverdue = daysUntilDue < 0 && report.report_status !== 'submitted';
              const isDueSoon = daysUntilDue <= 7 && daysUntilDue >= 0 && report.report_status !== 'submitted';

              return (
                <div key={report.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50">
                  <div className="flex items-center gap-4 flex-1">
                    <div className={`p-2 rounded-full ${
                      isOverdue ? 'bg-red-50 text-red-600' :
                      isDueSoon ? 'bg-orange-50 text-orange-600' :
                      'bg-blue-50 text-blue-600'
                    }`}>
                      <FileText className="h-4 w-4" />
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium">{getReportTypeLabel(report.report_type)}</h4>
                        <Badge className={getStatusColor(report.report_status)}>
                          {report.report_status.replace('_', ' ')}
                        </Badge>
                        {isOverdue && (
                          <Badge variant="destructive">Overdue</Badge>
                        )}
                        {isDueSoon && (
                          <Badge className="bg-orange-500">Due Soon</Badge>
                        )}
                      </div>
                      
                      <div className="text-sm text-muted-foreground">
                        <p>Period: {report.reporting_period}</p>
                        <p>Due: {format(new Date(report.due_date), 'MMM dd, yyyy')} 
                          ({Math.abs(daysUntilDue)} days {daysUntilDue < 0 ? 'overdue' : 'remaining'})
                        </p>
                        {report.submission_date && (
                          <p>Submitted: {format(new Date(report.submission_date), 'MMM dd, yyyy')}</p>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {report.report_status === 'draft' && (
                      <>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => generateReport(report.id)}
                        >
                          <BarChart3 className="h-3 w-3 mr-1" />
                          Generate
                        </Button>
                        <Button 
                          size="sm"
                          onClick={() => updateReportStatus(report.id, 'in_review')}
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          Review
                        </Button>
                      </>
                    )}
                    
                    {report.report_status === 'in_review' && (
                      <>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => updateReportStatus(report.id, 'approved')}
                        >
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Approve
                        </Button>
                      </>
                    )}
                    
                    {report.report_status === 'approved' && (
                      <Button 
                        size="sm"
                        onClick={() => updateReportStatus(report.id, 'submitted')}
                      >
                        <Send className="h-3 w-3 mr-1" />
                        Submit
                      </Button>
                    )}
                    
                    <Button size="sm" variant="ghost">
                      <Download className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              );
            })}
            
            {reports.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p>No regulatory reports found.</p>
                <p className="text-sm">Create your first report to get started.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RegulatoryReportingHub;