
import { supabase } from "@/integrations/supabase/client";
import { getCurrentUserProfile } from "@/lib/supabase-utils";

export interface PerformanceMetrics {
  id: string;
  org_id: string;
  metric_type: string;
  metric_category: string;
  measurement_timestamp: string;
  metric_value: number;
  metric_unit?: string;
  additional_metadata: any;
  created_at: string;
}

class EnhancedPerformanceService {
  private performanceObserver?: PerformanceObserver;
  private metricsBuffer: any[] = [];
  private bufferFlushInterval = 30000; // 30 seconds

  // Initialize performance monitoring
  async initializePerformanceMonitoring(): Promise<void> {
    this.setupPerformanceObserver();
    this.monitorResourceTiming();
    this.monitorUserInteractions();
    this.monitorMemoryUsage();
    this.setupAutomaticReporting();
    
    // Monitor bundle size and loading performance
    this.monitorBundlePerformance();
    
    // Setup real-time performance alerts
    this.setupPerformanceAlerts();
  }

  // Setup performance observer
  private setupPerformanceObserver(): void {
    if ('PerformanceObserver' in window) {
      this.performanceObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        this.processPerformanceEntries(entries);
      });

      // Observe different types of performance entries
      try {
        this.performanceObserver.observe({ entryTypes: ['navigation', 'resource', 'measure', 'paint'] });
      } catch (error) {
        console.warn('Some performance entry types not supported:', error);
      }
    }
  }

  // Process performance entries
  private processPerformanceEntries(entries: PerformanceEntry[]): void {
    entries.forEach(entry => {
      const metric = this.convertEntryToMetric(entry);
      if (metric) {
        this.metricsBuffer.push(metric);
      }
    });
  }

  // Convert performance entry to metric
  private convertEntryToMetric(entry: PerformanceEntry): any | null {
    switch (entry.entryType) {
      case 'navigation':
        return this.processNavigationEntry(entry as PerformanceNavigationTiming);
      case 'resource':
        return this.processResourceEntry(entry as PerformanceResourceTiming);
      case 'paint':
        return this.processPaintEntry(entry);
      case 'measure':
        return this.processMeasureEntry(entry);
      default:
        return null;
    }
  }

  private processNavigationEntry(entry: PerformanceNavigationTiming): any {
    return {
      metric_type: 'page_load',
      metric_category: 'navigation',
      metric_value: entry.loadEventEnd - entry.loadEventStart,
      metric_unit: 'milliseconds',
      additional_metadata: {
        dns_lookup: entry.domainLookupEnd - entry.domainLookupStart,
        tcp_connect: entry.connectEnd - entry.connectStart,
        server_response: entry.responseEnd - entry.requestStart,
        dom_processing: entry.domComplete - entry.domLoading,
        resource_load: entry.loadEventEnd - entry.loadEventStart,
        total_load_time: entry.loadEventEnd - entry.navigationStart,
        transfer_size: entry.transferSize,
        navigation_type: entry.type
      }
    };
  }

  private processResourceEntry(entry: PerformanceResourceTiming): any {
    const resourceType = this.getResourceType(entry.name);
    
    return {
      metric_type: 'resource_load',
      metric_category: resourceType,
      metric_value: entry.responseEnd - entry.startTime,
      metric_unit: 'milliseconds',
      additional_metadata: {
        resource_name: entry.name,
        transfer_size: entry.transferSize,
        encoded_size: entry.encodedBodySize,
        decoded_size: entry.decodedBodySize,
        cache_status: this.getCacheStatus(entry),
        initiator_type: entry.initiatorType
      }
    };
  }

  private processPaintEntry(entry: PerformanceEntry): any {
    return {
      metric_type: 'paint_timing',
      metric_category: 'rendering',
      metric_value: entry.startTime,
      metric_unit: 'milliseconds',
      additional_metadata: {
        paint_type: entry.name
      }
    };
  }

  private processMeasureEntry(entry: PerformanceEntry): any {
    return {
      metric_type: 'custom_measure',
      metric_category: 'performance',
      metric_value: entry.duration,
      metric_unit: 'milliseconds',
      additional_metadata: {
        measure_name: entry.name
      }
    };
  }

  // Monitor resource timing
  private monitorResourceTiming(): void {
    // Monitor slow resources
    setInterval(() => {
      const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
      const slowResources = resources.filter(resource => 
        resource.responseEnd - resource.startTime > 5000 // > 5 seconds
      );

      if (slowResources.length > 0) {
        this.reportSlowResources(slowResources);
      }
    }, 60000); // Check every minute
  }

  // Monitor user interactions
  private monitorUserInteractions(): void {
    // Track click responsiveness
    let clickStartTime: number;
    
    document.addEventListener('mousedown', () => {
      clickStartTime = performance.now();
    });

    document.addEventListener('click', (event) => {
      if (clickStartTime) {
        const responseTime = performance.now() - clickStartTime;
        
        this.metricsBuffer.push({
          metric_type: 'interaction_responsiveness',
          metric_category: 'user_experience',
          metric_value: responseTime,
          metric_unit: 'milliseconds',
          additional_metadata: {
            interaction_type: 'click',
            target_element: (event.target as Element)?.tagName || 'unknown'
          }
        });
      }
    });

    // Track form interactions
    document.addEventListener('submit', (event) => {
      const form = event.target as HTMLFormElement;
      const formId = form.id || form.className || 'unknown';
      
      this.metricsBuffer.push({
        metric_type: 'form_submission',
        metric_category: 'user_experience',
        metric_value: 1,
        metric_unit: 'count',
        additional_metadata: {
          form_identifier: formId,
          form_elements_count: form.elements.length
        }
      });
    });
  }

  // Monitor memory usage
  private monitorMemoryUsage(): void {
    if ('memory' in performance) {
      setInterval(() => {
        const memInfo = (performance as any).memory;
        
        this.metricsBuffer.push({
          metric_type: 'memory_usage',
          metric_category: 'system',
          metric_value: memInfo.usedJSHeapSize,
          metric_unit: 'bytes',
          additional_metadata: {
            total_heap_size: memInfo.totalJSHeapSize,
            heap_size_limit: memInfo.jsHeapSizeLimit,
            memory_pressure: memInfo.usedJSHeapSize / memInfo.jsHeapSizeLimit
          }
        });
      }, 30000); // Every 30 seconds
    }
  }

  // Monitor bundle performance
  private monitorBundlePerformance(): void {
    // Track bundle sizes
    const bundleMetrics = this.analyzeBundlePerformance();
    bundleMetrics.forEach(metric => this.metricsBuffer.push(metric));
    
    // Monitor code splitting effectiveness
    this.monitorCodeSplitting();
  }

  private analyzeBundlePerformance(): any[] {
    const metrics = [];
    const scripts = document.querySelectorAll('script[src]');
    
    scripts.forEach((script, index) => {
      const src = (script as HTMLScriptElement).src;
      if (src.includes('/assets/')) {
        metrics.push({
          metric_type: 'bundle_analysis',
          metric_category: 'loading',
          metric_value: 1,
          metric_unit: 'count',
          additional_metadata: {
            bundle_url: src,
            bundle_index: index,
            is_async: (script as HTMLScriptElement).async,
            is_defer: (script as HTMLScriptElement).defer
          }
        });
      }
    });

    return metrics;
  }

  private monitorCodeSplitting(): void {
    // Track dynamic imports
    const originalImport = window.import;
    if (originalImport) {
      (window as any).import = (specifier: string) => {
        const startTime = performance.now();
        
        return originalImport(specifier).then(module => {
          const loadTime = performance.now() - startTime;
          
          this.metricsBuffer.push({
            metric_type: 'dynamic_import',
            metric_category: 'loading',
            metric_value: loadTime,
            metric_unit: 'milliseconds',
            additional_metadata: {
              module_specifier: specifier,
              success: true
            }
          });
          
          return module;
        }).catch(error => {
          this.metricsBuffer.push({
            metric_type: 'dynamic_import',
            metric_category: 'loading',
            metric_value: -1,
            metric_unit: 'error',
            additional_metadata: {
              module_specifier: specifier,
              success: false,
              error_message: error.message
            }
          });
          throw error;
        });
      };
    }
  }

  // Setup automatic reporting
  private setupAutomaticReporting(): void {
    // Flush metrics buffer periodically
    setInterval(() => {
      this.flushMetricsBuffer();
    }, this.bufferFlushInterval);

    // Flush on page unload
    window.addEventListener('beforeunload', () => {
      this.flushMetricsBuffer();
    });

    // Flush when buffer gets too large
    setInterval(() => {
      if (this.metricsBuffer.length > 100) {
        this.flushMetricsBuffer();
      }
    }, 5000);
  }

  // Flush metrics buffer to database
  private async flushMetricsBuffer(): Promise<void> {
    if (this.metricsBuffer.length === 0) return;

    const profile = await getCurrentUserProfile();
    if (!profile?.organization_id) return;

    const metricsToFlush = [...this.metricsBuffer];
    this.metricsBuffer = [];

    try {
      const metricsWithOrgId = metricsToFlush.map(metric => ({
        org_id: profile.organization_id,
        ...metric
      }));

      await supabase
        .from('performance_analytics')
        .insert(metricsWithOrgId);

    } catch (error) {
      console.error('Failed to flush performance metrics:', error);
      // Put metrics back in buffer for retry
      this.metricsBuffer.unshift(...metricsToFlush);
    }
  }

  // Setup performance alerts
  private setupPerformanceAlerts(): void {
    // Alert on slow page loads
    this.setupSlowPageLoadAlert();
    
    // Alert on memory pressure
    this.setupMemoryPressureAlert();
    
    // Alert on error rates
    this.setupErrorRateAlert();
  }

  private setupSlowPageLoadAlert(): void {
    window.addEventListener('load', () => {
      const navigationTiming = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const loadTime = navigationTiming.loadEventEnd - navigationTiming.navigationStart;
      
      if (loadTime > 10000) { // > 10 seconds
        this.triggerPerformanceAlert('slow_page_load', {
          load_time: loadTime,
          threshold: 10000,
          url: window.location.href
        });
      }
    });
  }

  private setupMemoryPressureAlert(): void {
    if ('memory' in performance) {
      setInterval(() => {
        const memInfo = (performance as any).memory;
        const memoryPressure = memInfo.usedJSHeapSize / memInfo.jsHeapSizeLimit;
        
        if (memoryPressure > 0.9) { // > 90% memory usage
          this.triggerPerformanceAlert('memory_pressure', {
            memory_pressure: memoryPressure,
            used_heap: memInfo.usedJSHeapSize,
            heap_limit: memInfo.jsHeapSizeLimit
          });
        }
      }, 60000); // Check every minute
    }
  }

  private setupErrorRateAlert(): void {
    let errorCount = 0;
    let totalRequests = 0;
    
    // Monitor fetch errors
    const originalFetch = window.fetch;
    window.fetch = (...args) => {
      totalRequests++;
      return originalFetch(...args).catch(error => {
        errorCount++;
        this.checkErrorRate(errorCount, totalRequests);
        throw error;
      });
    };

    // Monitor JavaScript errors
    window.addEventListener('error', () => {
      errorCount++;
      this.checkErrorRate(errorCount, totalRequests || 1);
    });
  }

  private checkErrorRate(errors: number, requests: number): void {
    const errorRate = errors / requests;
    
    if (errorRate > 0.1 && requests > 10) { // > 10% error rate with at least 10 requests
      this.triggerPerformanceAlert('high_error_rate', {
        error_rate: errorRate,
        error_count: errors,
        total_requests: requests
      });
    }
  }

  // Trigger performance alert
  private triggerPerformanceAlert(alertType: string, data: any): void {
    console.warn(`Performance Alert: ${alertType}`, data);
    
    // In production, this would trigger notifications/alerts
    this.metricsBuffer.push({
      metric_type: 'performance_alert',
      metric_category: 'alerts',
      metric_value: 1,
      metric_unit: 'count',
      additional_metadata: {
        alert_type: alertType,
        alert_data: data,
        user_agent: navigator.userAgent,
        url: window.location.href
      }
    });
  }

  // Performance optimization suggestions
  async getPerformanceOptimizationSuggestions(): Promise<any[]> {
    const profile = await getCurrentUserProfile();
    if (!profile?.organization_id) return [];

    // Analyze recent performance data
    const { data: recentMetrics } = await supabase
      .from('performance_analytics')
      .select('*')
      .eq('org_id', profile.organization_id)
      .gte('measurement_timestamp', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      .order('measurement_timestamp', { ascending: false });

    if (!recentMetrics || recentMetrics.length === 0) return [];

    const suggestions = this.analyzeMetricsForSuggestions(recentMetrics);
    return suggestions;
  }

  private analyzeMetricsForSuggestions(metrics: PerformanceMetrics[]): any[] {
    const suggestions = [];

    // Analyze page load times
    const pageLoadMetrics = metrics.filter(m => m.metric_type === 'page_load');
    if (pageLoadMetrics.length > 0) {
      const avgLoadTime = pageLoadMetrics.reduce((sum, m) => sum + m.metric_value, 0) / pageLoadMetrics.length;
      
      if (avgLoadTime > 5000) {
        suggestions.push({
          type: 'page_load_optimization',
          priority: 'high',
          description: 'Page load times are above recommended thresholds',
          recommendation: 'Consider implementing code splitting, lazy loading, and optimizing critical resources',
          metric_value: avgLoadTime,
          threshold: 5000
        });
      }
    }

    // Analyze resource loading
    const resourceMetrics = metrics.filter(m => m.metric_type === 'resource_load');
    const slowResources = resourceMetrics.filter(m => m.metric_value > 3000);
    
    if (slowResources.length > 0) {
      suggestions.push({
        type: 'resource_optimization',
        priority: 'medium',
        description: `${slowResources.length} resources are loading slowly`,
        recommendation: 'Optimize slow resources with compression, CDN, or caching',
        affected_resources: slowResources.length
      });
    }

    // Analyze memory usage
    const memoryMetrics = metrics.filter(m => m.metric_type === 'memory_usage');
    if (memoryMetrics.length > 0) {
      const highMemoryUsage = memoryMetrics.filter(m => 
        m.additional_metadata?.memory_pressure > 0.8
      );
      
      if (highMemoryUsage.length > 0) {
        suggestions.push({
          type: 'memory_optimization',
          priority: 'high',
          description: 'High memory usage detected',
          recommendation: 'Review memory leaks, optimize data structures, and implement proper cleanup',
          occurrences: highMemoryUsage.length
        });
      }
    }

    // Analyze interaction responsiveness
    const interactionMetrics = metrics.filter(m => m.metric_type === 'interaction_responsiveness');
    if (interactionMetrics.length > 0) {
      const slowInteractions = interactionMetrics.filter(m => m.metric_value > 100);
      
      if (slowInteractions.length > 0) {
        suggestions.push({
          type: 'interaction_optimization',
          priority: 'medium',
          description: 'Some user interactions are responding slowly',
          recommendation: 'Optimize event handlers and consider debouncing/throttling',
          slow_interactions: slowInteractions.length
        });
      }
    }

    return suggestions;
  }

  // Real-time performance dashboard data
  async getPerformanceDashboardData(): Promise<any> {
    const profile = await getCurrentUserProfile();
    if (!profile?.organization_id) return null;

    const now = new Date();
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Get recent metrics
    const { data: recentMetrics } = await supabase
      .from('performance_analytics')
      .select('*')
      .eq('org_id', profile.organization_id)
      .gte('measurement_timestamp', oneDayAgo.toISOString())
      .order('measurement_timestamp', { ascending: false });

    // Get weekly trend data
    const { data: weeklyMetrics } = await supabase
      .from('performance_analytics')
      .select('*')
      .eq('org_id', profile.organization_id)
      .gte('measurement_timestamp', oneWeekAgo.toISOString())
      .order('measurement_timestamp', { ascending: false });

    const dashboardData = {
      current_performance: this.calculateCurrentPerformance(recentMetrics || []),
      trends: this.calculatePerformanceTrends(weeklyMetrics || []),
      alerts: this.getActiveAlerts(recentMetrics || []),
      suggestions: await this.getPerformanceOptimizationSuggestions(),
      resource_breakdown: this.analyzeResourcePerformance(recentMetrics || []),
      user_experience_metrics: this.calculateUserExperienceMetrics(recentMetrics || [])
    };

    return dashboardData;
  }

  private calculateCurrentPerformance(metrics: PerformanceMetrics[]): any {
    const pageLoadMetrics = metrics.filter(m => m.metric_type === 'page_load');
    const memoryMetrics = metrics.filter(m => m.metric_type === 'memory_usage');
    const interactionMetrics = metrics.filter(m => m.metric_type === 'interaction_responsiveness');

    return {
      avg_page_load_time: this.calculateAverage(pageLoadMetrics.map(m => m.metric_value)),
      avg_memory_usage: this.calculateAverage(memoryMetrics.map(m => m.metric_value)),
      avg_interaction_time: this.calculateAverage(interactionMetrics.map(m => m.metric_value)),
      total_metrics_collected: metrics.length
    };
  }

  private calculatePerformanceTrends(metrics: PerformanceMetrics[]): any {
    // Simple trend calculation - would be more sophisticated in production
    const today = metrics.filter(m => 
      new Date(m.measurement_timestamp).getDate() === new Date().getDate()
    );
    const yesterday = metrics.filter(m => 
      new Date(m.measurement_timestamp).getDate() === new Date().getDate() - 1
    );

    const todayAvg = this.calculateAverage(today.map(m => m.metric_value));
    const yesterdayAvg = this.calculateAverage(yesterday.map(m => m.metric_value));

    return {
      performance_trend: todayAvg > yesterdayAvg ? 'degrading' : 'improving',
      change_percentage: yesterdayAvg > 0 ? ((todayAvg - yesterdayAvg) / yesterdayAvg) * 100 : 0
    };
  }

  private getActiveAlerts(metrics: PerformanceMetrics[]): any[] {
    return metrics
      .filter(m => m.metric_type === 'performance_alert')
      .slice(0, 10)
      .map(m => ({
        alert_type: m.additional_metadata?.alert_type,
        timestamp: m.measurement_timestamp,
        data: m.additional_metadata?.alert_data
      }));
  }

  private analyzeResourcePerformance(metrics: PerformanceMetrics[]): any {
    const resourceMetrics = metrics.filter(m => m.metric_type === 'resource_load');
    
    const byCategory = this.groupBy(resourceMetrics, 'metric_category');
    const breakdown = {};
    
    for (const [category, categoryMetrics] of Object.entries(byCategory)) {
      (breakdown as any)[category] = {
        count: (categoryMetrics as any[]).length,
        avg_load_time: this.calculateAverage((categoryMetrics as any[]).map(m => m.metric_value)),
        slow_resources: (categoryMetrics as any[]).filter(m => m.metric_value > 3000).length
      };
    }
    
    return breakdown;
  }

  private calculateUserExperienceMetrics(metrics: PerformanceMetrics[]): any {
    const paintMetrics = metrics.filter(m => m.metric_type === 'paint_timing');
    const interactionMetrics = metrics.filter(m => m.metric_type === 'interaction_responsiveness');
    
    return {
      first_contentful_paint: this.calculateAverage(
        paintMetrics
          .filter(m => m.additional_metadata?.paint_type === 'first-contentful-paint')
          .map(m => m.metric_value)
      ),
      interaction_responsiveness: this.calculateAverage(interactionMetrics.map(m => m.metric_value)),
      user_satisfaction_score: this.calculateUserSatisfactionScore(metrics)
    };
  }

  private calculateUserSatisfactionScore(metrics: PerformanceMetrics[]): number {
    // Simplified user satisfaction calculation based on performance metrics
    const pageLoadMetrics = metrics.filter(m => m.metric_type === 'page_load');
    const avgLoadTime = this.calculateAverage(pageLoadMetrics.map(m => m.metric_value));
    
    // Score from 0-100 based on load time (lower is better)
    if (avgLoadTime <= 1000) return 100;
    if (avgLoadTime <= 3000) return 80;
    if (avgLoadTime <= 5000) return 60;
    if (avgLoadTime <= 10000) return 40;
    return 20;
  }

  // Utility methods
  private calculateAverage(values: number[]): number {
    if (values.length === 0) return 0;
    return values.reduce((sum, val) => sum + val, 0) / values.length;
  }

  private getResourceType(url: string): string {
    if (url.includes('.js')) return 'javascript';
    if (url.includes('.css')) return 'stylesheet';
    if (url.includes('.png') || url.includes('.jpg') || url.includes('.svg')) return 'image';
    if (url.includes('.woff') || url.includes('.ttf')) return 'font';
    return 'other';
  }

  private getCacheStatus(entry: PerformanceResourceTiming): string {
    if (entry.transferSize === 0) return 'cache_hit';
    if (entry.transferSize < entry.encodedBodySize) return 'cache_partial';
    return 'cache_miss';
  }

  private reportSlowResources(resources: PerformanceResourceTiming[]): void {
    resources.forEach(resource => {
      this.metricsBuffer.push({
        metric_type: 'slow_resource',
        metric_category: 'performance',
        metric_value: resource.responseEnd - resource.startTime,
        metric_unit: 'milliseconds',
        additional_metadata: {
          resource_url: resource.name,
          resource_type: this.getResourceType(resource.name),
          transfer_size: resource.transferSize
        }
      });
    });
  }

  private groupBy(array: any[], key: string): { [key: string]: any[] } {
    return array.reduce((groups, item) => {
      const value = item[key];
      groups[value] = groups[value] || [];
      groups[value].push(item);
      return groups;
    }, {});
  }
}

export const enhancedPerformanceService = new EnhancedPerformanceService();
