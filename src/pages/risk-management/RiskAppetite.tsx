
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import AuthenticatedLayout from "@/components/layout/AuthenticatedLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PlusCircle, BarChart3, FileText, Settings, AlertTriangle, TrendingUp, Grid3X3 } from "lucide-react";
import { getRiskAppetiteStatements } from "@/services/risk-management-service";
import { RiskAppetiteStatement } from "./types";
import RiskAppetiteDashboard from "@/components/risk-appetite/RiskAppetiteDashboard";
import RiskAppetiteOverview from "@/components/risk-appetite/RiskAppetiteOverview";
import AppetiteBreachAlerts from "@/components/risk-appetite/AppetiteBreachAlerts";
import RiskPostureChart from "@/components/risk-appetite/RiskPostureChart";
import BoardReportGenerator from "@/components/risk-appetite/BoardReportGenerator";
import TrendChart from "@/components/risk-appetite/TrendChart";
import RiskPostureHeatmap from "@/components/risk-appetite/RiskPostureHeatmap";
import EscalationWorkflow from "@/components/risk-appetite/EscalationWorkflow";

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
            <h1 className="text-3xl font-bold tracking-tight">Risk Appetite Management</h1>
            <p className="text-muted-foreground">
              Enhanced risk appetite monitoring with automated breach detection, trend analysis, and escalation workflows.
            </p>
          </div>
          <Button onClick={handleCreateNew}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Create New Statement
          </Button>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-7">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="trends" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Trends
            </TabsTrigger>
            <TabsTrigger value="heatmap" className="flex items-center gap-2">
              <Grid3X3 className="h-4 w-4" />
              Heatmap
            </TabsTrigger>
            <TabsTrigger value="alerts" className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Alerts
            </TabsTrigger>
            <TabsTrigger value="escalation" className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Escalation
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Reports
            </TabsTrigger>
            <TabsTrigger value="statements" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Statements
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <RiskAppetiteDashboard />
          </TabsContent>

          <TabsContent value="trends" className="space-y-6">
            <TrendChart />
            <RiskPostureChart />
          </TabsContent>

          <TabsContent value="heatmap" className="space-y-6">
            <RiskPostureHeatmap />
          </TabsContent>

          <TabsContent value="alerts" className="space-y-6">
            <AppetiteBreachAlerts />
          </TabsContent>

          <TabsContent value="escalation" className="space-y-6">
            <EscalationWorkflow />
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <BoardReportGenerator />
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
                  <CardTitle>Enhanced Features</CardTitle>
                  <CardDescription>
                    Advanced risk appetite management capabilities
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 text-sm">
                  <div>
                    <h4 className="font-medium mb-2">Automated Monitoring:</h4>
                    <ul className="list-disc list-inside space-y-1">
                      <li><strong>Real-time Breach Detection:</strong> Automatic alerts when thresholds are exceeded</li>
                      <li><strong>Escalation Workflows:</strong> Configurable escalation rules and notifications</li>
                      <li><strong>Aggregated Scoring:</strong> Overall risk posture monitoring</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Board Reporting:</h4>
                    <ul className="list-disc list-inside space-y-1">
                      <li><strong>Executive Dashboards:</strong> High-level risk posture summaries</li>
                      <li><strong>Print-ready Reports:</strong> Professional board presentation format</li>
                      <li><strong>Trend Analysis:</strong> Historical risk appetite performance</li>
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
