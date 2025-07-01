
import { supabase } from "@/integrations/supabase/client";

export interface PerformanceMetrics {
  timestamp: Date;
  serviceName: string;
  region: string;
  metrics: {
    responseTime: number;
    throughput: number;
    errorRate: number;
    cpuUsage: number;
    memoryUsage: number;
    diskUsage: number;
    networkLatency: number;
    databaseConnections: number;
    queueDepth: number;
    cacheHitRate: number;
  };
  userExperience: {
    pageLoadTime: number;
    timeToInteractive: number;
    cumulativeLayoutShift: number;
    firstContentfulPaint: number;
    largestContentfulPaint: number;
  };
}

export interface AlertRule {
  ruleId: string;
  metricName: string;
  operator: 'gt' | 'lt' | 'eq' | 'ne';
  threshold: number;
  duration: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  notificationChannels: string[];
}

class PerformanceMonitor {
  private metricsBuffer: PerformanceMetrics[] = [];
  private alertRules: AlertRule[] = [];
  private activeAlerts = new Map<string, Date>();

  // Real-time Metrics Collection
  async collectMetrics(serviceName: string, region: string): Promise<PerformanceMetrics> {
    const metrics: PerformanceMetrics = {
      timestamp: new Date(),
      serviceName,
      region,
      metrics: await this.gatherSystemMetrics(),
      userExperience: await this.gatherUXMetrics()
    };

    this.metricsBuffer.push(metrics);
    await this.evaluateAlerts(metrics);
    
    // Batch store metrics
    if (this.metricsBuffer.length >= 100) {
      await this.storeMetrics();
    }

    return metrics;
  }

  private async gatherSystemMetrics() {
    // In a real implementation, this would collect actual system metrics
    return {
      responseTime: await this.measureResponseTime(),
      throughput: await this.measureThroughput(),
      errorRate: await this.calculateErrorRate(),
      cpuUsage: await this.getCpuUsage(),
      memoryUsage: await this.getMemoryUsage(),
      diskUsage: await this.getDiskUsage(),
      networkLatency: await this.measureNetworkLatency(),
      databaseConnections: await this.getDatabaseConnections(),
      queueDepth: await this.getQueueDepth(),
      cacheHitRate: await this.getCacheHitRate()
    };
  }

  private async gatherUXMetrics() {
    // Gather user experience metrics using Navigation Timing API
    return {
      pageLoadTime: performance.timing.loadEventEnd - performance.timing.navigationStart,
      timeToInteractive: await this.measureTimeToInteractive(),
      cumulativeLayoutShift: await this.measureCLS(),
      firstContentfulPaint: await this.measureFCP(),
      largestContentfulPaint: await this.measureLCP()
    };
  }

  // Synthetic Transaction Monitoring
  async runSyntheticTransactions(): Promise<void> {
    const transactions = [
      { name: 'login', steps: ['navigate_to_login', 'enter_credentials', 'submit_form', 'verify_dashboard'] },
      { name: 'document_upload', steps: ['select_file', 'upload_file', 'verify_upload', 'process_document'] },
      { name: 'report_generation', steps: ['open_reports', 'select_template', 'generate_report', 'download_pdf'] }
    ];

    for (const transaction of transactions) {
      await this.executeSyntheticTransaction(transaction);
    }
  }

  private async executeSyntheticTransaction(transaction: any): Promise<void> {
    const startTime = Date.now();
    const results = [];

    try {
      for (const step of transaction.steps) {
        const stepStartTime = Date.now();
        await this.executeTransactionStep(step);
        const stepDuration = Date.now() - stepStartTime;
        
        results.push({
          step,
          duration: stepDuration,
          success: true
        });
      }

      const totalDuration = Date.now() - startTime;
      
      await this.storeSyntheticTransactionResult({
        transactionName: transaction.name,
        totalDuration,
        steps: results,
        success: true,
        timestamp: new Date()
      });

    } catch (error) {
      await this.storeSyntheticTransactionResult({
        transactionName: transaction.name,
        totalDuration: Date.now() - startTime,
        steps: results,
        success: false,
        error: error.message,
        timestamp: new Date()
      });
    }
  }

  private async executeTransactionStep(step: string): Promise<void> {
    // Simulate transaction step execution
    switch (step) {
      case 'navigate_to_login':
        await this.simulateNavigation('/login');
        break;
      case 'enter_credentials':
        await this.simulateFormInput();
        break;
      case 'submit_form':
        await this.simulateFormSubmission();
        break;
      default:
        await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 200));
    }
  }

  // Performance Analytics and Trends
  async generatePerformanceReport(timeRange: { start: Date; end: Date }, services?: string[]): Promise<any> {
    const { data: metricsData } = await supabase
      .from('performance_metrics')
      .select('*')
      .gte('timestamp', timeRange.start.toISOString())
      .lte('timestamp', timeRange.end.toISOString())
      .in('service_name', services || []);

    if (!metricsData) return null;

    return {
      summary: this.calculateSummaryStatistics(metricsData),
      trends: this.analyzeTrends(metricsData),
      anomalies: this.detectAnomalies(metricsData),
      recommendations: this.generateRecommendations(metricsData),
      capacityPlanning: this.performCapacityPlanning(metricsData)
    };
  }

  private calculateSummaryStatistics(data: any[]) {
    return {
      averageResponseTime: data.reduce((sum, d) => sum + d.response_time, 0) / data.length,
      p95ResponseTime: this.calculatePercentile(data.map(d => d.response_time), 95),
      p99ResponseTime: this.calculatePercentile(data.map(d => d.response_time), 99),
      totalRequests: data.reduce((sum, d) => sum + d.throughput, 0),
      averageErrorRate: data.reduce((sum, d) => sum + d.error_rate, 0) / data.length,
      averageCpuUsage: data.reduce((sum, d) => sum + d.cpu_usage, 0) / data.length,
      averageMemoryUsage: data.reduce((sum, d) => sum + d.memory_usage, 0) / data.length
    };
  }

  private analyzeTrends(data: any[]) {
    // Implement trend analysis using time series analysis
    return {
      responseTimeTrend: this.calculateTrend(data.map(d => d.response_time)),
      throughputTrend: this.calculateTrend(data.map(d => d.throughput)),
      errorRateTrend: this.calculateTrend(data.map(d => d.error_rate)),
      resourceUsageTrend: this.calculateTrend(data.map(d => d.cpu_usage + d.memory_usage))
    };
  }

  private detectAnomalies(data: any[]) {
    // Implement anomaly detection using statistical methods
    return data.filter(d => this.isAnomaly(d));
  }

  private generateRecommendations(data: any[]) {
    const recommendations = [];
    const avgResponseTime = data.reduce((sum, d) => sum + d.response_time, 0) / data.length;
    const avgErrorRate = data.reduce((sum, d) => sum + d.error_rate, 0) / data.length;
    const avgCpuUsage = data.reduce((sum, d) => sum + d.cpu_usage, 0) / data.length;

    if (avgResponseTime > 1000) {
      recommendations.push({
        type: 'performance',
        priority: 'high',
        description: 'Response times are above optimal threshold',
        suggestion: 'Consider scaling up instances or optimizing database queries'
      });
    }

    if (avgErrorRate > 0.01) {
      recommendations.push({
        type: 'reliability',
        priority: 'critical',
        description: 'Error rate is above acceptable threshold',
        suggestion: 'Investigate error logs and implement circuit breakers'
      });
    }

    if (avgCpuUsage > 80) {
      recommendations.push({
        type: 'capacity',
        priority: 'medium',
        description: 'CPU usage is consistently high',
        suggestion: 'Consider horizontal scaling or CPU optimization'
      });
    }

    return recommendations;
  }

  private performCapacityPlanning(data: any[]) {
    const growthRate = this.calculateGrowthRate(data);
    const currentCapacity = this.getCurrentCapacity();
    
    return {
      currentUtilization: this.calculateCurrentUtilization(data),
      projectedUtilization: this.projectUtilization(data, growthRate),
      recommendedCapacity: this.calculateRecommendedCapacity(currentCapacity, growthRate),
      timeToCapacityExhaustion: this.calculateTimeToExhaustion(data, growthRate)
    };
  }

  // Alert Management
  async evaluateAlerts(metrics: PerformanceMetrics): Promise<void> {
    for (const rule of this.alertRules) {
      const metricValue = this.extractMetricValue(metrics, rule.metricName);
      const isTriggered = this.evaluateAlertCondition(metricValue, rule);
      
      if (isTriggered && !this.activeAlerts.has(rule.ruleId)) {
        await this.triggerAlert(rule, metricValue, metrics);
        this.activeAlerts.set(rule.ruleId, new Date());
      } else if (!isTriggered && this.activeAlerts.has(rule.ruleId)) {
        await this.resolveAlert(rule);
        this.activeAlerts.delete(rule.ruleId);
      }
    }
  }

  private async triggerAlert(rule: AlertRule, value: number, metrics: PerformanceMetrics): Promise<void> {
    const alert = {
      ruleId: rule.ruleId,
      severity: rule.severity,
      message: `${rule.metricName} is ${value}, exceeding threshold of ${rule.threshold}`,
      timestamp: new Date(),
      serviceName: metrics.serviceName,
      region: metrics.region,
      metricValue: value
    };

    // Store alert
    await supabase.from('performance_alerts').insert(alert);

    // Send notifications
    for (const channel of rule.notificationChannels) {
      await this.sendNotification(channel, alert);
    }
  }

  // Helper Methods
  private async measureResponseTime(): Promise<number> {
    const start = performance.now();
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, Math.random() * 100));
    return performance.now() - start;
  }

  private async measureThroughput(): Promise<number> {
    // Return requests per second
    return Math.floor(Math.random() * 1000) + 100;
  }

  private async calculateErrorRate(): Promise<number> {
    // Return error rate as percentage
    return Math.random() * 0.05; // 0-5% error rate
  }

  private async getCpuUsage(): Promise<number> {
    return Math.random() * 100;
  }

  private async getMemoryUsage(): Promise<number> {
    return Math.random() * 100;
  }

  private async getDiskUsage(): Promise<number> {
    return Math.random() * 100;
  }

  private async measureNetworkLatency(): Promise<number> {
    return Math.random() * 50 + 10;
  }

  private async getDatabaseConnections(): Promise<number> {
    return Math.floor(Math.random() * 50) + 10;
  }

  private async getQueueDepth(): Promise<number> {
    return Math.floor(Math.random() * 100);
  }

  private async getCacheHitRate(): Promise<number> {
    return Math.random() * 0.4 + 0.6; // 60-100% hit rate
  }

  private calculatePercentile(values: number[], percentile: number): number {
    const sorted = values.sort((a, b) => a - b);
    const index = Math.ceil((percentile / 100) * sorted.length) - 1;
    return sorted[index];
  }

  private calculateTrend(values: number[]): 'increasing' | 'decreasing' | 'stable' {
    if (values.length < 2) return 'stable';
    const first = values.slice(0, Math.floor(values.length / 2));
    const second = values.slice(Math.floor(values.length / 2));
    const firstAvg = first.reduce((a, b) => a + b, 0) / first.length;
    const secondAvg = second.reduce((a, b) => a + b, 0) / second.length;
    
    if (secondAvg > firstAvg * 1.1) return 'increasing';
    if (secondAvg < firstAvg * 0.9) return 'decreasing';
    return 'stable';
  }

  private isAnomaly(dataPoint: any): boolean {
    // Simple anomaly detection - in production, use more sophisticated algorithms
    return dataPoint.response_time > 2000 || dataPoint.error_rate > 0.1;
  }

  private extractMetricValue(metrics: PerformanceMetrics, metricName: string): number {
    const metricPath = metricName.split('.');
    let value: any = metrics;
    
    for (const path of metricPath) {
      value = value[path];
    }
    
    return typeof value === 'number' ? value : 0;
  }

  private evaluateAlertCondition(value: number, rule: AlertRule): boolean {
    switch (rule.operator) {
      case 'gt': return value > rule.threshold;
      case 'lt': return value < rule.threshold;
      case 'eq': return value === rule.threshold;
      case 'ne': return value !== rule.threshold;
      default: return false;
    }
  }

  private async storeMetrics(): Promise<void> {
    const metricsToStore = this.metricsBuffer.splice(0);
    
    const dbMetrics = metricsToStore.map(m => ({
      timestamp: m.timestamp.toISOString(),
      service_name: m.serviceName,
      region: m.region,
      response_time: m.metrics.responseTime,
      throughput: m.metrics.throughput,
      error_rate: m.metrics.errorRate,
      cpu_usage: m.metrics.cpuUsage,
      memory_usage: m.metrics.memoryUsage,
      disk_usage: m.metrics.diskUsage,
      network_latency: m.metrics.networkLatency,
      database_connections: m.metrics.databaseConnections,
      queue_depth: m.metrics.queueDepth,
      cache_hit_rate: m.metrics.cacheHitRate,
      page_load_time: m.userExperience.pageLoadTime,
      time_to_interactive: m.userExperience.timeToInteractive,
      cumulative_layout_shift: m.userExperience.cumulativeLayoutShift,
      first_contentful_paint: m.userExperience.firstContentfulPaint,
      largest_contentful_paint: m.userExperience.largestContentfulPaint
    }));

    await supabase.from('performance_metrics').insert(dbMetrics);
  }

  private async storeSyntheticTransactionResult(result: any): Promise<void> {
    await supabase.from('synthetic_transactions').insert({
      transaction_name: result.transactionName,
      total_duration: result.totalDuration,
      steps: result.steps,
      success: result.success,
      error_message: result.error,
      timestamp: result.timestamp.toISOString()
    });
  }

  private async measureTimeToInteractive(): Promise<number> {
    // Implementation would use actual TTI measurement
    return Math.random() * 2000 + 1000;
  }

  private async measureCLS(): Promise<number> {
    // Implementation would use actual CLS measurement
    return Math.random() * 0.1;
  }

  private async measureFCP(): Promise<number> {
    // Implementation would use actual FCP measurement
    return Math.random() * 1000 + 500;
  }

  private async measureLCP(): Promise<number> {
    // Implementation would use actual LCP measurement
    return Math.random() * 2000 + 1000;
  }

  private async simulateNavigation(path: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 200 + Math.random() * 300));
  }

  private async simulateFormInput(): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 200));
  }

  private async simulateFormSubmission(): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 500));
  }

  private calculateGrowthRate(data: any[]): number {
    // Simple growth rate calculation
    return 0.05; // 5% monthly growth
  }

  private getCurrentCapacity(): number {
    return 1000; // Current capacity units
  }

  private calculateCurrentUtilization(data: any[]): number {
    const avgCpu = data.reduce((sum, d) => sum + d.cpu_usage, 0) / data.length;
    const avgMemory = data.reduce((sum, d) => sum + d.memory_usage, 0) / data.length;
    return Math.max(avgCpu, avgMemory);
  }

  private projectUtilization(data: any[], growthRate: number): number {
    return this.calculateCurrentUtilization(data) * (1 + growthRate);
  }

  private calculateRecommendedCapacity(currentCapacity: number, growthRate: number): number {
    return Math.ceil(currentCapacity * (1 + growthRate) * 1.2); // 20% buffer
  }

  private calculateTimeToExhaustion(data: any[], growthRate: number): number {
    const currentUtilization = this.calculateCurrentUtilization(data);
    const monthsToExhaustion = Math.log(100 / currentUtilization) / Math.log(1 + growthRate);
    return Math.max(0, monthsToExhaustion);
  }

  private async resolveAlert(rule: AlertRule): Promise<void> {
    await supabase
      .from('performance_alerts')
      .update({ resolved_at: new Date().toISOString() })
      .eq('rule_id', rule.ruleId)
      .is('resolved_at', null);
  }

  private async sendNotification(channel: string, alert: any): Promise<void> {
    // Implementation would send actual notifications
    console.log(`Sending alert to ${channel}:`, alert);
  }
}

export const performanceMonitor = new PerformanceMonitor();
