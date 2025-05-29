
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Shield, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { getComplianceScorecard, type ComplianceScorecard } from "@/services/analytics-service";

const ComplianceScorecard: React.FC = () => {
  const { data: scorecard, isLoading } = useQuery({
    queryKey: ['complianceScorecard'],
    queryFn: getComplianceScorecard,
    refetchInterval: 15 * 60 * 1000 // Refresh every 15 minutes
  });

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'good': return 'secondary';
      case 'fair': return 'outline';
      case 'poor': return 'destructive';
      default: return 'outline';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getTrendIcon = (trending: string) => {
    switch (trending) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down': return <TrendingDown className="h-4 w-4 text-red-500" />;
      default: return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Compliance Scorecard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 animate-pulse bg-gray-100 rounded" />
        </CardContent>
      </Card>
    );
  }

  const categories = [
    { key: 'governance', label: 'Governance Framework' },
    { key: 'risk_management', label: 'Risk Management' },
    { key: 'incident_response', label: 'Incident Response' },
    { key: 'vendor_management', label: 'Vendor Management' },
    { key: 'business_continuity', label: 'Business Continuity' }
  ] as const;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Compliance Scorecard
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Overall compliance health across key areas
        </p>
      </CardHeader>
      <CardContent>
        {scorecard ? (
          <div className="space-y-6">
            {/* Overall Score */}
            <div className="text-center">
              <div className="relative w-32 h-32 mx-auto">
                <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    className="text-gray-200"
                  />
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    stroke="currentColor"
                    strokeWidth="8"
                    fill="transparent"
                    strokeDasharray={`${2 * Math.PI * 40}`}
                    strokeDashoffset={`${2 * Math.PI * 40 * (1 - scorecard.overall_score / 100)}`}
                    className={scorecard.overall_score >= 80 ? "text-green-500" : 
                              scorecard.overall_score >= 60 ? "text-yellow-500" : "text-red-500"}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{scorecard.overall_score}</div>
                    <div className="text-xs text-muted-foreground">Overall</div>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-center gap-2 mt-2">
                {getTrendIcon(scorecard.trending)}
                <span className="text-sm text-muted-foreground">
                  {scorecard.trending === 'up' ? 'Improving' : 
                   scorecard.trending === 'down' ? 'Declining' : 'Stable'}
                </span>
              </div>
            </div>

            {/* Category Breakdown */}
            <div className="space-y-4">
              {categories.map(({ key, label }) => {
                const category = scorecard.categories[key];
                return (
                  <div key={key} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{label}</span>
                      <div className="flex items-center gap-2">
                        <Badge variant={getStatusBadgeVariant(category.status)}>
                          {category.status}
                        </Badge>
                        <span className={`text-sm font-medium ${getScoreColor(category.score)}`}>
                          {category.score}%
                        </span>
                      </div>
                    </div>
                    <Progress value={category.score} className="h-2" />
                    <div className="text-xs text-muted-foreground">
                      Last updated: {category.last_updated}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Quick Actions */}
            <div className="pt-4 border-t">
              <h4 className="text-sm font-medium mb-2">Areas Needing Attention</h4>
              <div className="space-y-1">
                {categories
                  .filter(({ key }) => scorecard.categories[key].score < 70)
                  .map(({ key, label }) => (
                    <div key={key} className="flex items-center justify-between text-sm">
                      <span>{label}</span>
                      <Badge variant="outline">
                        {scorecard.categories[key].score}% - Needs improvement
                      </Badge>
                    </div>
                  ))}
                {categories.filter(({ key }) => scorecard.categories[key].score < 70).length === 0 && (
                  <p className="text-sm text-green-600">All areas performing well!</p>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            No compliance data available
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ComplianceScorecard;
