import { supabase } from "@/integrations/supabase/client";
import { getCurrentUserProfile } from "@/lib/supabase-utils";
import type { AppetiteBreachLog } from "./types";

export async function getAppetiteBreachLogs(): Promise<AppetiteBreachLog[]> {
  try {
    const profile = await getCurrentUserProfile();
    if (!profile?.organization_id) return [];

    const { data, error } = await supabase
      .from('appetite_breach_logs')
      .select(`
        *,
        risk_category:risk_categories(name)
      `)
      .eq('org_id', profile.organization_id)
      .order('breach_date', { ascending: false });

    if (error) throw error;
    return (data || []) as AppetiteBreachLog[];
  } catch (error) {
    console.error('Error fetching appetite breach logs:', error);
    return [];
  }
}

export async function updateBreachLog(
  id: string, 
  updates: Partial<AppetiteBreachLog>
): Promise<AppetiteBreachLog | null> {
  try {
    const { data, error } = await supabase
      .from('appetite_breach_logs')
      .update(updates)
      .eq('id', id)
      .select(`
        *,
        risk_category:risk_categories(name)
      `)
      .single();

    if (error) throw error;
    return data as AppetiteBreachLog;
  } catch (error) {
    console.error('Error updating breach log:', error);
    return null;
  }
}

export async function escalateBreach(
  id: string,
  escalationData: {
    escalated_to: string;
    escalated_to_name: string;
    escalation_level: number;
  }
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('appetite_breach_logs')
      .update({
        ...escalationData,
        escalated_at: new Date().toISOString(),
      })
      .eq('id', id);

    return !error;
  } catch (error) {
    console.error('Error escalating breach:', error);
    return false;
  }
}