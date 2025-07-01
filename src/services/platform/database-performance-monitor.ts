
import { supabase } from "@/integrations/supabase/client";
import { getCurrentUserProfile } from "@/lib/supabase-utils";

export interface PerformanceMetric {
  id: string;
  org_id: string;
  service_name: string;
  region: string;
  metric_timestamp: string;
  response_time_ms: number;
  throughput_rps: number;
  error_rate: number;
  cpu_usage: number;
  memory_usage: number;
  disk_usage: number;
  network_latency_ms: number;
  database_connections: number;
  queue_depth: number;
  cache_hit_rate: number;
  user_experience_metrics: Record<string, any>;
  system_metrics: Record<string, any>;
  custom_metrics: Record<string, any>;
  created_at: string;
}

export interface DashboardMetrics {
  org_id: string;
  service_name: string;
  metric_hour: string;
  avg_response_time: number;
  avg_throughput: number;
  avg_error_rate: number;
  avg_cpu_usage: number;
  avg_memory_usage: number;
  metric_count: number;
}

class DatabasePerformanceMonitor {
  // Record performance metrics
  async recordMetrics(metrics: Omit<PerformanceMetric, 'id' | 'org_id' | 'created_at'>): Promise<void> {
    const profile = await getCurrentUserProfile();
    if (!profile?.organization_id) throw new Error('No organization found');

    const { error } = await supabase
      .from('performance_metrics')
      .insert({
        org_id: profile.organization_id,
        service_name: metrics.service_name,
        region: metrics.region,
        metric_timestamp: metrics.metric_timestamp,
        response_time_ms: metrics.response_time_ms,
        throughput_rps: metrics.throughput_rps,
        error_rate: metrics.error_rate,
        cpu_usage: metrics.cpu_usage,
        memory_usage: metrics.memory_usage,
        disk_usage: metrics.disk_usage,
        network_latency_ms: metrics.network_latency_ms,
        database_connections: metrics.database_connections,
        queue_depth: metrics.queue_depth,
        cache_hit_rate: metrics.cache_hit_rate,
        user_experience_metrics: metrics.user_experience_metrics,
        system_metrics: metrics.system_metrics,
        custom_metrics: metrics.custom_metrics
      });

    if (error) throw error;
  }

  // Get recent metrics for a service
  async getServiceMetrics(serviceName: string, hours: number = 24): Promise<PerformanceMetric[]> {
    const profile = await getCurrentUserProfile();
    if (!profile?.organization_id) return [];

    const { data, error } = await supabase
      .from('performance_metrics')
      .select('*')
      .eq('org_id', profile.organization_id)
      .eq('service_name', serviceName)
      .gte('metric_timestamp', new Date(Date.now() - hours * 60 * 60 * 1000).toISOString())
      .order('metric_timestamp', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  // Get aggregated dashboard metrics
  async getDashboardMetrics(): Promise<DashboardMetrics[]> {
    const profile = await getCurrentUserProfile();
    if (!profile?.organization_id) return [];

    const { data, error } = await supabase
      .from('performance_dashboard_metrics')
      .select('*')
      .eq('org_id', profile.organization_id)
      .order('metric_hour', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  // Get system-wide metrics
  async getSystemMetrics(hours: number = 24): Promise<PerformanceMetric[]> {
    const profile = await getCurrentUserProfile();
    if (!profile?.organization_id) return [];

    const { data, error } = await supabase
      .from('performance_metrics')
      .select('*')
      .eq('org_id', profile.organization_id)
      .gte('metric_timestamp', new Date(Date.now() - hours * 60 * 60 * 1000).toISOString())
      .order('metric_timestamp', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  // Get metrics by time range
  async getMetricsByTimeRange(startTime: Date, endTime: Date, serviceName?: string): Promise<PerformanceMetric[]> {
    const profile = await getCurrentUserProfile();
    if (!profile?.organization_id) return [];

    let query = supabase
      .from('performance_metrics')
      .select('*')
      .eq('org_id', profile.organization_id)
      .gte('metric_timestamp', startTime.toISOString())
      .lte('metric_timestamp', endTime.toISOString());

    if (serviceName) {
      query = query.eq('service_name', serviceName);
    }

    const { data, error } = await query.order('metric_timestamp', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  // Calculate service health score
  async calculateHealthScore(serviceName: string): Promise<number> {
    const metrics = await this.getServiceMetrics(serviceName, 1); // Last hour
    
    if (metrics.length === 0) return 0;

    const avgMetrics = metrics.reduce((acc, metric) => ({
      response_time: acc.response_time + metric.response_time_ms,
      error_rate: acc.error_rate + metric.error_rate,
      cpu_usage: acc.cpu_usage + metric.cpu_usage,
      memory_usage: acc.memory_usage + metric.memory_usage
    }), { response_time: 0, error_rate: 0, cpu_usage: 0, memory_usage: 0 });

    const count = metrics.length;
    const avgResponseTime = avgMetrics.response_time / count;
    const avgErrorRate = avgMetrics.error_rate / count;
    const avgCpuUsage = avgMetrics.cpu_usage / count;
    const avgMemoryUsage = avgMetrics.memory_usage / count;

    // Calculate health score (0-100)
    let healthScore = 100;
    
    // Penalize high response times (>1000ms is bad)
    if (avgResponseTime > 1000) healthScore -= Math.min(30, (avgResponseTime - 1000) / 100);
    
    // Penalize error rates (>5% is bad)
    if (avgErrorRate > 0.05) healthScore -= Math.min(40, (avgErrorRate - 0.05) * 1000);
    
    // Penalize high CPU usage (>80% is bad)
    if (avgCpuUsage > 80) healthScore -= Math.min(20, (avgCpuUsage - 80) / 2);
    
    // Penalize high memory usage (>80% is bad)
    if (avgMemoryUsage > 80) healthScore -= Math.min(10, (avgMemoryUsage - 80) / 2);

    return Math.max(0, Math.round(healthScore));
  }

  // Refresh dashboard materialized view
  async refreshDashboard(): Promise<void> {
    const { error } = await supabase.rpc('refresh_performance_dashboard');
    if (error) throw error;
  }

  // Clean up old metrics (data retention)
  async cleanupOldMetrics(retentionDays: number = 30): Promise<void> {
    const profile = await getCurrentUserProfile();
    if (!profile?.organization_id) return;

    const cutoffDate = new Date(Date.now() - retentionDays * 24 * 60 * 60 * 1000);

    const { error } = await supabase
      .from('performance_metrics')
      .delete()
      .eq('org_id', profile.organization_id)
      .lt('metric_timestamp', cutoffDate.toISOString());

    if (error) throw error;
  }
}

export const databasePerformanceMonitor = new DatabasePerformanceMonitor();
