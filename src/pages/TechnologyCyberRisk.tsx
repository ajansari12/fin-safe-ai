
import React, { useEffect } from "react";
import AuthenticatedLayout from "@/components/layout/AuthenticatedLayout";
import TechnologyRiskDashboard from "@/components/technology/TechnologyRiskDashboard";
import { useEnhancedAIAssistant } from "@/components/ai-assistant/EnhancedAIAssistantContext";

const TechnologyCyberRiskPage = () => {
  const { setCurrentModule } = useEnhancedAIAssistant();
  
  useEffect(() => {
    setCurrentModule("technology_cyber_risk");
  }, [setCurrentModule]);

  return (
    <AuthenticatedLayout>
      <TechnologyRiskDashboard />
    </AuthenticatedLayout>
  );
};

export default TechnologyCyberRiskPage;
