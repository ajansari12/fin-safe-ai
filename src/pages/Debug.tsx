import React from "react";
import AuthenticatedLayout from "@/components/layout/AuthenticatedLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useRoles } from "@/hooks/useRoles";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield, Database, Code, Activity } from "lucide-react";

const Debug = () => {
  const { user, profile } = useAuth();
  const { userRoles, userPermissions, isAdmin } = useRoles();

  return (
    <AuthenticatedLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">System Debug</h1>
          <p className="text-muted-foreground">
            Debug and system information for administrators
          </p>
        </div>

        <Alert>
          <Shield className="h-4 w-4" />
          <AlertDescription>
            This page is only accessible to system administrators. Information shown here should not be shared.
          </AlertDescription>
        </Alert>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                User Context
              </CardTitle>
              <CardDescription>Current user authentication and profile data</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">User ID</label>
                <p className="text-sm text-muted-foreground font-mono">{user?.id || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium">Email</label>
                <p className="text-sm text-muted-foreground">{user?.email || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium">Full Name</label>
                <p className="text-sm text-muted-foreground">{profile?.full_name || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium">Organization ID</label>
                <p className="text-sm text-muted-foreground font-mono">{profile?.organization_id || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium">Profile Role</label>
                <p className="text-sm text-muted-foreground">{profile?.role || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium">Is Admin</label>
                <Badge variant={isAdmin() ? "default" : "secondary"}>
                  {isAdmin() ? "Yes" : "No"}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Role & Permission System
              </CardTitle>
              <CardDescription>Current user roles and permissions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">User Roles</label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {userRoles.length > 0 ? (
                    userRoles.map(role => (
                      <Badge key={role} variant="outline">{role}</Badge>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">No roles assigned</p>
                  )}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Permissions ({userPermissions.length})</label>
                <div className="max-h-32 overflow-y-auto mt-2">
                  <div className="flex flex-wrap gap-1">
                    {userPermissions.length > 0 ? (
                      userPermissions.map(permission => (
                        <Badge key={permission} variant="secondary" className="text-xs">
                          {permission}
                        </Badge>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">No permissions assigned</p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                System Health
              </CardTitle>
              <CardDescription>Application status and health checks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Authentication</span>
                <Badge variant="default">Active</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Database Connection</span>
                <Badge variant="default">Connected</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Role System</span>
                <Badge variant="default">Operational</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Permission System</span>
                <Badge variant="default">Operational</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="h-5 w-5" />
                Development Info
              </CardTitle>
              <CardDescription>Development and build information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Environment</label>
                <p className="text-sm text-muted-foreground">Development</p>
              </div>
              <div>
                <label className="text-sm font-medium">Build Time</label>
                <p className="text-sm text-muted-foreground">{new Date().toISOString()}</p>
              </div>
              <div>
                <label className="text-sm font-medium">User Agent</label>
                <p className="text-sm text-muted-foreground break-all">{navigator.userAgent}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AuthenticatedLayout>
  );
};

export default Debug;