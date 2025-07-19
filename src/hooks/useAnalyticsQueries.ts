
import { useQuery } from '@tanstack/react-query';
// TODO: Migrated from AuthContext to EnhancedAuthContext
import { useAuth } from '@/contexts/EnhancedAuthContext';
import { advancedAnalyticsService, type PredictiveMetric, type RealTimeAlert, type AnalyticsInsight } from '@/services/enhanced-analytics-service';
import { dataAvailabilityService, type DataAvailabilityStatus } from '@/services/data-availability-service';
import { aiInsightsService } from '@/services/ai-insights-service';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';

export const useDataAvailability = () => {
  const { profile } = useAuth();
  const { handleError } = useErrorHandler();

  return useQuery({
    queryKey: ['dataAvailability', profile?.organization_id],
    queryFn: async () => {
      try {
        return await dataAvailabilityService.checkDataAvailability(profile?.organization_id!);
      } catch (error) {
        logger.error('Data availability check failed', { 
          component: 'useAnalyticsQueries',
          module: 'data-availability',
          organizationId: profile?.organization_id 
        }, error as Error);
        handleError(error, 'checking data availability');
        // Return default value instead of throwing to prevent error boundary trigger
        return { 
          incidents: { count: 0, hasData: false },
          kris: { count: 0, hasData: false, withMeasurements: 0 },
          vendors: { count: 0, hasData: false, riskAssessed: 0 },
          controls: { count: 0, hasData: false, tested: 0 },
          businessFunctions: { count: 0, hasData: false },
          totalDataScore: 0,
          readyForPredictive: false
        };
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
        logger.error('Predictive metrics generation failed', { 
          component: 'useAnalyticsQueries',
          module: 'predictive-analytics',
          organizationId: profile?.organization_id 
        }, error as Error);
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
          logger.warn('Real-time alerts query returned undefined/null', { 
            component: 'useAnalyticsQueries',
            module: 'real-time-alerts',
            organizationId: profile?.organization_id 
          });
          return [];
        }
        return result;
      } catch (error) {
        logger.error('Real-time alerts fetch failed', { 
          component: 'useAnalyticsQueries',
          module: 'real-time-alerts',
          organizationId: profile?.organization_id 
        }, error as Error);
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
        // Use the new AI insights service for enhanced functionality
        return await aiInsightsService.getStoredInsights(profile?.organization_id!, 15);
      } catch (error) {
        logger.error('Analytics insights fetch failed', { 
          component: 'useAnalyticsQueries',
          module: 'ai-insights',
          organizationId: profile?.organization_id 
        }, error as Error);
        handleError(error, 'fetching analytics insights');
        // Return empty array instead of throwing to prevent error boundary trigger
        return [];
      }
    },
    enabled: !!profile?.organization_id && enabled,
    staleTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(3000 * 2 ** attemptIndex, 60000)
  });
};

// Enhanced hook for generating new insights
export const useGenerateInsights = () => {
  const { profile } = useAuth();

  return {
    generateInsights: async (analysisType: 'comprehensive' | 'compliance' | 'risk_trends' | 'controls' = 'comprehensive') => {
      if (!profile?.organization_id) {
        throw new Error('Organization ID not found');
      }

      try {
        const insights = await aiInsightsService.generateContextualInsights({
          organizationId: profile.organization_id,
          analysisType,
          timeRange: {
            startDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000),
            endDate: new Date()
          }
        });

        toast.success(`Generated ${insights.length} new AI insights`);
        return insights;
      } catch (error) {
        logger.error('Error generating insights', { 
          component: 'useAnalyticsQueries',
          module: 'generateInsights' 
        }, error as Error);
        toast.error('Failed to generate insights. Please try again.');
        throw error;
      }
    }
  };
};
