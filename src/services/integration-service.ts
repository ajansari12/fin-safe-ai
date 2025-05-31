
// Main integration service that exports all functionality
import { integrationCoreService } from "./integrations/integration-core-service";
import { apiKeyService } from "./integrations/api-key-service";
import { integrationLoggingService } from "./integrations/integration-logging-service";
import { webhookService } from "./integrations/webhook-service";

// Re-export types
export type { Integration } from "./integrations/integration-core-service";
export type { ApiKey } from "./integrations/api-key-service";
export type { IntegrationLog } from "./integrations/integration-logging-service";

// Main integration service that combines all functionality
class IntegrationService {
  // Integration Management
  async getIntegrations() {
    return integrationCoreService.getIntegrations();
  }

  async createIntegration(integration: Parameters<typeof integrationCoreService.createIntegration>[0]) {
    return integrationCoreService.createIntegration(integration);
  }

  async updateIntegration(id: string, updates: Parameters<typeof integrationCoreService.updateIntegration>[1]) {
    return integrationCoreService.updateIntegration(id, updates);
  }

  async deleteIntegration(id: string) {
    return integrationCoreService.deleteIntegration(id);
  }

  // API Key Management
  async getApiKeys() {
    return apiKeyService.getApiKeys();
  }

  async generateApiKey(name: string, type: string, description?: string) {
    return apiKeyService.generateApiKey(name, type, description);
  }

  async deactivateApiKey(id: string) {
    return apiKeyService.deactivateApiKey(id);
  }

  async deleteApiKey(id: string) {
    return apiKeyService.deleteApiKey(id);
  }

  // Integration Logs
  async getIntegrationLogs(integrationId?: string) {
    return integrationLoggingService.getIntegrationLogs(integrationId);
  }

  async logIntegrationEvent(
    integrationId: string | null,
    eventType: string,
    eventData: any,
    status: 'success' | 'error' | 'warning' = 'success',
    errorMessage?: string,
    responseTimeMs?: number
  ) {
    return integrationLoggingService.logIntegrationEvent(
      integrationId,
      eventType,
      eventData,
      status,
      errorMessage,
      responseTimeMs
    );
  }

  // Webhook utilities
  async testWebhook(webhookUrl: string, payload: any) {
    return webhookService.testWebhook(webhookUrl, payload);
  }

  async testIntegration(id: string) {
    return webhookService.testIntegration(id);
  }

  // Configuration getters
  getIntegrationTypes() {
    return integrationCoreService.getIntegrationTypes();
  }

  getApiKeyTypes() {
    return apiKeyService.getApiKeyTypes();
  }
}

export const integrationService = new IntegrationService();
