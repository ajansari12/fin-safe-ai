
import { supabase } from "@/integrations/supabase/client";

export interface AppetiteBreachLog {
  id: string;
  org_id: string;
  risk_category_id?: string;
  statement_id?: string;
  threshold_id?: string;
  breach_date: string;
  breach_severity: 'warning' | 'breach' | 'critical';
  actual_value: number;
  threshold_value: number;
  variance_percentage?: number;
  escalation_level: number;
  escalated_at?: string;
  escalated_to?: string;
  escalated_to_name?: string;
  resolution_status: 'open' | 'acknowledged' | 'in_progress' | 'resolved';
  resolution_date?: string;
  resolution_notes?: string;
  alert_sent: boolean;
  board_reported: boolean;
  business_impact?: string;
  remediation_actions?: string;
  created_at: string;
  updated_at: string;
}

export interface EscalationRule {
  id: string;
  org_id: string;
  rule_name: string;
  rule_description?: string;
  trigger_condition: 'single_breach' | 'multiple_breaches' | 'aggregated_score';
  threshold_value: number;
  escalation_level: number;
  escalation_delay_hours: number;
  notification_recipients: any[];
  auto_escalate: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface BoardReport {
  id: string;
  org_id: string;
  report_period_start: string;
  report_period_end: string;
  report_type: 'weekly' | 'monthly' | 'quarterly' | 'annual';
  report_data: any;
  executive_summary?: string;
  key_findings?: string;
  recommendations?: string;
  risk_posture_score?: number;
  trend_analysis?: string;
  generated_by?: string;
  generated_by_name?: string;
  approved_by?: string;
  approved_by_name?: string;
  approval_date?: string;
  status: 'draft' | 'pending_approval' | 'approved' | 'published';
  created_at: string;
  updated_at: string;
}

export async function getAppetiteBreachLogs(): Promise<AppetiteBreachLog[]> {
  const { data: profile } = await supabase
    .from('profiles')
    .select('organization_id')
    .eq('id', (await supabase.auth.getUser()).data.user?.id)
    .single();

  if (!profile?.organization_id) {
    return [];
  }

  const { data, error } = await supabase
    .from('appetite_breach_logs')
    .select(`
      *,
      risk_categories(name),
      risk_appetite_statements(title),
      risk_thresholds(tolerance_level)
    `)
    .eq('org_id', profile.organization_id)
    .order('breach_date', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function updateBreachLog(id: string, updates: Partial<AppetiteBreachLog>): Promise<AppetiteBreachLog> {
  const { data, error } = await supabase
    .from('appetite_breach_logs')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function escalateBreach(breachId: string, escalationLevel: number, escalatedTo?: string): Promise<void> {
  await supabase
    .from('appetite_breach_logs')
    .update({
      escalation_level: escalationLevel,
      escalated_at: new Date().toISOString(),
      escalated_to: escalatedTo,
      updated_at: new Date().toISOString()
    })
    .eq('id', breachId);
}

export async function getEscalationRules(): Promise<EscalationRule[]> {
  const { data: profile } = await supabase
    .from('profiles')
    .select('organization_id')
    .eq('id', (await supabase.auth.getUser()).data.user?.id)
    .single();

  if (!profile?.organization_id) {
    return [];
  }

  const { data, error } = await supabase
    .from('appetite_escalation_rules')
    .select('*')
    .eq('org_id', profile.organization_id)
    .eq('is_active', true)
    .order('escalation_level');

  if (error) throw error;
  return data || [];
}

export async function createEscalationRule(rule: Omit<EscalationRule, 'id' | 'org_id' | 'created_at' | 'updated_at'>): Promise<EscalationRule> {
  const { data: profile } = await supabase
    .from('profiles')
    .select('organization_id')
    .eq('id', (await supabase.auth.getUser()).data.user?.id)
    .single();

  if (!profile?.organization_id) {
    throw new Error('User organization not found');
  }

  const { data, error } = await supabase
    .from('appetite_escalation_rules')
    .insert({
      ...rule,
      org_id: profile.organization_id
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getBoardReports(): Promise<BoardReport[]> {
  const { data: profile } = await supabase
    .from('profiles')
    .select('organization_id')
    .eq('id', (await supabase.auth.getUser()).data.user?.id)
    .single();

  if (!profile?.organization_id) {
    return [];
  }

  const { data, error } = await supabase
    .from('appetite_board_reports')
    .select('*')
    .eq('org_id', profile.organization_id)
    .order('report_period_end', { ascending: false });

  if (error) throw error;
  return data || [];
}

export async function generateBoardReport(
  periodStart: string,
  periodEnd: string,
  reportType: 'weekly' | 'monthly' | 'quarterly' | 'annual'
): Promise<BoardReport> {
  const { data: profile } = await supabase
    .from('profiles')
    .select('organization_id, full_name')
    .eq('id', (await supabase.auth.getUser()).data.user?.id)
    .single();

  if (!profile?.organization_id) {
    throw new Error('User organization not found');
  }

  // Get breach data for the period
  const { data: breaches } = await supabase
    .from('appetite_breach_logs')
    .select(`
      *,
      risk_categories(name),
      risk_appetite_statements(title)
    `)
    .eq('org_id', profile.organization_id)
    .gte('breach_date', periodStart)
    .lte('breach_date', periodEnd);

  // Calculate risk posture score
  const totalBreaches = breaches?.length || 0;
  const criticalBreaches = breaches?.filter(b => b.breach_severity === 'critical').length || 0;
  const riskPostureScore = Math.max(0, 100 - (criticalBreaches * 20) - (totalBreaches * 5));

  const reportData = {
    totalBreaches,
    criticalBreaches,
    warningBreaches: breaches?.filter(b => b.breach_severity === 'warning').length || 0,
    breachBreaches: breaches?.filter(b => b.breach_severity === 'breach').length || 0,
    resolvedBreaches: breaches?.filter(b => b.resolution_status === 'resolved').length || 0,
    avgResolutionTime: 0, // Calculate based on resolution dates
    topRiskCategories: [], // Calculate from breach data
    trends: [] // Calculate trends
  };

  const { data, error } = await supabase
    .from('appetite_board_reports')
    .insert({
      org_id: profile.organization_id,
      report_period_start: periodStart,
      report_period_end: periodEnd,
      report_type: reportType,
      report_data: reportData,
      risk_posture_score: riskPostureScore,
      generated_by: (await supabase.auth.getUser()).data.user?.id,
      generated_by_name: profile.full_name
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function checkAggregatedKRIScore(): Promise<{ isBreached: boolean; score: number; threshold: number }> {
  // This would calculate aggregated KRI scores across all categories
  // For now, return mock data
  const score = Math.random() * 100;
  const threshold = 75;
  
  return {
    isBreached: score > threshold,
    score,
    threshold
  };
}
