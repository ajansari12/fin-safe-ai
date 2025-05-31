
import { supabase } from "@/integrations/supabase/client";
import { AppetiteBreachLog } from "./types";

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
  return (data || []).map(item => ({
    ...item,
    breach_severity: item.breach_severity as 'warning' | 'breach' | 'critical',
    resolution_status: item.resolution_status as 'open' | 'acknowledged' | 'in_progress' | 'resolved'
  }));
}

export async function updateBreachLog(id: string, updates: Partial<AppetiteBreachLog>): Promise<AppetiteBreachLog> {
  const { data, error } = await supabase
    .from('appetite_breach_logs')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return {
    ...data,
    breach_severity: data.breach_severity as 'warning' | 'breach' | 'critical',
    resolution_status: data.resolution_status as 'open' | 'acknowledged' | 'in_progress' | 'resolved'
  };
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
