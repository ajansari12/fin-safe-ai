
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Zap, AlertTriangle, Play, Clock, Target, TrendingDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { dependencyMappingService, FailureScenario, EnhancedDependency } from "@/services/dependency-mapping-service";

interface FailureScenarioSimulatorProps {
  dependencies: EnhancedDependency[];
}

const FailureScenarioSimulator: React.FC<FailureScenarioSimulatorProps> = ({ dependencies }) => {
  const [isCreatingScenario, setIsCreatingScenario] = useState(false);
  const [formData, setFormData] = useState({
    scenario_name: '',
    scenario_description: '',
    trigger_dependency_id: '',
    scenario_type: 'operational' as const,
    severity_level: 'medium' as const,
    estimated_duration_hours: 4,
    business_impact_description: ''
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: scenarios = [], isLoading } = useQuery({
    queryKey: ['failureScenarios'],
    queryFn: () => dependencyMappingService.getFailureScenarios()
  });

  const createScenarioMutation = useMutation({
    mutationFn: (scenario: any) => dependencyMappingService.createFailureScenario(scenario),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['failureScenarios'] });
      setIsCreatingScenario(false);
      setFormData({
        scenario_name: '',
        scenario_description: '',
        trigger_dependency_id: '',
        scenario_type: 'operational',
        severity_level: 'medium',
        estimated_duration_hours: 4,
        business_impact_description: ''
      });
      toast({
        title: "Success",
        description: "Failure scenario created successfully."
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create failure scenario.",
        variant: "destructive"
      });
    }
  });

  const runSimulationMutation = useMutation({
    mutationFn: (scenarioId: string) => dependencyMappingService.runFailureSimulation(scenarioId),
    onSuccess: (results, scenarioId) => {
      queryClient.invalidateQueries({ queryKey: ['failureScenarios'] });
      toast({
        title: "Simulation Complete",
        description: `Scenario simulation completed. ${results.total_affected_dependencies} dependencies would be affected.`
      });
    },
    onError: (error) => {
      toast({
        title: "Simulation Error",
        description: "Failed to run simulation. Please try again.",
        variant: "destructive"
      });
    }
  });

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-500 text-white';
      case 'high': return 'bg-orange-500 text-white';
      case 'medium': return 'bg-yellow-500 text-white';
      case 'low': return 'bg-blue-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getScenarioTypeIcon = (type: string) => {
    switch (type) {
      case 'cyber': return '🔒';
      case 'natural_disaster': return '🌪️';
      case 'vendor_failure': return '🏢';
      case 'data_breach': return '📊';
      default: return '⚙️';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.trigger_dependency_id) {
      toast({
        title: "Error",
        description: "Please select a trigger dependency.",
        variant: "destructive"
      });
      return;
    }
    createScenarioMutation.mutate(formData);
  };

  const runSimulation = (scenarioId: string) => {
    runSimulationMutation.mutate(scenarioId);
  };

  const formatSimulationResults = (results: any) => {
    if (!results) return null;

    return (
      <div className="space-y-4 mt-4 p-4 bg-gray-50 rounded-lg">
        <h5 className="font-medium">Simulation Results</h5>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">{results.total_affected_dependencies}</div>
            <div className="text-gray-600">Dependencies Affected</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{results.estimated_total_downtime_hours}h</div>
            <div className="text-gray-600">Total Downtime</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{results.critical_path?.length || 0}</div>
            <div className="text-gray-600">Critical Path</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{Math.round((results.propagation_path?.length || 0) * 100 / dependencies.length)}%</div>
            <div className="text-gray-600">Network Impact</div>
          </div>
        </div>

        {results.propagation_path && results.propagation_path.length > 0 && (
          <div>
            <h6 className="font-medium mb-2">Propagation Sequence</h6>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {results.propagation_path.slice(0, 10).map((step: any, index: number) => (
                <div key={index} className="flex items-center justify-between p-2 bg-white rounded border">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      T+{step.affected_at_minutes}m
                    </Badge>
                    <span className="font-medium">{step.dependency_name}</span>
                  </div>
                  <Badge className={getSeverityColor(step.severity)}>
                    {step.severity}
                  </Badge>
                </div>
              ))}
              {results.propagation_path.length > 10 && (
                <div className="text-sm text-gray-500 text-center">
                  ... and {results.propagation_path.length - 10} more dependencies
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5" />
          Failure Scenario Simulator
        </CardTitle>
        <CardDescription>
          Create and simulate failure scenarios to understand dependency impacts
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center">
          <h4 className="font-medium">Scenarios</h4>
          <Button onClick={() => setIsCreatingScenario(true)}>
            Create New Scenario
          </Button>
        </div>

        {scenarios.length === 0 && !isCreatingScenario && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              No failure scenarios created yet. Create your first scenario to start testing dependency impacts.
            </AlertDescription>
          </Alert>
        )}

        {scenarios.map((scenario) => (
          <div key={scenario.id} className="border rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg">{getScenarioTypeIcon(scenario.scenario_type)}</span>
                <h5 className="font-medium">{scenario.scenario_name}</h5>
                <Badge className={getSeverityColor(scenario.severity_level)}>
                  {scenario.severity_level}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                {scenario.last_simulated_at && (
                  <span className="text-xs text-gray-500">
                    Last run: {new Date(scenario.last_simulated_at).toLocaleDateString()}
                  </span>
                )}
                <Button
                  size="sm"
                  onClick={() => runSimulation(scenario.id)}
                  disabled={runSimulationMutation.isPending}
                >
                  <Play className="h-4 w-4 mr-1" />
                  {runSimulationMutation.isPending ? 'Running...' : 'Simulate'}
                </Button>
              </div>
            </div>

            {scenario.scenario_description && (
              <p className="text-sm text-gray-600">{scenario.scenario_description}</p>
            )}

            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-1">
                <Target className="h-4 w-4 text-gray-400" />
                <span>Trigger: {scenario.trigger_dependency?.dependency_name || 'Unknown'}</span>
              </div>
              {scenario.estimated_duration_hours && (
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <span>Duration: {scenario.estimated_duration_hours}h</span>
                </div>
              )}
            </div>

            {scenario.simulation_results && formatSimulationResults(scenario.simulation_results)}
          </div>
        ))}

        {isCreatingScenario && (
          <form onSubmit={handleSubmit} className="space-y-4 border rounded-lg p-4 bg-gray-50">
            <h4 className="font-medium">Create New Failure Scenario</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="scenario_name">Scenario Name</Label>
                <Input
                  id="scenario_name"
                  value={formData.scenario_name}
                  onChange={(e) => setFormData({ ...formData, scenario_name: e.target.value })}
                  placeholder="e.g., Primary Data Center Outage"
                  required
                />
              </div>

              <div>
                <Label htmlFor="trigger_dependency_id">Trigger Dependency</Label>
                <Select
                  value={formData.trigger_dependency_id}
                  onValueChange={(value) => setFormData({ ...formData, trigger_dependency_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select dependency" />
                  </SelectTrigger>
                  <SelectContent>
                    {dependencies.map((dep) => (
                      <SelectItem key={dep.id} value={dep.id}>
                        {dep.dependency_name} ({dep.dependency_type})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="scenario_description">Description</Label>
              <Textarea
                id="scenario_description"
                value={formData.scenario_description}
                onChange={(e) => setFormData({ ...formData, scenario_description: e.target.value })}
                placeholder="Describe the failure scenario in detail..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="scenario_type">Scenario Type</Label>
                <Select
                  value={formData.scenario_type}
                  onValueChange={(value: any) => setFormData({ ...formData, scenario_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="operational">Operational</SelectItem>
                    <SelectItem value="cyber">Cyber Attack</SelectItem>
                    <SelectItem value="natural_disaster">Natural Disaster</SelectItem>
                    <SelectItem value="vendor_failure">Vendor Failure</SelectItem>
                    <SelectItem value="data_breach">Data Breach</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="severity_level">Severity Level</Label>
                <Select
                  value={formData.severity_level}
                  onValueChange={(value: any) => setFormData({ ...formData, severity_level: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="estimated_duration_hours">Duration (hours)</Label>
                <Input
                  id="estimated_duration_hours"
                  type="number"
                  value={formData.estimated_duration_hours}
                  onChange={(e) => setFormData({ ...formData, estimated_duration_hours: parseInt(e.target.value) || 0 })}
                  min="1"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="business_impact_description">Business Impact</Label>
              <Textarea
                id="business_impact_description"
                value={formData.business_impact_description}
                onChange={(e) => setFormData({ ...formData, business_impact_description: e.target.value })}
                placeholder="Describe the expected business impact..."
              />
            </div>

            <div className="flex gap-2">
              <Button type="submit" disabled={createScenarioMutation.isPending}>
                {createScenarioMutation.isPending ? 'Creating...' : 'Create Scenario'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreatingScenario(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
};

export default FailureScenarioSimulator;
