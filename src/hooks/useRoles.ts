import { useEnhancedAuth } from "@/contexts/EnhancedAuthContext";
import { usePermissions } from "@/contexts/PermissionContext";

/**
 * Hook for role-based access control
 */
export const useRoles = () => {
  const { userContext, hasRole, hasAnyRole } = useEnhancedAuth();
  const permissions = usePermissions();

  return {
    // Current user context
    userRoles: userContext?.roles || [],
    userPermissions: userContext?.permissions || [],
    
    // Role checking functions
    hasRole,
    hasAnyRole,
    
    // Common role checks
    isAdmin: () => hasAnyRole(['admin', 'super_admin']),
    isManager: () => hasRole('manager'),
    isAnalyst: () => hasRole('analyst'),
    isAuditor: () => hasRole('auditor'),
    isExecutive: () => hasRole('executive'),
    isSuperAdmin: () => hasRole('super_admin'),
    
    // Permission checking from PermissionContext
    ...permissions
  };
};

/**
 * Hook for organization-specific access control
 */
export const useOrgAccess = () => {
  const { userContext } = useEnhancedAuth();
  const { canReadOrg, canWriteOrg, canDeleteOrg } = usePermissions();

  return {
    organizationId: userContext?.organizationId,
    hasOrganization: !!userContext?.organizationId,
    canReadOrg,
    canWriteOrg,
    canDeleteOrg,
    
    // Organization-specific permission checks
    canViewOrgSettings: () => canReadOrg(),
    canEditOrgSettings: () => canWriteOrg(),
    canDeleteOrganization: () => canDeleteOrg(),
  };
};