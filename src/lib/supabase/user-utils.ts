
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
      .maybeSingle();

    if (error) {
      console.warn('Error fetching profile:', error);
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

    // If no profile found, create a basic one
    if (!profile) {
      console.warn('No profile found for user, creating basic profile');
      const basicProfile = {
        id: user.id,
        full_name: user.user_metadata?.full_name || user.email,
        avatar_url: user.user_metadata?.avatar_url,
        role: 'user',
        organization_id: null,
        onboarding_status: 'not_started',
        created_at: user.created_at,
        updated_at: user.updated_at
      };
      
      // Try to insert the basic profile
      try {
        const { error: insertError } = await supabase
          .from('profiles')
          .insert(basicProfile);
          
        if (insertError) {
          console.warn('Failed to create basic profile:', insertError);
        }
      } catch (insertErr) {
        console.warn('Error inserting basic profile:', insertErr);
      }
      
      return basicProfile;
    }

    // Validate profile data
    if (!isValidProfile(profile)) {
      console.warn('Invalid profile data structure, using fallback');
      return {
        id: user.id,
        full_name: profile.full_name || user.email,
        avatar_url: profile.avatar_url,
        role: profile.role || 'user',
        organization_id: profile.organization_id,
        onboarding_status: profile.onboarding_status || 'not_started',
        created_at: profile.created_at || user.created_at,
        updated_at: profile.updated_at || user.updated_at
      };
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
      console.warn('AI Assistant fallback: No organization_id found in profile');
      return { org_id: null, name: 'Unknown Organization' };
    }

    const { data: organization, error } = await supabase
      .from('organizations')
      .select('*')
      .eq('id', profile.organization_id)
      .single();

    if (error) {
      console.warn('Organizations table not available, using fallback:', error);
      console.info('AI Assistant fallback: Using default organization context');
      // Return a mock organization with org_id for AI assistant
      return {
        org_id: profile.organization_id,
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
      console.warn('Invalid organization data structure, using fallback');
      return {
        org_id: profile.organization_id,
        name: 'Default Organization'
      };
    }

    // Ensure org_id is set for AI assistant compatibility
    return {
      ...organization,
      org_id: organization.id
    };
  } catch (error) {
    console.error('Error fetching user organization:', error);
    console.info('AI Assistant fallback: Using null organization context');
    // Always return a fallback object instead of null
    return { org_id: null, name: 'Unknown Organization' };
  }
}
