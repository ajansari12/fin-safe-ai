import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

interface RecoveryConfig {
  maxRetries: number;
  initialDelay: number;
  backoffMultiplier: number;
  enableAutoRecovery: boolean;
}

interface RecoveryState {
  isRecovering: boolean;
  retryCount: number;
  lastError: Error | null;
  recoveryAttempts: number;
}

export const useAutoRecovery = (
  operation: () => Promise<void>,
  config: RecoveryConfig = {
    maxRetries: 3,
    initialDelay: 1000,
    backoffMultiplier: 2,
    enableAutoRecovery: true
  }
) => {
  const [state, setState] = useState<RecoveryState>({
    isRecovering: false,
    retryCount: 0,
    lastError: null,
    recoveryAttempts: 0
  });

  const executeWithRecovery = useCallback(async () => {
    if (!config.enableAutoRecovery) {
      return operation();
    }

    setState(prev => ({ ...prev, isRecovering: true }));
    
    for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
      try {
        await operation();
        
        // Success - reset state
        setState({
          isRecovering: false,
          retryCount: 0,
          lastError: null,
          recoveryAttempts: state.recoveryAttempts + (attempt > 0 ? 1 : 0)
        });
        
        if (attempt > 0) {
          toast.success(`Operation recovered after ${attempt} attempts`);
        }
        
        return;
      } catch (error) {
        const appError = error as Error;
        
        setState(prev => ({
          ...prev,
          retryCount: attempt + 1,
          lastError: appError
        }));
        
        if (attempt === config.maxRetries) {
          // Final attempt failed
          setState(prev => ({
            ...prev,
            isRecovering: false
          }));
          
          toast.error(`Operation failed after ${config.maxRetries + 1} attempts`);
          throw appError;
        }
        
        // Calculate delay with exponential backoff
        const delay = config.initialDelay * Math.pow(config.backoffMultiplier, attempt);
        await new Promise(resolve => setTimeout(resolve, delay));
        
        toast.warning(`Retry ${attempt + 1}/${config.maxRetries} in ${delay}ms`);
      }
    }
  }, [operation, config, state.recoveryAttempts]);

  const resetRecovery = useCallback(() => {
    setState({
      isRecovering: false,
      retryCount: 0,
      lastError: null,
      recoveryAttempts: 0
    });
  }, []);

  return {
    executeWithRecovery,
    resetRecovery,
    ...state
  };
};