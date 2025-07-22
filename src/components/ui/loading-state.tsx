
import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2 } from 'lucide-react';

interface LoadingStateProps {
  type?: 'spinner' | 'skeleton' | 'card';
  size?: 'sm' | 'md' | 'lg';
  message?: string;
  rows?: number;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  type = 'spinner',
  size = 'md',
  message = 'Loading...',
  rows = 3
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  };

  if (type === 'spinner') {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className={`${sizeClasses[size]} animate-spin text-primary`} />
          {message && <p className="text-sm text-muted-foreground">{message}</p>}
        </div>
      </div>
    );
  }

  if (type === 'skeleton') {
    return (
      <div className="space-y-4 p-4">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        ))}
      </div>
    );
  }

  if (type === 'card') {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-1/3" />
          <Skeleton className="h-4 w-2/3" />
        </CardHeader>
        <CardContent className="space-y-2">
          {Array.from({ length: rows }).map((_, i) => (
            <Skeleton key={i} className="h-4 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  return null;
};
