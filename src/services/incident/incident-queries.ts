
import { supabase } from "@/integrations/supabase/client";
import type { Incident, CreateIncidentData, UpdateIncidentData } from "./types";

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
