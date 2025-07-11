
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
  Eye,
  Shield
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import AIStatusVerification from '@/components/ai-assistant/AIStatusVerification';
import { ErrorBoundaryWrapper, AnalyticsCardFallback, NoDataFallback } from './ErrorBoundaryWrapper';
import { DashboardSkeleton } from './AnalyticsLoadingStates';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import OSFIComplianceWidgets from './OSFIComplianceWidgets';

interface AnalyticsInsight {
  id: string;
  type: string;
  title: string;
  description: string;
  impact: 'critical' | 'high' | 'medium' | 'low';
  confidence: number;
}

// Lazy load heavy dashboard components
const ExecutiveDashboard = lazy(() => 
  import('./ExecutiveDashboard').then(module => ({ default: module.default }))
);
const OperationalDashboard = lazy(() => 
  import('./OperationalDashboard').then(module => ({ default: module.default }))
);
const CustomDashboardBuilder = lazy(() => 
  import('./CustomDashboardBuilder').then(module => ({ default: module.default }))
);
const PredictiveAnalyticsPanel = lazy(() => 
  import('./PredictiveAnalyticsPanel').then(module => ({ default: module.default }))
);

// Enhanced loading skeleton component with better UX
const EnhancedDashboardSkeleton = () => (
  <DashboardSkeleton />
);

const UnifiedAnalyticsDashboard: React.FC = () => {
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState('executive');
  const [insights, setInsights] = useState<AnalyticsInsight[]>([]);
  const [isGeneratingInsights, setIsGeneratingInsights] = useState(false);
  const [dataError, setDataError] = useState<Error | null>(null);
  const { handleError } = useErrorHandler();

  useEffect(() => {
    if (profile?.organization_id) {
      loadAutomatedInsights();
    }
  }, [profile?.organization_id]);

  const loadAutomatedInsights = async (retryCount = 0) => {
    if (!profile?.organization_id) return;

    setIsGeneratingInsights(true);
    setDataError(null);
    
    try {
      // Load analytics insights from Supabase with retry logic
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
      
      // Reset error state on successful load
      setDataError(null);
    } catch (error) {
      const appError = handleError(error, 'loading automated insights');
      setDataError(appError as Error);
      
      // Retry logic for network errors
      if (retryCount < 2 && error instanceof Error && error.message.includes('network')) {
        setTimeout(() => loadAutomatedInsights(retryCount + 1), 2000 * (retryCount + 1));
        return;
      }
      
      // Show different messages based on error type
      if (error instanceof Error && error.message.includes('permission')) {
        toast.error('Permission denied - please check your access rights');
      } else {
        toast.error('Failed to load automated insights');
      }
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
          onClick={() => loadAutomatedInsights()}
          disabled={isGeneratingInsights}
          className="flex items-center gap-2"
        >
          <Brain className="h-4 w-4" />
          {isGeneratingInsights ? 'Generating...' : 'Refresh Insights'}
        </Button>
      </div>

      {/* OSFI E-21 Compliance Widgets */}
      <ErrorBoundaryWrapper 
        title="OSFI Compliance Error"
        description="Unable to load OSFI compliance status"
        fallback={AnalyticsCardFallback}
      >
        <OSFIComplianceWidgets />
      </ErrorBoundaryWrapper>

      {/* AI-Generated Insights Banner with Error Handling */}
      <ErrorBoundaryWrapper 
        title="AI Insights Error"
        description="Unable to load AI-generated insights"
        fallback={AnalyticsCardFallback}
      >
        {dataError ? (
          <NoDataFallback 
            title="Insights Unavailable"
            description="Unable to load AI-generated insights. Please try refreshing."
            retry={() => loadAutomatedInsights()}
          />
        ) : insights.length > 0 ? (
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
        ) : !isGeneratingInsights ? (
          <NoDataFallback 
            title="No Insights Available"
            description="AI insights will appear here as your data grows. Continue using the platform to generate meaningful insights."
            icon={<Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />}
            retry={() => loadAutomatedInsights()}
          />
        ) : null}
      </ErrorBoundaryWrapper>

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
          <ErrorBoundaryWrapper 
            title="Executive Dashboard Error"
            description="Unable to load executive dashboard"
            fallback={AnalyticsCardFallback}
          >
            <Suspense fallback={<EnhancedDashboardSkeleton />}>
              <ExecutiveDashboard />
            </Suspense>
          </ErrorBoundaryWrapper>
        </TabsContent>

        <TabsContent value="operational" className="space-y-6">
          <ErrorBoundaryWrapper 
            title="Operational Dashboard Error"
            description="Unable to load operational dashboard"
            fallback={AnalyticsCardFallback}
          >
            <Suspense fallback={<EnhancedDashboardSkeleton />}>
              <OperationalDashboard />
            </Suspense>
          </ErrorBoundaryWrapper>
        </TabsContent>

        <TabsContent value="predictive" className="space-y-6">
          <ErrorBoundaryWrapper 
            title="AI Status Verification Error"
            description="Unable to verify AI status"
            fallback={AnalyticsCardFallback}
          >
            <AIStatusVerification />
          </ErrorBoundaryWrapper>
          <ErrorBoundaryWrapper 
            title="Predictive Analytics Error"
            description="Unable to load predictive analytics"
            fallback={AnalyticsCardFallback}
          >
            <Suspense fallback={<EnhancedDashboardSkeleton />}>
              <PredictiveAnalyticsPanel />
            </Suspense>
          </ErrorBoundaryWrapper>
        </TabsContent>

        <TabsContent value="custom" className="space-y-6">
          <ErrorBoundaryWrapper 
            title="Custom Dashboard Builder Error"
            description="Unable to load custom dashboard builder"
            fallback={AnalyticsCardFallback}
          >
            <Suspense fallback={<EnhancedDashboardSkeleton />}>
              <CustomDashboardBuilder />
            </Suspense>
          </ErrorBoundaryWrapper>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UnifiedAnalyticsDashboard;
