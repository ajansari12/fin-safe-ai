// Performance optimization utilities and caching strategies

import React from 'react';
import { toast } from 'sonner';

// Cache implementation with TTL (Time To Live)
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

// Performance monitoring
class PerformanceTimingMonitor {
  private metrics: Map<string, number[]> = new Map();

  startTiming(operation: string): () => void {
    const startTime = performance.now();
    
    return () => {
      const duration = performance.now() - startTime;
      this.recordMetric(operation, duration);
      
      // Warn if operation takes too long
      if (duration > 5000) {
        console.warn(`Slow operation detected: ${operation} took ${duration.toFixed(2)}ms`);
        toast.warning(`Slow loading detected for ${operation}`);
      }
    };
  }

  private recordMetric(operation: string, duration: number): void {
    if (!this.metrics.has(operation)) {
      this.metrics.set(operation, []);
    }
    
    const metrics = this.metrics.get(operation)!;
    metrics.push(duration);
    
    // Keep only last 10 measurements
    if (metrics.length > 10) {
      metrics.shift();
    }
  }

  getAverageTime(operation: string): number {
    const metrics = this.metrics.get(operation);
    if (!metrics || metrics.length === 0) return 0;
    
    const sum = metrics.reduce((a, b) => a + b, 0);
    return sum / metrics.length;
  }

  getAllMetrics(): Record<string, { average: number; count: number }> {
    const result: Record<string, { average: number; count: number }> = {};
    
    for (const [operation, metrics] of this.metrics.entries()) {
      const average = metrics.reduce((a, b) => a + b, 0) / metrics.length;
      result[operation] = { average, count: metrics.length };
    }
    
    return result;
  }
}

export const performanceMonitor = new PerformanceTimingMonitor();

// Static PerformanceMonitor for easier usage
export class PerformanceMonitor {
  private static timers = new Map<string, number>();

  static start(label: string): void {
    this.timers.set(label, performance.now());
  }

  static end(label: string): number {
    const startTime = this.timers.get(label);
    if (!startTime) {
      console.warn(`No timer found for label: ${label}`);
      return 0;
    }

    const duration = performance.now() - startTime;
    this.timers.delete(label);
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`⏱️ ${label}: ${duration.toFixed(2)}ms`);
    }
    
    return duration;
  }

  static async measureAsync<T>(label: string, fn: () => Promise<T>): Promise<T> {
    this.start(label);
    try {
      const result = await fn();
      return result;
    } finally {
      this.end(label);
    }
  }
}

// Debounced function utility
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Throttled function utility
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// Enhanced data fetching with caching and performance monitoring
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

  // Monitor performance
  const endTiming = performanceMonitor.startTiming(`fetch_${key}`);
  
  try {
    const data = await fetchFunction();
    
    // Cache the result
    dataCache.set(key, data, ttl);
    
    return data;
  } catch (error) {
    console.error(`Error fetching ${key}:`, error);
    throw error;
  } finally {
    endTiming();
  }
}

// Bundle size monitoring
export function logBundleMetrics(): void {
  if (typeof window !== 'undefined' && 'performance' in window) {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    
    const metrics = {
      domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
      loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
      firstPaint: 0,
      firstContentfulPaint: 0
    };

    // Get paint metrics if available
    const paintEntries = performance.getEntriesByType('paint');
    for (const entry of paintEntries) {
      if (entry.name === 'first-paint') {
        metrics.firstPaint = entry.startTime;
      } else if (entry.name === 'first-contentful-paint') {
        metrics.firstContentfulPaint = entry.startTime;
      }
    }

    console.log('Bundle Performance Metrics:', metrics);
    
    // Alert if performance is poor
    if (metrics.domContentLoaded > 3000) {
      console.warn('Slow DOM content loading detected');
    }
  }
}

// Memory usage monitoring
export function monitorMemoryUsage(): void {
  if (typeof window !== 'undefined' && 'performance' in window && 'memory' in (performance as any)) {
    const memory = (performance as any).memory;
    
    const memoryInfo = {
      usedJSHeapSize: memory.usedJSHeapSize,
      totalJSHeapSize: memory.totalJSHeapSize,
      jsHeapSizeLimit: memory.jsHeapSizeLimit,
      usagePercentage: (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100
    };

    console.log('Memory Usage:', memoryInfo);
    
    // Warning if memory usage is high
    if (memoryInfo.usagePercentage > 80) {
      console.warn('High memory usage detected:', memoryInfo.usagePercentage.toFixed(2) + '%');
      toast.warning('High memory usage detected. Consider refreshing the page.');
    }
  }
}

// Intersection Observer for lazy loading
export function createIntersectionObserver(
  callback: (entries: IntersectionObserverEntry[]) => void,
  options: IntersectionObserverInit = {}
): IntersectionObserver | null {
  if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
    return null;
  }

  return new IntersectionObserver(callback, {
    rootMargin: '50px',
    threshold: 0.1,
    ...options
  });
}

// Preload resources
export function preloadResource(href: string, as: string = 'script'): void {
  if (typeof document === 'undefined') return;
  
  const existingLink = document.querySelector(`link[href="${href}"]`);
  if (existingLink) return;

  const link = document.createElement('link');
  link.rel = 'preload';
  link.href = href;
  link.as = as;
  document.head.appendChild(link);
}

// Component performance wrapper
export function withPerformanceMonitoring<P extends object>(
  Component: React.ComponentType<P>,
  componentName: string
): React.ComponentType<P> {
  return function PerformanceWrappedComponent(props: P) {
    React.useEffect(() => {
      const endTiming = performanceMonitor.startTiming(`component_${componentName}`);
      return endTiming;
    }, []);

    return React.createElement(Component, props);
  };
}
