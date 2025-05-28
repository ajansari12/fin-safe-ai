
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import AuthenticatedLayout from "@/components/layout/AuthenticatedLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlusCircle, BarChart3, FileText, Settings } from "lucide-react";
import { getRiskAppetiteStatements } from "@/services/risk-management-service";
import { RiskAppetiteStatement } from "./types";
import RiskAppetiteDashboard from "@/components/risk-appetite/RiskAppetiteDashboard";
import RiskAppetiteOverview from "@/components/risk-appetite/RiskAppetiteOverview";

export default function RiskAppetite() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [statements, setStatements] = useState<RiskAppetiteStatement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("dashboard");

  useEffect(() => {
    const loadStatements = async () => {
      setIsLoading(true);
      if (profile?.organization_id) {
        const data = await getRiskAppetiteStatements(profile.organization_id);
        setStatements(data);
      }
      setIsLoading(false);
    };
    
    loadStatements();
  }, [profile?.organization_id]);

  const handleCreateNew = () => {
    navigate("/risk-appetite/create");
  };

  const handleViewStatement = (id: string) => {
    navigate(`/risk-appetite/edit/${id}`);
  };

  return (
    <AuthenticatedLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Risk Appetite</h1>
            <p className="text-muted-foreground">
              Define and manage your organization's risk appetite statements and monitor risk levels.
            </p>
          </div>
          <Button onClick={handleCreateNew}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Create New Statement
          </Button>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="statements" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Statements
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Settings
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <RiskAppetiteDashboard />
          </TabsContent>

          <TabsContent value="statements" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Risk Appetite Statements</CardTitle>
                <CardDescription>
                  View and manage your organization's risk appetite statements.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RiskAppetiteOverview
                  statements={statements}
                  onViewStatement={handleViewStatement}
                  onCreateNew={handleCreateNew}
                  isLoading={isLoading}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>About Risk Appetite</CardTitle>
                  <CardDescription>
                    Understanding risk appetite and its importance
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 text-sm">
                  <p>
                    A risk appetite statement defines the amount and type of risk an organization is 
                    willing to accept in pursuit of its strategic objectives. It serves as a guide 
                    for decision-making throughout the organization.
                  </p>
                  
                  <div>
                    <h4 className="font-medium mb-2">Risk Appetite Process:</h4>
                    <ol className="list-decimal list-inside space-y-1">
                      <li>Define risk categories relevant to your organization</li>
                      <li>Establish tolerance thresholds for each category</li>
                      <li>Set clear escalation triggers for when risks exceed tolerance</li>
                      <li>Define KRIs to monitor risk levels effectively</li>
                      <li>Review and update regularly</li>
                    </ol>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Risk Categories</CardTitle>
                  <CardDescription>
                    Standard risk categories for your organization
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 text-sm">
                  <div>
                    <h4 className="font-medium mb-2">Primary Categories:</h4>
                    <ul className="list-disc list-inside space-y-1">
                      <li><strong>Operational Risk:</strong> Process failures, human errors, system outages</li>
                      <li><strong>Technology Risk:</strong> Cyber threats, system failures, data breaches</li>
                      <li><strong>Third Party Risk:</strong> Vendor dependencies, supply chain disruptions</li>
                      <li><strong>Compliance Risk:</strong> Regulatory violations, policy breaches</li>
                      <li><strong>Financial Risk:</strong> Credit, market, liquidity risks</li>
                      <li><strong>Reputational Risk:</strong> Brand damage, customer trust issues</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Tolerance Levels:</h4>
                    <ul className="list-disc list-inside space-y-1">
                      <li><strong>Low:</strong> Minimal tolerance, immediate escalation</li>
                      <li><strong>Medium:</strong> Moderate tolerance, managed response</li>
                      <li><strong>High:</strong> Higher tolerance, monitored closely</li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AuthenticatedLayout>
  );
}
