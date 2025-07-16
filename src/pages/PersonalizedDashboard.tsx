
import React, { useState, useEffect } from "react";
// TODO: Migrated from AuthContext to EnhancedAuthContext
import { useAuth } from "@/contexts/EnhancedAuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Settings, Layout, Users, Share2 } from "lucide-react";
import ExecutiveDashboard from "@/components/dashboard/ExecutiveDashboard";
import RiskManagerDashboard from "@/components/dashboard/RiskManagerDashboard";
import OperationalStaffDashboard from "@/components/dashboard/OperationalStaffDashboard";
import AuditorDashboard from "@/components/dashboard/AuditorDashboard";
import { DashboardPersonalization } from "@/components/dashboard/DashboardPersonalization";
import CollaborationPanel from "@/components/dashboard/CollaborationPanel";
import MobileDashboardLayout from "@/components/dashboard/MobileDashboardLayout";
import AuthenticatedLayout from "@/components/layout/AuthenticatedLayout";
import { useIsMobile } from "@/hooks/use-mobile";

const PersonalizedDashboard: React.FC = () => {
  const { profile } = useAuth();
  const isMobile = useIsMobile();
  const [activeView, setActiveView] = useState("main");
  const [dashboardSettings, setDashboardSettings] = useState({
    layout: "default",
    widgets: [],
    preferences: {
      theme: "system",
      refreshInterval: 30000,
      notifications: true
    }
  });

  const userRole = profile?.role || "user";

  // Role-based dashboard mapping
  const getDashboardComponent = () => {
    switch (userRole) {
      case "admin":
      case "executive":
        return <ExecutiveDashboard settings={dashboardSettings} />;
      case "manager":
        return <RiskManagerDashboard settings={dashboardSettings} />;
      case "analyst":
        return <OperationalStaffDashboard settings={dashboardSettings} />;
      case "auditor":
        return <AuditorDashboard settings={dashboardSettings} />;
      default:
        return <OperationalStaffDashboard settings={dashboardSettings} />;
    }
  };

  const getRoleDisplayName = (role: string) => {
    const roleMap = {
      admin: "Executive",
      executive: "Executive",
      manager: "Risk Manager", 
      analyst: "Operations",
      auditor: "Auditor",
      user: "General User"
    };
    return roleMap[role as keyof typeof roleMap] || role;
  };

  // Show mobile layout on mobile devices
  if (isMobile) {
    return (
      <AuthenticatedLayout>
        <MobileDashboardLayout 
          userRole={userRole}
          dashboardSettings={dashboardSettings}
          onSettingsChange={setDashboardSettings}
        />
      </AuthenticatedLayout>
    );
  }

  return (
    <AuthenticatedLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {getRoleDisplayName(userRole)} Dashboard
            </h1>
            <p className="text-muted-foreground">
              Personalized view based on your role and preferences
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="px-3 py-1">
              {getRoleDisplayName(userRole)}
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setActiveView(activeView === "settings" ? "main" : "settings")}
            >
              <Settings className="h-4 w-4 mr-2" />
              Customize
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setActiveView(activeView === "collaborate" ? "main" : "collaborate")}
            >
              <Share2 className="h-4 w-4 mr-2" />
              Collaborate
            </Button>
          </div>
        </div>

        {/* Main Content */}
        <Tabs value={activeView} onValueChange={setActiveView}>
          <TabsList className="hidden">
            <TabsTrigger value="main">Dashboard</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="collaborate">Collaborate</TabsTrigger>
          </TabsList>

          <TabsContent value="main" className="space-y-6">
            {getDashboardComponent()}
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <DashboardPersonalization
              userRole={userRole}
              settings={dashboardSettings}
              onSettingsChange={setDashboardSettings}
              onClose={() => setActiveView("main")}
            />
          </TabsContent>

          <TabsContent value="collaborate" className="space-y-6">
            <CollaborationPanel
              userRole={userRole}
              onClose={() => setActiveView("main")}
            />
          </TabsContent>
        </Tabs>
      </div>
    </AuthenticatedLayout>
  );
};

export default PersonalizedDashboard;
