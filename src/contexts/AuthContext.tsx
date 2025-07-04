import React, { createContext, useState, useContext, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  role: string;
  organization_id: string | null;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
  updateProfile: (profile: Partial<Profile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    console.log('🚀 Initializing auth state...');
    
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
            fetchProfile(session?.user?.id);
          }, 0);
        } else if (event === 'TOKEN_REFRESHED') {
          console.log('🔄 Token refreshed');
          // Optionally refresh profile data
          setTimeout(() => {
            fetchProfile(session?.user?.id);
          }, 0);
        } else if (event === 'SIGNED_OUT') {
          console.log('👋 User signed out');
          setProfile(null);
        } else if (event === 'USER_UPDATED') {
          console.log('👤 User updated');
          setTimeout(() => {
            fetchProfile(session?.user?.id);
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
        fetchProfile(session.user.id);
      } else {
        console.log('ℹ️ No existing session found');
      }
    }).finally(() => {
      console.log('🏁 Auth initialization complete');
      setIsLoading(false);
    });

    return () => {
      console.log('🧹 Cleaning up auth subscription');
      subscription.unsubscribe();
    };
  }, []);

  const fetchProfile = async (userId: string | undefined) => {
    if (!userId) return;
    
    try {
      console.log('👤 Fetching profile for user:', userId);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle(); // Use maybeSingle instead of single to avoid errors when no profile exists
        
      if (error) {
        console.error('❌ Error fetching profile:', error);
        
        // Check if it's a missing profile (not an error, profile might not be created yet)
        if (error.code === 'PGRST116') {
          console.warn('⚠️ No profile found for user, may need to be created');
          return;
        }
        
        throw error;
      } 
      
      if (data) {
        console.log('✅ Profile fetched successfully:', data.full_name);
        setProfile(data as Profile);
      } else {
        console.warn('⚠️ No profile data found for user');
      }
    } catch (error) {
      console.error('💥 Failed to fetch profile:', error);
      // Don't throw here - missing profile shouldn't break auth
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

  const updateProfile = async (profileData: Partial<Profile>) => {
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
      
      // Update profile state
      setProfile(prev => prev ? { ...prev, ...profileData } : null);
      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error("Profile update failed:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      profile,
      session,
      isAuthenticated: !!user, 
      isLoading, 
      login, 
      register, 
      logout,
      resetPassword,
      updatePassword,
      updateProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
