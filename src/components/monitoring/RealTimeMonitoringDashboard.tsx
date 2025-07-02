import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Activity,
  Users,
  FileText,
  Zap
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useRealtimeSubscription } from '@/hooks/useRealtimeSubscription';
import { format } from 'date-fns';

interface RealtimeAlert {
  id: string;
  type: 'incident' | 'kri_breach' | 'dependency_failure' | 'compliance_gap';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  timestamp: string;
  acknowledged: boolean;
  source_module: string;
}

interface SystemMetrics {
  active_incidents: number;
  kri_breaches: number;
  pending_approvals: number;
  system_health: number;
  user_activity: number;
  compliance_score: number;
}

const RealTimeMonitoringDashboard: React.FC = () => {
  const [alerts, setAlerts] = useState<RealtimeAlert[]>([]);
  const [metrics, setMetrics] = useState<SystemMetrics>({
    active_incidents: 0,
    kri_breaches: 0,
    pending_approvals: 0,
    system_health: 95,
    user_activity: 78,
    compliance_score: 92
  });
  const [isLoading, setIsLoading] = useState(true);

  // Load initial data
  useEffect(() => {
    loadDashboardData();
  }, []);

  // Real-time subscriptions for critical events
  useRealtimeSubscription({
    table: 'incident_logs',
    onInsert: (payload) => {
      const incident = payload.new;
      if (incident.severity === 'critical' || incident.severity === 'high') {
        addAlert({
          id: incident.id,
          type: 'incident',
          severity: incident.severity,
          title: `New ${incident.severity} incident`,
          description: incident.title,
          timestamp: incident.reported_at,
          acknowledged: false,
          source_module: 'incidents'
        });
      }
      updateMetrics();
    },
    enabled: true
  });

  useRealtimeSubscription({
    table: 'appetite_breach_logs',
    onInsert: (payload) => {
      const breach = payload.new;
      addAlert({
        id: breach.id,
        type: 'kri_breach',
        severity: breach.breach_severity,
        title: 'KRI Appetite Breach',
        description: `Threshold breached: ${breach.actual_value} vs ${breach.threshold_value}`,
        timestamp: breach.breach_date,
        acknowledged: false,
        source_module: 'controls'
      });
      updateMetrics();
    },
    enabled: true
  });

  useRealtimeSubscription({
    table: 'dependency_logs',
    onInsert: (payload) => {
      const dependency = payload.new;
      if (dependency.tolerance_breached) {
        addAlert({
          id: dependency.id,
          type: 'dependency_failure',
          severity: dependency.impact_level === 'critical' ? 'critical' : 'high',
          title: 'Dependency Failure',
          description: dependency.notes || 'Critical dependency has failed',
          timestamp: dependency.detected_at,
          acknowledged: false,
          source_module: 'dependencies'
        });
      }
      updateMetrics();
    },
    enabled: true
  });

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // Load recent alerts and metrics
      const [incidentsRes, breachesRes, dependencyRes] = await Promise.all([
        supabase
          .from('incident_logs')
          .select('*')
          .in('status', ['open', 'in_progress'])
          .order('reported_at', { ascending: false })
          .limit(5),
        
        supabase
          .from('appetite_breach_logs')
          .select('*')
          .eq('resolution_status', 'open')
          .order('breach_date', { ascending: false })
          .limit(5),
        
        supabase
          .from('dependency_logs')
          .select('*')
          .eq('tolerance_breached', true)
          .order('detected_at', { ascending: false })
          .limit(5)
      ]);

      // Convert to alerts format
      const recentAlerts: RealtimeAlert[] = [];
      
      incidentsRes.data?.forEach(incident => {
        if (incident.severity === 'critical' || incident.severity === 'high') {
          recentAlerts.push({
            id: incident.id,
            type: 'incident',
            severity: incident.severity,
            title: `${incident.severity} incident`,
            description: incident.title,
            timestamp: incident.reported_at,
            acknowledged: false,
            source_module: 'incidents'
          });
        }
      });

      breachesRes.data?.forEach(breach => {
        recentAlerts.push({
          id: breach.id,
          type: 'kri_breach',
          severity: breach.breach_severity,
          title: 'KRI Appetite Breach',
          description: `Threshold breached: ${breach.actual_value} vs ${breach.threshold_value}`,
          timestamp: breach.breach_date,
          acknowledged: false,
          source_module: 'controls'
        });
      });

      dependencyRes.data?.forEach(dependency => {
        recentAlerts.push({
          id: dependency.id,
          type: 'dependency_failure',
          severity: dependency.impact_level === 'critical' ? 'critical' : 'high',
          title: 'Dependency Failure',
          description: dependency.notes || 'Critical dependency has failed',
          timestamp: dependency.detected_at,
          acknowledged: false,
          source_module: 'dependencies'
        });
      });

      setAlerts(recentAlerts.slice(0, 10));
      
      // Update metrics
      setMetrics({
        active_incidents: incidentsRes.data?.length || 0,
        kri_breaches: breachesRes.data?.length || 0,
        pending_approvals: Math.floor(Math.random() * 5), // Simulated
        system_health: 95 - (recentAlerts.length * 2),
        user_activity: 78 + Math.floor(Math.random() * 20),
        compliance_score: 92 - (recentAlerts.filter(a => a.severity === 'critical').length * 3)
      });

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addAlert = (alert: RealtimeAlert) => {
    setAlerts(prev => [alert, ...prev.slice(0, 9)]);
  };

  const updateMetrics = () => {
    // Simulate real-time metric updates
    setMetrics(prev => ({
      ...prev,
      system_health: Math.max(80, prev.system_health - 1),
      user_activity: Math.min(100, prev.user_activity + Math.floor(Math.random() * 5))
    }));
  };

  const acknowledgeAlert = async (alertId: string) => {
    setAlerts(prev => 
      prev.map(alert => 
        alert.id === alertId 
          ? { ...alert, acknowledged: true }
          : alert
      )
    );
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      default: return 'text-blue-600 bg-blue-50 border-blue-200';
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'incident': return <AlertTriangle className="h-4 w-4" />;
      case 'kri_breach': return <TrendingUp className="h-4 w-4" />;
      case 'dependency_failure': return <Zap className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* System Health Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Health</CardTitle>
            <Activity className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.system_health}%</div>
            <Progress value={metrics.system_health} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-2">
              {metrics.system_health >= 95 ? 'Excellent' : 
               metrics.system_health >= 85 ? 'Good' : 'Needs Attention'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Incidents</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.active_incidents}</div>
            <p className="text-xs text-muted-foreground">
              Critical incidents requiring attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">KRI Breaches</CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.kri_breaches}</div>
            <p className="text-xs text-muted-foreground">
              Key risk indicators exceeded
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">User Activity</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.user_activity}%</div>
            <Progress value={metrics.user_activity} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-2">
              Platform engagement level
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Compliance Score</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.compliance_score}%</div>
            <Progress value={metrics.compliance_score} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-2">
              Overall regulatory compliance
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
            <Clock className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.pending_approvals}</div>
            <p className="text-xs text-muted-foreground">
              Items awaiting approval
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Real-time Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Real-time Alerts
          </CardTitle>
          <CardDescription>
            Live monitoring of critical events across your organization
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {alerts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-600" />
              <p>No active alerts. System operating normally.</p>
            </div>
          ) : (
            alerts.map((alert) => (
              <Alert 
                key={alert.id} 
                className={`${getSeverityColor(alert.severity)} ${
                  alert.acknowledged ? 'opacity-50' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getAlertIcon(alert.type)}
                    <div>
                      <div className="font-medium">{alert.title}</div>
                      <div className="text-sm">{alert.description}</div>
                      <div className="text-xs mt-1 flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">
                          {alert.source_module}
                        </Badge>
                        <span>{format(new Date(alert.timestamp), 'MMM dd, HH:mm')}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={alert.severity === 'critical' ? 'destructive' : 'secondary'}>
                      {alert.severity}
                    </Badge>
                    {!alert.acknowledged && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => acknowledgeAlert(alert.id)}
                      >
                        Acknowledge
                      </Button>
                    )}
                  </div>
                </div>
              </Alert>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default RealTimeMonitoringDashboard;