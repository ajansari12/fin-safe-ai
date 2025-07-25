
import React from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Profile {
  id: string;
  full_name?: string;
  role?: string;
  organization_id?: string;
  onboarding_status?: string;
}

interface UserContext {
  userId?: string;
  roles?: string[];
  permissions?: string[];
  organizationId?: string;
  profile?: Profile;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  userContext: UserContext | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isLoggingOut: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName?: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
  refreshUserContext: () => Promise<void>;
  hasRole: (role: string) => boolean;
  hasPermission: (permission: string) => boolean;
  hasAnyRole: (roles: string[]) => boolean;
}

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Error boundary for auth context
class AuthErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Auth Context Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center min-h-screen p-4">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">Authentication Error</h2>
            <p className="text-muted-foreground mb-4">
              There was an error initializing the authentication system.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export const EnhancedAuthProvider = ({ children }: { children: React.ReactNode }) => {
  console.log('EnhancedAuthProvider rendering...', { useState: typeof React.useState });
  
  // Wrap all useState calls in error handling using React.useState directly
  const [user, setUser] = React.useState<User | null>(null);
  const [profile, setProfile] = React.useState<Profile | null>(null);
  const [userContext, setUserContext] = React.useState<UserContext | null>(null);
  const [session, setSession] = React.useState<Session | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isLoggingOut, setIsLoggingOut] = React.useState(false);
  const [initError, setInitError] = React.useState<string | null>(null);

  React.useEffect(() => {
    let isMounted = true;

    const initializeAuth = async () => {
      try {
        console.log('Initializing auth context...');
        
        // Set up auth state listener
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            if (!isMounted) return;
            
            console.log('Auth state change:', event, session?.user?.id);
            setSession(session);
            setUser(session?.user ?? null);
            
            if (session?.user) {
              // Defer profile fetching to avoid blocking auth state updates
              setTimeout(() => {
                if (isMounted) {
                  fetchUserProfile(session.user.id);
                }
              }, 0);
            } else {
              setProfile(null);
              setUserContext(null);
            }
            
            setIsLoading(false);
          }
        );

        // Check for existing session
        const { data: { session: existingSession } } = await supabase.auth.getSession();
        if (!isMounted) return;
        
        console.log('Initial session:', existingSession?.user?.id);
        setSession(existingSession);
        setUser(existingSession?.user ?? null);
        
        if (existingSession?.user) {
          await fetchUserProfile(existingSession.user.id);
        }
        
        setIsLoading(false);
        
        return () => {
          subscription.unsubscribe();
        };
      } catch (error) {
        console.error('Auth initialization error:', error);
        setInitError(error instanceof Error ? error.message : 'Unknown auth error');
        setIsLoading(false);
      }
    };

    initializeAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  const fetchUserProfile = async (userId: string) => {
    try {
      console.log('Fetching profile for user:', userId);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error);
        return;
      }
      
      if (data) {
        console.log('Profile fetched:', data);
        setProfile(data);
        setUserContext({
          userId: userId,
          roles: ['user'], // Default role, can be expanded
          permissions: ['dashboard:view', 'risks:read', 'controls:read'],
          organizationId: data.organization_id,
          profile: data
        });
      } else {
        // If no profile exists, create a basic user context
        console.log('No profile found, creating basic context');
        setUserContext({
          userId: userId,
          roles: ['user'],
          permissions: ['dashboard:view', 'risks:read', 'controls:read'],
          organizationId: undefined,
          profile: undefined
        });
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  };

  const refreshUserContext = async () => {
    if (user?.id) {
      await fetchUserProfile(user.id);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        toast.error(error.message);
        throw error;
      }
      
      toast.success('Successfully logged in!');
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string, fullName?: string) => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
          emailRedirectTo: `${window.location.origin}/`,
        },
      });
      
      if (error) {
        toast.error(error.message);
        throw error;
      }
      
      toast.success('Registration successful! Please check your email to verify your account.');
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const clearAllStorageData = () => {
    try {
      // Clear localStorage
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (
          key.startsWith('sb-') || 
          key.includes('supabase') || 
          key.includes('auth') ||
          key.includes('user') ||
          key.includes('session')
        )) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));

      // Clear sessionStorage
      const sessionKeysToRemove = [];
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key && (
          key.startsWith('sb-') || 
          key.includes('supabase') || 
          key.includes('auth') ||
          key.includes('user') ||
          key.includes('session')
        )) {
          sessionKeysToRemove.push(key);
        }
      }
      sessionKeysToRemove.forEach(key => sessionStorage.removeItem(key));

      console.log('Cleared storage data:', { localStorage: keysToRemove, sessionStorage: sessionKeysToRemove });
    } catch (error) {
      console.error('Error clearing storage:', error);
    }
  };

  const logout = async () => {
    if (isLoggingOut) {
      console.log('Logout already in progress, skipping...');
      return;
    }

    try {
      setIsLoggingOut(true);
      console.log('Starting comprehensive logout process...');
      
      // Step 1: Call Supabase logout
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Supabase logout error:', error);
        toast.error(`Logout error: ${error.message}`);
        throw error;
      }
      
      // Step 2: Clear all local state immediately
      setUser(null);
      setProfile(null);
      setUserContext(null);
      setSession(null);
      
      // Step 3: Clear all storage data
      clearAllStorageData();
      
      // Step 4: Force a brief delay to ensure cleanup completes
      await new Promise(resolve => setTimeout(resolve, 100));
      
      console.log('Logout completed successfully');
      
    } catch (error) {
      console.error('Logout error:', error);
      
      // Force logout even if there's an error
      setUser(null);
      setProfile(null);
      setUserContext(null);
      setSession(null);
      clearAllStorageData();
      
      // Show error but don't prevent logout
      toast.error('Logout completed with errors. You have been signed out for security.');
      throw error;
    } finally {
      setIsLoggingOut(false);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/update-password`,
      });
      
      if (error) {
        toast.error(error.message);
        throw error;
      }
      
      toast.success('Password reset email sent!');
    } catch (error) {
      console.error('Reset password error:', error);
      throw error;
    }
  };

  const updatePassword = async (password: string) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: password,
      });
      
      if (error) {
        toast.error(error.message);
        throw error;
      }
      
      toast.success('Password updated successfully!');
    } catch (error) {
      console.error('Update password error:', error);
      throw error;
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    try {
      if (!user?.id) {
        throw new Error('No user logged in');
      }

      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          ...updates,
          updated_at: new Date().toISOString(),
        });
      
      if (error) {
        toast.error(error.message);
        throw error;
      }
      
      // Refresh the profile data
      await fetchUserProfile(user.id);
      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  };

  const hasRole = (role: string): boolean => {
    return userContext?.roles?.includes(role) ?? false;
  };

  const hasPermission = (permission: string): boolean => {
    return userContext?.permissions?.includes(permission) ?? false;
  };

  const hasAnyRole = (roles: string[]): boolean => {
    return roles.some(role => hasRole(role));
  };

  // Show error state if initialization failed
  if (initError) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Authentication Error</h2>
          <p className="text-muted-foreground mb-4">{initError}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  const value: AuthContextType = {
    user,
    profile,
    userContext,
    session,
    isAuthenticated: !!user,
    isLoading,
    isLoggingOut,
    login,
    register,
    logout,
    resetPassword,
    updatePassword,
    updateProfile,
    refreshUserContext,
    hasRole,
    hasPermission,
    hasAnyRole,
  };

  return (
    <AuthErrorBoundary>
      <AuthContext.Provider value={value}>
        {children}
      </AuthContext.Provider>
    </AuthErrorBoundary>
  );
};
