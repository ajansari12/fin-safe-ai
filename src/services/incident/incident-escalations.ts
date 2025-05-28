
import { supabase } from "@/integrations/supabase/client";
import type { IncidentEscalation } from "./types";
import { getIncidentById, updateIncident } from "./incident-queries";

export async function getIncidentEscalations(incidentId: string): Promise<IncidentEscalation[]> {
  const { data, error } = await supabase
    .from('incident_escalations')
    .select('*')
    .eq('incident_id', incidentId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching incident escalations:', error);
    throw error;
  }

  return data || [];
}

export async function escalateIncident(
  incidentId: string, 
  escalationReason: string,
  escalationType: string = 'manual'
): Promise<IncidentEscalation> {
  const user = (await supabase.auth.getUser()).data.user;
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user?.id)
    .single();

  // Get current incident details
  const incident = await getIncidentById(incidentId);
  if (!incident) {
    throw new Error('Incident not found');
  }

  const { data, error } = await supabase
    .from('incident_escalations')
    .insert({
      incident_id: incidentId,
      escalation_level: incident.escalation_level + 1,
      escalated_from_user: user?.id,
      escalated_from_name: profile?.full_name || user?.email || 'Unknown User',
      escalation_reason: escalationReason,
      escalation_type: escalationType
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating escalation:', error);
    throw error;
  }

  // Update incident escalation level
  await updateIncident(incidentId, {
    escalation_level: incident.escalation_level + 1
  });

  // Send escalation notification
  try {
    await supabase.functions.invoke('send-incident-escalation', {
      body: {
        incidentId: incidentId,
        escalationId: data.id,
        escalationReason: escalationReason
      }
    });
    console.log('Escalation notification sent');
  } catch (emailError) {
    console.error('Failed to send escalation notification:', emailError);
  }

  return data;
}
