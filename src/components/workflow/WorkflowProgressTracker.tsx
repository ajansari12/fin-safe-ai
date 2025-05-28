
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Clock, AlertCircle, User, Calendar } from "lucide-react";
import { WorkflowInstance, WorkflowStep } from "@/services/workflow-service";

interface WorkflowProgressTrackerProps {
  workflow: WorkflowInstance;
  onStepComplete: (stepId: string) => void;
  onStepUpdate: (stepId: string, updates: Partial<WorkflowStep>) => void;
}

const WorkflowProgressTracker: React.FC<WorkflowProgressTrackerProps> = ({
  workflow,
  onStepComplete,
  onStepUpdate
}) => {
  const steps = workflow.steps || [];
  const completedSteps = steps.filter(step => step.status === 'completed').length;
  const progressPercentage = steps.length > 0 ? (completedSteps / steps.length) * 100 : 0;
  
  const getStepIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case 'in_progress':
        return <Clock className="h-5 w-5 text-blue-600" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-gray-400" />;
      default:
        return <AlertCircle className="h-5 w-5 text-yellow-600" />;
    }
  };

  const getStepStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 border-green-300';
      case 'in_progress':
        return 'bg-blue-100 border-blue-300';
      case 'pending':
        return 'bg-gray-100 border-gray-300';
      default:
        return 'bg-yellow-100 border-yellow-300';
    }
  };

  const isOverdue = (dueDate?: string) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{workflow.name}</CardTitle>
              <CardDescription>
                {workflow.template?.name} • {workflow.template?.module}
              </CardDescription>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">{Math.round(progressPercentage)}%</div>
              <div className="text-sm text-muted-foreground">Complete</div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Progress value={progressPercentage} className="h-2" />
            
            <div className="flex items-center justify-between text-sm">
              <span>{completedSteps} of {steps.length} steps completed</span>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  {workflow.owner_name}
                </div>
                <Badge variant={workflow.status === 'completed' ? 'default' : 'secondary'}>
                  {workflow.status}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Workflow Steps</CardTitle>
          <CardDescription>
            Track progress and manage individual workflow steps
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {steps.map((step, index) => (
              <Card
                key={step.id}
                className={`transition-all ${getStepStatusColor(step.status)} ${
                  step.status === 'in_progress' ? 'ring-2 ring-blue-500' : ''
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      {getStepIcon(step.status)}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium">
                            Step {step.step_number}: {step.step_name}
                          </h4>
                          {isOverdue(step.due_date) && step.status !== 'completed' && (
                            <Badge variant="destructive" className="text-xs">
                              Overdue
                            </Badge>
                          )}
                        </div>
                        
                        {step.step_description && (
                          <p className="text-sm text-muted-foreground mb-2">
                            {step.step_description}
                          </p>
                        )}
                        
                        <div className="flex items-center gap-4 text-sm">
                          {step.assigned_to_name && (
                            <div className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              {step.assigned_to_name}
                            </div>
                          )}
                          
                          {step.due_date && (
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {new Date(step.due_date).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                        
                        {step.notes && (
                          <div className="mt-2 p-2 bg-white/50 rounded text-sm">
                            <strong>Notes:</strong> {step.notes}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {step.status === 'pending' && (
                        <Button
                          size="sm"
                          onClick={() => onStepUpdate(step.id, { status: 'in_progress' })}
                        >
                          Start
                        </Button>
                      )}
                      
                      {step.status === 'in_progress' && (
                        <Button
                          size="sm"
                          onClick={() => onStepComplete(step.id)}
                        >
                          Complete
                        </Button>
                      )}
                      
                      {step.status === 'completed' && step.completed_at && (
                        <div className="text-xs text-muted-foreground">
                          Completed {new Date(step.completed_at).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WorkflowProgressTracker;
