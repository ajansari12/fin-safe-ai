
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Bot, 
  Calendar, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  Play,
  Pause,
  Settings,
  TrendingUp,
  Database,
  FileCheck,
  Zap
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { automatedReportingService } from "@/services/regulatory-reporting/automated-reporting-service";
import AutomatedRuleManager from "./AutomatedRuleManager";
import DataQualityMonitor from "./DataQualityMonitor";
import ExecutionHistoryViewer from "./ExecutionHistoryViewer";

const AutomatedReportingDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState("overview");

  const { data: automatedRules = [] } = useQuery({
    queryKey: ['automated-reporting-rules'],
    queryFn: () => automatedReportingService.getAutomatedRules('org-id'), // Replace with actual org ID
  });

  // Calculate dashboard metrics
  const activeRules = automatedRules.filter(rule => rule.is_active).length;
  const scheduledToday = automatedRules.filter(rule => {
    if (!rule.next_execution) return false;
    const today = new Date().toDateString();
    const nextExecution = new Date(rule.next_execution).toDateString();
    return today === nextExecution;
  }).length;

  const recentExecutions = automatedRules.flatMap(rule => 
    rule.execution_history?.slice(0, 3) || []
  ).sort((a, b) => new Date(b.started_at).getTime() - new Date(a.started_at).getTime());

  const successRate = recentExecutions.length > 0 
    ? Math.round((recentExecutions.filter(e => e.status === 'completed').length / recentExecutions.length) * 100)
    : 100;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Bot className="h-8 w-8 text-blue-600" />
            Automated Reporting
          </h1>
          <p className="text-muted-foreground">
            AI-powered automated regulatory report generation and validation
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Configure
          </Button>
          <Button>
            <Play className="h-4 w-4 mr-2" />
            Execute Now
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Rules</CardTitle>
            <Zap className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{activeRules}</div>
            <p className="text-xs text-muted-foreground">
              Automated reporting rules
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Scheduled Today</CardTitle>
            <Calendar className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{scheduledToday}</div>
            <p className="text-xs text-muted-foreground">
              Reports due for generation
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{successRate}%</div>
            <p className="text-xs text-muted-foreground">
              Last 30 executions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Data Quality</CardTitle>
            <Database className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">94%</div>
            <p className="text-xs text-muted-foreground">
              Average quality score
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="rules" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Rules
          </TabsTrigger>
          <TabsTrigger value="quality" className="flex items-center gap-2">
            <FileCheck className="h-4 w-4" />
            Data Quality
          </TabsTrigger>
          <TabsTrigger value="execution" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Execution
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <Bot className="h-4 w-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Recent Executions</CardTitle>
                <CardDescription>Latest automated report generations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentExecutions.slice(0, 5).map((execution) => (
                    <div key={execution.execution_id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {execution.status === 'completed' ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : execution.status === 'failed' ? (
                          <AlertTriangle className="h-4 w-4 text-red-500" />
                        ) : (
                          <Clock className="h-4 w-4 text-yellow-500" />
                        )}
                        <div>
                          <p className="font-medium">Execution #{execution.execution_id.slice(0, 8)}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(execution.started_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <Badge variant={
                        execution.status === 'completed' ? 'default' :
                        execution.status === 'failed' ? 'destructive' : 'secondary'
                      }>
                        {execution.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
                <CardDescription>Automation performance overview</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Execution Success Rate</span>
                    <span className="text-sm text-muted-foreground">{successRate}%</span>
                  </div>
                  <Progress value={successRate} className="h-2" />
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Data Quality Score</span>
                    <span className="text-sm text-muted-foreground">94%</span>
                  </div>
                  <Progress value={94} className="h-2" />
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Validation Pass Rate</span>
                    <span className="text-sm text-muted-foreground">91%</span>
                  </div>
                  <Progress value={91} className="h-2" />
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">On-time Generation</span>
                    <span className="text-sm text-muted-foreground">98%</span>
                  </div>
                  <Progress value={98} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="rules">
          <AutomatedRuleManager />
        </TabsContent>

        <TabsContent value="quality">
          <DataQualityMonitor />
        </TabsContent>

        <TabsContent value="execution">
          <ExecutionHistoryViewer />
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Automation Analytics</CardTitle>
              <CardDescription>AI-powered insights and recommendations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Optimization Recommendations</h4>
                    <ul className="text-sm space-y-1">
                      <li>• Consider consolidating similar KRI validation rules</li>
                      <li>• Increase data aggregation frequency for real-time reports</li>
                      <li>• Implement data quality thresholds for auto-approval</li>
                    </ul>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Predicted Issues</h4>
                    <ul className="text-sm space-y-1">
                      <li>• Vendor data source may experience delays next week</li>
                      <li>• Control testing data quality trending downward</li>
                      <li>• Incident reporting volume increasing</li>
                    </ul>
                  </div>
                </div>
                
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-medium text-blue-900 mb-2">AI Insights</h4>
                  <p className="text-sm text-blue-800">
                    Based on historical patterns, your reporting automation system is performing 
                    above industry benchmarks. Consider implementing predictive data quality 
                    checks to further improve efficiency.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AutomatedReportingDashboard;
