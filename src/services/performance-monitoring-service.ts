
interface PerformanceMetric {
  id: string;
  name: string;
  value: number;
  unit: string;
  timestamp: string;
  category: 'application' | 'infrastructure' | 'database' | 'network';
}

interface SystemAlert {
  id: string;
  type: 'warning' | 'critical' | 'info';
  message: string;
  metric_id?: string;
  created_at: string;
  resolved_at?: string;
}

class PerformanceMonitoringService {
  // Real-time metrics collection
  async collectMetrics(orgId: string): Promise<PerformanceMetric[]> {
    try {
      console.log('Collecting performance metrics for org:', orgId);
      
      // Mock performance metrics
      const metrics: PerformanceMetric[] = [
        {
          id: 'response-time',
          name: 'Average Response Time',
          value: Math.round(Math.random() * 100 + 100), // 100-200ms
          unit: 'ms',
          timestamp: new Date().toISOString(),
          category: 'application'
        },
        {
          id: 'throughput',
          name: 'Request Throughput',
          value: Math.round(Math.random() * 50 + 30), // 30-80 req/sec
          unit: 'req/sec',
          timestamp: new Date().toISOString(),
          category: 'application'
        },
        {
          id: 'error-rate',
          name: 'Error Rate',
          value: Math.round(Math.random() * 2 * 100) / 100, // 0-2%
          unit: '%',
          timestamp: new Date().toISOString(),
          category: 'application'
        },
        {
          id: 'cpu-usage',
          name: 'CPU Utilization',
          value: Math.round(Math.random() * 40 + 40), // 40-80%
          unit: '%',
          timestamp: new Date().toISOString(),
          category: 'infrastructure'
        },
        {
          id: 'memory-usage',
          name: 'Memory Usage',
          value: Math.round(Math.random() * 30 + 50), // 50-80%
          unit: '%',
          timestamp: new Date().toISOString(),
          category: 'infrastructure'
        },
        {
          id: 'db-response',
          name: 'Database Response Time',
          value: Math.round(Math.random() * 20 + 5), // 5-25ms
          unit: 'ms',
          timestamp: new Date().toISOString(),
          category: 'database'
        }
      ];

      return metrics;
    } catch (error) {
      console.error('Error collecting metrics:', error);
      throw error;
    }
  }

  // Performance trend analysis
  async analyzePerformanceTrends(orgId: string, timeRange: '1h' | '24h' | '7d' | '30d'): Promise<{
    trends: {
      metric_id: string;
      trend: 'improving' | 'stable' | 'degrading';
      change_percentage: number;
      recommendation?: string;
    }[];
    summary: {
      overall_health: 'good' | 'warning' | 'critical';
      performance_score: number;
      key_insights: string[];
    };
  }> {
    try {
      console.log('Analyzing performance trends for:', timeRange);
      
      // Mock trend analysis
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const trends = [
        {
          metric_id: 'response-time',
          trend: 'improving' as const,
          change_percentage: -12.5,
          recommendation: 'Response times have improved by 12.5% due to recent optimizations'
        },
        {
          metric_id: 'throughput',
          trend: 'stable' as const,
          change_percentage: 2.1,
          recommendation: 'Throughput remains stable with slight positive trend'
        },
        {
          metric_id: 'error-rate',
          trend: 'degrading' as const,
          change_percentage: 15.3,
          recommendation: 'Error rate has increased - investigate recent deployments'
        },
        {
          metric_id: 'cpu-usage',
          trend: 'stable' as const,
          change_percentage: -3.2
        }
      ];

      const performanceScore = Math.round(85 + Math.random() * 10); // 85-95
      const overallHealth = performanceScore >= 90 ? 'good' : performanceScore >= 75 ? 'warning' : 'critical';

      return {
        trends,
        summary: {
          overall_health: overallHealth,
          performance_score: performanceScore,
          key_insights: [
            'System performance is within acceptable ranges',
            'Recent optimizations have improved response times',
            'Monitor error rates for potential issues',
            'Consider scaling resources during peak hours'
          ]
        }
      };
    } catch (error) {
      console.error('Error analyzing performance trends:', error);
      throw error;
    }
  }

  // Alert management
  async getSystemAlerts(orgId: string): Promise<SystemAlert[]> {
    try {
      console.log('Getting system alerts for org:', orgId);
      
      // Mock alerts
      const alerts: SystemAlert[] = [
        {
          id: 'alert-1',
          type: 'warning',
          message: 'CPU utilization approaching threshold (75%)',
          metric_id: 'cpu-usage',
          created_at: new Date(Date.now() - 300000).toISOString() // 5 minutes ago
        },
        {
          id: 'alert-2',
          type: 'info',
          message: 'Performance optimization completed successfully',
          created_at: new Date(Date.now() - 1800000).toISOString(), // 30 minutes ago
          resolved_at: new Date(Date.now() - 1200000).toISOString() // 20 minutes ago
        }
      ];

      return alerts;
    } catch (error) {
      console.error('Error getting system alerts:', error);
      throw error;
    }
  }

  // Performance optimization recommendations
  async generateOptimizationRecommendations(orgId: string): Promise<{
    recommendations: {
      id: string;
      category: 'performance' | 'scalability' | 'reliability';
      priority: 'low' | 'medium' | 'high';
      title: string;
      description: string;
      expected_impact: string;
      implementation_effort: 'low' | 'medium' | 'high';
    }[];
    estimated_improvement: {
      response_time: number;
      throughput: number;
      resource_utilization: number;
    };
  }> {
    try {
      console.log('Generating optimization recommendations for org:', orgId);
      
      // Mock recommendations
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const recommendations = [
        {
          id: 'opt-1',
          category: 'performance' as const,
          priority: 'high' as const,
          title: 'Implement Database Query Optimization',
          description: 'Optimize slow database queries by adding indexes and restructuring complex joins',
          expected_impact: '25-30% reduction in database response time',
          implementation_effort: 'medium' as const
        },
        {
          id: 'opt-2',
          category: 'scalability' as const,
          priority: 'medium' as const,
          title: 'Enable Application-Level Caching',
          description: 'Implement Redis caching for frequently accessed data and API responses',
          expected_impact: '40-50% reduction in response time for cached endpoints',
          implementation_effort: 'high' as const
        },
        {
          id: 'opt-3',
          category: 'reliability' as const,
          priority: 'low' as const,
          title: 'Implement Circuit Breaker Pattern',
          description: 'Add circuit breakers to prevent cascade failures in microservices',
          expected_impact: 'Improved system resilience and faster error recovery',
          implementation_effort: 'medium' as const
        }
      ];

      return {
        recommendations,
        estimated_improvement: {
          response_time: 35, // 35% improvement
          throughput: 20, // 20% improvement
          resource_utilization: 15 // 15% improvement
        }
      };
    } catch (error) {
      console.error('Error generating optimization recommendations:', error);
      throw error;
    }
  }

  // Resource usage monitoring
  async monitorResourceUsage(orgId: string): Promise<{
    current_usage: {
      cpu: number;
      memory: number;
      disk: number;
      network: number;
    };
    predictions: {
      next_hour: { cpu: number; memory: number };
      next_day: { cpu: number; memory: number };
    };
    scaling_recommendations: string[];
  }> {
    try {
      console.log('Monitoring resource usage for org:', orgId);
      
      // Mock resource monitoring
      const currentUsage = {
        cpu: Math.round(Math.random() * 40 + 40), // 40-80%
        memory: Math.round(Math.random() * 30 + 50), // 50-80%
        disk: Math.round(Math.random() * 20 + 60), // 60-80%
        network: Math.round(Math.random() * 50 + 20) // 20-70%
      };

      const predictions = {
        next_hour: {
          cpu: Math.min(100, currentUsage.cpu + Math.round(Math.random() * 10 - 5)),
          memory: Math.min(100, currentUsage.memory + Math.round(Math.random() * 6 - 3))
        },
        next_day: {
          cpu: Math.min(100, currentUsage.cpu + Math.round(Math.random() * 20 - 10)),
          memory: Math.min(100, currentUsage.memory + Math.round(Math.random() * 12 - 6))
        }
      };

      const scalingRecommendations = [];
      if (predictions.next_hour.cpu > 80) {
        scalingRecommendations.push('Consider scaling CPU resources in the next hour');
      }
      if (predictions.next_day.memory > 85) {
        scalingRecommendations.push('Memory usage may reach critical levels - plan capacity increase');
      }
      if (currentUsage.disk > 75) {
        scalingRecommendations.push('Disk usage is high - consider cleanup or expansion');
      }

      return {
        current_usage: currentUsage,
        predictions,
        scaling_recommendations
      };
    } catch (error) {
      console.error('Error monitoring resource usage:', error);
      throw error;
    }
  }
}

export const performanceMonitoringService = new PerformanceMonitoringService();
