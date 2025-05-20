
import React, { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useAIAssistant } from "@/components/ai-assistant";
import AuthenticatedLayout from "@/components/layout/AuthenticatedLayout";
import FrameworksList from "@/components/governance/FrameworksList";
import ComplianceDashboard from "@/components/governance/ComplianceDashboard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const GovernanceFramework = () => {
  const { user } = useAuth();
  const { setCurrentModule } = useAIAssistant();
  const [activeTab, setActiveTab] = React.useState("frameworks");

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
    </AuthenticatedLayout>
  );
};

export default GovernanceFramework;
