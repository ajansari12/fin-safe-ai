
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CheckCircle, Clock, AlertTriangle, User, Calendar, MessageSquare } from "lucide-react";
import { format, formatDistanceToNow, isPast } from "date-fns";
import { WorkflowInstance, WorkflowStep } from "@/services/workflow-service";
import { useToast } from "@/hooks/use-toast";

interface WorkflowProgressTrackerProps {
  workflow: WorkflowInstance;
  onStepComplete: (stepId: string) => void;
  onStepUpdate: (stepId: string, updates: Partial<WorkflowStep>) => void;
}

const statusColors = {
  pending: "bg-gray-500",
  in_progress: "bg-blue-500",
  completed: "bg-green-500",
  skipped: "bg-yellow-500"
};

const statusIcons = {
  pending: Clock,
  in_progress: AlertTriangle,
  completed: CheckCircle,
  skipped: CheckCircle
};

const WorkflowProgressTracker: React.FC<WorkflowProgressTrackerProps> = ({
  workflow,
  onStepComplete,
  onStepUpdate
}) => {
  const { toast } = useToast();
  const [expandedStep, setExpandedStep] = useState<string | null>(null);
  const [stepNotes, setStepNotes] = useState<Record<string, string>>({});

  const steps = workflow.steps || [];
  const completedSteps = steps.filter(step => step.status === 'completed').length;
  const totalSteps = steps.length;
  const progressPercentage = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;

  useEffect(() => {
    // Initialize step notes
    const initialNotes: Record<string, string> = {};
    steps.forEach(step => {
      initialNotes[step.id] = step.notes || "";
    });
    setStepNotes(initialNotes);
  }, [steps]);

  const handleStepStatusChange = (stepId: string, newStatus: WorkflowStep['status']) => {
    if (newStatus === 'completed') {
      onStepComplete(stepId);
    } else {
      onStepUpdate(stepId, { status: newStatus });
    }
  };

  const handleNotesUpdate = (stepId: string) => {
    const notes = stepNotes[stepId];
    onStepUpdate(stepId, { notes });
    toast({
      title: "Notes Updated",
      description: "Step notes have been saved successfully."
    });
  };

  const isStepOverdue = (step: WorkflowStep) => {
    return step.due_date && isPast(new Date(step.due_date)) && step.status !== 'completed';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{workflow.name}</h2>
          <p className="text-muted-foreground">
            Track progress and manage workflow execution
          </p>
        </div>
        <Badge variant={workflow.status === 'completed' ? 'default' : 'outline'}>
          {workflow.status}
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Overall Progress
            <span className="text-sm font-normal">
              {completedSteps} of {totalSteps} steps completed
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Progress value={progressPercentage} className="h-4" />
          <div className="flex justify-between text-sm text-muted-foreground mt-2">
            <span>0%</span>
            <span>{Math.round(progressPercentage)}%</span>
            <span>100%</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Workflow Steps</CardTitle>
          <CardDescription>
            Track and manage each step of the workflow
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {steps.map((step, index) => {
              const StatusIcon = statusIcons[step.status];
              const isOverdue = isStepOverdue(step);
              const isExpanded = expandedStep === step.id;

              return (
                <Card key={step.id} className={`border transition-all ${isOverdue ? 'border-red-200 bg-red-50' : ''}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white ${statusColors[step.status]}`}>
                          <StatusIcon className="h-4 w-4" />
                        </div>
                        <div className="text-sm font-medium">
                          {index + 1}
                        </div>
                      </div>
                      
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium">{step.step_name}</h4>
                          <div className="flex items-center gap-2">
                            {isOverdue && (
                              <Badge variant="destructive" className="text-xs">
                                Overdue
                              </Badge>
                            )}
                            <Badge variant="outline" className="text-xs">
                              {step.status}
                            </Badge>
                          </div>
                        </div>
                        
                        {step.step_description && (
                          <p className="text-sm text-muted-foreground">
                            {step.step_description}
                          </p>
                        )}
                        
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          {step.assigned_to_name && (
                            <div className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              {step.assigned_to_name}
                            </div>
                          )}
                          
                          {step.due_date && (
                            <div className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              <span className={isOverdue ? 'text-red-600' : ''}>
                                Due {format(new Date(step.due_date), 'MMM d, yyyy')}
                                {' '}({formatDistanceToNow(new Date(step.due_date), { addSuffix: true })})
                              </span>
                            </div>
                          )}
                          
                          {step.completed_at && (
                            <div className="flex items-center gap-1 text-green-600">
                              <CheckCircle className="h-3 w-3" />
                              Completed {format(new Date(step.completed_at), 'MMM d, yyyy')}
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Select
                            value={step.status}
                            onValueChange={(value) => handleStepStatusChange(step.id, value as WorkflowStep['status'])}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">Pending</SelectItem>
                              <SelectItem value="in_progress">In Progress</SelectItem>
                              <SelectItem value="completed">Completed</SelectItem>
                              <SelectItem value="skipped">Skipped</SelectItem>
                            </SelectContent>
                          </Select>
                          
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setExpandedStep(isExpanded ? null : step.id)}
                          >
                            <MessageSquare className="h-3 w-3 mr-1" />
                            Notes
                          </Button>
                        </div>
                        
                        {isExpanded && (
                          <div className="space-y-3 mt-4 p-3 bg-gray-50 rounded-lg">
                            <Label htmlFor={`notes-${step.id}`}>Step Notes</Label>
                            <Textarea
                              id={`notes-${step.id}`}
                              value={stepNotes[step.id] || ""}
                              onChange={(e) => setStepNotes(prev => ({
                                ...prev,
                                [step.id]: e.target.value
                              }))}
                              placeholder="Add notes about this step..."
                              rows={3}
                            />
                            <Button
                              size="sm"
                              onClick={() => handleNotesUpdate(step.id)}
                            >
                              Save Notes
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Workflow Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600">{steps.filter(s => s.status === 'pending').length}</div>
              <div className="text-sm text-muted-foreground">Pending</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{steps.filter(s => s.status === 'in_progress').length}</div>
              <div className="text-sm text-muted-foreground">In Progress</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{steps.filter(s => s.status === 'completed').length}</div>
              <div className="text-sm text-muted-foreground">Completed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{steps.filter(s => isStepOverdue(s)).length}</div>
              <div className="text-sm text-muted-foreground">Overdue</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WorkflowProgressTracker;
