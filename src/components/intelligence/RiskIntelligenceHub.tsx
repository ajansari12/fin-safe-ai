
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Brain, Shield, TrendingUp, Database } from "lucide-react";
import IntelligenceDashboard from "./IntelligenceDashboard";
import RegulatoryCompliancePanel from "./RegulatoryCompliancePanel";

interface RiskIntelligenceHubProps {
  vendorId?: string;
}

const RiskIntelligenceHub: React.FC<RiskIntelligenceHubProps> = ({ vendorId }) => {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Risk Intelligence Hub</h2>
        <p className="text-muted-foreground">
          Comprehensive external risk intelligence integration and analysis
        </p>
      </div>

      <Tabs defaultValue="dashboard" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            Intelligence
          </TabsTrigger>
          <TabsTrigger value="compliance" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Compliance
          </TabsTrigger>
          <TabsTrigger value="benchmarking" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Benchmarking
          </TabsTrigger>
          <TabsTrigger value="sources" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Data Sources
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          <IntelligenceDashboard vendorId={vendorId} />
        </TabsContent>

        <TabsContent value="compliance" className="space-y-6">
          <RegulatoryCompliancePanel />
        </TabsContent>

        <TabsContent value="benchmarking" className="space-y-6">
          <div className="text-center py-12 text-muted-foreground">
            <TrendingUp className="h-16 w-16 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Industry Benchmarking</h3>
            <p>Compare vendor risk profiles against industry standards and peer institutions</p>
          </div>
        </TabsContent>

        <TabsContent value="sources" className="space-y-6">
          <div className="text-center py-12 text-muted-foreground">
            <Database className="h-16 w-16 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">External Data Sources</h3>
            <p>Configure and manage external risk intelligence data sources</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RiskIntelligenceHub;
