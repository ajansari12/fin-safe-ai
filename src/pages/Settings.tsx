
import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import AuthenticatedLayout from "@/components/layout/AuthenticatedLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Shield } from "lucide-react";
import AdminInterface from "@/components/admin/AdminInterface";
import { supabase } from "@/integrations/supabase/client";

const Settings = () => {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

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
            Manage your account and application settings.
          </p>
        </div>

        {isAdmin ? (
          <AdminInterface />
        ) : (
          <div className="grid gap-6">
            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription>
                You need admin privileges to access the full settings panel. Contact your administrator for access.
              </AlertDescription>
            </Alert>

            <Card>
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
                <CardDescription>
                  Update your account information and preferences.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p>Content for account settings will go here.</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Organization Settings</CardTitle>
                <CardDescription>
                  Manage organization profile and user permissions.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p>Content for organization settings will go here.</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Notifications</CardTitle>
                <CardDescription>
                  Configure your notification preferences.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p>Content for notification settings will go here.</p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </AuthenticatedLayout>
  );
};

export default Settings;
