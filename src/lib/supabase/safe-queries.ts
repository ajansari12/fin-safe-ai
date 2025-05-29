
import { supabase } from "@/integrations/supabase/client";
import { ErrorHandler } from "../error-handling";

// Safe query helpers for single records
export async function safeGetSingleIncident(id: string) {
  try {
    const { data, error } = await supabase
      .from('incident_logs')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data;
  } catch (error) {
    ErrorHandler.handle(error, 'Fetching incident record');
    return null;
  }
}

export async function safeGetSinglePolicy(id: string) {
  try {
    const { data, error } = await supabase
      .from('governance_policies')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    return data;
  } catch (error) {
    ErrorHandler.handle(error, 'Fetching policy record');
    return null;
  }
}

// Safe delete helpers
export async function safeDeleteIncident(id: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('incident_logs')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  } catch (error) {
    ErrorHandler.handle(error, 'Deleting incident record');
    return false;
  }
}

export async function safeDeletePolicy(id: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('governance_policies')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  } catch (error) {
    ErrorHandler.handle(error, 'Deleting policy record');
    return false;
  }
}

export async function safeDeleteKRILog(id: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('kri_logs')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  } catch (error) {
    ErrorHandler.handle(error, 'Deleting KRI log record');
    return false;
  }
}
