
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Play, 
  Calendar,
  Clock,
  Database,
  AlertCircle,
  CheckCircle
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { automatedReportingService, AutomatedReportingRule } from "@/services/regulatory-reporting/automated-reporting-service";
import { useToast } from "@/hooks/use-toast";

const AutomatedRuleManager: React.FC = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<AutomatedReportingRule | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: rules = [], isLoading } = useQuery({
    queryKey: ['automated-reporting-rules'],
    queryFn: () => automatedReportingService.getAutomatedRules('org-id'), // Replace with actual org ID
  });

  const createRuleMutation = useMutation({
    mutationFn: (ruleData: any) => automatedReportingService.createAutomatedRule(ruleData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['automated-reporting-rules'] });
      setIsCreateDialogOpen(false);
      toast({
        title: "Rule created",
        description: "Automated reporting rule has been created successfully.",
      });
    },
  });

  const executeRuleMutation = useMutation({
    mutationFn: (ruleId: string) => automatedReportingService.generateAutomatedReport(ruleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['automated-reporting-rules'] });
      toast({
        title: "Report generated",
        description: "Automated report has been generated successfully.",
      });
    },
  });

  const handleCreateRule = (formData: FormData) => {
    const ruleData = {
      org_id: 'org-id', // Replace with actual org ID
      rule_name: formData.get('rule_name') as string,
      report_template_id: formData.get('report_template_id') as string,
      trigger_type: formData.get('trigger_type') as any,
      trigger_config: {
        frequency: formData.get('frequency'),
        time_of_day: formData.get('time_of_day'),
      },
      data_sources: (formData.get('data_sources') as string).split(',').map(s => s.trim()),
      validation_rules: [],
      auto_submit: formData.get('auto_submit') === 'on',
      notification_config: {
        email_recipients: (formData.get('email_recipients') as string).split(',').map(s => s.trim()),
        notification_events: ['generation_complete', 'validation_failed'],
        template_overrides: {},
        escalation_rules: []
      },
      is_active: true,
      execution_history: []
    };

    createRuleMutation.mutate(ruleData);
  };

  const getTriggerTypeColor = (type: string) => {
    switch (type) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'event_driven': return 'bg-green-100 text-green-800';
      case 'data_threshold': return 'bg-yellow-100 text-yellow-800';
      case 'manual': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (rule: AutomatedReportingRule) => {
    if (!rule.is_active) return <AlertCircle className="h-4 w-4 text-gray-400" />;
    
    const lastExecution = rule.execution_history?.[0];
    if (!lastExecution) return <Clock className="h-4 w-4 text-yellow-500" />;
    
    return lastExecution.status === 'completed' 
      ? <CheckCircle className="h-4 w-4 text-green-500" />
      : <AlertCircle className="h-4 w-4 text-red-500" />;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Automated Rules</CardTitle>
          <CardDescription>Loading rules...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">Loading automated reporting rules...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Automated Reporting Rules</h2>
          <p className="text-muted-foreground">
            Configure and manage automated report generation rules
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Rule
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Automated Reporting Rule</DialogTitle>
              <DialogDescription>
                Configure a new rule for automated report generation and validation.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={(e) => {
              e.preventDefault();
              handleCreateRule(new FormData(e.currentTarget));
            }} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="rule_name">Rule Name</Label>
                  <Input
                    id="rule_name"
                    name="rule_name"
                    placeholder="Enter rule name"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="report_template_id">Report Template</Label>
                  <Select name="report_template_id" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select template" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="osfi_e21">OSFI E-21 Report</SelectItem>
                      <SelectItem value="basel_iii">Basel III Report</SelectItem>
                      <SelectItem value="quarterly">Quarterly Summary</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="trigger_type">Trigger Type</Label>
                  <Select name="trigger_type" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select trigger" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="scheduled">Scheduled</SelectItem>
                      <SelectItem value="event_driven">Event Driven</SelectItem>
                      <SelectItem value="data_threshold">Data Threshold</SelectItem>
                      <SelectItem value="manual">Manual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="frequency">Frequency</Label>
                  <Select name="frequency">
                    <SelectTrigger>
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="quarterly">Quarterly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="data_sources">Data Sources</Label>
                <Input
                  id="data_sources"
                  name="data_sources"
                  placeholder="Enter data sources (comma-separated)"
                  required
                />
              </div>

              <div>
                <Label htmlFor="email_recipients">Email Recipients</Label>
                <Input
                  id="email_recipients"
                  name="email_recipients"
                  placeholder="Enter email addresses (comma-separated)"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch id="auto_submit" name="auto_submit" />
                <Label htmlFor="auto_submit">Auto-submit when validation passes</Label>
              </div>

              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreateDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={createRuleMutation.isPending}>
                  {createRuleMutation.isPending ? "Creating..." : "Create Rule"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {rules.map((rule) => (
          <Card key={rule.id} className="relative">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  {getStatusIcon(rule)}
                  <div>
                    <CardTitle className="text-lg">{rule.rule_name}</CardTitle>
                    <CardDescription>
                      Template: {rule.report_template_id} • Last executed: {
                        rule.last_executed 
                          ? new Date(rule.last_executed).toLocaleDateString()
                          : 'Never'
                      }
                    </CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={getTriggerTypeColor(rule.trigger_type)}>
                    {rule.trigger_type.replace('_', ' ').toUpperCase()}
                  </Badge>
                  <Badge variant={rule.is_active ? "default" : "secondary"}>
                    {rule.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Data Sources:</span>
                    <p className="text-muted-foreground">
                      {rule.data_sources.join(', ')}
                    </p>
                  </div>
                  <div>
                    <span className="font-medium">Next Execution:</span>
                    <p className="text-muted-foreground">
                      {rule.next_execution 
                        ? new Date(rule.next_execution).toLocaleString()
                        : 'Not scheduled'
                      }
                    </p>
                  </div>
                  <div>
                    <span className="font-medium">Auto Submit:</span>
                    <p className="text-muted-foreground">
                      {rule.auto_submit ? 'Enabled' : 'Disabled'}
                    </p>
                  </div>
                </div>

                {rule.execution_history?.length > 0 && (
                  <div>
                    <span className="font-medium text-sm">Recent Executions:</span>
                    <div className="mt-2 space-y-1">
                      {rule.execution_history.slice(0, 3).map((execution) => (
                        <div key={execution.execution_id} className="flex items-center justify-between text-xs p-2 bg-gray-50 rounded">
                          <span>
                            {new Date(execution.started_at).toLocaleString()}
                          </span>
                          <Badge variant={
                            execution.status === 'completed' ? 'default' :
                            execution.status === 'failed' ? 'destructive' : 'secondary'
                          } className="text-xs">
                            {execution.status}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-2 pt-4">
                  <Button
                    size="sm"
                    onClick={() => executeRuleMutation.mutate(rule.id)}
                    disabled={executeRuleMutation.isPending}
                  >
                    <Play className="h-4 w-4 mr-1" />
                    Execute Now
                  </Button>
                  <Button size="sm" variant="outline">
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button size="sm" variant="outline">
                    <Calendar className="h-4 w-4 mr-1" />
                    Schedule
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {rules.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <Database className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No Automated Rules</h3>
            <p className="text-muted-foreground mb-4">
              Get started by creating your first automated reporting rule.
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Rule
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AutomatedRuleManager;
