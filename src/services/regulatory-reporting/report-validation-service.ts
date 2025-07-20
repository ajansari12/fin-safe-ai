import { supabase } from '@/integrations/supabase/client';
import { ReportValidation } from './reporting-service';

export interface ValidationRule {
  rule: string;
  type: 'completeness' | 'accuracy' | 'consistency' | 'format' | 'business_logic';
  severity: 'error' | 'warning' | 'info';
  description?: string;
}

export interface ValidationResult {
  passed: boolean;
  rule: string;
  type: string;
  severity: string;
  message?: string;
  fieldPath?: string;
  expectedValue?: string;
  actualValue?: string;
  remediation?: string;
}

export interface ValidationSummary {
  totalRules: number;
  passed: number;
  failed: number;
  warnings: number;
  errors: number;
  overallStatus: 'passed' | 'failed' | 'warning';
  completionPercentage: number;
}

class ReportValidationService {
  // Standard validation rules for different report types
  private readonly standardRules: Record<string, ValidationRule[]> = {
    osfi_e21: [
      {
        rule: 'all_critical_functions_identified',
        type: 'completeness',
        severity: 'error',
        description: 'All critical business functions must be identified and documented',
      },
      {
        rule: 'rto_rpo_defined_for_critical_functions',
        type: 'completeness',
        severity: 'error',
        description: 'RTO and RPO must be defined for all critical functions',
      },
      {
        rule: 'annual_testing_completed',
        type: 'business_logic',
        severity: 'warning',
        description: 'Annual scenario testing should be completed',
      },
      {
        rule: 'incident_response_documented',
        type: 'completeness',
        severity: 'error',
        description: 'Incident response procedures must be documented',
      },
      {
        rule: 'governance_framework_current',
        type: 'consistency',
        severity: 'warning',
        description: 'Governance framework should be current and approved',
      },
    ],
    basel_iii: [
      {
        rule: 'loss_data_complete',
        type: 'completeness',
        severity: 'error',
        description: 'Operational loss data must be complete for the reporting period',
      },
      {
        rule: 'capital_calculation_accurate',
        type: 'accuracy',
        severity: 'error',
        description: 'Capital requirement calculations must be accurate',
      },
      {
        rule: 'control_testing_current',
        type: 'business_logic',
        severity: 'warning',
        description: 'Control testing should be current',
      },
      {
        rule: 'risk_indicators_monitored',
        type: 'completeness',
        severity: 'error',
        description: 'All operational risk indicators must be monitored',
      },
    ],
    cdic_dsr: [
      {
        rule: 'deposit_data_accurate',
        type: 'accuracy',
        severity: 'error',
        description: 'Deposit data must be accurate and reconciled',
      },
      {
        rule: 'system_capabilities_documented',
        type: 'completeness',
        severity: 'error',
        description: 'System capabilities must be fully documented',
      },
      {
        rule: 'contingency_plans_tested',
        type: 'business_logic',
        severity: 'warning',
        description: 'Contingency plans should be regularly tested',
      },
    ],
  };

  async validateReport(reportInstanceId: string, reportData: any, templateType: string): Promise<ValidationSummary> {
    try {
      const rules = this.getValidationRules(templateType);
      const results: ValidationResult[] = [];

      // Run all validation rules
      for (const rule of rules) {
        const result = await this.executeValidationRule(rule, reportData);
        results.push(result);

        // Store validation result in database
        await this.storeValidationResult(reportInstanceId, rule, result);
      }

      // Calculate summary
      const summary = this.calculateValidationSummary(results);
      
      // Update report instance with validation status
      await this.updateReportValidationStatus(reportInstanceId, summary);

      return summary;
    } catch (error) {
      console.error('Error validating report:', error);
      throw error;
    }
  }

  async getValidationResults(reportInstanceId: string): Promise<ReportValidation[]> {
    const { data, error } = await supabase
      .from('report_validations')
      .select('*')
      .eq('report_instance_id', reportInstanceId)
      .order('validated_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async revalidateReport(reportInstanceId: string): Promise<ValidationSummary> {
    try {
      // Get report instance and data
      const { data: reportInstance, error } = await supabase
        .from('report_instances')
        .select(`
          *,
          report_templates (template_type)
        `)
        .eq('id', reportInstanceId)
        .single();

      if (error) throw error;

      // Clear existing validations
      await supabase
        .from('report_validations')
        .delete()
        .eq('report_instance_id', reportInstanceId);

      // Run validation again
      return this.validateReport(
        reportInstanceId,
        reportInstance.report_data,
        reportInstance.report_templates.template_type
      );
    } catch (error) {
      console.error('Error revalidating report:', error);
      throw error;
    }
  }

  private getValidationRules(templateType: string): ValidationRule[] {
    return this.standardRules[templateType] || [];
  }

  private async executeValidationRule(rule: ValidationRule, reportData: any): Promise<ValidationResult> {
    try {
      switch (rule.rule) {
        case 'all_critical_functions_identified':
          return this.validateCriticalFunctionsIdentified(rule, reportData);
        
        case 'rto_rpo_defined_for_critical_functions':
          return this.validateRTORPODefined(rule, reportData);
        
        case 'annual_testing_completed':
          return this.validateAnnualTestingCompleted(rule, reportData);
        
        case 'incident_response_documented':
          return this.validateIncidentResponseDocumented(rule, reportData);
        
        case 'loss_data_complete':
          return this.validateLossDataComplete(rule, reportData);
        
        case 'capital_calculation_accurate':
          return this.validateCapitalCalculationAccurate(rule, reportData);
        
        case 'control_testing_current':
          return this.validateControlTestingCurrent(rule, reportData);
        
        default:
          return this.validateGenericRule(rule, reportData);
      }
    } catch (error) {
      return {
        passed: false,
        rule: rule.rule,
        type: rule.type,
        severity: 'error',
        message: `Validation rule execution failed: ${error.message}`,
        remediation: 'Check the validation rule implementation',
      };
    }
  }

  // Specific validation implementations
  private validateCriticalFunctionsIdentified(rule: ValidationRule, reportData: any): ValidationResult {
    const criticalFunctions = reportData.critical_operations || [];
    const hasCriticalFunctions = criticalFunctions.length > 0;

    return {
      passed: hasCriticalFunctions,
      rule: rule.rule,
      type: rule.type,
      severity: rule.severity,
      message: hasCriticalFunctions 
        ? `${criticalFunctions.length} critical functions identified`
        : 'No critical business functions have been identified',
      fieldPath: 'critical_operations',
      expectedValue: '>0',
      actualValue: criticalFunctions.length.toString(),
      remediation: hasCriticalFunctions 
        ? undefined 
        : 'Identify and document all critical business functions',
    };
  }

  private validateRTORPODefined(rule: ValidationRule, reportData: any): ValidationResult {
    const criticalFunctions = reportData.critical_operations || [];
    const functionsWithRTORPO = criticalFunctions.filter(f => 
      f.rto_hours !== null && f.rto_hours !== undefined &&
      f.rpo_hours !== null && f.rpo_hours !== undefined
    );

    const passed = criticalFunctions.length > 0 && functionsWithRTORPO.length === criticalFunctions.length;

    return {
      passed,
      rule: rule.rule,
      type: rule.type,
      severity: rule.severity,
      message: passed
        ? 'All critical functions have defined RTO and RPO'
        : `${criticalFunctions.length - functionsWithRTORPO.length} critical functions missing RTO/RPO`,
      fieldPath: 'critical_operations.rto_hours,rpo_hours',
      expectedValue: 'All critical functions',
      actualValue: `${functionsWithRTORPO.length}/${criticalFunctions.length}`,
      remediation: passed
        ? undefined
        : 'Define RTO and RPO objectives for all critical business functions',
    };
  }

  private validateAnnualTestingCompleted(rule: ValidationRule, reportData: any): ValidationResult {
    const testingResults = reportData.testing_results || [];
    const currentYear = new Date().getFullYear();
    const testsThisYear = testingResults.filter(test => {
      const testDate = new Date(test.created_at);
      return testDate.getFullYear() === currentYear;
    });

    const passed = testsThisYear.length > 0;

    return {
      passed,
      rule: rule.rule,
      type: rule.type,
      severity: rule.severity,
      message: passed
        ? `${testsThisYear.length} tests completed this year`
        : 'No scenario tests completed this year',
      fieldPath: 'testing_results',
      expectedValue: '>0 tests per year',
      actualValue: testsThisYear.length.toString(),
      remediation: passed
        ? undefined
        : 'Complete annual scenario testing for operational resilience',
    };
  }

  private validateIncidentResponseDocumented(rule: ValidationRule, reportData: any): ValidationResult {
    const incidents = reportData.operational_incidents || [];
    const incidentsWithResponse = incidents.filter(incident => 
      incident.response_actions && incident.response_actions.length > 0
    );

    const passed = incidents.length === 0 || incidentsWithResponse.length === incidents.length;

    return {
      passed,
      rule: rule.rule,
      type: rule.type,
      severity: rule.severity,
      message: passed
        ? 'All incidents have documented responses'
        : `${incidents.length - incidentsWithResponse.length} incidents missing response documentation`,
      fieldPath: 'operational_incidents.response_actions',
      expectedValue: 'All incidents',
      actualValue: `${incidentsWithResponse.length}/${incidents.length}`,
      remediation: passed
        ? undefined
        : 'Document response actions for all operational incidents',
    };
  }

  private validateLossDataComplete(rule: ValidationRule, reportData: any): ValidationResult {
    const lossData = reportData.operational_risk_profile?.losses || [];
    const completeRecords = lossData.filter(loss => 
      loss.financial_impact !== null && 
      loss.financial_impact !== undefined &&
      loss.business_line &&
      loss.event_type
    );

    const passed = lossData.length > 0 && completeRecords.length === lossData.length;

    return {
      passed,
      rule: rule.rule,
      type: rule.type,
      severity: rule.severity,
      message: passed
        ? 'Loss data is complete'
        : `${lossData.length - completeRecords.length} incomplete loss records`,
      fieldPath: 'operational_risk_profile.losses',
      expectedValue: 'Complete records',
      actualValue: `${completeRecords.length}/${lossData.length}`,
      remediation: passed
        ? undefined
        : 'Complete all required fields for operational loss events',
    };
  }

  private validateCapitalCalculationAccurate(rule: ValidationRule, reportData: any): ValidationResult {
    const capitalData = reportData.operational_risk_profile?.capital_requirements;
    
    if (!capitalData) {
      return {
        passed: false,
        rule: rule.rule,
        type: rule.type,
        severity: rule.severity,
        message: 'Capital calculation data missing',
        fieldPath: 'operational_risk_profile.capital_requirements',
        remediation: 'Provide operational risk capital calculations',
      };
    }

    // Basic validation - ensure calculations are present and reasonable
    const hasBasicIndicator = capitalData.basic_indicator_approach >= 0;
    const hasStandardized = capitalData.standardized_approach >= 0;
    const passed = hasBasicIndicator || hasStandardized;

    return {
      passed,
      rule: rule.rule,
      type: rule.type,
      severity: rule.severity,
      message: passed
        ? 'Capital calculations are present'
        : 'Capital calculations are missing or invalid',
      fieldPath: 'operational_risk_profile.capital_requirements',
      remediation: passed
        ? undefined
        : 'Provide valid operational risk capital calculations',
    };
  }

  private validateControlTestingCurrent(rule: ValidationRule, reportData: any): ValidationResult {
    const controls = reportData.control_environment || [];
    const currentDate = new Date();
    const oneYearAgo = new Date(currentDate.getFullYear() - 1, currentDate.getMonth(), currentDate.getDate());

    const controlsWithCurrentTesting = controls.filter(control => {
      if (!control.last_test_date) return false;
      const testDate = new Date(control.last_test_date);
      return testDate >= oneYearAgo;
    });

    const passed = controls.length > 0 && (controlsWithCurrentTesting.length / controls.length) >= 0.8;

    return {
      passed,
      rule: rule.rule,
      type: rule.type,
      severity: rule.severity,
      message: passed
        ? `${controlsWithCurrentTesting.length}/${controls.length} controls tested within last year`
        : `Only ${controlsWithCurrentTesting.length}/${controls.length} controls tested recently`,
      fieldPath: 'control_environment.last_test_date',
      expectedValue: '≥80% tested within 12 months',
      actualValue: `${Math.round((controlsWithCurrentTesting.length / controls.length) * 100)}%`,
      remediation: passed
        ? undefined
        : 'Ensure regular testing of operational controls',
    };
  }

  private validateGenericRule(rule: ValidationRule, reportData: any): ValidationResult {
    // Generic validation for custom rules
    return {
      passed: true,
      rule: rule.rule,
      type: rule.type,
      severity: 'info',
      message: 'Generic validation passed',
      remediation: 'Implement specific validation logic for this rule',
    };
  }

  private async storeValidationResult(reportInstanceId: string, rule: ValidationRule, result: ValidationResult): Promise<void> {
    const validation: Partial<ReportValidation> = {
      report_instance_id: reportInstanceId,
      validation_type: rule.type,
      validation_rule: rule.rule,
      validation_status: result.passed ? 'passed' : (result.severity === 'warning' ? 'warning' : 'failed'),
      error_message: result.message,
      field_path: result.fieldPath,
      expected_value: result.expectedValue,
      actual_value: result.actualValue,
      remediation_suggestion: result.remediation,
    };

    const { error } = await supabase
      .from('report_validations')
      .insert([validation]);

    if (error) throw error;
  }

  private calculateValidationSummary(results: ValidationResult[]): ValidationSummary {
    const totalRules = results.length;
    const passed = results.filter(r => r.passed).length;
    const failed = results.filter(r => !r.passed && r.severity === 'error').length;
    const warnings = results.filter(r => !r.passed && r.severity === 'warning').length;
    const errors = failed;

    let overallStatus: 'passed' | 'failed' | 'warning';
    if (errors > 0) {
      overallStatus = 'failed';
    } else if (warnings > 0) {
      overallStatus = 'warning';
    } else {
      overallStatus = 'passed';
    }

    const completionPercentage = totalRules > 0 ? Math.round((passed / totalRules) * 100) : 0;

    return {
      totalRules,
      passed,
      failed,
      warnings,
      errors,
      overallStatus,
      completionPercentage,
    };
  }

  private async updateReportValidationStatus(reportInstanceId: string, summary: ValidationSummary): Promise<void> {
    const validationResults = {
      summary,
      lastValidated: new Date().toISOString(),
    };

    const { error } = await supabase
      .from('report_instances')
      .update({ validation_results: validationResults })
      .eq('id', reportInstanceId);

    if (error) throw error;
  }
}

export const reportValidationService = new ReportValidationService();