import { useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

export interface AppError {
  message: string;
  code?: string;
  details?: unknown;
  context?: string;
}

export function useErrorHandler() {
  const { toast } = useToast();

  const handleError = useCallback((error: unknown, context?: string): AppError => {
    const appError = parseError(error, context);
    logError(appError);
    showErrorToast(appError);
    return appError;
  }, [toast]);

  const handleAsyncError = useCallback(async (
    fn: () => Promise<void>, 
    context?: string
  ) => {
    try {
      await fn();
    } catch (error) {
      handleError(error, context);
    }
  }, [handleError]);

  const parseError = (error: unknown, context?: string): AppError => {
    if (error instanceof Error) {
      // Supabase error handling
      if ('code' in error && 'details' in error) {
        return {
          message: getSupabaseErrorMessage(error as any),
          code: (error as any).code,
          details: (error as any).details,
          context
        };
      }
      
      return {
        message: error.message,
        context
      };
    }

    if (typeof error === 'string') {
      return {
        message: error,
        context
      };
    }

    return {
      message: 'An unexpected error occurred',
      details: error,
      context
    };
  };

  const getSupabaseErrorMessage = (error: any): string => {
    switch (error.code) {
      case 'PGRST116':
        return 'No data found for the requested operation';
      case '23505':
        return 'This record already exists';
      case '23503':
        return 'Cannot delete - record is referenced by other data';
      case '42501':
        return 'You do not have permission to perform this action';
      case '08P01':
        return 'Connection error - please try again';
      case '23514':
        return 'Data validation failed - please check your input';
      default:
        return error.message || 'Database operation failed';
    }
  };

  const logError = (error: AppError): void => {
    console.error('Application Error:', {
      message: error.message,
      code: error.code,
      context: error.context,
      details: error.details,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    });
  };

  const showErrorToast = (error: AppError): void => {
    toast({
      title: "Error",
      description: error.message,
      variant: "destructive",
    });
  };

  return {
    handleError,
    handleAsyncError,
    parseError
  };
}