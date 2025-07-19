
import React, { useEffect } from "react";
import AuthenticatedLayout from "@/components/layout/AuthenticatedLayout";
import EnhancedAnalyticsHub from "@/components/analytics/EnhancedAnalyticsHub";
import { useEnhancedAIAssistant } from "@/components/ai-assistant/EnhancedAIAssistantContext";

const AnalyticsPage = () => {
  const { setCurrentModule } = useEnhancedAIAssistant();
  
  useEffect(() => {
    setCurrentModule("analytics");
  }, [setCurrentModule]);

  return (
    <AuthenticatedLayout>
      <EnhancedAnalyticsHub />
    </AuthenticatedLayout>
  );
};

export default AnalyticsPage;
