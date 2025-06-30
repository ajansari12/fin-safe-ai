
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Calendar, Clock, User, Play, Eye } from "lucide-react";
import { WorkflowInstance } from "@/services/workflow-service";
import { Skeleton } from "@/components/ui/skeleton";

interface WorkflowListProps {
  workflows: WorkflowInstance[];
  title: string;
  description: string;
  onResumeWorkflow?: (workflow: WorkflowInstance) => void;
  loading?: boolean;
}

const WorkflowList: React.FC<WorkflowListProps> = ({
  workflows,
  title,
  description,
  onResumeWorkflow,
  loading
}) => {
  const getStatusColor = (status: WorkflowInstance['status']) => {
    switch (status) {
      case 'draft':
        return 'secondary';
      case 'in_progress':
        return 'default';
      case 'completed':
        return 'default';
      case 'cancelled':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const getPriorityColor = (priority: WorkflowInstance['priority']) => {
    switch (priority) {
      case 'critical':
        return 'destructive';
      case 'high':
        return 'destructive';
      case 'medium':
        return 'secondary';
      case 'low':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const calculateProgress = (workflow: WorkflowInstance) => {
    if (!workflow.steps || workflow.steps.length === 0) return 0;
    const completedSteps = workflow.steps.filter(step => step.status === 'completed').length;
    return Math.round((completedSteps / workflow.steps.length) * 100);
  };

  const isOverdue = (workflow: WorkflowInstance) => {
    if (!workflow.due_date || workflow.status === 'completed') return false;
    return new Date(workflow.due_date) < new Date();
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
              <Skeleton className="h-2 w-full" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (workflows.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground">No workflows found matching the current filters.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          {title}
          <Badge variant="outline">{workflows.length} workflows</Badge>
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {workflows.map((workflow) => (
            <div key={workflow.id} className="border rounded-lg p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium">{workflow.name}</h4>
                    {isOverdue(workflow) && (
                      <Badge variant="destructive" className="text-xs">
                        Overdue
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={getStatusColor(workflow.status)}>
                      {workflow.status.replace('_', ' ')}
                    </Badge>
                    <Badge variant={getPriorityColor(workflow.priority)}>
                      {workflow.priority} priority
                    </Badge>
                    {workflow.template && (
                      <Badge variant="outline">
                        {workflow.template.module.replace('_', ' ')}
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="text-right text-sm text-muted-foreground">
                  {workflow.due_date && (
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Due: {new Date(workflow.due_date).toLocaleDateString()}
                    </div>
                  )}
                </div>
              </div>

              {workflow.description && (
                <p className="text-sm text-muted-foreground">{workflow.description}</p>
              )}

              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Created:</span>
                  <div className="font-medium">
                    {new Date(workflow.created_at).toLocaleDateString()}
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground">Assigned to:</span>
                  <div className="font-medium">
                    {workflow.assigned_to_name || 'Unassigned'}
                  </div>
                </div>
                <div>
                  <span className="text-muted-foreground">Progress:</span>
                  <div className="font-medium">{calculateProgress(workflow)}%</div>
                </div>
              </div>

              {workflow.steps && workflow.steps.length > 0 && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress ({workflow.steps.filter(s => s.status === 'completed').length}/{workflow.steps.length} steps)</span>
                    <span>{calculateProgress(workflow)}%</span>
                  </div>
                  <Progress value={calculateProgress(workflow)} className="h-2" />
                </div>
              )}

              <div className="flex gap-2">
                {onResumeWorkflow && (
                  <Button 
                    size="sm" 
                    onClick={() => onResumeWorkflow(workflow)}
                    variant={workflow.status === 'draft' ? 'default' : 'outline'}
                  >
                    {workflow.status === 'draft' ? (
                      <>
                        <Play className="h-3 w-3 mr-1" />
                        Start Workflow
                      </>
                    ) : (
                      <>
                        <Eye className="h-3 w-3 mr-1" />
                        View Progress
                      </>
                    )}
                  </Button>
                )}
                <Button size="sm" variant="outline">
                  <User className="h-3 w-3 mr-1" />
                  Assign
                </Button>
                <Button size="sm" variant="outline">
                  <Clock className="h-3 w-3 mr-1" />
                  Set Due Date
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default WorkflowList;
