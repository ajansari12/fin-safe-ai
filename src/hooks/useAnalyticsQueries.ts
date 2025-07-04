import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { advancedAnalyticsService, type PredictiveMetric, type RealTimeAlert, type AnalyticsInsight } from '@/services/enhanced-analytics-service';
import { dataAvailabilityService, type DataAvailabilityStatus } from '@/services/data-availability-service';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { toast } from 'sonner';

export const useDataAvailability = () => {
  const { profile } = useAuth();
  const { handleError } = useErrorHandler();

  return useQuery({
    queryKey: ['dataAvailability', profile?.organization_id],
    queryFn: async () => {
      try {
        return await dataAvailabilityService.checkDataAvailability(profile?.organization_id!);
      } catch (error) {
        console.error('Data availability check failed:', error);
        handleError(error, 'checking data availability');
        // Return default value instead of throwing to prevent error boundary trigger
        return { readyForPredictive: false, dataScore: 0, issues: ['Service unavailable'] };
      }
    },
    enabled: !!profile?.organization_id,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000)
  });
};

export const usePredictiveMetrics = (enabled: boolean = true) => {
  const { profile } = useAuth();
  const { handleError } = useErrorHandler();

  return useQuery({
    queryKey: ['predictiveMetrics', profile?.organization_id],
    queryFn: async () => {
      try {
        return await advancedAnalyticsService.getPredictiveMetrics(profile?.organization_id!);
      } catch (error) {
        console.error('Predictive metrics generation failed:', error);
        handleError(error, 'generating predictive metrics');
        // Return empty array instead of throwing to prevent error boundary trigger
        return [];
      }
    },
    enabled: !!profile?.organization_id && enabled,
    staleTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(2000 * 2 ** attemptIndex, 60000)
  });
};

export const useRealTimeAlerts = (enabled: boolean = true) => {
  const { profile } = useAuth();
  const { handleError } = useErrorHandler();

  return useQuery({
    queryKey: ['realTimeAlerts', profile?.organization_id],
    queryFn: async () => {
      try {
        const result = await advancedAnalyticsService.getRealTimeAlerts(profile?.organization_id!);
        if (!result) {
          console.warn('Real-time alerts query returned undefined/null');
          return [];
        }
        return result;
      } catch (error) {
        console.error('Real-time alerts fetch failed:', error);
        handleError(error, 'fetching real-time alerts');
        // Return empty array instead of throwing to prevent error boundary trigger
        return [];
      }
    },
    enabled: !!profile?.organization_id && enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 5 * 60 * 1000, // Refresh every 5 minutes
    refetchOnWindowFocus: false,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000)
  });
};

export const useAnalyticsInsights = (enabled: boolean = true) => {
  const { profile } = useAuth();
  const { handleError } = useErrorHandler();

  return useQuery({
    queryKey: ['analyticsInsights', profile?.organization_id],
    queryFn: async () => {
      try {
        return await advancedAnalyticsService.generateAutomatedInsights(profile?.organization_id!);
      } catch (error) {
        console.error('Analytics insights generation failed:', error);
        handleError(error, 'generating analytics insights');
        // Return empty array instead of throwing to prevent error boundary trigger
        return [];
      }
    },
    enabled: !!profile?.organization_id && enabled,
    staleTime: 15 * 60 * 1000, // 15 minutes
    refetchOnWindowFocus: false,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(3000 * 2 ** attemptIndex, 60000)
  });
};