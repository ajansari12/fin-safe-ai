
import { supabase } from '@/integrations/supabase/client';
import { AutomationRule, OrganizationalProfile } from '@/types/organizational-intelligence';

export class IntelligentAutomationEngine {
  
  async analyzeAutomationOpportunities(orgId: string): Promise<AutomationRule[]> {
    try {
      // Fetch organization data
      const { data: profile } = await supabase
        .from('organizational_profiles')
        .select('*')
        .eq('org_id', orgId)
        .single();

      if (!profile) throw new Error('Profile not found');

      const opportunities: AutomationRule[] = [];

      // Risk monitoring automation
      opportunities.push(await this.createRiskMonitoringRule(orgId, profile));

      // Compliance checking automation
      opportunities.push(await this.createComplianceMonitoringRule(orgId, profile));

      // Incident escalation automation
      opportunities.push(await this.createIncidentEscalationRule(orgId, profile));

      // KRI breach automation
      opportunities.push(await this.createKRIBreachRule(orgId, profile));

      return opportunities.filter(rule => rule !== null);
    } catch (error) {
      console.error('Error analyzing automation opportunities:', error);
      return [];
    }
  }

  async implementAutomationRule(rule: AutomationRule): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('automation_rules')
        .insert({
          org_id: rule.org_id,
          rule_name: rule.name,
          trigger_conditions: rule.trigger_conditions,
          actions: rule.actions,
          is_active: rule.is_active
        });

      if (error) throw error;

      // Set up monitoring for the rule
      await this.setupRuleMonitoring(rule);

      return true;
    } catch (error) {
      console.error('Error implementing automation rule:', error);
      return false;
    }
  }

  private async createRiskMonitoringRule(orgId: string, profile: OrganizationalProfile): Promise<AutomationRule> {
    return {
      id: crypto.randomUUID(),
      org_id: orgId,
      name: 'Automated Risk Score Monitoring',
      description: 'Automatically monitor and alert on risk score changes',
      trigger_conditions: [
        {
          metric: 'risk_score',
          operator: 'gt',
          value: this.calculateRiskThreshold(profile)
        }
      ],
      actions: [
        {
          type: 'alert',
          parameters: {
            recipients: ['risk_manager', 'executive_team'],
            message: 'Risk score has exceeded acceptable threshold',
            urgency: 'high'
          }
        },
        {
          type: 'escalate',
          parameters: {
            escalation_level: 1,
            notify_board: profile.asset_size > 10000000000
          }
        }
      ],
      is_active: true,
      created_at: new Date().toISOString()
    };
  }

  private async createComplianceMonitoringRule(orgId: string, profile: OrganizationalProfile): Promise<AutomationRule> {
    return {
      id: crypto.randomUUID(),
      org_id: orgId,
      name: 'Compliance Gap Detection',
      description: 'Automatically detect and report compliance gaps',
      trigger_conditions: [
        {
          metric: 'compliance_score',
          operator: 'lt',
          value: 85
        }
      ],
      actions: [
        {
          type: 'report',
          parameters: {
            report_type: 'compliance_gap',
            schedule: 'immediate',
            recipients: ['compliance_officer', 'legal_team']
          }
        },
        {
          type: 'remediate',
          parameters: {
            auto_create_tasks: true,
            assign_to: 'compliance_team'
          }
        }
      ],
      is_active: true,
      created_at: new Date().toISOString()
    };
  }

  private async createIncidentEscalationRule(orgId: string, profile: OrganizationalProfile): Promise<AutomationRule> {
    return {
      id: crypto.randomUUID(),
      org_id: orgId,
      name: 'Intelligent Incident Escalation',
      description: 'Automatically escalate incidents based on severity and business impact',
      trigger_conditions: [
        {
          metric: 'incident_severity',
          operator: 'eq',
          value: 'critical'
        }
      ],
      actions: [
        {
          type: 'escalate',
          parameters: {
            immediate_notification: true,
            escalation_chain: ['incident_manager', 'cro', 'ceo'],
            sms_alerts: true
          }
        },
        {
          type: 'alert',
          parameters: {
            channels: ['email', 'sms', 'dashboard'],
            message: 'Critical incident requires immediate attention'
          }
        }
      ],
      is_active: true,
      created_at: new Date().toISOString()
    };
  }

  private async createKRIBreachRule(orgId: string, profile: OrganizationalProfile): Promise<AutomationRule> {
    return {
      id: crypto.randomUUID(),
      org_id: orgId,
      name: 'KRI Appetite Breach Response',
      description: 'Automatically respond to KRI appetite breaches',
      trigger_conditions: [
        {
          metric: 'kri_variance',
          operator: 'gt',
          value: 20
        }
      ],
      actions: [
        {
          type: 'alert',
          parameters: {
            immediate: true,
            recipients: ['risk_committee', 'business_owners']
          }
        },
        {
          type: 'remediate',
          parameters: {
            create_action_plan: true,
            assign_remediation_owner: true,
            set_review_date: true
          }
        }
      ],
      is_active: true,
      created_at: new Date().toISOString()
    };
  }

  private async setupRuleMonitoring(rule: AutomationRule): Promise<void> {
    // Implementation would set up database triggers or scheduled functions
    // to monitor the conditions specified in the rule
    console.log(`Setting up monitoring for rule: ${rule.name}`);
  }

  private calculateRiskThreshold(profile: OrganizationalProfile): number {
    let threshold = 70; // Default threshold

    // Adjust based on maturity
    if (profile.risk_maturity === 'sophisticated') threshold = 80;
    if (profile.risk_maturity === 'basic') threshold = 60;

    // Adjust based on size and complexity
    if (profile.asset_size > 10000000000) threshold -= 5;
    if (profile.regulatory_complexity === 'high') threshold -= 10;

    return threshold;
  }

  async getActiveRules(orgId: string): Promise<AutomationRule[]> {
    try {
      const { data, error } = await supabase
        .from('automation_rules')
        .select('*')
        .eq('org_id', orgId)
        .eq('is_active', true);

      if (error) throw error;

      return data?.map(rule => ({
        id: rule.id,
        org_id: rule.org_id,
        name: rule.rule_name,
        description: rule.description || '',
        trigger_conditions: rule.trigger_conditions,
        actions: rule.actions,
        is_active: rule.is_active,
        created_at: rule.created_at
      })) || [];
    } catch (error) {
      console.error('Error fetching active rules:', error);
      return [];
    }
  }

  async executeRule(ruleId: string, context: any): Promise<boolean> {
    try {
      // Update execution count
      await supabase
        .from('automation_rules')
        .update({ 
          execution_count: supabase.sql`execution_count + 1`,
          last_executed_at: new Date().toISOString()
        })
        .eq('id', ruleId);

      // Log execution for audit trail
      await supabase
        .from('audit_trails')
        .insert({
          org_id: context.org_id,
          entity_type: 'automation_rule',
          entity_id: ruleId,
          action_type: 'executed',
          module_name: 'automation_engine',
          changes_made: { context, timestamp: new Date().toISOString() }
        });

      return true;
    } catch (error) {
      console.error('Error executing rule:', error);
      return false;
    }
  }
}

export const intelligentAutomationEngine = new IntelligentAutomationEngine();
