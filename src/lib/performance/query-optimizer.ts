
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

  // Infinite scroll with optimized caching
  static createInfiniteQuery<T>(
    queryKey: string,
    fetchFn: (page: number, pageSize: number) => Promise<{ data: T[]; hasNextPage: boolean; totalCount: number }>,
    pageSize: number = 50
  ) {
    const cache = new Map<string, { data: T[]; hasNextPage: boolean; totalCount: number }>();
    let currentPage = 1;
    let allData: T[] = [];
    let hasNextPage = true;
    let totalCount = 0;

    return {
      async fetchNextPage(): Promise<{ data: T[]; hasNextPage: boolean; totalCount: number }> {
        if (!hasNextPage) return { data: allData, hasNextPage: false, totalCount };

        const cacheKey = `${queryKey}_${currentPage}_${pageSize}`;
        
        // Check cache first
        if (cache.has(cacheKey)) {
          const cached = cache.get(cacheKey)!;
          allData = [...allData, ...cached.data];
          hasNextPage = cached.hasNextPage;
          totalCount = cached.totalCount;
          currentPage++;
          return { data: allData, hasNextPage, totalCount };
        }

        // Fetch from API
        const result = await fetchFn(currentPage, pageSize);
        
        // Cache the result
        cache.set(cacheKey, result);
        
        // Update state
        allData = [...allData, ...result.data];
        hasNextPage = result.hasNextPage;
        totalCount = result.totalCount;
        currentPage++;
        
        return { data: allData, hasNextPage, totalCount };
      },
      
      reset() {
        currentPage = 1;
        allData = [];
        hasNextPage = true;
        totalCount = 0;
        cache.clear();
      },
      
      getCurrentData() {
        return { data: allData, hasNextPage, totalCount };
      }
    };
  }

  // Optimized data sampling for charts
  static sampleChartData<T>(data: T[], maxPoints: number = 500): T[] {
    if (data.length <= maxPoints) return data;
    
    const step = Math.floor(data.length / maxPoints);
    const sampled: T[] = [];
    
    for (let i = 0; i < data.length; i += step) {
      sampled.push(data[i]);
    }
    
    // Always include the last point
    if (sampled[sampled.length - 1] !== data[data.length - 1]) {
      sampled.push(data[data.length - 1]);
    }
    
    return sampled;
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
