
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Settings, Database, Key } from "lucide-react";
import UserManagement from "./UserManagement";
import OrganizationSettings from "./OrganizationSettings";
import DataRetentionManager from "./DataRetentionManager";
import IntegrationManager from "./IntegrationManager";

const AdminInterface: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Panel</h1>
        <p className="text-muted-foreground">
          Manage users, organization settings, data policies, and integrations
        </p>
      </div>

      <Tabs defaultValue="users" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Users & Roles
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Org Settings
          </TabsTrigger>
          <TabsTrigger value="retention" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Data Retention
          </TabsTrigger>
          <TabsTrigger value="integrations" className="flex items-center gap-2">
            <Key className="h-4 w-4" />
            Integrations
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-6">
          <UserManagement />
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <OrganizationSettings />
        </TabsContent>

        <TabsContent value="retention" className="space-y-6">
          <DataRetentionManager />
        </TabsContent>

        <TabsContent value="integrations" className="space-y-6">
          <IntegrationManager />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminInterface;
