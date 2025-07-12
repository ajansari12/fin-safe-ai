import { logger } from "@/lib/logger";
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
      logger.error('Failed to fetch dependencies', {
        module: 'dependencies',
        metadata: { businessFunctionId }
      }, error);
      throw error;
    }
    
    return (data || []) as Dependency[];
  } catch (error) {
    logger.error('Error in getDependencies operation', {
      module: 'dependencies',
      metadata: { businessFunctionId }
    }, error as Error);
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
      logger.error('Failed to create dependency', {
        module: 'dependencies',
        metadata: { input }
      }, error);
      throw error;
    }

    return data as Dependency;
  } catch (error) {
    logger.error('Error in createDependency operation', {
      module: 'dependencies',
      metadata: { input }
    }, error as Error);
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
      logger.error('Failed to update dependency', {
        module: 'dependencies',
        metadata: { id, input }
      }, error);
      throw error;
    }

    return data as Dependency;
  } catch (error) {
    logger.error('Error in updateDependency operation', {
      module: 'dependencies',
      metadata: { id, input }
    }, error as Error);
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
      logger.error('Failed to delete dependency', {
        module: 'dependencies',
        metadata: { id }
      }, error);
      throw error;
    }
  } catch (error) {
    logger.error('Error in deleteDependency operation', {
      module: 'dependencies',
      metadata: { id }
    }, error as Error);
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
      logger.error('Failed to fetch dependency logs', {
        module: 'dependencies',
        metadata: { dependencyId, businessFunctionId }
      }, error);
      throw error;
    }
    
    return (data || []) as DependencyLog[];
  } catch (error) {
    logger.error('Error in getDependencyLogs operation', {
      module: 'dependencies',
      metadata: { dependencyId, businessFunctionId }
    }, error as Error);
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
      logger.error('Failed to fetch dependency breaches', {
        module: 'dependencies'
      }, error);
      throw error;
    }
    
    return (data || []) as DependencyLog[];
  } catch (error) {
    logger.error('Error in getDependencyBreaches operation', {
      module: 'dependencies'
    }, error as Error);
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
      logger.error('Failed to create dependency relationship', {
        module: 'dependencies',
        metadata: { relationship }
      }, error);
      throw error;
    }

    return data;
  } catch (error) {
    logger.error('Error in createDependencyRelationship operation', {
      module: 'dependencies',
      metadata: { relationship }
    }, error as Error);
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
      logger.error('Failed to update dependency enhancements', {
        module: 'dependencies',
        metadata: { id, updates }
      }, error);
      throw error;
    }

    return data as Dependency;
  } catch (error) {
    logger.error('Error in updateDependencyEnhancements operation', {
      module: 'dependencies',
      metadata: { id, updates }
    }, error as Error);
    throw error;
  }
}
