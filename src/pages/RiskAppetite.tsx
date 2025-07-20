
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AuthenticatedLayout from "@/components/layout/AuthenticatedLayout";
import UnifiedRiskAppetite from "@/components/risk-appetite/UnifiedRiskAppetite";
import { EnhancedKRIDashboard } from "@/components/kri/EnhancedKRIDashboard";
import { KRIManagementWorkflow } from "@/components/kri/KRIManagementWorkflow";

const RiskAppetite = () => {
  return (
    <AuthenticatedLayout>
      <div className="space-y-6">
        <Tabs defaultValue="appetite" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="appetite">Risk Appetite</TabsTrigger>
            <TabsTrigger value="kri-dashboard">KRI Dashboard</TabsTrigger>
            <TabsTrigger value="kri-management">KRI Management</TabsTrigger>
          </TabsList>
          
          <TabsContent value="appetite">
            <UnifiedRiskAppetite />
          </TabsContent>
          
          <TabsContent value="kri-dashboard">
            <EnhancedKRIDashboard />
          </TabsContent>
          
          <TabsContent value="kri-management">
            <KRIManagementWorkflow />
          </TabsContent>
        </Tabs>
      </div>
    </AuthenticatedLayout>
  );
};

export default RiskAppetite;
