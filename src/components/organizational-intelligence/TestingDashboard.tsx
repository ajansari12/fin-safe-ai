
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TestTube, 
  CheckCircle, 
  AlertTriangle, 
  XCircle,
  Play,
  RefreshCw,
  FileText,
  Shield,
  Zap
} from 'lucide-react';
import { toast } from 'sonner';

interface TestResult {
  id: string;
  name: string;
  type: 'unit' | 'integration' | 'e2e' | 'security' | 'performance';
  status: 'passed' | 'failed' | 'running' | 'pending';
  duration: number;
  coverage?: number;
  lastRun: string;
  error?: string;
}

interface TestSuite {
  name: string;
  tests: TestResult[];
  totalCoverage: number;
  passRate: number;
}

interface TestingDashboardProps {
  orgId: string;
}

const TestingDashboard: React.FC<TestingDashboardProps> = ({ orgId }) => {
  const [testSuites, setTestSuites] = useState<TestSuite[]>([]);
  const [loading, setLoading] = useState(false);
  const [runningTests, setRunningTests] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadTestResults();
  }, [orgId]);

  const loadTestResults = async () => {
    try {
      setLoading(true);
      
      // Mock test data
      const mockSuites: TestSuite[] = [
        {
          name: 'Organizational Intelligence',
          totalCoverage: 87,
          passRate: 94,
          tests: [
            {
              id: 'test-1',
              name: 'Profile Assessment Generation',
              type: 'unit',
              status: 'passed',
              duration: 245,
              coverage: 92,
              lastRun: new Date(Date.now() - 3600000).toISOString()
            },
            {
              id: 'test-2',
              name: 'Predictive Insights Algorithm',
              type: 'unit',
              status: 'passed',
              duration: 380,
              coverage: 89,
              lastRun: new Date(Date.now() - 3600000).toISOString()
            },
            {
              id: 'test-3',
              name: 'Recommendation Engine',
              type: 'integration',
              status: 'failed',
              duration: 1200,
              coverage: 76,
              lastRun: new Date(Date.now() - 7200000).toISOString(),
              error: 'API timeout after 10 seconds'
            }
          ]
        },
        {
          name: 'Workflow Orchestration',
          totalCoverage: 91,
          passRate: 100,
          tests: [
            {
              id: 'test-4',
              name: 'Workflow Execution Engine',
              type: 'unit',
              status: 'passed',
              duration: 156,
              coverage: 95,
              lastRun: new Date(Date.now() - 1800000).toISOString()
            },
            {
              id: 'test-5',
              name: 'Step Dependencies Resolution',
              type: 'integration',
              status: 'passed',
              duration: 890,
              coverage: 88,
              lastRun: new Date(Date.now() - 1800000).toISOString()
            }
          ]
        },
        {
          name: 'Security & Compliance',
          totalCoverage: 95,
          passRate: 85,
          tests: [
            {
              id: 'test-6',
              name: 'Data Encryption',
              type: 'security',
              status: 'passed',
              duration: 567,
              coverage: 98,
              lastRun: new Date(Date.now() - 1800000).toISOString()
            },
            {
              id: 'test-7',
              name: 'Access Control Validation',
              type: 'security',
              status: 'failed',
              duration: 234,
              coverage: 92,
              lastRun: new Date(Date.now() - 1800000).toISOString(),
              error: 'Unauthorized access detected in role validation'
            }
          ]
        }
      ];

      setTestSuites(mockSuites);
    } catch (error) {
      console.error('Error loading test results:', error);
      toast.error('Failed to load test results');
    } finally {
      setLoading(false);
    }
  };

  const runTest = async (testId: string) => {
    setRunningTests(prev => new Set([...prev, testId]));
    
    try {
      // Mock test execution
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setTestSuites(prev => prev.map(suite => ({
        ...suite,
        tests: suite.tests.map(test => 
          test.id === testId 
            ? { ...test, status: 'passed' as const, lastRun: new Date().toISOString() }
            : test
        )
      })));
      
      toast.success('Test completed successfully');
    } catch (error) {
      toast.error('Test execution failed');
    } finally {
      setRunningTests(prev => {
        const newSet = new Set(prev);
        newSet.delete(testId);
        return newSet;
      });
    }
  };

  const runAllTests = async () => {
    setLoading(true);
    try {
      // Mock running all tests
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      setTestSuites(prev => prev.map(suite => ({
        ...suite,
        tests: suite.tests.map(test => ({
          ...test,
          status: Math.random() > 0.1 ? 'passed' as const : 'failed' as const,
          lastRun: new Date().toISOString()
        }))
      })));
      
      toast.success('All tests completed');
    } catch (error) {
      toast.error('Test suite execution failed');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passed': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'running': return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'pending': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      default: return <TestTube className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'security': return <Shield className="h-4 w-4" />;
      case 'performance': return <Zap className="h-4 w-4" />;
      case 'e2e': return <FileText className="h-4 w-4" />;
      default: return <TestTube className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'passed': return 'success';
      case 'failed': return 'destructive';
      case 'running': return 'default';
      case 'pending': return 'secondary';
      default: return 'outline';
    }
  };

  const overallStats = {
    totalTests: testSuites.reduce((sum, suite) => sum + suite.tests.length, 0),
    passedTests: testSuites.reduce((sum, suite) => sum + suite.tests.filter(t => t.status === 'passed').length, 0),
    failedTests: testSuites.reduce((sum, suite) => sum + suite.tests.filter(t => t.status === 'failed').length, 0),
    averageCoverage: testSuites.reduce((sum, suite) => sum + suite.totalCoverage, 0) / testSuites.length || 0
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Testing Dashboard</h2>
          <p className="text-muted-foreground">
            Comprehensive testing suite for organizational intelligence platform
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={runAllTests} disabled={loading} variant="outline">
            <Play className="h-4 w-4 mr-2" />
            Run All Tests
          </Button>
          <Button onClick={loadTestResults} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tests</CardTitle>
            <TestTube className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallStats.totalTests}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Passed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{overallStats.passedTests}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{overallStats.failedTests}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Coverage</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(overallStats.averageCoverage)}%</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="suites" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="suites">Test Suites</TabsTrigger>
          <TabsTrigger value="coverage">Coverage Report</TabsTrigger>
          <TabsTrigger value="history">Test History</TabsTrigger>
        </TabsList>

        <TabsContent value="suites" className="space-y-4">
          {testSuites.map((suite, index) => (
            <Card key={index}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{suite.name}</CardTitle>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">
                      {suite.passRate}% pass rate
                    </Badge>
                    <Badge variant="secondary">
                      {suite.totalCoverage}% coverage
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {suite.tests.map((test) => (
                    <div key={test.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {getTypeIcon(test.type)}
                        <div>
                          <div className="font-medium">{test.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {test.type} • {test.duration}ms • {test.coverage}% coverage
                          </div>
                          {test.error && (
                            <div className="text-sm text-red-600 mt-1">{test.error}</div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={getStatusColor(test.status) as any}>
                          {getStatusIcon(test.status)}
                          {test.status}
                        </Badge>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => runTest(test.id)}
                          disabled={runningTests.has(test.id)}
                        >
                          {runningTests.has(test.id) ? (
                            <RefreshCw className="h-3 w-3 animate-spin" />
                          ) : (
                            <Play className="h-3 w-3" />
                          )}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="coverage" className="space-y-4">
          {testSuites.map((suite, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle>{suite.name} Coverage</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span>Overall Coverage</span>
                    <span className="font-medium">{suite.totalCoverage}%</span>
                  </div>
                  <Progress value={suite.totalCoverage} className="h-2" />
                  
                  {suite.tests.map((test) => (
                    <div key={test.id} className="flex items-center justify-between text-sm">
                      <span>{test.name}</span>
                      <span>{test.coverage}%</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Test Runs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <TestTube className="h-12 w-12 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Test History</h3>
                <p>Historical test execution data and trends</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TestingDashboard;
