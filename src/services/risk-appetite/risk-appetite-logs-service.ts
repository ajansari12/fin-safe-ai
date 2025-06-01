
import { supabase } from "@/integrations/supabase/client";
import { getCurrentUserProfile } from "@/lib/supabase-utils";
import type { RiskAppetiteLog } from "./types";

export const riskAppetiteLogsService = {
  async getRiskAppetiteLogs(categoryId?: string, days: number = 30): Promise<RiskAppetiteLog[]> {
    try {
      const profile = await getCurrentUserProfile();
      if (!profile?.organization_id) return [];

      // Use appetite_breach_logs as the main source for risk appetite data
      let query = supabase
        .from('appetite_breach_logs')
        .select('*')
        .eq('org_id', profile.organization_id)
        .gte('breach_date', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString())
        .order('breach_date', { ascending: false });

      if (categoryId) {
        query = query.eq('risk_category_id', categoryId);
      }

      const { data, error } = await query;
      if (error) throw error;
      
      // Transform data to match RiskAppetiteLog interface
      return (data || []).map(item => ({
        id: item.id,
        org_id: item.org_id,
        risk_category_id: item.risk_category_id || '',
        log_date: item.breach_date.split('T')[0],
        actual_value: item.actual_value,
        variance_percentage: item.variance_percentage || 0,
        breach_severity: item.breach_severity as 'warning' | 'breach' | 'critical',
        created_at: item.created_at,
        updated_at: item.updated_at
      }));
    } catch (error) {
      console.error('Error fetching risk appetite logs:', error);
      return [];
    }
  },

  async createRiskAppetiteLog(log: Omit<RiskAppetiteLog, 'id' | 'created_at' | 'updated_at' | 'org_id'>): Promise<RiskAppetiteLog | null> {
    try {
      const profile = await getCurrentUserProfile();
      if (!profile?.organization_id) throw new Error('No organization found');

      // Create entry in appetite_breach_logs table
      const { data, error } = await supabase
        .from('appetite_breach_logs')
        .insert({
          org_id: profile.organization_id,
          risk_category_id: log.risk_category_id,
          breach_date: `${log.log_date}T00:00:00Z`,
          actual_value: log.actual_value,
          threshold_value: log.actual_value, // Use actual value as threshold for now
          variance_percentage: log.variance_percentage,
          breach_severity: log.breach_severity || 'warning',
          resolution_status: 'open'
        })
        .select()
        .single();

      if (error) throw error;
      
      return {
        id: data.id,
        org_id: data.org_id,
        risk_category_id: data.risk_category_id || '',
        log_date: data.breach_date.split('T')[0],
        actual_value: data.actual_value,
        variance_percentage: data.variance_percentage || 0,
        breach_severity: data.breach_severity as 'warning' | 'breach' | 'critical',
        created_at: data.created_at,
        updated_at: data.updated_at
      };
    } catch (error) {
      console.error('Error creating risk appetite log:', error);
      return null;
    }
  }
};
