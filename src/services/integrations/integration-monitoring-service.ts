import { integrationLoggingService } from './integration-logging-service';

export interface IntegrationMetrics {
  integrationId: string;
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  uptime: number;
  lastSync: Date | null;
  errorRate: number;
  throughput: number; // requests per minute
}

export interface HealthCheck {
  integrationId: string;
  status: 'healthy' | 'degraded' | 'down';
  lastCheck: Date;
  responseTime: number;
  errorMessage?: string;
  checks: {
    connectivity: boolean;
    authentication: boolean;
    dataFlow: boolean;
  };
}

export interface IntegrationAlert {
  id: string;
  integrationId: string;
  alertType: 'error_rate' | 'response_time' | 'connectivity' | 'authentication' | 'data_quality';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  triggeredAt: Date;
  acknowledged: boolean;
  resolvedAt?: Date;
}

class IntegrationMonitoringService {
  private healthCheckInterval = 5 * 60 * 1000; // 5 minutes
  private activeHealthChecks = new Map<string, NodeJS.Timeout>();

  async getIntegrationMetrics(integrationId: string, timeRange: '1h' | '24h' | '7d' | '30d' = '24h'): Promise<IntegrationMetrics> {
    try {
      const logs = await integrationLoggingService.getIntegrationLogs(integrationId);
      
      // Filter logs based on time range
      const cutoffTime = this.getTimeRangeCutoff(timeRange);
      const filteredLogs = logs.filter(log => new Date(log.created_at) >= cutoffTime);

      const totalRequests = filteredLogs.length;
      const successfulRequests = filteredLogs.filter(log => log.status === 'success').length;
      const failedRequests = filteredLogs.filter(log => log.status === 'error').length;
      
      const responseTimes = filteredLogs
        .filter(log => log.response_time_ms)
        .map(log => log.response_time_ms!);
      
      const averageResponseTime = responseTimes.length > 0 
        ? responseTimes.reduce((sum, time) => sum + time, 0) / responseTimes.length 
        : 0;

      const errorRate = totalRequests > 0 ? (failedRequests / totalRequests) * 100 : 0;
      
      // Calculate uptime (percentage of successful health checks)
      const healthCheckLogs = filteredLogs.filter(log => log.event_type === 'health_check');
      const successfulHealthChecks = healthCheckLogs.filter(log => log.status === 'success').length;
      const uptime = healthCheckLogs.length > 0 
        ? (successfulHealthChecks / healthCheckLogs.length) * 100 
        : 100;

      // Calculate throughput (requests per minute)
      const timeRangeMinutes = this.getTimeRangeMinutes(timeRange);
      const throughput = timeRangeMinutes > 0 ? totalRequests / timeRangeMinutes : 0;

      const lastSyncLog = logs.find(log => log.event_type === 'sync' && log.status === 'success');
      const lastSync = lastSyncLog ? new Date(lastSyncLog.created_at) : null;

      return {
        integrationId,
        totalRequests,
        successfulRequests,
        failedRequests,
        averageResponseTime,
        uptime,
        lastSync,
        errorRate,
        throughput
      };
    } catch (error) {
      console.error('Error getting integration metrics:', error);
      throw error;
    }
  }

  async performHealthCheck(integrationId: string, endpoint: string, authHeaders: Record<string, string>): Promise<HealthCheck> {
    const startTime = Date.now();
    const checks = {
      connectivity: false,
      authentication: false,
      dataFlow: false
    };

    try {
      // Test connectivity
      const connectivityResponse = await fetch(endpoint, {
        method: 'HEAD',
        headers: authHeaders,
        signal: AbortSignal.timeout(10000)
      });
      
      checks.connectivity = connectivityResponse.ok;
      
      if (checks.connectivity) {
        // Test authentication
        const authResponse = await fetch(endpoint, {
          method: 'GET',
          headers: authHeaders,
          signal: AbortSignal.timeout(10000)
        });
        
        checks.authentication = authResponse.status !== 401 && authResponse.status !== 403;
        
        if (checks.authentication) {
          // Test data flow (simple GET request)
          try {
            await authResponse.json();
            checks.dataFlow = true;
          } catch {
            checks.dataFlow = false; // Data might not be JSON, but response was successful
          }
        }
      }

      const responseTime = Date.now() - startTime;
      const status = this.determineHealthStatus(checks);

      // Log health check
      await integrationLoggingService.logIntegrationEvent(
        integrationId,
        'health_check',
        { checks, responseTime },
        status === 'healthy' ? 'success' : 'warning',
        status !== 'healthy' ? `Health check status: ${status}` : undefined,
        responseTime
      );

      return {
        integrationId,
        status,
        lastCheck: new Date(),
        responseTime,
        checks
      };

    } catch (error: any) {
      const responseTime = Date.now() - startTime;
      
      // Log failed health check
      await integrationLoggingService.logIntegrationEvent(
        integrationId,
        'health_check',
        { checks, error: error.message },
        'error',
        error.message,
        responseTime
      );

      return {
        integrationId,
        status: 'down',
        lastCheck: new Date(),
        responseTime,
        errorMessage: error.message,
        checks
      };
    }
  }

  private determineHealthStatus(checks: { connectivity: boolean; authentication: boolean; dataFlow: boolean }): 'healthy' | 'degraded' | 'down' {
    if (checks.connectivity && checks.authentication && checks.dataFlow) {
      return 'healthy';
    } else if (checks.connectivity && checks.authentication) {
      return 'degraded';
    } else {
      return 'down';
    }
  }

  startHealthCheckMonitoring(integrationId: string, endpoint: string, authHeaders: Record<string, string>): void {
    // Stop existing monitoring if any
    this.stopHealthCheckMonitoring(integrationId);

    const intervalId = setInterval(async () => {
      try {
        const healthCheck = await this.performHealthCheck(integrationId, endpoint, authHeaders);
        
        // Check if we need to trigger alerts
        await this.checkAndTriggerAlerts(healthCheck);
      } catch (error) {
        console.error(`Health check monitoring error for integration ${integrationId}:`, error);
      }
    }, this.healthCheckInterval);

    this.activeHealthChecks.set(integrationId, intervalId);
  }

  stopHealthCheckMonitoring(integrationId: string): void {
    const intervalId = this.activeHealthChecks.get(integrationId);
    if (intervalId) {
      clearInterval(intervalId);
      this.activeHealthChecks.delete(integrationId);
    }
  }

  private async checkAndTriggerAlerts(healthCheck: HealthCheck): Promise<void> {
    // Check for connectivity issues
    if (!healthCheck.checks.connectivity) {
      await this.triggerAlert({
        id: `${healthCheck.integrationId}-connectivity-${Date.now()}`,
        integrationId: healthCheck.integrationId,
        alertType: 'connectivity',
        severity: 'critical',
        message: 'Integration connectivity failed',
        triggeredAt: new Date(),
        acknowledged: false
      });
    }

    // Check for authentication issues
    if (healthCheck.checks.connectivity && !healthCheck.checks.authentication) {
      await this.triggerAlert({
        id: `${healthCheck.integrationId}-auth-${Date.now()}`,
        integrationId: healthCheck.integrationId,
        alertType: 'authentication',
        severity: 'high',
        message: 'Integration authentication failed',
        triggeredAt: new Date(),
        acknowledged: false
      });
    }

    // Check for high response times
    if (healthCheck.responseTime > 10000) { // 10 seconds
      await this.triggerAlert({
        id: `${healthCheck.integrationId}-response-${Date.now()}`,
        integrationId: healthCheck.integrationId,
        alertType: 'response_time',
        severity: 'medium',
        message: `High response time: ${healthCheck.responseTime}ms`,
        triggeredAt: new Date(),
        acknowledged: false
      });
    }
  }

  private async triggerAlert(alert: IntegrationAlert): Promise<void> {
    // In a real implementation, this would send notifications
    console.warn('Integration Alert:', alert);
    
    // Log the alert
    await integrationLoggingService.logIntegrationEvent(
      alert.integrationId,
      'alert',
      alert,
      'warning',
      alert.message
    );
  }

  async getAlerts(integrationId?: string): Promise<IntegrationAlert[]> {
    try {
      const logs = integrationId 
        ? await integrationLoggingService.getIntegrationLogs(integrationId)
        : await integrationLoggingService.getIntegrationLogs();

      return logs
        .filter(log => log.event_type === 'alert')
        .map(log => log.event_data as IntegrationAlert)
        .sort((a, b) => new Date(b.triggeredAt).getTime() - new Date(a.triggeredAt).getTime());
    } catch (error) {
      console.error('Error getting alerts:', error);
      return [];
    }
  }

  private getTimeRangeCutoff(timeRange: '1h' | '24h' | '7d' | '30d'): Date {
    const now = new Date();
    switch (timeRange) {
      case '1h':
        return new Date(now.getTime() - 60 * 60 * 1000);
      case '24h':
        return new Date(now.getTime() - 24 * 60 * 60 * 1000);
      case '7d':
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      case '30d':
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      default:
        return new Date(now.getTime() - 24 * 60 * 60 * 1000);
    }
  }

  private getTimeRangeMinutes(timeRange: '1h' | '24h' | '7d' | '30d'): number {
    switch (timeRange) {
      case '1h': return 60;
      case '24h': return 24 * 60;
      case '7d': return 7 * 24 * 60;
      case '30d': return 30 * 24 * 60;
      default: return 24 * 60;
    }
  }
}

export const integrationMonitoringService = new IntegrationMonitoringService();