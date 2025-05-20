
import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import AuthenticatedLayout from "@/components/layout/AuthenticatedLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const WorkflowCenter = () => {
  const { user } = useAuth();

  return (
    <AuthenticatedLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Workflow Center</h1>
          <p className="text-muted-foreground">
            Manage and track all your operational resilience workflows.
          </p>
        </div>
        
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Active Workflows</CardTitle>
              <CardDescription>
                View and manage workflows currently in progress.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>Content for active workflows will go here.</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Completed Workflows</CardTitle>
              <CardDescription>
                View history of completed workflow activities.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>Content for completed workflows will go here.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </AuthenticatedLayout>
  );
};

export default WorkflowCenter;
