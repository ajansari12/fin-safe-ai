import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, AlertTriangle, CheckCircle, Clock, Play, BarChart3, FileText } from "lucide-react";

const OSFIScenarioTesting = () => {
  const [activeTab, setActiveTab] = useState("scenarios");

  const scenarioLibrary = [
    {
      name: "Cyber Security Incident",
      type: "Technology",
      severity: "Severe",
      lastTested: "2024-01-15",
      nextTest: "2024-07-15",
      status: "completed",
      participatingUnits: ["IT", "Risk", "Operations", "Legal"],
      duration: "4 hours",
      outcomes: "Identified 3 improvement areas"
    },
    {
      name: "Pandemic Response",
      type: "External Event",
      severity: "Severe",
      lastTested: "2023-10-20",
      nextTest: "2024-04-20",
      status: "overdue",
      participatingUnits: ["HR", "Operations", "Risk", "Executive"],
      duration: "8 hours",
      outcomes: "Remote work procedures updated"
    },
    {
      name: "Key Vendor Failure",
      type: "Third Party",
      severity: "Severe",
      lastTested: "2024-02-10",
      nextTest: "2024-08-10",
      status: "completed",
      participatingUnits: ["Procurement", "Risk", "Operations"],
      duration: "6 hours",
      outcomes: "Backup vendor arrangements confirmed"
    },
    {
      name: "Natural Disaster",
      type: "External Event",
      severity: "Severe",
      lastTested: "2023-12-05",
      nextTest: "2024-06-05",
      status: "upcoming",
      participatingUnits: ["Facilities", "IT", "Risk", "Operations"],
      duration: "8 hours",
      outcomes: "Previous test identified evacuation delays"
    },
    {
      name: "Technology System Failure",
      type: "Technology",
      severity: "Severe",
      lastTested: "2024-01-30",
      nextTest: "2024-07-30",
      status: "completed",
      participatingUnits: ["IT", "Operations", "Risk"],
      duration: "6 hours",
      outcomes: "Recovery time exceeded targets"
    },
    {
      name: "Key Personnel Loss",
      type: "People",
      severity: "Severe",
      lastTested: "2023-11-15",
      nextTest: "2024-05-15",
      status: "overdue",
      participatingUnits: ["HR", "Risk", "Business Units"],
      duration: "4 hours",
      outcomes: "Succession planning gaps identified"
    }
  ];

  const testingCalendar = [
    { month: "Jan 2024", tests: 3, completed: 3 },
    { month: "Feb 2024", tests: 2, completed: 2 },
    { month: "Mar 2024", tests: 1, completed: 0 },
    { month: "Apr 2024", tests: 2, completed: 0 },
    { month: "May 2024", tests: 3, completed: 0 },
    { month: "Jun 2024", tests: 2, completed: 0 }
  ];

  const testResults = {
    totalScenarios: scenarioLibrary.length,
    completedThisYear: scenarioLibrary.filter(s => s.status === "completed").length,
    overdue: scenarioLibrary.filter(s => s.status === "overdue").length,
    averageDuration: "5.7 hours",
    participationRate: "94%",
    improvementsIdentified: 12
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "upcoming":
        return "bg-blue-100 text-blue-800";
      case "overdue":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "upcoming":
        return <Clock className="h-4 w-4 text-blue-600" />;
      case "overdue":
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">OSFI E-21 Scenario Testing</h2>
          <p className="text-muted-foreground">
            Severe-but-plausible scenario testing for operational resilience validation
          </p>
        </div>
        <Badge variant="outline" className="text-sm">
          Principle 8: Scenario Testing
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
            <h3 className="text-sm font-medium text-blue-900">OSFI E-21 Scenario Testing Requirements</h3>
            <p className="text-sm text-blue-700 mt-1">
              This framework implements OSFI E-21 Principle 8 requirements for regular testing using severe-but-plausible scenarios 
              including cyber incidents, pandemics, natural disasters, and other operational disruptions.
              <br />
              <span className="font-medium">Disclaimer:</span> This tool provides guidance and is not regulatory advice. Consult OSFI directly for official interpretation.
            </p>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">{testResults.totalScenarios}</div>
            <p className="text-sm text-muted-foreground">Total Scenarios</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{testResults.completedThisYear}</div>
            <p className="text-sm text-muted-foreground">Completed</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-red-600">{testResults.overdue}</div>
            <p className="text-sm text-muted-foreground">Overdue</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{testResults.averageDuration}</div>
            <p className="text-sm text-muted-foreground">Avg Duration</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">{testResults.participationRate}</div>
            <p className="text-sm text-muted-foreground">Participation</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-orange-600">{testResults.improvementsIdentified}</div>
            <p className="text-sm text-muted-foreground">Improvements</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="scenarios">Scenario Library</TabsTrigger>
          <TabsTrigger value="calendar">Testing Calendar</TabsTrigger>
          <TabsTrigger value="results">Test Results</TabsTrigger>
        </TabsList>

        <TabsContent value="scenarios" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Play className="h-5 w-5" />
                Severe-but-Plausible Scenarios
              </CardTitle>
              <CardDescription>
                Comprehensive library of operational risk scenarios for resilience testing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {scenarioLibrary.map((scenario, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {getStatusIcon(scenario.status)}
                        <p className="font-medium">{scenario.name}</p>
                        <Badge className={getSeverityColor(scenario.severity)}>
                          {scenario.severity}
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                        <div>
                          <p>Type: {scenario.type}</p>
                          <p>Duration: {scenario.duration}</p>
                        </div>
                        <div>
                          <p>Last Tested: {scenario.lastTested}</p>
                          <p>Next Test: {scenario.nextTest}</p>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">
                        Units: {scenario.participatingUnits.join(", ")}
                      </p>
                      <p className="text-sm mt-1">{scenario.outcomes}</p>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Badge className={getStatusColor(scenario.status)}>
                        {scenario.status}
                      </Badge>
                      <Button variant="outline" size="sm">
                        {scenario.status === "completed" ? "View Results" : "Schedule Test"}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 flex gap-2">
                <Button variant="outline" size="sm">
                  <Play className="h-4 w-4 mr-2" />
                  Run Test
                </Button>
                <Button variant="outline" size="sm">
                  Add Scenario
                </Button>
                <Button variant="outline" size="sm">
                  Export Schedule
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="calendar" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Multi-Year Testing Calendar
              </CardTitle>
              <CardDescription>
                Scheduled scenario testing across business units and risk areas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {testingCalendar.map((period, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">{period.month}</p>
                      <p className="text-sm text-muted-foreground">
                        {period.tests} tests scheduled
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Completion Rate</p>
                      <div className="flex items-center gap-2">
                        <Progress value={(period.completed / period.tests) * 100} className="w-24" />
                        <span className="text-sm">{period.completed}/{period.tests}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 flex gap-2">
                <Button variant="outline" size="sm">
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule Test
                </Button>
                <Button variant="outline" size="sm">
                  View Full Calendar
                </Button>
                <Button variant="outline" size="sm">
                  Export Schedule
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="results" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Testing Results & Analysis
              </CardTitle>
              <CardDescription>
                Outcomes, improvements, and lessons learned from scenario testing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium">Key Findings</h4>
                  <div className="space-y-2 text-sm">
                    <p>• Recovery time objectives exceeded in 2 scenarios</p>
                    <p>• Communication protocols require enhancement</p>
                    <p>• Third-party vendor arrangements need strengthening</p>
                    <p>• Staff training effectiveness varies by department</p>
                    <p>• Technology failover procedures successful</p>
                  </div>
                </div>
                <div className="space-y-4">
                  <h4 className="font-medium">Improvement Actions</h4>
                  <div className="space-y-2 text-sm">
                    <p>• Update business continuity plans (Due: Apr 30)</p>
                    <p>• Enhance crisis communication tools (Due: May 15)</p>
                    <p>• Negotiate backup vendor agreements (Due: Jun 30)</p>
                    <p>• Implement additional staff training (Due: Jul 15)</p>
                    <p>• Review and update tolerance levels (Due: Aug 30)</p>
                  </div>
                </div>
              </div>
              <div className="mt-6 flex gap-2">
                <Button variant="outline" size="sm">
                  <FileText className="h-4 w-4 mr-2" />
                  Generate Report
                </Button>
                <Button variant="outline" size="sm">
                  View Trends
                </Button>
                <Button variant="outline" size="sm">
                  Export Results
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default OSFIScenarioTesting;