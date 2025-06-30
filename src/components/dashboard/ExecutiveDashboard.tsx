import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, AlertTriangle, CheckCircle } from "lucide-react";
import RiskHeatmap from "@/components/analytics/RiskHeatmap";
import { ExecutiveScorecard } from "@/components/analytics/ExecutiveScorecard";
import { PredictiveInsights } from "@/components/analytics/PredictiveInsights";
import DraggableWidget from "./DraggableWidget";

interface ExecutiveDashboardProps {
  settings: any;
}

const ExecutiveDashboard: React.FC<ExecutiveDashboardProps> = ({ settings }) => {
  const executiveMetrics = [
    {
      title: "Overall Risk Score",
      value: "72",
      change: "+3",
      trend: "up",
      status: "warning",
      description: "Risk posture compared to last quarter"
    },
    {
      title: "Regulatory Compliance",
      value: "94%",
      change: "+2%",
      trend: "up", 
      status: "success",
      description: "OSFI E-21 compliance rate"
    },
    {
      title: "Critical Incidents",
      value: "2",
      change: "-1",
      trend: "down",
      status: "success",
      description: "High priority incidents this month"
    },
    {
      title: "Business Continuity",
      value: "98%",
      change: "0%",
      trend: "stable",
      status: "success",
      description: "Critical function availability"
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case "error":
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <CheckCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="h-3 w-3 text-green-500" />;
      case "down":
        return <TrendingDown className="h-3 w-3 text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Executive Metrics Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {executiveMetrics.map((metric, index) => (
          <DraggableWidget key={`metric-${index}`} id={`exec-metric-${index}`}>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
                {getStatusIcon(metric.status)}
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metric.value}</div>
                <div className="flex items-center text-xs text-muted-foreground">
                  {getTrendIcon(metric.trend)}
                  <span className="ml-1">{metric.change} from last period</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {metric.description}
                </p>
              </CardContent>
            </Card>
          </DraggableWidget>
        ))}
      </div>

      {/* Executive Analytics Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Executive Scorecard */}
        <DraggableWidget id="exec-scorecard" className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Executive Risk Scorecard
                <Badge variant="secondary">Real-time</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ExecutiveScorecard />
            </CardContent>
          </Card>
        </DraggableWidget>

        {/* Risk Heatmap */}
        <DraggableWidget id="risk-heatmap">
          <Card>
            <CardHeader>
              <CardTitle>Risk Heat Map</CardTitle>
            </CardHeader>
            <CardContent>
              <RiskHeatmap />
            </CardContent>
          </Card>
        </DraggableWidget>

        {/* Predictive Insights */}
        <DraggableWidget id="predictive-insights" className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                AI-Powered Predictive Insights
                <Badge variant="outline">Beta</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <PredictiveInsights />
            </CardContent>
          </Card>
        </DraggableWidget>
      </div>

      {/* Executive Summary */}
      <DraggableWidget id="exec-summary">
        <Card>
          <CardHeader>
            <CardTitle>Executive Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                <div>
                  <h4 className="font-medium">Regulatory Compliance Maintained</h4>
                  <p className="text-sm text-muted-foreground">
                    All OSFI E-21 requirements continue to be met with 94% compliance rate.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5" />
                <div>
                  <h4 className="font-medium">Operational Risk Trend</h4>
                  <p className="text-sm text-muted-foreground">
                    Slight increase in operational risk due to third-party service disruptions.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <TrendingUp className="h-5 w-5 text-blue-500 mt-0.5" />
                <div>
                  <h4 className="font-medium">Control Effectiveness</h4>
                  <p className="text-sm text-muted-foreground">
                    Enhanced monitoring controls showing improved effectiveness scores.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </DraggableWidget>
    </div>
  );
};

export default ExecutiveDashboard;
