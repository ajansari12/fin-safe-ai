
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ComplianceReportGenerator from "./ComplianceReportGenerator";
import ComplianceAnalyticsDashboard from "./ComplianceAnalyticsDashboard";
import OSFIGovernanceOversight from "./OSFIGovernanceOversight";
import OperationalRiskTaxonomy from "./OperationalRiskTaxonomy";
import OSFIRealTimeMonitoring from "./OSFIRealTimeMonitoring";
import OSFIRegulatorySelfAssessment from "./OSFIRegulatorySelfAssessment";
import EnhancedRiskAppetite from "./EnhancedRiskAppetite";
import OSFICriticalOperations from "./OSFICriticalOperations";
import OSFIRegulatoryReporting from "./OSFIRegulatoryReporting";
import OSFIDisruptionTolerances from "./OSFIDisruptionTolerances";
import OSFIComprehensiveScenarioTesting from "./OSFIComprehensiveScenarioTesting";
import { BarChart3, FileText, Shield, Target, Activity, CheckSquare, TrendingUp, Building2, Send, Gauge, Play } from "lucide-react";

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
        <TabsList className="grid w-full grid-cols-11">
          <TabsTrigger value="governance" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Governance
          </TabsTrigger>
          <TabsTrigger value="risk-appetite" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Risk Appetite
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
          <TabsTrigger value="tolerances" className="flex items-center gap-2">
            <Gauge className="h-4 w-4" />
            Tolerances
          </TabsTrigger>
          <TabsTrigger value="scenarios" className="flex items-center gap-2">
            <Play className="h-4 w-4" />
            Scenarios
          </TabsTrigger>
          <TabsTrigger value="operations" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Operations
          </TabsTrigger>
          <TabsTrigger value="regulatory" className="flex items-center gap-2">
            <Send className="h-4 w-4" />
            Regulatory
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
          <EnhancedRiskAppetite />
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
        
        <TabsContent value="tolerances">
          <OSFIDisruptionTolerances />
        </TabsContent>
        
        <TabsContent value="scenarios">
          <OSFIComprehensiveScenarioTesting />
        </TabsContent>
        
        <TabsContent value="operations">
          <OSFICriticalOperations />
        </TabsContent>
        
        <TabsContent value="regulatory">
          <OSFIRegulatoryReporting />
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
