
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { 
  Activity, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  Database, 
  Refresh, 
  Settings,
  TrendingUp,
  Zap
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { integrationService } from "@/services/integration-service";
import { dataSyncService, SyncResult } from "@/services/integrations/data-sync-service";

interface IntegrationStatus {
  id: string;
  name: string;
  type: string;
  status: 'active' | 'inactive' | 'error';
  lastSync: string | null;
  health: number;
  recordsSync: number;
  errors: number;
}

const IntegrationDashboard: React.FC = () => {
  const [integrations, setIntegrations] = useState<IntegrationStatus[]>([]);
  const [syncResults, setSyncResults] = useState<SyncResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const { toast } = useToast();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      const integrationsData = await integrationService.getIntegrations();
      const logs = await integrationService.getIntegrationLogs();
      
      // Transform data for dashboard display
      const statusData = integrationsData.map(integration => ({
        id: integration.id,
        name: integration.integration_name,
        type: integration.integration_type,
        status: integration.is_active ? 'active' as const : 'inactive' as const,
        lastSync: integration.last_sync_at,
        health: integration.is_active ? 95 : 0,
        recordsSync: Math.floor(Math.random() * 10000), // Mock data
        errors: logs.filter(log => log.integration_id === integration.id && log.status === 'error').length
      }));
      
      setIntegrations(statusData);
      
      // Mock sync results for demonstration
      setSyncResults([
        {
          syncId: '1',
          startTime: new Date(Date.now() - 3600000).toISOString(),
          endTime: new Date(Date.now() - 3500000).toISOString(),
          status: 'success',
          recordsProcessed: 1250,
          recordsSuccess: 1245,
          recordsFailed: 5,
          conflicts: [],
          errors: []
        },
        {
          syncId: '2',
          startTime: new Date(Date.now() - 7200000).toISOString(),
          endTime: new Date(Date.now() - 7100000).toISOString(),
          status: 'partial',
          recordsProcessed: 850,
          recordsSuccess: 835,
          recordsFailed: 15,
          conflicts: [
            {
              recordId: '12345',
              field: 'email',
              sourceValue: 'john.doe@example.com',
              targetValue: 'j.doe@example.com',
              resolution: 'pending'
            }
          ],
          errors: ['Validation failed for 15 records']
        }
      ]);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast({
        title: "Error",
        description: "Failed to load integration dashboard data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSyncNow = async (integrationId: string) => {
    try {
      toast({
        title: "Sync Started",
        description: "Data synchronization has been initiated"
      });
      
      const result = await dataSyncService.performDataSync(integrationId);
      
      toast({
        title: "Sync Completed",
        description: `Processed ${result.recordsProcessed} records successfully`
      });
      
      loadDashboardData(); // Refresh data
    } catch (error) {
      toast({
        title: "Sync Failed",
        description: "Data synchronization encountered an error",
        variant: "destructive"
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getHealthColor = (health: number) => {
    if (health >= 90) return "bg-green-500";
    if (health >= 70) return "bg-yellow-500";
    return "bg-red-500";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading integration dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Integration Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor and manage all system integrations
          </p>
        </div>
        <Button onClick={loadDashboardData} variant="outline">
          <Refresh className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{integrations.filter(i => i.status === 'active').length}</p>
                <p className="text-sm text-muted-foreground">Active Integrations</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Database className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-2xl font-bold">
                  {integrations.reduce((sum, i) => sum + i.recordsSync, 0).toLocaleString()}
                </p>
                <p className="text-sm text-muted-foreground">Records Synced</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-2xl font-bold">
                  {Math.round(integrations.reduce((sum, i) => sum + i.health, 0) / integrations.length) || 0}%
                </p>
                <p className="text-sm text-muted-foreground">Average Health</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              <div>
                <p className="text-2xl font-bold">
                  {integrations.reduce((sum, i) => sum + i.errors, 0)}
                </p>
                <p className="text-sm text-muted-foreground">Active Errors</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="sync-results">Sync Results</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="errors">Error Management</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Integration Status</CardTitle>
              <CardDescription>
                Current status of all configured integrations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {integrations.map((integration) => (
                  <div key={integration.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      {getStatusIcon(integration.status)}
                      <div>
                        <h3 className="font-medium">{integration.name}</h3>
                        <p className="text-sm text-muted-foreground capitalize">
                          {integration.type.replace('_', ' ')}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm font-medium">Health: {integration.health}%</p>
                        <Progress 
                          value={integration.health} 
                          className="w-20 h-2"
                        />
                      </div>
                      
                      <div className="text-right">
                        <p className="text-sm font-medium">{integration.recordsSync.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">Records</p>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleSyncNow(integration.id)}
                        >
                          <Zap className="h-3 w-3 mr-1" />
                          Sync Now
                        </Button>
                        <Button size="sm" variant="ghost">
                          <Settings className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sync-results" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Synchronization Results</CardTitle>
              <CardDescription>
                History of data synchronization activities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {syncResults.map((result) => (
                  <div key={result.syncId} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge variant={result.status === 'success' ? 'default' : result.status === 'partial' ? 'secondary' : 'destructive'}>
                          {result.status}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {new Date(result.startTime).toLocaleString()}
                        </span>
                      </div>
                      <span className="text-sm font-medium">
                        {result.recordsSuccess}/{result.recordsProcessed} successful
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Processed: </span>
                        <span className="font-medium">{result.recordsProcessed}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Failed: </span>
                        <span className="font-medium text-red-600">{result.recordsFailed}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Conflicts: </span>
                        <span className="font-medium text-yellow-600">{result.conflicts.length}</span>
                      </div>
                    </div>
                    
                    {result.conflicts.length > 0 && (
                      <Alert className="mt-3">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                          {result.conflicts.length} data conflicts require manual resolution
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
              <CardDescription>
                Integration performance and optimization insights
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-3">Sync Performance</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Average Sync Time</span>
                      <span className="text-sm font-medium">2.3 minutes</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Records per Minute</span>
                      <span className="text-sm font-medium">4,250</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Success Rate</span>
                      <span className="text-sm font-medium text-green-600">98.7%</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-3">Resource Usage</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">API Calls/Hour</span>
                      <span className="text-sm font-medium">1,245</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Data Transfer</span>
                      <span className="text-sm font-medium">2.3 GB</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Rate Limit Usage</span>
                      <span className="text-sm font-medium">45%</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="errors" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Error Management</CardTitle>
              <CardDescription>
                Track and resolve integration errors
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    3 authentication tokens will expire within 7 days. Please renew them to avoid service interruption.
                  </AlertDescription>
                </Alert>
                
                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">Core Banking API - Connection Timeout</h4>
                    <Badge variant="destructive">Critical</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    Last occurred: 2 hours ago | Frequency: 3 times in 24h
                  </p>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">View Details</Button>
                    <Button size="sm" variant="outline">Retry</Button>
                  </div>
                </div>
                
                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-medium">ERP Data Validation Failed</h4>
                    <Badge variant="secondary">Warning</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    Last occurred: 4 hours ago | Frequency: 1 time in 24h
                  </p>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">View Details</Button>
                    <Button size="sm" variant="outline">Acknowledge</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default IntegrationDashboard;
