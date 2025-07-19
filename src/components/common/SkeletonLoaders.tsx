import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export const StatCardSkeleton = () => (
  <Card className="min-h-[120px]">
    <CardHeader className="pb-2">
      <div className="flex items-center justify-between">
        <div className="h-4 bg-muted rounded w-24 animate-pulse"></div>
        <div className="h-5 w-5 bg-muted rounded animate-pulse"></div>
      </div>
    </CardHeader>
    <CardContent>
      <div className="space-y-2">
        <div className="h-8 bg-muted rounded w-16 animate-pulse"></div>
        <div className="h-3 bg-muted rounded w-20 animate-pulse"></div>
      </div>
    </CardContent>
  </Card>
);

export const ChartSkeleton = ({ height = "h-80" }: { height?: string }) => (
  <Card className="w-full">
    <CardHeader>
      <div className="flex items-center justify-between">
        <div className="h-6 bg-muted rounded w-32 animate-pulse"></div>
        <div className="h-4 bg-muted rounded w-16 animate-pulse"></div>
      </div>
    </CardHeader>
    <CardContent>
      <div className={`${height} bg-muted rounded animate-pulse`}></div>
    </CardContent>
  </Card>
);

export const TableSkeleton = ({ rows = 5 }: { rows?: number }) => (
  <Card className="w-full">
    <CardHeader>
      <div className="h-6 bg-muted rounded w-32 animate-pulse"></div>
    </CardHeader>
    <CardContent>
      <div className="space-y-3">
        {/* Table header */}
        <div className="flex space-x-4 pb-2 border-b">
          <div className="h-4 bg-muted rounded w-24 animate-pulse"></div>
          <div className="h-4 bg-muted rounded w-32 animate-pulse"></div>
          <div className="h-4 bg-muted rounded w-20 animate-pulse"></div>
          <div className="h-4 bg-muted rounded w-16 animate-pulse"></div>
        </div>
        
        {/* Table rows */}
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex space-x-4 py-2">
            <div className="h-4 bg-muted rounded w-24 animate-pulse"></div>
            <div className="h-4 bg-muted rounded w-32 animate-pulse"></div>
            <div className="h-4 bg-muted rounded w-20 animate-pulse"></div>
            <div className="h-4 bg-muted rounded w-16 animate-pulse"></div>
          </div>
        ))}
      </div>
    </CardContent>
  </Card>
);

export const DashboardSkeleton = () => (
  <div className="space-y-6 min-h-screen">
    {/* Header skeleton */}
    <div className="flex items-center justify-between min-h-[80px]">
      <div className="space-y-2">
        <div className="h-8 bg-muted rounded w-48 animate-pulse"></div>
        <div className="h-4 bg-muted rounded w-64 animate-pulse"></div>
      </div>
      <div className="h-10 bg-muted rounded w-32 animate-pulse"></div>
    </div>
    
    {/* Stats grid skeleton - Fixed height to prevent CLS */}
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 min-h-[140px]">
      {Array.from({ length: 4 }).map((_, i) => (
        <StatCardSkeleton key={i} />
      ))}
    </div>
    
    {/* Main charts section - Fixed height containers */}
    <div className="grid gap-6 md:grid-cols-2 min-h-[400px]">
      <ChartSkeleton height="h-96" />
      <ChartSkeleton height="h-96" />
    </div>
    
    {/* Bottom section - Recent activity and alerts */}
    <div className="grid gap-6 lg:grid-cols-3 min-h-[300px]">
      <div className="lg:col-span-2">
        <TableSkeleton rows={6} />
      </div>
      <div className="space-y-4">
        <Card className="min-h-[280px]">
          <CardHeader>
            <div className="h-6 bg-muted rounded w-24 animate-pulse"></div>
          </CardHeader>
          <CardContent className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center space-x-3">
                <div className="h-3 w-3 bg-muted rounded-full animate-pulse"></div>
                <div className="h-4 bg-muted rounded flex-1 animate-pulse"></div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
);

export const ListSkeleton = ({ items = 5 }: { items?: number }) => (
  <div className="space-y-3 min-h-[300px]">
    {Array.from({ length: items }).map((_, i) => (
      <Card key={i} className="min-h-[80px]">
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2 flex-1">
              <div className="h-4 bg-muted rounded w-3/4 animate-pulse"></div>
              <div className="h-3 bg-muted rounded w-1/2 animate-pulse"></div>
            </div>
            <div className="h-6 bg-muted rounded w-16 animate-pulse"></div>
          </div>
        </CardContent>
      </Card>
    ))}
  </div>
);

export const FormSkeleton = () => (
  <Card className="min-h-[500px]">
    <CardHeader>
      <div className="h-6 bg-muted rounded w-40 animate-pulse"></div>
    </CardHeader>
    <CardContent className="space-y-6">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="space-y-2">
          <div className="h-4 bg-muted rounded w-24 animate-pulse"></div>
          <div className="h-10 bg-muted rounded w-full animate-pulse"></div>
        </div>
      ))}
      <div className="flex justify-end space-x-2 pt-4">
        <div className="h-10 bg-muted rounded w-20 animate-pulse"></div>
        <div className="h-10 bg-muted rounded w-20 animate-pulse"></div>
      </div>
    </CardContent>
  </Card>
);

export const AnalyticsSkeleton = () => (
  <div className="space-y-6 min-h-screen">
    {/* KPI Cards - Fixed height */}
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 min-h-[140px]">
      {Array.from({ length: 4 }).map((_, i) => (
        <StatCardSkeleton key={i} />
      ))}
    </div>
    
    {/* Main Chart - Fixed height */}
    <div className="min-h-[500px]">
      <ChartSkeleton height="h-[480px]" />
    </div>
    
    {/* Secondary Charts */}
    <div className="grid gap-6 md:grid-cols-3 min-h-[350px]">
      {Array.from({ length: 3 }).map((_, i) => (
        <ChartSkeleton key={i} height="h-80" />
      ))}
    </div>
  </div>
);