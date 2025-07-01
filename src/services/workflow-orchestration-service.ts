import { supabase } from "@/integrations/supabase/client";

export interface WorkflowNode {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: {
    label: string;
    nodeType: string;
    configuration: Record<string, any>;
    inputs: Record<string, any>;
    outputs: Record<string, any>;
  };
}

export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  type?: string;
  data?: Record<string, any>;
}

export interface Workflow {
  id: string;
  org_id: string;
  name: string;
  description?: string;
  status: 'draft' | 'active' | 'paused' | 'archived';
  workflow_definition: {
    nodes: WorkflowNode[];
    edges: WorkflowEdge[];
    version: number;
  };
  triggers: Record<string, any>;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface WorkflowExecution {
  id: string;
  workflow_id: string;
  org_id: string;
  status: 'running' | 'completed' | 'failed' | 'cancelled';
  current_node?: string;
  execution_context: Record<string, any>;
  started_at: string;
  completed_at?: string;
  error_message?: string;
  execution_log: Array<{
    node_id: string;
    step_name: string;
    status: string;
    started_at: string;
    completed_at?: string;
    input_data?: Record<string, any>;
    output_data?: Record<string, any>;
    error_details?: string;
  }>;
  created_at: string;
  updated_at: string;
}

class WorkflowOrchestrationService {
  // Workflow Management
  async createWorkflow(workflow: Omit<Workflow, 'id' | 'created_at' | 'updated_at'>): Promise<Workflow> {
    try {
      // Convert the workflow to match database schema
      const workflowData = {
        ...workflow,
        workflow_definition: workflow.workflow_definition as any,
        triggers: workflow.triggers as any
      };

      const { data, error } = await supabase
        .from('workflows')
        .insert(workflowData)
        .select()
        .single();

      if (error) {
        console.error('Error creating workflow:', error);
        throw error;
      }

      return {
        ...data,
        workflow_definition: data.workflow_definition as Workflow['workflow_definition'],
        triggers: data.triggers as Record<string, any>,
        status: data.status as Workflow['status']
      };
    } catch (error) {
      console.error('Error in createWorkflow:', error);
      throw error;
    }
  }

  async getWorkflows(orgId: string, status?: string): Promise<Workflow[]> {
    try {
      let query = supabase
        .from('workflows')
        .select('*')
        .eq('org_id', orgId)
        .order('updated_at', { ascending: false });

      if (status) {
        query = query.eq('status', status);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching workflows:', error);
        throw error;
      }

      return (data || []).map((item: any) => ({
        ...item,
        workflow_definition: item.workflow_definition as Workflow['workflow_definition'],
        triggers: item.triggers as Record<string, any>,
        status: item.status as Workflow['status']
      }));
    } catch (error) {
      console.error('Error in getWorkflows:', error);
      throw error;
    }
  }

  async updateWorkflow(workflowId: string, updates: Partial<Workflow>): Promise<void> {
    try {
      // Convert updates to match database schema
      const updateData: any = { ...updates };
      if (updates.workflow_definition) {
        updateData.workflow_definition = updates.workflow_definition as any;
      }
      if (updates.triggers) {
        updateData.triggers = updates.triggers as any;
      }

      const { error } = await supabase
        .from('workflows')
        .update(updateData)
        .eq('id', workflowId);

      if (error) {
        console.error('Error updating workflow:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error in updateWorkflow:', error);
      throw error;
    }
  }

  // Workflow Execution
  async executeWorkflow(workflowId: string, inputData: Record<string, any> = {}): Promise<string> {
    try {
      // Get workflow definition
      const { data: workflow, error: workflowError } = await supabase
        .from('workflows')
        .select('*')
        .eq('id', workflowId)
        .single();

      if (workflowError || !workflow) {
        throw new Error('Workflow not found');
      }

      // Create execution record
      const execution: Omit<WorkflowExecution, 'id' | 'created_at' | 'updated_at'> = {
        workflow_id: workflowId,
        org_id: workflow.org_id,
        status: 'running',
        execution_context: inputData,
        started_at: new Date().toISOString(),
        execution_log: []
      };

      const { data: executionData, error: executionError } = await supabase
        .from('workflow_executions')
        .insert([execution])
        .select()
        .single();

      if (executionError) {
        console.error('Error creating workflow execution:', executionError);
        throw executionError;
      }

      // Start workflow execution (this would be handled by a background process in production)
      this.processWorkflowExecution(executionData.id, workflow.workflow_definition as any);

      return executionData.id;
    } catch (error) {
      console.error('Error in executeWorkflow:', error);
      throw error;
    }
  }

  private async processWorkflowExecution(executionId: string, workflowDefinition: any): Promise<void> {
    try {
      const nodes = workflowDefinition.nodes || [];
      const edges = workflowDefinition.edges || [];

      // Find start node
      const startNode = nodes.find((node: any) => node.data.nodeType === 'start');
      if (!startNode) {
        throw new Error('No start node found in workflow');
      }

      // Execute workflow steps
      await this.executeNode(executionId, startNode, nodes, edges, {});

      // Mark execution as completed
      await supabase
        .from('workflow_executions')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString()
        })
        .eq('id', executionId);

    } catch (error) {
      console.error('Error processing workflow execution:', error);
      
      // Mark execution as failed
      await supabase
        .from('workflow_executions')
        .update({
          status: 'failed',
          completed_at: new Date().toISOString(),
          error_message: error instanceof Error ? error.message : 'Unknown error'
        })
        .eq('id', executionId);
    }
  }

  private async executeNode(
    executionId: string,
    node: any,
    nodes: any[],
    edges: any[],
    context: Record<string, any>
  ): Promise<Record<string, any>> {
    const startTime = new Date().toISOString();
    let result: Record<string, any> = {};

    try {
      // Log node execution start
      const logEntry = {
        node_id: node.id,
        step_name: node.data.label,
        status: 'running',
        started_at: startTime,
        input_data: context
      };

      await this.logExecutionStep(executionId, logEntry);

      // Execute node based on type
      switch (node.data.nodeType) {
        case 'start':
          result = { ...context };
          break;
        case 'task':
          result = await this.executeTaskNode(node, context);
          break;
        case 'decision':
          result = await this.executeDecisionNode(node, context);
          break;
        case 'integration':
          result = await this.executeIntegrationNode(node, context);
          break;
        case 'approval':
          result = await this.executeApprovalNode(node, context);
          break;
        case 'notification':
          result = await this.executeNotificationNode(node, context);
          break;
        case 'end':
          result = { ...context, completed: true };
          break;
        default:
          throw new Error(`Unknown node type: ${node.data.nodeType}`);
      }

      // Log successful execution
      await this.logExecutionStep(executionId, {
        node_id: node.id,
        step_name: node.data.label,
        status: 'completed',
        started_at: startTime,
        completed_at: new Date().toISOString(),
        input_data: context,
        output_data: result
      });

      // Find and execute next nodes
      const nextEdges = edges.filter(edge => edge.source === node.id);
      for (const edge of nextEdges) {
        const nextNode = nodes.find(n => n.id === edge.target);
        if (nextNode && nextNode.data.nodeType !== 'end') {
          await this.executeNode(executionId, nextNode, nodes, edges, { ...context, ...result });
        }
      }

      return result;
    } catch (error) {
      // Log failed execution
      await this.logExecutionStep(executionId, {
        node_id: node.id,
        step_name: node.data.label,
        status: 'failed',
        started_at: startTime,
        completed_at: new Date().toISOString(),
        input_data: context,
        error_details: error instanceof Error ? error.message : 'Unknown error'
      });

      throw error;
    }
  }

  private async executeTaskNode(node: any, context: Record<string, any>): Promise<Record<string, any>> {
    // Simulate task execution
    const config = node.data.configuration || {};
    const delay = config.delay || 1000;
    
    await new Promise(resolve => setTimeout(resolve, delay));
    
    return {
      taskCompleted: true,
      taskResult: `Task ${node.data.label} completed`,
      timestamp: new Date().toISOString()
    };
  }

  private async executeDecisionNode(node: any, context: Record<string, any>): Promise<Record<string, any>> {
    const config = node.data.configuration || {};
    const condition = config.condition || 'true';
    
    // Simple condition evaluation (in production, this would be more sophisticated)
    const result = eval(condition.replace(/\$\{(\w+)\}/g, (match: string, key: string) => {
      return context[key] || 'false';
    }));
    
    return {
      decision: result,
      decisionPath: result ? 'true' : 'false'
    };
  }

  private async executeIntegrationNode(node: any, context: Record<string, any>): Promise<Record<string, any>> {
    const config = node.data.configuration || {};
    
    // Simulate integration call
    return {
      integrationResult: `Integration ${config.endpoint || 'unknown'} called`,
      status: 'success'
    };
  }

  private async executeApprovalNode(node: any, context: Record<string, any>): Promise<Record<string, any>> {
    // In production, this would create an approval request and wait for human input
    return {
      approvalRequired: true,
      approvalStatus: 'pending',
      approver: node.data.configuration?.approver || 'system'
    };
  }

  private async executeNotificationNode(node: any, context: Record<string, any>): Promise<Record<string, any>> {
    const config = node.data.configuration || {};
    
    console.log(`Notification sent: ${config.message || 'No message'}`);
    
    return {
      notificationSent: true,
      recipients: config.recipients || [],
      message: config.message || ''
    };
  }

  private async logExecutionStep(executionId: string, logEntry: any): Promise<void> {
    try {
      await supabase
        .from('workflow_execution_logs')
        .insert([{
          execution_id: executionId,
          ...logEntry
        }]);
    } catch (error) {
      console.error('Error logging execution step:', error);
    }
  }

  // Get execution status and logs
  async getWorkflowExecution(executionId: string): Promise<WorkflowExecution | null> {
    try {
      const { data, error } = await supabase
        .from('workflow_executions')
        .select('*')
        .eq('id', executionId)
        .single();

      if (error) {
        console.error('Error fetching workflow execution:', error);
        return null;
      }

      return {
        ...data,
        execution_context: data.execution_context as Record<string, any>,
        execution_log: data.execution_log as WorkflowExecution['execution_log'],
        status: data.status as WorkflowExecution['status']
      };
    } catch (error) {
      console.error('Error in getWorkflowExecution:', error);
      return null;
    }
  }

  async getWorkflowExecutions(workflowId: string): Promise<WorkflowExecution[]> {
    try {
      const { data, error } = await supabase
        .from('workflow_executions')
        .select('*')
        .eq('workflow_id', workflowId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching workflow executions:', error);
        throw error;
      }

      return (data || []).map(item => ({
        ...item,
        execution_context: item.execution_context as Record<string, any>,
        execution_log: item.execution_log as WorkflowExecution['execution_log'],
        status: item.status as WorkflowExecution['status']
      }));
    } catch (error) {
      console.error('Error in getWorkflowExecutions:', error);
      throw error;
    }
  }
}

export const workflowOrchestrationService = new WorkflowOrchestrationService();
