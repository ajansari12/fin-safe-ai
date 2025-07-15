// Enhanced cache utilities for performance optimization
export class CacheManager {
  private static cache = new Map<string, { data: any; timestamp: number; ttl: number; accessCount: number; lastAccessed: number }>();
  private static maxSize = 1000;
  private static hitCount = 0;
  private static missCount = 0;
  
  // Tiered TTL based on data type
  static TTL = {
    SHORT: 60 * 1000,      // 1 minute
    MEDIUM: 5 * 60 * 1000, // 5 minutes
    LONG: 30 * 60 * 1000,  // 30 minutes
    PERSISTENT: 60 * 60 * 1000, // 1 hour
  };
  
  static set(key: string, data: any, ttlSeconds: number = 300) {
    // LRU eviction if cache is full
    if (this.cache.size >= this.maxSize) {
      this.evictLRU();
    }
    
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttlSeconds * 1000,
      accessCount: 1,
      lastAccessed: Date.now()
    });
  }
  
  static get<T>(key: string): T | null {
    const cached = this.cache.get(key);
    if (!cached) {
      this.missCount++;
      return null;
    }
    
    if (Date.now() - cached.timestamp > cached.ttl) {
      this.cache.delete(key);
      this.missCount++;
      return null;
    }
    
    // Update access statistics
    cached.accessCount++;
    cached.lastAccessed = Date.now();
    this.hitCount++;
    
    return cached.data;
  }
  
  static invalidate(pattern: string) {
    const keys = Array.from(this.cache.keys());
    keys.forEach(key => {
      if (key.includes(pattern)) {
        this.cache.delete(key);
      }
    });
  }
  
  static clear() {
    this.cache.clear();
    this.hitCount = 0;
    this.missCount = 0;
  }
  
  // Get cache statistics
  static getStats() {
    const totalRequests = this.hitCount + this.missCount;
    return {
      size: this.cache.size,
      hitRate: totalRequests > 0 ? (this.hitCount / totalRequests) * 100 : 0,
      hitCount: this.hitCount,
      missCount: this.missCount,
      totalRequests,
    };
  }
  
  // LRU eviction
  private static evictLRU() {
    let oldestKey = '';
    let oldestAccess = Date.now();
    
    for (const [key, entry] of this.cache.entries()) {
      if (entry.lastAccessed < oldestAccess) {
        oldestAccess = entry.lastAccessed;
        oldestKey = key;
      }
    }
    
    if (oldestKey) {
      this.cache.delete(oldestKey);
    }
  }
  
  // Prefetch data in background
  static async prefetch<T>(key: string, fetchFn: () => Promise<T>, ttlSeconds: number = 300): Promise<void> {
    if (!this.cache.has(key)) {
      try {
        const data = await fetchFn();
        this.set(key, data, ttlSeconds);
      } catch (error) {
        console.error('Prefetch error:', error);
      }
    }
  }
}

// Enhanced React Query cache configuration
export const queryClientConfig = {
  defaultOptions: {
    queries: {
      staleTime: CacheManager.TTL.MEDIUM, // 5 minutes
      gcTime: CacheManager.TTL.PERSISTENT, // 1 hour (was cacheTime)
      retry: 3,
      retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000),
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: 'always',
    },
    mutations: {
      retry: 1,
    },
  },
};