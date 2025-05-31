
import { integrationLoggingService } from "./integration-logging-service";

class WebhookService {
  async testWebhook(webhookUrl: string, payload: any): Promise<boolean> {
    try {
      const startTime = Date.now();
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const responseTime = Date.now() - startTime;
      const success = response.ok;

      await integrationLoggingService.logIntegrationEvent(
        null,
        'webhook_test',
        { url: webhookUrl, payload, response_status: response.status },
        success ? 'success' : 'error',
        success ? undefined : `HTTP ${response.status}: ${response.statusText}`,
        responseTime
      );

      return success;
    } catch (error) {
      await integrationLoggingService.logIntegrationEvent(
        null,
        'webhook_test',
        { url: webhookUrl, payload },
        'error',
        error instanceof Error ? error.message : 'Unknown error'
      );
      return false;
    }
  }

  async testIntegration(id: string): Promise<boolean> {
    try {
      // This would typically make a test call to the external service
      // For now, we'll simulate a test and log the result
      await integrationLoggingService.logIntegrationEvent(id, 'test_connection', { test: true }, 'success');
      return true;
    } catch (error) {
      await integrationLoggingService.logIntegrationEvent(id, 'test_connection', { error: error }, 'error');
      return false;
    }
  }
}

export const webhookService = new WebhookService();
