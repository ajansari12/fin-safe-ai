
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Settings, 
  Play, 
  Pause,
  CheckCircle,
  AlertTriangle,
  Clock,
  Users,
  BarChart3,
  GitBranch,
  Zap
} from 'lucide-react';

interface WorkflowStep {
  id: string;
  name: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  assignee?: string;
  due_date?: string;
  duration_minutes?: number;
  dependencies: string[];
}

interface WorkflowTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  steps: WorkflowStep[];
  automation_level: 'manual' | 'semi-automated' | 'fully-automated';
  estimated_duration: number;
  success_rate: number;
}

interface WorkflowInstance {
  id: string;
  template_id: string;
  name: string;
  status: 'draft' | 'active' | 'paused' | 'completed' | 'failed';
  progress: number;
  started_at?: string;
  completed_at?: string;
  current_step?: string;
  participants: string[];
}

interface WorkflowOrchestrationPanelProps {
  orgId: string;
}

const WorkflowOrchestrationPanel: React.FC<WorkflowOrchestrationPanelProps> = ({ 
  orgId 
}) => {
  const [activeTab, setActiveTab] = useState('templates');
  const [workflows, setWorkflows] = useState<WorkflowInstance[]>([]);
  const [templates, setTemplates] = useState<WorkflowTemplate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWorkflowData();
  }, [orgId]);

  const loadWorkflowData = async () => {
    setLoading(true);
    try {
      // Mock data - in real implementation, this would fetch from the service
      const mockTemplates: WorkflowTemplate[] = [
        {
          id: '1',
          name: 'Risk Assessment Workflow',
          description: 'Comprehensive risk assessment process',
          category: 'Risk Management',
          automation_level: 'semi-automated',
          estimated_duration: 240,
          success_rate: 89,
          steps: [
            {
              id: 'step1',
              name: 'Initial Risk Identification',
              status: 'completed',
              assignee: 'Risk Analyst',
              duration_minutes: 60,
              dependencies: []
            },
            {
              id: 'step2',
              name: 'Risk Impact Analysis',
              status: 'in_progress',
              assignee: 'Senior Risk Manager',
              duration_minutes: 90,
              dependencies: ['step1']
            },
            {
              id: 'step3',
              name: 'Mitigation Strategy Development',
              status: 'pending',
              duration_minutes: 90,
              dependencies: ['step2']
            }
          ]
        },
        {
          id: '2',
          name: 'Compliance Review Process',
          description: 'Automated compliance checking and review',
          category: 'Compliance',
          automation_level: 'fully-automated',
          estimated_duration: 120,
          success_rate: 95,
          steps: [
            {
              id: 'step1',
              name: 'Automated Policy Check',
              status: 'completed',
              duration_minutes: 30,
              dependencies: []
            },
            {
              id: 'step2',
              name: 'Compliance Gap Analysis',
              status: 'completed',
              duration_minutes: 45,
              dependencies: ['step1']
            },
            {
              id: 'step3',
              name: 'Report Generation',
              status: 'in_progress',
              duration_minutes: 45,
              dependencies: ['step2']
            }
          ]
        }
      ];

      const mockInstances: WorkflowInstance[] = [
        {
          id: '1',
          template_id: '1',
          name: 'Q4 Risk Assessment - Financial Services',
          status: 'active',
          progress: 65,
          started_at: '2024-01-15T09:00:00Z',
          current_step: 'Risk Impact Analysis',
          participants: ['john.doe@company.com', 'jane.smith@company.com']
        },
        {
          id: '2',
          template_id: '2',
          name: 'Monthly Compliance Review - January',
          status: 'completed',
          progress: 100,
          started_at: '2024-01-01T08:00:00Z',
          completed_at: '2024-01-01T10:30:00Z',
          participants: ['compliance@company.com']
        }
      ];

      setTemplates(mockTemplates);
      setWorkflows(mockInstances);
    } catch (error) {
      console.error('Error loading workflow data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'active':
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'failed': return 'bg-red-100 text-red-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4" />;
      case 'active':
      case 'in_progress': return <Play className="h-4 w-4" />;
      case 'failed': return <AlertTriangle className="h-4 w-4" />;
      case 'paused': return <Pause className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getAutomationColor = (level: string) => {
    switch (level) {
      case 'fully-automated': return 'bg-green-100 text-green-800';
      case 'semi-automated': return 'bg-blue-100 text-blue-800';
      case 'manual': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-3 bg-gray-200 rounded"></div>
                <div className="h-3 bg-gray-200 rounded w-5/6"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <GitBranch className="h-8 w-8 text-blue-500" />
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Workflow Orchestration</h2>
            <p className="text-muted-foreground">
              Manage and automate organizational workflows
            </p>
          </div>
        </div>
        <Button className="flex items-center gap-2">
          <Zap className="h-4 w-4" />
          Create Workflow
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="active">Active Workflows</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {templates.map((template) => (
              <Card key={template.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-base">{template.name}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        {template.description}
                      </p>
                    </div>
                    <Badge variant="outline">{template.category}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span>Automation Level:</span>
                    <Badge className={getAutomationColor(template.automation_level)}>
                      {template.automation_level.replace('-', ' ')}
                    </Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Duration:</span>
                      <div className="font-medium">{template.estimated_duration} min</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Success Rate:</span>
                      <div className="font-medium">{template.success_rate}%</div>
                    </div>
                  </div>

                  <div>
                    <span className="text-sm font-medium">Steps ({template.steps.length})</span>
                    <div className="mt-2 space-y-2">
                      {template.steps.slice(0, 3).map((step) => (
                        <div key={step.id} className="flex items-center gap-2 text-sm">
                          {getStatusIcon(step.status)}
                          <span className="flex-1">{step.name}</span>
                          <Badge variant="outline" className={getStatusColor(step.status)}>
                            {step.status.replace('_', ' ')}
                          </Badge>
                        </div>
                      ))}
                      {template.steps.length > 3 && (
                        <div className="text-xs text-muted-foreground">
                          +{template.steps.length - 3} more steps
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button size="sm" className="flex-1">
                      <Play className="h-4 w-4 mr-2" />
                      Start Workflow
                    </Button>
                    <Button size="sm" variant="outline">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="active" className="space-y-4">
          <div className="space-y-4">
            {workflows.map((workflow) => (
              <Card key={workflow.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-base">{workflow.name}</CardTitle>
                      <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                        <span>Started: {new Date(workflow.started_at!).toLocaleDateString()}</span>
                        {workflow.current_step && (
                          <span>Current: {workflow.current_step}</span>
                        )}
                      </div>
                    </div>
                    <Badge className={getStatusColor(workflow.status)}>
                      {getStatusIcon(workflow.status)}
                      {workflow.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Progress</span>
                      <span className="text-sm text-muted-foreground">
                        {workflow.progress}%
                      </span>
                    </div>
                    <Progress value={workflow.progress} className="h-2" />
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>{workflow.participants.length} participants</span>
                  </div>

                  <div className="flex gap-2">
                    {workflow.status === 'active' && (
                      <>
                        <Button size="sm" variant="outline">
                          <Pause className="h-4 w-4 mr-2" />
                          Pause
                        </Button>
                        <Button size="sm" variant="outline">
                          <Settings className="h-4 w-4 mr-2" />
                          Manage
                        </Button>
                      </>
                    )}
                    <Button size="sm" variant="outline">
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">24</div>
                <div className="text-sm text-muted-foreground">Active Workflows</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-green-600">92%</div>
                <div className="text-sm text-muted-foreground">Success Rate</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-purple-600">156</div>
                <div className="text-sm text-muted-foreground">Completed This Month</div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Workflow Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <BarChart3 className="h-12 w-12 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Analytics Dashboard</h3>
                <p>Detailed workflow analytics and performance metrics</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Workflow Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Settings className="h-12 w-12 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Configuration Settings</h3>
                <p>Manage workflow templates, automation rules, and notifications</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default WorkflowOrchestrationPanel;
