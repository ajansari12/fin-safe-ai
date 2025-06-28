
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  Target, 
  CheckCircle, 
  AlertTriangle,
  Award,
  FileText
} from "lucide-react";
import { getScenarioAnalytics } from "@/services/scenario-analytics-service";

const ScenarioAnalyticsDashboard: React.FC = () => {
  const { data: analytics, isLoading } = useQuery({
    queryKey: ['scenarioAnalytics'],
    queryFn: getScenarioAnalytics
  });

  // Mock data for charts
  const testResultsData = [
    { month: 'Jan', successful: 8, failed: 2, total: 10 },
    { month: 'Feb', successful: 12, failed: 1, total: 13 },
    { month: 'Mar', successful: 15, failed: 3, total: 18 },
    { month: 'Apr', successful: 11, failed: 2, total: 13 },
    { month: 'May', successful: 14, failed: 1, total: 15 },
    { month: 'Jun', successful: 16, failed: 2, total: 18 }
  ];

  const responseTimeData = [
    { test: 'Cyber Attack', target: 60, actual: 45 },
    { test: 'System Failure', target: 30, actual: 25 },
    { test: 'Natural Disaster', target: 120, actual: 180 },
    { test: 'Third-Party Failure', target: 90, actual: 75 },
    { test: 'Pandemic', target: 240, actual: 200 }
  ];

  const testCoverageData = [
    { name: 'Cyber Security', value: 85, color: '#0088FE' },
    { name: 'Business Continuity', value: 92, color: '#00C49F' },
    { name: 'IT Operations', value: 78, color: '#FFBB28' },
    { name: 'Communications', value: 65, color: '#FF8042' },
    { name: 'Third-Party', value: 58, color: '#8884d8' }
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-8 bg-muted rounded w-1/4 mb-4"></div>
              <div className="h-32 bg-muted rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Tests</p>
                <p className="text-2xl font-bold">{analytics?.totalTests || 0}</p>
              </div>
              <Target className="h-8 w-8 text-primary" />
            </div>
            <div className="flex items-center mt-2 text-sm">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-green-500">+12%</span>
              <span className="text-muted-foreground ml-1">vs last quarter</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Success Rate</p>
                <p className="text-2xl font-bold">{analytics?.successRate.toFixed(1) || 0}%</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
            <div className="flex items-center mt-2 text-sm">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-green-500">+3.2%</span>
              <span className="text-muted-foreground ml-1">vs last quarter</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Response Time</p>
                <p className="text-2xl font-bold">{Math.round(analytics?.averageResponseTime || 0)}m</p>
              </div>
              <Clock className="h-8 w-8 text-blue-500" />
            </div>
            <div className="flex items-center mt-2 text-sm">
              <TrendingDown className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-green-500">-5m</span>
              <span className="text-muted-foreground ml-1">vs last quarter</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Test Coverage</p>
                <p className="text-2xl font-bold">{Math.round(analytics?.testCoverageScore || 0)}%</p>
              </div>
              <Award className="h-8 w-8 text-purple-500" />
            </div>
            <div className="flex items-center mt-2 text-sm">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-green-500">+8%</span>
              <span className="text-muted-foreground ml-1">vs last quarter</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Analytics Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="coverage">Coverage</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Test Results by Month</CardTitle>
                <CardDescription>Success vs failure rates over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={testResultsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="successful" fill="#10b981" name="Successful" />
                    <Bar dataKey="failed" fill="#ef4444" name="Failed" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Response Time Performance</CardTitle>
                <CardDescription>Target vs actual response times by scenario type</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={responseTimeData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="test" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="target" fill="#94a3b8" name="Target (minutes)" />
                    <Bar dataKey="actual" fill="#3b82f6" name="Actual (minutes)" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
                <CardDescription>Key performance indicators for scenario testing</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Recovery Time Objective</span>
                      <span className="text-sm text-muted-foreground">85%</span>
                    </div>
                    <Progress value={85} className="h-2" />
                    <p className="text-xs text-muted-foreground">Target: 90%</p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Communication Effectiveness</span>
                      <span className="text-sm text-muted-foreground">92%</span>
                    </div>
                    <Progress value={92} className="h-2" />
                    <p className="text-xs text-muted-foreground">Target: 95%</p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Decision Making Speed</span>
                      <span className="text-sm text-muted-foreground">78%</span>
                    </div>
                    <Progress value={78} className="h-2" />
                    <p className="text-xs text-muted-foreground">Target: 85%</p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Resource Utilization</span>
                      <span className="text-sm text-muted-foreground">88%</span>
                    </div>
                    <Progress value={88} className="h-2" />
                    <p className="text-xs text-muted-foreground">Target: 80%</p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Stakeholder Engagement</span>
                      <span className="text-sm text-muted-foreground">95%</span>
                    </div>
                    <Progress value={95} className="h-2" />
                    <p className="text-xs text-muted-foreground">Target: 90%</p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Documentation Quality</span>
                      <span className="text-sm text-muted-foreground">82%</span>
                    </div>
                    <Progress value={82} className="h-2" />
                    <p className="text-xs text-muted-foreground">Target: 85%</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Test Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { name: 'Cyber Attack Simulation', date: '2024-01-15', score: 92, status: 'excellent' },
                    { name: 'System Failure Recovery', date: '2024-01-10', score: 78, status: 'good' },
                    { name: 'Natural Disaster Response', date: '2024-01-05', score: 65, status: 'needs_improvement' },
                    { name: 'Third-Party Outage', date: '2024-01-01', score: 88, status: 'good' }
                  ].map((test, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded">
                      <div>
                        <h4 className="font-medium">{test.name}</h4>
                        <p className="text-sm text-muted-foreground">{test.date}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <div className="font-semibold">{test.score}%</div>
                        </div>
                        <Badge variant={
                          test.status === 'excellent' ? 'default' :
                          test.status === 'good' ? 'secondary' : 'destructive'
                        }>
                          {test.status.replace('_', ' ')}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="coverage">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Test Coverage by Area</CardTitle>
                <CardDescription>Coverage across different business areas</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={testCoverageData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {testCoverageData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Coverage Gaps</CardTitle>
                <CardDescription>Areas requiring additional testing</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { area: 'Third-Party Dependencies', coverage: 58, priority: 'high' },
                    { area: 'Supply Chain Disruption', coverage: 45, priority: 'critical' },
                    { area: 'Regulatory Response', coverage: 62, priority: 'medium' },
                    { area: 'Customer Communication', coverage: 71, priority: 'medium' },
                    { area: 'Data Recovery', coverage: 83, priority: 'low' }
                  ].map((gap, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{gap.area}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-muted-foreground">{gap.coverage}%</span>
                          <Badge variant={
                            gap.priority === 'critical' ? 'destructive' :
                            gap.priority === 'high' ? 'destructive' :
                            gap.priority === 'medium' ? 'default' : 'secondary'
                          }>
                            {gap.priority}
                          </Badge>
                        </div>
                      </div>
                      <Progress value={gap.coverage} className="h-2" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="trends">
          <Card>
            <CardHeader>
              <CardTitle>Testing Trends</CardTitle>
              <CardDescription>Performance trends over the last 12 months</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={testResultsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="successful" 
                    stroke="#10b981" 
                    strokeWidth={2}
                    name="Successful Tests"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="total" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    name="Total Tests"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  OSFI E-21 Compliance Status
                </CardTitle>
                <CardDescription>
                  Compliance with OSFI E-21 operational resilience requirements
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-medium">Testing Requirements</h4>
                    {[
                      { requirement: 'Quarterly Scenario Testing', status: 'compliant', progress: 100 },
                      { requirement: 'Critical Operations Coverage', status: 'compliant', progress: 95 },
                      { requirement: 'Board Reporting', status: 'compliant', progress: 100 },
                      { requirement: 'Third-Party Testing', status: 'partial', progress: 75 },
                      { requirement: 'Recovery Time Validation', status: 'compliant', progress: 88 }
                    ].map((req, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm">{req.requirement}</span>
                          <Badge variant={
                            req.status === 'compliant' ? 'default' :
                            req.status === 'partial' ? 'secondary' : 'destructive'
                          }>
                            {req.status}
                          </Badge>
                        </div>
                        <Progress value={req.progress} className="h-1" />
                      </div>
                    ))}
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-medium">Documentation & Reporting</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 border rounded">
                        <span className="text-sm">Test Plans Documented</span>
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      </div>
                      <div className="flex items-center justify-between p-3 border rounded">
                        <span className="text-sm">Results Analysis Complete</span>
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      </div>
                      <div className="flex items-center justify-between p-3 border rounded">
                        <span className="text-sm">Gap Analysis Performed</span>
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      </div>
                      <div className="flex items-center justify-between p-3 border rounded">
                        <span className="text-sm">Board Report Generated</span>
                        <AlertTriangle className="h-4 w-4 text-yellow-500" />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Regulatory Reporting</CardTitle>
                <CardDescription>
                  Automated reports for regulatory submissions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { report: 'Quarterly Testing Summary', date: '2024-01-31', status: 'generated' },
                    { report: 'Annual Resilience Assessment', date: '2023-12-31', status: 'submitted' },
                    { report: 'Critical Operations Testing', date: '2024-01-15', status: 'draft' },
                    { report: 'Third-Party Risk Assessment', date: '2024-01-10', status: 'review' }
                  ].map((report, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <div className="font-medium text-sm">{report.report}</div>
                        <div className="text-xs text-muted-foreground">{report.date}</div>
                      </div>
                      <Badge variant={
                        report.status === 'submitted' ? 'default' :
                        report.status === 'generated' ? 'secondary' :
                        report.status === 'review' ? 'outline' : 'secondary'
                      }>
                        {report.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ScenarioAnalyticsDashboard;
