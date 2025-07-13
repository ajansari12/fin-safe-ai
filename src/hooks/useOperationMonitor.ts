import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface OperationMetrics {
  operationId: string;
  startTime: number;
  endTime?: number;
  duration?: number;
  status: 'running' | 'completed' | 'failed' | 'cancelled';
  progress: number;
  currentStep?: string;
  throughput?: number;
  errorRate?: number;
  memoryUsage?: number;
  networkLatency?: number;
}

interface OperationMonitorOptions {
  operationType: string;
  operationId: string;
  trackMemory?: boolean;
  trackNetwork?: boolean;
  realTimeUpdates?: boolean;
  reportingInterval?: number;
}

export const useOperationMonitor = (options: OperationMonitorOptions) => {
  const [metrics, setMetrics] = useState<OperationMetrics>({
    operationId: options.operationId,
    startTime: 0,
    status: 'running',
    progress: 0
  });
  
  const [realTimeMetrics, setRealTimeMetrics] = useState({
    cpuUsage: 0,
    memoryUsage: 0,
    networkLatency: 0,
    operationsPerSecond: 0
  });

  const intervalRef = useRef<NodeJS.Timeout>();
  const startTimeRef = useRef<number>(0);
  const operationsCountRef = useRef<number>(0);

  const startMonitoring = useCallback(() => {
    const startTime = performance.now();
    startTimeRef.current = startTime;
    
    setMetrics(prev => ({
      ...prev,
      startTime,
      status: 'running'
    }));

    // Start real-time monitoring if enabled
    if (options.realTimeUpdates) {
      intervalRef.current = setInterval(() => {
        const currentTime = performance.now();
        const duration = currentTime - startTimeRef.current;
        
        // Calculate operations per second
        const ops = (operationsCountRef.current / duration) * 1000;
        
        // Get memory usage if available
        const memoryInfo = (performance as any).memory;
        const memoryUsage = memoryInfo ? 
          (memoryInfo.usedJSHeapSize / memoryInfo.totalJSHeapSize) * 100 : 0;

        setRealTimeMetrics(prev => ({
          ...prev,
          memoryUsage,
          operationsPerSecond: ops,
          networkLatency: prev.networkLatency // Keep last known value
        }));

      }, options.reportingInterval || 1000);
    }
  }, [options.realTimeUpdates, options.reportingInterval]);

  const updateProgress = useCallback((progress: number, currentStep?: string) => {
    operationsCountRef.current++;
    
    setMetrics(prev => ({
      ...prev,
      progress,
      currentStep,
      duration: performance.now() - startTimeRef.current
    }));
  }, []);

  const completeMonitoring = useCallback(async (status: 'completed' | 'failed' | 'cancelled') => {
    const endTime = performance.now();
    const duration = endTime - startTimeRef.current;
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    const finalMetrics = {
      ...metrics,
      endTime,
      duration,
      status,
      throughput: operationsCountRef.current / (duration / 1000)
    };

    setMetrics(finalMetrics);

    // Store metrics in database for analysis
    try {
      await supabase.from('performance_analytics').insert({
        metric_type: options.operationType,
        metric_category: 'operation_performance',
        metric_value: duration,
        additional_metadata: {
          operationId: options.operationId,
          status,
          progress: finalMetrics.progress,
          throughput: finalMetrics.throughput,
          operationsCount: operationsCountRef.current,
          realTimeMetrics
        }
      });
    } catch (error) {
      console.error('Failed to store performance metrics:', error);
    }

    return finalMetrics;
  }, [metrics, options.operationType, options.operationId, realTimeMetrics]);

  const measureNetworkLatency = useCallback(async (url: string) => {
    const start = performance.now();
    try {
      await fetch(url, { method: 'HEAD' });
      const latency = performance.now() - start;
      
      setRealTimeMetrics(prev => ({
        ...prev,
        networkLatency: latency
      }));
      
      return latency;
    } catch {
      return -1;
    }
  }, []);

  const getPerformanceInsights = useCallback(() => {
    const insights = [];
    
    if (realTimeMetrics.memoryUsage > 80) {
      insights.push({
        type: 'warning' as const,
        message: 'High memory usage detected',
        recommendation: 'Consider optimizing memory-intensive operations'
      });
    }
    
    if (realTimeMetrics.networkLatency > 2000) {
      insights.push({
        type: 'warning' as const,
        message: 'High network latency detected',
        recommendation: 'Check network connectivity'
      });
    }
    
    if (realTimeMetrics.operationsPerSecond < 10 && metrics.progress > 10) {
      insights.push({
        type: 'info' as const,
        message: 'Operation throughput is lower than expected',
        recommendation: 'This may be normal for data-intensive operations'
      });
    }

    return insights;
  }, [realTimeMetrics, metrics.progress]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    metrics,
    realTimeMetrics,
    startMonitoring,
    updateProgress,
    completeMonitoring,
    measureNetworkLatency,
    getPerformanceInsights,
    isMonitoring: metrics.status === 'running'
  };
};