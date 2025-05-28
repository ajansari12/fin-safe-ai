
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

export interface IncidentMetrics {
  responseTime?: number;
  resolutionTime?: number;
  slaStatus: {
    response: 'met' | 'breached' | 'pending';
    resolution: 'met' | 'breached' | 'pending';
  };
}
