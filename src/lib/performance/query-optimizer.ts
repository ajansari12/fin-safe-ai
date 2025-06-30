
import { QueryClient } from '@tanstack/react-query';
import { CacheManager } from './cache-utils';

// Optimized query functions for large datasets
export class QueryOptimizer {
  private static queryClient: QueryClient;

  static setQueryClient(client: QueryClient) {
    this.queryClient = client;
  }

  // Paginated query with caching
  static async getPaginatedData<T>(
    queryKey: string[],
    fetchFn: (page: number, pageSize: number) => Promise<{ data: T[]; total: number }>,
    page: number = 1,
    pageSize: number = 50
  ) {
    const cacheKey = `${queryKey.join('_')}_${page}_${pageSize}`;
    
    // Check cache first
    const cached = CacheManager.get<{ data: T[]; total: number }>(cacheKey);
    if (cached) {
      return cached;
    }

    // Fetch from API
    const result = await fetchFn(page, pageSize);
    
    // Cache the result
    CacheManager.set(cacheKey, result, 300); // 5 minutes
    
    return result;
  }

  // Batch update queries
  static batchUpdateQueries(updates: Array<{ queryKey: string[], data: any }>) {
    updates.forEach(({ queryKey, data }) => {
      this.queryClient.setQueryData(queryKey, data);
      // Invalidate related cache entries
      CacheManager.invalidate(queryKey.join('_'));
    });
  }

  // Prefetch related data
  static async prefetchRelatedData(queryKey: string[], prefetchFn: () => Promise<any>) {
    const cacheKey = `prefetch_${queryKey.join('_')}`;
    
    if (!CacheManager.get(cacheKey)) {
      const data = await prefetchFn();
      CacheManager.set(cacheKey, data, 600); // 10 minutes
      
      // Also set in React Query cache
      this.queryClient.setQueryData(queryKey, data);
    }
  }

  // Debounced search
  static createDebouncedSearch<T>(
    searchFn: (query: string) => Promise<T[]>,
    delay: number = 300
  ) {
    let timeoutId: NodeJS.Timeout;
    const cache = new Map<string, T[]>();

    return (query: string): Promise<T[]> => {
      return new Promise((resolve) => {
        clearTimeout(timeoutId);
        
        // Check cache first
        if (cache.has(query)) {
          resolve(cache.get(query)!);
          return;
        }

        timeoutId = setTimeout(async () => {
          try {
            const results = await searchFn(query);
            cache.set(query, results);
            resolve(results);
          } catch (error) {
            console.error('Search error:', error);
            resolve([]);
          }
        }, delay);
      });
    };
  }
}
