import { useState, useCallback, useEffect } from 'react';
import { useQuery, useInfiniteQuery } from '@tanstack/react-query';
import { 
  performanceOptimizedQueryService,
  PaginationOptions,
  PaginatedResult,
  IncidentQueryOptions,
  KRIQueryOptions,
  AnalyticsQueryOptions
} from '@/services/performance-optimized-query-service';

export interface UsePaginationState {
  page: number;
  limit: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  totalCount: number;
  totalPages: number;
}

export interface UsePaginationActions {
  setPage: (page: number) => void;
  nextPage: () => void;
  previousPage: () => void;
  setLimit: (limit: number) => void;
  reset: () => void;
}

export const usePagination = (initialLimit = 50) => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(initialLimit);

  const reset = useCallback(() => {
    setPage(1);
  }, []);

  const nextPage = useCallback(() => {
    setPage(prev => prev + 1);
  }, []);

  const previousPage = useCallback(() => {
    setPage(prev => Math.max(1, prev - 1));
  }, []);

  const updateLimit = useCallback((newLimit: number) => {
    setLimit(newLimit);
    setPage(1); // Reset to first page when changing limit
  }, []);

  return {
    page,
    limit,
    setPage,
    nextPage,
    previousPage,
    setLimit: updateLimit,
    reset
  };
};

// Hook for paginated incidents
export const usePaginatedIncidents = (options: Omit<IncidentQueryOptions, 'page' | 'limit'> = {}) => {
  const pagination = usePagination(25);
  
  const queryKey = ['incidents-paginated', pagination.page, pagination.limit, options];
  
  const query = useQuery({
    queryKey,
    queryFn: () => performanceOptimizedQueryService.getIncidentsPaginated({
      ...options,
      page: pagination.page,
      limit: pagination.limit
    }),
    staleTime: 30000, // Consider data fresh for 30 seconds
  });

  // Update pagination state when data changes
  useEffect(() => {
    if (query.data) {
      // Update pagination state based on query result if needed
    }
  }, [query.data]);

  return {
    ...query,
    pagination: {
      ...pagination,
      hasNextPage: query.data?.hasNextPage ?? false,
      hasPreviousPage: query.data?.hasPreviousPage ?? false,
      totalCount: query.data?.totalCount ?? 0,
      totalPages: query.data ? Math.ceil(query.data.totalCount / pagination.limit) : 0,
    }
  };
};

// Hook for paginated KRI logs
export const usePaginatedKRILogs = (options: Omit<KRIQueryOptions, 'page' | 'limit'> = {}) => {
  const pagination = usePagination(50);
  
  const queryKey = ['kri-logs-paginated', pagination.page, pagination.limit, options];
  
  const query = useQuery({
    queryKey,
    queryFn: () => performanceOptimizedQueryService.getKRILogsPaginated({
      ...options,
      page: pagination.page,
      limit: pagination.limit
    }),
    staleTime: 60000, // KRI data doesn't change as frequently
  });

  return {
    ...query,
    pagination: {
      ...pagination,
      hasNextPage: query.data?.hasNextPage ?? false,
      hasPreviousPage: query.data?.hasPreviousPage ?? false,
      totalCount: query.data?.totalCount ?? 0,
      totalPages: query.data ? Math.ceil(query.data.totalCount / pagination.limit) : 0,
    }
  };
};

// Hook for paginated analytics insights
export const usePaginatedAnalyticsInsights = (options: Omit<AnalyticsQueryOptions, 'page' | 'limit'> = {}) => {
  const pagination = usePagination(20);
  
  const queryKey = ['analytics-insights-paginated', pagination.page, pagination.limit, options];
  
  const query = useQuery({
    queryKey,
    queryFn: () => performanceOptimizedQueryService.getAnalyticsInsightsPaginated({
      ...options,
      page: pagination.page,
      limit: pagination.limit
    }),
    staleTime: 120000, // Analytics insights are more stable
  });

  return {
    ...query,
    pagination: {
      ...pagination,
      hasNextPage: query.data?.hasNextPage ?? false,
      hasPreviousPage: query.data?.hasPreviousPage ?? false,
      totalCount: query.data?.totalCount ?? 0,
      totalPages: query.data ? Math.ceil(query.data.totalCount / pagination.limit) : 0,
    }
  };
};

// Hook for summary data (aggregates)
export const useSummaryData = () => {
  return useQuery({
    queryKey: ['summary-data'],
    queryFn: () => performanceOptimizedQueryService.getBatchSummaries(),
    staleTime: 300000, // Cache for 5 minutes
    refetchInterval: 300000, // Auto-refresh every 5 minutes
  });
};

// Hook for incident summary only
export const useIncidentsSummary = () => {
  return useQuery({
    queryKey: ['incidents-summary'],
    queryFn: () => performanceOptimizedQueryService.getIncidentsSummary(),
    staleTime: 120000, // Cache for 2 minutes
  });
};

// Hook for KRI summary with date range
export const useKRISummary = (dateRange?: { startDate?: string; endDate?: string }) => {
  return useQuery({
    queryKey: ['kri-summary', dateRange],
    queryFn: () => performanceOptimizedQueryService.getKRISummary(dateRange),
    staleTime: 180000, // Cache for 3 minutes
  });
};

// Hook for analytics summary only
export const useAnalyticsSummary = () => {
  return useQuery({
    queryKey: ['analytics-summary'],
    queryFn: () => performanceOptimizedQueryService.getAnalyticsSummary(),
    staleTime: 240000, // Cache for 4 minutes
  });
};

// Infinite scroll hooks for large datasets
export const useInfiniteIncidents = (options: Omit<IncidentQueryOptions, 'page' | 'limit'> = {}) => {
  return useInfiniteQuery({
    queryKey: ['incidents-infinite', options],
    queryFn: ({ pageParam = 1 }) => performanceOptimizedQueryService.getIncidentsPaginated({
      ...options,
      page: pageParam,
      limit: 50
    }),
    initialPageParam: 1,
    getNextPageParam: (lastPage, pages) => {
      return lastPage.hasNextPage ? pages.length + 1 : undefined;
    },
    staleTime: 30000,
  });
};

export const useInfiniteKRILogs = (options: Omit<KRIQueryOptions, 'page' | 'limit'> = {}) => {
  return useInfiniteQuery({
    queryKey: ['kri-logs-infinite', options],
    queryFn: ({ pageParam = 1 }) => performanceOptimizedQueryService.getKRILogsPaginated({
      ...options,
      page: pageParam,
      limit: 50
    }),
    initialPageParam: 1,
    getNextPageParam: (lastPage, pages) => {
      return lastPage.hasNextPage ? pages.length + 1 : undefined;
    },
    staleTime: 60000,
  });
};

export const useInfiniteAnalyticsInsights = (options: Omit<AnalyticsQueryOptions, 'page' | 'limit'> = {}) => {
  return useInfiniteQuery({
    queryKey: ['analytics-insights-infinite', options],
    queryFn: ({ pageParam = 1 }) => performanceOptimizedQueryService.getAnalyticsInsightsPaginated({
      ...options,
      page: pageParam,
      limit: 25
    }),
    initialPageParam: 1,
    getNextPageParam: (lastPage, pages) => {
      return lastPage.hasNextPage ? pages.length + 1 : undefined;
    },
    staleTime: 120000,
  });
};