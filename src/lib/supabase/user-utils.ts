
import { supabase } from "@/integrations/supabase/client";
import { ErrorHandler } from "../error-handling";

// Helper functions for user-related queries
export async function getCurrentUserProfile() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    if (error) throw error;
    return data;
  } catch (error) {
    ErrorHandler.handle(error, 'Fetching user profile');
    return null;
  }
}

export async function getUserOrganization() {
  try {
    const profile = await getCurrentUserProfile();
    if (!profile?.organization_id) return null;

    const { data, error } = await supabase
      .from('organizations')
      .select('*')
      .eq('id', profile.organization_id)
      .maybeSingle();

    if (error) throw error;
    return data;
  } catch (error) {
    ErrorHandler.handle(error, 'Fetching user organization');
    return null;
  }
}
