import { useCallback, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useErrorHandler } from '@/hooks/useErrorHandler';

interface RetryConfig {
  maxRetries: number;
  initialDelay: number;
  maxDelay: number;
  exponentialBase: number;
  jitter: boolean;
}

interface QueryOptions {
  retryConfig?: Partial<RetryConfig>;
  cacheKey?: string;
  cacheTTL?: number;
  enableOfflineMode?: boolean;
}

interface CachedData {
  data: any;
  timestamp: number;
  ttl: number;
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  initialDelay: 1000,
  maxDelay: 10000,
  exponentialBase: 2,
  jitter: true
};

export const useResilientQuery = () => {
  const { handleError } = useErrorHandler();
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const cache = useRef<Map<string, CachedData>>(new Map());
  const activeQueries = useRef<Map<string, Promise<any>>>(new Map());

  // Monitor online/offline status
  useState(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  });

  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const calculateDelay = (attempt: number, config: RetryConfig) => {
    const exponentialDelay = config.initialDelay * Math.pow(config.exponentialBase, attempt);
    const cappedDelay = Math.min(exponentialDelay, config.maxDelay);
    
    if (config.jitter) {
      // Add random jitter to prevent thundering herd
      const jitter = Math.random() * 0.3 * cappedDelay;
      return cappedDelay + jitter;
    }
    
    return cappedDelay;
  };

  const isRetryableError = (error: any): boolean => {
    // Network errors
    if (error.message?.includes('network') || error.message?.includes('fetch')) {
      return true;
    }
    
    // Supabase specific retryable errors
    if (error.code) {
      const retryableCodes = ['08P01', '53300', '57014', '57P01'];
      return retryableCodes.includes(error.code);
    }
    
    // HTTP status codes that are retryable
    if (error.status) {
      return error.status >= 500 || error.status === 429;
    }
    
    return false;
  };

  const getFromCache = (key: string): any | null => {
    const cached = cache.current.get(key);
    if (!cached) return null;
    
    if (Date.now() - cached.timestamp > cached.ttl) {
      cache.current.delete(key);
      return null;
    }
    
    return cached.data;
  };

  const setCache = (key: string, data: any, ttl: number) => {
    cache.current.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  };

  const executeQuery = useCallback(async <T>(
    queryFn: () => Promise<{ data: T; error: any }>,
    options: QueryOptions = {}
  ): Promise<{ data: T | null; error: any; fromCache: boolean }> => {
    const config = { ...DEFAULT_RETRY_CONFIG, ...options.retryConfig };
    const cacheKey = options.cacheKey;
    const cacheTTL = options.cacheTTL || 300000; // 5 minutes default
    
    // Check cache first
    if (cacheKey) {
      const cachedData = getFromCache(cacheKey);
      if (cachedData) {
        return { data: cachedData, error: null, fromCache: true };
      }
    }

    // Deduplicate identical queries
    if (cacheKey && activeQueries.current.has(cacheKey)) {
      const result = await activeQueries.current.get(cacheKey)!;
      return { ...result, fromCache: false };
    }

    const queryPromise = (async () => {
      let lastError: any = null;
      
      for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
        try {
          // If offline and offline mode is enabled, return cached data
          if (!isOnline && options.enableOfflineMode && cacheKey) {
            const cachedData = getFromCache(cacheKey);
            if (cachedData) {
              return { data: cachedData, error: null, fromCache: true };
            }
          }

          const result = await queryFn();
          
          if (result.error) {
            lastError = result.error;
            
            if (attempt < config.maxRetries && isRetryableError(result.error)) {
              const delay = calculateDelay(attempt, config);
              console.warn(`Query failed (attempt ${attempt + 1}/${config.maxRetries + 1}), retrying in ${delay}ms:`, result.error);
              await sleep(delay);
              continue;
            }
            
            // If we have cached data and this is a network error, return cached data
            if (cacheKey && !isOnline) {
              const cachedData = getFromCache(cacheKey);
              if (cachedData) {
                console.warn('Using cached data due to network error:', result.error);
                return { data: cachedData, error: null, fromCache: true };
              }
            }
            
            return { data: null, error: result.error, fromCache: false };
          }
          
          // Cache successful result
          if (cacheKey && result.data) {
            setCache(cacheKey, result.data, cacheTTL);
          }
          
          return { data: result.data, error: null, fromCache: false };
        } catch (error) {
          lastError = error;
          
          if (attempt < config.maxRetries && isRetryableError(error)) {
            const delay = calculateDelay(attempt, config);
            console.warn(`Query failed (attempt ${attempt + 1}/${config.maxRetries + 1}), retrying in ${delay}ms:`, error);
            await sleep(delay);
            continue;
          }
          
          // If we have cached data, return it as a fallback
          if (cacheKey) {
            const cachedData = getFromCache(cacheKey);
            if (cachedData) {
              console.warn('Using cached data due to error:', error);
              return { data: cachedData, error: null, fromCache: true };
            }
          }
          
          break;
        }
      }
      
      // All retries failed
      handleError(lastError, 'resilient query');
      return { data: null, error: lastError, fromCache: false };
    })();

    // Track active query
    if (cacheKey) {
      activeQueries.current.set(cacheKey, queryPromise);
      queryPromise.finally(() => {
        activeQueries.current.delete(cacheKey);
      });
    }

    return queryPromise;
  }, [handleError, isOnline]);

  const clearCache = useCallback((key?: string) => {
    if (key) {
      cache.current.delete(key);
    } else {
      cache.current.clear();
    }
  }, []);

  const getCacheStatus = useCallback(() => {
    const cacheEntries = Array.from(cache.current.entries());
    return {
      size: cache.current.size,
      entries: cacheEntries.map(([key, value]) => ({
        key,
        timestamp: value.timestamp,
        ttl: value.ttl,
        age: Date.now() - value.timestamp
      }))
    };
  }, []);

  // Helper methods for common Supabase operations
  const resilientSelect = useCallback(async <T>(
    table: string,
    query: string = '*',
    filters?: Record<string, any>,
    options?: QueryOptions
  ) => {
    const cacheKey = options?.cacheKey || `${table}-${query}-${JSON.stringify(filters)}`;
    
    return executeQuery(
      async () => {
        let supabaseQuery = supabase.from(table).select(query);
        
        if (filters) {
          Object.entries(filters).forEach(([key, value]) => {
            if (key === 'eq') {
              Object.entries(value).forEach(([col, val]) => {
                supabaseQuery = supabaseQuery.eq(col, val);
              });
            } else if (key === 'gte') {
              Object.entries(value).forEach(([col, val]) => {
                supabaseQuery = supabaseQuery.gte(col, val);
              });
            } else if (key === 'lte') {
              Object.entries(value).forEach(([col, val]) => {
                supabaseQuery = supabaseQuery.lte(col, val);
              });
            } else if (key === 'order') {
              const { column, ascending = true } = value;
              supabaseQuery = supabaseQuery.order(column, { ascending });
            } else if (key === 'limit') {
              supabaseQuery = supabaseQuery.limit(value);
            }
          });
        }
        
        return supabaseQuery;
      },
      { ...options, cacheKey }
    );
  }, [executeQuery]);

  const resilientInsert = useCallback(async <T>(
    table: string,
    data: any,
    options?: QueryOptions
  ) => {
    return executeQuery(
      async () => supabase.from(table).insert(data),
      { ...options, retryConfig: { maxRetries: 2, ...options?.retryConfig } }
    );
  }, [executeQuery]);

  const resilientUpdate = useCallback(async <T>(
    table: string,
    data: any,
    filters: Record<string, any>,
    options?: QueryOptions
  ) => {
    return executeQuery(
      async () => {
        let query = supabase.from(table).update(data);
        
        Object.entries(filters).forEach(([key, value]) => {
          if (key === 'eq') {
            Object.entries(value).forEach(([col, val]) => {
              query = query.eq(col, val);
            });
          }
        });
        
        return query;
      },
      { ...options, retryConfig: { maxRetries: 2, ...options?.retryConfig } }
    );
  }, [executeQuery]);

  return {
    executeQuery,
    resilientSelect,
    resilientInsert,
    resilientUpdate,
    clearCache,
    getCacheStatus,
    isOnline,
    connectionStatus: isOnline ? 'connected' : 'disconnected'
  };
};