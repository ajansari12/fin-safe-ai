
import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Layout, Settings, Plus, X, Save, Copy, Trash2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { customDashboardService, type CustomDashboard, type DashboardWidget } from "@/services/custom-dashboard-service";
import { ExecutiveScorecard } from "./ExecutiveScorecard";
import { PredictiveInsights } from "./PredictiveInsights";
import PredictiveAnalyticsChart from "./PredictiveAnalyticsChart";
import RiskHeatmap from "./RiskHeatmap";
import ComplianceScorecard from "./ComplianceScorecard";
import { useToast } from "@/hooks/use-toast";

interface GridLayoutProps {
  widgets: DashboardWidget[];
  userRole: string;
  onWidgetRemove: (widgetId: string) => void;
}

const GridLayout: React.FC<GridLayoutProps> = ({ widgets, userRole, onWidgetRemove }) => {
  const renderWidget = (widget: DashboardWidget) => {
    const canView = widget.roleVisibility.includes(userRole);
    
    if (!canView) return null;

    const widgetContent = () => {
      switch (widget.dataSource) {
        case 'risk_scorecard':
          return <ExecutiveScorecard />;
        case 'predictive_insights':
          return <PredictiveInsights />;
        case 'predictive_analytics':
          return <PredictiveAnalyticsChart />;
        case 'risk_heatmap':
          return <RiskHeatmap />;
        case 'compliance_scorecard':
          return <ComplianceScorecard />;
        default:
          return (
            <div className="h-48 flex items-center justify-center text-muted-foreground">
              Widget: {widget.title}
            </div>
          );
      }
    };

    return (
      <Card key={widget.id} className="relative">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">{widget.title}</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onWidgetRemove(widget.id)}
              className="h-6 w-6 p-0"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {widgetContent()}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {widgets.map(renderWidget)}
    </div>
  );
};

const CustomDashboardBuilder: React.FC = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedRole, setSelectedRole] = useState<string>(profile?.role || 'analyst');
  const [selectedDashboard, setSelectedDashboard] = useState<CustomDashboard | null>(null);
  const [dashboardName, setDashboardName] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  const { data: dashboards = [] } = useQuery({
    queryKey: ['customDashboards', selectedRole],
    queryFn: () => customDashboardService.getUserDashboards(selectedRole),
    enabled: !!profile
  });

  const { data: defaultWidgets = [] } = useQuery({
    queryKey: ['defaultWidgets', selectedRole],
    queryFn: () => customDashboardService.getDefaultWidgetsByRole(selectedRole)
  });

  const createMutation = useMutation({
    mutationFn: (dashboard: Partial<CustomDashboard>) => 
      customDashboardService.createDashboard(dashboard),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customDashboards'] });
      toast({ title: "Dashboard created successfully" });
      setIsEditing(false);
      setDashboardName('');
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<CustomDashboard> }) =>
      customDashboardService.updateDashboard(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customDashboards'] });
      toast({ title: "Dashboard updated successfully" });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => customDashboardService.deleteDashboard(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customDashboards'] });
      toast({ title: "Dashboard deleted successfully" });
      if (selectedDashboard) {
        setSelectedDashboard(null);
      }
    }
  });

  const cloneMutation = useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) =>
      customDashboardService.cloneDashboard(id, name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['customDashboards'] });
      toast({ title: "Dashboard cloned successfully" });
    }
  });

  const availableWidgets: DashboardWidget[] = [
    {
      id: 'risk-scorecard',
      type: 'scorecard',
      title: 'Executive Risk Scorecard',
      dataSource: 'risk_scorecard',
      config: {},
      position: { x: 0, y: 0, w: 12, h: 6 },
      roleVisibility: ['admin', 'executive']
    },
    {
      id: 'predictive-insights',
      type: 'chart',
      title: 'Predictive Insights',
      dataSource: 'predictive_insights',
      config: {},
      position: { x: 0, y: 6, w: 12, h: 6 },
      roleVisibility: ['admin', 'manager', 'analyst']
    },
    {
      id: 'predictive-analytics',
      type: 'chart',
      title: 'Predictive Analytics',
      dataSource: 'predictive_analytics',
      config: {},
      position: { x: 0, y: 0, w: 6, h: 4 },
      roleVisibility: ['admin', 'manager', 'analyst']
    },
    {
      id: 'risk-heatmap',
      type: 'heatmap',
      title: 'Risk Heatmap',
      dataSource: 'risk_heatmap',
      config: {},
      position: { x: 6, y: 0, w: 6, h: 4 },
      roleVisibility: ['admin', 'manager']
    },
    {
      id: 'compliance-scorecard',
      type: 'metric',
      title: 'Compliance Scorecard',
      dataSource: 'compliance_scorecard',
      config: {},
      position: { x: 0, y: 4, w: 6, h: 4 },
      roleVisibility: ['admin', 'manager']
    }
  ];

  useEffect(() => {
    if (dashboards.length > 0 && !selectedDashboard) {
      setSelectedDashboard(dashboards[0]);
    }
  }, [dashboards, selectedDashboard]);

  const handleAddWidget = (widget: DashboardWidget) => {
    if (!selectedDashboard) return;
    
    const updatedWidgets = [...selectedDashboard.widgets, widget];
    const updates = { ...selectedDashboard, widgets: updatedWidgets };
    
    updateMutation.mutate({ id: selectedDashboard.id, updates });
    setSelectedDashboard(updates);
  };

  const handleRemoveWidget = (widgetId: string) => {
    if (!selectedDashboard) return;
    
    const updatedWidgets = selectedDashboard.widgets.filter(w => w.id !== widgetId);
    const updates = { ...selectedDashboard, widgets: updatedWidgets };
    
    updateMutation.mutate({ id: selectedDashboard.id, updates });
    setSelectedDashboard(updates);
  };

  const handleCreateDashboard = () => {
    if (!dashboardName.trim()) return;
    
    createMutation.mutate({
      name: dashboardName,
      type: 'standard',
      widgets: defaultWidgets,
      layoutConfig: {},
      isShared: false,
      sharedWith: []
    });
  };

  const getCurrentWidgetIds = () => selectedDashboard?.widgets.map(w => w.id) || [];
  const getAvailableWidgets = () => availableWidgets.filter(w => 
    !getCurrentWidgetIds().includes(w.id) && 
    w.roleVisibility.includes(selectedRole)
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layout className="h-5 w-5" />
            Custom Dashboard Builder
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Create and customize analytics dashboards with drag-and-drop widgets
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              <span className="text-sm font-medium">View as role:</span>
            </div>
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="executive">Executive</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
                <SelectItem value="analyst">Analyst</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Dashboard:</span>
              <Select 
                value={selectedDashboard?.id || ''} 
                onValueChange={(id) => setSelectedDashboard(dashboards.find(d => d.id === id) || null)}
              >
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Select dashboard" />
                </SelectTrigger>
                <SelectContent>
                  {dashboards.map(dashboard => (
                    <SelectItem key={dashboard.id} value={dashboard.id}>
                      {dashboard.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditing(!isEditing)}
              >
                <Plus className="h-4 w-4 mr-1" />
                New
              </Button>
              
              {selectedDashboard && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => cloneMutation.mutate({ 
                      id: selectedDashboard.id, 
                      name: `${selectedDashboard.name} Copy` 
                    })}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deleteMutation.mutate(selectedDashboard.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
          </div>

          {isEditing && (
            <div className="flex items-center gap-2 mb-4 p-4 bg-gray-50 rounded">
              <Input
                placeholder="Dashboard name"
                value={dashboardName}
                onChange={(e) => setDashboardName(e.target.value)}
                className="flex-1"
              />
              <Button onClick={handleCreateDashboard} disabled={!dashboardName.trim()}>
                <Save className="h-4 w-4 mr-1" />
                Create
              </Button>
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
            </div>
          )}

          {selectedDashboard && getAvailableWidgets().length > 0 && (
            <div className="flex items-center gap-2 mb-4">
              <span className="text-sm font-medium">Add widget:</span>
              {getAvailableWidgets().map(widget => (
                <Button
                  key={widget.id}
                  variant="outline"
                  size="sm"
                  onClick={() => handleAddWidget(widget)}
                  className="flex items-center gap-1"
                >
                  <Plus className="h-3 w-3" />
                  {widget.title}
                </Button>
              ))}
            </div>
          )}

          {selectedDashboard && (
            <div className="flex items-center gap-2 mb-4">
              <span className="text-sm text-muted-foreground">Current widgets:</span>
              {selectedDashboard.widgets.map(widget => (
                <Badge key={widget.id} variant="secondary">
                  {widget.title}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dashboard Preview */}
      {selectedDashboard && (
        <div>
          <h3 className="text-lg font-semibold mb-4">
            {selectedDashboard.name} ({selectedRole})
          </h3>
          <GridLayout 
            widgets={selectedDashboard.widgets}
            userRole={selectedRole}
            onWidgetRemove={handleRemoveWidget}
          />
        </div>
      )}
    </div>
  );
};

export default CustomDashboardBuilder;
