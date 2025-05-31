
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

      // Only get valid insights
      query = query.or('valid_until.is.null,valid_until.gte.' + new Date().toISOString());

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
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
      const twoMonthsAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

      // Get incident trends
      const { data: currentIncidents } = await supabase
        .from('incident_logs')
        .select('*')
        .eq('org_id', profile.organization_id)
        .gte('reported_at', oneMonthAgo.toISOString());

      const { data: previousIncidents } = await supabase
        .from('incident_logs')
        .select('*')
        .eq('org_id', profile.organization_id)
        .gte('reported_at', twoMonthsAgo.toISOString())
        .lt('reported_at', oneMonthAgo.toISOString());

      if (currentIncidents && previousIncidents) {
        const currentCount = currentIncidents.length;
        const previousCount = previousIncidents.length;
        const changePercentage = previousCount > 0 ? ((currentCount - previousCount) / previousCount) * 100 : 0;

        insights.push({
          id: `incident-trend-${Date.now()}`,
          org_id: profile.organization_id,
          insight_type: 'trend',
          insight_data: {
            title: 'Incident Rate Trend',
            description: `Incident rate ${changePercentage > 0 ? 'increased' : 'decreased'} by ${Math.abs(changePercentage).toFixed(1)}% vs last month`,
            metric: 'incidents',
            value: currentCount,
            change_percentage: changePercentage,
            period: 'last_30_days',
            trend_direction: changePercentage > 5 ? 'up' : changePercentage < -5 ? 'down' : 'stable',
            severity: changePercentage > 20 ? 'high' : changePercentage > 10 ? 'medium' : 'low',
            actionable_items: changePercentage > 10 ? [
              'Review incident response procedures',
              'Analyze common incident patterns',
              'Consider additional preventive controls'
            ] : []
          },
          confidence_score: 85,
          generated_at: now.toISOString(),
          valid_until: new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString(),
          forecast_period: '30d',
          tags: ['incidents', 'trends', 'monthly']
        });
      }

      // Get KRI breach trends
      const { data: kriLogs } = await supabase
        .from('kri_logs')
        .select('*')
        .eq('org_id', profile.organization_id)
        .gte('measurement_date', oneMonthAgo.toISOString().split('T')[0]);

      if (kriLogs) {
        const breachCount = kriLogs.filter(log => log.status === 'critical' || log.status === 'warning').length;
        const totalCount = kriLogs.length;
        const breachRate = totalCount > 0 ? (breachCount / totalCount) * 100 : 0;

        insights.push({
          id: `kri-breach-${Date.now()}`,
          org_id: profile.organization_id,
          insight_type: 'prediction',
          insight_data: {
            title: 'KRI Breach Risk',
            description: `${breachRate.toFixed(1)}% of KRIs are showing warning or critical status`,
            metric: 'kri_breach_rate',
            value: breachRate,
            period: 'current',
            severity: breachRate > 30 ? 'critical' : breachRate > 20 ? 'high' : breachRate > 10 ? 'medium' : 'low',
            actionable_items: breachRate > 20 ? [
              'Review KRI thresholds',
              'Investigate root causes',
              'Implement corrective actions'
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

  async createInsight(insight: Omit<AnalyticsInsight, 'id' | 'org_id' | 'created_at' | 'updated_at'>): Promise<AnalyticsInsight | null> {
    try {
      const profile = await getCurrentUserProfile();
      if (!profile?.organization_id) throw new Error('No organization found');

      const { data, error } = await supabase
        .from('analytics_insights')
        .insert({
          ...insight,
          org_id: profile.organization_id,
          created_by: (await supabase.auth.getUser()).data.user?.id
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating analytics insight:', error);
      return null;
    }
  }
};

export const dashboardTemplatesService = {
  async getTemplates(templateType?: string): Promise<DashboardTemplate[]> {
    try {
      const profile = await getCurrentUserProfile();
      if (!profile?.organization_id) return [];

      let query = supabase
        .from('dashboard_templates')
        .select('*')
        .eq('is_active', true)
        .order('usage_count', { ascending: false });

      if (templateType) {
        query = query.eq('template_type', templateType);
      }

      // Get org templates and public templates
      query = query.or(`org_id.eq.${profile.organization_id},is_public.eq.true`);

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
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
      const { data: userProfile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.user?.id)
        .single();

      const { data, error } = await supabase
        .from('dashboard_templates')
        .insert({
          ...template,
          org_id: profile.organization_id,
          created_by: user.user?.id,
          created_by_name: userProfile?.full_name || 'Unknown User',
          usage_count: 0
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating dashboard template:', error);
      return null;
    }
  },

  async updateTemplateUsage(templateId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('dashboard_templates')
        .update({
          usage_count: supabase.rpc('increment_usage_count'),
          last_used_at: new Date().toISOString()
        })
        .eq('id', templateId);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating template usage:', error);
    }
  }
};
