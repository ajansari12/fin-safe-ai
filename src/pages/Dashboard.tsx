
import React, { useEffect } from "react";
import AuthenticatedLayout from "@/components/layout/AuthenticatedLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import StatCardsSection from "@/components/dashboard/StatCardsSection";
import RiskChartSection from "@/components/dashboard/RiskChartSection";
import IncidentTimelineSection from "@/components/dashboard/IncidentTimelineSection";
import ActionItemsCard from "@/components/dashboard/ActionItemsCard";
import ProgramMaturityCard from "@/components/dashboard/ProgramMaturityCard";
import PlaceholderContent from "@/components/dashboard/PlaceholderContent";
import KRIBreachesChart from "@/components/dashboard/KRIBreachesChart";
import UnresolvedIncidents from "@/components/dashboard/UnresolvedIncidents";
import GovernancePoliciesOverdue from "@/components/dashboard/GovernancePoliciesOverdue";
import ThirdPartyReviewsDue from "@/components/dashboard/ThirdPartyReviewsDue";
import MostSensitiveCBFs from "@/components/dashboard/MostSensitiveCBFs";
import { useAIAssistant } from "@/components/ai-assistant";

const DashboardContent = () => {
  const { setCurrentModule } = useAIAssistant();
  
  useEffect(() => {
    setCurrentModule("dashboard");
  }, [setCurrentModule]);
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Overview of your operational risk management program.
        </p>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="governance">Governance</TabsTrigger>
          <TabsTrigger value="risks">Risks</TabsTrigger>
          <TabsTrigger value="incidents">Incidents</TabsTrigger>
        </TabsList>
        
        {/* Summary Statistics - moved outside TabsContent to always show */}
        <StatCardsSection />
        
        <TabsContent value="overview" className="space-y-6">
          {/* Enhanced Analytics Grid */}
          <div className="grid gap-6 grid-cols-1 lg:grid-cols-2 xl:grid-cols-3">
            {/* KRI Breaches Chart - spans 2 columns on larger screens */}
            <div className="xl:col-span-2">
              <KRIBreachesChart />
            </div>
            
            {/* Unresolved Incidents */}
            <UnresolvedIncidents />
            
            {/* Governance Policies Overdue */}
            <GovernancePoliciesOverdue />
            
            {/* Third Party Reviews Due */}
            <ThirdPartyReviewsDue />
            
            {/* Most Sensitive CBFs */}
            <MostSensitiveCBFs />
          </div>

          {/* Original Dashboard Sections */}
          <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
            {/* Risk Charts */}
            <RiskChartSection />

            {/* Timeline Charts */}
            <IncidentTimelineSection />
          </div>

          <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
            {/* Action Items */}
            <ActionItemsCard />

            {/* Program Maturity */}
            <ProgramMaturityCard />
          </div>
        </TabsContent>
        
        <TabsContent value="governance">
          <PlaceholderContent 
            title="Governance" 
            description="Manage your governance framework and policies" 
          />
        </TabsContent>
        
        <TabsContent value="risks">
          <PlaceholderContent 
            title="Risk Management" 
            description="Monitor and manage operational risks" 
          />
        </TabsContent>
        
        <TabsContent value="incidents">
          <PlaceholderContent 
            title="Incident Management" 
            description="Track and respond to operational incidents" 
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

const Dashboard = () => {
  return (
    <AuthenticatedLayout>
      <DashboardContent />
    </AuthenticatedLayout>
  );
};

export default Dashboard;
