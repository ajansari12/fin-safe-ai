import { useEffect, useCallback } from 'react';

interface PerformanceOptimization {
  enableImageOptimization: boolean;
  enableBundleAnalysis: boolean;
  enableMemoryManagement: boolean;
  enableLayoutOptimization: boolean;
}

interface PerformanceMetrics {
  fcp: number; // First Contentful Paint
  lcp: number; // Largest Contentful Paint
  fid: number; // First Input Delay
  cls: number; // Cumulative Layout Shift
  ttfb: number; // Time to First Byte
}

const DEFAULT_OPTIMIZATION: PerformanceOptimization = {
  enableImageOptimization: true,
  enableBundleAnalysis: true,
  enableMemoryManagement: true,
  enableLayoutOptimization: true
};

export const useProductionOptimizer = (
  config: Partial<PerformanceOptimization> = {}
) => {
  const optimization = { ...DEFAULT_OPTIMIZATION, ...config };

  // Optimize images by adding loading="lazy" to all images
  const optimizeImages = useCallback(() => {
    if (!optimization.enableImageOptimization) return;

    const images = document.querySelectorAll('img:not([loading])');
    images.forEach(img => {
      const imgElement = img as HTMLImageElement;
      imgElement.setAttribute('loading', 'lazy');
      
      // Add error handling for broken images
      imgElement.addEventListener('error', () => {
        console.warn('Image failed to load:', imgElement.src);
        imgElement.style.display = 'none';
      });
    });
  }, [optimization.enableImageOptimization]);

  // Reduce layout shifts by setting dimensions
  const optimizeLayout = useCallback(() => {
    if (!optimization.enableLayoutOptimization) return;

    // Add aspect ratio to images without dimensions
    const images = document.querySelectorAll('img:not([width]):not([height])');
    images.forEach(img => {
      const imgElement = img as HTMLImageElement;
      imgElement.style.aspectRatio = '16/9'; // Default aspect ratio
      imgElement.style.objectFit = 'cover';
    });

    // Optimize skeleton loading states
    const skeletons = document.querySelectorAll('[data-skeleton]');
    skeletons.forEach(skeleton => {
      const skeletonElement = skeleton as HTMLElement;
      skeletonElement.style.minHeight = '1rem';
      skeletonElement.style.backgroundColor = 'hsl(var(--muted))';
    });
  }, [optimization.enableLayoutOptimization]);

  // Memory management optimizations
  const optimizeMemory = useCallback(() => {
    if (!optimization.enableMemoryManagement) return;

    // Clean up event listeners on unmounted components
    const cleanupEvents = () => {
      const elements = document.querySelectorAll('[data-cleanup-required]');
      elements.forEach(element => {
        const events = ['scroll', 'resize', 'mousemove', 'touchmove'];
        events.forEach(event => {
          element.removeEventListener(event, () => {});
        });
      });
    };

    // Throttle resize and scroll events
    let resizeTimeout: NodeJS.Timeout;
    const throttledResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        window.dispatchEvent(new Event('throttledResize'));
      }, 100);
    };

    window.addEventListener('resize', throttledResize);
    
    // Cleanup function
    return () => {
      window.removeEventListener('resize', throttledResize);
      cleanupEvents();
    };
  }, [optimization.enableMemoryManagement]);

  // Collect and analyze performance metrics
  const collectMetrics = useCallback((): Promise<PerformanceMetrics> => {
    return new Promise((resolve) => {
      // Use PerformanceObserver for accurate metrics
      const metrics: Partial<PerformanceMetrics> = {};
      
      // Collect Web Vitals
      const observer = new PerformanceObserver((list) => {
        list.getEntries().forEach((entry) => {
          switch (entry.entryType) {
            case 'paint':
              if (entry.name === 'first-contentful-paint') {
                metrics.fcp = entry.startTime;
              }
              break;
            case 'largest-contentful-paint':
              metrics.lcp = entry.startTime;
              break;
            case 'first-input':
              metrics.fid = (entry as PerformanceEventTiming).processingStart - entry.startTime;
              break;
            case 'layout-shift':
              const layoutShift = entry as any; // LayoutShift type not available in all browsers
              if (!layoutShift.hadRecentInput) {
                metrics.cls = (metrics.cls || 0) + layoutShift.value;
              }
              break;
          }
        });
      });

      observer.observe({ entryTypes: ['paint', 'largest-contentful-paint', 'first-input', 'layout-shift'] });

      // Get navigation timing for TTFB
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (navigation) {
        metrics.ttfb = navigation.responseStart - navigation.fetchStart;
      }

      // Resolve with collected metrics after a delay
      setTimeout(() => {
        observer.disconnect();
        resolve({
          fcp: metrics.fcp || 0,
          lcp: metrics.lcp || 0,
          fid: metrics.fid || 0,
          cls: metrics.cls || 0,
          ttfb: metrics.ttfb || 0
        });
      }, 3000);
    });
  }, []);

  // Bundle analysis for production
  const analyzeBundleSize = useCallback(() => {
    if (!optimization.enableBundleAnalysis) return;

    const scripts = document.querySelectorAll('script[src]');
    let totalSize = 0;
    
    scripts.forEach(script => {
      const src = script.getAttribute('src');
      if (src && !src.startsWith('http')) {
        // Estimate bundle size based on script count and typical sizes
        totalSize += 250; // KB estimate per script
      }
    });

    console.log(`Estimated bundle size: ${totalSize}KB`);
    
    if (totalSize > 1000) {
      console.warn('Bundle size is large. Consider code splitting and tree shaking.');
    }
  }, [optimization.enableBundleAnalysis]);

  // Apply all optimizations
  const applyOptimizations = useCallback(async () => {
    const cleanupFunctions: Array<() => void> = [];
    
    try {
      optimizeImages();
      optimizeLayout();
      analyzeBundleSize();
      
      const memoryCleanup = optimizeMemory();
      if (memoryCleanup) {
        cleanupFunctions.push(memoryCleanup);
      }

      // Collect metrics after optimizations
      const metrics = await collectMetrics();
      console.log('Performance metrics after optimization:', metrics);
      
      // Log warnings for poor metrics
      if (metrics.cls > 0.1) {
        console.warn('High Cumulative Layout Shift detected:', metrics.cls);
      }
      
      if (metrics.lcp > 2500) {
        console.warn('Slow Largest Contentful Paint detected:', metrics.lcp);
      }

      return { metrics, cleanup: () => cleanupFunctions.forEach(fn => fn()) };
      
    } catch (error) {
      console.error('Optimization failed:', error);
      return { metrics: null, cleanup: () => {} };
    }
  }, [optimizeImages, optimizeLayout, optimizeMemory, analyzeBundleSize, collectMetrics]);

  // Auto-apply optimizations on mount
  useEffect(() => {
    let cleanup: (() => void) | undefined;
    
    const runOptimizations = async () => {
      const result = await applyOptimizations();
      cleanup = result.cleanup;
    };

    // Apply optimizations after initial render
    const timer = setTimeout(runOptimizations, 1000);

    return () => {
      clearTimeout(timer);
      if (cleanup) cleanup();
    };
  }, [applyOptimizations]);

  return {
    applyOptimizations,
    collectMetrics,
    optimizeImages,
    optimizeLayout,
    optimizeMemory,
    analyzeBundleSize
  };
};