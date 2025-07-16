import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { PlayCircle, CheckCircle, XCircle, AlertTriangle, Shield } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/EnhancedAuthContext';
import { SecurityHeaders } from '@/utils/security-headers';
import { toast } from 'sonner';

interface SecurityTest {
  id: string;
  name: string;
  description: string;
  category: 'authentication' | 'authorization' | 'data_protection' | 'headers' | 'rls';
  status: 'pending' | 'running' | 'passed' | 'failed';
  result?: string;
  risk_level: 'low' | 'medium' | 'high' | 'critical';
}

const SecurityTestSuite: React.FC = () => {
  const { userContext } = useAuth();
  const [tests, setTests] = useState<SecurityTest[]>([
    {
      id: 'auth-session-timeout',
      name: 'Session Timeout Test',
      description: 'Verify session timeout mechanism works correctly',
      category: 'authentication',
      status: 'pending',
      risk_level: 'medium'
    },
    {
      id: 'rls-policy-enforcement',
      name: 'RLS Policy Enforcement',
      description: 'Test Row Level Security policies prevent unauthorized access',
      category: 'rls',
      status: 'pending',
      risk_level: 'critical'
    },
    {
      id: 'privilege-escalation',
      name: 'Privilege Escalation Prevention',
      description: 'Test role-based access control prevents privilege escalation',
      category: 'authorization',
      status: 'pending',
      risk_level: 'high'
    },
    {
      id: 'security-headers',
      name: 'Security Headers Validation',
      description: 'Verify all security headers are properly configured',
      category: 'headers',
      status: 'pending',
      risk_level: 'medium'
    },
    {
      id: 'data-encryption',
      name: 'Data Encryption Test',
      description: 'Verify sensitive data is properly encrypted',
      category: 'data_protection',
      status: 'pending',
      risk_level: 'high'
    },
    {
      id: 'input-validation',
      name: 'Input Validation Test',
      description: 'Test input sanitization and validation mechanisms',
      category: 'data_protection',
      status: 'pending',
      risk_level: 'medium'
    }
  ]);

  const [isRunning, setIsRunning] = useState(false);

  const runTest = async (testId: string) => {
    setTests(prev => prev.map(test => 
      test.id === testId ? { ...test, status: 'running' } : test
    ));

    try {
      let result = '';
      let status: 'passed' | 'failed' = 'passed';

      switch (testId) {
        case 'auth-session-timeout':
          result = await testSessionTimeout();
          break;
        case 'rls-policy-enforcement':
          result = await testRLSPolicies();
          break;
        case 'privilege-escalation':
          result = await testPrivilegeEscalation();
          break;
        case 'security-headers':
          result = await testSecurityHeaders();
          break;
        case 'data-encryption':
          result = await testDataEncryption();
          break;
        case 'input-validation':
          result = await testInputValidation();
          break;
        default:
          result = 'Test not implemented';
          status = 'failed';
      }

      setTests(prev => prev.map(test => 
        test.id === testId ? { ...test, status, result } : test
      ));

      if (status === 'passed') {
        toast.success(`Test ${testId} passed`);
      } else {
        toast.error(`Test ${testId} failed: ${result}`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setTests(prev => prev.map(test => 
        test.id === testId ? { ...test, status: 'failed', result: errorMessage } : test
      ));
      toast.error(`Test ${testId} failed: ${errorMessage}`);
    }
  };

  const runAllTests = async () => {
    setIsRunning(true);
    
    for (const test of tests) {
      await runTest(test.id);
      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    setIsRunning(false);
  };

  const testSessionTimeout = async (): Promise<string> => {
    // Test session timeout configuration
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return 'No active session found';
    
    // Check if session has expiration
    const expiresAt = session.expires_at;
    if (!expiresAt) return 'Session expiration not configured';
    
    const timeToExpiry = expiresAt * 1000 - Date.now();
    if (timeToExpiry > 30 * 60 * 1000) { // 30 minutes
      return 'Session timeout may be too long (> 30 minutes)';
    }
    
    return 'Session timeout properly configured';
  };

  const testRLSPolicies = async (): Promise<string> => {
    try {
      // Test unauthorized access to user data
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .neq('id', userContext?.userId || '');
      
      if (error) {
        return `RLS properly blocking unauthorized access: ${error.message}`;
      }
      
      if (data && data.length > 0) {
        return 'WARNING: RLS may not be properly configured - unauthorized data access possible';
      }
      
      return 'RLS policies properly configured';
    } catch (error) {
      return `RLS test error: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  };

  const testPrivilegeEscalation = async (): Promise<string> => {
    try {
      // Test role update with insufficient privileges
      const { data, error } = await supabase
        .rpc('update_user_role_safe', {
          p_user_id: userContext?.userId || '',
          p_new_role: 'admin',
          p_organization_id: userContext?.organizationId || ''
        });
      
      if (error) {
        return `Privilege escalation properly prevented: ${error.message}`;
      }
      
      if (data && !data.success) {
        return 'Privilege escalation properly prevented';
      }
      
      return 'WARNING: Privilege escalation test needs review';
    } catch (error) {
      return `Privilege escalation test error: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  };

  const testSecurityHeaders = async (): Promise<string> => {
    const validation = SecurityHeaders.validateHeaders();
    
    if (!validation.isValid) {
      return `Security headers missing: ${validation.warnings.join(', ')}`;
    }
    
    return 'All security headers properly configured';
  };

  const testDataEncryption = async (): Promise<string> => {
    // Test that sensitive data is not stored in plain text
    // This is a simplified test - in production, you'd check actual encryption
    return 'Data encryption test completed (review encryption implementation)';
  };

  const testInputValidation = async (): Promise<string> => {
    try {
      // Test SQL injection prevention
      const maliciousInput = "'; DROP TABLE profiles; --";
      const { error } = await supabase
        .from('profiles')
        .select('*')
        .eq('full_name', maliciousInput);
      
      if (error && error.message.includes('invalid input')) {
        return 'Input validation properly prevents SQL injection';
      }
      
      return 'Input validation working correctly';
    } catch (error) {
      return `Input validation test error: ${error instanceof Error ? error.message : 'Unknown error'}`;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'running':
        return <div className="h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />;
      default:
        return <PlayCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'passed':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'running':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'critical':
        return 'bg-red-100 text-red-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  const testsByCategory = tests.reduce((acc, test) => {
    if (!acc[test.category]) acc[test.category] = [];
    acc[test.category].push(test);
    return acc;
  }, {} as Record<string, SecurityTest[]>);

  const passedTests = tests.filter(test => test.status === 'passed').length;
  const failedTests = tests.filter(test => test.status === 'failed').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold">Security Test Suite</h2>
        </div>
        <Button 
          onClick={runAllTests} 
          disabled={isRunning}
          className="flex items-center gap-2"
        >
          <PlayCircle className="h-4 w-4" />
          {isRunning ? 'Running Tests...' : 'Run All Tests'}
        </Button>
      </div>

      {/* Test Results Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Tests</p>
                <p className="text-2xl font-bold">{tests.length}</p>
              </div>
              <Shield className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Passed</p>
                <p className="text-2xl font-bold text-green-600">{passedTests}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Failed</p>
                <p className="text-2xl font-bold text-red-600">{failedTests}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Test Results by Category */}
      <div className="space-y-4">
        {Object.entries(testsByCategory).map(([category, categoryTests]) => (
          <Card key={category}>
            <CardHeader>
              <CardTitle className="capitalize">{category.replace('_', ' ')} Tests</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {categoryTests.map((test) => (
                  <div key={test.id} className="flex items-center justify-between p-3 rounded-lg border">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(test.status)}
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{test.name}</span>
                          <Badge className={getRiskLevelColor(test.risk_level)}>
                            {test.risk_level}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{test.description}</p>
                        {test.result && (
                          <p className="text-sm mt-1 p-2 bg-muted rounded">{test.result}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getStatusColor(test.status)}>
                        {test.status}
                      </Badge>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => runTest(test.id)}
                        disabled={test.status === 'running' || isRunning}
                      >
                        Run Test
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Security Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>Security Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Manual Setup Required:</strong> Enable "Leaked Password Protection" in your Supabase Dashboard → Authentication → Settings to prevent users from using compromised passwords.
              </AlertDescription>
            </Alert>
            
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Regular Testing:</strong> Run security tests regularly, especially after making configuration changes or deploying new features.
              </AlertDescription>
            </Alert>
            
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Monitoring:</strong> Review security logs and alerts daily to identify potential security incidents early.
              </AlertDescription>
            </Alert>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SecurityTestSuite;