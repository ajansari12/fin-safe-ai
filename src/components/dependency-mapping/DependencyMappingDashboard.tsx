
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Network, AlertTriangle, Target, Zap, Activity } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { dependencyMappingService } from "@/services/dependency-mapping-service";
import InteractiveDependencyGraph from "./InteractiveDependencyGraph";
import DependencyRiskAssessment from "./DependencyRiskAssessment";
import FailureScenarioSimulator from "./FailureScenarioSimulator";

const DependencyMappingDashboard: React.FC = () => {
  const { user } = useAuth();
  const [selectedDependency, setSelectedDependency] = useState<any>(null);

  const { data: dependencies = [], isLoading: dependenciesLoading } = useQuery({
    queryKey: ['enhancedDependencies'],
    queryFn: () => dependencyMappingService.getEnhancedDependencies(),
    enabled: !!user
  });

  const { data: dependencyMaps = [], isLoading: mapsLoading } = useQuery({
    queryKey: ['dependencyMaps'],
    queryFn: () => dependencyMappingService.getDependencyMaps(),
    enabled: !!user
  });

  const { data: dependencyRisks = [], isLoading: risksLoading } = useQuery({
    queryKey: ['dependencyRisks'],
    queryFn: () => dependencyMappingService.getDependencyRisks(),
    enabled: !!user
  });

  const { data: failureScenarios = [], isLoading: scenariosLoading } = useQuery({
    queryKey: ['failureScenarios'],
    queryFn: () => dependencyMappingService.getFailureScenarios(),
    enabled: !!user
  });

  const isLoading = dependenciesLoading || mapsLoading || risksLoading || scenariosLoading;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-96 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  const getMetrics = () => {
    const totalDependencies = dependencies.length;
    const criticalDependencies = dependencies.filter(d => d.criticality === 'critical').length;
    const degradedDependencies = dependencies.filter(d => d.status === 'degraded' || d.status === 'failed').length;
    const highRiskDependencies = dependencyRisks.filter(r => r.risk_rating === 'critical' || r.risk_rating === 'high').length;
    const totalConnections = dependencyMaps.length;
    const criticalConnections = dependencyMaps.filter(m => m.relationship_strength === 'critical').length;

    return {
      totalDependencies,
      criticalDependencies,
      degradedDependencies,
      highRiskDependencies,
      totalConnections,
      criticalConnections,
      networkDensity: totalDependencies > 0 ? Math.round((totalConnections / (totalDependencies * (totalDependencies - 1))) * 100) : 0,
      riskCoverage: totalDependencies > 0 ? Math.round((dependencyRisks.length / totalDependencies) * 100) : 0
    };
  };

  const metrics = getMetrics();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dependency Mapping</h1>
        <p className="text-muted-foreground">
          Comprehensive dependency analysis with risk assessment and failure simulation
        </p>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Dependencies</CardTitle>
            <Network className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalDependencies}</div>
            <p className="text-xs text-muted-foreground">
              {metrics.criticalDependencies} critical
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Risk</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.highRiskDependencies}</div>
            <p className="text-xs text-muted-foreground">
              {metrics.riskCoverage}% assessed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Degraded Status</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.degradedDependencies}</div>
            <p className="text-xs text-muted-foreground">
              Requiring attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Network Density</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.networkDensity}%</div>
            <p className="text-xs text-muted-foreground">
              {metrics.totalConnections} connections
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Alerts */}
      {metrics.degradedDependencies > 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {metrics.degradedDependencies} dependencies are currently degraded or failed. Review their status and impact on connected systems.
          </AlertDescription>
        </Alert>
      )}

      {/* Main Content */}
      <Tabs defaultValue="graph" className="space-y-4">
        <TabsList>
          <TabsTrigger value="graph">Interactive Graph</TabsTrigger>
          <TabsTrigger value="risk">Risk Assessment</TabsTrigger>
          <TabsTrigger value="simulation">Failure Simulation</TabsTrigger>
        </TabsList>

        <TabsContent value="graph" className="space-y-4">
          <InteractiveDependencyGraph
            dependencies={dependencies}
            maps={dependencyMaps}
            onNodeSelect={setSelectedDependency}
          />
          
          {selectedDependency && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Selected Dependency: {selectedDependency.dependency_name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Type:</span>
                    <p className="capitalize">{selectedDependency.dependency_type}</p>
                  </div>
                  <div>
                    <span className="font-medium">Criticality:</span>
                    <Badge variant={selectedDependency.criticality === 'critical' ? 'destructive' : 'outline'}>
                      {selectedDependency.criticality}
                    </Badge>
                  </div>
                  <div>
                    <span className="font-medium">Status:</span>
                    <Badge variant={selectedDependency.status === 'operational' ? 'secondary' : 'destructive'}>
                      {selectedDependency.status}
                    </Badge>
                  </div>
                  <div>
                    <span className="font-medium">Monitoring:</span>
                    <p className="capitalize">{selectedDependency.monitoring_status?.replace('_', ' ')}</p>
                  </div>
                </div>
                
                {selectedDependency.description && (
                  <div className="mt-4">
                    <span className="font-medium">Description:</span>
                    <p className="text-gray-600 mt-1">{selectedDependency.description}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="risk" className="space-y-4">
          {selectedDependency ? (
            <DependencyRiskAssessment dependency={selectedDependency} />
          ) : (
            <Alert>
              <Target className="h-4 w-4" />
              <AlertDescription>
                Select a dependency from the Interactive Graph tab to view and manage its risk assessments.
              </AlertDescription>
            </Alert>
          )}
        </TabsContent>

        <TabsContent value="simulation" className="space-y-4">
          <FailureScenarioSimulator dependencies={dependencies} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DependencyMappingDashboard;
