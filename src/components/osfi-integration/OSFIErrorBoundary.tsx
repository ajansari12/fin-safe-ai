import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export class OSFIErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('OSFI Component Error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo
    });

    // Report to error monitoring service
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // You could integrate with error tracking services here
    // Example: Sentry.captureException(error, { contexts: { errorInfo } });
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <Card className="border-destructive">
          <CardHeader>
            <CardTitle className="flex items-center text-destructive">
              <AlertTriangle className="h-5 w-5 mr-2" />
              OSFI Component Error
            </CardTitle>
            <CardDescription>
              An error occurred while loading this OSFI component. This may be due to a data connectivity issue or a temporary system problem.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {process.env.NODE_ENV === 'development' && (
              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-semibold text-sm mb-2">Error Details (Development Mode):</h4>
                <p className="text-xs text-muted-foreground mb-2">
                  {this.state.error?.message}
                </p>
                {this.state.errorInfo && (
                  <details className="text-xs">
                    <summary className="cursor-pointer font-medium mb-1">Component Stack</summary>
                    <pre className="whitespace-pre-wrap text-xs text-muted-foreground">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </details>
                )}
              </div>
            )}
            
            <div className="flex space-x-2">
              <Button onClick={this.handleRetry} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry Component
              </Button>
              <Button 
                onClick={() => window.location.reload()} 
                variant="outline" 
                size="sm"
              >
                <Home className="h-4 w-4 mr-2" />
                Reload Page
              </Button>
            </div>

            <div className="text-xs text-muted-foreground">
              <p>If this error persists:</p>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>Check your internet connection</li>
                <li>Verify database connectivity</li>
                <li>Contact system administrator if the issue continues</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      );
    }

    return this.props.children;
  }
}

// Higher-order component for easier usage
export const withOSFIErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>
) => {
  const WrappedComponent = (props: P) => (
    <OSFIErrorBoundary>
      <Component {...props} />
    </OSFIErrorBoundary>
  );

  WrappedComponent.displayName = `withOSFIErrorBoundary(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
};

export default OSFIErrorBoundary;