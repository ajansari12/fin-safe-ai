
import { supabase } from "@/integrations/supabase/client";
import { getCurrentUserProfile } from "@/lib/supabase-utils";
import type { TrendData } from "./types";

export const trendDataService = {
  async getTrendData(days: number = 90): Promise<TrendData[]> {
    try {
      const profile = await getCurrentUserProfile();
      if (!profile?.organization_id) return [];

      // Use appetite_breach_logs as the data source since risk_appetite_logs doesn't exist
      const { data, error } = await supabase
        .from('appetite_breach_logs')
        .select(`
          breach_date,
          actual_value,
          threshold_value,
          variance_percentage,
          risk_category_id
        `)
        .eq('org_id', profile.organization_id)
        .gte('breach_date', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString())
        .order('breach_date', { ascending: true });

      if (error) throw error;

      return (data || []).map(item => ({
        date: item.breach_date.split('T')[0],
        category: item.risk_category_id || 'Unknown',
        appetite_value: item.threshold_value,
        actual_value: item.actual_value,
        variance_percentage: item.variance_percentage || 0
      }));
    } catch (error) {
      console.error('Error fetching trend data:', error);
      return [];
    }
  }
};
