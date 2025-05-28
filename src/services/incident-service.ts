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
  max_response_time_hours?: number;
  max_resolution_time_hours?: number;
  first_response_at?: string;
  escalated_at?: string;
  escalation_level: number;
  assigned_level: string;
}

export interface IncidentEscalation {
  id: string;
  incident_id: string;
  escalation_level: number;
  escalated_from_user?: string;
  escalated_to_user?: string;
  escalated_from_name?: string;
  escalated_to_name?: string;
  escalation_reason: string;
  escalation_type: string;
  created_at: string;
  acknowledged_at?: string;
  resolved_at?: string;
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
  max_response_time_hours?: number;
  max_resolution_time_hours?: number;
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
  max_response_time_hours?: number;
  max_resolution_time_hours?: number;
  escalation_level?: number;
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

export async function updateIncident(
  id: string, 
  data: UpdateIncidentData
): Promise<Incident> {
  const { data: incident, error } = await supabase
    .from('incident_logs')
    .update(data)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;

  // Send assignment email if assignee changed
  if (data.assigned_to && incident.assigned_to !== data.assigned_to) {
    try {
      await supabase.functions.invoke('send-incident-assignment', {
        body: {
          incidentId: id,
          assigneeId: data.assigned_to,
          reportedById: incident.reported_by
        }
      });
      console.log('Incident assignment email sent');
    } catch (emailError) {
      console.error('Failed to send incident assignment email:', emailError);
    }
  }

  return incident;
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

export async function checkSLABreaches(): Promise<void> {
  const { error } = await supabase.rpc('check_incident_sla_breaches');
  
  if (error) {
    console.error('Error checking SLA breaches:', error);
    throw error;
  }
}

export async function getIncidentMetrics(incidentId: string): Promise<{
  responseTime?: number;
  resolutionTime?: number;
  slaStatus: {
    response: 'met' | 'breached' | 'pending';
    resolution: 'met' | 'breached' | 'pending';
  };
}> {
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

export async function sendAlert(incidentId: string, email: string, message: string): Promise<void> {
  await createIncidentResponse({
    incident_id: incidentId,
    response_type: 'alert',
    response_content: message,
    alert_sent_to: email
  });

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
