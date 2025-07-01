
import React, { useEffect } from "react";
import AuthenticatedLayout from "@/components/layout/AuthenticatedLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Brain, TrendingUp, Settings, Users, Target, Zap, Activity, TestTube, Heart } from "lucide-react";
import { useEnhancedAIAssistant } from "@/components/ai-assistant/EnhancedAIAssistantContext";

// Import existing components
import AdvancedIntelligenceDashboard from "@/components/organizational-intelligence/AdvancedIntelligenceDashboard";
import AdaptiveQuestionnaire from "@/components/organizational-intelligence/AdaptiveQuestionnaire";
import ProfileInsightsPanel from "@/components/organizational-intelligence/ProfileInsightsPanel";
import IntelligentAutomationPanel from "@/components/organizational-intelligence/IntelligentAutomationPanel";
import RiskFrameworkGenerator from "@/components/organizational-intelligence/RiskFrameworkGenerator";

// Import Phase 4 components
import WorkflowOrchestrationPanel from "@/components/organizational-intelligence/WorkflowOrchestrationPanel";
import RealTimeIntelligenceHub from "@/components/organizational-intelligence/RealTimeIntelligenceHub";

// Import Phase 5 components
import PerformanceMonitor from "@/components/organizational-intelligence/PerformanceMonitor";
import TestingDashboard from "@/components/organizational-intelligence/TestingDashboard";
import SystemHealth from "@/components/organizational-intelligence/SystemHealth";

const OrganizationalIntelligencePage = () => {
  const { setCurrentModule } = useEnhancedAIAssistant();
  
  useEffect(() => {
    setCurrentModule("organizational-intelligence");
  }, [setCurrentModule]);

  // Mock organization ID - in a real app, this would come from auth context
  const orgId = "mock-org-id";
  const profileId = "mock-profile-id";

  return (
    <AuthenticatedLayout>
      <div className="container mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold tracking-tight">Organizational Intelligence</h1>
          <p className="text-muted-foreground mt-2">
            Advanced AI-powered organizational analysis, insights, and automation platform
          </p>
        </div>

        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="grid w-full grid-cols-11">
            <TabsTrigger value="dashboard" className="flex items-center gap-1">
              <Brain className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="questionnaire" className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              Assessment
            </TabsTrigger>
            <TabsTrigger value="insights" className="flex items-center gap-1">
              <TrendingUp className="h-4 w-4" />
              Insights
            </TabsTrigger>
            <TabsTrigger value="automation" className="flex items-center gap-1">
              <Zap className="h-4 w-4" />
              Automation
            </TabsTrigger>
            <TabsTrigger value="framework" className="flex items-center gap-1">
              <Target className="h-4 w-4" />
              Framework
            </TabsTrigger>
            <TabsTrigger value="workflows" className="flex items-center gap-1">
              <Settings className="h-4 w-4" />
              Workflows
            </TabsTrigger>
            <TabsTrigger value="realtime" className="flex items-center gap-1">
              <Activity className="h-4 w-4" />
              Real-time
            </TabsTrigger>
            <TabsTrigger value="performance" className="flex items-center gap-1">
              <Activity className="h-4 w-4" />
              Performance
            </TabsTrigger>
            <TabsTrigger value="testing" className="flex items-center gap-1">
              <TestTube className="h-4 w-4" />
              Testing
            </TabsTrigger>
            <TabsTrigger value="health" className="flex items-center gap-1">
              <Heart className="h-4 w-4" />
              Health
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <AdvancedIntelligenceDashboard orgId={orgId} />
          </TabsContent>

          <TabsContent value="questionnaire" className="space-y-6">
            <AdaptiveQuestionnaire orgId={orgId} />
          </TabsContent>

          <TabsContent value="insights" className="space-y-6">
            <ProfileInsightsPanel orgId={orgId} profileId={profileId} />
          </TabsContent>

          <TabsContent value="automation" className="space-y-6">
            <IntelligentAutomationPanel orgId={orgId} />
          </TabsContent>

          <TabsContent value="framework" className="space-y-6">
            <RiskFrameworkGenerator orgId={orgId} />
          </TabsContent>

          <TabsContent value="workflows" className="space-y-6">
            <WorkflowOrchestrationPanel orgId={orgId} />
          </TabsContent>

          <TabsContent value="realtime" className="space-y-6">
            <RealTimeIntelligenceHub orgId={orgId} profileId={profileId} />
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            <PerformanceMonitor orgId={orgId} />
          </TabsContent>

          <TabsContent value="testing" className="space-y-6">
            <TestingDashboard orgId={orgId} />
          </TabsContent>

          <TabsContent value="health" className="space-y-6">
            <SystemHealth orgId={orgId} />
          </TabsContent>
        </Tabs>
      </div>
    </AuthenticatedLayout>
  );
};

export default OrganizationalIntelligencePage;
