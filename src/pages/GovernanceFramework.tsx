
import React, { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useAIAssistant } from "@/components/ai-assistant";
import AuthenticatedLayout from "@/components/layout/AuthenticatedLayout";
import FrameworksList from "@/components/governance/FrameworksList";

const GovernanceFramework = () => {
  const { user } = useAuth();
  const { setCurrentModule } = useAIAssistant();

  useEffect(() => {
    setCurrentModule("governance-framework");
  }, []);

  return (
    <AuthenticatedLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Governance Framework</h1>
          <p className="text-muted-foreground">
            Establish accountability structures and oversight processes for operational resilience.
          </p>
        </div>
        
        <div className="space-y-6">
          <FrameworksList />
        </div>
      </div>
    </AuthenticatedLayout>
  );
};

export default GovernanceFramework;
