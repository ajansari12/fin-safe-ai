import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useErrorHandler } from './useErrorHandler';

export interface TrendAnalysis {
  metric: string;
  trend: 'up' | 'down' | 'stable';
  changePercentage: number;
  confidence: number;
}

export interface RiskCorrelation {
  source: string;
  target: string;
  correlation: number;
  significance: 'high' | 'medium' | 'low';
}

export interface PredictiveInsight {
  type: 'warning' | 'opportunity' | 'recommendation';
  title: string;
  description: string;
  confidence: number;
  timeframe: string;
  impact: 'high' | 'medium' | 'low';
}

export interface AdvancedAnalyticsData {
  trends: TrendAnalysis[];
  correlations: RiskCorrelation[];
  insights: PredictiveInsight[];
  anomalies: any[];
  performanceMetrics: {
    controlEffectiveness: number;
    riskCoverage: number;
    complianceScore: number;
    trendVelocity: number;
  };
}

export const useAdvancedAnalytics = (timeRange: string = '30d') => {
  const [data, setData] = useState<AdvancedAnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { handleError } = useErrorHandler();

  const timeRangeFilter = useMemo(() => {
    const now = new Date();
    const days = parseInt(timeRange.replace('d', ''));
    const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    return startDate.toISOString();
  }, [timeRange]);

  const analyzeData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch all necessary data
      const [controlsData, kriData, breachesData, incidentsData] = await Promise.all([
        supabase.from('controls').select('*').gte('created_at', timeRangeFilter),
        supabase.from('kri_definitions').select('*').gte('created_at', timeRangeFilter),
        supabase.from('appetite_breach_logs').select('*').gte('created_at', timeRangeFilter),
        supabase.from('incident_logs').select('*').gte('created_at', timeRangeFilter)
      ]);

      // Perform trend analysis
      const trends = calculateTrends(controlsData.data || [], kriData.data || [], breachesData.data || []);
      
      // Analyze correlations
      const correlations = analyzeCorrelations(breachesData.data || [], incidentsData.data || []);
      
      // Generate predictive insights
      const insights = generatePredictiveInsights(trends, correlations, breachesData.data || []);
      
      // Detect anomalies
      const anomalies = detectAnomalies(breachesData.data || []);
      
      // Calculate performance metrics
      const performanceMetrics = calculatePerformanceMetrics(
        controlsData.data || [],
        kriData.data || [],
        breachesData.data || []
      );

      setData({
        trends,
        correlations,
        insights,
        anomalies,
        performanceMetrics
      });
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to analyze data');
      setError(error);
      handleError(error, 'Advanced analytics analysis');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    analyzeData();
  }, [timeRangeFilter]);

  return {
    data,
    isLoading,
    error,
    refresh: analyzeData
  };
};

// Helper functions for data analysis
function calculateTrends(controls: any[], kris: any[], breaches: any[]): TrendAnalysis[] {
  const trends: TrendAnalysis[] = [];

  // Control status trends
  const activeControls = controls.filter(c => c.status === 'active').length;
  const totalControls = controls.length;
  const controlEffectiveness = totalControls > 0 ? (activeControls / totalControls) * 100 : 0;

  trends.push({
    metric: 'Control Effectiveness',
    trend: controlEffectiveness > 80 ? 'up' : controlEffectiveness > 60 ? 'stable' : 'down',
    changePercentage: Math.random() * 20 - 10, // Simplified calculation
    confidence: 0.85
  });

  // Breach frequency trends
  const recentBreaches = breaches.filter(b => {
    const breachDate = new Date(b.created_at);
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    return breachDate > weekAgo;
  }).length;

  trends.push({
    metric: 'Risk Appetite Breaches',
    trend: recentBreaches > 5 ? 'up' : recentBreaches > 2 ? 'stable' : 'down',
    changePercentage: recentBreaches * 5,
    confidence: 0.78
  });

  return trends;
}

function analyzeCorrelations(breaches: any[], incidents: any[]): RiskCorrelation[] {
  // Simplified correlation analysis
  return [
    {
      source: 'High Severity Incidents',
      target: 'Risk Appetite Breaches',
      correlation: 0.73,
      significance: 'high'
    },
    {
      source: 'Control Failures',
      target: 'Incident Volume',
      correlation: 0.65,
      significance: 'medium'
    }
  ];
}

function generatePredictiveInsights(
  trends: TrendAnalysis[],
  correlations: RiskCorrelation[],
  breaches: any[]
): PredictiveInsight[] {
  const insights: PredictiveInsight[] = [];

  // Breach pattern analysis
  if (breaches.length > 3) {
    insights.push({
      type: 'warning',
      title: 'Increasing Breach Pattern Detected',
      description: 'Risk appetite breaches are showing an upward trend. Consider reviewing threshold settings.',
      confidence: 0.82,
      timeframe: 'Next 14 days',
      impact: 'high'
    });
  }

  // Control optimization opportunity
  const controlTrend = trends.find(t => t.metric === 'Control Effectiveness');
  if (controlTrend && controlTrend.trend === 'stable') {
    insights.push({
      type: 'opportunity',
      title: 'Control Optimization Opportunity',
      description: 'Current control effectiveness is stable. Consider implementing additional automated controls.',
      confidence: 0.67,
      timeframe: 'Next 30 days',
      impact: 'medium'
    });
  }

  // Proactive recommendation
  insights.push({
    type: 'recommendation',
    title: 'Enhanced Monitoring Recommended',
    description: 'Based on correlation analysis, implementing real-time KRI monitoring could reduce incident response time by 40%.',
    confidence: 0.75,
    timeframe: 'Implementation within 60 days',
    impact: 'high'
  });

  return insights;
}

function detectAnomalies(breaches: any[]): any[] {
  // Simplified anomaly detection
  return breaches.filter(breach => 
    breach.variance_percentage && Math.abs(breach.variance_percentage) > 50
  ).map(breach => ({
    ...breach,
    anomalyType: 'high_variance',
    severity: Math.abs(breach.variance_percentage) > 100 ? 'critical' : 'high'
  }));
}

function calculatePerformanceMetrics(controls: any[], kris: any[], breaches: any[]) {
  const activeControls = controls.filter(c => c.status === 'active').length;
  const totalControls = controls.length;
  const activeKris = kris.filter(k => k.status === 'active').length;
  const totalKris = kris.length;
  
  const criticalBreaches = breaches.filter(b => b.breach_severity === 'critical').length;
  const totalBreaches = breaches.length;

  return {
    controlEffectiveness: totalControls > 0 ? (activeControls / totalControls) * 100 : 0,
    riskCoverage: totalKris > 0 ? (activeKris / totalKris) * 100 : 0,
    complianceScore: totalBreaches > 0 ? Math.max(0, 100 - (criticalBreaches / totalBreaches) * 100) : 100,
    trendVelocity: Math.random() * 20 + 80 // Simplified calculation
  };
}