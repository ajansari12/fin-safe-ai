
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  TrendingUp, 
  BarChart3, 
  Target, 
  Users,
  Star,
  CheckCircle,
  AlertTriangle,
  Settings
} from "lucide-react";

const ExpansionOpportunities = () => {
  const expansionOpportunities = [
    {
      id: 1,
      customer: "FirstNational Bank",
      currentModules: ["Risk Management", "Compliance", "Incident Management"],
      suggestedModule: "Advanced Analytics",
      readinessScore: 92,
      potentialValue: "$450K",
      timeframe: "Q4 2024",
      reasoning: "High usage of reporting features indicates readiness for advanced analytics capabilities"
    },
    {
      id: 2,
      customer: "Community Credit Union",
      currentModules: ["Risk Management", "Business Continuity"],
      suggestedModule: "Third-Party Risk",
      readinessScore: 78,
      potentialValue: "$180K",
      timeframe: "Q1 2025",
      reasoning: "Growing vendor portfolio and recent compliance requirements suggest need for third-party risk management"
    },
    {
      id: 3,
      customer: "Regional Bank Corp",
      currentModules: ["Risk Management", "Compliance", "Analytics"],
      suggestedModule: "Document Management",
      readinessScore: 85,
      potentialValue: "$320K",
      timeframe: "Q4 2024",
      reasoning: "Manual document processes identified as efficiency bottleneck in recent QBR"
    }
  ];

  const roiCalculations = [
    {
      customer: "FirstNational Bank",
      module: "Advanced Analytics",
      implementation: "$75K",
      annualSavings: "$180K",
      paybackPeriod: "5 months",
      threeYearROI: "620%"
    },
    {
      customer: "Community Credit Union",
      module: "Third-Party Risk",
      implementation: "$45K",
      annualSavings: "$85K",
      paybackPeriod: "6 months",
      threeYearROI: "467%"
    }
  ];

  const pilotPrograms = [
    {
      id: 1,
      customer: "Metro Bank",
      module: "AI-Powered Risk Scoring",
      status: "active",
      startDate: "2024-07-01",
      endDate: "2024-09-30",
      progress: 65,
      earlyResults: "25% improvement in risk detection accuracy"
    },
    {
      id: 2,
      customer: "City Credit Union",
      module: "Automated Compliance Reporting",
      status: "planning",
      startDate: "2024-08-15",
      endDate: "2024-11-15",
      progress: 15,
      earlyResults: "N/A - Planning phase"
    }
  ];

  const referenceCustomers = [
    {
      id: 1,
      customer: "FirstNational Bank",
      program: "Reference Customer",
      status: "active",
      activities: ["Case studies", "Webinars", "Conference speaking"],
      benefits: "25% discount on additional modules, priority support",
      satisfaction: 95
    },
    {
      id: 2,
      customer: "Regional Bank Corp",
      program: "Advisory Board",
      status: "active", 
      activities: ["Product feedback", "Roadmap input", "Beta testing"],
      benefits: "Early access to features, direct product influence",
      satisfaction: 92
    }
  ];

  const getReadinessColor = (score: number) => {
    if (score >= 85) return "text-green-500";
    if (score >= 70) return "text-yellow-500";
    return "text-red-500";
  };

  const getReadinessBadge = (score: number) => {
    if (score >= 85) return <Badge className="bg-green-500">High Readiness</Badge>;
    if (score >= 70) return <Badge className="bg-yellow-500">Medium Readiness</Badge>;
    return <Badge className="bg-red-500">Low Readiness</Badge>;
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="opportunities" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="opportunities">Expansion Opportunities</TabsTrigger>
          <TabsTrigger value="roi">ROI & Business Cases</TabsTrigger>
          <TabsTrigger value="pilots">Pilot Programs</TabsTrigger>
          <TabsTrigger value="advocacy">Customer Advocacy</TabsTrigger>
        </TabsList>

        <TabsContent value="opportunities" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Feature Utilization & Expansion Analysis
              </CardTitle>
              <CardDescription>
                Identify expansion opportunities based on usage patterns and customer readiness
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Total Opportunities</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">47</div>
                      <p className="text-xs text-muted-foreground">Across all customers</p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">High Readiness</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-green-500">23</div>
                      <p className="text-xs text-muted-foreground">Ready for expansion</p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Potential Value</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">$8.2M</div>
                      <p className="text-xs text-muted-foreground">Annual recurring revenue</p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Active Pilots</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">12</div>
                      <p className="text-xs text-muted-foreground">Testing new features</p>
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-4">
                  {expansionOpportunities.map((opportunity) => (
                    <div key={opportunity.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">{opportunity.customer}</h4>
                          <p className="text-sm text-muted-foreground">
                            Current: {opportunity.currentModules.join(", ")}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {getReadinessBadge(opportunity.readinessScore)}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Suggested Module:</span>
                          <p className="text-muted-foreground">{opportunity.suggestedModule}</p>
                        </div>
                        
                        <div>
                          <span className="font-medium">Readiness Score:</span>
                          <div className="flex items-center gap-2 mt-1">
                            <Progress value={opportunity.readinessScore} className="h-2 flex-1" />
                            <span className={`text-xs ${getReadinessColor(opportunity.readinessScore)}`}>
                              {opportunity.readinessScore}%
                            </span>
                          </div>
                        </div>
                        
                        <div>
                          <span className="font-medium">Potential Value:</span>
                          <p className="text-muted-foreground">{opportunity.potentialValue}</p>
                        </div>
                        
                        <div>
                          <span className="font-medium">Timeframe:</span>
                          <p className="text-muted-foreground">{opportunity.timeframe}</p>
                        </div>
                      </div>
                      
                      <div>
                        <span className="text-sm font-medium">Reasoning:</span>
                        <p className="text-sm text-muted-foreground">{opportunity.reasoning}</p>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button size="sm">Create Business Case</Button>
                        <Button variant="outline" size="sm">Schedule Demo</Button>
                        <Button variant="outline" size="sm">Start Pilot</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="roi" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                ROI Calculations & Business Cases
              </CardTitle>
              <CardDescription>
                Detailed financial analysis and business case development for expansions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Avg ROI</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-green-500">425%</div>
                      <p className="text-xs text-muted-foreground">3-year average</p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Avg Payback</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">6.2</div>
                      <p className="text-xs text-muted-foreground">Months</p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Business Cases</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">18</div>
                      <p className="text-xs text-muted-foreground">In development</p>
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-4">
                  {roiCalculations.map((calc, index) => (
                    <div key={index} className="border rounded-lg p-4 space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">{calc.customer}</h4>
                          <p className="text-sm text-muted-foreground">{calc.module}</p>
                        </div>
                        <Badge className="bg-green-500">{calc.threeYearROI} ROI</Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Implementation:</span>
                          <p className="text-muted-foreground">{calc.implementation}</p>
                        </div>
                        
                        <div>
                          <span className="font-medium">Annual Savings:</span>
                          <p className="text-muted-foreground">{calc.annualSavings}</p>
                        </div>
                        
                        <div>
                          <span className="font-medium">Payback Period:</span>
                          <p className="text-muted-foreground">{calc.paybackPeriod}</p>
                        </div>
                        
                        <div>
                          <span className="font-medium">3-Year ROI:</span>
                          <p className="text-muted-foreground">{calc.threeYearROI}</p>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button size="sm">Generate Full Business Case</Button>
                        <Button variant="outline" size="sm">Send to Customer</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pilots" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Pilot Program Management
              </CardTitle>
              <CardDescription>
                Manage new feature testing and pilot program implementations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Active Pilots</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">12</div>
                      <p className="text-xs text-muted-foreground">Currently running</p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Success Rate</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-green-500">87%</div>
                      <p className="text-xs text-muted-foreground">Pilots to full deployment</p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Avg Duration</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">90</div>
                      <p className="text-xs text-muted-foreground">Days</p>
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium">Current Pilot Programs</h4>
                    <Button size="sm">Create New Pilot</Button>
                  </div>
                  
                  {pilotPrograms.map((pilot) => (
                    <div key={pilot.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">{pilot.customer}</h4>
                          <p className="text-sm text-muted-foreground">{pilot.module}</p>
                        </div>
                        <Badge variant={pilot.status === "active" ? "default" : "secondary"}>
                          {pilot.status}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Duration:</span>
                          <p className="text-muted-foreground">{pilot.startDate} - {pilot.endDate}</p>
                        </div>
                        
                        <div>
                          <span className="font-medium">Progress:</span>
                          <div className="flex items-center gap-2 mt-1">
                            <Progress value={pilot.progress} className="h-2 flex-1" />
                            <span className="text-xs">{pilot.progress}%</span>
                          </div>
                        </div>
                        
                        <div>
                          <span className="font-medium">Early Results:</span>
                          <p className="text-muted-foreground">{pilot.earlyResults}</p>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button size="sm">View Details</Button>
                        <Button variant="outline" size="sm">Update Progress</Button>
                        <Button variant="outline" size="sm">Generate Report</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="advocacy" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="h-5 w-5" />
                Customer Advocacy Programs
              </CardTitle>
              <CardDescription>
                Manage reference customers, advisory programs, and advocacy initiatives
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Reference Customers</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">28</div>
                      <p className="text-xs text-muted-foreground">Active participants</p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Advisory Board</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">8</div>
                      <p className="text-xs text-muted-foreground">Advisory members</p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">Case Studies</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">45</div>
                      <p className="text-xs text-muted-foreground">Published this year</p>
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-4">
                  {referenceCustomers.map((ref) => (
                    <div key={ref.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">{ref.customer}</h4>
                          <p className="text-sm text-muted-foreground">{ref.program}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={ref.status === "active" ? "default" : "secondary"}>
                            {ref.status}
                          </Badge>
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 text-yellow-500" />
                            <span className="text-sm">{ref.satisfaction}%</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Activities:</span>
                          <p className="text-muted-foreground">{ref.activities.join(", ")}</p>
                        </div>
                        
                        <div>
                          <span className="font-medium">Benefits:</span>
                          <p className="text-muted-foreground">{ref.benefits}</p>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button size="sm">Schedule Activity</Button>
                        <Button variant="outline" size="sm">Send Recognition</Button>
                        <Button variant="outline" size="sm">Review Program</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ExpansionOpportunities;
