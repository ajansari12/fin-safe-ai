
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bot, BarChart3, AlertTriangle } from "lucide-react";
import { useEnhancedAIAssistant } from "./EnhancedAIAssistantContext";
import { EnhancedAIAssistantDialog } from "./EnhancedAIAssistantDialog";

export function EnhancedAIAssistantButton() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { 
    workflowAnalysis, 
    riskSummary,
    currentModule,
    setCurrentModule 
  } = useEnhancedAIAssistant();

  // Get current page module from URL for context
  React.useEffect(() => {
    const path = window.location.pathname;
    const moduleMap: Record<string, string> = {
      '/dashboard': 'dashboard',
      '/incident-log': 'incident-management',
      '/governance-framework': 'governance',
      '/business-continuity': 'business-continuity',
      '/third-party-risk': 'third-party-risk',
      '/dependencies': 'dependencies',
      '/controls-and-kri': 'controls-kri',
      '/workflow-center': 'workflows',
      '/risk-appetite': 'risk-appetite'
    };
    
    const module = Object.entries(moduleMap).find(([route]) => path.startsWith(route))?.[1];
    if (module) {
      setCurrentModule(module);
    }
  }, [setCurrentModule]);

  const hasHighRisks = riskSummary.some(risk => 
    risk.level === 'high' || risk.level === 'critical'
  );

  const incompleteWorkflows = workflowAnalysis.filter(w => 
    w.completionPercentage < 80
  ).length;

  return (
    <>
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsDialogOpen(true)}
          size="lg"
          className="rounded-full shadow-lg hover:shadow-xl transition-all duration-200 group relative"
        >
          <Bot className="w-5 h-5 mr-2 group-hover:animate-pulse" />
          AI Assistant
          
          {/* Notification badges */}
          <div className="absolute -top-2 -right-2 flex gap-1">
            {hasHighRisks && (
              <Badge variant="destructive" className="w-5 h-5 p-0 flex items-center justify-center">
                <AlertTriangle className="w-3 h-3" />
              </Badge>
            )}
            {incompleteWorkflows > 0 && (
              <Badge variant="secondary" className="w-5 h-5 p-0 flex items-center justify-center text-xs">
                {incompleteWorkflows}
              </Badge>
            )}
          </div>
        </Button>
        
        {currentModule && (
          <div className="mt-2 text-center">
            <Badge variant="outline" className="text-xs">
              {currentModule.replace('-', ' ')}
            </Badge>
          </div>
        )}
      </div>

      {/* AI Assistant Dialog */}
      <EnhancedAIAssistantDialog 
        open={isDialogOpen} 
        onOpenChange={setIsDialogOpen}
      />
    </>
  );
}
