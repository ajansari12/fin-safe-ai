import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  TrendingUp, 
  TrendingDown,
  RefreshCw,
  Play,
  Pause
} from 'lucide-react';

export const RealTimeDashboard = () => {
  const realTimeMetrics = [
    {
      category: "Risk Indicators",
      metrics: [
        { name: "System Health", value: 98.5, status: "healthy", trend: "stable" },
        { name: "Compliance Score", value: 94.2, status: "good", trend: "up" },
        { name: "Security Rating", value: 91.7, status: "warning", trend: "down" },
        { name: "Operational Risk", value: 87.3, status: "healthy", trend: "up" }
      ]
    },
    {
      category: "Performance Metrics",
      metrics: [
        { name: "Response Time", value: 95.4, status: "healthy", trend: "stable" },
        { name: "Throughput", value: 89.6, status: "good", trend: "up" },
        { name: "Error Rate", value: 98.1, status: "healthy", trend: "stable" },
        { name: "Availability", value: 99.9, status: "healthy", trend: "stable" }
      ]
    }
  ];

  const alerts = [
    {
      id: 1,
      type: "warning",
      title: "Security Threshold Approaching",
      message: "Network security score has decreased by 3.2% in the last hour",
      timestamp: "2 minutes ago",
      severity: "medium"
    },
    {
      id: 2,
      type: "info",
      title: "Performance Optimization Available",
      message: "AI suggests database query optimization for 15% performance gain",
      timestamp: "5 minutes ago",
      severity: "low"
    },
    {
      id: 3,
      type: "success",
      title: "Compliance Target Met",
      message: "Monthly compliance score target achieved ahead of schedule",
      timestamp: "12 minutes ago",
      severity: "low"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600 dark:text-green-400';
      case 'good': return 'text-blue-600 dark:text-blue-400';
      case 'warning': return 'text-yellow-600 dark:text-yellow-400';
      case 'critical': return 'text-red-600 dark:text-red-400';
      default: return 'text-muted-foreground';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'good': return <Activity className="w-4 h-4 text-blue-600" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      case 'critical': return <AlertTriangle className="w-4 h-4 text-red-600" />;
      default: return <Clock className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-3 h-3 text-green-600" />;
      case 'down': return <TrendingDown className="w-3 h-3 text-red-600" />;
      default: return <Activity className="w-3 h-3 text-muted-foreground" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Control Panel */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="w-5 h-5" />
                <span>Real-Time Monitoring Dashboard</span>
              </CardTitle>
              <CardDescription>
                Live organizational metrics and performance indicators
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="bg-green-500/10 text-green-700 dark:text-green-300">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse" />
                Live
              </Badge>
              <Button variant="outline" size="sm">
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
              <Button variant="outline" size="sm">
                <Pause className="w-4 h-4 mr-2" />
                Pause
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Real-Time Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {realTimeMetrics.map((category, categoryIndex) => (
          <Card key={categoryIndex}>
            <CardHeader>
              <CardTitle className="text-lg">{category.category}</CardTitle>
              <CardDescription>Current performance indicators</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {category.metrics.map((metric, metricIndex) => (
                <div key={metricIndex} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(metric.status)}
                      <span className="font-medium">{metric.name}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`font-semibold ${getStatusColor(metric.status)}`}>
                        {metric.value}%
                      </span>
                      {getTrendIcon(metric.trend)}
                    </div>
                  </div>
                  <Progress 
                    value={metric.value} 
                    className="h-2"
                  />
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Real-Time Alerts */}
      <Card>
        <CardHeader>
          <CardTitle>Live Alerts & Notifications</CardTitle>
          <CardDescription>Recent system alerts and recommendations</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {alerts.map((alert) => (
            <Alert key={alert.id} className="border-l-4 border-l-primary">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="font-semibold">{alert.title}</div>
                    <div className="text-sm text-muted-foreground">{alert.message}</div>
                  </div>
                  <div className="text-xs text-muted-foreground ml-4">
                    {alert.timestamp}
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          ))}
        </CardContent>
      </Card>

      {/* System Status Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Data Processing</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
              <span className="text-sm">Processing 847 events/sec</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Model Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse" />
              <span className="text-sm">AI accuracy: 94.7%</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">System Load</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse" />
              <span className="text-sm">CPU: 68% | Memory: 72%</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};