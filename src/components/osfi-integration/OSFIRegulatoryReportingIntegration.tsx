import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  FileText, 
  Calendar, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  Download,
  Send,
  Eye
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

interface OSFIReport {
  id: string;
  report_type: string;
  principle: string;
  due_date: string;
  status: 'draft' | 'pending_review' | 'submitted' | 'overdue';
  completion: number;
  last_updated: string;
  next_action: string;
}

const OSFIRegulatoryReportingIntegration: React.FC = () => {
  const { data: osfiReports, refetch } = useQuery({
    queryKey: ['osfi-regulatory-reports'],
    queryFn: async () => {
      // Mock data for OSFI E-21 reporting requirements
      const mockData: OSFIReport[] = [
        {
          id: '1',
          report_type: 'Operational Risk Self-Assessment',
          principle: 'Principle 3',
          due_date: '2024-03-15',
          status: 'pending_review',
          completion: 95,
          last_updated: '2024-01-14',
          next_action: 'Executive review required'
        },
        {
          id: '2',
          report_type: 'Business Continuity Assessment',
          principle: 'Principle 6',
          due_date: '2024-02-28',
          status: 'draft',
          completion: 70,
          last_updated: '2024-01-13',
          next_action: 'Complete testing results'
        },
        {
          id: '3',
          report_type: 'Third Party Risk Report',
          principle: 'Principle 7',
          due_date: '2024-04-01',
          status: 'submitted',
          completion: 100,
          last_updated: '2024-01-10',
          next_action: 'Awaiting OSFI feedback'
        },
        {
          id: '4',
          report_type: 'Data Quality Assessment',
          principle: 'Principle 4',
          due_date: '2024-01-20',
          status: 'overdue',
          completion: 60,
          last_updated: '2024-01-12',
          next_action: 'Immediate completion required'
        }
      ];
      return mockData;
    }
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'submitted':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'pending_review':
        return <Clock className="h-4 w-4 text-blue-600" />;
      case 'draft':
        return <FileText className="h-4 w-4 text-yellow-600" />;
      case 'overdue':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default:
        return <FileText className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'submitted':
        return 'default';
      case 'pending_review':
        return 'secondary';
      case 'draft':
        return 'outline';
      case 'overdue':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const upcomingReports = osfiReports?.filter(report => 
    new Date(report.due_date) > new Date() && report.status !== 'submitted'
  ) || [];

  const overdueReports = osfiReports?.filter(report => 
    report.status === 'overdue'
  ) || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">OSFI Regulatory Reporting</h2>
          <p className="text-muted-foreground">
            E-21 Compliance Reporting and Submissions
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Schedule
          </Button>
          <Button size="sm">
            <Send className="h-4 w-4 mr-2" />
            New Submission
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Total Reports</p>
                <p className="text-2xl font-bold">{osfiReports?.length || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Submitted</p>
                <p className="text-2xl font-bold">
                  {osfiReports?.filter(r => r.status === 'submitted').length || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="text-sm text-muted-foreground">Upcoming</p>
                <p className="text-2xl font-bold">{upcomingReports.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-sm text-muted-foreground">Overdue</p>
                <p className="text-2xl font-bold">{overdueReports.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reports List */}
      <Card>
        <CardHeader>
          <CardTitle>OSFI E-21 Reports</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {osfiReports?.map((report) => (
              <div key={report.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      {getStatusIcon(report.status)}
                      <h3 className="font-semibold">{report.report_type}</h3>
                      <Badge variant="outline">{report.principle}</Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          Due: {format(new Date(report.due_date), 'MMM dd, yyyy')}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm">
                          Updated: {format(new Date(report.last_updated), 'MMM dd, yyyy')}
                        </span>
                      </div>
                      <Badge variant={getStatusVariant(report.status)}>
                        {report.status.replace('_', ' ')}
                      </Badge>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Completion</span>
                        <span className="text-sm font-medium">{report.completion}%</span>
                      </div>
                      <Progress value={report.completion} className="h-2" />
                      <p className="text-sm text-muted-foreground">
                        Next action: {report.next_action}
                      </p>
                    </div>
                  </div>

                  <div className="flex space-x-2 ml-4">
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* OSFI E-21 Requirements */}
      <Card>
        <CardHeader>
          <CardTitle>OSFI E-21 Reporting Requirements</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <h4 className="font-semibold">Quarterly Reports</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Operational Risk Self-Assessment</li>
                <li>• Key Risk Indicators Summary</li>
                <li>• Business Continuity Testing Results</li>
                <li>• Third Party Risk Assessment</li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold">Annual Reports</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Comprehensive Risk Assessment</li>
                <li>• Data Quality Certification</li>
                <li>• Model Validation Report</li>
                <li>• Compliance Attestation</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Next Steps */}
      {(upcomingReports.length > 0 || overdueReports.length > 0) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2" />
              Action Required
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {overdueReports.map((report) => (
                <div key={report.id} className="flex items-center justify-between p-3 border border-red-200 rounded-lg bg-red-50">
                  <div>
                    <p className="font-medium text-red-900">{report.report_type}</p>
                    <p className="text-sm text-red-700">
                      Overdue since {format(new Date(report.due_date), 'MMM dd, yyyy')}
                    </p>
                  </div>
                  <Badge variant="destructive">Urgent</Badge>
                </div>
              ))}
              {upcomingReports.slice(0, 3).map((report) => (
                <div key={report.id} className="flex items-center justify-between p-3 border border-yellow-200 rounded-lg bg-yellow-50">
                  <div>
                    <p className="font-medium text-yellow-900">{report.report_type}</p>
                    <p className="text-sm text-yellow-700">
                      Due {format(new Date(report.due_date), 'MMM dd, yyyy')}
                    </p>
                  </div>
                  <Badge variant="secondary">Upcoming</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default OSFIRegulatoryReportingIntegration;