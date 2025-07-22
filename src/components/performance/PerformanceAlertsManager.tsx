import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Bell, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Settings,
  Plus,
  Eye,
  EyeOff,
  Mail,
  MessageSquare,
  Smartphone
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AlertRule {
  id: string;
  name: string;
  metric_type: string;
  condition: 'greater_than' | 'less_than' | 'equals' | 'not_equals';
  threshold_value: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  is_active: boolean;
  notification_channels: string[];
  escalation_rules: EscalationRule[];
  last_triggered?: string;
  trigger_count: number;
}

interface EscalationRule {
  level: number;
  delay_minutes: number;
  channels: string[];
  recipients: string[];
}

interface PerformanceAlert {
  id: string;
  rule_id: string;
  metric_name: string;
  current_value: number;
  threshold_value: number;
  severity: string;
  status: 'triggered' | 'acknowledged' | 'resolved';
  triggered_at: string;
  acknowledged_at?: string;
  resolved_at?: string;
  acknowledged_by?: string;
}

interface NotificationChannel {
  id: string;
  name: string;
  type: 'email' | 'slack' | 'sms' | 'webhook';
  config: any;
  is_active: boolean;
}

interface PerformanceAlertsManagerProps {
  org_id: string;
}

const PerformanceAlertsManager: React.FC<PerformanceAlertsManagerProps> = ({ org_id }) => {
  const [alertRules, setAlertRules] = useState<AlertRule[]>([]);
  const [activeAlerts, setActiveAlerts] = useState<PerformanceAlert[]>([]);
  const [notificationChannels, setNotificationChannels] = useState<NotificationChannel[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadAlertsData();
    // Set up real-time monitoring
    const interval = setInterval(checkMetrics, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, [org_id]);

  const loadAlertsData = async () => {
    try {
      setLoading(true);
      
      // Load notification channels from database
      const { data: channels, error: channelsError } = await supabase
        .from('notification_channels')
        .select('*')
        .eq('org_id', org_id);

      if (channelsError) throw channelsError;

      const transformedChannels: NotificationChannel[] = channels?.map(ch => ({
        id: ch.id,
        name: ch.channel_name,
        type: ch.channel_type as any,
        config: ch.configuration,
        is_active: ch.is_active
      })) || [];

      setNotificationChannels(transformedChannels);

      // Mock alert rules and active alerts for demonstration
      setAlertRules([
        {
          id: '1',
          name: 'High Response Time',
          metric_type: 'response_time',
          condition: 'greater_than',
          threshold_value: 1000,
          severity: 'high',
          is_active: true,
          notification_channels: ['email', 'slack'],
          escalation_rules: [
            { level: 1, delay_minutes: 0, channels: ['email'], recipients: ['admin@company.com'] },
            { level: 2, delay_minutes: 15, channels: ['slack', 'sms'], recipients: ['manager@company.com'] }
          ],
          trigger_count: 3,
          last_triggered: new Date(Date.now() - 1800000).toISOString()
        },
        {
          id: '2',
          name: 'Low Throughput',
          metric_type: 'throughput',
          condition: 'less_than',
          threshold_value: 50,
          severity: 'medium',
          is_active: true,
          notification_channels: ['email'],
          escalation_rules: [
            { level: 1, delay_minutes: 0, channels: ['email'], recipients: ['ops@company.com'] }
          ],
          trigger_count: 1
        },
        {
          id: '3',
          name: 'Critical Error Rate',
          metric_type: 'error_rate',
          condition: 'greater_than',
          threshold_value: 5,
          severity: 'critical',
          is_active: true,
          notification_channels: ['email', 'slack', 'sms'],
          escalation_rules: [
            { level: 1, delay_minutes: 0, channels: ['email', 'slack'], recipients: ['oncall@company.com'] },
            { level: 2, delay_minutes: 5, channels: ['sms'], recipients: ['cto@company.com'] }
          ],
          trigger_count: 0
        }
      ]);

      setActiveAlerts([
        {
          id: '1',
          rule_id: '1',
          metric_name: 'API Response Time',
          current_value: 1250,
          threshold_value: 1000,
          severity: 'high',
          status: 'triggered',
          triggered_at: new Date(Date.now() - 1800000).toISOString()
        },
        {
          id: '2',
          rule_id: '1',
          metric_name: 'API Response Time',
          current_value: 1450,
          threshold_value: 1000,
          severity: 'high',
          status: 'acknowledged',
          triggered_at: new Date(Date.now() - 3600000).toISOString(),
          acknowledged_at: new Date(Date.now() - 1200000).toISOString(),
          acknowledged_by: 'john.doe@company.com'
        }
      ]);

    } catch (error) {
      console.error('Failed to load alerts data:', error);
      toast({
        title: "Error",
        description: "Failed to load alerts data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const checkMetrics = async () => {
    // Simulate real-time metric checking
    const currentMetrics = {
      response_time: Math.random() * 2000,
      throughput: Math.random() * 100,
      error_rate: Math.random() * 10,
      cpu_usage: Math.random() * 100,
      memory_usage: Math.random() * 100
    };

    // Check each active rule
    for (const rule of alertRules.filter(r => r.is_active)) {
      const metricValue = currentMetrics[rule.metric_type as keyof typeof currentMetrics];
      if (!metricValue) continue;

      const shouldTrigger = evaluateCondition(metricValue, rule.condition, rule.threshold_value);
      
      if (shouldTrigger) {
        // Check if there's already an active alert for this rule
        const existingAlert = activeAlerts.find(a => 
          a.rule_id === rule.id && a.status === 'triggered'
        );

        if (!existingAlert) {
          triggerAlert(rule, metricValue);
        }
      }
    }
  };

  const evaluateCondition = (value: number, condition: string, threshold: number): boolean => {
    switch (condition) {
      case 'greater_than': return value > threshold;
      case 'less_than': return value < threshold;
      case 'equals': return Math.abs(value - threshold) < 0.01;
      case 'not_equals': return Math.abs(value - threshold) >= 0.01;
      default: return false;
    }
  };

  const triggerAlert = async (rule: AlertRule, currentValue: number) => {
    const newAlert: PerformanceAlert = {
      id: crypto.randomUUID(),
      rule_id: rule.id,
      metric_name: rule.metric_type.replace('_', ' ').toUpperCase(),
      current_value: currentValue,
      threshold_value: rule.threshold_value,
      severity: rule.severity,
      status: 'triggered',
      triggered_at: new Date().toISOString()
    };

    setActiveAlerts(prev => [newAlert, ...prev]);

    // Update rule trigger count
    setAlertRules(prev => prev.map(r => 
      r.id === rule.id 
        ? { ...r, trigger_count: r.trigger_count + 1, last_triggered: new Date().toISOString() }
        : r
    ));

    // Send notifications
    await sendNotifications(rule, newAlert);

    toast({
      title: `${rule.severity.toUpperCase()} Alert Triggered`,
      description: `${rule.name}: ${currentValue.toFixed(1)} exceeds threshold of ${rule.threshold_value}`,
      variant: rule.severity === 'critical' ? "destructive" : "default",
    });
  };

  const sendNotifications = async (rule: AlertRule, alert: PerformanceAlert) => {
    // Simulate sending notifications through various channels
    for (const channel of rule.notification_channels) {
      console.log(`Sending ${channel} notification for alert:`, alert);
      
      // Here you would integrate with actual notification services
      // Email, Slack, SMS, etc.
    }
  };

  const acknowledgeAlert = async (alertId: string) => {
    setActiveAlerts(prev => prev.map(alert => 
      alert.id === alertId 
        ? { 
            ...alert, 
            status: 'acknowledged',
            acknowledged_at: new Date().toISOString(),
            acknowledged_by: 'current.user@company.com'
          }
        : alert
    ));

    toast({
      title: "Alert Acknowledged",
      description: "Alert has been acknowledged and escalation stopped",
    });
  };

  const resolveAlert = async (alertId: string) => {
    setActiveAlerts(prev => prev.map(alert => 
      alert.id === alertId 
        ? { 
            ...alert, 
            status: 'resolved',
            resolved_at: new Date().toISOString()
          }
        : alert
    ));

    toast({
      title: "Alert Resolved",
      description: "Alert has been marked as resolved",
    });
  };

  const toggleRule = async (ruleId: string) => {
    setAlertRules(prev => prev.map(rule => 
      rule.id === ruleId ? { ...rule, is_active: !rule.is_active } : rule
    ));

    const rule = alertRules.find(r => r.id === ruleId);
    toast({
      title: `Alert Rule ${rule?.is_active ? 'Disabled' : 'Enabled'}`,
      description: `${rule?.name} is now ${rule?.is_active ? 'inactive' : 'active'}`,
    });
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'triggered': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'acknowledged': return <Eye className="h-4 w-4 text-yellow-500" />;
      case 'resolved': return <CheckCircle className="h-4 w-4 text-green-500" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getChannelIcon = (type: string) => {
    switch (type) {
      case 'email': return <Mail className="h-4 w-4" />;
      case 'slack': return <MessageSquare className="h-4 w-4" />;
      case 'sms': return <Smartphone className="h-4 w-4" />;
      default: return <Bell className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Bell className="h-8 w-8 animate-pulse" />
      </div>
    );
  }

  const activeRulesCount = alertRules.filter(r => r.is_active).length;
  const activeAlertsCount = activeAlerts.filter(a => a.status === 'triggered').length;
  const criticalAlertsCount = activeAlerts.filter(a => a.severity === 'critical' && a.status === 'triggered').length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-2xl font-bold tracking-tight">Performance Alerts</h3>
          <p className="text-muted-foreground">
            Monitor performance metrics and get notified of issues
          </p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-1" />
              Create Alert Rule
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Alert Rule</DialogTitle>
              <DialogDescription>
                Set up a new performance alert rule to monitor metrics
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="rule-name">Rule Name</Label>
                <Input id="rule-name" placeholder="Enter rule name" />
              </div>
              <div>
                <Label htmlFor="metric-type">Metric Type</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select metric" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="response_time">Response Time</SelectItem>
                    <SelectItem value="throughput">Throughput</SelectItem>
                    <SelectItem value="error_rate">Error Rate</SelectItem>
                    <SelectItem value="cpu_usage">CPU Usage</SelectItem>
                    <SelectItem value="memory_usage">Memory Usage</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="condition">Condition</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select condition" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="greater_than">Greater than</SelectItem>
                      <SelectItem value="less_than">Less than</SelectItem>
                      <SelectItem value="equals">Equals</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="threshold">Threshold Value</Label>
                  <Input id="threshold" type="number" placeholder="0" />
                </div>
              </div>
              <div>
                <Label htmlFor="severity">Severity</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select severity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button className="w-full">Create Alert Rule</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Rules</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeRulesCount}</div>
            <p className="text-xs text-muted-foreground">monitoring performance</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeAlertsCount}</div>
            <p className="text-xs text-muted-foreground">requiring attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{criticalAlertsCount}</div>
            <p className="text-xs text-muted-foreground">immediate attention needed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Notification Channels</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{notificationChannels.filter(c => c.is_active).length}</div>
            <p className="text-xs text-muted-foreground">configured channels</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="alerts" className="space-y-4">
        <TabsList>
          <TabsTrigger value="alerts">Active Alerts</TabsTrigger>
          <TabsTrigger value="rules">Alert Rules</TabsTrigger>
          <TabsTrigger value="channels">Notification Channels</TabsTrigger>
        </TabsList>

        <TabsContent value="alerts" className="space-y-4">
          <div className="space-y-4">
            {activeAlerts.map((alert) => {
              const rule = alertRules.find(r => r.id === alert.rule_id);
              return (
                <Card key={alert.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(alert.status)}
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            {alert.metric_name}
                            <Badge className={getSeverityColor(alert.severity)}>
                              {alert.severity}
                            </Badge>
                          </CardTitle>
                          <CardDescription>
                            Current: {alert.current_value.toFixed(1)} | Threshold: {alert.threshold_value}
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {alert.status === 'triggered' && (
                          <>
                            <Button
                              onClick={() => acknowledgeAlert(alert.id)}
                              variant="outline"
                              size="sm"
                            >
                              <Eye className="h-4 w-4 mr-1" />
                              Acknowledge
                            </Button>
                            <Button
                              onClick={() => resolveAlert(alert.id)}
                              size="sm"
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Resolve
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-3">
                      <div>
                        <h4 className="font-medium text-sm">Alert Details</h4>
                        <div className="text-sm text-muted-foreground">
                          <div>Triggered: {new Date(alert.triggered_at).toLocaleString()}</div>
                          {alert.acknowledged_at && (
                            <div>Acknowledged: {new Date(alert.acknowledged_at).toLocaleString()}</div>
                          )}
                          {alert.resolved_at && (
                            <div>Resolved: {new Date(alert.resolved_at).toLocaleString()}</div>
                          )}
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium text-sm">Rule</h4>
                        <div className="text-sm text-muted-foreground">
                          {rule?.name || 'Unknown Rule'}
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium text-sm">Status</h4>
                        <Badge variant={alert.status === 'resolved' ? "default" : "secondary"}>
                          {alert.status}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="rules" className="space-y-4">
          <div className="space-y-4">
            {alertRules.map((rule) => (
              <Card key={rule.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {rule.name}
                        <Badge className={getSeverityColor(rule.severity)}>
                          {rule.severity}
                        </Badge>
                      </CardTitle>
                      <CardDescription>
                        {rule.metric_type.replace('_', ' ')} {rule.condition.replace('_', ' ')} {rule.threshold_value}
                      </CardDescription>
                    </div>
                    <Switch
                      checked={rule.is_active}
                      onCheckedChange={() => toggleRule(rule.id)}
                    />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div>
                      <h4 className="font-medium text-sm">Notifications</h4>
                      <div className="flex gap-1 mt-1">
                        {rule.notification_channels.map((channel, idx) => (
                          <Badge key={idx} variant="outline">
                            {getChannelIcon(channel)}
                            <span className="ml-1">{channel}</span>
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-sm">Trigger Count</h4>
                      <div className="text-2xl font-bold">{rule.trigger_count}</div>
                    </div>
                    <div>
                      <h4 className="font-medium text-sm">Last Triggered</h4>
                      <div className="text-sm text-muted-foreground">
                        {rule.last_triggered 
                          ? new Date(rule.last_triggered).toLocaleString()
                          : 'Never'
                        }
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="channels" className="space-y-4">
          <div className="space-y-4">
            {notificationChannels.map((channel) => (
              <Card key={channel.id}>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      {getChannelIcon(channel.type)}
                      <div>
                        <CardTitle>{channel.name}</CardTitle>
                        <CardDescription>{channel.type.toUpperCase()}</CardDescription>
                      </div>
                    </div>
                    <Badge variant={channel.is_active ? "default" : "secondary"}>
                      {channel.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PerformanceAlertsManager;