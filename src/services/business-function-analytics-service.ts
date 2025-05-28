
import { supabase } from "@/integrations/supabase/client";

export interface SensitiveCBF {
  id: string;
  name: string;
  max_tolerable_downtime: string;
  category: string;
  criticality: string;
}

export async function getMostSensitiveCBFs(): Promise<SensitiveCBF[]> {
  try {
    const { data: profile } = await supabase
      .from('profiles')
      .select('organization_id')
      .eq('id', (await supabase.auth.getUser()).data.user?.id)
      .single();

    if (!profile?.organization_id) {
      return [];
    }

    const { data, error } = await supabase
      .from('business_functions')
      .select(`
        id,
        name,
        category,
        criticality,
        impact_tolerances (
          max_tolerable_downtime
        )
      `)
      .eq('org_id', profile.organization_id)
      .in('criticality', ['critical', 'high'])
      .limit(10);

    if (error) {
      throw error;
    }

    return data?.map(item => ({
      id: item.id,
      name: item.name,
      category: item.category || 'Unknown',
      criticality: item.criticality,
      max_tolerable_downtime: Array.isArray(item.impact_tolerances) && item.impact_tolerances.length > 0
        ? (item.impact_tolerances[0] as any)?.max_tolerable_downtime || 'Unknown'
        : 'Unknown'
    })) || [];
  } catch (error) {
    console.error('Error fetching most sensitive CBFs:', error);
    return [];
  }
}
