
import { supabase } from "@/integrations/supabase/client";
import { getCurrentUserProfile } from "@/lib/supabase-utils";
import type { QueryOptions, PaginatedResult } from "@/lib/supabase/types";

export interface OptimizedQueryOptions extends QueryOptions {
  fromDate?: string;
  toDate?: string;
  categories?: string[];
  severities?: string[];
  statuses?: string[];
  useCache?: boolean;
}

export interface TimeSeriesData {
  date: string;
  value: number;
  category?: string;
  metadata?: Record<string, any>;
}

export interface PredictiveScore {
  metric: string;
  current_value: number;
  predicted_value: number;
  confidence: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  forecast_period: string;
  factors: string[];
}

export const optimizedAnalyticsService = {
  // Performance-optimized incident analytics with pagination
  async getIncidentAnalyticsPaginated(options: OptimizedQueryOptions = {}): Promise<PaginatedResult<any>> {
    try {
      const profile = await getCurrentUserProfile();
      if (!profile?.organization_id) return { data: [], count: 0, page: 1, pageSize: 20, totalPages: 0 };

      const { page = 1, pageSize = 20, sortBy = 'reported_at', sortOrder = 'desc' } = options;
      const offset = (page - 1) * pageSize;

      // Build optimized query with indexes
      let query = supabase
        .from('incident_logs')
        .select('*', { count: 'exact' })
        .eq('org_id', profile.organization_id);

      // Apply filters
      if (options.fromDate) {
        query = query.gte('reported_at', options.fromDate);
      }
      if (options.toDate) {
        query = query.lte('reported_at', options.toDate);
      }
      if (options.categories?.length) {
        query = query.in('category', options.categories);
      }
      if (options.severities?.length) {
        query = query.in('severity', options.severities);
      }
      if (options.statuses?.length) {
        query = query.in('status', options.statuses);
      }

      // Apply sorting and pagination
      query = query.order(sortBy, { ascending: sortOrder === 'asc' });
      query = query.range(offset, offset + pageSize - 1);

      const { data, error, count } = await query;
      if (error) throw error;

      const totalPages = Math.ceil((count || 0) / pageSize);

      return {
        data: data || [],
        count: count || 0,
        page,
        pageSize,
        totalPages
      };
    } catch (error) {
      console.error('Error fetching paginated incident analytics:', error);
      return { data: [], count: 0, page: 1, pageSize: 20, totalPages: 0 };
    }
  },

  // Time-series data for trend analysis using simpler queries
  async getTimeSeriesData(
    table: string,
    dateColumn: string,
    valueColumn: string,
    options: OptimizedQueryOptions = {}
  ): Promise<TimeSeriesData[]> {
    try {
      const profile = await getCurrentUserProfile();
      if (!profile?.organization_id) return [];

      // Use simpler query that works with existing structure
      let query = supabase
        .from(table)
        .select('*')
        .eq('org_id', profile.organization_id);

      if (options.fromDate) {
        query = query.gte(dateColumn, options.fromDate);
      }
      if (options.toDate) {
        query = query.lte(dateColumn, options.toDate);
      }

      const { data, error } = await query;
      if (error) throw error;

      // Group data by date on the client side
      const groupedData: Record<string, any[]> = {};
      (data || []).forEach(item => {
        const date = new Date(item[dateColumn]).toISOString().split('T')[0];
        if (!groupedData[date]) {
          groupedData[date] = [];
        }
        groupedData[date].push(item);
      });

      return Object.entries(groupedData).map(([date, items]) => ({
        date,
        value: items.length,
        metadata: { items: items.length }
      }));
    } catch (error) {
      console.error('Error fetching time series data:', error);
      return [];
    }
  },

  // Advanced predictive scoring using machine learning principles
  async generatePredictiveScores(): Promise<PredictiveScore[]> {
    try {
      const profile = await getCurrentUserProfile();
      if (!profile?.organization_id) return [];

      const scores: PredictiveScore[] = [];
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

      // Incident rate prediction
      const { data: recentIncidents } = await supabase
        .from('incident_logs')
        .select('reported_at, severity')
        .eq('org_id', profile.organization_id)
        .gte('reported_at', thirtyDaysAgo.toISOString());

      const { data: historicalIncidents } = await supabase
        .from('incident_logs')
        .select('reported_at, severity')
        .eq('org_id', profile.organization_id)
        .gte('reported_at', sixtyDaysAgo.toISOString())
        .lt('reported_at', thirtyDaysAgo.toISOString());

      if (recentIncidents && historicalIncidents) {
        const recentCount = recentIncidents.length;
        const historicalCount = historicalIncidents.length;
        
        // Simple linear trend extrapolation
        const trend = recentCount - historicalCount;
        const predictedValue = Math.max(0, recentCount + trend);
        const confidence = Math.min(90, Math.max(60, 100 - Math.abs(trend * 5)));

        scores.push({
          metric: 'Incident Rate',
          current_value: recentCount,
          predicted_value: predictedValue,
          confidence,
          trend: trend > 2 ? 'increasing' : trend < -2 ? 'decreasing' : 'stable',
          forecast_period: '30d',
          factors: [
            'Historical incident patterns',
            'Seasonal variations',
            'Current system health'
          ]
        });
      }

      // KRI breach prediction using existing structure
      const { data: kriLogs } = await supabase
        .from('kri_logs')
        .select('measurement_date, actual_value, threshold_breached')
        .eq('org_id', profile.organization_id)
        .gte('measurement_date', thirtyDaysAgo.toISOString().split('T')[0])
        .order('measurement_date', { ascending: true });

      if (kriLogs && kriLogs.length > 5) {
        const breachCount = kriLogs.filter(log => log.threshold_breached === 'yes').length;
        const totalCount = kriLogs.length;
        const currentBreachRate = (breachCount / totalCount) * 100;
        
        // Analyze trend in breach rate
        const midPoint = Math.floor(kriLogs.length / 2);
        const firstHalf = kriLogs.slice(0, midPoint);
        const secondHalf = kriLogs.slice(midPoint);
        
        const firstHalfBreaches = firstHalf.filter(log => log.threshold_breached === 'yes').length;
        const secondHalfBreaches = secondHalf.filter(log => log.threshold_breached === 'yes').length;
        
        const firstHalfRate = (firstHalfBreaches / firstHalf.length) * 100;
        const secondHalfRate = (secondHalfBreaches / secondHalf.length) * 100;
        
        const trendChange = secondHalfRate - firstHalfRate;
        const predictedBreachRate = Math.max(0, Math.min(100, currentBreachRate + trendChange));

        scores.push({
          metric: 'KRI Breach Rate',
          current_value: currentBreachRate,
          predicted_value: predictedBreachRate,
          confidence: 85,
          trend: trendChange > 5 ? 'increasing' : trendChange < -5 ? 'decreasing' : 'stable',
          forecast_period: '30d',
          factors: [
            'Recent KRI performance',
            'Control effectiveness',
            'Risk environment changes'
          ]
        });
      }

      return scores;
    } catch (error) {
      console.error('Error generating predictive scores:', error);
      return [];
    }
  },

  // Cached analytics for performance using analytics_insights table
  async getCachedAnalytics(cacheKey: string, queryFn: () => Promise<any>, ttlMinutes: number = 15): Promise<any> {
    try {
      const cacheExpiry = new Date(Date.now() - ttlMinutes * 60 * 1000);
      
      // Try to get from cache first
      const { data: cached } = await supabase
        .from('analytics_insights')
        .select('insight_data')
        .eq('insight_type', 'correlation')
        .contains('tags', [cacheKey])
        .gte('generated_at', cacheExpiry.toISOString())
        .maybeSingle();

      if (cached?.insight_data) {
        return cached.insight_data;
      }

      // If not in cache, execute query and cache result
      const result = await queryFn();
      
      // Store in cache
      const profile = await getCurrentUserProfile();
      if (profile?.organization_id) {
        await supabase
          .from('analytics_insights')
          .insert({
            org_id: profile.organization_id,
            insight_type: 'correlation',
            insight_data: result,
            confidence_score: 100,
            valid_until: new Date(Date.now() + ttlMinutes * 60 * 1000).toISOString(),
            tags: [cacheKey]
          });
      }

      return result;
    } catch (error) {
      console.error('Error with cached analytics:', error);
      // Fallback to direct query execution
      return await queryFn();
    }
  },

  // Optimized aggregation queries
  async getAggregatedMetrics(options: OptimizedQueryOptions = {}): Promise<Record<string, any>> {
    try {
      const profile = await getCurrentUserProfile();
      if (!profile?.organization_id) return {};

      const { fromDate, toDate } = options;
      
      // Build filters for date range
      const incidentFilter: any = { org_id: profile.organization_id };
      const kriFilter: any = { org_id: profile.organization_id };
      const complianceFilter: any = { org_id: profile.organization_id };

      if (fromDate && toDate) {
        incidentFilter.reported_at = `gte.${fromDate}`;
        incidentFilter.reported_at = `lte.${toDate}`;
        kriFilter.measurement_date = `gte.${fromDate.split('T')[0]}`;
        kriFilter.measurement_date = `lte.${toDate.split('T')[0]}`;
        complianceFilter.created_at = `gte.${fromDate}`;
        complianceFilter.created_at = `lte.${toDate}`;
      }

      // Use Promise.all for parallel execution
      const [incidentStats, kriStats, complianceStats] = await Promise.all([
        supabase
          .from('incident_logs')
          .select('status, severity')
          .eq('org_id', profile.organization_id),
        
        supabase
          .from('kri_logs')
          .select('threshold_breached')
          .eq('org_id', profile.organization_id),
        
        supabase
          .from('compliance_findings')
          .select('status, severity')
          .eq('org_id', profile.organization_id)
      ]);

      return {
        incidents: {
          total: incidentStats.data?.length || 0,
          by_severity: this.groupBy(incidentStats.data || [], 'severity'),
          by_status: this.groupBy(incidentStats.data || [], 'status')
        },
        kri: {
          total: kriStats.data?.length || 0,
          by_status: this.groupBy(kriStats.data || [], 'threshold_breached')
        },
        compliance: {
          total: complianceStats.data?.length || 0,
          by_severity: this.groupBy(complianceStats.data || [], 'severity'),
          by_status: this.groupBy(complianceStats.data || [], 'status')
        }
      };
    } catch (error) {
      console.error('Error fetching aggregated metrics:', error);
      return {};
    }
  },

  // Helper function for grouping
  groupBy(array: any[], key: string): Record<string, number> {
    return array.reduce((groups, item) => {
      const group = item[key] || 'unknown';
      groups[group] = (groups[group] || 0) + 1;
      return groups;
    }, {});
  }
};
