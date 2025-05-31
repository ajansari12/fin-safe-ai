
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Settings, Database, Key, Shield, ToggleLeft, Clock, FileText, Lock, Eye } from "lucide-react";
import UserManagement from "./UserManagement";
import OrganizationSettings from "./OrganizationSettings";
import DataRetentionManager from "./DataRetentionManager";
import IntegrationManager from "./IntegrationManager";
import RoleManagementMatrix from "./RoleManagementMatrix";
import ModuleToggleManager from "./ModuleToggleManager";
import DataRetentionSettings from "./DataRetentionSettings";
import AdminAuditLog from "./AdminAuditLog";
import SecuritySettings from "../security/SecuritySettings";
import SecurityAuditLog from "../security/SecurityAuditLog";
import EncryptionPolicyManager from "../security/EncryptionPolicyManager";

const AdminInterface: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Panel</h1>
        <p className="text-muted-foreground">
          Comprehensive administration tools for managing users, roles, modules, security, and organizational settings
        </p>
      </div>

      <Tabs defaultValue="users" className="w-full">
        <TabsList className="grid w-full grid-cols-10">
          <TabsTrigger value="users" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Users
          </TabsTrigger>
          <TabsTrigger value="roles" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Roles
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Key className="h-4 w-4" />
            Security
          </TabsTrigger>
          <TabsTrigger value="encryption" className="flex items-center gap-2">
            <Lock className="h-4 w-4" />
            Encryption
          </TabsTrigger>
          <TabsTrigger value="security-audit" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Security Log
          </TabsTrigger>
          <TabsTrigger value="modules" className="flex items-center gap-2">
            <ToggleLeft className="h-4 w-4" />
            Modules
          </TabsTrigger>
          <TabsTrigger value="retention" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Data Retention
          </TabsTrigger>
          <TabsTrigger value="audit" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Audit Log
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Settings
          </TabsTrigger>
          <TabsTrigger value="integrations" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Integrations
          </TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-6">
          <UserManagement />
        </TabsContent>

        <TabsContent value="roles" className="space-y-6">
          <RoleManagementMatrix />
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <SecuritySettings />
        </TabsContent>

        <TabsContent value="encryption" className="space-y-6">
          <EncryptionPolicyManager />
        </TabsContent>

        <TabsContent value="security-audit" className="space-y-6">
          <SecurityAuditLog />
        </TabsContent>

        <TabsContent value="modules" className="space-y-6">
          <ModuleToggleManager />
        </TabsContent>

        <TabsContent value="retention" className="space-y-6">
          <DataRetentionSettings />
        </TabsContent>

        <TabsContent value="audit" className="space-y-6">
          <AdminAuditLog />
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <OrganizationSettings />
        </TabsContent>

        <TabsContent value="integrations" className="space-y-6">
          <DataRetentionManager />
          <IntegrationManager />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminInterface;
