
import React, { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import AuthenticatedLayout from "@/components/layout/AuthenticatedLayout";
import FrameworksList from "@/components/governance/FrameworksList";
import ComplianceDashboard from "@/components/governance/ComplianceDashboard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAIAssistant } from "@/components/ai-assistant";

const GovernanceFramework = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = React.useState("frameworks");

  // Move the AI Assistant hook usage inside the component render
  return (
    <AuthenticatedLayout>
      <GovernanceFrameworkContent activeTab={activeTab} setActiveTab={setActiveTab} />
    </AuthenticatedLayout>
  );
};

// Create a child component that will use the AIAssistant hook after the provider is available
const GovernanceFrameworkContent = ({ 
  activeTab, 
  setActiveTab 
}: { 
  activeTab: string; 
  setActiveTab: React.Dispatch<React.SetStateAction<string>> 
}) => {
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

export default GovernanceFramework;
