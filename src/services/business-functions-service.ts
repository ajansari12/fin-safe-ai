import { supabase } from "@/integrations/supabase/client";
import { normalizeJoinResults } from "@/lib/data-normalization";
import { logger } from "@/lib/logger";

export interface BusinessFunction {
  id: string;
  name: string;
  description: string | null;
  owner: string | null;
  criticality: string;
  category: string | null;
  org_id: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface BusinessFunctionInput {
  name: string;
  description?: string;
  owner?: string;
  criticality: string;
  category?: string;
}

export async function getBusinessFunctions(): Promise<BusinessFunction[]> {
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
      .from('business_functions')
      .select('*')
      .eq('org_id', profile.organization_id)
      .order('criticality', { ascending: false })
      .order('name', { ascending: true });
    
    if (error) {
      logger.error('Error fetching business functions', {
        component: 'BusinessFunctionsService',
        module: 'business-functions'
      }, error);
      throw error;
    }
    
    return data || [];
  } catch (error) {
    logger.error('Error in getBusinessFunctions', {
      component: 'BusinessFunctionsService',
      module: 'business-functions'
    }, error);
    return [];
  }
}

export async function createBusinessFunction(input: BusinessFunctionInput): Promise<BusinessFunction> {
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
      .from('business_functions')
      .insert({
        ...input,
        org_id: profile.organization_id
      })
      .select()
      .single();

    if (error) {
      logger.error('Error creating business function', {
        component: 'BusinessFunctionsService',
        module: 'business-functions',
        metadata: { input }
      }, error);
      throw error;
    }

    return data;
  } catch (error) {
    logger.error('Error in createBusinessFunction', {
      component: 'BusinessFunctionsService',
      module: 'business-functions',
      metadata: { input }
    }, error);
    throw error;
  }
}

export async function updateBusinessFunction(id: string, input: Partial<BusinessFunctionInput>): Promise<BusinessFunction> {
  try {
    const { data, error } = await supabase
      .from('business_functions')
      .update({
        ...input,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      logger.error('Error updating business function', {
        component: 'BusinessFunctionsService',
        module: 'business-functions',
        metadata: { id, input }
      }, error);
      throw error;
    }

    return data;
  } catch (error) {
    logger.error('Error in updateBusinessFunction', {
      component: 'BusinessFunctionsService',
      module: 'business-functions',
      metadata: { id, input }
    }, error);
    throw error;
  }
}

export async function deleteBusinessFunction(id: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('business_functions')
      .delete()
      .eq('id', id);

    if (error) {
      logger.error('Error deleting business function', {
        component: 'BusinessFunctionsService',
        module: 'business-functions',
        metadata: { id }
      }, error);
      throw error;
    }
  } catch (error) {
    logger.error('Error in deleteBusinessFunction', {
      component: 'BusinessFunctionsService',
      module: 'business-functions',
      metadata: { id }
    }, error);
    throw error;
  }
}

export async function getImpactTolerances(functionId?: string) {
  const query = supabase
    .from('impact_tolerances')
    .select('*, business_functions!function_id(name, criticality)');
  
  if (functionId) {
    query.eq('function_id', functionId);
  }
  
  const { data, error } = await query;
  
  if (error) {
    logger.error('Error fetching impact tolerances', {
      component: 'BusinessFunctionsService',
      module: 'business-functions',
      metadata: { functionId }
    }, error);
    throw error;
  }
  
  // Normalize the business_functions array to single object
  return normalizeJoinResults(data || []);
}

export async function createImpactTolerance(toleranceData: {
  function_id: string;
  max_tolerable_downtime: string;
  recovery_time_objective: string;
  financial_impact?: string;
  reputational_impact?: string;
  compliance_impact?: string;
  quantitative_threshold: string;
  status?: string;
}) {
  const { data, error } = await supabase
    .from('impact_tolerances')
    .insert(toleranceData)
    .select()
    .single();
  
  if (error) {
    logger.error('Error creating impact tolerance', {
      component: 'BusinessFunctionsService',
      module: 'business-functions',
      metadata: { toleranceData }
    }, error);
    throw error;
  }
  
  return data;
}

export async function updateImpactTolerance(id: string, toleranceData: {
  max_tolerable_downtime?: string;
  recovery_time_objective?: string;
  financial_impact?: string;
  reputational_impact?: string;
  compliance_impact?: string;
  quantitative_threshold?: string;
  status?: string;
}) {
  const { data, error } = await supabase
    .from('impact_tolerances')
    .update(toleranceData)
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    logger.error('Error updating impact tolerance', {
      component: 'BusinessFunctionsService',
      module: 'business-functions',
      metadata: { id, toleranceData }
    }, error);
    throw error;
  }
  
  return data;
}

export async function publishImpactTolerance(id: string) {
  return updateImpactTolerance(id, { status: 'published' });
}

export async function getDependenciesForFunction(functionId: string) {
  const { data, error } = await supabase
    .from('dependencies')
    .select('*')
    .eq('business_function_id', functionId)
    .order('dependency_name', { ascending: true });
  
  if (error) {
    logger.error('Error fetching dependencies for function', {
      component: 'BusinessFunctionsService',
      module: 'business-functions',
      metadata: { functionId }
    }, error);
    throw error;
  }
  
  return data || [];
}

export async function getDependencyMetrics() {
  try {
    const { data: profile } = await supabase
      .from('profiles')
      .select('organization_id')
      .eq('id', (await supabase.auth.getUser()).data.user?.id)
      .single();

    if (!profile?.organization_id) {
      return {
        totalDependencies: 0,
        criticalDependencies: 0,
        failedDependencies: 0,
        recentBreaches: 0
      };
    }

    const [dependenciesResult, breachesResult] = await Promise.all([
      supabase
        .from('dependencies')
        .select('criticality, status')
        .eq('org_id', profile.organization_id),
      supabase
        .from('dependency_logs')
        .select('id')
        .eq('org_id', profile.organization_id)
        .eq('tolerance_breached', true)
        .gte('detected_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()) // Last 7 days
    ]);

    const dependencies = dependenciesResult.data || [];
    const breaches = breachesResult.data || [];

    return {
      totalDependencies: dependencies.length,
      criticalDependencies: dependencies.filter(d => d.criticality === 'critical').length,
      failedDependencies: dependencies.filter(d => d.status === 'failed').length,
      recentBreaches: breaches.length
    };
  } catch (error) {
    logger.error('Error fetching dependency metrics', {
      component: 'BusinessFunctionsService',
      module: 'business-functions'
    }, error);
    return {
      totalDependencies: 0,
      criticalDependencies: 0,
      failedDependencies: 0,
      recentBreaches: 0
    };
  }
}
