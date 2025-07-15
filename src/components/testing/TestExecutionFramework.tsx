import React, { useState, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle,
  Activity,
  Database,
  Zap,
  Shield
} from 'lucide-react';
import { toast } from 'sonner';
import { WorkflowTestSuite } from '@/services/testing/WorkflowTestSuite';
import { DatabaseIntegrityChecker } from '@/services/testing/DatabaseIntegrityChecker';
import { IntegrationValidator } from '@/services/testing/IntegrationValidator';
import { PerformanceMonitor } from '@/services/testing/PerformanceMonitor';
import { ComplianceValidator } from '@/services/testing/ComplianceValidator';
import { PDFReportTester } from '@/services/testing/PDFReportTester';
import { EdgeFunctionTester } from '@/services/testing/EdgeFunctionTester';
import { CostControlValidator } from '@/services/testing/CostControlValidator';

export interface TestResult {
  id: string;
  testName: string;
  category: 'workflow' | 'database' | 'integration' | 'performance' | 'compliance';
  status: 'pending' | 'running' | 'passed' | 'failed' | 'warning';
  startTime?: Date;
  endTime?: Date;
  duration?: number;
  details: string;
  logs: string[];
  metrics?: Record<string, any>;
  expectedOutcome: string;
  actualOutcome: string;
  errorMessage?: string;
}

export interface TestSuiteResults {
  totalTests: number;
  passedTests: number;
  failedTests: number;
  warningTests: number;
  totalDuration: number;
  overallStatus: 'idle' | 'running' | 'passed' | 'failed' | 'partial';
  startTime?: Date;
  endTime?: Date;
}

const TestExecutionFramework: React.FC = () => {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [suiteResults, setSuiteResults] = useState<TestSuiteResults>({
    totalTests: 0,
    passedTests: 0,
    failedTests: 0,
    warningTests: 0,
    totalDuration: 0,
    overallStatus: 'idle'
  });
  const [isRunning, setIsRunning] = useState(false);
  const [activeTestId, setActiveTestId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Test suite instances
  const [workflowSuite] = useState(() => new WorkflowTestSuite());
  const [databaseChecker] = useState(() => new DatabaseIntegrityChecker());
  const [integrationValidator] = useState(() => new IntegrationValidator());
  const [performanceMonitor] = useState(() => new PerformanceMonitor());
  const [complianceValidator] = useState(() => new ComplianceValidator());
  const [pdfReportTester] = useState(() => new PDFReportTester());
  const [edgeFunctionTester] = useState(() => new EdgeFunctionTester());
  const [costControlValidator] = useState(() => new CostControlValidator());

  const updateTestResult = useCallback((updatedTest: TestResult) => {
    setTestResults(prev => {
      const newResults = prev.map(test => 
        test.id === updatedTest.id ? updatedTest : test
      );
      
      // Update suite results
      const passed = newResults.filter(t => t.status === 'passed').length;
      const failed = newResults.filter(t => t.status === 'failed').length;
      const warning = newResults.filter(t => t.status === 'warning').length;
      const totalDuration = newResults
        .filter(t => t.duration)
        .reduce((sum, t) => sum + (t.duration || 0), 0);

      setSuiteResults(prev => ({
        ...prev,
        passedTests: passed,
        failedTests: failed,
        warningTests: warning,
        totalDuration,
        overallStatus: failed > 0 ? 'failed' : warning > 0 ? 'partial' : passed > 0 ? 'passed' : 'idle'
      }));

      return newResults;
    });
  }, []);

  const initializeTests = useCallback(() => {
    const initialTests: TestResult[] = [
      // Workflow Tests
      {
        id: 'auth-to-dashboard',
        testName: 'Authentication → Dashboard Navigation',
        category: 'workflow',
        status: 'pending',
        details: 'Tests complete user authentication flow and dashboard access',
        logs: [],
        expectedOutcome: 'User successfully logs in and accesses dashboard within 3 seconds',
        actualOutcome: 'Pending execution'
      },
      {
        id: 'nlp-query-ai-response',
        testName: 'NLP Query → AI Response Chain',
        category: 'workflow',
        status: 'pending',
        details: 'Tests AI query processing and response generation',
        logs: [],
        expectedOutcome: 'AI response generated within 5 seconds with confidence score > 0.7',
        actualOutcome: 'Pending execution'
      },
      {
        id: 'breach-alert-email',
        testName: 'Breach Detection → Email Alert',
        category: 'workflow',
        status: 'pending',
        details: 'Tests tolerance breach detection and email notification',
        logs: [],
        expectedOutcome: 'Email alert sent within 1 second of breach detection',
        actualOutcome: 'Pending execution'
      },
      {
        id: 'vendor-update-feed',
        testName: 'Vendor Update → Risk Feed Integration',
        category: 'workflow',
        status: 'pending',
        details: 'Tests vendor risk feed integration and alert generation',
        logs: [],
        expectedOutcome: 'Vendor risk alert generated within 2 seconds',
        actualOutcome: 'Pending execution'
      },
      // Database Tests
      {
        id: 'kri-logs-integrity',
        testName: 'KRI Logs Data Integrity',
        category: 'database',
        status: 'pending',
        details: 'Validates KRI logs table contains real data with proper relationships',
        logs: [],
        expectedOutcome: 'Real KRI data with valid foreign keys and no mock entries',
        actualOutcome: 'Pending execution'
      },
      {
        id: 'vendor-alerts-integrity',
        testName: 'Vendor Risk Alerts Integrity',
        category: 'database',
        status: 'pending',
        details: 'Validates vendor risk alerts table structure and data quality',
        logs: [],
        expectedOutcome: 'Real vendor alerts with proper risk scoring and timestamps',
        actualOutcome: 'Pending execution'
      },
      {
        id: 'cross-table-consistency',
        testName: 'Cross-Table Data Consistency',
        category: 'database',
        status: 'pending',
        details: 'Validates data consistency across related tables',
        logs: [],
        expectedOutcome: 'All foreign key relationships valid with no orphaned records',
        actualOutcome: 'Pending execution'
      },
      // Integration Tests
      {
        id: 'openai-integration',
        testName: 'OpenAI API Integration',
        category: 'integration',
        status: 'pending',
        details: 'Tests OpenAI API connectivity and response quality',
        logs: [],
        expectedOutcome: 'OpenAI API responds within 3 seconds with valid content',
        actualOutcome: 'Pending execution'
      },
      {
        id: 'supabase-realtime',
        testName: 'Supabase Realtime Connection',
        category: 'integration',
        status: 'pending',
        details: 'Tests real-time data updates and subscriptions',
        logs: [],
        expectedOutcome: 'Real-time updates received within 2 seconds',
        actualOutcome: 'Pending execution'
      },
      {
        id: 'resend-email-delivery',
        testName: 'Resend Email Delivery',
        category: 'integration',
        status: 'pending',
        details: 'Tests email delivery through Resend API',
        logs: [],
        expectedOutcome: 'Email delivered successfully within 5 seconds',
        actualOutcome: 'Pending execution'
      },
      // Performance Tests
      {
        id: 'response-time-benchmark',
        testName: 'Response Time Benchmark',
        category: 'performance',
        status: 'pending',
        details: 'Measures API response times and query performance',
        logs: [],
        expectedOutcome: 'Average response time < 2 seconds for 95% of requests',
        actualOutcome: 'Pending execution'
      },
      {
        id: 'openai-cost-control',
        testName: 'OpenAI Cost Control',
        category: 'performance',
        status: 'pending',
        details: 'Validates cost controls and rate limiting mechanisms',
        logs: [],
        expectedOutcome: 'Cost controls active with rate limiting functioning',
        actualOutcome: 'Pending execution'
      },
      // Compliance Tests
      {
        id: 'osfi-e21-compliance',
        testName: 'OSFI E-21 Compliance Verification',
        category: 'compliance',
        status: 'pending',
        details: 'Validates compliance with OSFI E-21 guidelines',
        logs: [],
        expectedOutcome: 'All OSFI E-21 requirements met with proper documentation',
        actualOutcome: 'Pending execution'
      },
      {
        id: 'rls-security-policies',
        testName: 'RLS Security Policies',
        category: 'compliance',
        status: 'pending',
        details: 'Tests Row Level Security policies and data access controls',
        logs: [],
        expectedOutcome: 'All RLS policies enforced with proper data isolation',
        actualOutcome: 'Pending execution'
      }
    ];

    setTestResults(initialTests);
    setSuiteResults(prev => ({
      ...prev,
      totalTests: initialTests.length,
      passedTests: 0,
      failedTests: 0,
      warningTests: 0,
      overallStatus: 'idle'
    }));
  }, []);

  const runSingleTest = useCallback(async (testId: string) => {
    const test = testResults.find(t => t.id === testId);
    if (!test) return;

    setActiveTestId(testId);
    const startTime = new Date();
    
    const updatedTest: TestResult = {
      ...test,
      status: 'running',
      startTime,
      logs: [`[${startTime.toISOString()}] Test started`]
    };
    updateTestResult(updatedTest);

    try {
      let result;
      
      switch (test.category) {
        case 'workflow':
          result = await workflowSuite.runTest(testId, test.testName);
          break;
        case 'database':
          result = await databaseChecker.runTest(testId, test.testName);
          break;
        case 'integration':
          result = await integrationValidator.runTest(testId, test.testName);
          break;
        case 'performance':
          result = await performanceMonitor.runTest(testId, test.testName);
          break;
        case 'compliance':
          result = await complianceValidator.runTest(testId, test.testName);
          break;
        default:
          throw new Error(`Unknown test category: ${test.category}`);
      }

      const endTime = new Date();
      const duration = endTime.getTime() - startTime.getTime();

      const finalTest: TestResult = {
        ...updatedTest,
        status: result.success ? 'passed' : result.warning ? 'warning' : 'failed',
        endTime,
        duration,
        actualOutcome: result.outcome,
        logs: [...updatedTest.logs, ...result.logs, `[${endTime.toISOString()}] Test completed`],
        metrics: result.metrics,
        errorMessage: result.error
      };

      updateTestResult(finalTest);
      
      if (result.success) {
        toast.success(`Test passed: ${test.testName}`);
      } else if (result.warning) {
        toast(`Test completed with warnings: ${test.testName}`, {
          description: result.error
        });
      } else {
        toast.error(`Test failed: ${test.testName}`);
      }

    } catch (error) {
      const endTime = new Date();
      const duration = endTime.getTime() - startTime.getTime();
      
      const failedTest: TestResult = {
        ...updatedTest,
        status: 'failed',
        endTime,
        duration,
        actualOutcome: 'Test execution failed',
        logs: [...updatedTest.logs, `[${endTime.toISOString()}] Test failed with error`],
        errorMessage: error instanceof Error ? error.message : 'Unknown error'
      };

      updateTestResult(failedTest);
      toast.error(`Test execution failed: ${test.testName}`);
    } finally {
      setActiveTestId(null);
    }
  }, [testResults, updateTestResult, workflowSuite, databaseChecker, integrationValidator, performanceMonitor, complianceValidator]);

  const runAllTests = useCallback(async () => {
    if (isRunning) return;
    
    setIsRunning(true);
    setSuiteResults(prev => ({ ...prev, overallStatus: 'running', startTime: new Date() }));
    
    toast('Starting comprehensive test suite execution...', {
      description: 'This may take several minutes to complete'
    });

    const pendingTests = testResults.filter(t => t.status === 'pending');
    
    for (const test of pendingTests) {
      if (!isRunning) break; // Allow cancellation
      await runSingleTest(test.id);
      // Small delay between tests
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    setSuiteResults(prev => ({ ...prev, endTime: new Date() }));
    setIsRunning(false);
    
    toast.success('Test suite execution completed', {
      description: 'Check results for detailed analysis'
    });
  }, [isRunning, testResults, runSingleTest]);

  const resetTests = useCallback(() => {
    setIsRunning(false);
    setActiveTestId(null);
    initializeTests();
    toast('Tests reset to initial state');
  }, [initializeTests]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passed': return <CheckCircle className="h-4 w-4 text-success" />;
      case 'failed': return <XCircle className="h-4 w-4 text-destructive" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-warning" />;
      case 'running': return <Clock className="h-4 w-4 text-primary animate-spin" />;
      default: return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'workflow': return <Activity className="h-4 w-4" />;
      case 'database': return <Database className="h-4 w-4" />;
      case 'integration': return <Zap className="h-4 w-4" />;
      case 'performance': return <Activity className="h-4 w-4" />;
      case 'compliance': return <Shield className="h-4 w-4" />;
      default: return <CheckCircle className="h-4 w-4" />;
    }
  };

  const filteredTests = selectedCategory === 'all' 
    ? testResults 
    : testResults.filter(test => test.category === selectedCategory);

  useEffect(() => {
    initializeTests();
  }, [initializeTests]);

  return (
    <div className="space-y-6">
      {/* Header with Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">End-to-End Testing Framework</CardTitle>
              <p className="text-muted-foreground mt-2">
                Comprehensive real data flow validation for Fin Safe AI
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={runAllTests}
                disabled={isRunning}
                className="flex items-center gap-2"
              >
                {isRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                {isRunning ? 'Running...' : 'Run All Tests'}
              </Button>
              <Button
                variant="outline"
                onClick={resetTests}
                disabled={isRunning}
                className="flex items-center gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                Reset
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Suite Overview */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            <div className="text-center">
              <div className="text-2xl font-bold">{suiteResults.totalTests}</div>
              <div className="text-sm text-muted-foreground">Total Tests</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-success">{suiteResults.passedTests}</div>
              <div className="text-sm text-muted-foreground">Passed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-destructive">{suiteResults.failedTests}</div>
              <div className="text-sm text-muted-foreground">Failed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-warning">{suiteResults.warningTests}</div>
              <div className="text-sm text-muted-foreground">Warnings</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{(suiteResults.totalDuration / 1000).toFixed(1)}s</div>
              <div className="text-sm text-muted-foreground">Duration</div>
            </div>
          </div>

          {/* Progress Bar */}
          {isRunning && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Test Progress</span>
                <span>{suiteResults.passedTests + suiteResults.failedTests + suiteResults.warningTests} / {suiteResults.totalTests}</span>
              </div>
              <Progress 
                value={((suiteResults.passedTests + suiteResults.failedTests + suiteResults.warningTests) / suiteResults.totalTests) * 100} 
                className="h-2"
              />
            </div>
          )}

          {/* Overall Status */}
          <Alert className="mt-4">
            <div className="flex items-center gap-2">
              {getStatusIcon(suiteResults.overallStatus)}
              <AlertDescription>
                <strong>Overall Status:</strong> {suiteResults.overallStatus.toUpperCase()}
                {suiteResults.endTime && (
                  <span className="ml-4">
                    Completed at {suiteResults.endTime.toLocaleTimeString()}
                  </span>
                )}
              </AlertDescription>
            </div>
          </Alert>
        </CardContent>
      </Card>

      {/* Test Results */}
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="all">All Tests</TabsTrigger>
          <TabsTrigger value="workflow">Workflow</TabsTrigger>
          <TabsTrigger value="database">Database</TabsTrigger>
          <TabsTrigger value="integration">Integration</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
        </TabsList>

        <TabsContent value={selectedCategory} className="space-y-4">
          {filteredTests.map((test) => (
            <Card key={test.id} className={`transition-all ${activeTestId === test.id ? 'ring-2 ring-primary' : ''}`}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getCategoryIcon(test.category)}
                    <div>
                      <CardTitle className="text-lg">{test.testName}</CardTitle>
                      <p className="text-sm text-muted-foreground">{test.details}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={test.status === 'passed' ? 'default' : test.status === 'failed' ? 'destructive' : 'secondary'}>
                      {test.status}
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => runSingleTest(test.id)}
                      disabled={isRunning || test.status === 'running'}
                    >
                      {test.status === 'running' ? 'Running...' : 'Run Test'}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium text-sm mb-2">Expected Outcome</h4>
                    <p className="text-sm text-muted-foreground">{test.expectedOutcome}</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-sm mb-2">Actual Outcome</h4>
                    <p className="text-sm text-muted-foreground">{test.actualOutcome}</p>
                  </div>
                </div>

                {test.duration && (
                  <div className="mt-4 text-sm text-muted-foreground">
                    Duration: {test.duration}ms
                  </div>
                )}

                {test.errorMessage && (
                  <Alert className="mt-4">
                    <XCircle className="h-4 w-4" />
                    <AlertDescription>{test.errorMessage}</AlertDescription>
                  </Alert>
                )}

                {test.logs.length > 0 && (
                  <details className="mt-4">
                    <summary className="cursor-pointer text-sm font-medium">Test Logs ({test.logs.length})</summary>
                    <div className="mt-2 space-y-1 max-h-32 overflow-y-auto">
                      {test.logs.map((log, index) => (
                        <div key={index} className="text-xs font-mono bg-muted p-2 rounded">
                          {log}
                        </div>
                      ))}
                    </div>
                  </details>
                )}
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TestExecutionFramework;