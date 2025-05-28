
import { supabase } from "@/integrations/supabase/client";

export interface KRIBreach {
  date: string;
  breaches: number;
  critical: number;
  warning: number;
}

export async function getKRIBreaches(): Promise<KRIBreach[]> {
  const { data: kriLogs, error } = await supabase
    .from('kri_logs')
    .select('measurement_date, threshold_breached')
    .gte('measurement_date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
    .order('measurement_date', { ascending: true });

  if (error) {
    console.error('Error fetching KRI logs:', error);
    throw error;
  }

  // Group by date and count breaches
  const groupedData = kriLogs?.reduce((acc, log) => {
    const date = log.measurement_date;
    if (!acc[date]) {
      acc[date] = { breaches: 0, critical: 0, warning: 0 };
    }
    
    if (log.threshold_breached === 'critical') {
      acc[date].breaches++;
      acc[date].critical++;
    } else if (log.threshold_breached === 'warning') {
      acc[date].breaches++;
      acc[date].warning++;
    }
    
    return acc;
  }, {} as Record<string, { breaches: number; critical: number; warning: number }>) || {};

  return Object.entries(groupedData).map(([date, data]) => ({
    date,
    ...data
  }));
}

export async function getKRIBreachesData() {
  try {
    const { data: profile } = await supabase
      .from('profiles')
      .select('organization_id')
      .eq('id', (await supabase.auth.getUser()).data.user?.id)
      .single();

    if (!profile?.organization_id) {
      return [];
    }

    // Get KRI breaches for the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data, error } = await supabase
      .from('kri_logs')
      .select(`
        measurement_date,
        threshold_breached,
        kri_definitions!inner (
          threshold_id,
          risk_thresholds!inner (
            statement_id,
            risk_appetite_statements!inner (
              org_id
            )
          )
        )
      `)
      .eq('kri_definitions.risk_thresholds.risk_appetite_statements.org_id', profile.organization_id)
      .gte('measurement_date', thirtyDaysAgo.toISOString().split('T')[0])
      .not('threshold_breached', 'is', null);

    if (error) {
      throw error;
    }

    // Group by date and count breaches
    const dateMap = new Map();

    data?.forEach(entry => {
      const date = entry.measurement_date;
      if (!dateMap.has(date)) {
        dateMap.set(date, {
          date,
          total: 0,
          critical: 0,
          warning: 0
        });
      }
      
      const dayData = dateMap.get(date);
      dayData.total++;
      
      if (entry.threshold_breached === 'critical') {
        dayData.critical++;
      } else if (entry.threshold_breached === 'warning') {
        dayData.warning++;
      }
    });

    return Array.from(dateMap.values()).sort((a, b) => a.date.localeCompare(b.date));
  } catch (error) {
    console.error('Error fetching KRI breaches data:', error);
    return [];
  }
}
