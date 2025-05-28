
import { supabase } from "@/integrations/supabase/client";
import type { IncidentMetrics } from "./types";
import { getIncidentById } from "./incident-queries";

export async function checkSLABreaches(): Promise<void> {
  const { error } = await supabase.rpc('check_incident_sla_breaches');
  
  if (error) {
    console.error('Error checking SLA breaches:', error);
    throw error;
  }
}

export async function getIncidentMetrics(incidentId: string): Promise<IncidentMetrics> {
  const incident = await getIncidentById(incidentId);
  if (!incident) {
    throw new Error('Incident not found');
  }

  const reportedAt = new Date(incident.reported_at);
  const now = new Date();
  
  let responseTime: number | undefined;
  let resolutionTime: number | undefined;
  
  if (incident.first_response_at) {
    responseTime = Math.floor((new Date(incident.first_response_at).getTime() - reportedAt.getTime()) / (1000 * 60 * 60));
  }
  
  if (incident.resolved_at) {
    resolutionTime = Math.floor((new Date(incident.resolved_at).getTime() - reportedAt.getTime()) / (1000 * 60 * 60));
  }

  const hoursElapsed = Math.floor((now.getTime() - reportedAt.getTime()) / (1000 * 60 * 60));

  const slaStatus = {
    response: incident.first_response_at 
      ? (responseTime! <= (incident.max_response_time_hours || 24) ? 'met' : 'breached')
      : (hoursElapsed > (incident.max_response_time_hours || 24) ? 'breached' : 'pending'),
    resolution: incident.resolved_at
      ? (resolutionTime! <= (incident.max_resolution_time_hours || 72) ? 'met' : 'breached')
      : (hoursElapsed > (incident.max_resolution_time_hours || 72) ? 'breached' : 'pending')
  } as const;

  return {
    responseTime,
    resolutionTime,
    slaStatus
  };
}
