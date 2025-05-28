
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { getIncidentAnalytics } from "@/services/dashboard-analytics-service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Clock, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const getSeverityColor = (severity: string) => {
  switch (severity) {
    case 'critical': return 'bg-red-500';
    case 'high': return 'bg-orange-500';
    case 'medium': return 'bg-yellow-500';
    case 'low': return 'bg-green-500';
    default: return 'bg-gray-500';
  }
};

export default function UnresolvedIncidents() {
  const { data: analytics, isLoading } = useQuery({
    queryKey: ['incidentAnalytics'],
    queryFn: getIncidentAnalytics
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Unresolved Incidents
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="h-16 animate-pulse bg-gray-100 rounded" />
            <div className="h-32 animate-pulse bg-gray-100 rounded" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          Unresolved Incidents
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Summary Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">{analytics?.unresolved || 0}</div>
              <div className="text-sm text-red-500">Unresolved</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{analytics?.total || 0}</div>
              <div className="text-sm text-blue-500">Total This Month</div>
            </div>
          </div>

          {/* Recent Incidents */}
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Recent Incidents</h4>
            {analytics?.recent?.slice(0, 3).map((incident) => (
              <div key={incident.id} className="flex items-center justify-between p-2 border rounded">
                <div className="flex items-center gap-2 flex-1">
                  <Badge className={getSeverityColor(incident.severity)}>
                    {incident.severity}
                  </Badge>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{incident.title}</p>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {new Date(incident.reported_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <Badge variant="outline">{incident.status}</Badge>
              </div>
            ))}
          </div>

          <Button variant="outline" size="sm" className="w-full" asChild>
            <Link to="/incident-log">
              View All Incidents <ChevronRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
