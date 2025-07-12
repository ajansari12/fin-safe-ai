
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  AlertTriangle, 
  TrendingUp, 
  Clock, 
  Target,
  RefreshCw,
  Info
} from "lucide-react";
import { enhancedAIAssistantService } from "@/services/enhanced-ai-assistant-service";
import type { ModuleCompletion, WorkflowTask } from "@/services/enhanced-ai-assistant-service";
import { useAuth } from "@/contexts/EnhancedAuthContext";
import { getUserOrganization } from "@/lib/supabase-utils";

interface EnhancedAIInsightsPanelProps {
  currentModule?: string;
}

export function EnhancedAIInsightsPanel({ currentModule }: EnhancedAIInsightsPanelProps) {
  const { profile } = useAuth();
  const [moduleCompletions, setModuleCompletions] = useState<ModuleCompletion[]>([]);
  const [workflowTasks, setWorkflowTasks] = useState<WorkflowTask[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const loadInsights = async () => {
    if (!profile?.organization_id) return;
    
    setIsLoading(true);
    try {
      const [modules, tasks] = await Promise.all([
        enhancedAIAssistantService.flagIncompleteModules(profile.organization_id),
        enhancedAIAssistantService.suggestWorkflowTasks(profile.organization_id)
      ]);
      
      setModuleCompletions(modules);
      setWorkflowTasks(tasks);
      setLastRefresh(new Date());
    } catch (error) {
      console.error('Error loading AI insights:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadInsights();
  }, [profile?.organization_id]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getCompletionColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-4">
      {/* Header with refresh */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">AI Insights</h3>
        <div className="flex items-center gap-2">
          {lastRefresh && (
            <span className="text-xs text-muted-foreground">
              Updated {lastRefresh.toLocaleTimeString()}
            </span>
          )}
          <Button 
            variant="outline" 
            size="sm" 
            onClick={loadInsights}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </div>

      {/* Module Completion Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <TrendingUp className="h-4 w-4" />
            Module Completion Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {moduleCompletions.slice(0, 5).map((module) => (
              <div key={module.module} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium capitalize">
                    {module.module.replace('_', ' ')}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-semibold ${getCompletionColor(module.completionPercentage)}`}>
                      {module.completionPercentage}%
                    </span>
                    {module.flags.length > 0 && (
                      <Badge variant="destructive" className="text-xs">
                        {module.flags[0]}
                      </Badge>
                    )}
                  </div>
                </div>
                <Progress 
                  value={module.completionPercentage} 
                  className="h-2"
                />
                {module.staleEntries > 0 && (
                  <p className="text-xs text-muted-foreground">
                    {module.staleEntries} stale entries need attention
                  </p>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Priority Workflow Tasks */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Clock className="h-4 w-4" />
            Priority Workflow Tasks
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {workflowTasks.slice(0, 4).map((task) => (
              <div key={task.workflowId} className="flex items-start gap-3 p-3 border rounded-lg">
                <div className={`w-2 h-2 rounded-full mt-2 ${getPriorityColor(task.priority)}`} />
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-medium">{task.workflowName}</h4>
                    <Badge variant="outline" className="text-xs">
                      {task.priority}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Next: {task.nextStepName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Assigned to: {task.assignedTo}
                  </p>
                  {task.dueDate !== 'No due date' && (
                    <p className="text-xs text-muted-foreground">
                      Due: {new Date(task.dueDate).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
            ))}
            {workflowTasks.length === 0 && (
              <div className="text-center py-6 text-muted-foreground">
                <Info className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No pending workflow tasks</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Current Module Focus */}
      {currentModule && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Target className="h-4 w-4" />
              Current Module Focus
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Badge variant="secondary" className="text-sm">
                {currentModule.replace('_', ' ').toUpperCase()}
              </Badge>
              <p className="text-sm text-muted-foreground">
                Ask me about specific guidance, best practices, or recommendations for this module.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
