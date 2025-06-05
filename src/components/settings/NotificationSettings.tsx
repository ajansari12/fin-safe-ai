
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Bell, Mail, MessageSquare, Smartphone, Settings } from "lucide-react";

interface NotificationRule {
  id: string;
  event_type: string;
  channels: string[];
  recipients: string[];
  condition: string;
  enabled: boolean;
}

const NotificationSettings: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [rules, setRules] = useState<NotificationRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Mock notification settings since tables don't exist
  const [globalSettings, setGlobalSettings] = useState({
    email_notifications: true,
    sms_notifications: false,
    push_notifications: true,
    notification_frequency: 'immediate' as 'immediate' | 'daily' | 'weekly',
    quiet_hours_enabled: false,
    quiet_hours_start: '22:00',
    quiet_hours_end: '08:00'
  });

  const eventTypes = [
    { value: 'incident_created', label: 'Incident Created' },
    { value: 'incident_escalated', label: 'Incident Escalated' },
    { value: 'control_test_failed', label: 'Control Test Failed' },
    { value: 'kri_threshold_exceeded', label: 'KRI Threshold Exceeded' },
    { value: 'audit_finding_created', label: 'Audit Finding Created' },
    { value: 'policy_review_due', label: 'Policy Review Due' },
    { value: 'contract_expiring', label: 'Contract Expiring' }
  ];

  const channels = [
    { value: 'email', label: 'Email', icon: Mail },
    { value: 'sms', label: 'SMS', icon: Smartphone },
    { value: 'push', label: 'Push Notification', icon: Bell },
    { value: 'slack', label: 'Slack', icon: MessageSquare }
  ];

  useEffect(() => {
    loadNotificationSettings();
  }, [user]);

  const loadNotificationSettings = async () => {
    if (!user) return;

    try {
      // Mock loading - in real implementation, would load from database
      setRules([
        {
          id: '1',
          event_type: 'incident_created',
          channels: ['email', 'push'],
          recipients: ['admin@company.com'],
          condition: 'severity = "critical"',
          enabled: true
        },
        {
          id: '2',
          event_type: 'kri_threshold_exceeded',
          channels: ['email', 'slack'],
          recipients: ['risk-team@company.com'],
          condition: 'threshold_type = "critical"',
          enabled: true
        }
      ]);
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

  const saveGlobalSettings = async () => {
    setSaving(true);
    try {
      // Mock save - in real implementation, would save to user_preferences table
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Settings Saved",
        description: "Notification settings have been updated successfully"
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: "Error",
        description: "Failed to save notification settings",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const toggleRule = (ruleId: string) => {
    setRules(prev => prev.map(rule => 
      rule.id === ruleId ? { ...rule, enabled: !rule.enabled } : rule
    ));
  };

  if (loading) {
    return <div className="animate-pulse">Loading notification settings...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Global Notification Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Global Notification Settings
          </CardTitle>
          <CardDescription>
            Configure your overall notification preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Email Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive notifications via email
                </p>
              </div>
              <Switch
                checked={globalSettings.email_notifications}
                onCheckedChange={(checked) => setGlobalSettings(prev => ({ ...prev, email_notifications: checked }))}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>SMS Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive critical alerts via SMS
                </p>
              </div>
              <Switch
                checked={globalSettings.sms_notifications}
                onCheckedChange={(checked) => setGlobalSettings(prev => ({ ...prev, sms_notifications: checked }))}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label>Push Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive browser push notifications
                </p>
              </div>
              <Switch
                checked={globalSettings.push_notifications}
                onCheckedChange={(checked) => setGlobalSettings(prev => ({ ...prev, push_notifications: checked }))}
              />
            </div>

            <div className="space-y-2">
              <Label>Notification Frequency</Label>
              <Select 
                value={globalSettings.notification_frequency} 
                onValueChange={(value: any) => setGlobalSettings(prev => ({ ...prev, notification_frequency: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="immediate">Immediate</SelectItem>
                  <SelectItem value="daily">Daily Digest</SelectItem>
                  <SelectItem value="weekly">Weekly Summary</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="border-t pt-4">
            <div className="flex items-center justify-between mb-4">
              <div className="space-y-1">
                <Label>Quiet Hours</Label>
                <p className="text-sm text-muted-foreground">
                  Suppress non-critical notifications during specified hours
                </p>
              </div>
              <Switch
                checked={globalSettings.quiet_hours_enabled}
                onCheckedChange={(checked) => setGlobalSettings(prev => ({ ...prev, quiet_hours_enabled: checked }))}
              />
            </div>

            {globalSettings.quiet_hours_enabled && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start Time</Label>
                  <Input
                    type="time"
                    value={globalSettings.quiet_hours_start}
                    onChange={(e) => setGlobalSettings(prev => ({ ...prev, quiet_hours_start: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>End Time</Label>
                  <Input
                    type="time"
                    value={globalSettings.quiet_hours_end}
                    onChange={(e) => setGlobalSettings(prev => ({ ...prev, quiet_hours_end: e.target.value }))}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="flex justify-end pt-4">
            <Button onClick={saveGlobalSettings} disabled={saving}>
              {saving ? "Saving..." : "Save Settings"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Notification Rules */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Rules
          </CardTitle>
          <CardDescription>
            Configure specific notification rules for different events
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {rules.map((rule) => (
              <div key={rule.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-medium">
                        {eventTypes.find(et => et.value === rule.event_type)?.label || rule.event_type}
                      </h4>
                      <Switch
                        checked={rule.enabled}
                        onCheckedChange={() => toggleRule(rule.id)}
                      />
                    </div>
                    
                    <div className="space-y-2 text-sm text-muted-foreground">
                      <div>
                        <span className="font-medium">Channels: </span>
                        {rule.channels.map(channel => 
                          channels.find(c => c.value === channel)?.label
                        ).join(', ')}
                      </div>
                      <div>
                        <span className="font-medium">Recipients: </span>
                        {rule.recipients.join(', ')}
                      </div>
                      {rule.condition && (
                        <div>
                          <span className="font-medium">Condition: </span>
                          {rule.condition}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <Button variant="ghost" size="sm">
                    <Settings className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-center pt-4">
            <Button variant="outline">
              <Bell className="h-4 w-4 mr-2" />
              Add Notification Rule
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default NotificationSettings;
