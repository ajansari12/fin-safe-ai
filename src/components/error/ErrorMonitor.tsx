import React, { useEffect } from 'react';
import { errorLoggingService } from '@/services/error-logging-service';

// Global error monitoring component
export const ErrorMonitor: React.FC = () => {
  useEffect(() => {
    const handleUnhandledError = (event: ErrorEvent) => {
      errorLoggingService.logError({
        route: window.location.pathname,
        error_message: event.message,
        error_stack: event.error?.stack,
        severity: 'critical',
        component_name: 'GlobalWindow',
        metadata: {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
          type: 'unhandledError'
        }
      });
    };

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const error = event.reason;
      errorLoggingService.logError({
        route: window.location.pathname,
        error_message: error?.message || 'Unhandled Promise Rejection',
        error_stack: error?.stack,
        severity: 'critical',
        component_name: 'GlobalPromise',
        metadata: {
          reason: event.reason,
          type: 'unhandledRejection'
        }
      });
    };

    // Add global error listeners
    window.addEventListener('error', handleUnhandledError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('error', handleUnhandledError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  return null;
};

export default ErrorMonitor;