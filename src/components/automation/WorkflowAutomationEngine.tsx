import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Play, 
  Square, 
  Settings, 
  Plus, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Workflow,
  User,
  FileText,
  Mail
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  trigger_type: 'manual' | 'scheduled' | 'event';
  steps: WorkflowStep[];
  is_active: boolean;
  created_at: string;
}

interface WorkflowStep {
  id: string;
  step_name: string;
  step_type: 'approval' | 'notification' | 'task' | 'escalation';
  assigned_role?: string;
  due_hours?: number;
  conditions?: Record<string, any>;
}

interface WorkflowExecution {
  id: string;
  workflow_id: string;
  status: 'running' | 'completed' | 'failed' | 'paused';
  current_step: number;
  started_at: string;
  completed_at?: string;
  context: Record<string, any>;
}

const WorkflowAutomationEngine: React.FC = () => {
  const [workflows, setWorkflows] = useState<WorkflowTemplate[]>([]);
  const [executions, setExecutions] = useState<WorkflowExecution[]>([]);
  const [selectedWorkflow, setSelectedWorkflow] = useState<WorkflowTemplate | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadWorkflows();
    loadExecutions();
  }, []);

  const loadWorkflows = async () => {
    try {
      const { data, error } = await supabase
        .from('workflow_templates')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setWorkflows(data || []);
    } catch (error) {
      console.error('Error loading workflows:', error);
      toast({
        title: "Error",
        description: "Failed to load workflows",
        variant: "destructive"
      });
    }
  };

  const loadExecutions = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('workflow_executions')
        .select('*')
        .order('started_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      setExecutions(data || []);
    } catch (error) {
      console.error('Error loading executions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const executeWorkflow = async (workflowId: string, context: Record<string, any> = {}) => {
    try {
      const { data, error } = await supabase.functions.invoke('workflow-executor', {
        body: {
          workflow_id: workflowId,
          context: {
            ...context,
            triggered_by: 'manual',
            triggered_at: new Date().toISOString()
          }
        }
      });

      if (error) throw error;

      toast({
        title: "Workflow Started",
        description: "The workflow has been successfully started"
      });

      loadExecutions();
    } catch (error) {
      console.error('Error executing workflow:', error);
      toast({
        title: "Error",
        description: "Failed to start workflow",
        variant: "destructive"
      });
    }
  };

  const pauseExecution = async (executionId: string) => {
    try {
      const { error } = await supabase
        .from('workflow_executions')
        .update({ status: 'paused' })
        .eq('id', executionId);

      if (error) throw error;

      toast({
        title: "Workflow Paused",
        description: "The workflow execution has been paused"
      });

      loadExecutions();
    } catch (error) {
      console.error('Error pausing workflow:', error);
      toast({
        title: "Error",
        description: "Failed to pause workflow",
        variant: "destructive"
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running': return <Play className="h-4 w-4" />;
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'failed': return <AlertCircle className="h-4 w-4" />;
      case 'paused': return <Square className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getStepIcon = (stepType: string) => {
    switch (stepType) {
      case 'approval': return <User className="h-4 w-4" />;
      case 'notification': return <Mail className="h-4 w-4" />;
      case 'task': return <FileText className="h-4 w-4" />;
      case 'escalation': return <AlertCircle className="h-4 w-4" />;
      default: return <Settings className="h-4 w-4" />;
    }
  };

  const createWorkflowTemplate = async (template: Partial<WorkflowTemplate>) => {
    try {
      const { error } = await supabase
        .from('workflow_templates')
        .insert([{
          ...template,
          org_id: (await supabase.auth.getUser()).data.user?.id
        }]);

      if (error) throw error;

      toast({
        title: "Workflow Created",
        description: "New workflow template has been created"
      });

      setShowCreateDialog(false);
      loadWorkflows();
    } catch (error) {
      console.error('Error creating workflow:', error);
      toast({
        title: "Error",
        description: "Failed to create workflow",
        variant: "destructive"
      });
    }
  };

  const defaultWorkflowTemplates = [
    {
      name: "Incident Response Workflow",
      description: "Automated incident response and escalation process",
      trigger_type: "event",
      steps: [
        { step_name: "Immediate Assessment", step_type: "task", assigned_role: "analyst", due_hours: 1 },
        { step_name: "Management Notification", step_type: "notification", assigned_role: "manager" },
        { step_name: "Manager Approval", step_type: "approval", assigned_role: "manager", due_hours: 4 },
        { step_name: "Executive Escalation", step_type: "escalation", assigned_role: "executive", due_hours: 8 }
      ]
    },
    {
      name: "Policy Review Workflow",
      description: "Automated policy review and approval process",
      trigger_type: "scheduled",
      steps: [
        { step_name: "Policy Review", step_type: "task", assigned_role: "compliance", due_hours: 72 },
        { step_name: "Stakeholder Review", step_type: "approval", assigned_role: "stakeholder", due_hours: 120 },
        { step_name: "Final Approval", step_type: "approval", assigned_role: "executive", due_hours: 168 }
      ]
    },
    {
      name: "KRI Breach Response",
      description: "Automated response to KRI threshold breaches",
      trigger_type: "event",
      steps: [
        { step_name: "Breach Assessment", step_type: "task", assigned_role: "risk_officer", due_hours: 2 },
        { step_name: "Risk Committee Notification", step_type: "notification", assigned_role: "risk_committee" },
        { step_name: "Mitigation Plan", step_type: "task", assigned_role: "risk_officer", due_hours: 24 },
        { step_name: "Board Notification", step_type: "escalation", assigned_role: "board", due_hours: 48 }
      ]
    }
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Workflow Automation</h1>
          <p className="text-muted-foreground">
            Automate and orchestrate business processes across your organization
          </p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Workflow
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Workflow</DialogTitle>
              <DialogDescription>
                Design a new automated workflow template
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <Input placeholder="Workflow Name" />
              <Textarea placeholder="Workflow Description" />
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Trigger Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="manual">Manual</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="event">Event-based</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={() => setShowCreateDialog(false)}>
                  Create Workflow
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Workflow Templates */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Workflow className="h-5 w-5" />
            Workflow Templates
          </CardTitle>
          <CardDescription>
            Pre-configured workflow templates for common business processes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {defaultWorkflowTemplates.map((template, index) => (
              <Card key={index} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">{template.name}</CardTitle>
                  <CardDescription className="text-sm">
                    {template.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{template.trigger_type}</Badge>
                    <Badge variant="secondary">{template.steps.length} steps</Badge>
                  </div>
                  
                  <div className="space-y-2">
                    {template.steps.map((step, stepIndex) => (
                      <div key={stepIndex} className="flex items-center gap-2 text-sm">
                        {getStepIcon(step.step_type)}
                        <span>{step.step_name}</span>
                        {step.due_hours && (
                          <Badge variant="outline" className="text-xs">
                            {step.due_hours}h
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button 
                      size="sm" 
                      onClick={() => executeWorkflow(`template-${index}`, { template_name: template.name })}
                    >
                      <Play className="h-3 w-3 mr-1" />
                      Execute
                    </Button>
                    <Button size="sm" variant="outline">
                      <Settings className="h-3 w-3 mr-1" />
                      Configure
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Active Executions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="h-5 w-5" />
            Active Executions
          </CardTitle>
          <CardDescription>
            Currently running and recent workflow executions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex items-center justify-between p-4 border rounded-lg animate-pulse">
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-48"></div>
                    <div className="h-3 bg-gray-200 rounded w-32"></div>
                  </div>
                  <div className="h-6 bg-gray-200 rounded w-20"></div>
                </div>
              ))}
            </div>
          ) : executions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Workflow className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p>No workflow executions found.</p>
              <p className="text-sm">Start a workflow to see executions here.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {executions.map((execution) => (
                <div key={execution.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-full ${getStatusColor(execution.status)}`}>
                      {getStatusIcon(execution.status)}
                    </div>
                    <div>
                      <div className="font-medium">
                        {execution.context?.template_name || `Workflow ${execution.workflow_id}`}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Started {format(new Date(execution.started_at), 'MMM dd, HH:mm')}
                        {execution.completed_at && (
                          <> • Completed {format(new Date(execution.completed_at), 'MMM dd, HH:mm')}</>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Step {execution.current_step || 1} of 4
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(execution.status)}>
                      {execution.status}
                    </Badge>
                    {execution.status === 'running' && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => pauseExecution(execution.id)}
                      >
                        <Square className="h-3 w-3 mr-1" />
                        Pause
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default WorkflowAutomationEngine;