import { supabase } from '@/integrations/supabase/client';

// Performance Monitoring Interfaces
export interface PerformanceMonitoring {
  id: string;
  monitoringName: string;
  metrics: PerformanceMetric[];
  collectors: DataCollector[];
  analyzers: PerformanceAnalyzer[];
  optimizers: PerformanceOptimizer[];
  alerts: PerformanceAlert[];
  reports: PerformanceReport[];
  configuration: MonitoringConfiguration;
}

export interface PerformanceMetric {
  metricId: string;
  metricName: string;
  metricType: 'response_time' | 'throughput' | 'error_rate' | 'resource_usage' | 'user_experience';
  description: string;
  unit: string;
  currentValue: number;
  targetValue: number;
  thresholds: {
    warning: number;
    critical: number;
  };
  trend: 'improving' | 'stable' | 'degrading';
  historicalData: MetricDataPoint[];
  lastUpdated: Date;
}

export interface MetricDataPoint {
  timestamp: Date;
  value: number;
  metadata?: Record<string, any>;
}

export interface DataCollector {
  collectorId: string;
  name: string;
  type: 'application' | 'infrastructure' | 'user_experience' | 'database' | 'api';
  config: CollectorConfiguration;
  status: 'active' | 'inactive' | 'error';
  lastCollection: Date;
  metricsCollected: string[];
}

export interface CollectorConfiguration {
  interval: number; // milliseconds
  endpoints: string[];
  filters: MetricFilter[];
  aggregation: AggregationConfig;
}

export interface MetricFilter {
  field: string;
  operator: 'equals' | 'contains' | 'greater_than' | 'less_than';
  value: any;
}

export interface AggregationConfig {
  method: 'average' | 'sum' | 'max' | 'min' | 'percentile';
  window: number; // seconds
  percentile?: number;
}

export interface PerformanceAnalyzer {
  analyzerId: string;
  analyzerName: string;
  analysisType: 'bottleneck' | 'trend' | 'anomaly' | 'capacity' | 'optimization';
  inputMetrics: string[];
  analysisRules: AnalysisRule[];
  findings: AnalysisFindings[];
  recommendations: OptimizationRecommendation[];
  lastAnalysis: Date;
  nextAnalysis: Date;
}

export interface AnalysisRule {
  ruleId: string;
  condition: string;
  action: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface AnalysisFindings {
  findingId: string;
  type: 'performance_issue' | 'optimization_opportunity' | 'capacity_concern' | 'anomaly';
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  affectedComponents: string[];
  impact: ImpactAssessment;
  detectedAt: Date;
}

export interface ImpactAssessment {
  userExperience: 'low' | 'medium' | 'high';
  systemPerformance: 'low' | 'medium' | 'high';
  businessImpact: 'low' | 'medium' | 'high';
  estimatedCost: number;
}

export interface OptimizationRecommendation {
  recommendationId: string;
  category: 'database' | 'api' | 'frontend' | 'infrastructure' | 'caching';
  priority: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  expectedImpact: string;
  implementationEffort: 'low' | 'medium' | 'high';
  implementationSteps: string[];
  estimatedBenefit: PerformanceBenefit;
  riskAssessment: string;
  status: 'pending' | 'in_progress' | 'completed' | 'rejected';
}

export interface PerformanceBenefit {
  responseTimeImprovement: number; // percentage
  throughputIncrease: number; // percentage
  errorRateReduction: number; // percentage
  costSavings: number; // dollar amount
}

export interface PerformanceOptimizer {
  optimizerId: string;
  name: string;
  type: 'automatic' | 'manual' | 'hybrid';
  optimizationRules: OptimizationRule[];
  autoExecute: boolean;
  executionHistory: OptimizationExecution[];
}

export interface OptimizationRule {
  ruleId: string;
  trigger: string;
  action: string;
  parameters: Record<string, any>;
  maxExecutions: number;
  cooldownPeriod: number; // minutes
}

export interface OptimizationExecution {
  executionId: string;
  ruleId: string;
  executedAt: Date;
  status: 'success' | 'failed' | 'partial';
  result: OptimizationResult;
}

export interface OptimizationResult {
  metricsImproved: string[];
  improvementPercentage: Record<string, number>;
  sideEffects: string[];
  rollbackAvailable: boolean;
}

export interface PerformanceAlert {
  alertId: string;
  metricId: string;
  alertType: 'threshold' | 'anomaly' | 'trend' | 'prediction';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  triggeredAt: Date;
  acknowledgedAt?: Date;
  resolvedAt?: Date;
  escalationLevel: number;
}

export interface PerformanceReport {
  reportId: string;
  reportType: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'custom';
  period: {
    start: Date;
    end: Date;
  };
  metrics: ReportMetric[];
  insights: ReportInsight[];
  recommendations: OptimizationRecommendation[];
  generatedAt: Date;
}

export interface ReportMetric {
  metricName: string;
  currentValue: number;
  previousValue: number;
  changePercentage: number;
  trend: 'improving' | 'stable' | 'degrading';
}

export interface ReportInsight {
  category: string;
  title: string;
  description: string;
  impact: 'positive' | 'negative' | 'neutral';
  confidence: number; // 0-100
}

export interface MonitoringConfiguration {
  enabled: boolean;
  dataRetention: number; // days
  alertingEnabled: boolean;
  autoOptimization: boolean;
  reportGeneration: ReportConfig;
}

export interface ReportConfig {
  frequency: 'daily' | 'weekly' | 'monthly';
  recipients: string[];
  includeRecommendations: boolean;
}

// Capacity Planning Interfaces
export interface CapacityPlanningAnalysis {
  analysisId: string;
  resourceType: 'cpu' | 'memory' | 'storage' | 'network' | 'database';
  currentUtilization: number;
  projectedUtilization: number;
  timeHorizon: number; // days
  recommendations: CapacityRecommendation[];
  costProjections: CostProjection[];
}

export interface CapacityRecommendation {
  recommendationType: 'scale_up' | 'scale_down' | 'scale_out' | 'optimize';
  description: string;
  estimatedCost: number;
  estimatedSavings: number;
  implementation: string[];
  priority: 'low' | 'medium' | 'high';
}

export interface CostProjection {
  scenario: 'current' | 'optimized' | 'scaled';
  monthlyCost: number;
  yearlyProjection: number;
  assumptions: string[];
}

// User Experience Monitoring
export interface UserExperienceMetrics {
  pageLoadTime: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  cumulativeLayoutShift: number;
  firstInputDelay: number;
  timeToInteractive: number;
  userSatisfactionScore: number;
}

export interface WebVitalsData {
  url: string;
  deviceType: 'mobile' | 'desktop' | 'tablet';
  connectionType: string;
  metrics: UserExperienceMetrics;
  timestamp: Date;
  userId?: string;
  sessionId: string;
}

// Performance Monitoring Service
export class PerformanceMonitoringService {
  private org_id: string;
  private metricsBuffer: Map<string, MetricDataPoint[]> = new Map();
  private collectors: Map<string, DataCollector> = new Map();
  private alerts: PerformanceAlert[] = [];

  constructor(org_id: string) {
    this.org_id = org_id;
    this.initializeCollectors();
  }

  // Metric Collection
  async collectMetrics(): Promise<PerformanceMetric[]> {
    const metrics: PerformanceMetric[] = [];

    // Collect Application Performance Metrics
    const appMetrics = await this.collectApplicationMetrics();
    metrics.push(...appMetrics);

    // Collect Infrastructure Metrics
    const infraMetrics = await this.collectInfrastructureMetrics();
    metrics.push(...infraMetrics);

    // Collect User Experience Metrics
    const uxMetrics = await this.collectUserExperienceMetrics();
    metrics.push(...uxMetrics);

    // Store metrics
    await this.storeMetrics(metrics);

    return metrics;
  }

  private async collectApplicationMetrics(): Promise<PerformanceMetric[]> {
    const metrics: PerformanceMetric[] = [];

    // API Response Time
    const apiResponseTime = await this.measureAPIResponseTime();
    metrics.push({
      metricId: 'api_response_time',
      metricName: 'API Response Time',
      metricType: 'response_time',
      description: 'Average response time for API endpoints',
      unit: 'ms',
      currentValue: apiResponseTime,
      targetValue: 200,
      thresholds: { warning: 500, critical: 1000 },
      trend: this.calculateTrend('api_response_time', apiResponseTime),
      historicalData: this.getHistoricalData('api_response_time'),
      lastUpdated: new Date()
    });

    // Throughput
    const throughput = await this.measureThroughput();
    metrics.push({
      metricId: 'throughput',
      metricName: 'Request Throughput',
      metricType: 'throughput',
      description: 'Requests processed per second',
      unit: 'rps',
      currentValue: throughput,
      targetValue: 100,
      thresholds: { warning: 50, critical: 25 },
      trend: this.calculateTrend('throughput', throughput),
      historicalData: this.getHistoricalData('throughput'),
      lastUpdated: new Date()
    });

    // Error Rate
    const errorRate = await this.measureErrorRate();
    metrics.push({
      metricId: 'error_rate',
      metricName: 'Error Rate',
      metricType: 'error_rate',
      description: 'Percentage of failed requests',
      unit: '%',
      currentValue: errorRate,
      targetValue: 1,
      thresholds: { warning: 2, critical: 5 },
      trend: this.calculateTrend('error_rate', errorRate),
      historicalData: this.getHistoricalData('error_rate'),
      lastUpdated: new Date()
    });

    return metrics;
  }

  private async collectInfrastructureMetrics(): Promise<PerformanceMetric[]> {
    const metrics: PerformanceMetric[] = [];

    // CPU Usage
    const cpuUsage = await this.measureCPUUsage();
    metrics.push({
      metricId: 'cpu_usage',
      metricName: 'CPU Usage',
      metricType: 'resource_usage',
      description: 'Current CPU utilization percentage',
      unit: '%',
      currentValue: cpuUsage,
      targetValue: 70,
      thresholds: { warning: 80, critical: 90 },
      trend: this.calculateTrend('cpu_usage', cpuUsage),
      historicalData: this.getHistoricalData('cpu_usage'),
      lastUpdated: new Date()
    });

    // Memory Usage
    const memoryUsage = await this.measureMemoryUsage();
    metrics.push({
      metricId: 'memory_usage',
      metricName: 'Memory Usage',
      metricType: 'resource_usage',
      description: 'Current memory utilization percentage',
      unit: '%',
      currentValue: memoryUsage,
      targetValue: 70,
      thresholds: { warning: 80, critical: 90 },
      trend: this.calculateTrend('memory_usage', memoryUsage),
      historicalData: this.getHistoricalData('memory_usage'),
      lastUpdated: new Date()
    });

    return metrics;
  }

  private async collectUserExperienceMetrics(): Promise<PerformanceMetric[]> {
    const metrics: PerformanceMetric[] = [];

    // Page Load Time
    const pageLoadTime = await this.measurePageLoadTime();
    metrics.push({
      metricId: 'page_load_time',
      metricName: 'Page Load Time',
      metricType: 'user_experience',
      description: 'Average page load time',
      unit: 'ms',
      currentValue: pageLoadTime,
      targetValue: 2000,
      thresholds: { warning: 3000, critical: 5000 },
      trend: this.calculateTrend('page_load_time', pageLoadTime),
      historicalData: this.getHistoricalData('page_load_time'),
      lastUpdated: new Date()
    });

    return metrics;
  }

  // Performance Analysis
  async analyzePerformance(timeRange: { start: Date; end: Date }): Promise<AnalysisFindings[]> {
    const findings: AnalysisFindings[] = [];

    // Bottleneck Analysis
    const bottlenecks = await this.detectBottlenecks(timeRange);
    findings.push(...bottlenecks);

    // Trend Analysis
    const trends = await this.analyzeTrends(timeRange);
    findings.push(...trends);

    // Anomaly Detection
    const anomalies = await this.detectAnomalies(timeRange);
    findings.push(...anomalies);

    return findings;
  }

  private async detectBottlenecks(timeRange: { start: Date; end: Date }): Promise<AnalysisFindings[]> {
    const findings: AnalysisFindings[] = [];

    // Analyze API endpoints for bottlenecks
    const slowEndpoints = await this.identifySlowEndpoints(timeRange);
    if (slowEndpoints.length > 0) {
      findings.push({
        findingId: crypto.randomUUID(),
        type: 'performance_issue',
        description: `Detected ${slowEndpoints.length} slow API endpoints affecting response times`,
        severity: 'high',
        affectedComponents: slowEndpoints,
        impact: {
          userExperience: 'high',
          systemPerformance: 'medium',
          businessImpact: 'medium',
          estimatedCost: 500
        },
        detectedAt: new Date()
      });
    }

    // Database query analysis
    const slowQueries = await this.identifySlowQueries(timeRange);
    if (slowQueries.length > 0) {
      findings.push({
        findingId: crypto.randomUUID(),
        type: 'performance_issue',
        description: `Found ${slowQueries.length} slow database queries`,
        severity: 'medium',
        affectedComponents: slowQueries,
        impact: {
          userExperience: 'medium',
          systemPerformance: 'high',
          businessImpact: 'low',
          estimatedCost: 200
        },
        detectedAt: new Date()
      });
    }

    return findings;
  }

  private async analyzeTrends(timeRange: { start: Date; end: Date }): Promise<AnalysisFindings[]> {
    const findings: AnalysisFindings[] = [];

    // Analyze performance trends
    const degradingMetrics = await this.identifyDegradingMetrics(timeRange);
    if (degradingMetrics.length > 0) {
      findings.push({
        findingId: crypto.randomUUID(),
        type: 'performance_issue',
        description: `Performance degradation detected in ${degradingMetrics.length} metrics`,
        severity: 'medium',
        affectedComponents: degradingMetrics,
        impact: {
          userExperience: 'medium',
          systemPerformance: 'medium',
          businessImpact: 'medium',
          estimatedCost: 300
        },
        detectedAt: new Date()
      });
    }

    return findings;
  }

  private async detectAnomalies(timeRange: { start: Date; end: Date }): Promise<AnalysisFindings[]> {
    const findings: AnalysisFindings[] = [];

    // Statistical anomaly detection
    const anomalousMetrics = await this.detectStatisticalAnomalies(timeRange);
    if (anomalousMetrics.length > 0) {
      findings.push({
        findingId: crypto.randomUUID(),
        type: 'anomaly',
        description: `Detected anomalous behavior in ${anomalousMetrics.length} metrics`,
        severity: 'medium',
        affectedComponents: anomalousMetrics,
        impact: {
          userExperience: 'low',
          systemPerformance: 'medium',
          businessImpact: 'low',
          estimatedCost: 100
        },
        detectedAt: new Date()
      });
    }

    return findings;
  }

  // Optimization Recommendations
  async generateOptimizationRecommendations(findings: AnalysisFindings[]): Promise<OptimizationRecommendation[]> {
    const recommendations: OptimizationRecommendation[] = [];

    for (const finding of findings) {
      switch (finding.type) {
        case 'performance_issue':
          if (finding.affectedComponents.includes('api')) {
            recommendations.push({
              recommendationId: crypto.randomUUID(),
              category: 'api',
              priority: 'high',
              title: 'Optimize API Response Times',
              description: 'Implement caching and query optimization for slow API endpoints',
              expectedImpact: 'Reduce response times by 40-60%',
              implementationEffort: 'medium',
              implementationSteps: [
                'Add Redis caching layer',
                'Optimize database queries',
                'Implement response compression',
                'Add pagination to large datasets'
              ],
              estimatedBenefit: {
                responseTimeImprovement: 50,
                throughputIncrease: 30,
                errorRateReduction: 10,
                costSavings: 1000
              },
              riskAssessment: 'Low risk - standard optimization techniques',
              status: 'pending'
            });
          }
          
          if (finding.affectedComponents.includes('database')) {
            recommendations.push({
              recommendationId: crypto.randomUUID(),
              category: 'database',
              priority: 'high',
              title: 'Database Query Optimization',
              description: 'Add indexes and optimize slow queries',
              expectedImpact: 'Reduce query times by 60-80%',
              implementationEffort: 'low',
              implementationSteps: [
                'Analyze query execution plans',
                'Add missing indexes',
                'Rewrite inefficient queries',
                'Implement query result caching'
              ],
              estimatedBenefit: {
                responseTimeImprovement: 70,
                throughputIncrease: 40,
                errorRateReduction: 5,
                costSavings: 800
              },
              riskAssessment: 'Low risk - database optimization',
              status: 'pending'
            });
          }
          break;

        case 'capacity_concern':
          recommendations.push({
            recommendationId: crypto.randomUUID(),
            category: 'infrastructure',
            priority: 'medium',
            title: 'Scale Infrastructure Resources',
            description: 'Increase server capacity to handle growing load',
            expectedImpact: 'Improve system stability and response times',
            implementationEffort: 'low',
            implementationSteps: [
              'Analyze current resource utilization',
              'Scale up CPU and memory resources',
              'Implement auto-scaling policies',
              'Monitor performance improvements'
            ],
            estimatedBenefit: {
              responseTimeImprovement: 30,
              throughputIncrease: 50,
              errorRateReduction: 20,
              costSavings: 0
            },
            riskAssessment: 'Low risk - infrastructure scaling',
            status: 'pending'
          });
          break;
      }
    }

    return recommendations;
  }

  // Capacity Planning
  async analyzeCapacityRequirements(): Promise<CapacityPlanningAnalysis[]> {
    const analyses: CapacityPlanningAnalysis[] = [];

    // CPU Capacity Analysis
    const cpuAnalysis = await this.analyzeCPUCapacity();
    analyses.push(cpuAnalysis);

    // Memory Capacity Analysis
    const memoryAnalysis = await this.analyzeMemoryCapacity();
    analyses.push(memoryAnalysis);

    // Storage Capacity Analysis
    const storageAnalysis = await this.analyzeStorageCapacity();
    analyses.push(storageAnalysis);

    return analyses;
  }

  private async analyzeCPUCapacity(): Promise<CapacityPlanningAnalysis> {
    const currentUtilization = await this.getCurrentCPUUtilization();
    const projectedUtilization = await this.projectCPUGrowth();

    return {
      analysisId: crypto.randomUUID(),
      resourceType: 'cpu',
      currentUtilization,
      projectedUtilization,
      timeHorizon: 90,
      recommendations: [
        {
          recommendationType: projectedUtilization > 80 ? 'scale_up' : 'optimize',
          description: projectedUtilization > 80 
            ? 'Scale up CPU resources to handle projected load'
            : 'Optimize CPU usage through code improvements',
          estimatedCost: projectedUtilization > 80 ? 500 : 0,
          estimatedSavings: projectedUtilization > 80 ? 0 : 200,
          implementation: [
            'Monitor CPU usage patterns',
            'Implement performance optimizations',
            'Consider horizontal scaling'
          ],
          priority: projectedUtilization > 80 ? 'high' : 'medium'
        }
      ],
      costProjections: [
        {
          scenario: 'current',
          monthlyCost: 1000,
          yearlyProjection: 12000,
          assumptions: ['Current usage patterns continue']
        },
        {
          scenario: 'optimized',
          monthlyCost: 800,
          yearlyProjection: 9600,
          assumptions: ['20% optimization improvements']
        }
      ]
    };
  }

  private async analyzeMemoryCapacity(): Promise<CapacityPlanningAnalysis> {
    const currentUtilization = await this.getCurrentMemoryUtilization();
    const projectedUtilization = await this.projectMemoryGrowth();

    return {
      analysisId: crypto.randomUUID(),
      resourceType: 'memory',
      currentUtilization,
      projectedUtilization,
      timeHorizon: 90,
      recommendations: [
        {
          recommendationType: projectedUtilization > 85 ? 'scale_up' : 'optimize',
          description: projectedUtilization > 85 
            ? 'Increase memory allocation to prevent performance issues'
            : 'Optimize memory usage and implement garbage collection tuning',
          estimatedCost: projectedUtilization > 85 ? 300 : 0,
          estimatedSavings: projectedUtilization > 85 ? 0 : 150,
          implementation: [
            'Analyze memory usage patterns',
            'Optimize memory allocation',
            'Implement memory pooling'
          ],
          priority: projectedUtilization > 85 ? 'high' : 'medium'
        }
      ],
      costProjections: [
        {
          scenario: 'current',
          monthlyCost: 600,
          yearlyProjection: 7200,
          assumptions: ['Current memory allocation']
        },
        {
          scenario: 'scaled',
          monthlyCost: 900,
          yearlyProjection: 10800,
          assumptions: ['50% memory increase']
        }
      ]
    };
  }

  private async analyzeStorageCapacity(): Promise<CapacityPlanningAnalysis> {
    const currentUtilization = await this.getCurrentStorageUtilization();
    const projectedUtilization = await this.projectStorageGrowth();

    return {
      analysisId: crypto.randomUUID(),
      resourceType: 'storage',
      currentUtilization,
      projectedUtilization,
      timeHorizon: 90,
      recommendations: [
        {
          recommendationType: 'optimize',
          description: 'Implement data archiving and compression strategies',
          estimatedCost: 100,
          estimatedSavings: 400,
          implementation: [
            'Archive old data',
            'Implement data compression',
            'Optimize data retention policies'
          ],
          priority: 'medium'
        }
      ],
      costProjections: [
        {
          scenario: 'current',
          monthlyCost: 400,
          yearlyProjection: 4800,
          assumptions: ['Linear data growth']
        },
        {
          scenario: 'optimized',
          monthlyCost: 280,
          yearlyProjection: 3360,
          assumptions: ['30% reduction through optimization']
        }
      ]
    };
  }

  // User Experience Monitoring
  async recordWebVitals(data: WebVitalsData): Promise<void> {
    await supabase
      .from('web_vitals_logs')
      .insert({
        org_id: this.org_id,
        url: data.url,
        device_type: data.deviceType,
        connection_type: data.connectionType,
        page_load_time: data.metrics.pageLoadTime,
        first_contentful_paint: data.metrics.firstContentfulPaint,
        largest_contentful_paint: data.metrics.largestContentfulPaint,
        cumulative_layout_shift: data.metrics.cumulativeLayoutShift,
        first_input_delay: data.metrics.firstInputDelay,
        time_to_interactive: data.metrics.timeToInteractive,
        user_satisfaction_score: data.metrics.userSatisfactionScore,
        user_id: data.userId,
        session_id: data.sessionId,
        timestamp: data.timestamp.toISOString()
      });
  }

  async getWebVitalsAnalysis(timeRange: { start: Date; end: Date }): Promise<UserExperienceMetrics> {
    const { data, error } = await supabase
      .from('web_vitals_logs')
      .select('*')
      .eq('org_id', this.org_id)
      .gte('timestamp', timeRange.start.toISOString())
      .lte('timestamp', timeRange.end.toISOString());

    if (error || !data || data.length === 0) {
      return {
        pageLoadTime: 0,
        firstContentfulPaint: 0,
        largestContentfulPaint: 0,
        cumulativeLayoutShift: 0,
        firstInputDelay: 0,
        timeToInteractive: 0,
        userSatisfactionScore: 0
      };
    }

    return {
      pageLoadTime: this.calculateAverage(data, 'page_load_time'),
      firstContentfulPaint: this.calculateAverage(data, 'first_contentful_paint'),
      largestContentfulPaint: this.calculateAverage(data, 'largest_contentful_paint'),
      cumulativeLayoutShift: this.calculateAverage(data, 'cumulative_layout_shift'),
      firstInputDelay: this.calculateAverage(data, 'first_input_delay'),
      timeToInteractive: this.calculateAverage(data, 'time_to_interactive'),
      userSatisfactionScore: this.calculateAverage(data, 'user_satisfaction_score')
    };
  }

  // Real-time Monitoring
  async startRealTimeMonitoring(): Promise<void> {
    // Start metric collection interval
    setInterval(async () => {
      await this.collectMetrics();
    }, 30000); // Every 30 seconds

    // Start alert checking
    setInterval(async () => {
      await this.checkAlerts();
    }, 60000); // Every minute
  }

  private async checkAlerts(): Promise<void> {
    const metrics = await this.getCurrentMetrics();
    
    for (const metric of metrics) {
      if (metric.currentValue > metric.thresholds.critical) {
        await this.createAlert(metric, 'critical');
      } else if (metric.currentValue > metric.thresholds.warning) {
        await this.createAlert(metric, 'warning');
      }
    }
  }

  private async createAlert(metric: PerformanceMetric, severity: 'warning' | 'critical'): Promise<void> {
    const alert: PerformanceAlert = {
      alertId: crypto.randomUUID(),
      metricId: metric.metricId,
      alertType: 'threshold',
      severity: severity === 'critical' ? 'critical' : 'medium',
      message: `${metric.metricName} exceeded ${severity} threshold: ${metric.currentValue}${metric.unit}`,
      triggeredAt: new Date(),
      escalationLevel: 0
    };

    this.alerts.push(alert);

    // Store in database
    await supabase
      .from('performance_alerts')
      .insert({
        id: alert.alertId,
        org_id: this.org_id,
        metric_id: alert.metricId,
        alert_type: alert.alertType,
        severity: alert.severity,
        message: alert.message,
        triggered_at: alert.triggeredAt.toISOString()
      });
  }

  // Helper Methods
  private async initializeCollectors(): Promise<void> {
    // Initialize data collectors for different metric types
    const collectors: DataCollector[] = [
      {
        collectorId: 'app_metrics',
        name: 'Application Metrics Collector',
        type: 'application',
        config: {
          interval: 30000,
          endpoints: ['/api/health', '/api/metrics'],
          filters: [],
          aggregation: { method: 'average', window: 300 }
        },
        status: 'active',
        lastCollection: new Date(),
        metricsCollected: ['api_response_time', 'throughput', 'error_rate']
      },
      {
        collectorId: 'infra_metrics',
        name: 'Infrastructure Metrics Collector',
        type: 'infrastructure',
        config: {
          interval: 60000,
          endpoints: ['/metrics/system'],
          filters: [],
          aggregation: { method: 'average', window: 300 }
        },
        status: 'active',
        lastCollection: new Date(),
        metricsCollected: ['cpu_usage', 'memory_usage', 'disk_usage']
      }
    ];

    collectors.forEach(collector => {
      this.collectors.set(collector.collectorId, collector);
    });
  }

  private calculateTrend(metricId: string, currentValue: number): 'improving' | 'stable' | 'degrading' {
    const historicalData = this.getHistoricalData(metricId);
    if (historicalData.length < 2) return 'stable';

    const previousValue = historicalData[historicalData.length - 2].value;
    const change = ((currentValue - previousValue) / previousValue) * 100;

    if (Math.abs(change) < 5) return 'stable';
    
    // For metrics where lower is better (response time, error rate)
    if (['api_response_time', 'error_rate', 'page_load_time'].includes(metricId)) {
      return change < 0 ? 'improving' : 'degrading';
    }
    
    // For metrics where higher is better (throughput)
    return change > 0 ? 'improving' : 'degrading';
  }

  private getHistoricalData(metricId: string): MetricDataPoint[] {
    return this.metricsBuffer.get(metricId) || [];
  }

  private async storeMetrics(metrics: PerformanceMetric[]): Promise<void> {
    for (const metric of metrics) {
      // Update buffer
      const buffer = this.metricsBuffer.get(metric.metricId) || [];
      buffer.push({
        timestamp: new Date(),
        value: metric.currentValue
      });
      
      // Keep only last 100 data points in memory
      if (buffer.length > 100) {
        buffer.shift();
      }
      
      this.metricsBuffer.set(metric.metricId, buffer);

      // Store in database
      await supabase
        .from('performance_metrics')
        .insert({
          org_id: this.org_id,
          metric_name: metric.metricId,
          metric_value: metric.currentValue,
          measurement_timestamp: new Date().toISOString(),
          service_name: 'finSafe',
          custom_metrics: {
            unit: metric.unit,
            target: metric.targetValue,
            thresholds: metric.thresholds
          }
        });
    }
  }

  // Mock measurement methods (replace with actual implementations)
  private async measureAPIResponseTime(): Promise<number> {
    return Math.random() * 1000 + 200; // 200-1200ms
  }

  private async measureThroughput(): Promise<number> {
    return Math.random() * 100 + 50; // 50-150 rps
  }

  private async measureErrorRate(): Promise<number> {
    return Math.random() * 5; // 0-5%
  }

  private async measureCPUUsage(): Promise<number> {
    return Math.random() * 100; // 0-100%
  }

  private async measureMemoryUsage(): Promise<number> {
    return Math.random() * 100; // 0-100%
  }

  private async measurePageLoadTime(): Promise<number> {
    return Math.random() * 3000 + 1000; // 1000-4000ms
  }

  private async getCurrentMetrics(): Promise<PerformanceMetric[]> {
    return await this.collectMetrics();
  }

  private async identifySlowEndpoints(timeRange: { start: Date; end: Date }): Promise<string[]> {
    // Mock implementation
    return ['/api/reports', '/api/analytics'];
  }

  private async identifySlowQueries(timeRange: { start: Date; end: Date }): Promise<string[]> {
    // Mock implementation
    return ['SELECT * FROM large_table', 'JOIN query without index'];
  }

  private async identifyDegradingMetrics(timeRange: { start: Date; end: Date }): Promise<string[]> {
    // Mock implementation
    return ['api_response_time', 'error_rate'];
  }

  private async detectStatisticalAnomalies(timeRange: { start: Date; end: Date }): Promise<string[]> {
    // Mock implementation
    return ['cpu_usage'];
  }

  private async getCurrentCPUUtilization(): Promise<number> {
    return Math.random() * 80 + 10; // 10-90%
  }

  private async projectCPUGrowth(): Promise<number> {
    const current = await this.getCurrentCPUUtilization();
    return current * 1.2; // 20% growth projection
  }

  private async getCurrentMemoryUtilization(): Promise<number> {
    return Math.random() * 70 + 15; // 15-85%
  }

  private async projectMemoryGrowth(): Promise<number> {
    const current = await this.getCurrentMemoryUtilization();
    return current * 1.15; // 15% growth projection
  }

  private async getCurrentStorageUtilization(): Promise<number> {
    return Math.random() * 60 + 20; // 20-80%
  }

  private async projectStorageGrowth(): Promise<number> {
    const current = await this.getCurrentStorageUtilization();
    return current * 1.3; // 30% growth projection
  }

  private calculateAverage(data: any[], field: string): number {
    if (data.length === 0) return 0;
    const sum = data.reduce((acc, item) => acc + (item[field] || 0), 0);
    return sum / data.length;
  }
}

// Export service factory
export const createPerformanceMonitoringService = (org_id: string) => new PerformanceMonitoringService(org_id);
