import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import { AlertCircle, TrendingUp, Clock, CheckCircle, Target } from "lucide-react";
import { getScenarioTests } from "@/services/scenario-testing-service";

const ScenarioAnalyticsDashboard: React.FC = () => {
  const { data: scenarios = [], isLoading } = useQuery({
    queryKey: ['scenarioTests'],
    queryFn: getScenarioTests,
  });

  // Analytics calculations
  const totalTests = scenarios.length;
  const completedTests = scenarios.filter(s => s.status === 'completed').length;
  const inProgressTests = scenarios.filter(s => s.status === 'in_progress').length;
  const completionRate = totalTests > 0 ? Math.round((completedTests / totalTests) * 100) : 0;

  // Status distribution
  const statusData = [
    { name: 'Draft', value: scenarios.filter(s => s.status === 'draft').length, color: '#94a3b8' },
    { name: 'Approved', value: scenarios.filter(s => s.status === 'approved').length, color: '#3b82f6' },
    { name: 'In Progress', value: inProgressTests, color: '#f59e0b' },
    { name: 'Completed', value: completedTests, color: '#10b981' },
    { name: 'Cancelled', value: scenarios.filter(s => s.status === 'cancelled').length, color: '#ef4444' },
  ];

  // Severity distribution
  const severityData = [
    { name: 'Low', value: scenarios.filter(s => s.severity_level === 'low').length },
    { name: 'Medium', value: scenarios.filter(s => s.severity_level === 'medium').length },
    { name: 'High', value: scenarios.filter(s => s.severity_level === 'high').length },
    { name: 'Critical', value: scenarios.filter(s => s.severity_level === 'critical').length },
  ];

  // Disruption type distribution
  const disruptionData = scenarios.reduce((acc: any[], scenario) => {
    const existing = acc.find(item => item.type === scenario.disruption_type);
    if (existing) {
      existing.count += 1;
    } else {
      acc.push({ type: scenario.disruption_type.replace('_', ' '), count: 1 });
    }
    return acc;
  }, []);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-muted rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Tests</p>
                <p className="text-3xl font-bold">{totalTests}</p>
              </div>
              <Target className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completed</p>
                <p className="text-3xl font-bold text-green-600">{completedTests}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">In Progress</p>
                <p className="text-3xl font-bold text-yellow-600">{inProgressTests}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Completion Rate</p>
                <p className="text-3xl font-bold">{completionRate}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Test Status Distribution</CardTitle>
            <CardDescription>Overview of scenario test statuses</CardDescription>
          </CardHeader>
          <CardContent>
            {statusData.some(d => d.value > 0) ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={statusData.filter(d => d.value > 0)}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                No data available
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Severity Levels</CardTitle>
            <CardDescription>Distribution of test severity levels</CardDescription>
          </CardHeader>
          <CardContent>
            {severityData.some(d => d.value > 0) ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={severityData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                No data available
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Disruption Types</CardTitle>
            <CardDescription>Types of disruptions being tested</CardDescription>
          </CardHeader>
          <CardContent>
            {disruptionData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={disruptionData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="type" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                No data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Key Insights</CardTitle>
          <CardDescription>AI-powered analysis of your scenario testing program</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {completionRate < 50 && (
              <div className="flex items-start gap-3 p-4 border rounded-lg">
                <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5" />
                <div>
                  <h4 className="font-medium">Low Completion Rate</h4>
                  <p className="text-sm text-muted-foreground">
                    Consider reviewing test complexity and resource allocation to improve completion rates.
                  </p>
                </div>
              </div>
            )}
            
            {scenarios.filter(s => s.severity_level === 'critical').length === 0 && (
              <div className="flex items-start gap-3 p-4 border rounded-lg">
                <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5" />
                <div>
                  <h4 className="font-medium">Missing Critical Scenarios</h4>
                  <p className="text-sm text-muted-foreground">
                    Consider adding critical severity scenarios to test your most important business functions.
                  </p>
                </div>
              </div>
            )}

            {totalTests > 0 && completionRate > 80 && (
              <div className="flex items-start gap-3 p-4 border rounded-lg bg-green-50">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                <div>
                  <h4 className="font-medium">Excellent Testing Program</h4>
                  <p className="text-sm text-muted-foreground">
                    Your scenario testing program shows strong execution with high completion rates.
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ScenarioAnalyticsDashboard;