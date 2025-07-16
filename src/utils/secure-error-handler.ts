import { toast } from "@/hooks/use-toast";

export interface SecureAppError {
  message: string;
  code?: string;
  userMessage: string;
  logDetails?: unknown;
  context?: string;
}

export class SecureErrorHandler {
  /**
   * Handles errors securely, preventing sensitive information disclosure
   * while maintaining proper logging for development/debugging
   */
  static handle(error: unknown, context?: string): SecureAppError {
    const secureError = this.parseSecureError(error, context);
    this.logSecureError(secureError);
    this.showSecureToast(secureError);
    return secureError;
  }

  private static parseSecureError(error: unknown, context?: string): SecureAppError {
    // Generic user-friendly messages to prevent information disclosure
    const genericMessages = {
      database: 'A database error occurred. Please try again later.',
      network: 'Network error. Please check your connection and try again.',
      authentication: 'Authentication failed. Please sign in again.',
      authorization: 'You do not have permission to perform this action.',
      validation: 'Invalid input provided. Please check your data.',
      system: 'A system error occurred. Please try again later.',
      default: 'An unexpected error occurred. Please try again later.'
    };

    if (error instanceof Error) {
      // Supabase error handling with secure user messages
      if ('code' in error && 'details' in error) {
        const supabaseError = error as any;
        const userMessage = this.getSecureSupabaseErrorMessage(supabaseError.code);
        
        return {
          message: error.message, // Full message for logging
          code: supabaseError.code,
          userMessage,
          logDetails: {
            details: supabaseError.details,
            hint: supabaseError.hint,
            message: supabaseError.message
          },
          context
        };
      }
      
      // Generic error handling
      const userMessage = this.categorizeErrorMessage(error.message);
      return {
        message: error.message,
        userMessage,
        context
      };
    }

    if (typeof error === 'string') {
      const userMessage = this.categorizeErrorMessage(error);
      return {
        message: error,
        userMessage,
        context
      };
    }

    return {
      message: 'Unknown error type',
      userMessage: genericMessages.default,
      logDetails: error,
      context
    };
  }

  private static getSecureSupabaseErrorMessage(code: string): string {
    // Map Supabase error codes to secure user messages
    const errorMap: Record<string, string> = {
      'PGRST116': 'No data found for your request.',
      '23505': 'This record already exists.',
      '23503': 'Cannot delete - this record is referenced by other data.',
      '42501': 'You do not have permission to perform this action.',
      '42P01': 'Requested resource not found.',
      '40001': 'Operation conflict. Please try again.',
      '40003': 'Operation timeout. Please try again.',
      'P0001': 'Operation could not be completed.',
      'P0002': 'Record not found.',
      'P0003': 'Too many records found.',
      'P0004': 'Check constraint violation.',
      '22001': 'Input data is too long.',
      '22003': 'Input data is out of range.',
      '22007': 'Invalid date/time format.',
      '22012': 'Division by zero.',
      '23502': 'Required field is missing.',
      '23514': 'Input validation failed.',
      '28000': 'Invalid authorization.',
      '28P01': 'Invalid password.',
      '3D000': 'Invalid database name.',
      '42601': 'Invalid syntax.',
      '42703': 'Invalid column reference.',
      '42883': 'Invalid function call.',
      '42P02': 'Invalid parameter.',
      '53200': 'Out of memory.',
      '53300': 'Too many connections.',
      '57014': 'Query cancelled.',
      '57P01': 'Connection lost.',
      '58000': 'System error.',
      '58030': 'Input/output error.',
      'XX000': 'Internal error.'
    };

    return errorMap[code] || 'Database operation failed. Please try again.';
  }

  private static categorizeErrorMessage(message: string): string {
    const lowerMessage = message.toLowerCase();
    
    // Network errors
    if (lowerMessage.includes('network') || lowerMessage.includes('fetch') || 
        lowerMessage.includes('timeout') || lowerMessage.includes('connection')) {
      return 'Network error. Please check your connection and try again.';
    }
    
    // Authentication errors
    if (lowerMessage.includes('auth') || lowerMessage.includes('login') || 
        lowerMessage.includes('token') || lowerMessage.includes('session')) {
      return 'Authentication failed. Please sign in again.';
    }
    
    // Authorization errors
    if (lowerMessage.includes('permission') || lowerMessage.includes('forbidden') || 
        lowerMessage.includes('unauthorized') || lowerMessage.includes('access')) {
      return 'You do not have permission to perform this action.';
    }
    
    // Validation errors
    if (lowerMessage.includes('invalid') || lowerMessage.includes('validation') || 
        lowerMessage.includes('required') || lowerMessage.includes('format')) {
      return 'Invalid input provided. Please check your data.';
    }
    
    // Database errors
    if (lowerMessage.includes('database') || lowerMessage.includes('sql') || 
        lowerMessage.includes('table') || lowerMessage.includes('column')) {
      return 'A database error occurred. Please try again later.';
    }
    
    return 'An unexpected error occurred. Please try again later.';
  }

  private static logSecureError(error: SecureAppError): void {
    // In production, log securely with minimal sensitive information
    if (process.env.NODE_ENV === 'production') {
      console.error('Secure Error:', {
        userMessage: error.userMessage,
        code: error.code,
        context: error.context,
        timestamp: new Date().toISOString()
      });
    } else {
      // In development, log full details for debugging
      console.error('Development Error:', {
        fullMessage: error.message,
        userMessage: error.userMessage,
        code: error.code,
        context: error.context,
        logDetails: error.logDetails,
        timestamp: new Date().toISOString()
      });
    }
  }

  private static showSecureToast(error: SecureAppError): void {
    toast({
      title: "Error",
      description: error.userMessage, // Always show the secure user message
      variant: "destructive",
    });
  }
}

/**
 * Hook for secure error handling in components
 */
export function useSecureErrorHandler() {
  return {
    handleError: (error: unknown, context?: string) => SecureErrorHandler.handle(error, context),
    handleAsyncError: async (fn: () => Promise<void>, context?: string) => {
      try {
        await fn();
      } catch (error) {
        SecureErrorHandler.handle(error, context);
      }
    }
  };
}