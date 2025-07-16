// Simplified performance utilities for essential caching only

// Basic cache implementation
class MemoryCache {
  private cache: Map<string, { data: any; expiry: number }> = new Map();
  private defaultTTL = 5 * 60 * 1000; // 5 minutes default

  set(key: string, data: any, ttl: number = this.defaultTTL): void {
    const expiry = Date.now() + ttl;
    this.cache.set(key, { data, expiry });
  }

  get(key: string): any | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    if (Date.now() > cached.expiry) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }
}

// Global cache instance
export const dataCache = new MemoryCache();

// Disabled performance monitoring for stability
export const performanceMonitor = {
  startTiming: (operation: string) => () => {}, // No-op
  getAverageTime: (operation: string) => 0,
  getAllMetrics: () => ({})
};

// Disabled PerformanceMonitor class for stability
export class PerformanceMonitor {
  static start(label: string): void {} // No-op
  static end(label: string): number { return 0; } // No-op
  static async measureAsync<T>(label: string, fn: () => Promise<T>): Promise<T> {
    return await fn(); // Just execute without monitoring
  }
}

// Simple data fetching with basic caching
export async function cachedFetch<T>(
  key: string,
  fetchFunction: () => Promise<T>,
  ttl: number = 5 * 60 * 1000 // 5 minutes default
): Promise<T> {
  // Check cache first
  const cached = dataCache.get(key);
  if (cached) {
    return cached;
  }

  try {
    const data = await fetchFunction();
    dataCache.set(key, data, ttl);
    return data;
  } catch (error) {
    console.error(`Error fetching ${key}:`, error);
    throw error;
  }
}

// Disabled monitoring functions for stability
export function logBundleMetrics(): void {} // No-op
export function monitorMemoryUsage(): void {} // No-op
