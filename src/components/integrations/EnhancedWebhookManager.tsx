
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Webhook, Plus, Edit, Trash2, TestTube, Activity, CheckCircle, XCircle } from "lucide-react";

interface WebhookConfig {
  id: string;
  name: string;
  url: string;
  method: 'POST' | 'PUT' | 'PATCH';
  headers: Record<string, string>;
  events: string[];
  enabled: boolean;
  retry_attempts: number;
  timeout_seconds: number;
  last_triggered?: string;
  last_status?: 'success' | 'failed';
  created_at: string;
}

const EnhancedWebhookManager: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [webhooks, setWebhooks] = useState<WebhookConfig[]>([]);
  const [editingWebhook, setEditingWebhook] = useState<WebhookConfig | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [testing, setTesting] = useState<string | null>(null);

  const availableEvents = [
    'incident.created',
    'incident.updated',
    'incident.resolved',
    'kri.breach',
    'policy.approved',
    'policy.rejected',
    'audit.completed',
    'risk.threshold_exceeded',
    'dependency.failed',
    'business_continuity.test_completed'
  ];

  useEffect(() => {
    loadWebhooks();
  }, [user]);

  const loadWebhooks = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('webhooks')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setWebhooks(data || []);
    } catch (error) {
      console.error('Error loading webhooks:', error);
      toast({
        title: "Error",
        description: "Failed to load webhooks",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const saveWebhook = async (webhookData: Omit<WebhookConfig, 'id' | 'created_at'>) => {
    try {
      if (editingWebhook) {
        const { error } = await supabase
          .from('webhooks')
          .update(webhookData)
          .eq('id', editingWebhook.id);

        if (error) throw error;

        setWebhooks(prev => prev.map(w => 
          w.id === editingWebhook.id ? { ...w, ...webhookData } : w
        ));

        toast({
          title: "Webhook Updated",
          description: "Webhook configuration has been updated"
        });
      } else {
        const { data, error } = await supabase
          .from('webhooks')
          .insert(webhookData)
          .select()
          .single();

        if (error) throw error;

        setWebhooks(prev => [data, ...prev]);

        toast({
          title: "Webhook Created",
          description: "New webhook has been created successfully"
        });
      }

      setShowForm(false);
      setEditingWebhook(null);
    } catch (error) {
      console.error('Error saving webhook:', error);
      toast({
        title: "Error",
        description: "Failed to save webhook",
        variant: "destructive"
      });
    }
  };

  const deleteWebhook = async (webhookId: string) => {
    try {
      const { error } = await supabase
        .from('webhooks')
        .delete()
        .eq('id', webhookId);

      if (error) throw error;

      setWebhooks(prev => prev.filter(w => w.id !== webhookId));

      toast({
        title: "Webhook Deleted",
        description: "Webhook has been removed"
      });
    } catch (error) {
      console.error('Error deleting webhook:', error);
      toast({
        title: "Error",
        description: "Failed to delete webhook",
        variant: "destructive"
      });
    }
  };

  const testWebhook = async (webhook: WebhookConfig) => {
    setTesting(webhook.id);
    
    try {
      const { data, error } = await supabase.functions.invoke('test-webhook', {
        body: {
          webhook_id: webhook.id,
          test_payload: {
            event: 'webhook.test',
            timestamp: new Date().toISOString(),
            data: { message: 'This is a test webhook' }
          }
        }
      });

      if (error) throw error;

      toast({
        title: "Test Successful",
        description: "Webhook test completed successfully"
      });

      // Update webhook status
      setWebhooks(prev => prev.map(w => 
        w.id === webhook.id ? { 
          ...w, 
          last_triggered: new Date().toISOString(),
          last_status: 'success' 
        } : w
      ));
    } catch (error) {
      console.error('Error testing webhook:', error);
      toast({
        title: "Test Failed",
        description: "Webhook test failed. Check your URL and configuration.",
        variant: "destructive"
      });

      // Update webhook status
      setWebhooks(prev => prev.map(w => 
        w.id === webhook.id ? { 
          ...w, 
          last_triggered: new Date().toISOString(),
          last_status: 'failed' 
        } : w
      ));
    } finally {
      setTesting(null);
    }
  };

  const toggleWebhookStatus = async (webhookId: string, enabled: boolean) => {
    try {
      const { error } = await supabase
        .from('webhooks')
        .update({ enabled })
        .eq('id', webhookId);

      if (error) throw error;

      setWebhooks(prev => prev.map(w => 
        w.id === webhookId ? { ...w, enabled } : w
      ));

      toast({
        title: enabled ? "Webhook Enabled" : "Webhook Disabled",
        description: `Webhook has been ${enabled ? 'enabled' : 'disabled'}`
      });
    } catch (error) {
      console.error('Error toggling webhook:', error);
      toast({
        title: "Error",
        description: "Failed to update webhook status",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return <div className="animate-pulse">Loading webhooks...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium">Webhook Management</h3>
          <p className="text-sm text-muted-foreground">
            Configure webhooks to receive real-time notifications
          </p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Webhook
        </Button>
      </div>

      {/* Webhook List */}
      <div className="space-y-4">
        {webhooks.map(webhook => (
          <Card key={webhook.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Webhook className="h-5 w-5" />
                  <div>
                    <CardTitle className="text-base">{webhook.name}</CardTitle>
                    <CardDescription>{webhook.url}</CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {webhook.last_status && (
                    <Badge variant={webhook.last_status === 'success' ? 'default' : 'destructive'}>
                      {webhook.last_status === 'success' ? (
                        <CheckCircle className="h-3 w-3 mr-1" />
                      ) : (
                        <XCircle className="h-3 w-3 mr-1" />
                      )}
                      {webhook.last_status}
                    </Badge>
                  )}
                  <Switch
                    checked={webhook.enabled}
                    onCheckedChange={(enabled) => toggleWebhookStatus(webhook.id, enabled)}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex flex-wrap gap-1">
                  {webhook.events.map(event => (
                    <Badge key={event} variant="outline" className="text-xs">
                      {event}
                    </Badge>
                  ))}
                </div>
                
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>Method: {webhook.method}</span>
                  <span>Timeout: {webhook.timeout_seconds}s</span>
                  <span>Retries: {webhook.retry_attempts}</span>
                  {webhook.last_triggered && (
                    <span>Last: {new Date(webhook.last_triggered).toLocaleString()}</span>
                  )}
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => testWebhook(webhook)}
                    disabled={testing === webhook.id}
                  >
                    <TestTube className="h-4 w-4 mr-2" />
                    {testing === webhook.id ? "Testing..." : "Test"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditingWebhook(webhook);
                      setShowForm(true);
                    }}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => deleteWebhook(webhook.id)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Webhook Form */}
      {showForm && (
        <WebhookForm
          webhook={editingWebhook}
          availableEvents={availableEvents}
          onSave={saveWebhook}
          onCancel={() => {
            setShowForm(false);
            setEditingWebhook(null);
          }}
        />
      )}
    </div>
  );
};

// Webhook Form Component
interface WebhookFormProps {
  webhook: WebhookConfig | null;
  availableEvents: string[];
  onSave: (webhook: Omit<WebhookConfig, 'id' | 'created_at'>) => void;
  onCancel: () => void;
}

const WebhookForm: React.FC<WebhookFormProps> = ({ webhook, availableEvents, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    name: webhook?.name || '',
    url: webhook?.url || '',
    method: webhook?.method || 'POST' as const,
    headers: webhook?.headers || {},
    events: webhook?.events || [],
    enabled: webhook?.enabled ?? true,
    retry_attempts: webhook?.retry_attempts || 3,
    timeout_seconds: webhook?.timeout_seconds || 30
  });

  const [headerKey, setHeaderKey] = useState('');
  const [headerValue, setHeaderValue] = useState('');

  const handleEventToggle = (event: string) => {
    setFormData(prev => ({
      ...prev,
      events: prev.events.includes(event)
        ? prev.events.filter(e => e !== event)
        : [...prev.events, event]
    }));
  };

  const addHeader = () => {
    if (headerKey && headerValue) {
      setFormData(prev => ({
        ...prev,
        headers: { ...prev.headers, [headerKey]: headerValue }
      }));
      setHeaderKey('');
      setHeaderValue('');
    }
  };

  const removeHeader = (key: string) => {
    setFormData(prev => {
      const newHeaders = { ...prev.headers };
      delete newHeaders[key];
      return { ...prev, headers: newHeaders };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{webhook ? 'Edit Webhook' : 'Create New Webhook'}</CardTitle>
        <CardDescription>
          Configure webhook endpoint and event subscriptions
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Webhook Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="My Webhook"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="method">HTTP Method</Label>
              <Select 
                value={formData.method} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, method: value as any }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="POST">POST</SelectItem>
                  <SelectItem value="PUT">PUT</SelectItem>
                  <SelectItem value="PATCH">PATCH</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="url">Webhook URL</Label>
            <Input
              id="url"
              type="url"
              value={formData.url}
              onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
              placeholder="https://example.com/webhook"
              required
            />
          </div>

          <div className="space-y-2">
            <Label>Events</Label>
            <div className="grid grid-cols-2 gap-2">
              {availableEvents.map(event => (
                <div key={event} className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={event}
                    checked={formData.events.includes(event)}
                    onChange={() => handleEventToggle(event)}
                  />
                  <Label htmlFor={event} className="text-sm">{event}</Label>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Custom Headers</Label>
            <div className="space-y-2">
              {Object.entries(formData.headers).map(([key, value]) => (
                <div key={key} className="flex items-center gap-2">
                  <Input value={key} disabled className="flex-1" />
                  <Input value={value} disabled className="flex-1" />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeHeader(key)}
                  >
                    Remove
                  </Button>
                </div>
              ))}
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Header name"
                  value={headerKey}
                  onChange={(e) => setHeaderKey(e.target.value)}
                  className="flex-1"
                />
                <Input
                  placeholder="Header value"
                  value={headerValue}
                  onChange={(e) => setHeaderValue(e.target.value)}
                  className="flex-1"
                />
                <Button type="button" variant="outline" size="sm" onClick={addHeader}>
                  Add
                </Button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="timeout">Timeout (seconds)</Label>
              <Input
                id="timeout"
                type="number"
                value={formData.timeout_seconds}
                onChange={(e) => setFormData(prev => ({ ...prev, timeout_seconds: parseInt(e.target.value) }))}
                min="5"
                max="300"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="retries">Retry Attempts</Label>
              <Input
                id="retries"
                type="number"
                value={formData.retry_attempts}
                onChange={(e) => setFormData(prev => ({ ...prev, retry_attempts: parseInt(e.target.value) }))}
                min="0"
                max="10"
              />
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              checked={formData.enabled}
              onCheckedChange={(enabled) => setFormData(prev => ({ ...prev, enabled }))}
            />
            <Label>Enable webhook</Label>
          </div>

          <div className="flex gap-2">
            <Button type="submit">
              {webhook ? 'Update' : 'Create'} Webhook
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default EnhancedWebhookManager;
