import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calculator, TrendingUp, AlertTriangle, BarChart3, Play, Target } from "lucide-react";

const OSFIScenarioAnalysis = () => {
  const [activeTab, setActiveTab] = useState("library");
  const [selectedScenario, setSelectedScenario] = useState("");

  const scenarioLibrary = [
    {
      id: "SC001",
      name: "Major Cyber Attack",
      type: "Technology",
      severity: "Severe",
      probability: "Medium",
      description: "Advanced persistent threat targeting core banking systems",
      impactAreas: ["Technology", "Operations", "Reputation", "Financial"],
      estimatedLoss: "$50M - $200M",
      recoveryTime: "72 hours",
      businessLines: ["Retail Banking", "Corporate Banking", "Digital Channels"],
      dependencies: ["External IT vendors", "Payment networks", "Regulatory reporting"],
      lastAnalysis: "2024-01-15"
    },
    {
      id: "SC002", 
      name: "Pandemic Scenario",
      type: "External Event",
      severity: "Severe",
      probability: "Low",
      description: "Global pandemic affecting workforce availability and operations",
      impactAreas: ["People", "Operations", "Business Continuity"],
      estimatedLoss: "$20M - $100M",
      recoveryTime: "6 months",
      businessLines: ["All Business Lines"],
      dependencies: ["Staff availability", "Technology infrastructure", "Vendor services"],
      lastAnalysis: "2024-02-01"
    },
    {
      id: "SC003",
      name: "Key Vendor Failure",
      type: "Third Party",
      severity: "Severe", 
      probability: "Medium",
      description: "Failure of critical technology vendor providing core services",
      impactAreas: ["Technology", "Operations", "Customer Service"],
      estimatedLoss: "$10M - $50M",
      recoveryTime: "48 hours",
      businessLines: ["Digital Banking", "Payment Processing"],
      dependencies: ["Backup vendors", "Internal capabilities", "Data migration"],
      lastAnalysis: "2024-01-30"
    },
    {
      id: "SC004",
      name: "Natural Disaster",
      type: "External Event", 
      severity: "Severe",
      probability: "Low",
      description: "Major earthquake affecting primary data center and offices",
      impactAreas: ["Technology", "People", "Operations", "Physical Assets"],
      estimatedLoss: "$30M - $150M",
      recoveryTime: "168 hours",
      businessLines: ["All Business Lines"],
      dependencies: ["Disaster recovery site", "Staff relocation", "Communication systems"],
      lastAnalysis: "2023-12-15"
    },
    {
      id: "SC005",
      name: "Regulatory Investigation",
      type: "Regulatory",
      severity: "Moderate",
      probability: "Medium",
      description: "OSFI investigation into operational risk management practices",
      impactAreas: ["Reputation", "Regulatory", "Financial", "Operations"],
      estimatedLoss: "$5M - $25M",
      recoveryTime: "12 months",
      businessLines: ["Risk Management", "Compliance", "Executive"],
      dependencies: ["Documentation quality", "Staff availability", "External advisors"],
      lastAnalysis: "2024-02-10"
    }
  ];

  const impactAssessment = {
    financial: {
      directLoss: 50000000,
      indirectLoss: 25000000,
      regulatoryFines: 10000000,
      reputationalLoss: 15000000
    },
    operational: {
      systemDowntime: "48 hours",
      customerImpact: "75% of digital customers",
      staffImpact: "30% workforce unavailable",
      processDisruption: "Critical processes offline"
    },
    recovery: {
      rtoAchievement: "Within target",
      rpoAchievement: "Exceeded by 2 hours",
      backupEffectiveness: "90% successful",
      communicationEffectiveness: "Needs improvement"
    }
  };

  const stressTestResults = [
    {
      scenario: "Cyber Attack + Vendor Failure",
      combinedImpact: "Critical",
      aggregatedLoss: "$150M",
      recoveryTime: "120 hours",
      keyFindings: ["Insufficient backup capacity", "Communication breakdown", "Resource conflicts"]
    },
    {
      scenario: "Natural Disaster + Pandemic",
      combinedImpact: "Severe",
      aggregatedLoss: "$200M",
      recoveryTime: "8 months",
      keyFindings: ["Remote work limitations", "Vendor dependencies", "Regulatory compliance challenges"]
    },
    {
      scenario: "Multiple Vendor Failures",
      combinedImpact: "High",
      aggregatedLoss: "$75M",
      recoveryTime: "72 hours",
      keyFindings: ["Concentration risk", "Limited alternatives", "Integration challenges"]
    }
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "Severe":
        return "bg-red-100 text-red-800";
      case "Moderate":
        return "bg-yellow-100 text-yellow-800";
      case "Minor":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getProbabilityColor = (probability: string) => {
    switch (probability) {
      case "High":
        return "bg-red-100 text-red-800";
      case "Medium":
        return "bg-yellow-100 text-yellow-800";
      case "Low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">OSFI E-21 Scenario Analysis Engine</h2>
          <p className="text-muted-foreground">
            Severe-but-plausible scenario analysis with cross-business line impact assessment
          </p>
        </div>
        <Badge variant="outline" className="text-sm">
          Principle 4: Identification & Assessment
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
            <h3 className="text-sm font-medium text-blue-900">OSFI E-21 Scenario Analysis Framework</h3>
            <p className="text-sm text-blue-700 mt-1">
              This engine supports OSFI E-21 Principle 4 requirements for scenario analysis using severe-but-plausible scenarios
              to assess potential operational risk impacts and stress test resilience capabilities.
              <br />
              <span className="font-medium">Disclaimer:</span> This tool provides guidance and is not regulatory advice. Consult OSFI directly for official interpretation.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">{scenarioLibrary.length}</div>
            <p className="text-sm text-muted-foreground">Total Scenarios</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-600">
              {scenarioLibrary.filter(s => s.severity === "Severe").length}
            </div>
            <p className="text-sm text-muted-foreground">Severe Scenarios</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-yellow-600">3</div>
            <p className="text-sm text-muted-foreground">Stress Tests</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">15</div>
            <p className="text-sm text-muted-foreground">Analyses YTD</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="library">Scenario Library</TabsTrigger>
          <TabsTrigger value="analysis">Impact Analysis</TabsTrigger>
          <TabsTrigger value="stress">Stress Testing</TabsTrigger>
          <TabsTrigger value="builder">Scenario Builder</TabsTrigger>
        </TabsList>

        <TabsContent value="library" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Severe-but-Plausible Scenario Library
              </CardTitle>
              <CardDescription>
                Comprehensive collection of operational risk scenarios for stress testing and analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {scenarioLibrary.map((scenario) => (
                  <div key={scenario.id} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-medium">{scenario.name}</h4>
                          <Badge variant="outline">{scenario.type}</Badge>
                          <Badge className={getSeverityColor(scenario.severity)}>
                            {scenario.severity}
                          </Badge>
                          <Badge className={getProbabilityColor(scenario.probability)}>
                            {scenario.probability} Probability
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">{scenario.description}</p>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="font-medium">Impact Areas:</p>
                            <p className="text-muted-foreground">{scenario.impactAreas.join(", ")}</p>
                          </div>
                          <div>
                            <p className="font-medium">Business Lines:</p>
                            <p className="text-muted-foreground">{scenario.businessLines.join(", ")}</p>
                          </div>
                          <div>
                            <p className="font-medium">Estimated Loss:</p>
                            <p className="text-muted-foreground">{scenario.estimatedLoss}</p>
                          </div>
                          <div>
                            <p className="font-medium">Recovery Time:</p>
                            <p className="text-muted-foreground">{scenario.recoveryTime}</p>
                          </div>
                        </div>
                        
                        <div className="mt-3">
                          <p className="font-medium text-sm">Key Dependencies:</p>
                          <p className="text-sm text-muted-foreground">{scenario.dependencies.join(", ")}</p>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <Button variant="outline" size="sm">
                          <Play className="h-4 w-4 mr-2" />
                          Run Analysis
                        </Button>
                        <Button variant="outline" size="sm">
                          <Calculator className="h-4 w-4 mr-2" />
                          Edit Scenario
                        </Button>
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
                  Import Template
                </Button>
                <Button variant="outline" size="sm">
                  Export Library
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analysis" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Cross-Business Line Impact Analysis
              </CardTitle>
              <CardDescription>
                Detailed impact assessment across financial, operational, and strategic dimensions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <Label htmlFor="scenario-select">Select Scenario for Analysis</Label>
                  <Select value={selectedScenario} onValueChange={setSelectedScenario}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a scenario to analyze" />
                    </SelectTrigger>
                    <SelectContent>
                      {scenarioLibrary.map((scenario) => (
                        <SelectItem key={scenario.id} value={scenario.id}>
                          {scenario.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-3 gap-6">
                  <div>
                    <h4 className="font-medium mb-3">Financial Impact</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Direct Loss:</span>
                        <span className="font-medium">${(impactAssessment.financial.directLoss / 1000000).toFixed(0)}M</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Indirect Loss:</span>
                        <span className="font-medium">${(impactAssessment.financial.indirectLoss / 1000000).toFixed(0)}M</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Regulatory Fines:</span>
                        <span className="font-medium">${(impactAssessment.financial.regulatoryFines / 1000000).toFixed(0)}M</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Reputational:</span>
                        <span className="font-medium">${(impactAssessment.financial.reputationalLoss / 1000000).toFixed(0)}M</span>
                      </div>
                      <div className="border-t pt-2 mt-2">
                        <div className="flex justify-between font-medium">
                          <span>Total Impact:</span>
                          <span className="text-red-600">
                            ${((impactAssessment.financial.directLoss + impactAssessment.financial.indirectLoss + 
                                impactAssessment.financial.regulatoryFines + impactAssessment.financial.reputationalLoss) / 1000000).toFixed(0)}M
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-3">Operational Impact</h4>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="font-medium">System Downtime:</span>
                        <p className="text-muted-foreground">{impactAssessment.operational.systemDowntime}</p>
                      </div>
                      <div>
                        <span className="font-medium">Customer Impact:</span>
                        <p className="text-muted-foreground">{impactAssessment.operational.customerImpact}</p>
                      </div>
                      <div>
                        <span className="font-medium">Staff Impact:</span>
                        <p className="text-muted-foreground">{impactAssessment.operational.staffImpact}</p>
                      </div>
                      <div>
                        <span className="font-medium">Process Disruption:</span>
                        <p className="text-muted-foreground">{impactAssessment.operational.processDisruption}</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium mb-3">Recovery Assessment</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>RTO Achievement:</span>
                        <Badge className="bg-green-100 text-green-800">
                          {impactAssessment.recovery.rtoAchievement}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>RPO Achievement:</span>
                        <Badge className="bg-yellow-100 text-yellow-800">
                          {impactAssessment.recovery.rpoAchievement}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>Backup Effectiveness:</span>
                        <span className="font-medium">{impactAssessment.recovery.backupEffectiveness}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Communication:</span>
                        <Badge className="bg-yellow-100 text-yellow-800">
                          {impactAssessment.recovery.communicationEffectiveness}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stress" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Stress Testing & Combined Scenarios
              </CardTitle>
              <CardDescription>
                Multi-scenario stress testing to assess cumulative impacts and system resilience
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stressTestResults.map((test, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-medium">{test.scenario}</h4>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className={getSeverityColor(test.combinedImpact)}>
                            {test.combinedImpact} Impact
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-red-600">{test.aggregatedLoss}</p>
                        <p className="text-sm text-muted-foreground">{test.recoveryTime}</p>
                      </div>
                    </div>
                    <div>
                      <p className="font-medium text-sm mb-1">Key Findings:</p>
                      <ul className="text-sm text-muted-foreground list-disc list-inside">
                        {test.keyFindings.map((finding, idx) => (
                          <li key={idx}>{finding}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 flex gap-2">
                <Button variant="outline" size="sm">
                  Run New Stress Test
                </Button>
                <Button variant="outline" size="sm">
                  Compare Results
                </Button>
                <Button variant="outline" size="sm">
                  Export Analysis
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="builder" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Custom Scenario Builder</CardTitle>
              <CardDescription>
                Create new severe-but-plausible scenarios for risk assessment
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="scenario-name">Scenario Name</Label>
                    <Input id="scenario-name" placeholder="Enter scenario name" />
                  </div>
                  <div>
                    <Label htmlFor="scenario-type">Type</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="technology">Technology</SelectItem>
                        <SelectItem value="external">External Event</SelectItem>
                        <SelectItem value="people">People</SelectItem>
                        <SelectItem value="process">Process</SelectItem>
                        <SelectItem value="regulatory">Regulatory</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="scenario-description">Description</Label>
                  <Textarea 
                    id="scenario-description" 
                    placeholder="Describe the scenario in detail..."
                    rows={3}
                  />
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="severity">Severity</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select severity" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="severe">Severe</SelectItem>
                        <SelectItem value="moderate">Moderate</SelectItem>
                        <SelectItem value="minor">Minor</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="probability">Probability</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select probability" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="recovery-time">Recovery Time</Label>
                    <Input id="recovery-time" placeholder="e.g., 48 hours" />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button>Save Scenario</Button>
                  <Button variant="outline">Save as Template</Button>
                  <Button variant="outline">Cancel</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default OSFIScenarioAnalysis;