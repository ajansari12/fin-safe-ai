import React, { createContext, useState, useContext, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { logger } from "@/lib/logger";

// Enhanced user profile with unified roles and permissions
export interface EnhancedProfile {
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
export interface UnifiedUserContext {
  userId: string | null;
  email: string | null;
  organizationId: string | null;
  roles: string[];
  permissions: string[];
  profile: EnhancedProfile | null;
}

export interface EnhancedAuthContextType {
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

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<EnhancedProfile | null>(null);
  const [userContext, setUserContext] = useState<UnifiedUserContext | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    logger.info('Initializing enhanced auth state', { 
      component: 'EnhancedAuthContext',
      module: 'authentication' 
    });
    
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        logger.debug('Auth state changed', { 
          component: 'EnhancedAuthContext',
          module: 'authentication',
          metadata: { event, userEmail: session?.user?.email || 'no user' }
        });
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (event === 'SIGNED_IN') {
          logger.info('User signed in successfully', { 
            component: 'EnhancedAuthContext',
            module: 'authentication',
            userId: session?.user?.id 
          });
          // Defer the profile fetch to avoid potential deadlocks
          setTimeout(() => {
            fetchEnhancedUserData(session?.user?.id);
          }, 0);
        } else if (event === 'TOKEN_REFRESHED') {
          logger.debug('Token refreshed', { 
            component: 'EnhancedAuthContext',
            module: 'authentication',
            userId: session?.user?.id 
          });
          // Optionally refresh profile data
          setTimeout(() => {
            fetchEnhancedUserData(session?.user?.id);
          }, 0);
        } else if (event === 'SIGNED_OUT') {
          logger.info('User signed out', { 
            component: 'EnhancedAuthContext',
            module: 'authentication' 
          });
          setProfile(null);
          setUserContext(null);
        } else if (event === 'USER_UPDATED') {
          logger.debug('User updated', { 
            component: 'EnhancedAuthContext',
            module: 'authentication',
            userId: session?.user?.id 
          });
          setTimeout(() => {
            fetchEnhancedUserData(session?.user?.id);
          }, 0);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        logger.error('Error getting session', { 
          component: 'EnhancedAuthContext',
          module: 'authentication' 
        }, error);
      } else if (session) {
        logger.info('Existing session found', { 
          component: 'EnhancedAuthContext',
          module: 'authentication',
          metadata: { userEmail: session.user.email }
        });
        setSession(session);
        setUser(session.user);
        fetchEnhancedUserData(session.user.id);
      } else {
        logger.debug('No existing session found', { 
          component: 'EnhancedAuthContext',
          module: 'authentication' 
        });
      }
    }).finally(() => {
      logger.info('Enhanced auth initialization complete', { 
        component: 'EnhancedAuthContext',
        module: 'authentication' 
      });
      setIsLoading(false);
    });

    return () => {
      logger.debug('Cleaning up enhanced auth subscription', { 
        component: 'EnhancedAuthContext',
        module: 'authentication' 
      });
      subscription.unsubscribe();
    };
  }, []);

  const fetchEnhancedUserData = async (userId: string | undefined, retryCount = 0) => {
    if (!userId) {
      logger.warn('No userId provided to fetchEnhancedUserData', { 
        component: 'EnhancedAuthContext',
        module: 'authentication' 
      });
      return;
    }
    
    const maxRetries = 3;
    const retryDelay = Math.pow(2, retryCount) * 1000; // Exponential backoff
    
    try {
      logger.debug('Fetching enhanced user data', { 
        component: 'EnhancedAuthContext',
        module: 'authentication',
        userId,
        metadata: { retryCount }
      });
      
      // Fetch profile data with error resilience
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
        
      if (profileError) {
        logger.error('Error fetching profile', { 
          component: 'EnhancedAuthContext',
          module: 'authentication',
          userId,
          metadata: { errorCode: profileError.code }
        }, profileError);
        
        // Handle missing profile gracefully
        if (profileError.code === 'PGRST116') {
          logger.warn('No profile found for user, creating minimal context', { 
            component: 'EnhancedAuthContext',
            module: 'authentication',
            userId 
          });
          
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
            logger.info('Redirecting to organization setup', { 
              component: 'EnhancedAuthContext',
              module: 'authentication',
              userId 
            });
            navigate('/setup/enhanced');
          }
          return;
        }
        
        // For other errors, create fallback context instead of throwing
        logger.warn('Profile fetch failed, creating fallback context', { 
          component: 'EnhancedAuthContext',
          module: 'authentication',
          userId,
          metadata: { error: profileError.message }
        });
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
        logger.warn('Error fetching user roles, using default', { 
          component: 'EnhancedAuthContext',
          module: 'authentication',
          userId,
          metadata: { error: rolesError.message }
        });
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
      
      logger.info('Enhanced user data fetched successfully', { 
        component: 'EnhancedAuthContext',
        module: 'authentication',
        userId,
        metadata: {
          profileName: enhancedProfile.full_name || 'Anonymous',
          rolesCount: allRoles.length,
          permissionsCount: permissions.length,
          organizationId: profileData?.organization_id || 'None'
        }
      });
      
      setProfile(enhancedProfile);
      setUserContext(unifiedContext);
      
      // Check organization access after setting profile
      checkOrganizationAccess(enhancedProfile);
    } catch (error) {
      logger.error('Failed to fetch enhanced user data', { 
        component: 'EnhancedAuthContext',
        module: 'authentication',
        userId,
        metadata: { retryCount, maxRetries }
      }, error);
      
      // Retry mechanism with exponential backoff
      if (retryCount < maxRetries) {
        logger.info('Retrying fetchEnhancedUserData', { 
          component: 'EnhancedAuthContext',
          module: 'authentication',
          userId,
          metadata: { retryDelay, attempt: retryCount + 1, maxRetries }
        });
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
      logger.warn('Created emergency user context after max retries', { 
        component: 'EnhancedAuthContext',
        module: 'authentication',
        userId 
      });
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
      logger.info('No organization_id found, redirecting to setup', { 
        component: 'EnhancedAuthContext',
        module: 'authentication',
        userId: profile.id 
      });
      navigate('/setup/enhanced');
      return;
    }

    logger.debug('Valid organization access confirmed', { 
      component: 'EnhancedAuthContext',
      module: 'authentication',
      userId: profile.id,
      organizationId: profile.organization_id 
    });
  };

  const hasRole = (role: string): boolean => {
    try {
      return userContext?.roles?.includes(role) || false;
    } catch (error) {
      logger.warn('Error checking role', { 
        component: 'EnhancedAuthContext',
        module: 'authentication',
        metadata: { role, error: error.message }
      });
      return false;
    }
  };

  const hasPermission = (permission: string): boolean => {
    try {
      return userContext?.permissions?.includes(permission) || false;
    } catch (error) {
      logger.warn('Error checking permission', { 
        component: 'EnhancedAuthContext',
        module: 'authentication',
        metadata: { permission, error: error.message }
      });
      return false;
    }
  };

  const hasAnyRole = (roles: string[]): boolean => {
    try {
      return Array.isArray(roles) && roles.some(role => hasRole(role));
    } catch (error) {
      logger.warn('Error checking multiple roles', { 
        component: 'EnhancedAuthContext',
        module: 'authentication',
        metadata: { roles, error: error.message }
      });
      return false;
    }
  };

  const isOrgAdmin = (): boolean => {
    try {
      return hasAnyRole(['admin', 'super_admin']);
    } catch (error) {
      logger.warn('Error checking admin status', { 
        component: 'EnhancedAuthContext',
        module: 'authentication',
        metadata: { error: error.message }
      });
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
      logger.info('Attempting login', { 
        component: 'EnhancedAuthContext',
        module: 'authentication',
        metadata: { email }
      });
      
      const { data, error } = await supabase.auth.signInWithPassword({ 
        email, 
        password 
      });
      
      if (error) {
        logger.error('Login error', { 
          component: 'EnhancedAuthContext',
          module: 'authentication',
          metadata: { email, errorCode: error.status }
        }, error);
        
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
        logger.info('Login successful', { 
          component: 'EnhancedAuthContext',
          module: 'authentication',
          userId: data.user.id,
          metadata: { email: data.user.email }
        });
        
        // Redirect to app dashboard or the page they were trying to access
        const origin = location.state?.from?.pathname || "/app/dashboard";
        navigate(origin);
      } else {
        logger.warn('Login returned no user data', { 
          component: 'EnhancedAuthContext',
          module: 'authentication',
          metadata: { email }
        });
        throw new Error('Login failed - no user data received');
      }
    } catch (error) {
      logger.error('Login failed', { 
        component: 'EnhancedAuthContext',
        module: 'authentication',
        metadata: { email }
      }, error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string, fullName: string) => {
    setIsLoading(true);
    try {
      logger.info('Attempting registration', { 
        component: 'EnhancedAuthContext',
        module: 'authentication',
        metadata: { email, fullName }
      });
      
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
        logger.error('Registration error', { 
          component: 'EnhancedAuthContext',
          module: 'authentication',
          metadata: { email }
        }, error);
        
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
        logger.info('Registration successful', { 
          component: 'EnhancedAuthContext',
          module: 'authentication',
          userId: data.user.id,
          metadata: { email: data.user.email }
        });
        toast.success('Registration successful! Please check your email for verification.');
        navigate("/auth/verify");
      }
    } catch (error) {
      logger.error('Registration failed', { 
        component: 'EnhancedAuthContext',
        module: 'authentication',
        metadata: { email }
      }, error);
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
      logger.error('Logout failed', { 
        component: 'EnhancedAuthContext',
        module: 'authentication' 
      }, error);
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
      logger.error('Password reset failed', { 
        component: 'EnhancedAuthContext',
        module: 'authentication',
        metadata: { email }
      }, error);
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
      logger.error('Password update failed', { 
        component: 'EnhancedAuthContext',
        module: 'authentication' 
      }, error);
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
      logger.error('Profile update failed', { 
        component: 'EnhancedAuthContext',
        module: 'authentication',
        userId: user.id 
      }, error);
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

export const EnhancedAuthProvider = AuthProvider; // Legacy alias

export const useAuth = () => {
  const context = useContext(EnhancedAuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// CLEANUP: useEnhancedAuth alias removed after migration completed