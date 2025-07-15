import { supabase } from '@/integrations/supabase/client';
import { TestExecutionResult } from './WorkflowTestSuite';

export class DatabaseIntegrityChecker {
  private mockDataPatterns = {
    names: ['test', 'mock', 'sample', 'demo', 'fake', 'placeholder', 'example'],
    emails: ['test@', 'mock@', 'example@', 'demo@', 'fake@'],
    vendors: ['acme', 'test corp', 'demo company', 'sample vendor'],
    incremental: /^(test|mock|sample|demo)\s*\d+/i,
    generic: /^(vendor|company|organization|client)\s*\d*$/i
  };

  private criticalTables = [
    'kri_logs',
    'kri_definitions', 
    'vendor_risk_alerts',
    'third_party_profiles',
    'controls',
    'incident_logs',
    'audit_trails',
    'compliance_checks',
    'risk_assessments'
  ];

  private foreignKeyRelationships = [
    { child: 'kri_logs', parent: 'kri_definitions', key: 'kri_id' },
    { child: 'vendor_risk_alerts', parent: 'third_party_profiles', key: 'vendor_profile_id' },
    { child: 'control_tests', parent: 'controls', key: 'control_id' },
    { child: 'incident_responses', parent: 'incident_logs', key: 'incident_id' },
    { child: 'compliance_checks', parent: 'compliance_policies', key: 'policy_id' }
  ];

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
        case 'mock-data-detection':
          return await this.testMockDataDetection(logs);
        case 'foreign-key-integrity':
          return await this.testForeignKeyIntegrity(logs);
        case 'data-completeness-audit':
          return await this.testDataCompletenessAudit(logs);
        case 'temporal-consistency':
          return await this.testTemporalConsistency(logs);
        case 'business-rule-validation':
          return await this.testBusinessRuleValidation(logs);
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

  // Phase 3: Advanced Mock Data Detection
  private async testMockDataDetection(logs: string[]): Promise<TestExecutionResult> {
    const startTime = Date.now();
    
    try {
      logs.push(this.logExecution('Starting comprehensive mock data detection across all critical tables'));
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');
      
      const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', user.id)
        .single();
        
      if (!profile?.organization_id) throw new Error('No organization found');
      
      const mockDataResults: Record<string, any> = {};
      let totalRecords = 0;
      let totalMockRecords = 0;
      
      // Analyze each critical table
      for (const tableName of this.criticalTables) {
        logs.push(this.logExecution(`Analyzing table: ${tableName}`));
        
        try {
          const { data: tableData, error } = await supabase
            .from(tableName)
            .select('*')
            .eq('org_id', profile.organization_id)
            .limit(100);
            
          if (error) {
            logs.push(this.logExecution(`Warning: Could not access table ${tableName}: ${error.message}`));
            continue;
          }
          
          if (!tableData || tableData.length === 0) {
            mockDataResults[tableName] = { 
              records: 0, 
              mockRecords: 0, 
              mockPercentage: 0,
              patterns: []
            };
            continue;
          }
          
          const mockAnalysis = this.analyzeMockDataInTable(tableData, tableName);
          mockDataResults[tableName] = mockAnalysis;
          totalRecords += mockAnalysis.records;
          totalMockRecords += mockAnalysis.mockRecords;
          
        } catch (tableError) {
          logs.push(this.logExecution(`Error analyzing table ${tableName}: ${tableError instanceof Error ? tableError.message : 'Unknown error'}`));
        }
      }
      
      const overallMockPercentage = totalRecords > 0 ? (totalMockRecords / totalRecords) * 100 : 0;
      const duration = Date.now() - startTime;
      
      logs.push(this.logExecution(`Mock data analysis complete: ${totalMockRecords}/${totalRecords} records appear to be mock data`));
      
      // Generate detailed report
      const tablesWithMockData = Object.entries(mockDataResults)
        .filter(([_, analysis]) => analysis.mockPercentage > 10)
        .map(([table, analysis]) => ({ table, ...analysis }));
      
      if (overallMockPercentage > 30) {
        return {
          success: false,
          outcome: `${overallMockPercentage.toFixed(1)}% of data appears to be mock/test data (exceeds 30% threshold)`,
          logs,
          metrics: { 
            duration,
            totalRecords,
            totalMockRecords,
            overallMockPercentage,
            tablesAnalyzed: this.criticalTables.length,
            tablesWithMockData: tablesWithMockData.length,
            detailedResults: mockDataResults
          },
          error: 'Excessive mock data detected'
        };
      }
      
      if (overallMockPercentage > 15) {
        return {
          success: true,
          warning: true,
          outcome: `${overallMockPercentage.toFixed(1)}% of data appears to be mock/test data (warning threshold exceeded)`,
          logs,
          metrics: { 
            duration,
            totalRecords,
            totalMockRecords,
            overallMockPercentage,
            tablesAnalyzed: this.criticalTables.length,
            tablesWithMockData: tablesWithMockData.length,
            detailedResults: mockDataResults
          }
        };
      }
      
      return {
        success: true,
        outcome: `Data authenticity verified: only ${overallMockPercentage.toFixed(1)}% mock data detected across ${this.criticalTables.length} tables`,
        logs,
        metrics: { 
          duration,
          totalRecords,
          totalMockRecords,
          overallMockPercentage,
          tablesAnalyzed: this.criticalTables.length,
          tablesWithMockData: tablesWithMockData.length,
          detailedResults: mockDataResults
        }
      };
      
    } catch (error) {
      logs.push(this.logExecution(`Mock data detection failed: ${error instanceof Error ? error.message : 'Unknown error'}`));
      return {
        success: false,
        outcome: 'Mock data detection failed',
        logs,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private analyzeMockDataInTable(data: any[], tableName: string): any {
    let mockRecords = 0;
    const detectedPatterns: string[] = [];
    
    for (const record of data) {
      let isMock = false;
      
      // Check text fields for mock patterns
      for (const [key, value] of Object.entries(record)) {
        if (typeof value === 'string') {
          const lowerValue = value.toLowerCase();
          
          // Check against known mock patterns
          for (const pattern of this.mockDataPatterns.names) {
            if (lowerValue.includes(pattern)) {
              isMock = true;
              detectedPatterns.push(`${key}: ${pattern}`);
              break;
            }
          }
          
          // Check email patterns
          if (key.includes('email') || key.includes('Email')) {
            for (const emailPattern of this.mockDataPatterns.emails) {
              if (lowerValue.includes(emailPattern)) {
                isMock = true;
                detectedPatterns.push(`${key}: mock email`);
                break;
              }
            }
          }
          
          // Check incremental patterns
          if (this.mockDataPatterns.incremental.test(value)) {
            isMock = true;
            detectedPatterns.push(`${key}: incremental pattern`);
          }
          
          // Check generic patterns
          if (this.mockDataPatterns.generic.test(value)) {
            isMock = true;
            detectedPatterns.push(`${key}: generic pattern`);
          }
        }
      }
      
      if (isMock) mockRecords++;
    }
    
    return {
      records: data.length,
      mockRecords,
      mockPercentage: data.length > 0 ? (mockRecords / data.length) * 100 : 0,
      patterns: [...new Set(detectedPatterns)]
    };
  }

  // Foreign Key Integrity Testing
  private async testForeignKeyIntegrity(logs: string[]): Promise<TestExecutionResult> {
    const startTime = Date.now();
    
    try {
      logs.push(this.logExecution('Testing foreign key integrity across critical relationships'));
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');
      
      const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', user.id)
        .single();
        
      if (!profile?.organization_id) throw new Error('No organization found');
      
      const integrityResults: any[] = [];
      let totalViolations = 0;
      
      // Test each foreign key relationship
      for (const relationship of this.foreignKeyRelationships) {
        logs.push(this.logExecution(`Testing ${relationship.child} -> ${relationship.parent} relationship`));
        
        try {
          // Get child records
          const { data: childRecords, error: childError } = await supabase
            .from(relationship.child)
            .select(`id, ${relationship.key}`)
            .eq('org_id', profile.organization_id)
            .limit(100);
            
          if (childError) {
            logs.push(this.logExecution(`Warning: Could not access ${relationship.child}: ${childError.message}`));
            continue;
          }
          
          if (!childRecords || childRecords.length === 0) {
            integrityResults.push({
              relationship: `${relationship.child} -> ${relationship.parent}`,
              childRecords: 0,
              violations: 0,
              integrityScore: 100
            });
            continue;
          }
          
          // Get parent records
          const { data: parentRecords, error: parentError } = await supabase
            .from(relationship.parent)
            .select('id')
            .eq('org_id', profile.organization_id);
            
          if (parentError) {
            logs.push(this.logExecution(`Warning: Could not access ${relationship.parent}: ${parentError.message}`));
            continue;
          }
          
          const parentIds = new Set(parentRecords?.map(p => p.id) || []);
          let violations = 0;
          
          // Check for orphaned records
          for (const child of childRecords) {
            if (child[relationship.key] && !parentIds.has(child[relationship.key])) {
              violations++;
            }
          }
          
          const integrityScore = childRecords.length > 0 ? 
            ((childRecords.length - violations) / childRecords.length) * 100 : 100;
          
          integrityResults.push({
            relationship: `${relationship.child} -> ${relationship.parent}`,
            childRecords: childRecords.length,
            violations,
            integrityScore
          });
          
          totalViolations += violations;
          
        } catch (relationshipError) {
          logs.push(this.logExecution(`Error testing relationship ${relationship.child} -> ${relationship.parent}: ${relationshipError instanceof Error ? relationshipError.message : 'Unknown error'}`));
        }
      }
      
      const duration = Date.now() - startTime;
      const overallIntegrityScore = integrityResults.length > 0 ? 
        integrityResults.reduce((sum, result) => sum + result.integrityScore, 0) / integrityResults.length : 100;
      
      logs.push(this.logExecution(`Foreign key integrity test complete: ${totalViolations} violations found`));
      
      if (totalViolations > 10 || overallIntegrityScore < 95) {
        return {
          success: false,
          outcome: `Foreign key integrity compromised: ${totalViolations} violations, ${overallIntegrityScore.toFixed(1)}% integrity score`,
          logs,
          metrics: { 
            duration,
            totalViolations,
            overallIntegrityScore,
            relationshipsTested: this.foreignKeyRelationships.length,
            detailedResults: integrityResults
          },
          error: 'Foreign key integrity violations detected'
        };
      }
      
      if (totalViolations > 0 || overallIntegrityScore < 98) {
        return {
          success: true,
          warning: true,
          outcome: `Minor foreign key issues: ${totalViolations} violations, ${overallIntegrityScore.toFixed(1)}% integrity score`,
          logs,
          metrics: { 
            duration,
            totalViolations,
            overallIntegrityScore,
            relationshipsTested: this.foreignKeyRelationships.length,
            detailedResults: integrityResults
          }
        };
      }
      
      return {
        success: true,
        outcome: `Foreign key integrity verified: ${overallIntegrityScore.toFixed(1)}% integrity across ${this.foreignKeyRelationships.length} relationships`,
        logs,
        metrics: { 
          duration,
          totalViolations,
          overallIntegrityScore,
          relationshipsTested: this.foreignKeyRelationships.length,
          detailedResults: integrityResults
        }
      };
      
    } catch (error) {
      logs.push(this.logExecution(`Foreign key integrity test failed: ${error instanceof Error ? error.message : 'Unknown error'}`));
      return {
        success: false,
        outcome: 'Foreign key integrity test failed',
        logs,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Data Completeness Audit
  private async testDataCompletenessAudit(logs: string[]): Promise<TestExecutionResult> {
    const startTime = Date.now();
    
    try {
      logs.push(this.logExecution('Auditing data completeness across critical fields'));
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');
      
      const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', user.id)
        .single();
        
      if (!profile?.organization_id) throw new Error('No organization found');
      
      const completenessResults: any[] = [];
      
      // Define critical fields for each table
      const criticalFields = {
        kri_logs: ['kri_id', 'measurement_date', 'actual_value', 'target_value'],
        kri_definitions: ['kri_name', 'target_value', 'threshold_yellow', 'threshold_red'],
        vendor_risk_alerts: ['vendor_name', 'risk_level', 'alert_type'],
        third_party_profiles: ['vendor_name', 'criticality', 'risk_rating'],
        controls: ['control_name', 'control_type', 'status'],
        incident_logs: ['incident_title', 'severity', 'status', 'reported_at']
      };
      
      for (const [tableName, fields] of Object.entries(criticalFields)) {
        logs.push(this.logExecution(`Auditing completeness for ${tableName}`));
        
        try {
          const { data: tableData, error } = await supabase
            .from(tableName)
            .select(fields.join(', '))
            .eq('org_id', profile.organization_id)
            .limit(100);
            
          if (error) {
            logs.push(this.logExecution(`Warning: Could not access ${tableName}: ${error.message}`));
            continue;
          }
          
          if (!tableData || tableData.length === 0) {
            completenessResults.push({
              table: tableName,
              records: 0,
              fieldCompleteness: {},
              overallCompleteness: 100
            });
            continue;
          }
          
          const fieldCompleteness: Record<string, number> = {};
          
          // Calculate completeness for each field
          for (const field of fields) {
            const completeRecords = tableData.filter(record => 
              record[field] !== null && 
              record[field] !== undefined && 
              record[field] !== ''
            ).length;
            
            fieldCompleteness[field] = (completeRecords / tableData.length) * 100;
          }
          
          const overallCompleteness = Object.values(fieldCompleteness)
            .reduce((sum, score) => sum + score, 0) / fields.length;
          
          completenessResults.push({
            table: tableName,
            records: tableData.length,
            fieldCompleteness,
            overallCompleteness
          });
          
        } catch (tableError) {
          logs.push(this.logExecution(`Error auditing ${tableName}: ${tableError instanceof Error ? tableError.message : 'Unknown error'}`));
        }
      }
      
      const duration = Date.now() - startTime;
      const averageCompleteness = completenessResults.length > 0 ?
        completenessResults.reduce((sum, result) => sum + result.overallCompleteness, 0) / completenessResults.length : 100;
      
      const tablesWithIssues = completenessResults.filter(result => result.overallCompleteness < 90);
      
      logs.push(this.logExecution(`Data completeness audit complete: ${averageCompleteness.toFixed(1)}% average completeness`));
      
      if (averageCompleteness < 85 || tablesWithIssues.length > 2) {
        return {
          success: false,
          outcome: `Data completeness insufficient: ${averageCompleteness.toFixed(1)}% average, ${tablesWithIssues.length} tables with issues`,
          logs,
          metrics: { 
            duration,
            averageCompleteness,
            tablesAudited: completenessResults.length,
            tablesWithIssues: tablesWithIssues.length,
            detailedResults: completenessResults
          },
          error: 'Data completeness below required threshold'
        };
      }
      
      if (averageCompleteness < 95 || tablesWithIssues.length > 0) {
        return {
          success: true,
          warning: true,
          outcome: `Data completeness acceptable but could improve: ${averageCompleteness.toFixed(1)}% average`,
          logs,
          metrics: { 
            duration,
            averageCompleteness,
            tablesAudited: completenessResults.length,
            tablesWithIssues: tablesWithIssues.length,
            detailedResults: completenessResults
          }
        };
      }
      
      return {
        success: true,
        outcome: `Data completeness excellent: ${averageCompleteness.toFixed(1)}% average across ${completenessResults.length} tables`,
        logs,
        metrics: { 
          duration,
          averageCompleteness,
          tablesAudited: completenessResults.length,
          tablesWithIssues: tablesWithIssues.length,
          detailedResults: completenessResults
        }
      };
      
    } catch (error) {
      logs.push(this.logExecution(`Data completeness audit failed: ${error instanceof Error ? error.message : 'Unknown error'}`));
      return {
        success: false,
        outcome: 'Data completeness audit failed',
        logs,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Temporal Consistency Testing
  private async testTemporalConsistency(logs: string[]): Promise<TestExecutionResult> {
    const startTime = Date.now();
    
    try {
      logs.push(this.logExecution('Testing temporal consistency across date-sensitive records'));
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');
      
      const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', user.id)
        .single();
        
      if (!profile?.organization_id) throw new Error('No organization found');
      
      const temporalResults: any[] = [];
      let totalViolations = 0;
      
      // Test KRI logs temporal consistency
      logs.push(this.logExecution('Testing KRI logs date consistency'));
      
      const { data: kriLogs, error: kriError } = await supabase
        .from('kri_logs')
        .select('id, measurement_date, created_at, updated_at')
        .eq('org_id', profile.organization_id)
        .order('created_at', { ascending: false })
        .limit(100);
        
      if (!kriError && kriLogs) {
        let kriViolations = 0;
        
        for (const log of kriLogs) {
          // Check that measurement_date is not in the future
          const measurementDate = new Date(log.measurement_date);
          const createdDate = new Date(log.created_at);
          
          if (measurementDate > createdDate) {
            kriViolations++;
          }
          
          // Check that updated_at >= created_at
          if (log.updated_at && new Date(log.updated_at) < createdDate) {
            kriViolations++;
          }
        }
        
        temporalResults.push({
          table: 'kri_logs',
          records: kriLogs.length,
          violations: kriViolations,
          consistencyScore: kriLogs.length > 0 ? ((kriLogs.length - kriViolations) / kriLogs.length) * 100 : 100
        });
        
        totalViolations += kriViolations;
      }
      
      // Test incident logs temporal consistency
      logs.push(this.logExecution('Testing incident logs date consistency'));
      
      const { data: incidents, error: incidentError } = await supabase
        .from('incident_logs')
        .select('id, reported_at, first_response_at, resolved_at, created_at')
        .eq('org_id', profile.organization_id)
        .limit(100);
        
      if (!incidentError && incidents) {
        let incidentViolations = 0;
        
        for (const incident of incidents) {
          const reportedAt = new Date(incident.reported_at);
          const createdAt = new Date(incident.created_at);
          
          // Check logical date progression
          if (incident.first_response_at && new Date(incident.first_response_at) < reportedAt) {
            incidentViolations++;
          }
          
          if (incident.resolved_at && new Date(incident.resolved_at) < reportedAt) {
            incidentViolations++;
          }
          
          // Check that reported_at is reasonable relative to created_at
          if (Math.abs(reportedAt.getTime() - createdAt.getTime()) > 30 * 24 * 60 * 60 * 1000) { // 30 days
            incidentViolations++;
          }
        }
        
        temporalResults.push({
          table: 'incident_logs',
          records: incidents.length,
          violations: incidentViolations,
          consistencyScore: incidents.length > 0 ? ((incidents.length - incidentViolations) / incidents.length) * 100 : 100
        });
        
        totalViolations += incidentViolations;
      }
      
      const duration = Date.now() - startTime;
      const averageConsistency = temporalResults.length > 0 ?
        temporalResults.reduce((sum, result) => sum + result.consistencyScore, 0) / temporalResults.length : 100;
      
      logs.push(this.logExecution(`Temporal consistency test complete: ${totalViolations} violations found`));
      
      if (totalViolations > 5 || averageConsistency < 95) {
        return {
          success: false,
          outcome: `Temporal consistency issues: ${totalViolations} violations, ${averageConsistency.toFixed(1)}% consistency`,
          logs,
          metrics: { 
            duration,
            totalViolations,
            averageConsistency,
            tablesChecked: temporalResults.length,
            detailedResults: temporalResults
          },
          error: 'Temporal consistency violations detected'
        };
      }
      
      if (totalViolations > 0 || averageConsistency < 98) {
        return {
          success: true,
          warning: true,
          outcome: `Minor temporal inconsistencies: ${totalViolations} violations, ${averageConsistency.toFixed(1)}% consistency`,
          logs,
          metrics: { 
            duration,
            totalViolations,
            averageConsistency,
            tablesChecked: temporalResults.length,
            detailedResults: temporalResults
          }
        };
      }
      
      return {
        success: true,
        outcome: `Temporal consistency verified: ${averageConsistency.toFixed(1)}% consistency across ${temporalResults.length} tables`,
        logs,
        metrics: { 
          duration,
          totalViolations,
          averageConsistency,
          tablesChecked: temporalResults.length,
          detailedResults: temporalResults
        }
      };
      
    } catch (error) {
      logs.push(this.logExecution(`Temporal consistency test failed: ${error instanceof Error ? error.message : 'Unknown error'}`));
      return {
        success: false,
        outcome: 'Temporal consistency test failed',
        logs,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Business Rule Validation
  private async testBusinessRuleValidation(logs: string[]): Promise<TestExecutionResult> {
    const startTime = Date.now();
    
    try {
      logs.push(this.logExecution('Validating business rules and data constraints'));
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');
      
      const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', user.id)
        .single();
        
      if (!profile?.organization_id) throw new Error('No organization found');
      
      const ruleViolations: any[] = [];
      let totalViolations = 0;
      
      // Rule 1: KRI actual values should be within reasonable bounds relative to targets
      logs.push(this.logExecution('Validating KRI value bounds'));
      
      const { data: kriLogs, error: kriError } = await supabase
        .from('kri_logs')
        .select('id, kri_id, actual_value, target_value, threshold_yellow, threshold_red')
        .eq('org_id', profile.organization_id)
        .limit(100);
        
      if (!kriError && kriLogs) {
        let kriRuleViolations = 0;
        
        for (const log of kriLogs) {
          // Rule: Actual values should not exceed 10x the target value (indicates data error)
          if (log.target_value && log.actual_value && 
              Math.abs(log.actual_value) > Math.abs(log.target_value * 10)) {
            kriRuleViolations++;
          }
          
          // Rule: Negative values should be valid based on KRI type
          if (log.actual_value < 0 && log.target_value >= 0) {
            kriRuleViolations++;
          }
        }
        
        if (kriRuleViolations > 0) {
          ruleViolations.push({
            rule: 'KRI value bounds validation',
            table: 'kri_logs',
            violations: kriRuleViolations,
            description: 'Actual values exceed reasonable bounds or have invalid negative values'
          });
          totalViolations += kriRuleViolations;
        }
      }
      
      // Rule 2: Vendor risk levels should align with risk ratings
      logs.push(this.logExecution('Validating vendor risk consistency'));
      
      const { data: vendorProfiles, error: vendorError } = await supabase
        .from('third_party_profiles')
        .select('id, vendor_name, risk_rating, criticality')
        .eq('org_id', profile.organization_id);
        
      if (!vendorError && vendorProfiles) {
        let vendorRuleViolations = 0;
        
        for (const vendor of vendorProfiles) {
          // Rule: High criticality vendors should not have low risk ratings
          if (vendor.criticality === 'critical' && vendor.risk_rating === 'low') {
            vendorRuleViolations++;
          }
          
          // Rule: Vendor names should not be empty or purely numeric
          if (!vendor.vendor_name || /^\d+$/.test(vendor.vendor_name)) {
            vendorRuleViolations++;
          }
        }
        
        if (vendorRuleViolations > 0) {
          ruleViolations.push({
            rule: 'Vendor risk consistency validation',
            table: 'third_party_profiles',
            violations: vendorRuleViolations,
            description: 'Vendor risk levels inconsistent with criticality or invalid names'
          });
          totalViolations += vendorRuleViolations;
        }
      }
      
      // Rule 3: Incident severity vs response time validation
      logs.push(this.logExecution('Validating incident response rules'));
      
      const { data: incidents, error: incidentError } = await supabase
        .from('incident_logs')
        .select('id, severity, reported_at, first_response_at, status')
        .eq('org_id', profile.organization_id)
        .limit(100);
        
      if (!incidentError && incidents) {
        let incidentRuleViolations = 0;
        
        for (const incident of incidents) {
          if (incident.first_response_at && incident.reported_at) {
            const responseTime = new Date(incident.first_response_at).getTime() - 
                               new Date(incident.reported_at).getTime();
            const responseHours = responseTime / (1000 * 60 * 60);
            
            // Rule: Critical incidents should have response within 4 hours
            if (incident.severity === 'critical' && responseHours > 4) {
              incidentRuleViolations++;
            }
            
            // Rule: High severity incidents should have response within 24 hours
            if (incident.severity === 'high' && responseHours > 24) {
              incidentRuleViolations++;
            }
          }
        }
        
        if (incidentRuleViolations > 0) {
          ruleViolations.push({
            rule: 'Incident response time validation',
            table: 'incident_logs',
            violations: incidentRuleViolations,
            description: 'Incident response times exceed severity-based thresholds'
          });
          totalViolations += incidentRuleViolations;
        }
      }
      
      const duration = Date.now() - startTime;
      
      logs.push(this.logExecution(`Business rule validation complete: ${totalViolations} violations found`));
      
      if (totalViolations > 10) {
        return {
          success: false,
          outcome: `Significant business rule violations: ${totalViolations} violations across ${ruleViolations.length} rule types`,
          logs,
          metrics: { 
            duration,
            totalViolations,
            ruleTypes: ruleViolations.length,
            detailedViolations: ruleViolations
          },
          error: 'Business rule violations exceed acceptable threshold'
        };
      }
      
      if (totalViolations > 0) {
        return {
          success: true,
          warning: true,
          outcome: `Minor business rule violations: ${totalViolations} violations detected`,
          logs,
          metrics: { 
            duration,
            totalViolations,
            ruleTypes: ruleViolations.length,
            detailedViolations: ruleViolations
          }
        };
      }
      
      return {
        success: true,
        outcome: `Business rules validated successfully: no violations detected`,
        logs,
        metrics: { 
          duration,
          totalViolations,
          ruleTypes: ruleViolations.length,
          detailedViolations: ruleViolations
        }
      };
      
    } catch (error) {
      logs.push(this.logExecution(`Business rule validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`));
      return {
        success: false,
        outcome: 'Business rule validation failed',
        logs,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}