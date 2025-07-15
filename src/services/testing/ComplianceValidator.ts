import { supabase } from '@/integrations/supabase/client';
import { TestExecutionResult } from './WorkflowTestSuite';

export class ComplianceValidator {
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
    logs.push(this.logExecution(`Starting compliance test: ${testName}`));

    try {
      switch (testId) {
        case 'osfi-e21-compliance':
          return await this.testOSFIE21Compliance(logs);
        case 'rls-security-policies':
          return await this.testRLSSecurityPolicies(logs);
        default:
          throw new Error(`Unknown compliance test: ${testId}`);
      }
    } catch (error) {
      logs.push(this.logExecution(`Test failed with error: ${error instanceof Error ? error.message : 'Unknown error'}`));
      return {
        success: false,
        outcome: 'Compliance test execution failed',
        logs,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private async testOSFIE21Compliance(logs: string[]): Promise<TestExecutionResult> {
    try {
      logs.push(this.logExecution('Step 1: Checking OSFI E-21 vendor risk management requirements'));
      
      // Get user context
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

      logs.push(this.logExecution('Step 2: Validating vendor risk assessment framework'));
      
      // Check for vendor risk profiles (E-21 requires comprehensive vendor assessments)
      const { data: vendorProfiles, error: vendorError } = await supabase
        .from('third_party_profiles')
        .select(`
          id,
          vendor_name,
          criticality,
          risk_assessment_date,
          last_assessment_score,
          contract_end_date,
          sla_requirements
        `)
        .eq('org_id', profile.organization_id);

      if (vendorError) {
        throw new Error(`Failed to fetch vendor profiles: ${vendorError.message}`);
      }

      logs.push(this.logExecution('Step 3: Checking risk monitoring and alerting'));
      
      // Check for risk alerts and monitoring (E-21 requires ongoing monitoring)
      const { data: riskAlerts, error: alertsError } = await supabase
        .from('vendor_risk_alerts')
        .select(`
          id,
          risk_level,
          alert_type,
          created_at,
          resolved_at
        `)
        .eq('org_id', profile.organization_id)
        .order('created_at', { ascending: false })
        .limit(50);

      if (alertsError) {
        throw new Error(`Failed to fetch risk alerts: ${alertsError.message}`);
      }

      logs.push(this.logExecution('Step 4: Analyzing compliance with E-21 requirements'));
      
      const complianceMetrics = {
        totalVendors: vendorProfiles?.length || 0,
        vendorsWithRiskAssessments: 0,
        vendorsWithRecentAssessments: 0,
        criticalVendors: 0,
        totalRiskAlerts: riskAlerts?.length || 0,
        resolvedAlerts: 0,
        complianceScore: 0
      };

      // Analyze vendor profiles for E-21 compliance
      if (vendorProfiles) {
        const currentDate = new Date();
        const oneYearAgo = new Date(currentDate.getFullYear() - 1, currentDate.getMonth(), currentDate.getDate());

        for (const vendor of vendorProfiles) {
          if (vendor.last_assessment_score !== null) {
            complianceMetrics.vendorsWithRiskAssessments++;
          }

          if (vendor.risk_assessment_date) {
            const assessmentDate = new Date(vendor.risk_assessment_date);
            if (assessmentDate > oneYearAgo) {
              complianceMetrics.vendorsWithRecentAssessments++;
            }
          }

          if (vendor.criticality === 'critical' || vendor.criticality === 'high') {
            complianceMetrics.criticalVendors++;
          }
        }
      }

      // Analyze risk alerts
      if (riskAlerts) {
        complianceMetrics.resolvedAlerts = riskAlerts.filter(alert => alert.resolved_at).length;
      }

      // Calculate overall compliance score
      let scoreComponents = 0;
      let maxComponents = 4;

      // Component 1: Vendor risk assessments (25%)
      if (complianceMetrics.totalVendors > 0) {
        scoreComponents += (complianceMetrics.vendorsWithRiskAssessments / complianceMetrics.totalVendors) * 25;
      } else {
        scoreComponents += 25; // No vendors is compliant
      }

      // Component 2: Recent assessments (25%)
      if (complianceMetrics.totalVendors > 0) {
        scoreComponents += (complianceMetrics.vendorsWithRecentAssessments / complianceMetrics.totalVendors) * 25;
      } else {
        scoreComponents += 25;
      }

      // Component 3: Risk monitoring (25%)
      if (complianceMetrics.criticalVendors > 0 && complianceMetrics.totalRiskAlerts > 0) {
        scoreComponents += 25;
      } else if (complianceMetrics.criticalVendors === 0) {
        scoreComponents += 25; // No critical vendors is fine
      }

      // Component 4: Alert resolution (25%)
      if (complianceMetrics.totalRiskAlerts > 0) {
        scoreComponents += (complianceMetrics.resolvedAlerts / complianceMetrics.totalRiskAlerts) * 25;
      } else {
        scoreComponents += 25; // No alerts is compliant
      }

      complianceMetrics.complianceScore = scoreComponents;

      logs.push(this.logExecution(`OSFI E-21 compliance analysis complete: ${complianceMetrics.complianceScore.toFixed(1)}% compliance score`));

      if (complianceMetrics.complianceScore < 70) {
        return {
          success: false,
          outcome: `OSFI E-21 compliance score ${complianceMetrics.complianceScore.toFixed(1)}% below minimum 70% threshold`,
          logs,
          metrics: complianceMetrics,
          error: 'Compliance threshold not met'
        };
      }

      if (complianceMetrics.complianceScore < 85) {
        return {
          success: true,
          warning: true,
          outcome: `OSFI E-21 compliance score ${complianceMetrics.complianceScore.toFixed(1)}% meets minimum but below recommended 85%`,
          logs,
          metrics: complianceMetrics
        };
      }

      return {
        success: true,
        outcome: `OSFI E-21 compliance verified - ${complianceMetrics.complianceScore.toFixed(1)}% compliance score with ${complianceMetrics.totalVendors} vendors assessed`,
        logs,
        metrics: complianceMetrics
      };

    } catch (error) {
      logs.push(this.logExecution(`OSFI E-21 compliance test failed: ${error instanceof Error ? error.message : 'Unknown error'}`));
      return {
        success: false,
        outcome: 'OSFI E-21 compliance validation failed',
        logs,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private async testRLSSecurityPolicies(logs: string[]): Promise<TestExecutionResult> {
    try {
      logs.push(this.logExecution('Step 1: Testing Row Level Security policy enforcement'));
      
      // Get current user
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

      logs.push(this.logExecution('Step 2: Testing data isolation between organizations'));
      
      const securityTests = [
        {
          name: 'Controls Data Isolation',
          table: 'controls',
          expectOrgFiltered: true
        },
        {
          name: 'KRI Logs Data Isolation',
          table: 'kri_logs',
          expectOrgFiltered: true
        },
        {
          name: 'Vendor Profiles Data Isolation',
          table: 'third_party_profiles',
          expectOrgFiltered: true
        },
        {
          name: 'Risk Alerts Data Isolation',
          table: 'vendor_risk_alerts',
          expectOrgFiltered: true
        }
      ];

      const testResults: Array<{
        testName: string;
        accessGranted: boolean;
        recordCount: number;
        orgFiltered: boolean;
        success: boolean;
      }> = [];

      for (const test of securityTests) {
        try {
          logs.push(this.logExecution(`Testing ${test.name}...`));
          
          // Attempt to access data without explicit org filter
          const { data, error } = await supabase
            .from(test.table)
            .select('id, org_id')
            .limit(100);

          if (error) {
            logs.push(this.logExecution(`${test.name} access denied: ${error.message}`));
            testResults.push({
              testName: test.name,
              accessGranted: false,
              recordCount: 0,
              orgFiltered: false,
              success: error.message.includes('policy') || error.message.includes('RLS')
            });
          } else {
            const recordCount = data?.length || 0;
            
            // Check if all records belong to user's org (RLS working correctly)
            const orgFiltered = data?.every(record => record.org_id === profile.organization_id) || recordCount === 0;
            
            logs.push(this.logExecution(`${test.name} returned ${recordCount} records, org filtered: ${orgFiltered}`));
            
            testResults.push({
              testName: test.name,
              accessGranted: true,
              recordCount,
              orgFiltered,
              success: orgFiltered
            });
          }
        } catch (error) {
          logs.push(this.logExecution(`${test.name} exception: ${error instanceof Error ? error.message : 'Unknown error'}`));
          testResults.push({
            testName: test.name,
            accessGranted: false,
            recordCount: 0,
            orgFiltered: false,
            success: false
          });
        }
      }

      logs.push(this.logExecution('Step 3: Analyzing RLS policy effectiveness'));
      
      const successfulTests = testResults.filter(t => t.success);
      const failedTests = testResults.filter(t => !t.success);
      const securityScore = (successfulTests.length / testResults.length) * 100;

      const metrics = {
        totalTests: testResults.length,
        successfulTests: successfulTests.length,
        failedTests: failedTests.length,
        securityScore,
        testResults
      };

      logs.push(this.logExecution(`RLS security analysis complete: ${securityScore.toFixed(1)}% of tests passed`));

      if (failedTests.length > 0) {
        const failedTestNames = failedTests.map(t => t.testName).join(', ');
        return {
          success: false,
          outcome: `RLS security failures detected in: ${failedTestNames}`,
          logs,
          metrics,
          error: 'Data isolation violations detected'
        };
      }

      return {
        success: true,
        outcome: `RLS security policies enforced correctly - ${securityScore.toFixed(1)}% of tests passed with proper data isolation`,
        logs,
        metrics
      };

    } catch (error) {
      logs.push(this.logExecution(`RLS security test failed: ${error instanceof Error ? error.message : 'Unknown error'}`));
      return {
        success: false,
        outcome: 'RLS security policy validation failed',
        logs,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}