
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, Eye, Edit, Trash2, Link, TrendingUp } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { KRIDefinition } from "@/services/kri-definitions";

interface KRIsListProps {
  kris: KRIDefinition[];
  isLoading: boolean;
  onEdit: (kri: KRIDefinition) => void;
  onDelete: (id: string) => void;
  onViewLogs: (kriId: string) => void;
  onLinkToAppetite?: (kri: KRIDefinition) => void;
}

const KRIsList: React.FC<KRIsListProps> = ({
  kris,
  isLoading,
  onEdit,
  onDelete,
  onViewLogs,
  onLinkToAppetite,
}) => {
  const getBadgeVariant = (status: string) => {
    switch (status) {
      case 'active':
        return 'default';
      case 'inactive':
        return 'secondary';
      case 'draft':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (kris.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center py-8">
            <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-muted-foreground">No KRIs defined yet</p>
            <p className="text-sm text-muted-foreground">Create your first KRI to start monitoring key risk indicators</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {kris.map((kri) => (
        <Card key={kri.id}>
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-lg">{kri.name}</CardTitle>
                {kri.description && (
                  <p className="text-sm text-muted-foreground mt-1">
                    {kri.description.length > 100
                      ? `${kri.description.substring(0, 100)}...`
                      : kri.description
                    }
                  </p>
                )}
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => onViewLogs(kri.id)}>
                    <Eye className="h-4 w-4 mr-2" />
                    View Logs
                  </DropdownMenuItem>
                  {onLinkToAppetite && (
                    <DropdownMenuItem onClick={() => onLinkToAppetite(kri)}>
                      <Link className="h-4 w-4 mr-2" />
                      Link to Appetite
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={() => onEdit(kri)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => onDelete(kri.id)}
                    className="text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant={getBadgeVariant(kri.status)}>
                  {kri.status}
                </Badge>
                {kri.measurement_frequency && (
                  <Badge variant="outline">
                    {kri.measurement_frequency}
                  </Badge>
                )}
              </div>
              
              {(kri.warning_threshold || kri.critical_threshold) && (
                <div className="text-sm text-muted-foreground">
                  {kri.warning_threshold && (
                    <div>Warning: {kri.warning_threshold}</div>
                  )}
                  {kri.critical_threshold && (
                    <div>Critical: {kri.critical_threshold}</div>
                  )}
                </div>
              )}
              
              <div className="text-xs text-muted-foreground">
                Created: {new Date(kri.created_at).toLocaleDateString()}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default KRIsList;
