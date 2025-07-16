import React, { useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
// FIXME: Migrated from useEnhancedAuth to useAuth for consistency
import { useAuth } from "@/contexts/EnhancedAuthContext";
import { OnboardingGuard } from "@/components/onboarding/OnboardingGuard";
import { initializeIntegrationService } from "@/services/integration-service";

interface EnhancedProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
  requiredPermission?: string;
  requiredAnyRole?: string[];
  requiredAnyPermission?: string[];
  fallbackRoute?: string;
}

const EnhancedProtectedRoute: React.FC<EnhancedProtectedRouteProps> = ({ 
  children,
  requiredRole,
  requiredPermission,
  requiredAnyRole,
  requiredAnyPermission,
  fallbackRoute = "/app/dashboard"
}) => {
  const { 
    isAuthenticated, 
    isLoading, 
    userContext, 
    hasRole, 
    hasPermission, 
    hasAnyRole 
  } = useAuth(); // FIXME: Updated from useEnhancedAuth
  const location = useLocation();

  // Initialize integration service for authenticated users
  useEffect(() => {
    if (isAuthenticated && userContext?.organizationId) {
      initializeIntegrationService();
    }
  }, [isAuthenticated, userContext?.organizationId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Not authenticated - redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  // User is authenticated but has no organization - redirect to setup
  // This avoids sending users to login unnecessarily
  if (isAuthenticated && userContext && !userContext.organizationId) {
    console.log('🏢 User authenticated but no organization - redirecting to setup');
    return <Navigate to="/setup/enhanced" replace />;
  }

  // Check role requirements
  if (requiredRole && !hasRole(requiredRole)) {
    console.log('❌ Role check failed:', { required: requiredRole, userRoles: userContext?.roles });
    return <Navigate to={fallbackRoute} replace />;
  }

  if (requiredAnyRole && !hasAnyRole(requiredAnyRole)) {
    console.log('❌ Any role check failed:', { required: requiredAnyRole, userRoles: userContext?.roles });
    return <Navigate to={fallbackRoute} replace />;
  }

  // Check permission requirements
  if (requiredPermission && !hasPermission(requiredPermission)) {
    console.log('❌ Permission check failed:', { required: requiredPermission, userPermissions: userContext?.permissions });
    return <Navigate to={fallbackRoute} replace />;
  }

  if (requiredAnyPermission && !requiredAnyPermission.some(permission => hasPermission(permission))) {
    console.log('❌ Any permission check failed:', { required: requiredAnyPermission, userPermissions: userContext?.permissions });
    return <Navigate to={fallbackRoute} replace />;
  }

  // All checks passed - wrap children with OnboardingGuard to check onboarding status
  return (
    <OnboardingGuard>
      {children}
    </OnboardingGuard>
  );
};

export default EnhancedProtectedRoute;