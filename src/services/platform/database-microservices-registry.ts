
import { supabase } from "@/integrations/supabase/client";
import { getCurrentUserProfile } from "@/lib/supabase-utils";

export interface MicroserviceRecord {
  id: string;
  org_id: string;
  service_name: string;
  service_version: string;
  endpoints: string[];
  health_check_url: string;
  instances: ServiceInstance[];
  scaling_config: ScalingConfig;
  circuit_breaker_config: CircuitBreakerConfig;
  environment: string;
  region: string;
  status: 'active' | 'inactive' | 'degraded' | 'failed';
  last_health_check?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
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

class DatabaseMicroservicesRegistry {
  // Register a new microservice
  async registerService(config: Omit<MicroserviceRecord, 'id' | 'org_id' | 'created_at' | 'updated_at'>): Promise<void> {
    const profile = await getCurrentUserProfile();
    if (!profile?.organization_id) throw new Error('No organization found');

    const { error } = await supabase
      .from('microservices')
      .insert({
        org_id: profile.organization_id,
        service_name: config.service_name,
        service_version: config.service_version,
        endpoints: config.endpoints,
        health_check_url: config.health_check_url,
        instances: config.instances,
        scaling_config: config.scaling_config,
        circuit_breaker_config: config.circuit_breaker_config,
        environment: config.environment,
        region: config.region,
        status: config.status,
        created_by: profile.id
      });

    if (error) throw error;
  }

  // Discover services
  async discoverServices(serviceName?: string, environment?: string): Promise<MicroserviceRecord[]> {
    const profile = await getCurrentUserProfile();
    if (!profile?.organization_id) return [];

    let query = supabase
      .from('microservices')
      .select('*')
      .eq('org_id', profile.organization_id);

    if (serviceName) {
      query = query.eq('service_name', serviceName);
    }

    if (environment) {
      query = query.eq('environment', environment);
    }

    const { data, error } = await query.order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }

  // Get healthy service instance for load balancing
  async getServiceInstance(serviceName: string, strategy: 'round-robin' | 'least-connections' | 'weighted' = 'round-robin'): Promise<ServiceInstance | null> {
    const services = await this.discoverServices(serviceName);
    const activeServices = services.filter(s => s.status === 'active');
    
    if (activeServices.length === 0) return null;

    // Get all healthy instances from active services
    const allInstances = activeServices.flatMap(service => 
      service.instances.filter(instance => instance.status === 'healthy')
    );

    if (allInstances.length === 0) return null;

    switch (strategy) {
      case 'least-connections':
        return allInstances.reduce((prev, current) => 
          current.loadMetrics.requestsPerSecond < prev.loadMetrics.requestsPerSecond ? current : prev
        );
      case 'weighted':
        return this.getWeightedInstance(allInstances);
      default:
        return allInstances[Math.floor(Math.random() * allInstances.length)];
    }
  }

  private getWeightedInstance(instances: ServiceInstance[]): ServiceInstance {
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

  // Update service health status
  async updateServiceHealth(serviceName: string, instances: ServiceInstance[]): Promise<void> {
    const profile = await getCurrentUserProfile();
    if (!profile?.organization_id) return;

    const { error } = await supabase
      .from('microservices')
      .update({
        instances,
        last_health_check: new Date().toISOString()
      })
      .eq('org_id', profile.organization_id)
      .eq('service_name', serviceName);

    if (error) throw error;
  }

  // Update service status
  async updateServiceStatus(serviceName: string, status: MicroserviceRecord['status']): Promise<void> {
    const profile = await getCurrentUserProfile();
    if (!profile?.organization_id) return;

    const { error } = await supabase
      .from('microservices')
      .update({ status })
      .eq('org_id', profile.organization_id)
      .eq('service_name', serviceName);

    if (error) throw error;
  }

  // Delete service
  async deleteService(serviceName: string, environment: string): Promise<void> {
    const profile = await getCurrentUserProfile();
    if (!profile?.organization_id) return;

    const { error } = await supabase
      .from('microservices')
      .delete()
      .eq('org_id', profile.organization_id)
      .eq('service_name', serviceName)
      .eq('environment', environment);

    if (error) throw error;
  }
}

export const databaseMicroservicesRegistry = new DatabaseMicroservicesRegistry();
