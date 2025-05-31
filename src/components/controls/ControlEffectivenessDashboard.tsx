
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import { Shield, TestTube, Target, Clock, TrendingUp, AlertTriangle } from "lucide-react";
import { controlEffectivenessService, ControlEffectivenessMetrics, ControlTestMetrics } from "@/services/controls/control-effectiveness-service";
import { useToast } from "@/hooks/use-toast";

const ControlEffectivenessDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<ControlEffectivenessMetrics | null>(null);
  const [testMetrics, setTestMetrics] = useState<ControlTestMetrics[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadMetrics();
  }, []);

  const loadMetrics = async () => {
    try {
      setIsLoading(true);
      const [effectivenessMetrics, controlTestMetrics] = await Promise.all([
        controlEffectivenessService.getControlEffectivenessMetrics(),
        controlEffectivenessService.getControlTestMetrics(),
      ]);
      setMetrics(effectivenessMetrics);
      setTestMetrics(controlTestMetrics);
    } catch (error) {
      console.error('Error loading control effectiveness metrics:', error);
      toast({
        title: "Error",
        description: "Failed to load control effectiveness metrics",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
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

  if (!metrics) return null;

  const passFailData = [
    { name: 'Pass', value: metrics.passRate, color: '#10B981' },
    { name: 'Fail', value: metrics.failRate, color: '#EF4444' },
    { name: 'Not Tested', value: 100 - metrics.passRate - metrics.failRate, color: '#6B7280' },
  ];

  const topPerformingControls = testMetrics.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Control Pass Rate</p>
                <p className="text-2xl font-bold">{metrics.passRate.toFixed(1)}%</p>
              </div>
              <TestTube className="h-8 w-8 text-green-600" />
            </div>
            <Progress value={metrics.passRate} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Effectiveness</p>
                <p className="text-2xl font-bold">{metrics.avgEffectivenessScore.toFixed(1)}/5</p>
              </div>
              <Target className="h-8 w-8 text-blue-600" />
            </div>
            <Progress value={(metrics.avgEffectivenessScore / 5) * 100} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Test Interval</p>
                <p className="text-2xl font-bold">{metrics.avgTestInterval}</p>
                <p className="text-xs text-muted-foreground">days</p>
              </div>
              <Clock className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Overdue Tests</p>
                <p className="text-2xl font-bold text-red-600">{metrics.overdueTests}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
            <Badge variant={metrics.overdueTests > 0 ? "destructive" : "default"} className="mt-2">
              {metrics.overdueTests > 0 ? "Action Required" : "On Track"}
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pass/Fail Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Test Results Distribution
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={passFailData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value.toFixed(1)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {passFailData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Performing Controls */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Top Performing Controls
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={topPerformingControls}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="controlTitle" 
                  angle={-45}
                  textAnchor="end"
                  height={100}
                  fontSize={12}
                />
                <YAxis />
                <Tooltip />
                <Bar dataKey="passRate" fill="#10B981" name="Pass Rate %" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-600">{metrics.totalControls}</p>
              <p className="text-sm text-muted-foreground">Total Controls</p>
              <p className="text-xs text-green-600 mt-1">{metrics.activeControls} active</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-green-600">{metrics.testedControls}</p>
              <p className="text-sm text-muted-foreground">Controls Tested</p>
              <p className="text-xs text-muted-foreground mt-1">
                {metrics.totalControls > 0 ? ((metrics.testedControls / metrics.totalControls) * 100).toFixed(1) : 0}% coverage
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-3xl font-bold text-purple-600">{metrics.effectiveControls}</p>
              <p className="text-sm text-muted-foreground">Effective Controls</p>
              <p className="text-xs text-muted-foreground mt-1">Score ≥ 4/5</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ControlEffectivenessDashboard;
