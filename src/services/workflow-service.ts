
import { supabase } from "@/integrations/supabase/client";

export interface WorkflowTemplate {
  id: string;
  org_id: string;
  name: string;
  description?: string;
  module: string;
  steps: any[];
  created_at: string;
  updated_at: string;
  created_by?: string;
}

export interface WorkflowInstance {
  id: string;
  template_id: string;
  org_id: string;
  name: string;
  status: 'draft' | 'in_progress' | 'completed' | 'cancelled';
  owner_id?: string;
  owner_name?: string;
  started_at?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
  template?: WorkflowTemplate;
  steps?: WorkflowStep[];
}

export interface WorkflowStep {
  id: string;
  workflow_instance_id: string;
  step_number: number;
  step_name: string;
  step_description?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'skipped';
  assigned_to?: string;
  assigned_to_name?: string;
  due_date?: string;
  completed_at?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export const workflowService = {
  async getWorkflowInstances(orgId: string): Promise<WorkflowInstance[]> {
    const { data, error } = await supabase
      .from('workflow_instances')
      .select(`
        *,
        template:workflow_templates(*),
        steps:workflow_steps(*)
      `)
      .eq('org_id', orgId)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error fetching workflow instances:', error);
      throw error;
    }

    return (data || []).map(item => ({
      ...item,
      status: item.status as WorkflowInstance['status'],
      template: item.template ? {
        ...item.template,
        steps: Array.isArray(item.template.steps) ? item.template.steps : []
      } : undefined,
      steps: item.steps || []
    }));
  },

  async getWorkflowInstancesByStatus(orgId: string, status: string): Promise<WorkflowInstance[]> {
    const { data, error } = await supabase
      .from('workflow_instances')
      .select(`
        *,
        template:workflow_templates(*),
        steps:workflow_steps(*)
      `)
      .eq('org_id', orgId)
      .eq('status', status)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error fetching workflow instances by status:', error);
      throw error;
    }

    return (data || []).map(item => ({
      ...item,
      status: item.status as WorkflowInstance['status'],
      template: item.template ? {
        ...item.template,
        steps: Array.isArray(item.template.steps) ? item.template.steps : []
      } : undefined,
      steps: item.steps || []
    }));
  },

  async getWorkflowInstancesByModule(orgId: string, module: string): Promise<WorkflowInstance[]> {
    const { data, error } = await supabase
      .from('workflow_instances')
      .select(`
        *,
        template:workflow_templates!inner(*),
        steps:workflow_steps(*)
      `)
      .eq('org_id', orgId)
      .eq('template.module', module)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error fetching workflow instances by module:', error);
      throw error;
    }

    return (data || []).map(item => ({
      ...item,
      status: item.status as WorkflowInstance['status'],
      template: item.template ? {
        ...item.template,
        steps: Array.isArray(item.template.steps) ? item.template.steps : []
      } : undefined,
      steps: item.steps || []
    }));
  },

  async updateWorkflowInstanceStatus(instanceId: string, status: WorkflowInstance['status'], additionalFields?: Partial<WorkflowInstance>): Promise<void> {
    const updateData: any = { 
      status, 
      updated_at: new Date().toISOString(),
      ...additionalFields
    };

    if (status === 'in_progress' && !additionalFields?.started_at) {
      updateData.started_at = new Date().toISOString();
    }

    if (status === 'completed' && !additionalFields?.completed_at) {
      updateData.completed_at = new Date().toISOString();
    }

    const { error } = await supabase
      .from('workflow_instances')
      .update(updateData)
      .eq('id', instanceId);

    if (error) {
      console.error('Error updating workflow instance status:', error);
      throw error;
    }
  },

  async createWorkflowInstance(data: Omit<WorkflowInstance, 'id' | 'created_at' | 'updated_at'>): Promise<WorkflowInstance> {
    const { data: newInstance, error } = await supabase
      .from('workflow_instances')
      .insert([data])
      .select()
      .single();

    if (error) {
      console.error('Error creating workflow instance:', error);
      throw error;
    }

    return {
      ...newInstance,
      status: newInstance.status as WorkflowInstance['status']
    };
  },

  async getWorkflowTemplates(orgId: string): Promise<WorkflowTemplate[]> {
    const { data, error } = await supabase
      .from('workflow_templates')
      .select('*')
      .eq('org_id', orgId)
      .order('name');

    if (error) {
      console.error('Error fetching workflow templates:', error);
      throw error;
    }

    return (data || []).map(item => ({
      ...item,
      steps: Array.isArray(item.steps) ? item.steps : []
    }));
  }
};
