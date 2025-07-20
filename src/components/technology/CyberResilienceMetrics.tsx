
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Shield, 
  TrendingUp,
  Clock,
  CheckCircle,
  AlertTriangle,
  Activity,
  Target,
  BarChart3
} from "lucide-react";

const CyberResilienceMetrics = () => {
  // Mock metrics data
  const resilienceMetrics = {
    overallScore: 87,
    maturityLevel: "Advanced",
    lastAssessment: "2024-01-15",
    nextAssessment: "2024-04-15",
    categories: [
      { name: "Detection Capability", score: 92, target: 90, status: "above_target" },
      { name: "Response Time", score: 85, target: 80, status: "above_target" },
      { name: "Recovery Capability", score: 78, target: 85, status: "below_target" },
      { name: "Prevention Controls", score: 94, target: 90, status: "above_target" },
      { name: "Training & Awareness", score: 82, target: 85, status: "below_target" }
    ],
    kpis: [
      { 
        name: "Mean Time to Detection (MTTD)",
        value: "4.2",
        unit: "minutes",
        target: "5.0",
        trend: "improving",
        change: "-12%"
      },
      {
        name: "Mean Time to Response (MTTR)", 
        value: "18.5",
        unit: "minutes",
        target: "20.0",
        trend: "improving",
        change: "-8%"
      },
      {
        name: "Mean Time to Recovery (MTTR)",
        value: "2.4",
        unit: "hours",
        target: "2.0",
        trend: "degrading",
        change: "+15%"
      },
      {
        name: "Security Incidents",
        value: "3",
        unit: "per month",
        target: "5",
        trend: "stable",
        change: "0%"
      }
    ],
    controlEffectiveness: [
      { control: "Endpoint Protection", effectiveness: 96, incidents: 2 },
      { control: "Email Security", effectiveness: 89, incidents: 5 },
      { control: "Network Monitoring", effectiveness: 94, incidents: 1 },
      { control: "Access Controls", effectiveness: 91, incidents: 3 },
      { control: "Backup Systems", effectiveness: 87, incidents: 0 }
    ]
  };

  const getScoreColor = (score: number, target: number) => {
    if (score >= target) return "text-green-600";
    if (score >= target * 0.9) return "text-yellow-600";
    return "text-red-600";
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "improving": return <TrendingUp className="h-4 w-4 text-green-600" />;
      case "degrading": return <TrendingUp className="h-4 w-4 text-red-600 rotate-180" />;
      case "stable": return <Activity className="h-4 w-4 text-blue-600" />;
      default: return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "above_target": return <Badge className="bg-green-100 text-green-800">Above Target</Badge>;
      case "below_target": return <Badge className="bg-red-100 text-red-800">Below Target</Badge>;
      case "on_target": return <Badge className="bg-blue-100 text-blue-800">On Target</Badge>;
      default: return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Cyber Resilience Metrics</h2>
          <p className="text-muted-foreground">
            Monitor and measure cybersecurity resilience capabilities
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            <Shield className="h-3 w-3 mr-1" />
            Maturity: {resilienceMetrics.maturityLevel}
          </Badge>
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <Target className="h-3 w-3 mr-1" />
            Score: {resilienceMetrics.overallScore}%
          </Badge>
        </div>
      </div>

      {/* Overall Resilience Score */}
      <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-600" />
            Cyber Resilience Assessment
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-900 mb-2">
                  {resilienceMetrics.overallScore}%
                </div>
                <div className="text-lg font-medium text-blue-700">
                  {resilienceMetrics.maturityLevel}
                </div>
                <div className="text-sm text-muted-foreground">
                  Overall Resilience Score
                </div>
              </div>
              <div className="space-y-2">
                <Progress value={resilienceMetrics.overallScore} className="h-3" />
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Basic</span>
                  <span>Intermediate</span>
                  <span>Advanced</span>
                  <span>Optimized</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Last Assessment</span>
                <span className="text-sm text-muted-foreground">{resilienceMetrics.lastAssessment}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Next Assessment</span>
                <span className="text-sm text-muted-foreground">{resilienceMetrics.nextAssessment}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Assessment Frequency</span>
                <span className="text-sm text-muted-foreground">Quarterly</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Compliance Status</span>
                <Badge className="bg-green-100 text-green-800">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Compliant
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resilience Categories */}
      <Card>
        <CardHeader>
          <CardTitle>Resilience Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {resilienceMetrics.categories.map((category, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="space-y-1">
                  <div className="font-medium">{category.name}</div>
                  <div className="text-sm text-muted-foreground">
                    Target: {category.target}%
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className={`text-2xl font-bold ${getScoreColor(category.score, category.target)}`}>
                      {category.score}%
                    </div>
                  </div>
                  {getStatusBadge(category.status)}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Key Performance Indicators */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Key Performance Indicators
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {resilienceMetrics.kpis.map((kpi, index) => (
              <div key={index} className="p-4 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div className="font-medium text-sm">{kpi.name}</div>
                  {getTrendIcon(kpi.trend)}
                </div>
                
                <div className="flex items-end gap-2 mb-2">
                  <div className="text-2xl font-bold">{kpi.value}</div>
                  <div className="text-sm text-muted-foreground">{kpi.unit}</div>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <div className="text-muted-foreground">
                    Target: {kpi.target} {kpi.unit}
                  </div>
                  <div className={`font-medium ${
                    kpi.trend === "improving" ? "text-green-600" : 
                    kpi.trend === "degrading" ? "text-red-600" : "text-blue-600"
                  }`}>
                    {kpi.change}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Control Effectiveness */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            Security Control Effectiveness
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {resilienceMetrics.controlEffectiveness.map((control, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="space-y-1">
                  <div className="font-medium">{control.control}</div>
                  <div className="text-sm text-muted-foreground">
                    {control.incidents} incidents this month
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="text-right min-w-[100px]">
                    <div className="text-sm text-muted-foreground mb-1">Effectiveness</div>
                    <Progress value={control.effectiveness} className="h-2 w-20" />
                  </div>
                  <div className="text-2xl font-bold text-green-600">
                    {control.effectiveness}%
                  </div>
                  {control.incidents === 0 ? (
                    <Badge className="bg-green-100 text-green-800">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Clean
                    </Badge>
                  ) : (
                    <Badge variant="outline">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      {control.incidents}
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Trend Analysis */}
      <Card>
        <CardHeader>
          <CardTitle>Resilience Trend Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center border-2 border-dashed border-gray-200 rounded-lg">
            <div className="text-center text-muted-foreground">
              <TrendingUp className="h-12 w-12 mx-auto mb-4" />
              <p>Resilience trend chart will be displayed here</p>
              <p className="text-sm">Historical performance and improvement tracking</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CyberResilienceMetrics;
