
import React, { useEffect } from "react";
import AuthenticatedLayout from "@/components/layout/AuthenticatedLayout";
import AnalyticsHub from "@/components/analytics/AnalyticsHub";
import { useEnhancedAIAssistant } from "@/components/ai-assistant/EnhancedAIAssistantContext";

const AnalyticsPage = () => {
  const { setCurrentModule } = useEnhancedAIAssistant();
  
  useEffect(() => {
    setCurrentModule("analytics");
  }, [setCurrentModule]);

  return (
    <AuthenticatedLayout>
      <AnalyticsHub />
    </AuthenticatedLayout>
  );
};

export default AnalyticsPage;
