
import React, { memo, useMemo, useCallback } from "react";
import { useControlsDashboardData } from "@/hooks/useControlsDashboardData";
import { useRealtimeSubscription } from "@/hooks/useRealtimeSubscription";
import { useRealtimeMetrics } from "@/hooks/useRealtimeMetrics";
import { useNotificationCenter } from "@/hooks/useNotificationCenter";
import { useErrorHandler } from "@/hooks/useErrorHandler";
import { AsyncWrapper } from "@/components/common";
import { DashboardSkeleton } from "@/components/common/SkeletonLoaders";
import RealtimeIndicator from "@/components/common/RealtimeIndicator";
import DashboardMetrics from "./DashboardMetrics";
import ControlsCharts from "./ControlsCharts";
import KRIBreachesTrendChart from "./KRIBreachesTrendChart";
import KRIVarianceChart from "./KRIVarianceChart";
import KRIAppetiteBreaches from "./KRIAppetiteBreaches";

const ControlsDashboard = memo(() => {
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
  const { addNotification } = useNotificationCenter();

  // Real-time update handlers
  const handleControlUpdate = useCallback((update: any) => {
    if (update.eventType === 'UPDATE' && update.new.status !== update.old?.status) {
      addNotification({
        type: 'control',
        severity: 'medium',
        title: 'Control Status Updated',
        message: `${update.new.title || 'Unknown control'} status changed to ${update.new.status}`,
        actionUrl: `/app/controls/${update.new.id}`
      });
    }
    refetch?.();
  }, [addNotification, refetch]);

  const handleKRIUpdate = useCallback((update: any) => {
    if (update.eventType === 'INSERT' && update.new.threshold_breached) {
      addNotification({
        type: 'kri',
        severity: update.new.threshold_breached === 'critical' ? 'critical' : 'high',
        title: 'KRI Threshold Breach',
        message: `${update.new.kri_definitions?.name || 'Unknown KRI'} has breached its threshold`,
        actionUrl: `/app/kris/${update.new.kri_id}`
      });
    }
    refetch?.();
  }, [addNotification, refetch]);

  const handleBreachAlert = useCallback((update: any) => {
    if (update.eventType === 'INSERT') {
      addNotification({
        type: 'breach',
        severity: update.new.breach_severity || 'high',
        title: 'Risk Appetite Breach',
        message: `Breach detected with ${update.new.variance_percentage?.toFixed(1)}% variance`,
        actionUrl: `/app/risk-appetite/breaches/${update.new.id}`
      });
    }
    refetch?.();
  }, [addNotification, refetch]);

  // Set up real-time monitoring
  const { connectionStatus, lastUpdate, isConnected } = useRealtimeMetrics({
    onControlUpdate: handleControlUpdate,
    onKRIUpdate: handleKRIUpdate,
    onBreachAlert: handleBreachAlert,
    enabled: !isLoading
  });

  // Map reconnecting status to connecting for display
  const displayConnectionStatus = connectionStatus === 'reconnecting' ? 'connecting' : connectionStatus;

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

  // Memoize chart data to prevent unnecessary recalculations
  const statusChartData = useMemo(() => 
    Object.entries(controlsByStatus).map(([status, count]) => ({
      name: status.replace('_', ' '),
      value: count
    })), [controlsByStatus]
  );

  const frequencyChartData = useMemo(() => 
    Object.entries(controlsByFrequency).map(([frequency, count]) => ({
      name: frequency,
      count
    })), [controlsByFrequency]
  );

  return (
    <AsyncWrapper 
      loading={isLoading} 
      error={error}
      loadingComponent={<DashboardSkeleton />}
      retryAction={refetch}
    >
      <div className="space-y-6">
        {/* Header with real-time indicator */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Controls Dashboard</h2>
            <p className="text-muted-foreground">Real-time monitoring of controls and KRIs</p>
          </div>
          <RealtimeIndicator 
            connectionStatus={displayConnectionStatus}
            lastUpdate={lastUpdate}
          />
        </div>

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
          statusData={statusChartData}
          frequencyData={frequencyChartData}
        />

        {/* KRI Breaches Trend */}
        <KRIBreachesTrendChart breachesData={breachesData} />
      </div>
    </AsyncWrapper>
  );
});

ControlsDashboard.displayName = 'ControlsDashboard';

export default ControlsDashboard;
