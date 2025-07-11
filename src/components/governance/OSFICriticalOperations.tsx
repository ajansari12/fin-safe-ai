import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Building2, 
  Network, 
  AlertTriangle, 
  Clock, 
  Target,
  Zap,
  TrendingUp,
  Users,
  Shield,
  Activity,
  MapPin,
  CheckCircle
} from "lucide-react";

interface CriticalOperation {
  id: string;
  name: string;
  description: string;
  criticality: 'critical' | 'high' | 'medium';
  rto: number; // Recovery Time Objective in minutes
  rpo: number; // Recovery Point Objective in minutes
  dependencies: string[];
  impact: 'severe' | 'major' | 'moderate';
  status: 'operational' | 'degraded' | 'failed';
  businessServices: string[];
  lastTested: string;
  nextTest: string;
}

interface ServiceMapping {
  serviceId: string;
  serviceName: string;
  operationsSupported: string[];
  dependencies: {
    internal: string[];
    external: string[];
    technology: string[];
  };
  impactTolerance: {
    financial: number;
    reputational: string;
    regulatory: string;
  };
}

export default function OSFICriticalOperations() {
  const [operations, setOperations] = useState<CriticalOperation[]>([]);
  const [serviceMappings, setServiceMappings] = useState<ServiceMapping[]>([]);
  const [selectedOperation, setSelectedOperation] = useState<string | null>(null);

  // Mock data - in production, this would come from your backend
  useEffect(() => {
    const mockOperations: CriticalOperation[] = [
      {
        id: "1",
        name: "Payment Processing",
        description: "Core payment processing for customer transactions",
        criticality: "critical",
        rto: 30,
        rpo: 5,
        dependencies: ["Core Banking System", "Payment Rails", "Fraud Detection"],
        impact: "severe",
        status: "operational",
        businessServices: ["Online Banking", "ATM Network", "Mobile Payments"],
        lastTested: "2024-07-01",
        nextTest: "2024-08-01"
      },
      {
        id: "2", 
        name: "Customer Authentication",
        description: "Multi-factor authentication and identity verification",
        criticality: "critical",
        rto: 15,
        rpo: 2,
        dependencies: ["Identity Management", "SMS Gateway", "Biometric Systems"],
        impact: "severe",
        status: "operational",
        businessServices: ["Digital Banking", "Customer Portal", "Mobile App"],
        lastTested: "2024-06-28",
        nextTest: "2024-07-28"
      },
      {
        id: "3",
        name: "Risk Management",
        description: "Real-time risk assessment and monitoring",
        criticality: "high",
        rto: 60,
        rpo: 15,
        dependencies: ["Market Data", "Analytics Engine", "Regulatory Feeds"],
        impact: "major",
        status: "operational",
        businessServices: ["Trading Platform", "Portfolio Management", "Compliance"],
        lastTested: "2024-07-05",
        nextTest: "2024-08-05"
      },
      {
        id: "4",
        name: "Customer Data Management",
        description: "Customer information and account management systems",
        criticality: "high",
        rto: 45,
        rpo: 10,
        dependencies: ["Customer Database", "Document Management", "Audit Trail"],
        impact: "major",
        status: "degraded",
        businessServices: ["Account Opening", "KYC Process", "Customer Service"],
        lastTested: "2024-06-20",
        nextTest: "2024-07-20"
      }
    ];

    const mockServiceMappings: ServiceMapping[] = [
      {
        serviceId: "1",
        serviceName: "Digital Banking Platform",
        operationsSupported: ["Payment Processing", "Customer Authentication", "Account Management"],
        dependencies: {
          internal: ["Core Banking System", "Customer Database"],
          external: ["Payment Networks", "Credit Bureaus"],
          technology: ["AWS Infrastructure", "Security Systems", "API Gateway"]
        },
        impactTolerance: {
          financial: 1000000,
          reputational: "High impact - customer trust at risk",
          regulatory: "Potential OSFI reporting required"
        }
      },
      {
        serviceId: "2",
        serviceName: "Trading & Investment Services",
        operationsSupported: ["Risk Management", "Portfolio Management", "Trade Execution"],
        dependencies: {
          internal: ["Risk Engine", "Analytics Platform"],
          external: ["Market Data Providers", "Clearing Houses"],
          technology: ["Trading Infrastructure", "Real-time Data Feeds"]
        },
        impactTolerance: {
          financial: 5000000,
          reputational: "Severe - market confidence impact",
          regulatory: "Immediate IIROC and OSFI notification required"
        }
      }
    ];

    setOperations(mockOperations);
    setServiceMappings(mockServiceMappings);
  }, []);

  const getCriticalityColor = (criticality: string) => {
    switch (criticality) {
      case 'critical':
        return 'bg-red-500 text-white';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational':
        return 'text-green-600';
      case 'degraded':
        return 'text-yellow-600';
      case 'failed':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const criticalOpsCount = operations.filter(op => op.criticality === 'critical').length;
  const degradedOpsCount = operations.filter(op => op.status === 'degraded' || op.status === 'failed').length;
  const avgRTO = operations.reduce((sum, op) => sum + op.rto, 0) / operations.length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">OSFI E-21 Critical Operations</h2>
          <p className="text-muted-foreground">
            Comprehensive identification, mapping, and monitoring of critical operations and business services
          </p>
        </div>
        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
          <Shield className="h-3 w-3 mr-1" />
          E-21 Principle 6
        </Badge>
      </div>

      <Alert>
        <Building2 className="h-4 w-4" />
        <AlertDescription>
          <strong>OSFI E-21 Principle 6:</strong> FRFIs should identify their critical operations and map these operations to the business services they support, considering severe-but-plausible scenarios.
        </AlertDescription>
      </Alert>

      {/* Summary Metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical Operations</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{criticalOpsCount}</div>
            <p className="text-xs text-muted-foreground">
              Out of {operations.length} total operations
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Service Disruptions</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{degradedOpsCount}</div>
            <p className="text-xs text-muted-foreground">
              Operations with issues
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average RTO</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(avgRTO)}</div>
            <p className="text-xs text-muted-foreground">
              minutes recovery time
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Business Services</CardTitle>
            <Network className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{serviceMappings.length}</div>
            <p className="text-xs text-muted-foreground">
              mapped to operations
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="operations" className="space-y-6">
        <TabsList>
          <TabsTrigger value="operations">Critical Operations</TabsTrigger>
          <TabsTrigger value="mapping">Service Mapping</TabsTrigger>
          <TabsTrigger value="dependencies">Dependencies</TabsTrigger>
          <TabsTrigger value="impact">Impact Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="operations">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Critical Operations Inventory
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {operations.map((operation) => (
                  <div 
                    key={operation.id} 
                    className="flex items-start justify-between p-4 border rounded-lg hover:bg-muted/50 cursor-pointer"
                    onClick={() => setSelectedOperation(operation.id === selectedOperation ? null : operation.id)}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-medium">{operation.name}</h4>
                        <Badge className={getCriticalityColor(operation.criticality)}>
                          {operation.criticality.toUpperCase()}
                        </Badge>
                        <Badge variant="outline" className={getStatusColor(operation.status)}>
                          {operation.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        {operation.description}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          RTO: {operation.rto}m
                        </span>
                        <span className="flex items-center gap-1">
                          <Target className="h-3 w-3" />
                          RPO: {operation.rpo}m
                        </span>
                        <span className="flex items-center gap-1">
                          <CheckCircle className="h-3 w-3" />
                          Last tested: {operation.lastTested}
                        </span>
                      </div>
                      
                      {selectedOperation === operation.id && (
                        <div className="mt-4 p-3 bg-muted rounded-lg">
                          <div className="grid gap-4 md:grid-cols-2">
                            <div>
                              <h5 className="font-medium mb-2">Dependencies</h5>
                              <ul className="text-sm space-y-1">
                                {operation.dependencies.map((dep, index) => (
                                  <li key={index} className="flex items-center gap-2">
                                    <Network className="h-3 w-3" />
                                    {dep}
                                  </li>
                                ))}
                              </ul>
                            </div>
                            <div>
                              <h5 className="font-medium mb-2">Business Services</h5>
                              <ul className="text-sm space-y-1">
                                {operation.businessServices.map((service, index) => (
                                  <li key={index} className="flex items-center gap-2">
                                    <Users className="h-3 w-3" />
                                    {service}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    <Button variant="outline" size="sm">
                      {selectedOperation === operation.id ? 'Hide Details' : 'View Details'}
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mapping">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Business Service Mapping
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {serviceMappings.map((mapping) => (
                  <div key={mapping.serviceId} className="border rounded-lg p-4">
                    <h4 className="font-medium mb-3">{mapping.serviceName}</h4>
                    
                    <div className="grid gap-4 md:grid-cols-3">
                      <div>
                        <h5 className="text-sm font-medium mb-2">Supported Operations</h5>
                        <ul className="text-sm space-y-1">
                          {mapping.operationsSupported.map((op, index) => (
                            <li key={index} className="flex items-center gap-2">
                              <Zap className="h-3 w-3 text-blue-500" />
                              {op}
                            </li>
                          ))}
                        </ul>
                      </div>
                      
                      <div>
                        <h5 className="text-sm font-medium mb-2">Dependencies</h5>
                        <div className="space-y-2">
                          <div>
                            <span className="text-xs text-muted-foreground">Internal:</span>
                            <ul className="text-sm">
                              {mapping.dependencies.internal.map((dep, index) => (
                                <li key={index} className="ml-3">• {dep}</li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <span className="text-xs text-muted-foreground">External:</span>
                            <ul className="text-sm">
                              {mapping.dependencies.external.map((dep, index) => (
                                <li key={index} className="ml-3">• {dep}</li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <h5 className="text-sm font-medium mb-2">Impact Tolerance</h5>
                        <div className="space-y-1 text-sm">
                          <div>
                            <span className="text-muted-foreground">Financial:</span> 
                            ${mapping.impactTolerance.financial.toLocaleString()}
                          </div>
                          <div>
                            <span className="text-muted-foreground">Reputational:</span>
                            <p className="text-xs">{mapping.impactTolerance.reputational}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Regulatory:</span>
                            <p className="text-xs">{mapping.impactTolerance.regulatory}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="dependencies">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Network className="h-5 w-5" />
                Dependency Analysis & Health
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Alert className="mb-4">
                <TrendingUp className="h-4 w-4" />
                <AlertDescription>
                  Real-time monitoring of critical dependencies with automated health checks and impact assessment.
                </AlertDescription>
              </Alert>
              
              <div className="text-center py-8 text-muted-foreground">
                <Network className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Dependency visualization and health monitoring</p>
                <p className="text-sm">Interactive dependency maps and health dashboards coming in next update</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="impact">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Impact Analysis Tools
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Alert className="mb-4">
                <Shield className="h-4 w-4" />
                <AlertDescription>
                  Automated impact analysis for critical operations using severe-but-plausible scenarios as defined by OSFI E-21.
                </AlertDescription>
              </Alert>
              
              <div className="text-center py-8 text-muted-foreground">
                <AlertTriangle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Severe scenario impact modeling</p>
                <p className="text-sm">Advanced impact analysis and scenario testing tools coming in Phase 4</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}