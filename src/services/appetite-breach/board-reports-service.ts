
import { supabase } from "@/integrations/supabase/client";
import { BoardReport } from "./types";

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
  return (data || []).map(item => ({
    ...item,
    report_type: item.report_type as 'weekly' | 'monthly' | 'quarterly' | 'annual',
    status: item.status as 'draft' | 'pending_approval' | 'approved' | 'published'
  }));
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
  return {
    ...data,
    report_type: data.report_type as 'weekly' | 'monthly' | 'quarterly' | 'annual',
    status: data.status as 'draft' | 'pending_approval' | 'approved' | 'published'
  };
}
