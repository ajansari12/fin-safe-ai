
import React, { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import AuthenticatedLayout from "@/components/layout/AuthenticatedLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import EnhancedDependencyMapping from "@/components/dependencies/EnhancedDependencyMapping";
import DependencyBreachAlerts from "@/components/dependencies/DependencyBreachAlerts";
import { getBusinessFunctions } from "@/services/business-functions-service";

const Dependencies = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const selectedFunctionId = searchParams.get('function');
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFunction, setSelectedFunction] = useState<string>(selectedFunctionId || 'all');

  const { data: businessFunctions = [], isLoading } = useQuery({
    queryKey: ['businessFunctions'],
    queryFn: getBusinessFunctions,
    enabled: !!user
  });

  const filteredFunctions = businessFunctions.filter(func => 
    func.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const currentFunction = selectedFunction !== 'all' 
    ? businessFunctions.find(f => f.id === selectedFunction)
    : null;

  if (isLoading) {
    return (
      <AuthenticatedLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </AuthenticatedLayout>
    );
  }

  return (
    <AuthenticatedLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dependencies</h1>
          <p className="text-muted-foreground">
            Advanced dependency mapping with health monitoring, risk propagation analysis, and automated incident creation.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <DependencyBreachAlerts />
          </div>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Enhanced Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-2xl font-bold">
                    {businessFunctions.length}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Business Functions
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Critical Functions</span>
                    <span>{businessFunctions.filter(f => f.criticality === 'critical').length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>High Priority</span>
                    <span>{businessFunctions.filter(f => f.criticality === 'high').length}</span>
                  </div>
                </div>
                <div className="pt-4 space-y-2">
                  <a 
                    href="/dependency-mapping"
                    className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background bg-primary text-primary-foreground hover:bg-primary/90 h-10 py-2 px-4 w-full"
                  >
                    Advanced Dependency Mapping
                  </a>
                  <p className="text-xs text-muted-foreground text-center">
                    Visual dependency graphs & network analysis
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Enhanced Dependency Management</CardTitle>
              <CardDescription>
                Select a business function to view dependencies with health monitoring, failure propagation analysis, and automated incident creation.
              </CardDescription>
              
              <div className="flex gap-4 pt-4">
                <div className="flex-1">
                  <Input
                    placeholder="Search business functions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Select value={selectedFunction} onValueChange={setSelectedFunction}>
                  <SelectTrigger className="w-64">
                    <SelectValue placeholder="Select business function" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Functions</SelectItem>
                    {filteredFunctions.map((func) => (
                      <SelectItem key={func.id} value={func.id}>
                        {func.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            
            <CardContent>
              {currentFunction ? (
                <EnhancedDependencyMapping businessFunction={currentFunction} />
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">
                    Select a business function to view its enhanced dependency management features.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2">Health Monitoring</h4>
                      <p className="text-muted-foreground">Real-time dependency health checks with automated polling simulation</p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2">Risk Propagation</h4>
                      <p className="text-muted-foreground">Model failure cascades and visualize chain-of-failure impacts</p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2">Auto Incidents</h4>
                      <p className="text-muted-foreground">Automatic incident creation when breach thresholds are exceeded</p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AuthenticatedLayout>
  );
};

export default Dependencies;
