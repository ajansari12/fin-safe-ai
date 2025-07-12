import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Network, Activity } from 'lucide-react';
import { RiskCorrelation } from '@/hooks/useAdvancedAnalytics';

interface RiskCorrelationMatrixProps {
  correlations: RiskCorrelation[];
  isLoading?: boolean;
}

const RiskCorrelationMatrix = ({ correlations, isLoading }: RiskCorrelationMatrixProps) => {
  const getCorrelationStrength = (correlation: number) => {
    const abs = Math.abs(correlation);
    if (abs >= 0.7) return 'Strong';
    if (abs >= 0.5) return 'Moderate';
    if (abs >= 0.3) return 'Weak';
    return 'Very Weak';
  };

  const getCorrelationColor = (correlation: number) => {
    const abs = Math.abs(correlation);
    if (abs >= 0.7) return 'bg-red-100 text-red-800 border-red-200';
    if (abs >= 0.5) return 'bg-orange-100 text-orange-800 border-orange-200';
    if (abs >= 0.3) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-gray-100 text-gray-600 border-gray-200';
  };

  const getSignificanceColor = (significance: RiskCorrelation['significance']) => {
    switch (significance) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Network className="h-5 w-5" />
            Risk Correlation Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-20 bg-gray-200 rounded"></div>
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
          <Network className="h-5 w-5" />
          Risk Correlation Analysis
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {correlations.map((correlation, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg border-2 transition-all hover:shadow-md ${getCorrelationColor(correlation.correlation)}`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  <span className="font-medium text-sm">
                    {getCorrelationStrength(correlation.correlation)} Correlation
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={getSignificanceColor(correlation.significance)}>
                    {correlation.significance} significance
                  </Badge>
                  <Badge variant="outline" className="font-mono">
                    {correlation.correlation.toFixed(2)}
                  </Badge>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Source:</span>
                  <span className="font-medium">{correlation.source}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Target:</span>
                  <span className="font-medium">{correlation.target}</span>
                </div>
              </div>
              
              {/* Visual correlation indicator */}
              <div className="mt-3">
                <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                  <span>Correlation Strength</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      Math.abs(correlation.correlation) >= 0.7
                        ? 'bg-red-500'
                        : Math.abs(correlation.correlation) >= 0.5
                        ? 'bg-orange-500'
                        : Math.abs(correlation.correlation) >= 0.3
                        ? 'bg-yellow-500'
                        : 'bg-gray-400'
                    }`}
                    style={{ width: `${Math.abs(correlation.correlation) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
          
          {correlations.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Network className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No significant correlations detected</p>
              <p className="text-xs">Correlations will appear as more data is analyzed</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default RiskCorrelationMatrix;