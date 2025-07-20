
import React, { useState, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  LayoutDashboard, 
  Plus, 
  Settings, 
  Download, 
  Share2, 
  Eye, 
  Edit3,
  Save,
  RefreshCw,
  Filter,
  BarChart3,
  LineChart,
  PieChart,
  Activity
} from 'lucide-react';
import { Responsive, WidthProvider } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import { useAuth } from '@/contexts/EnhancedAuthContext';
import { toast } from 'sonner';
import InteractiveChart from './widgets/InteractiveChart';
import RealTimeMetricCard from './widgets/RealTimeMetricCard';
import AdvancedTable from './widgets/AdvancedTable';
import DashboardExport from './DashboardExport';

const ResponsiveGridLayout = WidthProvider(Responsive);

interface DashboardWidget {
  id: string;
  type: 'chart' | 'metric' | 'table' | 'gauge' | 'heatmap';
  title: string;
  config: any;
  position: {
    x: number;
    y: number;
    w: number;
    h: number;
  };
  dataSource: string;
  refreshInterval?: number;
}

interface Dashboard {
  id: string;
  name: string;
  description: string;
  type: 'executive' | 'operational' | 'compliance' | 'custom';
  widgets: DashboardWidget[];
  layout: any[];
  isPublic: boolean;
  tags: string[];
}

const EnhancedDashboardBuilder: React.FC = () => {
  const { userContext } = useAuth();
  const [dashboards, setDashboards] = useState<Dashboard[]>([]);
  const [activeDashboard, setActiveDashboard] = useState<Dashboard | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [showWidgetLibrary, setShowWidgetLibrary] = useState(false);
  const [realTimeEnabled, setRealTimeEnabled] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const widgetTypes = [
    { type: 'chart', icon: BarChart3, name: 'Interactive Chart', description: 'Line, bar, pie charts with zoom/pan' },
    { type: 'metric', icon: Activity, name: 'Real-time Metric', description: 'Live KRI and performance metrics' },
    { type: 'table', icon: LayoutDashboard, name: 'Advanced Table', description: 'Sortable, filterable data tables' },
    { type: 'gauge', icon: PieChart, name: 'Gauge Chart', description: 'Progress and status indicators' },
    { type: 'heatmap', icon: LineChart, name: 'Heat Map', description: 'Correlation and density visualization' }
  ];

  useEffect(() => {
    loadDashboards();
  }, [userContext?.organizationId]);

  const loadDashboards = async () => {
    if (!userContext?.organizationId) return;
    
    setIsLoading(true);
    try {
      // Mock data - replace with actual API call
      const mockDashboards: Dashboard[] = [
        {
          id: '1',
          name: 'Executive Risk Dashboard',
          description: 'High-level risk overview for executives',
          type: 'executive',
          widgets: [
            {
              id: 'w1',
              type: 'metric',
              title: 'Overall Risk Score',
              config: { value: 72, threshold: 80, trend: 'up' },
              position: { x: 0, y: 0, w: 3, h: 2 },
              dataSource: 'risk_metrics',
              refreshInterval: 30
            },
            {
              id: 'w2',
              type: 'chart',
              title: 'Risk Trend Analysis',
              config: { chartType: 'line', timeRange: '30d' },
              position: { x: 3, y: 0, w: 6, h: 4 },
              dataSource: 'risk_trends'
            }
          ],
          layout: [],
          isPublic: false,
          tags: ['executive', 'risk']
        }
      ];
      setDashboards(mockDashboards);
      if (mockDashboards.length > 0) {
        setActiveDashboard(mockDashboards[0]);
      }
    } catch (error) {
      console.error('Error loading dashboards:', error);
      toast.error('Failed to load dashboards');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLayoutChange = useCallback((layout: any) => {
    if (!activeDashboard || !editMode) return;
    
    const updatedDashboard = {
      ...activeDashboard,
      layout
    };
    setActiveDashboard(updatedDashboard);
  }, [activeDashboard, editMode]);

  const addWidget = (type: string) => {
    if (!activeDashboard) return;

    const newWidget: DashboardWidget = {
      id: `widget_${Date.now()}`,
      type: type as any,
      title: `New ${type.charAt(0).toUpperCase() + type.slice(1)}`,
      config: {},
      position: { x: 0, y: 0, w: 4, h: 3 },
      dataSource: 'default'
    };

    const updatedDashboard = {
      ...activeDashboard,
      widgets: [...activeDashboard.widgets, newWidget]
    };
    
    setActiveDashboard(updatedDashboard);
    setShowWidgetLibrary(false);
    toast.success('Widget added successfully');
  };

  const removeWidget = (widgetId: string) => {
    if (!activeDashboard) return;

    const updatedDashboard = {
      ...activeDashboard,
      widgets: activeDashboard.widgets.filter(w => w.id !== widgetId)
    };
    
    setActiveDashboard(updatedDashboard);
    toast.success('Widget removed');
  };

  const saveDashboard = async () => {
    if (!activeDashboard) return;

    setIsLoading(true);
    try {
      // Save dashboard logic here
      await new Promise(resolve => setTimeout(resolve, 1000)); // Mock API call
      toast.success('Dashboard saved successfully');
      setEditMode(false);
    } catch (error) {
      toast.error('Failed to save dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  const renderWidget = (widget: DashboardWidget) => {
    const commonProps = {
      key: widget.id,
      title: widget.title,
      config: widget.config,
      realTimeEnabled
    };

    switch (widget.type) {
      case 'chart':
        return <InteractiveChart {...commonProps} />;
      case 'metric':
        return <RealTimeMetricCard {...commonProps} />;
      case 'table':
        return <AdvancedTable {...commonProps} />;
      default:
        return (
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <BarChart3 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">
                  {widget.type} widget coming soon
                </p>
              </div>
            </CardContent>
          </Card>
        );
    }
  };

  if (isLoading && !activeDashboard) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Dashboard Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div>
            <h1 className="text-2xl font-bold">
              {activeDashboard?.name || 'Dashboard Builder'}
            </h1>
            <p className="text-muted-foreground">
              {activeDashboard?.description || 'Build and customize your analytics dashboard'}
            </p>
          </div>
          {activeDashboard && (
            <div className="flex items-center space-x-2">
              <Badge variant={activeDashboard.type === 'executive' ? 'default' : 'secondary'}>
                {activeDashboard.type}
              </Badge>
              {realTimeEnabled && (
                <Badge variant="outline" className="text-green-600">
                  <Activity className="h-3 w-3 mr-1" />
                  Live
                </Badge>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setRealTimeEnabled(!realTimeEnabled)}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            {realTimeEnabled ? 'Pause' : 'Resume'} Live Data
          </Button>
          
          {activeDashboard && (
            <>
              <DashboardExport dashboard={activeDashboard} />
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowWidgetLibrary(true)}
                disabled={!editMode}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Widget
              </Button>
              
              {editMode ? (
                <Button size="sm" onClick={saveDashboard} disabled={isLoading}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
              ) : (
                <Button size="sm" onClick={() => setEditMode(true)}>
                  <Edit3 className="h-4 w-4 mr-2" />
                  Edit Dashboard
                </Button>
              )}
            </>
          )}
        </div>
      </div>

      {/* Dashboard Content */}
      {activeDashboard ? (
        <div className="relative">
          {editMode && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center space-x-2 text-blue-700">
                <Settings className="h-4 w-4" />
                <span className="text-sm font-medium">
                  Edit Mode: Drag widgets to rearrange, resize by dragging corners
                </span>
              </div>
            </div>
          )}

          <ResponsiveGridLayout
            className="layout"
            layouts={{ lg: activeDashboard.layout }}
            onLayoutChange={handleLayoutChange}
            breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }}
            cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
            rowHeight={60}
            isDraggable={editMode}
            isResizable={editMode}
            margin={[16, 16]}
          >
            {activeDashboard.widgets.map((widget) => (
              <div key={widget.id} className="relative">
                {editMode && (
                  <Button
                    size="sm"
                    variant="destructive"
                    className="absolute top-2 right-2 z-10 h-6 w-6 p-0"
                    onClick={() => removeWidget(widget.id)}
                  >
                    ×
                  </Button>
                )}
                {renderWidget(widget)}
              </div>
            ))}
          </ResponsiveGridLayout>
        </div>
      ) : (
        <Card>
          <CardContent className="text-center py-12">
            <LayoutDashboard className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">No Dashboard Selected</h3>
            <p className="text-muted-foreground mb-4">
              Create a new dashboard or select an existing one to get started
            </p>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Dashboard
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Widget Library Modal */}
      {showWidgetLibrary && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl max-h-[80vh] overflow-auto">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Widget Library
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowWidgetLibrary(false)}
                >
                  ×
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {widgetTypes.map((widgetType) => {
                  const IconComponent = widgetType.icon;
                  return (
                    <Card
                      key={widgetType.type}
                      className="cursor-pointer hover:bg-muted/50 transition-colors"
                      onClick={() => addWidget(widgetType.type)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start space-x-3">
                          <IconComponent className="h-8 w-8 text-primary mt-1" />
                          <div>
                            <h4 className="font-medium">{widgetType.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              {widgetType.description}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default EnhancedDashboardBuilder;
