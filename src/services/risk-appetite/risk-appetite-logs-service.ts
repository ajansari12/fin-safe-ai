
import { supabase } from "@/integrations/supabase/client";
import { getCurrentUserProfile } from "@/lib/supabase-utils";
import type { RiskAppetiteLog } from "./types";

export const riskAppetiteLogsService = {
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
  }
};
