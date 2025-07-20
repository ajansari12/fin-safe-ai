
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus, FileText, Settings, Calendar, Bot } from "lucide-react";
import RegulatoryReportingDashboard from "@/components/regulatory-reporting/RegulatoryReportingDashboard";
import AutomatedReportingDashboard from "@/components/regulatory-reporting/AutomatedReportingDashboard";
import PDFReportGenerator from "@/components/reporting/PDFReportGenerator";

const Reporting: React.FC = () => {
  return (
    <Tabs defaultValue="regulatory" className="space-y-6">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="regulatory" className="flex items-center gap-2">
          <FileText className="h-4 w-4" />
          Regulatory Reporting
        </TabsTrigger>
        <TabsTrigger value="automated" className="flex items-center gap-2">
          <Bot className="h-4 w-4" />
          Automated Reporting
        </TabsTrigger>
        <TabsTrigger value="pdf-reports" className="flex items-center gap-2">
          <Settings className="h-4 w-4" />
          PDF Reports
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="regulatory">
        <RegulatoryReportingDashboard />
      </TabsContent>
      
      <TabsContent value="automated">
        <AutomatedReportingDashboard />
      </TabsContent>
      
      <TabsContent value="pdf-reports">
        <PDFReportGenerator />
      </TabsContent>
    </Tabs>
  );
};

export default Reporting;
