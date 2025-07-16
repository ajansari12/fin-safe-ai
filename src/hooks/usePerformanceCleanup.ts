import { useEffect } from 'react';
import { performanceMonitor } from '@/utils/performance-monitor';
import { useSmartPerformanceMonitoring } from './useSmartPerformanceMonitoring';

export const usePerformanceCleanup = () => {
  const { monitoringMode, trackLightweightMetrics, shouldMonitor } = useSmartPerformanceMonitoring({
    enablePublicPageMonitoring: true,
    enableLightweightMode: true,
    enableAdaptiveFrequency: true
  });

  useEffect(() => {
    if (!shouldMonitor) return;

    // Set up performance monitoring for the component
    const startTime = performance.now();
    const cleanupMetrics = trackLightweightMetrics('PageComponent');
    
    return () => {
      cleanupMetrics();
      
      // Clean up performance monitoring when component unmounts
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      // Only log in development to avoid performance impact in production
      if (process.env.NODE_ENV === 'development') {
        console.log(`[${monitoringMode}] Component lifecycle duration: ${duration.toFixed(2)}ms`);
      }
      
      // Generate performance report in development (only for full monitoring)
      if (process.env.NODE_ENV === 'development' && performanceMonitor && monitoringMode === 'full') {
        const report = performanceMonitor.getReport();
        if (report.summary.overallScore < 70) {
          console.warn('⚠️ Performance issues detected:', report);
        }
      }
    };
  }, [monitoringMode, shouldMonitor, trackLightweightMetrics]);
};