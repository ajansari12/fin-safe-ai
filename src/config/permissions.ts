/**
 * Centralized permission configuration for role-based access control
 */

export interface Permission {
  module: string;
  action: string;
  resource?: string;
}

export interface RoutePermission {
  path: string;
  requiredRole?: string;
  requiredAnyRole?: string[];
  requiredPermission?: string;
  requiredAnyPermission?: string[];
  adminOnly?: boolean;
  description?: string;
}

// Permission definitions
export const PERMISSIONS = {
  // Dashboard permissions
  DASHBOARD: {
    VIEW: 'dashboard:view',
    CUSTOMIZE: 'dashboard:customize',
  },
  
  // Risk management permissions
  RISKS: {
    READ: 'risks:read',
    WRITE: 'risks:write',
    DELETE: 'risks:delete',
    MANAGE: 'risks:manage',
  },
  
  // Controls permissions
  CONTROLS: {
    READ: 'controls:read',
    WRITE: 'controls:write',
    DELETE: 'controls:delete',
    TEST: 'controls:test',
  },
  
  // Incident permissions
  INCIDENTS: {
    READ: 'incidents:read',
    WRITE: 'incidents:write',
    DELETE: 'incidents:delete',
    RESPOND: 'incidents:respond',
  },
  
  // Governance permissions
  GOVERNANCE: {
    READ: 'governance:read',
    WRITE: 'governance:write',
    APPROVE: 'governance:approve',
    MANAGE: 'governance:manage',
  },
  
  // Third party permissions
  THIRD_PARTY: {
    READ: 'third_party:read',
    WRITE: 'third_party:write',
    ASSESS: 'third_party:assess',
  },
  
  // Business continuity permissions
  CONTINUITY: {
    READ: 'continuity:read',
    WRITE: 'continuity:write',
    TEST: 'continuity:test',
  },
  
  // Document permissions
  DOCUMENTS: {
    READ: 'documents:read',
    WRITE: 'documents:write',
    DELETE: 'documents:delete',
    APPROVE: 'documents:approve',
  },
  
  // Analytics permissions
  ANALYTICS: {
    READ: 'analytics:read',
    ADVANCED: 'analytics:advanced',
  },
  
  // Integration permissions
  INTEGRATIONS: {
    READ: 'integrations:read',
    WRITE: 'integrations:write',
    CONFIGURE: 'integrations:configure',
  },
  
  // Audit permissions
  AUDIT: {
    READ: 'audit:read',
    WRITE: 'audit:write',
    REVIEW: 'audit:review',
  },
  
  // Reporting permissions
  REPORTING: {
    READ: 'reporting:read',
    GENERATE: 'reporting:generate',
    EXPORT: 'reporting:export',
  },
  
  // Admin permissions
  ADMIN: {
    USERS: 'admin:users',
    ROLES: 'admin:roles',
    SETTINGS: 'admin:settings',
    SYSTEM: 'admin:system',
    DATA: 'admin:data',
    DEBUG: 'admin:debug',
  },
  
  // Organization permissions
  ORG: {
    READ: 'org:read',
    WRITE: 'org:write',
    DELETE: 'org:delete',
  },
} as const;

// Route permission mappings
export const ROUTE_PERMISSIONS: RoutePermission[] = [
  // Dashboard
  {
    path: '/app/dashboard',
    requiredPermission: PERMISSIONS.DASHBOARD.VIEW,
    description: 'View dashboard',
  },
  
  // Risk Management
  {
    path: '/app/risk-appetite',
    requiredPermission: PERMISSIONS.RISKS.READ,
    description: 'View risk appetite',
  },
  {
    path: '/app/controls-and-kri',
    requiredPermission: PERMISSIONS.CONTROLS.READ,
    description: 'View controls and KRIs',
  },
  {
    path: '/app/impact-tolerances',
    requiredPermission: PERMISSIONS.RISKS.READ,
    description: 'View impact tolerances',
  },
  
  // Governance
  {
    path: '/app/governance',
    requiredPermission: PERMISSIONS.GOVERNANCE.READ,
    description: 'View governance framework',
  },
  {
    path: '/app/business-functions',
    requiredPermission: PERMISSIONS.GOVERNANCE.READ,
    description: 'View business functions',
  },
  {
    path: '/app/dependencies',
    requiredPermission: PERMISSIONS.GOVERNANCE.READ,
    description: 'View dependencies',
  },
  
  // Third Party Risk
  {
    path: '/app/third-party-risk',
    requiredPermission: PERMISSIONS.THIRD_PARTY.READ,
    description: 'View third party risk',
  },
  
  // Incident Management
  {
    path: '/app/incident-log',
    requiredPermission: PERMISSIONS.INCIDENTS.READ,
    description: 'View incident log',
  },
  
  // Business Continuity
  {
    path: '/app/business-continuity',
    requiredPermission: PERMISSIONS.CONTINUITY.READ,
    description: 'View business continuity',
  },
  {
    path: '/app/scenario-testing',
    requiredPermission: PERMISSIONS.CONTINUITY.TEST,
    description: 'Access scenario testing',
  },
  {
    path: '/app/dependency-mapping',
    requiredPermission: PERMISSIONS.CONTINUITY.READ,
    description: 'View dependency mapping',
  },
  
  // Analytics
  {
    path: '/app/analytics',
    requiredPermission: PERMISSIONS.ANALYTICS.READ,
    description: 'View analytics',
  },
  {
    path: '/app/analytics-hub',
    requiredPermission: PERMISSIONS.ANALYTICS.READ,
    description: 'Access analytics hub',
  },
  {
    path: '/app/organizational-intelligence',
    requiredPermission: PERMISSIONS.ANALYTICS.ADVANCED,
    description: 'Access organizational intelligence',
  },
  
  // Enterprise
  {
    path: '/app/integrations',
    requiredPermission: PERMISSIONS.INTEGRATIONS.READ,
    description: 'View integrations',
  },
  {
    path: '/app/document-management',
    requiredPermission: PERMISSIONS.DOCUMENTS.READ,
    description: 'Access document management',
  },
  {
    path: '/app/audit-and-compliance',
    requiredPermission: PERMISSIONS.AUDIT.READ,
    description: 'Access audit and compliance',
  },
  {
    path: '/app/reporting',
    requiredPermission: PERMISSIONS.REPORTING.READ,
    description: 'Access reporting',
  },
  
  // Admin routes
  {
    path: '/app/settings/roles',
    requiredPermission: PERMISSIONS.ADMIN.ROLES,
    adminOnly: true,
    description: 'Manage user roles',
  },
  {
    path: '/app/settings/members',
    requiredPermission: PERMISSIONS.ADMIN.USERS,
    adminOnly: true,
    description: 'Manage organization members',
  },
  {
    path: '/app/debug',
    requiredPermission: PERMISSIONS.ADMIN.DEBUG,
    requiredAnyRole: ['admin', 'super_admin'],
    description: 'System debugging',
  },
  {
    path: '/app/data',
    requiredPermission: PERMISSIONS.ADMIN.DATA,
    requiredAnyRole: ['admin', 'super_admin'],
    description: 'Data management',
  },
  
  // Workflow and other routes
  {
    path: '/app/workflow-center',
    requiredPermission: PERMISSIONS.GOVERNANCE.READ,
    description: 'Access workflow center',
  },
  {
    path: '/app/deployment-center',
    requiredPermission: PERMISSIONS.ADMIN.SYSTEM,
    adminOnly: true,
    description: 'System deployment center',
  },
];

// Role-based permission mappings
export const ROLE_PERMISSIONS = {
  // Basic user permissions - default role for new users
  user: [
    PERMISSIONS.DASHBOARD.VIEW,
    PERMISSIONS.RISKS.READ,
    PERMISSIONS.CONTROLS.READ,
    PERMISSIONS.INCIDENTS.READ,
    PERMISSIONS.GOVERNANCE.READ,
    PERMISSIONS.THIRD_PARTY.READ,
    PERMISSIONS.CONTINUITY.READ,
    PERMISSIONS.DOCUMENTS.READ,
    PERMISSIONS.ANALYTICS.READ,
    PERMISSIONS.REPORTING.READ,
    PERMISSIONS.ORG.READ,
  ],
  analyst: [
    PERMISSIONS.DASHBOARD.VIEW,
    PERMISSIONS.RISKS.READ,
    PERMISSIONS.CONTROLS.READ,
    PERMISSIONS.INCIDENTS.READ,
    PERMISSIONS.GOVERNANCE.READ,
    PERMISSIONS.THIRD_PARTY.READ,
    PERMISSIONS.CONTINUITY.READ,
    PERMISSIONS.DOCUMENTS.READ,
    PERMISSIONS.ANALYTICS.READ,
    PERMISSIONS.REPORTING.READ,
    PERMISSIONS.ORG.READ,
  ],
  manager: [
    PERMISSIONS.DASHBOARD.VIEW,
    PERMISSIONS.DASHBOARD.CUSTOMIZE,
    PERMISSIONS.RISKS.READ,
    PERMISSIONS.RISKS.WRITE,
    PERMISSIONS.CONTROLS.READ,
    PERMISSIONS.CONTROLS.WRITE,
    PERMISSIONS.CONTROLS.TEST,
    PERMISSIONS.INCIDENTS.READ,
    PERMISSIONS.INCIDENTS.WRITE,
    PERMISSIONS.INCIDENTS.RESPOND,
    PERMISSIONS.GOVERNANCE.READ,
    PERMISSIONS.GOVERNANCE.WRITE,
    PERMISSIONS.THIRD_PARTY.READ,
    PERMISSIONS.THIRD_PARTY.WRITE,
    PERMISSIONS.THIRD_PARTY.ASSESS,
    PERMISSIONS.CONTINUITY.READ,
    PERMISSIONS.CONTINUITY.WRITE,
    PERMISSIONS.CONTINUITY.TEST,
    PERMISSIONS.DOCUMENTS.READ,
    PERMISSIONS.DOCUMENTS.WRITE,
    PERMISSIONS.ANALYTICS.READ,
    PERMISSIONS.ANALYTICS.ADVANCED,
    PERMISSIONS.REPORTING.READ,
    PERMISSIONS.REPORTING.GENERATE,
    PERMISSIONS.ORG.READ,
    PERMISSIONS.ORG.WRITE,
  ],
  reviewer: [
    PERMISSIONS.DASHBOARD.VIEW,
    PERMISSIONS.GOVERNANCE.READ,
    PERMISSIONS.GOVERNANCE.APPROVE,
    PERMISSIONS.DOCUMENTS.READ,
    PERMISSIONS.DOCUMENTS.APPROVE,
    PERMISSIONS.AUDIT.READ,
    PERMISSIONS.AUDIT.REVIEW,
    PERMISSIONS.REPORTING.READ,
    PERMISSIONS.ANALYTICS.READ,
    PERMISSIONS.ORG.READ,
  ],
  admin: [
    // Admins have all permissions
    ...Object.values(PERMISSIONS).flatMap(category => 
      typeof category === 'object' ? Object.values(category) : [category]
    ),
  ],
  super_admin: [
    // Super admins have all permissions
    ...Object.values(PERMISSIONS).flatMap(category => 
      typeof category === 'object' ? Object.values(category) : [category]
    ),
  ],
} as const;

// Helper function to get permissions for a role
export const getPermissionsForRole = (role: string): string[] => {
  const permissions = ROLE_PERMISSIONS[role as keyof typeof ROLE_PERMISSIONS];
  return permissions ? [...permissions] : [];
};

// Helper function to check if a route requires admin access
export const isAdminRoute = (path: string): boolean => {
  const routeConfig = ROUTE_PERMISSIONS.find(route => route.path === path);
  return routeConfig?.adminOnly || false;
};

// Helper function to get required permissions for a route
export const getRoutePermissions = (path: string): RoutePermission | undefined => {
  return ROUTE_PERMISSIONS.find(route => route.path === path);
};