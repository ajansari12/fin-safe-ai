
import { supabase } from '@/integrations/supabase/client';
import { reportingService, ReportInstance, ReportTemplate } from './reporting-service';

export interface AutomatedReportingRule {
  id: string;
  org_id: string;
  rule_name: string;
  report_template_id: string;
  trigger_type: 'scheduled' | 'event_driven' | 'data_threshold' | 'manual';
  trigger_config: any;
  data_sources: string[];
  validation_rules: ValidationRule[];
  approval_workflow_id?: string;
  auto_submit: boolean;
  notification_config: NotificationConfig;
  is_active: boolean;
  last_executed?: string;
  next_execution?: string;
  execution_history: ExecutionRecord[];
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface ValidationRule {
  rule_id: string;
  rule_name: string;
  rule_type: 'completeness' | 'accuracy' | 'consistency' | 'format' | 'business_logic';
  field_path: string;
  validation_logic: string;
  severity: 'error' | 'warning' | 'info';
  error_message: string;
  remediation_steps: string[];
}

export interface NotificationConfig {
  email_recipients: string[];
  notification_events: string[];
  template_overrides: any;
  escalation_rules: EscalationRule[];
}

export interface EscalationRule {
  level: number;
  trigger_condition: string;
  recipients: string[];
  delay_hours: number;
}

export interface ExecutionRecord {
  execution_id: string;
  started_at: string;
  completed_at?: string;
  status: 'running' | 'completed' | 'failed' | 'cancelled';
  report_instance_id?: string;
  error_details?: string;
  performance_metrics: any;
}

export interface DataAggregationResult {
  aggregation_id: string;
  data_source: string;
  records_processed: number;
  data_quality_score: number;
  aggregated_data: any;
  validation_results: ValidationResult[];
  execution_time_ms: number;
}

export interface ValidationResult {
  rule_id: string;
  field_path: string;
  status: 'passed' | 'failed' | 'warning';
  message: string;
  actual_value?: any;
  expected_value?: any;
  remediation_suggestion?: string;
}

class AutomatedReportingService {
  // Automated Rule Management
  async createAutomatedRule(rule: Omit<AutomatedReportingRule, 'id' | 'created_at' | 'updated_at'>): Promise<AutomatedReportingRule> {
    const { data, error } = await supabase
      .from('automated_reporting_rules')
      .insert([rule])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async getAutomatedRules(orgId: string): Promise<AutomatedReportingRule[]> {
    const { data, error } = await supabase
      .from('automated_reporting_rules')
      .select('*')
      .eq('org_id', orgId)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  // Data Aggregation Engine
  async aggregateReportData(
    templateId: string,
    reportingPeriod: { start: string; end: string }
  ): Promise<DataAggregationResult[]> {
    const template = await reportingService.getReportTemplate(templateId);
    const results: DataAggregationResult[] = [];

    for (const dataSource of template.data_requirements) {
      const aggregationResult = await this.aggregateDataSource(
        dataSource,
        reportingPeriod
      );
      results.push(aggregationResult);
    }

    return results;
  }

  private async aggregateDataSource(
    dataSource: any,
    period: { start: string; end: string }
  ): Promise<DataAggregationResult> {
    const startTime = Date.now();
    
    // Aggregate data based on source type
    let aggregatedData: any = {};
    let recordsProcessed = 0;

    switch (dataSource.source_type) {
      case 'kri_data':
        aggregatedData = await this.aggregateKRIData(dataSource, period);
        break;
      case 'incident_data':
        aggregatedData = await this.aggregateIncidentData(dataSource, period);
        break;
      case 'control_data':
        aggregatedData = await this.aggregateControlData(dataSource, period);
        break;
      case 'vendor_data':
        aggregatedData = await this.aggregateVendorData(dataSource, period);
        break;
      default:
        throw new Error(`Unsupported data source type: ${dataSource.source_type}`);
    }

    const executionTime = Date.now() - startTime;

    // Validate aggregated data
    const validationResults = await this.validateAggregatedData(
      aggregatedData,
      dataSource.validation_rules || []
    );

    // Calculate data quality score
    const dataQualityScore = this.calculateDataQualityScore(validationResults);

    return {
      aggregation_id: crypto.randomUUID(),
      data_source: dataSource.source_name,
      records_processed: recordsProcessed,
      data_quality_score: dataQualityScore,
      aggregated_data: aggregatedData,
      validation_results: validationResults,
      execution_time_ms: executionTime
    };
  }

  private async aggregateKRIData(dataSource: any, period: { start: string; end: string }): Promise<any> {
    const { data, error } = await supabase
      .from('kri_logs')
      .select(`
        *,
        kri_definitions (
          kri_name,
          category,
          unit_of_measure
        )
      `)
      .gte('measurement_date', period.start)
      .lte('measurement_date', period.end);

    if (error) throw error;

    // Group and aggregate KRI data
    const aggregated = data?.reduce((acc: any, record: any) => {
      const key = record.kri_definitions?.kri_name || 'unknown';
      if (!acc[key]) {
        acc[key] = {
          kri_name: key,
          category: record.kri_definitions?.category,
          measurements: [],
          avg_value: 0,
          max_value: 0,
          min_value: Infinity,
          breach_count: 0
        };
      }
      
      acc[key].measurements.push({
        date: record.measurement_date,
        value: record.actual_value,
        target: record.target_value,
        threshold: record.threshold_value
      });

      acc[key].avg_value = acc[key].measurements.reduce((sum: number, m: any) => sum + m.value, 0) / acc[key].measurements.length;
      acc[key].max_value = Math.max(acc[key].max_value, record.actual_value);
      acc[key].min_value = Math.min(acc[key].min_value, record.actual_value);
      
      if (record.breach_status === 'breach') {
        acc[key].breach_count++;
      }

      return acc;
    }, {});

    return aggregated || {};
  }

  private async aggregateIncidentData(dataSource: any, period: { start: string; end: string }): Promise<any> {
    const { data, error } = await supabase
      .from('incident_logs')
      .select('*')
      .gte('incident_date', period.start)
      .lte('incident_date', period.end);

    if (error) throw error;

    // Aggregate incident data by category and severity
    const aggregated = data?.reduce((acc: any, incident: any) => {
      const category = incident.category || 'uncategorized';
      const severity = incident.severity || 'unknown';

      if (!acc[category]) {
        acc[category] = {
          total_incidents: 0,
          by_severity: {},
          avg_resolution_time: 0,
          financial_impact: 0
        };
      }

      if (!acc[category].by_severity[severity]) {
        acc[category].by_severity[severity] = 0;
      }

      acc[category].total_incidents++;
      acc[category].by_severity[severity]++;
      acc[category].financial_impact += incident.financial_impact || 0;

      return acc;
    }, {});

    return aggregated || {};
  }

  private async aggregateControlData(dataSource: any, period: { start: string; end: string }): Promise<any> {
    const { data, error } = await supabase
      .from('controls')
      .select(`
        *,
        control_tests (
          test_date,
          test_result,
          effectiveness_rating
        )
      `)
      .gte('created_at', period.start)
      .lte('created_at', period.end);

    if (error) throw error;

    // Aggregate control effectiveness data
    const aggregated = data?.reduce((acc: any, control: any) => {
      const category = control.risk_category || 'uncategorized';
      
      if (!acc[category]) {
        acc[category] = {
          total_controls: 0,
          effective_controls: 0,
          average_effectiveness: 0,
          testing_coverage: 0
        };
      }

      acc[category].total_controls++;
      
      if (control.effectiveness_score >= 80) {
        acc[category].effective_controls++;
      }

      if (control.control_tests && control.control_tests.length > 0) {
        acc[category].testing_coverage++;
      }

      return acc;
    }, {});

    return aggregated || {};
  }

  private async aggregateVendorData(dataSource: any, period: { start: string; end: string }): Promise<any> {
    const { data, error } = await supabase
      .from('third_party_profiles')
      .select('*')
      .gte('created_at', period.start)
      .lte('created_at', period.end);

    if (error) throw error;

    // Aggregate vendor risk data
    const aggregated = data?.reduce((acc: any, vendor: any) => {
      const riskRating = vendor.risk_rating || 'unknown';
      
      if (!acc[riskRating]) {
        acc[riskRating] = {
          vendor_count: 0,
          total_spend: 0,
          critical_vendors: 0
        };
      }

      acc[riskRating].vendor_count++;
      acc[riskRating].total_spend += vendor.annual_spend || 0;
      
      if (vendor.criticality === 'critical') {
        acc[riskRating].critical_vendors++;
      }

      return acc;
    }, {});

    return aggregated || {};
  }

  // Validation Engine
  async validateAggregatedData(data: any, rules: ValidationRule[]): Promise<ValidationResult[]> {
    const results: ValidationResult[] = [];

    for (const rule of rules) {
      const result = await this.applyValidationRule(data, rule);
      results.push(result);
    }

    return results;
  }

  private async applyValidationRule(data: any, rule: ValidationRule): Promise<ValidationResult> {
    try {
      // Get the value at the specified field path
      const actualValue = this.getValueAtPath(data, rule.field_path);
      
      // Apply validation logic based on rule type
      let isValid = false;
      let message = '';

      switch (rule.rule_type) {
        case 'completeness':
          isValid = actualValue !== null && actualValue !== undefined && actualValue !== '';
          message = isValid ? 'Field is complete' : `Field ${rule.field_path} is missing or empty`;
          break;
          
        case 'accuracy':
          // Custom accuracy validation logic
          isValid = this.validateAccuracy(actualValue, rule.validation_logic);
          message = isValid ? 'Value is accurate' : `Value ${actualValue} fails accuracy check`;
          break;
          
        case 'consistency':
          isValid = this.validateConsistency(data, rule.validation_logic);
          message = isValid ? 'Data is consistent' : 'Data consistency check failed';
          break;
          
        default:
          isValid = true;
          message = 'Validation rule type not implemented';
      }

      return {
        rule_id: rule.rule_id,
        field_path: rule.field_path,
        status: isValid ? 'passed' : (rule.severity === 'error' ? 'failed' : 'warning'),
        message,
        actual_value: actualValue,
        remediation_suggestion: isValid ? undefined : rule.remediation_steps.join('; ')
      };
    } catch (error) {
      return {
        rule_id: rule.rule_id,
        field_path: rule.field_path,
        status: 'failed',
        message: `Validation error: ${error.message}`,
        actual_value: undefined,
        remediation_suggestion: 'Check validation rule configuration'
      };
    }
  }

  private getValueAtPath(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  private validateAccuracy(value: any, logic: string): boolean {
    try {
      // Simple validation logic evaluation
      // This could be enhanced with a proper expression evaluator
      return eval(logic.replace('value', JSON.stringify(value)));
    } catch {
      return false;
    }
  }

  private validateConsistency(data: any, logic: string): boolean {
    try {
      // Implement consistency validation logic
      return eval(logic.replace(/data\./g, 'data.'));
    } catch {
      return false;
    }
  }

  private calculateDataQualityScore(validationResults: ValidationResult[]): number {
    if (validationResults.length === 0) return 100;
    
    const passedCount = validationResults.filter(r => r.status === 'passed').length;
    return Math.round((passedCount / validationResults.length) * 100);
  }

  // Report Generation Engine
  async generateAutomatedReport(ruleId: string): Promise<ReportInstance> {
    const rule = await this.getAutomatedRule(ruleId);
    const template = await reportingService.getReportTemplate(rule.report_template_id);
    
    // Determine reporting period
    const reportingPeriod = this.calculateReportingPeriod(rule.trigger_config);
    
    // Aggregate data
    const aggregationResults = await this.aggregateReportData(
      rule.report_template_id,
      reportingPeriod
    );
    
    // Validate aggregated data
    const allValidationResults = aggregationResults.flatMap(r => r.validation_results);
    const hasErrors = allValidationResults.some(v => v.status === 'failed');
    
    // Create report instance
    const reportInstance = await reportingService.createReportInstance({
      org_id: rule.org_id,
      template_id: rule.report_template_id,
      instance_name: `${template.template_name} - ${new Date().toLocaleDateString()}`,
      reporting_period_start: reportingPeriod.start,
      reporting_period_end: reportingPeriod.end,
      status: hasErrors ? 'review' : 'generated',
      report_data: {
        aggregation_results: aggregationResults,
        validation_summary: {
          total_rules: allValidationResults.length,
          passed: allValidationResults.filter(v => v.status === 'passed').length,
          failed: allValidationResults.filter(v => v.status === 'failed').length,
          warnings: allValidationResults.filter(v => v.status === 'warning').length
        }
      },
      validation_results: {
        overall_status: hasErrors ? 'failed' : 'passed',
        validation_details: allValidationResults
      }
    });

    // Update rule execution history
    await this.updateRuleExecution(ruleId, {
      execution_id: crypto.randomUUID(),
      started_at: new Date().toISOString(),
      completed_at: new Date().toISOString(),
      status: 'completed',
      report_instance_id: reportInstance.id,
      performance_metrics: {
        total_execution_time: aggregationResults.reduce((sum, r) => sum + r.execution_time_ms, 0),
        data_quality_average: aggregationResults.reduce((sum, r) => sum + r.data_quality_score, 0) / aggregationResults.length
      }
    });

    return reportInstance;
  }

  private async getAutomatedRule(ruleId: string): Promise<AutomatedReportingRule> {
    const { data, error } = await supabase
      .from('automated_reporting_rules')
      .select('*')
      .eq('id', ruleId)
      .single();

    if (error) throw error;
    return data;
  }

  private calculateReportingPeriod(triggerConfig: any): { start: string; end: string } {
    const now = new Date();
    const end = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    
    // Default to monthly reporting period
    const start = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();
    
    return { start, end };
  }

  private async updateRuleExecution(ruleId: string, execution: ExecutionRecord): Promise<void> {
    const { error } = await supabase
      .from('automated_reporting_rules')
      .update({
        last_executed: execution.completed_at,
        execution_history: [execution] // In a real implementation, this would append to existing history
      })
      .eq('id', ruleId);

    if (error) throw error;
  }

  // Scheduling and Execution
  async executeScheduledReports(): Promise<void> {
    const rules = await this.getScheduledRules();
    
    for (const rule of rules) {
      try {
        await this.generateAutomatedReport(rule.id);
        console.log(`Successfully executed report for rule: ${rule.rule_name}`);
      } catch (error) {
        console.error(`Failed to execute report for rule ${rule.rule_name}:`, error);
        await this.logExecutionError(rule.id, error);
      }
    }
  }

  private async getScheduledRules(): Promise<AutomatedReportingRule[]> {
    const now = new Date().toISOString();
    
    const { data, error } = await supabase
      .from('automated_reporting_rules')
      .select('*')
      .eq('is_active', true)
      .lte('next_execution', now);

    if (error) throw error;
    return data || [];
  }

  private async logExecutionError(ruleId: string, error: any): Promise<void> {
    const execution: ExecutionRecord = {
      execution_id: crypto.randomUUID(),
      started_at: new Date().toISOString(),
      completed_at: new Date().toISOString(),
      status: 'failed',
      error_details: error.message || 'Unknown error',
      performance_metrics: {}
    };

    await this.updateRuleExecution(ruleId, execution);
  }
}

export const automatedReportingService = new AutomatedReportingService();
