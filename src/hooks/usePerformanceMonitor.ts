import { useEffect, useRef } from 'react';

interface PerformanceMetrics {
  componentName: string;
  renderTime: number;
  timestamp: number;
}

export const usePerformanceMonitor = (componentName: string) => {
  const startTimeRef = useRef<number>();
  const metricsRef = useRef<PerformanceMetrics[]>([]);

  useEffect(() => {
    startTimeRef.current = performance.now();
  });

  useEffect(() => {
    if (startTimeRef.current) {
      const renderTime = performance.now() - startTimeRef.current;
      const metric: PerformanceMetrics = {
        componentName,
        renderTime,
        timestamp: Date.now()
      };
      
      metricsRef.current.push(metric);
      
      // Log slow renders (> 16ms)
      if (renderTime > 16) {
        console.warn(`Slow render detected in ${componentName}: ${renderTime.toFixed(2)}ms`);
      }
      
      // Keep only last 100 metrics
      if (metricsRef.current.length > 100) {
        metricsRef.current = metricsRef.current.slice(-100);
      }
    }
  });

  const getMetrics = () => metricsRef.current;
  const getAverageRenderTime = () => {
    const metrics = metricsRef.current;
    if (metrics.length === 0) return 0;
    return metrics.reduce((sum, metric) => sum + metric.renderTime, 0) / metrics.length;
  };

  return { getMetrics, getAverageRenderTime };
};
