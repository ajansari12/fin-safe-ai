
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Clock, Shield } from "lucide-react";
import { getDependencyBreaches } from "@/services/dependencies-service";
import { format } from "date-fns";

const DependencyBreachAlerts: React.FC = () => {
  const { data: breaches = [], isLoading } = useQuery({
    queryKey: ['dependencyBreaches'],
    queryFn: getDependencyBreaches
  });

  const getImpactColor = (level: string) => {
    switch (level) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Dependency Breaches
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-32 animate-pulse bg-gray-100 rounded" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          Recent Dependency Breaches
        </CardTitle>
        <div className="text-sm text-muted-foreground">
          Impact tolerance violations from failed dependencies
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {breaches.length === 0 ? (
            <div className="text-center p-4 text-muted-foreground">
              <Shield className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No dependency breaches detected</p>
            </div>
          ) : (
            breaches.map((breach: any) => (
              <div key={breach.id} className="flex items-start justify-between p-3 border rounded">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <div className={`w-3 h-3 rounded-full ${getImpactColor(breach.impact_level)}`} />
                    <p className="text-sm font-medium truncate">
                      {breach.dependencies?.dependency_name || 'Unknown Dependency'}
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground mb-1">
                    Business Function: {breach.business_functions?.name || 'Unknown'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {breach.notes}
                  </p>
                </div>
                <div className="text-right space-y-1 ml-4">
                  <Badge 
                    variant={breach.impact_level === 'critical' ? 'destructive' : 'secondary'}
                  >
                    {breach.impact_level} impact
                  </Badge>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {format(new Date(breach.detected_at), 'MMM dd, HH:mm')}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default DependencyBreachAlerts;
