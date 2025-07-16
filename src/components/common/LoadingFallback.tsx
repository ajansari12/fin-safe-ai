import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, AlertTriangle, Loader2 } from 'lucide-react';
import { DashboardSkeleton } from './SkeletonLoaders';

interface LoadingFallbackProps {
  error?: Error | null;
  onRetry?: () => void;
  title?: string;
  description?: string;
  showRetry?: boolean;
  timeout?: number;
}

export const LoadingFallback: React.FC<LoadingFallbackProps> = ({
  error,
  onRetry,
  title = "Loading Dashboard",
  description = "Please wait while we load your dashboard...",
  showRetry = true,
  timeout = 10000 // 10 seconds timeout
}) => {
  const [isTimedOut, setIsTimedOut] = useState(false);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    if (timeout > 0) {
      const timer = setTimeout(() => {
        setIsTimedOut(true);
      }, timeout);

      return () => clearTimeout(timer);
    }
  }, [timeout, retryCount]);

  const handleRetry = () => {
    setIsTimedOut(false);
    setRetryCount(prev => prev + 1);
    onRetry?.();
  };

  // Show timeout or error state
  if (error || isTimedOut) {
    return (
      <div className="flex items-center justify-center min-h-[400px] p-8">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-2">
              <AlertTriangle className="h-12 w-12 text-yellow-500" />
            </div>
            <CardTitle className="text-lg">
              {error ? "Something went wrong" : "Loading timeout"}
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">
              {error 
                ? `Error: ${error.message}`
                : "The dashboard is taking longer than expected to load."
              }
            </p>
            {showRetry && (
              <Button onClick={handleRetry} className="w-full">
                <RefreshCw className="h-4 w-4 mr-2" />
                Try Again
              </Button>
            )}
            {retryCount > 0 && (
              <p className="text-sm text-muted-foreground">
                Retry attempt: {retryCount}
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show loading skeleton
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-center p-4">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>{title}</span>
        </div>
      </div>
      <DashboardSkeleton />
    </div>
  );
};

export default LoadingFallback;