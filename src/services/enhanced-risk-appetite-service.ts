
import { supabase } from "@/integrations/supabase/client";
import { getCurrentUserProfile } from "@/lib/supabase-utils";

export interface RiskAppetiteLog {
  id: string;
  org_id: string;
  risk_category_id: string;
  statement_id: string;
  threshold_id: string;
  log_date: string;
  appetite_value: number;
  actual_value: number;
  variance_percentage: number;
  variance_status: 'within_appetite' | 'warning' | 'breach';
  kri_data: any;
  notes?: string;
  created_by?: string;
  created_by_name?: string;
  created_at: string;
  updated_at: string;
  risk_category?: {
    name: string;
  };
}

export interface AppetiteBreach {
  id: string;
  org_id: string;
  risk_category_id: string;
  statement_id: string;
  threshold_id: string;
  breach_date: string;
  breach_severity: 'warning' | 'breach' | 'critical';
  actual_value: number;
  appetite_value: number;
  variance_percentage: number;
  escalation_level: number;
  escalated_at?: string;
  escalated_to?: string;
  escalated_to_name?: string;
  resolution_status: 'open' | 'acknowledged' | 'in_progress' | 'resolved';
  resolution_date?: string;
  resolution_notes?: string;
  business_impact?: string;
  remediation_plan?: string;
  board_notified: boolean;
  board_notification_date?: string;
  auto_escalated: boolean;
  created_at: string;
  updated_at: string;
  risk_category?: {
    name: string;
  };
}

export interface KRILogEntry {
  id: string;
  org_id: string;
  kri_id: string;
  measurement_date: string;
  actual_value: number;
  target_value?: number;
  warning_threshold?: number;
  critical_threshold?: number;
  variance_from_target?: number;
  variance_percentage?: number;
  status: 'normal' | 'warning' | 'critical';
  measurement_source: string;
  measurement_notes?: string;
  measured_by?: string;
  measured_by_name?: string;
  created_at: string;
  updated_at: string;
  kri_definition?: {
    name: string;
    description?: string;
  };
}

export interface RiskPostureData {
  category: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  count: number;
  variance_percentage: number;
}

export interface TrendData {
  date: string;
  category: string;
  appetite_value: number;
  actual_value: number;
  variance_percentage: number;
}

export const enhancedRiskAppetiteService = {
  async getRiskAppetiteLogs(categoryId?: string, days: number = 30): Promise<RiskAppetiteLog[]> {
    try {
      const profile = await getCurrentUserProfile();
      if (!profile?.organization_id) return [];

      let query = supabase
        .from('risk_appetite_logs')
        .select(`
          *,
          risk_category:risk_categories(name)
        `)
        .eq('org_id', profile.organization_id)
        .gte('log_date', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
        .order('log_date', { ascending: false });

      if (categoryId) {
        query = query.eq('risk_category_id', categoryId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching risk appetite logs:', error);
      return [];
    }
  },

  async createRiskAppetiteLog(log: Omit<RiskAppetiteLog, 'id' | 'created_at' | 'updated_at' | 'org_id'>): Promise<RiskAppetiteLog | null> {
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
        .from('risk_appetite_logs')
        .insert({
          ...log,
          org_id: profile.organization_id,
          created_by: user.user?.id,
          created_by_name: userProfile?.full_name || 'Unknown User'
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating risk appetite log:', error);
      return null;
    }
  },

  async getAppetiteBreaches(status?: string): Promise<AppetiteBreach[]> {
    try {
      const profile = await getCurrentUserProfile();
      if (!profile?.organization_id) return [];

      let query = supabase
        .from('appetite_breaches')
        .select(`
          *,
          risk_category:risk_categories(name)
        `)
        .eq('org_id', profile.organization_id)
        .order('breach_date', { ascending: false });

      if (status) {
        query = query.eq('resolution_status', status);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching appetite breaches:', error);
      return [];
    }
  },

  async escalateBreach(breachId: string, escalationLevel: number, escalatedTo?: string): Promise<void> {
    try {
      const { data: user } = await supabase.auth.getUser();
      const { data: userProfile } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.user?.id)
        .single();

      const { error } = await supabase
        .from('appetite_breaches')
        .update({
          escalation_level: escalationLevel,
          escalated_at: new Date().toISOString(),
          escalated_to: escalatedTo,
          escalated_to_name: userProfile?.full_name || 'Unknown User'
        })
        .eq('id', breachId);

      if (error) throw error;
    } catch (error) {
      console.error('Error escalating breach:', error);
      throw error;
    }
  },

  async updateBreachStatus(breachId: string, status: string, notes?: string): Promise<void> {
    try {
      const updateData: any = {
        resolution_status: status
      };

      if (status === 'resolved') {
        updateData.resolution_date = new Date().toISOString();
      }

      if (notes) {
        updateData.resolution_notes = notes;
      }

      const { error } = await supabase
        .from('appetite_breaches')
        .update(updateData)
        .eq('id', breachId);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating breach status:', error);
      throw error;
    }
  },

  async getTrendData(days: number = 90): Promise<TrendData[]> {
    try {
      const profile = await getCurrentUserProfile();
      if (!profile?.organization_id) return [];

      const { data, error } = await supabase
        .from('risk_appetite_logs')
        .select(`
          log_date,
          appetite_value,
          actual_value,
          variance_percentage,
          risk_category:risk_categories(name)
        `)
        .eq('org_id', profile.organization_id)
        .gte('log_date', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
        .order('log_date', { ascending: true });

      if (error) throw error;

      return (data || []).map(item => ({
        date: item.log_date,
        category: item.risk_category?.name || 'Unknown',
        appetite_value: item.appetite_value,
        actual_value: item.actual_value,
        variance_percentage: item.variance_percentage || 0
      }));
    } catch (error) {
      console.error('Error fetching trend data:', error);
      return [];
    }
  },

  async getRiskPostureHeatmap(): Promise<RiskPostureData[]> {
    try {
      const profile = await getCurrentUserProfile();
      if (!profile?.organization_id) return [];

      const { data, error } = await supabase
        .from('appetite_breaches')
        .select(`
          breach_severity,
          variance_percentage,
          risk_category:risk_categories(name)
        `)
        .eq('org_id', profile.organization_id)
        .eq('resolution_status', 'open');

      if (error) throw error;

      const heatmapData: Record<string, RiskPostureData> = {};

      (data || []).forEach(breach => {
        const category = breach.risk_category?.name || 'Unknown';
        const severity = breach.breach_severity as 'warning' | 'breach' | 'critical';
        const key = `${category}-${severity}`;

        if (!heatmapData[key]) {
          heatmapData[key] = {
            category,
            severity: severity === 'breach' ? 'high' : severity === 'critical' ? 'critical' : 'medium',
            count: 0,
            variance_percentage: 0
          };
        }

        heatmapData[key].count += 1;
        heatmapData[key].variance_percentage = Math.max(
          heatmapData[key].variance_percentage,
          breach.variance_percentage || 0
        );
      });

      return Object.values(heatmapData);
    } catch (error) {
      console.error('Error fetching risk posture heatmap:', error);
      return [];
    }
  }
};
