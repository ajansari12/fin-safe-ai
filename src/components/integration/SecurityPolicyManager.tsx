import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { Shield, Lock, Eye, AlertTriangle, CheckCircle } from 'lucide-react';
import { SystemConnector } from '@/services/integration/integration-framework';

interface SecurityPolicyManagerProps {
  org_id: string;
  connectors: SystemConnector[];
}

const SecurityPolicyManager: React.FC<SecurityPolicyManagerProps> = ({ 
  org_id, 
  connectors 
}) => {
  const [securitySettings, setSecuritySettings] = useState({
    encryptionEnabled: true,
    auditLogging: true,
    accessControlEnabled: true,
    dataClassificationRequired: true,
    tokenRotationEnabled: false,
    ipWhitelisting: false,
    rateLimitingEnabled: true,
    tlsVersion: '1.3'
  });

  const [whitelistedIPs, setWhitelistedIPs] = useState<string[]>([
    '192.168.1.0/24',
    '10.0.0.0/8'
  ]);

  const [newIP, setNewIP] = useState('');
  const { toast } = useToast();

  const updateSecuritySetting = (key: string, value: boolean) => {
    setSecuritySettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const addIPAddress = () => {
    if (newIP && !whitelistedIPs.includes(newIP)) {
      setWhitelistedIPs(prev => [...prev, newIP]);
      setNewIP('');
    }
  };

  const removeIPAddress = (ip: string) => {
    setWhitelistedIPs(prev => prev.filter(i => i !== ip));
  };

  const saveSecurityPolicy = async () => {
    try {
      // Here you would save the security policy
      toast({
        title: "Success",
        description: "Security policy updated successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update security policy",
        variant: "destructive",
      });
    }
  };

  const securityScore = Object.values(securitySettings).filter(Boolean).length * 10;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Security Policy Management</h3>
        <p className="text-sm text-muted-foreground">Configure security policies for external system integrations</p>
      </div>

      {/* Security Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Security Score</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{securityScore}%</div>
            <p className="text-xs text-muted-foreground">
              overall security rating
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Protected Connectors</CardTitle>
            <Lock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{connectors.length}</div>
            <p className="text-xs text-muted-foreground">
              total secure connections
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Audit Events</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,234</div>
            <p className="text-xs text-muted-foreground">
              logged this month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Security Status Alert */}
      <Alert>
        <CheckCircle className="h-4 w-4" />
        <AlertDescription>
          Your integration security policies are properly configured and actively protecting your systems.
        </AlertDescription>
      </Alert>

      {/* Security Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Security Settings</CardTitle>
          <CardDescription>Configure security policies for all external integrations</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Encryption in Transit</Label>
                  <p className="text-sm text-muted-foreground">
                    Encrypt all data during transmission
                  </p>
                </div>
                <Switch
                  checked={securitySettings.encryptionEnabled}
                  onCheckedChange={(checked) => updateSecuritySetting('encryptionEnabled', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Audit Logging</Label>
                  <p className="text-sm text-muted-foreground">
                    Log all integration activities
                  </p>
                </div>
                <Switch
                  checked={securitySettings.auditLogging}
                  onCheckedChange={(checked) => updateSecuritySetting('auditLogging', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Access Control</Label>
                  <p className="text-sm text-muted-foreground">
                    Role-based access restrictions
                  </p>
                </div>
                <Switch
                  checked={securitySettings.accessControlEnabled}
                  onCheckedChange={(checked) => updateSecuritySetting('accessControlEnabled', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Data Classification</Label>
                  <p className="text-sm text-muted-foreground">
                    Require data sensitivity classification
                  </p>
                </div>
                <Switch
                  checked={securitySettings.dataClassificationRequired}
                  onCheckedChange={(checked) => updateSecuritySetting('dataClassificationRequired', checked)}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Token Rotation</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatic credential rotation
                  </p>
                </div>
                <Switch
                  checked={securitySettings.tokenRotationEnabled}
                  onCheckedChange={(checked) => updateSecuritySetting('tokenRotationEnabled', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>IP Whitelisting</Label>
                  <p className="text-sm text-muted-foreground">
                    Restrict access by IP address
                  </p>
                </div>
                <Switch
                  checked={securitySettings.ipWhitelisting}
                  onCheckedChange={(checked) => updateSecuritySetting('ipWhitelisting', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Rate Limiting</Label>
                  <p className="text-sm text-muted-foreground">
                    Limit request frequency
                  </p>
                </div>
                <Switch
                  checked={securitySettings.rateLimitingEnabled}
                  onCheckedChange={(checked) => updateSecuritySetting('rateLimitingEnabled', checked)}
                />
              </div>

              <div className="space-y-2">
                <Label>TLS Version</Label>
                <Input value={securitySettings.tlsVersion} readOnly />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* IP Whitelisting Configuration */}
      {securitySettings.ipWhitelisting && (
        <Card>
          <CardHeader>
            <CardTitle>IP Whitelist Configuration</CardTitle>
            <CardDescription>Manage allowed IP addresses and ranges</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                value={newIP}
                onChange={(e) => setNewIP(e.target.value)}
                placeholder="192.168.1.0/24 or 203.0.113.1"
              />
              <Button onClick={addIPAddress}>Add IP</Button>
            </div>

            <div className="space-y-2">
              <Label>Whitelisted IP Addresses</Label>
              <div className="flex flex-wrap gap-2">
                {whitelistedIPs.map((ip) => (
                  <Badge key={ip} variant="secondary" className="gap-1">
                    {ip}
                    <button
                      onClick={() => removeIPAddress(ip)}
                      className="ml-1 text-xs hover:text-destructive"
                    >
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Security Compliance */}
      <Card>
        <CardHeader>
          <CardTitle>Compliance Status</CardTitle>
          <CardDescription>Current compliance with security standards</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span>SOC 2 Type II</span>
              <Badge variant="default" className="gap-1">
                <CheckCircle className="h-3 w-3" />
                Compliant
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>ISO 27001</span>
              <Badge variant="default" className="gap-1">
                <CheckCircle className="h-3 w-3" />
                Compliant
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>GDPR</span>
              <Badge variant="default" className="gap-1">
                <CheckCircle className="h-3 w-3" />
                Compliant
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>PCI DSS</span>
              <Badge variant="secondary" className="gap-1">
                <AlertTriangle className="h-3 w-3" />
                Review Required
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={saveSecurityPolicy} className="gap-2">
          <Shield className="h-4 w-4" />
          Update Security Policy
        </Button>
      </div>
    </div>
  );
};

export default SecurityPolicyManager;