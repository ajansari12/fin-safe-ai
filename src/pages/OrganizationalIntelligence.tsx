import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RealTimeDashboard } from '@/components/organizational-intelligence/RealTimeDashboard';
import { PredictiveModeling } from '@/components/organizational-intelligence/PredictiveModeling';
import { IntelligentReporting } from '@/components/organizational-intelligence/IntelligentReporting';
import { DataVisualization } from '@/components/organizational-intelligence/DataVisualization';
import { PerformanceInsights } from '@/components/organizational-intelligence/PerformanceInsights';
import { TrendAnalysis } from '@/components/organizational-intelligence/TrendAnalysis';
import { Brain, TrendingUp, BarChart3, Activity, Target, Zap } from 'lucide-react';

const OrganizationalIntelligence = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  const intelligenceMetrics = [
    {
      title: "Intelligence Score",
      value: "94/100",
      change: "+12%",
      trend: "up",
      description: "Overall organizational intelligence rating"
    },
    {
      title: "Predictive Accuracy",
      value: "87.3%",
      change: "+5.2%",
      trend: "up",
      description: "Model prediction accuracy rate"
    },
    {
      title: "Data Quality Index",
      value: "92.1%",
      change: "+3.1%",
      trend: "up",
      description: "Data completeness and accuracy"
    },
    {
      title: "Insights Generated",
      value: "2,847",
      change: "+23%",
      trend: "up",
      description: "AI-generated insights this month"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Brain className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground">Organizational Intelligence</h1>
                <p className="text-muted-foreground">Advanced analytics and business intelligence platform</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="bg-green-500/10 text-green-700 dark:text-green-300">
                <Activity className="w-3 h-3 mr-1" />
                Live Data
              </Badge>
              <Button variant="outline" size="sm">
                <Zap className="w-4 h-4 mr-2" />
                Export Report
              </Button>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {intelligenceMetrics.map((metric, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {metric.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold text-foreground">{metric.value}</div>
                    <Badge 
                      variant={metric.trend === 'up' ? 'default' : 'destructive'}
                      className="text-xs"
                    >
                      {metric.change}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{metric.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="dashboard" className="flex items-center space-x-2">
              <Activity className="w-4 h-4" />
              <span>Real-Time</span>
            </TabsTrigger>
            <TabsTrigger value="predictive" className="flex items-center space-x-2">
              <TrendingUp className="w-4 h-4" />
              <span>Predictive</span>
            </TabsTrigger>
            <TabsTrigger value="reporting" className="flex items-center space-x-2">
              <BarChart3 className="w-4 h-4" />
              <span>Reporting</span>
            </TabsTrigger>
            <TabsTrigger value="visualization" className="flex items-center space-x-2">
              <Target className="w-4 h-4" />
              <span>Visualization</span>
            </TabsTrigger>
            <TabsTrigger value="insights" className="flex items-center space-x-2">
              <Brain className="w-4 h-4" />
              <span>Insights</span>
            </TabsTrigger>
            <TabsTrigger value="trends" className="flex items-center space-x-2">
              <TrendingUp className="w-4 h-4" />
              <span>Trends</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <RealTimeDashboard />
          </TabsContent>

          <TabsContent value="predictive" className="space-y-6">
            <PredictiveModeling />
          </TabsContent>

          <TabsContent value="reporting" className="space-y-6">
            <IntelligentReporting />
          </TabsContent>

          <TabsContent value="visualization" className="space-y-6">
            <DataVisualization />
          </TabsContent>

          <TabsContent value="insights" className="space-y-6">
            <PerformanceInsights />
          </TabsContent>

          <TabsContent value="trends" className="space-y-6">
            <TrendAnalysis />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default OrganizationalIntelligence;