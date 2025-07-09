import React, { useState, useEffect } from "react";
import AuthenticatedLayout from "@/components/layout/AuthenticatedLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePermissions } from "@/contexts/PermissionContext";
import { useEnhancedAuth } from "@/contexts/EnhancedAuthContext";
import { useRoles } from "@/hooks/useRoles";
import { getRoutePermissions, PERMISSIONS, ROLE_PERMISSIONS } from "@/config/permissions";
import { CheckCircle, XCircle, AlertTriangle, User, Shield, Settings } from "lucide-react";

const RBACTesting = () => {
  const { userContext, hasPermission, hasRole, hasAnyRole } = useEnhancedAuth();
  const permissions = usePermissions();
  const roles = useRoles();
  const [testResults, setTestResults] = useState<any>({});

  // Test routes that should be accessible based on role
  const testRoutes = [
    { path: '/app/dashboard', label: 'Dashboard' },
    { path: '/app/risk-appetite', label: 'Risk Appetite' },
    { path: '/app/controls-and-kri', label: 'Controls & KRI' },
    { path: '/app/incident-log', label: 'Incident Log' },
    { path: '/app/governance', label: 'Governance' },
    { path: '/app/third-party-risk', label: 'Third Party Risk' },
    { path: '/app/business-continuity', label: 'Business Continuity' },
    { path: '/app/scenario-testing', label: 'Scenario Testing' },
    { path: '/app/analytics', label: 'Analytics' },
    { path: '/app/integrations', label: 'Integrations' },
    { path: '/app/document-management', label: 'Document Management' },
    { path: '/app/audit-and-compliance', label: 'Audit & Compliance' },
    { path: '/app/reporting', label: 'Reporting' },
    { path: '/app/settings/roles', label: 'Role Management', adminOnly: true },
    { path: '/app/settings/members', label: 'User Management', adminOnly: true },
    { path: '/app/debug', label: 'Debug Page', adminOnly: true },
    { path: '/app/data', label: 'Data Management', adminOnly: true },
  ];

  // Core permissions to test
  const corePermissions = [
    PERMISSIONS.DASHBOARD.VIEW,
    PERMISSIONS.RISKS.READ,
    PERMISSIONS.CONTROLS.READ,
    PERMISSIONS.INCIDENTS.READ,
    PERMISSIONS.GOVERNANCE.READ,
    PERMISSIONS.ADMIN.USERS,
    PERMISSIONS.ADMIN.ROLES,
    PERMISSIONS.ADMIN.DEBUG,
  ];

  const runPermissionTests = () => {
    const results: any = {
      userInfo: {
        id: userContext?.userId,
        roles: userContext?.roles || [],
        permissions: userContext?.permissions?.length || 0,
        organizationId: userContext?.organizationId,
      },
      permissionTests: {},
      routeTests: {},
      roleTests: {},
      functionalityTests: {}
    };

    // Test individual permissions
    corePermissions.forEach(permission => {
      results.permissionTests[permission] = {
        hasPermission: hasPermission(permission),
        fromContext: permissions.hasPermission(permission),
        expected: userContext?.permissions?.includes(permission) || false
      };
    });

    // Test route access
    testRoutes.forEach(route => {
      const routeConfig = getRoutePermissions(route.path);
      const shouldHaveAccess = routeConfig 
        ? !routeConfig.adminOnly || permissions.isOrgAdmin()
        : true;
      
      results.routeTests[route.path] = {
        label: route.label,
        shouldHaveAccess,
        routeConfig,
        adminOnly: route.adminOnly || false
      };
    });

    // Test role functions
    const testRoles = ['user', 'analyst', 'manager', 'reviewer', 'admin'];
    testRoles.forEach(role => {
      results.roleTests[role] = {
        hasRole: hasRole(role),
        fromRolesHook: roles.hasRole(role),
        expectedPermissions: ROLE_PERMISSIONS[role as keyof typeof ROLE_PERMISSIONS] || []
      };
    });

    // Test functionality access
    results.functionalityTests = {
      canReadOrg: permissions.canReadOrg(),
      canWriteOrg: permissions.canWriteOrg(),
      isOrgAdmin: permissions.isOrgAdmin(),
      isSystemAdmin: permissions.isSystemAdmin(),
      canReadUsers: permissions.canReadUsers(),
      canWriteUsers: permissions.canWriteUsers(),
    };

    setTestResults(results);
  };

  useEffect(() => {
    if (userContext) {
      runPermissionTests();
    }
  }, [userContext, hasPermission, hasRole]);

  const getStatusIcon = (hasAccess: boolean, expected?: boolean) => {
    if (expected !== undefined && hasAccess === expected) {
      return hasAccess ? <CheckCircle className="h-4 w-4 text-green-600" /> : <XCircle className="h-4 w-4 text-gray-400" />;
    }
    if (expected !== undefined && hasAccess !== expected) {
      return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
    }
    return hasAccess ? <CheckCircle className="h-4 w-4 text-green-600" /> : <XCircle className="h-4 w-4 text-red-600" />;
  };

  const getBadgeColor = (hasAccess: boolean) => {
    return hasAccess ? "default" : "secondary";
  };

  if (!userContext) {
    return (
      <AuthenticatedLayout>
        <div className="p-6">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              User context not loaded. Please ensure you are logged in.
            </AlertDescription>
          </Alert>
        </div>
      </AuthenticatedLayout>
    );
  }

  return (
    <AuthenticatedLayout>
      <div className="space-y-6 p-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">RBAC Testing Dashboard</h1>
          <p className="text-muted-foreground">
            Comprehensive validation of role-based access control implementation
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <User className="h-4 w-4" />
                User Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div>ID: <code className="text-xs">{testResults.userInfo?.id?.slice(0, 8)}...</code></div>
                <div>Roles: {testResults.userInfo?.roles?.map((role: string) => (
                  <Badge key={role} variant="outline" className="ml-1">{role}</Badge>
                ))}</div>
                <div>Permissions: <Badge variant="secondary">{testResults.userInfo?.permissions}</Badge></div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Permission Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={runPermissionTests}
                  className="w-full"
                >
                  Run Tests
                </Button>
                <div className="text-sm text-muted-foreground">
                  Last tested: {testResults.userInfo ? 'Now' : 'Never'}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Settings className="h-4 w-4" />
                System Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  {getStatusIcon(!!userContext)}
                  Auth Context
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(typeof hasPermission === 'function')}
                  Permission Functions
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(!!testResults.userInfo?.organizationId)}
                  Organization
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="permissions" className="space-y-4">
          <TabsList>
            <TabsTrigger value="permissions">Permission Tests</TabsTrigger>
            <TabsTrigger value="routes">Route Access</TabsTrigger>
            <TabsTrigger value="roles">Role Validation</TabsTrigger>
            <TabsTrigger value="functionality">Functionality</TabsTrigger>
          </TabsList>

          <TabsContent value="permissions">
            <Card>
              <CardHeader>
                <CardTitle>Individual Permission Tests</CardTitle>
                <CardDescription>
                  Testing core permissions for the current user role
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(testResults.permissionTests || {}).map(([permission, test]: [string, any]) => (
                    <div key={permission} className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <div className="font-medium text-sm">{permission}</div>
                        <div className="text-xs text-muted-foreground">
                          Context: {test.fromContext ? 'Yes' : 'No'} | Auth: {test.hasPermission ? 'Yes' : 'No'}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(test.hasPermission, test.expected)}
                        <Badge variant={getBadgeColor(test.hasPermission)}>
                          {test.hasPermission ? 'Granted' : 'Denied'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="routes">
            <Card>
              <CardHeader>
                <CardTitle>Route Access Testing</CardTitle>
                <CardDescription>
                  Validation of route-level permissions and navigation filtering
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(testResults.routeTests || {}).map(([path, test]: [string, any]) => (
                    <div key={path} className="flex items-center justify-between p-3 border rounded">
                      <div>
                        <div className="font-medium text-sm">{test.label}</div>
                        <div className="text-xs text-muted-foreground font-mono">{path}</div>
                        {test.adminOnly && (
                          <Badge variant="destructive" className="text-xs mt-1">Admin Only</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(test.shouldHaveAccess)}
                        <Badge variant={getBadgeColor(test.shouldHaveAccess)}>
                          {test.shouldHaveAccess ? 'Accessible' : 'Restricted'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="roles">
            <Card>
              <CardHeader>
                <CardTitle>Role Validation</CardTitle>
                <CardDescription>
                  Testing role detection and inheritance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(testResults.roleTests || {}).map(([role, test]: [string, any]) => (
                    <div key={role} className="p-4 border rounded">
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-medium">{role.toUpperCase()}</div>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(test.hasRole)}
                          <Badge variant={getBadgeColor(test.hasRole)}>
                            {test.hasRole ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Expected Permissions: {test.expectedPermissions?.length || 0}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Hook Result: {test.fromRolesHook ? 'Yes' : 'No'}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="functionality">
            <Card>
              <CardHeader>
                <CardTitle>Functionality Access</CardTitle>
                <CardDescription>
                  High-level capability testing
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(testResults.functionalityTests || {}).map(([func, hasAccess]: [string, any]) => (
                    <div key={func} className="flex items-center justify-between p-3 border rounded">
                      <div className="font-medium text-sm">
                        {func.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusIcon(hasAccess)}
                        <Badge variant={getBadgeColor(hasAccess)}>
                          {hasAccess ? 'Enabled' : 'Disabled'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Testing Instructions:</strong>
            <br />1. Run tests to validate current role permissions
            <br />2. Check that navigation items match accessible routes
            <br />3. Verify admin-only sections are properly restricted
            <br />4. Test fallback behavior when switching roles
          </AlertDescription>
        </Alert>
      </div>
    </AuthenticatedLayout>
  );
};

export default RBACTesting;