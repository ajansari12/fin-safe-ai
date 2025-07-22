
import { supabase } from '@/integrations/supabase/client';
import { getCurrentUserProfile } from '@/lib/supabase-utils';

export interface AdvancedAnalyticsRequest {
  analysisType: 'predictive' | 'diagnostic' | 'prescriptive' | 'natural_language';
  dataSource: string[];
  timeRange: {
    start: Date;
    end: Date;
  };
  parameters: Record<string, any>;
  outputFormat: 'json' | 'narrative' | 'visualization' | 'executive_summary';
}

export interface PredictiveInsight {
  id: string;
  insight_type: 'risk_forecast' | 'anomaly_prediction' | 'trend_analysis' | 'correlation_discovery';
  confidence_score: number;
  time_horizon: number; // days
  prediction_data: any;
  narrative_summary: string;
  actionable_recommendations: string[];
  supporting_evidence: any[];
  created_at: string;
}

export interface ExecutiveBrief {
  id: string;
  brief_type: 'daily' | 'weekly' | 'monthly' | 'ad_hoc';
  executive_summary: string;
  key_insights: KeyInsight[];
  risk_alerts: RiskAlert[];
  performance_metrics: PerformanceMetric[];
  recommendations: ExecutiveRecommendation[];
  generated_at: string;
  expires_at: string;
}

export interface KeyInsight {
  title: string;
  description: string;
  impact_level: 'low' | 'medium' | 'high' | 'critical';
  category: 'risk' | 'compliance' | 'operational' | 'strategic';
  data_source: string;
  confidence: number;
}

export interface RiskAlert {
  alert_id: string;
  risk_type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  probability: number;
  impact_estimate: string;
  recommended_actions: string[];
  escalation_required: boolean;
}

export interface ExecutiveRecommendation {
  recommendation_id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: 'strategic' | 'operational' | 'compliance' | 'risk';
  expected_impact: string;
  implementation_effort: 'low' | 'medium' | 'high';
  timeline: string;
  dependencies: string[];
  approval_required: boolean;
}

export interface MLPredictionModel {
  model_id: string;
  model_name: string;
  model_type: 'time_series' | 'classification' | 'regression' | 'clustering';
  training_data_source: string;
  features: string[];
  target_variable: string;
  accuracy_score: number;
  last_trained: string;
  next_training: string;
  prediction_horizon: number; // days
  confidence_threshold: number;
}

class AdvancedAnalyticsEngine {
  private openAIApiKey: string | null = null;

  constructor() {
    // API key would be configured through environment variables
  }

  async generatePredictiveInsights(
    request: AdvancedAnalyticsRequest
  ): Promise<PredictiveInsight[]> {
    const profile = await getCurrentUserProfile();
    if (!profile?.organization_id) throw new Error('User organization not found');

    try {
      // Collect and aggregate data from multiple sources
      const aggregatedData = await this.aggregateDataSources(
        request.dataSource,
        request.timeRange,
        profile.organization_id
      );

      // Generate AI insights using edge function
      const { data: aiInsights, error } = await supabase.functions.invoke('ai-analytics-engine', {
        body: {
          type: 'predictive_analysis',
          data: aggregatedData,
          parameters: request.parameters,
          orgId: profile.organization_id
        }
      });

      if (error) throw error;

      // Store insights for future reference
      const insights: PredictiveInsight[] = aiInsights.predictions.map((prediction: any) => ({
        id: `insight-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        insight_type: prediction.type,
        confidence_score: prediction.confidence,
        time_horizon: prediction.timeHorizon,
        prediction_data: prediction.data,
        narrative_summary: prediction.narrative,
        actionable_recommendations: prediction.recommendations,
        supporting_evidence: prediction.evidence,
        created_at: new Date().toISOString()
      }));

      // Store in database for audit trail
      for (const insight of insights) {
        await supabase
          .from('ai_generated_insights')
          .insert({
            org_id: profile.organization_id,
            insight_type: insight.insight_type,
            confidence_score: insight.confidence_score,
            insight_data: {
              prediction_data: insight.prediction_data,
              narrative_summary: insight.narrative_summary,
              recommendations: insight.actionable_recommendations,
              evidence: insight.supporting_evidence
            },
            generated_at: insight.created_at
          });
      }

      return insights;
    } catch (error) {
      console.error('Error generating predictive insights:', error);
      throw error;
    }
  }

  async generateExecutiveBrief(
    briefType: 'daily' | 'weekly' | 'monthly' | 'ad_hoc'
  ): Promise<ExecutiveBrief> {
    const profile = await getCurrentUserProfile();
    if (!profile?.organization_id) throw new Error('User organization not found');

    try {
      // Collect comprehensive data for executive briefing
      const briefData = await this.collectExecutiveBriefData(
        profile.organization_id,
        briefType
      );

      // Generate AI-powered executive brief
      const { data: aiResponse, error } = await supabase.functions.invoke('ai-analytics-engine', {
        body: {
          type: 'executive_brief',
          briefType,
          data: briefData,
          orgId: profile.organization_id
        }
      });

      if (error) throw error;

      const executiveBrief: ExecutiveBrief = {
        id: `brief-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        brief_type: briefType,
        executive_summary: aiResponse.executiveSummary,
        key_insights: aiResponse.keyInsights.map((insight: any) => ({
          title: insight.title,
          description: insight.description,
          impact_level: insight.impactLevel,
          category: insight.category,
          data_source: insight.dataSource,
          confidence: insight.confidence
        })),
        risk_alerts: aiResponse.riskAlerts.map((alert: any) => ({
          alert_id: alert.id,
          risk_type: alert.riskType,
          severity: alert.severity,
          description: alert.description,
          probability: alert.probability,
          impact_estimate: alert.impactEstimate,
          recommended_actions: alert.recommendedActions,
          escalation_required: alert.escalationRequired
        })),
        performance_metrics: aiResponse.performanceMetrics,
        recommendations: aiResponse.recommendations.map((rec: any) => ({
          recommendation_id: rec.id,
          title: rec.title,
          description: rec.description,
          priority: rec.priority,
          category: rec.category,
          expected_impact: rec.expectedImpact,
          implementation_effort: rec.implementationEffort,
          timeline: rec.timeline,
          dependencies: rec.dependencies,
          approval_required: rec.approvalRequired
        })),
        generated_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + (briefType === 'daily' ? 24 : briefType === 'weekly' ? 168 : 720) * 60 * 60 * 1000).toISOString()
      };

      // Store executive brief
      await supabase
        .from('executive_briefs')
        .insert({
          org_id: profile.organization_id,
          brief_type: briefType,
          executive_summary: executiveBrief.executive_summary,
          key_insights: executiveBrief.key_insights,
          risk_alerts: executiveBrief.risk_alerts,
          performance_metrics: executiveBrief.performance_metrics,
          recommendations: executiveBrief.recommendations,
          expires_at: executiveBrief.expires_at
        });

      return executiveBrief;
    } catch (error) {
      console.error('Error generating executive brief:', error);
      throw error;
    }
  }

  async performNaturalLanguageQuery(query: string): Promise<any> {
    const profile = await getCurrentUserProfile();
    if (!profile?.organization_id) throw new Error('User organization not found');

    try {
      const { data: response, error } = await supabase.functions.invoke('ai-analytics-engine', {
        body: {
          type: 'natural_language_query',
          query,
          orgId: profile.organization_id
        }
      });

      if (error) throw error;

      return {
        query,
        interpretation: response.interpretation,
        results: response.results,
        visualizations: response.visualizations,
        narrative_explanation: response.narrative,
        follow_up_questions: response.followUpQuestions
      };
    } catch (error) {
      console.error('Error processing natural language query:', error);
      throw error;
    }
  }

  async detectRealTimeAnomalies(): Promise<any[]> {
    const profile = await getCurrentUserProfile();
    if (!profile?.organization_id) throw new Error('User organization not found');

    try {
      const { data: anomalies, error } = await supabase.functions.invoke('ai-analytics-engine', {
        body: {
          type: 'real_time_anomaly_detection',
          orgId: profile.organization_id
        }
      });

      if (error) throw error;

      return anomalies;
    } catch (error) {
      console.error('Error detecting real-time anomalies:', error);
      throw error;
    }
  }

  private async aggregateDataSources(
    dataSources: string[],
    timeRange: { start: Date; end: Date },
    orgId: string
  ): Promise<any> {
    const aggregatedData: any = {};

    for (const source of dataSources) {
      switch (source) {
        case 'kri_data':
          const { data: kriData } = await supabase
            .from('kri_logs')
            .select('*')
            .eq('org_id', orgId)
            .gte('measurement_date', timeRange.start.toISOString())
            .lte('measurement_date', timeRange.end.toISOString());
          aggregatedData.kri_data = kriData || [];
          break;

        case 'incident_data':
          const { data: incidentData } = await supabase
            .from('incident_logs')
            .select('*')
            .eq('org_id', orgId)
            .gte('created_at', timeRange.start.toISOString())
            .lte('created_at', timeRange.end.toISOString());
          aggregatedData.incident_data = incidentData || [];
          break;

        case 'control_data':
          const { data: controlData } = await supabase
            .from('controls')
            .select('*')
            .eq('org_id', orgId);
          aggregatedData.control_data = controlData || [];
          break;

        case 'risk_appetite_data':
          const { data: appetiteData } = await supabase
            .from('appetite_breach_logs')
            .select('*')
            .eq('org_id', orgId)
            .gte('created_at', timeRange.start.toISOString())
            .lte('created_at', timeRange.end.toISOString());
          aggregatedData.risk_appetite_data = appetiteData || [];
          break;
      }
    }

    return aggregatedData;
  }

  private async collectExecutiveBriefData(
    orgId: string,
    briefType: string
  ): Promise<any> {
    const timeRange = this.getTimeRangeForBrief(briefType);
    
    // Collect data from all major modules
    const [
      kriData,
      incidentData,
      controlData,
      appetiteData,
      complianceData
    ] = await Promise.all([
      supabase.from('kri_logs').select('*').eq('org_id', orgId).gte('created_at', timeRange.start),
      supabase.from('incident_logs').select('*').eq('org_id', orgId).gte('created_at', timeRange.start),
      supabase.from('controls').select('*').eq('org_id', orgId),
      supabase.from('appetite_breach_logs').select('*').eq('org_id', orgId).gte('created_at', timeRange.start),
      supabase.from('governance_policies').select('*').eq('org_id', orgId)
    ]);

    return {
      timeRange,
      kriData: kriData.data || [],
      incidentData: incidentData.data || [],
      controlData: controlData.data || [],
      appetiteData: appetiteData.data || [],
      complianceData: complianceData.data || []
    };
  }

  private getTimeRangeForBrief(briefType: string): { start: string; end: string } {
    const now = new Date();
    const start = new Date();

    switch (briefType) {
      case 'daily':
        start.setDate(now.getDate() - 1);
        break;
      case 'weekly':
        start.setDate(now.getDate() - 7);
        break;
      case 'monthly':
        start.setMonth(now.getMonth() - 1);
        break;
      default:
        start.setDate(now.getDate() - 30);
    }

    return {
      start: start.toISOString(),
      end: now.toISOString()
    };
  }
}

export const advancedAnalyticsEngine = new AdvancedAnalyticsEngine();
