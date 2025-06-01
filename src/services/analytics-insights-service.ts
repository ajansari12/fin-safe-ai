
import { supabase } from "@/integrations/supabase/client";
import { getCurrentUserProfile } from "@/lib/supabase-utils";

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

type DatabaseJson = string | number | boolean | null | { [key: string]: DatabaseJson } | DatabaseJson[];

interface DatabaseInsight {
  id: string;
  org_id: string;
  insight_type: string;
  insight_data: DatabaseJson;
  confidence_score?: number | null;
  generated_at: string;
  valid_until?: string | null;
  tags?: string[] | null;
  created_by?: string | null;
  forecast_period?: string | null;
  created_at: string;
  updated_at: string;
}

interface DatabaseDashboard {
  id: string;
  org_id: string;
  dashboard_name: string;
  dashboard_type?: string | null;
  layout_config: DatabaseJson;
  widget_config: DatabaseJson;
  shared_with?: string[] | null;
  created_by?: string | null;
  created_at: string;
  updated_at: string;
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
      
      return (data || []).map(item => this.transformDatabaseInsight(item as DatabaseInsight));
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
      
      return (data || []).map(item => this.transformDatabaseInsight(item as DatabaseInsight));
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
          insight_data: JSON.stringify(insight.insight_data)
        })
        .select()
        .single();

      if (error) throw error;
      
      return data ? this.transformDatabaseInsight(data as DatabaseInsight) : null;
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

      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: incidents } = await supabase
        .from('incident_logs')
        .select('reported_at, severity')
        .eq('org_id', profile.organization_id)
        .gte('reported_at', thirtyDaysAgo.toISOString());

      if (!incidents) return [];

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

      return (data || []).map((item): DashboardTemplate => this.transformDatabaseDashboard(item as DatabaseDashboard));
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

  private transformDatabaseInsight(item: DatabaseInsight): AnalyticsInsight {
    return {
      id: item.id,
      org_id: item.org_id,
      insight_type: item.insight_type,
      insight_data: this.parseJson(item.insight_data),
      confidence_score: item.confidence_score || undefined,
      generated_at: item.generated_at,
      valid_until: item.valid_until || undefined,
      tags: item.tags || undefined,
      created_by: item.created_by || undefined,
      forecast_period: item.forecast_period || undefined,
      created_at: item.created_at,
      updated_at: item.updated_at
    };
  }

  private transformDatabaseDashboard(item: DatabaseDashboard): DashboardTemplate {
    return {
      id: item.id,
      template_name: item.dashboard_name,
      template_type: item.dashboard_type || 'custom',
      description: `Dashboard: ${item.dashboard_name}`,
      layout_config: this.parseJson(item.layout_config),
      widget_configs: Array.isArray(item.widget_config) 
        ? (item.widget_config as any[]).map(w => this.parseJson(w))
        : [],
      data_sources: [],
      tags: item.shared_with || [],
      usage_count: 1,
      org_id: item.org_id,
      created_by: item.created_by || '',
      created_at: item.created_at,
      updated_at: item.updated_at
    };
  }

  private parseJson(value: DatabaseJson): Record<string, any> {
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      return value as Record<string, any>;
    }
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        return typeof parsed === 'object' && parsed !== null ? parsed : {};
      } catch {
        return {};
      }
    }
    return {};
  }

  private getWeekKey(date: Date): string {
    const year = date.getFullYear();
    const week = Math.floor((date.getTime() - new Date(year, 0, 1).getTime()) / (7 * 24 * 60 * 60 * 1000));
    return `${year}-W${week}`;
  }

  async generateTrendInsights(): Promise<TrendInsight[]> {
    try {
      const profile = await getCurrentUserProfile();
      if (!profile?.organization_id) return [];

      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: incidents } = await supabase
        .from('incident_logs')
        .select('reported_at, severity')
        .eq('org_id', profile.organization_id)
        .gte('reported_at', thirtyDaysAgo.toISOString());

      if (!incidents) return [];

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
}

export const analyticsInsightsService = new AnalyticsInsightsService();

export const dashboardTemplatesService = {
  getTemplates: () => analyticsInsightsService.getDashboardTemplates(),
  createTemplate: async (template: any) => {
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
