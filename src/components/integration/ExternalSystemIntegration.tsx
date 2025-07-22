import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Database, 
  Globe, 
  Settings, 
  RotateCcw, 
  Zap,
  Plus,
  Play,
  Pause,
  RefreshCw
} from 'lucide-react';
import ConnectorManager from './ConnectorManager';
import IntegrationMonitoring from './IntegrationMonitoring';
import DataMappingConfig from './DataMappingConfig';
import SecurityPolicyManager from './SecurityPolicyManager';
import { 
  createIntegrationService, 
  SystemConnector, 
  IntegrationHealth, 
  SyncResult 
} from '@/services/integration/integration-framework';

interface ExternalSystemIntegrationProps {
  org_id: string;
}

const ExternalSystemIntegration: React.FC<ExternalSystemIntegrationProps> = ({ org_id }) => {
  const [connectors, setConnectors] = useState<SystemConnector[]>([]);
  const [integrationHealth, setIntegrationHealth] = useState<IntegrationHealth[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [syncingConnectors, setSyncingConnectors] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  const integrationService = createIntegrationService(org_id);

  useEffect(() => {
    loadIntegrationData();
  }, [org_id]);

  const loadIntegrationData = async () => {
    try {
      setLoading(true);
      const [connectorsData, healthData] = await Promise.all([
        integrationService.getConnectors(),
        integrationService.getIntegrationHealth()
      ]);
      
      setConnectors(connectorsData);
      setIntegrationHealth(healthData);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load integration data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSyncConnector = async (connectorId: string) => {
    try {
      setSyncingConnectors(prev => new Set(prev).add(connectorId));
      
      const result: SyncResult = await integrationService.syncData(connectorId);
      
      if (result.success) {
        toast({
          title: "Sync Successful",
          description: `Processed ${result.recordsProcessed} records with ${result.recordsSuccess} successful`,
        });
      } else {
        toast({
          title: "Sync Failed",
          description: `Sync failed with ${result.errors.length} errors`,
          variant: "destructive",
        });
      }
      
      // Refresh data
      await loadIntegrationData();
    } catch (error) {
      toast({
        title: "Sync Error",
        description: "Failed to sync connector data",
        variant: "destructive",
      });
    } finally {
      setSyncingConnectors(prev => {
        const newSet = new Set(prev);
        newSet.delete(connectorId);
        return newSet;
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-emerald-500';
      case 'inactive': return 'bg-gray-400';
      case 'error': return 'bg-red-500';
      case 'testing': return 'bg-yellow-500';
      default: return 'bg-gray-400';
    }
  };

  const getHealthStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-emerald-600';
      case 'warning': return 'text-yellow-600';
      case 'unhealthy': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getSystemTypeIcon = (type: string) => {
    switch (type) {
      case 'core_banking': return <Database className="h-4 w-4" />;
      case 'trading': return <Activity className="h-4 w-4" />;
      case 'hr': return <Globe className="h-4 w-4" />;
      case 'vendor_mgmt': return <Settings className="h-4 w-4" />;
      case 'regulatory': return <CheckCircle className="h-4 w-4" />;
      default: return <Zap className="h-4 w-4" />;
    }
  };

  const activeConnectors = connectors.filter(c => c.status === 'active').length;
  const totalConnectors = connectors.length;
  const healthyConnectors = integrationHealth.filter(h => h.status === 'healthy').length;
  const avgSuccessRate = connectors.length > 0 
    ? connectors.reduce((sum, c) => sum + c.successRate, 0) / connectors.length 
    : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">External System Integration</h2>
          <p className="text-muted-foreground">
            Manage connections and data synchronization with external systems
          </p>
        </div>
        <Button onClick={() => setActiveTab('connectors')} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Integration
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Connectors</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeConnectors}</div>
            <p className="text-xs text-muted-foreground">
              of {totalConnectors} total connectors
            </p>
            <Progress value={(activeConnectors / Math.max(totalConnectors, 1)) * 100} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Health</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{healthyConnectors}</div>
            <p className="text-xs text-muted-foreground">
              healthy systems
            </p>
            <Progress value={(healthyConnectors / Math.max(totalConnectors, 1)) * 100} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <RotateCcw className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgSuccessRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              average across all systems
            </p>
            <Progress value={avgSuccessRate} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Last Sync</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {connectors.length > 0 && Math.max(...connectors.map(c => c.lastSync.getTime()))}
            </div>
            <p className="text-xs text-muted-foreground">
              {connectors.length > 0 
                ? new Date(Math.max(...connectors.map(c => c.lastSync.getTime()))).toLocaleDateString() || 'Recent'
                : 'No syncs yet'
              }
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Integration Status Alert */}
      {integrationHealth.some(h => h.status === 'unhealthy') && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Some integration systems are experiencing issues. Check the monitoring tab for details.
          </AlertDescription>
        </Alert>
      )}

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="connectors">Connectors</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
          <TabsTrigger value="mapping">Data Mapping</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* System Connectors Overview */}
            <Card>
              <CardHeader>
                <CardTitle>System Connectors</CardTitle>
                <CardDescription>Current status of all external system connections</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {connectors.length === 0 ? (
                  <div className="text-center py-4 text-muted-foreground">
                    No connectors configured yet
                  </div>
                ) : (
                  connectors.map((connector) => (
                    <div key={connector.connectorId} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {getSystemTypeIcon(connector.systemType)}
                        <div>
                          <div className="font-medium">{connector.systemName}</div>
                          <div className="text-sm text-muted-foreground capitalize">
                            {connector.systemType.replace('_', ' ')} • {connector.connectionType.replace('_', ' ')}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className={`${getStatusColor(connector.status)} text-white`}>
                          {connector.status}
                        </Badge>
                        <div className="text-sm text-muted-foreground">
                          {connector.successRate.toFixed(0)}%
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleSyncConnector(connector.connectorId)}
                          disabled={syncingConnectors.has(connector.connectorId)}
                          className="gap-1"
                        >
                          {syncingConnectors.has(connector.connectorId) ? (
                            <RefreshCw className="h-3 w-3 animate-spin" />
                          ) : (
                            <Play className="h-3 w-3" />
                          )}
                          Sync
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Health Status */}
            <Card>
              <CardHeader>
                <CardTitle>Integration Health</CardTitle>
                <CardDescription>Real-time health status of integrated systems</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {integrationHealth.length === 0 ? (
                  <div className="text-center py-4 text-muted-foreground">
                    No health data available
                  </div>
                ) : (
                  integrationHealth.map((health) => (
                    <div key={health.connectorId} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${
                          health.status === 'healthy' ? 'bg-emerald-500' :
                          health.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                        }`} />
                        <div>
                          <div className="font-medium">{health.systemName}</div>
                          <div className="text-sm text-muted-foreground">
                            Last check: {health.lastCheck.toLocaleTimeString()}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`font-medium ${getHealthStatusColor(health.status)}`}>
                          {health.status}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {health.uptime.toFixed(1)}% uptime
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="connectors">
          <ConnectorManager 
            org_id={org_id}
            onConnectorChange={loadIntegrationData}
          />
        </TabsContent>

        <TabsContent value="monitoring">
          <IntegrationMonitoring 
            org_id={org_id}
            connectors={connectors}
            healthData={integrationHealth}
          />
        </TabsContent>

        <TabsContent value="mapping">
          <DataMappingConfig 
            org_id={org_id}
            connectors={connectors}
            onMappingChange={loadIntegrationData}
          />
        </TabsContent>

        <TabsContent value="security">
          <SecurityPolicyManager 
            org_id={org_id}
            connectors={connectors}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ExternalSystemIntegration;