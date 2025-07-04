
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus, Key, Webhook, Settings, FileText, Zap, Database, Building } from "lucide-react";
import IntegrationsList from "@/components/integrations/IntegrationsList";
import ApiKeyManager from "@/components/integrations/ApiKeyManager";
import EnhancedWebhookManager from "@/components/integrations/EnhancedWebhookManager";
import ConnectorSettings from "@/components/integrations/ConnectorSettings";
import IntegrationAuditLogs from "@/components/integrations/IntegrationAuditLogs";
import IntegrationForm from "@/components/integrations/IntegrationForm";
import IntegrationDashboard from "@/components/integrations/IntegrationDashboard";
import CoreBankingConnector from "@/components/integrations/CoreBankingConnector";
import ERPConnector from "@/components/integrations/ERPConnector";
import AuthenticatedLayout from "@/components/layout/AuthenticatedLayout";

const Integrations: React.FC = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [showIntegrationForm, setShowIntegrationForm] = useState(false);
  const [selectedIntegrationId, setSelectedIntegrationId] = useState<string | null>(null);

  const handleCreateIntegration = () => {
    setSelectedIntegrationId(null);
    setShowIntegrationForm(true);
  };

  const handleEditIntegration = (integrationId: string) => {
    setSelectedIntegrationId(integrationId);
    setShowIntegrationForm(true);
  };

  const handleCloseForm = () => {
    setShowIntegrationForm(false);
    setSelectedIntegrationId(null);
  };

  if (showIntegrationForm) {
    return (
      <AuthenticatedLayout>
        <IntegrationForm
          integrationId={selectedIntegrationId}
          onClose={handleCloseForm}
        />
      </AuthenticatedLayout>
    );
  }

  return (
    <AuthenticatedLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Integrations</h1>
            <p className="text-muted-foreground">
              Comprehensive integration framework for financial institution systems
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleCreateIntegration}>
              <Plus className="h-4 w-4 mr-2" />
              Add Integration
            </Button>
            <Button variant="outline" onClick={() => window.open('/integration-framework', '_blank')}>
              <Zap className="h-4 w-4 mr-2" />
              Full Framework
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-8">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="core-banking" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              Core Banking
            </TabsTrigger>
            <TabsTrigger value="erp" className="flex items-center gap-2">
              <Building className="h-4 w-4" />
              ERP
            </TabsTrigger>
            <TabsTrigger value="integrations" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Integrations
            </TabsTrigger>
            <TabsTrigger value="api-keys" className="flex items-center gap-2">
              <Key className="h-4 w-4" />
              API Keys
            </TabsTrigger>
            <TabsTrigger value="webhooks" className="flex items-center gap-2">
              <Webhook className="h-4 w-4" />
              Webhooks
            </TabsTrigger>
            <TabsTrigger value="connectors" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Connectors
            </TabsTrigger>
            <TabsTrigger value="audit-logs" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Audit Logs
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <IntegrationDashboard />
          </TabsContent>

          <TabsContent value="core-banking" className="space-y-6">
            <CoreBankingConnector />
          </TabsContent>

          <TabsContent value="erp" className="space-y-6">
            <ERPConnector />
          </TabsContent>

          <TabsContent value="integrations" className="space-y-6">
            <IntegrationsList onEditIntegration={handleEditIntegration} />
          </TabsContent>

          <TabsContent value="api-keys" className="space-y-6">
            <ApiKeyManager />
          </TabsContent>

          <TabsContent value="webhooks" className="space-y-6">
            <EnhancedWebhookManager />
          </TabsContent>

          <TabsContent value="connectors" className="space-y-6">
            <ConnectorSettings />
          </TabsContent>

          <TabsContent value="audit-logs" className="space-y-6">
            <IntegrationAuditLogs />
          </TabsContent>
        </Tabs>
      </div>
    </AuthenticatedLayout>
  );
};

export default Integrations;
