import { useEffect, useState } from 'react';
import { useNetworkStatus } from './useNetworkStatus';

interface CacheEntry {
  key: string;
  data: any;
  timestamp: number;
  accessCount: number;
  lastAccess: number;
  size: number;
  priority: 'high' | 'medium' | 'low';
}

interface CacheConfig {
  maxSize?: number; // in bytes
  maxAge?: number; // in milliseconds
  enableCompression?: boolean;
  enablePersistence?: boolean;
  strategy?: 'lru' | 'lfu' | 'ttl';
}

export const useIntelligentCache = (config: CacheConfig = {}) => {
  const {
    maxSize = 50 * 1024 * 1024, // 50MB
    maxAge = 24 * 60 * 60 * 1000, // 24 hours
    enableCompression = true,
    enablePersistence = true,
    strategy = 'lru'
  } = config;

  const { connectionType, saveData } = useNetworkStatus();
  const [cache, setCache] = useState<Map<string, CacheEntry>>(new Map());
  const [cacheStats, setCacheStats] = useState({
    hits: 0,
    misses: 0,
    evictions: 0,
    totalSize: 0
  });

  // Adjust cache size based on network conditions
  const getAdjustedMaxSize = () => {
    if (saveData) return maxSize * 0.5;
    if (connectionType === 'slow') return maxSize * 0.7;
    if (connectionType === 'fast') return maxSize * 1.5;
    return maxSize;
  };

  // Compress data if enabled
  const compressData = (data: any): string => {
    if (!enableCompression) return JSON.stringify(data);
    
    try {
      // Simple compression using JSON stringify with reduced precision
      return JSON.stringify(data, (key, value) => {
        if (typeof value === 'number') {
          return Math.round(value * 100) / 100; // Round to 2 decimal places
        }
        return value;
      });
    } catch {
      return JSON.stringify(data);
    }
  };

  // Decompress data
  const decompressData = (compressedData: string): any => {
    try {
      return JSON.parse(compressedData);
    } catch {
      return null;
    }
  };

  // Calculate data size
  const calculateSize = (data: any): number => {
    return new Blob([JSON.stringify(data)]).size;
  };

  // Eviction strategies
  const evictByStrategy = (requiredSpace: number) => {
    const entries = Array.from(cache.entries());
    let evictedSize = 0;
    let evictedCount = 0;

    switch (strategy) {
      case 'lru':
        // Least Recently Used
        entries.sort((a, b) => a[1].lastAccess - b[1].lastAccess);
        break;
      case 'lfu':
        // Least Frequently Used
        entries.sort((a, b) => a[1].accessCount - b[1].accessCount);
        break;
      case 'ttl':
        // Time To Live (oldest first)
        entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
        break;
    }

    const newCache = new Map(cache);
    
    for (const [key, entry] of entries) {
      if (evictedSize >= requiredSpace) break;
      
      newCache.delete(key);
      evictedSize += entry.size;
      evictedCount++;
    }

    setCache(newCache);
    setCacheStats(prev => ({
      ...prev,
      evictions: prev.evictions + evictedCount,
      totalSize: prev.totalSize - evictedSize
    }));
  };

  // Set cache entry
  const set = (key: string, data: any, priority: 'high' | 'medium' | 'low' = 'medium') => {
    const compressedData = compressData(data);
    const size = calculateSize(compressedData);
    const now = Date.now();
    
    const entry: CacheEntry = {
      key,
      data: compressedData,
      timestamp: now,
      accessCount: 1,
      lastAccess: now,
      size,
      priority
    };

    // Check if we need to evict entries
    const currentSize = Array.from(cache.values()).reduce((sum, entry) => sum + entry.size, 0);
    const adjustedMaxSize = getAdjustedMaxSize();
    
    if (currentSize + size > adjustedMaxSize) {
      const requiredSpace = (currentSize + size) - adjustedMaxSize;
      evictByStrategy(requiredSpace);
    }

    setCache(prev => new Map(prev).set(key, entry));
    setCacheStats(prev => ({
      ...prev,
      totalSize: prev.totalSize + size
    }));

    // Persist to localStorage if enabled
    if (enablePersistence && priority === 'high') {
      try {
        localStorage.setItem(`cache_${key}`, JSON.stringify(entry));
      } catch {
        // Storage quota exceeded, ignore
      }
    }
  };

  // Get cache entry
  const get = (key: string): any => {
    let entry = cache.get(key);
    
    // Try to load from localStorage if not in memory
    if (!entry && enablePersistence) {
      try {
        const stored = localStorage.getItem(`cache_${key}`);
        if (stored) {
          entry = JSON.parse(stored);
          if (entry && Date.now() - entry.timestamp < maxAge) {
            setCache(prev => new Map(prev).set(key, entry!));
          } else {
            localStorage.removeItem(`cache_${key}`);
            entry = undefined;
          }
        }
      } catch {
        // Ignore localStorage errors
      }
    }

    if (!entry) {
      setCacheStats(prev => ({ ...prev, misses: prev.misses + 1 }));
      return null;
    }

    // Check if entry is expired
    if (Date.now() - entry.timestamp > maxAge) {
      setCache(prev => {
        const newCache = new Map(prev);
        newCache.delete(key);
        return newCache;
      });
      
      if (enablePersistence) {
        localStorage.removeItem(`cache_${key}`);
      }
      
      setCacheStats(prev => ({ ...prev, misses: prev.misses + 1 }));
      return null;
    }

    // Update access statistics
    entry.accessCount++;
    entry.lastAccess = Date.now();
    setCache(prev => new Map(prev).set(key, entry!));
    
    setCacheStats(prev => ({ ...prev, hits: prev.hits + 1 }));
    
    return decompressData(entry.data);
  };

  // Clear cache
  const clear = () => {
    setCache(new Map());
    setCacheStats({ hits: 0, misses: 0, evictions: 0, totalSize: 0 });
    
    if (enablePersistence) {
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('cache_')) {
          localStorage.removeItem(key);
        }
      });
    }
  };

  // Get cache info
  const getCacheInfo = () => {
    const hitRate = cacheStats.hits / (cacheStats.hits + cacheStats.misses) || 0;
    const efficiency = hitRate * 100;
    
    return {
      size: cache.size,
      totalSize: cacheStats.totalSize,
      maxSize: getAdjustedMaxSize(),
      hitRate,
      efficiency: efficiency.toFixed(2) + '%',
      stats: cacheStats
    };
  };

  // Cleanup expired entries periodically
  useEffect(() => {
    const cleanup = () => {
      const now = Date.now();
      const newCache = new Map();
      let evictedSize = 0;
      
      for (const [key, entry] of cache) {
        if (now - entry.timestamp < maxAge) {
          newCache.set(key, entry);
        } else {
          evictedSize += entry.size;
          if (enablePersistence) {
            localStorage.removeItem(`cache_${key}`);
          }
        }
      }
      
      if (evictedSize > 0) {
        setCache(newCache);
        setCacheStats(prev => ({
          ...prev,
          totalSize: prev.totalSize - evictedSize
        }));
      }
    };

    const interval = setInterval(cleanup, 5 * 60 * 1000); // Cleanup every 5 minutes
    return () => clearInterval(interval);
  }, [cache, maxAge, enablePersistence]);

  return {
    set,
    get,
    clear,
    getCacheInfo,
    hasKey: (key: string) => cache.has(key),
    remove: (key: string) => {
      const entry = cache.get(key);
      if (entry) {
        setCache(prev => {
          const newCache = new Map(prev);
          newCache.delete(key);
          return newCache;
        });
        setCacheStats(prev => ({
          ...prev,
          totalSize: prev.totalSize - entry.size
        }));
        
        if (enablePersistence) {
          localStorage.removeItem(`cache_${key}`);
        }
      }
    }
  };
};