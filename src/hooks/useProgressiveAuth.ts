import { useState, useCallback } from 'react';
import { useEnhancedAuth } from '@/contexts/EnhancedAuthContext';

interface ProgressiveAuthState {
  hasProfile: boolean;
  hasOrganization: boolean;
  hasRoles: boolean;
  isFullyAuthenticated: boolean;
  authLevel: 'none' | 'basic' | 'profile' | 'full';
}

export const useProgressiveAuth = () => {
  const { user, profile, userContext } = useEnhancedAuth();
  
  const [authState, setAuthState] = useState<ProgressiveAuthState>(() => {
    const hasProfile = !!profile;
    const hasOrganization = !!profile?.organization_id;
    const hasRoles = !!userContext?.roles?.length;
    const isFullyAuthenticated = hasProfile && hasOrganization && hasRoles;
    
    let authLevel: ProgressiveAuthState['authLevel'] = 'none';
    if (user) authLevel = 'basic';
    if (hasProfile) authLevel = 'profile';
    if (isFullyAuthenticated) authLevel = 'full';
    
    return {
      hasProfile,
      hasOrganization,
      hasRoles,
      isFullyAuthenticated,
      authLevel
    };
  });

  const checkAuthState = useCallback(() => {
    const hasProfile = !!profile;
    const hasOrganization = !!profile?.organization_id;
    const hasRoles = !!userContext?.roles?.length;
    const isFullyAuthenticated = hasProfile && hasOrganization && hasRoles;
    
    let authLevel: ProgressiveAuthState['authLevel'] = 'none';
    if (user) authLevel = 'basic';
    if (hasProfile) authLevel = 'profile';
    if (isFullyAuthenticated) authLevel = 'full';
    
    setAuthState({
      hasProfile,
      hasOrganization,
      hasRoles,
      isFullyAuthenticated,
      authLevel
    });
    
    return { hasProfile, hasOrganization, hasRoles, isFullyAuthenticated, authLevel };
  }, [user, profile, userContext]);

  const canAccessRoute = useCallback((requiredLevel: ProgressiveAuthState['authLevel'] = 'basic') => {
    const levels = ['none', 'basic', 'profile', 'full'];
    const currentLevelIndex = levels.indexOf(authState.authLevel);
    const requiredLevelIndex = levels.indexOf(requiredLevel);
    
    return currentLevelIndex >= requiredLevelIndex;
  }, [authState.authLevel]);

  const getNextSetupStep = useCallback(() => {
    if (!user) return '/auth/login';
    if (!authState.hasProfile) return '/setup/profile';
    if (!authState.hasOrganization) return '/setup/enhanced';
    if (!authState.hasRoles) return '/setup/roles';
    return null;
  }, [user, authState]);

  return {
    authState,
    checkAuthState,
    canAccessRoute,
    getNextSetupStep
  };
};