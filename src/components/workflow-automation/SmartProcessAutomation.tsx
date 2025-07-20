import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Zap, Clock, Users, TrendingUp, Play, Pause, Settings } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

export const SmartProcessAutomation = () => {
  const [selectedProcess, setSelectedProcess] = useState("all");

  const automatedProcesses = [
    {
      id: 1,
      name: "Risk Assessment Workflow",
      status: "active",
      automationLevel: 95,
      tasksProcessed: 1247,
      avgProcessingTime: "2.3 hours",
      timeSaved: "145 hours",
      efficiency: 97,
      triggers: ["New vendor onboarding", "Risk threshold breach", "Schedule"],
      lastOptimized: "2024-06-15"
    },
    {
      id: 2,
      name: "Incident Response Automation",
      status: "active", 
      automationLevel: 88,
      tasksProcessed: 342,
      avgProcessingTime: "1.8 hours",
      timeSaved: "89 hours",
      efficiency: 94,
      triggers: ["Critical incident", "Security alert", "System failure"],
      lastOptimized: "2024-06-14"
    },
    {
      id: 3,
      name: "Compliance Review Process",
      status: "optimizing",
      automationLevel: 78,
      tasksProcessed: 89,
      avgProcessingTime: "3.1 hours",
      timeSaved: "67 hours", 
      efficiency: 91,
      triggers: ["Document upload", "Regulatory change", "Review cycle"],
      lastOptimized: "2024-06-13"
    }
  ];

  const processMetrics = [
    { month: 'Jan', automated: 234, manual: 156, efficiency: 85 },
    { month: 'Feb', automated: 289, manual: 123, efficiency: 87 },
    { month: 'Mar', automated: 334, manual: 98, efficiency: 89 },
    { month: 'Apr', automated: 387, manual: 87, efficiency: 91 },
    { month: 'May', automated: 445, manual: 76, efficiency: 93 },
    { month: 'Jun', automated: 502, manual: 65, efficiency: 95 }
  ];

  const optimizationQueue = [
    {
      id: 1,
      processName: "Vendor Due Diligence",
      currentEfficiency: 67,
      projectedEfficiency: 89,
      estimatedSavings: "32 hours/week",
      priority: "High",
      implementationTime: "3 days"
    },
    {
      id: 2,
      processName: "Control Testing Workflow", 
      currentEfficiency: 72,
      projectedEfficiency: 85,
      estimatedSavings: "18 hours/week",
      priority: "Medium",
      implementationTime: "2 days"
    },
    {
      id: 3,
      processName: "Regulatory Reporting",
      currentEfficiency: 58,
      projectedEfficiency: 79,
      estimatedSavings: "24 hours/week",
      priority: "High",
      implementationTime: "4 days"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'optimizing': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'paused': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'bg-red-100 text-red-800 border-red-200';
      case 'Medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Smart Process Automation</h2>
          <p className="text-muted-foreground">AI-powered process optimization and automation</p>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={selectedProcess} onValueChange={setSelectedProcess}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Processes</SelectItem>
              <SelectItem value="risk">Risk Management</SelectItem>
              <SelectItem value="compliance">Compliance</SelectItem>
              <SelectItem value="incident">Incident Response</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Configure
          </Button>
        </div>
      </div>

      {/* Process Automation Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="h-5 w-5 mr-2" />
              Automation Efficiency Trends
            </CardTitle>
            <CardDescription>
              Monthly automation performance and efficiency gains
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={processMetrics}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="efficiency" stroke="#3b82f6" strokeWidth={3} />
                <Bar dataKey="automated" fill="#10b981" />
                <Bar dataKey="manual" fill="#ef4444" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Zap className="h-5 w-5 mr-2" />
              Process Volume Distribution
            </CardTitle>
            <CardDescription>
              Automated vs manual task distribution
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={processMetrics}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="automated" fill="#10b981" name="Automated" />
                <Bar dataKey="manual" fill="#ef4444" name="Manual" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Active Automated Processes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Play className="h-5 w-5 mr-2" />
            Active Automated Processes
          </CardTitle>
          <CardDescription>
            Current automated workflows and their performance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {automatedProcesses.map((process) => (
              <div key={process.id} className="border rounded-lg p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-medium">{process.name}</h4>
                      <Badge variant="outline" className={getStatusColor(process.status)}>
                        {process.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Last optimized: {process.lastOptimized}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm">
                      <Pause className="h-4 w-4 mr-2" />
                      Pause
                    </Button>
                    <Button variant="outline" size="sm">
                      <Settings className="h-4 w-4 mr-2" />
                      Configure
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{process.automationLevel}%</div>
                    <div className="text-sm text-blue-700">Automation Level</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{process.tasksProcessed}</div>
                    <div className="text-sm text-green-700">Tasks Processed</div>
                  </div>
                  <div className="text-center p-3 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">{process.avgProcessingTime}</div>
                    <div className="text-sm text-purple-700">Avg Time</div>
                  </div>
                  <div className="text-center p-3 bg-orange-50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">{process.timeSaved}</div>
                    <div className="text-sm text-orange-700">Time Saved</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Efficiency Score</span>
                    <span>{process.efficiency}%</span>
                  </div>
                  <Progress value={process.efficiency} className="w-full" />
                </div>

                <div className="space-y-2">
                  <div className="text-sm font-medium">Automation Triggers:</div>
                  <div className="flex flex-wrap gap-1">
                    {process.triggers.map((trigger, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {trigger}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Optimization Queue */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="h-5 w-5 mr-2" />
            AI Optimization Queue
          </CardTitle>
          <CardDescription>
            Processes identified for automation improvement
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {optimizationQueue.map((item) => (
              <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <h4 className="font-medium">{item.processName}</h4>
                    <Badge variant="outline" className={getPriorityColor(item.priority)}>
                      {item.priority} Priority
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Current:</span> {item.currentEfficiency}%
                    </div>
                    <div>
                      <span className="text-muted-foreground">Projected:</span> {item.projectedEfficiency}%
                    </div>
                    <div>
                      <span className="text-muted-foreground">Savings:</span> {item.estimatedSavings}
                    </div>
                    <div>
                      <span className="text-muted-foreground">Timeline:</span> {item.implementationTime}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                  <Button size="sm">
                    <Play className="h-4 w-4 mr-2" />
                    Implement
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};