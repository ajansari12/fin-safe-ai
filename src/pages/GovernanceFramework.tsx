
import React, { useEffect } from "react";
// TODO: Migrated from AuthContext to EnhancedAuthContext
import { useAuth } from "@/contexts/EnhancedAuthContext";
import AuthenticatedLayout from "@/components/layout/AuthenticatedLayout";
import FrameworksList from "@/components/governance/FrameworksList";
import ComplianceDashboard from "@/components/governance/ComplianceDashboard";
import MobileGovernance from "@/components/governance/MobileGovernance";
import ThreeLinesDefense from "@/components/governance/ThreeLinesDefense";
import BoardOversight from "@/components/governance/BoardOversight";
import AccountabilityMatrix from "@/components/governance/AccountabilityMatrix";
import PolicyManagement from "@/components/governance/PolicyManagement";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEnhancedAIAssistant } from "@/components/ai-assistant/EnhancedAIAssistantContext";
import { useIsMobile } from "@/hooks/use-mobile";

const GovernanceFrameworkContent = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = React.useState("frameworks");
  const { setCurrentModule } = useEnhancedAIAssistant();
  const isMobile = useIsMobile();

  useEffect(() => {
    setCurrentModule("governance_framework");
  }, [setCurrentModule]);

  // Show mobile version on mobile devices
  if (isMobile) {
    return <MobileGovernance />;
  }

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
          <TabsTrigger value="three-lines">Three Lines of Defense</TabsTrigger>
          <TabsTrigger value="board">Board Oversight</TabsTrigger>
          <TabsTrigger value="accountability">Accountability Matrix</TabsTrigger>
          <TabsTrigger value="policies">Policy Management</TabsTrigger>
        </TabsList>
        
        <TabsContent value="frameworks" className="space-y-6">
          <FrameworksList />
        </TabsContent>
        
        <TabsContent value="compliance">
          <ComplianceDashboard />
        </TabsContent>
        
        <TabsContent value="three-lines">
          <ThreeLinesDefense />
        </TabsContent>
        
        <TabsContent value="board">
          <BoardOversight />
        </TabsContent>
        
        <TabsContent value="accountability">
          <AccountabilityMatrix />
        </TabsContent>
        
        <TabsContent value="policies">
          <PolicyManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
};

const GovernanceFramework = () => {
  const isMobile = useIsMobile();
  
  return (
    <AuthenticatedLayout>
      <GovernanceFrameworkContent />
    </AuthenticatedLayout>
  );
};

export default GovernanceFramework;
