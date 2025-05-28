
import { supabase } from "@/integrations/supabase/client";

export interface KRILog {
  id: string;
  kri_id: string;
  measurement_date: string;
  actual_value: number;
  threshold_breached?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateKRILogData {
  kri_id: string;
  measurement_date: string;
  actual_value: number;
  threshold_breached?: string;
  notes?: string;
}

export async function getKRILogs(kriId: string): Promise<KRILog[]> {
  const { data, error } = await supabase
    .from('kri_logs')
    .select('*')
    .eq('kri_id', kriId)
    .order('measurement_date', { ascending: false });

  if (error) {
    throw error;
  }

  return (data || []) as KRILog[];
}

export async function createKRILog(data: CreateKRILogData): Promise<KRILog> {
  const { data: logData, error } = await supabase
    .from('kri_logs')
    .insert(data)
    .select()
    .single();

  if (error) {
    throw error;
  }

  const kriLog = logData as KRILog;

  // Check for threshold breaches and send alerts
  if (kriLog.threshold_breached && kriLog.threshold_breached !== 'none') {
    try {
      await supabase.functions.invoke('send-kri-breach-alert', {
        body: { kriLogId: kriLog.id }
      });
      console.log('KRI breach alert sent for log:', kriLog.id);
    } catch (emailError) {
      console.error('Failed to send KRI breach alert:', emailError);
      // Don't fail the log creation if email fails
    }
  }

  // Check for appetite variance and send notifications
  try {
    // Get the variance record that was automatically created by the trigger
    const { data: varianceData, error: varianceError } = await supabase
      .from('kri_appetite_variance')
      .select('id, variance_status')
      .eq('kri_id', kriLog.kri_id)
      .eq('measurement_date', kriLog.measurement_date)
      .single();

    if (!varianceError && varianceData && ['warning', 'breach'].includes(varianceData.variance_status)) {
      await supabase.functions.invoke('send-kri-appetite-breach-alert', {
        body: { varianceId: varianceData.id }
      });
      console.log('KRI appetite breach alert sent for variance:', varianceData.id);
    }
  } catch (appetiteError) {
    console.error('Failed to send KRI appetite breach alert:', appetiteError);
    // Don't fail the log creation if appetite alert fails
  }

  return kriLog;
}
