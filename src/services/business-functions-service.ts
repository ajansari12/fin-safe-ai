
import { supabase } from "@/integrations/supabase/client";

export async function getBusinessFunctions() {
  const { data, error } = await supabase
    .from('business_functions')
    .select('*')
    .order('criticality', { ascending: false });
  
  if (error) {
    console.error('Error fetching business functions:', error);
    throw error;
  }
  
  return data || [];
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
