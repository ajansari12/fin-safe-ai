
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Clock, Bell, Globe } from "lucide-react";
import {
  getOrganizationSettings,
  updateOrganizationSetting,
  type OrganizationSetting
} from "@/services/admin-service";

const OrganizationSettings: React.FC = () => {
  const [settings, setSettings] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const data = await getOrganizationSettings();
      const settingsMap = data.reduce((acc, setting) => {
        acc[setting.setting_key] = setting.setting_value;
        return acc;
      }, {} as Record<string, any>);
      setSettings(settingsMap);
    } catch (error) {
      console.error("Failed to load settings:", error);
      toast({
        title: "Error",
        description: "Failed to load organization settings",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSetting = async (key: string, value: any, description?: string) => {
    setSaving(true);
    try {
      await updateOrganizationSetting(key, value, description);
      setSettings(prev => ({ ...prev, [key]: value }));
      toast({
        title: "Setting Updated",
        description: "Organization setting has been updated successfully",
      });
    } catch (error) {
      console.error("Failed to update setting:", error);
      toast({
        title: "Error",
        description: "Failed to update setting",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div>Loading settings...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Timezone Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Timezone & Localization
          </CardTitle>
          <CardDescription>
            Configure timezone and regional settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="timezone">Organization Timezone</Label>
            <Select
              value={settings.timezone || "UTC"}
              onValueChange={(value) => handleUpdateSetting("timezone", value, "Organization timezone")}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="UTC">UTC</SelectItem>
                <SelectItem value="America/New_York">Eastern Time</SelectItem>
                <SelectItem value="America/Chicago">Central Time</SelectItem>
                <SelectItem value="America/Denver">Mountain Time</SelectItem>
                <SelectItem value="America/Los_Angeles">Pacific Time</SelectItem>
                <SelectItem value="Europe/London">London</SelectItem>
                <SelectItem value="Europe/Paris">Paris</SelectItem>
                <SelectItem value="Asia/Tokyo">Tokyo</SelectItem>
                <SelectItem value="Asia/Singapore">Singapore</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="date-format">Date Format</Label>
            <Select
              value={settings.date_format || "MM/DD/YYYY"}
              onValueChange={(value) => handleUpdateSetting("date_format", value, "Date display format")}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Report Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Report Frequency
          </CardTitle>
          <CardDescription>
            Configure automated report generation schedules
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="incident-reports">Incident Summary Reports</Label>
            <Select
              value={settings.incident_report_frequency || "weekly"}
              onValueChange={(value) => handleUpdateSetting("incident_report_frequency", value, "Incident report generation frequency")}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="quarterly">Quarterly</SelectItem>
                <SelectItem value="disabled">Disabled</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="risk-reports">Risk Dashboard Reports</Label>
            <Select
              value={settings.risk_report_frequency || "monthly"}
              onValueChange={(value) => handleUpdateSetting("risk_report_frequency", value, "Risk report generation frequency")}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="quarterly">Quarterly</SelectItem>
                <SelectItem value="disabled">Disabled</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="compliance-reports">Compliance Reports</Label>
            <Select
              value={settings.compliance_report_frequency || "quarterly"}
              onValueChange={(value) => handleUpdateSetting("compliance_report_frequency", value, "Compliance report generation frequency")}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="quarterly">Quarterly</SelectItem>
                <SelectItem value="annually">Annually</SelectItem>
                <SelectItem value="disabled">Disabled</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Alert Thresholds */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Alert Thresholds
          </CardTitle>
          <CardDescription>
            Configure system alert thresholds and notification settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="incident-sla-threshold">Incident SLA Breach Threshold (hours)</Label>
            <Input
              id="incident-sla-threshold"
              type="number"
              value={settings.incident_sla_threshold || 24}
              onChange={(e) => handleUpdateSetting("incident_sla_threshold", parseInt(e.target.value), "Hours before SLA breach alert")}
            />
          </div>
          <div>
            <Label htmlFor="kri-breach-threshold">KRI Breach Alert Threshold (%)</Label>
            <Input
              id="kri-breach-threshold"
              type="number"
              value={settings.kri_breach_threshold || 80}
              onChange={(e) => handleUpdateSetting("kri_breach_threshold", parseInt(e.target.value), "Percentage threshold for KRI breach alerts")}
            />
          </div>
          <div>
            <Label htmlFor="vendor-review-threshold">Vendor Review Due Threshold (days)</Label>
            <Input
              id="vendor-review-threshold"
              type="number"
              value={settings.vendor_review_threshold || 30}
              onChange={(e) => handleUpdateSetting("vendor_review_threshold", parseInt(e.target.value), "Days before vendor review due alert")}
            />
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="email-notifications"
              checked={settings.email_notifications !== false}
              onCheckedChange={(checked) => handleUpdateSetting("email_notifications", checked, "Enable email notifications")}
            />
            <Label htmlFor="email-notifications">Enable Email Notifications</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="slack-notifications"
              checked={settings.slack_notifications === true}
              onCheckedChange={(checked) => handleUpdateSetting("slack_notifications", checked, "Enable Slack notifications")}
            />
            <Label htmlFor="slack-notifications">Enable Slack Notifications</Label>
          </div>
        </CardContent>
      </Card>

      {/* System Settings */}
      <Card>
        <CardHeader>
          <CardTitle>System Settings</CardTitle>
          <CardDescription>
            Configure general system behavior
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="session-timeout">Session Timeout (minutes)</Label>
            <Input
              id="session-timeout"
              type="number"
              value={settings.session_timeout || 480}
              onChange={(e) => handleUpdateSetting("session_timeout", parseInt(e.target.value), "Session timeout in minutes")}
            />
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="auto-save"
              checked={settings.auto_save !== false}
              onCheckedChange={(checked) => handleUpdateSetting("auto_save", checked, "Enable auto-save feature")}
            />
            <Label htmlFor="auto-save">Enable Auto-Save</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              id="audit-logging"
              checked={settings.audit_logging !== false}
              onCheckedChange={(checked) => handleUpdateSetting("audit_logging", checked, "Enable detailed audit logging")}
            />
            <Label htmlFor="audit-logging">Enable Audit Logging</Label>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OrganizationSettings;
