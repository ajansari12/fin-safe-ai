
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, TrendingDown, Minus, Shield, AlertCircle, DollarSign, Users } from "lucide-react";
import { predictiveAnalyticsService } from "@/services/predictive-analytics-service";
// TODO: Migrated from AuthContext to EnhancedAuthContext
import { useAuth } from "@/contexts/EnhancedAuthContext";

const categoryIcons = {
  operational: Shield,
  cyber: AlertCircle,
  compliance: Shield,
  financial: DollarSign,
  reputational: Users
};

const categoryColors = {
  operational: "text-blue-600",
  cyber: "text-red-600", 
  compliance: "text-green-600",
  financial: "text-yellow-600",
  reputational: "text-purple-600"
};

export function ExecutiveScorecard() {
  const { profile } = useAuth();
  const orgId = profile?.organization_id;

  const { data: scorecard, isLoading } = useQuery({
    queryKey: ['riskScorecard', orgId],
    queryFn: () => predictiveAnalyticsService.generateRiskScorecard(orgId!),
    enabled: !!orgId,
    refetchInterval: 60 * 60 * 1000 // 1 hour
  });

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving': return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'declining': return <TrendingDown className="h-4 w-4 text-red-500" />;
      default: return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };

  const getScoreColor = (score: number): string => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreVariant = (score: number): "default" | "secondary" | "destructive" | "outline" => {
    if (score >= 80) return "default";
    if (score >= 60) return "secondary";
    return "destructive";
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Executive Risk Scorecard</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="h-32 animate-pulse bg-gray-100 rounded" />
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-24 animate-pulse bg-gray-100 rounded" />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!scorecard) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Executive Risk Scorecard</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            Unable to generate risk scorecard
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Overall Score */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Executive Risk Scorecard
            <div className="flex items-center gap-2">
              {getTrendIcon(scorecard.trend)}
              <Badge variant={getScoreVariant(scorecard.overallScore)}>
                {scorecard.overallScore}/100
              </Badge>
            </div>
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Overall organizational risk posture across all categories
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center">
            <div className="relative w-40 h-40">
              <svg className="w-40 h-40 transform -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="35"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="transparent"
                  className="text-gray-200"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="35"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray={`${2 * Math.PI * 35}`}
                  strokeDashoffset={`${2 * Math.PI * 35 * (1 - scorecard.overallScore / 100)}`}
                  className={getScoreColor(scorecard.overallScore)}
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold">{scorecard.overallScore}</span>
                <span className="text-sm text-muted-foreground">Risk Score</span>
              </div>
            </div>
          </div>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Last updated: {new Date(scorecard.lastUpdated).toLocaleDateString()}
            </p>
            <div className="flex items-center justify-center gap-1 mt-2">
              <span className="text-sm">Trend:</span>
              {getTrendIcon(scorecard.trend)}
              <span className="text-sm capitalize">{scorecard.trend}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Category Breakdown */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Object.entries(scorecard.categories).map(([category, score]) => {
          const Icon = categoryIcons[category as keyof typeof categoryIcons];
          const colorClass = categoryColors[category as keyof typeof categoryColors];
          
          return (
            <Card key={category}>
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center justify-between text-base">
                  <div className="flex items-center gap-2">
                    <Icon className={`h-4 w-4 ${colorClass}`} />
                    <span className="capitalize">{category}</span>
                  </div>
                  <Badge variant={getScoreVariant(score)}>
                    {score}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Progress value={score} className="h-2" />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>0</span>
                    <span className={getScoreColor(score)}>{score}/100</span>
                    <span>100</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Risk Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Risk Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {Object.values(scorecard.categories).filter(score => score >= 80).length}
              </div>
              <div className="text-sm text-muted-foreground">Low Risk Areas</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {Object.values(scorecard.categories).filter(score => score >= 60 && score < 80).length}
              </div>
              <div className="text-sm text-muted-foreground">Medium Risk Areas</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {Object.values(scorecard.categories).filter(score => score < 60).length}
              </div>
              <div className="text-sm text-muted-foreground">High Risk Areas</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
