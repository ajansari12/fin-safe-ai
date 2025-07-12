
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, 
  Play, 
  Settings, 
  BarChart3, 
  Brain, 
  Zap,
  AlertTriangle,
  CheckCircle,
  Clock,
  Activity
} from 'lucide-react';
import { toast } from 'sonner';
import VisualWorkflowDesigner from './VisualWorkflowDesigner';
import DataOrchestrationManager from './DataOrchestrationManager';
import { workflowOrchestrationService, type Workflow } from '@/services/workflow-orchestration-service';
import { intelligentAutomationService } from '@/services/intelligent-automation-service';
// TODO: Migrated from AuthContext to EnhancedAuthContext
import { useAuth } from '@/contexts/EnhancedAuthContext';

const WorkflowOrchestrationDashboard: React.FC = () => {
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);
  const [showDesigner, setShowDesigner] = useState(false);
  const [workflowAnalytics, setWorkflowAnalytics] = useState<any>({});
  const [healthMetrics, setHealthMetrics] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadWorkflows();
  }, [profile?.organization_id]);

  useEffect(() => {
    if (workflows.length > 0) {
      loadWorkflowAnalytics();
      loadHealthMetrics();
    }
  }, [workflows]);

  const loadWorkflows = async () => {
    if (!profile?.organization_id) return;

    try {
      const data = await workflowOrchestrationService.getWorkflows(profile.organization_id);
      setWorkflows(data);
    } catch (error) {
      console.error('Error loading workflows:', error);
      toast.error('Failed to load workflows');
    } finally {
      setIsLoading(false);
    }
  };

  const loadWorkflowAnalytics = async () => {
    const analytics: Record<string, any> = {};
    
    for (const workflow of workflows.slice(0, 5)) { // Limit to first 5 for performance
      try {
        const analysis = await intelligentAutomationService.analyzeWorkflowPerformance(workflow.id);
        analytics[workflow.id] = analysis;
      } catch (error) {
        console.error(`Error analyzing workflow ${workflow.id}:`, error);
      }
    }
    
    setWorkflowAnalytics(analytics);
  };

  const loadHealthMetrics = async () => {
    const metrics: Record<string, any> = {};
    
    for (const workflow of workflows.slice(0, 5)) {
      try {
        const health = await intelligentAutomationService.monitorWorkflowHealth(workflow.id);
        metrics[workflow.id] = health;
      } catch (error) {
        console.error(`Error monitoring workflow ${workflow.id}:`, error);
      }
    }
    
    setHealthMetrics(metrics);
  };

  const handleCreateWorkflow = () => {
    setSelectedWorkflow(null);
    setShowDesigner(true);
  };

  const handleEditWorkflow = (workflow: Workflow) => {
    setSelectedWorkflow(workflow);
    setShowDesigner(true);
  };

  const handleWorkflowSaved = (workflow: Workflow) => {
    setShowDesigner(false);
    loadWorkflows();
    toast.success('Workflow saved successfully');
  };

  const handleWorkflowExecuted = (executionId: string) => {
    toast.success(`Workflow execution started: ${executionId}`);
    // Could navigate to execution details or update UI
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'draft': return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'paused': return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      default: return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getHealthStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-500';
      case 'warning': return 'text-yellow-500';
      case 'critical': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  if (showDesigner) {
    return (
      <div className="h-full">
        <VisualWorkflowDesigner
          workflowId={selectedWorkflow?.id}
          onSave={handleWorkflowSaved}
          onExecute={handleWorkflowExecuted}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Workflow Orchestration</h2>
          <p className="text-muted-foreground">
            Intelligent process automation and workflow management
          </p>
        </div>
        <Button onClick={handleCreateWorkflow}>
          <Plus className="h-4 w-4 mr-2" />
          Create Workflow
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="workflows" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Workflows
          </TabsTrigger>
          <TabsTrigger value="automation" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            AI Automation
          </TabsTrigger>
          <TabsTrigger value="data" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Data Orchestration
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Overview Stats */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Workflows</CardTitle>
                <Settings className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{workflows.length}</div>
                <p className="text-xs text-muted-foreground">
                  {workflows.filter(w => w.status === 'active').length} active
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Executions Today</CardTitle>
                <Play className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0</div>
                <p className="text-xs text-muted-foreground">
                  0% from yesterday
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">--</div>
                <p className="text-xs text-muted-foreground">
                  No recent executions
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Duration</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">--</div>
                <p className="text-xs text-muted-foreground">
                  No recent executions
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Workflow Health Monitor */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Workflow Health Monitor
              </CardTitle>
            </CardHeader>
            <CardContent>
              {workflows.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Settings className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No workflows to monitor. Create your first workflow to get started.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {workflows.slice(0, 5).map((workflow) => {
                    const health = healthMetrics[workflow.id];
                    return (
                      <div key={workflow.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          {getStatusIcon(workflow.status)}
                          <div>
                            <div className="font-medium">{workflow.name}</div>
                            <div className="text-sm text-muted-foreground">{workflow.description}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {health && (
                            <Badge 
                              variant="outline" 
                              className={getHealthStatusColor(health.status)}
                            >
                              {health.status}
                            </Badge>
                          )}
                          <Badge variant="secondary">{workflow.status}</Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="workflows" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Workflow Library</CardTitle>
            </CardHeader>
            <CardContent>
              {workflows.length === 0 ? (
                <div className="text-center py-12">
                  <Settings className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium mb-2">No workflows yet</h3>
                  <p className="text-muted-foreground mb-4">
                    Create your first automated workflow to streamline your processes
                  </p>
                  <Button onClick={handleCreateWorkflow}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create First Workflow
                  </Button>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {workflows.map((workflow) => (
                    <Card key={workflow.id} className="cursor-pointer hover:shadow-md transition-shadow">
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base">{workflow.name}</CardTitle>
                          <Badge variant="secondary">{workflow.status}</Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground mb-4">
                          {workflow.description || 'No description'}
                        </p>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditWorkflow(workflow)}
                          >
                            <Settings className="h-3 w-3 mr-1" />
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            disabled={workflow.status !== 'active'}
                          >
                            <Play className="h-3 w-3 mr-1" />
                            Run
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="automation" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  AI Performance Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                {Object.keys(workflowAnalytics).length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No workflow analytics available. Execute workflows to see AI insights.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {Object.entries(workflowAnalytics).map(([workflowId, analysis]: [string, any]) => {
                      const workflow = workflows.find(w => w.id === workflowId);
                      return (
                        <div key={workflowId} className="border rounded-lg p-3">
                          <div className="font-medium mb-2">{workflow?.name}</div>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>Success Rate: {analysis.current_metrics?.success_rate || 0}%</div>
                            <div>Avg Duration: {analysis.current_metrics?.avg_duration || 0}s</div>
                          </div>
                          {analysis.recommended_changes?.length > 0 && (
                            <div className="mt-2">
                              <Badge variant="outline" className="text-xs">
                                {analysis.recommended_changes.length} optimization suggestions
                              </Badge>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Automation Rules
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-muted-foreground">
                  <Zap className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Configure automation rules to trigger workflows automatically</p>
                  <Button variant="outline" className="mt-2">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Rule
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="data">
          <DataOrchestrationManager orgId={profile?.organization_id || ''} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default WorkflowOrchestrationDashboard;
