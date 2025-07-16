import { useEffect, useRef } from 'react';
import { performanceMonitor, monitorMemoryUsage } from '@/lib/performance-utils';

// Memory optimization hook for heavy dashboard components
export const useMemoryOptimizer = (componentName: string) => {
  const cleanupFunctionsRef = useRef<(() => void)[]>([]);
  const memoryCheckIntervalRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    // Start performance monitoring
    const endTiming = performanceMonitor.startTiming(`${componentName}_mount`);
    
    // Monitor memory usage every 30 seconds
    memoryCheckIntervalRef.current = setInterval(() => {
      monitorMemoryUsage();
    }, 30000);

    // Add cleanup function
    cleanupFunctionsRef.current.push(endTiming);

    return () => {
      // Execute all cleanup functions
      cleanupFunctionsRef.current.forEach(cleanup => {
        try {
          cleanup();
        } catch (error) {
          console.warn(`Cleanup error in ${componentName}:`, error);
        }
      });
      
      // Clear memory monitoring
      if (memoryCheckIntervalRef.current) {
        clearInterval(memoryCheckIntervalRef.current);
      }
      
      // Force garbage collection if available (dev mode)
      if (process.env.NODE_ENV === 'development' && window.gc) {
        window.gc();
      }
    };
  }, [componentName]);

  const addCleanupFunction = (cleanup: () => void) => {
    cleanupFunctionsRef.current.push(cleanup);
  };

  return { addCleanupFunction };
};

// Enhanced error boundary with memory monitoring
export default useMemoryOptimizer;