
import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import AuthenticatedLayout from "@/components/layout/AuthenticatedLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const RiskAppetite = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const handleGoToWorkflow = () => {
    navigate("/risk-appetite");
  };

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
              <CardTitle>Risk Appetite Statements</CardTitle>
              <CardDescription>
                Define the types and amounts of risk your organization is willing to accept.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col space-y-4">
              <p>
                A risk appetite statement defines the amount and type of risk an organization is
                willing to accept in pursuit of its strategic objectives. It serves as a guide
                for decision-making throughout the organization.
              </p>
              
              <p>
                Use our step-by-step workflow to create and manage your risk appetite:
              </p>
              
              <ol className="list-decimal list-inside space-y-2 ml-4">
                <li>Define major risk categories (Operational, Technology, Third-Party, Cyber, etc.)</li>
                <li>Assign tolerance thresholds (low, medium, high) to each risk category</li>
                <li>Determine escalation triggers (e.g., "2 major incidents per quarter")</li>
                <li>Associate Key Risk Indicators (KRIs) with each category</li>
                <li>Save draft, review with governance, publish officially</li>
              </ol>
              
              <Button className="self-start mt-4" onClick={handleGoToWorkflow}>
                Go to Risk Appetite Workflow <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </AuthenticatedLayout>
  );
};

export default RiskAppetite;
