
import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import AuthenticatedLayout from "@/components/layout/AuthenticatedLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const ThirdPartyRisk = () => {
  const { user } = useAuth();

  return (
    <AuthenticatedLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Third-Party Risk</h1>
          <p className="text-muted-foreground">
            Assess and manage risks associated with third-party service providers.
          </p>
        </div>
        
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Vendor Inventory</CardTitle>
              <CardDescription>
                Track third-party vendors and service providers.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>Content for vendor inventory will go here.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Risk Assessments</CardTitle>
              <CardDescription>
                Conduct and track third-party risk assessments.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>Content for risk assessments will go here.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </AuthenticatedLayout>
  );
};

export default ThirdPartyRisk;
