
import { supabase } from "@/integrations/supabase/client";
import type { IncidentResponse } from "./types";

export async function getIncidentResponses(incidentId: string): Promise<IncidentResponse[]> {
  const { data, error } = await supabase
    .from('incident_responses')
    .select('*')
    .eq('incident_id', incidentId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching incident responses:', error);
    throw error;
  }

  return data || [];
}

export async function createIncidentResponse(responseData: {
  incident_id: string;
  response_type: string;
  response_content: string;
  previous_status?: string;
  new_status?: string;
  previous_assignee?: string;
  new_assignee?: string;
  alert_sent_to?: string;
}): Promise<IncidentResponse> {
  const user = (await supabase.auth.getUser()).data.user;
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user?.id)
    .single();

  const { data, error } = await supabase
    .from('incident_responses')
    .insert({
      ...responseData,
      response_by: user?.id,
      response_by_name: profile?.full_name || user?.email || 'Unknown User'
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating incident response:', error);
    throw error;
  }

  return data;
}

export async function sendAlert(incidentId: string, email: string, message: string): Promise<void> {
  await createIncidentResponse({
    incident_id: incidentId,
    response_type: 'alert',
    response_content: message,
    alert_sent_to: email
  });

  console.log(`Alert sent to ${email}: ${message}`);
}
