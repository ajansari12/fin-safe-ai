
import { supabase } from "@/integrations/supabase/client";
import { getCurrentUserProfile } from "@/lib/supabase-utils";

export interface AnalyticsInsight {
  id: string;
  org_id: string;
  insight_type: 'trend' | 'anomaly' | 'prediction' | 'correlation' | 'recommendation';
  insight_data: {
    title: string;
    description: string;
    metric?: string;
    value?: number;
    change_percentage?: number;
    period?: string;
    trend_direction?: 'up' | 'down' | 'stable';
    severity?: 'low' | 'medium' | 'high' | 'critical';
    actionable_items?: string[];
    chart_data?: any[];
  };
  confidence_score: number;
  generated_at: string;
  valid_until?: string;
  forecast_period?: '7d' | '30d' | '90d' | '1y';
  tags?: string[];
}

export interface DashboardTemplate {
  id: string;
  org_id: string;
  template_name: string;
  template_type: 'system' | 'custom' | 'shared';
  description?: string;
  layout_config: {
    columns: number;
    rows: number;
    gaps: number;
  };
  widget_configs: Array<{
    id: string;
    type: string;
    title: string;
    position: { x: number; y: number; w: number; h: number };
    data_source: string;
    config: any;
  }>;
  data_sources: string[];
  filters_config: any;
  refresh_interval_minutes: number;
  is_public: boolean;
  is_active: boolean;
  created_by?: string;
  created_by_name?: string;
  shared_with?: string[];
  usage_count: number;
  last_used_at?: string;
  created_at: string;
  updated_at: string;
}

export const analyticsInsightsService = {
  async getInsights(insightType?: string, limit: number = 20): Promise<AnalyticsInsight[]> {
    try {
      const profile = await getCurrentUserProfile();
      if (!profile?.organization_id) return [];

      let query = supabase
        .from('analytics_insights')
        .select('*')
        .eq('org_id', profile.organization_id)
        .order('generated_at', { ascending: false })
        .limit(limit);

      if (insightType) {
        query = query.eq('insight_type', insightType);
      }

      query = query.or('valid_until.is.null,valid_until.gte.' + new Date().toISOString());

      const { data, error } = await query;
      if (error) throw error;
      
      return (data || []).map(item => ({
        id: item.id,
        org_id: item.org_id,
        insight_type: item.insight_type as AnalyticsInsight['insight_type'],
        insight_data: typeof item.insight_data === 'object' ? item.insight_data as AnalyticsInsight['insight_data'] : { title: '', description: '' },
        confidence_score: item.confidence_score || 0,
        generated_at: item.generated_at,
        valid_until: item.valid_until || undefined,
        forecast_period: item.forecast_period as AnalyticsInsight['forecast_period'],
        tags: item.tags || []
      }));
    } catch (error) {
      console.error('Error fetching analytics insights:', error);
      return [];
    }
  },

  async generatePredictiveInsights(): Promise<AnalyticsInsight[]> {
    try {
      const profile = await getCurrentUserProfile();
      if (!profile?.organization_id) return [];

      const insights: AnalyticsInsight[] = [];
      const now = new Date();
      const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      // Get incident trends
      const { data: currentIncidents } = await supabase
        .from('incident_logs')
        .select('*')
        .eq('org_id', profile.organization_id)
        .gte('reported_at', oneMonthAgo.toISOString());

      if (currentIncidents) {
        const currentCount = currentIncidents.length;
        
        insights.push({
          id: `incident-trend-${Date.now()}`,
          org_id: profile.organization_id,
          insight_type: 'trend',
          insight_data: {
            title: 'Incident Rate Analysis',
            description: `${currentCount} incidents reported in the last 30 days`,
            metric: 'incidents',
            value: currentCount,
            period: 'last_30_days',
            trend_direction: currentCount > 10 ? 'up' : currentCount < 5 ? 'down' : 'stable',
            severity: currentCount > 20 ? 'high' : currentCount > 10 ? 'medium' : 'low',
            actionable_items: currentCount > 10 ? [
              'Review incident response procedures',
              'Analyze common incident patterns'
            ] : []
          },
          confidence_score: 85,
          generated_at: now.toISOString(),
          valid_until: new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString(),
          forecast_period: '30d',
          tags: ['incidents', 'trends', 'monthly']
        });
      }

      // Get KRI breach trends using threshold_breached field
      const { data: kriLogs } = await supabase
        .from('kri_logs')
        .select('*')
        .eq('org_id', profile.organization_id)
        .gte('measurement_date', oneMonthAgo.toISOString().split('T')[0]);

      if (kriLogs) {
        const breachCount = kriLogs.filter(log => log.threshold_breached === 'yes').length;
        const totalCount = kriLogs.length;
        const breachRate = totalCount > 0 ? (breachCount / totalCount) * 100 : 0;

        insights.push({
          id: `kri-breach-${Date.now()}`,
          org_id: profile.organization_id,
          insight_type: 'prediction',
          insight_data: {
            title: 'KRI Breach Risk',
            description: `${breachRate.toFixed(1)}% of KRIs are showing threshold breaches`,
            metric: 'kri_breach_rate',
            value: breachRate,
            period: 'current',
            severity: breachRate > 30 ? 'critical' : breachRate > 20 ? 'high' : breachRate > 10 ? 'medium' : 'low',
            actionable_items: breachRate > 20 ? [
              'Review KRI thresholds',
              'Investigate root causes'
            ] : []
          },
          confidence_score: 90,
          generated_at: now.toISOString(),
          valid_until: new Date(now.getTime() + 12 * 60 * 60 * 1000).toISOString(),
          forecast_period: '7d',
          tags: ['kri', 'risk', 'prediction']
        });
      }

      return insights;
    } catch (error) {
      console.error('Error generating predictive insights:', error);
      return [];
    }
  },

  async createInsight(insight: Omit<AnalyticsInsight, 'id'>): Promise<AnalyticsInsight | null> {
    try {
      const profile = await getCurrentUserProfile();
      if (!profile?.organization_id) throw new Error('No organization found');

      const { data, error } = await supabase
        .from('analytics_insights')
        .insert({
          org_id: profile.organization_id,
          insight_type: insight.insight_type,
          insight_data: insight.insight_data,
          confidence_score: insight.confidence_score,
          generated_at: insight.generated_at,
          valid_until: insight.valid_until,
          forecast_period: insight.forecast_period,
          tags: insight.tags,
          created_by: (await supabase.auth.getUser()).data.user?.id
        })
        .select()
        .single();

      if (error) throw error;
      
      return {
        id: data.id,
        org_id: data.org_id,
        insight_type: data.insight_type as AnalyticsInsight['insight_type'],
        insight_data: data.insight_data as AnalyticsInsight['insight_data'],
        confidence_score: data.confidence_score,
        generated_at: data.generated_at,
        valid_until: data.valid_until,
        forecast_period: data.forecast_period as AnalyticsInsight['forecast_period'],
        tags: data.tags
      };
    } catch (error) {
      console.error('Error creating analytics insight:', error);
      return null;
    }
  }
};

// Simplified dashboard templates service using custom_dashboards table
export const dashboardTemplatesService = {
  async getTemplates(templateType?: string): Promise<DashboardTemplate[]> {
    try {
      const profile = await getCurrentUserProfile();
      if (!profile?.organization_id) return [];

      let query = supabase
        .from('custom_dashboards')
        .select('*')
        .eq('org_id', profile.organization_id);

      if (templateType && templateType !== 'all') {
        query = query.eq('dashboard_type', templateType);
      }

      const { data, error } = await query;
      if (error) throw error;
      
      // Transform custom_dashboards to DashboardTemplate format
      return (data || []).map(item => ({
        id: item.id,
        org_id: item.org_id,
        template_name: item.dashboard_name,
        template_type: item.dashboard_type as 'system' | 'custom' | 'shared',
        description: `Custom dashboard: ${item.dashboard_name}`,
        layout_config: typeof item.layout_config === 'object' ? item.layout_config as any : { columns: 12, rows: 8, gaps: 16 },
        widget_configs: Array.isArray(item.widget_config) ? item.widget_config.map((widget: any) => ({
          id: widget.id || Math.random().toString(36),
          type: widget.type || 'chart',
          title: widget.title || 'Widget',
          position: widget.position || { x: 0, y: 0, w: 4, h: 3 },
          data_source: widget.data_source || 'default',
          config: widget.config || {}
        })) : [],
        data_sources: ['incidents', 'kri', 'compliance'],
        filters_config: {},
        refresh_interval_minutes: 15,
        is_public: item.is_shared || false,
        is_active: true,
        created_by: item.created_by,
        created_by_name: 'User',
        shared_with: item.shared_with || [],
        usage_count: 0,
        last_used_at: item.updated_at,
        created_at: item.created_at,
        updated_at: item.updated_at
      }));
    } catch (error) {
      console.error('Error fetching dashboard templates:', error);
      return [];
    }
  },

  async createTemplate(template: Omit<DashboardTemplate, 'id' | 'org_id' | 'created_at' | 'updated_at' | 'usage_count'>): Promise<DashboardTemplate | null> {
    try {
      const profile = await getCurrentUserProfile();
      if (!profile?.organization_id) throw new Error('No organization found');

      const { data: user } = await supabase.auth.getUser();

      const { data, error } = await supabase
        .from('custom_dashboards')
        .insert({
          org_id: profile.organization_id,
          dashboard_name: template.template_name,
          dashboard_type: template.template_type,
          layout_config: template.layout_config,
          widget_config: template.widget_configs,
          is_shared: template.is_public,
          created_by: user.user?.id,
          user_id: user.user?.id
        })
        .select()
        .single();

      if (error) throw error;
      
      return {
        id: data.id,
        org_id: data.org_id,
        template_name: data.dashboard_name,
        template_type: data.dashboard_type as 'system' | 'custom' | 'shared',
        description: template.description,
        layout_config: data.layout_config as any,
        widget_configs: data.widget_config as any,
        data_sources: template.data_sources,
        filters_config: template.filters_config,
        refresh_interval_minutes: template.refresh_interval_minutes,
        is_public: data.is_shared || false,
        is_active: true,
        created_by: data.created_by,
        created_by_name: template.created_by_name,
        shared_with: template.shared_with,
        usage_count: 0,
        last_used_at: data.updated_at,
        created_at: data.created_at,
        updated_at: data.updated_at
      };
    } catch (error) {
      console.error('Error creating dashboard template:', error);
      return null;
    }
  },

  async updateTemplateUsage(templateId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('custom_dashboards')
        .update({
          updated_at: new Date().toISOString()
        })
        .eq('id', templateId);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating template usage:', error);
    }
  }
};
