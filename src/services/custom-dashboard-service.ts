
import { supabase } from "@/integrations/supabase/client";

export interface DashboardWidget {
  id: string;
  type: 'chart' | 'metric' | 'table' | 'heatmap' | 'scorecard';
  title: string;
  dataSource: string;
  config: Record<string, any>;
  position: { x: number; y: number; w: number; h: number };
  roleVisibility: string[];
}

export interface CustomDashboard {
  id: string;
  name: string;
  type: 'standard' | 'executive' | 'operational';
  widgets: DashboardWidget[];
  layoutConfig: Record<string, any>;
  isShared: boolean;
  sharedWith: string[];
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

class CustomDashboardService {
  async createDashboard(dashboard: Partial<CustomDashboard>): Promise<CustomDashboard> {
    // Simulate dashboard creation
    const newDashboard: CustomDashboard = {
      id: `dashboard-${Date.now()}`,
      name: dashboard.name || 'New Dashboard',
      type: dashboard.type || 'standard',
      widgets: dashboard.widgets || [],
      layoutConfig: dashboard.layoutConfig || {},
      isShared: dashboard.isShared || false,
      sharedWith: dashboard.sharedWith || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // In a real implementation, this would save to the database
    return newDashboard;
  }

  async getUserDashboards(userRole: string): Promise<CustomDashboard[]> {
    // Simulate retrieving user dashboards
    const mockDashboards: CustomDashboard[] = [
      {
        id: 'dashboard-1',
        name: 'Executive Overview',
        type: 'executive',
        widgets: this.getDefaultWidgetsByRole('executive'),
        layoutConfig: {},
        isShared: false,
        sharedWith: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'dashboard-2',
        name: 'Risk Monitoring',
        type: 'operational',
        widgets: this.getDefaultWidgetsByRole('manager'),
        layoutConfig: {},
        isShared: true,
        sharedWith: ['team'],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    return mockDashboards.filter(dashboard => 
      this.isDashboardAccessible(dashboard, userRole)
    );
  }

  async updateDashboard(id: string, updates: Partial<CustomDashboard>): Promise<void> {
    // Simulate dashboard update
    console.log('Updating dashboard:', id, updates);
  }

  async deleteDashboard(id: string): Promise<void> {
    // Simulate dashboard deletion
    console.log('Deleting dashboard:', id);
  }

  async cloneDashboard(id: string, newName: string): Promise<CustomDashboard> {
    // Simulate dashboard cloning
    return {
      id: `dashboard-${Date.now()}`,
      name: newName,
      type: 'standard',
      widgets: this.getDefaultWidgetsByRole('analyst'),
      layoutConfig: {},
      isShared: false,
      sharedWith: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }

  getDefaultWidgetsByRole(role: string): DashboardWidget[] {
    const baseWidgets: DashboardWidget[] = [
      {
        id: 'widget-incidents',
        type: 'metric',
        title: 'Active Incidents',
        dataSource: 'incident_logs',
        config: { metric: 'count', status: 'open' },
        position: { x: 0, y: 0, w: 3, h: 2 },
        roleVisibility: ['admin', 'manager', 'analyst']
      },
      {
        id: 'widget-kri-status',
        type: 'chart',
        title: 'KRI Status',
        dataSource: 'kri_logs',
        config: { chartType: 'line', timeRange: '30d' },
        position: { x: 3, y: 0, w: 6, h: 4 },
        roleVisibility: ['admin', 'manager', 'analyst']
      }
    ];

    switch (role) {
      case 'executive':
      case 'admin':
        return [
          ...baseWidgets,
          {
            id: 'widget-risk-overview',
            type: 'scorecard',
            title: 'Risk Overview',
            dataSource: 'risk_scorecard',
            config: { showTrends: true },
            position: { x: 9, y: 0, w: 3, h: 4 },
            roleVisibility: ['admin', 'executive']
          }
        ];
      
      case 'manager':
        return [
          ...baseWidgets,
          {
            id: 'widget-control-effectiveness',
            type: 'chart',
            title: 'Control Effectiveness',
            dataSource: 'controls',
            config: { chartType: 'bar' },
            position: { x: 0, y: 4, w: 6, h: 3 },
            roleVisibility: ['admin', 'manager']
          }
        ];
      
      default:
        return baseWidgets;
    }
  }

  private isDashboardAccessible(dashboard: CustomDashboard, userRole: string): boolean {
    // Simple role-based access control
    const roleHierarchy = {
      'admin': 4,
      'executive': 3,
      'manager': 2,
      'analyst': 1
    };

    const userLevel = roleHierarchy[userRole as keyof typeof roleHierarchy] || 0;
    const dashboardLevel = dashboard.type === 'executive' ? 3 : 
                          dashboard.type === 'operational' ? 2 : 1;

    return userLevel >= dashboardLevel || dashboard.isShared;
  }
}

export const customDashboardService = new CustomDashboardService();
