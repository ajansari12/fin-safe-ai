
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { enhancedRiskAppetiteService, RiskPostureData } from '@/services/enhanced-risk-appetite-service';

const RiskPostureHeatmap: React.FC = () => {
  const [heatmapData, setHeatmapData] = useState<RiskPostureData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadHeatmapData();
  }, []);

  const loadHeatmapData = async () => {
    setIsLoading(true);
    try {
      const data = await enhancedRiskAppetiteService.getRiskPostureHeatmap();
      setHeatmapData(data);
    } catch (error) {
      console.error('Error loading heatmap data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getSeverityIntensity = (count: number, maxCount: number) => {
    const intensity = count / maxCount;
    return `opacity-${Math.max(20, Math.min(100, Math.floor(intensity * 100)))
      .toString().padStart(2, '0')}`;
  };

  const categories = [...new Set(heatmapData.map(d => d.category))];
  const severities = ['low', 'medium', 'high', 'critical'];
  const maxCount = Math.max(...heatmapData.map(d => d.count), 1);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Risk Posture Heatmap</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Risk Posture Heatmap</CardTitle>
        <p className="text-sm text-muted-foreground">
          Open breaches by category and severity
        </p>
      </CardHeader>
      <CardContent>
        {categories.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No active breaches found
          </div>
        ) : (
          <div className="space-y-4">
            {/* Legend */}
            <div className="flex items-center gap-4 text-sm">
              <span>Severity:</span>
              {severities.map((severity) => (
                <div key={severity} className="flex items-center gap-1">
                  <div className={`w-3 h-3 rounded ${getSeverityColor(severity)}`}></div>
                  <span className="capitalize">{severity}</span>
                </div>
              ))}
            </div>

            {/* Heatmap Grid */}
            <div className="overflow-x-auto">
              <div className="min-w-fit">
                {/* Header */}
                <div className="grid grid-cols-5 gap-2 mb-2">
                  <div className="font-medium text-sm">Category</div>
                  {severities.map((severity) => (
                    <div key={severity} className="font-medium text-sm text-center capitalize">
                      {severity}
                    </div>
                  ))}
                </div>

                {/* Data Rows */}
                {categories.map((category) => (
                  <div key={category} className="grid grid-cols-5 gap-2 mb-2">
                    <div className="text-sm font-medium truncate" title={category}>
                      {category}
                    </div>
                    {severities.map((severity) => {
                      const dataPoint = heatmapData.find(
                        d => d.category === category && d.severity === severity
                      );
                      const count = dataPoint?.count || 0;
                      const variance = dataPoint?.variance_percentage || 0;

                      return (
                        <div
                          key={`${category}-${severity}`}
                          className={`
                            relative h-12 rounded border border-gray-200 flex items-center justify-center
                            ${count > 0 ? getSeverityColor(severity) : 'bg-gray-50'}
                            ${count > 0 ? getSeverityIntensity(count, maxCount) : ''}
                            transition-all hover:scale-105 cursor-help
                          `}
                          title={
                            count > 0 
                              ? `${count} breach(es), Max variance: ${variance.toFixed(1)}%`
                              : 'No breaches'
                          }
                        >
                          {count > 0 && (
                            <div className="text-white font-bold text-sm">
                              {count}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>

            {/* Summary Stats */}
            <div className="flex gap-4 text-sm">
              <Badge variant="outline">
                Total Categories: {categories.length}
              </Badge>
              <Badge variant="outline">
                Active Breaches: {heatmapData.reduce((sum, d) => sum + d.count, 0)}
              </Badge>
              <Badge variant="outline">
                Max Variance: {Math.max(...heatmapData.map(d => d.variance_percentage), 0).toFixed(1)}%
              </Badge>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RiskPostureHeatmap;
