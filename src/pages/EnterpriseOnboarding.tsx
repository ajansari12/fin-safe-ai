
import React, { useState } from "react";
import AuthenticatedLayout from "@/components/layout/AuthenticatedLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  Building2, 
  Users, 
  Database, 
  GraduationCap, 
  Rocket,
  CheckCircle,
  Clock,
  AlertTriangle,
  BarChart3
} from "lucide-react";
import PreImplementationDiscovery from "@/components/onboarding/PreImplementationDiscovery";
import ProjectManagement from "@/components/onboarding/ProjectManagement";
import DataMigrationConfig from "@/components/onboarding/DataMigrationConfig";
import TrainingChangeManagement from "@/components/onboarding/TrainingChangeManagement";
import GoLiveSupport from "@/components/onboarding/GoLiveSupport";
import OnboardingDashboard from "@/components/onboarding/OnboardingDashboard";

const EnterpriseOnboarding = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  
  // Mock implementation progress data
  const overallProgress = 45;
  const phases = [
    { id: "discovery", name: "Discovery", progress: 100, status: "completed" },
    { id: "planning", name: "Project Planning", progress: 80, status: "in_progress" },
    { id: "migration", name: "Data Migration", progress: 20, status: "in_progress" },
    { id: "training", name: "Training", progress: 0, status: "pending" },
    { id: "go_live", name: "Go-Live", progress: 0, status: "pending" }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed": return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "in_progress": return <Clock className="h-4 w-4 text-blue-500" />;
      case "pending": return <AlertTriangle className="h-4 w-4 text-gray-400" />;
      default: return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed": return <Badge className="bg-green-500">Completed</Badge>;
      case "in_progress": return <Badge className="bg-blue-500">In Progress</Badge>;
      case "pending": return <Badge variant="secondary">Pending</Badge>;
      default: return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  return (
    <AuthenticatedLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Enterprise Client Onboarding</h1>
            <p className="text-muted-foreground">
              Comprehensive implementation guidance for financial institutions
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-2xl font-bold">{overallProgress}%</div>
              <div className="text-sm text-muted-foreground">Overall Progress</div>
            </div>
            <Progress value={overallProgress} className="w-32" />
          </div>
        </div>

        {/* Implementation Phase Overview */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {phases.map((phase, index) => (
            <Card key={phase.id} className="relative">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  {getStatusIcon(phase.status)}
                  <span className="text-sm font-medium text-muted-foreground">
                    Phase {index + 1}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <h3 className="font-semibold text-sm">{phase.name}</h3>
                  <Progress value={phase.progress} className="h-2" />
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">{phase.progress}%</span>
                    {getStatusBadge(phase.status)}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="discovery" className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Discovery
            </TabsTrigger>
            <TabsTrigger value="project" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Project Mgmt
            </TabsTrigger>
            <TabsTrigger value="migration" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              Data Migration
            </TabsTrigger>
            <TabsTrigger value="training" className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4" />
              Training
            </TabsTrigger>
            <TabsTrigger value="golive" className="flex items-center gap-2">
              <Rocket className="h-4 w-4" />
              Go-Live
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <OnboardingDashboard />
          </TabsContent>

          <TabsContent value="discovery" className="space-y-6">
            <PreImplementationDiscovery />
          </TabsContent>

          <TabsContent value="project" className="space-y-6">
            <ProjectManagement />
          </TabsContent>

          <TabsContent value="migration" className="space-y-6">
            <DataMigrationConfig />
          </TabsContent>

          <TabsContent value="training" className="space-y-6">
            <TrainingChangeManagement />
          </TabsContent>

          <TabsContent value="golive" className="space-y-6">
            <GoLiveSupport />
          </TabsContent>
        </Tabs>
      </div>
    </AuthenticatedLayout>
  );
};

export default EnterpriseOnboarding;
