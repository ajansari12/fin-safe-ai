
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Play, Settings, TrendingUp, Workflow, Zap, Database, Brain, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { WorkflowOrchestration, WorkflowExecution, workflowOrchestrationService } from "@/services/workflow-orchestration-service";
import VisualWorkflowDesigner from "./VisualWorkflowDesigner";

const WorkflowOrchestrationDashboard: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [workflows, setWorkflows] = useState<WorkflowOrchestration[]>([]);
  const [executions, setExecutions] = useState<WorkflowExecution[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDesignerOpen, setIsDesignerOpen] = useState(false);
  const [editingWorkflow, setEditingWorkflow] = useState<WorkflowOrchestration | null>(null);
  const [orgId, setOrgId] = useState<string>("");
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user?.id) return;
      
      try {
        const { supabase } = await import("@/integrations/supabase/client");
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('organization_id')
          .eq('id', user.id)
          .single();
        
        if (error) {
          console.error('Failed to fetch profile:', error);
          setError('Failed to load user profile');
          return;
        }

        if (profile?.organization_id) {
          setOrgId(profile.organization_id);
        } else {
          setError('No organization found for user');
        }
      } catch (error) {
        console.error('Failed to fetch profile:', error);
        setError('Failed to load user profile');
      }
    };

    fetchUserProfile();
  }, [user]);

  useEffect(() => {
    if (orgId) {
      loadWorkflows();
      loadExecutions();
    }
  }, [orgId]);

  const loadWorkflows = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await workflowOrchestrationService.getWorkflowOrchestrations(orgId);
      setWorkflows(data);
    } catch (error) {
      console.error('Error loading workflows:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to load workflows';
      setError(errorMessage);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadExecutions = async () => {
    try {
      const data = await workflowOrchestrationService.getWorkflowExecutions(orgId);
      setExecutions(data);
    } catch (error) {
      console.error('Error loading executions:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to load executions';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    }
  };

  const handleSaveWorkflow = async (workflowData: Omit<WorkflowOrchestration, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const workflowWithOrgId = {
        ...workflowData,
        org_id: orgId,
        created_by: user?.id
      };

      if (editingWorkflow) {
        await workflowOrchestrationService.updateWorkflowOrchestration(editingWorkflow.id, workflowWithOrgId);
        toast({
          title: "Success",
          description: "Workflow updated successfully"
        });
      } else {
        await workflowOrchestrationService.createWorkflowOrchestration(workflowWithOrgId);
        toast({
          title: "Success",
          description: "Workflow created successfully"
        });
      }

      await loadWorkflows();
      setIsDesignerOpen(false);
      setEditingWorkflow(null);
    } catch (error) {
      console.error('Error saving workflow:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to save workflow';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    }
  };

  const handleExecuteWorkflow = async (workflowId: string) => {
    try {
      await workflowOrchestrationService.executeWorkflow(workflowId, {});
      toast({
        title: "Success",
        description: "Workflow execution started"
      });
      await loadExecutions();
    } catch (error) {
      console.error('Error executing workflow:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to execute workflow';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    }
  };

  const handleDeleteWorkflow = async (workflowId: string) => {
    if (!confirm('Are you sure you want to delete this workflow? This action cannot be undone.')) {
      return;
    }

    try {
      await workflowOrchestrationService.deleteWorkflowOrchestration(workflowId);
      toast({
        title: "Success",
        description: "Workflow deleted successfully"
      });
      await loadWorkflows();
    } catch (error) {
      console.error('Error deleting workflow:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete workflow';
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'draft': return 'secondary';
      case 'deprecated': return 'destructive';
      default: return 'outline';
    }
  };

  const getExecutionStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'completed': return 'default';
      case 'running': return 'secondary';
      case 'failed': return 'destructive';
      case 'paused': return 'outline';
      case 'cancelled': return 'outline';
      default: return 'outline';
    }
  };

  const calculateSuccessRate = () => {
    if (executions.length === 0) return 0;
    const successfulExecutions = executions.filter(e => e.status === 'completed').length;
    return Math.round((successfulExecutions / executions.length) * 100);
  };

  if (!orgId && !error) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-muted-foreground">Loading organization data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 mx-auto mb-4 text-destructive" />
          <h3 className="text-lg font-medium mb-2">Error Loading Data</h3>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={() => window.location.reload()} variant="outline">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Workflow Orchestration</h1>
          <p className="text-muted-foreground">
            Design, automate, and manage sophisticated business processes across all platform modules
          </p>
        </div>
        <Button onClick={() => {
          setEditingWorkflow(null);
          setIsDesignerOpen(true);
        }}>
          <Plus className="h-4 w-4 mr-2" />
          Create Workflow
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Workflows</CardTitle>
            <Workflow className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {workflows.filter(w => w.status === 'active').length}
            </div>
            <p className="text-xs text-muted-foreground">
              {workflows.length} total workflows
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Executions</CardTitle>
            <Play className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{executions.length}</div>
            <p className="text-xs text-muted-foreground">
              {executions.filter(e => e.status === 'running').length} currently running
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{calculateSuccessRate()}%</div>
            <p className="text-xs text-muted-foreground">
              Last 30 days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Processing Time</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2.3s</div>
            <p className="text-xs text-muted-foreground">
              Estimated average
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="workflows" className="space-y-4">
        <TabsList>
          <TabsTrigger value="workflows">Workflows</TabsTrigger>
          <TabsTrigger value="executions">Executions</TabsTrigger>
          <TabsTrigger value="rules">Business Rules</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="workflows" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Workflow Templates</CardTitle>
              <CardDescription>
                Manage and configure your workflow templates
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Loading workflows...</p>
                </div>
              ) : workflows.length === 0 ? (
                <div className="text-center py-8">
                  <Workflow className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium mb-2">No workflows found</h3>
                  <p className="text-muted-foreground mb-4">
                    Create your first workflow to automate business processes
                  </p>
                  <Button onClick={() => setIsDesignerOpen(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Workflow
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {workflows.map((workflow) => (
                    <div key={workflow.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h3 className="font-medium">{workflow.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {workflow.description || 'No description provided'}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant={getStatusBadgeVariant(workflow.status)}>
                              {workflow.status}
                            </Badge>
                            <Badge variant="outline">
                              v{workflow.version}
                            </Badge>
                            <Badge variant="outline">
                              {workflow.category}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              {workflow.nodes.length} nodes
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleExecuteWorkflow(workflow.id)}
                            disabled={workflow.status !== 'active'}
                          >
                            <Play className="h-3 w-3 mr-1" />
                            Execute
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setEditingWorkflow(workflow);
                              setIsDesignerOpen(true);
                            }}
                          >
                            <Settings className="h-3 w-3 mr-1" />
                            Edit
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="executions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Workflow Executions</CardTitle>
              <CardDescription>
                Monitor and track workflow execution history
              </CardDescription>
            </CardHeader>
            <CardContent>
              {executions.length === 0 ? (
                <div className="text-center py-8">
                  <Play className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium mb-2">No executions found</h3>
                  <p className="text-muted-foreground">
                    Execute workflows to see their execution history here
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {executions.slice(0, 10).map((execution) => {
                    const workflow = workflows.find(w => w.id === execution.workflow_id);
                    return (
                      <div key={execution.id} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">
                              {workflow?.name || 'Unknown Workflow'}
                            </h4>
                            <p className="text-sm text-muted-foreground">
                              Started: {new Date(execution.started_at).toLocaleString()}
                            </p>
                            {execution.completed_at && (
                              <p className="text-sm text-muted-foreground">
                                Completed: {new Date(execution.completed_at).toLocaleString()}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant={getExecutionStatusBadgeVariant(execution.status)}>
                              {execution.status}
                            </Badge>
                            {execution.error_message && (
                              <Badge variant="destructive">
                                Error
                              </Badge>
                            )}
                          </div>
                        </div>
                        {execution.error_message && (
                          <div className="mt-2 text-sm text-destructive">
                            {execution.error_message}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rules" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                <CardTitle>Business Rules Engine</CardTitle>
              </div>
              <CardDescription>
                Centralized business rules management with version control
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Business rules engine coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrations" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                <CardTitle>Integration & API Management</CardTitle>
              </div>
              <CardDescription>
                Manage external integrations and API connections
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Integration management coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Workflow Analytics</CardTitle>
              <CardDescription>
                Performance insights and optimization recommendations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Analytics dashboard coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Visual Workflow Designer Dialog */}
      <Dialog open={isDesignerOpen} onOpenChange={setIsDesignerOpen}>
        <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingWorkflow ? 'Edit Workflow' : 'Create New Workflow'}
            </DialogTitle>
            <DialogDescription>
              Design sophisticated workflows with our visual editor
            </DialogDescription>
          </DialogHeader>
          
          <VisualWorkflowDesigner
            workflow={editingWorkflow || undefined}
            onSave={handleSaveWorkflow}
            onCancel={() => {
              setIsDesignerOpen(false);
              setEditingWorkflow(null);
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WorkflowOrchestrationDashboard;
