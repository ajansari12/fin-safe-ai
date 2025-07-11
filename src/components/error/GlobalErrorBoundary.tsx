import React, { Component, ErrorInfo, ReactNode } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Home, RefreshCw } from "lucide-react";
import { errorLoggingService } from "@/services/error-logging-service";
import { toast } from "sonner";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

export class GlobalErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public async componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('GlobalErrorBoundary caught a critical error:', error, errorInfo);
    
    this.setState({ errorInfo });

    // Log critical error
    try {
      await errorLoggingService.logComponentError(
        error,
        errorInfo,
        'GlobalErrorBoundary',
        window.location.pathname
      );
    } catch (logError) {
      console.error('Failed to log global error:', logError);
    }

    // Show critical error toast
    toast.error("Critical Application Error", {
      description: "A critical error occurred. Please refresh the page or contact support.",
      duration: 10000,
    });
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = '/app/dashboard';
  };

  private handleClearStorage = () => {
    try {
      // Clear localStorage and sessionStorage
      localStorage.clear();
      sessionStorage.clear();
      
      // Clear Supabase auth data specifically
      localStorage.removeItem('sb-oooocjyscnvbahsyryxp-auth-token');
      
      toast.success("Storage cleared. Redirecting to login...");
      
      // Redirect to login after clearing storage
      setTimeout(() => {
        window.location.href = '/auth/login';
      }, 1000);
    } catch (error) {
      console.error('Error clearing storage:', error);
      toast.error("Failed to clear storage");
    }
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-background">
          <Card className="max-w-lg w-full">
            <CardHeader>
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-6 w-6 text-destructive" />
                <CardTitle className="text-xl">Application Error</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Critical Error</AlertTitle>
                <AlertDescription>
                  A critical error occurred that prevented the application from functioning properly. 
                  This error has been automatically logged and our team has been notified.
                </AlertDescription>
              </Alert>

              <div className="flex flex-col gap-3">
                <Button onClick={this.handleReload} className="w-full">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Reload Application
                </Button>
                <Button variant="outline" onClick={this.handleGoHome} className="w-full">
                  <Home className="h-4 w-4 mr-2" />
                  Go to Dashboard
                </Button>
                <Button variant="destructive" onClick={this.handleClearStorage} className="w-full">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Clear Storage & Reset
                </Button>
              </div>

              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="mt-4">
                  <summary className="cursor-pointer text-sm font-medium">
                    Error Details (Development)
                  </summary>
                  <pre className="mt-2 p-3 bg-muted rounded text-xs overflow-auto max-h-40 whitespace-pre-wrap">
                    {this.state.error.stack}
                  </pre>
                </details>
              )}

              <p className="text-xs text-muted-foreground text-center">
                If this problem persists, please contact support with error ID: {Date.now()}
              </p>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}