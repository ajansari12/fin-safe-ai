import { useState, useEffect, useCallback } from 'react';

interface LoadingState {
  isLoading: boolean;
  error: Error | null;
  progress: number;
  estimatedTime: number;
}

interface AdaptiveLoadingConfig {
  initialTimeout: number;
  progressUpdateInterval: number;
  enableProgressTracking: boolean;
  adaptiveTimeout: boolean;
}

export const useAdaptiveLoading = (
  operation: () => Promise<void>,
  config: AdaptiveLoadingConfig = {
    initialTimeout: 10000,
    progressUpdateInterval: 500,
    enableProgressTracking: true,
    adaptiveTimeout: true
  }
) => {
  const [state, setState] = useState<LoadingState>({
    isLoading: false,
    error: null,
    progress: 0,
    estimatedTime: 0
  });

  const [startTime, setStartTime] = useState<number>(0);
  const [historicalTimes, setHistoricalTimes] = useState<number[]>([]);

  const calculateEstimatedTime = useCallback(() => {
    if (historicalTimes.length === 0) return config.initialTimeout;
    
    const average = historicalTimes.reduce((sum, time) => sum + time, 0) / historicalTimes.length;
    return Math.max(average * 1.2, config.initialTimeout); // 20% buffer
  }, [historicalTimes, config.initialTimeout]);

  const startLoading = useCallback(async () => {
    const operationStartTime = Date.now();
    setStartTime(operationStartTime);
    
    setState({
      isLoading: true,
      error: null,
      progress: 0,
      estimatedTime: calculateEstimatedTime()
    });

    let progressInterval: NodeJS.Timeout | null = null;
    
    if (config.enableProgressTracking) {
      progressInterval = setInterval(() => {
        setState(prev => {
          const elapsed = Date.now() - operationStartTime;
          const progress = Math.min((elapsed / prev.estimatedTime) * 100, 95);
          
          return {
            ...prev,
            progress
          };
        });
      }, config.progressUpdateInterval);
    }

    try {
      await operation();
      
      const operationTime = Date.now() - operationStartTime;
      
      // Update historical times for future estimations
      setHistoricalTimes(prev => {
        const newTimes = [...prev, operationTime];
        return newTimes.slice(-10); // Keep last 10 operations
      });
      
      setState({
        isLoading: false,
        error: null,
        progress: 100,
        estimatedTime: 0
      });
      
    } catch (error) {
      setState({
        isLoading: false,
        error: error as Error,
        progress: 0,
        estimatedTime: 0
      });
    } finally {
      if (progressInterval) {
        clearInterval(progressInterval);
      }
    }
  }, [operation, config, calculateEstimatedTime]);

  const reset = useCallback(() => {
    setState({
      isLoading: false,
      error: null,
      progress: 0,
      estimatedTime: 0
    });
  }, []);

  return {
    ...state,
    startLoading,
    reset,
    averageLoadTime: historicalTimes.length > 0 
      ? historicalTimes.reduce((sum, time) => sum + time, 0) / historicalTimes.length 
      : 0
  };
};