
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, Thermometer, Shield, Layout } from "lucide-react";
import PredictiveAnalyticsChart from "./PredictiveAnalyticsChart";
import RiskHeatmap from "./RiskHeatmap";
import ComplianceScorecard from "./ComplianceScorecard";
import CustomDashboardBuilder from "./CustomDashboardBuilder";

const AnalyticsHub: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics Hub</h1>
        <p className="text-muted-foreground">
          Advanced analytics, predictions, and risk visualization for operational risk management
        </p>
      </div>

      <Tabs defaultValue="predictive" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="predictive" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Predictive Analytics
          </TabsTrigger>
          <TabsTrigger value="heatmap" className="flex items-center gap-2">
            <Thermometer className="h-4 w-4" />
            Risk Heatmap
          </TabsTrigger>
          <TabsTrigger value="compliance" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Compliance
          </TabsTrigger>
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <Layout className="h-4 w-4" />
            Custom Dashboard
          </TabsTrigger>
        </TabsList>

        <TabsContent value="predictive" className="space-y-6">
          <PredictiveAnalyticsChart />
        </TabsContent>

        <TabsContent value="heatmap" className="space-y-6">
          <RiskHeatmap />
        </TabsContent>

        <TabsContent value="compliance" className="space-y-6">
          <ComplianceScorecard />
        </TabsContent>

        <TabsContent value="dashboard" className="space-y-6">
          <CustomDashboardBuilder />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AnalyticsHub;
