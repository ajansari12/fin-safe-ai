
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus, FileText, Settings, Calendar } from "lucide-react";
import ReportTemplatesList from "@/components/reporting/ReportTemplatesList";
import ReportInstancesList from "@/components/reporting/ReportInstancesList";
import ReportBuilder from "@/components/reporting/ReportBuilder";
import ReportScheduler from "@/components/reporting/ReportScheduler";

const Reporting: React.FC = () => {
  const [activeTab, setActiveTab] = useState("templates");
  const [showBuilder, setShowBuilder] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);

  const handleCreateReport = () => {
    setSelectedTemplateId(null);
    setShowBuilder(true);
  };

  const handleEditTemplate = (templateId: string) => {
    setSelectedTemplateId(templateId);
    setShowBuilder(true);
  };

  const handleCloseBuilder = () => {
    setShowBuilder(false);
    setSelectedTemplateId(null);
  };

  if (showBuilder) {
    return (
      <ReportBuilder
        templateId={selectedTemplateId}
        onClose={handleCloseBuilder}
      />
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Reporting</h1>
          <p className="text-muted-foreground">
            Create, manage, and schedule comprehensive reports across all modules
          </p>
        </div>
        <Button onClick={handleCreateReport}>
          <Plus className="h-4 w-4 mr-2" />
          Create Report
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="templates" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Templates
          </TabsTrigger>
          <TabsTrigger value="instances" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Reports
          </TabsTrigger>
          <TabsTrigger value="scheduler" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Scheduler
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="space-y-6">
          <ReportTemplatesList onEditTemplate={handleEditTemplate} />
        </TabsContent>

        <TabsContent value="instances" className="space-y-6">
          <ReportInstancesList />
        </TabsContent>

        <TabsContent value="scheduler" className="space-y-6">
          <ReportScheduler />
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Report Settings</CardTitle>
              <CardDescription>
                Configure global settings for report generation and delivery
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Settings configuration coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Reporting;
