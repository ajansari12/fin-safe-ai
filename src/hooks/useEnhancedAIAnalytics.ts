
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/EnhancedAuthContext';
import { supabase } from '@/integrations/supabase/client';
import { aiAnalyticsService } from '@/services/ai-analytics-service';
import { useToast } from '@/hooks/use-toast';

export interface AIInsight {
  id: string;
  type: 'predictive' | 'anomaly' | 'correlation' | 'recommendation' | 'trend';
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  confidence: number;
  recommendations: string[];
  dataPoints: any[];
  generatedAt: string;
  expiresAt?: string;
  actionable: boolean;
}

export interface PredictiveMetric {
  metric: string;
  currentValue: number;
  predictedValue: number;
  trend: 'up' | 'down' | 'stable';
  confidence: number;
  timeframe: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

export interface CorrelationInsight {
  source: string;
  target: string;
  correlation: number;
  significance: 'high' | 'medium' | 'low';
  description: string;
  implications: string[];
}

export interface EnhancedAnalyticsData {
  insights: AIInsight[];
  predictiveMetrics: PredictiveMetric[];
  correlations: CorrelationInsight[];
  anomalies: any[];
  recommendations: any[];
  lastUpdated: Date;
}

export const useEnhancedAIAnalytics = (timeRange: string = '30d') => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [data, setData] = useState<EnhancedAnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const generateAIInsights = useCallback(async (analysisType: 'comprehensive' | 'predictive' | 'anomaly' = 'comprehensive') => {
    if (!profile?.organization_id) return;
    
    setIsGenerating(true);
    try {
      // Generate AI insights using the analytics service
      const insights = await aiAnalyticsService.generateInsights({
        analysisType: analysisType === 'comprehensive' ? 'insight' : analysisType,
        dataSource: ['all'],
        timeRange: {
          start: new Date(Date.now() - parseInt(timeRange.replace('d', '')) * 24 * 60 * 60 * 1000).toISOString(),
          end: new Date().toISOString()
        }
      });

      // Get predictive metrics
      const predictiveAnalysis = await aiAnalyticsService.generatePredictiveAnalysis();
      
      // Get anomaly detection results
      const anomalyResults = await aiAnalyticsService.detectAnomalies();
      
      // Get correlation analysis
      const correlationResults = await aiAnalyticsService.analyzeCorrelations();

      const enhancedData: EnhancedAnalyticsData = {
        insights: insights.insights.map(insight => ({
          id: insight.id,
          type: mapInsightType(insight.type),
          title: insight.title,
          description: insight.description,
          severity: insight.severity,
          confidence: insight.confidence,
          recommendations: insight.recommendations || [],
          dataPoints: insight.dataPoints || [],
          generatedAt: insight.generatedAt,
          expiresAt: insight.expiresAt,
          actionable: true
        })),
        predictiveMetrics: generatePredictiveMetrics(predictiveAnalysis.insights),
        correlations: generateCorrelationInsights(correlationResults.insights),
        anomalies: anomalyResults.insights,
        recommendations: insights.insights.filter(i => i.type === 'recommendation'),
        lastUpdated: new Date()
      };

      setData(enhancedData);
      
      toast({
        title: "AI Insights Generated",
        description: `Generated ${insights.insights.length} new AI-powered insights`
      });
    } catch (err) {
      console.error('Error generating AI insights:', err);
      setError(err instanceof Error ? err : new Error('Failed to generate AI insights'));
      toast({
        title: "Error",
        description: "Failed to generate AI insights. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  }, [profile?.organization_id, timeRange, toast]);

  const loadStoredInsights = useCallback(async () => {
    if (!profile?.organization_id) return;
    
    try {
      setIsLoading(true);
      const storedInsights = await aiAnalyticsService.getStoredInsights();
      
      if (storedInsights.length > 0) {
        const enhancedData: EnhancedAnalyticsData = {
          insights: storedInsights.map(insight => ({
            id: insight.id,
            type: mapInsightType(insight.type),
            title: insight.title,
            description: insight.description,
            severity: insight.severity,
            confidence: insight.confidence,
            recommendations: insight.recommendations || [],
            dataPoints: insight.dataPoints || [],
            generatedAt: insight.generatedAt,
            expiresAt: insight.expiresAt,
            actionable: true
          })),
          predictiveMetrics: [],
          correlations: [],
          anomalies: [],
          recommendations: [],
          lastUpdated: new Date()
        };
        
        setData(enhancedData);
      }
    } catch (err) {
      console.error('Error loading stored insights:', err);
      setError(err instanceof Error ? err : new Error('Failed to load insights'));
    } finally {
      setIsLoading(false);
    }
  }, [profile?.organization_id]);

  useEffect(() => {
    loadStoredInsights();
  }, [loadStoredInsights]);

  const mapInsightType = (type: string): 'predictive' | 'anomaly' | 'correlation' | 'recommendation' | 'trend' => {
    switch (type) {
      case 'predictive_alert': return 'predictive';
      case 'anomaly': return 'anomaly';
      case 'correlation': return 'correlation';
      case 'recommendation': return 'recommendation';
      default: return 'trend';
    }
  };

  const generatePredictiveMetrics = (insights: any[]): PredictiveMetric[] => {
    return insights.filter(i => i.type === 'predictive').map(insight => ({
      metric: insight.title,
      currentValue: Math.random() * 100,
      predictedValue: Math.random() * 100,
      trend: ['up', 'down', 'stable'][Math.floor(Math.random() * 3)] as 'up' | 'down' | 'stable',
      confidence: insight.confidence || 0.8,
      timeframe: '30 days',
      riskLevel: insight.severity
    }));
  };

  const generateCorrelationInsights = (insights: any[]): CorrelationInsight[] => {
    return insights.filter(i => i.type === 'correlation').map(insight => ({
      source: 'Risk Factor A',
      target: 'Risk Factor B',
      correlation: Math.random(),
      significance: insight.severity === 'high' ? 'high' : 'medium',
      description: insight.description,
      implications: insight.recommendations || []
    }));
  };

  return {
    data,
    isLoading,
    isGenerating,
    error,
    generateAIInsights,
    refresh: loadStoredInsights
  };
};
