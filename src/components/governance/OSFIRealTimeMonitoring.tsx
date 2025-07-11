import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  TrendingUp,
  Eye,
  Zap,
  Bell
} from "lucide-react";

interface MonitoringAlert {
  id: string;
  title: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  category: 'governance' | 'operational' | 'compliance' | 'risk';
  timestamp: string;
  description: string;
  status: 'active' | 'acknowledged' | 'resolved';
  assignedTo?: string;
}

interface RealTimeMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  threshold: number;
  status: 'normal' | 'warning' | 'critical';
  trend: 'up' | 'down' | 'stable';
  lastUpdate: string;
}

export default function OSFIRealTimeMonitoring() {
  const [alerts, setAlerts] = useState<MonitoringAlert[]>([]);
  const [metrics, setMetrics] = useState<RealTimeMetric[]>([]);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  // Mock real-time data - in production, this would be WebSocket or polling
  useEffect(() => {
    const mockAlerts: MonitoringAlert[] = [
      {
        id: "1",
        title: "Operational Risk Threshold Breach",
        severity: "critical",
        category: "risk",
        timestamp: "2024-07-11T10:30:00Z",
        description: "Critical operations RTO threshold exceeded in payment processing",
        status: "active",
        assignedTo: "Chief Risk Officer"
      },
      {
        id: "2", 
        title: "Board Report Due Soon",
        severity: "medium",
        category: "governance",
        timestamp: "2024-07-11T09:15:00Z",
        description: "Quarterly operational resilience report due to board in 2 days",
        status: "acknowledged",
        assignedTo: "Compliance Manager"
      },
      {
        id: "3",
        title: "Third-Party Service Degradation",
        severity: "high",
        category: "operational",
        timestamp: "2024-07-11T08:45:00Z",
        description: "Critical vendor experiencing service degradation affecting core banking",
        status: "active",
        assignedTo: "COO"
      }
    ];

    const mockMetrics: RealTimeMetric[] = [
      {
        id: "1",
        name: "System Availability",
        value: 99.8,
        unit: "%",
        threshold: 99.9,
        status: "warning",
        trend: "down",
        lastUpdate: "2024-07-11T10:35:00Z"
      },
      {
        id: "2",
        name: "Critical Operations RTO",
        value: 125,
        unit: "minutes",
        threshold: 120,
        status: "critical",
        trend: "up",
        lastUpdate: "2024-07-11T10:34:00Z"
      },
      {
        id: "3",
        name: "Operational Risk Score",
        value: 7.2,
        unit: "/10",
        threshold: 8.0,
        status: "normal",
        trend: "stable",
        lastUpdate: "2024-07-11T10:33:00Z"
      },
      {
        id: "4",
        name: "Compliance Coverage",
        value: 94.5,
        unit: "%",
        threshold: 95.0,
        status: "warning",
        trend: "up",
        lastUpdate: "2024-07-11T10:32:00Z"
      }
    ];

    setAlerts(mockAlerts);
    setMetrics(mockMetrics);
    
    // Simulate real-time updates
    const interval = setInterval(() => {
      setLastRefresh(new Date());
      // In production, this would fetch latest data
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-500 text-white';
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'normal':
        return 'text-green-600';
      case 'warning':
        return 'text-yellow-600';
      case 'critical':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-red-500" />;
      case 'down':
        return <TrendingUp className="h-4 w-4 text-green-500 rotate-180" />;
      case 'stable':
        return <Activity className="h-4 w-4 text-blue-500" />;
      default:
        return null;
    }
  };

  const acknowledgeAlert = (alertId: string) => {
    setAlerts(prev => 
      prev.map(alert => 
        alert.id === alertId 
          ? { ...alert, status: 'acknowledged' }
          : alert
      )
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">OSFI E-21 Real-Time Monitoring</h2>
          <p className="text-muted-foreground">
            Continuous monitoring of operational resilience and compliance metrics
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Eye className="h-4 w-4" />
            Last updated: {lastRefresh.toLocaleTimeString()}
          </div>
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <Activity className="h-3 w-3 mr-1" />
            Live Monitoring
          </Badge>
        </div>
      </div>

      <Alert>
        <Zap className="h-4 w-4" />
        <AlertDescription>
          <strong>OSFI E-21 Principle 5:</strong> Real-time monitoring enables continuous oversight of operational risks 
          and immediate escalation of issues that could impact critical operations and regulatory compliance.
        </AlertDescription>
      </Alert>

      {/* Active Alerts Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Active Alerts & Escalations
            <Badge variant="destructive" className="ml-2">
              {alerts.filter(a => a.status === 'active').length} Active
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {alerts.map((alert) => (
              <div key={alert.id} className="flex items-start justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Badge className={getSeverityColor(alert.severity)}>
                      {alert.severity.toUpperCase()}
                    </Badge>
                    <Badge variant="outline">{alert.category}</Badge>
                    <span className="text-sm text-muted-foreground">
                      {new Date(alert.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <h4 className="font-medium mb-1">{alert.title}</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    {alert.description}
                  </p>
                  {alert.assignedTo && (
                    <div className="text-xs text-muted-foreground">
                      Assigned to: {alert.assignedTo}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {alert.status === 'active' && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => acknowledgeAlert(alert.id)}
                    >
                      Acknowledge
                    </Button>
                  )}
                  {alert.status === 'acknowledged' && (
                    <Badge className="bg-yellow-100 text-yellow-800">
                      Acknowledged
                    </Badge>
                  )}
                  {alert.status === 'resolved' && (
                    <Badge className="bg-green-100 text-green-800">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Resolved
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Real-Time Metrics Dashboard */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Real-Time Operational Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
            {metrics.map((metric) => (
              <Card key={metric.id} className="border-l-4 border-l-blue-500">
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">{metric.name}</span>
                    {getTrendIcon(metric.trend)}
                  </div>
                  <div className="space-y-2">
                    <div className={`text-2xl font-bold ${getStatusColor(metric.status)}`}>
                      {metric.value}{metric.unit}
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Threshold: {metric.threshold}{metric.unit}</span>
                      <Badge 
                        variant="outline" 
                        className={
                          metric.status === 'critical' ? 'border-red-500 text-red-700' :
                          metric.status === 'warning' ? 'border-yellow-500 text-yellow-700' :
                          'border-green-500 text-green-700'
                        }
                      >
                        {metric.status}
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Updated: {new Date(metric.lastUpdate).toLocaleTimeString()}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Escalation Matrix */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            OSFI E-21 Escalation Matrix
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid gap-4 lg:grid-cols-3">
              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span className="font-medium">Level 1 - Operational</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  Business unit managers handle routine operational issues within defined thresholds
                </div>
              </div>
              
              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <span className="font-medium">Level 2 - Senior Management</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  CRO and senior management for significant operational disruptions
                </div>
              </div>
              
              <div className="p-4 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <span className="font-medium">Level 3 - Board/OSFI</span>
                </div>
                <div className="text-sm text-muted-foreground">
                  Board and regulatory notification for critical operational failures
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}