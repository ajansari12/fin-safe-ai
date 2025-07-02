import React, { ReactNode } from 'react';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { PageLoading, InlineLoading } from './LoadingStates';
import ErrorBoundary from './ErrorBoundary';

interface AsyncWrapperProps {
  children: ReactNode;
  loading?: boolean;
  error?: Error | null;
  loadingComponent?: ReactNode;
  errorComponent?: ReactNode;
  inline?: boolean;
  loadingMessage?: string;
  retryAction?: () => void;
}

export const AsyncWrapper = ({
  children,
  loading = false,
  error = null,
  loadingComponent,
  errorComponent,
  inline = false,
  loadingMessage,
  retryAction
}: AsyncWrapperProps) => {
  const { parseError } = useErrorHandler();

  if (loading) {
    if (loadingComponent) {
      return <>{loadingComponent}</>;
    }
    
    if (inline) {
      return <InlineLoading message={loadingMessage} />;
    }
    
    return <PageLoading message={loadingMessage} />;
  }

  if (error) {
    if (errorComponent) {
      return <>{errorComponent}</>;
    }

    const appError = parseError(error);
    
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center space-y-4">
        <div className="text-destructive font-medium">{appError.message}</div>
        {retryAction && (
          <button
            onClick={retryAction}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            Try Again
          </button>
        )}
      </div>
    );
  }

  return (
    <ErrorBoundary>
      {children}
    </ErrorBoundary>
  );
};