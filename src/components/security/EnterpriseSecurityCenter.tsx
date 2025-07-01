
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { 
  Shield, 
  Key, 
  Eye, 
  Users, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  Lock,
  Activity,
  Settings
} from "lucide-react";
import { enhancedMFAService, MFASettings } from "@/services/security/enhanced-mfa-service";
import { sessionManagementService, UserSession, SessionPolicy } from "@/services/security/session-management-service";
import { passwordSecurityService, PasswordPolicy } from "@/services/security/password-security-service";
import { enhancedAuditService } from "@/services/security/enhanced-audit-service";
import { dataEncryptionService, EncryptionKey } from "@/services/security/data-encryption-service";
import { useToast } from "@/hooks/use-toast";

const EnterpriseSecurityCenter: React.FC = () => {
  const [mfaSettings, setMfaSettings] = useState<MFASettings | null>(null);
  const [sessions, setSessions] = useState<UserSession[]>([]);
  const [sessionPolicy, setSessionPolicy] = useState<SessionPolicy | null>(null);
  const [passwordPolicy, setPasswordPolicy] = useState<PasswordPolicy | null>(null);
  const [encryptionKeys, setEncryptionKeys] = useState<EncryptionKey[]>([]);
  const [auditStats, setAuditStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadSecurityData();
  }, []);

  const loadSecurityData = async () => {
    try {
      setLoading(true);
      const [
        mfaData,
        sessionsData,
        auditData,
        keysData
      ] = await Promise.all([
        enhancedMFAService.getMFASettings(),
        sessionManagementService.getUserSessions(),
        enhancedAuditService.getAuditStatistics(30),
        dataEncryptionService.listEncryptionKeys()
      ]);

      setMfaSettings(mfaData);
      setSessions(sessionsData);
      setAuditStats(auditData);
      setEncryptionKeys(keysData);

      // Load policies if available
      if (mfaData?.org_id) {
        const [sessionPol, passwordPol] = await Promise.all([
          sessionManagementService.getSessionPolicy(mfaData.org_id),
          passwordSecurityService.getPasswordPolicy(mfaData.org_id)
        ]);
        setSessionPolicy(sessionPol);
        setPasswordPolicy(passwordPol);
      }
    } catch (error) {
      console.error('Error loading security data:', error);
      toast({
        title: "Error",
        description: "Failed to load security data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTerminateSession = async (sessionId: string) => {
    try {
      const session = sessions.find(s => s.id === sessionId);
      if (session) {
        await sessionManagementService.terminateSession(session.session_token);
        await loadSecurityData();
        toast({
          title: "Success",
          description: "Session terminated successfully"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to terminate session",
        variant: "destructive"
      });
    }
  };

  const getSecurityScore = (): number => {
    let score = 0;
    if (mfaSettings?.mfa_enabled) score += 25;
    if (passwordPolicy?.min_length >= 12) score += 20;
    if (sessionPolicy?.idle_timeout_minutes <= 30) score += 15;
    if (encryptionKeys.length > 0) score += 20;
    if (auditStats?.totalEvents > 0) score += 20;
    return Math.min(100, score);
  };

  const getSecurityStatus = (score: number): { text: string; color: string } => {
    if (score >= 80) return { text: "Excellent", color: "text-green-600" };
    if (score >= 60) return { text: "Good", color: "text-yellow-600" };
    if (score >= 40) return { text: "Needs Improvement", color: "text-orange-600" };
    return { text: "Critical", color: "text-red-600" };
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-6 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const securityScore = getSecurityScore();
  const securityStatus = getSecurityStatus(securityScore);

  return (
    <div className="space-y-6">
      {/* Security Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Security Score</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{securityScore}%</div>
            <p className={`text-xs ${securityStatus.color}`}>
              {securityStatus.text}
            </p>
            <Progress value={securityScore} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sessions.length}</div>
            <p className="text-xs text-muted-foreground">
              Current user sessions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Security Events</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{auditStats?.totalEvents || 0}</div>
            <p className="text-xs text-muted-foreground">
              Last 30 days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Encryption Keys</CardTitle>
            <Key className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{encryptionKeys.length}</div>
            <p className="text-xs text-muted-foreground">
              Active encryption keys
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Security Alerts */}
      {securityScore < 60 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Your security configuration needs attention. Consider enabling MFA, 
            strengthening password policies, and configuring session timeouts.
          </AlertDescription>
        </Alert>
      )}

      {/* Main Security Tabs */}
      <Tabs defaultValue="mfa" className="space-y-6">
        <TabsList>
          <TabsTrigger value="mfa">Multi-Factor Auth</TabsTrigger>
          <TabsTrigger value="sessions">Session Management</TabsTrigger>
          <TabsTrigger value="passwords">Password Security</TabsTrigger>
          <TabsTrigger value="audit">Audit Logs</TabsTrigger>
          <TabsTrigger value="encryption">Data Encryption</TabsTrigger>
        </TabsList>

        <TabsContent value="mfa" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Multi-Factor Authentication
              </CardTitle>
              <CardDescription>
                Enhance account security with additional authentication factors
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">MFA Status</p>
                  <p className="text-sm text-muted-foreground">
                    {mfaSettings?.mfa_enabled ? 'Enabled' : 'Disabled'}
                  </p>
                </div>
                <Badge variant={mfaSettings?.mfa_enabled ? 'default' : 'destructive'}>
                  {mfaSettings?.mfa_enabled ? (
                    <><CheckCircle className="w-3 h-3 mr-1" /> Enabled</>
                  ) : (
                    <><AlertTriangle className="w-3 h-3 mr-1" /> Disabled</>
                  )}
                </Badge>
              </div>

              {mfaSettings?.mfa_enabled && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">TOTP Authenticator</span>
                    <Badge variant={mfaSettings.totp_enabled ? 'default' : 'outline'}>
                      {mfaSettings.totp_enabled ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">SMS Authentication</span>
                    <Badge variant={mfaSettings.sms_enabled ? 'default' : 'outline'}>
                      {mfaSettings.sms_enabled ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Email Authentication</span>
                    <Badge variant={mfaSettings.email_enabled ? 'default' : 'outline'}>
                      {mfaSettings.email_enabled ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <Button 
                  onClick={() => window.location.href = '/security/EnterpriseSecurityCenter'}
                  variant="outline"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Configure MFA
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sessions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Active Sessions
              </CardTitle>
              <CardDescription>
                Manage your active login sessions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sessions.map((session) => (
                  <div key={session.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <p className="font-medium">
                        {session.user_agent?.includes('Chrome') ? '🌐 Chrome' : 
                         session.user_agent?.includes('Firefox') ? '🦊 Firefox' : 
                         session.user_agent?.includes('Safari') ? '🧭 Safari' : '💻 Browser'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        IP: {session.ip_address || 'Unknown'} • 
                        Last active: {new Date(session.last_activity_at).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">Active</Badge>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleTerminateSession(session.id)}
                      >
                        Terminate
                      </Button>
                    </div>
                  </div>
                ))}
                {sessions.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No active sessions found
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {sessionPolicy && (
            <Card>
              <CardHeader>
                <CardTitle>Session Policy</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm">Idle Timeout:</span>
                  <span className="font-medium">{sessionPolicy.idle_timeout_minutes} minutes</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Absolute Timeout:</span>
                  <span className="font-medium">{sessionPolicy.absolute_timeout_minutes} minutes</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Max Concurrent Sessions:</span>
                  <span className="font-medium">{sessionPolicy.max_concurrent_sessions}</span>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="passwords" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Password Security
              </CardTitle>
              <CardDescription>
                Current password policy and security settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              {passwordPolicy ? (
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm">Minimum Length:</span>
                    <span className="font-medium">{passwordPolicy.min_length} characters</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Password Expiry:</span>
                    <span className="font-medium">{passwordPolicy.password_expiry_days} days</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">History Check:</span>
                    <span className="font-medium">Last {passwordPolicy.prevent_password_reuse} passwords</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Lockout Threshold:</span>
                    <span className="font-medium">{passwordPolicy.max_failed_attempts} attempts</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div className="flex items-center gap-2">
                      {passwordPolicy.require_uppercase ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-gray-400" />
                      )}
                      <span className="text-sm">Uppercase Required</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {passwordPolicy.require_numbers ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-gray-400" />
                      )}
                      <span className="text-sm">Numbers Required</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {passwordPolicy.require_symbols ? (
                        <CheckCircle className="w-4 h-4 text-green-500" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-gray-400" />
                      )}
                      <span className="text-sm">Symbols Required</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No password policy configured
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="audit" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Security Audit Overview
              </CardTitle>
              <CardDescription>
                Security events and audit trail summary
              </CardDescription>
            </CardHeader>
            <CardContent>
              {auditStats ? (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Total Events (30 days)</p>
                    <p className="text-2xl font-bold">{auditStats.totalEvents}</p>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">High Risk Events</p>
                    <p className="text-2xl font-bold text-red-600">{auditStats.highRiskEvents}</p>
                  </div>
                  <div className="col-span-2 space-y-2">
                    <p className="text-sm text-muted-foreground">Events by Category</p>
                    <div className="space-y-1">
                      {Object.entries(auditStats.eventsByCategory || {}).map(([category, count]) => (
                        <div key={category} className="flex justify-between">
                          <span className="text-sm capitalize">{category.replace('_', ' ')}</span>
                          <span className="font-medium">{count as React.ReactNode}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No audit data available
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="encryption" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                Data Encryption
              </CardTitle>
              <CardDescription>
                Encryption keys and data protection status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {encryptionKeys.map((key) => (
                  <div key={key.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">{key.key_name}</p>
                      <p className="text-sm text-muted-foreground">
                        Purpose: {key.key_purpose} • Version: {key.key_version}
                      </p>
                    </div>
                    <Badge variant={key.is_active ? 'default' : 'outline'}>
                      {key.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                ))}
                {encryptionKeys.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No encryption keys configured
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end">
        <Button onClick={loadSecurityData} variant="outline">
          Refresh Data
        </Button>
      </div>
    </div>
  );
};

export default EnterpriseSecurityCenter;
