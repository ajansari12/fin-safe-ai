import { logger } from "@/lib/logger";
import { supabase } from "@/integrations/supabase/client";
import { getCurrentUserProfile } from "@/lib/supabase-utils";
import type { EscalationRule } from "./types";

export async function getEscalationRules(): Promise<EscalationRule[]> {
  try {
    const profile = await getCurrentUserProfile();
    if (!profile?.organization_id) return [];

    const { data, error } = await supabase
      .from('appetite_escalation_rules')
      .select('*')
      .eq('org_id', profile.organization_id)
      .eq('is_active', true)
      .order('escalation_level');

    if (error) throw error;
    return (data || []) as EscalationRule[];
  } catch (error) {
    logger.error('Failed to fetch escalation rules', {
      module: 'appetite_breach'
    }, error as Error);
    return [];
  }
}

export async function createEscalationRule(
  ruleData: Omit<EscalationRule, 'id' | 'created_at' | 'updated_at' | 'org_id'>
): Promise<EscalationRule | null> {
  try {
    const profile = await getCurrentUserProfile();
    if (!profile?.organization_id) return null;

    const { data, error } = await supabase
      .from('appetite_escalation_rules')
      .insert({
        ...ruleData,
        org_id: profile.organization_id,
      })
      .select()
      .single();

    if (error) throw error;
    return data as EscalationRule;
  } catch (error) {
    logger.error('Failed to create escalation rule', {
      module: 'appetite_breach'
    }, error as Error);
    return null;
  }
}