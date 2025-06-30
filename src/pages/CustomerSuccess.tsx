
import React, { useState } from "react";
import AuthenticatedLayout from "@/components/layout/AuthenticatedLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  TrendingUp, 
  Target, 
  Users, 
  BookOpen, 
  Settings,
  Heart,
  CheckCircle,
  AlertTriangle,
  BarChart3
} from "lucide-react";
import CustomerHealthDashboard from "@/components/customer-success/CustomerHealthDashboard";
import SuccessPlanningHub from "@/components/customer-success/SuccessPlanningHub";
import ProactiveSupportCenter from "@/components/customer-success/ProactiveSupportCenter";
import ExpansionOpportunities from "@/components/customer-success/ExpansionOpportunities";
import KnowledgeTransferCenter from "@/components/customer-success/KnowledgeTransferCenter";

const CustomerSuccess = () => {
  const [activeTab, setActiveTab] = useState("health");

  // Mock customer health overview data
  const healthOverview = {
    overallScore: 85,
    accountsAtRisk: 3,
    totalAccounts: 47,
    successPlansActive: 31,
    qbrsDue: 8
  };

  const getHealthColor = (score: number) => {
    if (score >= 80) return "text-green-500";
    if (score >= 60) return "text-yellow-500";
    return "text-red-500";
  };

  const getHealthBadge = (score: number) => {
    if (score >= 80) return <Badge className="bg-green-500">Healthy</Badge>;
    if (score >= 60) return <Badge className="bg-yellow-500">At Risk</Badge>;
    return <Badge className="bg-red-500">Critical</Badge>;
  };

  return (
    <AuthenticatedLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Customer Success Platform</h1>
            <p className="text-muted-foreground">
              Comprehensive customer health monitoring and success management
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className={`text-2xl font-bold ${getHealthColor(healthOverview.overallScore)}`}>
                {healthOverview.overallScore}
              </div>
              <div className="text-sm text-muted-foreground">Average Health Score</div>
            </div>
            <Progress value={healthOverview.overallScore} className="w-32" />
          </div>
        </div>

        {/* Key Metrics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Accounts</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{healthOverview.totalAccounts}</div>
              <p className="text-xs text-muted-foreground">
                Active customer accounts
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">At-Risk Accounts</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-500">{healthOverview.accountsAtRisk}</div>
              <p className="text-xs text-muted-foreground">
                Require immediate attention
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Success Plans</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{healthOverview.successPlansActive}</div>
              <p className="text-xs text-muted-foreground">
                Plans in execution
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">QBRs Due</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{healthOverview.qbrsDue}</div>
              <p className="text-xs text-muted-foreground">
                This quarter
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="health" className="flex items-center gap-2">
              <Heart className="h-4 w-4" />
              Health Scoring
            </TabsTrigger>
            <TabsTrigger value="planning" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              Success Planning
            </TabsTrigger>
            <TabsTrigger value="support" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Proactive Support
            </TabsTrigger>
            <TabsTrigger value="expansion" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Expansion
            </TabsTrigger>
            <TabsTrigger value="knowledge" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Knowledge Transfer
            </TabsTrigger>
          </TabsList>

          <TabsContent value="health" className="space-y-6">
            <CustomerHealthDashboard />
          </TabsContent>

          <TabsContent value="planning" className="space-y-6">
            <SuccessPlanningHub />
          </TabsContent>

          <TabsContent value="support" className="space-y-6">
            <ProactiveSupportCenter />
          </TabsContent>

          <TabsContent value="expansion" className="space-y-6">
            <ExpansionOpportunities />
          </TabsContent>

          <TabsContent value="knowledge" className="space-y-6">
            <KnowledgeTransferCenter />
          </TabsContent>
        </Tabs>
      </div>
    </AuthenticatedLayout>
  );
};

export default CustomerSuccess;
