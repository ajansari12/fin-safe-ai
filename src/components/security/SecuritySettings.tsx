
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Shield, Clock, Key, AlertTriangle, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { authSettingsService, AuthSettings } from "@/services/security/auth-settings-service";
import { securityLoggingService } from "@/services/security/security-logging-service";
import MFASetup from "./MFASetup";

const SecuritySettings: React.FC = () => {
  const [settings, setSettings] = useState<AuthSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showMFASetup, setShowMFASetup] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const data = await authSettingsService.getAuthSettings();
      setSettings(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load security settings",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (updates: Partial<AuthSettings>) => {
    setSaving(true);
    try {
      await authSettingsService.updateAuthSettings(updates);
      await securityLoggingService.logSecurityAction(
        'security_settings_updated',
        'auth_settings',
        { 
          actionDetails: updates,
          riskScore: 3
        }
      );
      setSettings(prev => prev ? { ...prev, ...updates } : null);
      toast({
        title: "Settings Updated",
        description: "Security settings have been saved successfully"
      });
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Failed to update security settings",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const toggleMFAEnforcement = async (enabled: boolean) => {
    try {
      await authSettingsService.enforceMFA(enabled);
      await securityLoggingService.logSecurityAction(
        enabled ? 'mfa_enforcement_enabled' : 'mfa_enforcement_disabled',
        'auth_settings',
        { 
          actionDetails: { mfa_enforced: enabled },
          riskScore: enabled ? 2 : 5
        }
      );
      setSettings(prev => prev ? { 
        ...prev, 
        mfa_enforced: enabled,
        mfa_enforcement_date: enabled ? new Date().toISOString() : undefined
      } : null);
      toast({
        title: enabled ? "MFA Enforced" : "MFA Enforcement Disabled",
        description: enabled 
          ? "All users must now use multi-factor authentication"
          : "MFA enforcement has been disabled"
      });
    } catch (error) {
      toast({
        title: "Update Failed",
        description: "Failed to update MFA enforcement",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return <div className="animate-pulse">Loading security settings...</div>;
  }

  return (
    <div className="space-y-6">
      {/* MFA Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Multi-Factor Authentication
          </CardTitle>
          <CardDescription>
            Configure MFA requirements for your organization
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <Label>Enforce MFA for all users</Label>
              <p className="text-sm text-muted-foreground">
                Require all organization members to use MFA
              </p>
            </div>
            <Switch
              checked={settings?.mfa_enforced || false}
              onCheckedChange={toggleMFAEnforcement}
              disabled={saving}
            />
          </div>
          
          {settings?.mfa_enforced && settings.mfa_enforcement_date && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                MFA enforcement was enabled on {new Date(settings.mfa_enforcement_date).toLocaleDateString()}
              </AlertDescription>
            </Alert>
          )}

          <div className="pt-4">
            <Button 
              variant="outline" 
              onClick={() => setShowMFASetup(!showMFASetup)}
            >
              {showMFASetup ? "Hide" : "Setup"} Personal MFA
            </Button>
          </div>

          {showMFASetup && (
            <div className="pt-4">
              <MFASetup />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Session Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Session Management
          </CardTitle>
          <CardDescription>
            Configure session timeouts and security policies
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="timeout">Session Timeout (minutes)</Label>
            <Input
              id="timeout"
              type="number"
              value={settings?.session_timeout_minutes || 480}
              onChange={(e) => updateSettings({ session_timeout_minutes: parseInt(e.target.value) })}
              min="5"
              max="1440"
            />
            <p className="text-sm text-muted-foreground">
              Users will be automatically logged out after this period of inactivity
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Password Policy */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Password Policy
          </CardTitle>
          <CardDescription>
            Set password requirements for your organization
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="minLength">Minimum Length</Label>
            <Input
              id="minLength"
              type="number"
              value={settings?.password_policy?.min_length || 8}
              onChange={(e) => updateSettings({
                password_policy: {
                  ...settings?.password_policy,
                  min_length: parseInt(e.target.value)
                }
              })}
              min="6"
              max="32"
            />
          </div>

          <div className="space-y-3">
            <Label>Requirements</Label>
            <div className="space-y-2">
              {[
                { key: 'require_uppercase', label: 'Require uppercase letters' },
                { key: 'require_numbers', label: 'Require numbers' },
                { key: 'require_symbols', label: 'Require special characters' }
              ].map(({ key, label }) => (
                <div key={key} className="flex items-center space-x-2">
                  <Switch
                    checked={Boolean(settings?.password_policy?.[key as keyof typeof settings.password_policy])}
                    onCheckedChange={(checked) => updateSettings({
                      password_policy: {
                        ...settings?.password_policy,
                        [key]: checked
                      }
                    })}
                  />
                  <Label>{label}</Label>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* IP Whitelist */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            IP Access Control
          </CardTitle>
          <CardDescription>
            Restrict access to specific IP addresses (optional)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="ipWhitelist">Allowed IP Addresses</Label>
            <Textarea
              id="ipWhitelist"
              placeholder="192.168.1.1&#10;10.0.0.0/24&#10;203.0.113.0/24"
              value={settings?.ip_whitelist?.join('\n') || ''}
              onChange={(e) => updateSettings({
                ip_whitelist: e.target.value.split('\n').filter(ip => ip.trim())
              })}
              rows={4}
            />
            <p className="text-sm text-muted-foreground">
              Enter one IP address or CIDR block per line. Leave empty to allow all IPs.
            </p>
          </div>

          {settings?.ip_whitelist && settings.ip_whitelist.length > 0 && (
            <div className="space-y-2">
              <Label>Current Whitelist</Label>
              <div className="flex flex-wrap gap-2">
                {settings.ip_whitelist.map((ip, index) => (
                  <Badge key={index} variant="secondary">{ip}</Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SecuritySettings;
