
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Lock, Key, Shield, AlertTriangle, CheckCircle, Settings } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { securityLoggingService } from "@/services/security/security-logging-service";

interface EncryptionPolicy {
  id: string;
  module: string;
  dataType: string;
  encryptionMethod: string;
  keyRotationDays: number;
  enabled: boolean;
  lastRotated?: string;
}

const EncryptionPolicyManager: React.FC = () => {
  const [policies, setPolicies] = useState<EncryptionPolicy[]>([
    {
      id: '1',
      module: 'incident_logs',
      dataType: 'Incident Data',
      encryptionMethod: 'AES-256-GCM',
      keyRotationDays: 90,
      enabled: true,
      lastRotated: '2024-01-15'
    },
    {
      id: '2',
      module: 'governance_policies',
      dataType: 'Policy Documents',
      encryptionMethod: 'AES-256-GCM',
      keyRotationDays: 180,
      enabled: true,
      lastRotated: '2024-02-01'
    },
    {
      id: '3',
      module: 'audit_uploads',
      dataType: 'Audit Files',
      encryptionMethod: 'AES-256-GCM',
      keyRotationDays: 60,
      enabled: false
    },
    {
      id: '4',
      module: 'third_party_profiles',
      dataType: 'Vendor Data',
      encryptionMethod: 'ChaCha20-Poly1305',
      keyRotationDays: 120,
      enabled: true,
      lastRotated: '2024-01-20'
    }
  ]);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const toggleEncryption = async (policyId: string, enabled: boolean) => {
    setSaving(true);
    try {
      const policy = policies.find(p => p.id === policyId);
      if (!policy) return;

      setPolicies(prev => prev.map(p => 
        p.id === policyId ? { ...p, enabled } : p
      ));

      await securityLoggingService.logSecurityAction(
        enabled ? 'encryption_enabled' : 'encryption_disabled',
        'encryption_policy',
        {
          resourceId: policyId,
          resourceName: policy.dataType,
          actionDetails: { 
            module: policy.module,
            encryption_method: policy.encryptionMethod,
            enabled 
          },
          riskScore: enabled ? 2 : 6
        }
      );

      toast({
        title: enabled ? "Encryption Enabled" : "Encryption Disabled",
        description: `${policy.dataType} encryption has been ${enabled ? 'enabled' : 'disabled'}`
      });
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Failed to update encryption policy",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const updateEncryptionMethod = async (policyId: string, method: string) => {
    setSaving(true);
    try {
      const policy = policies.find(p => p.id === policyId);
      if (!policy) return;

      setPolicies(prev => prev.map(p => 
        p.id === policyId ? { ...p, encryptionMethod: method } : p
      ));

      await securityLoggingService.logSecurityAction(
        'encryption_method_updated',
        'encryption_policy',
        {
          resourceId: policyId,
          resourceName: policy.dataType,
          actionDetails: { 
            old_method: policy.encryptionMethod,
            new_method: method,
            module: policy.module
          },
          riskScore: 3
        }
      );

      toast({
        title: "Encryption Method Updated",
        description: `${policy.dataType} now uses ${method} encryption`
      });
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Failed to update encryption method",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const rotateKeys = async (policyId: string) => {
    setSaving(true);
    try {
      const policy = policies.find(p => p.id === policyId);
      if (!policy) return;

      setPolicies(prev => prev.map(p => 
        p.id === policyId ? { ...p, lastRotated: new Date().toISOString().split('T')[0] } : p
      ));

      await securityLoggingService.logSecurityAction(
        'encryption_key_rotated',
        'encryption_policy',
        {
          resourceId: policyId,
          resourceName: policy.dataType,
          actionDetails: { 
            module: policy.module,
            encryption_method: policy.encryptionMethod
          },
          riskScore: 2
        }
      );

      toast({
        title: "Keys Rotated",
        description: `Encryption keys for ${policy.dataType} have been rotated`
      });
    } catch (error) {
      toast({
        title: "Rotation Failed",
        description: "Failed to rotate encryption keys",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const getEncryptionStatus = (policy: EncryptionPolicy) => {
    if (!policy.enabled) {
      return <Badge variant="destructive">Disabled</Badge>;
    }
    
    if (policy.lastRotated) {
      const daysSinceRotation = Math.floor(
        (new Date().getTime() - new Date(policy.lastRotated).getTime()) / (1000 * 60 * 60 * 24)
      );
      
      if (daysSinceRotation > policy.keyRotationDays) {
        return <Badge variant="secondary">Rotation Due</Badge>;
      }
    }
    
    return <Badge variant="default">Active</Badge>;
  };

  const getDaysUntilRotation = (policy: EncryptionPolicy) => {
    if (!policy.lastRotated) return null;
    
    const daysSinceRotation = Math.floor(
      (new Date().getTime() - new Date(policy.lastRotated).getTime()) / (1000 * 60 * 60 * 24)
    );
    
    return policy.keyRotationDays - daysSinceRotation;
  };

  return (
    <div className="space-y-6">
      {/* Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Encryption Policy Manager
          </CardTitle>
          <CardDescription>
            Configure encryption settings for sensitive data across your organization
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              This is a frontend simulation for demonstration purposes. In a production environment, 
              encryption policies would be managed through secure backend processes.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Encryption Policies */}
      <Card>
        <CardHeader>
          <CardTitle>Data Encryption Policies</CardTitle>
          <CardDescription>
            Manage encryption settings for different data types
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data Type</TableHead>
                <TableHead>Module</TableHead>
                <TableHead>Encryption Method</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Key Rotation</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {policies.map((policy) => (
                <TableRow key={policy.id}>
                  <TableCell>
                    <div className="font-medium">{policy.dataType}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{policy.module}</Badge>
                  </TableCell>
                  <TableCell>
                    <Select
                      value={policy.encryptionMethod}
                      onValueChange={(value) => updateEncryptionMethod(policy.id, value)}
                      disabled={!policy.enabled || saving}
                    >
                      <SelectTrigger className="w-48">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="AES-256-GCM">AES-256-GCM</SelectItem>
                        <SelectItem value="AES-256-CBC">AES-256-CBC</SelectItem>
                        <SelectItem value="ChaCha20-Poly1305">ChaCha20-Poly1305</SelectItem>
                        <SelectItem value="AES-128-GCM">AES-128-GCM</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    {getEncryptionStatus(policy)}
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="text-sm">
                        Every {policy.keyRotationDays} days
                      </div>
                      {policy.lastRotated && (
                        <div className="text-xs text-muted-foreground">
                          Last: {new Date(policy.lastRotated).toLocaleDateString()}
                          {(() => {
                            const days = getDaysUntilRotation(policy);
                            return days !== null && (
                              <div className={days < 0 ? "text-red-500" : ""}>
                                {days < 0 ? `${Math.abs(days)} days overdue` : `${days} days remaining`}
                              </div>
                            );
                          })()}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={policy.enabled}
                        onCheckedChange={(checked) => toggleEncryption(policy.id, checked)}
                        disabled={saving}
                      />
                      {policy.enabled && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => rotateKeys(policy.id)}
                          disabled={saving}
                        >
                          <Key className="h-3 w-3 mr-1" />
                          Rotate
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Global Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Global Encryption Settings
          </CardTitle>
          <CardDescription>
            Organization-wide encryption configuration
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Encrypt data at rest</Label>
              <p className="text-sm text-muted-foreground">
                Enable encryption for all stored data
              </p>
            </div>
            <Switch defaultChecked disabled />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Encrypt data in transit</Label>
              <p className="text-sm text-muted-foreground">
                Force HTTPS/TLS for all communications
              </p>
            </div>
            <Switch defaultChecked disabled />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Hardware Security Module (HSM)</Label>
              <p className="text-sm text-muted-foreground">
                Use HSM for key management and storage
              </p>
            </div>
            <Switch disabled />
          </div>

          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Changes to global encryption settings require system maintenance and may cause temporary downtime.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
};

export default EncryptionPolicyManager;
