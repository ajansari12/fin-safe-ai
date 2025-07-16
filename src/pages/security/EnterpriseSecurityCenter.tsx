
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, AlertTriangle, Users, Settings, Eye, Lock, Activity, Target } from "lucide-react";
import ZeroTrustSecurityDashboard from "../../components/security/ZeroTrustSecurityDashboard";
import EnhancedSecurityDashboard from "../../components/security/EnhancedSecurityDashboard";
import SecuritySettings from "../../components/security/SecuritySettings";
import SecurityAuditLog from "../../components/security/SecurityAuditLog";
import EncryptionPolicyManager from "../../components/security/EncryptionPolicyManager";
import SecurityTestSuite from "../../components/security/SecurityTestSuite";

const EnterpriseSecurityCenter: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Enterprise Security Center</h1>
        <p className="text-muted-foreground">
          Comprehensive zero-trust security framework with enterprise-grade protection
        </p>
      </div>

      <Tabs defaultValue="dashboard" className="w-full">
        <TabsList className="grid w-full grid-cols-9">
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="zero-trust" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Zero Trust
          </TabsTrigger>
          <TabsTrigger value="threats" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Threats
          </TabsTrigger>
          <TabsTrigger value="behavior" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Behavior
          </TabsTrigger>
          <TabsTrigger value="dlp" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Data Protection
          </TabsTrigger>
          <TabsTrigger value="encryption" className="flex items-center gap-2">
            <Lock className="h-4 w-4" />
            Encryption
          </TabsTrigger>
          <TabsTrigger value="audit" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Audit Log
          </TabsTrigger>
          <TabsTrigger value="testing" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Security Tests
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          <EnhancedSecurityDashboard />
        </TabsContent>

        <TabsContent value="zero-trust" className="space-y-6">
          <ZeroTrustSecurityDashboard />
        </TabsContent>

        <TabsContent value="threats" className="space-y-6">
          <div className="text-center py-12 text-muted-foreground">
            <AlertTriangle className="h-16 w-16 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Threat Intelligence Center</h3>
            <p>Real-time threat monitoring and automated response capabilities</p>
            <p className="text-sm mt-2">Integrated with leading threat intelligence feeds</p>
          </div>
        </TabsContent>

        <TabsContent value="behavior" className="space-y-6">
          <div className="text-center py-12 text-muted-foreground">
            <Users className="h-16 w-16 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Behavioral Analytics</h3>
            <p>Continuous user behavior monitoring and anomaly detection</p>
            <p className="text-sm mt-2">Machine learning-powered behavioral biometrics</p>
          </div>
        </TabsContent>

        <TabsContent value="dlp" className="space-y-6">
          <div className="text-center py-12 text-muted-foreground">
            <Eye className="h-16 w-16 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Data Loss Prevention</h3>
            <p>Real-time data classification and protection</p>
            <p className="text-sm mt-2">Automated policy enforcement and violation response</p>
          </div>
        </TabsContent>

        <TabsContent value="encryption" className="space-y-6">
          <EncryptionPolicyManager />
        </TabsContent>

        <TabsContent value="audit" className="space-y-6">
          <SecurityAuditLog />
        </TabsContent>

        <TabsContent value="testing" className="space-y-6">
          <SecurityTestSuite />
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <SecuritySettings />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnterpriseSecurityCenter;
