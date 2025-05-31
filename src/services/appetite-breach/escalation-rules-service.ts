
import { supabase } from "@/integrations/supabase/client";
import { EscalationRule } from "./types";

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
  return (data || []).map(item => ({
    ...item,
    trigger_condition: item.trigger_condition as 'single_breach' | 'multiple_breaches' | 'aggregated_score',
    notification_recipients: Array.isArray(item.notification_recipients) ? item.notification_recipients : [],
    escalation_delay_hours: item.escalation_delay_hours || 0,
    auto_escalate: item.auto_escalate || false
  }));
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
  return {
    ...data,
    trigger_condition: data.trigger_condition as 'single_breach' | 'multiple_breaches' | 'aggregated_score',
    notification_recipients: Array.isArray(data.notification_recipients) ? data.notification_recipients : [],
    escalation_delay_hours: data.escalation_delay_hours || 0,
    auto_escalate: data.auto_escalate || false
  };
}
