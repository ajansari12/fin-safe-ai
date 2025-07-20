import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Clock, Zap, Target } from "lucide-react";

export const WorkflowAnalytics = () => {
  const performanceData = [
    { month: 'Jan', efficiency: 78, throughput: 234, avgTime: 5.2 },
    { month: 'Feb', efficiency: 82, throughput: 267, avgTime: 4.8 },
    { month: 'Mar', efficiency: 85, throughput: 289, avgTime: 4.5 },
    { month: 'Apr', efficiency: 88, throughput: 312, avgTime: 4.1 },
    { month: 'May', efficiency: 91, throughput: 334, avgTime: 3.7 },
    { month: 'Jun', efficiency: 94, throughput: 356, avgTime: 3.2 }
  ];

  const workflowDistribution = [
    { name: 'Risk Management', value: 35, color: '#3b82f6' },
    { name: 'Compliance', value: 28, color: '#10b981' },
    { name: 'Incident Response', value: 22, color: '#f59e0b' },
    { name: 'Document Review', value: 15, color: '#ef4444' }
  ];

  const automationROI = [
    { category: 'Time Saved', manual: 240, automated: 89, savings: 151 },
    { category: 'Cost Reduction', manual: 15000, automated: 5200, savings: 9800 },
    { category: 'Error Rate', manual: 8.5, automated: 1.2, savings: 7.3 },
    { category: 'Throughput', manual: 156, automated: 356, savings: 200 }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Workflow Analytics & Optimization</h2>
          <p className="text-muted-foreground">Performance insights and ROI analysis</p>
        </div>
      </div>

      {/* Performance Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="h-5 w-5 mr-2" />
              Efficiency Trends
            </CardTitle>
            <CardDescription>
              Monthly workflow efficiency and throughput
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="efficiency" stroke="#3b82f6" strokeWidth={3} />
                <Line type="monotone" dataKey="throughput" stroke="#10b981" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="h-5 w-5 mr-2" />
              Processing Time Reduction
            </CardTitle>
            <CardDescription>
              Average processing time improvements
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="avgTime" fill="#ef4444" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Workflow Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Target className="h-5 w-5 mr-2" />
              Workflow Distribution
            </CardTitle>
            <CardDescription>
              Breakdown of automated workflows by category
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={workflowDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {workflowDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap justify-center gap-2 mt-4">
              {workflowDistribution.map((item, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                  <span className="text-sm">{item.name}: {item.value}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Zap className="h-5 w-5 mr-2" />
              Automation ROI
            </CardTitle>
            <CardDescription>
              Return on investment from workflow automation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={automationROI}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="manual" fill="#ef4444" name="Manual" />
                <Bar dataKey="automated" fill="#10b981" name="Automated" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Key Metrics Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Automation Impact Summary</CardTitle>
          <CardDescription>
            Key performance indicators and benefits achieved
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-3xl font-bold text-blue-600">94%</div>
              <div className="text-sm text-blue-700">Efficiency Gain</div>
              <div className="text-xs text-blue-600 mt-1">+16% from baseline</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-3xl font-bold text-green-600">67%</div>
              <div className="text-sm text-green-700">Cost Reduction</div>
              <div className="text-xs text-green-600 mt-1">$2.3M annual savings</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-3xl font-bold text-purple-600">85%</div>
              <div className="text-sm text-purple-700">Error Reduction</div>
              <div className="text-xs text-purple-600 mt-1">From 8.5% to 1.2%</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-3xl font-bold text-orange-600">128%</div>
              <div className="text-sm text-orange-700">Throughput Increase</div>
              <div className="text-xs text-orange-600 mt-1">356 vs 156 tasks/day</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};