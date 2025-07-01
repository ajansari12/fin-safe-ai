
// Legacy interface exports for backward compatibility
export type { 
  MicroserviceConfig, 
  ServiceInstance, 
  LoadMetrics, 
  ScalingConfig, 
  CircuitBreakerConfig 
} from './database-microservices-registry';

// Re-export the database-backed implementation
export { 
  databaseMicroservicesRegistry as microservicesRegistry,
  type MicroserviceRecord
} from './database-microservices-registry';

// Deprecated: Use databaseMicroservicesRegistry instead
console.warn('microservices-registry.ts is deprecated. Use database-microservices-registry.ts instead.');
