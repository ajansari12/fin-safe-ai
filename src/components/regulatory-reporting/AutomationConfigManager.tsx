import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { 
  Plus, 
  Settings, 
  PlayCircle, 
  PauseCircle, 
  Edit, 
  Trash2, 
  Bot,
  Calendar,
  Database,
  FileCheck,
  Send
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { automatedRegulatoryReportingService, AutomatedReportConfig } from '@/services/automated-regulatory-reporting-service';
import { reportingService } from '@/services/regulatory-reporting/reporting-service';

const AutomationConfigManager: React.FC = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingConfig, setEditingConfig] = useState<AutomatedReportConfig | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: configs = [], isLoading } = useQuery({
    queryKey: ['automation-configs'],
    queryFn: () => automatedRegulatoryReportingService.getAutomatedReportConfigs(),
  });

  const { data: templates = [] } = useQuery({
    queryKey: ['report-templates'],
    queryFn: () => reportingService.getReportTemplates(),
  });

  const createConfigMutation = useMutation({
    mutationFn: (configData: Partial<AutomatedReportConfig>) => 
      automatedRegulatoryReportingService.createAutomatedReportConfig(configData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['automation-configs'] });
      setIsCreateDialogOpen(false);
      toast({
        title: "Configuration created",
        description: "Automated report configuration has been created successfully.",
      });
    },
  });

  const updateConfigMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<AutomatedReportConfig> }) =>
      automatedRegulatoryReportingService.updateAutomatedReportConfig(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['automation-configs'] });
      setEditingConfig(null);
      toast({
        title: "Configuration updated",
        description: "Automated report configuration has been updated successfully.",
      });
    },
  });

  const runAutomationMutation = useMutation({
    mutationFn: (configId: string) => 
      automatedRegulatoryReportingService.generateAutomatedReport(configId),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['automation-configs'] });
      toast({
        title: result.status === 'success' ? "Automation completed" : "Automation completed with issues",
        description: result.status === 'success' 
          ? "Report has been generated successfully."
          : `Report generated with ${result.warnings.length} warnings and ${result.errors.length} errors.`,
      });
    },
  });

  const handleCreateConfig = (formData: FormData) => {
    const configData = {
      templateId: formData.get('templateId') as string,
      reportName: formData.get('reportName') as string,
      frequency: formData.get('frequency') as 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annually',
      autoGenerate: formData.get('autoGenerate') === 'on',
      autoValidate: formData.get('autoValidate') === 'on',
      autoSubmit: formData.get('autoSubmit') === 'on',
      dataSourcesMapping: [],
      validationRules: [],
      submissionConfig: {
        enabled: false,
        targetSystem: 'osfi_portal' as const,
        credentials: {},
        submissionFormat: 'xml' as const,
        retryPolicy: {
          maxRetries: 3,
          retryIntervalMinutes: 15,
          backoffStrategy: 'exponential' as const,
        },
        confirmationRequired: true,
      },
      notificationSettings: {
        onSuccess: true,
        onError: true,
        onValidationFailure: true,
        recipients: [],
        channels: ['email' as const],
        template: 'default',
      },
      status: 'active' as const,
    };

    createConfigMutation.mutate(configData);
  };

  const handleToggleStatus = (config: AutomatedReportConfig) => {
    const newStatus = config.status === 'active' ? 'inactive' : 'active';
    updateConfigMutation.mutate({
      id: config.id,
      updates: { status: newStatus },
    });
  };

  const handleRunAutomation = (configId: string) => {
    runAutomationMutation.mutate(configId);
  };

  if (isLoading) {
    return <div>Loading automation configurations...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Automation Configurations</h2>
          <p className="text-muted-foreground">
            Manage automated report generation configurations
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Configuration
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Automation Configuration</DialogTitle>
              <DialogDescription>
                Set up a new automated report generation configuration.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={(e) => { e.preventDefault(); handleCreateConfig(new FormData(e.currentTarget)); }} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="reportName">Report Name</Label>
                  <Input
                    id="reportName"
                    name="reportName"
                    placeholder="Monthly OSFI Report"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="templateId">Report Template</Label>
                  <Select name="templateId" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select template" />
                    </SelectTrigger>
                    <SelectContent>
                      {templates.map((template) => (
                        <SelectItem key={template.id} value={template.id}>
                          {template.template_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="frequency">Generation Frequency</Label>
                <Select name="frequency" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select frequency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                    <SelectItem value="quarterly">Quarterly</SelectItem>
                    <SelectItem value="annually">Annually</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">Automation Settings</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div className="flex items-center space-x-2">
                    <Switch id="autoGenerate" name="autoGenerate" defaultChecked />
                    <Label htmlFor="autoGenerate">Auto Generate</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="autoValidate" name="autoValidate" defaultChecked />
                    <Label htmlFor="autoValidate">Auto Validate</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="autoSubmit" name="autoSubmit" />
                    <Label htmlFor="autoSubmit">Auto Submit</Label>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsCreateDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">Create Configuration</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {configs.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <Bot className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">No Automation Configurations</h3>
            <p className="text-muted-foreground mb-4">
              Create your first automated report configuration to get started.
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Configuration
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {configs.map((config) => (
            <Card key={config.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Bot className="h-5 w-5 text-primary" />
                    <div>
                      <CardTitle className="text-lg">{config.reportName}</CardTitle>
                      <CardDescription>
                        {config.frequency} • Template: {templates.find(t => t.id === config.templateId)?.template_name || 'Unknown'}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={
                      config.status === 'active' ? 'default' :
                      config.status === 'inactive' ? 'secondary' : 'destructive'
                    }>
                      {config.status}
                    </Badge>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleToggleStatus(config)}
                    >
                      {config.status === 'active' ? (
                        <PauseCircle className="h-4 w-4" />
                      ) : (
                        <PlayCircle className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleRunAutomation(config.id)}
                      disabled={runAutomationMutation.isPending}
                    >
                      <PlayCircle className="h-4 w-4 mr-1" />
                      Run Now
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Frequency</p>
                      <p className="text-xs text-muted-foreground">{config.frequency}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Database className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Data Sources</p>
                      <p className="text-xs text-muted-foreground">{config.dataSourcesMapping.length} configured</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <FileCheck className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Validation</p>
                      <p className="text-xs text-muted-foreground">
                        {config.autoValidate ? 'Enabled' : 'Disabled'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Send className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Submission</p>
                      <p className="text-xs text-muted-foreground">
                        {config.autoSubmit ? 'Enabled' : 'Disabled'}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t">
                  <div className="flex items-center justify-between text-sm">
                    <div>
                      <span className="text-muted-foreground">Last Execution: </span>
                      <span>{config.lastExecution ? new Date(config.lastExecution).toLocaleString() : 'Never'}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Next Execution: </span>
                      <span>{config.nextExecution ? new Date(config.nextExecution).toLocaleString() : 'Not scheduled'}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AutomationConfigManager;