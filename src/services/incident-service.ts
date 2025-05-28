
import { supabase } from "@/integrations/supabase/client";

export interface Incident {
  id: string;
  org_id: string;
  title: string;
  description?: string;
  category?: string;
  severity: string;
  status: string;
  impact_rating?: number;
  business_function_id?: string;
  reported_by?: string;
  assigned_to?: string;
  reported_at: string;
  resolved_at?: string;
  created_at: string;
  updated_at: string;
}

export interface IncidentResponse {
  id: string;
  incident_id: string;
  response_type: string;
  response_by?: string;
  response_by_name?: string;
  response_content: string;
  previous_status?: string;
  new_status?: string;
  previous_assignee?: string;
  new_assignee?: string;
  alert_sent_to?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateIncidentData {
  title: string;
  description?: string;
  category?: string;
  severity: string;
  impact_rating?: number;
  business_function_id?: string;
  assigned_to?: string;
}

export interface UpdateIncidentData {
  title?: string;
  description?: string;
  category?: string;
  severity?: string;
  status?: string;
  impact_rating?: number;
  business_function_id?: string;
  assigned_to?: string;
  resolved_at?: string;
}

export async function getIncidents(): Promise<Incident[]> {
  const { data, error } = await supabase
    .from('incident_logs')
    .select('*')
    .order('reported_at', { ascending: false });

  if (error) {
    console.error('Error fetching incidents:', error);
    throw error;
  }

  return data || [];
}

export async function getIncidentById(id: string): Promise<Incident | null> {
  const { data, error } = await supabase
    .from('incident_logs')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    console.error('Error fetching incident:', error);
    throw error;
  }

  return data;
}

export async function createIncident(incidentData: CreateIncidentData): Promise<Incident> {
  const { data: profile } = await supabase
    .from('profiles')
    .select('organization_id')
    .eq('id', (await supabase.auth.getUser()).data.user?.id)
    .single();

  if (!profile?.organization_id) {
    throw new Error('User organization not found');
  }

  const { data, error } = await supabase
    .from('incident_logs')
    .insert({
      ...incidentData,
      org_id: profile.organization_id,
      reported_by: (await supabase.auth.getUser()).data.user?.id,
      status: 'open'
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating incident:', error);
    throw error;
  }

  return data;
}

export async function updateIncident(id: string, updates: UpdateIncidentData): Promise<Incident> {
  const { data, error } = await supabase
    .from('incident_logs')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating incident:', error);
    throw error;
  }

  return data;
}

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
  // Create a response record for the alert
  await createIncidentResponse({
    incident_id: incidentId,
    response_type: 'alert',
    response_content: message,
    alert_sent_to: email
  });

  // In a real implementation, you would send an actual email here
  console.log(`Alert sent to ${email}: ${message}`);
}

export async function deleteIncident(id: string): Promise<void> {
  const { error } = await supabase
    .from('incident_logs')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting incident:', error);
    throw error;
  }
}
