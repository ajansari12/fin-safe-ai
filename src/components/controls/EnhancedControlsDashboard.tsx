
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { AlertTriangle, CheckCircle, Clock, TrendingUp, TestTube, Shield, Target, AlertCircle } from "lucide-react";
import { Control } from "@/services/controls";
import { ControlTest } from "@/services/control-tests";

interface EnhancedControlsDashboardProps {
  controls: Control[];
  controlTests: ControlTest[];
  isLoading: boolean;
}

const EnhancedControlsDashboard: React.FC<EnhancedControlsDashboardProps> = ({
  controls,
  controlTests,
  isLoading
}) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  // Calculate metrics
  const totalControls = controls.length;
  const activeControls = controls.filter(c => c.status === 'active').length;
  const effectiveControls = controls.filter(c => c.effectiveness_score && c.effectiveness_score >= 4).length;
  const overdueTests = controls.filter(c => 
    c.next_test_due_date && new Date(c.next_test_due_date) < new Date()
  ).length;

  const effectivenessPercentage = totalControls > 0 ? (effectiveControls / totalControls) * 100 : 0;
  
  const totalTests = controlTests.length;
  const passedTests = controlTests.filter(t => t.test_result === 'pass').length;
  const failedTests = controlTests.filter(t => t.test_result === 'fail').length;
  const testSuccessRate = totalTests > 0 ? (passedTests / totalTests) * 100 : 0;

  // RAG (Red, Amber, Green) Status Distribution
  const ragData = [
    {
      name: 'Effective (Green)',
      value: controls.filter(c => c.effectiveness_score && c.effectiveness_score >= 4).length,
      color: '#10B981'
    },
    {
      name: 'Moderate (Amber)',
      value: controls.filter(c => c.effectiveness_score && c.effectiveness_score >= 2 && c.effectiveness_score < 4).length,
      color: '#F59E0B'
    },
    {
      name: 'Ineffective (Red)',
      value: controls.filter(c => c.effectiveness_score && c.effectiveness_score < 2).length,
      color: '#EF4444'
    },
    {
      name: 'Not Tested',
      value: controls.filter(c => !c.effectiveness_score).length,
      color: '#6B7280'
    }
  ];

  // Control frequency distribution
  const frequencyData = Object.entries(
    controls.reduce((acc, control) => {
      acc[control.frequency] = (acc[control.frequency] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  ).map(([frequency, count]) => ({
    name: frequency,
    count
  }));

  // Test trend data (last 6 months)
  const testTrendData = [];
  for (let i = 5; i >= 0; i--) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    const monthStr = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    
    const monthTests = controlTests.filter(t => {
      const testDate = new Date(t.test_date);
      return testDate.getMonth() === date.getMonth() && 
             testDate.getFullYear() === date.getFullYear();
    });
    
    testTrendData.push({
      month: monthStr,
      passed: monthTests.filter(t => t.test_result === 'pass').length,
      failed: monthTests.filter(t => t.test_result === 'fail').length,
      partial: monthTests.filter(t => t.test_result === 'partial').length
    });
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Controls</p>
                <p className="text-2xl font-bold">{totalControls}</p>
              </div>
              <Shield className="h-8 w-8 text-blue-600" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {activeControls} active controls
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">% Effective Controls</p>
                <p className="text-2xl font-bold">{Math.round(effectivenessPercentage)}%</p>
              </div>
              <Target className="h-8 w-8 text-green-600" />
            </div>
            <Progress value={effectivenessPercentage} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Test Success Rate</p>
                <p className="text-2xl font-bold">{Math.round(testSuccessRate)}%</p>
              </div>
              <TestTube className="h-8 w-8 text-purple-600" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {passedTests} passed / {totalTests} total tests
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Overdue Tests</p>
                <p className="text-2xl font-bold text-red-600">{overdueTests}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
            <Badge variant={overdueTests > 0 ? "destructive" : "default"} className="mt-2">
              {overdueTests > 0 ? "Action Required" : "On Track"}
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* RAG Status Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Control Effectiveness (RAG Status)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={ragData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {ragData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-4 mt-4">
              {ragData.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm">{item.name}: {item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Test Trend Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Test Results Trend (6 Months)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={testTrendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="passed" stackId="a" fill="#10B981" name="Passed" />
                <Bar dataKey="partial" stackId="a" fill="#F59E0B" name="Partial" />
                <Bar dataKey="failed" stackId="a" fill="#EF4444" name="Failed" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Control Frequency Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Control Testing Frequency Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={frequencyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Risk Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">High Performing</p>
                <p className="text-xl font-bold">
                  {controls.filter(c => c.effectiveness_score && c.effectiveness_score === 5).length}
                </p>
                <p className="text-xs text-muted-foreground">Controls with 5/5 rating</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-8 w-8 text-yellow-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Need Attention</p>
                <p className="text-xl font-bold">
                  {controls.filter(c => c.effectiveness_score && c.effectiveness_score < 3).length}
                </p>
                <p className="text-xs text-muted-foreground">Controls with low ratings</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-8 w-8 text-red-600" />
              <div>
                <p className="text-sm font-medium text-muted-foreground">Remediation Required</p>
                <p className="text-xl font-bold">
                  {controlTests.filter(t => t.remediation_required && t.remediation_status !== 'completed').length}
                </p>
                <p className="text-xs text-muted-foreground">Pending remediations</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EnhancedControlsDashboard;
