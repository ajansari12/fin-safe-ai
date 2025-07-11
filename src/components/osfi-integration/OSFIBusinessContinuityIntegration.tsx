import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Activity,
  TrendingUp,
  Eye,
  Settings,
  FileText,
  Target
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface OSFIBusinessContinuityProps {
  orgId: string;
}

interface CriticalOperation {
  id: string;
  name: string;
  criticality: 'critical' | 'important' | 'normal';
  osfi_principle: string;
  current_rto: number;
  target_rto: number;
  current_rpo: number;
  target_rpo: number;
  compliance_status: 'compliant' | 'at_risk' | 'non_compliant';
  last_tested: string;
  next_test_due: string;
  resilience_score: number;
}

interface DisruptionTolerance {
  operation_id: string;
  severe_but_plausible_scenarios: string[];
  maximum_tolerable_downtime: number;
  impact_tolerance: 'low' | 'medium' | 'high';
  osfi_alignment: boolean;
}

const OSFIBusinessContinuityIntegration: React.FC<OSFIBusinessContinuityProps> = ({ orgId }) => {
  const [criticalOperations, setCriticalOperations] = useState<CriticalOperation[]>([]);
  const [disruptionTolerances, setDisruptionTolerances] = useState<DisruptionTolerance[]>([]);
  const [complianceMetrics, setComplianceMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedOperation, setSelectedOperation] = useState<CriticalOperation | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadOSFIBusinessContinuityData();
  }, [orgId]);

  const loadOSFIBusinessContinuityData = async () => {
    try {
      setLoading(true);
      
      // Load critical operations mapped to OSFI principles
      const mockCriticalOperations: CriticalOperation[] = [
        {
          id: '1',
          name: 'Payment Processing',
          criticality: 'critical',
          osfi_principle: 'Principle 6 - Critical Operations',
          current_rto: 4,
          target_rto: 2,
          current_rpo: 1,
          target_rpo: 0.5,
          compliance_status: 'at_risk',
          last_tested: '2024-01-15',
          next_test_due: '2024-02-15',
          resilience_score: 75
        },
        {
          id: '2',
          name: 'Customer Data Management',
          criticality: 'critical',
          osfi_principle: 'Principle 6 - Critical Operations',
          current_rto: 2,
          target_rto: 1,
          current_rpo: 0.5,
          target_rpo: 0.25,
          compliance_status: 'compliant',
          last_tested: '2024-01-20',
          next_test_due: '2024-02-20',
          resilience_score: 92
        },
        {
          id: '3',
          name: 'Risk Management Systems',
          criticality: 'critical',
          osfi_principle: 'Principle 7 - Disruption Tolerance',
          current_rto: 6,
          target_rto: 4,
          current_rpo: 2,
          target_rpo: 1,
          compliance_status: 'non_compliant',
          last_tested: '2024-01-10',
          next_test_due: '2024-02-10',
          resilience_score: 68
        }
      ];

      const mockDisruptionTolerances: DisruptionTolerance[] = [
        {
          operation_id: '1',
          severe_but_plausible_scenarios: ['Cyber Attack', 'Data Center Failure', 'Third-Party Outage'],
          maximum_tolerable_downtime: 2,
          impact_tolerance: 'low',
          osfi_alignment: true
        },
        {
          operation_id: '2',
          severe_but_plausible_scenarios: ['Data Breach', 'System Corruption', 'Natural Disaster'],
          maximum_tolerable_downtime: 1,
          impact_tolerance: 'low',
          osfi_alignment: true
        },
        {
          operation_id: '3',
          severe_but_plausible_scenarios: ['Market Volatility', 'System Failure', 'Regulatory Changes'],
          maximum_tolerable_downtime: 4,
          impact_tolerance: 'medium',
          osfi_alignment: false
        }
      ];

      const mockComplianceMetrics = {
        overall_osfi_compliance: 78,
        principle_6_compliance: 83,
        principle_7_compliance: 72,
        critical_operations_count: 15,
        compliant_operations: 8,
        at_risk_operations: 4,
        non_compliant_operations: 3,
        severe_scenarios_tested: 12,
        average_resilience_score: 78.3
      };

      setCriticalOperations(mockCriticalOperations);
      setDisruptionTolerances(mockDisruptionTolerances);
      setComplianceMetrics(mockComplianceMetrics);
    } catch (error) {
      console.error('Error loading OSFI business continuity data:', error);
      toast({
        title: "Error",
        description: "Failed to load OSFI business continuity data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getComplianceColor = (status: string) => {
    switch (status) {
      case 'compliant': return 'bg-green-100 text-green-800 border-green-200';
      case 'at_risk': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'non_compliant': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCriticalityColor = (criticality: string) => {
    switch (criticality) {
      case 'critical': return 'bg-red-500';
      case 'important': return 'bg-orange-500';
      case 'normal': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid gap-4 md:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold">OSFI Business Continuity & Resilience</h3>
          <p className="text-muted-foreground">
            Alignment with OSFI E-21 Principles 6 & 7 for critical operations and disruption tolerance
          </p>
        </div>
        <Button variant="outline">
          <Settings className="h-4 w-4 mr-2" />
          Configure
        </Button>
      </div>

      {/* OSFI Compliance Metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overall OSFI Compliance</CardTitle>
            <Shield className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{complianceMetrics?.overall_osfi_compliance}%</div>
            <Progress value={complianceMetrics?.overall_osfi_compliance} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Principle 6 Compliance</CardTitle>
            <Target className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{complianceMetrics?.principle_6_compliance}%</div>
            <p className="text-xs text-muted-foreground">Critical Operations</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Principle 7 Compliance</CardTitle>
            <Activity className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{complianceMetrics?.principle_7_compliance}%</div>
            <p className="text-xs text-muted-foreground">Disruption Tolerance</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Resilience Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{complianceMetrics?.average_resilience_score}</div>
            <p className="text-xs text-muted-foreground">Across all operations</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="critical-operations" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="critical-operations">Critical Operations</TabsTrigger>
          <TabsTrigger value="disruption-tolerance">Disruption Tolerance</TabsTrigger>
          <TabsTrigger value="scenario-testing">Scenario Testing</TabsTrigger>
        </TabsList>

        <TabsContent value="critical-operations" className="space-y-4">
          <div className="grid gap-4">
            {criticalOperations.map((operation) => (
              <Card key={operation.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${getCriticalityColor(operation.criticality)}`}></div>
                      <div>
                        <CardTitle className="text-lg">{operation.name}</CardTitle>
                        <CardDescription>{operation.osfi_principle}</CardDescription>
                      </div>
                    </div>
                    <Badge className={getComplianceColor(operation.compliance_status)}>
                      {operation.compliance_status.replace('_', ' ')}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                      <div className="text-sm font-medium">Recovery Objectives</div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>RTO:</span>
                          <span className={operation.current_rto > operation.target_rto ? 'text-red-600' : 'text-green-600'}>
                            {operation.current_rto}h (target: {operation.target_rto}h)
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>RPO:</span>
                          <span className={operation.current_rpo > operation.target_rpo ? 'text-red-600' : 'text-green-600'}>
                            {operation.current_rpo}h (target: {operation.target_rpo}h)
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="text-sm font-medium">Testing Status</div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>Last Tested:</span>
                          <span>{format(new Date(operation.last_tested), 'MMM dd, yyyy')}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Next Due:</span>
                          <span className={new Date(operation.next_test_due) < new Date() ? 'text-red-600' : 'text-muted-foreground'}>
                            {format(new Date(operation.next_test_due), 'MMM dd, yyyy')}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="text-sm font-medium">Resilience Score</div>
                      <div className="space-y-2">
                        <div className="text-2xl font-bold">{operation.resilience_score}%</div>
                        <Progress value={operation.resilience_score} className="h-2" />
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4 pt-4 border-t">
                    <Button size="sm" variant="outline" onClick={() => setSelectedOperation(operation)}>
                      <Eye className="h-3 w-3 mr-1" />
                      Details
                    </Button>
                    <Button size="sm" variant="outline">
                      <Activity className="h-3 w-3 mr-1" />
                      Test
                    </Button>
                    <Button size="sm" variant="outline">
                      <FileText className="h-3 w-3 mr-1" />
                      Report
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="disruption-tolerance" className="space-y-4">
          <div className="grid gap-4">
            {disruptionTolerances.map((tolerance, index) => {
              const operation = criticalOperations.find(op => op.id === tolerance.operation_id);
              if (!operation) return null;

              return (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{operation.name}</span>
                      {tolerance.osfi_alignment ? (
                        <Badge className="bg-green-100 text-green-800">OSFI Aligned</Badge>
                      ) : (
                        <Badge className="bg-red-100 text-red-800">Needs Alignment</Badge>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-2">
                      <div className="space-y-3">
                        <div>
                          <div className="text-sm font-medium mb-2">Severe-but-Plausible Scenarios</div>
                          <div className="space-y-1">
                            {tolerance.severe_but_plausible_scenarios.map((scenario, idx) => (
                              <Badge key={idx} variant="outline" className="mr-2 mb-1">
                                {scenario}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm font-medium">Maximum Tolerable Downtime</div>
                          <div className="text-lg font-bold text-blue-600">{tolerance.maximum_tolerable_downtime} hours</div>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div>
                          <div className="text-sm font-medium">Impact Tolerance</div>
                          <Badge className={
                            tolerance.impact_tolerance === 'low' ? 'bg-green-100 text-green-800' :
                            tolerance.impact_tolerance === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }>
                            {tolerance.impact_tolerance.toUpperCase()}
                          </Badge>
                        </div>
                        <div>
                          <div className="text-sm font-medium">OSFI E-21 Alignment</div>
                          <div className="flex items-center gap-2">
                            {tolerance.osfi_alignment ? (
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            ) : (
                              <AlertTriangle className="h-4 w-4 text-red-600" />
                            )}
                            <span className={tolerance.osfi_alignment ? 'text-green-600' : 'text-red-600'}>
                              {tolerance.osfi_alignment ? 'Compliant' : 'Requires Action'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="scenario-testing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>OSFI-Compliant Scenario Testing</CardTitle>
              <CardDescription>
                Severe-but-plausible scenarios aligned with OSFI E-21 requirements
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <div className="text-sm font-medium mb-2">Cyber Attack Simulation</div>
                    <div className="text-xs text-muted-foreground mb-2">Last executed: Jan 15, 2024</div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Resilience Score: 78%</span>
                      <Button size="sm" variant="outline">Re-run</Button>
                    </div>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <div className="text-sm font-medium mb-2">Third-Party Provider Failure</div>
                    <div className="text-xs text-muted-foreground mb-2">Last executed: Jan 20, 2024</div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Resilience Score: 85%</span>
                      <Button size="sm" variant="outline">Re-run</Button>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <div className="text-sm font-medium mb-2">Natural Disaster Scenario</div>
                    <div className="text-xs text-muted-foreground mb-2">Due: Feb 10, 2024</div>
                    <div className="flex justify-between items-center">
                      <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
                      <Button size="sm">Execute</Button>
                    </div>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <div className="text-sm font-medium mb-2">Market Volatility Impact</div>
                    <div className="text-xs text-muted-foreground mb-2">Due: Feb 15, 2024</div>
                    <div className="flex justify-between items-center">
                      <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
                      <Button size="sm">Execute</Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Operation Details Dialog */}
      {selectedOperation && (
        <Dialog open={!!selectedOperation} onOpenChange={() => setSelectedOperation(null)}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>{selectedOperation.name} - OSFI Compliance Details</DialogTitle>
              <DialogDescription>
                Detailed view of {selectedOperation.osfi_principle} compliance
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Recovery Objectives</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span>Current RTO:</span>
                        <span className="font-medium">{selectedOperation.current_rto} hours</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Target RTO:</span>
                        <span className="font-medium">{selectedOperation.target_rto} hours</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Current RPO:</span>
                        <span className="font-medium">{selectedOperation.current_rpo} hours</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Target RPO:</span>
                        <span className="font-medium">{selectedOperation.target_rpo} hours</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Compliance Status</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span>Overall Status:</span>
                        <Badge className={getComplianceColor(selectedOperation.compliance_status)}>
                          {selectedOperation.compliance_status.replace('_', ' ')}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Resilience Score:</span>
                        <span className="font-medium">{selectedOperation.resilience_score}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Last Tested:</span>
                        <span className="font-medium">{format(new Date(selectedOperation.last_tested), 'MMM dd, yyyy')}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default OSFIBusinessContinuityIntegration;