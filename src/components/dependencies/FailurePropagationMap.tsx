
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Play, AlertTriangle, GitBranch, Clock, Target, ExternalLink } from "lucide-react";
import { dependencyHealthService, type PropagationChain, type FailureSimulationResult } from "@/services/dependency-health-service";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface FailurePropagationMapProps {
  dependencyId: string;
  dependencyName: string;
}

const FailurePropagationMap: React.FC<FailurePropagationMapProps> = ({
  dependencyId,
  dependencyName
}) => {
  const [chains, setChains] = useState<PropagationChain[]>([]);
  const [simulationResult, setSimulationResult] = useState<FailureSimulationResult | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    loadPropagationChains();
  }, []);

  const loadPropagationChains = async () => {
    try {
      setIsLoading(true);
      const data = await dependencyHealthService.getPropagationChains();
      const relevantChains = data.filter(chain => 
        chain.source_dependency_id === dependencyId || 
        chain.target_dependency_id === dependencyId
      );
      setChains(relevantChains);
    } catch (error) {
      console.error('Error loading propagation chains:', error);
      toast({
        title: "Error",
        description: "Failed to load propagation chains",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const runFailureSimulation = async () => {
    try {
      setIsSimulating(true);
      const result = await dependencyHealthService.simulateFailurePropagation(dependencyId);
      setSimulationResult(result);
      
      if (result.total_impact_score > 50) {
        toast({
          title: "High Impact Failure Detected",
          description: `Simulation shows ${result.affected_dependencies.length} dependencies affected with impact score ${result.total_impact_score.toFixed(1)}`,
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
    } catch (error) {
      console.error('Error running failure simulation:', error);
      toast({
        title: "Error",
        description: "Failed to run failure simulation",
        variant: "destructive",
      });
    } finally {
      setIsSimulating(false);
    }
  };

  const getImpactColor = (score: number) => {
    if (score >= 70) return "text-red-600";
    if (score >= 40) return "text-yellow-600";
    return "text-green-600";
  };

  const getImpactBadge = (score: number) => {
    if (score >= 70) return <Badge variant="destructive">Critical</Badge>;
    if (score >= 40) return <Badge variant="outline">High</Badge>;
    return <Badge variant="default">Medium</Badge>;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <GitBranch className="h-5 w-5" />
            Failure Propagation Map
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const outgoingChains = chains.filter(chain => chain.source_dependency_id === dependencyId);
  const incomingChains = chains.filter(chain => chain.target_dependency_id === dependencyId);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <GitBranch className="h-5 w-5" />
            Failure Propagation Map
          </CardTitle>
          <Button 
            onClick={runFailureSimulation} 
            disabled={isSimulating || outgoingChains.length === 0}
            size="sm"
          >
            <Play className="h-4 w-4 mr-2" />
            {isSimulating ? 'Simulating...' : 'Run Simulation'}
          </Button>
        </div>
        <CardDescription>
          Model failure cascades and business impact for {dependencyName}
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="chains" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="chains">Propagation Chains</TabsTrigger>
            <TabsTrigger value="simulation">Simulation Results</TabsTrigger>
            <TabsTrigger value="timeline">Impact Timeline</TabsTrigger>
          </TabsList>

          <TabsContent value="chains" className="space-y-4">
            {outgoingChains.length === 0 && incomingChains.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">
                  No propagation chains configured for this dependency
                </p>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline">Configure Propagation Chains</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Configure Propagation Chains</DialogTitle>
                      <DialogDescription>
                        Set up failure propagation rules to model how failures cascade through your dependencies.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                      <p className="text-sm text-muted-foreground">
                        Propagation chain configuration is coming soon. This will allow you to:
                      </p>
                      <ul className="list-disc list-inside text-sm text-muted-foreground mt-2 space-y-1">
                        <li>Define failure propagation paths</li>
                        <li>Set propagation delays and probabilities</li>
                        <li>Configure impact multipliers</li>
                        <li>Map business function impacts</li>
                      </ul>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            ) : (
              <div className="space-y-4">
                {outgoingChains.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                      <Target className="h-4 w-4" />
                      Outgoing Dependencies ({outgoingChains.length})
                    </h4>
                    <div className="space-y-2">
                      {outgoingChains.map((chain) => (
                        <div key={chain.id} className="border rounded-lg p-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium">
                              {chain.target_dependency?.dependency_name}
                            </span>
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">{(chain.failure_probability * 100).toFixed(0)}% chance</Badge>
                              <Badge variant="secondary">{chain.propagation_delay_minutes}min delay</Badge>
                            </div>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Impact multiplier: {chain.impact_multiplier}x
                          </div>
                          {chain.business_impact_description && (
                            <div className="text-sm mt-1">
                              <strong>Impact:</strong> {chain.business_impact_description}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {incomingChains.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">
                      Incoming Dependencies ({incomingChains.length})
                    </h4>
                    <div className="space-y-2">
                      {incomingChains.map((chain) => (
                        <div key={chain.id} className="border rounded-lg p-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium">
                              {chain.source_dependency?.dependency_name}
                            </span>
                            <Badge variant="outline">
                              Affects this dependency
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="simulation" className="space-y-4">
            {simulationResult ? (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="pt-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-red-600">
                          {simulationResult.affected_dependencies.length}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Dependencies Affected
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="pt-4">
                      <div className="text-center">
                        <div className={`text-2xl font-bold ${getImpactColor(simulationResult.total_impact_score)}`}>
                          {simulationResult.total_impact_score.toFixed(1)}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Total Impact Score
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="pt-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {simulationResult.business_functions_affected.length}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Business Functions
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {simulationResult.total_impact_score > 50 && (
                  <Alert className="border-red-200 bg-red-50">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    <AlertDescription className="text-red-800">
                      High impact failure scenario detected. Consider implementing additional safeguards.
                    </AlertDescription>
                  </Alert>
                )}

                <div>
                  <h4 className="text-sm font-medium mb-2">Recommended Actions</h4>
                  <ul className="space-y-1">
                    {simulationResult.recommended_actions.map((action, index) => (
                      <li key={index} className="flex items-center gap-2 text-sm">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        {action}
                      </li>
                    ))}
                  </ul>
                </div>

                {simulationResult.total_impact_score > 70 && (
                  <Button 
                    onClick={() => navigate('/incidents?create=true&dependency=' + dependencyId)}
                    className="w-full"
                    variant="destructive"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Create Critical Incident
                  </Button>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">
                  No simulation results available
                </p>
                <p className="text-sm text-muted-foreground">
                  Run a failure simulation to see potential impact and propagation patterns
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="timeline" className="space-y-4">
            {simulationResult?.propagation_timeline ? (
              <div className="space-y-3">
                <h4 className="text-sm font-medium">Failure Propagation Timeline</h4>
                {simulationResult.propagation_timeline
                  .sort((a, b) => a.failure_time_minutes - b.failure_time_minutes)
                  .map((event, index) => (
                    <div key={index} className="flex items-center gap-4 p-3 border rounded-lg">
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">
                          T+{event.failure_time_minutes}min
                        </span>
                        <span className="text-sm text-muted-foreground truncate">
                          Dependency failure
                        </span>
                      </div>
                      <Badge 
                        variant={event.impact_level === 'critical' ? 'destructive' : 'outline'}
                      >
                        {event.impact_level}
                      </Badge>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  Run a simulation to see the failure propagation timeline
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default FailurePropagationMap;
