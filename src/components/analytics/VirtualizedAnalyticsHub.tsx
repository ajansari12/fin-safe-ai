import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { VariableSizeList as List } from 'react-window';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AlertTriangle, TrendingUp, Target, Brain, Search, RefreshCw } from 'lucide-react';
import { useAuth } from '@/contexts/EnhancedAuthContext';
import { supabase } from '@/integrations/supabase/client';
import { CacheManager } from '@/lib/performance/cache-utils';
import { QueryOptimizer } from '@/lib/performance/query-optimizer';

interface Insight {
  id: string;
  type: string;
  insight_type: string;
  title: string;
  description: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  confidence: number;
  recommendations: string[];
  generated_at: string;
}

interface VirtualizedAnalyticsHubProps {
  maxItemsToShow?: number;
  itemHeight?: number;
  containerHeight?: number;
}

const VirtualizedAnalyticsHub: React.FC<VirtualizedAnalyticsHubProps> = ({
  maxItemsToShow = 1000,
  itemHeight = 200,
  containerHeight = 600,
}) => {
  const { profile } = useAuth();
  const [insights, setInsights] = useState<Insight[]>([]);
  const [filteredInsights, setFilteredInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [loadTime, setLoadTime] = useState<number>(0);

  // Memoized insights by type for performance
  const insightsByType = useMemo(() => {
    const types = filteredInsights.reduce((acc, insight) => {
      acc[insight.type] = (acc[insight.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return types;
  }, [filteredInsights]);

  // Debounced search using QueryOptimizer
  const debouncedSearch = useMemo(() => {
    return QueryOptimizer.createDebouncedSearch(async (query: string) => {
      if (!query.trim()) return insights;
      
      return insights.filter(insight => 
        insight.title.toLowerCase().includes(query.toLowerCase()) ||
        insight.description.toLowerCase().includes(query.toLowerCase()) ||
        insight.type.toLowerCase().includes(query.toLowerCase())
      );
    }, 300);
  }, [insights]);

  // Load insights with performance monitoring
  const loadInsights = useCallback(async () => {
    if (!profile?.organization_id) return;

    const startTime = performance.now();
    setLoading(true);

    try {
      // Check cache first
      const cacheKey = `insights_${profile.organization_id}`;
      const cachedInsights = CacheManager.get<Insight[]>(cacheKey);
      
      if (cachedInsights) {
        setInsights(cachedInsights);
        setFilteredInsights(cachedInsights);
        setLoadTime(performance.now() - startTime);
        setLoading(false);
        return;
      }

      // Use QueryOptimizer for paginated data
      const { data: rawInsights } = await QueryOptimizer.getPaginatedData(
        ['analytics_insights', profile.organization_id],
        async (page, pageSize) => {
          const { data, error } = await supabase
            .from('analytics_insights')
            .select('*')
            .eq('org_id', profile.organization_id)
            .order('generated_at', { ascending: false })
            .range((page - 1) * pageSize, page * pageSize - 1);

          if (error) throw error;

          return {
            data: data || [],
            total: data?.length || 0,
          };
        },
        1,
        maxItemsToShow
      );

      // Transform insights
      const transformedInsights: Insight[] = rawInsights.map(insight => ({
        id: insight.id,
        type: insight.insight_type,
        insight_type: insight.insight_type,
        title: insight.insight_data?.title || 'Insight',
        description: insight.insight_data?.description || 'No description available',
        severity: insight.insight_data?.severity || 'medium',
        confidence: insight.confidence_score || 0.7,
        recommendations: insight.insight_data?.recommendations || [],
        generated_at: insight.generated_at,
      }));

      // Cache the results
      CacheManager.set(cacheKey, transformedInsights, CacheManager.TTL.MEDIUM);
      
      setInsights(transformedInsights);
      setFilteredInsights(transformedInsights);
      setLoadTime(performance.now() - startTime);
    } catch (error) {
      console.error('Error loading insights:', error);
    } finally {
      setLoading(false);
    }
  }, [profile?.organization_id, maxItemsToShow]);

  // Filter insights based on search and type
  useEffect(() => {
    const filterInsights = async () => {
      let filtered = insights;

      // Filter by type
      if (selectedType !== 'all') {
        filtered = filtered.filter(insight => insight.type === selectedType);
      }

      // Filter by search term
      if (searchTerm.trim()) {
        filtered = await debouncedSearch(searchTerm);
      }

      setFilteredInsights(filtered);
    };

    filterInsights();
  }, [insights, searchTerm, selectedType, debouncedSearch]);

  // Load insights on mount
  useEffect(() => {
    loadInsights();
  }, [loadInsights]);

  // Get severity color
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-destructive/10 text-destructive border-destructive/20';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-muted text-muted-foreground border-border';
    }
  };

  // Get type icon
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'anomaly': return AlertTriangle;
      case 'correlation': return TrendingUp;
      case 'prediction': return Target;
      default: return Brain;
    }
  };

  // Render individual insight item
  const renderInsightItem = useCallback(({ index, style }: { index: number; style: React.CSSProperties }) => {
    const insight = filteredInsights[index];
    const Icon = getTypeIcon(insight.type);

    return (
      <div style={style}>
        <div className="p-4">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">{insight.insight_type}</span>
                </div>
                <Badge variant="outline" className={getSeverityColor(insight.severity)}>
                  {insight.severity}
                </Badge>
              </div>
              <CardTitle className="text-base">{insight.title}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground">{insight.description}</p>
              
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Confidence:</span>
                <div className="flex-1 bg-muted rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full" 
                    style={{ width: `${insight.confidence * 100}%` }}
                  />
                </div>
                <span className="text-xs font-medium">{(insight.confidence * 100).toFixed(0)}%</span>
              </div>

              {insight.recommendations.length > 0 && (
                <div>
                  <h5 className="text-xs font-medium text-muted-foreground mb-1">Recommendations:</h5>
                  <ul className="text-xs space-y-1">
                    {insight.recommendations.slice(0, 2).map((rec, idx) => (
                      <li key={idx} className="flex items-start gap-1">
                        <span className="text-primary mt-0.5">•</span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }, [filteredInsights, getSeverityColor, getTypeIcon]);

  // Get item height (dynamic based on content)
  const getItemSize = useCallback((index: number) => {
    const insight = filteredInsights[index];
    const baseHeight = 200;
    const recommendationHeight = insight.recommendations.length * 20;
    return Math.max(baseHeight, baseHeight + recommendationHeight);
  }, [filteredInsights]);

  return (
    <div className="space-y-6">
      {/* Header with performance metrics */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Analytics Insights</h2>
          <p className="text-muted-foreground">
            {filteredInsights.length} insights • Load time: {loadTime.toFixed(0)}ms
          </p>
        </div>
        <Button onClick={loadInsights} disabled={loading} size="sm">
          <RefreshCw className="h-4 w-4 mr-2" />
          {loading ? 'Loading...' : 'Refresh'}
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search insights..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <div className="flex gap-2">
          <Button 
            variant={selectedType === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedType('all')}
          >
            All ({insights.length})
          </Button>
          {Object.entries(insightsByType).map(([type, count]) => (
            <Button
              key={type}
              variant={selectedType === type ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedType(type)}
            >
              {type} ({count})
            </Button>
          ))}
        </div>
      </div>

      {/* Virtualized List */}
      <div className="border rounded-lg">
        {filteredInsights.length > 0 ? (
          <List
            height={containerHeight}
            width="100%"
            itemCount={filteredInsights.length}
            itemSize={getItemSize}
            overscanCount={5}
            className="scrollbar-thin scrollbar-thumb-muted scrollbar-track-background"
          >
            {renderInsightItem}
          </List>
        ) : (
          <div className="text-center py-12">
            <Brain className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No Insights Available</h3>
            <p className="text-muted-foreground">
              {loading ? 'Loading insights...' : 'No insights match your filters.'}
            </p>
          </div>
        )}
      </div>

      {/* Performance Stats */}
      <div className="text-xs text-muted-foreground">
        Cache hit rate: {CacheManager.getStats().hitRate.toFixed(1)}% • 
        Memory usage: {(JSON.stringify(insights).length / 1024).toFixed(1)}KB
      </div>
    </div>
  );
};

export default VirtualizedAnalyticsHub;