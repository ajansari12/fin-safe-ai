
import React, { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import AuthenticatedLayout from "@/components/layout/AuthenticatedLayout";
import FrameworksList from "@/components/governance/FrameworksList";
import ComplianceDashboard from "@/components/governance/ComplianceDashboard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAIAssistant } from "@/components/ai-assistant";

const GovernanceFrameworkContent = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = React.useState("frameworks");
  const { setCurrentModule } = useAIAssistant();

  useEffect(() => {
    setCurrentModule("governance-framework");
  }, [setCurrentModule]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Governance Framework</h1>
        <p className="text-muted-foreground">
          Establish accountability structures and oversight processes for operational resilience.
        </p>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="frameworks">Frameworks</TabsTrigger>
          <TabsTrigger value="compliance">Compliance Dashboard</TabsTrigger>
        </TabsList>
        
        <TabsContent value="frameworks" className="space-y-6">
          <FrameworksList />
        </TabsContent>
        
        <TabsContent value="compliance">
          <ComplianceDashboard />
        </TabsContent>
      </Tabs>
    </div>
  );
};

const GovernanceFramework = () => {
  return (
    <AuthenticatedLayout>
      <GovernanceFrameworkContent />
    </AuthenticatedLayout>
  );
};

export default GovernanceFramework;
