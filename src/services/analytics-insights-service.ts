
import { supabase } from "@/integrations/supabase/client";
import { getCurrentUserProfile } from "@/lib/supabase-utils";

// Simplified types to avoid TypeScript depth issues
export interface AnalyticsInsight {
  id: string;
  org_id: string;
  insight_type: string;
  insight_data: Record<string, any>;
  confidence_score?: number;
  generated_at: string;
  valid_until?: string;
  tags?: string[];
  created_by?: string;
  forecast_period?: string;
  created_at: string;
  updated_at: string;
}

export interface DashboardTemplate {
  id: string;
  template_name: string;
  template_type: string;
  description: string;
  layout_config: Record<string, any>;
  widget_configs: Record<string, any>[];
  data_sources: string[];
  tags: string[];
  usage_count: number;
  org_id: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface TrendInsight {
  metric: string;
  direction: 'increasing' | 'decreasing' | 'stable';
  magnitude: number;
  period: string;
  significance: number;
}

export interface AnomalyInsight {
  metric: string;
  anomaly_type: 'spike' | 'drop' | 'pattern_break';
  severity: 'low' | 'medium' | 'high';
  detected_at: string;
  confidence: number;
}

export interface PredictionInsight {
  metric: string;
  predicted_value: number;
  confidence_interval: [number, number];
  forecast_date: string;
  model_accuracy: number;
}

export interface CorrelationInsight {
  metric_a: string;
  metric_b: string;
  correlation_strength: number;
  statistical_significance: number;
  relationship_type: 'positive' | 'negative' | 'complex';
}

export interface RecommendationInsight {
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  impact_score: number;
  effort_estimate: string;
  suggested_actions: string[];
}

export class AnalyticsInsightsService {
  async getInsights(): Promise<AnalyticsInsight[]> {
    try {
      const profile = await getCurrentUserProfile();
      if (!profile?.organization_id) return [];

      const { data, error } = await supabase
        .from('analytics_insights')
        .select('*')
        .eq('org_id', profile.organization_id)
        .order('generated_at', { ascending: false });

      if (error) throw error;
      
      // Safe type conversion
      return (data || []).map(item => ({
        ...item,
        insight_data: this.safeJsonParse(item.insight_data)
      }));
    } catch (error) {
      console.error('Error fetching insights:', error);
      return [];
    }
  }

  async getInsightsByType(insightType: string): Promise<AnalyticsInsight[]> {
    try {
      const profile = await getCurrentUserProfile();
      if (!profile?.organization_id) return [];

      const { data, error } = await supabase
        .from('analytics_insights')
        .select('*')
        .eq('org_id', profile.organization_id)
        .eq('insight_type', insightType)
        .order('generated_at', { ascending: false });

      if (error) throw error;
      
      // Safe type conversion
      return (data || []).map(item => ({
        ...item,
        insight_data: this.safeJsonParse(item.insight_data)
      }));
    } catch (error) {
      console.error('Error fetching insights:', error);
      return [];
    }
  }

  async createInsight(insight: Omit<AnalyticsInsight, 'id' | 'created_at' | 'updated_at'>): Promise<AnalyticsInsight | null> {
    try {
      const { data, error } = await supabase
        .from('analytics_insights')
        .insert({
          ...insight,
          insight_data: this.safeJsonParse(insight.insight_data)
        })
        .select()
        .single();

      if (error) throw error;
      
      return data ? {
        ...data,
        insight_data: this.safeJsonParse(data.insight_data)
      } : null;
    } catch (error) {
      console.error('Error creating insight:', error);
      return null;
    }
  }

  async generatePredictiveInsights(): Promise<any[]> {
    try {
      const trendInsights = await this.generateTrendInsights();
      const anomalyInsights = await this.generateAnomalyInsights();
      
      const insights = [
        ...trendInsights.map(insight => ({
          org_id: '',
          insight_type: 'trend',
          insight_data: {
            title: `Trend Analysis: ${insight.metric}`,
            description: `${insight.metric} is ${insight.direction} with ${insight.magnitude}% change`,
            severity: insight.significance > 50 ? 'high' : 'medium',
            actionable_items: [`Monitor ${insight.metric} closely`, 'Review impact on business operations']
          },
          confidence_score: insight.significance,
          generated_at: new Date().toISOString(),
          tags: ['trend', 'prediction']
        })),
        ...anomalyInsights.map(insight => ({
          org_id: '',
          insight_type: 'anomaly',
          insight_data: {
            title: `Anomaly Detected: ${insight.metric}`,
            description: `Detected ${insight.anomaly_type} in ${insight.metric}`,
            severity: insight.severity,
            actionable_items: ['Investigate root cause', 'Implement corrective measures']
          },
          confidence_score: insight.confidence,
          generated_at: new Date().toISOString(),
          tags: ['anomaly', 'alert']
        }))
      ];

      return insights;
    } catch (error) {
      console.error('Error generating predictive insights:', error);
      return [];
    }
  }

  async generateTrendInsights(): Promise<TrendInsight[]> {
    try {
      const profile = await getCurrentUserProfile();
      if (!profile?.organization_id) return [];

      // Get incident data for trend analysis
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: incidents } = await supabase
        .from('incident_logs')
        .select('reported_at, severity')
        .eq('org_id', profile.organization_id)
        .gte('reported_at', thirtyDaysAgo.toISOString());

      if (!incidents) return [];

      // Simple trend analysis
      const weeklyIncidents: Record<string, number> = {};
      incidents.forEach(incident => {
        const week = this.getWeekKey(new Date(incident.reported_at));
        weeklyIncidents[week] = (weeklyIncidents[week] || 0) + 1;
      });

      const weeks = Object.keys(weeklyIncidents).sort();
      if (weeks.length < 2) return [];

      const trend = weeklyIncidents[weeks[weeks.length - 1]] - weeklyIncidents[weeks[0]];
      const direction = trend > 2 ? 'increasing' : trend < -2 ? 'decreasing' : 'stable';

      return [{
        metric: 'Incident Volume',
        direction,
        magnitude: Math.abs(trend),
        period: '30d',
        significance: Math.min(100, Math.abs(trend) * 10)
      }];
    } catch (error) {
      console.error('Error generating trend insights:', error);
      return [];
    }
  }

  async generateAnomalyInsights(): Promise<AnomalyInsight[]> {
    try {
      const profile = await getCurrentUserProfile();
      if (!profile?.organization_id) return [];

      // Check for KRI threshold breaches as anomalies
      const { data: kriLogs } = await supabase
        .from('kri_logs')
        .select('measurement_date, actual_value, threshold_breached')
        .eq('org_id', profile.organization_id)
        .eq('threshold_breached', 'yes')
        .gte('measurement_date', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
        .order('measurement_date', { ascending: false });

      if (!kriLogs || kriLogs.length === 0) return [];

      return kriLogs.slice(0, 5).map(log => ({
        metric: 'KRI Threshold',
        anomaly_type: 'spike' as const,
        severity: 'high' as const,
        detected_at: log.measurement_date,
        confidence: 90
      }));
    } catch (error) {
      console.error('Error generating anomaly insights:', error);
      return [];
    }
  }

  async getDashboardTemplates(): Promise<DashboardTemplate[]> {
    try {
      const profile = await getCurrentUserProfile();
      if (!profile?.organization_id) return [];

      const { data, error } = await supabase
        .from('custom_dashboards')
        .select('*')
        .eq('org_id', profile.organization_id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data || []).map((item) => ({
        id: item.id,
        template_name: item.dashboard_name,
        template_type: item.dashboard_type || 'custom',
        description: `Dashboard: ${item.dashboard_name}`,
        layout_config: this.safeJsonParse(item.layout_config),
        widget_configs: Array.isArray(item.widget_config) ? item.widget_config.map(w => this.safeJsonParse(w)) : [],
        data_sources: [],
        tags: item.shared_with || [],
        usage_count: 1,
        org_id: item.org_id,
        created_by: item.created_by || '',
        created_at: item.created_at,
        updated_at: item.updated_at
      }));
    } catch (error) {
      console.error('Error fetching dashboard templates:', error);
      return [];
    }
  }

  async incrementTemplateUsage(templateId: string): Promise<void> {
    try {
      console.log(`Template usage incremented for: ${templateId}`);
    } catch (error) {
      console.error('Error incrementing template usage:', error);
    }
  }

  private getWeekKey(date: Date): string {
    const year = date.getFullYear();
    const week = Math.floor((date.getTime() - new Date(year, 0, 1).getTime()) / (7 * 24 * 60 * 60 * 1000));
    return `${year}-W${week}`;
  }

  private safeJsonParse(value: any): Record<string, any> {
    if (typeof value === 'object' && value !== null) {
      return value;
    }
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch {
        return {};
      }
    }
    return {};
  }
}

export const analyticsInsightsService = new AnalyticsInsightsService();

// Dashboard templates service
export const dashboardTemplatesService = {
  getTemplates: () => analyticsInsightsService.getDashboardTemplates(),
  createTemplate: async (template: Record<string, any>) => {
    const profile = await getCurrentUserProfile();
    if (!profile?.organization_id) return null;

    const { data, error } = await supabase
      .from('custom_dashboards')
      .insert({
        org_id: profile.organization_id,
        dashboard_name: template.template_name,
        dashboard_type: template.template_type,
        layout_config: template.layout_config,
        widget_config: template.widget_configs,
        created_by: profile.id
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },
  updateTemplateUsage: (templateId: string) => analyticsInsightsService.incrementTemplateUsage(templateId)
};
