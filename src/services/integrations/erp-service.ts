
import { supabase } from "@/integrations/supabase/client";
import { getCurrentUserProfile } from "@/lib/supabase-utils";
import { integrationService } from "../integration-service";

export interface ERPSyncResult {
  module: string;
  recordsProcessed: number;
  recordsUpdated: number;
  recordsCreated: number;
  errors: string[];
}

class ERPService {
  async createERPIntegration(config: any): Promise<void> {
    try {
      const profile = await getCurrentUserProfile();
      if (!profile?.organization_id) throw new Error('No organization found');

      await integrationService.createIntegration({
        org_id: profile.organization_id,
        integration_name: `ERP - ${config.platform}`,
        integration_type: 'erp',
        provider: config.platform,
        configuration: config,
        webhook_url: null,
        is_active: true,
        last_sync_at: null,
        created_by: profile.id,
        created_by_name: profile.full_name
      });

      await integrationService.logIntegrationEvent(
        null,
        'integration_created',
        { platform: config.platform, type: 'erp' },
        'success'
      );
    } catch (error) {
      console.error('Error creating ERP integration:', error);
      throw error;
    }
  }

  async syncFinancialData(integrationId: string): Promise<ERPSyncResult> {
    try {
      const startTime = Date.now();
      
      // Simulate ERP financial data sync
      const result = await this.performFinancialDataSync(integrationId);
      
      const responseTime = Date.now() - startTime;
      
      await integrationService.logIntegrationEvent(
        integrationId,
        'financial_data_sync',
        result,
        result.errors.length > 0 ? 'warning' : 'success',
        result.errors.join('; ') || undefined,
        responseTime
      );

      return result;
    } catch (error) {
      await integrationService.logIntegrationEvent(
        integrationId,
        'financial_data_sync',
        { error: error instanceof Error ? error.message : 'Unknown error' },
        'error'
      );
      throw error;
    }
  }

  async syncHRData(integrationId: string): Promise<ERPSyncResult> {
    try {
      const startTime = Date.now();
      
      // Simulate ERP HR data sync
      const result = await this.performHRDataSync(integrationId);
      
      const responseTime = Date.now() - startTime;
      
      await integrationService.logIntegrationEvent(
        integrationId,
        'hr_data_sync',
        result,
        result.errors.length > 0 ? 'warning' : 'success',
        result.errors.join('; ') || undefined,
        responseTime
      );

      return result;
    } catch (error) {
      await integrationService.logIntegrationEvent(
        integrationId,
        'hr_data_sync',
        { error: error instanceof Error ? error.message : 'Unknown error' },
        'error'
      );
      throw error;
    }
  }

  private async performFinancialDataSync(integrationId: string): Promise<ERPSyncResult> {
    // Mock implementation
    return {
      module: 'financials',
      recordsProcessed: 150,
      recordsUpdated: 25,
      recordsCreated: 5,
      errors: []
    };
  }

  private async performHRDataSync(integrationId: string): Promise<ERPSyncResult> {
    // Mock implementation
    return {
      module: 'hr',
      recordsProcessed: 45,
      recordsUpdated: 8,
      recordsCreated: 2,
      errors: []
    };
  }

  async getERPPlatforms() {
    return [
      { value: 'sap', label: 'SAP', description: 'SAP ERP Central Component' },
      { value: 'oracle', label: 'Oracle ERP', description: 'Oracle Enterprise Resource Planning' },
      { value: 'dynamics', label: 'Microsoft Dynamics', description: 'Microsoft Dynamics 365' },
      { value: 'custom', label: 'Custom ERP', description: 'Custom or other ERP system' }
    ];
  }
}

export const erpService = new ERPService();
