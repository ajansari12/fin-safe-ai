import { supabase } from "@/integrations/supabase/client";

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
      console.error('Error fetching business functions:', error);
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error('Error in getBusinessFunctions:', error);
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
      console.error('Error creating business function:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in createBusinessFunction:', error);
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
      console.error('Error updating business function:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in updateBusinessFunction:', error);
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
      console.error('Error deleting business function:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error in deleteBusinessFunction:', error);
    throw error;
  }
}

export async function getImpactTolerances(functionId?: string) {
  const query = supabase
    .from('impact_tolerances')
    .select('*, business_functions(name, criticality)');
  
  if (functionId) {
    query.eq('function_id', functionId);
  }
  
  const { data, error } = await query;
  
  if (error) {
    console.error('Error fetching impact tolerances:', error);
    throw error;
  }
  
  return data || [];
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
    console.error('Error creating impact tolerance:', error);
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
    console.error('Error updating impact tolerance:', error);
    throw error;
  }
  
  return data;
}

export async function publishImpactTolerance(id: string) {
  return updateImpactTolerance(id, { status: 'published' });
}
