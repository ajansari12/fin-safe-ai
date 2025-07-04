import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Edit, 
  Save, 
  Plus, 
  Settings, 
  Trash2,
  Move,
  BarChart3,
  TrendingUp,
  Users,
  Shield,
  AlertTriangle
} from 'lucide-react';
import { Responsive, WidthProvider } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import { customDashboardService, CustomDashboard, DashboardWidget } from '@/services/custom-dashboard-service';
import DashboardWidgetComponent from './DashboardWidgetComponent';
import WidgetSelector from './WidgetSelector';
import { toast } from 'sonner';

const ResponsiveGridLayout = WidthProvider(Responsive);

interface DashboardEditorProps {
  dashboard: CustomDashboard;
  editMode: boolean;
  onToggleEditMode: () => void;
  onDashboardUpdate: () => void;
}

const DashboardEditor: React.FC<DashboardEditorProps> = ({
  dashboard,
  editMode,
  onToggleEditMode,
  onDashboardUpdate
}) => {
  const [widgets, setWidgets] = useState<DashboardWidget[]>([]);
  const [layouts, setLayouts] = useState<any>({});
  const [showWidgetSelector, setShowWidgetSelector] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadWidgets();
  }, [dashboard.id]);

  const loadWidgets = async () => {
    try {
      setIsLoading(true);
      const widgetData = await customDashboardService.getDashboardWidgets(dashboard.id);
      setWidgets(widgetData);
      
      // Convert widgets to grid layout format
      const gridLayouts = {
        lg: widgetData.map(widget => ({
          i: widget.id,
          x: widget.position_config.x || 0,
          y: widget.position_config.y || 0,
          w: widget.position_config.w || 6,
          h: widget.position_config.h || 4,
          minW: 2,
          minH: 2
        }))
      };
      setLayouts(gridLayouts);
    } catch (error) {
      console.error('Error loading widgets:', error);
      toast.error('Failed to load dashboard widgets');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLayoutChange = async (layout: any, layouts: any) => {
    if (!editMode) return;
    
    setLayouts(layouts);
    
    // Update widget positions in database
    const updates = layout.map((item: any) => ({
      id: item.i,
      position_config: {
        x: item.x,
        y: item.y,
        w: item.w,
        h: item.h
      }
    }));

    try {
      await customDashboardService.updateWidgetPositions(updates);
    } catch (error) {
      console.error('Error updating widget positions:', error);
    }
  };

  const handleAddWidget = async (widgetType: string, config: any) => {
    try {
      const newWidget = await customDashboardService.addWidget({
        dashboard_id: dashboard.id,
        widget_type: widgetType,
        widget_config: config,
        position_config: {
          x: 0,
          y: 0,
          w: 6,
          h: 4
        },
        filters: {},
        is_active: true
      });

      setWidgets(prev => [...prev, newWidget]);
      
      // Add to layout
      setLayouts(prev => ({
        ...prev,
        lg: [
          ...prev.lg,
          {
            i: newWidget.id,
            x: 0,
            y: 0,
            w: 6,
            h: 4,
            minW: 2,
            minH: 2
          }
        ]
      }));

      setShowWidgetSelector(false);
      toast.success('Widget added successfully');
    } catch (error) {
      console.error('Error adding widget:', error);
      toast.error('Failed to add widget');
    }
  };

  const handleDeleteWidget = async (widgetId: string) => {
    try {
      await customDashboardService.deleteWidget(widgetId);
      setWidgets(prev => prev.filter(w => w.id !== widgetId));
      setLayouts(prev => ({
        ...prev,
        lg: prev.lg.filter((item: any) => item.i !== widgetId)
      }));
      toast.success('Widget removed successfully');
    } catch (error) {
      console.error('Error deleting widget:', error);
      toast.error('Failed to remove widget');
    }
  };

  const handleSaveDashboard = async () => {
    try {
      await customDashboardService.updateDashboard(dashboard.id, {
        layout_config: layouts
      });
      onToggleEditMode();
      onDashboardUpdate();
      toast.success('Dashboard saved successfully');
    } catch (error) {
      console.error('Error saving dashboard:', error);
      toast.error('Failed to save dashboard');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">{dashboard.name}</h2>
          <p className="text-muted-foreground">{dashboard.description}</p>
        </div>
        
        <div className="flex items-center gap-2">
          {editMode && (
            <>
              <Button variant="outline" onClick={() => setShowWidgetSelector(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Widget
              </Button>
              <Button onClick={handleSaveDashboard}>
                <Save className="h-4 w-4 mr-2" />
                Save
              </Button>
            </>
          )}
          
          <Button variant={editMode ? "destructive" : "default"} onClick={onToggleEditMode}>
            <Edit className="h-4 w-4 mr-2" />
            {editMode ? 'Exit Edit' : 'Edit Dashboard'}
          </Button>
        </div>
      </div>

      {editMode && (
        <Card className="border-blue-500 bg-blue-50">
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 text-blue-700">
              <Move className="h-4 w-4" />
              <span className="text-sm font-medium">
                Edit Mode Active - Drag widgets to rearrange, resize by dragging corners
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {widgets.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <BarChart3 className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">No Widgets Added</h3>
            <p className="text-muted-foreground mb-4">
              Start building your dashboard by adding some widgets
            </p>
            <Button onClick={() => setShowWidgetSelector(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Your First Widget
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="relative">
          <ResponsiveGridLayout
            className="layout"
            layouts={layouts}
            onLayoutChange={handleLayoutChange}
            breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
            cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
            rowHeight={60}
            isDraggable={editMode}
            isResizable={editMode}
            margin={[16, 16]}
            containerPadding={[0, 0]}
          >
            {widgets.map((widget) => (
              <div key={widget.id} className="relative">
                <DashboardWidgetComponent
                  widget={widget}
                  editMode={editMode}
                  onDelete={() => handleDeleteWidget(widget.id)}
                />
              </div>
            ))}
          </ResponsiveGridLayout>
        </div>
      )}

      <WidgetSelector
        open={showWidgetSelector}
        onOpenChange={setShowWidgetSelector}
        onAddWidget={handleAddWidget}
      />
    </div>
  );
};

export default DashboardEditor;