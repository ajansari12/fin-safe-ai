
import { supabase } from "@/integrations/supabase/client";

export interface IncidentAnalytics {
  total: number;
  unresolved: number;
  bySeverity: Record<string, number>;
  recent: Array<{
    id: string;
    title: string;
    severity: string;
    status: string;
    reported_at: string;
  }>;
}

export async function getIncidentAnalytics(): Promise<IncidentAnalytics> {
  const { data: incidents, error } = await supabase
    .from('incident_logs')
    .select('*')
    .order('reported_at', { ascending: false });

  if (error) {
    console.error('Error fetching incidents:', error);
    throw error;
  }

  const unresolved = incidents?.filter(i => i.status !== 'resolved' && i.status !== 'closed').length || 0;
  
  const bySeverity = incidents?.reduce((acc, incident) => {
    acc[incident.severity] = (acc[incident.severity] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  const recent = incidents?.slice(0, 5).map(incident => ({
    id: incident.id,
    title: incident.title,
    severity: incident.severity,
    status: incident.status,
    reported_at: incident.reported_at
  })) || [];

  return {
    total: incidents?.length || 0,
    unresolved,
    bySeverity,
    recent
  };
}

export async function getUnresolvedIncidentsCount() {
  try {
    const { data, error } = await supabase
      .from('incident_logs')
      .select('id')
      .neq('status', 'resolved');

    if (error) {
      throw error;
    }

    return data?.length || 0;
  } catch (error) {
    console.error('Error fetching unresolved incidents:', error);
    return 0;
  }
}
