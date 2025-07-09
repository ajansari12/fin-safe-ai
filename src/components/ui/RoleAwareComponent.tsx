import React, { ReactNode } from "react";
import { usePermissions } from "@/contexts/PermissionContext";

interface RoleAwareComponentProps {
  children: ReactNode;
  
  // Role-based rendering
  requiredRole?: string;
  requiredAnyRole?: string[];
  hideForRole?: string;
  hideForAnyRole?: string[];
  
  // Permission-based rendering
  requiredPermission?: string;
  requiredAnyPermission?: string[];
  hideForPermission?: string;
  hideForAnyPermission?: string[];
  
  // Admin-only content
  adminOnly?: boolean;
  superAdminOnly?: boolean;
  
  // Fallback content
  fallback?: ReactNode;
  
  // Debug mode
  debug?: boolean;
}

/**
 * Component that conditionally renders children based on user roles and permissions
 */
export const RoleAwareComponent: React.FC<RoleAwareComponentProps> = ({
  children,
  requiredRole,
  requiredAnyRole,
  hideForRole,
  hideForAnyRole,
  requiredPermission,
  requiredAnyPermission,
  hideForPermission,
  hideForAnyPermission,
  adminOnly = false,
  superAdminOnly = false,
  fallback = null,
  debug = false
}) => {
  const {
    hasRole,
    hasAnyRole,
    hasPermission,
    hasAnyPermission,
    isOrgAdmin,
    isSystemAdmin
  } = usePermissions();

  // Check if component should be hidden
  const shouldHide = (): boolean => {
    // Hide for specific role
    if (hideForRole && hasRole(hideForRole)) {
      if (debug) console.log('RoleAwareComponent: Hidden due to hideForRole:', hideForRole);
      return true;
    }
    
    // Hide for any of the specified roles
    if (hideForAnyRole && hasAnyRole(hideForAnyRole)) {
      if (debug) console.log('RoleAwareComponent: Hidden due to hideForAnyRole:', hideForAnyRole);
      return true;
    }
    
    // Hide for specific permission
    if (hideForPermission && hasPermission(hideForPermission)) {
      if (debug) console.log('RoleAwareComponent: Hidden due to hideForPermission:', hideForPermission);
      return true;
    }
    
    // Hide for any of the specified permissions
    if (hideForAnyPermission && hasAnyPermission(hideForAnyPermission)) {
      if (debug) console.log('RoleAwareComponent: Hidden due to hideForAnyPermission:', hideForAnyPermission);
      return true;
    }
    
    return false;
  };

  // Check if component should be shown
  const shouldShow = (): boolean => {
    // If any hide condition is met, don't show
    if (shouldHide()) return false;
    
    // Super admin only
    if (superAdminOnly) {
      const canShow = isSystemAdmin();
      if (debug) console.log('RoleAwareComponent: Super admin check:', canShow);
      return canShow;
    }
    
    // Admin only (org admin or system admin)
    if (adminOnly) {
      const canShow = isOrgAdmin() || isSystemAdmin();
      if (debug) console.log('RoleAwareComponent: Admin check:', canShow);
      return canShow;
    }
    
    // Required specific role
    if (requiredRole) {
      const canShow = hasRole(requiredRole);
      if (debug) console.log('RoleAwareComponent: Required role check:', requiredRole, canShow);
      return canShow;
    }
    
    // Required any of the specified roles
    if (requiredAnyRole) {
      const canShow = hasAnyRole(requiredAnyRole);
      if (debug) console.log('RoleAwareComponent: Required any role check:', requiredAnyRole, canShow);
      return canShow;
    }
    
    // Required specific permission
    if (requiredPermission) {
      const canShow = hasPermission(requiredPermission);
      if (debug) console.log('RoleAwareComponent: Required permission check:', requiredPermission, canShow);
      return canShow;
    }
    
    // Required any of the specified permissions
    if (requiredAnyPermission) {
      const canShow = hasAnyPermission(requiredAnyPermission);
      if (debug) console.log('RoleAwareComponent: Required any permission check:', requiredAnyPermission, canShow);
      return canShow;
    }
    
    // If no restrictions specified, show by default
    return true;
  };

  if (shouldShow()) {
    return <>{children}</>;
  }

  return <>{fallback}</>;
};

// Convenience components for common patterns
export const AdminOnly: React.FC<{ children: ReactNode; fallback?: ReactNode }> = ({ children, fallback }) => (
  <RoleAwareComponent adminOnly fallback={fallback}>
    {children}
  </RoleAwareComponent>
);

export const SuperAdminOnly: React.FC<{ children: ReactNode; fallback?: ReactNode }> = ({ children, fallback }) => (
  <RoleAwareComponent superAdminOnly fallback={fallback}>
    {children}
  </RoleAwareComponent>
);

export const AnalystOnly: React.FC<{ children: ReactNode; fallback?: ReactNode }> = ({ children, fallback }) => (
  <RoleAwareComponent requiredRole="analyst" fallback={fallback}>
    {children}
  </RoleAwareComponent>
);

export const ManagerOnly: React.FC<{ children: ReactNode; fallback?: ReactNode }> = ({ children, fallback }) => (
  <RoleAwareComponent requiredRole="manager" fallback={fallback}>
    {children}
  </RoleAwareComponent>
);

export const WithPermission: React.FC<{ 
  permission: string; 
  children: ReactNode; 
  fallback?: ReactNode 
}> = ({ permission, children, fallback }) => (
  <RoleAwareComponent requiredPermission={permission} fallback={fallback}>
    {children}
  </RoleAwareComponent>
);