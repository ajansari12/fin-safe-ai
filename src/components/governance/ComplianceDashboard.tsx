
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ComplianceReportGenerator from "./ComplianceReportGenerator";
import ComplianceAnalyticsDashboard from "./ComplianceAnalyticsDashboard";
import UnifiedRiskAppetite from "@/components/risk-appetite/UnifiedRiskAppetite";
import VendorRiskDashboard from "@/components/third-party/VendorRiskDashboard";
import IncidentLog from "@/pages/IncidentLog";
import OSFIGovernanceOversight from "../osfi-integration/OSFIGovernanceOversight";
import { BarChart3, FileText, Shield, TrendingUp, Building2, AlertTriangle } from "lucide-react";

export default function ComplianceDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Compliance Dashboard</h2>
        <p className="text-muted-foreground">
          Monitor compliance metrics, generate reports, and track policy reviews.
        </p>
      </div>

      <Tabs defaultValue="governance" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="governance" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Governance
          </TabsTrigger>
          <TabsTrigger value="risk-appetite" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Risk Appetite
          </TabsTrigger>
          <TabsTrigger value="third-party" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Third Party
          </TabsTrigger>
          <TabsTrigger value="incidents" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Incidents
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Reports
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="governance">
          <OSFIGovernanceOversight />
        </TabsContent>
        
        <TabsContent value="risk-appetite">
          <UnifiedRiskAppetite />
        </TabsContent>
        
        <TabsContent value="third-party">
          <VendorRiskDashboard />
        </TabsContent>
        
        <TabsContent value="incidents">
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-sm font-medium text-blue-900 mb-2">OSFI E-21 Incident Management</h3>
              <p className="text-sm text-blue-700">
                Enhanced incident tracking with operational risk taxonomy, critical operations mapping, and disruption tolerance assessment.
              </p>
            </div>
            <IncidentLog />
          </div>
        </TabsContent>
        
        <TabsContent value="analytics">
          <ComplianceAnalyticsDashboard />
        </TabsContent>
        
        <TabsContent value="reports">
          <ComplianceReportGenerator />
        </TabsContent>
      </Tabs>
    </div>
  );
}
