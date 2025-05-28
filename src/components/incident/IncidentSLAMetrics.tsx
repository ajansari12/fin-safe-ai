
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ClockIcon, CheckCircleIcon, AlertTriangleIcon, BarChart4Icon } from "lucide-react";
import { Incident, getIncidentMetrics } from "@/services/incident";
import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from 'date-fns';

interface IncidentSLAMetricsProps {
  incident: Incident;
}

const IncidentSLAMetrics: React.FC<IncidentSLAMetricsProps> = ({ incident }) => {
  const { data: metrics, isLoading } = useQuery({
    queryKey: ['incident-metrics', incident.id],
    queryFn: () => getIncidentMetrics(incident.id),
    enabled: !!incident
  });

  const getSLABadge = (status: string) => {
    switch (status) {
      case 'met':
        return <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">SLA Met</Badge>;
      case 'breached':
        return <Badge variant="destructive">SLA Breached</Badge>;
      case 'pending':
      default:
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-800 border-yellow-300">SLA Pending</Badge>;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">SLA Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <div className="h-4 bg-gray-100 rounded animate-pulse" />
            <div className="h-4 bg-gray-100 rounded animate-pulse" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const getProgressValue = (current: number, max: number) => {
    return Math.min(100, (current / max) * 100);
  };

  const getTimeRemaining = (maxHours: number, elapsedHours?: number) => {
    if (!elapsedHours) return `${maxHours}h remaining`;
    const remaining = maxHours - elapsedHours;
    return remaining > 0 ? `${remaining}h remaining` : 'Overdue';
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <BarChart4Icon className="h-4 w-4" />
          SLA Metrics
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium flex items-center gap-1">
              <ClockIcon className="h-4 w-4" /> Response Time
            </span>
            {metrics?.slaStatus.response && getSLABadge(metrics.slaStatus.response)}
          </div>

          <div className="space-y-2">
            <Progress
              value={metrics?.responseTime ? 
                getProgressValue(metrics.responseTime, incident.max_response_time_hours || 24) :
                getProgressValue(
                  (new Date().getTime() - new Date(incident.reported_at).getTime()) / (3600*1000),
                  incident.max_response_time_hours || 24
                )
              }
              className={metrics?.slaStatus.response === 'breached' ? "bg-red-100" : ""}
            />

            <div className="flex justify-between text-xs text-muted-foreground">
              <span>
                {incident.first_response_at ? 
                  `Responded in ${metrics?.responseTime}h` : 
                  formatDistanceToNow(new Date(incident.reported_at), { addSuffix: true })
                }
              </span>
              <span>
                {incident.first_response_at ? 
                  `Target: ${incident.max_response_time_hours}h` : 
                  getTimeRemaining(
                    incident.max_response_time_hours || 24,
                    (new Date().getTime() - new Date(incident.reported_at).getTime()) / (3600*1000)
                  )
                }
              </span>
            </div>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium flex items-center gap-1">
              <CheckCircleIcon className="h-4 w-4" /> Resolution Time
            </span>
            {metrics?.slaStatus.resolution && getSLABadge(metrics.slaStatus.resolution)}
          </div>

          <div className="space-y-2">
            <Progress
              value={metrics?.resolutionTime ? 
                getProgressValue(metrics.resolutionTime, incident.max_resolution_time_hours || 72) :
                getProgressValue(
                  (new Date().getTime() - new Date(incident.reported_at).getTime()) / (3600*1000),
                  incident.max_resolution_time_hours || 72
                )
              }
              className={metrics?.slaStatus.resolution === 'breached' ? "bg-red-100" : ""}
            />

            <div className="flex justify-between text-xs text-muted-foreground">
              <span>
                {incident.resolved_at ? 
                  `Resolved in ${metrics?.resolutionTime}h` : 
                  formatDistanceToNow(new Date(incident.reported_at), { addSuffix: true })
                }
              </span>
              <span>
                {incident.resolved_at ? 
                  `Target: ${incident.max_resolution_time_hours}h` : 
                  getTimeRemaining(
                    incident.max_resolution_time_hours ||  72,
                    (new Date().getTime() - new Date(incident.reported_at).getTime()) / (3600*1000)
                  )
                }
              </span>
            </div>
          </div>
        </div>

        {incident.escalation_level > 0 && (
          <div className="flex items-center gap-2 mt-2 p-2 bg-amber-50 rounded">
            <AlertTriangleIcon className="h-4 w-4 text-amber-500" />
            <span className="text-sm text-amber-800">
              Escalated to Level {incident.escalation_level}
            </span>
            {incident.escalated_at && (
              <span className="text-xs text-amber-700 ml-auto">
                {formatDistanceToNow(new Date(incident.escalated_at), { addSuffix: true })}
              </span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default IncidentSLAMetrics;
