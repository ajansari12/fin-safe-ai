import { supabase } from "@/integrations/supabase/client";

export interface Dependency {
  id: string;
  business_function_id: string;
  dependency_type: 'vendor' | 'system' | 'staff' | 'data' | 'location';
  dependency_name: string;
  dependency_id?: string;
  criticality: 'critical' | 'high' | 'medium' | 'low';
  description?: string;
  status: 'operational' | 'degraded' | 'failed' | 'maintenance';
  created_at: string;
  updated_at: string;
  org_id: string;
}

export interface DependencyLog {
  id: string;
  dependency_id: string;
  business_function_id: string;
  event_type: 'status_change' | 'breach_detected' | 'tolerance_violation' | 'recovery';
  previous_status?: string;
  new_status: string;
  impact_level?: 'none' | 'low' | 'medium' | 'high' | 'critical';
  tolerance_breached: boolean;
  breach_duration_minutes?: number;
  alert_sent: boolean;
  notes?: string;
  detected_at: string;
  created_at: string;
  org_id: string;
}

export interface DependencyInput {
  business_function_id: string;
  dependency_type: 'vendor' | 'system' | 'staff' | 'data' | 'location';
  dependency_name: string;
  dependency_id?: string;
  criticality: 'critical' | 'high' | 'medium' | 'low';
  description?: string;
  status?: 'operational' | 'degraded' | 'failed' | 'maintenance';
  recovery_time_objective_hours?: number;
  maximum_tolerable_downtime_hours?: number;
  monitoring_status?: 'monitored' | 'partially_monitored' | 'not_monitored' | 'unknown';
  escalation_contacts?: any;
  sla_requirements?: string;
  geographic_location?: string;
  redundancy_level?: 'none' | 'basic' | 'full' | 'distributed';
}

export async function getDependencies(businessFunctionId?: string): Promise<Dependency[]> {
  try {
    const { data: profile } = await supabase
      .from('profiles')
      .select('organization_id')
      .eq('id', (await supabase.auth.getUser()).data.user?.id)
      .single();

    if (!profile?.organization_id) {
      return [];
    }

    let query = supabase
      .from('dependencies')
      .select('*')
      .eq('org_id', profile.organization_id)
      .order('dependency_name', { ascending: true });

    if (businessFunctionId) {
      query = query.eq('business_function_id', businessFunctionId);
    }

    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching dependencies:', error);
      throw error;
    }
    
    return (data || []) as Dependency[];
  } catch (error) {
    console.error('Error in getDependencies:', error);
    return [];
  }
}

export async function createDependency(input: DependencyInput): Promise<Dependency> {
  try {
    const { data: profile } = await supabase
      .from('profiles')
      .select('organization_id')
      .eq('id', (await supabase.auth.getUser()).data.user?.id)
      .single();

    if (!profile?.organization_id) {
      throw new Error('No organization found for user');
    }

    const { data, error } = await supabase
      .from('dependencies')
      .insert({
        ...input,
        org_id: profile.organization_id
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating dependency:', error);
      throw error;
    }

    return data as Dependency;
  } catch (error) {
    console.error('Error in createDependency:', error);
    throw error;
  }
}

export async function updateDependency(id: string, input: Partial<DependencyInput>): Promise<Dependency> {
  try {
    const { data, error } = await supabase
      .from('dependencies')
      .update(input)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating dependency:', error);
      throw error;
    }

    return data as Dependency;
  } catch (error) {
    console.error('Error in updateDependency:', error);
    throw error;
  }
}

export async function deleteDependency(id: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('dependencies')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting dependency:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error in deleteDependency:', error);
    throw error;
  }
}

export async function getDependencyLogs(dependencyId?: string, businessFunctionId?: string): Promise<DependencyLog[]> {
  try {
    const { data: profile } = await supabase
      .from('profiles')
      .select('organization_id')
      .eq('id', (await supabase.auth.getUser()).data.user?.id)
      .single();

    if (!profile?.organization_id) {
      return [];
    }

    let query = supabase
      .from('dependency_logs')
      .select('*')
      .eq('org_id', profile.organization_id)
      .order('detected_at', { ascending: false });

    if (dependencyId) {
      query = query.eq('dependency_id', dependencyId);
    }

    if (businessFunctionId) {
      query = query.eq('business_function_id', businessFunctionId);
    }

    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching dependency logs:', error);
      throw error;
    }
    
    return (data || []) as DependencyLog[];
  } catch (error) {
    console.error('Error in getDependencyLogs:', error);
    return [];
  }
}

export async function getDependencyBreaches(): Promise<DependencyLog[]> {
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
      .from('dependency_logs')
      .select(`
        *,
        dependencies!inner(dependency_name, status),
        business_functions!inner(name)
      `)
      .eq('org_id', profile.organization_id)
      .eq('tolerance_breached', true)
      .order('detected_at', { ascending: false })
      .limit(10);
    
    if (error) {
      console.error('Error fetching dependency breaches:', error);
      throw error;
    }
    
    return (data || []) as DependencyLog[];
  } catch (error) {
    console.error('Error in getDependencyBreaches:', error);
    return [];
  }
}

export async function createDependencyRelationship(relationship: {
  source_dependency_id: string;
  target_dependency_id: string;
  relationship_type: 'depends_on' | 'supports' | 'feeds_into' | 'backed_by' | 'redundant_with';
  relationship_strength: 'weak' | 'medium' | 'strong' | 'critical';
  failure_propagation_likelihood?: number;
  propagation_delay_minutes?: number;
  description?: string;
}): Promise<any> {
  try {
    const { data: profile } = await supabase
      .from('profiles')
      .select('organization_id')
      .eq('id', (await supabase.auth.getUser()).data.user?.id)
      .single();

    if (!profile?.organization_id) {
      throw new Error('No organization found for user');
    }

    const { data: { user } } = await supabase.auth.getUser();
    const { data: userProfile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', user?.id)
      .single();

    const { data, error } = await supabase
      .from('dependency_maps')
      .insert({
        ...relationship,
        org_id: profile.organization_id,
        created_by: user?.id,
        created_by_name: userProfile?.full_name || 'Unknown User'
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating dependency relationship:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in createDependencyRelationship:', error);
    throw error;
  }
}

export async function updateDependencyEnhancements(id: string, updates: {
  recovery_time_objective_hours?: number;
  maximum_tolerable_downtime_hours?: number;
  monitoring_status?: 'monitored' | 'partially_monitored' | 'not_monitored' | 'unknown';
  escalation_contacts?: any;
  sla_requirements?: string;
  geographic_location?: string;
  redundancy_level?: 'none' | 'basic' | 'full' | 'distributed';
}): Promise<Dependency> {
  try {
    const { data, error } = await supabase
      .from('dependencies')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating dependency enhancements:', error);
      throw error;
    }

    return data as Dependency;
  } catch (error) {
    console.error('Error in updateDependencyEnhancements:', error);
    throw error;
  }
}
