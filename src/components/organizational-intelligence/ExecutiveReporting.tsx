
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  FileText, 
  Download, 
  Calendar,
  Send,
  Eye,
  Clock,
  Users,
  Shield,
  TrendingUp,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  type: 'executive' | 'board' | 'regulatory' | 'operational';
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  last_generated: string;
  next_due: string;
  recipients: string[];
  status: 'active' | 'draft' | 'archived';
}

interface GeneratedReport {
  id: string;
  template_id: string;
  template_name: string;
  generated_at: string;
  generated_by: string;
  status: 'generating' | 'completed' | 'failed';
  file_size?: string;
  download_count: number;
}

interface ExecutiveReportingProps {
  orgId: string;
}

const ExecutiveReporting: React.FC<ExecutiveReportingProps> = ({ orgId }) => {
  const [activeTab, setActiveTab] = useState('templates');
  const [templates, setTemplates] = useState<ReportTemplate[]>([]);
  const [reports, setReports] = useState<GeneratedReport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReportingData();
  }, [orgId]);

  const loadReportingData = async () => {
    setLoading(true);
    try {
      // Mock data for report templates
      const mockTemplates: ReportTemplate[] = [
        {
          id: '1',
          name: 'Executive Risk Dashboard',
          description: 'Comprehensive executive overview of organizational risk posture',
          type: 'executive',
          frequency: 'monthly',
          last_generated: '2024-01-15T09:00:00Z',
          next_due: '2024-02-15T09:00:00Z',
          recipients: ['ceo@company.com', 'cro@company.com'],
          status: 'active'
        },
        {
          id: '2',
          name: 'Board Risk Committee Report',
          description: 'Strategic risk insights for board oversight and governance',
          type: 'board',
          frequency: 'quarterly',
          last_generated: '2024-01-01T08:00:00Z',
          next_due: '2024-04-01T08:00:00Z',
          recipients: ['board@company.com'],
          status: 'active'
        },
        {
          id: '3',
          name: 'Regulatory Compliance Summary',
          description: 'Compliance status and regulatory alignment report',
          type: 'regulatory',
          frequency: 'monthly',
          last_generated: '2024-01-10T10:00:00Z',
          next_due: '2024-02-10T10:00:00Z',
          recipients: ['compliance@company.com', 'legal@company.com'],
          status: 'active'
        },
        {
          id: '4',
          name: 'Operational Intelligence Brief',
          description: 'Daily operational metrics and performance indicators',
          type: 'operational',
          frequency: 'daily',
          last_generated: '2024-01-18T07:00:00Z',
          next_due: '2024-01-19T07:00:00Z',
          recipients: ['operations@company.com'],
          status: 'active'
        }
      ];

      const mockReports: GeneratedReport[] = [
        {
          id: '1',
          template_id: '1',
          template_name: 'Executive Risk Dashboard',
          generated_at: '2024-01-15T09:00:00Z',
          generated_by: 'System Automation',
          status: 'completed',
          file_size: '2.4 MB',
          download_count: 12
        },
        {
          id: '2',
          template_id: '2',
          template_name: 'Board Risk Committee Report',
          generated_at: '2024-01-01T08:00:00Z',
          generated_by: 'Risk Manager',
          status: 'completed',
          file_size: '5.1 MB',
          download_count: 8
        },
        {
          id: '3',
          template_id: '4',
          template_name: 'Operational Intelligence Brief',
          generated_at: '2024-01-18T07:00:00Z',
          generated_by: 'System Automation',
          status: 'generating',
          download_count: 0
        }
      ];

      setTemplates(mockTemplates);
      setReports(mockReports);
    } catch (error) {
      console.error('Error loading reporting data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'executive': return 'bg-purple-100 text-purple-800';
      case 'board': return 'bg-blue-100 text-blue-800';
      case 'regulatory': return 'bg-orange-100 text-orange-800';
      case 'operational': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'archived': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getReportStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'generating': return <Clock className="h-4 w-4 text-blue-500" />;
      case 'failed': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getDaysUntilDue = (dueDateString: string) => {
    const dueDate = new Date(dueDateString);
    const today = new Date();
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-3 bg-gray-200 rounded"></div>
                <div className="h-3 bg-gray-200 rounded w-5/6"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <FileText className="h-8 w-8 text-indigo-500" />
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Executive Reporting</h2>
            <p className="text-muted-foreground">
              Automated report generation and distribution for executive oversight
            </p>
          </div>
        </div>
        <Button className="flex items-center gap-2">
          <FileText className="h-4 w-4" />
          New Template
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="reports">Generated Reports</TabsTrigger>
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {templates.map((template) => (
              <Card key={template.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-base">{template.name}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        {template.description}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Badge className={getTypeColor(template.type)}>
                        {template.type}
                      </Badge>
                      <Badge className={getStatusColor(template.status)}>
                        {template.status}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Frequency:</span>
                      <div className="font-medium capitalize">{template.frequency}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Last Generated:</span>
                      <div className="font-medium">{formatDate(template.last_generated)}</div>
                    </div>
                  </div>

                  <div>
                    <span className="text-sm text-muted-foreground">Next Due:</span>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="font-medium">{formatDate(template.next_due)}</span>
                      <Badge variant="outline" className="text-xs">
                        {getDaysUntilDue(template.next_due)} days
                      </Badge>
                    </div>
                  </div>

                  <div>
                    <span className="text-sm text-muted-foreground">Recipients:</span>
                    <div className="flex items-center gap-1 mt-1">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{template.recipients.length} recipients</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button size="sm" className="flex-1">
                      <Send className="h-4 w-4 mr-2" />
                      Generate Now
                    </Button>
                    <Button size="sm" variant="outline">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline">
                      <Calendar className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <div className="space-y-3">
            {reports.map((report) => (
              <Card key={report.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <FileText className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-medium">{report.template_name}</h4>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>Generated {formatDate(report.generated_at)}</span>
                          <span>by {report.generated_by}</span>
                          {report.file_size && <span>{report.file_size}</span>}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        {getReportStatusIcon(report.status)}
                        <span className="text-sm capitalize">{report.status}</span>
                      </div>
                      
                      {report.status === 'generating' && (
                        <div className="w-20">
                          <Progress value={65} className="h-2" />
                        </div>
                      )}
                      
                      {report.status === 'completed' && (
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </Button>
                          <Button size="sm" variant="outline">
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="schedule" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Report Schedule Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <Calendar className="h-16 w-16 mx-auto mb-4" />
                <h3 className="text-xl font-medium mb-2">Schedule Management</h3>
                <p className="max-w-md mx-auto">
                  Calendar view of scheduled reports and automated generation timelines
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">47</div>
                <div className="text-sm text-muted-foreground">Reports Generated</div>
                <div className="text-xs text-green-600 mt-1">+12% this month</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600">98.2%</div>
                <div className="text-sm text-muted-foreground">Delivery Success Rate</div>
                <div className="text-xs text-green-600 mt-1">+0.5% this month</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-purple-600">2.3 min</div>
                <div className="text-sm text-muted-foreground">Avg Generation Time</div>
                <div className="text-xs text-green-600 mt-1">-15% this month</div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Reporting Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <TrendingUp className="h-12 w-12 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Usage Analytics</h3>
                <p>Detailed analytics on report generation, delivery, and engagement metrics</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ExecutiveReporting;
