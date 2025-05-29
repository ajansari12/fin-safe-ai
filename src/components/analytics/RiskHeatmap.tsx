
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Thermometer } from "lucide-react";
import { getRiskHeatmapData, type RiskHeatmap } from "@/services/analytics-service";

const RiskHeatmap: React.FC = () => {
  const { data: heatmapData, isLoading } = useQuery({
    queryKey: ['riskHeatmap'],
    queryFn: getRiskHeatmapData,
    refetchInterval: 10 * 60 * 1000 // Refresh every 10 minutes
  });

  const getRiskColor = (score: number) => {
    if (score >= 80) return 'bg-red-500';
    if (score >= 60) return 'bg-orange-500';
    if (score >= 40) return 'bg-yellow-500';
    if (score >= 20) return 'bg-green-500';
    return 'bg-gray-300';
  };

  const getRiskLabel = (score: number) => {
    if (score >= 80) return 'Critical';
    if (score >= 60) return 'High';
    if (score >= 40) return 'Medium';
    if (score >= 20) return 'Low';
    return 'Very Low';
  };

  const getRiskBadgeVariant = (score: number) => {
    if (score >= 80) return 'destructive';
    if (score >= 60) return 'destructive';
    if (score >= 40) return 'outline';
    return 'secondary';
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Thermometer className="h-5 w-5" />
            Risk Heatmap
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 animate-pulse bg-gray-100 rounded" />
        </CardContent>
      </Card>
    );
  }

  const categories = ['operational', 'cyber', 'vendor', 'compliance', 'financial'] as const;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Thermometer className="h-5 w-5" />
          Risk Heatmap by Department
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Risk levels across departments and categories
        </p>
      </CardHeader>
      <CardContent>
        {heatmapData && heatmapData.length > 0 ? (
          <div className="space-y-4">
            {/* Legend */}
            <div className="flex items-center gap-4 text-xs">
              <span className="font-medium">Risk Level:</span>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-gray-300 rounded"></div>
                <span>Very Low</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-green-500 rounded"></div>
                <span>Low</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                <span>Medium</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-orange-500 rounded"></div>
                <span>High</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-red-500 rounded"></div>
                <span>Critical</span>
              </div>
            </div>

            {/* Heatmap Grid */}
            <div className="overflow-x-auto">
              <div className="min-w-full">
                {/* Header */}
                <div className="grid grid-cols-7 gap-2 mb-2">
                  <div className="text-sm font-medium">Department</div>
                  {categories.map(category => (
                    <div key={category} className="text-xs font-medium text-center capitalize">
                      {category}
                    </div>
                  ))}
                  <div className="text-xs font-medium text-center">Overall</div>
                </div>

                {/* Data Rows */}
                {heatmapData.map((dept, index) => (
                  <div key={index} className="grid grid-cols-7 gap-2 mb-2 items-center">
                    <div className="text-sm font-medium truncate" title={dept.department}>
                      {dept.department}
                    </div>
                    {categories.map(category => (
                      <div key={category} className="flex justify-center">
                        <div
                          className={`w-8 h-8 rounded ${getRiskColor(dept.risk_categories[category])} flex items-center justify-center`}
                          title={`${category}: ${dept.risk_categories[category]} (${getRiskLabel(dept.risk_categories[category])})`}
                        >
                          <span className="text-xs text-white font-medium">
                            {dept.risk_categories[category]}
                          </span>
                        </div>
                      </div>
                    ))}
                    <div className="flex justify-center">
                      <Badge variant={getRiskBadgeVariant(dept.overall_score)}>
                        {dept.overall_score}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 pt-4 border-t">
              {categories.map(category => {
                const avgScore = Math.round(
                  heatmapData.reduce((sum, dept) => sum + dept.risk_categories[category], 0) / heatmapData.length
                );
                return (
                  <div key={category} className="text-center">
                    <div className="text-lg font-bold">{avgScore}</div>
                    <div className="text-xs text-muted-foreground capitalize">{category}</div>
                    <div className="text-xs text-muted-foreground">avg</div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            No risk data available for heatmap
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RiskHeatmap;
