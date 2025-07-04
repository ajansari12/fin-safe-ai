import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { advancedAnalyticsService, type PredictiveMetric, type RealTimeAlert, type AnalyticsInsight } from '@/services/enhanced-analytics-service';
import { dataAvailabilityService, type DataAvailabilityStatus } from '@/services/data-availability-service';

export const useDataAvailability = () => {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ['dataAvailability', profile?.organization_id],
    queryFn: () => dataAvailabilityService.checkDataAvailability(profile?.organization_id!),
    enabled: !!profile?.organization_id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    retry: 2,
  });
};

export const usePredictiveMetrics = (enabled: boolean = true) => {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ['predictiveMetrics', profile?.organization_id],
    queryFn: () => advancedAnalyticsService.getPredictiveMetrics(profile?.organization_id!),
    enabled: !!profile?.organization_id && enabled,
    staleTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    retry: 1,
  });
};

export const useRealTimeAlerts = (enabled: boolean = true) => {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ['realTimeAlerts', profile?.organization_id],
    queryFn: () => advancedAnalyticsService.getRealTimeAlerts(profile?.organization_id!),
    enabled: !!profile?.organization_id && enabled,
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 30 * 1000, // Refresh every 30 seconds
    refetchOnWindowFocus: true,
    retry: 1,
  });
};

export const useAnalyticsInsights = (enabled: boolean = true) => {
  const { profile } = useAuth();

  return useQuery({
    queryKey: ['analyticsInsights', profile?.organization_id],
    queryFn: () => advancedAnalyticsService.generateAutomatedInsights(profile?.organization_id!),
    enabled: !!profile?.organization_id && enabled,
    staleTime: 15 * 60 * 1000, // 15 minutes
    refetchOnWindowFocus: false,
    retry: 2,
  });
};