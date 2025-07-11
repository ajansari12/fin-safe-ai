
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ComplianceReportGenerator from "./ComplianceReportGenerator";
import ComplianceAnalyticsDashboard from "./ComplianceAnalyticsDashboard";
import OSFIGovernanceOversight from "./OSFIGovernanceOversight";
import OperationalRiskTaxonomy from "./OperationalRiskTaxonomy";
import OSFIRealTimeMonitoring from "./OSFIRealTimeMonitoring";
import OSFIRegulatorySelfAssessment from "./OSFIRegulatorySelfAssessment";
import { BarChart3, FileText, Shield, Target, Activity, CheckSquare } from "lucide-react";

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
          <TabsTrigger value="risk-taxonomy" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Risk Framework
          </TabsTrigger>
          <TabsTrigger value="monitoring" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Monitoring
          </TabsTrigger>
          <TabsTrigger value="assessment" className="flex items-center gap-2">
            <CheckSquare className="h-4 w-4" />
            Self-Assessment
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
        
        <TabsContent value="risk-taxonomy">
          <OperationalRiskTaxonomy />
        </TabsContent>
        
        <TabsContent value="monitoring">
          <OSFIRealTimeMonitoring />
        </TabsContent>
        
        <TabsContent value="assessment">
          <OSFIRegulatorySelfAssessment />
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
