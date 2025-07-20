
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Save, TestTube } from "lucide-react";
import { integrationCoreService, Integration } from "@/services/integrations/integration-core-service";
import { getCurrentUserProfile } from "@/lib/supabase-utils";

interface IntegrationFormProps {
  integrationId: string | null;
  onClose: () => void;
}

const IntegrationForm: React.FC<IntegrationFormProps> = ({ integrationId, onClose }) => {
  const [integration, setIntegration] = useState<Partial<Integration>>({
    integration_name: "",
    integration_type: "webhook",
    provider: "webhook",
    configuration: {},
    webhook_url: "",
    is_active: true
  });
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);
  const { toast } = useToast();

  const integrationTypes = integrationCoreService.getIntegrationTypes();

  useEffect(() => {
    if (integrationId) {
      loadIntegration();
    }
  }, [integrationId]);

  const loadIntegration = async () => {
    try {
      setLoading(true);
      const integrations = await integrationCoreService.getIntegrations();
      const found = integrations.find(i => i.id === integrationId);
      if (found) {
        setIntegration(found);
      }
    } catch (error) {
      console.error('Error loading integration:', error);
      toast({ title: "Error", description: "Failed to load integration", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setIntegration(prev => ({ ...prev, [field]: value }));
  };

  const handleConfigChange = (key: string, value: any) => {
    setIntegration(prev => ({
      ...prev,
      configuration: { ...prev.configuration, [key]: value }
    }));
  };

  const handleTestIntegration = async () => {
    if (!integration.webhook_url) {
      toast({
        title: "Error",
        description: "Please enter a webhook URL to test",
        variant: "destructive",
      });
      return;
    }

    setTesting(true);
    try {
      // Simple test request to webhook URL
      const response = await fetch(integration.webhook_url!, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ test: true, timestamp: new Date().toISOString() }),
        mode: 'no-cors'
      });

      toast({
        title: "Test Sent",
        description: "Test request sent to webhook endpoint. Check your service logs for details.",
        variant: "default"
      });
    } catch (error) {
      console.error('Error testing integration:', error);
      toast({
        title: "Test Failed",
        description: "Failed to test integration",
        variant: "destructive",
      });
    } finally {
      setTesting(false);
    }
  };

  const handleSave = async () => {
    if (!integration.integration_name || !integration.integration_type) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const profile = await getCurrentUserProfile();
      if (!profile?.organization_id) {
        throw new Error('No organization found');
      }

      if (integrationId) {
        await integrationCoreService.updateIntegration(integrationId, integration);
        toast({
          title: "Success",
          description: "Integration updated successfully",
        });
      } else {
        await integrationCoreService.createIntegration({
          ...integration,
          org_id: profile.organization_id,
          created_by: profile.id,
          created_by_name: profile.full_name || 'Unknown User'
        } as Omit<Integration, 'id' | 'created_at' | 'updated_at'>);
        toast({
          title: "Success",
          description: "Integration created successfully",
        });
      }
      
      onClose();
    } catch (error) {
      console.error('Error saving integration:', error);
      toast({
        title: "Error",
        description: "Failed to save integration",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const selectedType = integrationTypes.find(t => t.value === integration.integration_type);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" onClick={onClose}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold">
            {integrationId ? 'Edit Integration' : 'Add New Integration'}
          </h1>
          <p className="text-muted-foreground">
            Configure external integration settings
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Integration Details</CardTitle>
          <CardDescription>
            Basic configuration for the integration
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Integration Name *</Label>
              <Input
                id="name"
                placeholder="e.g., Slack Notifications"
                value={integration.integration_name || ""}
                onChange={(e) => handleInputChange('integration_name', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="type">Integration Type *</Label>
              <Select
                value={integration.integration_type || ""}
                onValueChange={(value) => {
                  handleInputChange('integration_type', value);
                  handleInputChange('provider', value);
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {integrationTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {selectedType && (
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">{selectedType.description}</p>
            </div>
          )}

          <div>
            <Label htmlFor="webhook-url">
              {integration.integration_type === 'webhook' ? 'Webhook URL' : 'Endpoint URL'}
            </Label>
            <div className="flex gap-2">
              <Input
                id="webhook-url"
                placeholder="https://your-service.com/webhook"
                value={integration.webhook_url || ""}
                onChange={(e) => handleInputChange('webhook_url', e.target.value)}
                className="flex-1"
              />
              <Button
                variant="outline"
                onClick={handleTestIntegration}
                disabled={testing || !integration.webhook_url}
              >
                <TestTube className="h-4 w-4 mr-2" />
                {testing ? 'Testing...' : 'Test'}
              </Button>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="active"
              checked={integration.is_active || false}
              onCheckedChange={(checked) => handleInputChange('is_active', checked)}
            />
            <Label htmlFor="active">Active</Label>
          </div>
        </CardContent>
      </Card>

      {/* Configuration based on integration type */}
      {integration.integration_type === 'slack' && (
        <Card>
          <CardHeader>
            <CardTitle>Slack Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="slack-channel">Channel</Label>
              <Input
                id="slack-channel"
                placeholder="#general"
                value={integration.configuration?.channel || ""}
                onChange={(e) => handleConfigChange('channel', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="slack-token">Bot Token</Label>
              <Input
                id="slack-token"
                type="password"
                placeholder="xoxb-..."
                value={integration.configuration?.token || ""}
                onChange={(e) => handleConfigChange('token', e.target.value)}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {integration.integration_type === 'teams' && (
        <Card>
          <CardHeader>
            <CardTitle>Microsoft Teams Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="teams-webhook">Teams Webhook URL</Label>
              <Input
                id="teams-webhook"
                placeholder="https://outlook.office.com/webhook/..."
                value={integration.configuration?.webhook || ""}
                onChange={(e) => handleConfigChange('webhook', e.target.value)}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {integration.integration_type === 'email' && (
        <Card>
          <CardHeader>
            <CardTitle>Email Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="smtp-host">SMTP Host</Label>
                <Input
                  id="smtp-host"
                  placeholder="smtp.gmail.com"
                  value={integration.configuration?.smtpHost || ""}
                  onChange={(e) => handleConfigChange('smtpHost', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="smtp-port">SMTP Port</Label>
                <Input
                  id="smtp-port"
                  placeholder="587"
                  value={integration.configuration?.smtpPort || ""}
                  onChange={(e) => handleConfigChange('smtpPort', e.target.value)}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="email-username">Username</Label>
              <Input
                id="email-username"
                placeholder="your-email@domain.com"
                value={integration.configuration?.username || ""}
                onChange={(e) => handleConfigChange('username', e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="email-password">Password</Label>
              <Input
                id="email-password"
                type="password"
                value={integration.configuration?.password || ""}
                onChange={(e) => handleConfigChange('password', e.target.value)}
              />
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-end gap-4">
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={loading}>
          <Save className="h-4 w-4 mr-2" />
          {loading ? 'Saving...' : 'Save Integration'}
        </Button>
      </div>
    </div>
  );
};

export default IntegrationForm;
