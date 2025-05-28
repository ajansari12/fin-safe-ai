
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, TrendingUp, TrendingDown } from "lucide-react";
import { getVarianceSummary } from "@/services/kri-appetite-service";

interface VarianceSummary {
  within_appetite: number;
  warning: number;
  breach: number;
  total: number;
}

const KRIVarianceCard: React.FC = () => {
  const [summary, setSummary] = useState<VarianceSummary>({
    within_appetite: 0,
    warning: 0,
    breach: 0,
    total: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadSummary = async () => {
      try {
        setIsLoading(true);
        const data = await getVarianceSummary();
        setSummary(data);
      } catch (error) {
        console.error('Error loading variance summary:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSummary();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'breach':
        return 'bg-red-500';
      case 'warning':
        return 'bg-yellow-500';
      default:
        return 'bg-green-500';
    }
  };

  const withinAppetitePercentage = summary.total > 0 ? (summary.within_appetite / summary.total) * 100 : 0;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>KRI vs Risk Appetite</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-2">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-8 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">KRI vs Risk Appetite</CardTitle>
        {summary.breach > 0 ? (
          <AlertTriangle className="h-4 w-4 text-red-500" />
        ) : summary.warning > 0 ? (
          <TrendingUp className="h-4 w-4 text-yellow-500" />
        ) : (
          <TrendingDown className="h-4 w-4 text-green-500" />
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <div className="text-2xl font-bold">
              {withinAppetitePercentage.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Within appetite (last 30 days)
            </p>
            <Progress value={withinAppetitePercentage} className="mt-2" />
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="text-center">
              <Badge className="bg-green-500 text-white">
                {summary.within_appetite}
              </Badge>
              <p className="text-xs text-muted-foreground mt-1">Normal</p>
            </div>
            <div className="text-center">
              <Badge className="bg-yellow-500 text-white">
                {summary.warning}
              </Badge>
              <p className="text-xs text-muted-foreground mt-1">Warning</p>
            </div>
            <div className="text-center">
              <Badge className="bg-red-500 text-white">
                {summary.breach}
              </Badge>
              <p className="text-xs text-muted-foreground mt-1">Breach</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default KRIVarianceCard;
