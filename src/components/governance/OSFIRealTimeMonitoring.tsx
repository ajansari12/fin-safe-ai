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
import { useAuth } from "@/contexts/EnhancedAuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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
  const { profile } = useAuth();
  const [alerts, setAlerts] = useState<MonitoringAlert[]>([]);
  const [metrics, setMetrics] = useState<RealTimeMetric[]>([]);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile?.organization_id) {
      loadRealTimeData();
      
      // Set up real-time updates every 30 seconds
      const interval = setInterval(() => {
        loadRealTimeData();
        setLastRefresh(new Date());
      }, 30000);

      return () => clearInterval(interval);
    }
  }, [profile?.organization_id]);

  const loadRealTimeData = async () => {
    if (!profile?.organization_id) return;

    try {
      // Load appetite breach logs as alerts
      const { data: breachData, error: breachError } = await supabase
        .from('appetite_breach_logs')
        .select('*')
        .eq('org_id', profile.organization_id)
        .eq('resolution_status', 'open')
        .order('breach_date', { ascending: false })
        .limit(10);

      if (breachError) throw breachError;

      // Load incident logs as operational alerts
      const { data: incidentData, error: incidentError } = await supabase
        .from('incident_logs')
        .select('*')
        .eq('org_id', profile.organization_id)
        .in('status', ['open', 'in_progress'])
        .order('created_at', { ascending: false })
        .limit(10);

      if (incidentError) throw incidentError;

      // Load KRI logs for metrics
      const { data: kriData, error: kriError } = await supabase
        .from('kri_logs')
        .select(`
          *,
          kri_definitions!inner(name, target_value, threshold_warning, threshold_critical)
        `)
        .eq('kri_definitions.org_id', profile.organization_id)
        .order('measurement_date', { ascending: false })
        .limit(50);

      if (kriError) throw kriError;

      // Process breach alerts
      const breachAlerts: MonitoringAlert[] = (breachData || []).map(breach => ({
        id: breach.id,
        title: `Risk Appetite Breach - ${breach.breach_severity}`,
        severity: mapSeverity(breach.breach_severity),
        category: 'risk',
        timestamp: breach.breach_date,
        description: `Risk threshold breached: actual ${breach.actual_value}, threshold ${breach.threshold_value}`,
        status: 'active',
        assignedTo: breach.escalated_to_name || 'Risk Manager'
      }));

      // Process incident alerts
      const incidentAlerts: MonitoringAlert[] = (incidentData || []).map(incident => ({
        id: incident.id,
        title: `Operational Incident - ${incident.severity}`,
        severity: mapSeverity(incident.severity),
        category: 'operational',
        timestamp: incident.created_at,
        description: incident.description || 'Operational incident requiring attention',
        status: incident.status === 'open' ? 'active' : 'acknowledged',
        assignedTo: incident.assigned_to_name || 'Operations Team'
      }));

      // Process KRI metrics
      const processedMetrics = processKRIMetrics(kriData || []);

      setAlerts([...breachAlerts, ...incidentAlerts]);
      setMetrics(processedMetrics);
      setLoading(false);

    } catch (error) {
      console.error('Error loading real-time monitoring data:', error);
      toast.error('Failed to load monitoring data');
      setLoading(false);
    }
  };

  const mapSeverity = (severity: string): 'critical' | 'high' | 'medium' | 'low' => {
    switch (severity.toLowerCase()) {
      case 'critical': return 'critical';
      case 'high': return 'high';
      case 'medium': return 'medium';
      default: return 'low';
    }
  };

  const processKRIMetrics = (kriData: any[]): RealTimeMetric[] => {
    const metricsMap = new Map();
    
    kriData.forEach(log => {
      const kriId = log.kri_definitions.id;
      if (!metricsMap.has(kriId) || new Date(log.measurement_date) > new Date(metricsMap.get(kriId).lastUpdate)) {
        const actual = log.actual_value;
        const threshold = log.kri_definitions.threshold_critical;
        const warning = log.kri_definitions.threshold_warning;
        
        let status: 'normal' | 'warning' | 'critical';
        if (actual >= threshold) status = 'critical';
        else if (actual >= warning) status = 'warning';
        else status = 'normal';

        metricsMap.set(kriId, {
          id: kriId,
          name: log.kri_definitions.name,
          value: actual,
          unit: log.measurement_unit || '',
          threshold: threshold,
          status,
          trend: calculateTrend(actual, log.previous_value),
          lastUpdate: log.measurement_date
        });
      }
    });

    return Array.from(metricsMap.values()).slice(0, 4);
  };

  const calculateTrend = (current: number, previous: number | null): 'up' | 'down' | 'stable' => {
    if (!previous) return 'stable';
    const change = ((current - previous) / previous) * 100;
    if (change > 2) return 'up';
    if (change < -2) return 'down';
    return 'stable';
  };

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