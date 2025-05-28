
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import KRIVarianceCard from "./KRIVarianceCard";

interface DashboardMetricsProps {
  controlsCount: number;
  activeControls: number;
  activeKris: number;
  totalKris: number;
  controlCoverage: number;
  recentBreaches: number;
}

const DashboardMetrics: React.FC<DashboardMetricsProps> = ({
  controlsCount,
  activeControls,
  activeKris,
  totalKris,
  controlCoverage,
  recentBreaches
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Controls</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{controlsCount}</div>
          <p className="text-xs text-muted-foreground">
            {activeControls} active
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active KRIs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{activeKris}</div>
          <p className="text-xs text-muted-foreground">
            of {totalKris} total
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Control Coverage</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{controlCoverage.toFixed(1)}%</div>
          <Progress value={controlCoverage} className="mt-2" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Recent Breaches</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{recentBreaches}</div>
          <p className="text-xs text-muted-foreground">
            Last 30 days
          </p>
        </CardContent>
      </Card>

      <KRIVarianceCard />
    </div>
  );
};

export default DashboardMetrics;
