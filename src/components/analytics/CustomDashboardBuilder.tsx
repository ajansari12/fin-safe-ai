
import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Layout, Settings, Plus, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { getDashboardWidgets, type DashboardWidget } from "@/services/analytics-service";
import PredictiveAnalyticsChart from "./PredictiveAnalyticsChart";
import RiskHeatmap from "./RiskHeatmap";
import ComplianceScorecard from "./ComplianceScorecard";

interface GridLayoutProps {
  widgets: DashboardWidget[];
  userRole: string;
  onWidgetRemove: (widgetId: string) => void;
}

const GridLayout: React.FC<GridLayoutProps> = ({ widgets, userRole, onWidgetRemove }) => {
  const renderWidget = (widget: DashboardWidget) => {
    const canView = widget.role_visibility.includes(userRole);
    
    if (!canView) return null;

    const widgetContent = () => {
      switch (widget.data_source) {
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
  const { user } = useAuth();
  const [selectedRole, setSelectedRole] = useState<string>('analyst');
  const [customWidgets, setCustomWidgets] = useState<DashboardWidget[]>([]);
  const [availableWidgets, setAvailableWidgets] = useState<DashboardWidget[]>([]);

  const { data: defaultWidgets } = useQuery({
    queryKey: ['dashboardWidgets', selectedRole],
    queryFn: () => getDashboardWidgets(selectedRole)
  });

  useEffect(() => {
    if (defaultWidgets) {
      setCustomWidgets(defaultWidgets);
      // Set available widgets that aren't currently displayed
      const allPossibleWidgets: DashboardWidget[] = [
        {
          id: 'predictive-analytics',
          type: 'chart',
          title: 'Predictive Analytics',
          data_source: 'predictive_analytics',
          config: {},
          position: { x: 0, y: 0, w: 6, h: 4 },
          role_visibility: ['admin', 'manager', 'analyst']
        },
        {
          id: 'risk-heatmap',
          type: 'heatmap',
          title: 'Risk Heatmap',
          data_source: 'risk_heatmap',
          config: {},
          position: { x: 6, y: 0, w: 6, h: 4 },
          role_visibility: ['admin', 'manager']
        },
        {
          id: 'compliance-scorecard',
          type: 'metric',
          title: 'Compliance Scorecard',
          data_source: 'compliance_scorecard',
          config: {},
          position: { x: 0, y: 4, w: 6, h: 4 },
          role_visibility: ['admin', 'manager']
        }
      ];
      
      const currentWidgetIds = defaultWidgets.map(w => w.id);
      const available = allPossibleWidgets.filter(w => 
        !currentWidgetIds.includes(w.id) && 
        w.role_visibility.includes(selectedRole)
      );
      setAvailableWidgets(available);
    }
  }, [defaultWidgets, selectedRole]);

  const handleAddWidget = (widgetId: string) => {
    const widget = availableWidgets.find(w => w.id === widgetId);
    if (widget) {
      setCustomWidgets(prev => [...prev, widget]);
      setAvailableWidgets(prev => prev.filter(w => w.id !== widgetId));
    }
  };

  const handleRemoveWidget = (widgetId: string) => {
    const widget = customWidgets.find(w => w.id === widgetId);
    if (widget) {
      setCustomWidgets(prev => prev.filter(w => w.id !== widgetId));
      if (widget.role_visibility.includes(selectedRole)) {
        setAvailableWidgets(prev => [...prev, widget]);
      }
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layout className="h-5 w-5" />
            Custom Dashboard Builder
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Customize your analytics dashboard by adding or removing widgets
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
                <SelectItem value="manager">Manager</SelectItem>
                <SelectItem value="analyst">Analyst</SelectItem>
              </SelectContent>
            </Select>
            
            {availableWidgets.length > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">Add widget:</span>
                {availableWidgets.map(widget => (
                  <Button
                    key={widget.id}
                    variant="outline"
                    size="sm"
                    onClick={() => handleAddWidget(widget.id)}
                    className="flex items-center gap-1"
                  >
                    <Plus className="h-3 w-3" />
                    {widget.title}
                  </Button>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 mb-4">
            <span className="text-sm text-muted-foreground">Current widgets:</span>
            {customWidgets.map(widget => (
              <Badge key={widget.id} variant="secondary">
                {widget.title}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Dashboard Preview */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Dashboard Preview ({selectedRole})</h3>
        <GridLayout 
          widgets={customWidgets}
          userRole={selectedRole}
          onWidgetRemove={handleRemoveWidget}
        />
      </div>
    </div>
  );
};

export default CustomDashboardBuilder;
