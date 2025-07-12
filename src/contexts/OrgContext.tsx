import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
// FIXME: Migrated from useEnhancedAuth to useAuth for consistency
import { useAuth } from "./EnhancedAuthContext";
import { toast } from "sonner";

interface Organization {
  id: string;
  name: string;
  sector?: string;
  size?: string;
  regulatory_guidelines?: string[];
  created_at?: string;
  updated_at?: string;
}

interface OrganizationProfile {
  id: string;
  organization_id: string;
  preferred_framework_types?: string[];
  auto_generate_frameworks?: boolean;
  framework_preferences?: Record<string, any>;
  employee_count?: number;
  risk_maturity?: string;
  sub_sector?: string;
  created_at?: string;
  updated_at?: string;
}

interface OrgContextType {
  organization: Organization | null;
  organizationProfile: OrganizationProfile | null;
  isLoading: boolean;
  hasOrgAccess: (orgId?: string) => boolean;
  isOrgMember: () => boolean;
  isOrgAdmin: () => boolean;
  refreshOrganization: () => Promise<void>;
  updateOrganization: (data: Partial<Organization>) => Promise<void>;
  updateOrganizationProfile: (data: Partial<OrganizationProfile>) => Promise<void>;
}

const OrgContext = createContext<OrgContextType | undefined>(undefined);

export const OrgProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { userContext, isAuthenticated, hasRole } = useAuth(); // FIXME: Updated from useEnhancedAuth
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [organizationProfile, setOrganizationProfile] = useState<OrganizationProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated && userContext?.organizationId) {
      fetchOrganizationData();
    } else {
      setOrganization(null);
      setOrganizationProfile(null);
    }
  }, [isAuthenticated, userContext?.organizationId]);

  const fetchOrganizationData = async () => {
    if (!userContext?.organizationId) return;
    
    try {
      setIsLoading(true);
      console.log('🏢 Fetching organization data for:', userContext.organizationId);
      
      // Fetch organization data
      const { data: orgData, error: orgError } = await supabase
        .from('organizations')
        .select('*')
        .eq('id', userContext.organizationId)
        .maybeSingle();
        
      if (orgError) {
        console.error('❌ Error fetching organization:', orgError);
        if (orgError.code !== 'PGRST116') { // Not a "not found" error
          toast.error('Failed to load organization data');
        }
      } else if (orgData) {
        setOrganization(orgData);
        console.log('✅ Organization data loaded:', orgData.name);
      }
      
      // Fetch organization profile
      const { data: profileData, error: profileError } = await supabase
        .from('organizational_profiles')
        .select('*')
        .eq('organization_id', userContext.organizationId)
        .maybeSingle();
        
      if (profileError) {
        console.warn('⚠️ Error fetching organization profile:', profileError);
        // Don't show error for missing profiles as they might not exist yet
      } else if (profileData) {
        setOrganizationProfile(profileData);
        console.log('✅ Organization profile loaded');
      }
      
    } catch (error) {
      console.error('💥 Failed to fetch organization data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const hasOrgAccess = (orgId?: string): boolean => {
    const targetOrgId = orgId || userContext?.organizationId;
    
    // Super admin has access to all orgs
    if (hasRole('super_admin')) return true;
    
    // Check if user belongs to the target organization
    return userContext?.organizationId === targetOrgId;
  };

  const isOrgMember = (): boolean => {
    return !!userContext?.organizationId;
  };

  const isOrgAdmin = (): boolean => {
    return hasRole('admin') || hasRole('super_admin');
  };

  const refreshOrganization = async () => {
    await fetchOrganizationData();
  };

  const updateOrganization = async (data: Partial<Organization>) => {
    if (!userContext?.organizationId || !isOrgAdmin()) {
      toast.error('You do not have permission to update organization settings');
      return;
    }

    try {
      const { error } = await supabase
        .from('organizations')
        .update(data)
        .eq('id', userContext.organizationId);

      if (error) {
        console.error('❌ Error updating organization:', error);
        toast.error('Failed to update organization');
        throw error;
      }

      // Refresh organization data
      await refreshOrganization();
      toast.success('Organization updated successfully');
    } catch (error) {
      console.error('💥 Failed to update organization:', error);
      throw error;
    }
  };

  const updateOrganizationProfile = async (data: Partial<OrganizationProfile>) => {
    if (!userContext?.organizationId || !isOrgAdmin()) {
      toast.error('You do not have permission to update organization profile');
      return;
    }

    try {
      // Check if profile exists
      if (organizationProfile) {
        // Update existing profile
        const { error } = await supabase
          .from('organizational_profiles')
          .update(data)
          .eq('id', organizationProfile.id);

        if (error) {
          console.error('❌ Error updating organization profile:', error);
          toast.error('Failed to update organization profile');
          throw error;
        }
      } else {
        // Create new profile
        const { error } = await supabase
          .from('organizational_profiles')
          .insert({
            organization_id: userContext.organizationId,
            ...data
          });

        if (error) {
          console.error('❌ Error creating organization profile:', error);
          toast.error('Failed to create organization profile');
          throw error;
        }
      }

      // Refresh organization data
      await refreshOrganization();
      toast.success('Organization profile updated successfully');
    } catch (error) {
      console.error('💥 Failed to update organization profile:', error);
      throw error;
    }
  };

  return (
    <OrgContext.Provider value={{
      organization,
      organizationProfile,
      isLoading,
      hasOrgAccess,
      isOrgMember,
      isOrgAdmin,
      refreshOrganization,
      updateOrganization,
      updateOrganizationProfile
    }}>
      {children}
    </OrgContext.Provider>
  );
};

export const useOrg = () => {
  const context = useContext(OrgContext);
  if (context === undefined) {
    throw new Error("useOrg must be used within an OrgProvider");
  }
  return context;
};