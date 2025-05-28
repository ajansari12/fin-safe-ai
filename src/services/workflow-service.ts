
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
  // Template operations
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
  },

  async createWorkflowTemplate(data: Omit<WorkflowTemplate, 'id' | 'created_at' | 'updated_at'>): Promise<WorkflowTemplate> {
    const { data: newTemplate, error } = await supabase
      .from('workflow_templates')
      .insert([data])
      .select()
      .single();

    if (error) {
      console.error('Error creating workflow template:', error);
      throw error;
    }

    return {
      ...newTemplate,
      steps: Array.isArray(newTemplate.steps) ? newTemplate.steps : []
    };
  },

  async updateWorkflowTemplate(id: string, data: Partial<WorkflowTemplate>): Promise<WorkflowTemplate> {
    const { data: updatedTemplate, error } = await supabase
      .from('workflow_templates')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating workflow template:', error);
      throw error;
    }

    return {
      ...updatedTemplate,
      steps: Array.isArray(updatedTemplate.steps) ? updatedTemplate.steps : []
    };
  },

  async deleteWorkflowTemplate(id: string): Promise<void> {
    const { error } = await supabase
      .from('workflow_templates')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting workflow template:', error);
      throw error;
    }
  },

  // Instance operations
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
      steps: (item.steps || []).map((step: any) => ({
        ...step,
        status: step.status as WorkflowStep['status']
      }))
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
      steps: (item.steps || []).map((step: any) => ({
        ...step,
        status: step.status as WorkflowStep['status']
      }))
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
      steps: (item.steps || []).map((step: any) => ({
        ...step,
        status: step.status as WorkflowStep['status']
      }))
    }));
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

    // Create workflow steps from template
    const { data: template } = await supabase
      .from('workflow_templates')
      .select('steps')
      .eq('id', data.template_id)
      .single();

    if (template?.steps && Array.isArray(template.steps)) {
      const steps = template.steps.map((step: any, index: number) => ({
        workflow_instance_id: newInstance.id,
        step_number: index + 1,
        step_name: step.step_name || `Step ${index + 1}`,
        step_description: step.step_description,
        assigned_to: step.assigned_to,
        assigned_to_name: step.assigned_to_name,
        due_date: step.due_date,
        status: 'pending'
      }));

      await supabase
        .from('workflow_steps')
        .insert(steps);
    }

    return {
      ...newInstance,
      status: newInstance.status as WorkflowInstance['status']
    };
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

  // Step operations
  async updateWorkflowStep(stepId: string, data: Partial<WorkflowStep>): Promise<WorkflowStep> {
    const updateData = {
      ...data,
      updated_at: new Date().toISOString()
    };

    if (data.status === 'completed' && !data.completed_at) {
      updateData.completed_at = new Date().toISOString();
    }

    const { data: updatedStep, error } = await supabase
      .from('workflow_steps')
      .update(updateData)
      .eq('id', stepId)
      .select()
      .single();

    if (error) {
      console.error('Error updating workflow step:', error);
      throw error;
    }

    return {
      ...updatedStep,
      status: updatedStep.status as WorkflowStep['status']
    };
  },

  async completeWorkflowStep(stepId: string, notes?: string): Promise<void> {
    const { error } = await supabase
      .from('workflow_steps')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        notes: notes,
        updated_at: new Date().toISOString()
      })
      .eq('id', stepId);

    if (error) {
      console.error('Error completing workflow step:', error);
      throw error;
    }

    // Check if all steps are completed and update instance status
    const { data: stepData } = await supabase
      .from('workflow_steps')
      .select('workflow_instance_id, status')
      .eq('id', stepId)
      .single();

    if (stepData) {
      const { data: allSteps } = await supabase
        .from('workflow_steps')
        .select('status')
        .eq('workflow_instance_id', stepData.workflow_instance_id);

      const allCompleted = allSteps?.every(step => step.status === 'completed' || step.status === 'skipped');
      
      if (allCompleted) {
        await this.updateWorkflowInstanceStatus(stepData.workflow_instance_id, 'completed');
      }
    }
  }
};
