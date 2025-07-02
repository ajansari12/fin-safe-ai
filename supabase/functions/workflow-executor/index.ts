import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface WorkflowExecutionRequest {
  workflow_id: string;
  context: Record<string, any>;
}

interface WorkflowStep {
  id: string;
  step_name: string;
  step_type: 'approval' | 'notification' | 'task' | 'escalation';
  assigned_role?: string;
  due_hours?: number;
  conditions?: Record<string, any>;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { workflow_id, context }: WorkflowExecutionRequest = await req.json();

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

    // Create workflow execution record
    const { data: execution, error: executionError } = await supabase
      .from('workflow_executions')
      .insert({
        workflow_id,
        org_id: orgId,
        status: 'running',
        current_node: 'step_1',
        execution_context: context,
        started_at: new Date().toISOString()
      })
      .select()
      .single();

    if (executionError) {
      throw new Error(`Failed to create execution: ${executionError.message}`);
    }

    // Define workflow steps based on workflow_id
    let workflowSteps: WorkflowStep[] = [];
    
    if (workflow_id.includes('incident')) {
      workflowSteps = [
        { id: 'step_1', step_name: 'Immediate Assessment', step_type: 'task', assigned_role: 'analyst', due_hours: 1 },
        { id: 'step_2', step_name: 'Management Notification', step_type: 'notification', assigned_role: 'manager' },
        { id: 'step_3', step_name: 'Manager Approval', step_type: 'approval', assigned_role: 'manager', due_hours: 4 },
        { id: 'step_4', step_name: 'Executive Escalation', step_type: 'escalation', assigned_role: 'executive', due_hours: 8 }
      ];
    } else if (workflow_id.includes('policy')) {
      workflowSteps = [
        { id: 'step_1', step_name: 'Policy Review', step_type: 'task', assigned_role: 'compliance', due_hours: 72 },
        { id: 'step_2', step_name: 'Stakeholder Review', step_type: 'approval', assigned_role: 'stakeholder', due_hours: 120 },
        { id: 'step_3', step_name: 'Final Approval', step_type: 'approval', assigned_role: 'executive', due_hours: 168 }
      ];
    } else if (workflow_id.includes('kri')) {
      workflowSteps = [
        { id: 'step_1', step_name: 'Breach Assessment', step_type: 'task', assigned_role: 'risk_officer', due_hours: 2 },
        { id: 'step_2', step_name: 'Risk Committee Notification', step_type: 'notification', assigned_role: 'risk_committee' },
        { id: 'step_3', step_name: 'Mitigation Plan', step_type: 'task', assigned_role: 'risk_officer', due_hours: 24 },
        { id: 'step_4', step_name: 'Board Notification', step_type: 'escalation', assigned_role: 'board', due_hours: 48 }
      ];
    } else {
      // Default workflow
      workflowSteps = [
        { id: 'step_1', step_name: 'Initial Processing', step_type: 'task', assigned_role: 'analyst', due_hours: 24 },
        { id: 'step_2', step_name: 'Review and Approval', step_type: 'approval', assigned_role: 'manager', due_hours: 48 }
      ];
    }

    // Execute first step
    await executeWorkflowStep(supabase, execution.id, workflowSteps[0], context, orgId);

    // Log execution start
    await supabase
      .from('workflow_execution_logs')
      .insert({
        execution_id: execution.id,
        node_id: 'start',
        step_name: 'Workflow Started',
        status: 'completed',
        input_data: context,
        output_data: { message: 'Workflow execution initiated' },
        started_at: new Date().toISOString(),
        completed_at: new Date().toISOString()
      });

    // Schedule remaining steps (in a real implementation, this would be handled by a scheduler)
    for (let i = 1; i < workflowSteps.length; i++) {
      await scheduleWorkflowStep(supabase, execution.id, workflowSteps[i], i + 1);
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        execution_id: execution.id,
        workflow_id,
        status: 'running',
        steps_count: workflowSteps.length,
        message: 'Workflow execution started successfully'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    );

  } catch (error) {
    console.error('Workflow execution error:', error);

    return new Response(
      JSON.stringify({ 
        error: 'Failed to execute workflow', 
        details: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    );
  }
});

async function executeWorkflowStep(
  supabase: any, 
  executionId: string, 
  step: WorkflowStep, 
  context: Record<string, any>,
  orgId: string
) {
  const stepStartTime = new Date().toISOString();
  
  try {
    let stepResult = {};
    
    switch (step.step_type) {
      case 'notification':
        stepResult = await sendNotification(supabase, step, context, orgId);
        break;
      
      case 'task':
        stepResult = await createTask(supabase, step, context, orgId);
        break;
      
      case 'approval':
        stepResult = await createApproval(supabase, step, context, orgId);
        break;
      
      case 'escalation':
        stepResult = await handleEscalation(supabase, step, context, orgId);
        break;
      
      default:
        stepResult = { message: `Executed ${step.step_name}` };
    }

    // Log successful step execution
    await supabase
      .from('workflow_execution_logs')
      .insert({
        execution_id: executionId,
        node_id: step.id,
        step_name: step.step_name,
        status: 'completed',
        input_data: context,
        output_data: stepResult,
        started_at: stepStartTime,
        completed_at: new Date().toISOString()
      });

    return stepResult;

  } catch (error) {
    // Log failed step execution
    await supabase
      .from('workflow_execution_logs')
      .insert({
        execution_id: executionId,
        node_id: step.id,
        step_name: step.step_name,
        status: 'failed',
        input_data: context,
        error_details: error.message,
        started_at: stepStartTime,
        completed_at: new Date().toISOString()
      });

    throw error;
  }
}

async function sendNotification(supabase: any, step: WorkflowStep, context: Record<string, any>, orgId: string) {
  // Send notification via the notification service
  const notificationData = {
    to: getEmailForRole(step.assigned_role),
    subject: `Workflow Notification: ${step.step_name}`,
    type: 'system_alert',
    data: {
      step_name: step.step_name,
      workflow_context: context,
      timestamp: new Date().toISOString()
    },
    urgency: 'medium'
  };

  await supabase.functions.invoke('send-notification-email', {
    body: notificationData
  });

  return { message: `Notification sent to ${step.assigned_role}`, recipient: step.assigned_role };
}

async function createTask(supabase: any, step: WorkflowStep, context: Record<string, any>, orgId: string) {
  // Create a task record in the database
  const dueDate = step.due_hours ? 
    new Date(Date.now() + step.due_hours * 60 * 60 * 1000) : 
    new Date(Date.now() + 24 * 60 * 60 * 1000);

  const { data, error } = await supabase
    .from('workflow_tasks')
    .insert({
      org_id: orgId,
      task_name: step.step_name,
      assigned_role: step.assigned_role,
      due_date: dueDate.toISOString(),
      context: context,
      status: 'pending'
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create task: ${error.message}`);
  }

  return { message: `Task created: ${step.step_name}`, task_id: data.id, due_date: dueDate };
}

async function createApproval(supabase: any, step: WorkflowStep, context: Record<string, any>, orgId: string) {
  // Create an approval request
  const dueDate = step.due_hours ? 
    new Date(Date.now() + step.due_hours * 60 * 60 * 1000) : 
    new Date(Date.now() + 48 * 60 * 60 * 1000);

  const { data, error } = await supabase
    .from('approval_requests')
    .insert({
      org_id: orgId,
      request_title: step.step_name,
      assigned_role: step.assigned_role,
      due_date: dueDate.toISOString(),
      context: context,
      status: 'pending'
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create approval request: ${error.message}`);
  }

  // Send notification to approver
  await sendNotification(supabase, step, context, orgId);

  return { message: `Approval request created: ${step.step_name}`, approval_id: data.id, due_date: dueDate };
}

async function handleEscalation(supabase: any, step: WorkflowStep, context: Record<string, any>, orgId: string) {
  // Handle escalation logic
  const escalationData = {
    escalated_to: step.assigned_role,
    escalation_reason: `Workflow escalation: ${step.step_name}`,
    context: context,
    escalated_at: new Date().toISOString()
  };

  // Send high-priority notification
  const notificationData = {
    to: getEmailForRole(step.assigned_role),
    subject: `URGENT: Escalation Required - ${step.step_name}`,
    type: 'system_alert',
    data: {
      ...escalationData,
      urgency: 'high'
    },
    urgency: 'critical'
  };

  await supabase.functions.invoke('send-notification-email', {
    body: notificationData
  });

  return { message: `Escalated to ${step.assigned_role}`, escalation_data: escalationData };
}

async function scheduleWorkflowStep(supabase: any, executionId: string, step: WorkflowStep, stepNumber: number) {
  // In a real implementation, this would schedule the step for later execution
  // For now, we'll just log that it's scheduled
  await supabase
    .from('workflow_execution_logs')
    .insert({
      execution_id: executionId,
      node_id: step.id,
      step_name: `${step.step_name} (Scheduled)`,
      status: 'scheduled',
      input_data: { step_number: stepNumber, due_hours: step.due_hours },
      started_at: new Date().toISOString()
    });
}

function getEmailForRole(role?: string): string {
  // In a real implementation, this would look up the actual email addresses
  // based on organizational roles
  const roleEmails: Record<string, string> = {
    'analyst': 'analyst@organization.com',
    'manager': 'manager@organization.com',
    'executive': 'executive@organization.com',
    'compliance': 'compliance@organization.com',
    'risk_officer': 'risk@organization.com',
    'risk_committee': 'risk-committee@organization.com',
    'board': 'board@organization.com',
    'stakeholder': 'stakeholder@organization.com'
  };

  return roleEmails[role || 'analyst'] || 'default@organization.com';
}