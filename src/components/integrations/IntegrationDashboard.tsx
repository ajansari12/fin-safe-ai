
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
  RefreshCw, 
  Settings,
  TrendingUp,
  Zap
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

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

interface SyncResult {
  id: string;
  started_at: string;
  completed_at: string | null;
  status: 'success' | 'partial' | 'failed';
  records_processed: number;
  records_success: number;
  records_failed: number;
  error_details?: string;
}

const IntegrationDashboard: React.FC = () => {
  const [integrations, setIntegrations] = useState<IntegrationStatus[]>([]);
  const [syncResults, setSyncResults] = useState<SyncResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const { toast } = useToast();
  const { profile } = useAuth();

  useEffect(() => {
    if (profile?.organization_id) {
      loadDashboardData();
    }
  }, [profile?.organization_id]);

  const loadDashboardData = async () => {
    if (!profile?.organization_id) return;

    try {
      setLoading(true);
      
      // Load integrations data
      const { data: integrationsData, error: integrationsError } = await supabase
        .from('integrations')
        .select('*')
        .eq('org_id', profile.organization_id)
        .order('created_at', { ascending: false });

      if (integrationsError) throw integrationsError;

      // Load integration logs for error counts
      const { data: logsData, error: logsError } = await supabase
        .from('integration_logs')
        .select('*')
        .eq('org_id', profile.organization_id)
        .order('created_at', { ascending: false })
        .limit(100);

      if (logsError) throw logsError;

      // Load sync events data
      const { data: syncData, error: syncError } = await supabase
        .from('sync_events')
        .select('*')
        .eq('org_id', profile.organization_id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (syncError) throw syncError;
      
      // Transform integrations data for dashboard display
      const statusData = (integrationsData || []).map(integration => {
        const integrationLogs = (logsData || []).filter(log => log.integration_id === integration.id);
        const errorLogs = integrationLogs.filter(log => log.status === 'error');
        const successLogs = integrationLogs.filter(log => log.status === 'success');
        
        // Calculate health based on recent logs
        const recentLogs = integrationLogs.slice(0, 10);
        const successRate = recentLogs.length > 0 ? 
          (recentLogs.filter(log => log.status === 'success').length / recentLogs.length) * 100 : 
          (integration.is_active ? 85 : 0);

        return {
          id: integration.id,
          name: integration.integration_name,
          type: integration.integration_type,
          status: !integration.is_active ? 'inactive' as const : 
                  errorLogs.length > successLogs.length ? 'error' as const : 'active' as const,
          lastSync: integration.last_sync_at,
          health: Math.round(successRate),
          recordsSync: integrationLogs.reduce((sum, log) => sum + (log.records_processed || 0), 0),
          errors: errorLogs.length
        };
      });
      
      setIntegrations(statusData);

      // Transform sync events data
      const syncResultsData = (syncData || []).map(sync => ({
        id: sync.id,
        started_at: sync.created_at,
        completed_at: sync.processed_at,
        status: sync.sync_status === 'completed' ? 'success' as const :
                sync.sync_status === 'failed' ? 'failed' as const : 'partial' as const,
        records_processed: (sync.event_data as any)?.records_processed || 0,
        records_success: (sync.event_data as any)?.records_success || 0,
        records_failed: (sync.event_data as any)?.records_failed || 0,
        error_details: sync.error_details ? JSON.stringify(sync.error_details) : undefined
      }));

      setSyncResults(syncResultsData);
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
    if (!profile?.organization_id) return;

    try {
      toast({
        title: "Sync Started",
        description: "Data synchronization has been initiated"
      });
      
      // Create a sync event record
      const { error } = await supabase
        .from('sync_events')
        .insert({
          org_id: profile.organization_id,
          entity_id: integrationId,
          event_type: 'manual_sync',
          source_module: 'integration_dashboard',
          target_modules: ['integration'],
          entity_type: 'integration',
          sync_status: 'pending',
          event_data: {
            initiated_by: profile.id,
            initiated_at: new Date().toISOString()
          }
        });

      if (error) throw error;
      
      toast({
        title: "Sync Initiated",
        description: "Synchronization has been queued for processing"
      });
      
      loadDashboardData(); // Refresh data
    } catch (error) {
      toast({
        title: "Sync Failed",
        description: "Failed to initiate data synchronization",
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
          <RefreshCw className="h-4 w-4 mr-2" />
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
                {syncResults.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Database className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No sync results available</p>
                    <p className="text-sm">Run your first sync to see results here</p>
                  </div>
                ) : (
                  syncResults.map((result) => (
                    <div key={result.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Badge variant={result.status === 'success' ? 'default' : result.status === 'partial' ? 'secondary' : 'destructive'}>
                            {result.status}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {new Date(result.started_at).toLocaleString()}
                          </span>
                        </div>
                        <span className="text-sm font-medium">
                          {result.records_success}/{result.records_processed} successful
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Processed: </span>
                          <span className="font-medium">{result.records_processed}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Failed: </span>
                          <span className="font-medium text-red-600">{result.records_failed}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Duration: </span>
                          <span className="font-medium">
                            {result.completed_at ? 
                              Math.round((new Date(result.completed_at).getTime() - new Date(result.started_at).getTime()) / 1000 / 60) + ' min' : 
                              'In progress'
                            }
                          </span>
                        </div>
                      </div>
                      
                      {result.error_details && (
                        <Alert className="mt-3" variant="destructive">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>
                            {result.error_details}
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>
                  ))
                )}
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
