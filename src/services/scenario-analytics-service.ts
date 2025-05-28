
import { supabase } from "@/integrations/supabase/client";

export interface ScenarioResult {
  id: string;
  scenario_test_id: string;
  execution_started_at: string;
  execution_completed_at?: string;
  response_time_minutes?: number;
  success_rate?: number;
  affected_functions_count: number;
  recovery_time_minutes?: number;
  lessons_learned?: string;
  ai_recommendations?: string;
  execution_notes?: string;
  test_coverage_score?: number;
  overall_score?: number;
  created_at: string;
  updated_at: string;
  org_id: string;
}

export interface ScenarioExecutionStep {
  id: string;
  scenario_result_id: string;
  step_number: number;
  step_name: string;
  step_description?: string;
  expected_outcome?: string;
  actual_outcome?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'skipped';
  started_at?: string;
  completed_at?: string;
  duration_minutes?: number;
  notes?: string;
  responsible_person?: string;
  created_at: string;
  updated_at: string;
}

export interface ScenarioTestMetrics {
  id: string;
  org_id: string;
  test_date: string;
  total_tests_conducted: number;
  successful_tests: number;
  failed_tests: number;
  average_response_time_minutes?: number;
  average_recovery_time_minutes?: number;
  test_coverage_percentage?: number;
  critical_functions_tested: number;
  high_priority_functions_tested: number;
  created_at: string;
  updated_at: string;
}

export async function getScenarioAnalytics(): Promise<{
  totalTests: number;
  successRate: number;
  averageResponseTime: number;
  testCoverageScore: number;
  recentMetrics: ScenarioTestMetrics[];
}> {
  const { data: profile } = await supabase
    .from('profiles')
    .select('organization_id')
    .eq('id', (await supabase.auth.getUser()).data.user?.id)
    .single();

  if (!profile?.organization_id) {
    return {
      totalTests: 0,
      successRate: 0,
      averageResponseTime: 0,
      testCoverageScore: 0,
      recentMetrics: []
    };
  }

  const { data: metrics, error } = await supabase
    .from('scenario_test_metrics')
    .select('*')
    .eq('org_id', profile.organization_id)
    .order('test_date', { ascending: false })
    .limit(30);

  if (error) throw error;

  const recentMetrics = (metrics || []) as ScenarioTestMetrics[];
  const totalTests = recentMetrics.reduce((sum, m) => sum + m.total_tests_conducted, 0);
  const successfulTests = recentMetrics.reduce((sum, m) => sum + m.successful_tests, 0);
  const successRate = totalTests > 0 ? (successfulTests / totalTests) * 100 : 0;
  
  const responseTimes = recentMetrics
    .filter(m => m.average_response_time_minutes)
    .map(m => m.average_response_time_minutes!);
  const averageResponseTime = responseTimes.length > 0 
    ? responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length 
    : 0;

  const coverageScores = recentMetrics
    .filter(m => m.test_coverage_percentage)
    .map(m => m.test_coverage_percentage!);
  const testCoverageScore = coverageScores.length > 0
    ? coverageScores.reduce((sum, score) => sum + score, 0) / coverageScores.length
    : 0;

  return {
    totalTests,
    successRate,
    averageResponseTime,
    testCoverageScore,
    recentMetrics
  };
}

export async function createScenarioResult(result: Omit<ScenarioResult, 'id' | 'created_at' | 'updated_at' | 'org_id'>): Promise<ScenarioResult> {
  const { data: profile } = await supabase
    .from('profiles')
    .select('organization_id')
    .eq('id', (await supabase.auth.getUser()).data.user?.id)
    .single();

  if (!profile?.organization_id) {
    throw new Error('User organization not found');
  }

  const { data, error } = await supabase
    .from('scenario_results')
    .insert({
      ...result,
      org_id: profile.organization_id
    })
    .select()
    .single();

  if (error) throw error;
  return data as ScenarioResult;
}

export async function updateScenarioResult(id: string, updates: Partial<ScenarioResult>): Promise<ScenarioResult> {
  const { data, error } = await supabase
    .from('scenario_results')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as ScenarioResult;
}

export async function getScenarioResults(scenarioTestId?: string): Promise<ScenarioResult[]> {
  const { data: profile } = await supabase
    .from('profiles')
    .select('organization_id')
    .eq('id', (await supabase.auth.getUser()).data.user?.id)
    .single();

  if (!profile?.organization_id) {
    return [];
  }

  let query = supabase
    .from('scenario_results')
    .select('*')
    .eq('org_id', profile.organization_id)
    .order('execution_started_at', { ascending: false });

  if (scenarioTestId) {
    query = query.eq('scenario_test_id', scenarioTestId);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data || []) as ScenarioResult[];
}

export async function createExecutionStep(step: Omit<ScenarioExecutionStep, 'id' | 'created_at' | 'updated_at'>): Promise<ScenarioExecutionStep> {
  const { data, error } = await supabase
    .from('scenario_execution_steps')
    .insert(step)
    .select()
    .single();

  if (error) throw error;
  return data as ScenarioExecutionStep;
}

export async function updateExecutionStep(id: string, updates: Partial<ScenarioExecutionStep>): Promise<ScenarioExecutionStep> {
  const { data, error } = await supabase
    .from('scenario_execution_steps')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data as ScenarioExecutionStep;
}

export async function getExecutionSteps(scenarioResultId: string): Promise<ScenarioExecutionStep[]> {
  const { data, error } = await supabase
    .from('scenario_execution_steps')
    .select('*')
    .eq('scenario_result_id', scenarioResultId)
    .order('step_number', { ascending: true });

  if (error) throw error;
  return (data || []) as ScenarioExecutionStep[];
}

export async function generateAIRecommendations(scenarioResult: ScenarioResult): Promise<string> {
  // Mock AI recommendations - in real implementation, this would call an AI service
  const recommendations = [];
  
  if (scenarioResult.success_rate && scenarioResult.success_rate < 70) {
    recommendations.push("• Consider additional training for response teams");
    recommendations.push("• Review and update incident response procedures");
  }
  
  if (scenarioResult.response_time_minutes && scenarioResult.response_time_minutes > 60) {
    recommendations.push("• Implement automated alerting systems");
    recommendations.push("• Pre-position response teams during critical periods");
  }
  
  if (scenarioResult.recovery_time_minutes && scenarioResult.recovery_time_minutes > 240) {
    recommendations.push("• Enhance backup and recovery procedures");
    recommendations.push("• Consider redundant systems for critical functions");
  }
  
  if (scenarioResult.test_coverage_score && scenarioResult.test_coverage_score < 80) {
    recommendations.push("• Expand testing scope to cover more business functions");
    recommendations.push("• Include additional dependency failure scenarios");
  }
  
  if (recommendations.length === 0) {
    recommendations.push("• Excellent performance - maintain current procedures");
    recommendations.push("• Consider increasing test complexity for continuous improvement");
  }
  
  return recommendations.join('\n');
}
