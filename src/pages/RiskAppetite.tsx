
import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import AuthenticatedLayout from "@/components/layout/AuthenticatedLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const RiskAppetite = () => {
  const { user } = useAuth();

  return (
    <AuthenticatedLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Risk Appetite</h1>
          <p className="text-muted-foreground">
            Define and manage your organization's risk appetite statements and thresholds.
          </p>
        </div>
        
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Risk Appetite Statement</CardTitle>
              <CardDescription>
                Define the types and amounts of risk your organization is willing to accept.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>Content for risk appetite statement will go here.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Risk Thresholds</CardTitle>
              <CardDescription>
                Set measurable thresholds for different risk categories.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>Content for risk thresholds will go here.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </AuthenticatedLayout>
  );
};

export default RiskAppetite;
