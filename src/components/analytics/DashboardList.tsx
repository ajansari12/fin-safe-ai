import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Eye, 
  Edit, 
  Trash2, 
  Star, 
  Users, 
  Calendar, 
  User,
  Grid
} from 'lucide-react';
import { CustomDashboard } from '@/services/custom-dashboard-service';
import { formatDistanceToNow } from 'date-fns';

interface DashboardListProps {
  dashboards: CustomDashboard[];
  selectedDashboard: CustomDashboard | null;
  onSelectDashboard: (dashboard: CustomDashboard) => void;
  onDeleteDashboard: (dashboardId: string) => void;
  onSetDefault: (dashboardId: string) => void;
  onEditDashboard: (dashboard: CustomDashboard) => void;
}

const DashboardList: React.FC<DashboardListProps> = ({
  dashboards,
  selectedDashboard,
  onSelectDashboard,
  onDeleteDashboard,
  onSetDefault,
  onEditDashboard
}) => {
  if (dashboards.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <Grid className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-medium mb-2">No Dashboards Found</h3>
          <p className="text-muted-foreground mb-4">
            Create your first custom dashboard to get started
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {dashboards.map((dashboard) => (
        <Card 
          key={dashboard.id} 
          className={`cursor-pointer transition-all hover:shadow-md ${
            selectedDashboard?.id === dashboard.id ? 'ring-2 ring-primary' : ''
          }`}
          onClick={() => onSelectDashboard(dashboard)}
        >
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-lg flex items-center gap-2">
                  {dashboard.name}
                  {dashboard.is_default && (
                    <Star className="h-4 w-4 text-yellow-500 fill-current" />
                  )}
                </CardTitle>
                {dashboard.description && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {dashboard.description}
                  </p>
                )}
              </div>
            </div>

            <div className="flex gap-2 mt-2">
              {dashboard.is_shared && (
                <Badge variant="secondary" className="text-xs">
                  <Users className="h-3 w-3 mr-1" />
                  Shared
                </Badge>
              )}
              {dashboard.is_default && (
                <Badge variant="outline" className="text-xs">
                  <Star className="h-3 w-3 mr-1" />
                  Default
                </Badge>
              )}
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="text-sm text-muted-foreground space-y-1">
              <div className="flex items-center gap-2">
                <User className="h-3 w-3" />
                <span>Created by {dashboard.created_by_name || 'Unknown'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-3 w-3" />
                <span>
                  {formatDistanceToNow(new Date(dashboard.created_at))} ago
                </span>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectDashboard(dashboard);
                }}
              >
                <Eye className="h-4 w-4" />
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onEditDashboard(dashboard);
                }}
              >
                <Edit className="h-4 w-4" />
              </Button>

              {!dashboard.is_default && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSetDefault(dashboard.id);
                  }}
                >
                  <Star className="h-4 w-4" />
                </Button>
              )}

              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  if (confirm('Are you sure you want to delete this dashboard?')) {
                    onDeleteDashboard(dashboard.id);
                  }
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default DashboardList;