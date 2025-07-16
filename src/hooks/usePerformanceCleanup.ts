import { useEffect, useRef } from 'react';

// Global performance service instance
let performanceService: any = null;

export const usePerformanceCleanup = () => {
  const initializedRef = useRef(false);

  useEffect(() => {
    // Initialize performance service only once
    if (!initializedRef.current && typeof window !== 'undefined') {
      import('@/services/enhanced-performance-service').then((module) => {
        if (!performanceService) {
          const EnhancedPerformanceService = module.default;
          performanceService = new EnhancedPerformanceService();
          performanceService.initializePerformanceMonitoring();
        }
        initializedRef.current = true;
      });
    }

    // Cleanup on unmount
    return () => {
      if (performanceService && initializedRef.current) {
        performanceService.cleanup();
        performanceService = null;
        initializedRef.current = false;
      }
    };
  }, []);

  return performanceService;
};