
import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import AuthenticatedLayout from "@/components/layout/AuthenticatedLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const Support = () => {
  const { user } = useAuth();

  return (
    <AuthenticatedLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Support</h1>
          <p className="text-muted-foreground">
            Get help with using the platform.
          </p>
        </div>
        
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Help Center</CardTitle>
              <CardDescription>
                Access guides and documentation for using the platform.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>Content for help center will go here.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Contact Support</CardTitle>
              <CardDescription>
                Get in touch with our support team for assistance.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>Content for contacting support will go here.</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>FAQs</CardTitle>
              <CardDescription>
                Frequently asked questions about the platform.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>Content for FAQs will go here.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </AuthenticatedLayout>
  );
};

export default Support;
