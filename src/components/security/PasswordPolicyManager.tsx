import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Lock, Shield, Save, AlertTriangle } from 'lucide-react';
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/EnhancedAuthContext";
import { toast } from "sonner";

interface PasswordPolicy {
  id?: string;
  org_id: string;
  min_length: number;
  require_uppercase: boolean;
  require_lowercase: boolean;
  require_numbers: boolean;
  require_symbols: boolean;
  prevent_common_passwords: boolean;
  prevent_compromised_passwords: boolean;
  password_history_count: number;
  max_age_days: number | null;
  lockout_threshold: number;
  lockout_duration_minutes: number;
}

export const PasswordPolicyManager: React.FC = () => {
  const { userContext } = useAuth();
  const [policy, setPolicy] = useState<PasswordPolicy>({
    org_id: '',
    min_length: 12,
    require_uppercase: true,
    require_lowercase: true,
    require_numbers: true,
    require_symbols: true,
    prevent_common_passwords: true,
    prevent_compromised_passwords: true,
    password_history_count: 5,
    max_age_days: 90,
    lockout_threshold: 5,
    lockout_duration_minutes: 30
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!userContext?.organizationId) return;
    
    loadPasswordPolicy();
  }, [userContext?.organizationId]);

  const loadPasswordPolicy = async () => {
    try {
      const { data: existingPolicy, error } = await supabase
        .from('password_policies')
        .select('*')
        .eq('org_id', userContext?.organizationId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (existingPolicy) {
        setPolicy(existingPolicy);
      } else {
        // Set default policy with organization ID
        setPolicy(prev => ({
          ...prev,
          org_id: userContext?.organizationId || ''
        }));
      }
    } catch (error) {
      console.error('Error loading password policy:', error);
      toast.error('Failed to load password policy');
    } finally {
      setLoading(false);
    }
  };

  const savePasswordPolicy = async () => {
    if (!userContext?.organizationId) return;

    setSaving(true);
    try {
      const policyData = {
        ...policy,
        org_id: userContext.organizationId
      };

      const { error } = await supabase
        .from('password_policies')
        .upsert(policyData, {
          onConflict: 'org_id'
        });

      if (error) throw error;

      // Log the policy update
      await supabase.rpc('log_security_event', {
        p_event_type: 'password_policy_updated',
        p_event_category: 'configuration',
        p_severity: 'info',
        p_event_details: {
          policy_changes: policyData,
          updated_by: userContext.userId
        }
      });

      toast.success('Password policy updated successfully');
    } catch (error) {
      console.error('Error saving password policy:', error);
      toast.error('Failed to save password policy');
    } finally {
      setSaving(false);
    }
  };

  const updatePolicy = (field: keyof PasswordPolicy, value: any) => {
    setPolicy(prev => ({
      ...prev,
      [field]: value
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Lock className="h-6 w-6 text-primary" />
        <h2 className="text-2xl font-bold">Password Policy Configuration</h2>
      </div>

      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          Configure password requirements and security policies for your organization. 
          These settings will be enforced for all users during password creation and updates.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>Password Requirements</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="min_length">Minimum Length</Label>
              <Input
                id="min_length"
                type="number"
                min="8"
                max="128"
                value={policy.min_length}
                onChange={(e) => updatePolicy('min_length', parseInt(e.target.value))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password_history">Password History Count</Label>
              <Input
                id="password_history"
                type="number"
                min="0"
                max="24"
                value={policy.password_history_count}
                onChange={(e) => updatePolicy('password_history_count', parseInt(e.target.value))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="max_age">Maximum Age (Days)</Label>
              <Input
                id="max_age"
                type="number"
                min="0"
                max="365"
                value={policy.max_age_days || ''}
                onChange={(e) => updatePolicy('max_age_days', e.target.value ? parseInt(e.target.value) : null)}
                placeholder="Leave empty for no expiration"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lockout_threshold">Lockout Threshold</Label>
              <Input
                id="lockout_threshold"
                type="number"
                min="1"
                max="20"
                value={policy.lockout_threshold}
                onChange={(e) => updatePolicy('lockout_threshold', parseInt(e.target.value))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lockout_duration">Lockout Duration (Minutes)</Label>
              <Input
                id="lockout_duration"
                type="number"
                min="1"
                max="1440"
                value={policy.lockout_duration_minutes}
                onChange={(e) => updatePolicy('lockout_duration_minutes', parseInt(e.target.value))}
              />
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Character Requirements</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="require_uppercase"
                  checked={policy.require_uppercase}
                  onCheckedChange={(checked) => updatePolicy('require_uppercase', checked)}
                />
                <Label htmlFor="require_uppercase">Require Uppercase Letters</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="require_lowercase"
                  checked={policy.require_lowercase}
                  onCheckedChange={(checked) => updatePolicy('require_lowercase', checked)}
                />
                <Label htmlFor="require_lowercase">Require Lowercase Letters</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="require_numbers"
                  checked={policy.require_numbers}
                  onCheckedChange={(checked) => updatePolicy('require_numbers', checked)}
                />
                <Label htmlFor="require_numbers">Require Numbers</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="require_symbols"
                  checked={policy.require_symbols}
                  onCheckedChange={(checked) => updatePolicy('require_symbols', checked)}
                />
                <Label htmlFor="require_symbols">Require Symbols</Label>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Security Features</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="prevent_common"
                  checked={policy.prevent_common_passwords}
                  onCheckedChange={(checked) => updatePolicy('prevent_common_passwords', checked)}
                />
                <Label htmlFor="prevent_common">Prevent Common Passwords</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="prevent_compromised"
                  checked={policy.prevent_compromised_passwords}
                  onCheckedChange={(checked) => updatePolicy('prevent_compromised_passwords', checked)}
                />
                <Label htmlFor="prevent_compromised">Prevent Compromised Passwords</Label>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t">
            <Button onClick={savePasswordPolicy} disabled={saving} className="w-full md:w-auto">
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Password Policy
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};