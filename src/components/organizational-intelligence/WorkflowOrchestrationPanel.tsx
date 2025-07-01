
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Play, 
  Pause, 
  Square, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Settings,
  Plus,
  Workflow
} from 'lucide-react';
import { workflowOrchestrationService, type WorkflowDefinition, type WorkflowInstance } from '@/services/workflow-orchestration-service';
import { toast } from 'sonner';

interface WorkflowOrchestrationPanelProps {
  orgId: string;
}

const WorkflowOrchestrationPanel: React.FC<WorkflowOrchestrationPanelProps> = ({ orgId }) => {
  const [workflows, setWorkflows] = useState<WorkflowDefinition[]>([]);
  const [instances, setInstances] = useState<WorkflowInstance[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedWorkflow, setSelectedWorkflow] = useState<WorkflowDefinition | null>(null);

  useEffect(() => {
    loadWorkflows();
  }, [orgId]);

  const loadWorkflows = async () => {
    try {
      setLoading(true);
      
      // Create default workflows for demonstration
      const assessmentWorkflow = await workflowOrchestrationService.createOrganizationalAssessmentWorkflow(orgId);
      const riskWorkflow = await workflowOrchestrationService.createRiskMonitoringWorkflow(orgId);
      const maturityWorkflow = await workflowOrchestrationService.createMaturityEnhancementWorkflow(orgId, 'Risk Management');
      
      setWorkflows([assessmentWorkflow, riskWorkflow, maturityWorkflow]);
      
      // Mock instances for demonstration
      setInstances([
        {
          id: 'instance-1',
          workflow_id: assessmentWorkflow.id,
          org_id: orgId,
          status: 'completed',
          current_step: 'notify-stakeholders',
          context: { completion_percentage: 100 },
          created_at: new Date(Date.now() - 86400000).toISOString(),
          updated_at: new Date().toISOString(),
          completed_at: new Date().toISOString()
        },
        {
          id: 'instance-2',
          workflow_id: riskWorkflow.id,
          org_id: orgId,
          status: 'active',
          current_step: 'calculate-risk-scores',
          context: { completion_percentage: 60 },
          created_at: new Date(Date.now() - 3600000).toISOString(),
          updated_at: new Date().toISOString()
        }
      ]);
      
    } catch (error) {
      console.error('Error loading workflows:', error);
      toast.error('Failed to load workflows');
    } finally {
      setLoading(false);
    }
  };

  const executeWorkflow = async (workflowId: string) => {
    try {
      setLoading(true);
      
      const instance = await workflowOrchestrationService.executeWorkflow(workflowId, { org_id: orgId });
      
      setInstances(prev => [...prev, instance]);
      toast.success('Workflow execution started');
      
    } catch (error) {
      console.error('Error executing workflow:', error);
      toast.error('Failed to execute workflow');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'active': return <Play className="h-4 w-4 text-blue-500" />;
      case 'paused': return <Pause className="h-4 w-4 text-yellow-500" />;
      case 'failed': return <AlertCircle className="h-4 w-4 text-red-500" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'success';
      case 'active': return 'default';
      case 'paused': return 'secondary';
      case 'failed': return 'destructive';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Workflow Orchestration</h2>
          <p className="text-muted-foreground">
            Automated workflow management and orchestration
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            New Workflow
          </Button>
        </div>
      </div>

      <Tabs defaultValue="workflows" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="workflows">Workflows</TabsTrigger>
          <TabsTrigger value="instances">Active Instances</TabsTrigger>
          <TabsTrigger value="automation">Automation Rules</TabsTrigger>
        </TabsList>

        <TabsContent value="workflows" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {workflows.map((workflow) => (
              <Card key={workflow.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{workflow.name}</CardTitle>
                    <Badge variant={workflow.is_active ? 'default' : 'secondary'}>
                      {workflow.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{workflow.description}</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span>Steps:</span>
                      <span className="font-medium">{workflow.steps.length}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Trigger:</span>
                      <Badge variant="outline" className="text-xs">
                        {workflow.trigger_type.replace('_', ' ')}
                      </Badge>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        onClick={() => executeWorkflow(workflow.id)}
                        disabled={loading}
                        className="flex-1"
                      >
                        <Play className="h-4 w-4 mr-2" />
                        Execute
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => setSelectedWorkflow(workflow)}
                      >
                        <Workflow className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="instances" className="space-y-4">
          <div className="space-y-4">
            {instances.map((instance) => {
              const workflow = workflows.find(w => w.id === instance.workflow_id);
              const progress = instance.context.completion_percentage || 0;
              
              return (
                <Card key={instance.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base">
                        {workflow?.name || 'Unknown Workflow'}
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(instance.status)}
                        <Badge variant={getStatusColor(instance.status) as any}>
                          {instance.status}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div>
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span>Progress</span>
                          <span>{progress}%</span>
                        </div>
                        <Progress value={progress} className="h-2" />
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Current Step:</span>
                          <p className="font-medium">{instance.current_step.replace('-', ' ')}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Started:</span>
                          <p className="font-medium">
                            {new Date(instance.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" disabled={instance.status !== 'active'}>
                          <Pause className="h-4 w-4 mr-2" />
                          Pause
                        </Button>
                        <Button size="sm" variant="outline" disabled={instance.status !== 'active'}>
                          <Square className="h-4 w-4 mr-2" />
                          Stop
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="automation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Automation Rules</CardTitle>
              <p className="text-sm text-muted-foreground">
                Configure automated triggers and actions for workflows
              </p>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Settings className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">Automation Rules</h3>
                <p className="text-muted-foreground mb-4">
                  Set up automated triggers and actions for your workflows
                </p>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Automation Rule
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default WorkflowOrchestrationPanel;
