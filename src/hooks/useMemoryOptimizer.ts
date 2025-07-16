import { useEffect, useRef } from 'react';

interface MemoryOptimizerOptions {
  maxMemoryMB?: number;
  cleanupInterval?: number;
  enableGarbageCollection?: boolean;
}

export const useMemoryOptimizer = (
  componentName: string,
  options: MemoryOptimizerOptions = {}
) => {
  const {
    maxMemoryMB = 200,
    cleanupInterval = 30000,
    enableGarbageCollection = true
  } = options;
  
  const cleanupIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const memoryCheckRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Memory monitoring and cleanup
    const checkMemoryUsage = () => {
      if (typeof window !== 'undefined' && 'performance' in window && 'memory' in performance) {
        const memory = (performance as any).memory;
        const usedMB = memory.usedJSHeapSize / (1024 * 1024);
        
        if (usedMB > maxMemoryMB) {
          console.warn(`${componentName}: High memory usage detected: ${usedMB.toFixed(2)}MB`);
          
          // Force garbage collection if available
          if (enableGarbageCollection && 'gc' in window) {
            try {
              (window as any).gc();
            } catch (error) {
              // Ignore errors - gc might not be available
            }
          }
        }
      }
    };

    // Set up memory monitoring
    memoryCheckRef.current = setInterval(checkMemoryUsage, 10000);

    // Set up cleanup interval
    cleanupIntervalRef.current = setInterval(() => {
      // Clear any cached data or references
      if (typeof window !== 'undefined') {
        // Clear expired entries from localStorage
        try {
          const keysToRemove: string[] = [];
          for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.startsWith('cache_')) {
              const item = localStorage.getItem(key);
              if (item) {
                try {
                  const parsed = JSON.parse(item);
                  if (parsed.expires && Date.now() > parsed.expires) {
                    keysToRemove.push(key);
                  }
                } catch {
                  // Invalid cache entry, remove it
                  keysToRemove.push(key);
                }
              }
            }
          }
          keysToRemove.forEach(key => localStorage.removeItem(key));
        } catch (error) {
          // Ignore localStorage errors
        }
      }
    }, cleanupInterval);

    // Cleanup on unmount
    return () => {
      if (cleanupIntervalRef.current) {
        clearInterval(cleanupIntervalRef.current);
      }
      if (memoryCheckRef.current) {
        clearInterval(memoryCheckRef.current);
      }
    };
  }, [componentName, maxMemoryMB, cleanupInterval, enableGarbageCollection]);

  // Return memory stats if available
  const getMemoryStats = () => {
    if (typeof window !== 'undefined' && 'performance' in window && 'memory' in performance) {
      const memory = (performance as any).memory;
      return {
        usedMB: memory.usedJSHeapSize / (1024 * 1024),
        totalMB: memory.totalJSHeapSize / (1024 * 1024),
        limitMB: memory.jsHeapSizeLimit / (1024 * 1024)
      };
    }
    return null;
  };

  return { getMemoryStats };
};