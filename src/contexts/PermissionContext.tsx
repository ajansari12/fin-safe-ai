import React, { createContext, useContext, ReactNode } from "react";
import { useEnhancedAuth } from "./EnhancedAuthContext";
import { useOrg } from "./OrgContext";

interface PermissionContextType {
  // Core permission checking
  hasPermission: (permission: string) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
  hasAllPermissions: (permissions: string[]) => boolean;
  
  // Role-based checks
  hasRole: (role: string) => boolean;
  hasAnyRole: (roles: string[]) => boolean;
  hasAllRoles: (roles: string[]) => boolean;
  
  // Organization access
  canReadOrg: () => boolean;
  canWriteOrg: () => boolean;
  canDeleteOrg: () => boolean;
  
  // User management
  canReadUsers: () => boolean;
  canWriteUsers: () => boolean;
  canDeleteUsers: () => boolean;
  
  // Framework management
  canReadFrameworks: () => boolean;
  canWriteFrameworks: () => boolean;
  canDeleteFrameworks: () => boolean;
  
  // Incident management
  canReadIncidents: () => boolean;
  canWriteIncidents: () => boolean;
  canDeleteIncidents: () => boolean;
  
  // Controls management
  canReadControls: () => boolean;
  canWriteControls: () => boolean;
  canDeleteControls: () => boolean;
  
  // Audit capabilities
  canReadAudit: () => boolean;
  canWriteAudit: () => boolean;
  
  // Reporting capabilities
  canReadReporting: () => boolean;
  canWriteReporting: () => boolean;
  
  // Admin capabilities
  isSystemAdmin: () => boolean;
  isOrgAdmin: () => boolean;
  isSuperUser: () => boolean;
  
  // Conditional rendering helpers
  showForPermission: (permission: string) => boolean;
  showForRole: (role: string) => boolean;
  showForAdmins: () => boolean;
  hideForRole: (role: string) => boolean;
}

const PermissionContext = createContext<PermissionContextType | undefined>(undefined);

export const PermissionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { userContext, hasPermission: authHasPermission, hasRole: authHasRole, hasAnyRole: authHasAnyRole } = useEnhancedAuth();
  const { hasOrgAccess, isOrgAdmin } = useOrg();

  // Core permission checking functions
  const hasPermission = (permission: string): boolean => {
    return authHasPermission(permission);
  };

  const hasAnyPermission = (permissions: string[]): boolean => {
    return permissions.some(permission => hasPermission(permission));
  };

  const hasAllPermissions = (permissions: string[]): boolean => {
    return permissions.every(permission => hasPermission(permission));
  };

  const hasRole = (role: string): boolean => {
    return authHasRole(role);
  };

  const hasAnyRole = (roles: string[]): boolean => {
    return authHasAnyRole(roles);
  };

  const hasAllRoles = (roles: string[]): boolean => {
    return roles.every(role => hasRole(role));
  };

  // Organization permissions
  const canReadOrg = (): boolean => hasPermission('org:read');
  const canWriteOrg = (): boolean => hasPermission('org:write');
  const canDeleteOrg = (): boolean => hasPermission('org:delete');

  // User management permissions
  const canReadUsers = (): boolean => hasPermission('users:read');
  const canWriteUsers = (): boolean => hasPermission('users:write');
  const canDeleteUsers = (): boolean => hasPermission('users:delete');

  // Framework permissions
  const canReadFrameworks = (): boolean => hasPermission('frameworks:read');
  const canWriteFrameworks = (): boolean => hasPermission('frameworks:write');
  const canDeleteFrameworks = (): boolean => hasPermission('frameworks:delete');

  // Incident permissions
  const canReadIncidents = (): boolean => hasPermission('incidents:read');
  const canWriteIncidents = (): boolean => hasPermission('incidents:write');
  const canDeleteIncidents = (): boolean => hasPermission('incidents:delete');

  // Controls permissions
  const canReadControls = (): boolean => hasPermission('controls:read');
  const canWriteControls = (): boolean => hasPermission('controls:write');
  const canDeleteControls = (): boolean => hasPermission('controls:delete');

  // Audit permissions
  const canReadAudit = (): boolean => hasPermission('audit:read');
  const canWriteAudit = (): boolean => hasPermission('audit:write');

  // Reporting permissions
  const canReadReporting = (): boolean => hasPermission('reporting:read');
  const canWriteReporting = (): boolean => hasPermission('reporting:write');

  // Admin role checks
  const isSystemAdmin = (): boolean => hasRole('super_admin');
  const isSuperUser = (): boolean => hasAnyRole(['super_admin', 'admin']);
  const isOrgAdminRole = (): boolean => isOrgAdmin();

  // Conditional rendering helpers
  const showForPermission = (permission: string): boolean => hasPermission(permission);
  const showForRole = (role: string): boolean => hasRole(role);
  const showForAdmins = (): boolean => isSuperUser();
  const hideForRole = (role: string): boolean => !hasRole(role);

  const value: PermissionContextType = {
    // Core permission checking
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    
    // Role-based checks
    hasRole,
    hasAnyRole,
    hasAllRoles,
    
    // Organization access
    canReadOrg,
    canWriteOrg,
    canDeleteOrg,
    
    // User management
    canReadUsers,
    canWriteUsers,
    canDeleteUsers,
    
    // Framework management
    canReadFrameworks,
    canWriteFrameworks,
    canDeleteFrameworks,
    
    // Incident management
    canReadIncidents,
    canWriteIncidents,
    canDeleteIncidents,
    
    // Controls management
    canReadControls,
    canWriteControls,
    canDeleteControls,
    
    // Audit capabilities
    canReadAudit,
    canWriteAudit,
    
    // Reporting capabilities
    canReadReporting,
    canWriteReporting,
    
    // Admin capabilities
    isSystemAdmin,
    isOrgAdmin: isOrgAdminRole,
    isSuperUser,
    
    // Conditional rendering helpers
    showForPermission,
    showForRole,
    showForAdmins,
    hideForRole
  };

  return (
    <PermissionContext.Provider value={value}>
      {children}
    </PermissionContext.Provider>
  );
};

export const usePermissions = () => {
  const context = useContext(PermissionContext);
  if (context === undefined) {
    throw new Error("usePermissions must be used within a PermissionProvider");
  }
  return context;
};