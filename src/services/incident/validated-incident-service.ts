import { supabase } from "@/integrations/supabase/client";
import { getCurrentUserProfile } from "@/lib/supabase-utils";
import { incidentSchema, IncidentFormData } from "@/lib/validations";
import { validateWithSchema } from "@/lib/validation-utils";

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

export interface CreateIncidentData {
  title: string;
  description?: string;
  severity: string;
  category?: string;
  business_function_id?: string;
  reported_by?: string;
  assigned_to?: string;
  status?: string;
  impact_rating?: number;
  max_response_time_hours?: number;
  max_resolution_time_hours?: number;
}

export interface UpdateIncidentData {
  title?: string;
  description?: string;
  severity?: string;
  category?: string;
  business_function_id?: string;
  assigned_to?: string;
  status?: string;
  impact_rating?: number;
  max_response_time_hours?: number;
  max_resolution_time_hours?: number;
}

export class ValidatedIncidentService {
  async createIncident(data: CreateIncidentData): Promise<Incident> {
    // Client-side validation
    const validation = validateWithSchema(incidentSchema, data);
    if (!validation.success) {
      throw new Error(`Validation failed: ${validation.errors?.join(', ')}`);
    }

    const profile = await getCurrentUserProfile();
    if (!profile?.organization_id) {
      throw new Error('Organization not found');
    }

    // Prepare data with required fields
    const incidentData = {
      title: validation.data?.title,
      description: validation.data?.description,
      severity: validation.data?.severity,
      category: validation.data?.category,
      business_function_id: validation.data?.business_function_id,
      assigned_to: validation.data?.assigned_to,
      status: validation.data?.status || 'open',
      impact_rating: validation.data?.impact_rating,
      max_response_time_hours: validation.data?.max_response_time_hours,
      max_resolution_time_hours: validation.data?.max_resolution_time_hours,
      org_id: profile.organization_id,
      reported_by: profile.id,
      reported_at: new Date().toISOString(),
    };

    const { data: incident, error } = await supabase
      .from('incident_logs')
      .insert(incidentData)
      .select()
      .single();

    if (error) {
      console.error('Database error creating incident:', error);
      throw new Error('Failed to create incident');
    }

    return this.transformIncidentResponse(incident);
  }

  async updateIncident(id: string, updates: UpdateIncidentData): Promise<Incident> {
    // Validate updates against partial schema
    const updateSchema = incidentSchema.partial();
    const validation = validateWithSchema(updateSchema, updates);
    if (!validation.success) {
      throw new Error(`Validation failed: ${validation.errors?.join(', ')}`);
    }

    const profile = await getCurrentUserProfile();
    if (!profile?.organization_id) {
      throw new Error('Organization not found');
    }

    const updateData = {
      ...validation.data,
      updated_at: new Date().toISOString(),
    };

    const { data: incident, error } = await supabase
      .from('incident_logs')
      .update(updateData)
      .eq('id', id)
      .eq('org_id', profile.organization_id)
      .select()
      .single();

    if (error) {
      console.error('Database error updating incident:', error);
      throw new Error('Failed to update incident');
    }

    return this.transformIncidentResponse(incident);
  }

  async getIncident(id: string): Promise<Incident | null> {
    const profile = await getCurrentUserProfile();
    if (!profile?.organization_id) {
      throw new Error('Organization not found');
    }

    const { data: incident, error } = await supabase
      .from('incident_logs')
      .select('*')
      .eq('id', id)
      .eq('org_id', profile.organization_id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Not found
      }
      console.error('Database error fetching incident:', error);
      throw new Error('Failed to fetch incident');
    }

    return this.transformIncidentResponse(incident);
  }

  async getIncidents(): Promise<Incident[]> {
    const profile = await getCurrentUserProfile();
    if (!profile?.organization_id) {
      return [];
    }

    const { data: incidents, error } = await supabase
      .from('incident_logs')
      .select('*')
      .eq('org_id', profile.organization_id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Database error fetching incidents:', error);
      throw new Error('Failed to fetch incidents');
    }

    return incidents.map(incident => this.transformIncidentResponse(incident));
  }

  private transformIncidentResponse(rawIncident: any): Incident {
    return {
      id: rawIncident.id,
      org_id: rawIncident.org_id,
      title: rawIncident.title,
      description: rawIncident.description,
      category: rawIncident.category,
      severity: rawIncident.severity,
      status: rawIncident.status,
      impact_rating: rawIncident.impact_rating,
      business_function_id: rawIncident.business_function_id,
      reported_by: rawIncident.reported_by,
      assigned_to: rawIncident.assigned_to,
      reported_at: rawIncident.reported_at,
      resolved_at: rawIncident.resolved_at,
      created_at: rawIncident.created_at,
      updated_at: rawIncident.updated_at,
      max_response_time_hours: rawIncident.max_response_time_hours,
      max_resolution_time_hours: rawIncident.max_resolution_time_hours,
      first_response_at: rawIncident.first_response_at,
      escalated_at: rawIncident.escalated_at,
      escalation_level: rawIncident.escalation_level || 0,
      assigned_level: rawIncident.assigned_level || 'analyst',
    };
  }

  // Server-side validation helper
  static validateIncidentData(data: unknown): { isValid: boolean; errors?: string[]; data?: IncidentFormData } {
    const validation = validateWithSchema(incidentSchema, data);
    if (validation.success) {
      return { isValid: true, data: validation.data };
    }
    return { isValid: false, errors: validation.errors };
  }
}

export const validatedIncidentService = new ValidatedIncidentService();
