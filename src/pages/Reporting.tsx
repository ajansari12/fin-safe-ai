
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus, FileText, Settings, Calendar } from "lucide-react";
import RegulatoryReportingDashboard from "@/components/regulatory-reporting/RegulatoryReportingDashboard";
import PDFReportGenerator from "@/components/reporting/PDFReportGenerator";

const Reporting: React.FC = () => {
  return (
    <Tabs defaultValue="regulatory" className="space-y-6">
      <TabsList>
        <TabsTrigger value="regulatory">Regulatory Reporting</TabsTrigger>
        <TabsTrigger value="pdf-reports">PDF Reports</TabsTrigger>
      </TabsList>
      
      <TabsContent value="regulatory">
        <RegulatoryReportingDashboard />
      </TabsContent>
      
      <TabsContent value="pdf-reports">
        <PDFReportGenerator />
      </TabsContent>
    </Tabs>
  );
};

export default Reporting;
