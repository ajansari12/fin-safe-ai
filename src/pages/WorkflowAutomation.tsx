import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Workflow, Zap, Clock, TrendingUp, Users, Settings } from "lucide-react";
import { SmartProcessAutomation } from "@/components/workflow-automation/SmartProcessAutomation";
import { AdaptiveWorkflowEngine } from "@/components/workflow-automation/AdaptiveWorkflowEngine";
import { IntelligentEscalation } from "@/components/workflow-automation/IntelligentEscalation";
import { WorkflowAnalytics } from "@/components/workflow-automation/WorkflowAnalytics";
import { WorkflowDesigner } from "@/components/workflow-automation/WorkflowDesigner";
import { AutomationMetrics } from "@/components/workflow-automation/AutomationMetrics";
import AuthenticatedLayout from "@/components/layout/AuthenticatedLayout";

const WorkflowAutomation = () => {
  const [activeTab, setActiveTab] = useState("dashboard");

  const automationMetrics = [
    {
      title: "Process Efficiency",
      value: "89.3%",
      change: "+12.5%",
      icon: TrendingUp,
      trend: "up"
    },
    {
      title: "Automated Tasks",
      value: "2,847",
      change: "+156",
      icon: Zap,
      trend: "up"
    },
    {
      title: "Avg. Processing Time",
      value: "4.2 hrs",
      change: "-2.8 hrs",
      icon: Clock,
      trend: "down"
    },
    {
      title: "Active Workflows",
      value: "47",
      change: "+8",
      icon: Workflow,
      trend: "up"
    }
  ];

  return (
    <AuthenticatedLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Intelligent Workflow Automation</h1>
            <p className="text-muted-foreground">
              AI-powered process optimization and automated task management
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
              <Zap className="h-3 w-3 mr-1" />
              AI Optimized
            </Badge>
            <Button>
              <Settings className="h-4 w-4 mr-2" />
              Configure
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="automation">Smart Automation</TabsTrigger>
            <TabsTrigger value="workflows">Workflow Engine</TabsTrigger>
            <TabsTrigger value="escalation">Escalation</TabsTrigger>
            <TabsTrigger value="designer">Designer</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            {/* Automation Metrics Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {automationMetrics.map((metric, index) => (
                <Card key={index}>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
                    <metric.icon className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{metric.value}</div>
                    <p className={`text-xs ${
                      metric.trend === 'up' ? 'text-green-600' : 
                      metric.trend === 'down' ? 'text-red-600' : 'text-muted-foreground'
                    }`}>
                      {metric.change} from last month
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Automation Performance Overview */}
            <AutomationMetrics />

            {/* Active Workflows Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Active Workflow Status</CardTitle>
                <CardDescription>
                  Current status of automated workflows and processes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <div>
                        <h4 className="font-medium text-green-900">Risk Assessment Workflow</h4>
                        <p className="text-sm text-green-700">Processing 23 assessments automatically</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-green-900">97% Efficiency</div>
                      <div className="text-xs text-green-600">Avg: 2.3 hrs</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                      <div>
                        <h4 className="font-medium text-blue-900">Incident Response Automation</h4>
                        <p className="text-sm text-blue-700">Auto-routing based on severity and expertise</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-blue-900">94% Efficiency</div>
                      <div className="text-xs text-blue-600">Avg: 1.8 hrs</div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg border border-purple-200">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                      <div>
                        <h4 className="font-medium text-purple-900">Compliance Review Workflow</h4>
                        <p className="text-sm text-purple-700">Intelligent document analysis and gap detection</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-purple-900">91% Efficiency</div>
                      <div className="text-xs text-purple-600">Avg: 3.1 hrs</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Optimizations */}
            <Card>
              <CardHeader>
                <CardTitle>Recent AI Optimizations</CardTitle>
                <CardDescription>
                  Latest workflow improvements suggested by AI
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start space-x-3 p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                    <TrendingUp className="h-5 w-5 text-yellow-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-yellow-900">Parallel Processing Optimization</h4>
                      <p className="text-sm text-yellow-700 mt-1">
                        AI identified opportunity to process vendor assessments in parallel, reducing time by 45%
                      </p>
                      <div className="flex items-center mt-2 space-x-2">
                        <Badge variant="secondary" className="text-xs">Applied</Badge>
                        <span className="text-xs text-yellow-600">2 hours ago</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg border border-green-200">
                    <Users className="h-5 w-5 text-green-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-green-900">Expert Routing Enhancement</h4>
                      <p className="text-sm text-green-700 mt-1">
                        Improved task routing algorithm based on historical performance and expertise
                      </p>
                      <div className="flex items-center mt-2 space-x-2">
                        <Badge variant="secondary" className="text-xs">Implementing</Badge>
                        <span className="text-xs text-green-600">4 hours ago</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="automation">
            <SmartProcessAutomation />
          </TabsContent>

          <TabsContent value="workflows">
            <AdaptiveWorkflowEngine />
          </TabsContent>

          <TabsContent value="escalation">
            <IntelligentEscalation />
          </TabsContent>

          <TabsContent value="designer">
            <WorkflowDesigner />
          </TabsContent>

          <TabsContent value="analytics">
            <WorkflowAnalytics />
          </TabsContent>
        </Tabs>
      </div>
    </AuthenticatedLayout>
  );
};

export default WorkflowAutomation;
