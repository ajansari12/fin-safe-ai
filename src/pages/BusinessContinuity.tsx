import React, { useState } from "react";
import AuthenticatedLayout from "@/components/layout/AuthenticatedLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Shield, FileText, Users, AlertTriangle, Calculator, Activity, BarChart3 } from "lucide-react";
import MobileBusinessContinuity from "@/components/business-continuity/MobileBusinessContinuity";
import DRSimulationDashboard from "@/components/business-continuity/DRSimulationDashboard";
import BusinessImpactCalculator from "@/components/business-continuity/BusinessImpactCalculator";
import ContinuityTestDashboard from "@/components/business-continuity/ContinuityTestDashboard";
import ContinuityPlansManager from "@/components/business-continuity/ContinuityPlansManager";
import RecoveryContactsManager from "@/components/business-continuity/RecoveryContactsManager";
import AIAssistantContinuityBuilder from "@/components/business-continuity/AIAssistantContinuityBuilder";
import { useIsMobile } from "@/hooks/use-mobile";
// TODO: Migrated from AuthContext to EnhancedAuthContext
import { useAuth } from "@/contexts/EnhancedAuthContext";

const BusinessContinuityContent = () => {
  const isMobile = useIsMobile();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [showAIBuilder, setShowAIBuilder] = useState(false);

  if (isMobile) {
    return <MobileBusinessContinuity />;
  }

  // Mock org ID - in a real app this would come from the user's profile
  const orgId = user?.user_metadata?.organization_id || "mock-org-id";

  const handleAIGeneratedPlan = (planData: any) => {
    console.log('AI Generated Plan:', planData);
    setShowAIBuilder(false);
    setActiveTab("plans");
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Business Continuity</h1>
          <p className="text-muted-foreground">
            Comprehensive disaster recovery planning, testing, and impact assessment.
          </p>
        </div>
        <Button onClick={() => setShowAIBuilder(true)} variant="outline">
          <Activity className="h-4 w-4 mr-2" />
          AI Plan Builder
        </Button>
      </div>

      {showAIBuilder && (
        <AIAssistantContinuityBuilder
          onPlanGenerated={handleAIGeneratedPlan}
        />
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="plans">Plans</TabsTrigger>
          <TabsTrigger value="contacts">Contacts</TabsTrigger>
          <TabsTrigger value="dr-simulation">DR Simulation</TabsTrigger>
          <TabsTrigger value="impact-calculator">Impact Calculator</TabsTrigger>
          <TabsTrigger value="test-dashboard">Test Dashboard</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Plans</CardTitle>
                  <Shield className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">12</div>
                  <p className="text-xs text-muted-foreground">
                    Continuity plans in place
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Tests Due</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">3</div>
                  <p className="text-xs text-muted-foreground">
                    Scheduled this quarter
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Average RTO</CardTitle>
                  <FileText className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">2.5h</div>
                  <p className="text-xs text-muted-foreground">
                    Recovery time objective
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">DR Simulations</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">8</div>
                  <p className="text-xs text-muted-foreground">
                    Automated workflows active
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    DR Simulation Workflows
                  </CardTitle>
                  <CardDescription>
                    Automated disaster recovery testing and validation
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Set up automated workflows to simulate dependency failures and test recovery procedures.
                    Integrate with real-time dependency monitoring for comprehensive testing.
                  </p>
                  <Button 
                    onClick={() => setActiveTab("dr-simulation")}
                    className="w-full"
                  >
                    View DR Simulations
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calculator className="h-5 w-5" />
                    Business Impact Calculator
                  </CardTitle>
                  <CardDescription>
                    Calculate potential business impact based on dependencies
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Assess business impact using dependency data, RTO/RPO targets, and operational factors.
                    Generate comprehensive impact reports for stakeholders.
                  </p>
                  <Button 
                    onClick={() => setActiveTab("impact-calculator")}
                    variant="outline"
                    className="w-full"
                  >
                    Calculate Impact
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Test Outcome Dashboard
                  </CardTitle>
                  <CardDescription>
                    Comprehensive testing analytics and scorecards
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Track test performance with detailed scorecards, trend analysis, and improvement recommendations.
                    Monitor RTO/RPO achievement rates and overall readiness.
                  </p>
                  <Button 
                    onClick={() => setActiveTab("test-dashboard")}
                    variant="outline"
                    className="w-full"
                  >
                    View Analytics
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Emergency Contacts
                  </CardTitle>
                  <CardDescription>
                    Manage recovery contacts and escalation procedures
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">
                    Maintain up-to-date emergency contact information and escalation trees for effective
                    crisis response and communication.
                  </p>
                  <Button 
                    onClick={() => setActiveTab("plans")}
                    variant="outline"
                    className="w-full"
                  >
                    Manage Contacts
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="plans">
          <ContinuityPlansManager orgId={orgId} />
        </TabsContent>

        <TabsContent value="contacts">
          <RecoveryContactsManager orgId={orgId} />
        </TabsContent>

        <TabsContent value="dr-simulation">
          <DRSimulationDashboard orgId={orgId} />
        </TabsContent>

        <TabsContent value="impact-calculator">
          <BusinessImpactCalculator orgId={orgId} />
        </TabsContent>

        <TabsContent value="test-dashboard">
          <ContinuityTestDashboard orgId={orgId} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

const BusinessContinuity = () => {
  return (
    <AuthenticatedLayout>
      <BusinessContinuityContent />
    </AuthenticatedLayout>
  );
};

export default BusinessContinuity;
