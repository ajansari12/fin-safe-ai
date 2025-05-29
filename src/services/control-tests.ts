
import { supabase } from "@/integrations/supabase/client";

export interface ControlTest {
  id: string;
  control_id: string;
  test_date: string;
  test_type: 'effectiveness' | 'design' | 'operational';
  test_method: 'manual' | 'automated';
  test_result: 'pass' | 'fail' | 'partial';
  effectiveness_rating?: number;
  risk_reduction_impact?: number;
  test_description?: string;
  findings?: string;
  recommendations?: string;
  tested_by_id?: string;
  tested_by_name?: string;
  remediation_required: boolean;
  remediation_deadline?: string;
  remediation_status: 'not_required' | 'pending' | 'in_progress' | 'completed';
  org_id: string;
  created_at: string;
  updated_at: string;
}

export interface CreateControlTestData {
  control_id: string;
  test_date: string;
  test_type: 'effectiveness' | 'design' | 'operational';
  test_method: 'manual' | 'automated';
  test_result: 'pass' | 'fail' | 'partial';
  effectiveness_rating?: number;
  risk_reduction_impact?: number;
  test_description?: string;
  findings?: string;
  recommendations?: string;
  tested_by_name?: string;
  remediation_required?: boolean;
  remediation_deadline?: string;
  remediation_status?: 'not_required' | 'pending' | 'in_progress' | 'completed';
}

export async function getControlTests(controlId?: string): Promise<ControlTest[]> {
  const { data: profile } = await supabase
    .from('profiles')
    .select('organization_id')
    .eq('id', (await supabase.auth.getUser()).data.user?.id)
    .single();

  if (!profile?.organization_id) {
    return [];
  }

  let query = supabase
    .from('control_tests')
    .select('*')
    .eq('org_id', profile.organization_id)
    .order('test_date', { ascending: false });

  if (controlId) {
    query = query.eq('control_id', controlId);
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return (data || []) as ControlTest[];
}

export async function createControlTest(data: CreateControlTestData): Promise<ControlTest> {
  const { data: profile } = await supabase
    .from('profiles')
    .select('organization_id')
    .eq('id', (await supabase.auth.getUser()).data.user?.id)
    .single();

  if (!profile?.organization_id) {
    throw new Error('User not associated with an organization');
  }

  const { data: testData, error } = await supabase
    .from('control_tests')
    .insert({
      ...data,
      org_id: profile.organization_id,
      tested_by_id: (await supabase.auth.getUser()).data.user?.id
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return testData as ControlTest;
}

export async function updateControlTest(id: string, updates: Partial<ControlTest>): Promise<ControlTest> {
  const { data, error } = await supabase
    .from('control_tests')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data as ControlTest;
}

export async function deleteControlTest(id: string): Promise<void> {
  const { error } = await supabase
    .from('control_tests')
    .delete()
    .eq('id', id);

  if (error) {
    throw error;
  }
}

export async function getControlTestAnalytics(orgId: string) {
  const { data, error } = await supabase
    .from('control_tests')
    .select(`
      test_result,
      effectiveness_rating,
      risk_reduction_impact,
      test_date,
      control_id
    `)
    .eq('org_id', orgId);

  if (error) {
    throw error;
  }

  const totalTests = data.length;
  const passedTests = data.filter(t => t.test_result === 'pass').length;
  const failedTests = data.filter(t => t.test_result === 'fail').length;
  const partialTests = data.filter(t => t.test_result === 'partial').length;

  const effectivenessAvg = data
    .filter(t => t.effectiveness_rating)
    .reduce((sum, t) => sum + (t.effectiveness_rating || 0), 0) / 
    data.filter(t => t.effectiveness_rating).length || 0;

  const riskReductionAvg = data
    .filter(t => t.risk_reduction_impact)
    .reduce((sum, t) => sum + (t.risk_reduction_impact || 0), 0) / 
    data.filter(t => t.risk_reduction_impact).length || 0;

  return {
    totalTests,
    passedTests,
    failedTests,
    partialTests,
    effectivenessPercentage: totalTests > 0 ? (passedTests / totalTests) * 100 : 0,
    averageEffectivenessRating: effectivenessAvg,
    averageRiskReduction: riskReductionAvg
  };
}
