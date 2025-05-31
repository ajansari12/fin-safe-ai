
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Edit, Trash2, Play, Pause, TestTube } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { integrationService, Integration } from "@/services/integration-service";

interface IntegrationsListProps {
  onEditIntegration: (integrationId: string) => void;
}

const IntegrationsList: React.FC<IntegrationsListProps> = ({ onEditIntegration }) => {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadIntegrations();
  }, []);

  const loadIntegrations = async () => {
    try {
      setLoading(true);
      const data = await integrationService.getIntegrations();
      setIntegrations(data);
    } catch (error) {
      console.error('Error loading integrations:', error);
      toast({ title: "Error", description: "Failed to load integrations", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleActive = async (integration: Integration) => {
    try {
      await integrationService.updateIntegration(integration.id, {
        is_active: !integration.is_active
      });
      
      toast({
        title: "Success",
        description: `Integration ${integration.is_active ? 'deactivated' : 'activated'} successfully`
      });
      
      loadIntegrations();
    } catch (error) {
      console.error('Error toggling integration:', error);
      toast({ title: "Error", description: "Failed to update integration", variant: "destructive" });
    }
  };

  const handleTestIntegration = async (integration: Integration) => {
    try {
      const success = await integrationService.testIntegration(integration.id);
      
      toast({
        title: success ? "Test Successful" : "Test Failed",
        description: success 
          ? "Integration is working correctly" 
          : "Integration test failed - check logs for details",
        variant: success ? "default" : "destructive"
      });
    } catch (error) {
      console.error('Error testing integration:', error);
      toast({ title: "Error", description: "Failed to test integration", variant: "destructive" });
    }
  };

  const handleDeleteIntegration = async (integration: Integration) => {
    if (!confirm(`Are you sure you want to delete the integration "${integration.integration_name}"?`)) {
      return;
    }

    try {
      await integrationService.deleteIntegration(integration.id);
      toast({ title: "Success", description: "Integration deleted successfully" });
      loadIntegrations();
    } catch (error) {
      console.error('Error deleting integration:', error);
      toast({ title: "Error", description: "Failed to delete integration", variant: "destructive" });
    }
  };

  const getProviderIcon = (provider: string) => {
    const icons: Record<string, string> = {
      slack: "💬",
      teams: "👥",
      webhook: "🔗",
      email: "📧",
      crm: "👤",
      dms: "📁",
      siem: "🛡️",
      api: "🔌"
    };
    return icons[provider] || "⚙️";
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Integrations</CardTitle>
          <CardDescription>Loading integrations...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">Loading integrations...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Active Integrations</CardTitle>
        <CardDescription>
          Manage your external integrations and connectors
        </CardDescription>
      </CardHeader>
      <CardContent>
        {integrations.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No integrations configured yet.</p>
            <p className="text-sm mt-2">Click "Add Integration" to get started.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Provider</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Sync</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {integrations.map((integration) => (
                <TableRow key={integration.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{getProviderIcon(integration.provider)}</span>
                      <div>
                        <div className="font-medium">{integration.integration_name}</div>
                        {integration.webhook_url && (
                          <div className="text-xs text-muted-foreground truncate max-w-48">
                            {integration.webhook_url}
                          </div>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {integration.provider}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="capitalize">
                      {integration.integration_type.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={integration.is_active ? "default" : "secondary"}>
                      {integration.is_active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {integration.last_sync_at 
                      ? new Date(integration.last_sync_at).toLocaleDateString()
                      : "Never"
                    }
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleTestIntegration(integration)}
                        title="Test Integration"
                      >
                        <TestTube className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleActive(integration)}
                        title={integration.is_active ? "Deactivate" : "Activate"}
                      >
                        {integration.is_active ? (
                          <Pause className="h-3 w-3" />
                        ) : (
                          <Play className="h-3 w-3" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEditIntegration(integration.id)}
                        title="Edit Integration"
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteIntegration(integration)}
                        title="Delete Integration"
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export default IntegrationsList;
