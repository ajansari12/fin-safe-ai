
import React, { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import AuthenticatedLayout from "@/components/layout/AuthenticatedLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import DependencyMapping from "@/components/dependencies/DependencyMapping";
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
            Map and manage dependencies for critical business functions.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <DependencyBreachAlerts />
          </div>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Dependency Overview</CardTitle>
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
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Dependency Mapping</CardTitle>
              <CardDescription>
                Select a business function to view and manage its dependencies.
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
                <DependencyMapping businessFunction={currentFunction} />
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    Select a business function to view its dependencies.
                  </p>
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
