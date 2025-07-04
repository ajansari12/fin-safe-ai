import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { PaginationControls } from '@/components/ui/pagination-controls';
import { 
  usePaginatedIncidents,
  useIncidentsSummary,
  usePaginatedKRILogs,
  useKRISummary,
  usePaginatedAnalyticsInsights 
} from '@/hooks/usePaginatedQueries';
import { Calendar, TrendingUp, TrendingDown, Minus, AlertTriangle, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

// Performance-optimized Incidents List
export const OptimizedIncidentsList: React.FC = () => {
  const [severityFilter, setSeverityFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  
  // Get summary data first (fast aggregation)
  const { data: summary, isLoading: summaryLoading } = useIncidentsSummary();
  
  // Get paginated data with filters
  const { 
    data: incidents, 
    isLoading, 
    pagination 
  } = usePaginatedIncidents({
    severity: severityFilter || undefined,
    status: statusFilter || undefined
  });

  if (summaryLoading) {
    return <IncidentsSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards - Fast to load */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Incidents</p>
                <p className="text-2xl font-bold">{summary?.totalIncidents || 0}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Critical</p>
                <p className="text-2xl font-bold text-red-600">{summary?.criticalIncidents || 0}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Open</p>
                <p className="text-2xl font-bold text-yellow-600">{summary?.openIncidents || 0}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Resolution</p>
                <p className="text-2xl font-bold">{summary?.averageResolutionTime || 0}h</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Incident Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <Select value={severityFilter} onValueChange={setSeverityFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Severities</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Statuses</SelectItem>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
            
            <Button 
              variant="outline" 
              onClick={() => {
                setSeverityFilter('');
                setStatusFilter('');
              }}
            >
              Clear Filters
            </Button>
          </div>

          {/* Paginated Results */}
          {isLoading ? (
            <IncidentListSkeleton />
          ) : (
            <div className="space-y-3">
              {incidents?.data.map((incident) => (
                <div key={incident.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-medium">{incident.title}</h4>
                      <Badge variant={
                        incident.severity === 'critical' ? 'destructive' :
                        incident.severity === 'high' ? 'secondary' :
                        'outline'
                      }>
                        {incident.severity}
                      </Badge>
                      <Badge variant="outline">{incident.status}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{incident.description}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Reported {formatDistanceToNow(new Date(incident.reported_at))} ago
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination Controls */}
          <PaginationControls
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            totalCount={pagination.totalCount}
            pageSize={pagination.limit}
            hasNextPage={pagination.hasNextPage}
            hasPreviousPage={pagination.hasPreviousPage}
            onPageChange={pagination.setPage}
            onPageSizeChange={pagination.setLimit}
            isLoading={isLoading}
          />
        </CardContent>
      </Card>
    </div>
  );
};

// Performance-optimized KRI Dashboard
export const OptimizedKRIDashboard: React.FC = () => {
  const [dateRange, setDateRange] = useState<{ startDate?: string; endDate?: string }>({});
  
  // Get KRI summary with trend analysis
  const { data: kriSummary, isLoading: summaryLoading } = useKRISummary(dateRange);
  
  // Get paginated KRI logs
  const { 
    data: kriLogs, 
    isLoading, 
    pagination 
  } = usePaginatedKRILogs({
    ...dateRange,
    thresholdBreached: undefined // Show all
  });

  const getTrendIcon = (direction: string) => {
    switch (direction) {
      case 'up': return <TrendingUp className="h-4 w-4 text-red-500" />;
      case 'down': return <TrendingDown className="h-4 w-4 text-green-500" />;
      default: return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* KRI Summary */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Logs</p>
                <p className="text-2xl font-bold">{kriSummary?.totalLogs || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Breaches</p>
                <p className="text-2xl font-bold text-red-600">{kriSummary?.breachedThresholds || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Unique KRIs</p>
                <p className="text-2xl font-bold">{kriSummary?.uniqueKRIs || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Average Value</p>
                <p className="text-2xl font-bold">{kriSummary?.averageValue || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Trend</p>
                <div className="flex items-center gap-2">
                  {getTrendIcon(kriSummary?.trendDirection || 'stable')}
                  <span className="font-medium capitalize">{kriSummary?.trendDirection || 'stable'}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Paginated KRI Logs */}
      <Card>
        <CardHeader>
          <CardTitle>KRI Measurement History</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <KRILogsSkeleton />
          ) : (
            <>
              <div className="space-y-3 mb-6">
                {kriLogs?.data.map((log) => (
                  <div key={log.id} className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <p className="font-medium">{log.kri_definitions?.name || 'KRI'}</p>
                      <p className="text-sm text-muted-foreground">
                        Value: {log.actual_value} • {new Date(log.measurement_date).toLocaleDateString()}
                      </p>
                    </div>
                    {log.threshold_breached && log.threshold_breached !== 'none' && (
                      <Badge variant="destructive">Breach</Badge>
                    )}
                  </div>
                ))}
              </div>
              
              <PaginationControls
                currentPage={pagination.page}
                totalPages={pagination.totalPages}
                totalCount={pagination.totalCount}
                pageSize={pagination.limit}
                hasNextPage={pagination.hasNextPage}
                hasPreviousPage={pagination.hasPreviousPage}
                onPageChange={pagination.setPage}
                onPageSizeChange={pagination.setLimit}
                isLoading={isLoading}
              />
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

// Skeleton loaders for performance
const IncidentsSkeleton = () => (
  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
    {[1, 2, 3, 4].map((i) => (
      <Card key={i}>
        <CardContent className="p-4">
          <Skeleton className="h-16" />
        </CardContent>
      </Card>
    ))}
  </div>
);

const IncidentListSkeleton = () => (
  <div className="space-y-3">
    {[1, 2, 3, 4, 5].map((i) => (
      <Skeleton key={i} className="h-20" />
    ))}
  </div>
);

const KRILogsSkeleton = () => (
  <div className="space-y-3">
    {[1, 2, 3, 4, 5].map((i) => (
      <Skeleton key={i} className="h-16" />
    ))}
  </div>
);