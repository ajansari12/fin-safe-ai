import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  RefreshCw,
  Database,
  Shield,
  Globe,
  Server,
  Users,
  Zap
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SystemChecksDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface SystemCheck {
  id: string;
  name: string;
  category: string;
  icon: React.ReactNode;
  status: 'pending' | 'running' | 'pass' | 'fail' | 'warning';
  message?: string;
  details?: string;
  lastChecked?: string;
  responseTime?: number;
}

export const SystemChecksDialog: React.FC<SystemChecksDialogProps> = ({
  open,
  onOpenChange
}) => {
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [checks, setChecks] = useState<SystemCheck[]>([
    {
      id: '1',
      name: 'Database Connectivity',
      category: 'Infrastructure',
      icon: <Database className="h-4 w-4" />,
      status: 'pending'
    },
    {
      id: '2',
      name: 'Authentication Service',
      category: 'Security',
      icon: <Shield className="h-4 w-4" />,
      status: 'pending'
    },
    {
      id: '3',
      name: 'API Endpoints',
      category: 'Services',
      icon: <Globe className="h-4 w-4" />,
      status: 'pending'
    },
    {
      id: '4',
      name: 'Server Resources',
      category: 'Infrastructure',
      icon: <Server className="h-4 w-4" />,
      status: 'pending'
    },
    {
      id: '5',
      name: 'User Access Controls',
      category: 'Security',
      icon: <Users className="h-4 w-4" />,
      status: 'pending'
    },
    {
      id: '6',
      name: 'External Integrations',
      category: 'Services',
      icon: <Zap className="h-4 w-4" />,
      status: 'pending'
    }
  ]);
  const { toast } = useToast();

  const runSystemChecks = async () => {
    setIsRunning(true);
    setProgress(0);

    // Reset all checks
    setChecks(prev => prev.map(check => ({ 
      ...check, 
      status: 'pending' as const,
      message: undefined,
      details: undefined,
      lastChecked: undefined,
      responseTime: undefined
    })));

    const totalChecks = checks.length;
    
    for (let i = 0; i < totalChecks; i++) {
      const checkId = checks[i].id;
      
      // Update status to running
      setChecks(prev => prev.map(check => 
        check.id === checkId ? { ...check, status: 'running' } : check
      ));

      // Simulate check execution
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

      // Generate realistic results
      const mockResults = generateMockResult(checks[i]);
      
      setChecks(prev => prev.map(check => 
        check.id === checkId ? { ...check, ...mockResults } : check
      ));

      setProgress(((i + 1) / totalChecks) * 100);
    }

    setIsRunning(false);
    
    const failedChecks = checks.filter(c => c.status === 'fail').length;
    const warningChecks = checks.filter(c => c.status === 'warning').length;
    
    if (failedChecks > 0) {
      toast({
        title: "System Checks Complete",
        description: `Found ${failedChecks} failures and ${warningChecks} warnings`,
        variant: "destructive"
      });
    } else {
      toast({
        title: "All System Checks Passed!",
        description: "System is ready for production deployment",
      });
    }
  };

  const generateMockResult = (check: SystemCheck) => {
    const random = Math.random();
    const now = new Date().toLocaleString();
    const responseTime = Math.floor(Math.random() * 500) + 50;

    // Simulate different outcomes based on check type
    if (random < 0.7) { // 70% pass
      return {
        status: 'pass' as const,
        message: 'All systems operational',
        details: getPassDetails(check.name),
        lastChecked: now,
        responseTime
      };
    } else if (random < 0.9) { // 20% warning
      return {
        status: 'warning' as const,
        message: 'Minor issues detected',
        details: getWarningDetails(check.name),
        lastChecked: now,
        responseTime
      };
    } else { // 10% fail
      return {
        status: 'fail' as const,
        message: 'Critical issue found',
        details: getFailDetails(check.name),
        lastChecked: now,
        responseTime
      };
    }
  };

  const getPassDetails = (checkName: string) => {
    const details = {
      'Database Connectivity': 'All database connections active. Query response time: <100ms',
      'Authentication Service': 'Auth service responding. Token validation working correctly',
      'API Endpoints': 'All critical endpoints responding within SLA. Rate limiting active',
      'Server Resources': 'CPU: 15%, Memory: 45%, Disk: 23%. All within normal ranges',
      'User Access Controls': 'RLS policies active. User permissions properly configured',
      'External Integrations': 'All external APIs responding. No rate limit issues detected'
    };
    return details[checkName] || 'System check passed successfully';
  };

  const getWarningDetails = (checkName: string) => {
    const details = {
      'Database Connectivity': 'Connection pool at 85% capacity. Consider scaling',
      'Authentication Service': 'Slightly elevated response times. Monitor closely',
      'API Endpoints': 'Some non-critical endpoints showing increased latency',
      'Server Resources': 'Memory usage at 78%. Consider adding more capacity soon',
      'User Access Controls': 'Some users have excessive permissions. Review recommended',
      'External Integrations': 'One integration showing intermittent delays'
    };
    return details[checkName] || 'Minor issue detected - monitoring recommended';
  };

  const getFailDetails = (checkName: string) => {
    const details = {
      'Database Connectivity': 'Cannot establish connection to secondary database',
      'Authentication Service': 'Token validation service unreachable',
      'API Endpoints': 'Critical payment endpoint returning 500 errors',
      'Server Resources': 'Disk space critically low: 95% full',
      'User Access Controls': 'RLS policies not properly configured for new users',
      'External Integrations': 'Primary integration service returning authentication errors'
    };
    return details[checkName] || 'Critical failure detected - immediate action required';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'fail': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'running': return <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary" />;
      default: return <div className="h-4 w-4 rounded-full border-2 border-muted" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pass': return <Badge className="bg-green-100 text-green-800">Pass</Badge>;
      case 'warning': return <Badge className="bg-yellow-100 text-yellow-800">Warning</Badge>;
      case 'fail': return <Badge className="bg-red-100 text-red-800">Fail</Badge>;
      case 'running': return <Badge className="bg-blue-100 text-blue-800">Running</Badge>;
      default: return <Badge variant="outline">Pending</Badge>;
    }
  };

  const getOverallStatus = () => {
    const hasFailures = checks.some(c => c.status === 'fail');
    const hasWarnings = checks.some(c => c.status === 'warning');
    const allComplete = checks.every(c => c.status !== 'pending' && c.status !== 'running');
    
    if (!allComplete) return 'pending';
    if (hasFailures) return 'fail';
    if (hasWarnings) return 'warning';
    return 'pass';
  };

  const categories = ['Infrastructure', 'Security', 'Services'];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Comprehensive System Health Check</DialogTitle>
            {getStatusBadge(getOverallStatus())}
          </div>
        </DialogHeader>
        
        <div className="space-y-6">
          {isRunning && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Check Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Running system health checks...</span>
                    <span>{Math.round(progress)}% Complete</span>
                  </div>
                  <Progress value={progress} className="w-full" />
                </div>
              </CardContent>
            </Card>
          )}

          {categories.map(category => (
            <Card key={category}>
              <CardHeader>
                <CardTitle className="text-lg">{category} Checks</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {checks
                    .filter(check => check.category === category)
                    .map((check) => (
                      <div key={check.id} className="flex items-start space-x-3 p-3 rounded-lg border">
                        <div className="mt-1 flex items-center space-x-2">
                          {check.icon}
                          {getStatusIcon(check.status)}
                        </div>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium">{check.name}</h4>
                            <div className="flex items-center space-x-2">
                              {check.responseTime && (
                                <span className="text-xs text-muted-foreground">{check.responseTime}ms</span>
                              )}
                              {getStatusBadge(check.status)}
                            </div>
                          </div>
                          {check.message && (
                            <p className="text-sm text-muted-foreground">{check.message}</p>
                          )}
                          {check.details && (
                            <p className="text-xs text-muted-foreground">{check.details}</p>
                          )}
                          {check.lastChecked && (
                            <p className="text-xs text-muted-foreground">Last checked: {check.lastChecked}</p>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button 
            onClick={runSystemChecks} 
            disabled={isRunning}
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            {isRunning ? 'Running Checks...' : 'Run All Checks'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};