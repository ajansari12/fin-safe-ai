
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Play, Pause, Settings, AlertTriangle, CheckCircle } from "lucide-react";
import { continuityService, DRSimulationWorkflow } from "@/services/continuity-service";
import { useToast } from "@/hooks/use-toast";

interface DRSimulationDashboardProps {
  orgId: string;
}

const DRSimulationDashboard: React.FC<DRSimulationDashboardProps> = ({ orgId }) => {
  const [simulations, setSimulations] = useState<DRSimulationWorkflow[]>([]);
  const [activeBreach, setActiveBreaches] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, [orgId]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [breachesData] = await Promise.all([
        continuityService.getActiveDependencyBreaches(orgId)
      ]);
      setActiveBreaches(breachesData);
    } catch (error) {
      console.error('Error loading DR simulation data:', error);
      toast({
        title: "Error",
        description: "Failed to load DR simulation data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const executeSimulation = async (simulationId: string) => {
    try {
      await continuityService.executeDRSimulation(simulationId);
      toast({
        title: "Success",
        description: "DR simulation executed successfully",
      });
      loadData();
    } catch (error) {
      console.error('Error executing simulation:', error);
      toast({
        title: "Error",
        description: "Failed to execute DR simulation",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">DR Simulation Dashboard</h2>
        <p className="text-muted-foreground">
          Automated disaster recovery testing and real-time dependency monitoring
        </p>
      </div>

      {/* Active Breaches Alert */}
      {activeBreach.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-800">
              <AlertTriangle className="h-5 w-5" />
              Active Dependency Breaches ({activeBreach.length})
            </CardTitle>
            <CardDescription className="text-orange-700">
              Critical dependencies are currently experiencing issues
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {activeBreach.slice(0, 3).map((breach, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-white rounded border">
                  <div className="flex items-center gap-2">
                    <Badge variant="destructive" className="text-xs">
                      {breach.impact_level}
                    </Badge>
                    <span className="font-medium">
                      {breach.dependencies?.dependency_name || 'Unknown Dependency'}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      in {breach.business_functions?.name || 'Unknown Function'}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(breach.detected_at).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Simulation Workflows */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {simulations.map((simulation) => (
          <Card key={simulation.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{simulation.workflow_name}</CardTitle>
                <Badge variant={simulation.status === 'active' ? 'default' : 'secondary'}>
                  {simulation.status}
                </Badge>
              </div>
              <CardDescription>{simulation.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Simulation Steps</span>
                    <span>{simulation.simulation_steps.length} steps</span>
                  </div>
                  <Progress value={75} className="h-2" />
                </div>

                <div className="space-y-2">
                  <div className="text-sm">
                    <span className="font-medium">Trigger Conditions:</span>
                    <ul className="text-xs text-muted-foreground mt-1">
                      {simulation.trigger_conditions.dependency_failures?.slice(0, 2).map((dep, idx) => (
                        <li key={idx}>• Dependency failure: {dep}</li>
                      ))}
                      {simulation.trigger_conditions.severity_threshold && (
                        <li>• Severity: {simulation.trigger_conditions.severity_threshold}</li>
                      )}
                    </ul>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => executeSimulation(simulation.id)}
                    className="flex-1"
                    disabled={simulation.status !== 'active'}
                  >
                    <Play className="h-4 w-4 mr-2" />
                    Execute
                  </Button>
                  <Button size="sm" variant="outline">
                    <Settings className="h-4 w-4" />
                  </Button>
                </div>

                {simulation.last_executed && (
                  <div className="text-xs text-muted-foreground">
                    Last executed: {new Date(simulation.last_executed).toLocaleString()}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Button variant="outline" className="flex items-center gap-2">
              <Play className="h-4 w-4" />
              Run Full DR Test
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Validate Dependencies
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Emergency Simulation
            </Button>
            <Button variant="outline" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Configure Workflows
            </Button>
          </div>
        </CardContent>
      </Card>

      {simulations.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground mb-4">
              No DR simulation workflows configured yet.
            </p>
            <Button>Create First Simulation Workflow</Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DRSimulationDashboard;
