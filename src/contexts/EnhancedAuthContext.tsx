import React, { createContext, useState, useContext, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

// Enhanced user profile with unified roles and permissions
interface EnhancedProfile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  organization_id: string | null;
  role: string; // Primary role from profiles table
  roles: string[]; // All roles from user_roles table
  permissions: string[]; // Computed permissions based on roles
  onboarding_status?: string;
  created_at?: string;
  updated_at?: string;
}

// Unified user session context
interface UnifiedUserContext {
  userId: string | null;
  email: string | null;
  organizationId: string | null;
  roles: string[];
  permissions: string[];
  profile: EnhancedProfile | null;
}

interface EnhancedAuthContextType {
  user: User | null;
  session: Session | null;
  profile: EnhancedProfile | null;
  userContext: UnifiedUserContext | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  hasRole: (role: string) => boolean;
  hasPermission: (permission: string) => boolean;
  hasAnyRole: (roles: string[]) => boolean;
  isOrgAdmin: () => boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
  updateProfile: (profile: Partial<EnhancedProfile>) => Promise<void>;
  refreshUserContext: () => Promise<void>;
}

const EnhancedAuthContext = createContext<EnhancedAuthContextType | undefined>(undefined);

// Role-based permissions mapping
const ROLE_PERMISSIONS: Record<string, string[]> = {
  'super_admin': ['*'], // All permissions
  'admin': [
    // Dashboard permissions
    'dashboard:view', 'dashboard:customize',
    // Core permissions
    'org:read', 'org:write', 'org:delete',
    'users:read', 'users:write', 'users:delete',
    'frameworks:read', 'frameworks:write', 'frameworks:delete',
    'incidents:read', 'incidents:write', 'incidents:delete',
    'controls:read', 'controls:write', 'controls:delete',
    'audit:read', 'audit:write',
    'reporting:read', 'reporting:write',
    // Module permissions
    'risks:read', 'risks:write', 'risks:delete', 'risks:manage',
    'governance:read', 'governance:write', 'governance:approve', 'governance:manage',
    'third_party:read', 'third_party:write', 'third_party:assess',
    'continuity:read', 'continuity:write', 'continuity:test',
    'documents:read', 'documents:write', 'documents:delete', 'documents:approve',
    'analytics:read', 'analytics:advanced',
    'integrations:read', 'integrations:write', 'integrations:configure'
  ],
  'manager': [
    'org:read', 
    'users:read',
    'frameworks:read', 'frameworks:write',
    'incidents:read', 'incidents:write',
    'controls:read', 'controls:write',
    'audit:read',
    'reporting:read', 'reporting:write'
  ],
  'analyst': [
    'org:read',
    'frameworks:read', 'frameworks:write',
    'incidents:read', 'incidents:write',
    'controls:read', 'controls:write',
    'reporting:read'
  ],
  'auditor': [
    'org:read',
    'frameworks:read',
    'incidents:read',
    'controls:read',
    'audit:read', 'audit:write',
    'reporting:read'
  ],
  'executive': [
    'org:read',
    'frameworks:read',
    'incidents:read',
    'controls:read',
    'reporting:read'
  ],
  'user': [
    'dashboard:view',
    'risks:read',
    'controls:read',
    'incidents:read',
    'governance:read',
    'third_party:read',
    'continuity:read',
    'documents:read',
    'analytics:read',
    'reporting:read',
    'org:read'
  ]
};

export const EnhancedAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<EnhancedProfile | null>(null);
  const [userContext, setUserContext] = useState<UnifiedUserContext | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    console.log('🚀 Initializing enhanced auth state...');
    
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log('🔄 Auth state changed:', event, session?.user?.email || 'no user');
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (event === 'SIGNED_IN') {
          console.log('✅ User signed in successfully');
          // Defer the profile fetch to avoid potential deadlocks
          setTimeout(() => {
            fetchEnhancedUserData(session?.user?.id);
          }, 0);
        } else if (event === 'TOKEN_REFRESHED') {
          console.log('🔄 Token refreshed');
          // Optionally refresh profile data
          setTimeout(() => {
            fetchEnhancedUserData(session?.user?.id);
          }, 0);
        } else if (event === 'SIGNED_OUT') {
          console.log('👋 User signed out');
          setProfile(null);
          setUserContext(null);
        } else if (event === 'USER_UPDATED') {
          console.log('👤 User updated');
          setTimeout(() => {
            fetchEnhancedUserData(session?.user?.id);
          }, 0);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error('❌ Error getting session:', error);
      } else if (session) {
        console.log('✅ Existing session found for:', session.user.email);
        setSession(session);
        setUser(session.user);
        fetchEnhancedUserData(session.user.id);
      } else {
        console.log('ℹ️ No existing session found');
      }
    }).finally(() => {
      console.log('🏁 Enhanced auth initialization complete');
      setIsLoading(false);
    });

    return () => {
      console.log('🧹 Cleaning up enhanced auth subscription');
      subscription.unsubscribe();
    };
  }, []);

  const fetchEnhancedUserData = async (userId: string | undefined, retryCount = 0) => {
    if (!userId) {
      console.warn('⚠️ No userId provided to fetchEnhancedUserData');
      return;
    }
    
    const maxRetries = 3;
    const retryDelay = Math.pow(2, retryCount) * 1000; // Exponential backoff
    
    try {
      console.log('👤 Fetching enhanced user data for:', userId, retryCount > 0 ? `(retry ${retryCount})` : '');
      
      // Fetch profile data with error resilience
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
        
      if (profileError) {
        console.error('❌ Error fetching profile:', profileError);
        
        // Handle missing profile gracefully
        if (profileError.code === 'PGRST116') {
          console.warn('⚠️ No profile found for user, creating minimal context');
          
          // Create minimal context for user without profile
          const minimalContext: UnifiedUserContext = {
            userId,
            email: user?.email || null,
            organizationId: null,
            roles: ['user'], // Default role
            permissions: ROLE_PERMISSIONS['user'] || [],
            profile: null
          };
          
          setUserContext(minimalContext);
          
          // Redirect to setup only if not already there
          if (location.pathname.startsWith('/app/') && location.pathname !== '/setup/enhanced') {
            console.log('🔄 Redirecting to organization setup');
            navigate('/setup/enhanced');
          }
          return;
        }
        
        // For other errors, create fallback context instead of throwing
        console.warn('⚠️ Profile fetch failed, creating fallback context:', profileError);
        const fallbackContext: UnifiedUserContext = {
          userId,
          email: user?.email || null,
          organizationId: null,
          roles: ['user'],
          permissions: ROLE_PERMISSIONS['user'] || [],
          profile: null
        };
        
        setUserContext(fallbackContext);
        return;
      }
      
      // Fetch user roles with error resilience
      const { data: rolesData, error: rolesError } = await supabase
        .from('user_roles')
        .select('role, role_type')
        .eq('user_id', userId);
        
      if (rolesError) {
        console.warn('⚠️ Error fetching user roles, using default:', rolesError);
      }
      
      // Safely compute roles array with fallbacks
      const primaryRole = profileData?.role || 'user';
      const additionalRoles = rolesData?.map(r => r.role || r.role_type).filter(Boolean) || [];
      const allRoles = Array.from(new Set([primaryRole, ...additionalRoles]));
      
      // Ensure at least 'user' role is present
      if (allRoles.length === 0) {
        allRoles.push('user');
      }
      
      // Compute permissions based on roles with safety check
      const permissions = computePermissions(allRoles);
      
      // Create enhanced profile with safety checks
      const enhancedProfile: EnhancedProfile = {
        id: profileData?.id || userId,
        full_name: profileData?.full_name || null,
        avatar_url: profileData?.avatar_url || null,
        organization_id: profileData?.organization_id || null,
        role: primaryRole,
        roles: allRoles,
        permissions,
        onboarding_status: profileData?.onboarding_status,
        created_at: profileData?.created_at,
        updated_at: profileData?.updated_at
      };
      
      // Create unified user context
      const unifiedContext: UnifiedUserContext = {
        userId,
        email: user?.email || null,
        organizationId: profileData?.organization_id || null,
        roles: allRoles,
        permissions,
        profile: enhancedProfile
      };
      
      console.log('✅ Enhanced user data fetched successfully:', {
        profile: enhancedProfile.full_name || 'Anonymous',
        roles: allRoles,
        permissions: permissions.length,
        organizationId: profileData?.organization_id || 'None'
      });
      
      setProfile(enhancedProfile);
      setUserContext(unifiedContext);
      
      // Check organization access after setting profile
      checkOrganizationAccess(enhancedProfile);
    } catch (error) {
      console.error('💥 Failed to fetch enhanced user data:', error);
      
      // Retry mechanism with exponential backoff
      if (retryCount < maxRetries) {
        console.log(`🔄 Retrying fetchEnhancedUserData in ${retryDelay}ms (attempt ${retryCount + 1}/${maxRetries})`);
        setTimeout(() => {
          fetchEnhancedUserData(userId, retryCount + 1);
        }, retryDelay);
        return;
      }
      
      // Create emergency fallback context to prevent total application failure
      const emergencyContext: UnifiedUserContext = {
        userId,
        email: user?.email || null,
        organizationId: null,
        roles: ['user'],
        permissions: ROLE_PERMISSIONS['user'] || [],
        profile: null
      };
      
      setUserContext(emergencyContext);
      console.warn('🆘 Created emergency user context after max retries');
    }
  };

  const computePermissions = (roles: string[]): string[] => {
    const permissions = new Set<string>();
    
    roles.forEach(role => {
      const rolePermissions = ROLE_PERMISSIONS[role] || [];
      rolePermissions.forEach(permission => {
        if (permission === '*') {
          // Super admin gets all permissions
          Object.values(ROLE_PERMISSIONS).flat().forEach(p => {
            if (p !== '*') permissions.add(p);
          });
        } else {
          permissions.add(permission);
        }
      });
    });
    
    return Array.from(permissions);
  };

  const checkOrganizationAccess = (profile: EnhancedProfile) => {
    // Skip check if already on setup page or public routes
    if (location.pathname === '/setup/enhanced' || !location.pathname.startsWith('/app/')) {
      return;
    }

    // Check if user has valid organization_id
    if (!profile.organization_id) {
      console.log('🏢 No organization_id found, redirecting to setup');
      navigate('/setup/enhanced');
      return;
    }

    console.log('✅ Valid organization access confirmed:', profile.organization_id);
  };

  const hasRole = (role: string): boolean => {
    try {
      return userContext?.roles?.includes(role) || false;
    } catch (error) {
      console.warn('⚠️ Error checking role:', error);
      return false;
    }
  };

  const hasPermission = (permission: string): boolean => {
    try {
      return userContext?.permissions?.includes(permission) || false;
    } catch (error) {
      console.warn('⚠️ Error checking permission:', error);
      return false;
    }
  };

  const hasAnyRole = (roles: string[]): boolean => {
    try {
      return Array.isArray(roles) && roles.some(role => hasRole(role));
    } catch (error) {
      console.warn('⚠️ Error checking multiple roles:', error);
      return false;
    }
  };

  const isOrgAdmin = (): boolean => {
    try {
      return hasAnyRole(['admin', 'super_admin']);
    } catch (error) {
      console.warn('⚠️ Error checking admin status:', error);
      return false;
    }
  };

  const refreshUserContext = async () => {
    if (user?.id) {
      await fetchEnhancedUserData(user.id);
    }
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      console.log('🔐 Attempting login for:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({ 
        email, 
        password 
      });
      
      if (error) {
        console.error('❌ Login error details:', {
          message: error.message,
          code: error.status,
          details: error
        });
        
        // Provide more specific error messages
        let userMessage = error.message;
        if (error.message === 'Invalid login credentials') {
          userMessage = 'Invalid email or password. Please check your credentials and try again.';
        } else if (error.message.includes('Email not confirmed')) {
          userMessage = 'Please check your email and click the confirmation link before logging in.';
        } else if (error.message.includes('Too many requests')) {
          userMessage = 'Too many login attempts. Please wait a few minutes before trying again.';
        }
        
        toast.error(userMessage);
        throw error;
      }

      if (data.user) {
        console.log('✅ Login successful for user:', data.user.email);
        
        // Redirect to app dashboard or the page they were trying to access
        const origin = location.state?.from?.pathname || "/app/dashboard";
        navigate(origin);
      } else {
        console.warn('⚠️ Login returned no user data');
        throw new Error('Login failed - no user data received');
      }
    } catch (error) {
      console.error("💥 Login failed:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string, fullName: string) => {
    setIsLoading(true);
    try {
      console.log('📝 Attempting registration for:', email);
      
      const { data, error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          data: {
            full_name: fullName
          },
          emailRedirectTo: `${window.location.origin}/auth/login`
        } 
      });
      
      if (error) {
        console.error('❌ Registration error:', error);
        
        let userMessage = error.message;
        if (error.message.includes('User already registered')) {
          userMessage = 'An account with this email already exists. Please try logging in instead.';
        } else if (error.message.includes('Password should be at least')) {
          userMessage = 'Password must be at least 6 characters long.';
        }
        
        toast.error(userMessage);
        throw error;
      }
      
      if (data.user) {
        console.log('✅ Registration successful for user:', data.user.email);
        toast.success('Registration successful! Please check your email for verification.');
        navigate("/auth/verify");
      }
    } catch (error) {
      console.error("💥 Registration failed:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        toast.error(error.message);
        throw error;
      }
      navigate("/");
    } catch (error) {
      console.error("Logout failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/update-password`,
      });
      
      if (error) {
        toast.error(error.message);
        throw error;
      }
      
      toast.success("Password reset email sent!");
    } catch (error) {
      console.error("Password reset failed:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updatePassword = async (password: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      
      if (error) {
        toast.error(error.message);
        throw error;
      }
      
      toast.success("Password updated successfully!");
      navigate("/app/dashboard");
    } catch (error) {
      console.error("Password update failed:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (profileData: Partial<EnhancedProfile>) => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update(profileData)
        .eq('id', user.id);
      
      if (error) {
        toast.error(error.message);
        throw error;
      }
      
      // Refresh user context after profile update
      await refreshUserContext();
      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error("Profile update failed:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <EnhancedAuthContext.Provider value={{ 
      user, 
      session,
      profile,
      userContext,
      isAuthenticated: !!user, 
      isLoading,
      hasRole,
      hasPermission,
      hasAnyRole,
      isOrgAdmin,
      login, 
      register, 
      logout,
      resetPassword,
      updatePassword,
      updateProfile,
      refreshUserContext
    }}>
      {children}
    </EnhancedAuthContext.Provider>
  );
};

export const useEnhancedAuth = () => {
  const context = useContext(EnhancedAuthContext);
  if (context === undefined) {
    throw new Error("useEnhancedAuth must be used within an EnhancedAuthProvider");
  }
  return context;
};