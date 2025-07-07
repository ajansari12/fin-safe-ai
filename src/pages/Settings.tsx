import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import AuthenticatedLayout from "@/components/layout/AuthenticatedLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, User, Bell, Building, Database, Lock, Users } from "lucide-react";
import AdminInterface from "@/components/admin/AdminInterface";
import UserPreferences from "@/components/settings/UserPreferences";
import NotificationSettings from "@/components/settings/NotificationSettings";
import OrganizationManagement from "@/components/settings/OrganizationManagement";
import SecuritySettings from "@/components/security/SecuritySettings";
import EnterpriseSecurityDashboard from "@/components/security/EnterpriseSecurityDashboard";
import RoleEditor from "@/components/admin/RoleEditor";
import OrganizationMembers from "@/components/admin/OrganizationMembers";
import { supabase } from "@/integrations/supabase/client";
import { useLocation } from "react-router-dom";

const Settings = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  // Determine default tab based on route
  const getDefaultTab = () => {
    if (location.pathname === '/app/settings/roles') {
      return 'roles';
    }
    if (location.pathname === '/app/settings/members') {
      return 'members';
    }
    return 'preferences';
  };

  useEffect(() => {
    checkAdminRole();
  }, [user]);

  const checkAdminRole = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const { data } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      setIsAdmin(data?.role === 'admin');
    } catch (error) {
      console.error('Error checking admin role:', error);
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AuthenticatedLayout>
        <div>Loading...</div>
      </AuthenticatedLayout>
    );
  }

  return (
    <AuthenticatedLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account, organization, and application settings.
          </p>
        </div>

        <Tabs defaultValue={getDefaultTab()} className="space-y-6">
          <TabsList className="grid w-full grid-cols-9">
            <TabsTrigger value="preferences" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              User
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Notifications
            </TabsTrigger>
            <TabsTrigger value="organization" className="flex items-center gap-2">
              <Building className="h-4 w-4" />
              Organization
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Lock className="h-4 w-4" />
              Security
            </TabsTrigger>
            <TabsTrigger value="enterprise-security" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Enterprise
            </TabsTrigger>
            {isAdmin && (
              <>
                <TabsTrigger value="members" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Members
                </TabsTrigger>
                <TabsTrigger value="roles" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Roles
                </TabsTrigger>
                <TabsTrigger value="admin" className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Admin
                </TabsTrigger>
                <TabsTrigger value="data" className="flex items-center gap-2">
                  <Database className="h-4 w-4" />
                  Data
                </TabsTrigger>
              </>
            )}
          </TabsList>

          <TabsContent value="preferences">
            <UserPreferences />
          </TabsContent>

          <TabsContent value="notifications">
            <NotificationSettings />
          </TabsContent>

          <TabsContent value="organization">
            <OrganizationManagement />
          </TabsContent>

          <TabsContent value="security">
            <SecuritySettings />
          </TabsContent>

          <TabsContent value="enterprise-security">
            <EnterpriseSecurityDashboard />
          </TabsContent>

          {isAdmin && (
            <TabsContent value="members">
              <OrganizationMembers />
            </TabsContent>
          )}

          {isAdmin && (
            <TabsContent value="roles">
              <RoleEditor />
            </TabsContent>
          )}

          {isAdmin && (
            <TabsContent value="admin">
              <AdminInterface />
            </TabsContent>
          )}

          {isAdmin && (
            <TabsContent value="data">
              <Card>
                <CardHeader>
                  <CardTitle>Data Management</CardTitle>
                  <CardDescription>
                    Manage data retention, exports, and compliance
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p>Data management tools will be implemented here.</p>
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>

        {!isAdmin && (
          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              You need admin privileges to access advanced settings. Contact your administrator for access.
            </AlertDescription>
          </Alert>
        )}
      </div>
    </AuthenticatedLayout>
  );
};

export default Settings;
