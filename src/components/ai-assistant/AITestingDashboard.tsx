import React from "react";
import { useEnhancedAIAssistant } from "./EnhancedAIAssistantContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Clock, 
  DollarSign, 
  CheckCircle, 
  XCircle, 
  TrendingUp, 
  Activity,
  AlertTriangle,
  Target
} from "lucide-react";

export const AITestingDashboard: React.FC = () => {
  const {
    costMetrics,
    testResults,
    isTestingQueries,
    executeBankLikeQuery,
    runBankTestSuite,
    resetCostMetrics,
    getCostReport
  } = useEnhancedAIAssistant();

  const handleQuickTest = async (query: string) => {
    await executeBankLikeQuery(query);
  };

  const quickTestQueries = [
    "Forecast cyber risks for next quarter",
    "Assess third-party concentration risk", 
    "Analyze vendor performance patterns",
    "Generate operational risk heat map"
  ];

  return (
    <div className="space-y-6">
      {/* Cost & Performance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-4 w-4 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Daily Spend</p>
                <p className="text-lg font-semibold">${costMetrics.dailySpend.toFixed(3)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Activity className="h-4 w-4 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Requests</p>
                <p className="text-lg font-semibold">{costMetrics.requestCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-orange-500" />
              <div>
                <p className="text-sm text-muted-foreground">Avg Response</p>
                <p className="text-lg font-semibold">{costMetrics.averageResponseTime.toFixed(0)}ms</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              {costMetrics.errorRate < 0.05 ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <AlertTriangle className="h-4 w-4 text-red-500" />
              )}
              <div>
                <p className="text-sm text-muted-foreground">Error Rate</p>
                <p className="text-lg font-semibold">{(costMetrics.errorRate * 100).toFixed(1)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Budget Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Target className="h-5 w-5" />
            <span>Daily Budget Usage</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Used: ${costMetrics.dailySpend.toFixed(2)}</span>
              <span>Budget: $50.00</span>
            </div>
            <Progress 
              value={(costMetrics.dailySpend / 50) * 100} 
              className="h-2"
            />
            <div className="text-xs text-muted-foreground">
              {((costMetrics.dailySpend / 50) * 100).toFixed(1)}% of daily budget used
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Testing Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>🏦 Bank-Like Query Testing</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={runBankTestSuite}
              disabled={isTestingQueries}
              className="w-full"
            >
              {isTestingQueries ? "Running Test Suite..." : "Run Full Test Suite"}
            </Button>
            
            <div className="space-y-2">
              <p className="text-sm font-medium">Quick Tests:</p>
              {quickTestQueries.map((query, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => handleQuickTest(query)}
                  disabled={isTestingQueries}
                  className="w-full text-left justify-start"
                >
                  {query}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>📊 Recent Test Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {testResults.length === 0 ? (
                <p className="text-sm text-muted-foreground">No test results yet. Run a test to see results.</p>
              ) : (
                testResults.map((result, index) => (
                  <div key={index} className="border rounded-lg p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <Badge variant={result.success ? "default" : "destructive"}>
                        {result.success ? "Success" : "Failed"}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {result.responseTime.toFixed(0)}ms
                      </span>
                    </div>
                    
                    <p className="text-sm font-medium truncate">{result.query}</p>
                    
                    <div className="flex items-center justify-between text-xs">
                      <span>Confidence: {(result.confidence * 100).toFixed(1)}%</span>
                      <div className="flex items-center space-x-1">
                        {result.responseTime < 3000 ? (
                          <CheckCircle className="h-3 w-3 text-green-500" />
                        ) : (
                          <XCircle className="h-3 w-3 text-red-500" />
                        )}
                        <span>
                          {result.responseTime < 3000 ? "Fast" : "Slow"}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Management Actions */}
      <Card>
        <CardHeader>
          <CardTitle>🔧 Management Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button 
              variant="outline" 
              onClick={getCostReport}
            >
              Generate Cost Report
            </Button>
            <Button 
              variant="outline" 
              onClick={resetCostMetrics}
            >
              Reset Metrics
            </Button>
            <Button 
              variant="outline"
              onClick={() => window.open('https://supabase.com/dashboard/project/ooocjyscnvbahsyryzxp/functions', '_blank')}
            >
              View Edge Functions
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* OSFI Compliance Notice */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <div className="flex items-start space-x-2">
            <CheckCircle className="h-5 w-5 text-blue-500 mt-0.5" />
            <div>
              <p className="font-medium text-blue-900">OSFI E-21 Compliance</p>
              <p className="text-sm text-blue-700">
                This testing framework supports operational resilience requirements by ensuring
                AI system reliability, performance monitoring, and cost control mechanisms
                are in place per OSFI Principle 4.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};