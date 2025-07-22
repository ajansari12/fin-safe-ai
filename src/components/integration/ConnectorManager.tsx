import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Plus, Settings, Trash2 } from 'lucide-react';
import { createIntegrationService, SystemConnector } from '@/services/integration/integration-framework';

interface ConnectorManagerProps {
  org_id: string;
  onConnectorChange: () => void;
}

const ConnectorManager: React.FC<ConnectorManagerProps> = ({ org_id, onConnectorChange }) => {
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    systemName: '',
    systemType: 'third_party' as const,
    connectionType: 'rest_api' as const,
    endpoint: '',
    dataFormat: 'json' as const,
    apiKey: ''
  });
  const { toast } = useToast();

  const integrationService = createIntegrationService(org_id);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const connector: Partial<SystemConnector> = {
        systemName: formData.systemName,
        systemType: formData.systemType,
        connectionType: formData.connectionType,
        endpoint: formData.endpoint,
        dataFormat: formData.dataFormat,
        authentication: {
          type: 'api_key',
          credentials: { apiKey: formData.apiKey }
        }
      };

      await integrationService.createConnector(connector);
      
      toast({
        title: "Success",
        description: "Connector created successfully",
      });

      setIsCreating(false);
      setFormData({
        systemName: '',
        systemType: 'third_party',
        connectionType: 'rest_api',
        endpoint: '',
        dataFormat: 'json',
        apiKey: ''
      });
      
      onConnectorChange();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create connector",
        variant: "destructive",
      });
    }
  };

  if (isCreating) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Create New Connector</CardTitle>
          <CardDescription>Configure a new external system integration</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="systemName">System Name</Label>
                <Input
                  id="systemName"
                  value={formData.systemName}
                  onChange={(e) => setFormData(prev => ({ ...prev, systemName: e.target.value }))}
                  placeholder="e.g., Core Banking System"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="systemType">System Type</Label>
                <Select value={formData.systemType} onValueChange={(value: any) => setFormData(prev => ({ ...prev, systemType: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="core_banking">Core Banking</SelectItem>
                    <SelectItem value="trading">Trading System</SelectItem>
                    <SelectItem value="hr">HR System</SelectItem>
                    <SelectItem value="vendor_mgmt">Vendor Management</SelectItem>
                    <SelectItem value="regulatory">Regulatory</SelectItem>
                    <SelectItem value="third_party">Third Party</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="connectionType">Connection Type</Label>
                <Select value={formData.connectionType} onValueChange={(value: any) => setFormData(prev => ({ ...prev, connectionType: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="rest_api">REST API</SelectItem>
                    <SelectItem value="soap">SOAP</SelectItem>
                    <SelectItem value="database">Database</SelectItem>
                    <SelectItem value="file_transfer">File Transfer</SelectItem>
                    <SelectItem value="message_queue">Message Queue</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dataFormat">Data Format</Label>
                <Select value={formData.dataFormat} onValueChange={(value: any) => setFormData(prev => ({ ...prev, dataFormat: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="json">JSON</SelectItem>
                    <SelectItem value="xml">XML</SelectItem>
                    <SelectItem value="csv">CSV</SelectItem>
                    <SelectItem value="fixed_width">Fixed Width</SelectItem>
                    <SelectItem value="binary">Binary</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="endpoint">Endpoint URL</Label>
              <Input
                id="endpoint"
                value={formData.endpoint}
                onChange={(e) => setFormData(prev => ({ ...prev, endpoint: e.target.value }))}
                placeholder="https://api.example.com/v1"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="apiKey">API Key</Label>
              <Input
                id="apiKey"
                type="password"
                value={formData.apiKey}
                onChange={(e) => setFormData(prev => ({ ...prev, apiKey: e.target.value }))}
                placeholder="Enter API key for authentication"
              />
            </div>

            <div className="flex gap-2">
              <Button type="submit">Create Connector</Button>
              <Button type="button" variant="outline" onClick={() => setIsCreating(false)}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">System Connectors</h3>
          <p className="text-sm text-muted-foreground">Manage external system connections</p>
        </div>
        <Button onClick={() => setIsCreating(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Connector
        </Button>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="text-center py-8 text-muted-foreground">
            Click "Add Connector" to create your first external system integration.
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ConnectorManager;