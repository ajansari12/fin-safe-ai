
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Building2, 
  Database, 
  FileText, 
  Users, 
  Settings, 
  Activity,
  Shield,
  Zap,
  RefreshCw
} from "lucide-react";
import AuthenticatedLayout from "@/components/layout/AuthenticatedLayout";
import IntegrationDashboard from "@/components/integrations/IntegrationDashboard";
import SystemConnectorSetup from "@/components/integrations/SystemConnectorSetup";
import DataSyncManager from "@/components/integrations/DataSyncManager";
import IntegrationsList from "@/components/integrations/IntegrationsList";
import ApiKeyManager from "@/components/integrations/ApiKeyManager";
import EnhancedWebhookManager from "@/components/integrations/EnhancedWebhookManager";

const IntegrationFramework: React.FC = () => {
  const [activeTab, setActiveTab] = useState("dashboard");

  return (
    <AuthenticatedLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Integration Framework</h1>
            <p className="text-muted-foreground">
              Comprehensive integration platform for financial institution systems
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="flex items-center gap-1">
              <Shield className="h-3 w-3" />
              Secure
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1">
              <Zap className="h-3 w-3" />
              Real-time
            </Badge>
          </div>
        </div>

        {/* Feature Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Building2 className="h-8 w-8 text-blue-500" />
                <div>
                  <h3 className="font-semibold">Core Banking</h3>
                  <p className="text-sm text-muted-foreground">
                    Temenos, FIS, Jack Henry
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Database className="h-8 w-8 text-green-500" />
                <div>
                  <h3 className="font-semibold">ERP Systems</h3>
                  <p className="text-sm text-muted-foreground">
                    SAP, Oracle, Dynamics
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <FileText className="h-8 w-8 text-purple-500" />
                <div>
                  <h3 className="font-semibold">Document Mgmt</h3>
                  <p className="text-sm text-muted-foreground">
                    SharePoint, Documentum
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Users className="h-8 w-8 text-orange-500" />
                <div>
                  <h3 className="font-semibold">HR Systems</h3>
                  <p className="text-sm text-muted-foreground">
                    Workday, SuccessFactors
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="connectors" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Connectors
            </TabsTrigger>
            <TabsTrigger value="sync" className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              Data Sync
            </TabsTrigger>
            <TabsTrigger value="integrations" className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Integrations
            </TabsTrigger>
            <TabsTrigger value="api" className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              API & Keys
            </TabsTrigger>
            <TabsTrigger value="webhooks" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Webhooks
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
            <IntegrationDashboard />
          </TabsContent>

          <TabsContent value="connectors">
            <SystemConnectorSetup />
          </TabsContent>

          <TabsContent value="sync">
            <DataSyncManager />
          </TabsContent>

          <TabsContent value="integrations">
            <IntegrationsList onEditIntegration={(id) => console.log('Edit integration:', id)} />
          </TabsContent>

          <TabsContent value="api">
            <ApiKeyManager />
          </TabsContent>

          <TabsContent value="webhooks">
            <EnhancedWebhookManager />
          </TabsContent>
        </Tabs>
      </div>
    </AuthenticatedLayout>
  );
};

export default IntegrationFramework;
