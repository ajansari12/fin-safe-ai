
import React from "react";
import { Navigate, useLocation } from "react-router-dom";
// FIXME: Already using EnhancedAuthContext - this is correct
import { useAuth } from "@/contexts/EnhancedAuthContext";
import { OnboardingGuard } from "@/components/onboarding/OnboardingGuard";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children,
  requiredRole 
}) => {
  const { isAuthenticated, isLoading, profile } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Redirect to login if not authenticated
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  // Check role requirement if specified
  if (requiredRole && profile?.role !== requiredRole) {
    return <Navigate to="/app/dashboard" replace />;
  }

  // Wrap children with OnboardingGuard to check onboarding status
  return (
    <OnboardingGuard>
      {children}
    </OnboardingGuard>
  );
};

export default ProtectedRoute;
