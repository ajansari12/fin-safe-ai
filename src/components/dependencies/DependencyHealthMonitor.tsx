
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Play, AlertTriangle, Activity, TrendingDown, ExternalLink } from "lucide-react";
import { dependencyHealthService, type DependencyStatus } from "@/services/dependency-health-service";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface DependencyHealthMonitorProps {
  dependencyId: string;
  dependencyName: string;
  criticality: string;
}

const DependencyHealthMonitor: React.FC<DependencyHealthMonitorProps> = ({
  dependencyId,
  dependencyName,
  criticality
}) => {
  const [statuses, setStatuses] = useState<DependencyStatus[]>([]);
  const [isPolling, setIsPolling] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    loadStatuses();
  }, [dependencyId]);

  const loadStatuses = async () => {
    try {
      setIsLoading(true);
      const data = await dependencyHealthService.getDependencyStatuses(dependencyId);
      setStatuses(data.slice(0, 10)); // Show last 10 status checks
    } catch (error) {
      console.error('Error loading dependency statuses:', error);
      toast({
        title: "Error",
        description: "Failed to load dependency status history",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const simulateHealthCheck = async () => {
    try {
      setIsPolling(true);
      const newStatus = await dependencyHealthService.simulateHealthPolling(dependencyId);
      setStatuses(prev => [newStatus, ...prev.slice(0, 9)]);
      
      // Check if breach threshold is exceeded
      const shouldCreateIncident = await dependencyHealthService.checkBreachThresholds(dependencyId, newStatus.health_score);
      
      if (shouldCreateIncident) {
        toast({
          title: "Critical Threshold Breached",
          description: `${dependencyName} health score is critically low. Consider creating an incident.`,
          variant: "destructive",
          action: (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => navigate('/incidents?create=true&dependency=' + dependencyId)}
            >
              <ExternalLink className="h-4 w-4 mr-1" />
              Create Incident
            </Button>
          ),
        });
      }

      toast({
        title: "Health Check Complete",
        description: `Health score: ${newStatus.health_score}%`,
        variant: newStatus.health_score > 70 ? "default" : "destructive",
      });
    } catch (error) {
      console.error('Error simulating health check:', error);
      toast({
        title: "Error",
        description: "Failed to simulate health check",
        variant: "destructive",
      });
    } finally {
      setIsPolling(false);
    }
  };

  const getHealthColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  const getHealthBadge = (score: number) => {
    if (score >= 80) return <Badge variant="default">Healthy</Badge>;
    if (score >= 60) return <Badge variant="outline">Degraded</Badge>;
    return <Badge variant="destructive">Critical</Badge>;
  };

  const latestStatus = statuses[0];

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Health Monitor</CardTitle>
            <div className="animate-pulse h-6 w-20 bg-gray-200 rounded"></div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="animate-pulse h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="animate-pulse h-2 bg-gray-200 rounded w-full"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Health Monitor
          </CardTitle>
          {latestStatus && getHealthBadge(latestStatus.health_score)}
        </div>
        <CardDescription>
          Real-time health monitoring for {dependencyName}
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {latestStatus ? (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground">Health Score</div>
                  <div className={`text-2xl font-bold ${getHealthColor(latestStatus.health_score)}`}>
                    {latestStatus.health_score}%
                  </div>
                  <Progress value={latestStatus.health_score} className="mt-1" />
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Response Time</div>
                  <div className="text-2xl font-bold">
                    {latestStatus.response_time_ms || 0}ms
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Last checked: {new Date(latestStatus.status_timestamp).toLocaleString()}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex justify-between">
                  <span>Availability:</span>
                  <span>{latestStatus.availability_percentage?.toFixed(2) || 0}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Error Rate:</span>
                  <span>{latestStatus.error_rate_percentage?.toFixed(2) || 0}%</span>
                </div>
              </div>

              {latestStatus.failure_reason && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Issue Detected:</strong> {latestStatus.failure_reason}
                  </AlertDescription>
                </Alert>
              )}

              {latestStatus.health_score < 30 && criticality === 'critical' && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800">
                    Critical dependency health threshold breached. Immediate action required.
                    <Button 
                      variant="link" 
                      className="p-0 h-auto text-red-600 ml-2"
                      onClick={() => navigate('/incidents?create=true&dependency=' + dependencyId)}
                    >
                      Create Incident <ExternalLink className="h-3 w-3 ml-1" />
                    </Button>
                  </AlertDescription>
                </Alert>
              )}
            </>
          ) : (
            <div className="text-center py-4">
              <p className="text-muted-foreground mb-4">No health data available</p>
            </div>
          )}

          <div className="flex gap-2">
            <Button 
              onClick={simulateHealthCheck} 
              disabled={isPolling}
              className="flex-1"
            >
              <Play className="h-4 w-4 mr-2" />
              {isPolling ? 'Checking...' : 'Run Health Check'}
            </Button>
          </div>

          {statuses.length > 1 && (
            <div className="mt-4">
              <h4 className="text-sm font-medium mb-2">Recent History</h4>
              <div className="space-y-2">
                {statuses.slice(1, 6).map((status, index) => (
                  <div key={status.id} className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      {new Date(status.status_timestamp).toLocaleString()}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className={getHealthColor(status.health_score)}>
                        {status.health_score}%
                      </span>
                      {status.health_score < 50 && (
                        <TrendingDown className="h-3 w-3 text-red-500" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default DependencyHealthMonitor;
