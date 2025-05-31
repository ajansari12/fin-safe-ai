
import React, { useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import StatCardsSection from "@/components/dashboard/StatCardsSection";
import RiskChartSection from "@/components/dashboard/RiskChartSection";
import IncidentTimelineSection from "@/components/dashboard/IncidentTimelineSection";
import ActionItemsCard from "@/components/dashboard/ActionItemsCard";
import ProgramMaturityCard from "@/components/dashboard/ProgramMaturityCard";
import KRIBreachesChart from "@/components/dashboard/KRIBreachesChart";
import UnresolvedIncidents from "@/components/dashboard/UnresolvedIncidents";
import GovernancePoliciesOverdue from "@/components/dashboard/GovernancePoliciesOverdue";
import ThirdPartyReviewsDue from "@/components/dashboard/ThirdPartyReviewsDue";
import MostSensitiveCBFs from "@/components/dashboard/MostSensitiveCBFs";
import { useAIAssistant } from "@/components/ai-assistant";
import { useIsMobile } from "@/hooks/use-mobile";

const MobileDashboard = () => {
  const { setCurrentModule } = useAIAssistant();
  const isMobile = useIsMobile();
  
  useEffect(() => {
    setCurrentModule("dashboard");
  }, [setCurrentModule]);
  
  if (!isMobile) {
    return null; // This component is only for mobile
  }
  
  return (
    <div className="space-y-4 p-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground text-sm">
          Overview of your operational risk management program.
        </p>
      </div>

      {/* Mobile Tabs with swipe-friendly design */}
      <Tabs defaultValue="overview" className="w-full">
        <div className="sticky top-0 bg-background z-10 pb-4">
          <TabsList className="grid w-full grid-cols-4 h-12">
            <TabsTrigger value="overview" className="text-xs">Overview</TabsTrigger>
            <TabsTrigger value="governance" className="text-xs">Gov</TabsTrigger>
            <TabsTrigger value="risks" className="text-xs">Risks</TabsTrigger>
            <TabsTrigger value="incidents" className="text-xs">Incidents</TabsTrigger>
          </TabsList>
        </div>
        
        {/* Summary Statistics - Always visible */}
        <StatCardsSection />
        
        <TabsContent value="overview" className="space-y-4 mt-4">
          {/* Vertically stacked cards for mobile */}
          <div className="space-y-4">
            <KRIBreachesChart />
            <UnresolvedIncidents />
            <GovernancePoliciesOverdue />
            <ThirdPartyReviewsDue />
            <MostSensitiveCBFs />
            <RiskChartSection />
            <IncidentTimelineSection />
            <ActionItemsCard />
            <ProgramMaturityCard />
          </div>
        </TabsContent>
        
        <TabsContent value="governance" className="space-y-4 mt-4">
          <GovernancePoliciesOverdue />
          <ProgramMaturityCard />
        </TabsContent>
        
        <TabsContent value="risks" className="space-y-4 mt-4">
          <KRIBreachesChart />
          <RiskChartSection />
          <MostSensitiveCBFs />
        </TabsContent>
        
        <TabsContent value="incidents" className="space-y-4 mt-4">
          <UnresolvedIncidents />
          <IncidentTimelineSection />
          <ActionItemsCard />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MobileDashboard;
