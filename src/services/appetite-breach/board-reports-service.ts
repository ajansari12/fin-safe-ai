import { logger } from "@/lib/logger";
import { supabase } from "@/integrations/supabase/client";
import { getCurrentUserProfile } from "@/lib/supabase-utils";
import type { BoardReport } from "./types";

export async function getBoardReports(): Promise<BoardReport[]> {
  try {
    const profile = await getCurrentUserProfile();
    if (!profile?.organization_id) return [];

    const { data, error } = await supabase
      .from('appetite_board_reports')
      .select('*')
      .eq('org_id', profile.organization_id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []) as BoardReport[];
  } catch (error) {
    logger.error('Failed to fetch board reports', {
      module: 'appetite_breach'
    }, error as Error);
    return [];
  }
}

export async function generateBoardReport(
  reportData: {
    report_period_start: string;
    report_period_end: string;
    report_type?: string;
    executive_summary?: string;
    key_findings?: string;
    recommendations?: string;
  }
): Promise<BoardReport | null> {
  try {
    const profile = await getCurrentUserProfile();
    if (!profile?.organization_id) return null;

    // Aggregate breach data for the report period
    const { data: breachData } = await supabase
      .from('appetite_breach_logs')
      .select('*')
      .eq('org_id', profile.organization_id)
      .gte('breach_date', reportData.report_period_start)
      .lte('breach_date', reportData.report_period_end);

    const reportContent = {
      ...reportData,
      org_id: profile.organization_id,
      report_data: {
        total_breaches: breachData?.length || 0,
        critical_breaches: breachData?.filter(b => b.breach_severity === 'critical').length || 0,
        unresolved_breaches: breachData?.filter(b => b.resolution_status === 'open').length || 0,
        breach_summary: breachData || [],
      },
      generated_by: profile.id,
      generated_by_name: profile.full_name,
    };

    const { data, error } = await supabase
      .from('appetite_board_reports')
      .insert(reportContent)
      .select()
      .single();

    if (error) throw error;
    return data as BoardReport;
  } catch (error) {
    logger.error('Failed to generate board report', {
      module: 'appetite_breach',
      metadata: { reportData }
    }, error as Error);
    return null;
  }
}