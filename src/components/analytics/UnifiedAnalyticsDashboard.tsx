
import React, { useState, useEffect, Suspense, lazy } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  BarChart3, 
  TrendingUp, 
  AlertTriangle, 
  Target, 
  Users, 
  Settings,
  Brain,
  Zap,
  Eye
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import AIStatusVerification from '@/components/ai-assistant/AIStatusVerification';

interface AnalyticsInsight {
  id: string;
  type: string;
  title: string;
  description: string;
  impact: 'critical' | 'high' | 'medium' | 'low';
  confidence: number;
}

// Lazy load heavy dashboard components
const ExecutiveDashboard = lazy(() => import('./ExecutiveDashboard'));
const OperationalDashboard = lazy(() => import('./OperationalDashboard'));
const CustomDashboardBuilder = lazy(() => import('./CustomDashboardBuilder'));
const PredictiveAnalyticsChart = lazy(() => import('./PredictiveAnalyticsChart'));
const PredictiveAnalyticsPanel = lazy(() => import('./PredictiveAnalyticsPanel'));

// Loading skeleton component
const DashboardSkeleton = () => (
  <div className="space-y-6">
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {[...Array(4)].map((_, i) => (
        <Card key={i}>
          <CardContent className="p-6">
            <div className="animate-pulse space-y-3">
              <div className="h-4 bg-muted rounded w-3/4"></div>
              <div className="h-8 bg-muted rounded w-1/2"></div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
    <Card>
      <CardContent className="p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-muted rounded w-1/4 mb-6"></div>
          <div className="h-80 bg-muted rounded"></div>
        </div>
      </CardContent>
    </Card>
  </div>
);

const UnifiedAnalyticsDashboard: React.FC = () => {
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState('executive');
  const [insights, setInsights] = useState<AnalyticsInsight[]>([]);
  const [isGeneratingInsights, setIsGeneratingInsights] = useState(false);

  useEffect(() => {
    if (profile?.organization_id) {
      loadAutomatedInsights();
    }
  }, [profile?.organization_id]);

  const loadAutomatedInsights = async () => {
    if (!profile?.organization_id) return;

    setIsGeneratingInsights(true);
    try {
      // Load analytics insights from Supabase
      const { data: insightsData, error } = await supabase
        .from('analytics_insights')
        .select('*')
        .eq('org_id', profile.organization_id)
        .order('generated_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      const transformedInsights: AnalyticsInsight[] = (insightsData || []).map(insight => ({
        id: insight.id,
        type: insight.insight_type,
        title: insight.insight_data?.title || 'Analytics Insight',
        description: insight.insight_data?.description || 'Analysis of organizational data patterns',
        impact: insight.insight_data?.impact || 'medium',
        confidence: insight.confidence_score || 0.75
      }));

      setInsights(transformedInsights);
    } catch (error) {
      console.error('Error loading insights:', error);
      toast.error('Failed to load automated insights');
    } finally {
      setIsGeneratingInsights(false);
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'trend': return <TrendingUp className="h-4 w-4" />;
      case 'anomaly': return <AlertTriangle className="h-4 w-4" />;
      case 'correlation': return <Target className="h-4 w-4" />;
      case 'prediction': return <Brain className="h-4 w-4" />;
      case 'recommendation': return <Zap className="h-4 w-4" />;
      default: return <Eye className="h-4 w-4" />;
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getDashboardByRole = () => {
    switch (profile?.role) {
      case 'executive':
      case 'admin':
        return 'executive';
      case 'manager':
        return 'operational';
      case 'analyst':
      default:
        return 'operational';
    }
  };

  useEffect(() => {
    setActiveTab(getDashboardByRole());
  }, [profile?.role]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Analytics & Business Intelligence</h2>
          <p className="text-muted-foreground">
            Comprehensive insights across all risk management activities
          </p>
        </div>
        <Button 
          onClick={loadAutomatedInsights}
          disabled={isGeneratingInsights}
          className="flex items-center gap-2"
        >
          <Brain className="h-4 w-4" />
          {isGeneratingInsights ? 'Generating...' : 'Refresh Insights'}
        </Button>
      </div>

      {/* AI-Generated Insights Banner */}
      {insights.length > 0 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Brain className="h-4 w-4 text-blue-600" />
              AI-Generated Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3">
              {insights.slice(0, 3).map((insight) => (
                <div key={insight.id} className="flex items-start gap-3 p-3 bg-white rounded-lg border">
                  <div className="flex-shrink-0 mt-0.5">
                    {getInsightIcon(insight.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-sm">{insight.title}</h4>
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${getImpactColor(insight.impact)}`}
                      >
                        {insight.impact}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {Math.round(insight.confidence * 100)}% confidence
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{insight.description}</p>
                  </div>
                </div>
              ))}
            </div>
            {insights.length > 3 && (
              <div className="mt-3 text-center">
                <Button variant="ghost" size="sm">
                  View all {insights.length} insights
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="executive" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Executive
          </TabsTrigger>
          <TabsTrigger value="operational" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Operational
          </TabsTrigger>
          <TabsTrigger value="predictive" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            Predictive
          </TabsTrigger>
          <TabsTrigger value="custom" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Custom
          </TabsTrigger>
        </TabsList>

        <TabsContent value="executive" className="space-y-6">
          <Suspense fallback={<DashboardSkeleton />}>
            <ExecutiveDashboard />
          </Suspense>
        </TabsContent>

        <TabsContent value="operational" className="space-y-6">
          <Suspense fallback={<DashboardSkeleton />}>
            <OperationalDashboard />
          </Suspense>
        </TabsContent>

        <TabsContent value="predictive" className="space-y-6">
          <AIStatusVerification />
          <Suspense fallback={<DashboardSkeleton />}>
            <PredictiveAnalyticsPanel />
          </Suspense>
        </TabsContent>

        <TabsContent value="custom" className="space-y-6">
          <Suspense fallback={<DashboardSkeleton />}>
            <CustomDashboardBuilder />
          </Suspense>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UnifiedAnalyticsDashboard;
