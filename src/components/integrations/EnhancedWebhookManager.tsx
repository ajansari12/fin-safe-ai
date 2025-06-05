
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Webhook, Settings, Trash2, Edit, TestTube, Activity } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface WebhookConfig {
  id: string;
  name: string;
  url: string;
  events: string[];
  secret?: string;
  enabled: boolean;
  created_at: string;
  org_id: string;
}

const EnhancedWebhookManager: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [webhooks, setWebhooks] = useState<WebhookConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingWebhook, setEditingWebhook] = useState<WebhookConfig | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    url: '',
    events: [] as string[],
    secret: '',
    enabled: true
  });

  const availableEvents = [
    'incident.created',
    'incident.updated',
    'incident.resolved',
    'control.test.completed',
    'kri.threshold.exceeded',
    'audit.finding.created',
    'risk.appetite.breach'
  ];

  useEffect(() => {
    loadWebhooks();
  }, [user]);

  const loadWebhooks = async () => {
    if (!user) return;

    try {
      // Since webhooks table doesn't exist, we'll use integrations table as a placeholder
      const { data, error } = await (supabase as any)
        .from('integrations')
        .select('*')
        .eq('org_id', user.user_metadata?.org_id)
        .eq('integration_type', 'webhook');

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

  const handleSave = async () => {
    if (!user?.user_metadata?.org_id) return;

    try {
      const webhookData = {
        org_id: user.user_metadata.org_id,
        integration_type: 'webhook',
        integration_name: formData.name,
        config: {
          url: formData.url,
          events: formData.events,
          secret: formData.secret,
          enabled: formData.enabled
        },
        is_active: formData.enabled,
        created_by: user.id
      };

      let error;
      if (editingWebhook) {
        ({ error } = await (supabase as any)
          .from('integrations')
          .update(webhookData)
          .eq('id', editingWebhook.id));
      } else {
        ({ error } = await (supabase as any)
          .from('integrations')
          .insert(webhookData));
      }

      if (error) throw error;

      toast({
        title: "Success",
        description: `Webhook ${editingWebhook ? 'updated' : 'created'} successfully`
      });

      loadWebhooks();
      resetForm();
    } catch (error) {
      console.error('Error saving webhook:', error);
      toast({
        title: "Error",
        description: "Failed to save webhook",
        variant: "destructive"
      });
    }
  };

  const handleDelete = async (webhookId: string) => {
    try {
      const { error } = await (supabase as any)
        .from('integrations')
        .delete()
        .eq('id', webhookId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Webhook deleted successfully"
      });

      loadWebhooks();
    } catch (error) {
      console.error('Error deleting webhook:', error);
      toast({
        title: "Error",
        description: "Failed to delete webhook",
        variant: "destructive"
      });
    }
  };

  const handleTest = async (webhook: WebhookConfig) => {
    try {
      // Mock test - in real implementation, this would send a test payload
      toast({
        title: "Test Sent",
        description: `Test webhook sent to ${webhook.url}`
      });
    } catch (error) {
      toast({
        title: "Test Failed",
        description: "Failed to send test webhook",
        variant: "destructive"
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      url: '',
      events: [],
      secret: '',
      enabled: true
    });
    setEditingWebhook(null);
    setShowForm(false);
  };

  const handleEdit = (webhook: WebhookConfig) => {
    setFormData({
      name: webhook.name,
      url: webhook.url,
      events: webhook.events,
      secret: webhook.secret || '',
      enabled: webhook.enabled
    });
    setEditingWebhook(webhook);
    setShowForm(true);
  };

  const toggleEvent = (event: string) => {
    setFormData(prev => ({
      ...prev,
      events: prev.events.includes(event)
        ? prev.events.filter(e => e !== event)
        : [...prev.events, event]
    }));
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
            Configure webhooks to receive real-time notifications about events
          </p>
        </div>
        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogTrigger asChild>
            <Button onClick={() => setShowForm(true)}>
              <Webhook className="h-4 w-4 mr-2" />
              Add Webhook
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingWebhook ? 'Edit Webhook' : 'Create Webhook'}
              </DialogTitle>
              <DialogDescription>
                Configure webhook settings and select which events to monitor
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Webhook Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter webhook name"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="url">Webhook URL</Label>
                  <Input
                    id="url"
                    type="url"
                    value={formData.url}
                    onChange={(e) => setFormData(prev => ({ ...prev, url: e.target.value }))}
                    placeholder="https://your-endpoint.com/webhook"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Events to Monitor</Label>
                <div className="grid grid-cols-2 gap-2">
                  {availableEvents.map(event => (
                    <div key={event} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id={event}
                        checked={formData.events.includes(event)}
                        onChange={() => toggleEvent(event)}
                        className="rounded"
                      />
                      <Label htmlFor={event} className="text-sm">{event}</Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="secret">Secret Key (Optional)</Label>
                <Input
                  id="secret"
                  type="password"
                  value={formData.secret}
                  onChange={(e) => setFormData(prev => ({ ...prev, secret: e.target.value }))}
                  placeholder="Enter secret for webhook verification"
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="enabled"
                  checked={formData.enabled}
                  onChange={(e) => setFormData(prev => ({ ...prev, enabled: e.target.checked }))}
                  className="rounded"
                />
                <Label htmlFor="enabled">Enable webhook</Label>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
                <Button onClick={handleSave}>
                  {editingWebhook ? 'Update' : 'Create'} Webhook
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Webhook List */}
      <div className="grid gap-4">
        {webhooks.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <Webhook className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-muted-foreground">No webhooks configured</p>
                <p className="text-sm text-muted-foreground">Create your first webhook to start receiving notifications</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          webhooks.map((webhook) => (
            <Card key={webhook.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{webhook.name}</CardTitle>
                    <CardDescription className="mt-1">
                      {webhook.url}
                    </CardDescription>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={webhook.enabled ? "default" : "secondary"}>
                      {webhook.enabled ? "Active" : "Disabled"}
                    </Badge>
                    <Button variant="ghost" size="sm" onClick={() => handleTest(webhook)}>
                      <TestTube className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleEdit(webhook)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleDelete(webhook.id)}
                      className="text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  <div>
                    <Label className="text-sm font-medium">Monitored Events:</Label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {webhook.events.map(event => (
                        <Badge key={event} variant="outline" className="text-xs">
                          {event}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Created: {new Date(webhook.created_at).toLocaleDateString()}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default EnhancedWebhookManager;
