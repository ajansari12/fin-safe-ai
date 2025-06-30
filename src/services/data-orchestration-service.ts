import { supabase } from "@/integrations/supabase/client";

export interface DataLineage {
  id: string;
  org_id: string;
  source_table: string;
  source_id: string;
  target_table: string;
  target_id: string;
  operation_type: 'create' | 'update' | 'delete' | 'sync';
  field_changes: Record<string, any>;
  transformation_rules: Record<string, any>;
  sync_status: 'pending' | 'success' | 'failed' | 'conflict';
  conflict_data: Record<string, any>;
  resolved_by?: string;
  resolved_at?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface DataQualityMetrics {
  id: string;
  org_id: string;
  table_name: string;
  record_id: string;
  quality_score: number;
  completeness_score: number;
  accuracy_score: number;
  consistency_score: number;
  validity_score: number;
  quality_issues: string[];
  last_validated_at: string;
  validation_rules: Record<string, any>[];
  created_at: string;
  updated_at: string;
}

export interface SyncEvent {
  id: string;
  org_id: string;
  event_type: string;
  source_module: string;
  target_modules: string[];
  entity_type: string;
  entity_id: string;
  event_data: Record<string, any>;
  sync_status: 'pending' | 'processing' | 'completed' | 'failed' | 'partial';
  retry_count: number;
  max_retries: number;
  error_details: Record<string, any>;
  processed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface DataValidationRule {
  id: string;
  org_id: string;
  rule_name: string;
  rule_type: 'format' | 'range' | 'dependency' | 'business_logic' | 'cross_module';
  target_tables: string[];
  target_fields: string[];
  validation_logic: Record<string, any>;
  error_message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  is_active: boolean;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

// Helper function to safely convert Json arrays to string arrays
const safeJsonArrayToStringArray = (jsonArray: any): string[] => {
  if (!Array.isArray(jsonArray)) return [];
  return jsonArray.map(item => String(item)).filter(item => item !== 'null' && item !== 'undefined');
};

// Helper function to safely convert Json arrays to Record arrays
const safeJsonArrayToRecordArray = (jsonArray: any): Record<string, any>[] => {
  if (!Array.isArray(jsonArray)) return [];
  return jsonArray.filter(item => item && typeof item === 'object').map(item => item as Record<string, any>);
};

class DataOrchestrationService {
  // Data Lineage Management
  async createDataLineage(lineage: Omit<DataLineage, 'id' | 'created_at' | 'updated_at'>): Promise<DataLineage> {
    try {
      const { data, error } = await supabase
        .from('data_lineage')
        .insert([lineage])
        .select()
        .single();

      if (error) {
        console.error('Error creating data lineage:', error);
        throw error;
      }

      return {
        ...data,
        field_changes: data.field_changes as Record<string, any>,
        transformation_rules: data.transformation_rules as Record<string, any>,
        conflict_data: data.conflict_data as Record<string, any>,
        operation_type: data.operation_type as DataLineage['operation_type'],
        sync_status: data.sync_status as DataLineage['sync_status']
      };
    } catch (error) {
      console.error('Error in createDataLineage:', error);
      throw error;
    }
  }

  async getDataLineage(orgId: string, filters?: { 
    source_table?: string; 
    target_table?: string; 
    sync_status?: string;
  }): Promise<DataLineage[]> {
    try {
      let query = supabase
        .from('data_lineage')
        .select('*')
        .eq('org_id', orgId)
        .order('created_at', { ascending: false });

      if (filters?.source_table) {
        query = query.eq('source_table', filters.source_table);
      }
      if (filters?.target_table) {
        query = query.eq('target_table', filters.target_table);
      }
      if (filters?.sync_status) {
        query = query.eq('sync_status', filters.sync_status);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching data lineage:', error);
        throw error;
      }

      return (data || []).map(item => ({
        ...item,
        field_changes: item.field_changes as Record<string, any>,
        transformation_rules: item.transformation_rules as Record<string, any>,
        conflict_data: item.conflict_data as Record<string, any>,
        operation_type: item.operation_type as DataLineage['operation_type'],
        sync_status: item.sync_status as DataLineage['sync_status']
      }));
    } catch (error) {
      console.error('Error in getDataLineage:', error);
      throw error;
    }
  }

  async resolveDataConflict(lineageId: string, resolvedBy: string, resolution: Record<string, any>): Promise<void> {
    try {
      const { error } = await supabase
        .from('data_lineage')
        .update({
          sync_status: 'success',
          resolved_by: resolvedBy,
          resolved_at: new Date().toISOString(),
          conflict_data: resolution
        })
        .eq('id', lineageId);

      if (error) {
        console.error('Error resolving data conflict:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error in resolveDataConflict:', error);
      throw error;
    }
  }

  // Data Quality Management
  async createDataQualityMetrics(metrics: Omit<DataQualityMetrics, 'id' | 'created_at' | 'updated_at'>): Promise<DataQualityMetrics> {
    try {
      const { data, error } = await supabase
        .from('data_quality_metrics')
        .insert([metrics])
        .select()
        .single();

      if (error) {
        console.error('Error creating data quality metrics:', error);
        throw error;
      }

      return {
        ...data,
        quality_issues: safeJsonArrayToStringArray(data.quality_issues),
        validation_rules: safeJsonArrayToRecordArray(data.validation_rules)
      };
    } catch (error) {
      console.error('Error in createDataQualityMetrics:', error);
      throw error;
    }
  }

  async getDataQualityMetrics(orgId: string, tableName?: string): Promise<DataQualityMetrics[]> {
    try {
      let query = supabase
        .from('data_quality_metrics')
        .select('*')
        .eq('org_id', orgId)
        .order('last_validated_at', { ascending: false });

      if (tableName) {
        query = query.eq('table_name', tableName);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching data quality metrics:', error);
        throw error;
      }

      return (data || []).map(item => ({
        ...item,
        quality_issues: safeJsonArrayToStringArray(item.quality_issues),
        validation_rules: safeJsonArrayToRecordArray(item.validation_rules)
      }));
    } catch (error) {
      console.error('Error in getDataQualityMetrics:', error);
      throw error;
    }
  }

  // Sync Events Management
  async createSyncEvent(event: Omit<SyncEvent, 'id' | 'created_at' | 'updated_at'>): Promise<SyncEvent> {
    try {
      const { data, error } = await supabase
        .from('sync_events')
        .insert([event])
        .select()
        .single();

      if (error) {
        console.error('Error creating sync event:', error);
        throw error;
      }

      return {
        ...data,
        event_data: data.event_data as Record<string, any>,
        error_details: data.error_details as Record<string, any>,
        sync_status: data.sync_status as SyncEvent['sync_status']
      };
    } catch (error) {
      console.error('Error in createSyncEvent:', error);
      throw error;
    }
  }

  async getSyncEvents(orgId: string, status?: string): Promise<SyncEvent[]> {
    try {
      let query = supabase
        .from('sync_events')
        .select('*')
        .eq('org_id', orgId)
        .order('created_at', { ascending: false });

      if (status) {
        query = query.eq('sync_status', status);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching sync events:', error);
        throw error;
      }

      return (data || []).map(item => ({
        ...item,
        event_data: item.event_data as Record<string, any>,
        error_details: item.error_details as Record<string, any>,
        sync_status: item.sync_status as SyncEvent['sync_status']
      }));
    } catch (error) {
      console.error('Error in getSyncEvents:', error);
      throw error;
    }
  }

  async updateSyncEventStatus(eventId: string, status: SyncEvent['sync_status'], errorDetails?: Record<string, any>): Promise<void> {
    try {
      const updates: any = {
        sync_status: status,
        updated_at: new Date().toISOString()
      };

      if (status === 'completed') {
        updates.processed_at = new Date().toISOString();
      }

      if (errorDetails) {
        updates.error_details = errorDetails;
      }

      const { error } = await supabase
        .from('sync_events')
        .update(updates)
        .eq('id', eventId);

      if (error) {
        console.error('Error updating sync event status:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error in updateSyncEventStatus:', error);
      throw error;
    }
  }

  // Data Validation Rules Management
  async createValidationRule(rule: Omit<DataValidationRule, 'id' | 'created_at' | 'updated_at'>): Promise<DataValidationRule> {
    try {
      const { data, error } = await supabase
        .from('data_validation_rules')
        .insert([rule])
        .select()
        .single();

      if (error) {
        console.error('Error creating validation rule:', error);
        throw error;
      }

      return {
        ...data,
        validation_logic: data.validation_logic as Record<string, any>,
        rule_type: data.rule_type as DataValidationRule['rule_type'],
        severity: data.severity as DataValidationRule['severity']
      };
    } catch (error) {
      console.error('Error in createValidationRule:', error);
      throw error;
    }
  }

  async getValidationRules(orgId: string, isActive?: boolean): Promise<DataValidationRule[]> {
    try {
      let query = supabase
        .from('data_validation_rules')
        .select('*')
        .eq('org_id', orgId)
        .order('created_at', { ascending: false });

      if (isActive !== undefined) {
        query = query.eq('is_active', isActive);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching validation rules:', error);
        throw error;
      }

      return (data || []).map(item => ({
        ...item,
        validation_logic: item.validation_logic as Record<string, any>,
        rule_type: item.rule_type as DataValidationRule['rule_type'],
        severity: item.severity as DataValidationRule['severity']
      }));
    } catch (error) {
      console.error('Error in getValidationRules:', error);
      throw error;
    }
  }

  async validateData(orgId: string, tableName: string, recordId: string, data: Record<string, any>): Promise<{
    isValid: boolean;
    violations: Array<{ rule: string; message: string; severity: string }>;
  }> {
    try {
      const rules = await this.getValidationRules(orgId, true);
      const applicableRules = rules.filter(rule => 
        rule.target_tables.includes(tableName) || rule.target_tables.includes('*')
      );

      const violations: Array<{ rule: string; message: string; severity: string }> = [];

      for (const rule of applicableRules) {
        const isValid = await this.executeValidationRule(rule, data);
        if (!isValid) {
          violations.push({
            rule: rule.rule_name,
            message: rule.error_message,
            severity: rule.severity
          });
        }
      }

      return {
        isValid: violations.length === 0,
        violations
      };
    } catch (error) {
      console.error('Error in validateData:', error);
      throw error;
    }
  }

  private async executeValidationRule(rule: DataValidationRule, data: Record<string, any>): Promise<boolean> {
    // Simple validation logic - in a real implementation, this would be more sophisticated
    try {
      const { validation_logic } = rule;
      
      // Handle different rule types
      switch (rule.rule_type) {
        case 'format':
          return this.validateFormat(data, validation_logic);
        case 'range':
          return this.validateRange(data, validation_logic);
        case 'dependency':
          return this.validateDependency(data, validation_logic);
        case 'business_logic':
          return this.validateBusinessLogic(data, validation_logic);
        case 'cross_module':
          return this.validateCrossModule(data, validation_logic);
        default:
          return true;
      }
    } catch (error) {
      console.error('Error executing validation rule:', error);
      return false;
    }
  }

  private validateFormat(data: Record<string, any>, logic: Record<string, any>): boolean {
    for (const [field, pattern] of Object.entries(logic)) {
      if (data[field] && typeof pattern === 'string') {
        const regex = new RegExp(pattern);
        if (!regex.test(data[field])) {
          return false;
        }
      }
    }
    return true;
  }

  private validateRange(data: Record<string, any>, logic: Record<string, any>): boolean {
    for (const [field, range] of Object.entries(logic)) {
      if (data[field] !== undefined && typeof range === 'object') {
        const value = parseFloat(data[field]);
        if (isNaN(value)) return false;
        if (range.min !== undefined && value < range.min) return false;
        if (range.max !== undefined && value > range.max) return false;
      }
    }
    return true;
  }

  private validateDependency(data: Record<string, any>, logic: Record<string, any>): boolean {
    // Simple dependency validation - check if required fields are present when condition is met
    for (const [condition, requirements] of Object.entries(logic)) {
      if (data[condition] && Array.isArray(requirements)) {
        for (const required of requirements) {
          if (!data[required]) {
            return false;
          }
        }
      }
    }
    return true;
  }

  private validateBusinessLogic(data: Record<string, any>, logic: Record<string, any>): boolean {
    // Implement custom business logic validation
    // This is a placeholder for more complex business rules
    return true;
  }

  private validateCrossModule(data: Record<string, any>, logic: Record<string, any>): boolean {
    // Implement cross-module validation
    // This would typically involve checking data consistency across different modules
    return true;
  }

  // Real-time Data Sync
  async triggerCrossModuleSync(orgId: string, entityType: string, entityId: string, sourceModule: string, targetModules: string[], eventData: Record<string, any>): Promise<void> {
    try {
      await this.createSyncEvent({
        org_id: orgId,
        event_type: 'data_change',
        source_module: sourceModule,
        target_modules: targetModules,
        entity_type: entityType,
        entity_id: entityId,
        event_data: eventData,
        sync_status: 'pending',
        retry_count: 0,
        max_retries: 3,
        error_details: {}
      });

      // In a real implementation, this would trigger background processing
      console.log('Cross-module sync triggered for:', { entityType, entityId, sourceModule, targetModules });
    } catch (error) {
      console.error('Error triggering cross-module sync:', error);
      throw error;
    }
  }
}

export const dataOrchestrationService = new DataOrchestrationService();
