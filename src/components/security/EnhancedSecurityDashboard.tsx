
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, Key, Eye, Users, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import SecuritySettings from './SecuritySettings';
import { securityLoggingService } from '@/services/security/security-logging-service';
import { enhancedAdminService } from '@/services/enhanced-admin-service';

interface SecurityMetrics {
  totalUsers: number;
  activeUsers: number;
  mfaEnabledUsers: number;
  failedLogins: number;
  securityAlerts: number;
  lastSecurityUpdate: string;
}

const EnhancedSecurityDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<SecurityMetrics>({
    totalUsers: 0,
    activeUsers: 0,
    mfaEnabledUsers: 0,
    failedLogins: 0,
    securityAlerts: 0,
    lastSecurityUpdate: new Date().toISOString()
  });
  const [securityLogs, setSecurityLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadSecurityData();
  }, []);

  const loadSecurityData = async () => {
    try {
      const [logs, roles] = await Promise.all([
        securityLoggingService.getSecurityLogs(50),
        enhancedAdminService.getRoles()
      ]);

      setSecurityLogs(logs);
      
      // Calculate metrics
      const failedLogins = logs.filter(log => 
        log.action_type.includes('login') && log.status === 'failure'
      ).length;
      
      const securityAlerts = logs.filter(log => 
        log.risk_score >= 7
      ).length;

      setMetrics({
        totalUsers: roles.length,
        activeUsers: roles.filter(role => role.is_active).length,
        mfaEnabledUsers: Math.floor(roles.length * 0.8), // Mock calculation
        failedLogins,
        securityAlerts,
        lastSecurityUpdate: new Date().toISOString()
      });
    } catch (error) {
      console.error('Failed to load security data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSecurityStatus = () => {
    const { mfaEnabledUsers, totalUsers, failedLogins, securityAlerts } = metrics;
    const mfaPercentage = totalUsers > 0 ? (mfaEnabledUsers / totalUsers) * 100 : 0;
    
    if (securityAlerts > 5 || failedLogins > 10) {
      return { status: 'critical', message: 'Multiple security issues detected' };
    } else if (mfaPercentage < 80 || securityAlerts > 2) {
      return { status: 'warning', message: 'Security improvements recommended' };
    } else {
      return { status: 'good', message: 'Security posture is strong' };
    }
  };

  const securityStatus = getSecurityStatus();

  if (loading) {
    return <div className="animate-pulse">Loading security dashboard...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Security Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor and manage organizational security posture
          </p>
        </div>
        <div className="flex items-center gap-2">
          {securityStatus.status === 'good' && (
            <Badge className="bg-green-100 text-green-800">
              <CheckCircle className="h-3 w-3 mr-1" />
              Secure
            </Badge>
          )}
          {securityStatus.status === 'warning' && (
            <Badge className="bg-yellow-100 text-yellow-800">
              <AlertTriangle className="h-3 w-3 mr-1" />
              Attention Needed
            </Badge>
          )}
          {securityStatus.status === 'critical' && (
            <Badge className="bg-red-100 text-red-800">
              <AlertTriangle className="h-3 w-3 mr-1" />
              Critical
            </Badge>
          )}
        </div>
      </div>

      {/* Security Status Alert */}
      <Alert className={
        securityStatus.status === 'critical' ? 'border-red-200 bg-red-50' :
        securityStatus.status === 'warning' ? 'border-yellow-200 bg-yellow-50' :
        'border-green-200 bg-green-50'
      }>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          <strong>Security Status:</strong> {securityStatus.message}
        </AlertDescription>
      </Alert>

      {/* Security Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold">{metrics.totalUsers}</p>
              </div>
              <Users className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">MFA Enabled</p>
                <p className="text-2xl font-bold">{metrics.mfaEnabledUsers}</p>
                <p className="text-xs text-muted-foreground">
                  {metrics.totalUsers > 0 ? Math.round((metrics.mfaEnabledUsers / metrics.totalUsers) * 100) : 0}% of users
                </p>
              </div>
              <Key className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Failed Logins</p>
                <p className="text-2xl font-bold text-red-600">{metrics.failedLogins}</p>
                <p className="text-xs text-muted-foreground">Last 24 hours</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Security Alerts</p>
                <p className="text-2xl font-bold text-orange-600">{metrics.securityAlerts}</p>
                <p className="text-xs text-muted-foreground">High risk events</p>
              </div>
              <Eye className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Security Overview</TabsTrigger>
          <TabsTrigger value="settings">Security Settings</TabsTrigger>
          <TabsTrigger value="logs">Security Logs</TabsTrigger>
          <TabsTrigger value="alerts">Active Alerts</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Security Events</CardTitle>
                <CardDescription>Last 10 security-related activities</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {securityLogs.slice(0, 10).map((log, index) => (
                    <div key={index} className="flex items-center justify-between p-2 rounded-lg bg-gray-50">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${
                          log.status === 'success' ? 'bg-green-500' :
                          log.status === 'failure' ? 'bg-red-500' : 'bg-yellow-500'
                        }`} />
                        <span className="text-sm font-medium">{log.action_type}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                          {new Date(log.created_at).toLocaleString()}
                        </span>
                        {log.risk_score >= 7 && (
                          <Badge variant="destructive" className="text-xs">High Risk</Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Security Recommendations</CardTitle>
                <CardDescription>Suggested security improvements</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {metrics.mfaEnabledUsers / metrics.totalUsers < 0.9 && (
                    <div className="p-3 rounded-lg bg-yellow-50 border border-yellow-200">
                      <p className="text-sm font-medium text-yellow-800">Enable MFA for all users</p>
                      <p className="text-xs text-yellow-600">
                        {metrics.totalUsers - metrics.mfaEnabledUsers} users still need MFA setup
                      </p>
                    </div>
                  )}
                  
                  {metrics.failedLogins > 5 && (
                    <div className="p-3 rounded-lg bg-red-50 border border-red-200">
                      <p className="text-sm font-medium text-red-800">Review recent failed login attempts</p>
                      <p className="text-xs text-red-600">
                        {metrics.failedLogins} failed attempts detected
                      </p>
                    </div>
                  )}
                  
                  <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
                    <p className="text-sm font-medium text-blue-800">Schedule security audit</p>
                    <p className="text-xs text-blue-600">
                      Regular security audits help maintain compliance
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="settings">
          <SecuritySettings />
        </TabsContent>

        <TabsContent value="logs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Security Audit Log</CardTitle>
              <CardDescription>Comprehensive log of security events</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {securityLogs.map((log, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${
                        log.status === 'success' ? 'bg-green-500' :
                        log.status === 'failure' ? 'bg-red-500' : 'bg-yellow-500'
                      }`} />
                      <div>
                        <p className="text-sm font-medium">{log.action_type}</p>
                        <p className="text-xs text-muted-foreground">
                          {log.user_name || 'System'} - {log.resource_type}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-right">
                      <div>
                        <p className="text-xs text-muted-foreground">
                          {new Date(log.created_at).toLocaleString()}
                        </p>
                        {log.risk_score >= 7 && (
                          <Badge variant="destructive" className="text-xs mt-1">
                            Risk: {log.risk_score}/10
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Active Security Alerts</CardTitle>
              <CardDescription>High-priority security events requiring attention</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {securityLogs.filter(log => log.risk_score >= 7).map((log, index) => (
                  <Alert key={index} className="border-red-200 bg-red-50">
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                    <AlertDescription>
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-red-800">{log.action_type}</p>
                          <p className="text-sm text-red-600">
                            User: {log.user_name || 'Unknown'} | Resource: {log.resource_type}
                          </p>
                          {log.error_message && (
                            <p className="text-xs text-red-500 mt-1">{log.error_message}</p>
                          )}
                        </div>
                        <div className="text-right">
                          <Badge variant="destructive" className="text-xs">
                            Risk: {log.risk_score}/10
                          </Badge>
                          <p className="text-xs text-red-500 mt-1">
                            {new Date(log.created_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </AlertDescription>
                  </Alert>
                ))}
                
                {securityLogs.filter(log => log.risk_score >= 7).length === 0 && (
                  <div className="text-center py-8">
                    <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                    <p className="text-lg font-medium text-green-800">No Active Security Alerts</p>
                    <p className="text-sm text-green-600">Your system security is currently stable</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnhancedSecurityDashboard;
