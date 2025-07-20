
import React, { useState } from "react";
import AuthenticatedLayout from "@/components/layout/AuthenticatedLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Brain, BarChart3, TrendingUp, Network } from "lucide-react";
import EnhancedDashboardBuilder from "@/components/analytics/EnhancedDashboardBuilder";
import { EnhancedAIAnalyticsDashboard } from "@/components/analytics/EnhancedAIAnalyticsDashboard";
import AdvancedAnalyticsDashboard from "@/components/analytics/AdvancedAnalyticsDashboard";

const AdvancedDashboards: React.FC = () => {
  const [activeTab, setActiveTab] = useState('ai-analytics');

  return (
    <AuthenticatedLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Advanced Analytics</h1>
            <p className="text-muted-foreground">
              AI-powered analytics, custom dashboards, and advanced risk insights
            </p>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="ai-analytics" className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              AI Analytics
            </TabsTrigger>
            <TabsTrigger value="advanced" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Advanced
            </TabsTrigger>
            <TabsTrigger value="custom" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Custom Dashboards
            </TabsTrigger>
            <TabsTrigger value="correlations" className="flex items-center gap-2">
              <Network className="h-4 w-4" />
              Correlations
            </TabsTrigger>
          </TabsList>

          <TabsContent value="ai-analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-purple-500" />
                  AI-Powered Risk Analytics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Advanced AI analytics providing predictive insights, anomaly detection, 
                  and intelligent recommendations for your risk management program.
                </p>
              </CardContent>
            </Card>
            <EnhancedAIAnalyticsDashboard />
          </TabsContent>

          <TabsContent value="advanced" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-blue-500" />
                  Advanced Risk Analytics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Comprehensive analytics including trend analysis, performance metrics, 
                  and correlation analysis across all risk management modules.
                </p>
              </CardContent>
            </Card>
            <AdvancedAnalyticsDashboard />
          </TabsContent>

          <TabsContent value="custom" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-green-500" />
                  Custom Dashboard Builder
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Create personalized dashboards with drag-and-drop widgets, 
                  custom visualizations, and role-based views.
                </p>
              </CardContent>
            </Card>
            <EnhancedDashboardBuilder />
          </TabsContent>

          <TabsContent value="correlations" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Network className="h-5 w-5 text-orange-500" />
                  Risk Correlations & Dependencies
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Network className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-medium mb-2">Correlation Analysis</h3>
                  <p className="text-muted-foreground mb-4">
                    Advanced correlation analysis and dependency mapping will be available here.
                  </p>
                  <Button variant="outline">
                    Coming Soon
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AuthenticatedLayout>
  );
};

export default AdvancedDashboards;
