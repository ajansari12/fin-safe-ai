// FIXME: Migrated from useEnhancedAuth to useAuth for consistency
import { useAuth } from "@/contexts/EnhancedAuthContext";
import { usePermissions } from "@/contexts/PermissionContext";

/**
 * Hook for role-based access control - Uses secure database functions
 */
export const useRoles = () => {
  const { userContext, hasRole, hasAnyRole } = useAuth(); // FIXME: Updated from useEnhancedAuth
  const permissions = usePermissions();

  return {
    // Current user context
    userRoles: userContext?.roles || [],
    userPermissions: userContext?.permissions || [],
    
    // Role checking functions (now using secure database functions)
    hasRole,
    hasAnyRole,
    
    // Common role checks - enhanced security
    isAdmin: () => hasAnyRole(['admin', 'super_admin']),
    isAnalyst: () => hasRole('analyst'),
    isAuditor: () => hasRole('auditor'),
    isExecutive: () => hasRole('executive'),
    isSuperAdmin: () => hasRole('super_admin'),
    isReviewer: () => hasRole('reviewer'),
    
    // Permission checking from PermissionContext
    ...permissions
  };
};

/**
 * Hook for organization-specific access control
 */
export const useOrgAccess = () => {
  const { userContext } = useAuth(); // FIXME: Updated from useEnhancedAuth
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