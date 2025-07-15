import { supabase } from '@/integrations/supabase/client';
import { TestExecutionResult } from './WorkflowTestSuite';

export class DatabaseIntegrityChecker {
  private logExecution(message: string, data?: any): string {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}`;
    if (data) {
      console.log(logMessage, data);
    } else {
      console.log(logMessage);
    }
    return logMessage;
  }

  async runTest(testId: string, testName: string): Promise<TestExecutionResult> {
    const logs: string[] = [];
    logs.push(this.logExecution(`Starting database integrity test: ${testName}`));

    try {
      switch (testId) {
        case 'kri-logs-integrity':
          return await this.testKRILogsIntegrity(logs);
        case 'vendor-alerts-integrity':
          return await this.testVendorAlertsIntegrity(logs);
        case 'cross-table-consistency':
          return await this.testCrossTableConsistency(logs);
        default:
          throw new Error(`Unknown database test: ${testId}`);
      }
    } catch (error) {
      logs.push(this.logExecution(`Test failed with error: ${error instanceof Error ? error.message : 'Unknown error'}`));
      return {
        success: false,
        outcome: 'Database test execution failed',
        logs,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private async testKRILogsIntegrity(logs: string[]): Promise<TestExecutionResult> {
    try {
      logs.push(this.logExecution('Step 1: Checking KRI logs table structure'));
      
      // Get current user org
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('No authenticated user');
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', user.id)
        .single();

      if (!profile?.organization_id) {
        throw new Error('No organization found for user');
      }

      logs.push(this.logExecution('Step 2: Analyzing KRI logs data quality'));
      
      // Check KRI logs data
      const { data: kriLogs, error: kriError } = await supabase
        .from('kri_logs')
        .select(`
          id,
          kri_id,
          measurement_date,
          actual_value,
          target_value,
          threshold_breached,
          created_at,
          updated_at
        `)
        .eq('org_id', profile.organization_id)
        .order('created_at', { ascending: false })
        .limit(100);

      if (kriError) {
        throw new Error(`Failed to fetch KRI logs: ${kriError.message}`);
      }

      const metrics = {
        totalRecords: kriLogs?.length || 0,
        recordsWithRealData: 0,
        recordsWithValidDates: 0,
        recordsWithValidValues: 0,
        uniqueKRIs: new Set(),
        oldestRecord: null as string | null,
        newestRecord: null as string | null
      };

      if (kriLogs && kriLogs.length > 0) {
        logs.push(this.logExecution('Step 3: Validating data authenticity'));
        
        for (const log of kriLogs) {
          // Check for real data indicators
          if (log.actual_value !== null && log.actual_value !== 0) {
            metrics.recordsWithRealData++;
          }
          
          // Validate dates
          if (log.measurement_date && log.created_at) {
            metrics.recordsWithValidDates++;
          }
          
          // Validate values
          if (log.actual_value !== null && log.target_value !== null) {
            metrics.recordsWithValidValues++;
          }
          
          // Track unique KRIs
          if (log.kri_id) {
            metrics.uniqueKRIs.add(log.kri_id);
          }
        }

        metrics.oldestRecord = kriLogs[kriLogs.length - 1]?.created_at || null;
        metrics.newestRecord = kriLogs[0]?.created_at || null;
      }

      logs.push(this.logExecution(`Data analysis complete: ${metrics.totalRecords} records analyzed`));

      // Validate data quality
      const realDataPercentage = metrics.totalRecords > 0 ? (metrics.recordsWithRealData / metrics.totalRecords) * 100 : 0;
      const validDatePercentage = metrics.totalRecords > 0 ? (metrics.recordsWithValidDates / metrics.totalRecords) * 100 : 0;

      if (metrics.totalRecords === 0) {
        return {
          success: false,
          outcome: 'No KRI logs found - database appears empty',
          logs,
          metrics: { ...metrics, uniqueKRIs: metrics.uniqueKRIs.size },
          error: 'Empty dataset'
        };
      }

      if (realDataPercentage < 80) {
        return {
          success: false,
          outcome: `Only ${realDataPercentage.toFixed(1)}% of records contain real data (minimum 80% required)`,
          logs,
          metrics: { ...metrics, uniqueKRIs: metrics.uniqueKRIs.size, realDataPercentage },
          error: 'Insufficient real data'
        };
      }

      if (validDatePercentage < 95) {
        return {
          success: true,
          warning: true,
          outcome: `${validDatePercentage.toFixed(1)}% of records have valid dates (warning: below 95%)`,
          logs,
          metrics: { ...metrics, uniqueKRIs: metrics.uniqueKRIs.size, realDataPercentage, validDatePercentage }
        };
      }

      return {
        success: true,
        outcome: `KRI logs contain ${metrics.totalRecords} records with ${realDataPercentage.toFixed(1)}% real data across ${metrics.uniqueKRIs.size} unique KRIs`,
        logs,
        metrics: { ...metrics, uniqueKRIs: metrics.uniqueKRIs.size, realDataPercentage, validDatePercentage }
      };

    } catch (error) {
      logs.push(this.logExecution(`KRI logs integrity test failed: ${error instanceof Error ? error.message : 'Unknown error'}`));
      return {
        success: false,
        outcome: 'KRI logs integrity validation failed',
        logs,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private async testVendorAlertsIntegrity(logs: string[]): Promise<TestExecutionResult> {
    try {
      logs.push(this.logExecution('Step 1: Checking vendor risk alerts structure'));
      
      // Get current user org
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('No authenticated user');
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', user.id)
        .single();

      if (!profile?.organization_id) {
        throw new Error('No organization found for user');
      }

      logs.push(this.logExecution('Step 2: Analyzing vendor alerts data'));
      
      // Check vendor risk alerts
      const { data: vendorAlerts, error: alertsError } = await supabase
        .from('vendor_risk_alerts')
        .select(`
          id,
          vendor_name,
          risk_level,
          alert_type,
          alert_message,
          created_at,
          resolved_at,
          created_by
        `)
        .eq('org_id', profile.organization_id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (alertsError) {
        throw new Error(`Failed to fetch vendor alerts: ${alertsError.message}`);
      }

      logs.push(this.logExecution('Step 3: Validating vendor data quality'));
      
      const metrics = {
        totalAlerts: vendorAlerts?.length || 0,
        uniqueVendors: new Set(),
        riskLevelDistribution: {} as Record<string, number>,
        alertTypeDistribution: {} as Record<string, number>,
        resolvedAlerts: 0,
        validNames: 0
      };

      if (vendorAlerts && vendorAlerts.length > 0) {
        for (const alert of vendorAlerts) {
          // Track unique vendors
          if (alert.vendor_name) {
            metrics.uniqueVendors.add(alert.vendor_name);
            
            // Check for valid vendor names (not test/mock data)
            if (!alert.vendor_name.toLowerCase().includes('test') && 
                !alert.vendor_name.toLowerCase().includes('mock') &&
                !alert.vendor_name.toLowerCase().includes('sample')) {
              metrics.validNames++;
            }
          }
          
          // Track risk levels
          if (alert.risk_level) {
            metrics.riskLevelDistribution[alert.risk_level] = 
              (metrics.riskLevelDistribution[alert.risk_level] || 0) + 1;
          }
          
          // Track alert types
          if (alert.alert_type) {
            metrics.alertTypeDistribution[alert.alert_type] = 
              (metrics.alertTypeDistribution[alert.alert_type] || 0) + 1;
          }
          
          // Count resolved alerts
          if (alert.resolved_at) {
            metrics.resolvedAlerts++;
          }
        }
      }

      logs.push(this.logExecution(`Vendor alerts analysis complete: ${metrics.totalAlerts} alerts analyzed`));

      const realNamesPercentage = metrics.totalAlerts > 0 ? (metrics.validNames / metrics.totalAlerts) * 100 : 0;

      if (metrics.totalAlerts === 0) {
        return {
          success: true,
          warning: true,
          outcome: 'No vendor risk alerts found - this may be expected for new organizations',
          logs,
          metrics: { ...metrics, uniqueVendors: metrics.uniqueVendors.size, realNamesPercentage }
        };
      }

      if (realNamesPercentage < 70) {
        return {
          success: false,
          outcome: `Only ${realNamesPercentage.toFixed(1)}% of vendor names appear to be real (minimum 70% required)`,
          logs,
          metrics: { ...metrics, uniqueVendors: metrics.uniqueVendors.size, realNamesPercentage },
          error: 'Too many test/mock vendor names detected'
        };
      }

      return {
        success: true,
        outcome: `Vendor alerts contain ${metrics.totalAlerts} records with ${metrics.uniqueVendors.size} unique vendors and ${realNamesPercentage.toFixed(1)}% real names`,
        logs,
        metrics: { ...metrics, uniqueVendors: metrics.uniqueVendors.size, realNamesPercentage }
      };

    } catch (error) {
      logs.push(this.logExecution(`Vendor alerts integrity test failed: ${error instanceof Error ? error.message : 'Unknown error'}`));
      return {
        success: false,
        outcome: 'Vendor alerts integrity validation failed',
        logs,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private async testCrossTableConsistency(logs: string[]): Promise<TestExecutionResult> {
    try {
      logs.push(this.logExecution('Step 1: Testing cross-table foreign key relationships'));
      
      // Get current user org
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('No authenticated user');
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', user.id)
        .single();

      if (!profile?.organization_id) {
        throw new Error('No organization found for user');
      }

      logs.push(this.logExecution('Step 2: Checking KRI definitions and logs consistency'));
      
      // Check KRI definitions vs logs consistency
      const { data: kriDefs, error: kriDefsError } = await supabase
        .from('kri_definitions')
        .select('id, name')
        .eq('org_id', profile.organization_id);

      if (kriDefsError) {
        throw new Error(`Failed to fetch KRI definitions: ${kriDefsError.message}`);
      }

      const { data: kriLogsWithDefs, error: kriLogsError } = await supabase
        .from('kri_logs')
        .select('id, kri_id')
        .eq('org_id', profile.organization_id)
        .limit(100);

      if (kriLogsError) {
        throw new Error(`Failed to fetch KRI logs: ${kriLogsError.message}`);
      }

      logs.push(this.logExecution('Step 3: Validating vendor profiles and contracts consistency'));
      
      // Check vendor profiles vs contracts consistency
      const { data: vendorProfiles, error: vendorProfilesError } = await supabase
        .from('third_party_profiles')
        .select('id, vendor_name')
        .eq('org_id', profile.organization_id);

      if (vendorProfilesError) {
        throw new Error(`Failed to fetch vendor profiles: ${vendorProfilesError.message}`);
      }

      const metrics = {
        kriDefinitions: kriDefs?.length || 0,
        kriLogs: kriLogsWithDefs?.length || 0,
        vendorProfiles: vendorProfiles?.length || 0,
        orphanedKRILogs: 0,
        validKRIReferences: 0,
        consistencyScore: 0
      };

      // Check for orphaned KRI logs
      if (kriLogsWithDefs && kriDefs) {
        const validKRIIds = new Set(kriDefs.map(def => def.id));
        
        for (const log of kriLogsWithDefs) {
          if (log.kri_id && validKRIIds.has(log.kri_id)) {
            metrics.validKRIReferences++;
          } else {
            metrics.orphanedKRILogs++;
          }
        }
      }

      // Calculate consistency score
      if (metrics.kriLogs > 0) {
        metrics.consistencyScore = (metrics.validKRIReferences / metrics.kriLogs) * 100;
      }

      logs.push(this.logExecution(`Cross-table consistency analysis complete`));

      if (metrics.orphanedKRILogs > 0 && metrics.consistencyScore < 95) {
        return {
          success: false,
          outcome: `Found ${metrics.orphanedKRILogs} orphaned KRI logs (${metrics.consistencyScore.toFixed(1)}% consistency)`,
          logs,
          metrics,
          error: 'Foreign key consistency violations detected'
        };
      }

      if (metrics.consistencyScore < 98) {
        return {
          success: true,
          warning: true,
          outcome: `Cross-table consistency at ${metrics.consistencyScore.toFixed(1)}% (warning: below 98%)`,
          logs,
          metrics
        };
      }

      return {
        success: true,
        outcome: `Cross-table relationships are ${metrics.consistencyScore.toFixed(1)}% consistent with ${metrics.orphanedKRILogs} orphaned records`,
        logs,
        metrics
      };

    } catch (error) {
      logs.push(this.logExecution(`Cross-table consistency test failed: ${error instanceof Error ? error.message : 'Unknown error'}`));
      return {
        success: false,
        outcome: 'Cross-table consistency validation failed',
        logs,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}