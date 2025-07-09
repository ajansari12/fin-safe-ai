import React, { createContext, useContext } from "react";
import { Session, User } from "@supabase/supabase-js";
import { useEnhancedAuth } from "./EnhancedAuthContext";
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
  // Use the enhanced auth context as the data source
  const {
    user: enhancedUser,
    session: enhancedSession,
    userContext,
    isLoading: enhancedIsLoading,
    login: enhancedLogin,
    register: enhancedRegister,
    logout: enhancedLogout,
    resetPassword: enhancedResetPassword,
    updatePassword: enhancedUpdatePassword,
    updateProfile: enhancedUpdateProfile
  } = useEnhancedAuth();

  // Transform enhanced auth data to legacy format
  const user = enhancedUser;
  const session = enhancedSession;
  const isLoading = enhancedIsLoading;
  
  // Transform userContext.profile to legacy Profile format
  const profile: Profile | null = userContext?.profile ? {
    id: userContext.profile.id,
    full_name: userContext.profile.full_name,
    avatar_url: userContext.profile.avatar_url,
    role: userContext.profile.role || 'user',
    organization_id: userContext.profile.organization_id
  } : null;

  // Wrapper functions that delegate to enhanced auth
  const login = async (email: string, password: string) => {
    return enhancedLogin(email, password);
  };

  const register = async (email: string, password: string, fullName: string) => {
    return enhancedRegister(email, password, fullName);
  };

  const logout = async () => {
    return enhancedLogout();
  };

  const resetPassword = async (email: string) => {
    return enhancedResetPassword(email);
  };

  const updatePassword = async (password: string) => {
    return enhancedUpdatePassword(password);
  };

  const updateProfile = async (profileData: Partial<Profile>) => {
    // Transform legacy profile format to enhanced format
    const enhancedProfileData = {
      full_name: profileData.full_name,
      avatar_url: profileData.avatar_url,
      role: profileData.role,
      organization_id: profileData.organization_id
    };
    return enhancedUpdateProfile(enhancedProfileData);
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
