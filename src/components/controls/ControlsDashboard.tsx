
import React from "react";
import { useControlsDashboardData } from "@/hooks/useControlsDashboardData";
import DashboardMetrics from "./DashboardMetrics";
import ControlsCharts from "./ControlsCharts";
import KRIBreachesTrendChart from "./KRIBreachesTrendChart";
import KRIVarianceChart from "./KRIVarianceChart";
import KRIAppetiteBreaches from "./KRIAppetiteBreaches";
import DashboardLoadingSkeleton from "./DashboardLoadingSkeleton";

const ControlsDashboard: React.FC = () => {
  const {
    controls,
    kris,
    breachesData,
    isLoading,
    controlsByStatus,
    controlsByFrequency,
    activeControls,
    activeKris,
    controlCoverage
  } = useControlsDashboardData();

  if (isLoading) {
    return <DashboardLoadingSkeleton />;
  }

  const statusData = Object.entries(controlsByStatus).map(([status, count]) => ({
    name: status.replace('_', ' '),
    value: count
  }));

  const frequencyData = Object.entries(controlsByFrequency).map(([frequency, count]) => ({
    name: frequency,
    count
  }));

  const recentBreachesTotal = breachesData.reduce((sum, day) => sum + day.total, 0);

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <DashboardMetrics
        controlsCount={controls.length}
        activeControls={activeControls}
        activeKris={activeKris}
        totalKris={kris.length}
        controlCoverage={controlCoverage}
        recentBreaches={recentBreachesTotal}
      />

      {/* Variance analysis section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <KRIVarianceChart />
        <KRIAppetiteBreaches />
      </div>

      {/* Controls Charts */}
      <ControlsCharts
        statusData={statusData}
        frequencyData={frequencyData}
      />

      {/* KRI Breaches Trend */}
      <KRIBreachesTrendChart breachesData={breachesData} />
    </div>
  );
};

export default ControlsDashboard;
