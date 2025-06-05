
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus, Key, Webhook, Settings, FileText } from "lucide-react";
import IntegrationsList from "@/components/integrations/IntegrationsList";
import ApiKeyManager from "@/components/integrations/ApiKeyManager";
import EnhancedWebhookManager from "@/components/integrations/EnhancedWebhookManager";
import ConnectorSettings from "@/components/integrations/ConnectorSettings";
import IntegrationAuditLogs from "@/components/integrations/IntegrationAuditLogs";
import IntegrationForm from "@/components/integrations/IntegrationForm";
import AuthenticatedLayout from "@/components/layout/AuthenticatedLayout";

const Integrations: React.FC = () => {
  const [activeTab, setActiveTab] = useState("integrations");
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
              Manage external integrations, API keys, webhooks, and connector settings
            </p>
          </div>
          <Button onClick={handleCreateIntegration}>
            <Plus className="h-4 w-4 mr-2" />
            Add Integration
          </Button>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
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
