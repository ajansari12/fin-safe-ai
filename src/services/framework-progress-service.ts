import { supabase } from '@/integrations/supabase/client';

export interface FrameworkActivity {
  id: string;
  framework_id: string;
  user_id: string;
  user_name: string | null;
  activity_type: string;
  activity_description: string | null;
  activity_data: any;
  created_at: string;
}

export interface ComponentProgress {
  id: string;
  component_id: string;
  assigned_to_id: string | null;
  assigned_to_name: string | null;
  completion_percentage: number;
  status: 'not_started' | 'in_progress' | 'review' | 'completed' | 'blocked';
  due_date: string | null;
  last_activity_at: string;
  estimated_hours: number | null;
  actual_hours: number;
  notes: string | null;
}

export interface FrameworkAssignment {
  id: string;
  framework_id: string;
  assigned_to_id: string;
  assigned_to_name: string | null;
  assigned_by_id: string | null;
  assigned_by_name: string | null;
  role: 'owner' | 'reviewer' | 'contributor' | 'observer';
  assigned_at: string;
}

export class FrameworkProgressService {
  // Activity logging
  static async logActivity(
    frameworkId: string,
    activityType: string,
    description?: string,
    data?: any
  ) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', user.id)
      .single();

    return await supabase.rpc('log_framework_activity', {
      p_framework_id: frameworkId,
      p_user_id: user.id,
      p_user_name: profile?.full_name || 'Unknown User',
      p_activity_type: activityType,
      p_description: description,
      p_data: data || {}
    });
  }

  // Get framework activities
  static async getFrameworkActivities(frameworkId: string, limit = 20) {
    const { data, error } = await supabase
      .from('framework_activities')
      .select('*')
      .eq('framework_id', frameworkId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data as FrameworkActivity[];
  }

  // Component progress management
  static async updateComponentProgress(
    componentId: string,
    updates: Partial<ComponentProgress>
  ) {
    const { data, error } = await supabase
      .from('framework_component_progress')
      .upsert({
        component_id: componentId,
        ...updates,
        last_activity_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;

    // Log activity
    if (updates.completion_percentage !== undefined) {
      await this.logActivity(
        (data as any).framework_id,
        'component_updated',
        `Component progress updated to ${updates.completion_percentage}%`,
        { component_id: componentId, progress: updates.completion_percentage }
      );
    }

    return data;
  }

  // Get component progress
  static async getComponentProgress(componentId: string) {
    const { data, error } = await supabase
      .from('framework_component_progress')
      .select('*')
      .eq('component_id', componentId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data as ComponentProgress | null;
  }

  // Get all component progress for a framework
  static async getFrameworkComponentProgress(frameworkId: string) {
    const { data, error } = await supabase
      .from('framework_component_progress')
      .select(`
        *,
        framework_components!inner(framework_id)
      `)
      .eq('framework_components.framework_id', frameworkId);

    if (error) throw error;
    return data;
  }

  // Assignment management
  static async assignFramework(
    frameworkId: string,
    assignedToId: string,
    assignedToName: string,
    role: FrameworkAssignment['role']
  ) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name')
      .eq('id', user.id)
      .single();

    const { data, error } = await supabase
      .from('framework_assignments')
      .insert({
        framework_id: frameworkId,
        assigned_to_id: assignedToId,
        assigned_to_name: assignedToName,
        assigned_by_id: user.id,
        assigned_by_name: profile?.full_name || 'Unknown User',
        role
      })
      .select()
      .single();

    if (error) throw error;

    // Log activity
    await this.logActivity(
      frameworkId,
      'assigned',
      `Framework assigned to ${assignedToName} as ${role}`,
      { assigned_to: assignedToName, role }
    );

    return data;
  }

  // Get framework assignments
  static async getFrameworkAssignments(frameworkId: string) {
    const { data, error } = await supabase
      .from('framework_assignments')
      .select('*')
      .eq('framework_id', frameworkId)
      .order('assigned_at', { ascending: false });

    if (error) throw error;
    return data as FrameworkAssignment[];
  }

  // Stagnation detection
  static async detectStagnantFrameworks() {
    const { error } = await supabase.rpc('detect_stagnant_frameworks');
    if (error) throw error;
  }

  // Get stagnant frameworks for an organization
  static async getStagnantFrameworks(orgId: string) {
    const { data, error } = await supabase
      .from('generated_frameworks')
      .select('*')
      .eq('organization_id', orgId)
      .eq('is_stagnant', true)
      .order('stagnant_since', { ascending: true });

    if (error) throw error;
    return data;
  }

  // Progress dashboard data
  static async getProgressDashboard(orgId: string) {
    const { data: frameworks, error } = await supabase
      .from('generated_frameworks')
      .select(`
        *,
        framework_assignments(assigned_to_name, role),
        framework_activities(activity_type, created_at)
      `)
      .eq('organization_id', orgId)
      .order('last_activity_at', { ascending: false });

    if (error) throw error;

    // Calculate summary statistics
    const total = frameworks.length;
    const inProgress = frameworks.filter(f => f.implementation_status === 'in_progress').length;
    const completed = frameworks.filter(f => f.implementation_status === 'implemented').length;
    const stagnant = frameworks.filter(f => f.is_stagnant).length;
    const avgProgress = frameworks.reduce((sum, f) => sum + (f.overall_completion_percentage || 0), 0) / total;

    return {
      frameworks,
      statistics: {
        total,
        inProgress,
        completed,
        stagnant,
        avgProgress: Math.round(avgProgress)
      }
    };
  }

  // Initialize component progress for a framework
  static async initializeComponentProgress(frameworkId: string) {
    const { data: components, error: componentsError } = await supabase
      .from('framework_components')
      .select('id')
      .eq('framework_id', frameworkId);

    if (componentsError) throw componentsError;

    if (components && components.length > 0) {
      const progressRecords = components.map(component => ({
        component_id: component.id,
        completion_percentage: 0,
        status: 'not_started' as const
      }));

      const { error } = await supabase
        .from('framework_component_progress')
        .upsert(progressRecords, { onConflict: 'component_id' });

      if (error) throw error;
    }
  }
}