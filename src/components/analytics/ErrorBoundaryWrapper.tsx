import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, RefreshCw, BarChart3 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

interface ErrorBoundaryWrapperProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error?: Error; retry: () => void }>;
  title?: string;
  description?: string;
  icon?: React.ReactNode;
  queryKey?: string[];
  queryFn?: () => Promise<any>;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorId?: string;
}

class AnalyticsErrorBoundary extends React.Component<
  ErrorBoundaryWrapperProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryWrapperProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    const errorId = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Log error for development
    if (process.env.NODE_ENV === 'development') {
      console.error('AnalyticsErrorBoundary caught an error:', error);
    }
    
    return { 
      hasError: true, 
      error,
      errorId 
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error details but suppress in production UI
    const errorDetails = {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      errorId: this.state.errorId,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    };
    
    // Log for development
    if (process.env.NODE_ENV === 'development') {
      console.error('Analytics Error Details:', errorDetails);
    }
    
    // In production, you could send this to an error reporting service
    // errorLoggingService.logError(errorDetails);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorId: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback;
        return <FallbackComponent error={this.state.error} retry={this.handleRetry} />;
      }

      return (
        <Card className="border-destructive/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              {this.props.title || 'Analytics Error'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                {this.props.description || 'An error occurred while loading this analytics component.'}
              </AlertDescription>
            </Alert>
            
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">
                This could be due to:
              </p>
              <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
                <li>Temporary network connectivity issues</li>
                <li>Database query timeouts</li>
                <li>Insufficient data for analysis</li>
                <li>Service overload or maintenance</li>
              </ul>
            </div>

            <div className="flex gap-2">
              <Button onClick={this.handleRetry} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
              <Button 
                onClick={() => window.location.reload()} 
                variant="secondary" 
                size="sm"
              >
                Reload Page
              </Button>
            </div>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-4">
                <summary className="text-sm font-medium cursor-pointer">
                  Error Details (Development)
                </summary>
                <pre className="mt-2 text-xs bg-muted p-2 rounded overflow-auto max-h-32">
                  {this.state.error.stack}
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

// Wrapper component with query retry logic
export const ErrorBoundaryWrapper: React.FC<ErrorBoundaryWrapperProps> = ({ 
  children, 
  queryKey, 
  queryFn,
  ...props 
}) => {
  const query = queryKey && queryFn ? useQuery({
    queryKey,
    queryFn,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    staleTime: 5 * 60 * 1000, // 5 minutes
  }) : null;

  // Enhanced children with query data if available
  const enhancedChildren = query ? (
    React.cloneElement(children as React.ReactElement, { 
      queryData: query.data,
      isLoading: query.isLoading,
      error: query.error,
      refetch: query.refetch
    })
  ) : children;

  return (
    <AnalyticsErrorBoundary {...props}>
      {enhancedChildren}
    </AnalyticsErrorBoundary>
  );
};

// Specialized fallback components
export const AnalyticsCardFallback: React.FC<{ error?: Error; retry: () => void }> = ({ 
  error, 
  retry 
}) => (
  <Card className="border-orange-200 bg-orange-50">
    <CardContent className="p-6 text-center">
      <BarChart3 className="h-8 w-8 mx-auto mb-3 text-orange-500" />
      <p className="font-medium text-orange-800 mb-2">Analytics Unavailable</p>
      <p className="text-sm text-orange-600 mb-4">
        Unable to load analytics data at this time.
      </p>
      <Button onClick={retry} variant="outline" size="sm" className="border-orange-300">
        <RefreshCw className="h-4 w-4 mr-2" />
        Retry
      </Button>
    </CardContent>
  </Card>
);

export const NoDataFallback: React.FC<{ 
  title?: string; 
  description?: string; 
  icon?: React.ReactNode;
  retry?: () => void;
}> = ({ 
  title = "No Data Available", 
  description = "No data found for this component.", 
  icon = <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />,
  retry
}) => (
  <Card>
    <CardContent className="p-6 text-center">
      {icon}
      <p className="font-medium text-muted-foreground mb-2">{title}</p>
      <p className="text-sm text-muted-foreground mb-4">{description}</p>
      {retry && (
        <Button onClick={retry} variant="outline" size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh Data
        </Button>
      )}
    </CardContent>
  </Card>
);

export default ErrorBoundaryWrapper;