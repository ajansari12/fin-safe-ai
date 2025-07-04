import { useCallback } from 'react';
import { errorLoggingService } from '@/services/error-logging-service';

export const useErrorBoundary = (componentName?: string) => {
  const logError = useCallback(async (
    error: Error,
    severity: 'error' | 'warning' | 'critical' = 'error',
    metadata?: Record<string, any>
  ) => {
    await errorLoggingService.logError({
      route: window.location.pathname,
      error_message: error.message,
      error_stack: error.stack,
      severity,
      component_name: componentName,
      metadata
    });
  }, [componentName]);

  const captureError = useCallback((error: Error) => {
    // Capture error for boundary to handle
    throw error;
  }, []);

  return {
    logError,
    captureError
  };
};