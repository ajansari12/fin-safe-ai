
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, Clock, Target, AlertTriangle } from "lucide-react";
import { getScenarioAnalytics } from "@/services/scenario-analytics-service";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar } from "recharts";
import { format } from "date-fns";

const ScenarioAnalyticsDashboard: React.FC = () => {
  const { data: analytics, isLoading } = useQuery({
    queryKey: ['scenarioAnalytics'],
    queryFn: getScenarioAnalytics
  });

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="h-20 animate-pulse bg-gray-100 rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const getSuccessRateColor = (rate: number) => {
    if (rate >= 80) return "text-green-600";
    if (rate >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getCoverageColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const chartData = analytics?.recentMetrics.slice(0, 10).reverse().map(metric => ({
    date: format(new Date(metric.test_date), 'MMM dd'),
    successRate: metric.total_tests_conducted > 0 
      ? (metric.successful_tests / metric.total_tests_conducted) * 100 
      : 0,
    totalTests: metric.total_tests_conducted,
    responseTime: metric.average_response_time_minutes || 0
  })) || [];

  const coverageData = analytics?.recentMetrics.slice(0, 5).map(metric => ({
    date: format(new Date(metric.test_date), 'MMM dd'),
    critical: metric.critical_functions_tested,
    high: metric.high_priority_functions_tested,
    coverage: metric.test_coverage_percentage || 0
  })) || [];

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tests</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.totalTests || 0}</div>
            <p className="text-xs text-muted-foreground">
              Last 30 days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getSuccessRateColor(analytics?.successRate || 0)}`}>
              {(analytics?.successRate || 0).toFixed(1)}%
            </div>
            <Progress value={analytics?.successRate || 0} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(analytics?.averageResponseTime || 0).toFixed(0)}
              <span className="text-sm font-normal text-muted-foreground ml-1">min</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Response to incident
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Test Coverage</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getCoverageColor(analytics?.testCoverageScore || 0)}`}>
              {(analytics?.testCoverageScore || 0).toFixed(1)}%
            </div>
            <Progress value={analytics?.testCoverageScore || 0} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Success Rate Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis domain={[0, 100]} />
                <Tooltip 
                  formatter={(value: number) => [`${value.toFixed(1)}%`, 'Success Rate']}
                />
                <Line 
                  type="monotone" 
                  dataKey="successRate" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  dot={{ fill: '#10b981' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Test Coverage Heatmap</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={coverageData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="critical" fill="#ef4444" name="Critical Functions" />
                <Bar dataKey="high" fill="#f59e0b" name="High Priority Functions" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Test Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analytics?.recentMetrics.slice(0, 5).map((metric) => (
              <div key={metric.id} className="flex items-center justify-between p-3 border rounded">
                <div className="space-y-1">
                  <p className="text-sm font-medium">
                    {format(new Date(metric.test_date), 'MMMM dd, yyyy')}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {metric.total_tests_conducted} tests conducted
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge 
                    variant={metric.successful_tests === metric.total_tests_conducted ? "default" : "secondary"}
                  >
                    {metric.successful_tests}/{metric.total_tests_conducted} successful
                  </Badge>
                  {metric.test_coverage_percentage && (
                    <Badge variant="outline">
                      {metric.test_coverage_percentage.toFixed(1)}% coverage
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ScenarioAnalyticsDashboard;
