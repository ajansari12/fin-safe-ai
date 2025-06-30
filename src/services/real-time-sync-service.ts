
import { supabase } from "@/integrations/supabase/client";
import { dataOrchestrationService } from "./data-orchestration-service";

interface SyncableEntity {
  id: string;
  table_name: string;
  org_id: string;
  data: Record<string, any>;
  operation: 'create' | 'update' | 'delete';
  source_module: string;
}

class RealTimeSyncService {
  private syncChannels: Map<string, any> = new Map();
  private isInitialized = false;

  async initialize(orgId: string) {
    if (this.isInitialized) return;

    try {
      // Set up real-time subscriptions for key tables
      const tables = [
        'incident_logs',
        'governance_policies',
        'controls',
        'kri_definitions',
        'business_functions',
        'third_party_profiles'
      ];

      for (const table of tables) {
        await this.setupTableSync(table, orgId);
      }

      this.isInitialized = true;
      console.log('Real-time sync service initialized for org:', orgId);
    } catch (error) {
      console.error('Error initializing real-time sync service:', error);
    }
  }

  private async setupTableSync(tableName: string, orgId: string) {
    try {
      const channel = supabase
        .channel(`sync-${tableName}-${orgId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: tableName,
            filter: `org_id=eq.${orgId}`
          },
          (payload) => this.handleTableChange(tableName, payload, orgId)
        )
        .subscribe();

      this.syncChannels.set(`${tableName}-${orgId}`, channel);
    } catch (error) {
      console.error(`Error setting up sync for table ${tableName}:`, error);
    }
  }

  private async handleTableChange(tableName: string, payload: any, orgId: string) {
    try {
      const { eventType, new: newRecord, old: oldRecord } = payload;
      
      console.log(`Table change detected in ${tableName}:`, eventType, newRecord);

      // Determine which modules need to be notified
      const targetModules = this.getTargetModules(tableName);
      const sourceModule = this.getSourceModule(tableName);

      if (targetModules.length === 0) return;

      // Create sync event for cross-module notification
      await dataOrchestrationService.createSyncEvent({
        org_id: orgId,
        event_type: `${tableName}_${eventType}`,
        source_module: sourceModule,
        target_modules: targetModules,
        entity_type: tableName,
        entity_id: newRecord?.id || oldRecord?.id || '',
        event_data: {
          operation: eventType,
          new_data: newRecord,
          old_data: oldRecord,
          timestamp: new Date().toISOString()
        },
        sync_status: 'pending',
        retry_count: 0,
        max_retries: 3,
        error_details: {}
      });

      // Trigger data quality validation for new/updated records
      if (eventType === 'INSERT' || eventType === 'UPDATE') {
        await this.validateDataQuality(tableName, newRecord, orgId);
      }

      // Create data lineage record
      if (newRecord) {
        await this.createDataLineageRecord(tableName, newRecord, eventType, orgId);
      }

    } catch (error) {
      console.error('Error handling table change:', error);
    }
  }

  private getTargetModules(tableName: string): string[] {
    // Define which modules should be notified for each table change
    const moduleMapping: Record<string, string[]> = {
      'incident_logs': ['governance', 'controls', 'risk_appetite', 'business_continuity'],
      'governance_policies': ['incident_management', 'controls', 'third_party', 'compliance'],
      'controls': ['incident_management', 'governance', 'risk_appetite'],
      'kri_definitions': ['controls', 'risk_appetite', 'governance'],
      'business_functions': ['incident_management', 'dependencies', 'business_continuity'],
      'third_party_profiles': ['governance', 'controls', 'incident_management']
    };

    return moduleMapping[tableName] || [];
  }

  private getSourceModule(tableName: string): string {
    // Map table names to their primary module
    const sourceMapping: Record<string, string> = {
      'incident_logs': 'incident_management',
      'governance_policies': 'governance',
      'controls': 'controls_kri',
      'kri_definitions': 'controls_kri',
      'business_functions': 'business_functions',
      'third_party_profiles': 'third_party'
    };

    return sourceMapping[tableName] || 'unknown';
  }

  private async validateDataQuality(tableName: string, record: any, orgId: string) {
    try {
      const validation = await dataOrchestrationService.validateData(orgId, tableName, record.id, record);
      
      // Create quality metrics record
      await dataOrchestrationService.createDataQualityMetrics({
        org_id: orgId,
        table_name: tableName,
        record_id: record.id,
        quality_score: validation.isValid ? 100 : Math.max(0, 100 - (validation.violations.length * 20)),
        completeness_score: this.calculateCompletenessScore(record),
        accuracy_score: validation.isValid ? 100 : 80,
        consistency_score: 95, // Would be calculated based on cross-module consistency
        validity_score: validation.isValid ? 100 : 75,
        quality_issues: validation.violations.map(v => v.message),
        last_validated_at: new Date().toISOString(),
        validation_rules: validation.violations.map(v => ({ rule: v.rule, severity: v.severity }))
      });

    } catch (error) {
      console.error('Error validating data quality:', error);
    }
  }

  private calculateCompletenessScore(record: any): number {
    const fields = Object.keys(record);
    const completedFields = fields.filter(field => 
      record[field] !== null && 
      record[field] !== undefined && 
      record[field] !== ''
    );
    
    return Math.round((completedFields.length / fields.length) * 100);
  }

  private async createDataLineageRecord(tableName: string, record: any, operation: string, orgId: string) {
    try {
      // Create lineage record to track data changes
      await dataOrchestrationService.createDataLineage({
        org_id: orgId,
        source_table: tableName,
        source_id: record.id,
        target_table: tableName, // For now, same table, but could track transformations
        target_id: record.id,
        operation_type: operation.toLowerCase() as 'create' | 'update' | 'delete',
        field_changes: this.extractFieldChanges(record),
        transformation_rules: {},
        sync_status: 'success',
        conflict_data: {},
        created_by: record.created_by || record.updated_by
      });
    } catch (error) {
      console.error('Error creating data lineage record:', error);
    }
  }

  private extractFieldChanges(record: any): Record<string, any> {
    // Extract meaningful field changes - this is a simplified version
    const changes: Record<string, any> = {};
    
    Object.keys(record).forEach(key => {
      if (!['id', 'created_at', 'updated_at'].includes(key)) {
        changes[key] = record[key];
      }
    });

    return changes;
  }

  async triggerManualSync(orgId: string, entityType: string, entityId: string, targetModules: string[]) {
    try {
      await dataOrchestrationService.triggerCrossModuleSync(
        orgId,
        entityType,
        entityId,
        'manual',
        targetModules,
        { triggered_manually: true, timestamp: new Date().toISOString() }
      );

      console.log('Manual sync triggered for:', { entityType, entityId, targetModules });
    } catch (error) {
      console.error('Error triggering manual sync:', error);
      throw error;
    }
  }

  cleanup() {
    // Clean up all subscriptions
    this.syncChannels.forEach((channel) => {
      supabase.removeChannel(channel);
    });
    this.syncChannels.clear();
    this.isInitialized = false;
  }

  // Get sync status for monitoring
  async getSyncStatus(orgId: string) {
    try {
      const events = await dataOrchestrationService.getSyncEvents(orgId);
      const pendingEvents = events.filter(e => e.sync_status === 'pending');
      const failedEvents = events.filter(e => e.sync_status === 'failed');
      
      return {
        total_events: events.length,
        pending_events: pendingEvents.length,
        failed_events: failedEvents.length,
        success_rate: events.length > 0 ? 
          Math.round(((events.length - failedEvents.length) / events.length) * 100) : 100
      };
    } catch (error) {
      console.error('Error getting sync status:', error);
      return {
        total_events: 0,
        pending_events: 0,
        failed_events: 0,
        success_rate: 0
      };
    }
  }
}

export const realTimeSyncService = new RealTimeSyncService();
