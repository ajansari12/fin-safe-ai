import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Shield, Database, FileText, Network } from 'lucide-react';

interface OSFILoadingStateProps {
  type?: 'dashboard' | 'table' | 'chart' | 'form' | 'full';
  message?: string;
  showIcon?: boolean;
  rows?: number;
}

const OSFILoadingState: React.FC<OSFILoadingStateProps> = ({ 
  type = 'dashboard',
  message = 'Loading OSFI data...',
  showIcon = true,
  rows = 3 
}) => {
  const renderIcon = () => {
    if (!showIcon) return null;

    const icons = [Shield, Database, FileText, Network];
    const IconComponent = icons[Math.floor(Math.random() * icons.length)];
    
    return (
      <div className="flex justify-center mb-4">
        <IconComponent className="h-8 w-8 text-primary animate-pulse" />
      </div>
    );
  };

  if (type === 'full') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          {renderIcon()}
          <div className="space-y-2">
            <Skeleton className="h-4 w-48 mx-auto" />
            <Skeleton className="h-4 w-36 mx-auto" />
          </div>
          <p className="text-sm text-muted-foreground">{message}</p>
        </div>
      </div>
    );
  }

  if (type === 'table') {
    return (
      <Card>
        <CardHeader>
          <div className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-72" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: rows }).map((_, i) => (
              <div key={i} className="flex items-center space-x-4">
                <Skeleton className="h-4 w-4 rounded" />
                <Skeleton className="h-4 flex-1" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (type === 'chart') {
    return (
      <Card>
        <CardHeader>
          <div className="space-y-2">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-64" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between items-end h-32">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton 
                  key={i} 
                  className="w-8" 
                  style={{ height: `${Math.random() * 80 + 20}%` }}
                />
              ))}
            </div>
            <div className="flex justify-between">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-3 w-8" />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (type === 'form') {
    return (
      <Card>
        <CardHeader>
          <div className="space-y-2">
            <Skeleton className="h-6 w-56" />
            <Skeleton className="h-4 w-80" />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: rows }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full" />
            </div>
          ))}
          <div className="flex space-x-2">
            <Skeleton className="h-10 w-20" />
            <Skeleton className="h-10 w-16" />
          </div>
        </CardContent>
      </Card>
    );
  }

  // Default dashboard loading
  return (
    <div className="space-y-6">
      {showIcon && (
        <div className="text-center">
          {renderIcon()}
          <p className="text-sm text-muted-foreground">{message}</p>
        </div>
      )}
      
      {/* Header */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96" />
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4">
              <div className="space-y-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-8 w-16" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Array.from({ length: 2 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Detail section */}
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-56" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Array.from({ length: rows }).map((_, i) => (
              <div key={i} className="p-4 border rounded-lg">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-5 w-48" />
                    <Skeleton className="h-5 w-16" />
                  </div>
                  <Skeleton className="h-4 w-full" />
                  <div className="flex justify-between">
                    <Skeleton className="h-3 w-32" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OSFILoadingState;