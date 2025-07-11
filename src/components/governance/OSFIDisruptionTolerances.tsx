import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Target, 
  Clock, 
  AlertTriangle, 
  TrendingUp, 
  Settings,
  Shield,
  Gauge,
  Activity,
  Timer,
  Zap,
  CheckCircle,
  XCircle,
  BarChart3
} from "lucide-react";

interface DisruptionTolerance {
  id: string;
  operationName: string;
  category: 'critical' | 'high' | 'medium';
  rto: number; // Recovery Time Objective in minutes
  rpo: number; // Recovery Point Objective in minutes
  mttr: number; // Mean Time to Recovery in minutes
  maxDisruptionTime: number; // Maximum tolerable disruption in minutes
  financialImpactPerHour: number;
  reputationalImpact: 'severe' | 'high' | 'medium' | 'low';
  regulatoryReportingThreshold: number; // minutes before regulatory reporting required
  currentStatus: 'within_tolerance' | 'warning' | 'breach';
  lastTested: string;
  nextTestDue: string;
}

interface ToleranceScenario {
  id: string;
  scenarioName: string;
  scenarioType: 'cyber_attack' | 'pandemic' | 'natural_disaster' | 'technology_failure' | 'third_party_failure';
  severity: 'severe_but_plausible' | 'extreme' | 'moderate';
  impactedOperations: string[];
  estimatedDuration: number; // in hours
  toleranceBreachProbability: number; // percentage
  mitigationStrategies: string[];
  lastSimulated: string;
  resultsValid: boolean;
}

interface DynamicAdjustment {
  id: string;
  triggerCondition: string;
  adjustmentType: 'extend_rto' | 'reduce_rto' | 'escalate_immediately';
  adjustmentValue: number;
  businessJustification: string;
  approvedBy: string;
  effectiveUntil: string;
  isActive: boolean;
}

export default function OSFIDisruptionTolerances() {
  const [tolerances, setTolerances] = useState<DisruptionTolerance[]>([]);
  const [scenarios, setScenarios] = useState<ToleranceScenario[]>([]);
  const [adjustments, setAdjustments] = useState<DynamicAdjustment[]>([]);
  const [selectedTolerance, setSelectedTolerance] = useState<string | null>(null);

  // Mock data - in production, this would come from your backend
  useEffect(() => {
    const mockTolerances: DisruptionTolerance[] = [
      {
        id: "1",
        operationName: "Payment Processing",
        category: "critical",
        rto: 30,
        rpo: 5,
        mttr: 25,
        maxDisruptionTime: 60,
        financialImpactPerHour: 250000,
        reputationalImpact: "severe",
        regulatoryReportingThreshold: 30,
        currentStatus: "within_tolerance",
        lastTested: "2024-07-01",
        nextTestDue: "2024-08-01"
      },
      {
        id: "2",
        operationName: "Customer Authentication",
        category: "critical", 
        rto: 15,
        rpo: 2,
        mttr: 12,
        maxDisruptionTime: 30,
        financialImpactPerHour: 150000,
        reputationalImpact: "severe",
        regulatoryReportingThreshold: 15,
        currentStatus: "warning",
        lastTested: "2024-06-28",
        nextTestDue: "2024-07-28"
      },
      {
        id: "3",
        operationName: "Risk Management Systems",
        category: "high",
        rto: 60,
        rpo: 15,
        mttr: 45,
        maxDisruptionTime: 120,
        financialImpactPerHour: 500000,
        reputationalImpact: "high",
        regulatoryReportingThreshold: 60,
        currentStatus: "within_tolerance",
        lastTested: "2024-07-05",
        nextTestDue: "2024-08-05"
      },
      {
        id: "4",
        operationName: "Customer Service Platform",
        category: "medium",
        rto: 120,
        rpo: 30,
        mttr: 90,
        maxDisruptionTime: 240,
        financialImpactPerHour: 75000,
        reputationalImpact: "medium",
        regulatoryReportingThreshold: 120,
        currentStatus: "breach",
        lastTested: "2024-06-20",
        nextTestDue: "2024-07-20"
      }
    ];

    const mockScenarios: ToleranceScenario[] = [
      {
        id: "1",
        scenarioName: "Cyber Attack - Ransomware",
        scenarioType: "cyber_attack",
        severity: "severe_but_plausible",
        impactedOperations: ["Payment Processing", "Customer Authentication", "Customer Service Platform"],
        estimatedDuration: 4,
        toleranceBreachProbability: 85,
        mitigationStrategies: ["Isolated backup systems", "Manual processing protocols", "Alternative authentication"],
        lastSimulated: "2024-06-15",
        resultsValid: true
      },
      {
        id: "2",
        scenarioName: "Pandemic - Workforce Disruption",
        scenarioType: "pandemic",
        severity: "severe_but_plausible",
        impactedOperations: ["Risk Management Systems", "Customer Service Platform"],
        estimatedDuration: 72,
        toleranceBreachProbability: 45,
        mitigationStrategies: ["Remote work capabilities", "Cross-training", "Vendor support"],
        lastSimulated: "2024-05-20",
        resultsValid: true
      },
      {
        id: "3",
        scenarioName: "Natural Disaster - Regional Outage",
        scenarioType: "natural_disaster",
        severity: "severe_but_plausible",
        impactedOperations: ["Payment Processing", "Risk Management Systems"],
        estimatedDuration: 8,
        toleranceBreachProbability: 70,
        mitigationStrategies: ["Geographic redundancy", "Mobile operations center", "Partner arrangements"],
        lastSimulated: "2024-04-10",
        resultsValid: false
      }
    ];

    const mockAdjustments: DynamicAdjustment[] = [
      {
        id: "1",
        triggerCondition: "Market volatility > 5% for 3 consecutive days",
        adjustmentType: "extend_rto",
        adjustmentValue: 15,
        businessJustification: "Extended tolerance during market stress to prioritize risk management over operational speed",
        approvedBy: "Chief Risk Officer",
        effectiveUntil: "2024-08-15",
        isActive: true
      },
      {
        id: "2",
        triggerCondition: "Cyber threat level elevated to HIGH",
        adjustmentType: "reduce_rto",
        adjustmentValue: 10,
        businessJustification: "Reduced tolerance to ensure rapid response during heightened cyber risk",
        approvedBy: "Chief Information Security Officer",
        effectiveUntil: "2024-07-30",
        isActive: false
      }
    ];

    setTolerances(mockTolerances);
    setScenarios(mockScenarios);
    setAdjustments(mockAdjustments);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'within_tolerance':
        return 'text-green-600';
      case 'warning':
        return 'text-yellow-600';
      case 'breach':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
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

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'severe_but_plausible':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'extreme':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'moderate':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const breachedTolerances = tolerances.filter(t => t.currentStatus === 'breach').length;
  const warningTolerances = tolerances.filter(t => t.currentStatus === 'warning').length;
  const avgRTO = tolerances.reduce((sum, t) => sum + t.rto, 0) / tolerances.length;
  const totalFinancialRisk = tolerances.reduce((sum, t) => sum + (t.financialImpactPerHour * (t.maxDisruptionTime / 60)), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">OSFI E-21 Disruption Tolerances</h2>
          <p className="text-muted-foreground">
            Quantitative impact tolerance definitions and severe-but-plausible scenario modeling
          </p>
        </div>
        <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
          <Shield className="h-3 w-3 mr-1" />
          E-21 Principle 7
        </Badge>
      </div>

      <Alert>
        <Target className="h-4 w-4" />
        <AlertDescription>
          <strong>OSFI E-21 Principle 7:</strong> FRFIs should establish tolerances for disruption that are aligned with their risk appetite and inform business decisions, including setting quantitative impact tolerance levels.
        </AlertDescription>
      </Alert>

      {/* Summary Metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tolerance Breaches</CardTitle>
            <XCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{breachedTolerances}</div>
            <p className="text-xs text-muted-foreground">
              operations exceeding limits
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Warning Levels</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{warningTolerances}</div>
            <p className="text-xs text-muted-foreground">
              approaching tolerance limits
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average RTO</CardTitle>
            <Timer className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(avgRTO)}</div>
            <p className="text-xs text-muted-foreground">
              minutes recovery time objective
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Financial Risk</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${(totalFinancialRisk / 1000000).toFixed(1)}M</div>
            <p className="text-xs text-muted-foreground">
              maximum exposure
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="tolerances" className="space-y-6">
        <TabsList>
          <TabsTrigger value="tolerances">Tolerance Levels</TabsTrigger>
          <TabsTrigger value="scenarios">Scenario Modeling</TabsTrigger>
          <TabsTrigger value="adjustments">Dynamic Adjustments</TabsTrigger>
          <TabsTrigger value="validation">Regulatory Validation</TabsTrigger>
        </TabsList>

        <TabsContent value="tolerances">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gauge className="h-5 w-5" />
                Quantitative Impact Tolerances
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {tolerances.map((tolerance) => (
                  <div 
                    key={tolerance.id} 
                    className="border rounded-lg p-4 hover:bg-muted/50 cursor-pointer"
                    onClick={() => setSelectedTolerance(tolerance.id === selectedTolerance ? null : tolerance.id)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-medium">{tolerance.operationName}</h4>
                          <Badge className={getCategoryColor(tolerance.category)}>
                            {tolerance.category.toUpperCase()}
                          </Badge>
                          <Badge variant="outline" className={getStatusColor(tolerance.currentStatus)}>
                            {tolerance.currentStatus.replace('_', ' ').toUpperCase()}
                          </Badge>
                        </div>
                        <div className="grid gap-2 md:grid-cols-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Timer className="h-3 w-3" />
                            RTO: {tolerance.rto}m
                          </span>
                          <span className="flex items-center gap-1">
                            <Target className="h-3 w-3" />
                            RPO: {tolerance.rpo}m
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Max Disruption: {tolerance.maxDisruptionTime}m
                          </span>
                          <span className="flex items-center gap-1">
                            <BarChart3 className="h-3 w-3" />
                            Impact: ${tolerance.financialImpactPerHour.toLocaleString()}/hr
                          </span>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        {selectedTolerance === tolerance.id ? 'Hide Details' : 'View Details'}
                      </Button>
                    </div>

                    {selectedTolerance === tolerance.id && (
                      <div className="mt-4 p-4 bg-muted rounded-lg">
                        <div className="grid gap-4 md:grid-cols-2">
                          <div>
                            <h5 className="font-medium mb-2">Impact Assessment</h5>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span>Financial Impact/Hour:</span>
                                <span className="font-medium">${tolerance.financialImpactPerHour.toLocaleString()}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Reputational Impact:</span>
                                <span className="font-medium capitalize">{tolerance.reputationalImpact}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>MTTR:</span>
                                <span className="font-medium">{tolerance.mttr} minutes</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Regulatory Threshold:</span>
                                <span className="font-medium">{tolerance.regulatoryReportingThreshold} minutes</span>
                              </div>
                            </div>
                          </div>
                          <div>
                            <h5 className="font-medium mb-2">Testing Status</h5>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span>Last Tested:</span>
                                <span className="font-medium">{tolerance.lastTested}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Next Test Due:</span>
                                <span className="font-medium">{tolerance.nextTestDue}</span>
                              </div>
                              <div className="flex gap-2 mt-3">
                                <Button variant="outline" size="sm">
                                  <Settings className="h-3 w-3 mr-1" />
                                  Configure
                                </Button>
                                <Button variant="outline" size="sm">
                                  <Activity className="h-3 w-3 mr-1" />
                                  Test Now
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scenarios">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Severe-but-Plausible Scenario Impact Modeling
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {scenarios.map((scenario) => (
                  <div key={scenario.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-medium">{scenario.scenarioName}</h4>
                          <Badge className={getSeverityColor(scenario.severity)}>
                            {scenario.severity.replace('_', ' ').toUpperCase()}
                          </Badge>
                          <Badge variant="outline" className={scenario.resultsValid ? 'text-green-700' : 'text-red-700'}>
                            {scenario.resultsValid ? 'Valid Results' : 'Needs Retest'}
                          </Badge>
                        </div>
                        <div className="grid gap-2 md:grid-cols-3 text-sm text-muted-foreground">
                          <span>Duration: {scenario.estimatedDuration} hours</span>
                          <span>Breach Probability: {scenario.toleranceBreachProbability}%</span>
                          <span>Last Simulated: {scenario.lastSimulated}</span>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        Run Simulation
                      </Button>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <h5 className="font-medium mb-2">Impacted Operations</h5>
                        <ul className="text-sm space-y-1">
                          {scenario.impactedOperations.map((op, index) => (
                            <li key={index} className="flex items-center gap-2">
                              <Zap className="h-3 w-3 text-orange-500" />
                              {op}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h5 className="font-medium mb-2">Mitigation Strategies</h5>
                        <ul className="text-sm space-y-1">
                          {scenario.mitigationStrategies.map((strategy, index) => (
                            <li key={index} className="flex items-center gap-2">
                              <CheckCircle className="h-3 w-3 text-green-500" />
                              {strategy}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="mt-3">
                      <Label className="text-sm font-medium">Tolerance Breach Probability</Label>
                      <Progress value={scenario.toleranceBreachProbability} className="h-2 mt-1" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="adjustments">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Dynamic Tolerance Adjustments
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {adjustments.map((adjustment) => (
                  <div key={adjustment.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-medium">Dynamic Adjustment Rule</h4>
                          <Badge className={adjustment.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
                            {adjustment.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{adjustment.triggerCondition}</p>
                      </div>
                      <Button variant="outline" size="sm">
                        Edit Rule
                      </Button>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <h5 className="font-medium mb-2">Adjustment Details</h5>
                        <div className="space-y-1 text-sm">
                          <div><strong>Type:</strong> {adjustment.adjustmentType.replace('_', ' ')}</div>
                          <div><strong>Value:</strong> {adjustment.adjustmentValue} minutes</div>
                          <div><strong>Approved By:</strong> {adjustment.approvedBy}</div>
                          <div><strong>Effective Until:</strong> {adjustment.effectiveUntil}</div>
                        </div>
                      </div>
                      <div>
                        <h5 className="font-medium mb-2">Business Justification</h5>
                        <p className="text-sm text-muted-foreground">
                          {adjustment.businessJustification}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="validation">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Regulatory Alignment Validation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Alert className="mb-4">
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  Tolerance levels are validated against OSFI E-21 expectations and industry benchmarks to ensure regulatory alignment.
                </AlertDescription>
              </Alert>
              
              <div className="text-center py-8 text-muted-foreground">
                <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Regulatory Validation Dashboard</p>
                <p className="text-sm">Comprehensive validation tools and OSFI alignment checking coming in next update</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}