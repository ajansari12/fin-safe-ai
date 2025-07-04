import React, { Component, ErrorInfo, ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Home, RefreshCw, ChevronDown, ChevronUp } from "lucide-react";
import { errorLoggingService } from "@/services/error-logging-service";
import { toast } from "sonner";

interface Props {
  children: ReactNode;
  routeName: string;
  moduleName?: string;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
  showDetails: boolean;
  retryCount: number;
}

// HOC to inject router hooks
const withRouter = (Component: any) => {
  return (props: any) => {
    const location = useLocation();
    const navigate = useNavigate();
    return <Component {...props} location={location} navigate={navigate} />;
  };
};

class RouteErrorBoundaryBase extends Component<Props & { location: any; navigate: any }, State> {
  public state: State = {
    hasError: false,
    showDetails: false,
    retryCount: 0,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { 
      hasError: true, 
      error,
      showDetails: false,
      retryCount: 0,
    };
  }

  public async componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(`RouteErrorBoundary [${this.props.routeName}] caught an error:`, error, errorInfo);
    
    this.setState({ errorInfo });

    // Log error to database
    try {
      await errorLoggingService.logComponentError(
        error,
        errorInfo,
        this.props.routeName,
        this.props.location.pathname
      );
    } catch (logError) {
      console.error('Failed to log route error:', logError);
    }

    // Show user-friendly toast
    toast.error(`An error occurred in ${this.props.routeName}`, {
      description: "The error has been logged and our team has been notified.",
    });
  }

  private handleRetry = () => {
    this.setState(prevState => ({ 
      hasError: false, 
      error: undefined, 
      errorInfo: undefined,
      retryCount: prevState.retryCount + 1,
    }));
  };

  private handleGoHome = () => {
    this.props.navigate('/app/dashboard');
  };

  private toggleDetails = () => {
    this.setState(prevState => ({ showDetails: !prevState.showDetails }));
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const isAnalyticsRoute = this.props.location.pathname.includes('analytics');
      const isThirdPartyRoute = this.props.location.pathname.includes('third-party');
      const isDocumentRoute = this.props.location.pathname.includes('document');

      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-background">
          <Card className="max-w-2xl w-full">
            <CardHeader>
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-6 w-6 text-destructive" />
                <div>
                  <CardTitle className="text-xl">
                    Error in {this.props.routeName}
                  </CardTitle>
                  {this.props.moduleName && (
                    <p className="text-sm text-muted-foreground mt-1">
                      Module: {this.props.moduleName}
                    </p>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Something went wrong</AlertTitle>
                <AlertDescription>
                  {isAnalyticsRoute && "There was an issue loading the analytics dashboard. This might be due to a data processing error or chart rendering issue."}
                  {isThirdPartyRoute && "There was an issue with the third-party risk management module. This might be related to vendor data processing."}
                  {isDocumentRoute && "There was an issue with the document management system. This might be related to file processing or storage."}
                  {!isAnalyticsRoute && !isThirdPartyRoute && !isDocumentRoute && 
                    (this.state.error?.message || 'An unexpected error occurred while loading this page.')
                  }
                </AlertDescription>
              </Alert>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button onClick={this.handleRetry} className="flex-1">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again {this.state.retryCount > 0 && `(${this.state.retryCount})`}
                </Button>
                <Button variant="outline" onClick={this.handleGoHome} className="flex-1">
                  <Home className="h-4 w-4 mr-2" />
                  Go to Dashboard
                </Button>
              </div>

              {process.env.NODE_ENV === 'development' && (
                <div className="border-t pt-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={this.toggleDetails}
                    className="w-full"
                  >
                    {this.state.showDetails ? (
                      <>
                        <ChevronUp className="h-4 w-4 mr-2" />
                        Hide Error Details
                      </>
                    ) : (
                      <>
                        <ChevronDown className="h-4 w-4 mr-2" />
                        Show Error Details
                      </>
                    )}
                  </Button>
                  {this.state.showDetails && (
                    <div className="mt-3 p-3 bg-muted rounded-md">
                      <h4 className="font-mono text-sm font-semibold mb-2">Error Details:</h4>
                      <pre className="text-xs overflow-auto max-h-40 whitespace-pre-wrap">
                        {this.state.error?.stack}
                      </pre>
                      {this.state.errorInfo && (
                        <>
                          <h4 className="font-mono text-sm font-semibold mt-4 mb-2">Component Stack:</h4>
                          <pre className="text-xs overflow-auto max-h-40 whitespace-pre-wrap">
                            {this.state.errorInfo.componentStack}
                          </pre>
                        </>
                      )}
                    </div>
                  )}
                </div>
              )}

              <p className="text-xs text-muted-foreground text-center">
                Error ID: {this.state.error?.name}-{Date.now()}
                <br />
                This error has been automatically logged for investigation.
              </p>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export const RouteErrorBoundary = withRouter(RouteErrorBoundaryBase);