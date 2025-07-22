import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Activity, Clock, TrendingUp, AlertTriangle } from 'lucide-react';
import { SystemConnector, IntegrationHealth } from '@/services/integration/integration-framework';

interface IntegrationMonitoringProps {
  org_id: string;
  connectors: SystemConnector[];
  healthData: IntegrationHealth[];
}

const IntegrationMonitoring: React.FC<IntegrationMonitoringProps> = ({ 
  org_id, 
  connectors, 
  healthData 
}) => {
  const totalSyncs = connectors.reduce((sum, c) => sum + (100 - c.errorCount), 0);
  const totalErrors = connectors.reduce((sum, c) => sum + c.errorCount, 0);
  const avgResponseTime = healthData.length > 0 
    ? healthData.reduce((sum, h) => sum + h.responseTime, 0) / healthData.length 
    : 0;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Integration Monitoring</h3>
        <p className="text-sm text-muted-foreground">Real-time monitoring of external system integrations</p>
      </div>

      {/* Monitoring Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Syncs</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSyncs}</div>
            <p className="text-xs text-muted-foreground">
              successful operations
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalErrors}</div>
            <p className="text-xs text-muted-foreground">
              total errors recorded
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgResponseTime.toFixed(0)}ms</div>
            <p className="text-xs text-muted-foreground">
              across all systems
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Monitoring */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>System Performance</CardTitle>
            <CardDescription>Performance metrics for each connected system</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {healthData.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">
                No performance data available
              </div>
            ) : (
              healthData.map((health) => (
                <div key={health.connectorId} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{health.systemName}</span>
                    <Badge variant={health.status === 'healthy' ? 'default' : 'destructive'}>
                      {health.status}
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>Uptime</span>
                      <span>{health.uptime.toFixed(1)}%</span>
                    </div>
                    <Progress value={health.uptime} className="h-2" />
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Response: {health.responseTime}ms • Errors: {health.errorRate}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sync Status</CardTitle>
            <CardDescription>Latest synchronization status for each connector</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {connectors.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">
                No connectors configured
              </div>
            ) : (
              connectors.map((connector) => (
                <div key={connector.connectorId} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">{connector.systemName}</div>
                    <div className="text-sm text-muted-foreground">
                      Last sync: {connector.lastSync.toLocaleString()}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold">{connector.successRate.toFixed(0)}%</div>
                    <div className="text-xs text-muted-foreground">success rate</div>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default IntegrationMonitoring;