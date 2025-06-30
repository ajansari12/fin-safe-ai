
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus, FileText, Settings, Calendar } from "lucide-react";
import RegulatoryReportingDashboard from "@/components/regulatory-reporting/RegulatoryReportingDashboard";

const Reporting: React.FC = () => {
  return <RegulatoryReportingDashboard />;
};

export default Reporting;
