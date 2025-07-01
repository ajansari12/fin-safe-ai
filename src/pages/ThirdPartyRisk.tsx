
import React, { useEffect } from "react";
import AuthenticatedLayout from "@/components/layout/AuthenticatedLayout";
import VendorRiskDashboard from "@/components/third-party/VendorRiskDashboard";
import { useEnhancedAIAssistant } from "@/components/ai-assistant/EnhancedAIAssistantContext";

const ThirdPartyRiskPage = () => {
  const { setCurrentModule } = useEnhancedAIAssistant();
  
  useEffect(() => {
    setCurrentModule("third_party_risk");
  }, [setCurrentModule]);

  return (
    <AuthenticatedLayout>
      <VendorRiskDashboard />
    </AuthenticatedLayout>
  );
};

export default ThirdPartyRiskPage;
