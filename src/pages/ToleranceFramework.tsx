
import React, { useState } from "react";
import AuthenticatedLayout from "@/components/layout/AuthenticatedLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ToleranceDefinitions from "@/components/tolerance/ToleranceDefinitions";
import ToleranceMonitoring from "@/components/tolerance/ToleranceMonitoring";
import BreachManagement from "@/components/tolerance/BreachManagement";
import ToleranceReporting from "@/components/tolerance/ToleranceReporting";
import { useToast } from "@/hooks/use-toast";

const ToleranceFramework = () => {
  const [activeTab, setActiveTab] = useState("definitions");
  const { toast } = useToast();

  return (
    <AuthenticatedLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tolerance for Disruption Framework</h1>
          <p className="text-muted-foreground">
            Define, monitor, and manage acceptable disruption levels for critical operations (OSFI E-21 compliant)
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="definitions">Tolerance Definitions</TabsTrigger>
            <TabsTrigger value="monitoring">Real-time Monitoring</TabsTrigger>
            <TabsTrigger value="breach-management">Breach Management</TabsTrigger>
            <TabsTrigger value="reporting">Reporting & Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="definitions" className="space-y-4">
            <ToleranceDefinitions />
          </TabsContent>

          <TabsContent value="monitoring" className="space-y-4">
            <ToleranceMonitoring />
          </TabsContent>

          <TabsContent value="breach-management" className="space-y-4">
            <BreachManagement />
          </TabsContent>

          <TabsContent value="reporting" className="space-y-4">
            <ToleranceReporting />
          </TabsContent>
        </Tabs>
      </div>
    </AuthenticatedLayout>
  );
};

export default ToleranceFramework;
