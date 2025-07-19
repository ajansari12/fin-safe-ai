import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  LayoutDashboard, 
  Plus, 
  Settings, 
  Save, 
  Eye, 
  Edit, 
  Trash2,
  Star,
  Grid,
  Users
} from 'lucide-react';
// TODO: Migrated from AuthContext to EnhancedAuthContext
import { useAuth } from '@/contexts/EnhancedAuthContext';
import { customDashboardService, CustomDashboard } from '@/services/custom-dashboard-service';
import DashboardList from './DashboardList';
import DashboardEditor from './DashboardEditor';
import CreateDashboardDialog from './CreateDashboardDialog';
import { toast } from 'sonner';
import { ErrorBoundaryWrapper, NoDataFallback } from './ErrorBoundaryWrapper';
import { WidgetSkeleton } from './AnalyticsLoadingStates';
import { useErrorHandler } from '@/hooks/useErrorHandler';

const CustomDashboardBuilder: React.FC = () => {
  const { profile } = useAuth();
  const [dashboards, setDashboards] = useState<CustomDashboard[]>([]);
  const [selectedDashboard, setSelectedDashboard] = useState<CustomDashboard | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { handleAsyncError, parseError } = useErrorHandler();

  useEffect(() => {
    if (profile?.organization_id) {
      loadDashboards();
    }
  }, [profile?.organization_id]);

  const loadDashboards = async (retryCount = 0) => {
    await handleAsyncError(async () => {
      setIsLoading(true);
      setError(null);
      
      const data = await customDashboardService.getDashboards();
      setDashboards(data);
      
      // Auto-select default dashboard or first one
      const defaultDashboard = data.find(d => d.is_default) || data[0];
      if (defaultDashboard) {
        setSelectedDashboard(defaultDashboard);
      }
    }, 'loading dashboards');
    
    setIsLoading(false);
  };

  const handleCreateDashboard = async (dashboardData: any) => {
    await handleAsyncError(async () => {
      const newDashboard = await customDashboardService.createDashboard(dashboardData);
      setDashboards(prev => [newDashboard, ...prev]);
      setSelectedDashboard(newDashboard);
      setEditMode(true);
      setShowCreateDialog(false);
      toast.success('Dashboard created successfully');
    }, 'creating dashboard');
  };

  const handleDeleteDashboard = async (dashboardId: string) => {
    await handleAsyncError(async () => {
      await customDashboardService.deleteDashboard(dashboardId);
      setDashboards(prev => prev.filter(d => d.id !== dashboardId));
      if (selectedDashboard?.id === dashboardId) {
        setSelectedDashboard(dashboards[0] || null);
      }
      toast.success('Dashboard deleted successfully');
    }, 'deleting dashboard');
  };

  const handleSetDefault = async (dashboardId: string) => {
    await handleAsyncError(async () => {
      await customDashboardService.setDefaultDashboard(dashboardId);
      setDashboards(prev => 
        prev.map(d => ({ ...d, is_default: d.id === dashboardId }))
      );
      toast.success('Default dashboard updated');
    }, 'setting default dashboard');
  };

  const stats = {
    totalDashboards: dashboards.length,
    sharedDashboards: dashboards.filter(d => d.is_shared).length,
    myDashboards: dashboards.filter(d => d.created_by === profile?.id).length
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <WidgetSkeleton title="Loading Custom Dashboards" showChart={false} />
        <div className="grid gap-4 md:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <WidgetSkeleton key={i} showChart={false} />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <NoDataFallback 
        title="Dashboard Error"
        description="Unable to load custom dashboards. Please try refreshing."
        retry={() => loadDashboards()}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Custom Analytics Dashboards</h1>
          <p className="text-muted-foreground">
            Create and customize your analytics views with drag-and-drop widgets
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="flex items-center gap-1">
            <Grid className="h-3 w-3" />
            Drag & Drop
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            Shareable
          </Badge>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Dashboards</CardTitle>
            <LayoutDashboard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalDashboards}</div>
            <p className="text-xs text-muted-foreground">
              Available in your organization
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">My Dashboards</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.myDashboards}</div>
            <p className="text-xs text-muted-foreground">
              Created by you
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Shared Dashboards</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.sharedDashboards}</div>
            <p className="text-xs text-muted-foreground">
              Shared with team
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="dashboards" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="dashboards" className="flex items-center gap-2">
            <LayoutDashboard className="h-4 w-4" />
            My Dashboards
          </TabsTrigger>
          <TabsTrigger value="editor" className="flex items-center gap-2" disabled={!selectedDashboard}>
            <Edit className="h-4 w-4" />
            Dashboard Editor
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboards" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Dashboard Library</h2>
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Dashboard
            </Button>
          </div>

          <ErrorBoundaryWrapper 
            title="Dashboard List Error"
            description="Unable to load dashboard list"
          >
            {dashboards.length > 0 ? (
              <DashboardList
                dashboards={dashboards}
                selectedDashboard={selectedDashboard}
                onSelectDashboard={setSelectedDashboard}
                onDeleteDashboard={handleDeleteDashboard}
                onSetDefault={handleSetDefault}
                onEditDashboard={(dashboard) => {
                  setSelectedDashboard(dashboard);
                  setEditMode(true);
                }}
              />
            ) : (
              <NoDataFallback 
                title="No Dashboards Found"
                description="Create your first custom dashboard to get started with personalized analytics."
                icon={<LayoutDashboard className="h-12 w-12 mx-auto mb-4 opacity-50" />}
                retry={() => loadDashboards()}
              />
            )}
          </ErrorBoundaryWrapper>
        </TabsContent>

        <TabsContent value="editor" className="space-y-6">
          <ErrorBoundaryWrapper 
            title="Dashboard Editor Error"
            description="Unable to load dashboard editor"
          >
            {selectedDashboard ? (
              <DashboardEditor
                dashboard={selectedDashboard}
                editMode={editMode}
                onToggleEditMode={() => setEditMode(!editMode)}
                onDashboardUpdate={loadDashboards}
              />
            ) : (
              <NoDataFallback 
                title="No Dashboard Selected"
                description="Select a dashboard from the library to start editing."
                icon={<Edit className="h-12 w-12 mx-auto mb-4 opacity-50" />}
              />
            )}
          </ErrorBoundaryWrapper>
        </TabsContent>
      </Tabs>

      <CreateDashboardDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onCreateDashboard={handleCreateDashboard}
      />
    </div>
  );
};

export default CustomDashboardBuilder;