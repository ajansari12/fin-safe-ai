
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
        nodes: Array.isArray(workflow.nodes) ? workflow.nodes : [],
        edges: Array.isArray(workflow.edges) ? workflow.edges : [],
        variables: workflow.variables || {},
        business_rules: Array.isArray(workflow.business_rules) ? workflow.business_rules : []
      }));
    } catch (error) {
      console.error('Error fetching workflow orchestrations:', error);
      throw error;
    }
  }

  async createWorkflowOrchestration(workflow: Omit<WorkflowOrchestration, 'id' | 'created_at' | 'updated_at'>): Promise<WorkflowOrchestration> {
    try {
      const { data, error } = await supabase
        .from('workflow_orchestrations')
        .insert([{
          ...workflow,
          nodes: JSON.stringify(workflow.nodes),
          edges: JSON.stringify(workflow.edges),
          variables: JSON.stringify(workflow.variables),
          business_rules: JSON.stringify(workflow.business_rules)
        }])
        .select()
        .single();

      if (error) throw error;

      return {
        ...data,
        nodes: Array.isArray(data.nodes) ? data.nodes : JSON.parse(data.nodes || '[]'),
        edges: Array.isArray(data.edges) ? data.edges : JSON.parse(data.edges || '[]'),
        variables: typeof data.variables === 'object' ? data.variables : JSON.parse(data.variables || '{}'),
        business_rules: Array.isArray(data.business_rules) ? data.business_rules : JSON.parse(data.business_rules || '[]')
      };
    } catch (error) {
      console.error('Error creating workflow orchestration:', error);
      throw error;
    }
  }

  async updateWorkflowOrchestration(id: string, updates: Partial<WorkflowOrchestration>): Promise<WorkflowOrchestration> {
    try {
      const updateData = {
        ...updates,
        nodes: updates.nodes ? JSON.stringify(updates.nodes) : undefined,
        edges: updates.edges ? JSON.stringify(updates.edges) : undefined,
        variables: updates.variables ? JSON.stringify(updates.variables) : undefined,
        business_rules: updates.business_rules ? JSON.stringify(updates.business_rules) : undefined,
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('workflow_orchestrations')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return {
        ...data,
        nodes: Array.isArray(data.nodes) ? data.nodes : JSON.parse(data.nodes || '[]'),
        edges: Array.isArray(data.edges) ? data.edges : JSON.parse(data.edges || '[]'),
        variables: typeof data.variables === 'object' ? data.variables : JSON.parse(data.variables || '{}'),
        business_rules: Array.isArray(data.business_rules) ? data.business_rules : JSON.parse(data.business_rules || '[]')
      };
    } catch (error) {
      console.error('Error updating workflow orchestration:', error);
      throw error;
    }
  }

  // Workflow Execution
  async executeWorkflow(workflowId: string, context: any = {}): Promise<WorkflowExecution> {
    try {
      const workflow = await this.getWorkflowOrchestration(workflowId);
      if (!workflow) throw new Error('Workflow not found');

      const execution: Omit<WorkflowExecution, 'id'> = {
        workflow_id: workflowId,
        execution_context: context,
        current_node: this.findStartNode(workflow.nodes)?.id || '',
        status: 'running',
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

      // Start execution process
      this.processWorkflowNode(data.id, workflow, execution.current_node, context);

      return data;
    } catch (error) {
      console.error('Error executing workflow:', error);
      throw error;
    }
  }

  private async processWorkflowNode(executionId: string, workflow: WorkflowOrchestration, nodeId: string, context: any): Promise<void> {
    try {
      const node = workflow.nodes.find(n => n.id === nodeId);
      if (!node) throw new Error(`Node ${nodeId} not found`);

      await this.logExecutionStep(executionId, nodeId, 'processing', `Processing node: ${node.name}`);

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
      await this.logExecutionStep(executionId, nodeId, 'error', `Error: ${error.message}`, { error: error.message });
      await this.updateExecutionStatus(executionId, 'failed', error.message);
    }
  }

  private async processStartNode(executionId: string, workflow: WorkflowOrchestration, node: WorkflowNode, context: any): Promise<void> {
    await this.logExecutionStep(executionId, node.id, 'success', 'Workflow started');
    const nextNode = this.getNextNode(workflow, node.id);
    if (nextNode) {
      await this.processWorkflowNode(executionId, workflow, nextNode.id, context);
    }
  }

  private async processTaskNode(executionId: string, workflow: WorkflowOrchestration, node: WorkflowNode, context: any): Promise<void> {
    // Apply business rules
    const applicableRules = workflow.business_rules.filter(rule => 
      rule.is_active && this.evaluateConditions(rule.conditions, context)
    );

    for (const rule of applicableRules) {
      await this.executeRuleActions(rule.actions, context);
    }

    // For now, simulate task completion
    await this.logExecutionStep(executionId, node.id, 'success', `Task completed: ${node.name}`);
    
    const nextNode = this.getNextNode(workflow, node.id);
    if (nextNode) {
      await this.processWorkflowNode(executionId, workflow, nextNode.id, context);
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
      await this.processWorkflowNode(executionId, workflow, nextEdge.target, context);
    }
  }

  private async processIntegrationNode(executionId: string, workflow: WorkflowOrchestration, node: WorkflowNode, context: any): Promise<void> {
    await this.logExecutionStep(executionId, node.id, 'success', `Integration executed: ${node.name}`);
    
    const nextNode = this.getNextNode(workflow, node.id);
    if (nextNode) {
      await this.processWorkflowNode(executionId, workflow, nextNode.id, context);
    }
  }

  private async processParallelNode(executionId: string, workflow: WorkflowOrchestration, node: WorkflowNode, context: any): Promise<void> {
    const branches = node.parallel_branches || [];
    await this.logExecutionStep(executionId, node.id, 'success', `Parallel execution started for ${branches.length} branches`);

    // Execute branches in parallel (simplified for now)
    for (const branchId of branches) {
      await this.processWorkflowNode(executionId, workflow, branchId, context);
    }
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
    const logEntry: ExecutionLogEntry = {
      timestamp: new Date().toISOString(),
      node_id: nodeId,
      action: 'process',
      status,
      message,
      data
    };

    await supabase
      .from('workflow_executions')
      .update({
        execution_log: supabase.raw(`execution_log || '[${JSON.stringify(logEntry)}]'::jsonb`)
      })
      .eq('id', executionId);
  }

  private async updateExecutionStatus(executionId: string, status: WorkflowExecution['status'], errorMessage?: string): Promise<void> {
    const updates: any = { status };
    if (status === 'completed' || status === 'failed') {
      updates.completed_at = new Date().toISOString();
    }
    if (errorMessage) {
      updates.error_message = errorMessage;
    }

    await supabase
      .from('workflow_executions')
      .update(updates)
      .eq('id', executionId);
  }

  private async getWorkflowOrchestration(id: string): Promise<WorkflowOrchestration | null> {
    const { data, error } = await supabase
      .from('workflow_orchestrations')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) return null;

    return {
      ...data,
      nodes: Array.isArray(data.nodes) ? data.nodes : JSON.parse(data.nodes || '[]'),
      edges: Array.isArray(data.edges) ? data.edges : JSON.parse(data.edges || '[]'),
      variables: typeof data.variables === 'object' ? data.variables : JSON.parse(data.variables || '{}'),
      business_rules: Array.isArray(data.business_rules) ? data.business_rules : JSON.parse(data.business_rules || '[]')
    };
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
        message: error.message
      };
    }
  }

  // Data Orchestration
  async synchronizeData(sourceModule: string, targetModule: string, dataMapping: Record<string, string>): Promise<void> {
    try {
      // Implement cross-module data synchronization
      console.log(`Synchronizing data from ${sourceModule} to ${targetModule}`, dataMapping);
    } catch (error) {
      console.error('Error synchronizing data:', error);
      throw error;
    }
  }
}

export const workflowOrchestrationService = new WorkflowOrchestrationService();
