import React from "react";
import AuthenticatedLayout from "@/components/layout/AuthenticatedLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BarChart3 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ExecutiveDashboard from "@/components/analytics/ExecutiveDashboard";

const SimpleDashboard: React.FC = () => {
  const navigate = useNavigate();

  return (
    <AuthenticatedLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => navigate('/app/dashboard')}
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Custom Analytics</h1>
              <p className="text-muted-foreground">
                Lightweight analytics dashboard with essential metrics
              </p>
            </div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Executive Analytics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              This simplified analytics view provides core executive metrics without heavy AI processing.
              For advanced features, please contact your system administrator.
            </p>
          </CardContent>
        </Card>

        <ExecutiveDashboard />
      </div>
    </AuthenticatedLayout>
  );
};

export default SimpleDashboard;