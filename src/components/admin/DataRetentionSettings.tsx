
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { dataRetentionService } from "@/services/admin/data-retention-service";
import { ModuleSetting } from "@/services/admin/module-settings-service";

const DataRetentionSettings: React.FC = () => {
  const [retentionSettings, setRetentionSettings] = useState<ModuleSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedModule, setSelectedModule] = useState<string>('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const dataModules = [
    { key: 'incident_logs', name: 'Incident Logs', description: 'Incident reports and responses' },
    { key: 'audit_trails', name: 'Audit Trails', description: 'System audit and activity logs' },
    { key: 'kri_logs', name: 'KRI Measurements', description: 'Key risk indicator measurements' },
    { key: 'control_tests', name: 'Control Tests', description: 'Control effectiveness test results' },
    { key: 'scenario_tests', name: 'Scenario Tests', description: 'Business continuity test results' },
    { key: 'admin_logs', name: 'Admin Logs', description: 'Administrative action logs' },
    { key: 'ai_chat_logs', name: 'AI Chat Logs', description: 'AI assistant conversation logs' },
    { key: 'governance_change_logs', name: 'Governance Changes', description: 'Policy and framework change logs' }
  ];

  useEffect(() => {
    loadRetentionSettings();
  }, []);

  const loadRetentionSettings = async () => {
    try {
      setLoading(true);
      const data = await dataRetentionService.getDataRetentionSettings();
      setRetentionSettings(data);
    } catch (error) {
      console.error('Error loading retention settings:', error);
      toast({ title: "Error", description: "Failed to load retention settings", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRetention = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      const formData = new FormData(event.currentTarget);
      const retentionDays = parseInt(formData.get('retention_days') as string);
      const autoDelete = formData.get('auto_delete') === 'on';

      await dataRetentionService.updateDataRetentionSetting(
        selectedModule,
        retentionDays,
        autoDelete
      );

      toast({ title: "Success", description: "Data retention policy updated" });
      setIsDialogOpen(false);
      loadRetentionSettings();
    } catch (error) {
      console.error('Error updating retention setting:', error);
      toast({ title: "Error", description: "Failed to update retention policy", variant: "destructive" });
    }
  };

  const getRetentionSetting = (moduleKey: string) => {
    return retentionSettings.find(s => s.module_key === `${moduleKey}_retention`);
  };

  if (loading) {
    return <div className="animate-pulse">Loading retention settings...</div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Data Retention Settings</CardTitle>
        <CardDescription>
          Configure data retention policies for each module to comply with regulatory requirements
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Module</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Retention Period</TableHead>
              <TableHead>Auto Delete</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {dataModules.map((module) => {
              // For now, we'll use placeholder values since the data structure needs to be aligned
              const retentionDays = 365; // Default value
              const autoDelete = false; // Default value

              return (
                <TableRow key={module.key}>
                  <TableCell className="font-medium">{module.name}</TableCell>
                  <TableCell>{module.description}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{retentionDays} days</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={autoDelete ? "destructive" : "secondary"}>
                      {autoDelete ? "Enabled" : "Disabled"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Dialog open={isDialogOpen && selectedModule === module.key} onOpenChange={setIsDialogOpen}>
                      <DialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedModule(module.key)}
                        >
                          <Settings className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <form onSubmit={handleUpdateRetention}>
                          <DialogHeader>
                            <DialogTitle>Configure Data Retention</DialogTitle>
                            <DialogDescription>
                              Set retention policy for {module.name}
                            </DialogDescription>
                          </DialogHeader>
                          <div className="grid gap-4 py-4">
                            <div className="grid gap-2">
                              <Label htmlFor="retention_days">Retention Period (Days)</Label>
                              <Input
                                id="retention_days"
                                name="retention_days"
                                type="number"
                                min="1"
                                max="3650"
                                defaultValue={retentionDays || 365}
                                required
                              />
                              <p className="text-xs text-muted-foreground">
                                Data older than this period will be eligible for deletion
                              </p>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Switch
                                id="auto_delete"
                                name="auto_delete"
                                defaultChecked={autoDelete || false}
                              />
                              <Label htmlFor="auto_delete" className="text-sm">
                                Enable automatic deletion
                              </Label>
                            </div>
                            <p className="text-xs text-muted-foreground">
                              When enabled, data will be automatically deleted after the retention period.
                              When disabled, data will be marked for deletion but require manual confirmation.
                            </p>
                          </div>
                          <DialogFooter>
                            <Button type="submit">Save Policy</Button>
                          </DialogFooter>
                        </form>
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default DataRetentionSettings;
