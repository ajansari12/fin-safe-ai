
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, BarChart, Bar } from "recharts";
import { TrendingUp, TrendingDown, AlertTriangle, Activity } from "lucide-react";
import { predictiveAnalyticsService } from "@/services/predictive-analytics-service";
// TODO: Migrated from AuthContext to EnhancedAuthContext
import { useAuth } from "@/contexts/EnhancedAuthContext";

const chartConfig = {
  current: { label: "Current", color: "#2563eb" },
  predicted: { label: "Predicted", color: "#dc2626" },
  probability: { label: "Probability", color: "#ea580c" }
};

export function PredictiveInsights() {
  const { profile } = useAuth();
  const orgId = profile?.organization_id;

  const { data: incidentForecast, isLoading: forecastLoading } = useQuery({
    queryKey: ['incidentForecast', orgId],
    queryFn: () => predictiveAnalyticsService.generateIncidentForecast(orgId!),
    enabled: !!orgId,
    refetchInterval: 30 * 60 * 1000 // 30 minutes
  });

  const { data: kriBreaches, isLoading: brechesLoading } = useQuery({
    queryKey: ['kriBreaches', orgId],
    queryFn: () => predictiveAnalyticsService.predictKRIBreaches(orgId!),
    enabled: !!orgId,
    refetchInterval: 15 * 60 * 1000 // 15 minutes
  });

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing': return <TrendingUp className="h-4 w-4 text-red-500" />;
      case 'decreasing': return <TrendingDown className="h-4 w-4 text-green-500" />;
      default: return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'outline';
      case 'low': return 'secondary';
      default: return 'outline';
    }
  };

  if (forecastLoading || brechesLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Incident Forecast</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 animate-pulse bg-gray-100 rounded" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>KRI Breach Predictions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 animate-pulse bg-gray-100 rounded" />
          </CardContent>
        </Card>
      </div>
    );
  }

  const forecastData = incidentForecast?.map(forecast => ({
    category: forecast.category,
    current: forecast.currentMonthly,
    predicted: forecast.predictedNextMonth,
    confidence: Math.round(forecast.confidence * 100)
  })) || [];

  const breachData = kriBreaches?.slice(0, 5).map(breach => ({
    name: breach.kriName.substring(0, 20) + (breach.kriName.length > 20 ? '...' : ''),
    probability: Math.round(breach.breachProbability * 100),
    days: breach.daysToBreach
  })) || [];

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Incident Forecast */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Incident Forecast
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Predicted incident volumes using rolling averages
          </p>
        </CardHeader>
        <CardContent>
          {forecastData.length > 0 ? (
            <div className="space-y-4">
              <ChartContainer config={chartConfig} className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={forecastData}>
                    <XAxis dataKey="category" tick={{ fontSize: 10 }} />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="current" fill="var(--color-current)" name="Current Month" />
                    <Bar dataKey="predicted" fill="var(--color-predicted)" name="Predicted Next Month" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
              
              <div className="space-y-2">
                {incidentForecast?.slice(0, 3).map((forecast, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div className="flex items-center gap-2">
                      {getTrendIcon(forecast.trend)}
                      <span className="text-sm font-medium capitalize">{forecast.category}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">
                        {Math.round(forecast.confidence * 100)}% confident
                      </span>
                      <Badge variant="outline">
                        {forecast.currentMonthly} → {forecast.predictedNextMonth}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              Insufficient data for incident forecasting
            </div>
          )}
        </CardContent>
      </Card>

      {/* KRI Breach Predictions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            KRI Breach Predictions
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Predicted threshold breaches in the next 90 days
          </p>
        </CardHeader>
        <CardContent>
          {breachData.length > 0 ? (
            <div className="space-y-4">
              <ChartContainer config={chartConfig} className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={breachData} layout="horizontal">
                    <XAxis type="number" domain={[0, 100]} />
                    <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="probability" fill="var(--color-probability)" name="Breach Probability %" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
              
              <div className="space-y-2">
                {kriBreaches?.slice(0, 5).map((breach, index) => (
                  <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div className="flex-1">
                      <div className="font-medium text-sm">{breach.kriName}</div>
                      <div className="text-xs text-muted-foreground">
                        Current: {breach.currentValue} | Threshold: {breach.threshold}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={getSeverityColor(breach.severity)}>
                        {Math.round(breach.breachProbability * 100)}%
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {breach.daysToBreach < 365 ? `${breach.daysToBreach}d` : '1y+'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No KRI breach risks identified
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
