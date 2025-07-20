import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { 
  Plus, 
  Settings, 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Database,
  Webhook,
  Shield,
  BarChart3
} from "lucide-react";
import { integrationCoreService, type Integration } from "@/services/integrations/integration-core-service";
import { integrationMonitoringService, type IntegrationMetrics, type HealthCheck } from "@/services/integrations/integration-monitoring-service";
import { integrationSecurityService } from "@/services/integrations/integration-security-service";

const IntegrationsHub: React.FC = () => {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [metrics, setMetrics] = useState<Record<string, IntegrationMetrics>>({});
  const [healthChecks, setHealthChecks] = useState<Record<string, HealthCheck>>({});
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newIntegration, setNewIntegration] = useState({
    integration_name: "",
    integration_type: "",
    provider: "",
    webhook_url: "",
    configuration: {}
  });
  const { toast } = useToast();

  useEffect(() => {
    loadIntegrations();
  }, []);

  const loadIntegrations = async () => {
    try {
      const data = await integrationCoreService.getIntegrations();
      setIntegrations(data);
      
      // Load metrics and health checks for each integration
      for (const integration of data) {
        try {
          const integrationMetrics = await integrationMonitoringService.getIntegrationMetrics(integration.id);
          setMetrics(prev => ({ ...prev, [integration.id]: integrationMetrics }));
        } catch (error) {
          console.error(`Failed to load metrics for integration ${integration.id}:`, error);
        }
      }
    } catch (error) {
      console.error("Failed to load integrations:", error);
      toast({
        title: "Error",
        description: "Failed to load integrations",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateIntegration = async () => {
    if (!newIntegration.integration_name || !newIntegration.integration_type || !newIntegration.provider) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      await integrationCoreService.createIntegration({
        ...newIntegration,
        org_id: "", // Will be set by the service
        is_active: true,
        last_sync_at: null,
        created_by: null,
        created_by_name: null
      });
      
      await loadIntegrations();
      setNewIntegration({
        integration_name: "",
        integration_type: "",
        provider: "",
        webhook_url: "",
        configuration: {}
      });
      setShowAddForm(false);
      
      toast({
        title: "Integration Created",
        description: "New integration has been created successfully",
      });
    } catch (error) {
      console.error("Failed to create integration:", error);
      toast({
        title: "Error",
        description: "Failed to create integration",
        variant: "destructive",
      });
    }
  };

  const handleToggleIntegration = async (id: string, isActive: boolean) => {
    try {
      await integrationCoreService.updateIntegration(id, { is_active: !isActive });
      await loadIntegrations();
      
      toast({
        title: isActive ? "Integration Disabled" : "Integration Enabled",
        description: `Integration has been ${isActive ? 'disabled' : 'enabled'} successfully`,
      });
    } catch (error) {
      console.error("Failed to toggle integration:", error);
      toast({
        title: "Error",
        description: "Failed to update integration status",
        variant: "destructive",
      });
    }
  };

  const getStatusIcon = (integration: Integration) => {
    const metric = metrics[integration.id];
    if (!metric) return <Clock className="h-4 w-4 text-muted-foreground" />;
    
    if (metric.errorRate > 50) return <AlertTriangle className="h-4 w-4 text-destructive" />;
    if (metric.errorRate > 10) return <AlertTriangle className="h-4 w-4 text-orange-500" />;
    return <CheckCircle className="h-4 w-4 text-green-500" />;
  };

  const getStatusText = (integration: Integration) => {
    if (!integration.is_active) return "Inactive";
    
    const metric = metrics[integration.id];
    if (!metric) return "Unknown";
    
    if (metric.errorRate > 50) return "Critical";
    if (metric.errorRate > 10) return "Warning";
    return "Healthy";
  };

  const integrationTypes = integrationCoreService.getIntegrationTypes();

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading integrations...</div>;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Integration Hub</h1>
          <p className="text-muted-foreground">
            Manage external system integrations and data flows
          </p>
        </div>
        <Button onClick={() => setShowAddForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Integration
        </Button>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Integrations</p>
                    <p className="text-2xl font-bold">{integrations.length}</p>
                  </div>
                  <Database className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Active</p>
                    <p className="text-2xl font-bold text-green-600">
                      {integrations.filter(i => i.is_active).length}
                    </p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Alerts</p>
                    <p className="text-2xl font-bold text-orange-600">
                      {Object.values(metrics).filter(m => m.errorRate > 10).length}
                    </p>
                  </div>
                  <AlertTriangle className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Avg Response</p>
                    <p className="text-2xl font-bold">
                      {Object.values(metrics).length > 0 
                        ? Math.round(Object.values(metrics).reduce((sum, m) => sum + m.averageResponseTime, 0) / Object.values(metrics).length)
                        : 0}ms
                    </p>
                  </div>
                  <Activity className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Integration Activity</CardTitle>
              <CardDescription>Latest events from your integrations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {integrations.slice(0, 5).map(integration => (
                  <div key={integration.id} className="flex items-center justify-between p-2 rounded border">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(integration)}
                      <div>
                        <p className="font-medium">{integration.integration_name}</p>
                        <p className="text-sm text-muted-foreground">{integration.provider}</p>
                      </div>
                    </div>
                    <Badge variant={integration.is_active ? "default" : "secondary"}>
                      {getStatusText(integration)}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrations" className="space-y-6">
          {/* Add Integration Form */}
          {showAddForm && (
            <Card>
              <CardHeader>
                <CardTitle>Add New Integration</CardTitle>
                <CardDescription>Configure a new external system integration</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="integration-name">Integration Name</Label>
                    <Input
                      id="integration-name"
                      placeholder="e.g., Core Banking System"
                      value={newIntegration.integration_name}
                      onChange={(e) => setNewIntegration(prev => ({ ...prev, integration_name: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="integration-type">Integration Type</Label>
                    <Select
                      value={newIntegration.integration_type}
                      onValueChange={(value) => setNewIntegration(prev => ({ ...prev, integration_type: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        {integrationTypes.map(type => (
                          <SelectItem key={type.value} value={type.value}>
                            {type.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="provider">Provider</Label>
                    <Input
                      id="provider"
                      placeholder="e.g., Oracle, SAP, Microsoft"
                      value={newIntegration.provider}
                      onChange={(e) => setNewIntegration(prev => ({ ...prev, provider: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="webhook-url">Webhook URL (Optional)</Label>
                    <Input
                      id="webhook-url"
                      placeholder="https://api.example.com/webhook"
                      value={newIntegration.webhook_url}
                      onChange={(e) => setNewIntegration(prev => ({ ...prev, webhook_url: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <Button onClick={handleCreateIntegration}>Create Integration</Button>
                  <Button variant="outline" onClick={() => setShowAddForm(false)}>Cancel</Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Integrations List */}
          <Card>
            <CardHeader>
              <CardTitle>Active Integrations</CardTitle>
              <CardDescription>Manage your external system connections</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Provider</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Sync</TableHead>
                    <TableHead>Performance</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {integrations.map(integration => {
                    const metric = metrics[integration.id];
                    return (
                      <TableRow key={integration.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(integration)}
                            <span>{integration.integration_name}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{integration.integration_type}</Badge>
                        </TableCell>
                        <TableCell>{integration.provider}</TableCell>
                        <TableCell>
                          <Badge variant={integration.is_active ? "default" : "secondary"}>
                            {getStatusText(integration)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {integration.last_sync_at 
                            ? new Date(integration.last_sync_at).toLocaleDateString()
                            : "Never"
                          }
                        </TableCell>
                        <TableCell>
                          {metric ? (
                            <div className="text-sm">
                              <div>Success: {metric.successfulRequests}/{metric.totalRequests}</div>
                              <div>Avg: {Math.round(metric.averageResponseTime)}ms</div>
                            </div>
                          ) : (
                            "No data"
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleToggleIntegration(integration.id, integration.is_active)}
                            >
                              {integration.is_active ? "Disable" : "Enable"}
                            </Button>
                            <Button variant="outline" size="sm">
                              <Settings className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monitoring">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Integration Monitoring
              </CardTitle>
              <CardDescription>Real-time monitoring and performance metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center text-muted-foreground py-8">
                Monitoring dashboard will be implemented with real-time charts and metrics.
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security & Authentication
              </CardTitle>
              <CardDescription>Manage API keys, certificates, and security settings</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center text-muted-foreground py-8">
                Security management interface will show API keys, certificates, and access controls.
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default IntegrationsHub;