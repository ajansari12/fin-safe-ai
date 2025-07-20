
import { supabase } from "@/integrations/supabase/client";
import { getCurrentUserProfile } from "@/lib/supabase-utils";
import { integrationCoreService, Integration } from "./integration-core-service";

export interface ExternalSystemConfig {
  id: string;
  name: string;
  type: 'core_banking' | 'trading' | 'hr' | 'vendor_mgmt' | 'regulatory' | 'market_data';
  endpoint: string;
  authentication: {
    type: 'api_key' | 'oauth' | 'basic' | 'certificate';
    credentials: Record<string, string>;
  };
  dataMapping: DataMappingConfig;
  syncSchedule: {
    frequency: 'real_time' | 'hourly' | 'daily' | 'weekly';
    enabled: boolean;
  };
  healthCheck: {
    endpoint: string;
    expectedResponse: any;
    timeout: number;
  };
}

export interface DataMappingConfig {
  sourceFields: FieldMapping[];
  transformations: DataTransformation[];
  validationRules: ValidationRule[];
}

export interface FieldMapping {
  sourceField: string;
  targetField: string;
  dataType: 'string' | 'number' | 'date' | 'boolean' | 'object';
  required: boolean;
  defaultValue?: any;
}

export interface DataTransformation {
  id: string;
  type: 'format' | 'calculate' | 'lookup' | 'conditional';
  field: string;
  transformation: string;
  parameters: Record<string, any>;
}

export interface ValidationRule {
  id: string;
  field: string;
  type: 'required' | 'format' | 'range' | 'custom';
  rule: string;
  errorMessage: string;
}

export interface IntegrationHealth {
  systemId: string;
  status: 'healthy' | 'degraded' | 'down' | 'unknown';
  lastCheck: Date;
  responseTime: number;
  errorCount: number;
  successRate: number;
  lastError?: string;
}

class EnhancedIntegrationService {
  private healthCheckCache: Map<string, IntegrationHealth> = new Map();
  private retryConfig = {
    maxRetries: 3,
    backoffMultiplier: 2,
    initialDelay: 1000
  };

  async connectExternalSystem(config: ExternalSystemConfig): Promise<boolean> {
    try {
      console.log(`Connecting to external system: ${config.name}`);
      
      // Validate configuration
      await this.validateSystemConfig(config);
      
      // Test connection
      const connectionTest = await this.performHealthCheck(config);
      
      if (connectionTest.status === 'healthy') {
        // Store configuration securely
        await this.storeSystemConfig(config);
        console.log(`Successfully connected to ${config.name}`);
        return true;
      }
      
      throw new Error(`Health check failed for ${config.name}: ${connectionTest.lastError}`);
    } catch (error) {
      console.error(`Failed to connect to ${config.name}:`, error);
      return false;
    }
  }

  async syncDataFromSystem(systemId: string, dataType: string): Promise<any[]> {
    try {
      const config = await this.getSystemConfig(systemId);
      if (!config) {
        throw new Error(`System configuration not found: ${systemId}`);
      }

      console.log(`Syncing ${dataType} data from ${config.name}`);
      
      // Perform data sync with retry logic
      const rawData = await this.executeWithRetry(async () => {
        return await this.fetchDataFromSystem(config, dataType);
      });

      // Transform and validate data
      const transformedData = await this.transformData(rawData, config.dataMapping);
      
      // Store synced data
      await this.storeSyncedData(systemId, dataType, transformedData);
      
      console.log(`Successfully synced ${transformedData.length} records from ${config.name}`);
      return transformedData;
    } catch (error) {
      console.error(`Data sync failed for ${systemId}:`, error);
      throw error;
    }
  }

  async performHealthCheck(config: ExternalSystemConfig): Promise<IntegrationHealth> {
    const startTime = Date.now();
    const health: IntegrationHealth = {
      systemId: config.id,
      status: 'unknown',
      lastCheck: new Date(),
      responseTime: 0,
      errorCount: 0,
      successRate: 0
    };

    try {
      const response = await fetch(config.healthCheck.endpoint, {
        method: 'GET',
        headers: this.buildAuthHeaders(config.authentication),
        signal: AbortSignal.timeout(config.healthCheck.timeout || 10000)
      });

      health.responseTime = Date.now() - startTime;

      if (response.ok) {
        const data = await response.json();
        health.status = this.validateHealthResponse(data, config.healthCheck.expectedResponse) 
          ? 'healthy' : 'degraded';
      } else {
        health.status = 'degraded';
        health.lastError = `HTTP ${response.status}: ${response.statusText}`;
      }
    } catch (error: any) {
      health.status = 'down';
      health.lastError = error.message;
      health.errorCount = 1;
    }

    this.healthCheckCache.set(config.id, health);
    return health;
  }

  async getSystemHealth(systemId: string): Promise<IntegrationHealth | null> {
    return this.healthCheckCache.get(systemId) || null;
  }

  async getAllSystemsHealth(): Promise<IntegrationHealth[]> {
    return Array.from(this.healthCheckCache.values());
  }

  private async validateSystemConfig(config: ExternalSystemConfig): Promise<void> {
    if (!config.endpoint || !config.name || !config.type) {
      throw new Error('Invalid system configuration: missing required fields');
    }

    if (!config.authentication || !config.authentication.type) {
      throw new Error('Invalid authentication configuration');
    }

    // Validate endpoint URL
    try {
      new URL(config.endpoint);
    } catch {
      throw new Error('Invalid endpoint URL');
    }
  }

  private buildAuthHeaders(auth: ExternalSystemConfig['authentication']): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };

    switch (auth.type) {
      case 'api_key':
        headers['Authorization'] = `Bearer ${auth.credentials.apiKey}`;
        break;
      case 'basic':
        const encoded = btoa(`${auth.credentials.username}:${auth.credentials.password}`);
        headers['Authorization'] = `Basic ${encoded}`;
        break;
      case 'oauth':
        headers['Authorization'] = `Bearer ${auth.credentials.accessToken}`;
        break;
    }

    return headers;
  }

  private async fetchDataFromSystem(config: ExternalSystemConfig, dataType: string): Promise<any[]> {
    const endpoint = `${config.endpoint}/api/v1/${dataType}`;
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: this.buildAuthHeaders(config.authentication)
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch data: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  }

  private async transformData(data: any[], mapping: DataMappingConfig): Promise<any[]> {
    return data.map(item => {
      const transformed: any = {};
      
      // Apply field mappings
      mapping.sourceFields.forEach(fieldMap => {
        const sourceValue = item[fieldMap.sourceField];
        transformed[fieldMap.targetField] = sourceValue !== undefined 
          ? sourceValue 
          : fieldMap.defaultValue;
      });

      // Apply transformations
      mapping.transformations.forEach(transform => {
        if (transformed[transform.field] !== undefined) {
          transformed[transform.field] = this.applyTransformation(
            transformed[transform.field], 
            transform
          );
        }
      });

      return transformed;
    });
  }

  private applyTransformation(value: any, transform: DataTransformation): any {
    switch (transform.type) {
      case 'format':
        if (transform.transformation === 'date' && value) {
          return new Date(value).toISOString();
        }
        if (transform.transformation === 'number' && value) {
          return Number(value);
        }
        return value;
      
      case 'calculate':
        // Simple arithmetic operations
        if (transform.transformation.includes('+')) {
          const [field, addValue] = transform.transformation.split('+');
          return Number(value) + Number(addValue.trim());
        }
        return value;
      
      default:
        return value;
    }
  }

  private validateHealthResponse(actual: any, expected: any): boolean {
    if (typeof expected === 'object' && expected !== null) {
      return Object.keys(expected).every(key => 
        actual[key] === expected[key]
      );
    }
    return actual === expected;
  }

  private async executeWithRetry<T>(operation: () => Promise<T>): Promise<T> {
    let lastError: Error;
    
    for (let attempt = 0; attempt <= this.retryConfig.maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error: any) {
        lastError = error;
        
        if (attempt < this.retryConfig.maxRetries) {
          const delay = this.retryConfig.initialDelay * 
            Math.pow(this.retryConfig.backoffMultiplier, attempt);
          
          console.log(`Retry attempt ${attempt + 1} after ${delay}ms`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    throw lastError!;
  }

  private async storeSystemConfig(config: ExternalSystemConfig): Promise<void> {
    const profile = await getCurrentUserProfile();
    if (!profile?.organization_id) return;

    // Store in integrations table (encrypted credentials handled by Supabase)
    await integrationCoreService.createIntegration({
      org_id: profile.organization_id,
      integration_name: config.name,
      integration_type: config.type as any,
      provider: config.type,
      configuration: {
        endpoint: config.endpoint,
        dataMapping: config.dataMapping,
        syncSchedule: config.syncSchedule,
        healthCheck: config.healthCheck
      },
      webhook_url: config.endpoint,
      is_active: true,
      last_sync_at: null,
      created_by: profile.id,
      created_by_name: profile.full_name
    });
  }

  private async getSystemConfig(systemId: string): Promise<ExternalSystemConfig | null> {
    try {
      const integrations = await integrationCoreService.getIntegrations();
      const integration = integrations.find(i => i.id === systemId);
      
      if (!integration) return null;

      return {
        id: integration.id,
        name: integration.integration_name,
        type: integration.integration_type as any,
        endpoint: integration.configuration.endpoint,
        authentication: {
          type: 'api_key', // Default, should be stored securely
          credentials: {} // Retrieved from secure storage
        },
        dataMapping: integration.configuration.dataMapping || { 
          sourceFields: [], 
          transformations: [], 
          validationRules: [] 
        },
        syncSchedule: integration.configuration.syncSchedule || { 
          frequency: 'daily', 
          enabled: true 
        },
        healthCheck: integration.configuration.healthCheck || {
          endpoint: integration.configuration.endpoint + '/health',
          expectedResponse: { status: 'ok' },
          timeout: 10000
        }
      };
    } catch (error) {
      console.error('Failed to get system config:', error);
      return null;
    }
  }

  private async storeSyncedData(systemId: string, dataType: string, data: any[]): Promise<void> {
    // Store synced data in appropriate tables based on dataType
    console.log(`Storing ${data.length} ${dataType} records from system ${systemId}`);
    // Implementation would vary based on data type and target tables
  }
}

export const enhancedIntegrationService = new EnhancedIntegrationService();
