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

  return kriLog;
}
