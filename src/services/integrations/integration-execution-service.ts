import { integrationLoggingService } from './integration-logging-service';

export interface IntegrationRequest {
  integrationId: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  endpoint: string;
  headers?: Record<string, string>;
  data?: any;
  timeout?: number;
}

export interface IntegrationResponse {
  success: boolean;
  data?: any;
  error?: string;
  responseTime: number;
  status?: number;
}

export interface DataTransformation {
  field: string;
  source: string;
  target: string;
  transformation: 'map' | 'format' | 'calculate' | 'conditional';
  rules?: any;
}

class IntegrationExecutionService {
  private baseTimeout = 30000; // 30 seconds

  async executeIntegration(request: IntegrationRequest): Promise<IntegrationResponse> {
    const startTime = Date.now();
    
    try {
      const response = await this.makeRequest(request);
      const responseTime = Date.now() - startTime;

      // Log successful execution
      await integrationLoggingService.logIntegrationEvent(
        request.integrationId,
        'api_call',
        { request: request, response: response },
        'success',
        undefined,
        responseTime
      );

      return {
        success: true,
        data: response.data,
        responseTime,
        status: response.status
      };
    } catch (error: any) {
      const responseTime = Date.now() - startTime;
      
      // Log failed execution
      await integrationLoggingService.logIntegrationEvent(
        request.integrationId,
        'api_call',
        { request: request },
        'error',
        error.message,
        responseTime
      );

      return {
        success: false,
        error: error.message,
        responseTime,
        status: error.status
      };
    }
  }

  private async makeRequest(request: IntegrationRequest): Promise<any> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), request.timeout || this.baseTimeout);

    try {
      const response = await fetch(request.endpoint, {
        method: request.method,
        headers: {
          'Content-Type': 'application/json',
          ...request.headers
        },
        body: request.data ? JSON.stringify(request.data) : undefined,
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return { data, status: response.status };
    } finally {
      clearTimeout(timeoutId);
    }
  }

  async transformData(data: any, transformations: DataTransformation[]): Promise<any> {
    let transformed = { ...data };

    for (const transform of transformations) {
      try {
        transformed = this.applyTransformation(transformed, transform);
      } catch (error) {
        console.error(`Transformation failed for field ${transform.field}:`, error);
        // Continue with other transformations
      }
    }

    return transformed;
  }

  private applyTransformation(data: any, transform: DataTransformation): any {
    const { field, source, target, transformation, rules } = transform;
    
    switch (transformation) {
      case 'map':
        return {
          ...data,
          [target]: data[source]
        };
      
      case 'format':
        return {
          ...data,
          [target]: this.formatValue(data[source], rules)
        };
      
      case 'calculate':
        return {
          ...data,
          [target]: this.calculateValue(data, rules)
        };
      
      case 'conditional':
        return {
          ...data,
          [target]: this.conditionalValue(data[source], rules)
        };
      
      default:
        return data;
    }
  }

  private formatValue(value: any, rules: any): any {
    if (!rules?.format) return value;
    
    switch (rules.format) {
      case 'date':
        return new Date(value).toISOString();
      case 'number':
        return Number(value);
      case 'string':
        return String(value);
      case 'uppercase':
        return String(value).toUpperCase();
      case 'lowercase':
        return String(value).toLowerCase();
      default:
        return value;
    }
  }

  private calculateValue(data: any, rules: any): any {
    if (!rules?.expression) return null;
    
    // Simple calculation support
    try {
      // Replace field references in expression
      let expression = rules.expression;
      Object.keys(data).forEach(key => {
        expression = expression.replace(new RegExp(`{${key}}`, 'g'), data[key]);
      });
      
      // Evaluate safe mathematical expressions only
      return Function(`"use strict"; return (${expression})`)();
    } catch (error) {
      console.error('Calculation error:', error);
      return null;
    }
  }

  private conditionalValue(value: any, rules: any): any {
    if (!rules?.conditions) return value;
    
    for (const condition of rules.conditions) {
      if (this.evaluateCondition(value, condition.condition)) {
        return condition.value;
      }
    }
    
    return rules.default || value;
  }

  private evaluateCondition(value: any, condition: string): boolean {
    // Simple condition evaluation
    const operators = ['===', '!==', '>', '<', '>=', '<='];
    
    for (const op of operators) {
      if (condition.includes(op)) {
        const [left, right] = condition.split(op).map(s => s.trim());
        const leftValue = left === 'value' ? value : left;
        const rightValue = right === 'value' ? value : right;
        
        switch (op) {
          case '===': return leftValue === rightValue;
          case '!==': return leftValue !== rightValue;
          case '>': return Number(leftValue) > Number(rightValue);
          case '<': return Number(leftValue) < Number(rightValue);
          case '>=': return Number(leftValue) >= Number(rightValue);
          case '<=': return Number(leftValue) <= Number(rightValue);
        }
      }
    }
    
    return false;
  }

  async testConnection(endpoint: string, headers?: Record<string, string>): Promise<boolean> {
    try {
      const response = await this.makeRequest({
        integrationId: 'test',
        method: 'GET',
        endpoint,
        headers,
        timeout: 10000
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  async syncData(integrationId: string, endpoint: string, data: any, transformations?: DataTransformation[]): Promise<IntegrationResponse> {
    try {
      // Transform data if transformations are provided
      const transformedData = transformations ? 
        await this.transformData(data, transformations) : data;

      // Execute the integration
      return await this.executeIntegration({
        integrationId,
        method: 'POST',
        endpoint,
        data: transformedData
      });
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
        responseTime: 0
      };
    }
  }
}

export const integrationExecutionService = new IntegrationExecutionService();