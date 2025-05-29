
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, BarChart, Bar } from "recharts";
import { TrendingUp, TrendingDown, Minus, Activity } from "lucide-react";
import { getPredictiveAnalytics, type PredictiveAnalytics } from "@/services/analytics-service";

const chartConfig = {
  current: {
    label: "Current",
    color: "#2563eb",
  },
  predicted_30: {
    label: "30 Days",
    color: "#dc2626",
  },
  predicted_90: {
    label: "90 Days",
    color: "#ea580c",
  },
};

const PredictiveAnalyticsChart: React.FC = () => {
  const { data: analytics, isLoading } = useQuery({
    queryKey: ['predictiveAnalytics'],
    queryFn: getPredictiveAnalytics,
    refetchInterval: 5 * 60 * 1000 // Refresh every 5 minutes
  });

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>KRI Forecasts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 animate-pulse bg-gray-100 rounded" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Incident Predictions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 animate-pulse bg-gray-100 rounded" />
          </CardContent>
        </Card>
      </div>
    );
  }

  const kriData = analytics?.kri_forecast.map(kri => ({
    name: kri.metric.substring(0, 15) + (kri.metric.length > 15 ? '...' : ''),
    current: kri.current_value,
    predicted_30: kri.predicted_30_days,
    predicted_90: kri.predicted_90_days,
    trend: kri.trend,
    confidence: kri.confidence
  })) || [];

  const incidentData = analytics?.incident_forecast.map(forecast => ({
    category: forecast.category,
    current: forecast.current_monthly,
    predicted: forecast.predicted_next_month,
    risk_level: forecast.risk_level
  })) || [];

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing': return <TrendingUp className="h-4 w-4 text-red-500" />;
      case 'decreasing': return <TrendingDown className="h-4 w-4 text-green-500" />;
      default: return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };

  const getRiskBadgeVariant = (level: string) => {
    switch (level) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'outline';
      case 'low': return 'secondary';
      default: return 'outline';
    }
  };

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* KRI Forecasts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            KRI Forecasts
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Predicted risk indicator trends based on historical data
          </p>
        </CardHeader>
        <CardContent>
          {kriData.length > 0 ? (
            <div className="space-y-4">
              <ChartContainer config={chartConfig} className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={kriData}>
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line
                      type="monotone"
                      dataKey="current"
                      stroke="var(--color-current)"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="predicted_30"
                      stroke="var(--color-predicted_30)"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                    />
                    <Line
                      type="monotone"
                      dataKey="predicted_90"
                      stroke="var(--color-predicted_90)"
                      strokeWidth={2}
                      strokeDasharray="3 3"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
              
              <div className="space-y-2">
                {analytics?.kri_forecast.slice(0, 3).map((kri, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div className="flex items-center gap-2">
                      {getTrendIcon(kri.trend)}
                      <span className="text-sm font-medium">{kri.metric}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        {Math.round(kri.confidence * 100)}% confident
                      </span>
                      <Badge variant="outline">
                        {kri.current_value} → {Math.round(kri.predicted_30_days)}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No KRI data available for forecasting
            </div>
          )}
        </CardContent>
      </Card>

      {/* Incident Predictions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Incident Predictions
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Forecasted incident volumes by category
          </p>
        </CardHeader>
        <CardContent>
          {incidentData.length > 0 ? (
            <div className="space-y-4">
              <ChartContainer config={chartConfig} className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={incidentData}>
                    <XAxis dataKey="category" tick={{ fontSize: 10 }} />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="current" fill="#2563eb" name="Current Month" />
                    <Bar dataKey="predicted" fill="#dc2626" name="Predicted Next Month" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
              
              <div className="space-y-2">
                {analytics?.incident_forecast.map((forecast, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <span className="text-sm font-medium capitalize">{forecast.category}</span>
                    <div className="flex items-center gap-2">
                      <Badge variant={getRiskBadgeVariant(forecast.risk_level)}>
                        {forecast.risk_level}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {forecast.current_monthly} → {forecast.predicted_next_month}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No incident data available for forecasting
            </div>
          )}
        </CardContent>
      </Card>

      {/* Overall Risk Score */}
      <Card className="md:col-span-2">
        <CardHeader>
          <CardTitle>Predicted Risk Score</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center">
            <div className="relative w-32 h-32">
              <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke="currentColor"
                  strokeWidth="10"
                  fill="transparent"
                  className="text-gray-200"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke="currentColor"
                  strokeWidth="10"
                  fill="transparent"
                  strokeDasharray={`${2 * Math.PI * 40}`}
                  strokeDashoffset={`${2 * Math.PI * 40 * (1 - (analytics?.risk_score_prediction || 0) / 100)}`}
                  className={
                    (analytics?.risk_score_prediction || 0) > 70 ? "text-red-500" :
                    (analytics?.risk_score_prediction || 0) > 40 ? "text-yellow-500" : "text-green-500"
                  }
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-2xl font-bold">
                  {Math.round(analytics?.risk_score_prediction || 0)}
                </span>
              </div>
            </div>
          </div>
          <p className="text-center text-sm text-muted-foreground mt-4">
            Predicted risk score based on current trends
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default PredictiveAnalyticsChart;
