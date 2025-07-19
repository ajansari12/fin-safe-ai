
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
// TODO: Migrated from AuthContext to EnhancedAuthContext
import { useAuth } from '@/contexts/EnhancedAuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import AIStatusVerification from '@/components/ai-assistant/AIStatusVerification';
import ErrorBoundary from '@/components/common/ErrorBoundary';
import { DashboardSkeleton } from './AnalyticsLoadingStates';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { useRealtimeMetrics } from '@/hooks/useRealtimeMetrics';
import OSFIComplianceWidgets from './OSFIComplianceWidgets';
import NotificationCenter from '@/components/notifications/NotificationCenter';
import RealtimeIndicator from '@/components/common/RealtimeIndicator';
import AllInsightsDialog from '@/components/dialogs/AllInsightsDialog';

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
const ControlsDashboard = lazy(() => 
  import('../controls/ControlsDashboard').then(module => ({ default: module.default }))
);
const AdvancedAnalyticsDashboard = lazy(() => 
  import('./AdvancedAnalyticsDashboard').then(module => ({ default: module.default }))
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
  const [showAllInsights, setShowAllInsights] = useState(false);
  const { handleError } = useErrorHandler();

  // Set up real-time monitoring for analytics
  const { connectionStatus, lastUpdate } = useRealtimeMetrics({
    enabled: !!profile?.organization_id
  });

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
        <div className="flex items-center gap-3">
          <NotificationCenter />
          <RealtimeIndicator 
            connectionStatus={connectionStatus}
            lastUpdate={lastUpdate}
          />
          <Button 
            onClick={() => loadAutomatedInsights()}
            disabled={isGeneratingInsights}
            className="flex items-center gap-2"
          >
            <Brain className="h-4 w-4" />
            {isGeneratingInsights ? 'Generating...' : 'Refresh Insights'}
          </Button>
        </div>
      </div>

      {/* OSFI E-21 Compliance Widgets */}
      <ErrorBoundary 
        title="OSFI Compliance Error"
        description="Unable to load OSFI compliance status"
      >
        <OSFIComplianceWidgets />
      </ErrorBoundary>

      {/* Executive Predictive Insights Summary */}
      {activeTab === 'executive' && (
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="border-orange-200 bg-orange-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-full">
                  <TrendingUp className="h-4 w-4 text-orange-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-orange-900">Predictive Breach Alert</p>
                  <p className="text-xs text-orange-700">KRI threshold breach predicted in 15 days</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-full">
                  <Brain className="h-4 w-4 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-blue-900">AI Risk Forecast</p>
                  <p className="text-xs text-blue-700">Cyber risk trending up 12% per OSFI B-13</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-green-200 bg-green-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-full">
                  <Shield className="h-4 w-4 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-green-900">E-21 Compliance</p>
                  <p className="text-xs text-green-700">86% implementation progress</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* AI-Generated Insights Banner with Error Handling */}
      <ErrorBoundary 
        title="AI Insights Error"
        description="Unable to load AI-generated insights"
      >
        {dataError ? (
          <div className="text-center p-8">
            <h3 className="text-lg font-medium mb-2">Insights Unavailable</h3>
            <p className="text-muted-foreground mb-4">Unable to load AI-generated insights. Please try refreshing.</p>
            <Button onClick={() => loadAutomatedInsights()}>Retry</Button>
          </div>
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
                  <Button variant="ghost" size="sm" onClick={() => setShowAllInsights(true)}>
                    View all {insights.length} insights
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ) : !isGeneratingInsights ? (
          <div className="text-center p-8">
            <Brain className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">No Insights Available</h3>
            <p className="text-muted-foreground mb-4">AI insights will appear here as your data grows. Continue using the platform to generate meaningful insights.</p>
            <Button onClick={() => loadAutomatedInsights()}>Generate Insights</Button>
          </div>
        ) : null}
      </ErrorBoundary>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-1">
          <TabsTrigger 
            value="executive" 
            className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm min-h-[44px] px-2 sm:px-3"
            aria-label="Executive dashboard with high-level metrics"
          >
            <BarChart3 className="h-3 w-3 sm:h-4 sm:w-4" aria-hidden="true" />
            <span className="hidden sm:inline">Executive</span>
            <span className="sm:hidden">Exec</span>
          </TabsTrigger>
          <TabsTrigger 
            value="operational" 
            className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm min-h-[44px] px-2 sm:px-3"
            aria-label="Operational dashboard with detailed metrics"
          >
            <Target className="h-3 w-3 sm:h-4 sm:w-4" aria-hidden="true" />
            <span className="hidden sm:inline">Operational</span>
            <span className="sm:hidden">Ops</span>
          </TabsTrigger>
          <TabsTrigger 
            value="controls" 
            className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm min-h-[44px] px-2 sm:px-3"
            aria-label="Controls dashboard showing security and compliance"
          >
            <Shield className="h-3 w-3 sm:h-4 sm:w-4" aria-hidden="true" />
            <span className="hidden sm:inline">Controls</span>
            <span className="sm:hidden">Ctrl</span>
          </TabsTrigger>
          <TabsTrigger 
            value="advanced" 
            className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm min-h-[44px] px-2 sm:px-3"
            aria-label="Advanced analytics with AI insights"
          >
            <Brain className="h-3 w-3 sm:h-4 sm:w-4" aria-hidden="true" />
            <span className="hidden sm:inline">Advanced</span>
            <span className="sm:hidden">AI</span>
          </TabsTrigger>
          <TabsTrigger 
            value="predictive" 
            className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm min-h-[44px] px-2 sm:px-3"
            aria-label="Predictive analytics and forecasting"
          >
            <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4" aria-hidden="true" />
            <span className="hidden sm:inline">Predictive</span>
            <span className="sm:hidden">Pred</span>
          </TabsTrigger>
          <TabsTrigger 
            value="custom" 
            className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm min-h-[44px] px-2 sm:px-3"
            aria-label="Custom dashboard builder"
          >
            <Settings className="h-3 w-3 sm:h-4 sm:w-4" aria-hidden="true" />
            <span className="hidden sm:inline">Custom</span>
            <span className="sm:hidden">Edit</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="executive" className="space-y-6">
          <ErrorBoundary 
            title="Executive Dashboard Error"
            description="Unable to load executive dashboard"
          >
            <Suspense fallback={<EnhancedDashboardSkeleton />}>
              <ExecutiveDashboard />
            </Suspense>
          </ErrorBoundary>
        </TabsContent>

        <TabsContent value="operational" className="space-y-6">
          <ErrorBoundary 
            title="Operational Dashboard Error"
            description="Unable to load operational dashboard"
          >
            <Suspense fallback={<EnhancedDashboardSkeleton />}>
              <OperationalDashboard />
            </Suspense>
          </ErrorBoundary>
        </TabsContent>

        <TabsContent value="controls" className="space-y-6">
          <ErrorBoundary 
            title="Controls Dashboard Error"
            description="Unable to load controls dashboard"
          >
            <Suspense fallback={<EnhancedDashboardSkeleton />}>
              <ControlsDashboard />
            </Suspense>
          </ErrorBoundary>
        </TabsContent>

        <TabsContent value="advanced" className="space-y-6">
          <ErrorBoundary 
            title="Advanced Analytics Error"
            description="Unable to load advanced analytics dashboard"
          >
            <Suspense fallback={<EnhancedDashboardSkeleton />}>
              <AdvancedAnalyticsDashboard />
            </Suspense>
          </ErrorBoundary>
        </TabsContent>

        <TabsContent value="predictive" className="space-y-6">
          <ErrorBoundary 
            title="AI Status Verification Error"
            description="Unable to verify AI status"
          >
            <AIStatusVerification />
          </ErrorBoundary>
          <ErrorBoundary 
            title="Predictive Analytics Error"
            description="Unable to load predictive analytics"
          >
            <Suspense fallback={<EnhancedDashboardSkeleton />}>
              <PredictiveAnalyticsPanel />
            </Suspense>
          </ErrorBoundary>
        </TabsContent>

        <TabsContent value="custom" className="space-y-6">
          <ErrorBoundary 
            title="Custom Dashboard Builder Error"
            description="Unable to load custom dashboard builder"
          >
            <Suspense fallback={<EnhancedDashboardSkeleton />}>
              <CustomDashboardBuilder />
            </Suspense>
          </ErrorBoundary>
        </TabsContent>
      </Tabs>

      {/* All Insights Dialog */}
      <AllInsightsDialog 
        open={showAllInsights} 
        onOpenChange={setShowAllInsights} 
      />
    </div>
  );
};

export default UnifiedAnalyticsDashboard;
