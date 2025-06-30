
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  TrendingUp,
  FileText,
  Calendar
} from "lucide-react";

const ComplianceMonitoring: React.FC = () => {
  // Mock data - in real implementation, this would come from the service
  const complianceMetrics = {
    osfi_e21_compliance: 85,
    operational_risk_reports: 100,
    data_quality_score: 92,
    on_time_submission_rate: 88,
    total_reports_due: 12,
    reports_submitted: 10,
    overdue_reports: 1,
    upcoming_deadlines: 3
  };

  const recentAlerts = [
    {
      id: 1,
      type: 'overdue',
      message: 'OSFI E-21 Q4 Report is overdue by 2 days',
      severity: 'high',
      timestamp: '2024-01-15T10:30:00Z'
    },
    {
      id: 2,
      type: 'data_quality',
      message: 'Data quality check failed for Operational Risk metrics',
      severity: 'medium',
      timestamp: '2024-01-14T15:45:00Z'
    },
    {
      id: 3,
      type: 'upcoming',
      message: 'Quarterly Risk Assessment due in 7 days',
      severity: 'low',
      timestamp: '2024-01-13T09:15:00Z'
    }
  ];

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'overdue': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'data_quality': return <Shield className="h-4 w-4 text-yellow-500" />;
      case 'upcoming': return <Clock className="h-4 w-4 text-blue-500" />;
      default: return <AlertTriangle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getAlertColor = (severity: string) => {
    switch (severity) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getComplianceColor = (score: number) => {
    if (score >= 95) return 'text-green-600';
    if (score >= 85) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Compliance Monitoring</h2>
        <p className="text-muted-foreground">
          Real-time compliance status and regulatory reporting alerts
        </p>
      </div>

      {/* Compliance Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">OSFI E-21 Compliance</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getComplianceColor(complianceMetrics.osfi_e21_compliance)}`}>
              {complianceMetrics.osfi_e21_compliance}%
            </div>
            <Progress value={complianceMetrics.osfi_e21_compliance} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Data Quality Score</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getComplianceColor(complianceMetrics.data_quality_score)}`}>
              {complianceMetrics.data_quality_score}%
            </div>
            <Progress value={complianceMetrics.data_quality_score} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">On-time Submission</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getComplianceColor(complianceMetrics.on_time_submission_rate)}`}>
              {complianceMetrics.on_time_submission_rate}%
            </div>
            <Progress value={complianceMetrics.on_time_submission_rate} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Report Status</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {complianceMetrics.reports_submitted}/{complianceMetrics.total_reports_due}
            </div>
            <p className="text-xs text-muted-foreground">
              {complianceMetrics.overdue_reports} overdue, {complianceMetrics.upcoming_deadlines} upcoming
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Compliance Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Compliance Alerts
          </CardTitle>
          <CardDescription>
            Recent alerts and notifications requiring attention
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentAlerts.map((alert) => (
              <div key={alert.id} className="flex items-start gap-3 p-3 border rounded-lg">
                {getAlertIcon(alert.type)}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium">{alert.message}</p>
                    <Badge className={`text-xs ${getAlertColor(alert.severity)}`}>
                      {alert.severity.toUpperCase()}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {new Date(alert.timestamp).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Compliance Trends */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Compliance Trends
            </CardTitle>
            <CardDescription>
              Compliance score trends over the last 6 months
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">OSFI E-21 Compliance</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">+3%</span>
                  <TrendingUp className="h-3 w-3 text-green-500" />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Data Quality Score</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">+5%</span>
                  <TrendingUp className="h-3 w-3 text-green-500" />
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">On-time Submissions</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">-2%</span>
                  <TrendingUp className="h-3 w-3 text-red-500 rotate-180" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Upcoming Deadlines
            </CardTitle>
            <CardDescription>
              Regulatory reporting deadlines in the next 30 days
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-2 border rounded">
                <div>
                  <p className="text-sm font-medium">Quarterly Risk Assessment</p>
                  <p className="text-xs text-muted-foreground">Due in 7 days</p>
                </div>
                <Badge variant="outline">Q1 2024</Badge>
              </div>
              <div className="flex items-center justify-between p-2 border rounded">
                <div>
                  <p className="text-sm font-medium">Operational Risk Report</p>
                  <p className="text-xs text-muted-foreground">Due in 14 days</p>
                </div>
                <Badge variant="outline">Monthly</Badge>
              </div>
              <div className="flex items-center justify-between p-2 border rounded">
                <div>
                  <p className="text-sm font-medium">Control Testing Summary</p>
                  <p className="text-xs text-muted-foreground">Due in 21 days</p>
                </div>
                <Badge variant="outline">Quarterly</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ComplianceMonitoring;
