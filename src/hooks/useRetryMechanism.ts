import { useState, useCallback } from 'react';
import { toast } from 'sonner';

interface RetryOptions {
  maxAttempts?: number;
  initialDelay?: number;
  backoffMultiplier?: number;
  maxDelay?: number;
}

interface RetryState {
  isLoading: boolean;
  attempts: number;
  lastError?: Error;
}

export const useRetryMechanism = <T>(
  asyncFunction: () => Promise<T>,
  options: RetryOptions = {}
) => {
  const {
    maxAttempts = 3,
    initialDelay = 1000,
    backoffMultiplier = 2,
    maxDelay = 10000
  } = options;

  const [state, setState] = useState<RetryState>({
    isLoading: false,
    attempts: 0
  });

  const executeWithRetry = useCallback(async (): Promise<T> => {
    setState(prev => ({ ...prev, isLoading: true, attempts: 0 }));

    let lastError: Error;
    
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        setState(prev => ({ ...prev, attempts: attempt }));
        
        const result = await asyncFunction();
        
        setState({ isLoading: false, attempts: attempt });
        
        if (attempt > 1) {
          toast.success(`Operation succeeded after ${attempt} attempts`);
        }
        
        return result;
      } catch (error) {
        lastError = error as Error;
        
        if (attempt === maxAttempts) {
          // Final attempt failed
          setState({ 
            isLoading: false, 
            attempts: attempt, 
            lastError 
          });
          
          toast.error(
            `Operation failed after ${maxAttempts} attempts: ${lastError.message}`
          );
          throw lastError;
        }
        
        // Calculate delay with exponential backoff
        const delay = Math.min(
          initialDelay * Math.pow(backoffMultiplier, attempt - 1),
          maxDelay
        );
        
        console.warn(`Attempt ${attempt} failed, retrying in ${delay}ms:`, error);
        
        // Wait before next attempt
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    throw lastError!;
  }, [asyncFunction, maxAttempts, initialDelay, backoffMultiplier, maxDelay]);

  const reset = useCallback(() => {
    setState({ isLoading: false, attempts: 0, lastError: undefined });
  }, []);

  return {
    executeWithRetry,
    reset,
    ...state
  };
};