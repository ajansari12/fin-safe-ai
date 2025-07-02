import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ComplianceRuleExecution {
  rule_id: string;
  execution_context: Record<string, any>;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { rule_id, execution_context }: ComplianceRuleExecution = await req.json();

    // Set up Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get user organization
    const authHeader = req.headers.get('Authorization');
    let orgId = null;
    
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user } } = await supabase.auth.getUser(token);
      
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('organization_id')
          .eq('id', user.id)
          .single();
        
        orgId = profile?.organization_id;
      }
    }

    if (!orgId) {
      throw new Error('User organization not found');
    }

    // Get the compliance automation rule
    const { data: rule, error: ruleError } = await supabase
      .from('compliance_automation_rules')
      .select('*')
      .eq('id', rule_id)
      .eq('org_id', orgId)
      .eq('is_active', true)
      .single();

    if (ruleError || !rule) {
      throw new Error('Compliance rule not found or inactive');
    }

    console.log(`Executing compliance rule: ${rule.rule_name}`);

    // Execute the compliance rule based on its type
    let executionResults: any = {};
    let alertsGenerated: any[] = [];

    switch (rule.rule_type) {
      case 'threshold_monitoring':
        executionResults = await executeThresholdMonitoring(supabase, rule, execution_context, orgId);
        break;
      
      case 'data_validation':
        executionResults = await executeDataValidation(supabase, rule, execution_context, orgId);
        break;
      
      case 'workflow_enforcement':
        executionResults = await executeWorkflowEnforcement(supabase, rule, execution_context, orgId);
        break;
      
      case 'reporting_automation':
        executionResults = await executeReportingAutomation(supabase, rule, execution_context, orgId);
        break;
      
      case 'exception_handling':
        executionResults = await executeExceptionHandling(supabase, rule, execution_context, orgId);
        break;
      
      default:
        executionResults = { message: 'Unknown rule type', status: 'error' };
    }

    // Generate alerts if configured and violations found
    if (rule.alert_configuration && executionResults.violations?.length > 0) {
      alertsGenerated = await generateComplianceAlerts(supabase, rule, executionResults, orgId);
    }

    // Update rule execution history
    await supabase
      .from('compliance_automation_rules')
      .update({
        last_executed_at: new Date().toISOString(),
        execution_results: {
          ...executionResults,
          execution_timestamp: new Date().toISOString(),
          alerts_generated: alertsGenerated.length
        }
      })
      .eq('id', rule_id);

    console.log(`Compliance rule execution completed: ${executionResults.violations?.length || 0} violations found`);

    return new Response(
      JSON.stringify({ 
        success: true,
        rule_id,
        rule_name: rule.rule_name,
        execution_results: executionResults,
        alerts_generated: alertsGenerated.length,
        message: 'Compliance rule executed successfully'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    );

  } catch (error) {
    console.error('Compliance automation error:', error);

    return new Response(
      JSON.stringify({ 
        error: 'Failed to execute compliance rule', 
        details: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    );
  }
});

async function executeThresholdMonitoring(supabase: any, rule: any, context: any, orgId: string) {
  console.log(`Executing threshold monitoring rule: ${rule.rule_name}`);
  
  const conditions = rule.rule_conditions;
  const violations: any[] = [];

  try {
    // Monitor KRI thresholds
    if (conditions.monitor_kris) {
      const { data: kriLogs } = await supabase
        .from('kri_logs')
        .select('*, kri_definitions(*)')
        .eq('kri_definitions.org_id', orgId)
        .gte('measurement_date', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .order('measurement_date', { ascending: false });

      for (const log of kriLogs || []) {
        const thresholdValue = parseFloat(log.kri_definitions.warning_threshold);
        if (log.actual_value > thresholdValue) {
          violations.push({
            type: 'kri_threshold_breach',
            kri_id: log.kri_id,
            kri_name: log.kri_definitions.kri_name,
            actual_value: log.actual_value,
            threshold_value: thresholdValue,
            variance: ((log.actual_value - thresholdValue) / thresholdValue * 100).toFixed(2)
          });
        }
      }
    }

    // Monitor incident response times
    if (conditions.monitor_incidents) {
      const { data: incidents } = await supabase
        .from('incident_logs')
        .select('*')
        .eq('org_id', orgId)
        .eq('status', 'open')
        .order('reported_at', { ascending: false });

      const maxResponseHours = conditions.max_response_hours || 4;
      const now = new Date();

      for (const incident of incidents || []) {
        const reportedAt = new Date(incident.reported_at);
        const hoursElapsed = (now.getTime() - reportedAt.getTime()) / (1000 * 60 * 60);
        
        if (hoursElapsed > maxResponseHours && !incident.first_response_at) {
          violations.push({
            type: 'incident_response_sla_breach',
            incident_id: incident.id,
            incident_title: incident.title,
            hours_elapsed: hoursElapsed.toFixed(1),
            max_response_hours: maxResponseHours
          });
        }
      }
    }

    return {
      status: 'completed',
      violations_count: violations.length,
      violations: violations,
      execution_time: new Date().toISOString()
    };

  } catch (error) {
    return {
      status: 'error',
      error_message: error.message,
      violations_count: 0,
      violations: []
    };
  }
}

async function executeDataValidation(supabase: any, rule: any, context: any, orgId: string) {
  console.log(`Executing data validation rule: ${rule.rule_name}`);
  
  const conditions = rule.rule_conditions;
  const violations: any[] = [];

  try {
    // Validate control test data completeness
    if (conditions.validate_control_tests) {
      const { data: controls } = await supabase
        .from('controls')
        .select('*, control_tests(*)')
        .eq('org_id', orgId)
        .order('created_at', { ascending: false });

      for (const control of controls || []) {
        const lastTestDate = control.last_test_date;
        const testFrequency = control.test_frequency_days || 90;
        
        if (!lastTestDate) {
          violations.push({
            type: 'missing_control_test',
            control_id: control.id,
            control_name: control.control_name,
            message: 'Control has never been tested'
          });
        } else {
          const daysSinceTest = (Date.now() - new Date(lastTestDate).getTime()) / (1000 * 60 * 60 * 24);
          if (daysSinceTest > testFrequency) {
            violations.push({
              type: 'overdue_control_test',
              control_id: control.id,
              control_name: control.control_name,
              days_overdue: Math.floor(daysSinceTest - testFrequency)
            });
          }
        }
      }
    }

    // Validate regulatory reports completeness
    if (conditions.validate_regulatory_reports) {
      const { data: reports } = await supabase
        .from('regulatory_reports')
        .select('*')
        .eq('org_id', orgId)
        .lte('due_date', new Date().toISOString())
        .neq('report_status', 'submitted');

      for (const report of reports || []) {
        violations.push({
          type: 'incomplete_regulatory_report',
          report_id: report.id,
          report_type: report.report_type,
          due_date: report.due_date,
          current_status: report.report_status
        });
      }
    }

    return {
      status: 'completed',
      violations_count: violations.length,
      violations: violations,
      execution_time: new Date().toISOString()
    };

  } catch (error) {
    return {
      status: 'error',
      error_message: error.message,
      violations_count: 0,
      violations: []
    };
  }
}

async function executeWorkflowEnforcement(supabase: any, rule: any, context: any, orgId: string) {
  console.log(`Executing workflow enforcement rule: ${rule.rule_name}`);
  
  const violations: any[] = [];

  try {
    // Check for stuck workflow executions
    const { data: stuckWorkflows } = await supabase
      .from('workflow_executions')
      .select('*')
      .eq('org_id', orgId)
      .eq('status', 'running')
      .lt('started_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

    for (const workflow of stuckWorkflows || []) {
      violations.push({
        type: 'stuck_workflow_execution',
        execution_id: workflow.id,
        workflow_id: workflow.workflow_id,
        started_at: workflow.started_at,
        current_node: workflow.current_node
      });
    }

    // Check for overdue workflow steps
    const { data: overdueSteps } = await supabase
      .from('workflow_steps')
      .select('*, workflow_instances(*)')
      .eq('workflow_instances.org_id', orgId)
      .eq('status', 'pending')
      .lt('due_date', new Date().toISOString().split('T')[0]);

    for (const step of overdueSteps || []) {
      violations.push({
        type: 'overdue_workflow_step',
        step_id: step.id,
        step_name: step.step_name,
        due_date: step.due_date,
        assigned_to: step.assigned_to_name
      });
    }

    return {
      status: 'completed',
      violations_count: violations.length,
      violations: violations,
      execution_time: new Date().toISOString()
    };

  } catch (error) {
    return {
      status: 'error',
      error_message: error.message,
      violations_count: 0,
      violations: []
    };
  }
}

async function executeReportingAutomation(supabase: any, rule: any, context: any, orgId: string) {
  console.log(`Executing reporting automation rule: ${rule.rule_name}`);
  
  const violations: any[] = [];

  try {
    // Check for missing periodic reports
    const conditions = rule.rule_conditions;
    const reportTypes = conditions.required_reports || [];

    for (const reportType of reportTypes) {
      const { data: recentReports } = await supabase
        .from('regulatory_reports')
        .select('*')
        .eq('org_id', orgId)
        .eq('report_type', reportType)
        .gte('created_at', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false })
        .limit(1);

      if (!recentReports || recentReports.length === 0) {
        violations.push({
          type: 'missing_periodic_report',
          report_type: reportType,
          last_report_date: null,
          days_overdue: Math.floor((Date.now() - Date.now()) / (1000 * 60 * 60 * 24))
        });
      }
    }

    return {
      status: 'completed',
      violations_count: violations.length,
      violations: violations,
      execution_time: new Date().toISOString()
    };

  } catch (error) {
    return {
      status: 'error',
      error_message: error.message,
      violations_count: 0,
      violations: []
    };
  }
}

async function executeExceptionHandling(supabase: any, rule: any, context: any, orgId: string) {
  console.log(`Executing exception handling rule: ${rule.rule_name}`);
  
  const violations: any[] = [];

  try {
    // Check for unresolved critical incidents
    const { data: criticalIncidents } = await supabase
      .from('incident_logs')
      .select('*')
      .eq('org_id', orgId)
      .eq('severity', 'critical')
      .in('status', ['open', 'in_progress'])
      .order('reported_at', { ascending: false });

    for (const incident of criticalIncidents || []) {
      const hoursOpen = (Date.now() - new Date(incident.reported_at).getTime()) / (1000 * 60 * 60);
      if (hoursOpen > 8) { // Critical incidents should be resolved within 8 hours
        violations.push({
          type: 'unresolved_critical_incident',
          incident_id: incident.id,
          incident_title: incident.title,
          hours_open: hoursOpen.toFixed(1),
          severity: incident.severity
        });
      }
    }

    return {
      status: 'completed',
      violations_count: violations.length,
      violations: violations,
      execution_time: new Date().toISOString()
    };

  } catch (error) {
    return {
      status: 'error',
      error_message: error.message,
      violations_count: 0,
      violations: []
    };
  }
}

async function generateComplianceAlerts(supabase: any, rule: any, executionResults: any, orgId: string) {
  const alerts: any[] = [];
  const alertConfig = rule.alert_configuration;

  try {
    for (const violation of executionResults.violations) {
      // Create security audit log entry
      await supabase
        .from('security_audit_logs')
        .insert({
          org_id: orgId,
          event_type: 'compliance_violation',
          severity: violation.type.includes('critical') ? 'critical' : 'medium',
          resource_accessed: rule.rule_name,
          action_performed: 'compliance_check',
          event_details: {
            rule_id: rule.id,
            violation_type: violation.type,
            violation_details: violation
          },
          risk_score: violation.type.includes('critical') ? 85 : 65,
          investigation_status: 'open'
        });

      // Send notification if configured
      if (alertConfig.send_notifications) {
        await supabase.functions.invoke('send-notification-email', {
          body: {
            to: alertConfig.notification_recipients || 'compliance@organization.com',
            subject: `Compliance Violation: ${rule.rule_name}`,
            type: 'compliance_alert',
            data: {
              rule_name: rule.rule_name,
              violation_type: violation.type,
              violation_details: violation,
              regulation_reference: rule.regulation_reference
            },
            urgency: violation.type.includes('critical') ? 'critical' : 'medium'
          }
        });

        alerts.push({
          type: 'notification_sent',
          recipient: alertConfig.notification_recipients,
          violation_type: violation.type
        });
      }
    }

    return alerts;

  } catch (error) {
    console.error('Error generating compliance alerts:', error);
    return [];
  }
}