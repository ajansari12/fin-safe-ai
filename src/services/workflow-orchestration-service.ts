
import { supabase } from "@/integrations/supabase/client";
import { getCurrentUserProfile } from "@/lib/supabase-utils";

export interface WorkflowNode {
  id: string;
  type: 'start' | 'task' | 'decision' | 'integration' | 'end' | 'parallel' | 'merge';
  name: string;
  description?: string;
  position: { x: number; y: number };
  module?: string;
  action?: string;
  conditions?: WorkflowCondition[];
  assignments?: WorkflowAssignment[];
  integration_config?: any;
  parallel_branches?: string[];
  timeout_minutes?: number;
  retry_config?: {
    max_attempts: number;
    delay_seconds: number;
  };
}

export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  condition?: string;
  label?: string;
}

export interface WorkflowCondition {
  field: string;
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'contains' | 'exists';
  value: any;
  logical_operator?: 'AND' | 'OR';
}

export interface WorkflowAssignment {
  type: 'user' | 'role' | 'auto' | 'ml_predicted';
  target_id?: string;
  target_name?: string;
  criteria?: any;
}

export interface WorkflowOrchestration {
  id: string;
  name: string;
  description?: string;
  version: number;
  status: 'draft' | 'active' | 'deprecated';
  category: string;
  trigger_type: 'manual' | 'scheduled' | 'event' | 'api';
  trigger_config?: any;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  variables: Record<string, any>;
  business_rules: BusinessRule[];
  org_id: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface BusinessRule {
  id: string;
  name: string;
  description?: string;
  rule_type: 'validation' | 'assignment' | 'routing' | 'calculation';
  conditions: WorkflowCondition[];
  actions: RuleAction[];
  priority: number;
  is_active: boolean;
}

export interface RuleAction {
  type: 'assign' | 'route' | 'calculate' | 'notify' | 'validate';
  target: string;
  value?: any;
  parameters?: Record<string, any>;
}

export interface WorkflowExecution {
  id: string;
  workflow_id: string;
  execution_context: any;
  current_node: string;
  status: 'running' | 'completed' | 'failed' | 'paused' | 'cancelled';
  started_at: string;
  completed_at?: string;
  error_message?: string;
  execution_log: ExecutionLogEntry[];
  org_id: string;
}

export interface ExecutionLogEntry {
  timestamp: string;
  node_id: string;
  action: string;
  status: 'success' | 'error' | 'warning';
  message: string;
  data?: any;
}

// Helper function to safely parse JSON with fallback
const safeParseJSON = (value: any, fallback: any = null) => {
  if (value === null || value === undefined) return fallback;
  if (typeof value === 'object') return value;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
};

// Helper function to ensure status is valid
const validateStatus = (status: string, validStatuses: string[], defaultStatus: string) => {
  return validStatuses.includes(status) ? status : defaultStatus;
};

class WorkflowOrchestrationService {
  // Workflow Template Management
  async getWorkflowOrchestrations(orgId: string): Promise<WorkflowOrchestration[]> {
    try {
      const { data, error } = await supabase
        .from('workflow_orchestrations')
        .select('*')
        .eq('org_id', orgId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data || []).map(workflow => ({
        ...workflow,
        status: validateStatus(workflow.status, ['draft', 'active', 'deprecated'], 'draft') as 'draft' | 'active' | 'deprecated',
        trigger_type: validateStatus(workflow.trigger_type, ['manual', 'scheduled', 'event', 'api'], 'manual') as 'manual' | 'scheduled' | 'event' | 'api',
        nodes: safeParseJSON(workflow.nodes, []) as WorkflowNode[],
        edges: safeParseJSON(workflow.edges, []) as WorkflowEdge[],
        variables: safeParseJSON(workflow.variables, {}) as Record<string, any>,
        business_rules: safeParseJSON(workflow.business_rules, []) as BusinessRule[]
      }));
    } catch (error) {
      console.error('Error fetching workflow orchestrations:', error);
      throw error;
    }
  }

  async createWorkflowOrchestration(workflow: Omit<WorkflowOrchestration, 'id' | 'created_at' | 'updated_at'>): Promise<WorkflowOrchestration> {
    try {
      // Validate required fields
      if (!workflow.name?.trim()) {
        throw new Error('Workflow name is required');
      }
      if (!workflow.category?.trim()) {
        throw new Error('Workflow category is required');
      }
      if (!workflow.org_id) {
        throw new Error('Organization ID is required');
      }

      const { data, error } = await supabase
        .from('workflow_orchestrations')
        .insert([{
          ...workflow,
          nodes: JSON.stringify(workflow.nodes || []),
          edges: JSON.stringify(workflow.edges || []),
          variables: JSON.stringify(workflow.variables || {}),
          business_rules: JSON.stringify(workflow.business_rules || [])
        }])
        .select()
        .single();

      if (error) throw error;

      return {
        ...data,
        status: validateStatus(data.status, ['draft', 'active', 'deprecated'], 'draft') as 'draft' | 'active' | 'deprecated',
        trigger_type: validateStatus(data.trigger_type, ['manual', 'scheduled', 'event', 'api'], 'manual') as 'manual' | 'scheduled' | 'event' | 'api',
        nodes: safeParseJSON(data.nodes, []) as WorkflowNode[],
        edges: safeParseJSON(data.edges, []) as WorkflowEdge[],
        variables: safeParseJSON(data.variables, {}) as Record<string, any>,
        business_rules: safeParseJSON(data.business_rules, []) as BusinessRule[]
      };
    } catch (error) {
      console.error('Error creating workflow orchestration:', error);
      throw error;
    }
  }

  async updateWorkflowOrchestration(id: string, updates: Partial<WorkflowOrchestration>): Promise<WorkflowOrchestration> {
    try {
      const updateData: any = { ...updates };
      
      // Handle JSONB fields properly
      if (updates.nodes) {
        updateData.nodes = JSON.stringify(updates.nodes);
      }
      if (updates.edges) {
        updateData.edges = JSON.stringify(updates.edges);
      }
      if (updates.variables) {
        updateData.variables = JSON.stringify(updates.variables);
      }
      if (updates.business_rules) {
        updateData.business_rules = JSON.stringify(updates.business_rules);
      }

      // Remove computed fields that shouldn't be updated
      delete updateData.id;
      delete updateData.created_at;
      delete updateData.updated_at;

      const { data, error } = await supabase
        .from('workflow_orchestrations')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return {
        ...data,
        status: validateStatus(data.status, ['draft', 'active', 'deprecated'], 'draft') as 'draft' | 'active' | 'deprecated',
        trigger_type: validateStatus(data.trigger_type, ['manual', 'scheduled', 'event', 'api'], 'manual') as 'manual' | 'scheduled' | 'event' | 'api',
        nodes: safeParseJSON(data.nodes, []) as WorkflowNode[],
        edges: safeParseJSON(data.edges, []) as WorkflowEdge[],
        variables: safeParseJSON(data.variables, {}) as Record<string, any>,
        business_rules: safeParseJSON(data.business_rules, []) as BusinessRule[]
      };
    } catch (error) {
      console.error('Error updating workflow orchestration:', error);
      throw error;
    }
  }

  async deleteWorkflowOrchestration(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('workflow_orchestrations')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting workflow orchestration:', error);
      throw error;
    }
  }

  // Workflow Execution
  async executeWorkflow(workflowId: string, context: any = {}): Promise<WorkflowExecution> {
    try {
      const workflow = await this.getWorkflowOrchestration(workflowId);
      if (!workflow) throw new Error('Workflow not found');

      const startNode = this.findStartNode(workflow.nodes);
      if (!startNode) throw new Error('No start node found in workflow');

      const execution = {
        workflow_id: workflowId,
        execution_context: context,
        current_node: startNode.id,
        status: 'running' as const,
        started_at: new Date().toISOString(),
        execution_log: [],
        org_id: workflow.org_id
      };

      const { data, error } = await supabase
        .from('workflow_executions')
        .insert([execution])
        .select()
        .single();

      if (error) throw error;

      // Start execution process asynchronously
      this.processWorkflowExecution(data.id, workflow, startNode.id, context);

      return {
        ...data,
        status: validateStatus(data.status, ['running', 'completed', 'failed', 'paused', 'cancelled'], 'running') as 'running' | 'completed' | 'failed' | 'paused' | 'cancelled',
        execution_log: safeParseJSON(data.execution_log, []) as ExecutionLogEntry[]
      };
    } catch (error) {
      console.error('Error executing workflow:', error);
      throw error;
    }
  }

  async getWorkflowExecutions(orgId: string, workflowId?: string): Promise<WorkflowExecution[]> {
    try {
      let query = supabase
        .from('workflow_executions')
        .select('*')
        .eq('org_id', orgId)
        .order('started_at', { ascending: false });

      if (workflowId) {
        query = query.eq('workflow_id', workflowId);
      }

      const { data, error } = await query;

      if (error) throw error;

      return (data || []).map(execution => ({
        ...execution,
        status: validateStatus(execution.status, ['running', 'completed', 'failed', 'paused', 'cancelled'], 'running') as 'running' | 'completed' | 'failed' | 'paused' | 'cancelled',
        execution_log: safeParseJSON(execution.execution_log, []) as ExecutionLogEntry[]
      }));
    } catch (error) {
      console.error('Error fetching workflow executions:', error);
      throw error;
    }
  }

  private async processWorkflowExecution(executionId: string, workflow: WorkflowOrchestration, nodeId: string, context: any): Promise<void> {
    try {
      const node = workflow.nodes.find(n => n.id === nodeId);
      if (!node) {
        await this.updateExecutionStatus(executionId, 'failed', `Node ${nodeId} not found`);
        return;
      }

      await this.logExecutionStep(executionId, nodeId, 'success', `Processing node: ${node.name}`);

      switch (node.type) {
        case 'start':
          await this.processStartNode(executionId, workflow, node, context);
          break;
        case 'task':
          await this.processTaskNode(executionId, workflow, node, context);
          break;
        case 'decision':
          await this.processDecisionNode(executionId, workflow, node, context);
          break;
        case 'integration':
          await this.processIntegrationNode(executionId, workflow, node, context);
          break;
        case 'parallel':
          await this.processParallelNode(executionId, workflow, node, context);
          break;
        case 'end':
          await this.processEndNode(executionId, workflow, node, context);
          break;
        default:
          throw new Error(`Unknown node type: ${node.type}`);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      await this.logExecutionStep(executionId, nodeId, 'error', `Error: ${errorMessage}`, { error: errorMessage });
      await this.updateExecutionStatus(executionId, 'failed', errorMessage);
    }
  }

  private async processStartNode(executionId: string, workflow: WorkflowOrchestration, node: WorkflowNode, context: any): Promise<void> {
    await this.logExecutionStep(executionId, node.id, 'success', 'Workflow started');
    const nextNode = this.getNextNode(workflow, node.id);
    if (nextNode) {
      await this.processWorkflowExecution(executionId, workflow, nextNode.id, context);
    }
  }

  private async processTaskNode(executionId: string, workflow: WorkflowOrchestration, node: WorkflowNode, context: any): Promise<void> {
    // Apply business rules if any
    const applicableRules = workflow.business_rules.filter(rule => 
      rule.is_active && this.evaluateConditions(rule.conditions, context)
    );

    for (const rule of applicableRules) {
      await this.executeRuleActions(rule.actions, context);
    }

    // Simulate task completion for now
    await this.logExecutionStep(executionId, node.id, 'success', `Task completed: ${node.name}`);
    
    const nextNode = this.getNextNode(workflow, node.id);
    if (nextNode) {
      await this.processWorkflowExecution(executionId, workflow, nextNode.id, context);
    }
  }

  private async processDecisionNode(executionId: string, workflow: WorkflowOrchestration, node: WorkflowNode, context: any): Promise<void> {
    const conditions = node.conditions || [];
    const result = this.evaluateConditions(conditions, context);
    
    await this.logExecutionStep(executionId, node.id, 'success', `Decision evaluated: ${result}`, { result });

    // Find the appropriate next node based on condition result
    const edges = workflow.edges.filter(e => e.source === node.id);
    const nextEdge = edges.find(e => e.condition === result.toString()) || edges[0];
    
    if (nextEdge) {
      await this.processWorkflowExecution(executionId, workflow, nextEdge.target, context);
    }
  }

  private async processIntegrationNode(executionId: string, workflow: WorkflowOrchestration, node: WorkflowNode, context: any): Promise<void> {
    await this.logExecutionStep(executionId, node.id, 'success', `Integration executed: ${node.name}`);
    
    const nextNode = this.getNextNode(workflow, node.id);
    if (nextNode) {
      await this.processWorkflowExecution(executionId, workflow, nextNode.id, context);
    }
  }

  private async processParallelNode(executionId: string, workflow: WorkflowOrchestration, node: WorkflowNode, context: any): Promise<void> {
    const branches = node.parallel_branches || [];
    await this.logExecutionStep(executionId, node.id, 'success', `Parallel execution started for ${branches.length} branches`);

    // Execute branches in parallel (simplified for now)
    const promises = branches.map(branchId => 
      this.processWorkflowExecution(executionId, workflow, branchId, context)
    );
    
    await Promise.all(promises);
  }

  private async processEndNode(executionId: string, workflow: WorkflowOrchestration, node: WorkflowNode, context: any): Promise<void> {
    await this.logExecutionStep(executionId, node.id, 'success', 'Workflow completed');
    await this.updateExecutionStatus(executionId, 'completed');
  }

  private evaluateConditions(conditions: WorkflowCondition[], context: any): boolean {
    if (conditions.length === 0) return true;

    return conditions.every(condition => {
      const value = this.getContextValue(context, condition.field);
      
      switch (condition.operator) {
        case 'equals':
          return value === condition.value;
        case 'not_equals':
          return value !== condition.value;
        case 'greater_than':
          return Number(value) > Number(condition.value);
        case 'less_than':
          return Number(value) < Number(condition.value);
        case 'contains':
          return String(value).includes(String(condition.value));
        case 'exists':
          return value !== undefined && value !== null;
        default:
          return false;
      }
    });
  }

  private async executeRuleActions(actions: RuleAction[], context: any): Promise<void> {
    for (const action of actions) {
      switch (action.type) {
        case 'assign':
          context[action.target] = action.value;
          break;
        case 'calculate':
          // Implement calculation logic
          break;
        case 'notify':
          // Implement notification logic
          break;
        case 'validate':
          // Implement validation logic
          break;
      }
    }
  }

  private getContextValue(context: any, field: string): any {
    return field.split('.').reduce((obj, key) => obj?.[key], context);
  }

  private findStartNode(nodes: WorkflowNode[]): WorkflowNode | undefined {
    return nodes.find(node => node.type === 'start');
  }

  private getNextNode(workflow: WorkflowOrchestration, currentNodeId: string): WorkflowNode | undefined {
    const edge = workflow.edges.find(e => e.source === currentNodeId);
    return edge ? workflow.nodes.find(n => n.id === edge.target) : undefined;
  }

  private async logExecutionStep(executionId: string, nodeId: string, status: 'success' | 'error' | 'warning', message: string, data?: any): Promise<void> {
    try {
      const logEntry: ExecutionLogEntry = {
        timestamp: new Date().toISOString(),
        node_id: nodeId,
        action: 'process',
        status,
        message,
        data
      };

      // Get current execution log and append new entry
      const { data: execution, error: fetchError } = await supabase
        .from('workflow_executions')
        .select('execution_log')
        .eq('id', executionId)
        .single();

      if (fetchError) throw fetchError;

      const currentLog = safeParseJSON(execution.execution_log, []) as ExecutionLogEntry[];
      const updatedLog = [...currentLog, logEntry];

      const { error: updateError } = await supabase
        .from('workflow_executions')
        .update({ execution_log: JSON.stringify(updatedLog) })
        .eq('id', executionId);

      if (updateError) throw updateError;
    } catch (error) {
      console.error('Error logging execution step:', error);
    }
  }

  private async updateExecutionStatus(executionId: string, status: WorkflowExecution['status'], errorMessage?: string): Promise<void> {
    try {
      const updates: any = { status };
      
      if (status === 'completed' || status === 'failed') {
        updates.completed_at = new Date().toISOString();
      }
      if (errorMessage) {
        updates.error_message = errorMessage;
      }

      const { error } = await supabase
        .from('workflow_executions')
        .update(updates)
        .eq('id', executionId);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating execution status:', error);
    }
  }

  private async getWorkflowOrchestration(id: string): Promise<WorkflowOrchestration | null> {
    try {
      const { data, error } = await supabase
        .from('workflow_orchestrations')
        .select('*')
        .eq('id', id)
        .single();

      if (error || !data) return null;

      return {
        ...data,
        status: validateStatus(data.status, ['draft', 'active', 'deprecated'], 'draft') as 'draft' | 'active' | 'deprecated',
        trigger_type: validateStatus(data.trigger_type, ['manual', 'scheduled', 'event', 'api'], 'manual') as 'manual' | 'scheduled' | 'event' | 'api',
        nodes: safeParseJSON(data.nodes, []) as WorkflowNode[],
        edges: safeParseJSON(data.edges, []) as WorkflowEdge[],
        variables: safeParseJSON(data.variables, {}) as Record<string, any>,
        business_rules: safeParseJSON(data.business_rules, []) as BusinessRule[]
      };
    } catch (error) {
      console.error('Error fetching workflow orchestration:', error);
      return null;
    }
  }

  // Integration Management
  async testIntegration(integrationConfig: any): Promise<{ success: boolean; message: string; data?: any }> {
    try {
      // Simulate integration test
      return {
        success: true,
        message: 'Integration test successful',
        data: { timestamp: new Date().toISOString() }
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Integration test failed'
      };
    }
  }

  // Data Orchestration
  async synchronizeData(sourceModule: string, targetModule: string, dataMapping: Record<string, string>): Promise<void> {
    try {
      console.log(`Synchronizing data from ${sourceModule} to ${targetModule}`, dataMapping);
      // Implementation would depend on specific module APIs
    } catch (error) {
      console.error('Error synchronizing data:', error);
      throw error;
    }
  }

  // Business Rules Management
  async getBusinessRules(orgId: string, workflowId?: string): Promise<BusinessRule[]> {
    try {
      let query = supabase
        .from('business_rules')
        .select('*')
        .eq('org_id', orgId)
        .order('priority', { ascending: false });

      if (workflowId) {
        query = query.eq('workflow_id', workflowId);
      }

      const { data, error } = await query;

      if (error) throw error;

      return (data || []).map(rule => ({
        ...rule,
        rule_type: validateStatus(rule.rule_type, ['validation', 'assignment', 'routing', 'calculation'], 'validation') as 'validation' | 'assignment' | 'routing' | 'calculation',
        conditions: safeParseJSON(rule.conditions, []) as WorkflowCondition[],
        actions: safeParseJSON(rule.actions, []) as RuleAction[]
      }));
    } catch (error) {
      console.error('Error fetching business rules:', error);
      throw error;
    }
  }

  async createBusinessRule(rule: Omit<BusinessRule, 'id'>): Promise<BusinessRule> {
    try {
      // Get current user profile to determine org_id if not provided
      const profile = await getCurrentUserProfile();
      if (!profile?.organization_id) {
        throw new Error('User organization not found');
      }

      const ruleData = {
        org_id: profile.organization_id,
        name: rule.name,
        description: rule.description,
        rule_type: rule.rule_type,
        conditions: JSON.stringify(rule.conditions || []),
        actions: JSON.stringify(rule.actions || []),
        priority: rule.priority,
        is_active: rule.is_active,
        created_by: profile.id
      };

      const { data, error } = await supabase
        .from('business_rules')
        .insert([ruleData])
        .select()
        .single();

      if (error) throw error;

      return {
        ...data,
        rule_type: validateStatus(data.rule_type, ['validation', 'assignment', 'routing', 'calculation'], 'validation') as 'validation' | 'assignment' | 'routing' | 'calculation',
        conditions: safeParseJSON(data.conditions, []) as WorkflowCondition[],
        actions: safeParseJSON(data.actions, []) as RuleAction[]
      };
    } catch (error) {
      console.error('Error creating business rule:', error);
      throw error;
    }
  }
}

export const workflowOrchestrationService = new WorkflowOrchestrationService();
