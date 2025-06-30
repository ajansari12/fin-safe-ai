
import { supabase } from "@/integrations/supabase/client";

export interface WorkflowStep {
  id: string;
  step_name: string;
  step_description?: string;
  step_number: number;
  assigned_to?: string;
  assigned_to_name?: string;
  due_date?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'blocked';
  notes?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
}

export interface WorkflowTemplate {
  id: string;
  name: string;
  description?: string;
  module: string;
  steps: Omit<WorkflowStep, 'id' | 'workflow_instance_id' | 'created_at' | 'updated_at'>[];
  form_config?: any;
  approval_rules?: any;
  escalation_rules?: any;
  org_id: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface WorkflowInstance {
  id: string;
  name: string;
  description?: string;
  template_id: string;
  template?: WorkflowTemplate;
  status: 'draft' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'critical';
  assigned_to?: string;
  assigned_to_name?: string;
  owner_id?: string;
  owner_name?: string;
  started_at?: string;
  due_date?: string;
  completed_at?: string;
  org_id: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
  steps?: WorkflowStep[];
}

class WorkflowService {
  // Template operations
  async getWorkflowTemplates(orgId: string): Promise<WorkflowTemplate[]> {
    try {
      const { data, error } = await supabase
        .from('workflow_templates')
        .select('*')
        .eq('org_id', orgId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching workflow templates:', error);
        throw error;
      }

      return (data || []).map(template => ({
        ...template,
        steps: Array.isArray(template.steps) ? template.steps : []
      }));
    } catch (error) {
      console.error('Error in getWorkflowTemplates:', error);
      throw error;
    }
  }

  async createWorkflowTemplate(template: Omit<WorkflowTemplate, 'id' | 'created_at' | 'updated_at'>): Promise<WorkflowTemplate> {
    try {
      const { data, error } = await supabase
        .from('workflow_templates')
        .insert([template])
        .select()
        .single();

      if (error) {
        console.error('Error creating workflow template:', error);
        throw error;
      }

      return {
        ...data,
        steps: Array.isArray(data.steps) ? data.steps : []
      };
    } catch (error) {
      console.error('Error in createWorkflowTemplate:', error);
      throw error;
    }
  }

  async updateWorkflowTemplate(id: string, updates: Partial<WorkflowTemplate>): Promise<WorkflowTemplate> {
    try {
      const { data, error } = await supabase
        .from('workflow_templates')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating workflow template:', error);
        throw error;
      }

      return {
        ...data,
        steps: Array.isArray(data.steps) ? data.steps : []
      };
    } catch (error) {
      console.error('Error in updateWorkflowTemplate:', error);
      throw error;
    }
  }

  async deleteWorkflowTemplate(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('workflow_templates')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting workflow template:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error in deleteWorkflowTemplate:', error);
      throw error;
    }
  }

  // Instance operations
  async getWorkflowInstances(orgId: string): Promise<WorkflowInstance[]> {
    try {
      const { data, error } = await supabase
        .from('workflow_instances')
        .select(`
          *,
          template:workflow_templates(*)
        `)
        .eq('org_id', orgId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching workflow instances:', error);
        throw error;
      }

      // Fetch steps for each workflow
      const instancesWithSteps = await Promise.all(
        (data || []).map(async (instance) => {
          const steps = await this.getWorkflowSteps(instance.id);
          return { 
            ...instance, 
            steps,
            priority: instance.priority || 'medium',
            owner_name: instance.owner_name || '',
            started_at: instance.started_at || instance.created_at
          };
        })
      );

      return instancesWithSteps;
    } catch (error) {
      console.error('Error in getWorkflowInstances:', error);
      throw error;
    }
  }

  async createWorkflowInstance(instance: Omit<WorkflowInstance, 'id' | 'created_at' | 'updated_at'>): Promise<WorkflowInstance> {
    try {
      const { data, error } = await supabase
        .from('workflow_instances')
        .insert([instance])
        .select()
        .single();

      if (error) {
        console.error('Error creating workflow instance:', error);
        throw error;
      }

      return {
        ...data,
        priority: data.priority || 'medium',
        owner_name: data.owner_name || '',
        started_at: data.started_at || data.created_at
      };
    } catch (error) {
      console.error('Error in createWorkflowInstance:', error);
      throw error;
    }
  }

  async updateWorkflowInstanceStatus(id: string, status: WorkflowInstance['status']): Promise<WorkflowInstance> {
    try {
      const updates: any = { 
        status,
        updated_at: new Date().toISOString()
      };

      if (status === 'completed') {
        updates.completed_at = new Date().toISOString();
      }

      const { data, error } = await supabase
        .from('workflow_instances')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating workflow instance status:', error);
        throw error;
      }

      return {
        ...data,
        priority: data.priority || 'medium',
        owner_name: data.owner_name || '',
        started_at: data.started_at || data.created_at
      };
    } catch (error) {
      console.error('Error in updateWorkflowInstanceStatus:', error);
      throw error;
    }
  }

  // Step operations
  async getWorkflowSteps(workflowInstanceId: string): Promise<WorkflowStep[]> {
    try {
      const { data, error } = await supabase
        .from('workflow_steps')
        .select('*')
        .eq('workflow_instance_id', workflowInstanceId)
        .order('step_number', { ascending: true });

      if (error) {
        console.error('Error fetching workflow steps:', error);
        throw error;
      }

      return (data || []).map(step => ({
        ...step,
        status: (step.status as 'pending' | 'in_progress' | 'completed' | 'blocked') || 'pending'
      }));
    } catch (error) {
      console.error('Error in getWorkflowSteps:', error);
      throw error;
    }
  }

  async createWorkflowStep(step: Omit<WorkflowStep, 'id' | 'created_at' | 'updated_at'> & { workflow_instance_id: string }): Promise<WorkflowStep> {
    try {
      const { data, error } = await supabase
        .from('workflow_steps')
        .insert([step])
        .select()
        .single();

      if (error) {
        console.error('Error creating workflow step:', error);
        throw error;
      }

      return {
        ...data,
        status: (data.status as 'pending' | 'in_progress' | 'completed' | 'blocked') || 'pending'
      };
    } catch (error) {
      console.error('Error in createWorkflowStep:', error);
      throw error;
    }
  }

  async updateWorkflowStep(id: string, updates: Partial<WorkflowStep>): Promise<WorkflowStep> {
    try {
      const { data, error } = await supabase
        .from('workflow_steps')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating workflow step:', error);
        throw error;
      }

      return {
        ...data,
        status: (data.status as 'pending' | 'in_progress' | 'completed' | 'blocked') || 'pending'
      };
    } catch (error) {
      console.error('Error in updateWorkflowStep:', error);
      throw error;
    }
  }

  async completeWorkflowStep(id: string): Promise<WorkflowStep> {
    try {
      const updates = {
        status: 'completed' as const,
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('workflow_steps')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error completing workflow step:', error);
        throw error;
      }

      return {
        ...data,
        status: 'completed'
      };
    } catch (error) {
      console.error('Error in completeWorkflowStep:', error);
      throw error;
    }
  }
}

export const workflowService = new WorkflowService();
