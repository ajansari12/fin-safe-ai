import { supabase } from "@/integrations/supabase/client";
import { getCurrentUserProfile } from "@/lib/supabase-utils";

export interface CustomDashboard {
  id: string;
  org_id: string;
  created_by: string;
  created_by_name?: string;
  name: string;
  description?: string;
  layout_config: any;
  is_default: boolean;
  is_shared: boolean;
  shared_with: string[];
  created_at: string;
  updated_at: string;
}

export interface DashboardWidget {
  id: string;
  dashboard_id: string;
  widget_type: string;
  widget_config: any;
  position_config: any;
  filters: any;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

class CustomDashboardService {
  async getDashboards(): Promise<CustomDashboard[]> {
    const profile = await getCurrentUserProfile();
    if (!profile?.organization_id) return [];

    const { data, error } = await supabase
      .from('custom_dashboards')
      .select('*')
      .eq('org_id', profile.organization_id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async getDashboard(dashboardId: string): Promise<CustomDashboard | null> {
    const { data, error } = await supabase
      .from('custom_dashboards')
      .select('*')
      .eq('id', dashboardId)
      .single();

    if (error) return null;
    return data;
  }

  async createDashboard(dashboardData: Omit<CustomDashboard, 'id' | 'created_at' | 'updated_at' | 'org_id' | 'created_by' | 'created_by_name'>): Promise<CustomDashboard> {
    const profile = await getCurrentUserProfile();
    if (!profile?.organization_id) throw new Error('No organization found');

    const { data, error } = await supabase
      .from('custom_dashboards')
      .insert({
        ...dashboardData,
        org_id: profile.organization_id,
        created_by: profile.id,
        created_by_name: profile.full_name
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateDashboard(dashboardId: string, updates: Partial<CustomDashboard>): Promise<CustomDashboard> {
    const { data, error } = await supabase
      .from('custom_dashboards')
      .update(updates)
      .eq('id', dashboardId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteDashboard(dashboardId: string): Promise<void> {
    const { error } = await supabase
      .from('custom_dashboards')
      .delete()
      .eq('id', dashboardId);

    if (error) throw error;
  }

  async setDefaultDashboard(dashboardId: string): Promise<void> {
    const profile = await getCurrentUserProfile();
    if (!profile?.organization_id) throw new Error('No organization found');

    // Remove default from all user's dashboards
    await supabase
      .from('custom_dashboards')
      .update({ is_default: false })
      .eq('created_by', profile.id);

    // Set new default
    const { error } = await supabase
      .from('custom_dashboards')
      .update({ is_default: true })
      .eq('id', dashboardId);

    if (error) throw error;
  }

  async getDashboardWidgets(dashboardId: string): Promise<DashboardWidget[]> {
    const { data, error } = await supabase
      .from('dashboard_widgets')
      .select('*')
      .eq('dashboard_id', dashboardId)
      .eq('is_active', true)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  async addWidget(widgetData: Omit<DashboardWidget, 'id' | 'created_at' | 'updated_at'>): Promise<DashboardWidget> {
    const { data, error } = await supabase
      .from('dashboard_widgets')
      .insert(widgetData)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updateWidget(widgetId: string, updates: Partial<DashboardWidget>): Promise<DashboardWidget> {
    const { data, error } = await supabase
      .from('dashboard_widgets')
      .update(updates)
      .eq('id', widgetId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deleteWidget(widgetId: string): Promise<void> {
    const { error } = await supabase
      .from('dashboard_widgets')
      .delete()
      .eq('id', widgetId);

    if (error) throw error;
  }

  async updateWidgetPositions(widgets: Array<{ id: string; position_config: any }>): Promise<void> {
    const updates = widgets.map(widget => 
      supabase
        .from('dashboard_widgets')
        .update({ position_config: widget.position_config })
        .eq('id', widget.id)
    );

    await Promise.all(updates);
  }
}

export const customDashboardService = new CustomDashboardService();