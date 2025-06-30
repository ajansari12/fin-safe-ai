
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Rocket, 
  CheckCircle, 
  Activity, 
  TrendingUp,
  Users,
  AlertTriangle,
  BarChart3,
  Settings
} from "lucide-react";

const GoLiveSupport = () => {
  const [checklistExpanded, setChecklistExpanded] = useState(true);

  const goLiveChecklist = [
    { id: 1, task: "Data migration verification", status: "completed", priority: "critical" },
    { id: 2, task: "System performance validation", status: "completed", priority: "critical" },
    { id: 3, task: "User acceptance testing sign-off", status: "completed", priority: "critical" },
    { id: 4, task: "Security configuration review", status: "in_progress", priority: "critical" },
    { id: 5, task: "Backup and recovery procedures", status: "in_progress", priority: "high" },
    { id: 6, task: "Support team training completion", status: "pending", priority: "high" },
    { id: 7, task: "Communication plan execution", status: "pending", priority: "medium" },
    { id: 8, task: "Go-live notification to stakeholders", status: "pending", priority: "medium" }
  ];

  const adoptionMetrics = {
    totalUsers: 45,
    activeUsers: 32,
    trainingCompleted: 38,
    supportTickets: 12,
    avgSessionTime: "24 min",
    featureAdoption: 78
  };

  const healthChecks = [
    {
      name: "System Performance",
      status: "healthy",
      value: "98.5%",
      threshold: "95%",
      lastCheck: "5 min ago"
    },
    {
      name: "Database Connectivity",
      status: "healthy",
      value: "100%",
      threshold: "99%",
      lastCheck: "2 min ago"
    },
    {
      name: "API Response Time",
      status: "warning",
      value: "850ms",
      threshold: "500ms",
      lastCheck: "1 min ago"
    },
    {
      name: "Storage Utilization",
      status: "healthy",
      value: "45%",
      threshold: "80%",
      lastCheck: "10 min ago"
    }
  ];

  const successKPIs = [
    { name: "User Adoption Rate", current: 71, target: 85, unit: "%" },
    { name: "System Availability", current: 99.8, target: 99.5, unit: "%" },
    { name: "Training Completion", current: 84, target: 95, unit: "%" },
    { name: "Support Resolution Time", current: 2.4, target: 4, unit: "hours" }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
      case "healthy": return "text-green-500";
      case "in_progress":
      case "warning": return "text-yellow-500";
      case "pending":
      case "critical": return "text-red-500";
      default: return "text-gray-500";
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
      case "healthy": return <Badge className="bg-green-500">Healthy</Badge>;
      case "in_progress": return <Badge className="bg-blue-500">In Progress</Badge>;
      case "warning": return <Badge className="bg-yellow-500">Warning</Badge>;
      case "pending":
      case "critical": return <Badge variant="destructive">Critical</Badge>;
      default: return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const completedTasks = goLiveChecklist.filter(task => task.status === "completed").length;
  const checklistProgress = (completedTasks / goLiveChecklist.length) * 100;

  return (
    <div className="space-y-6">
      <Tabs defaultValue="checklist" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="checklist">Go-Live Checklist</TabsTrigger>
          <TabsTrigger value="monitoring">Health Monitoring</TabsTrigger>
          <TabsTrigger value="adoption">Adoption Analytics</TabsTrigger>
          <TabsTrigger value="success">Success Metrics</TabsTrigger>
        </TabsList>

        <TabsContent value="checklist" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Rocket className="h-5 w-5" />
                Go-Live Readiness Checklist
              </CardTitle>
              <CardDescription>
                Automated verification steps and pre-launch validation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-medium">Overall Progress</span>
                  <span className="text-lg font-bold">{completedTasks}/{goLiveChecklist.length}</span>
                </div>
                <Progress value={checklistProgress} className="h-4" />
                <p className="text-sm text-muted-foreground">
                  {Math.round(checklistProgress)}% complete - {goLiveChecklist.length - completedTasks} tasks remaining
                </p>
                
                <div className="space-y-3">
                  {goLiveChecklist.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                          item.status === "completed" ? "bg-green-500 text-white" :
                          item.status === "in_progress" ? "bg-blue-500 text-white" : "bg-gray-200"
                        }`}>
                          {item.status === "completed" && <CheckCircle className="h-4 w-4" />}
                          {item.status === "in_progress" && <Activity className="h-4 w-4" />}
                          {item.status === "pending" && <span className="text-xs">{item.id}</span>}
                        </div>
                        <div>
                          <span className="font-medium">{item.task}</span>
                          <div className="flex gap-1 mt-1">
                            <Badge 
                              variant={item.priority === "critical" ? "destructive" : 
                                     item.priority === "high" ? "default" : "secondary"}
                              className="text-xs"
                            >
                              {item.priority}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      {getStatusBadge(item.status)}
                    </div>
                  ))}
                </div>
                
                <div className="flex gap-2 pt-4">
                  <Button 
                    className="flex-1"
                    disabled={checklistProgress < 100}
                  >
                    <Rocket className="h-4 w-4 mr-2" />
                    Initiate Go-Live
                  </Button>
                  <Button variant="outline">
                    <Settings className="h-4 w-4 mr-2" />
                    Run All Checks
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Real-Time Health Monitoring
                </CardTitle>
                <CardDescription>
                  Continuous system health checks and performance monitoring
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {healthChecks.map((check, index) => (
                    <div key={index} className="border rounded-lg p-3 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{check.name}</span>
                        {getStatusBadge(check.status)}
                      </div>
                      
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Current: {check.value}</span>
                        <span className="text-muted-foreground">Threshold: {check.threshold}</span>
                      </div>
                      
                      <div className="text-xs text-muted-foreground">
                        Last checked: {check.lastCheck}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Active Issues & Alerts
                </CardTitle>
                <CardDescription>
                  Current system alerts and resolution status
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border rounded-lg p-3 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">API Response Time High</span>
                      <Badge className="bg-yellow-500">Warning</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Average response time exceeding threshold by 70%
                    </p>
                    <div className="text-xs text-muted-foreground">
                      Detected: 15 minutes ago | Assigned: Infrastructure Team
                    </div>
                  </div>
                  
                  <div className="border rounded-lg p-3 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">Database Connection Pool</span>
                      <Badge variant="outline">Monitoring</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Connection pool utilization at 85% capacity
                    </p>
                    <div className="text-xs text-muted-foreground">
                      Detected: 1 hour ago | Status: Under investigation
                    </div>
                  </div>
                  
                  <div className="text-center py-4 text-sm text-muted-foreground">
                    2 active alerts • Last updated 1 minute ago
                  </div>
                  
                  <Button variant="outline" className="w-full">
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    View All Alerts
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="adoption" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Active Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{adoptionMetrics.activeUsers}/{adoptionMetrics.totalUsers}</div>
                <Progress value={(adoptionMetrics.activeUsers / adoptionMetrics.totalUsers) * 100} className="mt-2" />
                <p className="text-xs text-muted-foreground mt-1">
                  {Math.round((adoptionMetrics.activeUsers / adoptionMetrics.totalUsers) * 100)}% adoption
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Training Completed</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{adoptionMetrics.trainingCompleted}/{adoptionMetrics.totalUsers}</div>
                <Progress value={(adoptionMetrics.trainingCompleted / adoptionMetrics.totalUsers) * 100} className="mt-2" />
                <p className="text-xs text-muted-foreground mt-1">
                  {Math.round((adoptionMetrics.trainingCompleted / adoptionMetrics.totalUsers) * 100)}% certified
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Support Tickets</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{adoptionMetrics.supportTickets}</div>
                <p className="text-xs text-muted-foreground">
                  8 resolved, 4 open
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Session Time</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{adoptionMetrics.avgSessionTime}</div>
                <p className="text-xs text-muted-foreground">
                  Average per user
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                User Engagement Analytics
              </CardTitle>
              <CardDescription>
                Detailed adoption patterns and user behavior insights
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Feature Adoption Rate</span>
                    <span className="text-sm">{adoptionMetrics.featureAdoption}%</span>
                  </div>
                  <Progress value={adoptionMetrics.featureAdoption} className="h-3" />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-500">32</div>
                    <div className="text-sm text-muted-foreground">Daily Active Users</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-500">156</div>
                    <div className="text-sm text-muted-foreground">Actions per Day</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-500">89%</div>
                    <div className="text-sm text-muted-foreground">Satisfaction Score</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="success" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Success Metrics & KPI Tracking
              </CardTitle>
              <CardDescription>
                Monitor achievement against predefined success criteria
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {successKPIs.map((kpi, index) => (
                  <div key={index} className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{kpi.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold">{kpi.current}{kpi.unit}</span>
                        <span className="text-sm text-muted-foreground">/ {kpi.target}{kpi.unit}</span>
                      </div>
                    </div>
                    
                    <Progress 
                      value={kpi.name === "Support Resolution Time" ? 
                        ((kpi.target - kpi.current) / kpi.target) * 100 : 
                        (kpi.current / kpi.target) * 100
                      } 
                      className="h-3" 
                    />
                    
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>Current Performance</span>
                      <span className={
                        (kpi.name === "Support Resolution Time" ? kpi.current <= kpi.target : kpi.current >= kpi.target) 
                          ? "text-green-500" : "text-yellow-500"
                      }>
                        {(kpi.name === "Support Resolution Time" ? kpi.current <= kpi.target : kpi.current >= kpi.target) 
                          ? "Target Met" : "In Progress"}
                      </span>
                    </div>
                  </div>
                ))}
                
                <div className="pt-4 border-t">
                  <Button className="w-full">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Generate Success Report
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default GoLiveSupport;
