
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Activity, 
  AlertTriangle, 
  TrendingUp,
  TrendingDown,
  Eye,
  Zap,
  Shield,
  BarChart3,
  Clock,
  Users,
  Target
} from 'lucide-react';

interface RealTimeAlert {
  id: string;
  type: 'risk' | 'compliance' | 'performance' | 'security';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  timestamp: string;
  source: string;
  status: 'new' | 'acknowledged' | 'resolved';
  affected_systems?: string[];
}

interface MetricUpdate {
  id: string;
  metric_name: string;
  current_value: number;
  previous_value: number;
  change_percentage: number;
  trend: 'up' | 'down' | 'stable';
  threshold_status: 'normal' | 'warning' | 'breach';
  last_updated: string;
}

interface SystemStatus {
  id: string;
  system_name: string;
  status: 'operational' | 'degraded' | 'down' | 'maintenance';
  uptime_percentage: number;
  response_time_ms: number;
  last_check: string;
  issues_count: number;
}

interface RealTimeIntelligenceHubProps {
  orgId: string;
  profileId: string;
}

const RealTimeIntelligenceHub: React.FC<RealTimeIntelligenceHubProps> = ({ 
  orgId, 
  profileId 
}) => {
  const [activeTab, setActiveTab] = useState('alerts');
  const [alerts, setAlerts] = useState<RealTimeAlert[]>([]);
  const [metrics, setMetrics] = useState<MetricUpdate[]>([]);
  const [systemStatus, setSystemStatus] = useState<SystemStatus[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRealTimeData();
    
    // Set up real-time updates (in real implementation, this would be WebSocket)
    const interval = setInterval(loadRealTimeData, 30000); // Update every 30 seconds
    
    return () => clearInterval(interval);
  }, [orgId, profileId]);

  const loadRealTimeData = async () => {
    try {
      // Mock real-time data - in real implementation, this would connect to real-time services
      const mockAlerts: RealTimeAlert[] = [
        {
          id: '1',
          type: 'risk',
          severity: 'high',
          title: 'Risk Appetite Threshold Exceeded',
          description: 'Operational risk score has exceeded the defined appetite threshold by 15%',
          timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
          source: 'Risk Monitoring System',
          status: 'new',
          affected_systems: ['Risk Management', 'Compliance']
        },
        {
          id: '2',
          type: 'compliance',
          severity: 'medium',
          title: 'Regulatory Filing Due',
          description: 'Quarterly compliance report due in 2 days',
          timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
          source: 'Compliance Tracker',
          status: 'acknowledged'
        },
        {
          id: '3',
          type: 'performance',
          severity: 'low',
          title: 'System Performance Improvement',
          description: 'Response time improved by 12% after optimization',
          timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
          source: 'Performance Monitor',
          status: 'resolved'
        }
      ];

      const mockMetrics: MetricUpdate[] = [
        {
          id: '1',
          metric_name: 'Overall Risk Score',
          current_value: 7.2,
          previous_value: 6.8,
          change_percentage: 5.9,
          trend: 'up',
          threshold_status: 'warning',
          last_updated: new Date().toISOString()
        },
        {
          id: '2',
          metric_name: 'Compliance Score',
          current_value: 94.5,
          previous_value: 93.1,
          change_percentage: 1.5,
          trend: 'up',
          threshold_status: 'normal',
          last_updated: new Date().toISOString()
        },
        {
          id: '3',
          metric_name: 'System Availability',
          current_value: 99.8,
          previous_value: 99.9,
          change_percentage: -0.1,
          trend: 'down',
          threshold_status: 'normal',
          last_updated: new Date().toISOString()
        }
      ];

      const mockSystemStatus: SystemStatus[] = [
        {
          id: '1',
          system_name: 'Risk Management Platform',
          status: 'operational',
          uptime_percentage: 99.9,
          response_time_ms: 245,
          last_check: new Date().toISOString(),
          issues_count: 0
        },
        {
          id: '2',
          system_name: 'Compliance Portal',
          status: 'degraded',
          uptime_percentage: 98.5,
          response_time_ms: 890,
          last_check: new Date().toISOString(),
          issues_count: 2
        },
        {
          id: '3',
          system_name: 'Analytics Engine',
          status: 'operational',
          uptime_percentage: 99.7,
          response_time_ms: 156,
          last_check: new Date().toISOString(),
          issues_count: 0
        }
      ];

      setAlerts(mockAlerts);
      setMetrics(mockMetrics);
      setSystemStatus(mockSystemStatus);
    } catch (error) {
      console.error('Error loading real-time data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational': return 'bg-green-100 text-green-800';
      case 'degraded': return 'bg-yellow-100 text-yellow-800';
      case 'down': return 'bg-red-100 text-red-800';
      case 'maintenance': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getThresholdColor = (status: string) => {
    switch (status) {
      case 'breach': return 'text-red-600';
      case 'warning': return 'text-orange-600';
      case 'normal': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'risk': return <Shield className="h-4 w-4" />;
      case 'compliance': return <Target className="h-4 w-4" />;
      case 'performance': return <BarChart3 className="h-4 w-4" />;
      case 'security': return <Shield className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-3 bg-gray-200 rounded"></div>
                <div className="h-3 bg-gray-200 rounded w-5/6"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Activity className="h-8 w-8 text-green-500" />
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Real-time Intelligence Hub</h2>
            <p className="text-muted-foreground">
              Live monitoring and alerts for organizational intelligence
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            Live
          </Badge>
          <Button variant="outline">
            <Eye className="h-4 w-4 mr-2" />
            Monitor
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
          <TabsTrigger value="metrics">Live Metrics</TabsTrigger>
          <TabsTrigger value="systems">System Status</TabsTrigger>
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
        </TabsList>

        <TabsContent value="alerts" className="space-y-4">
          <div className="space-y-3">
            {alerts.map((alert) => (
              <Card key={alert.id} className="border-l-4 border-l-orange-500">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="mt-1">
                        {getTypeIcon(alert.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium">{alert.title}</h4>
                          <Badge className={getSeverityColor(alert.severity)}>
                            {alert.severity}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {alert.description}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>{formatTimeAgo(alert.timestamp)}</span>
                          <span>{alert.source}</span>
                          {alert.affected_systems && (
                            <span>{alert.affected_systems.length} systems affected</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{alert.status}</Badge>
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="metrics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {metrics.map((metric) => (
              <Card key={metric.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium text-sm">{metric.metric_name}</h4>
                    <Badge variant="outline" className={getThresholdColor(metric.threshold_status)}>
                      {metric.threshold_status}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-2 mb-2">
                    <div className="text-2xl font-bold">{metric.current_value}</div>
                    <div className="flex items-center gap-1 text-sm">
                      {metric.trend === 'up' ? (
                        <TrendingUp className="h-4 w-4 text-green-500" />
                      ) : metric.trend === 'down' ? (
                        <TrendingDown className="h-4 w-4 text-red-500" />
                      ) : (
                        <div className="w-4 h-4" />
                      )}
                      <span className={metric.change_percentage >= 0 ? 'text-green-600' : 'text-red-600'}>
                        {metric.change_percentage > 0 ? '+' : ''}{metric.change_percentage.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  
                  <div className="text-xs text-muted-foreground">
                    Updated {formatTimeAgo(metric.last_updated)}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="systems" className="space-y-4">
          <div className="space-y-3">
            {systemStatus.map((system) => (
              <Card key={system.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-medium">{system.system_name}</h4>
                        <Badge className={getStatusColor(system.status)}>
                          {system.status}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Uptime:</span>
                          <div className="font-medium">{system.uptime_percentage}%</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Response:</span>
                          <div className="font-medium">{system.response_time_ms}ms</div>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Issues:</span>
                          <div className="font-medium">{system.issues_count}</div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4 mr-2" />
                        Monitor
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="dashboard" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-red-600">
                  {alerts.filter(a => a.severity === 'high' || a.severity === 'critical').length}
                </div>
                <div className="text-sm text-muted-foreground">Critical Alerts</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600">
                  {systemStatus.filter(s => s.status === 'operational').length}
                </div>
                <div className="text-sm text-muted-foreground">Systems Online</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {metrics.filter(m => m.threshold_status === 'normal').length}
                </div>
                <div className="text-sm text-muted-foreground">Metrics Normal</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-purple-600">98.7%</div>
                <div className="text-sm text-muted-foreground">Overall Health</div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Intelligence Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Activity className="h-12 w-12 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Real-time Dashboard</h3>
                <p>Comprehensive view of organizational intelligence metrics and alerts</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RealTimeIntelligenceHub;
