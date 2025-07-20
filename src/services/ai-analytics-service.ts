
import { supabase } from "@/integrations/supabase/client";
import { getCurrentUserProfile } from "@/lib/supabase-utils";

export interface AIAnalyticsRequest {
  analysisType: 'predictive' | 'anomaly' | 'correlation' | 'recommendation' | 'insight';
  dataSource: string[];
  timeRange?: {
    start: string;
    end: string;
  };
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
  async generateInsights(request: AIAnalyticsRequest): Promise<AnalyticsResult> {
    try {
      const profile = await getCurrentUserProfile();
      if (!profile?.organization_id) {
        throw new Error('No organization context available');
      }

      console.log(`Generating AI insights: ${request.analysisType}`);

      const response = await supabase.functions.invoke('ai-analytics-engine', {
        body: {
          ...request,
          userId: profile.id,
          orgId: profile.organization_id
        }
      });

      if (response.error) {
        throw new Error(response.error.message || 'AI analytics processing failed');
      }

      return response.data as AnalyticsResult;
    } catch (error) {
      console.error('AI Analytics Service error:', error);
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
      const profile = await getCurrentUserProfile();
      if (!profile?.organization_id) return [];

      const { data, error } = await supabase
        .from('ai_insights')
        .select('*')
        .eq('org_id', profile.organization_id)
        .gte('expires_at', new Date().toISOString())
        .order('generated_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Error fetching stored insights:', error);
        return [];
      }

      return (data || []).map(item => ({
        id: item.id,
        type: item.insight_type,
        title: item.title,
        description: item.description,
        severity: item.severity,
        confidence: item.confidence,
        recommendations: item.recommendations || [],
        dataPoints: item.data_points || [],
        generatedAt: item.generated_at,
        expiresAt: item.expires_at
      }));
    } catch (error) {
      console.error('Error getting stored insights:', error);
      return [];
    }
  }

  async generatePredictiveAnalysis(dataSource: string[] = ['kri', 'incidents']): Promise<AnalyticsResult> {
    return this.generateInsights({
      analysisType: 'predictive',
      dataSource,
      timeRange: {
        start: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
        end: new Date().toISOString()
      }
    });
  }

  async detectAnomalies(dataSource: string[] = ['incidents', 'kri']): Promise<AnalyticsResult> {
    return this.generateInsights({
      analysisType: 'anomaly',
      dataSource,
      timeRange: {
        start: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
        end: new Date().toISOString()
      }
    });
  }

  async analyzeCorrelations(dataSource: string[] = ['all']): Promise<AnalyticsResult> {
    return this.generateInsights({
      analysisType: 'correlation',
      dataSource,
      timeRange: {
        start: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
        end: new Date().toISOString()
      }
    });
  }

  async generateRecommendations(): Promise<AnalyticsResult> {
    return this.generateInsights({
      analysisType: 'recommendation',
      dataSource: ['all']
    });
  }

  async generateExecutiveInsights(): Promise<AnalyticsResult> {
    return this.generateInsights({
      analysisType: 'insight',
      dataSource: ['all'],
      timeRange: {
        start: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
        end: new Date().toISOString()
      }
    });
  }
}

export const aiAnalyticsService = new AIAnalyticsService();
