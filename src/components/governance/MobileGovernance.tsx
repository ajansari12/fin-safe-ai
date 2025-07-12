
import React, { useEffect } from "react";
// TODO: Migrated from AuthContext to EnhancedAuthContext
import { useAuth } from "@/contexts/EnhancedAuthContext";
import FrameworksList from "@/components/governance/FrameworksList";
import ComplianceDashboard from "@/components/governance/ComplianceDashboard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAIAssistant } from "@/components/ai-assistant";

const MobileGovernance = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = React.useState("frameworks");
  const { setCurrentModule } = useAIAssistant();

  useEffect(() => {
    setCurrentModule("governance-framework");
  }, [setCurrentModule]);

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <div className="sticky top-0 bg-background/95 backdrop-blur border-b z-40 p-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Governance</h1>
          <p className="text-sm text-muted-foreground">
            Accountability structures and oversight processes
          </p>
        </div>
      </div>
      
      <div className="p-4">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="sticky top-20 bg-background z-30 pb-4">
            <TabsList className="grid w-full grid-cols-2 h-12">
              <TabsTrigger value="frameworks" className="text-sm">Frameworks</TabsTrigger>
              <TabsTrigger value="compliance" className="text-sm">Compliance</TabsTrigger>
            </TabsList>
          </div>
          
          <TabsContent value="frameworks" className="mt-4">
            <FrameworksList />
          </TabsContent>
          
          <TabsContent value="compliance" className="mt-4">
            <ComplianceDashboard />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default MobileGovernance;
