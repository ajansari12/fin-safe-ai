
import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  FileText, 
  AlertTriangle, 
  TrendingUp, 
  CheckCircle, 
  Clock,
  Zap,
  Target,
  BookOpen
} from "lucide-react";

interface EnhancedAIQuickActionsProps {
  onQuickAction: (action: string) => void;
  currentModule?: string;
  isLoading: boolean;
}

export function EnhancedAIQuickActions({ onQuickAction, currentModule, isLoading }: EnhancedAIQuickActionsProps) {
  const quickActions = [
    {
      id: 'incident_summary',
      label: 'Generate Incident Summary',
      icon: AlertTriangle,
      description: 'Auto-generate incident analysis for current period',
      color: 'bg-red-100 text-red-700 hover:bg-red-200',
      command: 'Generate an incident summary for this month'
    },
    {
      id: 'audit_summary',
      label: 'Generate Audit Summary',
      icon: FileText,
      description: 'Create comprehensive audit findings summary',
      color: 'bg-blue-100 text-blue-700 hover:bg-blue-200',
      command: 'Generate an audit summary with current findings and gaps'
    },
    {
      id: 'kri_recommendations',
      label: 'Recommend KRIs',
      icon: Target,
      description: 'Get KRI suggestions based on your organization type',
      color: 'bg-green-100 text-green-700 hover:bg-green-200',
      command: 'Recommend KRIs for our organization'
    },
    {
      id: 'module_completion',
      label: 'Check Module Status',
      icon: TrendingUp,
      description: 'Flag modules with low completion or stale entries',
      color: 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200',
      command: 'Show module completion status and stale entries'
    },
    {
      id: 'workflow_tasks',
      label: 'Suggest Next Tasks',
      icon: Clock,
      description: 'Get prioritized workflow tasks and next steps',
      color: 'bg-purple-100 text-purple-700 hover:bg-purple-200',
      command: 'Show me suggested workflow tasks and next steps'
    },
    {
      id: 'smart_insights',
      label: 'Smart Insights',
      icon: Zap,
      description: 'Get AI-powered insights for current module',
      color: 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200',
      command: `Provide smart insights for ${currentModule || 'the current module'}`
    }
  ];

  const moduleSpecificActions = currentModule ? [
    {
      id: 'module_help',
      label: `${currentModule} Help`,
      icon: BookOpen,
      description: `Get specific guidance for ${currentModule}`,
      color: 'bg-gray-100 text-gray-700 hover:bg-gray-200',
      command: `How do I effectively use the ${currentModule} module?`
    }
  ] : [];

  const allActions = [...quickActions, ...moduleSpecificActions];

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Zap className="h-5 w-5" />
            AI Quick Actions
            {currentModule && (
              <Badge variant="outline" className="text-xs">
                {currentModule}
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {allActions.map((action) => {
              const Icon = action.icon;
              return (
                <Button
                  key={action.id}
                  variant="outline"
                  className={`h-auto p-4 flex flex-col items-start text-left space-y-2 ${action.color} border-0`}
                  onClick={() => onQuickAction(action.command)}
                  disabled={isLoading}
                >
                  <div className="flex items-center gap-2 w-full">
                    <Icon className="h-4 w-4 flex-shrink-0" />
                    <span className="font-medium text-sm">{action.label}</span>
                  </div>
                  <p className="text-xs opacity-80 leading-relaxed">
                    {action.description}
                  </p>
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm">
            <CheckCircle className="h-4 w-4" />
            Available Commands
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-xs text-muted-foreground space-y-1">
            <p>• "incident summary" - Generate incident analysis</p>
            <p>• "audit summary" - Create audit findings summary</p>
            <p>• "recommend KRIs" - Get KRI suggestions</p>
            <p>• "module completion" - Check module status</p>
            <p>• "workflow tasks" - Show next workflow steps</p>
            <p>• Ask any question about operational resilience</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
