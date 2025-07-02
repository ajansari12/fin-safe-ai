
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Users, 
  Zap,
  Target,
  TrendingUp
} from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import {
  getOperationalMetrics,
  getRecentIncidentTrend,
  getControlEffectiveness,
  getActiveAlerts,
  type OperationalMetric,
  type IncidentTrendData,
  type ControlEffectivenessData,
  type ActiveAlert
} from '@/services/operational-dashboard-service';

const OperationalDashboard: React.FC = () => {
  const [realtimeMetrics, setRealtimeMetrics] = useState<OperationalMetric[]>([]);
  const [incidentTrend, setIncidentTrend] = useState<IncidentTrendData[]>([]);
  const [controlEffectiveness, setControlEffectiveness] = useState<ControlEffectivenessData[]>([]);
  const [alertQueue, setAlertQueue] = useState<ActiveAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      setIsLoading(true);
      try {
        const [metrics, trends, controls, alerts] = await Promise.all([
          getOperationalMetrics(),
          getRecentIncidentTrend(),
          getControlEffectiveness(),
          getActiveAlerts()
        ]);

        setRealtimeMetrics(metrics);
        setIncidentTrend(trends);
        setControlEffectiveness(controls);
        setAlertQueue(alerts);
      } catch (error) {
        console.error('Error loading operational dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const performanceData = [
    { metric: 'Response Time', target: 240, actual: 180, unit: 'minutes' },
    { metric: 'Resolution Rate', target: 95, actual: 92, unit: '%' },
    { metric: 'Control Coverage', target: 100, actual: 87, unit: '%' },
    { metric: 'Risk Assessment', target: 90, actual: 94, unit: '%' }
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'attention': return 'text-orange-600';
      case 'critical': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-3 w-3 text-green-500" />;
      case 'down': return <TrendingUp className="h-3 w-3 text-red-500 rotate-180" />;
      default: return <div className="h-3 w-3" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Real-time Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {realtimeMetrics.map((metric, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{metric.label}</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              <div className="flex items-center gap-1 text-xs">
                <span className={getStatusColor(metric.status)}>{metric.change}</span>
                <span className="text-muted-foreground">vs previous hour</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Incident Activity Timeline */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>24-Hour Incident Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={incidentTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="time" />
                  <YAxis />
                  <Tooltip />
                  <Area 
                    type="monotone" 
                    dataKey="critical" 
                    stackId="1" 
                    stroke="#ef4444" 
                    fill="#ef4444" 
                    name="Critical"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="high" 
                    stackId="1" 
                    stroke="#f59e0b" 
                    fill="#f59e0b" 
                    name="High"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="medium" 
                    stackId="1" 
                    stroke="#eab308" 
                    fill="#eab308" 
                    name="Medium"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Active Alerts Queue */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Active Alerts</span>
              <Badge variant="secondary">{alertQueue.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {alertQueue.map((alert) => (
                <div key={alert.id} className="flex items-start gap-3 p-2 border rounded">
                  <AlertTriangle className="h-4 w-4 mt-0.5 text-orange-500" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium">{alert.type}</span>
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${getSeverityColor(alert.severity)}`}
                      >
                        {alert.severity}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      {alert.description}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {alert.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="outline" size="sm" className="w-full mt-3">
              View All Alerts
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Control Effectiveness */}
        <Card>
          <CardHeader>
            <CardTitle>Control Effectiveness</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {controlEffectiveness.map((control, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{control.control}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{control.effectiveness}%</span>
                      {getTrendIcon(control.trend)}
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${control.effectiveness}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Performance vs Targets */}
        <Card>
          <CardHeader>
            <CardTitle>Performance vs Targets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {performanceData.map((item, index) => {
                const percentage = (item.actual / item.target) * 100;
                const isOnTarget = percentage >= 95;
                
                return (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{item.metric}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm">
                          {item.actual}{item.unit} / {item.target}{item.unit}
                        </span>
                        {isOnTarget ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <Clock className="h-4 w-4 text-yellow-500" />
                        )}
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${
                          isOnTarget ? 'bg-green-500' : 'bg-yellow-500'
                        }`}
                        style={{ width: `${Math.min(100, percentage)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-6">
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Run KRI Check
            </Button>
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Control Test
            </Button>
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Assign Task
            </Button>
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Create Incident
            </Button>
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Generate Report
            </Button>
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Bulk Actions
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OperationalDashboard;
