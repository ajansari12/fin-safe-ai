import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart3, 
  TrendingUp, 
  Target, 
  Brain,
  Activity,
  Users,
  AlertTriangle,
  Zap
} from 'lucide-react';

// Enhanced dashboard skeleton with better UX
export const DashboardSkeleton = () => (
  <div className="space-y-6">
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {[...Array(4)].map((_, i) => (
        <Card key={i}>
          <CardContent className="p-6">
            <div className="animate-pulse space-y-3">
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-4 rounded" />
                <Skeleton className="h-4 w-20" />
              </div>
              <Skeleton className="h-8 w-16" />
              <Skeleton className="h-3 w-24" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
    <Card>
      <CardHeader>
        <Skeleton className="h-5 w-32" />
      </CardHeader>
      <CardContent className="p-6">
        <div className="animate-pulse">
          <Skeleton className="h-80 w-full rounded" />
        </div>
      </CardContent>
    </Card>
  </div>
);

// Predictive analytics specific skeleton
export const PredictiveAnalyticsSkeleton = () => (
  <div className="space-y-6">
    <div className="flex items-center justify-between">
      <div className="space-y-2">
        <Skeleton className="h-6 w-80" />
        <Skeleton className="h-4 w-60" />
      </div>
      <Skeleton className="h-9 w-24" />
    </div>
    
    <div className="grid gap-4">
      {[...Array(3)].map((_, i) => (
        <Card key={i}>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-muted-foreground" />
              <Skeleton className="h-5 w-40" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-3">
                {[...Array(4)].map((_, j) => (
                  <div key={j} className="flex items-center justify-between">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                ))}
              </div>
              <div className="h-32">
                <Skeleton className="h-full w-full rounded" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  </div>
);

// Widget loading skeleton
export const WidgetSkeleton: React.FC<{ 
  title?: string; 
  showChart?: boolean;
  showBadges?: boolean;
}> = ({ 
  title = "Loading Widget", 
  showChart = true,
  showBadges = false 
}) => (
  <Card>
    <CardHeader className="pb-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-4 rounded" />
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {title}...
          </CardTitle>
        </div>
        {showBadges && (
          <div className="flex gap-2">
            <Badge variant="secondary" className="animate-pulse">
              <Skeleton className="h-3 w-8" />
            </Badge>
          </div>
        )}
      </div>
    </CardHeader>
    <CardContent>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-4 w-16" />
        </div>
        {showChart && <Skeleton className="h-32 w-full rounded" />}
        <div className="flex gap-2">
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
      </div>
    </CardContent>
  </Card>
);

// Chart loading skeleton
export const ChartSkeleton: React.FC<{ height?: number }> = ({ height = 200 }) => (
  <div className="space-y-4">
    <div className="flex items-center justify-between">
      <Skeleton className="h-5 w-32" />
      <Skeleton className="h-4 w-20" />
    </div>
    <div className="relative">
      <Skeleton className={`w-full rounded`} style={{ height: `${height}px` }} />
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="flex items-center gap-2 text-muted-foreground">
          <BarChart3 className="h-6 w-6 animate-pulse" />
          <span className="text-sm">Loading chart...</span>
        </div>
      </div>
    </div>
  </div>
);

// List loading skeleton
export const ListSkeleton: React.FC<{ 
  items?: number; 
  showAvatar?: boolean;
}> = ({ 
  items = 5, 
  showAvatar = false 
}) => (
  <div className="space-y-3">
    {[...Array(items)].map((_, i) => (
      <div key={i} className="flex items-center gap-3 p-3 border rounded-lg">
        {showAvatar && <Skeleton className="h-8 w-8 rounded-full" />}
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
        </div>
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>
    ))}
  </div>
);

// Real-time alerts skeleton
export const AlertsSkeleton = () => (
  <div className="space-y-3">
    {[...Array(3)].map((_, i) => (
      <Card key={i} className="border-l-4 border-l-muted">
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
              <Skeleton className="h-4 w-3/4" />
              <div className="flex items-center gap-4">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
            <Skeleton className="h-8 w-20" />
          </div>
        </CardContent>
      </Card>
    ))}
  </div>
);

// Metrics grid skeleton
export const MetricsGridSkeleton: React.FC<{ columns?: number }> = ({ columns = 4 }) => (
  <div className={`grid gap-4 md:grid-cols-${columns}`}>
    {[...Array(columns)].map((_, i) => (
      <Card key={i}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-4 rounded" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-16 mb-2" />
          <Skeleton className="h-3 w-32" />
        </CardContent>
      </Card>
    ))}
  </div>
);

export default {
  DashboardSkeleton,
  PredictiveAnalyticsSkeleton,
  WidgetSkeleton,
  ChartSkeleton,
  ListSkeleton,
  AlertsSkeleton,
  MetricsGridSkeleton
};