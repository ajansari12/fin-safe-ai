
import React, { useEffect } from "react";
import AuthenticatedLayout from "@/components/layout/AuthenticatedLayout";
import ExecutiveIntelligenceDashboard from "@/components/analytics/ExecutiveIntelligenceDashboard";
import { useEnhancedAIAssistant } from "@/components/ai-assistant/EnhancedAIAssistantContext";

const ExecutiveIntelligence = () => {
  const { setCurrentModule } = useEnhancedAIAssistant();
  
  useEffect(() => {
    setCurrentModule("executive-intelligence");
  }, [setCurrentModule]);

  return (
    <AuthenticatedLayout>
      <ExecutiveIntelligenceDashboard />
    </AuthenticatedLayout>
  );
};

export default ExecutiveIntelligence;
