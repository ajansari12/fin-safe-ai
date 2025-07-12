/**
 * Schema validation utilities to verify database schema compatibility
 * and data integrity across the application
 */

import { supabase } from "@/integrations/supabase/client";

export interface SchemaValidationResult {
  isValid: boolean;
  issues: SchemaIssue[];
  summary: {
    totalChecks: number;
    passed: number;
    failed: number;
  };
}

export interface SchemaIssue {
  severity: 'critical' | 'high' | 'medium' | 'low';
  category: 'column_mismatch' | 'missing_relationship' | 'data_integrity' | 'join_syntax';
  table: string;
  column?: string;
  description: string;
  suggestedFix: string;
}

export class SchemaValidator {
  private issues: SchemaIssue[] = [];

  async validateFullSchema(): Promise<SchemaValidationResult> {
    this.issues = [];
    
    await Promise.all([
      this.validateKRISchema(),
      this.validateControlsSchema(),
      this.validateBusinessFunctionsSchema(),
      this.validateContinuityPlansSchema(),
      this.validateRelationships(),
      this.validateJoinQueries()
    ]);

    const summary = {
      totalChecks: this.issues.length + 6, // 6 main validation methods
      passed: 6 - this.issues.filter(i => i.severity === 'critical').length,
      failed: this.issues.filter(i => i.severity === 'critical').length
    };

    return {
      isValid: this.issues.filter(i => i.severity === 'critical').length === 0,
      issues: this.issues,
      summary
    };
  }

  private async validateKRISchema() {
    try {
      // Test if alias columns exist
      const { data, error } = await supabase
        .from('kri_definitions')
        .select('id, name, kri_name')
        .limit(1);

      if (error) {
        this.addIssue('critical', 'column_mismatch', 'kri_definitions', 'kri_name', 
          'kri_name alias column missing', 'Add kri_name as generated column alias for name');
      }
    } catch (error) {
      this.addIssue('critical', 'column_mismatch', 'kri_definitions', 'kri_name',
        'Failed to validate KRI schema', 'Check database connectivity and schema');
    }
  }

  private async validateControlsSchema() {
    try {
      const { data, error } = await supabase
        .from('controls')
        .select('id, title, control_name')
        .limit(1);

      if (error) {
        this.addIssue('critical', 'column_mismatch', 'controls', 'control_name',
          'control_name alias column missing', 'Add control_name as generated column alias for title');
      }
    } catch (error) {
      this.addIssue('critical', 'column_mismatch', 'controls', 'control_name',
        'Failed to validate Controls schema', 'Check database connectivity and schema');
    }
  }

  private async validateBusinessFunctionsSchema() {
    try {
      const { data, error } = await supabase
        .from('business_functions')
        .select('id, name, function_name')
        .limit(1);

      if (error) {
        this.addIssue('critical', 'column_mismatch', 'business_functions', 'function_name',
          'function_name alias column missing', 'Add function_name as generated column alias for name');
      }
    } catch (error) {
      this.addIssue('critical', 'column_mismatch', 'business_functions', 'function_name',
        'Failed to validate Business Functions schema', 'Check database connectivity and schema');
    }
  }

  private async validateContinuityPlansSchema() {
    try {
      // Test JOIN syntax with business functions
      const { data, error } = await supabase
        .from('continuity_plans')
        .select(`
          id,
          plan_name,
          business_functions!business_function_id(name, criticality)
        `)
        .limit(1);

      if (error) {
        this.addIssue('high', 'join_syntax', 'continuity_plans', 'business_function_id',
          'JOIN syntax error with business_functions', 'Fix JOIN syntax to use ! notation');
      }
    } catch (error) {
      this.addIssue('high', 'join_syntax', 'continuity_plans', 'business_function_id',
        'Failed to validate continuity plans JOIN', 'Check JOIN syntax and foreign key relationships');
    }
  }

  private async validateRelationships() {
    try {
      // Check if foreign key constraints exist
      const { data: constraints, error } = await supabase
        .rpc('get_foreign_key_constraints');

      // This would need a custom function, for now we'll do a basic check
      const { data, error: testError } = await supabase
        .from('continuity_plans')
        .select('id, business_function_id')
        .limit(1);

      if (testError) {
        this.addIssue('medium', 'missing_relationship', 'continuity_plans', 'business_function_id',
          'Foreign key relationship may be missing', 'Add proper foreign key constraints');
      }
    } catch (error) {
      this.addIssue('medium', 'missing_relationship', 'continuity_plans', 'business_function_id',
        'Could not validate foreign key relationships', 'Manually verify foreign key constraints');
    }
  }

  private async validateJoinQueries() {
    try {
      // Test various JOIN patterns used in the application
      const joinTests = [
        {
          table: 'impact_tolerances',
          join: 'business_functions!function_id(name, criticality)',
          description: 'Impact tolerances to business functions JOIN'
        },
        {
          table: 'dependencies',
          join: 'business_functions!business_function_id(name)',
          description: 'Dependencies to business functions JOIN'
        }
      ];

      for (const test of joinTests) {
        try {
          const { error } = await supabase
            .from(test.table)
            .select(`id, ${test.join}`)
            .limit(1);

          if (error) {
            this.addIssue('high', 'join_syntax', test.table, 'join_query',
              `${test.description} failed`, 'Fix JOIN syntax and ensure foreign key exists');
          }
        } catch (testError) {
          this.addIssue('high', 'join_syntax', test.table, 'join_query',
            `${test.description} test failed`, 'Check JOIN syntax and table relationships');
        }
      }
    } catch (error) {
      this.addIssue('medium', 'join_syntax', 'multiple', 'join_queries',
        'Could not validate JOIN queries', 'Manually test JOIN syntax in services');
    }
  }

  private addIssue(
    severity: SchemaIssue['severity'],
    category: SchemaIssue['category'],
    table: string,
    column: string,
    description: string,
    suggestedFix: string
  ) {
    this.issues.push({
      severity,
      category,
      table,
      column,
      description,
      suggestedFix
    });
  }
}

export const schemaValidator = new SchemaValidator();

/**
 * Quick schema health check for development
 */
export async function quickSchemaCheck(): Promise<boolean> {
  try {
    const result = await schemaValidator.validateFullSchema();
    console.log('Schema Validation Results:', result);
    
    if (!result.isValid) {
      console.warn('Schema issues found:', result.issues.filter(i => i.severity === 'critical'));
    }
    
    return result.isValid;
  } catch (error) {
    console.error('Schema validation failed:', error);
    return false;
  }
}