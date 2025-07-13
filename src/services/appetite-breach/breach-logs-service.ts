import { supabase } from "@/integrations/supabase/client";
import { getCurrentUserProfile } from "@/lib/supabase-utils";
import type { AppetiteBreachLog } from "./types";
import { logger } from "@/lib/logger";

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
    logger.error('Error fetching appetite breach logs', {
      component: 'BreachLogsService',
      module: 'appetite-breach'
    }, error);
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
    logger.error('Error updating breach log', {
      component: 'BreachLogsService',
      module: 'appetite-breach',
      metadata: { logId: id }
    }, error);
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
    logger.error('Error escalating breach', {
      component: 'BreachLogsService',
      module: 'appetite-breach',
      metadata: { logId: id, escalationData }
    }, error);
    return false;
  }
}

export async function logToleranceBreach(
  toleranceId: string,
  operationName: string,
  actualValue: number,
  thresholdValue: number,
  severity: 'low' | 'medium' | 'high' | 'critical',
  businessImpact?: string
): Promise<string | null> {
  try {
    const profile = await getCurrentUserProfile();
    if (!profile?.organization_id) {
      throw new Error('Organization ID not found');
    }

    const variance = ((actualValue - thresholdValue) / thresholdValue) * 100;

    const { data, error } = await supabase
      .from('appetite_breach_logs')
      .insert({
        org_id: profile.organization_id,
        threshold_id: toleranceId,
        actual_value: actualValue,
        threshold_value: thresholdValue,
        variance_percentage: variance,
        breach_severity: severity,
        business_impact: businessImpact || `${operationName} disruption tolerance exceeded`,
        resolution_status: 'open',
        alert_sent: false,
        board_reported: false
      })
      .select('id')
      .single();

    if (error) throw error;

    // Trigger automated alert
    if (data?.id) {
      try {
        await supabase.functions.invoke('send-tolerance-breach-alert', {
          body: {
            breachId: data.id,
            operationName,
            severity,
            actualValue,
            thresholdValue,
            variance: variance.toFixed(2)
          }
        });

        // Update alert_sent flag
        await supabase
          .from('appetite_breach_logs')
          .update({ alert_sent: true })
          .eq('id', data.id);
      } catch (alertError) {
        logger.error('Failed to send tolerance breach alert', {
          component: 'BreachLogsService',
          module: 'tolerance-monitoring',
          metadata: { breachId: data.id }
        }, alertError);
      }
    }

    logger.info('Tolerance breach logged successfully', {
      component: 'BreachLogsService',
      module: 'tolerance-monitoring',
      metadata: { 
        breachId: data?.id, 
        operation: operationName, 
        severity,
        variance: variance.toFixed(2)
      }
    });

    return data?.id || null;
  } catch (error) {
    logger.error('Error logging tolerance breach', {
      component: 'BreachLogsService',
      module: 'tolerance-monitoring',
      metadata: { 
        toleranceId, 
        operationName, 
        actualValue, 
        thresholdValue,
        severity 
      }
    }, error);
    return null;
  }
}