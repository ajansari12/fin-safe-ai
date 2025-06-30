
import React, { useEffect } from "react";
import AuthenticatedLayout from "@/components/layout/AuthenticatedLayout";
import WorkflowOrchestrationDashboard from "@/components/workflow-orchestration/WorkflowOrchestrationDashboard";
import { useEnhancedAIAssistant } from "@/components/ai-assistant/EnhancedAIAssistantContext";

const WorkflowOrchestrationPage = () => {
  const { setCurrentModule } = useEnhancedAIAssistant();
  
  useEffect(() => {
    setCurrentModule("workflow-orchestration");
  }, [setCurrentModule]);

  return (
    <AuthenticatedLayout>
      <WorkflowOrchestrationDashboard />
    </AuthenticatedLayout>
  );
};

export default WorkflowOrchestrationPage;
