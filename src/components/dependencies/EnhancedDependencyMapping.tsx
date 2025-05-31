
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { getDependencies, type Dependency } from "@/services/dependencies-service";
import { type BusinessFunction } from "@/services/business-functions-service";
import DependencyMapping from "./DependencyMapping";
import DependencyHealthMonitor from "./DependencyHealthMonitor";
import FailurePropagationMap from "./FailurePropagationMap";

interface EnhancedDependencyMappingProps {
  businessFunction: BusinessFunction;
}

const EnhancedDependencyMapping: React.FC<EnhancedDependencyMappingProps> = ({ businessFunction }) => {
  const [selectedDependency, setSelectedDependency] = useState<Dependency | null>(null);

  const { data: dependencies = [], isLoading } = useQuery({
    queryKey: ['dependencies', businessFunction.id],
    queryFn: () => getDependencies(businessFunction.id)
  });

  const criticalDependencies = dependencies.filter(dep => dep.criticality === 'critical');

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Enhanced Dependency Management</CardTitle>
          <CardDescription>
            Comprehensive dependency mapping with health monitoring and risk propagation analysis for {businessFunction.name}
          </CardDescription>
          <div className="flex gap-2 mt-4">
            <Badge variant="outline">
              {dependencies.length} Total Dependencies
            </Badge>
            <Badge variant="destructive">
              {criticalDependencies.length} Critical
            </Badge>
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="mapping" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="mapping">Dependency Mapping</TabsTrigger>
          <TabsTrigger value="health">Health Monitoring</TabsTrigger>
          <TabsTrigger value="propagation">Risk Propagation</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="mapping">
          <DependencyMapping businessFunction={businessFunction} />
        </TabsContent>

        <TabsContent value="health" className="space-y-6">
          {dependencies.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-muted-foreground">
                  No dependencies found. Add dependencies first to monitor their health.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                {dependencies.slice(0, 4).map((dependency) => (
                  <DependencyHealthMonitor
                    key={dependency.id}
                    dependencyId={dependency.id}
                    dependencyName={dependency.dependency_name}
                    criticality={dependency.criticality}
                  />
                ))}
              </div>
              
              {dependencies.length > 4 && (
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <p className="text-muted-foreground mb-2">
                        {dependencies.length - 4} more dependencies available
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Select a specific dependency from the mapping tab to view its detailed health monitoring
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="propagation" className="space-y-6">
          {criticalDependencies.length === 0 ? (
            <Card>
              <CardContent className="text-center py-8">
                <p className="text-muted-foreground">
                  No critical dependencies found. Mark dependencies as critical to analyze risk propagation.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {criticalDependencies.slice(0, 2).map((dependency) => (
                <FailurePropagationMap
                  key={dependency.id}
                  dependencyId={dependency.id}
                  dependencyName={dependency.dependency_name}
                />
              ))}
              
              {criticalDependencies.length > 2 && (
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <p className="text-muted-foreground">
                        {criticalDependencies.length - 2} more critical dependencies available for propagation analysis
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="analytics">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Dependency Health Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold">{dependencies.length}</div>
                      <div className="text-sm text-muted-foreground">Total Dependencies</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-red-600">{criticalDependencies.length}</div>
                      <div className="text-sm text-muted-foreground">Critical Dependencies</div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Operational:</span>
                      <span>{dependencies.filter(d => d.status === 'operational').length}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Degraded:</span>
                      <span>{dependencies.filter(d => d.status === 'degraded').length}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Failed:</span>
                      <span>{dependencies.filter(d => d.status === 'failed').length}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Risk Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {['critical', 'high', 'medium', 'low'].map((criticality) => {
                    const count = dependencies.filter(d => d.criticality === criticality).length;
                    const percentage = dependencies.length > 0 ? (count / dependencies.length) * 100 : 0;
                    
                    return (
                      <div key={criticality} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="capitalize">{criticality}:</span>
                          <span>{count} ({percentage.toFixed(0)}%)</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnhancedDependencyMapping;
