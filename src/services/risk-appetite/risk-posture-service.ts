
import { supabase } from "@/integrations/supabase/client";
import { getCurrentUserProfile } from "@/lib/supabase-utils";
import type { RiskPostureData } from "./types";

export const riskPostureService = {
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
