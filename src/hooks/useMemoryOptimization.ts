import { useEffect, useState, useCallback } from 'react';

interface MemoryInfo {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
}

interface MemoryCleanupConfig {
  enableAutoCleanup?: boolean;
  cleanupThreshold?: number; // Percentage of memory limit
  cleanupInterval?: number; // in milliseconds
  enableImageOptimization?: boolean;
  enableDOMCleanup?: boolean;
}

export const useMemoryOptimization = (config: MemoryCleanupConfig = {}) => {
  const {
    enableAutoCleanup = true,
    cleanupThreshold = 80, // 80% of memory limit
    cleanupInterval = 30000, // 30 seconds
    enableImageOptimization = true,
    enableDOMCleanup = true
  } = config;

  const [memoryInfo, setMemoryInfo] = useState<MemoryInfo | null>(null);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [cleanupHistory, setCleanupHistory] = useState<Array<{
    timestamp: number;
    beforeSize: number;
    afterSize: number;
    freedMemory: number;
  }>>([]);

  // Get current memory information
  const getMemoryInfo = useCallback((): MemoryInfo | null => {
    if ('memory' in performance) {
      return (performance as any).memory;
    }
    return null;
  }, []);

  // Calculate memory usage percentage
  const getMemoryUsagePercentage = useCallback((info: MemoryInfo): number => {
    return (info.usedJSHeapSize / info.jsHeapSizeLimit) * 100;
  }, []);

  // Clean up unused images
  const optimizeImages = useCallback(() => {
    if (!enableImageOptimization) return 0;

    let freedBytes = 0;
    const images = document.querySelectorAll('img');
    
    images.forEach(img => {
      const rect = img.getBoundingClientRect();
      
      // Remove images that are not visible and not in viewport
      if (rect.width === 0 && rect.height === 0 && 
          !img.closest('[data-keep-loaded="true"]')) {
        
        // Estimate freed memory (rough calculation)
        if (img.naturalWidth && img.naturalHeight) {
          freedBytes += img.naturalWidth * img.naturalHeight * 4; // 4 bytes per pixel (RGBA)
        }
        
        // Remove src to free memory but keep element
        img.removeAttribute('src');
        img.setAttribute('data-optimized', 'true');
      }
      
      // Optimize large images by reducing quality
      if (img.naturalWidth > 1920 && !img.getAttribute('data-optimized')) {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (ctx) {
          const maxWidth = 1920;
          const ratio = maxWidth / img.naturalWidth;
          canvas.width = maxWidth;
          canvas.height = img.naturalHeight * ratio;
          
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          
          canvas.toBlob((blob) => {
            if (blob) {
              const url = URL.createObjectURL(blob);
              img.src = url;
              img.setAttribute('data-optimized', 'true');
            }
          }, 'image/jpeg', 0.8);
        }
      }
    });

    return freedBytes;
  }, [enableImageOptimization]);

  // Clean up DOM nodes
  const optimizeDOM = useCallback(() => {
    if (!enableDOMCleanup) return 0;

    let freedNodes = 0;
    
    // Remove empty text nodes
    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode: (node) => {
          return node.textContent?.trim() === '' ? 
            NodeFilter.FILTER_ACCEPT : 
            NodeFilter.FILTER_REJECT;
        }
      }
    );

    const emptyTextNodes: Node[] = [];
    let node;
    while (node = walker.nextNode()) {
      emptyTextNodes.push(node);
    }

    emptyTextNodes.forEach(node => {
      node.parentNode?.removeChild(node);
      freedNodes++;
    });

    // Remove unused data attributes
    const elementsWithData = document.querySelectorAll('[data-temp]');
    elementsWithData.forEach(el => {
      el.removeAttribute('data-temp');
    });

    // Clean up event listeners on removed elements
    const removedElements = document.querySelectorAll('[data-removed="true"]');
    removedElements.forEach(el => {
      el.remove();
      freedNodes++;
    });

    return freedNodes;
  }, [enableDOMCleanup]);

  // Clear caches and temporary data
  const clearCaches = useCallback(() => {
    // Clear console in production
    if (process.env.NODE_ENV === 'production') {
      console.clear();
    }

    // Clear URL object cache
    const urlObjects = (window as any)._urlObjectCache || [];
    urlObjects.forEach((url: string) => {
      URL.revokeObjectURL(url);
    });
    (window as any)._urlObjectCache = [];

    // Clear timer cache
    const timers = (window as any)._timerCache || [];
    timers.forEach((id: number) => {
      clearTimeout(id);
      clearInterval(id);
    });
    (window as any)._timerCache = [];

    // Request garbage collection if available
    if ('gc' in window && typeof (window as any).gc === 'function') {
      (window as any).gc();
    }
  }, []);

  // Perform comprehensive memory optimization
  const performOptimization = useCallback(async () => {
    if (isOptimizing) return;

    setIsOptimizing(true);
    const beforeInfo = getMemoryInfo();
    
    if (!beforeInfo) {
      setIsOptimizing(false);
      return;
    }

    try {
      // Step 1: Optimize images
      const freedImageMemory = optimizeImages();
      
      // Step 2: Clean up DOM
      const freedDOMNodes = optimizeDOM();
      
      // Step 3: Clear caches
      clearCaches();
      
      // Step 4: Wait for cleanup to take effect
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const afterInfo = getMemoryInfo();
      
      if (afterInfo) {
        const freedMemory = beforeInfo.usedJSHeapSize - afterInfo.usedJSHeapSize;
        
        setCleanupHistory(prev => [
          ...prev.slice(-9), // Keep last 10 entries
          {
            timestamp: Date.now(),
            beforeSize: beforeInfo.usedJSHeapSize,
            afterSize: afterInfo.usedJSHeapSize,
            freedMemory
          }
        ]);

        console.log(`Memory optimization completed:
          - Freed ${(freedMemory / 1024 / 1024).toFixed(2)}MB
          - Optimized ${freedImageMemory > 0 ? 'images' : 'no images'}
          - Cleaned ${freedDOMNodes} DOM nodes
          - Memory usage: ${getMemoryUsagePercentage(afterInfo).toFixed(2)}%`);
      }
    } catch (error) {
      console.warn('Memory optimization failed:', error);
    } finally {
      setIsOptimizing(false);
    }
  }, [isOptimizing, getMemoryInfo, optimizeImages, optimizeDOM, clearCaches, getMemoryUsagePercentage]);

  // Monitor memory usage
  useEffect(() => {
    const updateMemoryInfo = () => {
      const info = getMemoryInfo();
      setMemoryInfo(info);
      
      if (info && enableAutoCleanup) {
        const usagePercentage = getMemoryUsagePercentage(info);
        
        if (usagePercentage > cleanupThreshold) {
          console.warn(`High memory usage detected: ${usagePercentage.toFixed(2)}%`);
          performOptimization();
        }
      }
    };

    updateMemoryInfo();
    const interval = setInterval(updateMemoryInfo, cleanupInterval);

    return () => clearInterval(interval);
  }, [enableAutoCleanup, cleanupThreshold, cleanupInterval, getMemoryInfo, getMemoryUsagePercentage, performOptimization]);

  // Emergency cleanup on page visibility change
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && enableAutoCleanup) {
        // Perform lightweight cleanup when page becomes hidden
        clearCaches();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [enableAutoCleanup, clearCaches]);

  return {
    memoryInfo,
    isOptimizing,
    cleanupHistory,
    performOptimization,
    getMemoryUsagePercentage: () => 
      memoryInfo ? getMemoryUsagePercentage(memoryInfo) : 0,
    getMemoryStats: () => ({
      current: memoryInfo,
      usagePercentage: memoryInfo ? getMemoryUsagePercentage(memoryInfo) : 0,
      isHigh: memoryInfo ? getMemoryUsagePercentage(memoryInfo) > cleanupThreshold : false,
      cleanupCount: cleanupHistory.length,
      lastCleanup: cleanupHistory[cleanupHistory.length - 1]
    }),
    // Manual optimization triggers
    optimizeImages,
    optimizeDOM,
    clearCaches
  };
};
