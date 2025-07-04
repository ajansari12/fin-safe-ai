
import React from "react";
import { useControlsDashboardData } from "@/hooks/useControlsDashboardData";
import { useRealtimeSubscription } from "@/hooks/useRealtimeSubscription";
import { useErrorHandler } from "@/hooks/useErrorHandler";
import { AsyncWrapper } from "@/components/common";
import { DashboardSkeleton } from "@/components/common/SkeletonLoaders";
import DashboardMetrics from "./DashboardMetrics";
import ControlsCharts from "./ControlsCharts";
import KRIBreachesTrendChart from "./KRIBreachesTrendChart";
import KRIVarianceChart from "./KRIVarianceChart";
import KRIAppetiteBreaches from "./KRIAppetiteBreaches";

const ControlsDashboard: React.FC = () => {
  const {
    controls,
    kris,
    breachesData,
    isLoading,
    error,
    controlsByStatus,
    controlsByFrequency,
    activeControls,
    activeKris,
    controlCoverage,
    refetch
  } = useControlsDashboardData();

  const { handleError } = useErrorHandler();

  // Enable realtime updates for critical data
  useRealtimeSubscription({
    table: 'controls',
    onUpdate: () => refetch?.(),
    onInsert: () => refetch?.(),
    enabled: !isLoading
  });

  useRealtimeSubscription({
    table: 'kri_logs',
    onInsert: () => refetch?.(),
    enabled: !isLoading
  });

  useRealtimeSubscription({
    table: 'appetite_breach_logs',
    onInsert: () => refetch?.(),
    enabled: !isLoading
  });

  return (
    <AsyncWrapper 
      loading={isLoading} 
      error={error}
      loadingComponent={<DashboardSkeleton />}
      retryAction={refetch}
    >
      <div className="space-y-6">
        {/* Key Metrics */}
        <DashboardMetrics
          controlsCount={controls.length}
          activeControls={activeControls}
          activeKris={activeKris}
          totalKris={kris.length}
          controlCoverage={controlCoverage}
          recentBreaches={breachesData.reduce((sum, day) => sum + day.total, 0)}
        />

        {/* Variance analysis section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <KRIVarianceChart />
          <KRIAppetiteBreaches />
        </div>

        {/* Controls Charts */}
        <ControlsCharts
          statusData={Object.entries(controlsByStatus).map(([status, count]) => ({
            name: status.replace('_', ' '),
            value: count
          }))}
          frequencyData={Object.entries(controlsByFrequency).map(([frequency, count]) => ({
            name: frequency,
            count
          }))}
        />

        {/* KRI Breaches Trend */}
        <KRIBreachesTrendChart breachesData={breachesData} />
      </div>
    </AsyncWrapper>
  );
};

export default ControlsDashboard;
