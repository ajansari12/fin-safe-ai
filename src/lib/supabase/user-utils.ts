
import { supabase } from "@/integrations/supabase/client";
import { isValidProfile, isValidOrganization } from "./database-types";

export async function getCurrentUserProfile() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return null;
    }

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) {
      console.warn('Profile table not available, using auth user data:', error);
      // Return a mock profile based on auth user
      return {
        id: user.id,
        full_name: user.user_metadata?.full_name || user.email,
        avatar_url: user.user_metadata?.avatar_url,
        role: user.user_metadata?.role || 'user',
        organization_id: user.user_metadata?.organization_id,
        onboarding_status: 'completed',
        created_at: user.created_at,
        updated_at: user.updated_at
      };
    }

    // Validate profile data
    if (!isValidProfile(profile)) {
      throw new Error('Invalid profile data structure');
    }

    return profile;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
}

export async function getUserOrganization() {
  try {
    const profile = await getCurrentUserProfile();
    
    if (!profile?.organization_id) {
      return null;
    }

    const { data: organization, error } = await supabase
      .from('organizations')
      .select('*')
      .eq('id', profile.organization_id)
      .single();

    if (error) {
      console.warn('Organizations table not available:', error);
      // Return a mock organization
      return {
        id: profile.organization_id,
        name: 'Default Organization',
        sector: 'Financial Services',
        size: 'Large',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
    }

    // Validate organization data
    if (!isValidOrganization(organization)) {
      throw new Error('Invalid organization data structure');
    }

    return organization;
  } catch (error) {
    console.error('Error fetching user organization:', error);
    return null;
  }
}
