
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, BarChart3, Link, Eye, AlertTriangle, TrendingUp, TrendingDown, Activity } from "lucide-react";
import { KRIDefinition } from "@/services/kri-definitions";

interface KRIsListProps {
  kris: KRIDefinition[];
  isLoading: boolean;
  onEdit: (kri: KRIDefinition) => void;
  onDelete: (id: string) => void;
  onViewLogs: (kriId: string) => void;
  onLinkToAppetite?: (kri: KRIDefinition) => void;
  onViewDetail?: (kriId: string) => void;
}

const KRIsList: React.FC<KRIsListProps> = ({
  kris,
  isLoading,
  onEdit,
  onDelete,
  onViewLogs,
  onLinkToAppetite,
  onViewDetail
}) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="space-y-2">
              <div className="h-4 bg-muted rounded w-3/4"></div>
              <div className="h-3 bg-muted rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-3 bg-muted rounded"></div>
                <div className="h-3 bg-muted rounded w-5/6"></div>
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
        <CardContent className="flex flex-col items-center justify-center py-12">
          <BarChart3 className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No KRIs Found</h3>
          <p className="text-muted-foreground text-center mb-4">
            Get started by creating your first Key Risk Indicator to monitor critical risk metrics.
          </p>
        </CardContent>
      </Card>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'inactive':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'under_review':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTrendIcon = (value: number, warningThreshold: string, criticalThreshold: string) => {
    const warning = parseFloat(warningThreshold || '0');
    const critical = parseFloat(criticalThreshold || '0');
    
    if (value >= critical) {
      return <AlertTriangle className="h-4 w-4 text-red-600" />;
    } else if (value >= warning) {
      return <TrendingUp className="h-4 w-4 text-yellow-600" />;
    } else {
      return <TrendingDown className="h-4 w-4 text-green-600" />;
    }
  };

  const getRiskLevel = (value: number, warningThreshold: string, criticalThreshold: string) => {
    const warning = parseFloat(warningThreshold || '0');
    const critical = parseFloat(criticalThreshold || '0');
    
    if (value >= critical) {
      return { level: 'Critical', color: 'bg-red-100 text-red-800 border-red-200' };
    } else if (value >= warning) {
      return { level: 'Warning', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' };
    } else {
      return { level: 'Normal', color: 'bg-green-100 text-green-800 border-green-200' };
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {kris.map((kri) => {
          const currentValue = 75; // This would come from actual KRI data
          const riskLevel = getRiskLevel(currentValue, kri.warning_threshold || '0', kri.critical_threshold || '0');
          
          return (
            <Card key={kri.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg mb-2">{kri.name}</CardTitle>
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={getStatusColor(kri.status)}>
                        {kri.status.replace('_', ' ')}
                      </Badge>
                      <Badge className={riskLevel.color}>
                        {riskLevel.level}
                      </Badge>
                    </div>
                  </div>
                  {getTrendIcon(currentValue, kri.warning_threshold || '0', kri.critical_threshold || '0')}
                </div>
                {kri.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {kri.description}
                  </p>
                )}
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Current Value:</span>
                      <div className="font-semibold">{currentValue}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Frequency:</span>
                      <div className="font-semibold capitalize">{kri.measurement_frequency}</div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Warning:</span>
                      <div className="font-semibold">{kri.warning_threshold || 'N/A'}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Critical:</span>
                      <div className="font-semibold">{kri.critical_threshold || 'N/A'}</div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-2">
                    {onViewDetail && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onViewDetail(kri.id)}
                        className="flex items-center gap-1"
                      >
                        <Eye className="h-3 w-3" />
                        View Details
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onViewLogs(kri.id)}
                      className="flex items-center gap-1"
                    >
                      <BarChart3 className="h-3 w-3" />
                      Logs
                    </Button>
                    {onLinkToAppetite && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onLinkToAppetite(kri)}
                        className="flex items-center gap-1"
                      >
                        <Link className="h-3 w-3" />
                        Link
                      </Button>
                    )}
                  </div>

                  <div className="flex justify-end gap-2 pt-2 border-t">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(kri)}
                      className="flex items-center gap-1"
                    >
                      <Edit className="h-3 w-3" />
                      Edit
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDelete(kri.id)}
                      className="flex items-center gap-1 text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-3 w-3" />
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default KRIsList;
