
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Layout, Palette, Bell, BarChart, X, Plus } from "lucide-react";

interface DashboardPersonalizationProps {
  userRole: string;
  settings: any;
  onSettingsChange: (settings: any) => void;
  onClose: () => void;
}

const DashboardPersonalization: React.FC<DashboardPersonalizationProps> = ({
  userRole,
  settings,
  onSettingsChange,
  onClose
}) => {
  const [localSettings, setLocalSettings] = useState(settings);

  const availableWidgets = {
    executive: [
      { id: "exec-scorecard", name: "Executive Scorecard", category: "Analytics" },
      { id: "risk-heatmap", name: "Risk Heat Map", category: "Visualization" },
      { id: "predictive-insights", name: "AI Insights", category: "Analytics" },
      { id: "exec-summary", name: "Executive Summary", category: "Reports" }
    ],
    manager: [
      { id: "risk-register", name: "Risk Register", category: "Management" },
      { id: "pending-actions", name: "Action Items", category: "Tasks" },
      { id: "recent-activities", name: "Recent Activities", category: "Updates" },
      { id: "control-effectiveness", name: "Control Tests", category: "Controls" }
    ],
    analyst: [
      { id: "my-tasks", name: "My Tasks", category: "Personal" },
      { id: "recent-alerts", name: "Alerts", category: "Notifications" },
      { id: "quick-actions", name: "Quick Actions", category: "Tools" },
      { id: "personal-stats", name: "Performance", category: "Personal" }
    ],
    auditor: [
      { id: "active-audits", name: "Active Audits", category: "Audits" },
      { id: "compliance-status", name: "Compliance Status", category: "Compliance" },
      { id: "upcoming-deadlines", name: "Deadlines", category: "Schedule" },
      { id: "audit-trail", name: "Audit Trail", category: "Tracking" }
    ]
  };

  const chartTypes = [
    { value: "line", label: "Line Chart" },
    { value: "bar", label: "Bar Chart" },
    { value: "pie", label: "Pie Chart" },
    { value: "heatmap", label: "Heat Map" },
    { value: "gauge", label: "Gauge" }
  ];

  const refreshIntervals = [
    { value: 15000, label: "15 seconds" },
    { value: 30000, label: "30 seconds" },
    { value: 60000, label: "1 minute" },
    { value: 300000, label: "5 minutes" },
    { value: 900000, label: "15 minutes" }
  ];

  const roleWidgets = availableWidgets[userRole as keyof typeof availableWidgets] || [];

  const handleSave = () => {
    onSettingsChange(localSettings);
    onClose();
  };

  const updateSetting = (path: string, value: any) => {
    const pathArray = path.split('.');
    const newSettings = { ...localSettings };
    let current = newSettings;
    
    for (let i = 0; i < pathArray.length - 1; i++) {
      if (!current[pathArray[i]]) {
        current[pathArray[i]] = {};
      }
      current = current[pathArray[i]];
    }
    
    current[pathArray[pathArray.length - 1]] = value;
    setLocalSettings(newSettings);
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Layout className="h-5 w-5" />
              Dashboard Personalization
            </CardTitle>
            <CardDescription>
              Customize your dashboard layout, widgets, and preferences
            </CardDescription>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="layout" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="layout">Layout</TabsTrigger>
            <TabsTrigger value="widgets">Widgets</TabsTrigger>
            <TabsTrigger value="charts">Charts</TabsTrigger>
            <TabsTrigger value="notifications">Alerts</TabsTrigger>
          </TabsList>
          
          <TabsContent value="layout" className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Layout Preferences</h3>
              
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="theme">Theme</Label>
                  <Select
                    value={localSettings.preferences?.theme || "system"}
                    onValueChange={(value) => updateSetting("preferences.theme", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="dark">Dark</SelectItem>
                      <SelectItem value="system">System</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="layout-density">Layout Density</Label>
                  <Select
                    value={localSettings.layout || "default"}
                    onValueChange={(value) => updateSetting("layout", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="compact">Compact</SelectItem>
                      <SelectItem value="default">Default</SelectItem>
                      <SelectItem value="comfortable">Comfortable</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Dashboard Columns</Label>
                <Slider
                  value={[localSettings.columns || 3]}
                  onValueChange={([value]) => updateSetting("columns", value)}
                  max={4}
                  min={1}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>1 Column</span>
                  <span>4 Columns</span>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="widgets" className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Available Widgets</h3>
              <p className="text-sm text-muted-foreground">
                Select which widgets to display on your dashboard
              </p>
              
              <div className="grid gap-4 md:grid-cols-2">
                {roleWidgets.map((widget) => (
                  <div key={widget.id} className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <h4 className="font-medium">{widget.name}</h4>
                      <Badge variant="secondary" className="text-xs">
                        {widget.category}
                      </Badge>
                    </div>
                    <Switch
                      checked={localSettings.widgets?.includes(widget.id) || false}
                      onCheckedChange={(checked) => {
                        const currentWidgets = localSettings.widgets || [];
                        if (checked) {
                          updateSetting("widgets", [...currentWidgets, widget.id]);
                        } else {
                          updateSetting("widgets", currentWidgets.filter((w: string) => w !== widget.id));
                        }
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="charts" className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Chart Preferences</h3>
              
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Default Chart Type</Label>
                  <Select
                    value={localSettings.chartType || "line"}
                    onValueChange={(value) => updateSetting("chartType", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {chartTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Refresh Interval</Label>
                  <Select
                    value={String(localSettings.preferences?.refreshInterval || 30000)}
                    onValueChange={(value) => updateSetting("preferences.refreshInterval", Number(value))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {refreshIntervals.map((interval) => (
                        <SelectItem key={interval.value} value={String(interval.value)}>
                          {interval.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="animations"
                  checked={localSettings.preferences?.animations !== false}
                  onCheckedChange={(checked) => updateSetting("preferences.animations", checked)}
                />
                <Label htmlFor="animations">Enable animations</Label>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="notifications" className="space-y-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Notification Preferences</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="notifications">Enable notifications</Label>
                  <Switch
                    id="notifications"
                    checked={localSettings.preferences?.notifications !== false}
                    onCheckedChange={(checked) => updateSetting("preferences.notifications", checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="risk-alerts">Risk threshold alerts</Label>
                  <Switch
                    id="risk-alerts"
                    checked={localSettings.preferences?.riskAlerts !== false}
                    onCheckedChange={(checked) => updateSetting("preferences.riskAlerts", checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="task-reminders">Task reminders</Label>
                  <Switch
                    id="task-reminders"
                    checked={localSettings.preferences?.taskReminders !== false}
                    onCheckedChange={(checked) => updateSetting("preferences.taskReminders", checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label htmlFor="audit-updates">Audit updates</Label>
                  <Switch
                    id="audit-updates"
                    checked={localSettings.preferences?.auditUpdates !== false}
                    onCheckedChange={(checked) => updateSetting("preferences.auditUpdates", checked)}
                  />
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        <div className="flex justify-end gap-2 mt-6 pt-6 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Changes
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default DashboardPersonalization;
