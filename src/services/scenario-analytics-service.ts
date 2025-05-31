
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

export async function getScenarioResults(scenarioTestId?: string) {
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
