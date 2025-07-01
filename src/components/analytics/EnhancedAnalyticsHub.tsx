
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart3, 
  Brain, 
  Search, 
  FileText, 
  Zap, 
  Settings,
  TrendingUp,
  Target,
  Users
} from "lucide-react";
import UnifiedAnalyticsDashboard from "./UnifiedAnalyticsDashboard";
import NaturalLanguageQuery from "./NaturalLanguageQuery";
import AdvancedReportBuilder from "./AdvancedReportBuilder";
import PredictiveAnalyticsChart from "./PredictiveAnalyticsChart";
import RiskHeatmap from "./RiskHeatmap";
import ComplianceScorecard from "./ComplianceScorecard";

const EnhancedAnalyticsHub: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboards');

  const analyticsFeatures = [
    {
      id: 'unified',
      title: 'Unified Dashboards',
      description: 'Executive and operational dashboards with real-time insights',
      icon: BarChart3,
      badge: 'Interactive'
    },
    {
      id: 'nlp',
      title: 'Natural Language Queries',
      description: 'Ask questions about your data in plain English',
      icon: Search,
      badge: 'AI-Powered'
    },
    {
      id: 'predictive',
      title: 'Predictive Analytics',
      description: 'Machine learning models for risk prediction and anomaly detection',
      icon: Brain,
      badge: 'ML-Driven'
    },
    {
      id: 'reporting',
      title: 'Advanced Reporting',
      description: 'Automated report generation with customizable templates',
      icon: FileText,
      badge: 'Automated'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics Hub</h1>
          <p className="text-muted-foreground">
            Comprehensive business intelligence platform for risk management
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="flex items-center gap-1">
            <Zap className="h-3 w-3" />
            AI-Enhanced
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1">
            <TrendingUp className="h-3 w-3" />
            Real-time
          </Badge>
        </div>
      </div>

      {/* Feature Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {analyticsFeatures.map((feature) => {
          const Icon = feature.icon;
          return (
            <Card 
              key={feature.id} 
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => setActiveTab(feature.id === 'unified' ? 'dashboards' : feature.id === 'nlp' ? 'query' : feature.id === 'predictive' ? 'predictive' : 'reports')}
            >
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <Icon className="h-5 w-5 text-blue-600" />
                  <Badge variant="secondary" className="text-xs">
                    {feature.badge}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <h3 className="font-medium mb-1">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="dashboards" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Dashboards
          </TabsTrigger>
          <TabsTrigger value="query" className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            Query
          </TabsTrigger>
          <TabsTrigger value="predictive" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            Predictive
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Reports
          </TabsTrigger>
          <TabsTrigger value="visualizations" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Visualizations
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboards" className="space-y-6">
          <UnifiedAnalyticsDashboard />
        </TabsContent>

        <TabsContent value="query" className="space-y-6">
          <NaturalLanguageQuery />
        </TabsContent>

        <TabsContent value="predictive" className="space-y-6">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  Predictive Analytics Suite
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Advanced machine learning models for risk prediction and pattern analysis
                </p>
              </CardHeader>
              <CardContent>
                <PredictiveAnalyticsChart />
              </CardContent>
            </Card>

            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Anomaly Detection</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-muted-foreground">
                    <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="mb-2">AI-powered anomaly detection</p>
                    <p className="text-sm">Continuously monitors for unusual patterns</p>
                    <Button size="sm" className="mt-4">
                      Configure Detection
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Monte Carlo Simulation</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-muted-foreground">
                    <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="mb-2">Risk scenario modeling</p>
                    <p className="text-sm">Run simulations with 1000+ iterations</p>
                    <Button size="sm" className="mt-4">
                      Run Simulation
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="reports" className="space-y-6">
          <AdvancedReportBuilder />
        </TabsContent>

        <TabsContent value="visualizations" className="space-y-6">
          <div className="grid gap-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Risk Heatmap</CardTitle>
                </CardHeader>
                <CardContent>
                  <RiskHeatmap />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Compliance Scorecard</CardTitle>
                </CardHeader>
                <CardContent>
                  <ComplianceScorecard />
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Interactive Data Explorer</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Drag-and-drop interface for creating custom visualizations
                </p>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12 text-muted-foreground">
                  <Settings className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-medium mb-2">Interactive Data Explorer</h3>
                  <p className="mb-4">Build custom charts and visualizations with your risk data</p>
                  <Button>
                    Launch Explorer
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnhancedAnalyticsHub;
