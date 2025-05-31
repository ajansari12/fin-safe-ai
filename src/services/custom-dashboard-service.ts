import { supabase } from "@/integrations/supabase/client";
import { getCurrentUserProfile } from "@/lib/supabase-utils";

export interface DashboardWidget {
  id: string;
  type: 'chart' | 'metric' | 'table' | 'heatmap' | 'scorecard';
  title: string;
  dataSource: string;
  config: any;
  position: { x: number; y: number; w: number; h: number };
  roleVisibility: string[];
}

export interface CustomDashboard {
  id: string;
  name: string;
  type: 'standard' | 'executive';
  layoutConfig: any;
  widgets: DashboardWidget[];
  isDefault: boolean;
  isShared: boolean;
  sharedWith: string[];
}

class CustomDashboardService {
  async getUserDashboards(userRole: string): Promise<CustomDashboard[]> {
    try {
      const profile = await getCurrentUserProfile();
      if (!profile?.organization_id) return [];

      const { data, error } = await supabase
        .from('custom_dashboards')
        .select('*')
        .eq('org_id', profile.organization_id)
        .or(`user_id.eq.${profile.id},is_shared.eq.true`)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data || []).map(this.mapDashboardData);
    } catch (error) {
      console.error('Error fetching user dashboards:', error);
      return [];
    }
  }

  async createDashboard(dashboard: Partial<CustomDashboard>): Promise<string> {
    try {
      const profile = await getCurrentUserProfile();
      if (!profile?.organization_id) throw new Error('No organization found');

      const { data, error } = await supabase
        .from('custom_dashboards')
        .insert({
          org_id: profile.organization_id,
          user_id: profile.id,
          dashboard_name: dashboard.name || 'New Dashboard',
          dashboard_type: dashboard.type || 'standard',
          layout_config: dashboard.layoutConfig || {},
          widget_config: (dashboard.widgets || []) as any,
          is_shared: dashboard.isShared || false,
          shared_with: dashboard.sharedWith || [],
          created_by: profile.id
        })
        .select('id')
        .single();

      if (error) throw error;
      return data.id;
    } catch (error) {
      console.error('Error creating dashboard:', error);
      throw error;
    }
  }

  async updateDashboard(dashboardId: string, updates: Partial<CustomDashboard>): Promise<void> {
    try {
      const { error } = await supabase
        .from('custom_dashboards')
        .update({
          dashboard_name: updates.name,
          layout_config: updates.layoutConfig,
          widget_config: (updates.widgets || []) as any,
          is_shared: updates.isShared,
          shared_with: updates.sharedWith,
          updated_at: new Date().toISOString()
        })
        .eq('id', dashboardId);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating dashboard:', error);
      throw error;
    }
  }

  async deleteDashboard(dashboardId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('custom_dashboards')
        .delete()
        .eq('id', dashboardId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting dashboard:', error);
      throw error;
    }
  }

  async getDefaultWidgetsByRole(role: string): Promise<DashboardWidget[]> {
    const adminWidgets: DashboardWidget[] = [
      {
        id: 'executive-scorecard',
        type: 'scorecard',
        title: 'Executive Risk Scorecard',
        dataSource: 'risk_scorecard',
        config: { showTrends: true },
        position: { x: 0, y: 0, w: 12, h: 6 },
        roleVisibility: ['admin', 'executive']
      },
      {
        id: 'incident-forecast',
        type: 'chart',
        title: 'Incident Forecast',
        dataSource: 'incident_forecast',
        config: { chartType: 'line', period: '90_days' },
        position: { x: 0, y: 6, w: 6, h: 4 },
        roleVisibility: ['admin', 'manager', 'analyst']
      },
      {
        id: 'kri-breach-predictions',
        type: 'table',
        title: 'KRI Breach Predictions',
        dataSource: 'kri_predictions',
        config: { showProbability: true, maxRows: 5 },
        position: { x: 6, y: 6, w: 6, h: 4 },
        roleVisibility: ['admin', 'manager']
      }
    ];

    const managerWidgets: DashboardWidget[] = [
      {
        id: 'risk-overview',
        type: 'metric',
        title: 'Risk Overview',
        dataSource: 'risk_metrics',
        config: { showComparison: true },
        position: { x: 0, y: 0, w: 6, h: 3 },
        roleVisibility: ['admin', 'manager']
      },
      {
        id: 'incident-trends',
        type: 'chart',
        title: 'Incident Trends',
        dataSource: 'incident_forecast',
        config: { chartType: 'bar' },
        position: { x: 6, y: 0, w: 6, h: 3 },
        roleVisibility: ['admin', 'manager', 'analyst']
      }
    ];

    const analystWidgets: DashboardWidget[] = [
      {
        id: 'kri-status',
        type: 'table',
        title: 'KRI Status',
        dataSource: 'kri_current',
        config: { columns: ['name', 'value', 'threshold', 'status'] },
        position: { x: 0, y: 0, w: 12, h: 4 },
        roleVisibility: ['admin', 'manager', 'analyst']
      }
    ];

    switch (role) {
      case 'admin':
      case 'executive':
        return adminWidgets;
      case 'manager':
        return managerWidgets;
      case 'analyst':
        return analystWidgets;
      default:
        return analystWidgets;
    }
  }

  async cloneDashboard(dashboardId: string, newName: string): Promise<string> {
    try {
      const { data: original, error: fetchError } = await supabase
        .from('custom_dashboards')
        .select('*')
        .eq('id', dashboardId)
        .single();

      if (fetchError) throw fetchError;

      const profile = await getCurrentUserProfile();
      if (!profile) throw new Error('No user profile found');

      const { data, error } = await supabase
        .from('custom_dashboards')
        .insert({
          org_id: original.org_id,
          user_id: profile.id,
          dashboard_name: newName,
          dashboard_type: original.dashboard_type,
          layout_config: original.layout_config,
          widget_config: original.widget_config,
          is_shared: false,
          shared_with: [],
          created_by: profile.id
        })
        .select('id')
        .single();

      if (error) throw error;
      return data.id;
    } catch (error) {
      console.error('Error cloning dashboard:', error);
      throw error;
    }
  }

  private mapDashboardData(data: any): CustomDashboard {
    return {
      id: data.id,
      name: data.dashboard_name,
      type: data.dashboard_type,
      layoutConfig: data.layout_config,
      widgets: data.widget_config || [],
      isDefault: data.is_default,
      isShared: data.is_shared,
      sharedWith: data.shared_with || []
    };
  }
}

export const customDashboardService = new CustomDashboardService();
