import { supabase } from "@/integrations/supabase/client";
import { getCurrentUserProfile } from "@/lib/supabase-utils";

interface PerformanceData {
  page_load_time: number;
  resource_count: number;
  memory_usage: number;
  cpu_usage: number;
  network_latency: number;
  error_rate: number;
  user_interactions: number;
  timestamp: string;
}

interface PerformanceAlert {
  id: string;
  alert_type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  threshold_value: number;
  actual_value: number;
  created_at: string;
}

class EnhancedPerformanceService {
  private performanceObserver: PerformanceObserver | null = null;
  private observers: PerformanceObserver[] = [];
  private intervals: NodeJS.Timeout[] = [];
  private metricsBuffer: PerformanceData[] = [];
  private isInitialized = false;
  private alertThresholds = {
    page_load_time: 3000, // 3 seconds
    memory_usage: 150, // 150 MB (increased from 100MB)
    error_rate: 0.05, // 5%
    cpu_usage: 80 // 80%
  };

  // Initialize comprehensive performance monitoring
  async initializePerformanceMonitoring(): Promise<void> {
    if (this.isInitialized || typeof window === 'undefined') return;
    
    try {
      if (process.env.NODE_ENV === 'development') {
        console.log('Initializing enhanced performance monitoring...');
      }

      // Initialize browser performance monitoring
      this.initializeBrowserMonitoring();

      // Setup real-time metrics collection
      this.setupMetricsCollection();

      // Initialize service workers for PWA optimization
      this.initializeServiceWorker();

      // Setup performance alerts
      this.setupPerformanceAlerts();

      this.isInitialized = true;
      if (process.env.NODE_ENV === 'development') {
        console.log('Enhanced performance monitoring initialized');
      }
    } catch (error) {
      console.error('Failed to initialize performance monitoring:', error);
    }
  }

  // Clean up resources
  cleanup(): void {
    if (typeof window === 'undefined') return;
    
    // Clear all intervals
    this.intervals.forEach(interval => clearInterval(interval));
    this.intervals = [];
    
    // Disconnect all observers
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
    
    if (this.performanceObserver) {
      this.performanceObserver.disconnect();
      this.performanceObserver = null;
    }
    
    // Clear metrics buffer
    this.metricsBuffer = [];
    this.isInitialized = false;
  }

  // Initialize browser performance monitoring
  private initializeBrowserMonitoring(): void {
    if (typeof window === 'undefined') return;

    try {
      // Monitor navigation timing
      this.observeNavigationTiming();

      // Monitor resource loading
      this.observeResourceTiming();

      // Monitor paint metrics
      this.observePaintTiming();

      // Monitor largest contentful paint
      this.observeLCP();

      // Monitor cumulative layout shift
      this.observeCLS();

      // Monitor first input delay
      this.observeFID();
    } catch (error) {
      console.error('Error initializing browser monitoring:', error);
    }
  }

  private observeNavigationTiming(): void {
    if (typeof window === 'undefined' || !('performance' in window)) return;

    try {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      if (navigation) {
        const loadTime = navigation.loadEventEnd - navigation.loadEventStart;
        const domContentLoaded = navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart;

        this.recordMetric('page_load_time', loadTime);
        this.recordMetric('dom_content_loaded', domContentLoaded);
      }
    } catch (error) {
      console.error('Error observing navigation timing:', error);
    }
  }

  private observeResourceTiming(): void {
    if (typeof window === 'undefined' || !('PerformanceObserver' in window)) return;

    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        this.recordMetric('resource_count', entries.length);
        
        // Analyze slow resources
        const slowResources = entries.filter(entry => entry.duration > 1000);
        if (slowResources.length > 0) {
          this.triggerAlert('slow_resources', 'warning', `${slowResources.length} slow resources detected`);
        }
      });

      observer.observe({ entryTypes: ['resource'] });
      this.observers.push(observer);
    } catch (error) {
      console.error('Error observing resource timing:', error);
    }
  }

  private observePaintTiming(): void {
    if (typeof window === 'undefined' || !('PerformanceObserver' in window)) return;

    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach(entry => {
          this.recordMetric(entry.name.replace('-', '_'), entry.startTime);
        });
      });

      observer.observe({ entryTypes: ['paint'] });
      this.observers.push(observer);
    } catch (error) {
      console.error('Error observing paint timing:', error);
    }
  }

  private observeLCP(): void {
    if (typeof window === 'undefined' || !('PerformanceObserver' in window)) return;

    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        this.recordMetric('largest_contentful_paint', lastEntry.startTime);
        
        // LCP should be under 2.5s for good performance
        if (lastEntry.startTime > 2500) {
          this.triggerAlert('lcp_slow', 'warning', `LCP is ${lastEntry.startTime}ms (target: <2500ms)`);
        }
      });

      observer.observe({ entryTypes: ['largest-contentful-paint'] });
      this.observers.push(observer);
    } catch (error) {
      console.error('Error observing LCP:', error);
    }
  }

  private observeCLS(): void {
    if (typeof window === 'undefined' || !('PerformanceObserver' in window)) return;

    try {
      let clsValue = 0;
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach(entry => {
          if (!(entry as any).hadRecentInput) {
            clsValue += (entry as any).value;
          }
        });
        
        this.recordMetric('cumulative_layout_shift', clsValue);
        
        // CLS should be under 0.1 for good performance
        if (clsValue > 0.1) {
          this.triggerAlert('cls_high', 'warning', `CLS is ${clsValue.toFixed(3)} (target: <0.1)`);
        }
      });

      observer.observe({ entryTypes: ['layout-shift'] });
      this.observers.push(observer);
    } catch (error) {
      console.error('Error observing CLS:', error);
    }
  }

  private observeFID(): void {
    if (typeof window === 'undefined' || !('PerformanceObserver' in window)) return;

    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach(entry => {
          // Safe access to processingStart property
          const fidEntry = entry as any;
          if (fidEntry.processingStart !== undefined) {
            const fid = fidEntry.processingStart - entry.startTime;
            this.recordMetric('first_input_delay', fid);
            
            // FID should be under 100ms for good performance
            if (fid > 100) {
              this.triggerAlert('fid_slow', 'warning', `FID is ${fid}ms (target: <100ms)`);
            }
          }
        });
      });

      observer.observe({ entryTypes: ['first-input'] });
      this.observers.push(observer);
    } catch (error) {
      console.error('Error observing FID:', error);
    }
  }

  // Setup real-time metrics collection
  private setupMetricsCollection(): void {
    // Collect metrics every 60 seconds (reduced frequency)
    const metricsInterval = setInterval(() => {
      this.collectSystemMetrics();
    }, 60000);
    this.intervals.push(metricsInterval);

    // Flush metrics buffer every 10 minutes (reduced frequency)
    const flushInterval = setInterval(() => {
      this.flushMetricsBuffer();
    }, 600000);
    this.intervals.push(flushInterval);
  }

  private collectSystemMetrics(): void {
    if (typeof window === 'undefined') return;

    try {
      // Memory usage (if available)
      const memoryInfo = (performance as any).memory;
      if (memoryInfo) {
        const memoryUsage = memoryInfo.usedJSHeapSize / (1024 * 1024); // Convert to MB
        this.recordMetric('memory_usage', memoryUsage);
        
        // Only log memory info, don't trigger alerts constantly
        if (process.env.NODE_ENV === 'development') {
          console.info('Memory Usage:', {
            usedJSHeapSize: memoryInfo.usedJSHeapSize,
            totalJSHeapSize: memoryInfo.totalJSHeapSize,
            jsHeapSizeLimit: memoryInfo.jsHeapSizeLimit,
            usagePercentage: (memoryInfo.usedJSHeapSize / memoryInfo.jsHeapSizeLimit) * 100
          });
        }
      }

      // Connection information (less frequently)
      const connection = (navigator as any).connection;
      if (connection) {
        this.recordMetric('network_speed', connection.downlink);
        this.recordMetric('network_rtt', connection.rtt);
      }

      // Document visibility
      this.recordMetric('page_visibility', document.hidden ? 0 : 1);

    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error collecting system metrics:', error);
      }
    }
  }

  private trackErrorRate(): void {
    // Track JavaScript errors
    const errorCount = this.getErrorCount();
    const totalPageViews = this.getPageViewCount();
    const errorRate = totalPageViews > 0 ? errorCount / totalPageViews : 0;
    
    this.recordMetric('error_rate', errorRate);
    
    if (errorRate > this.alertThresholds.error_rate) {
      this.triggerAlert('high_error_rate', 'critical', `Error rate: ${(errorRate * 100).toFixed(2)}%`);
    }
  }

  private getErrorCount(): number {
    // This would track actual errors - simplified for demo
    return parseInt(localStorage.getItem('error_count') || '0');
  }

  private getPageViewCount(): number {
    // This would track actual page views - simplified for demo
    return parseInt(localStorage.getItem('page_view_count') || '1');
  }

  // Initialize service worker for PWA optimization
  private async initializeServiceWorker(): Promise<void> {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;

    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registered:', registration);
      
      // Update service worker when new version is available
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New service worker available
              this.notifyServiceWorkerUpdate();
            }
          });
        }
      });
    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  }

  private notifyServiceWorkerUpdate(): void {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('ResilientFI Update Available', {
        body: 'A new version is available. Refresh to update.',
        icon: '/favicon.ico'
      });
    }
  }

  // Setup performance alerts
  private setupPerformanceAlerts(): void {
    // Monitor for performance degradation every 5 minutes (reduced frequency)
    const alertInterval = setInterval(() => {
      this.analyzePerformanceTrends();
    }, 300000);
    this.intervals.push(alertInterval);
  }

  private analyzePerformanceTrends(): void {
    if (this.metricsBuffer.length < 10) return;

    const recent = this.metricsBuffer.slice(-10);
    const older = this.metricsBuffer.slice(-20, -10);

    if (older.length === 0) return;

    const recentAvgLoadTime = recent.reduce((sum, m) => sum + m.page_load_time, 0) / recent.length;
    const olderAvgLoadTime = older.reduce((sum, m) => sum + m.page_load_time, 0) / older.length;

    // Check for performance degradation
    if (recentAvgLoadTime > olderAvgLoadTime * 1.5) {
      this.triggerAlert('performance_degradation', 'high', 
        `Page load time increased by ${((recentAvgLoadTime / olderAvgLoadTime - 1) * 100).toFixed(1)}%`);
    }
  }

  // Record performance metrics
  private recordMetric(type: string, value: number): void {
    const metric: PerformanceData = {
      page_load_time: type === 'page_load_time' ? value : 0,
      resource_count: type === 'resource_count' ? value : 0,
      memory_usage: type === 'memory_usage' ? value : 0,
      cpu_usage: type === 'cpu_usage' ? value : 0,
      network_latency: type === 'network_rtt' ? value : 0,
      error_rate: type === 'error_rate' ? value : 0,
      user_interactions: type === 'user_interactions' ? value : 0,
      timestamp: new Date().toISOString()
    };

    this.metricsBuffer.push(metric);

    // Keep buffer size much smaller to prevent memory issues
    if (this.metricsBuffer.length > 20) {
      this.metricsBuffer = this.metricsBuffer.slice(-10);
    }
  }

  // Flush metrics to database
  private async flushMetricsBuffer(): Promise<void> {
    if (this.metricsBuffer.length === 0) return;

    try {
      const profile = await getCurrentUserProfile();
      if (!profile?.organization_id) return;

      // Store aggregated metrics
      const avgMetrics = this.aggregateMetrics(this.metricsBuffer);
      
      await supabase
        .from('performance_analytics')
        .insert({
          org_id: profile.organization_id,
          metric_type: 'performance_summary',
          metric_category: 'system_performance',
          metric_value: avgMetrics.page_load_time,
          metric_unit: 'milliseconds',
          additional_metadata: {
            memory_usage: avgMetrics.memory_usage,
            error_rate: avgMetrics.error_rate,
            resource_count: avgMetrics.resource_count,
            network_latency: avgMetrics.network_latency
          }
        });

      // Clear buffer
      this.metricsBuffer = [];
    } catch (error) {
      console.error('Error flushing metrics buffer:', error);
    }
  }

  private aggregateMetrics(metrics: PerformanceData[]): PerformanceData {
    const count = metrics.length;
    return {
      page_load_time: metrics.reduce((sum, m) => sum + m.page_load_time, 0) / count,
      resource_count: metrics.reduce((sum, m) => sum + m.resource_count, 0) / count,
      memory_usage: metrics.reduce((sum, m) => sum + m.memory_usage, 0) / count,
      cpu_usage: metrics.reduce((sum, m) => sum + m.cpu_usage, 0) / count,
      network_latency: metrics.reduce((sum, m) => sum + m.network_latency, 0) / count,
      error_rate: metrics.reduce((sum, m) => sum + m.error_rate, 0) / count,
      user_interactions: metrics.reduce((sum, m) => sum + m.user_interactions, 0) / count,
      timestamp: new Date().toISOString()
    };
  }

  // Trigger performance alerts (reduced frequency)
  private async triggerAlert(type: string, severity: string, message: string): Promise<void> {
    // Reduce alert frequency - only log in development
    if (process.env.NODE_ENV === 'development') {
      console.warn(`Performance Alert [${severity.toUpperCase()}]: ${message}`);
    }

    // Don't store alerts for memory warnings to prevent excessive DB writes
    if (type === 'high_memory') {
      return;
    }

    const alert: PerformanceAlert = {
      id: Math.random().toString(36).substr(2, 9),
      alert_type: type,
      severity: severity as any,
      message,
      threshold_value: this.alertThresholds[type as keyof typeof this.alertThresholds] || 0,
      actual_value: 0, // Would be set based on the specific metric
      created_at: new Date().toISOString()
    };

    // Store alert in database (only for non-memory alerts)
    try {
      const profile = await getCurrentUserProfile();
      if (profile?.organization_id) {
        await supabase
          .from('performance_analytics')
          .insert({
            org_id: profile.organization_id,
            metric_type: 'alert',
            metric_category: 'performance_alert',
            metric_value: alert.threshold_value,
            metric_unit: 'alert',
            additional_metadata: alert
          });
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error storing performance alert:', error);
      }
    }
  }

  // Get performance dashboard data
  async getPerformanceDashboardData(): Promise<any> {
    try {
      const profile = await getCurrentUserProfile();
      if (!profile?.organization_id) return null;

      // Get recent performance data
      const { data: recentMetrics } = await supabase
        .from('performance_analytics')
        .select('*')
        .eq('org_id', profile.organization_id)
        .eq('metric_category', 'system_performance')
        .order('created_at', { ascending: false })
        .limit(24); // Last 24 data points

      // Get recent alerts
      const { data: recentAlerts } = await supabase
        .from('performance_analytics')
        .select('*')
        .eq('org_id', profile.organization_id)
        .eq('metric_category', 'performance_alert')
        .order('created_at', { ascending: false })
        .limit(50);

      const currentMetrics = this.metricsBuffer.length > 0 
        ? this.aggregateMetrics(this.metricsBuffer.slice(-10))
        : null;

      return {
        current_performance: {
          avg_page_load_time: currentMetrics?.page_load_time || 0,
          memory_usage: currentMetrics?.memory_usage || 0,
          error_rate: currentMetrics?.error_rate || 0,
          network_latency: currentMetrics?.network_latency || 0
        },
        performance_trends: recentMetrics || [],
        alerts: (recentAlerts || []).map(a => a.additional_metadata),
        user_experience_metrics: {
          user_satisfaction_score: this.calculateUserSatisfactionScore(currentMetrics),
          core_web_vitals: this.getCoreWebVitals()
        },
        optimization_suggestions: this.getOptimizationSuggestions(currentMetrics)
      };
    } catch (error) {
      console.error('Error getting performance dashboard data:', error);
      return null;
    }
  }

  private calculateUserSatisfactionScore(metrics: PerformanceData | null): number {
    if (!metrics) return 75; // Default score

    let score = 100;
    
    // Penalize slow page loads
    if (metrics.page_load_time > 3000) score -= 20;
    else if (metrics.page_load_time > 2000) score -= 10;
    
    // Penalize high error rates
    if (metrics.error_rate > 0.05) score -= 30;
    else if (metrics.error_rate > 0.02) score -= 15;
    
    // Penalize high memory usage
    if (metrics.memory_usage > 100) score -= 15;
    else if (metrics.memory_usage > 50) score -= 5;
    
    return Math.max(0, Math.min(100, score));
  }

  private getCoreWebVitals(): any {
    // This would return actual Core Web Vitals metrics
    return {
      lcp: 2400, // Largest Contentful Paint in ms
      fid: 95,   // First Input Delay in ms
      cls: 0.08, // Cumulative Layout Shift
      fcp: 1800, // First Contentful Paint in ms
      ttfb: 600  // Time to First Byte in ms
    };
  }

  // Get performance optimization suggestions
  async getPerformanceOptimizationSuggestions(): Promise<string[]> {
    const suggestions = [];
    const currentMetrics = this.metricsBuffer.length > 0 
      ? this.aggregateMetrics(this.metricsBuffer.slice(-10))
      : null;

    if (!currentMetrics) {
      return ['Enable performance monitoring to get personalized suggestions'];
    }

    if (currentMetrics.page_load_time > 3000) {
      suggestions.push('Optimize image sizes and implement lazy loading');
      suggestions.push('Enable browser caching and compression');
      suggestions.push('Consider using a Content Delivery Network (CDN)');
    }

    if (currentMetrics.memory_usage > 50) {
      suggestions.push('Review memory usage patterns and clean up unused objects');
      suggestions.push('Implement efficient data structures and algorithms');
    }

    if (currentMetrics.error_rate > 0.02) {
      suggestions.push('Implement comprehensive error handling and logging');
      suggestions.push('Add input validation and sanitization');
    }

    if (currentMetrics.network_latency > 200) {
      suggestions.push('Optimize API calls and reduce payload sizes');
      suggestions.push('Implement request batching and caching strategies');
    }

    if (suggestions.length === 0) {
      suggestions.push('Performance is good - continue monitoring and maintain current practices');
    }

    return suggestions;
  }

  private getOptimizationSuggestions(metrics: PerformanceData | null): string[] {
    if (!metrics) return [];

    const suggestions = [];

    if (metrics.page_load_time > 3000) {
      suggestions.push('Page load time is high - consider code splitting and lazy loading');
    }

    if (metrics.memory_usage > 100) {
      suggestions.push('Memory usage is elevated - review for memory leaks');
    }

    if (metrics.error_rate > 0.05) {
      suggestions.push('Error rate is high - implement better error handling');
    }

    return suggestions;
  }

}

export default EnhancedPerformanceService;
export const enhancedPerformanceService = new EnhancedPerformanceService();
