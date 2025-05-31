
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BarChart3, Thermometer, Shield, Layout, TrendingUp, Target, Lightbulb, Grid } from "lucide-react";
import PredictiveAnalyticsChart from "./PredictiveAnalyticsChart";
import RiskHeatmap from "./RiskHeatmap";
import ComplianceScorecard from "./ComplianceScorecard";
import CustomDashboardBuilder from "./CustomDashboardBuilder";
import { PredictiveInsights } from "./PredictiveInsights";
import { ExecutiveScorecard } from "./ExecutiveScorecard";
import AIInsightsPanel from "./AIInsightsPanel";
import DashboardBuilder from "./DashboardBuilder";

const EnhancedAnalyticsHub: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Enhanced Analytics Hub</h1>
        <p className="text-muted-foreground">
          AI-powered analytics, predictive insights, risk visualization, and custom dashboard building
        </p>
      </div>

      <Tabs defaultValue="ai-insights" className="w-full">
        <TabsList className="grid w-full grid-cols-8">
          <TabsTrigger value="ai-insights" className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4" />
            AI Insights
          </TabsTrigger>
          <TabsTrigger value="predictive" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Predictive
          </TabsTrigger>
          <TabsTrigger value="executive" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Executive
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="heatmap" className="flex items-center gap-2">
            <Thermometer className="h-4 w-4" />
            Risk Heatmap
          </TabsTrigger>
          <TabsTrigger value="compliance" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Compliance
          </TabsTrigger>
          <TabsTrigger value="builder" className="flex items-center gap-2">
            <Grid className="h-4 w-4" />
            Builder
          </TabsTrigger>
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <Layout className="h-4 w-4" />
            Custom
          </TabsTrigger>
        </TabsList>

        <TabsContent value="ai-insights" className="space-y-6">
          <AIInsightsPanel />
        </TabsContent>

        <TabsContent value="predictive" className="space-y-6">
          <PredictiveInsights />
        </TabsContent>

        <TabsContent value="executive" className="space-y-6">
          <ExecutiveScorecard />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <PredictiveAnalyticsChart />
        </TabsContent>

        <TabsContent value="heatmap" className="space-y-6">
          <RiskHeatmap />
        </TabsContent>

        <TabsContent value="compliance" className="space-y-6">
          <ComplianceScorecard />
        </TabsContent>

        <TabsContent value="builder" className="space-y-6">
          <DashboardBuilder />
        </TabsContent>

        <TabsContent value="dashboard" className="space-y-6">
          <CustomDashboardBuilder />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnhancedAnalyticsHub;
