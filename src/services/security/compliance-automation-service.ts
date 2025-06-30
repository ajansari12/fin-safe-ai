
import { supabase } from "@/integrations/supabase/client";
import { getCurrentUserProfile } from "@/lib/supabase-utils";

export interface CompliancePolicy {
  id: string;
  org_id: string;
  policy_name: string;
  framework: string;
  policy_rules: any;
  check_frequency: string;
  severity: string;
  auto_remediation: boolean;
  remediation_actions: any[];
  is_active: boolean;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface ComplianceCheck {
  id: string;
  org_id: string;
  policy_id: string;
  check_result: string;
  compliance_score: number;
  violations_found: any[];
  remediation_status: string;
  remediated_at?: string;
  checked_at: string;
  created_at: string;
}

export interface ComplianceReport {
  id: string;
  org_id: string;
  report_type: string;
  framework: string;
  report_period_start: string;
  report_period_end: string;
  compliance_data: any;
  overall_score?: number;
  critical_findings: any[];
  recommendations: any[];
  generated_by?: string;
  approved_by?: string;
  approval_date?: string;
  status: string;
  created_at: string;
  updated_at: string;
}

class ComplianceAutomationService {
  private complianceFrameworks = {
    'SOX': {
      name: 'Sarbanes-Oxley Act',
      categories: ['financial_reporting', 'internal_controls', 'audit_trails']
    },
    'PCI_DSS': {
      name: 'Payment Card Industry Data Security Standard',
      categories: ['data_protection', 'access_control', 'network_security']
    },
    'GDPR': {
      name: 'General Data Protection Regulation',
      categories: ['data_privacy', 'consent_management', 'data_retention']
    },
    'ISO_27001': {
      name: 'ISO 27001',
      categories: ['information_security', 'risk_management', 'business_continuity']
    },
    'NIST': {
      name: 'NIST Cybersecurity Framework',
      categories: ['identify', 'protect', 'detect', 'respond', 'recover']
    }
  };

  async createCompliancePolicy(
    policyName: string,
    framework: string,
    rules: any,
    frequency: string = 'daily',
    autoRemediation: boolean = false
  ): Promise<CompliancePolicy> {
    const profile = await getCurrentUserProfile();
    if (!profile?.organization_id) throw new Error('No organization found');

    const { data, error } = await supabase
      .from('compliance_policies')
      .insert({
        org_id: profile.organization_id,
        policy_name: policyName,
        framework,
        policy_rules: rules,
        check_frequency: frequency,
        severity: this.determineSeverity(rules),
        auto_remediation: autoRemediation,
        remediation_actions: this.generateRemediationActions(rules),
        is_active: true,
        created_by: profile.id
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  private determineSeverity(rules: any): string {
    if (rules.critical_controls?.length > 0) return 'critical';
    if (rules.high_risk_areas?.length > 0) return 'high';
    if (rules.medium_risk_areas?.length > 0) return 'medium';
    return 'low';
  }

  private generateRemediationActions(rules: any): any[] {
    const actions = [];
    
    if (rules.access_control) {
      actions.push({
        action: 'review_access_permissions',
        description: 'Review and update user access permissions',
        automation_level: 'semi-automated'
      });
    }
    
    if (rules.data_encryption) {
      actions.push({
        action: 'enforce_encryption',
        description: 'Ensure data encryption is enabled',
        automation_level: 'automated'
      });
    }
    
    if (rules.audit_logging) {
      actions.push({
        action: 'enable_audit_logging',
        description: 'Enable comprehensive audit logging',
        automation_level: 'automated'
      });
    }

    return actions;
  }

  async runComplianceCheck(policyId: string): Promise<ComplianceCheck> {
    const profile = await getCurrentUserProfile();
    if (!profile?.organization_id) throw new Error('No organization found');

    const { data: policy } = await supabase
      .from('compliance_policies')
      .select('*')
      .eq('id', policyId)
      .single();

    if (!policy) throw new Error('Policy not found');

    const checkResult = await this.performComplianceCheck(policy);
    
    const { data, error } = await supabase
      .from('compliance_checks')
      .insert({
        org_id: profile.organization_id,
        policy_id: policyId,
        check_result: checkResult.result,
        compliance_score: checkResult.score,
        violations_found: checkResult.violations,
        remediation_status: checkResult.violations.length > 0 ? 'pending' : 'not_required'
      })
      .select()
      .single();

    if (error) throw error;

    // Auto-remediate if enabled and violations found
    if (policy.auto_remediation && checkResult.violations.length > 0) {
      await this.performAutoRemediation(policy, checkResult.violations);
    }

    return data;
  }

  private async performComplianceCheck(policy: CompliancePolicy): Promise<any> {
    const violations = [];
    let score = 100;
    
    const rules = policy.policy_rules;

    // Check access control compliance
    if (rules.access_control) {
      const accessViolations = await this.checkAccessControl(policy.org_id, rules.access_control);
      violations.push(...accessViolations);
      score -= accessViolations.length * 10;
    }

    // Check data encryption compliance
    if (rules.data_encryption) {
      const encryptionViolations = await this.checkDataEncryption(policy.org_id, rules.data_encryption);
      violations.push(...encryptionViolations);
      score -= encryptionViolations.length * 15;
    }

    // Check audit logging compliance
    if (rules.audit_logging) {
      const auditViolations = await this.checkAuditLogging(policy.org_id, rules.audit_logging);
      violations.push(...auditViolations);
      score -= auditViolations.length * 5;
    }

    // Check password policy compliance
    if (rules.password_policy) {
      const passwordViolations = await this.checkPasswordPolicy(policy.org_id, rules.password_policy);
      violations.push(...passwordViolations);
      score -= passwordViolations.length * 8;
    }

    return {
      result: violations.length === 0 ? 'compliant' : 'non_compliant',
      score: Math.max(0, score),
      violations
    };
  }

  private async checkAccessControl(orgId: string, rules: any): Promise<any[]> {
    const violations = [];
    
    // Check for users with excessive permissions
    const { data: users } = await supabase
      .from('profiles')
      .select('*')
      .eq('organization_id', orgId);

    if (users) {
      for (const user of users) {
        if (user.role === 'admin' && rules.max_admin_users) {
          const adminCount = users.filter(u => u.role === 'admin').length;
          if (adminCount > rules.max_admin_users) {
            violations.push({
              type: 'excessive_admin_users',
              description: `Too many admin users: ${adminCount} > ${rules.max_admin_users}`,
              severity: 'high',
              resource: 'user_management'
            });
          }
        }
      }
    }

    return violations;
  }

  private async checkDataEncryption(orgId: string, rules: any): Promise<any[]> {
    const violations = [];
    
    // Check authentication settings for encryption requirements
    const { data: authSettings } = await supabase
      .from('auth_settings')
      .select('*')
      .eq('org_id', orgId)
      .single();

    if (authSettings && rules.require_mfa && !authSettings.mfa_enforced) {
      violations.push({
        type: 'mfa_not_enforced',
        description: 'Multi-factor authentication is not enforced',
        severity: 'critical',
        resource: 'authentication'
      });
    }

    return violations;
  }

  private async checkAuditLogging(orgId: string, rules: any): Promise<any[]> {
    const violations = [];
    
    // Check if audit logging is comprehensive
    const { data: auditLogs } = await supabase
      .from('audit_trails')
      .select('*')
      .eq('org_id', orgId)
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .limit(10);

    if (rules.min_daily_logs && (!auditLogs || auditLogs.length < rules.min_daily_logs)) {
      violations.push({
        type: 'insufficient_audit_logging',
        description: `Insufficient audit logs: ${auditLogs?.length || 0} < ${rules.min_daily_logs}`,
        severity: 'medium',
        resource: 'audit_system'
      });
    }

    return violations;
  }

  private async checkPasswordPolicy(orgId: string, rules: any): Promise<any[]> {
    const violations = [];
    
    const { data: authSettings } = await supabase
      .from('auth_settings')
      .select('*')
      .eq('org_id', orgId)
      .single();

    if (authSettings?.password_policy) {
      const policy = authSettings.password_policy as any;
      
      if (rules.min_length && policy.min_length < rules.min_length) {
        violations.push({
          type: 'weak_password_policy',
          description: `Password minimum length too short: ${policy.min_length} < ${rules.min_length}`,
          severity: 'medium',
          resource: 'password_policy'
        });
      }
    }

    return violations;
  }

  private async performAutoRemediation(policy: CompliancePolicy, violations: any[]): Promise<void> {
    for (const violation of violations) {
      const action = policy.remediation_actions.find(a => 
        a.action.includes(violation.type) || a.resource === violation.resource
      );

      if (action && action.automation_level === 'automated') {
        await this.executeRemediationAction(action, violation, policy.org_id);
      }
    }
  }

  private async executeRemediationAction(action: any, violation: any, orgId: string): Promise<void> {
    switch (action.action) {
      case 'enforce_encryption':
        // In production, this would enable encryption settings
        console.log('Auto-remediation: Enforcing encryption');
        break;
      
      case 'enable_audit_logging':
        // In production, this would enable audit logging
        console.log('Auto-remediation: Enabling audit logging');
        break;
      
      default:
        console.log(`Auto-remediation action not implemented: ${action.action}`);
    }
  }

  async generateComplianceReport(
    framework: string,
    periodStart: string,
    periodEnd: string,
    reportType: string = 'comprehensive'
  ): Promise<ComplianceReport> {
    const profile = await getCurrentUserProfile();
    if (!profile?.organization_id) throw new Error('No organization found');

    // Get all compliance checks for the period
    const { data: checks } = await supabase
      .from('compliance_checks')
      .select('*')
      .eq('org_id', profile.organization_id)
      .gte('checked_at', periodStart)
      .lte('checked_at', periodEnd);

    // Get all policies for the framework
    const { data: policies } = await supabase
      .from('compliance_policies')
      .select('*')
      .eq('org_id', profile.organization_id)
      .eq('framework', framework);

    const complianceData = this.analyzeComplianceData(checks || [], policies || []);
    
    const { data, error } = await supabase
      .from('compliance_reports')
      .insert({
        org_id: profile.organization_id,
        report_type: reportType,
        framework,
        report_period_start: periodStart,
        report_period_end: periodEnd,
        compliance_data: complianceData.data,
        overall_score: complianceData.overallScore,
        critical_findings: complianceData.criticalFindings,
        recommendations: complianceData.recommendations,
        generated_by: profile.id,
        status: 'draft'
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  private analyzeComplianceData(checks: ComplianceCheck[], policies: CompliancePolicy[]): any {
    const totalChecks = checks.length;
    const passedChecks = checks.filter(c => c.check_result === 'compliant').length;
    const overallScore = totalChecks > 0 ? Math.round((passedChecks / totalChecks) * 100) : 0;

    const criticalFindings = checks
      .filter(c => c.violations_found.some((v: any) => v.severity === 'critical'))
      .map(c => ({
        policy_name: policies.find(p => p.id === c.policy_id)?.policy_name,
        violations: c.violations_found.filter((v: any) => v.severity === 'critical')
      }));

    const recommendations = this.generateRecommendations(checks, policies);

    return {
      data: {
        total_policies: policies.length,
        total_checks: totalChecks,
        passed_checks: passedChecks,
        failed_checks: totalChecks - passedChecks,
        compliance_trends: this.calculateTrends(checks)
      },
      overallScore,
      criticalFindings,
      recommendations
    };
  }

  private generateRecommendations(checks: ComplianceCheck[], policies: CompliancePolicy[]): any[] {
    const recommendations = [];
    
    const failedChecks = checks.filter(c => c.check_result !== 'compliant');
    if (failedChecks.length > 0) {
      recommendations.push({
        category: 'remediation',
        priority: 'high',
        description: `Address ${failedChecks.length} failed compliance checks`,
        action_items: failedChecks.map(c => `Review policy: ${policies.find(p => p.id === c.policy_id)?.policy_name}`)
      });
    }

    const criticalPolicies = policies.filter(p => p.severity === 'critical' && !p.auto_remediation);
    if (criticalPolicies.length > 0) {
      recommendations.push({
        category: 'automation',
        priority: 'medium',
        description: 'Enable auto-remediation for critical policies',
        action_items: criticalPolicies.map(p => `Enable auto-remediation for: ${p.policy_name}`)
      });
    }

    return recommendations;
  }

  private calculateTrends(checks: ComplianceCheck[]): any {
    // Calculate compliance trends over time
    const trendsData = checks.reduce((acc: any, check) => {
      const date = new Date(check.checked_at).toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = { total: 0, passed: 0 };
      }
      acc[date].total++;
      if (check.check_result === 'compliant') {
        acc[date].passed++;
      }
      return acc;
    }, {});

    return Object.entries(trendsData).map(([date, data]: [string, any]) => ({
      date,
      compliance_rate: (data.passed / data.total) * 100
    }));
  }

  async getCompliancePolicies(): Promise<CompliancePolicy[]> {
    const profile = await getCurrentUserProfile();
    if (!profile?.organization_id) return [];

    const { data, error } = await supabase
      .from('compliance_policies')
      .select('*')
      .eq('org_id', profile.organization_id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching compliance policies:', error);
      return [];
    }

    return data || [];
  }

  async getComplianceReports(): Promise<ComplianceReport[]> {
    const profile = await getCurrentUserProfile();
    if (!profile?.organization_id) return [];

    const { data, error } = await supabase
      .from('compliance_reports')
      .select('*')
      .eq('org_id', profile.organization_id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching compliance reports:', error);
      return [];
    }

    return data || [];
  }

  async scheduleComplianceChecks(frequency: string = 'daily'): Promise<void> {
    const profile = await getCurrentUserProfile();
    if (!profile?.organization_id) return;

    const policies = await this.getCompliancePolicies();
    
    for (const policy of policies) {
      if (policy.is_active && policy.check_frequency === frequency) {
        // In production, this would integrate with a job scheduler
        console.log(`Scheduling compliance check for policy: ${policy.policy_name}`);
        
        // For demonstration, run the check immediately
        await this.runComplianceCheck(policy.id);
      }
    }
  }
}

export const complianceAutomationService = new ComplianceAutomationService();
