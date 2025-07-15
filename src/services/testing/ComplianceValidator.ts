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

  // Compliance frameworks and requirements
  private readonly complianceFrameworks = {
    osfi: {
      e21: {
        name: 'OSFI E-21 Technology and Cyber Risk Management',
        requirements: [
          'Vendor Risk Management',
          'Third Party Due Diligence', 
          'Ongoing Monitoring',
          'Incident Response',
          'Data Protection',
          'Business Continuity'
        ],
        minimumScore: 70,
        recommendedScore: 85
      }
    },
    sox: {
      requirements: [
        'Financial Controls',
        'IT General Controls',
        'Access Management',
        'Change Management',
        'Data Integrity'
      ],
      minimumScore: 90
    },
    iso27001: {
      requirements: [
        'Information Security Policy',
        'Risk Management',
        'Asset Management',
        'Access Control',
        'Incident Management'
      ],
      minimumScore: 80
    }
  };

  async runTest(testId: string, testName: string): Promise<TestExecutionResult> {
    const logs: string[] = [];
    logs.push(this.logExecution(`Starting compliance test: ${testName}`));

    try {
      switch (testId) {
        case 'osfi-e21-compliance':
          return await this.testOSFIE21Compliance(logs);
        case 'rls-security-policies':
          return await this.testRLSSecurityPolicies(logs);
        case 'regulatory-framework-coverage':
          return await this.testRegulatoryFrameworkCoverage(logs);
        case 'data-privacy-compliance':
          return await this.testDataPrivacyCompliance(logs);
        case 'audit-trail-integrity':
          return await this.testAuditTrailIntegrity(logs);
        case 'access-control-validation':
          return await this.testAccessControlValidation(logs);
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

  private async testRegulatoryFrameworkCoverage(logs: string[]): Promise<TestExecutionResult> {
    try {
      logs.push(this.logExecution('Step 1: Analyzing regulatory framework coverage and implementation'));
      
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

      logs.push(this.logExecution('Step 2: Checking compliance framework implementation'));

      // Check compliance frameworks
      const { data: frameworks, error: frameworksError } = await supabase
        .from('compliance_frameworks')
        .select(`
          id,
          framework_name,
          framework_version,
          is_active,
          assessment_frequency,
          requirements,
          controls
        `)
        .eq('org_id', profile.organization_id);

      if (frameworksError) {
        throw new Error(`Failed to fetch compliance frameworks: ${frameworksError.message}`);
      }

      // Check compliance policies
      const { data: policies, error: policiesError } = await supabase
        .from('compliance_policies')
        .select(`
          id,
          policy_name,
          framework,
          is_active,
          check_frequency,
          severity,
          auto_remediation
        `)
        .eq('org_id', profile.organization_id);

      if (policiesError) {
        throw new Error(`Failed to fetch compliance policies: ${policiesError.message}`);
      }

      // Check compliance checks and violations
      const { data: checks, error: checksError } = await supabase
        .from('compliance_checks')
        .select(`
          id,
          policy_id,
          check_result,
          compliance_score,
          remediation_status,
          checked_at
        `)
        .eq('org_id', profile.organization_id)
        .order('checked_at', { ascending: false })
        .limit(100);

      if (checksError) {
        throw new Error(`Failed to fetch compliance checks: ${checksError.message}`);
      }

      logs.push(this.logExecution('Step 3: Analyzing framework coverage and gaps'));

      const coverageMetrics = {
        totalFrameworks: frameworks?.length || 0,
        activeFrameworks: 0,
        totalPolicies: policies?.length || 0,
        activePolicies: 0,
        totalChecks: checks?.length || 0,
        passedChecks: 0,
        averageComplianceScore: 0,
        frameworkCoverage: {} as Record<string, any>,
        gapsIdentified: [] as string[]
      };

      // Analyze framework coverage
      if (frameworks) {
        coverageMetrics.activeFrameworks = frameworks.filter(f => f.is_active).length;
        
        for (const framework of frameworks) {
          const frameworkPolicies = policies?.filter(p => p.framework === framework.framework_name) || [];
          const frameworkChecks = checks?.filter(c => 
            frameworkPolicies.some(p => p.id === c.policy_id)
          ) || [];
          
          coverageMetrics.frameworkCoverage[framework.framework_name] = {
            isActive: framework.is_active,
            policiesCount: frameworkPolicies.length,
            activePoliciesCount: frameworkPolicies.filter(p => p.is_active).length,
            checksCount: frameworkChecks.length,
            lastCheckDate: frameworkChecks[0]?.checked_at || null
          };
        }
      }

      // Analyze policies
      if (policies) {
        coverageMetrics.activePolicies = policies.filter(p => p.is_active).length;
      }

      // Analyze compliance checks
      if (checks) {
        coverageMetrics.passedChecks = checks.filter(c => c.check_result === 'pass').length;
        
        const scoresWithValues = checks.filter(c => c.compliance_score !== null && c.compliance_score !== undefined);
        if (scoresWithValues.length > 0) {
          coverageMetrics.averageComplianceScore = scoresWithValues.reduce((sum, c) => sum + c.compliance_score, 0) / scoresWithValues.length;
        }
      }

      // Identify gaps
      const requiredFrameworks = ['OSFI E-21', 'SOX', 'ISO 27001'];
      for (const required of requiredFrameworks) {
        const hasFramework = frameworks?.some(f => f.framework_name.includes(required.split(' ')[0]));
        if (!hasFramework) {
          coverageMetrics.gapsIdentified.push(`Missing ${required} framework implementation`);
        }
      }

      if (coverageMetrics.totalPolicies === 0) {
        coverageMetrics.gapsIdentified.push('No compliance policies defined');
      }

      if (coverageMetrics.totalChecks === 0) {
        coverageMetrics.gapsIdentified.push('No compliance checks executed');
      }

      const passRate = coverageMetrics.totalChecks > 0 
        ? (coverageMetrics.passedChecks / coverageMetrics.totalChecks) * 100 
        : 0;

      logs.push(this.logExecution(`Framework coverage analysis: ${coverageMetrics.activeFrameworks} active frameworks, ${passRate.toFixed(1)}% check pass rate`));

      // Determine compliance status
      if (coverageMetrics.totalFrameworks === 0) {
        return {
          success: false,
          outcome: 'No regulatory frameworks implemented',
          logs,
          metrics: coverageMetrics,
          error: 'Regulatory framework coverage insufficient'
        };
      }

      if (passRate < 80) {
        return {
          success: false,
          outcome: `Compliance check pass rate ${passRate.toFixed(1)}% below 80% threshold`,
          logs,
          metrics: coverageMetrics,
          error: 'Compliance performance below threshold'
        };
      }

      if (coverageMetrics.gapsIdentified.length > 0) {
        return {
          success: true,
          warning: true,
          outcome: `Framework coverage adequate but gaps identified: ${coverageMetrics.gapsIdentified.length} gaps`,
          logs,
          metrics: coverageMetrics
        };
      }

      return {
        success: true,
        outcome: `Regulatory framework coverage complete - ${coverageMetrics.activeFrameworks} frameworks, ${passRate.toFixed(1)}% pass rate`,
        logs,
        metrics: coverageMetrics
      };

    } catch (error) {
      logs.push(this.logExecution(`Framework coverage test failed: ${error instanceof Error ? error.message : 'Unknown error'}`));
      return {
        success: false,
        outcome: 'Regulatory framework coverage validation failed',
        logs,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private async testDataPrivacyCompliance(logs: string[]): Promise<TestExecutionResult> {
    try {
      logs.push(this.logExecution('Step 1: Testing data privacy and protection compliance'));
      
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

      logs.push(this.logExecution('Step 2: Checking data classification and protection'));

      // Check data classifications
      const { data: classifications, error: classError } = await supabase
        .from('data_classifications')
        .select(`
          id,
          classification_name,
          protection_level,
          retention_period_days,
          data_patterns,
          handling_requirements
        `)
        .eq('org_id', profile.organization_id);

      if (classError) {
        logs.push(this.logExecution(`Data classifications check failed: ${classError.message}`));
      }

      // Check authentication and session management
      const { data: authSettings, error: authError } = await supabase
        .from('auth_settings')
        .select(`
          id,
          mfa_enforced,
          session_timeout_minutes,
          password_policy,
          ip_whitelist
        `)
        .eq('org_id', profile.organization_id);

      if (authError) {
        logs.push(this.logExecution(`Auth settings check failed: ${authError.message}`));
      }

      // Check user roles and permissions
      const { data: userRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select(`
          id,
          user_id,
          role,
          organization_id
        `)
        .eq('organization_id', profile.organization_id);

      if (rolesError) {
        logs.push(this.logExecution(`User roles check failed: ${rolesError.message}`));
      }

      logs.push(this.logExecution('Step 3: Analyzing privacy controls and compliance'));

      const privacyMetrics = {
        dataClassifications: classifications?.length || 0,
        mfaEnforced: authSettings?.[0]?.mfa_enforced || false,
        sessionTimeoutConfigured: (authSettings?.[0]?.session_timeout_minutes || 0) > 0,
        passwordPolicyStrength: 0,
        ipWhitelistConfigured: false,
        totalUsers: userRoles?.length || 0,
        usersWithRoles: 0,
        privacyScore: 0,
        violations: [] as string[]
      };

      // Analyze authentication settings
      if (authSettings?.[0]) {
        const auth = authSettings[0];
        
        // Check password policy strength
        if (auth.password_policy) {
          const policy = auth.password_policy as any;
          let strength = 0;
          if (policy.min_length >= 8) strength += 20;
          if (policy.require_uppercase) strength += 20;
          if (policy.require_numbers) strength += 20;
          if (policy.require_symbols) strength += 20;
          if (policy.min_length >= 12) strength += 20;
          privacyMetrics.passwordPolicyStrength = strength;
        }

        // Check IP whitelist
        privacyMetrics.ipWhitelistConfigured = auth.ip_whitelist && Array.isArray(auth.ip_whitelist) && auth.ip_whitelist.length > 0;
      }

      // Analyze user roles
      if (userRoles) {
        privacyMetrics.usersWithRoles = userRoles.filter(r => r.role && r.role !== 'user').length;
      }

      // Calculate privacy score
      let scoreComponents = 0;
      let maxComponents = 6;

      // Data classification (15%)
      if (privacyMetrics.dataClassifications > 0) {
        scoreComponents += 15;
      } else {
        privacyMetrics.violations.push('No data classifications defined');
      }

      // MFA enforcement (25%)
      if (privacyMetrics.mfaEnforced) {
        scoreComponents += 25;
      } else {
        privacyMetrics.violations.push('MFA not enforced');
      }

      // Session timeout (15%)
      if (privacyMetrics.sessionTimeoutConfigured) {
        scoreComponents += 15;
      } else {
        privacyMetrics.violations.push('Session timeout not configured');
      }

      // Password policy (20%)
      if (privacyMetrics.passwordPolicyStrength >= 80) {
        scoreComponents += 20;
      } else if (privacyMetrics.passwordPolicyStrength >= 60) {
        scoreComponents += 15;
        privacyMetrics.violations.push('Password policy could be stronger');
      } else {
        privacyMetrics.violations.push('Weak password policy');
      }

      // Role-based access (15%)
      if (privacyMetrics.totalUsers > 0 && (privacyMetrics.usersWithRoles / privacyMetrics.totalUsers) >= 0.5) {
        scoreComponents += 15;
      } else {
        privacyMetrics.violations.push('Insufficient role-based access control');
      }

      // IP restrictions (10%)
      if (privacyMetrics.ipWhitelistConfigured) {
        scoreComponents += 10;
      } else {
        privacyMetrics.violations.push('IP whitelist not configured');
      }

      privacyMetrics.privacyScore = scoreComponents;

      logs.push(this.logExecution(`Data privacy analysis: ${privacyMetrics.privacyScore}% compliance with ${privacyMetrics.violations.length} violations`));

      if (privacyMetrics.privacyScore < 70) {
        return {
          success: false,
          outcome: `Data privacy compliance ${privacyMetrics.privacyScore}% below 70% threshold`,
          logs,
          metrics: privacyMetrics,
          error: 'Privacy compliance insufficient'
        };
      }

      if (privacyMetrics.violations.length > 2) {
        return {
          success: true,
          warning: true,
          outcome: `Data privacy compliance adequate but ${privacyMetrics.violations.length} violations identified`,
          logs,
          metrics: privacyMetrics
        };
      }

      return {
        success: true,
        outcome: `Data privacy compliance verified - ${privacyMetrics.privacyScore}% score with ${privacyMetrics.violations.length} violations`,
        logs,
        metrics: privacyMetrics
      };

    } catch (error) {
      logs.push(this.logExecution(`Data privacy compliance test failed: ${error instanceof Error ? error.message : 'Unknown error'}`));
      return {
        success: false,
        outcome: 'Data privacy compliance validation failed',
        logs,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private async testAuditTrailIntegrity(logs: string[]): Promise<TestExecutionResult> {
    try {
      logs.push(this.logExecution('Step 1: Testing audit trail completeness and integrity'));
      
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

      logs.push(this.logExecution('Step 2: Checking audit log coverage and retention'));

      // Check audit logs
      const { data: auditLogs, error: auditError } = await supabase
        .from('audit_log')
        .select(`
          id,
          action_type,
          module,
          success,
          created_at,
          user_id,
          user_name
        `)
        .eq('org_id', profile.organization_id)
        .order('created_at', { ascending: false })
        .limit(500);

      if (auditError) {
        throw new Error(`Failed to fetch audit logs: ${auditError.message}`);
      }

      // Check admin logs
      const { data: adminLogs, error: adminError } = await supabase
        .from('admin_logs')
        .select(`
          id,
          action_type,
          resource_type,
          admin_user_name,
          created_at
        `)
        .eq('org_id', profile.organization_id)
        .order('created_at', { ascending: false })
        .limit(100);

      if (adminError) {
        logs.push(this.logExecution(`Admin logs check failed: ${adminError.message}`));
      }

      // Check audit trails
      const { data: auditTrails, error: trailsError } = await supabase
        .from('audit_trails')
        .select(`
          id,
          action_type,
          entity_type,
          module_name,
          timestamp,
          user_name
        `)
        .eq('org_id', profile.organization_id)
        .order('timestamp', { ascending: false })
        .limit(200);

      if (trailsError) {
        logs.push(this.logExecution(`Audit trails check failed: ${trailsError.message}`));
      }

      logs.push(this.logExecution('Step 3: Analyzing audit trail integrity and compliance'));

      const auditMetrics = {
        totalAuditLogs: auditLogs?.length || 0,
        totalAdminLogs: adminLogs?.length || 0,
        totalAuditTrails: auditTrails?.length || 0,
        successfulActions: 0,
        failedActions: 0,
        uniqueUsers: new Set<string>(),
        modulesCovered: new Set<string>(),
        actionTypesCovered: new Set<string>(),
        retentionCompliance: false,
        integrityScore: 0,
        gaps: [] as string[]
      };

      // Analyze audit logs
      if (auditLogs) {
        auditMetrics.successfulActions = auditLogs.filter(log => log.success).length;
        auditMetrics.failedActions = auditLogs.filter(log => !log.success).length;
        
        auditLogs.forEach(log => {
          if (log.user_name) auditMetrics.uniqueUsers.add(log.user_name);
          if (log.module) auditMetrics.modulesCovered.add(log.module);
          if (log.action_type) auditMetrics.actionTypesCovered.add(log.action_type);
        });
      }

      // Check retention policy (logs should span at least 90 days)
      if (auditLogs && auditLogs.length > 0) {
        const oldestLog = auditLogs[auditLogs.length - 1];
        const oldestDate = new Date(oldestLog.created_at);
        const ninetyDaysAgo = new Date();
        ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
        
        auditMetrics.retentionCompliance = oldestDate <= ninetyDaysAgo;
      }

      // Calculate integrity score
      let scoreComponents = 0;
      let maxComponents = 7;

      // Audit log presence (20%)
      if (auditMetrics.totalAuditLogs > 0) {
        scoreComponents += 20;
      } else {
        auditMetrics.gaps.push('No audit logs found');
      }

      // Admin activity logging (15%)
      if (auditMetrics.totalAdminLogs > 0) {
        scoreComponents += 15;
      } else {
        auditMetrics.gaps.push('No admin activity logs');
      }

      // User activity diversity (15%)
      if (auditMetrics.uniqueUsers.size >= 2) {
        scoreComponents += 15;
      } else if (auditMetrics.uniqueUsers.size === 1) {
        scoreComponents += 10;
        auditMetrics.gaps.push('Limited user activity diversity');
      } else {
        auditMetrics.gaps.push('No user activity logged');
      }

      // Module coverage (15%)
      if (auditMetrics.modulesCovered.size >= 3) {
        scoreComponents += 15;
      } else if (auditMetrics.modulesCovered.size >= 2) {
        scoreComponents += 10;
        auditMetrics.gaps.push('Limited module coverage in audit logs');
      } else {
        auditMetrics.gaps.push('Insufficient module coverage');
      }

      // Action type diversity (10%)
      if (auditMetrics.actionTypesCovered.size >= 5) {
        scoreComponents += 10;
      } else if (auditMetrics.actionTypesCovered.size >= 3) {
        scoreComponents += 5;
      }

      // Retention compliance (15%)
      if (auditMetrics.retentionCompliance) {
        scoreComponents += 15;
      } else {
        auditMetrics.gaps.push('Audit log retention period insufficient');
      }

      // Error logging (10%)
      if (auditMetrics.failedActions > 0) {
        scoreComponents += 10;
      } else {
        auditMetrics.gaps.push('No failed actions logged (may indicate incomplete logging)');
      }

      auditMetrics.integrityScore = (scoreComponents / maxComponents) * 100;

      logs.push(this.logExecution(`Audit trail integrity: ${auditMetrics.integrityScore.toFixed(1)}% with ${auditMetrics.gaps.length} gaps identified`));

      if (auditMetrics.integrityScore < 75) {
        return {
          success: false,
          outcome: `Audit trail integrity ${auditMetrics.integrityScore.toFixed(1)}% below 75% threshold`,
          logs,
          metrics: auditMetrics,
          error: 'Audit trail integrity insufficient'
        };
      }

      if (auditMetrics.gaps.length > 2) {
        return {
          success: true,
          warning: true,
          outcome: `Audit trail integrity adequate but ${auditMetrics.gaps.length} gaps identified`,
          logs,
          metrics: auditMetrics
        };
      }

      return {
        success: true,
        outcome: `Audit trail integrity verified - ${auditMetrics.integrityScore.toFixed(1)}% score with comprehensive logging`,
        logs,
        metrics: auditMetrics
      };

    } catch (error) {
      logs.push(this.logExecution(`Audit trail integrity test failed: ${error instanceof Error ? error.message : 'Unknown error'}`));
      return {
        success: false,
        outcome: 'Audit trail integrity validation failed',
        logs,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  private async testAccessControlValidation(logs: string[]): Promise<TestExecutionResult> {
    try {
      logs.push(this.logExecution('Step 1: Testing access control mechanisms and authorization'));
      
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

      logs.push(this.logExecution('Step 2: Checking role-based access control implementation'));

      // Check user roles distribution
      const { data: userRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select(`
          id,
          user_id,
          role,
          role_type,
          organization_id
        `)
        .eq('organization_id', profile.organization_id);

      if (rolesError) {
        throw new Error(`Failed to fetch user roles: ${rolesError.message}`);
      }

      // Check authentication sessions
      const { data: sessions, error: sessionsError } = await supabase
        .from('authentication_sessions')
        .select(`
          id,
          user_id,
          is_active,
          risk_score,
          authentication_factors,
          expires_at,
          last_activity_at
        `)
        .eq('org_id', profile.organization_id)
        .order('last_activity_at', { ascending: false })
        .limit(50);

      if (sessionsError) {
        logs.push(this.logExecution(`Sessions check failed: ${sessionsError.message}`));
      }

      // Test specific access controls with actual queries
      logs.push(this.logExecution('Step 3: Testing functional access controls'));

      const accessTests = [
        {
          name: 'Admin Functions Access',
          test: async () => {
            try {
              const { data, error } = await supabase
                .from('admin_logs')
                .select('id')
                .limit(1);
              return { hasAccess: !error, error: error?.message };
            } catch (e) {
              return { hasAccess: false, error: e instanceof Error ? e.message : 'Unknown error' };
            }
          }
        },
        {
          name: 'User Management Access',
          test: async () => {
            try {
              const { data, error } = await supabase
                .from('user_roles')
                .select('id')
                .eq('organization_id', profile.organization_id)
                .limit(1);
              return { hasAccess: !error, error: error?.message };
            } catch (e) {
              return { hasAccess: false, error: e instanceof Error ? e.message : 'Unknown error' };
            }
          }
        },
        {
          name: 'Cross-Org Data Access',
          test: async () => {
            try {
              // Try to access data from other organizations (should fail)
              const { data, error } = await supabase
                .from('controls')
                .select('id, org_id')
                .neq('org_id', profile.organization_id)
                .limit(1);
              
              // Access should be denied or return no results
              return { 
                hasAccess: false, // We want this to fail for security
                properlyRestricted: !data || data.length === 0,
                error: error?.message
              };
            } catch (e) {
              return { 
                hasAccess: false, 
                properlyRestricted: true,
                error: e instanceof Error ? e.message : 'Unknown error' 
              };
            }
          }
        }
      ];

      const accessResults: Array<{
        testName: string;
        passed: boolean;
        hasAccess: boolean;
        properlyRestricted?: boolean;
        error?: string;
      }> = [];

      for (const test of accessTests) {
        try {
          const result = await test.test();
          const passed = test.name === 'Cross-Org Data Access' 
            ? (result as any).properlyRestricted 
            : result.hasAccess;
            
          accessResults.push({
            testName: test.name,
            passed,
            hasAccess: result.hasAccess,
            properlyRestricted: (result as any).properlyRestricted,
            error: result.error
          });
          
          logs.push(this.logExecution(`${test.name}: ${passed ? 'PASS' : 'FAIL'}`));
        } catch (error) {
          accessResults.push({
            testName: test.name,
            passed: false,
            hasAccess: false,
            error: error instanceof Error ? error.message : 'Unknown error'
          });
          logs.push(this.logExecution(`${test.name}: ERROR - ${error instanceof Error ? error.message : 'Unknown error'}`));
        }
      }

      logs.push(this.logExecution('Step 4: Analyzing access control effectiveness'));

      const accessMetrics = {
        totalUsers: userRoles?.length || 0,
        adminUsers: 0,
        regularUsers: 0,
        activeSessions: 0,
        highRiskSessions: 0,
        accessTestsPassed: 0,
        accessTestsFailed: 0,
        accessControlScore: 0,
        roleDistribution: {} as Record<string, number>,
        securityIssues: [] as string[]
      };

      // Analyze user roles
      if (userRoles) {
        for (const role of userRoles) {
          if (role.role === 'admin' || role.role === 'super_admin') {
            accessMetrics.adminUsers++;
          } else {
            accessMetrics.regularUsers++;
          }
          
          accessMetrics.roleDistribution[role.role] = (accessMetrics.roleDistribution[role.role] || 0) + 1;
        }
      }

      // Analyze sessions
      if (sessions) {
        accessMetrics.activeSessions = sessions.filter(s => s.is_active).length;
        accessMetrics.highRiskSessions = sessions.filter(s => s.risk_score > 70).length;
      }

      // Analyze access tests
      accessMetrics.accessTestsPassed = accessResults.filter(r => r.passed).length;
      accessMetrics.accessTestsFailed = accessResults.filter(r => !r.passed).length;

      // Calculate access control score
      let scoreComponents = 0;
      let maxComponents = 6;

      // Role segregation (20%)
      if (accessMetrics.totalUsers > 0) {
        const adminRatio = accessMetrics.adminUsers / accessMetrics.totalUsers;
        if (adminRatio <= 0.2 && adminRatio > 0) {
          scoreComponents += 20;
        } else if (adminRatio > 0.2) {
          scoreComponents += 10;
          accessMetrics.securityIssues.push('Too many admin users (>20%)');
        } else {
          accessMetrics.securityIssues.push('No admin users found');
        }
      }

      // Access test results (30%)
      if (accessMetrics.accessTestsPassed === accessResults.length) {
        scoreComponents += 30;
      } else if (accessMetrics.accessTestsPassed >= accessResults.length * 0.8) {
        scoreComponents += 20;
        accessMetrics.securityIssues.push('Some access control tests failed');
      } else {
        accessMetrics.securityIssues.push('Multiple access control failures');
      }

      // Session security (20%)
      if (accessMetrics.activeSessions > 0) {
        const riskRatio = accessMetrics.highRiskSessions / accessMetrics.activeSessions;
        if (riskRatio <= 0.1) {
          scoreComponents += 20;
        } else if (riskRatio <= 0.2) {
          scoreComponents += 15;
          accessMetrics.securityIssues.push('Some high-risk sessions detected');
        } else {
          scoreComponents += 5;
          accessMetrics.securityIssues.push('High number of risky sessions');
        }
      } else {
        scoreComponents += 20; // No sessions is secure
      }

      // Role diversity (10%)
      if (Object.keys(accessMetrics.roleDistribution).length >= 2) {
        scoreComponents += 10;
      } else {
        accessMetrics.securityIssues.push('Insufficient role diversity');
      }

      // Data isolation (20%)
      const crossOrgTest = accessResults.find(r => r.testName === 'Cross-Org Data Access');
      if (crossOrgTest?.properlyRestricted) {
        scoreComponents += 20;
      } else {
        accessMetrics.securityIssues.push('Cross-organization data leakage risk');
      }

      accessMetrics.accessControlScore = (scoreComponents / maxComponents) * 100;

      logs.push(this.logExecution(`Access control analysis: ${accessMetrics.accessControlScore.toFixed(1)}% score with ${accessMetrics.securityIssues.length} security issues`));

      if (accessMetrics.accessControlScore < 80) {
        return {
          success: false,
          outcome: `Access control score ${accessMetrics.accessControlScore.toFixed(1)}% below 80% threshold`,
          logs,
          metrics: accessMetrics,
          error: 'Access control implementation insufficient'
        };
      }

      if (accessMetrics.securityIssues.length > 2) {
        return {
          success: true,
          warning: true,
          outcome: `Access control adequate but ${accessMetrics.securityIssues.length} security issues identified`,
          logs,
          metrics: accessMetrics
        };
      }

      return {
        success: true,
        outcome: `Access control validation passed - ${accessMetrics.accessControlScore.toFixed(1)}% score with proper authorization`,
        logs,
        metrics: accessMetrics
      };

    } catch (error) {
      logs.push(this.logExecution(`Access control validation failed: ${error instanceof Error ? error.message : 'Unknown error'}`));
      return {
        success: false,
        outcome: 'Access control validation failed',
        logs,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}