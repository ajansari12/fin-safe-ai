
import React, { useEffect } from "react";
import AuthenticatedLayout from "@/components/layout/AuthenticatedLayout";
import AnalyticsHub from "@/components/analytics/AnalyticsHub";
import { useAIAssistant } from "@/components/ai-assistant";

const AnalyticsHubPage = () => {
  const { setCurrentModule } = useAIAssistant();
  
  useEffect(() => {
    setCurrentModule("analytics");
  }, [setCurrentModule]);

  return (
    <AuthenticatedLayout>
      <AnalyticsHub />
    </AuthenticatedLayout>
  );
};

export default AnalyticsHubPage;
