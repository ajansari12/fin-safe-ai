import React, { Component, ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, RefreshCw, MessageCircle } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: any) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: any;
  retryCount: number;
}

class AIErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('AI Component Error:', error);
    console.error('Error Info:', errorInfo);
    
    this.setState({
      error,
      errorInfo
    });

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Log to monitoring service
    this.logErrorToService(error, errorInfo);
  }

  private logErrorToService = async (error: Error, errorInfo: any) => {
    try {
      // In a production environment, you would send this to your monitoring service
      const errorData = {
        error: {
          name: error.name,
          message: error.message,
          stack: error.stack
        },
        errorInfo,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
        retryCount: this.state.retryCount
      };

      console.warn('AI Error logged:', errorData);
      
      // You could send this to Supabase, Sentry, or another error tracking service
      // await supabase.from('error_logs').insert({
      //   component: 'ai_assistant',
      //   error_data: errorData,
      //   severity: 'error'
      // });
      
    } catch (loggingError) {
      console.error('Failed to log error:', loggingError);
    }
  };

  private handleRetry = () => {
    this.setState(prevState => ({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: prevState.retryCount + 1
    }));
  };

  private handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0
    });
  };

  private getErrorMessage = (error: Error | null): string => {
    if (!error) return 'An unknown error occurred';

    // Map common AI-related errors to user-friendly messages
    if (error.message.includes('rate limit') || error.message.includes('429')) {
      return 'AI service is temporarily busy. Please wait a moment and try again.';
    }
    
    if (error.message.includes('network') || error.message.includes('fetch')) {
      return 'Network connection issue. Please check your internet connection and retry.';
    }
    
    if (error.message.includes('OpenAI') || error.message.includes('API key')) {
      return 'AI service configuration issue. Please contact support if this persists.';
    }
    
    if (error.message.includes('timeout')) {
      return 'AI service is taking longer than expected. Please try again.';
    }

    return 'An unexpected error occurred with the AI service. Please try again.';
  };

  private getRecoveryActions = (): Array<{ label: string; action: () => void; variant?: 'default' | 'outline' }> => {
    const actions = [
      {
        label: 'Try Again',
        action: this.handleRetry,
        variant: 'default' as const
      },
      {
        label: 'Reset AI Assistant',
        action: this.handleReset,
        variant: 'outline' as const
      }
    ];

    // Add specific actions based on error type
    if (this.state.error?.message.includes('rate limit')) {
      actions.unshift({
        label: 'Wait 60 seconds',
        action: () => {
          setTimeout(this.handleRetry, 60000);
        },
        variant: 'outline' as const
      });
    }

    return actions;
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <Card className="w-full border-red-200">
          <CardHeader className="pb-4">
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              AI Assistant Error
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                {this.getErrorMessage(this.state.error)}
              </AlertDescription>
            </Alert>

            {this.state.retryCount > 0 && (
              <div className="text-sm text-muted-foreground">
                Retry attempts: {this.state.retryCount}
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              {this.getRecoveryActions().map((action, index) => (
                <Button
                  key={index}
                  variant={action.variant}
                  size="sm"
                  onClick={action.action}
                  className="flex items-center gap-2"
                >
                  <RefreshCw className="h-4 w-4" />
                  {action.label}
                </Button>
              ))}
            </div>

            {/* Fallback assistance */}
            <div className="border-t pt-4">
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <MessageCircle className="h-4 w-4" />
                Alternative Assistance
              </h4>
              <div className="text-sm text-muted-foreground space-y-2">
                <p>While the AI assistant is unavailable, you can:</p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Browse the Knowledge Base for relevant articles</li>
                  <li>Check the Help documentation</li>
                  <li>Contact support for urgent issues</li>
                  <li>Use the manual workflow features</li>
                </ul>
              </div>
            </div>

            {/* Development info (only in dev mode) */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-4 text-xs">
                <summary className="cursor-pointer font-medium">Technical Details</summary>
                <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto">
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}
          </CardContent>
        </Card>
      );
    }

    return this.props.children;
  }
}

export default AIErrorBoundary;