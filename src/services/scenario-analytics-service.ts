
import { supabase } from "@/integrations/supabase/client";

export interface ScenarioAnalytics {
  totalTests: number;
  successRate: number;
  averageResponseTime: number;
  testCoverageScore: number;
  recentMetrics: ScenarioTestMetric[];
}

export interface ScenarioTestMetric {
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

export interface ScenarioResult {
  id: string;
  scenario_test_id: string;
  org_id: string;
  execution_started_at: string;
  execution_completed_at?: string;
  overall_score?: number;
  success_rate?: number;
  response_time_minutes?: number;
  recovery_time_minutes?: number;
  affected_functions_count?: number;
  test_coverage_score?: number;
  execution_notes?: string;
  lessons_learned?: string;
  ai_recommendations?: string;
  created_at: string;
  updated_at: string;
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
  responsible_person?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export async function getScenarioAnalytics(): Promise<ScenarioAnalytics> {
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

  // Get recent metrics for the last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const { data: metrics, error } = await supabase
    .from('scenario_test_metrics')
    .select('*')
    .eq('org_id', profile.organization_id)
    .gte('test_date', thirtyDaysAgo.toISOString().split('T')[0])
    .order('test_date', { ascending: false });

  if (error) throw error;

  const recentMetrics = metrics || [];
  
  // Calculate aggregated analytics
  const totalTests = recentMetrics.reduce((sum, m) => sum + m.total_tests_conducted, 0);
  const successfulTests = recentMetrics.reduce((sum, m) => sum + m.successful_tests, 0);
  const successRate = totalTests > 0 ? (successfulTests / totalTests) * 100 : 0;
  
  const responseTimeMetrics = recentMetrics.filter(m => m.average_response_time_minutes);
  const averageResponseTime = responseTimeMetrics.length > 0 
    ? responseTimeMetrics.reduce((sum, m) => sum + (m.average_response_time_minutes || 0), 0) / responseTimeMetrics.length
    : 0;

  const coverageMetrics = recentMetrics.filter(m => m.test_coverage_percentage);
  const testCoverageScore = coverageMetrics.length > 0
    ? coverageMetrics.reduce((sum, m) => sum + (m.test_coverage_percentage || 0), 0) / coverageMetrics.length
    : 0;

  return {
    totalTests,
    successRate,
    averageResponseTime,
    testCoverageScore,
    recentMetrics
  };
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
  return data || [];
}

export async function createScenarioResult(resultData: Partial<ScenarioResult>): Promise<ScenarioResult> {
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
      ...resultData,
      org_id: profile.organization_id
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateScenarioResult(id: string, updates: Partial<ScenarioResult>): Promise<ScenarioResult> {
  const { data, error } = await supabase
    .from('scenario_results')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getExecutionSteps(scenarioResultId: string): Promise<ScenarioExecutionStep[]> {
  const { data, error } = await supabase
    .from('scenario_execution_steps')
    .select('*')
    .eq('scenario_result_id', scenarioResultId)
    .order('step_number', { ascending: true });

  if (error) throw error;
  return data || [];
}

export async function createExecutionStep(stepData: Partial<ScenarioExecutionStep>): Promise<ScenarioExecutionStep> {
  const { data, error } = await supabase
    .from('scenario_execution_steps')
    .insert(stepData)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateExecutionStep(id: string, updates: Partial<ScenarioExecutionStep>): Promise<ScenarioExecutionStep> {
  const { data, error } = await supabase
    .from('scenario_execution_steps')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function generateAIRecommendations(resultData: Partial<ScenarioResult>): Promise<string> {
  // Mock AI recommendations for now - in real implementation this would call an AI service
  const recommendations = `
Based on the scenario test execution:

1. Response Time Analysis:
   - Average response time: ${resultData.response_time_minutes || 0} minutes
   - Recommendation: ${(resultData.response_time_minutes || 0) > 30 ? 'Consider implementing automated detection systems to reduce response time' : 'Response time is within acceptable limits'}

2. Recovery Performance:
   - Recovery time: ${resultData.recovery_time_minutes || 0} minutes
   - Success rate: ${resultData.success_rate || 0}%
   - Recommendation: ${(resultData.success_rate || 0) < 80 ? 'Review and update recovery procedures. Consider additional training for response teams.' : 'Recovery procedures are performing well'}

3. Areas for Improvement:
   - ${(resultData.success_rate || 0) < 80 ? 'Focus on improving scenario execution success rate through better preparation and training' : 'Maintain current high performance standards'}
   - Consider implementing real-time monitoring for faster detection
   - Review communication protocols during incidents

4. Next Steps:
   - Schedule follow-up training sessions
   - Update response procedures based on lessons learned
   - Plan next scenario test within 3-6 months
  `;

  return recommendations.trim();
}
