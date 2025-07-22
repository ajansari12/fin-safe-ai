import { supabase } from "@/integrations/supabase/client";

export interface AnalyticsRequest {
  analysisType: 'predictive' | 'anomaly' | 'correlation' | 'recommendation' | 'insight';
  dataSource: string[];
  timeRange?: { start: string; end: string };
  parameters?: Record<string, any>;
}

export interface AIInsight {
  id: string;
  type: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  confidence: number;
  recommendations: string[];
  dataPoints: any[];
  generatedAt: string;
  expiresAt?: string;
}

export interface AnalyticsResult {
  success: boolean;
  insights: AIInsight[];
  dataPointsAnalyzed: number;
  generatedAt: string;
  error?: string;
}

class AIAnalyticsService {
  async generateInsights(request: AnalyticsRequest): Promise<AnalyticsResult> {
    try {
      const { data, error } = await supabase.functions.invoke('advanced-ai-analytics', {
        body: request
      });

      if (error) {
        throw new Error(error.message);
      }

      return data;
    } catch (error) {
      console.error('Error generating AI insights:', error);
      return {
        success: false,
        insights: [],
        dataPointsAnalyzed: 0,
        generatedAt: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async getStoredInsights(): Promise<AIInsight[]> {
    try {
      const { data, error } = await supabase
        .from('ai_insights')
        .select('*')
        .order('generated_at', { ascending: false })
        .limit(50);

      if (error) {
        throw new Error(error.message);
      }

      return data?.map(insight => ({
        id: insight.id,
        type: insight.insight_type,
        title: insight.title,
        description: insight.description,
        severity: insight.severity,
        confidence: insight.confidence,
        recommendations: insight.recommendations || [],
        dataPoints: insight.data_points || [],
        generatedAt: insight.generated_at,
        expiresAt: insight.expires_at
      })) || [];
    } catch (error) {
      console.error('Error fetching stored insights:', error);
      return [];
    }
  }

  async generatePredictiveAnalysis(dataSource?: string[]): Promise<AnalyticsResult> {
    return this.generateInsights({
      analysisType: 'predictive',
      dataSource: dataSource || ['kri_definitions', 'incident_logs', 'controls']
    });
  }

  async detectAnomalies(dataSource?: string[]): Promise<AnalyticsResult> {
    return this.generateInsights({
      analysisType: 'anomaly',
      dataSource: dataSource || ['kri_logs', 'performance_metrics']
    });
  }

  async analyzeCorrelations(dataSource?: string[]): Promise<AnalyticsResult> {
    return this.generateInsights({
      analysisType: 'correlation',
      dataSource: dataSource || ['kri_definitions', 'incident_logs', 'controls']
    });
  }

  async generateRecommendations(): Promise<AnalyticsResult> {
    return this.generateInsights({
      analysisType: 'recommendation',
      dataSource: ['organizational_profiles', 'kri_definitions', 'controls']
    });
  }

  async generateExecutiveInsights(): Promise<AnalyticsResult> {
    return this.generateInsights({
      analysisType: 'insight',
      dataSource: ['dashboard_metrics', 'incident_logs', 'compliance_status']
    });
  }
}

export const aiAnalyticsService = new AIAnalyticsService();