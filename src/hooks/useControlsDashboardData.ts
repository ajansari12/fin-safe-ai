
import { useState, useEffect, useCallback, useMemo } from "react";
import { Control, getControls } from "@/services/controls";
import { KRIDefinition, getKRIDefinitions } from "@/services/kri-definitions";
import { getKRIBreachesData } from "@/services/kri-analytics-service";
import { useErrorHandler } from "./useErrorHandler";
import { cachedFetch, PerformanceMonitor } from "@/lib/performance-utils";

export const useControlsDashboardData = () => {
  const [controls, setControls] = useState<Control[]>([]);
  const [kris, setKris] = useState<KRIDefinition[]>([]);
  const [breachesData, setBreachesData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  const { handleError } = useErrorHandler();

  const loadDashboardData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const [controlsData, krisData, breaches] = await PerformanceMonitor.measureAsync(
        'Dashboard Data Load',
        () => Promise.all([
          cachedFetch('controls', getControls, 3 * 60 * 1000), // 3 minutes cache
          cachedFetch('kri-definitions', getKRIDefinitions, 3 * 60 * 1000),
          cachedFetch('kri-breaches', getKRIBreachesData, 1 * 60 * 1000) // 1 minute cache for breaches
        ])
      );
      
      setControls(controlsData);
      setKris(krisData);
      setBreachesData(breaches);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to load dashboard data');
      setError(error);
      handleError(error, 'Loading dashboard data');
    } finally {
      setIsLoading(false);
    }
  }, [handleError]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Memoize calculations to prevent unnecessary recalculations
  const calculatedMetrics = useMemo(() => {
    const controlsByStatus = controls.reduce((acc, control) => {
      acc[control.status] = (acc[control.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const controlsByFrequency = controls.reduce((acc, control) => {
      acc[control.frequency] = (acc[control.frequency] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const activeControls = controls.filter(c => c.status === 'active').length;
    const activeKris = kris.filter(k => k.status === 'active').length;
    const controlCoverage = controls.length > 0 ? (activeControls / controls.length) * 100 : 0;

    return {
      controlsByStatus,
      controlsByFrequency,
      activeControls,
      activeKris,
      controlCoverage
    };
  }, [controls, kris]);

  return {
    controls,
    kris,
    breachesData,
    isLoading,
    error,
    ...calculatedMetrics,
    refetch: loadDashboardData
  };
};
