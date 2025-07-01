
export interface MicroserviceConfig {
  serviceName: string;
  version: string;
  endpoints: string[];
  healthCheckUrl: string;
  instances: ServiceInstance[];
  scalingConfig: ScalingConfig;
  circuitBreakerConfig: CircuitBreakerConfig;
}

export interface ServiceInstance {
  instanceId: string;
  host: string;
  port: number;
  status: 'healthy' | 'unhealthy' | 'starting' | 'stopping';
  region: string;
  lastHealthCheck: Date;
  loadMetrics: LoadMetrics;
}

export interface LoadMetrics {
  cpuUsage: number;
  memoryUsage: number;
  requestsPerSecond: number;
  responseTime: number;
  errorRate: number;
}

export interface ScalingConfig {
  minInstances: number;
  maxInstances: number;
  targetCpuUtilization: number;
  targetMemoryUtilization: number;
  scaleUpThreshold: number;
  scaleDownThreshold: number;
  cooldownPeriod: number;
}

export interface CircuitBreakerConfig {
  failureThreshold: number;
  recoveryTimeout: number;
  monitoringPeriod: number;
  halfOpenMaxCalls: number;
}

class MicroservicesRegistry {
  private services = new Map<string, MicroserviceConfig>();
  private serviceInstances = new Map<string, ServiceInstance[]>();

  // Service Discovery and Registration
  async registerService(config: MicroserviceConfig): Promise<void> {
    this.services.set(config.serviceName, config);
    this.serviceInstances.set(config.serviceName, config.instances);
    
    // Log service registration (instead of storing in non-existent database)
    console.log(`Service registered: ${config.serviceName}`, {
      service_name: config.serviceName,
      service_version: config.version,
      endpoints: config.endpoints,
      health_check_url: config.healthCheckUrl,
      scaling_config: config.scalingConfig,
      circuit_breaker_config: config.circuitBreakerConfig,
      status: 'active'
    });
  }

  async discoverServices(serviceName?: string): Promise<MicroserviceConfig[]> {
    if (serviceName) {
      const service = this.services.get(serviceName);
      return service ? [service] : [];
    }
    return Array.from(this.services.values());
  }

  // Load Balancing
  async getServiceInstance(serviceName: string, strategy: 'round-robin' | 'least-connections' | 'weighted' = 'round-robin'): Promise<ServiceInstance | null> {
    const instances = this.serviceInstances.get(serviceName)?.filter(i => i.status === 'healthy');
    if (!instances || instances.length === 0) return null;

    switch (strategy) {
      case 'least-connections':
        return instances.reduce((prev, current) => 
          current.loadMetrics.requestsPerSecond < prev.loadMetrics.requestsPerSecond ? current : prev
        );
      case 'weighted':
        return this.getWeightedInstance(instances);
      default:
        return instances[Math.floor(Math.random() * instances.length)];
    }
  }

  private getWeightedInstance(instances: ServiceInstance[]): ServiceInstance {
    // Weighted selection based on inverse of response time and CPU usage
    const weights = instances.map(instance => {
      const cpuFactor = Math.max(0.1, 1 - instance.loadMetrics.cpuUsage / 100);
      const responseFactor = Math.max(0.1, 1 / (instance.loadMetrics.responseTime || 1));
      return cpuFactor * responseFactor;
    });

    const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
    const random = Math.random() * totalWeight;
    
    let currentWeight = 0;
    for (let i = 0; i < instances.length; i++) {
      currentWeight += weights[i];
      if (random <= currentWeight) {
        return instances[i];
      }
    }
    
    return instances[0];
  }

  // Health Monitoring
  async performHealthChecks(): Promise<void> {
    for (const [serviceName, instances] of this.serviceInstances) {
      const config = this.services.get(serviceName);
      if (!config) continue;

      const healthPromises = instances.map(async (instance) => {
        try {
          // Use AbortController for timeout instead of fetch timeout option
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 5000);
          
          const response = await fetch(`${instance.host}:${instance.port}${config.healthCheckUrl}`, {
            method: 'GET',
            signal: controller.signal
          });
          
          clearTimeout(timeoutId);
          
          instance.status = response.ok ? 'healthy' : 'unhealthy';
          instance.lastHealthCheck = new Date();
          
          // Update load metrics if provided
          if (response.ok) {
            const metrics = await response.json();
            instance.loadMetrics = {
              ...instance.loadMetrics,
              ...metrics
            };
          }
        } catch (error) {
          instance.status = 'unhealthy';
          instance.lastHealthCheck = new Date();
        }
      });

      await Promise.all(healthPromises);
    }
  }

  // Auto Scaling
  async evaluateScaling(): Promise<void> {
    for (const [serviceName, config] of this.services) {
      const instances = this.serviceInstances.get(serviceName) || [];
      const healthyInstances = instances.filter(i => i.status === 'healthy');
      
      if (healthyInstances.length === 0) continue;

      const avgMetrics = this.calculateAverageMetrics(healthyInstances);
      const shouldScale = this.shouldScale(config.scalingConfig, avgMetrics, healthyInstances.length);
      
      if (shouldScale.scaleUp && healthyInstances.length < config.scalingConfig.maxInstances) {
        await this.scaleUp(serviceName, shouldScale.targetInstances - healthyInstances.length);
      } else if (shouldScale.scaleDown && healthyInstances.length > config.scalingConfig.minInstances) {
        await this.scaleDown(serviceName, healthyInstances.length - shouldScale.targetInstances);
      }
    }
  }

  private calculateAverageMetrics(instances: ServiceInstance[]): LoadMetrics {
    const totals = instances.reduce((acc, instance) => ({
      cpuUsage: acc.cpuUsage + instance.loadMetrics.cpuUsage,
      memoryUsage: acc.memoryUsage + instance.loadMetrics.memoryUsage,
      requestsPerSecond: acc.requestsPerSecond + instance.loadMetrics.requestsPerSecond,
      responseTime: acc.responseTime + instance.loadMetrics.responseTime,
      errorRate: acc.errorRate + instance.loadMetrics.errorRate
    }), { cpuUsage: 0, memoryUsage: 0, requestsPerSecond: 0, responseTime: 0, errorRate: 0 });

    return {
      cpuUsage: totals.cpuUsage / instances.length,
      memoryUsage: totals.memoryUsage / instances.length,
      requestsPerSecond: totals.requestsPerSecond / instances.length,
      responseTime: totals.responseTime / instances.length,
      errorRate: totals.errorRate / instances.length
    };
  }

  private shouldScale(config: ScalingConfig, metrics: LoadMetrics, currentInstances: number) {
    const cpuOverThreshold = metrics.cpuUsage > config.targetCpuUtilization;
    const memoryOverThreshold = metrics.memoryUsage > config.targetMemoryUtilization;
    const cpuUnderThreshold = metrics.cpuUsage < config.targetCpuUtilization * 0.5;
    const memoryUnderThreshold = metrics.memoryUsage < config.targetMemoryUtilization * 0.5;

    return {
      scaleUp: (cpuOverThreshold || memoryOverThreshold) && currentInstances < config.maxInstances,
      scaleDown: (cpuUnderThreshold && memoryUnderThreshold) && currentInstances > config.minInstances,
      targetInstances: this.calculateTargetInstances(config, metrics, currentInstances)
    };
  }

  private calculateTargetInstances(config: ScalingConfig, metrics: LoadMetrics, current: number): number {
    const cpuBasedTarget = Math.ceil((metrics.cpuUsage / config.targetCpuUtilization) * current);
    const memoryBasedTarget = Math.ceil((metrics.memoryUsage / config.targetMemoryUtilization) * current);
    
    const target = Math.max(cpuBasedTarget, memoryBasedTarget);
    return Math.min(Math.max(target, config.minInstances), config.maxInstances);
  }

  private async scaleUp(serviceName: string, count: number): Promise<void> {
    console.log(`Scaling up ${serviceName} by ${count} instances`);
    // Implementation would integrate with container orchestration platform
    // This is a placeholder for the actual scaling logic
  }

  private async scaleDown(serviceName: string, count: number): Promise<void> {
    console.log(`Scaling down ${serviceName} by ${count} instances`);
    // Implementation would integrate with container orchestration platform
    // This is a placeholder for the actual scaling logic
  }
}

export const microservicesRegistry = new MicroservicesRegistry();
