import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, 
  Target, 
  CheckCircle, 
  TrendingUp,
  Activity,
  BarChart3
} from 'lucide-react';
import { AdvancedAnalyticsData } from '@/hooks/useAdvancedAnalytics';

interface PerformanceDashboardProps {
  performanceMetrics: AdvancedAnalyticsData['performanceMetrics'];
  isLoading?: boolean;
}

const PerformanceDashboard = ({ performanceMetrics, isLoading }: PerformanceDashboardProps) => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getProgressColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getPerformanceLevel = (score: number) => {
    if (score >= 90) return { label: 'Excellent', color: 'bg-green-100 text-green-800' };
    if (score >= 80) return { label: 'Good', color: 'bg-green-100 text-green-700' };
    if (score >= 70) return { label: 'Fair', color: 'bg-yellow-100 text-yellow-800' };
    if (score >= 60) return { label: 'Needs Improvement', color: 'bg-orange-100 text-orange-800' };
    return { label: 'Critical', color: 'bg-red-100 text-red-800' };
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Performance Dashboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="animate-pulse space-y-3">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-2 bg-gray-200 rounded w-full"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const metrics = [
    {
      title: 'Control Effectiveness',
      value: performanceMetrics.controlEffectiveness,
      icon: Shield,
      description: 'Percentage of active controls'
    },
    {
      title: 'Risk Coverage',
      value: performanceMetrics.riskCoverage,
      icon: Target,
      description: 'KRI monitoring coverage'
    },
    {
      title: 'Compliance Score',
      value: performanceMetrics.complianceScore,
      icon: CheckCircle,
      description: 'Overall compliance rating'
    },
    {
      title: 'Trend Velocity',
      value: performanceMetrics.trendVelocity,
      icon: TrendingUp,
      description: 'Rate of improvement'
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Performance Dashboard
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {metrics.map((metric, index) => {
            const Icon = metric.icon;
            const performanceLevel = getPerformanceLevel(metric.value);
            
            return (
              <div key={index} className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium text-sm">{metric.title}</span>
                  </div>
                  <Badge className={performanceLevel.color}>
                    {performanceLevel.label}
                  </Badge>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className={`text-2xl font-bold ${getScoreColor(metric.value)}`}>
                      {metric.value.toFixed(1)}%
                    </span>
                    <Activity className="h-4 w-4 text-muted-foreground" />
                  </div>
                  
                  <Progress 
                    value={metric.value} 
                    className="h-2"
                  />
                  
                  <p className="text-xs text-muted-foreground">
                    {metric.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Overall Health Score */}
        <div className="mt-6 pt-6 border-t">
          <div className="text-center space-y-2">
            <h3 className="font-semibold">Overall Health Score</h3>
            <div className="flex items-center justify-center gap-4">
              <div className="text-3xl font-bold text-primary">
                {((performanceMetrics.controlEffectiveness + 
                   performanceMetrics.riskCoverage + 
                   performanceMetrics.complianceScore + 
                   performanceMetrics.trendVelocity) / 4).toFixed(1)}%
              </div>
              <Badge className={getPerformanceLevel(
                (performanceMetrics.controlEffectiveness + 
                 performanceMetrics.riskCoverage + 
                 performanceMetrics.complianceScore + 
                 performanceMetrics.trendVelocity) / 4
              ).color}>
                {getPerformanceLevel(
                  (performanceMetrics.controlEffectiveness + 
                   performanceMetrics.riskCoverage + 
                   performanceMetrics.complianceScore + 
                   performanceMetrics.trendVelocity) / 4
                ).label}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Combined performance across all metrics
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PerformanceDashboard;