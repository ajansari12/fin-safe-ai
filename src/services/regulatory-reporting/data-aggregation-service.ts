import { supabase } from '@/integrations/supabase/client';

export interface DataSource {
  name: string;
  table: string;
  fields: string[];
  conditions?: Record<string, any>;
}

export interface AggregationRule {
  source: string;
  fields: string[];
  aggregationType: 'sum' | 'count' | 'average' | 'max' | 'min' | 'list';
  groupBy?: string[];
  filters?: Record<string, any>;
}

export interface DataAggregationResult {
  source: string;
  data: any[];
  metadata: {
    recordCount: number;
    lastUpdated: string;
    dataQuality: 'high' | 'medium' | 'low';
    completeness: number;
  };
}

class DataAggregationService {
  private dataSources: Record<string, DataSource> = {
    business_functions: {
      name: 'Business Functions',
      table: 'business_functions',
      fields: ['id', 'function_name', 'criticality', 'rto_hours', 'rpo_hours', 'status', 'dependencies'],
    },
    continuity_plans: {
      name: 'Continuity Plans',
      table: 'continuity_plans',
      fields: ['id', 'plan_name', 'business_function_id', 'status', 'last_test_date', 'next_test_date'],
    },
    scenario_tests: {
      name: 'Scenario Tests',
      table: 'scenario_tests',
      fields: ['id', 'title', 'status', 'overall_score', 'severity_level', 'created_at'],
    },
    incident_logs: {
      name: 'Incident Logs',
      table: 'incident_logs',
      fields: ['id', 'title', 'severity', 'status', 'incident_type', 'impact_assessment', 'created_at'],
    },
    controls: {
      name: 'Controls',
      table: 'controls',
      fields: ['id', 'control_name', 'control_type', 'status', 'effectiveness_score', 'last_test_date'],
    },
    kri_definitions: {
      name: 'KRI Definitions',
      table: 'kri_definitions',
      fields: ['id', 'kri_name', 'category', 'threshold_value', 'current_value', 'status'],
    },
    risk_assessments: {
      name: 'Risk Assessments',
      table: 'risk_assessments',
      fields: ['id', 'assessment_name', 'risk_category', 'inherent_risk', 'residual_risk', 'status'],
    },
    third_party_profiles: {
      name: 'Third Party Profiles',
      table: 'third_party_profiles',
      fields: ['id', 'vendor_name', 'risk_rating', 'criticality', 'status'],
    },
  };

  async aggregateDataForReport(templateId: string, reportingPeriodStart: string, reportingPeriodEnd: string): Promise<Record<string, DataAggregationResult>> {
    try {
      // Get template data requirements
      const template = await this.getTemplate(templateId);
      const dataRequirements = template.data_requirements || [];

      const aggregationResults: Record<string, DataAggregationResult> = {};

      // Process each data requirement
      for (const requirement of dataRequirements) {
        const sourceConfig = this.dataSources[requirement.source];
        if (!sourceConfig) {
          console.warn(`Unknown data source: ${requirement.source}`);
          continue;
        }

        const result = await this.aggregateFromSource(
          sourceConfig,
          requirement.fields,
          reportingPeriodStart,
          reportingPeriodEnd
        );

        aggregationResults[requirement.source] = result;
      }

      return aggregationResults;
    } catch (error) {
      console.error('Error aggregating data for report:', error);
      throw error;
    }
  }

  private async aggregateFromSource(
    sourceConfig: DataSource,
    requestedFields: string[],
    periodStart: string,
    periodEnd: string
  ): Promise<DataAggregationResult> {
    try {
      // Build the query
      const fieldsToSelect = requestedFields.length > 0 
        ? requestedFields.filter(field => sourceConfig.fields.includes(field))
        : sourceConfig.fields;

      let query = supabase
        .from(sourceConfig.table)
        .select(fieldsToSelect.join(', '));

      // Add date filtering if the table has created_at
      if (sourceConfig.fields.includes('created_at')) {
        query = query
          .gte('created_at', periodStart)
          .lt('created_at', periodEnd);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Calculate data quality metrics
      const recordCount = data?.length || 0;
      const completeness = this.calculateCompleteness(data || [], fieldsToSelect);
      const dataQuality = this.assessDataQuality(completeness, recordCount);

      return {
        source: sourceConfig.name,
        data: data || [],
        metadata: {
          recordCount,
          lastUpdated: new Date().toISOString(),
          dataQuality,
          completeness,
        },
      };
    } catch (error) {
      console.error(`Error aggregating data from ${sourceConfig.name}:`, error);
      throw error;
    }
  }

  async getAvailableDataSources(): Promise<DataSource[]> {
    return Object.values(this.dataSources);
  }

  async getDataSourceSummary(sourceName: string): Promise<any> {
    const sourceConfig = this.dataSources[sourceName];
    if (!sourceConfig) {
      throw new Error(`Unknown data source: ${sourceName}`);
    }

    const { data, error } = await supabase
      .from(sourceConfig.table)
      .select('*', { count: 'exact' });

    if (error) throw error;

    return {
      name: sourceConfig.name,
      table: sourceConfig.table,
      totalRecords: data?.length || 0,
      availableFields: sourceConfig.fields,
      lastRecord: data && data.length > 0 ? data[data.length - 1] : null,
    };
  }

  // OSFI E-21 specific data aggregation
  async aggregateOSFIE21Data(reportingPeriodStart: string, reportingPeriodEnd: string) {
    try {
      const [
        businessFunctions,
        continuityPlans,
        scenarioTests,
        incidents,
        controls
      ] = await Promise.all([
        this.getCriticalBusinessFunctions(),
        this.getContinuityPlanStatus(),
        this.getScenarioTestResults(reportingPeriodStart, reportingPeriodEnd),
        this.getOperationalIncidents(reportingPeriodStart, reportingPeriodEnd),
        this.getControlEffectiveness(),
      ]);

      return {
        critical_operations: businessFunctions,
        continuity_preparedness: continuityPlans,
        testing_results: scenarioTests,
        operational_incidents: incidents,
        control_environment: controls,
        summary: {
          total_critical_functions: businessFunctions.length,
          functions_with_plans: continuityPlans.filter(p => p.status === 'approved').length,
          tests_completed: scenarioTests.filter(t => t.status === 'completed').length,
          incidents_this_period: incidents.length,
          effective_controls: controls.filter(c => c.effectiveness_score >= 80).length,
        },
      };
    } catch (error) {
      console.error('Error aggregating OSFI E-21 data:', error);
      throw error;
    }
  }

  // Basel III specific data aggregation
  async aggregateBaselIIIData(reportingPeriodStart: string, reportingPeriodEnd: string) {
    try {
      const [
        operationalRiskEvents,
        lossData,
        controlFramework,
        riskIndicators
      ] = await Promise.all([
        this.getOperationalRiskEvents(reportingPeriodStart, reportingPeriodEnd),
        this.getLossEventData(reportingPeriodStart, reportingPeriodEnd),
        this.getControlFrameworkData(),
        this.getOperationalRiskIndicators(),
      ]);

      return {
        operational_risk_profile: {
          events: operationalRiskEvents,
          losses: lossData,
          controls: controlFramework,
          indicators: riskIndicators,
        },
        capital_requirements: {
          // This would typically come from financial systems
          basic_indicator_approach: 0,
          standardized_approach: 0,
          advanced_measurement_approach: 0,
        },
        summary: {
          total_events: operationalRiskEvents.length,
          high_severity_events: operationalRiskEvents.filter(e => e.severity === 'high' || e.severity === 'critical').length,
          total_losses: lossData.reduce((sum, loss) => sum + (loss.financial_impact || 0), 0),
          control_coverage: Math.round((controlFramework.filter(c => c.status === 'active').length / controlFramework.length) * 100),
        },
      };
    } catch (error) {
      console.error('Error aggregating Basel III data:', error);
      throw error;
    }
  }

  // Helper methods for specific data queries
  private async getCriticalBusinessFunctions() {
    const { data, error } = await supabase
      .from('business_functions')
      .select('*')
      .eq('criticality', 'critical');

    if (error) throw error;
    return data || [];
  }

  private async getContinuityPlanStatus() {
    const { data, error } = await supabase
      .from('continuity_plans')
      .select('*');

    if (error) throw error;
    return data || [];
  }

  private async getScenarioTestResults(periodStart: string, periodEnd: string) {
    const { data, error } = await supabase
      .from('scenario_tests')
      .select('*')
      .gte('created_at', periodStart)
      .lt('created_at', periodEnd);

    if (error) throw error;
    return data || [];
  }

  private async getOperationalIncidents(periodStart: string, periodEnd: string) {
    const { data, error } = await supabase
      .from('incident_logs')
      .select('*')
      .eq('incident_type', 'operational')
      .gte('created_at', periodStart)
      .lt('created_at', periodEnd);

    if (error) throw error;
    return data || [];
  }

  private async getControlEffectiveness() {
    const { data, error } = await supabase
      .from('controls')
      .select('*')
      .eq('status', 'active');

    if (error) throw error;
    return data || [];
  }

  private async getOperationalRiskEvents(periodStart: string, periodEnd: string) {
    const { data, error } = await supabase
      .from('incident_logs')
      .select('*')
      .gte('created_at', periodStart)
      .lt('created_at', periodEnd);

    if (error) throw error;
    return data || [];
  }

  private async getLossEventData(periodStart: string, periodEnd: string) {
    const { data, error } = await supabase
      .from('incident_logs')
      .select('*')
      .not('financial_impact', 'is', null)
      .gte('created_at', periodStart)
      .lt('created_at', periodEnd);

    if (error) throw error;
    return data || [];
  }

  private async getControlFrameworkData() {
    const { data, error } = await supabase
      .from('controls')
      .select('*');

    if (error) throw error;
    return data || [];
  }

  private async getOperationalRiskIndicators() {
    const { data, error } = await supabase
      .from('kri_definitions')
      .select('*')
      .eq('category', 'operational');

    if (error) throw error;
    return data || [];
  }

  private async getTemplate(templateId: string) {
    const { data, error } = await supabase
      .from('report_templates')
      .select('*')
      .eq('id', templateId)
      .single();

    if (error) throw error;
    return data;
  }

  private calculateCompleteness(data: any[], fields: string[]): number {
    if (!data.length || !fields.length) return 0;

    let totalFields = data.length * fields.length;
    let populatedFields = 0;

    data.forEach(record => {
      fields.forEach(field => {
        if (record[field] !== null && record[field] !== undefined && record[field] !== '') {
          populatedFields++;
        }
      });
    });

    return Math.round((populatedFields / totalFields) * 100);
  }

  private assessDataQuality(completeness: number, recordCount: number): 'high' | 'medium' | 'low' {
    if (completeness >= 90 && recordCount > 0) return 'high';
    if (completeness >= 70 && recordCount > 0) return 'medium';
    return 'low';
  }
}

export const dataAggregationService = new DataAggregationService();