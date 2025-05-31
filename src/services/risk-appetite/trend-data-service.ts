
import { supabase } from "@/integrations/supabase/client";
import { getCurrentUserProfile } from "@/lib/supabase-utils";
import type { TrendData } from "./types";

export const trendDataService = {
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
  }
};
