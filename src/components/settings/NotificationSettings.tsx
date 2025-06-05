
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Bell, Mail, Smartphone, Slack, MessageSquare } from "lucide-react";

interface NotificationChannel {
  id: string;
  name: string;
  type: 'email' | 'sms' | 'slack' | 'webhook';
  config: Record<string, any>;
  enabled: boolean;
}

interface NotificationRule {
  id: string;
  name: string;
  event_type: string;
  severity: string;
  channels: string[];
  enabled: boolean;
}

const NotificationSettings: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [channels, setChannels] = useState<NotificationChannel[]>([]);
  const [rules, setRules] = useState<NotificationRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadNotificationSettings();
  }, [user]);

  const loadNotificationSettings = async () => {
    if (!user) return;

    try {
      const [channelsResponse, rulesResponse] = await Promise.all([
        supabase.from('notification_channels').select('*').eq('user_id', user.id),
        supabase.from('notification_rules').select('*').eq('user_id', user.id)
      ]);

      if (channelsResponse.error) throw channelsResponse.error;
      if (rulesResponse.error) throw rulesResponse.error;

      setChannels(channelsResponse.data || []);
      setRules(rulesResponse.data || []);
    } catch (error) {
      console.error('Error loading notification settings:', error);
      toast({
        title: "Error",
        description: "Failed to load notification settings",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const addChannel = async (type: 'email' | 'sms' | 'slack' | 'webhook') => {
    if (!user) return;

    const newChannel: Omit<NotificationChannel, 'id'> = {
      name: `New ${type} channel`,
      type,
      config: {},
      enabled: true
    };

    try {
      const { data, error } = await supabase
        .from('notification_channels')
        .insert({
          user_id: user.id,
          ...newChannel
        })
        .select()
        .single();

      if (error) throw error;

      setChannels(prev => [...prev, data]);
      toast({
        title: "Channel Added",
        description: `${type} notification channel has been added`
      });
    } catch (error) {
      console.error('Error adding channel:', error);
      toast({
        title: "Error",
        description: "Failed to add notification channel",
        variant: "destructive"
      });
    }
  };

  const updateChannel = async (channelId: string, updates: Partial<NotificationChannel>) => {
    try {
      const { error } = await supabase
        .from('notification_channels')
        .update(updates)
        .eq('id', channelId);

      if (error) throw error;

      setChannels(prev => prev.map(channel => 
        channel.id === channelId ? { ...channel, ...updates } : channel
      ));
    } catch (error) {
      console.error('Error updating channel:', error);
      toast({
        title: "Error",
        description: "Failed to update notification channel",
        variant: "destructive"
      });
    }
  };

  const deleteChannel = async (channelId: string) => {
    try {
      const { error } = await supabase
        .from('notification_channels')
        .delete()
        .eq('id', channelId);

      if (error) throw error;

      setChannels(prev => prev.filter(channel => channel.id !== channelId));
      toast({
        title: "Channel Deleted",
        description: "Notification channel has been removed"
      });
    } catch (error) {
      console.error('Error deleting channel:', error);
      toast({
        title: "Error",
        description: "Failed to delete notification channel",
        variant: "destructive"
      });
    }
  };

  const getChannelIcon = (type: string) => {
    switch (type) {
      case 'email': return <Mail className="h-4 w-4" />;
      case 'sms': return <Smartphone className="h-4 w-4" />;
      case 'slack': return <Slack className="h-4 w-4" />;
      case 'webhook': return <MessageSquare className="h-4 w-4" />;
      default: return <Bell className="h-4 w-4" />;
    }
  };

  if (loading) {
    return <div className="animate-pulse">Loading notification settings...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Notification Channels */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Channels
          </CardTitle>
          <CardDescription>
            Configure how you want to receive notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2 mb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => addChannel('email')}
            >
              <Mail className="h-4 w-4 mr-2" />
              Add Email
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => addChannel('sms')}
            >
              <Smartphone className="h-4 w-4 mr-2" />
              Add SMS
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => addChannel('slack')}
            >
              <Slack className="h-4 w-4 mr-2" />
              Add Slack
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => addChannel('webhook')}
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Add Webhook
            </Button>
          </div>

          <div className="space-y-4">
            {channels.map(channel => (
              <div key={channel.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {getChannelIcon(channel.type)}
                    <Input
                      value={channel.name}
                      onChange={(e) => updateChannel(channel.id, { name: e.target.value })}
                      className="font-medium"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={channel.enabled}
                      onCheckedChange={(checked) => updateChannel(channel.id, { enabled: checked })}
                    />
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deleteChannel(channel.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>

                {channel.type === 'email' && (
                  <Input
                    placeholder="Email address"
                    value={channel.config.email || ''}
                    onChange={(e) => updateChannel(channel.id, {
                      config: { ...channel.config, email: e.target.value }
                    })}
                  />
                )}

                {channel.type === 'sms' && (
                  <Input
                    placeholder="Phone number"
                    value={channel.config.phone || ''}
                    onChange={(e) => updateChannel(channel.id, {
                      config: { ...channel.config, phone: e.target.value }
                    })}
                  />
                )}

                {channel.type === 'slack' && (
                  <Input
                    placeholder="Slack webhook URL"
                    value={channel.config.webhook_url || ''}
                    onChange={(e) => updateChannel(channel.id, {
                      config: { ...channel.config, webhook_url: e.target.value }
                    })}
                  />
                )}

                {channel.type === 'webhook' && (
                  <div className="space-y-2">
                    <Input
                      placeholder="Webhook URL"
                      value={channel.config.url || ''}
                      onChange={(e) => updateChannel(channel.id, {
                        config: { ...channel.config, url: e.target.value }
                      })}
                    />
                    <Textarea
                      placeholder="Custom headers (JSON)"
                      value={channel.config.headers || ''}
                      onChange={(e) => updateChannel(channel.id, {
                        config: { ...channel.config, headers: e.target.value }
                      })}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Notification Settings</CardTitle>
          <CardDescription>
            Common notification preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between p-3 border rounded">
              <div>
                <Label>Critical Incidents</Label>
                <p className="text-sm text-muted-foreground">Immediate alerts for critical issues</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between p-3 border rounded">
              <div>
                <Label>KRI Breaches</Label>
                <p className="text-sm text-muted-foreground">Risk appetite threshold violations</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between p-3 border rounded">
              <div>
                <Label>Policy Reviews</Label>
                <p className="text-sm text-muted-foreground">Upcoming policy review deadlines</p>
              </div>
              <Switch />
            </div>
            <div className="flex items-center justify-between p-3 border rounded">
              <div>
                <Label>Daily Summaries</Label>
                <p className="text-sm text-muted-foreground">End-of-day activity reports</p>
              </div>
              <Switch />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotificationSettings;
