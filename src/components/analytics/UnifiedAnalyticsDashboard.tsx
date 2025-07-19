import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  BarChart3, 
  TrendingUp, 
  AlertTriangle, 
  Shield, 
  Target,
  Brain,
  RefreshCw
} from 'lucide-react';
import { useDataAvailability, usePredictiveMetrics, useRealTimeAlerts, useAnalyticsInsights } from '@/hooks/useAnalyticsQueries';
import RiskHeatmap from './RiskHeatmap';
import { ExecutiveScorecard } from './ExecutiveScorecard';
import PredictiveInsightsCard from './PredictiveInsightsCard';
import { EnhancedAIInsights } from './EnhancedAIInsights';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/EnhancedAuthContext';
import { useAnalyticsQueries } from '@/hooks/useAnalyticsQueries';

const UnifiedAnalyticsDashboard: React.FC = () => {
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [isLoadingInsights, setIsLoadingInsights] = useState(false);

  // Use the existing analytics queries
  const {
    data: dataAvailability,
    isLoading: dataAvailabilityLoading
  } = useDataAvailability();

  const {
    data: predictiveMetrics,
    isLoading: predictiveLoading
  } = usePredictiveMetrics(dataAvailability?.readyForPredictive);

  const {
    data: realTimeAlerts,
    isLoading: alertsLoading
  } = useRealTimeAlerts();

  const {
    data: analyticsInsights,
    isLoading: insightsLoading
  } = useAnalyticsInsights();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Advanced Analytics</h1>
          <p className="text-muted-foreground">
            AI-powered insights and predictive analytics for operational risk management
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="flex items-center gap-1">
            <Brain className="h-3 w-3" />
            AI-Enhanced
          </Badge>
          {dataAvailability?.readyForPredictive && (
            <Badge variant="default" className="flex items-center gap-1">
              <Target className="h-3 w-3" />
              Predictive Ready
            </Badge>
          )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
          <TabsTrigger value="predictive">Predictive</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
          <TabsTrigger value="risk-analysis">Risk Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Data Readiness</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {dataAvailabilityLoading ? '...' : `${dataAvailability?.dataScore || 0}%`}
                </div>
                <p className="text-xs text-muted-foreground">
                  {dataAvailability?.readyForPredictive ? 'Predictive ready' : 'Building baseline'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {alertsLoading ? '...' : realTimeAlerts?.length || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Real-time monitoring
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">AI Insights</CardTitle>
                <Brain className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {insightsLoading ? '...' : analyticsInsights?.length || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Generated insights
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Predictions</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {predictiveLoading ? '...' : predictiveMetrics?.length || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  Forecast models
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <RiskHeatmap />
            <ExecutiveScorecard />
          </div>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <EnhancedAIInsights />
        </TabsContent>

        <TabsContent value="predictive" className="space-y-6">
          <PredictiveInsightsCard 
            insights={predictiveMetrics || []} 
            isLoading={predictiveLoading}
          />
          
          {dataAvailability && !dataAvailability.readyForPredictive && (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center space-y-4">
                  <Target className="h-12 w-12 mx-auto text-muted-foreground" />
                  <div>
                    <h3 className="text-lg font-medium">Building Predictive Capabilities</h3>
                    <p className="text-muted-foreground">
                      Data Score: {dataAvailability.dataScore}% | Need 75% for predictions
                    </p>
                  </div>
                  <div className="text-sm text-muted-foreground space-y-1">
                    {dataAvailability.issues?.map((issue, index) => (
                      <p key={index}>• {issue}</p>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="compliance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                OSFI E-21 Compliance Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground">
                  Compliance analytics will be enhanced in the next phase
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="risk-analysis" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Risk Correlation Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-muted-foreground">
                    Advanced risk correlation analysis coming soon
                  </p>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Scenario Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p className="text-muted-foreground">
                    Scenario modeling tools will be available soon
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UnifiedAnalyticsDashboard;
