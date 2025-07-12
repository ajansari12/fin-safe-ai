import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus, Target } from 'lucide-react';
import { TrendAnalysis } from '@/hooks/useAdvancedAnalytics';

interface TrendAnalysisCardProps {
  trends: TrendAnalysis[];
  isLoading?: boolean;
}

const TrendAnalysisCard = ({ trends, isLoading }: TrendAnalysisCardProps) => {
  const getTrendIcon = (trend: TrendAnalysis['trend']) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      case 'stable':
        return <Minus className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getTrendColor = (trend: TrendAnalysis['trend']) => {
    switch (trend) {
      case 'up':
        return 'bg-green-50 border-green-200 text-green-800';
      case 'down':
        return 'bg-red-50 border-red-200 text-red-800';
      case 'stable':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'bg-green-100 text-green-800';
    if (confidence >= 0.6) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Trend Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          Trend Analysis
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {trends.map((trend, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg border ${getTrendColor(trend.trend)}`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {getTrendIcon(trend.trend)}
                  <span className="font-medium">{trend.metric}</span>
                </div>
                <Badge className={getConfidenceColor(trend.confidence)}>
                  {Math.round(trend.confidence * 100)}% confidence
                </Badge>
              </div>
              
              <div className="flex items-center gap-4 text-sm">
                <span className="font-semibold">
                  {trend.changePercentage > 0 ? '+' : ''}
                  {trend.changePercentage.toFixed(1)}%
                </span>
                <span className="text-muted-foreground">
                  vs. previous period
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default TrendAnalysisCard;