import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, Clock, Zap, CheckCircle } from "lucide-react";

export const AutomationMetrics = () => {
  const performanceData = [
    { week: 'W1', efficiency: 82, tasks: 234, time: 4.2 },
    { week: 'W2', efficiency: 85, tasks: 267, time: 3.8 },
    { week: 'W3', efficiency: 88, tasks: 289, time: 3.5 },
    { week: 'W4', efficiency: 91, tasks: 312, time: 3.1 },
  ];

  const automationStats = [
    {
      title: "Process Efficiency",
      current: 91,
      target: 95,
      unit: "%",
      trend: "+8%",
      color: "bg-blue-600"
    },
    {
      title: "Task Completion Rate",
      current: 347,
      target: 400,
      unit: " tasks/day",
      trend: "+23%",
      color: "bg-green-600"
    },
    {
      title: "Average Processing Time",
      current: 3.1,
      target: 2.5,
      unit: " hours",
      trend: "-26%",
      color: "bg-purple-600"
    }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="h-5 w-5 mr-2" />
            Automation Performance
          </CardTitle>
          <CardDescription>
            Real-time workflow performance metrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="week" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="efficiency" stroke="#3b82f6" strokeWidth={3} />
              <Line type="monotone" dataKey="tasks" stroke="#10b981" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <CheckCircle className="h-5 w-5 mr-2" />
            Key Performance Indicators
          </CardTitle>
          <CardDescription>
            Current performance vs targets
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {automationStats.map((stat, index) => (
            <div key={index} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">{stat.title}</span>
                <div className="text-right">
                  <span className="text-sm font-bold">{stat.current}{stat.unit}</span>
                  <span className="text-xs text-muted-foreground ml-2">Target: {stat.target}{stat.unit}</span>
                </div>
              </div>
              <div className="relative">
                <Progress 
                  value={(stat.current / stat.target) * 100} 
                  className="w-full" 
                />
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">
                  {Math.round((stat.current / stat.target) * 100)}% of target
                </span>
                <span className="text-green-600 font-medium">{stat.trend}</span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};