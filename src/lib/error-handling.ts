
import { toast } from "@/hooks/use-toast";

export interface AppError {
  message: string;
  code?: string;
  details?: unknown;
  context?: string;
}

export class ErrorHandler {
  static handle(error: unknown, context?: string): AppError {
    const appError = this.parseError(error, context);
    this.logError(appError);
    this.showToast(appError);
    return appError;
  }

  private static parseError(error: unknown, context?: string): AppError {
    if (error instanceof Error) {
      // Supabase error handling
      if ('code' in error && 'details' in error) {
        return {
          message: this.getSupabaseErrorMessage(error),
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
  }

  private static getSupabaseErrorMessage(error: any): string {
    switch (error.code) {
      case 'PGRST116':
        return 'No data found for the requested operation';
      case '23505':
        return 'This record already exists';
      case '23503':
        return 'Cannot delete - record is referenced by other data';
      case '42501':
        return 'You do not have permission to perform this action';
      default:
        return error.message || 'Database operation failed';
    }
  }

  private static logError(error: AppError): void {
    console.error('Application Error:', {
      message: error.message,
      code: error.code,
      context: error.context,
      details: error.details,
      timestamp: new Date().toISOString()
    });
  }

  private static showToast(error: AppError): void {
    toast({
      title: "Error",
      description: error.message,
      variant: "destructive",
    });
  }
}

// Helper hook for error handling in components
export function useErrorHandler() {
  return {
    handleError: (error: unknown, context?: string) => ErrorHandler.handle(error, context),
    handleAsyncError: async (fn: () => Promise<void>, context?: string) => {
      try {
        await fn();
      } catch (error) {
        ErrorHandler.handle(error, context);
      }
    }
  };
}
