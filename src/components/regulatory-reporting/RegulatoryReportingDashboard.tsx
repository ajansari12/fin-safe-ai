
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  Calendar, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Download,
  Settings,
  Plus,
  TrendingUp
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { regulatoryReportingService } from "@/services/regulatory-reporting-service";
import RegulatoryTemplateLibrary from "./RegulatoryTemplateLibrary";
import RegulatoryCalendar from "./RegulatoryCalendar";
import ReportInstancesManager from "./ReportInstancesManager";
import ComplianceMonitoring from "./ComplianceMonitoring";
import ReportScheduleManager from "./ReportScheduleManager";
import DataQualityDashboard from "./DataQualityDashboard";

const RegulatoryReportingDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState("overview");

  const { data: reportInstances = [] } = useQuery({
    queryKey: ['regulatory-report-instances'],
    queryFn: () => regulatoryReportingService.getReportInstances(),
  });

  const { data: regulatoryCalendar = [] } = useQuery({
    queryKey: ['regulatory-calendar'],
    queryFn: () => regulatoryReportingService.getRegulatoryCalendar(),
  });

  const { data: reportSchedules = [] } = useQuery({
    queryKey: ['report-schedules'],
    queryFn: () => regulatoryReportingService.getReportSchedules(),
  });

  // Calculate dashboard metrics
  const overdueReports = regulatoryCalendar.filter(entry => 
    new Date(entry.due_date) < new Date() && entry.status !== 'submitted'
  ).length;

  const pendingReports = reportInstances.filter(instance => 
    instance.status === 'draft' || instance.status === 'generated'
  ).length;

  const submittedThisMonth = reportInstances.filter(instance => {
    const submittedDate = new Date(instance.generation_date);
    const now = new Date();
    return submittedDate.getMonth() === now.getMonth() && 
           submittedDate.getFullYear() === now.getFullYear() &&
           instance.status === 'submitted';
  }).length;

  const upcomingDeadlines = regulatoryCalendar.filter(entry => {
    const dueDate = new Date(entry.due_date);
    const now = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(now.getDate() + 30);
    return dueDate >= now && dueDate <= thirtyDaysFromNow && entry.status === 'upcoming';
  }).length;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Regulatory Reporting</h1>
          <p className="text-muted-foreground">
            Automated OSFI-compliant regulatory reporting and compliance monitoring
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Generate Report
          </Button>
        </div>
      </div>

      {/* Dashboard Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue Reports</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{overdueReports}</div>
            <p className="text-xs text-muted-foreground">
              Require immediate attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Reports</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{pendingReports}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting review or submission
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Submitted This Month</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{submittedThisMonth}</div>
            <p className="text-xs text-muted-foreground">
              Successfully submitted
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Deadlines</CardTitle>
            <Calendar className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{upcomingDeadlines}</div>
            <p className="text-xs text-muted-foreground">
              Next 30 days
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Templates
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Reports
          </TabsTrigger>
          <TabsTrigger value="calendar" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Calendar
          </TabsTrigger>
          <TabsTrigger value="schedules" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Schedules
          </TabsTrigger>
          <TabsTrigger value="monitoring" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Monitoring
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest regulatory reporting activities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {reportInstances.slice(0, 5).map((instance) => (
                    <div key={instance.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium">{instance.instance_name}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(instance.generation_date).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <Badge variant={
                        instance.status === 'submitted' ? 'default' :
                        instance.status === 'approved' ? 'secondary' :
                        instance.status === 'generated' ? 'outline' : 'destructive'
                      }>
                        {instance.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Compliance Status</CardTitle>
                <CardDescription>Current regulatory compliance overview</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">OSFI E-21 Compliance</span>
                    <Badge variant="secondary">85%</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Operational Risk Reports</span>
                    <Badge variant="default">100%</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Data Quality Score</span>
                    <Badge variant="outline">92%</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">On-time Submission Rate</span>
                    <Badge variant="secondary">88%</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="templates">
          <RegulatoryTemplateLibrary />
        </TabsContent>

        <TabsContent value="reports">
          <ReportInstancesManager />
        </TabsContent>

        <TabsContent value="calendar">
          <RegulatoryCalendar />
        </TabsContent>

        <TabsContent value="schedules">
          <ReportScheduleManager />
        </TabsContent>

        <TabsContent value="monitoring">
          <div className="grid gap-6">
            <ComplianceMonitoring />
            <DataQualityDashboard />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RegulatoryReportingDashboard;
