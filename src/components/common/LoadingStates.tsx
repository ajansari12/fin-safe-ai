import React from 'react';
import { Loader2, LoaderCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const LoadingSpinner = ({ size = 'md', className }: LoadingSpinnerProps) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  };

  return (
    <Loader2 
      className={cn('animate-spin text-primary', sizeClasses[size], className)} 
    />
  );
};

interface PageLoadingProps {
  message?: string;
}

export const PageLoading = ({ message = 'Loading...' }: PageLoadingProps) => (
  <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
    <LoadingSpinner size="lg" />
    <p className="text-muted-foreground animate-pulse">{message}</p>
  </div>
);

interface InlineLoadingProps {
  message?: string;
  className?: string;
}

export const InlineLoading = ({ message = 'Loading...', className }: InlineLoadingProps) => (
  <div className={cn('flex items-center space-x-2', className)}>
    <LoadingSpinner size="sm" />
    <span className="text-sm text-muted-foreground">{message}</span>
  </div>
);

interface CardLoadingProps {
  rows?: number;
}

export const CardLoading = ({ rows = 3 }: CardLoadingProps) => (
  <div className="space-y-3">
    <Skeleton className="h-4 w-1/4" />
    {Array.from({ length: rows }).map((_, i) => (
      <Skeleton key={i} className="h-4 w-full" />
    ))}
  </div>
);

interface TableLoadingProps {
  rows?: number;
  columns?: number;
}

export const TableLoading = ({ rows = 5, columns = 4 }: TableLoadingProps) => (
  <div className="space-y-3">
    {/* Header */}
    <div className="flex space-x-4">
      {Array.from({ length: columns }).map((_, i) => (
        <Skeleton key={i} className="h-4 flex-1" />
      ))}
    </div>
    {/* Rows */}
    {Array.from({ length: rows }).map((_, rowIndex) => (
      <div key={rowIndex} className="flex space-x-4">
        {Array.from({ length: columns }).map((_, colIndex) => (
          <Skeleton key={colIndex} className="h-8 flex-1" />
        ))}
      </div>
    ))}
  </div>
);

interface ChartLoadingProps {
  height?: string;
}

export const ChartLoading = ({ height = 'h-64' }: ChartLoadingProps) => (
  <div className={cn('flex items-center justify-center', height)}>
    <div className="text-center space-y-4">
      <LoaderCircle className="h-8 w-8 animate-spin text-primary mx-auto" />
      <p className="text-sm text-muted-foreground">Loading chart data...</p>
    </div>
  </div>
);

interface FormLoadingProps {
  message?: string;
}

export const FormLoading = ({ message = 'Saving...' }: FormLoadingProps) => (
  <div className="flex items-center justify-center space-x-2 p-4">
    <LoadingSpinner size="sm" />
    <span className="text-sm">{message}</span>
  </div>
);