import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  FileText, 
  Calendar, 
  Send, 
  Clock, 
  CheckCircle,
  AlertTriangle,
  Download,
  BarChart3,
  Shield,
  Users,
  Zap,
  Bell
} from "lucide-react";

interface RegulatoryReport {
  id: string;
  reportType: string;
  frequency: 'quarterly' | 'annual' | 'ad-hoc' | 'monthly';
  nextDue: string;
  lastSubmitted: string;
  status: 'draft' | 'ready' | 'submitted' | 'overdue';
  completionPercentage: number;
  sections: {
    name: string;
    completed: boolean;
    lastUpdated: string;
  }[];
  regulatoryBody: string;
  priority: 'high' | 'medium' | 'low';
}

interface ComplianceMetric {
  id: string;
  category: string;
  metric: string;
  currentValue: number;
  target: number;
  trend: 'up' | 'down' | 'stable';
  status: 'compliant' | 'warning' | 'breach';
  lastUpdated: string;
}

interface AutomationRule {
  id: string;
  ruleName: string;
  trigger: string;
  action: string;
  frequency: string;
  isActive: boolean;
  lastExecuted: string;
  successRate: number;
}

export default function OSFIRegulatoryReporting() {
  const [reports, setReports] = useState<RegulatoryReport[]>([]);
  const [metrics, setMetrics] = useState<ComplianceMetric[]>([]);
  const [automationRules, setAutomationRules] = useState<AutomationRule[]>([]);

  // Mock data - in production, this would come from your backend
  useEffect(() => {
    const mockReports: RegulatoryReport[] = [
      {
        id: "1",
        reportType: "OSFI E-21 Operational Resilience Assessment",
        frequency: "quarterly",
        nextDue: "2024-07-31",
        lastSubmitted: "2024-04-30",
        status: "draft",
        completionPercentage: 75,
        sections: [
          { name: "Governance Framework", completed: true, lastUpdated: "2024-07-10" },
          { name: "Risk Appetite", completed: true, lastUpdated: "2024-07-09" },
          { name: "Critical Operations", completed: false, lastUpdated: "2024-07-05" },
          { name: "Scenario Testing", completed: false, lastUpdated: "2024-07-01" },
          { name: "Third-Party Risk", completed: true, lastUpdated: "2024-07-08" }
        ],
        regulatoryBody: "OSFI",
        priority: "high"
      },
      {
        id: "2",
        reportType: "Incident Reporting (OSFI B-10)",
        frequency: "ad-hoc",
        nextDue: "2024-07-15",
        lastSubmitted: "2024-06-15",
        status: "ready",
        completionPercentage: 100,
        sections: [
          { name: "Incident Details", completed: true, lastUpdated: "2024-07-11" },
          { name: "Impact Assessment", completed: true, lastUpdated: "2024-07-11" },
          { name: "Root Cause Analysis", completed: true, lastUpdated: "2024-07-10" },
          { name: "Remediation Plan", completed: true, lastUpdated: "2024-07-09" }
        ],
        regulatoryBody: "OSFI",
        priority: "high"
      },
      {
        id: "3",
        reportType: "Annual Risk Assessment (E-21)",
        frequency: "annual",
        nextDue: "2024-12-31",
        lastSubmitted: "2023-12-15",
        status: "draft",
        completionPercentage: 25,
        sections: [
          { name: "Executive Summary", completed: false, lastUpdated: "2024-06-01" },
          { name: "Risk Framework Review", completed: true, lastUpdated: "2024-07-01" },
          { name: "Scenario Testing Results", completed: false, lastUpdated: "2024-05-15" },
          { name: "Forward-Looking Assessment", completed: false, lastUpdated: "2024-04-20" }
        ],
        regulatoryBody: "OSFI",
        priority: "medium"
      }
    ];

    const mockMetrics: ComplianceMetric[] = [
      {
        id: "1",
        category: "Operational Resilience",
        metric: "Critical Operations RTO Compliance",
        currentValue: 98.5,
        target: 99.0,
        trend: "up",
        status: "warning",
        lastUpdated: "2024-07-11"
      },
      {
        id: "2",
        category: "Incident Management",
        metric: "Mean Time to Resolution (MTTR)",
        currentValue: 45,
        target: 60,
        trend: "down",
        status: "compliant",
        lastUpdated: "2024-07-11"
      },
      {
        id: "3",
        category: "Third-Party Risk",
        metric: "Critical Vendor Assessment Coverage",
        currentValue: 92,
        target: 95,
        trend: "up",
        status: "warning",
        lastUpdated: "2024-07-10"
      },
      {
        id: "4",
        category: "Scenario Testing",
        metric: "Annual Scenario Test Completion",
        currentValue: 75,
        target: 100,
        trend: "stable",
        status: "warning",
        lastUpdated: "2024-07-09"
      }
    ];

    const mockAutomationRules: AutomationRule[] = [
      {
        id: "1",
        ruleName: "Quarterly E-21 Report Data Collection",
        trigger: "90 days before quarter end",
        action: "Aggregate operational metrics and generate draft report",
        frequency: "Quarterly",
        isActive: true,
        lastExecuted: "2024-07-01",
        successRate: 98.5
      },
      {
        id: "2",
        ruleName: "Incident Breach Notification",
        trigger: "Critical incident detected",
        action: "Auto-generate OSFI breach notification draft",
        frequency: "As needed",
        isActive: true,
        lastExecuted: "2024-06-15",
        successRate: 100
      },
      {
        id: "3",
        ruleName: "Monthly Compliance Metrics Update",
        trigger: "1st of each month",
        action: "Update regulatory dashboard metrics",
        frequency: "Monthly",
        isActive: true,
        lastExecuted: "2024-07-01",
        successRate: 95.2
      }
    ];

    setReports(mockReports);
    setMetrics(mockMetrics);
    setAutomationRules(mockAutomationRules);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'submitted':
      case 'compliant':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'ready':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'draft':
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'overdue':
      case 'breach':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <BarChart3 className="h-4 w-4 text-green-500" />;
      case 'down':
        return <BarChart3 className="h-4 w-4 text-red-500 rotate-180" />;
      case 'stable':
        return <BarChart3 className="h-4 w-4 text-blue-500" />;
      default:
        return null;
    }
  };

  const overduReports = reports.filter(r => r.status === 'overdue').length;
  const readyReports = reports.filter(r => r.status === 'ready').length;
  const avgCompletion = reports.reduce((sum, r) => sum + r.completionPercentage, 0) / reports.length;
  const activeAutomation = automationRules.filter(r => r.isActive).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">OSFI Regulatory Reporting</h2>
          <p className="text-muted-foreground">
            Automated regulatory reporting, compliance tracking, and submission management
          </p>
        </div>
        <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
          <Shield className="h-3 w-3 mr-1" />
          E-21 Principle 5
        </Badge>
      </div>

      <Alert>
        <FileText className="h-4 w-4" />
        <AlertDescription>
          <strong>OSFI E-21 Principle 5:</strong> FRFIs should maintain comprehensive monitoring and reporting to ensure continuous oversight of operational resilience and timely regulatory communication.
        </AlertDescription>
      </Alert>

      {/* Summary Metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ready for Submission</CardTitle>
            <Send className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{readyReports}</div>
            <p className="text-xs text-muted-foreground">
              reports ready to submit
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue Reports</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{overduReports}</div>
            <p className="text-xs text-muted-foreground">
              requiring immediate attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Completion</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(avgCompletion)}%</div>
            <p className="text-xs text-muted-foreground">
              across all reports
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Automation</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{activeAutomation}</div>
            <p className="text-xs text-muted-foreground">
              automated reporting rules
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="reports" className="space-y-6">
        <TabsList>
          <TabsTrigger value="reports">Reports & Submissions</TabsTrigger>
          <TabsTrigger value="metrics">Compliance Metrics</TabsTrigger>
          <TabsTrigger value="automation">Report Automation</TabsTrigger>
          <TabsTrigger value="templates">Templates & Schedules</TabsTrigger>
        </TabsList>

        <TabsContent value="reports">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                OSFI Regulatory Reports
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {reports.map((report) => (
                  <div key={report.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-medium mb-1">{report.reportType}</h4>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Due: {report.nextDue}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {report.frequency}
                          </span>
                          <span>To: {report.regulatoryBody}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(report.status)}>
                          {report.status.toUpperCase()}
                        </Badge>
                        <Badge variant="outline" className={report.priority === 'high' ? 'border-red-200' : 'border-gray-200'}>
                          {report.priority} priority
                        </Badge>
                      </div>
                    </div>

                    <div className="mb-3">
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span>Completion Progress</span>
                        <span>{report.completionPercentage}%</span>
                      </div>
                      <Progress value={report.completionPercentage} className="h-2" />
                    </div>

                    <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
                      {report.sections.map((section, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm">
                          {section.completed ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <Clock className="h-4 w-4 text-yellow-500" />
                          )}
                          <span className={section.completed ? 'text-green-700' : 'text-muted-foreground'}>
                            {section.name}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-end gap-2 mt-3">
                      <Button variant="outline" size="sm">
                        <Download className="h-3 w-3 mr-1" />
                        Download Draft
                      </Button>
                      {report.status === 'ready' && (
                        <Button size="sm">
                          <Send className="h-3 w-3 mr-1" />
                          Submit to OSFI
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="metrics">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Real-Time Compliance Metrics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {metrics.map((metric) => (
                  <div key={metric.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h4 className="font-medium">{metric.metric}</h4>
                        <Badge variant="outline" className="text-xs">
                          {metric.category}
                        </Badge>
                        {getTrendIcon(metric.trend)}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>Current: {metric.currentValue}{metric.metric.includes('Time') ? 'min' : '%'}</span>
                        <span>Target: {metric.target}{metric.metric.includes('Time') ? 'min' : '%'}</span>
                        <span>Updated: {metric.lastUpdated}</span>
                      </div>
                    </div>
                    <Badge className={getStatusColor(metric.status)}>
                      {metric.status.toUpperCase()}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="automation">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Automated Reporting Rules
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {automationRules.map((rule) => (
                  <div key={rule.id} className="flex items-start justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-medium">{rule.ruleName}</h4>
                        <Badge className={rule.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                          {rule.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                      <div className="grid gap-2 md:grid-cols-2 text-sm text-muted-foreground">
                        <div>
                          <strong>Trigger:</strong> {rule.trigger}
                        </div>
                        <div>
                          <strong>Action:</strong> {rule.action}
                        </div>
                        <div>
                          <strong>Frequency:</strong> {rule.frequency}
                        </div>
                        <div>
                          <strong>Success Rate:</strong> {rule.successRate}%
                        </div>
                      </div>
                      <div className="mt-2 text-xs text-muted-foreground">
                        Last executed: {rule.lastExecuted}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        Configure
                      </Button>
                      <Button variant="outline" size="sm">
                        Run Now
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Report Templates & Scheduling
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Alert className="mb-4">
                <Bell className="h-4 w-4" />
                <AlertDescription>
                  Standardized OSFI report templates ensure consistent formatting and complete coverage of regulatory requirements.
                </AlertDescription>
              </Alert>
              
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Report Template Library</p>
                <p className="text-sm">Comprehensive OSFI report templates and automated scheduling coming in next update</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}