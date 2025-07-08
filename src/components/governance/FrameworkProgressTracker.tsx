import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { 
  Clock, 
  User, 
  AlertTriangle, 
  CheckCircle, 
  Activity,
  Calendar,
  MessageSquare,
  TrendingUp,
  TrendingDown,
  Minus
} from 'lucide-react';
import { FrameworkProgressService, ComponentProgress, FrameworkActivity } from '@/services/framework-progress-service';
import { formatDistanceToNow, format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

interface FrameworkProgressTrackerProps {
  framework: {
    id: string;
    framework_name: string;
    implementation_status: string;
    overall_completion_percentage?: number;
    last_activity_at?: string;
    is_stagnant?: boolean;
    stagnant_since?: string | null;
    framework_components?: any[];
  };
  onProgressUpdate?: () => void;
}

const FrameworkProgressTracker: React.FC<FrameworkProgressTrackerProps> = ({
  framework,
  onProgressUpdate
}) => {
  const { toast } = useToast();
  const [componentProgress, setComponentProgress] = useState<ComponentProgress[]>([]);
  const [recentActivities, setRecentActivities] = useState<FrameworkActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedComponent, setSelectedComponent] = useState<string | null>(null);

  useEffect(() => {
    loadProgressData();
  }, [framework.id]);

  const loadProgressData = async () => {
    try {
      setLoading(true);
      
      // Load component progress
      const progress = await FrameworkProgressService.getFrameworkComponentProgress(framework.id);
      setComponentProgress(progress || []);

      // Load recent activities
      const activities = await FrameworkProgressService.getFrameworkActivities(framework.id, 10);
      setRecentActivities(activities);

      // Initialize progress for components that don't have it
      await FrameworkProgressService.initializeComponentProgress(framework.id);
    } catch (error) {
      console.error('Error loading progress data:', error);
      toast({
        title: "Error",
        description: "Failed to load progress data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const updateComponentProgress = async (componentId: string, updates: Partial<ComponentProgress>) => {
    try {
      await FrameworkProgressService.updateComponentProgress(componentId, updates);
      await loadProgressData();
      onProgressUpdate?.();
      
      toast({
        title: "Progress Updated",
        description: "Component progress has been updated successfully"
      });
    } catch (error) {
      console.error('Error updating progress:', error);
      toast({
        title: "Error",
        description: "Failed to update progress",
        variant: "destructive"
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return CheckCircle;
      case 'in_progress': return Activity;
      case 'blocked': return AlertTriangle;
      default: return Clock;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600';
      case 'in_progress': return 'text-blue-600';
      case 'blocked': return 'text-red-600';
      default: return 'text-gray-500';
    }
  };

  const getProgressTrend = () => {
    if (recentActivities.length < 2) return { icon: Minus, color: 'text-gray-500', text: 'No trend data' };
    
    const recentProgress = recentActivities
      .filter(a => a.activity_type === 'component_updated')
      .slice(0, 5);
    
    if (recentProgress.length === 0) return { icon: Minus, color: 'text-gray-500', text: 'No recent progress' };
    
    const trend = recentProgress[0]?.activity_data?.progress > recentProgress[recentProgress.length - 1]?.activity_data?.progress;
    
    return trend 
      ? { icon: TrendingUp, color: 'text-green-600', text: 'Trending up' }
      : { icon: TrendingDown, color: 'text-red-600', text: 'Trending down' };
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-2 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const trend = getProgressTrend();
  const TrendIcon = trend.icon;

  return (
    <div className="space-y-6">
      {/* Overall Progress Summary */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">{framework.framework_name}</CardTitle>
            <div className="flex items-center gap-2">
              {framework.is_stagnant && (
                <Badge variant="destructive" className="text-xs">
                  Stagnant
                </Badge>
              )}
              <Badge variant="outline">
                {framework.implementation_status}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Overall Progress</span>
              <span className="font-medium">{framework.overall_completion_percentage || 0}%</span>
            </div>
            <Progress value={framework.overall_completion_percentage || 0} className="h-3" />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-500" />
              <div>
                <div className="text-xs text-muted-foreground">Last Activity</div>
                <div className="font-medium">
                  {framework.last_activity_at 
                    ? formatDistanceToNow(new Date(framework.last_activity_at), { addSuffix: true })
                    : 'No activity'
                  }
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-green-500" />
              <div>
                <div className="text-xs text-muted-foreground">Components</div>
                <div className="font-medium">{framework.framework_components?.length || 0}</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <TrendIcon className={`h-4 w-4 ${trend.color}`} />
              <div>
                <div className="text-xs text-muted-foreground">Trend</div>
                <div className={`font-medium text-xs ${trend.color}`}>{trend.text}</div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-purple-500" />
              <div>
                <div className="text-xs text-muted-foreground">Activities</div>
                <div className="font-medium">{recentActivities.length}</div>
              </div>
            </div>
          </div>

          {framework.is_stagnant && framework.stagnant_since && (
            <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <div className="flex items-center gap-2 text-orange-800">
                <AlertTriangle className="h-4 w-4" />
                <span className="text-sm font-medium">
                  Framework has been stagnant since {format(new Date(framework.stagnant_since), 'MMM d, yyyy')}
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Component Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Component Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {framework.framework_components?.map((component: any) => {
              const progress = componentProgress.find(p => p.component_id === component.id);
              const StatusIcon = getStatusIcon(progress?.status || 'not_started');
              
              return (
                <div key={component.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <StatusIcon className={`h-5 w-5 ${getStatusColor(progress?.status || 'not_started')}`} />
                      <div>
                        <h4 className="font-medium">{component.component_name}</h4>
                        <p className="text-sm text-muted-foreground">{component.component_description}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold">{progress?.completion_percentage || 0}%</div>
                      <div className="text-xs text-muted-foreground">
                        {progress?.assigned_to_name || 'Unassigned'}
                      </div>
                    </div>
                  </div>

                  <Progress value={progress?.completion_percentage || 0} className="h-2 mb-3" />

                  <div className="flex items-center gap-2">
                    <select
                      value={progress?.completion_percentage || 0}
                      onChange={(e) => updateComponentProgress(component.id, {
                        completion_percentage: parseInt(e.target.value)
                      })}
                      className="text-sm border rounded px-2 py-1"
                    >
                      {[0, 10, 25, 50, 75, 90, 100].map(value => (
                        <option key={value} value={value}>{value}%</option>
                      ))}
                    </select>

                    <select
                      value={progress?.status || 'not_started'}
                      onChange={(e) => updateComponentProgress(component.id, {
                        status: e.target.value as any
                      })}
                      className="text-sm border rounded px-2 py-1"
                    >
                      <option value="not_started">Not Started</option>
                      <option value="in_progress">In Progress</option>
                      <option value="review">Under Review</option>
                      <option value="completed">Completed</option>
                      <option value="blocked">Blocked</option>
                    </select>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedComponent(
                        selectedComponent === component.id ? null : component.id
                      )}
                    >
                      <MessageSquare className="h-3 w-3 mr-1" />
                      Notes
                    </Button>
                  </div>

                  {selectedComponent === component.id && (
                    <div className="mt-3 p-3 bg-gray-50 rounded">
                      <Textarea
                        value={progress?.notes || ''}
                        onChange={(e) => updateComponentProgress(component.id, {
                          notes: e.target.value
                        })}
                        placeholder="Add notes about this component..."
                        rows={3}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activities */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activities</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-start gap-3 p-3 border rounded-lg">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm">{activity.user_name}</span>
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {activity.activity_description || activity.activity_type}
                  </p>
                </div>
              </div>
            ))}
            
            {recentActivities.length === 0 && (
              <div className="text-center py-6 text-muted-foreground">
                No recent activities
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default FrameworkProgressTracker;