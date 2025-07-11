import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertTriangle, TrendingUp, Target, BarChart3, Bell, CheckCircle } from "lucide-react";

const EnhancedRiskAppetite = () => {
  const [activeTab, setActiveTab] = useState("statements");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const riskAppetiteStatements = [
    {
      id: "RA001",
      category: "Operational",
      statement: "Technology System Availability",
      description: "Maintain 99.9% uptime for critical systems",
      qualitativeLimit: "Zero tolerance for extended outages affecting customer service",
      quantitativeLimit: "Maximum 8.76 hours downtime per year",
      currentLevel: 99.95,
      targetLevel: 99.9,
      tolerance: "Low",
      status: "within_appetite",
      lastReview: "2024-01-15",
      owner: "CTO",
      escalationThreshold: 99.8
    },
    {
      id: "RA002", 
      category: "People",
      statement: "Key Personnel Risk",
      description: "Limit dependency on key individuals",
      qualitativeLimit: "No single point of failure in critical roles",
      quantitativeLimit: "Maximum 30% of critical roles without succession plan",
      currentLevel: 85,
      targetLevel: 95,
      tolerance: "Medium",
      status: "approaching_limit",
      lastReview: "2024-02-01",
      owner: "CHRO",
      escalationThreshold: 80
    },
    {
      id: "RA003",
      category: "Process",
      statement: "Transaction Processing Errors",
      description: "Maintain high accuracy in transaction processing",
      qualitativeLimit: "Zero tolerance for material customer impact",
      quantitativeLimit: "Less than 0.01% error rate",
      currentLevel: 0.015,
      targetLevel: 0.01,
      tolerance: "Low",
      status: "breach",
      lastReview: "2024-01-30",
      owner: "COO",
      escalationThreshold: 0.012
    },
    {
      id: "RA004",
      category: "External",
      statement: "Third Party Service Risk",
      description: "Limit concentration risk from vendor dependencies",
      qualitativeLimit: "No critical service single vendor dependency",
      quantitativeLimit: "Maximum 40% of revenue dependent on single vendor",
      currentLevel: 25,
      targetLevel: 30,
      tolerance: "Medium",
      status: "within_appetite",
      lastReview: "2024-02-10",
      owner: "CPO",
      escalationThreshold: 35
    },
    {
      id: "RA005",
      category: "Cyber",
      statement: "Cyber Security Incidents",
      description: "Minimize successful cyber attacks",
      qualitativeLimit: "Zero tolerance for data breaches",
      quantitativeLimit: "Less than 2 successful attacks per year",
      currentLevel: 0,
      targetLevel: 0,
      tolerance: "Zero",
      status: "within_appetite",
      lastReview: "2024-02-05",
      owner: "CISO",
      escalationThreshold: 1
    }
  ];

  const forwardLookingScenarios = [
    {
      name: "Economic Downturn",
      probability: "Medium",
      impact: "High",
      timeframe: "12 months",
      riskAdjustment: "Reduce risk tolerance by 20%",
      mitigations: ["Increase liquidity buffers", "Enhance stress testing"]
    },
    {
      name: "Regulatory Changes",
      probability: "High", 
      impact: "Medium",
      timeframe: "6 months",
      riskAdjustment: "Maintain current levels",
      mitigations: ["Regulatory change monitoring", "Compliance gap analysis"]
    },
    {
      name: "Cyber Threat Evolution",
      probability: "High",
      impact: "High", 
      timeframe: "Ongoing",
      riskAdjustment: "Decrease cyber risk tolerance",
      mitigations: ["Advanced threat detection", "Enhanced training"]
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "within_appetite":
        return "bg-green-100 text-green-800";
      case "approaching_limit":
        return "bg-yellow-100 text-yellow-800";
      case "breach":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "within_appetite":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "approaching_limit":
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case "breach":
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default:
        return <Target className="h-4 w-4 text-gray-600" />;
    }
  };

  const getToleranceColor = (tolerance: string) => {
    switch (tolerance) {
      case "Zero":
        return "bg-red-100 text-red-800";
      case "Low":
        return "bg-orange-100 text-orange-800";
      case "Medium":
        return "bg-yellow-100 text-yellow-800";
      case "High":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const filteredStatements = selectedCategory === "all" 
    ? riskAppetiteStatements 
    : riskAppetiteStatements.filter(s => s.category === selectedCategory);

  const overallRiskPosture = {
    withinAppetite: riskAppetiteStatements.filter(s => s.status === "within_appetite").length,
    approachingLimit: riskAppetiteStatements.filter(s => s.status === "approaching_limit").length,
    breaches: riskAppetiteStatements.filter(s => s.status === "breach").length,
    totalStatements: riskAppetiteStatements.length
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Enhanced Risk Appetite Framework</h2>
          <p className="text-muted-foreground">
            OSFI E-21 compliant risk appetite with forward-looking scenarios and dynamic tolerance
          </p>
        </div>
        <Badge variant="outline" className="text-sm">
          Principle 3: Risk Appetite
        </Badge>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-medium text-blue-900">OSFI E-21 Risk Appetite Requirements</h3>
            <p className="text-sm text-blue-700 mt-1">
              This framework implements OSFI E-21 Principle 3 with defined appetite statements, 
              qualitative/quantitative limits, forward-looking scenarios, and integration across risk areas.
              <br />
              <span className="font-medium">Disclaimer:</span> This tool provides guidance and is not regulatory advice. Consult OSFI directly for official interpretation.
            </p>
          </div>
        </div>
      </div>

      {/* Risk Posture Summary */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{overallRiskPosture.withinAppetite}</div>
            <p className="text-sm text-muted-foreground">Within Appetite</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-yellow-600">{overallRiskPosture.approachingLimit}</div>
            <p className="text-sm text-muted-foreground">Approaching Limit</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-600">{overallRiskPosture.breaches}</div>
            <p className="text-sm text-muted-foreground">Breaches</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{overallRiskPosture.totalStatements}</div>
            <p className="text-sm text-muted-foreground">Total Statements</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="statements">Appetite Statements</TabsTrigger>
          <TabsTrigger value="scenarios">Forward-Looking</TabsTrigger>
          <TabsTrigger value="integration">Integration</TabsTrigger>
          <TabsTrigger value="monitoring">Live Monitoring</TabsTrigger>
        </TabsList>

        <TabsContent value="statements" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Risk Appetite Statements
                  </CardTitle>
                  <CardDescription>
                    Qualitative and quantitative risk limits with operational tolerances
                  </CardDescription>
                </div>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="Operational">Operational</SelectItem>
                    <SelectItem value="People">People</SelectItem>
                    <SelectItem value="Process">Process</SelectItem>
                    <SelectItem value="External">External</SelectItem>
                    <SelectItem value="Cyber">Cyber</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredStatements.map((statement) => (
                  <div key={statement.id} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          {getStatusIcon(statement.status)}
                          <h4 className="font-medium">{statement.statement}</h4>
                          <Badge variant="outline">{statement.category}</Badge>
                          <Badge className={getToleranceColor(statement.tolerance)}>
                            {statement.tolerance} Tolerance
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{statement.description}</p>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="font-medium">Qualitative Limit:</p>
                            <p className="text-muted-foreground">{statement.qualitativeLimit}</p>
                          </div>
                          <div>
                            <p className="font-medium">Quantitative Limit:</p>
                            <p className="text-muted-foreground">{statement.quantitativeLimit}</p>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className={getStatusColor(statement.status)}>
                          {statement.status.replace('_', ' ')}
                        </Badge>
                        <p className="text-sm text-muted-foreground mt-1">
                          Owner: {statement.owner}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Current Level vs Target</span>
                        <span>{statement.currentLevel}% / {statement.targetLevel}%</span>
                      </div>
                      <Progress 
                        value={(statement.currentLevel / statement.targetLevel) * 100} 
                        className="h-2"
                      />
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 flex gap-2">
                <Button variant="outline" size="sm">
                  <Target className="h-4 w-4 mr-2" />
                  Add Statement
                </Button>
                <Button variant="outline" size="sm">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Risk Dashboard
                </Button>
                <Button variant="outline" size="sm">
                  Export Report
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scenarios" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Forward-Looking Scenario Integration
              </CardTitle>
              <CardDescription>
                Dynamic risk appetite adjustment based on emerging scenarios and stress conditions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {forwardLookingScenarios.map((scenario, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-medium">{scenario.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          Timeframe: {scenario.timeframe}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Badge variant="outline">{scenario.probability} Probability</Badge>
                        <Badge variant="outline">{scenario.impact} Impact</Badge>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="font-medium">Risk Adjustment:</p>
                        <p className="text-muted-foreground">{scenario.riskAdjustment}</p>
                      </div>
                      <div>
                        <p className="font-medium">Key Mitigations:</p>
                        <ul className="text-muted-foreground list-disc list-inside">
                          {scenario.mitigations.map((mitigation, idx) => (
                            <li key={idx}>{mitigation}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 flex gap-2">
                <Button variant="outline" size="sm">
                  Add Scenario
                </Button>
                <Button variant="outline" size="sm">
                  Run Stress Test
                </Button>
                <Button variant="outline" size="sm">
                  Generate Forecast
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integration" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Cross-Module Integration</CardTitle>
              <CardDescription>
                Risk appetite integration with incidents, controls, KRIs, and business continuity
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium">Connected Modules</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between p-2 border rounded">
                      <span>Incident Management</span>
                      <Badge className="bg-green-100 text-green-800">Active</Badge>
                    </div>
                    <div className="flex justify-between p-2 border rounded">
                      <span>Control Testing</span>
                      <Badge className="bg-green-100 text-green-800">Active</Badge>
                    </div>
                    <div className="flex justify-between p-2 border rounded">
                      <span>KRI Monitoring</span>
                      <Badge className="bg-green-100 text-green-800">Active</Badge>
                    </div>
                    <div className="flex justify-between p-2 border rounded">
                      <span>Business Continuity</span>
                      <Badge className="bg-yellow-100 text-yellow-800">Partial</Badge>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <h4 className="font-medium">Auto-Escalation Rules</h4>
                  <div className="space-y-2 text-sm">
                    <p>• Breach notifications to board within 2 hours</p>
                    <p>• Risk owner alerts at 90% of threshold</p>
                    <p>• Weekly trend reports to senior management</p>
                    <p>• Monthly appetite review meetings</p>
                    <p>• Quarterly board reporting dashboard</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Real-Time Appetite Monitoring
              </CardTitle>
              <CardDescription>
                Live monitoring with automated alerts and breach notifications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 border rounded-lg">
                    <div className="text-lg font-semibold text-green-600">12</div>
                    <p className="text-sm text-muted-foreground">Active Monitors</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="text-lg font-semibold text-yellow-600">3</div>
                    <p className="text-sm text-muted-foreground">Alerts Today</p>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <div className="text-lg font-semibold text-red-600">1</div>
                    <p className="text-sm text-muted-foreground">Escalations</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">Recent Alerts</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center p-2 border rounded">
                      <span className="text-sm">Transaction error rate approaching limit</span>
                      <Badge className="bg-yellow-100 text-yellow-800">Warning</Badge>
                    </div>
                    <div className="flex justify-between items-center p-2 border rounded">
                      <span className="text-sm">Key personnel coverage below threshold</span>
                      <Badge className="bg-red-100 text-red-800">Critical</Badge>
                    </div>
                    <div className="flex justify-between items-center p-2 border rounded">
                      <span className="text-sm">System availability trending down</span>
                      <Badge className="bg-yellow-100 text-yellow-800">Warning</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnhancedRiskAppetite;