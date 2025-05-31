
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { moduleSettingsService, ModuleSetting } from "@/services/admin/module-settings-service";

const ModuleToggleManager: React.FC = () => {
  const [moduleSettings, setModuleSettings] = useState<ModuleSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadModuleSettings();
  }, []);

  const loadModuleSettings = async () => {
    try {
      setLoading(true);
      const data = await moduleSettingsService.getModuleSettings();
      setModuleSettings(data);
    } catch (error) {
      console.error('Error loading module settings:', error);
      toast({ title: "Error", description: "Failed to load module settings", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleModuleToggle = async (moduleKey: string, enabled: boolean) => {
    try {
      await moduleSettingsService.updateModuleSetting(moduleKey, enabled);
      toast({ 
        title: "Success", 
        description: `Module ${moduleKey} ${enabled ? 'enabled' : 'disabled'}` 
      });
      loadModuleSettings();
    } catch (error) {
      console.error('Error updating module setting:', error);
      toast({ title: "Error", description: "Failed to update module setting", variant: "destructive" });
    }
  };

  const isModuleEnabled = (moduleKey: string): boolean => {
    const setting = moduleSettings.find(s => s.setting_key === moduleKey);
    return setting?.setting_value?.enabled || false;
  };

  const availableModules = moduleSettingsService.getAvailableModules();

  if (loading) {
    return <div className="animate-pulse">Loading module settings...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Module Management</CardTitle>
        <CardDescription>
          Enable or disable modules for your organization. Disabled modules will not be accessible to users.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {availableModules.map((module) => {
            const enabled = isModuleEnabled(module.key);
            return (
              <div key={module.key} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Label htmlFor={module.key} className="text-base font-medium">
                      {module.name}
                    </Label>
                    <Badge variant={enabled ? "default" : "secondary"}>
                      {enabled ? "Enabled" : "Disabled"}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{module.description}</p>
                </div>
                <Switch
                  id={module.key}
                  checked={enabled}
                  onCheckedChange={(checked) => handleModuleToggle(module.key, checked)}
                />
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default ModuleToggleManager;
