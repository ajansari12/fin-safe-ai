
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ComplianceReportGenerator from "./ComplianceReportGenerator";
import ComplianceAnalyticsDashboard from "./ComplianceAnalyticsDashboard";
import { BarChart3, FileText } from "lucide-react";

export default function ComplianceDashboard() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Compliance Dashboard</h2>
        <p className="text-muted-foreground">
          Monitor compliance metrics, generate reports, and track policy reviews.
        </p>
      </div>

      <Tabs defaultValue="analytics" className="space-y-6">
        <TabsList>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Reports
          </TabsTrigger>
        </TabsList>
        
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
