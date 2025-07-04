import { supabase } from "@/integrations/supabase/client";
import { getCurrentUserProfile } from "@/lib/supabase-utils";

// Pagination options
export interface PaginationOptions {
  page?: number;
  limit?: number;
  offset?: number;
}

// Incident query options
export interface IncidentQueryOptions extends PaginationOptions {
  severity?: string;
  status?: string;
  category?: string;
  sortBy?: 'created_at' | 'severity' | 'status';
  sortOrder?: 'asc' | 'desc';
}

// KRI query options
export interface KRIQueryOptions extends PaginationOptions {
  startDate?: string;
  endDate?: string;
  kriId?: string;
  thresholdBreached?: string;
}

// Analytics query options
export interface AnalyticsQueryOptions extends PaginationOptions {
  insightType?: string;
  activeOnly?: boolean;
  minConfidence?: number;
}

// Response types
export interface PaginatedResult<T> {
  data: T[];
  totalCount: number;
  page: number;
  limit: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface IncidentSummary {
  totalIncidents: number;
  criticalIncidents: number;
  openIncidents: number;
  averageResolutionTime: number;
  incidentsByCategory: Record<string, number>;
  incidentsBySeverity: Record<string, number>;
}

export interface KRISummary {
  totalLogs: number;
  breachedThresholds: number;
  uniqueKRIs: number;
  averageValue: number;
  trendDirection: 'up' | 'down' | 'stable';
}

export interface AnalyticsSummary {
  totalInsights: number;
  activeInsights: number;
  highConfidenceInsights: number;
  insightsByType: Record<string, number>;
}

class PerformanceOptimizedQueryService {
  // ========== INCIDENT LOGS ==========
  
  async getIncidentsSummary(): Promise<IncidentSummary> {
    const profile = await getCurrentUserProfile();
    if (!profile?.organization_id) throw new Error('No organization found');

    // Use aggregation query for summary - much faster than fetching all records
    const { data, error } = await supabase.rpc('get_incidents_summary', {
      org_id_param: profile.organization_id
    });

    if (error) {
      console.error('Error fetching incidents summary:', error);
      // Fallback to basic query if RPC doesn't exist
      return this.getIncidentsSummaryFallback();
    }

    return data;
  }

  private async getIncidentsSummaryFallback(): Promise<IncidentSummary> {
    const profile = await getCurrentUserProfile();
    if (!profile?.organization_id) throw new Error('No organization found');

    const { data, error } = await supabase
      .from('incident_logs')
      .select('severity, status, category, created_at, resolved_at')
      .eq('org_id', profile.organization_id);

    if (error) throw error;

    const incidents = data || [];
    const criticalIncidents = incidents.filter(i => i.severity === 'critical').length;
    const openIncidents = incidents.filter(i => i.status === 'open').length;
    
    const resolvedIncidents = incidents.filter(i => i.resolved_at);
    const averageResolutionTime = resolvedIncidents.length > 0 
      ? resolvedIncidents.reduce((acc, incident) => {
          const created = new Date(incident.created_at);
          const resolved = new Date(incident.resolved_at);
          return acc + (resolved.getTime() - created.getTime());
        }, 0) / resolvedIncidents.length / (1000 * 60 * 60) // Convert to hours
      : 0;

    const incidentsByCategory = incidents.reduce((acc, incident) => {
      acc[incident.category] = (acc[incident.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const incidentsBySeverity = incidents.reduce((acc, incident) => {
      acc[incident.severity] = (acc[incident.severity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalIncidents: incidents.length,
      criticalIncidents,
      openIncidents,
      averageResolutionTime: Math.round(averageResolutionTime),
      incidentsByCategory,
      incidentsBySeverity
    };
  }

  async getIncidentsPaginated(options: IncidentQueryOptions = {}): Promise<PaginatedResult<any>> {
    const profile = await getCurrentUserProfile();
    if (!profile?.organization_id) throw new Error('No organization found');

    const {
      page = 1,
      limit = 50,
      severity,
      status,
      category,
      sortBy = 'created_at',
      sortOrder = 'desc'
    } = options;

    const offset = (page - 1) * limit;

    let query = supabase
      .from('incident_logs')
      .select('*', { count: 'exact' })
      .eq('org_id', profile.organization_id);

    // Apply filters
    if (severity) query = query.eq('severity', severity);
    if (status) query = query.eq('status', status);
    if (category) query = query.eq('category', category);

    // Apply sorting and pagination
    query = query
      .order(sortBy, { ascending: sortOrder === 'asc' })
      .range(offset, offset + limit - 1);

    const { data, count, error } = await query;

    if (error) throw error;

    return {
      data: data || [],
      totalCount: count || 0,
      page,
      limit,
      hasNextPage: (count || 0) > offset + limit,
      hasPreviousPage: page > 1
    };
  }

  // ========== KRI LOGS ==========

  async getKRISummary(options: { startDate?: string; endDate?: string } = {}): Promise<KRISummary> {
    const profile = await getCurrentUserProfile();
    if (!profile?.organization_id) throw new Error('No organization found');

    let query = supabase
      .from('kri_logs')
      .select('actual_value, threshold_breached, kri_id, measurement_date');

    if (options.startDate) {
      query = query.gte('measurement_date', options.startDate);
    }
    if (options.endDate) {
      query = query.lte('measurement_date', options.endDate);
    }

    const { data, error } = await query;

    if (error) throw error;

    const logs = data || [];
    const breachedThresholds = logs.filter(log => log.threshold_breached && log.threshold_breached !== 'none').length;
    const uniqueKRIs = new Set(logs.map(log => log.kri_id)).size;
    const averageValue = logs.length > 0 
      ? logs.reduce((acc, log) => acc + (Number(log.actual_value) || 0), 0) / logs.length
      : 0;

    // Simple trend calculation based on recent vs older values
    const sortedLogs = logs.sort((a, b) => new Date(b.measurement_date).getTime() - new Date(a.measurement_date).getTime());
    const recentLogs = sortedLogs.slice(0, Math.floor(logs.length / 3));
    const olderLogs = sortedLogs.slice(-Math.floor(logs.length / 3));
    
    const recentAvg = recentLogs.length > 0 ? recentLogs.reduce((acc, log) => acc + (Number(log.actual_value) || 0), 0) / recentLogs.length : 0;
    const olderAvg = olderLogs.length > 0 ? olderLogs.reduce((acc, log) => acc + (Number(log.actual_value) || 0), 0) / olderLogs.length : 0;
    
    let trendDirection: 'up' | 'down' | 'stable' = 'stable';
    if (recentAvg > olderAvg * 1.05) trendDirection = 'up';
    else if (recentAvg < olderAvg * 0.95) trendDirection = 'down';

    return {
      totalLogs: logs.length,
      breachedThresholds,
      uniqueKRIs,
      averageValue: Math.round(averageValue * 100) / 100,
      trendDirection
    };
  }

  async getKRILogsPaginated(options: KRIQueryOptions = {}): Promise<PaginatedResult<any>> {
    const {
      page = 1,
      limit = 100,
      startDate,
      endDate,
      kriId,
      thresholdBreached
    } = options;

    const offset = (page - 1) * limit;

    let query = supabase
      .from('kri_logs')
      .select('*, kri_definitions(name)', { count: 'exact' });

    // Apply filters
    if (startDate) query = query.gte('measurement_date', startDate);
    if (endDate) query = query.lte('measurement_date', endDate);
    if (kriId) query = query.eq('kri_id', kriId);
    if (thresholdBreached) query = query.eq('threshold_breached', thresholdBreached);

    // Apply sorting and pagination
    query = query
      .order('measurement_date', { ascending: false })
      .range(offset, offset + limit - 1);

    const { data, count, error } = await query;

    if (error) throw error;

    return {
      data: data || [],
      totalCount: count || 0,
      page,
      limit,
      hasNextPage: (count || 0) > offset + limit,
      hasPreviousPage: page > 1
    };
  }

  // ========== ANALYTICS INSIGHTS ==========

  async getAnalyticsSummary(): Promise<AnalyticsSummary> {
    const profile = await getCurrentUserProfile();
    if (!profile?.organization_id) throw new Error('No organization found');

    const { data, error } = await supabase
      .from('analytics_insights')
      .select('insight_type, confidence_score, valid_until')
      .eq('org_id', profile.organization_id);

    if (error) throw error;

    const insights = data || [];
    const now = new Date();
    const activeInsights = insights.filter(insight => 
      !insight.valid_until || new Date(insight.valid_until) > now
    ).length;
    
    const highConfidenceInsights = insights.filter(insight => 
      insight.confidence_score && insight.confidence_score >= 0.8
    ).length;

    const insightsByType = insights.reduce((acc, insight) => {
      acc[insight.insight_type] = (acc[insight.insight_type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalInsights: insights.length,
      activeInsights,
      highConfidenceInsights,
      insightsByType
    };
  }

  async getAnalyticsInsightsPaginated(options: AnalyticsQueryOptions = {}): Promise<PaginatedResult<any>> {
    const profile = await getCurrentUserProfile();
    if (!profile?.organization_id) throw new Error('No organization found');

    const {
      page = 1,
      limit = 25,
      insightType,
      activeOnly = false,
      minConfidence
    } = options;

    const offset = (page - 1) * limit;

    let query = supabase
      .from('analytics_insights')
      .select('*', { count: 'exact' })
      .eq('org_id', profile.organization_id);

    // Apply filters
    if (insightType) query = query.eq('insight_type', insightType);
    if (activeOnly) {
      query = query.or('valid_until.is.null,valid_until.gt.' + new Date().toISOString());
    }
    if (minConfidence) {
      query = query.gte('confidence_score', minConfidence);
    }

    // Apply sorting and pagination
    query = query
      .order('generated_at', { ascending: false })
      .range(offset, offset + limit - 1);

    const { data, count, error } = await query;

    if (error) throw error;

    return {
      data: data || [],
      totalCount: count || 0,
      page,
      limit,
      hasNextPage: (count || 0) > offset + limit,
      hasPreviousPage: page > 1
    };
  }

  // ========== BATCH OPERATIONS ==========

  async getBatchSummaries() {
    const [incidentSummary, kriSummary, analyticsSummary] = await Promise.all([
      this.getIncidentsSummary(),
      this.getKRISummary(),
      this.getAnalyticsSummary()
    ]);

    return {
      incidents: incidentSummary,
      kri: kriSummary,
      analytics: analyticsSummary
    };
  }
}

export const performanceOptimizedQueryService = new PerformanceOptimizedQueryService();