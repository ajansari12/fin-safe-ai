
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  AlertTriangle, Clock, Users, TrendingUp, CheckCircle, 
  XCircle, Activity, Target, ArrowUp, ArrowDown
} from 'lucide-react';
import { escalationService, type EscalationExecution } from '@/services/notifications/escalation-service';
import { useAuth } from '@/contexts/EnhancedAuthContext';
import { format, formatDistanceToNow } from 'date-fns';

interface EscalationMetrics {
  totalEscalations: number;
  activeEscalations: number;
  resolvedEscalations: number;
  avgResolutionTime: number;
  escalationsByLevel: Record<string, number>;
  escalationTrends: Array<{ date: string; count: number; }>;
}

export const EscalationMonitoringDashboard: React.FC = () => {
  const { profile } = useAuth();
  const [metrics, setMetrics] = useState<EscalationMetrics | null>(null);
  const [activeEscalations, setActiveEscalations] = useState<EscalationExecution[]>([]);
  const [recentEscalations, setRecentEscalations] = useState<EscalationExecution[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadEscalationData();
  }, []);

  const loadEscalationData = async () => {
    if (!profile?.organization_id) return;

    setLoading(true);
    try {
      // Load escalation metrics
      const metricsData = await escalationService.getEscalationMetrics(profile.organization_id);
      setMetrics(metricsData);

      // Load active escalations
      const activeData = await escalationService.getActiveEscalations(profile.organization_id);
      setActiveEscalations(activeData);

      // Load recent escalations
      const recentData = await escalationService.getRecentEscalations(profile.organization_id, 50);
      setRecentEscalations(recentData);
    } catch (error) {
      console.error('Failed to load escalation data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive"> = {
      active: 'destructive',
      resolved: 'default',
      cancelled: 'secondary'
    };
    return <Badge variant={variants[status] || 'secondary'}>{status}</Badge>;
  };

  const getLevelBadge = (level: number) => {
    const colors = ['bg-yellow-500', 'bg-orange-500', 'bg-red-500', 'bg-purple-500'];
    const color = colors[Math.min(level - 1, colors.length - 1)] || 'bg-gray-500';
    
    return (
      <Badge className={`${color} text-white`}>
        Level {level}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Activity className="h-8 w-8 animate-spin mx-auto mb-2" />
          <p>Loading escalation data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Escalation Monitoring</h1>
          <p className="text-muted-foreground">Monitor and manage escalation workflows</p>
        </div>
        <Button onClick={loadEscalationData}>
          <Activity className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Escalations</p>
                <p className="text-2xl font-bold">{metrics?.totalEscalations || 0}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Escalations</p>
                <p className="text-2xl font-bold text-red-600">{metrics?.activeEscalations || 0}</p>
              </div>
              <Activity className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Resolved Today</p>
                <p className="text-2xl font-bold text-green-600">{metrics?.resolvedEscalations || 0}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Resolution Time</p>
                <p className="text-2xl font-bold">{metrics?.avgResolutionTime.toFixed(1) || 0}h</p>
              </div>
              <Clock className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Escalation Details */}
      <Tabs defaultValue="active" className="space-y-4">
        <TabsList>
          <TabsTrigger value="active">Active Escalations</TabsTrigger>
          <TabsTrigger value="recent">Recent Activity</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Active Escalations ({activeEscalations.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {activeEscalations.length > 0 ? (
                <div className="space-y-4">
                  {activeEscalations.map((escalation) => (
                    <Card key={escalation.id} className="border-l-4 border-l-red-500">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <h3 className="font-medium">{escalation.alert_title}</h3>
                              {getLevelBadge(escalation.escalation_level)}
                              {getStatusBadge(escalation.status)}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {escalation.escalation_reason}
                            </p>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                Escalated {formatDistanceToNow(new Date(escalation.escalated_at))} ago
                              </div>
                              <div className="flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                Assigned to: {escalation.assigned_to_name || 'Unassigned'}
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline">
                              View Details
                            </Button>
                            <Button size="sm">
                              Resolve
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
                  <h3 className="text-lg font-medium mb-2">No Active Escalations</h3>
                  <p className="text-muted-foreground">
                    All escalations have been resolved
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recent" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Escalation Activity</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Alert</TableHead>
                    <TableHead>Level</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Assigned To</TableHead>
                    <TableHead>Escalated At</TableHead>
                    <TableHead>Duration</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentEscalations.map((escalation) => (
                    <TableRow key={escalation.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{escalation.alert_title}</p>
                          <p className="text-sm text-muted-foreground">
                            {escalation.escalation_reason}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getLevelBadge(escalation.escalation_level)}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(escalation.status)}
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">
                          {escalation.assigned_to_name || 'Unassigned'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">
                          {format(new Date(escalation.escalated_at), 'MMM d, HH:mm')}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">
                          {escalation.resolved_at 
                            ? formatDistanceToNow(new Date(escalation.resolved_at))
                            : formatDistanceToNow(new Date(escalation.escalated_at))
                          }
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Escalation by Level */}
            <Card>
              <CardHeader>
                <CardTitle>Escalations by Level</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {Object.entries(metrics?.escalationsByLevel || {}).map(([level, count]) => (
                  <div key={level} className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      {getLevelBadge(parseInt(level))}
                      <span className="text-sm">Level {level}</span>
                    </span>
                    <div className="flex items-center gap-2">
                      <Progress value={(count / (metrics?.totalEscalations || 1)) * 100} className="w-20" />
                      <span className="text-sm font-medium w-8">{count}</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Performance Metrics */}
            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Resolution Rate</span>
                  <div className="flex items-center gap-2">
                    <Progress 
                      value={(metrics?.resolvedEscalations || 0) / (metrics?.totalEscalations || 1) * 100} 
                      className="w-20" 
                    />
                    <span className="text-sm font-medium">
                      {((metrics?.resolvedEscalations || 0) / (metrics?.totalEscalations || 1) * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm">Avg Response Time</span>
                  <span className="text-sm font-medium">
                    {metrics?.avgResolutionTime.toFixed(1)}h
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm">Escalation Trend</span>
                  <div className="flex items-center gap-1">
                    <ArrowDown className="h-4 w-4 text-green-500" />
                    <span className="text-sm font-medium text-green-600">-12%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
