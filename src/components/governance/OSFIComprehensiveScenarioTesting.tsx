import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  Play, 
  Calendar, 
  Users, 
  Shield, 
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3,
  Zap,
  FileText,
  Settings,
  Target,
  Activity,
  TrendingUp
} from "lucide-react";

interface SevereScenario {
  id: string;
  scenarioName: string;
  scenarioType: 'cyber_incident' | 'pandemic' | 'natural_disaster' | 'technology_failure' | 'third_party_failure' | 'financial_market_stress';
  severity: 'severe_but_plausible' | 'extreme_stress' | 'regulatory_mandated';
  description: string;
  impactedSystems: string[];
  estimatedDuration: number; // in hours
  participatingUnits: string[];
  testFrequency: 'quarterly' | 'semi_annual' | 'annual' | 'ad_hoc';
  lastExecuted: string;
  nextScheduled: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'overdue';
  results: {
    rtoMet: boolean;
    rpoMet: boolean;
    communicationEffective: boolean;
    regulatoryNotificationTimely: boolean;
    overallScore: number;
  } | null;
  regulatoryAlignment: 'osfi_e21' | 'bis_bcbs' | 'custom';
}

interface CrossFunctionalTeam {
  id: string;
  teamName: string;
  leadName: string;
  members: string[];
  responsibilities: string[];
  currentScenario: string | null;
  communicationChannel: string;
  escalationPath: string[];
}

interface TestExecution {
  id: string;
  scenarioId: string;
  executionDate: string;
  coordinator: string;
  realTimeMetrics: {
    responseTime: number;
    communicationDelay: number;
    decisionsToRestore: number;
    stakeholdersNotified: number;
  };
  lessons: string[];
  improvements: string[];
  status: 'planning' | 'executing' | 'completed' | 'analyzing';
}

export default function OSFIComprehensiveScenarioTesting() {
  const [scenarios, setScenarios] = useState<SevereScenario[]>([]);
  const [teams, setTeams] = useState<CrossFunctionalTeam[]>([]);
  const [executions, setExecutions] = useState<TestExecution[]>([]);
  const [selectedScenario, setSelectedScenario] = useState<string | null>(null);

  // Mock data - in production, this would come from your backend
  useEffect(() => {
    const mockScenarios: SevereScenario[] = [
      {
        id: "1",
        scenarioName: "Ransomware Attack - Critical Systems",
        scenarioType: "cyber_incident",
        severity: "severe_but_plausible",
        description: "Sophisticated ransomware targeting core banking and payment systems with encryption of critical databases",
        impactedSystems: ["Payment Processing", "Core Banking", "Customer Authentication", "ATM Network"],
        estimatedDuration: 8,
        participatingUnits: ["IT Security", "Operations", "Risk Management", "Communications", "Legal"],
        testFrequency: "quarterly",
        lastExecuted: "2024-04-15",
        nextScheduled: "2024-07-15",
        status: "scheduled",
        results: {
          rtoMet: false,
          rpoMet: true,
          communicationEffective: true,
          regulatoryNotificationTimely: false,
          overallScore: 65
        },
        regulatoryAlignment: "osfi_e21"
      },
      {
        id: "2",
        scenarioName: "Pandemic Workforce Disruption",
        scenarioType: "pandemic",
        severity: "severe_but_plausible", 
        description: "90% workforce unavailable due to severe pandemic outbreak affecting all key operational locations",
        impactedSystems: ["Customer Service", "Risk Management", "Compliance", "Operations Center"],
        estimatedDuration: 168, // 7 days
        participatingUnits: ["Human Resources", "Operations", "Technology", "Business Continuity", "Executive"],
        testFrequency: "annual",
        lastExecuted: "2024-02-20",
        nextScheduled: "2024-08-20",
        status: "completed",
        results: {
          rtoMet: true,
          rpoMet: true,
          communicationEffective: false,
          regulatoryNotificationTimely: true,
          overallScore: 78
        },
        regulatoryAlignment: "osfi_e21"
      },
      {
        id: "3",
        scenarioName: "Major Data Center Outage",
        scenarioType: "natural_disaster",
        severity: "severe_but_plausible",
        description: "Complete loss of primary data center due to natural disaster, requiring full failover to backup facilities",
        impactedSystems: ["All Core Systems", "Customer Portals", "Risk Systems", "Regulatory Reporting"],
        estimatedDuration: 12,
        participatingUnits: ["Technology", "Operations", "Risk", "Communications", "Vendor Management"],
        testFrequency: "semi_annual",
        lastExecuted: "2024-01-10",
        nextScheduled: "2024-07-10",
        status: "overdue",
        results: null,
        regulatoryAlignment: "osfi_e21"
      },
      {
        id: "4",
        scenarioName: "Critical Third-Party Provider Failure",
        scenarioType: "third_party_failure",
        severity: "severe_but_plausible",
        description: "Complete failure of primary payment network provider affecting all transaction processing",
        impactedSystems: ["Payment Processing", "ATM Network", "Merchant Services", "Customer Transactions"],
        estimatedDuration: 6,
        participatingUnits: ["Vendor Management", "Operations", "Customer Service", "Communications"],
        testFrequency: "quarterly",
        lastExecuted: "2024-05-30",
        nextScheduled: "2024-08-30",
        status: "scheduled",
        results: {
          rtoMet: true,
          rpoMet: false,
          communicationEffective: true,
          regulatoryNotificationTimely: true,
          overallScore: 82
        },
        regulatoryAlignment: "osfi_e21"
      }
    ];

    const mockTeams: CrossFunctionalTeam[] = [
      {
        id: "1",
        teamName: "Cyber Incident Response Team",
        leadName: "Chief Information Security Officer",
        members: ["Security Analysts", "IT Operations", "Legal Counsel", "Communications", "Executive Sponsor"],
        responsibilities: ["Threat assessment", "System isolation", "Forensics", "Recovery coordination", "Stakeholder communication"],
        currentScenario: "1",
        communicationChannel: "Secure incident bridge",
        escalationPath: ["CISO", "CTO", "CEO", "Board Chair"]
      },
      {
        id: "2",
        teamName: "Business Continuity Team",
        leadName: "Head of Business Continuity",
        members: ["Operations Managers", "HR Business Partners", "Facilities", "Technology", "Risk Management"],
        responsibilities: ["Continuity activation", "Workforce coordination", "Facility management", "Vendor coordination"],
        currentScenario: "2",
        communicationChannel: "Emergency operations center",
        escalationPath: ["BC Manager", "COO", "CEO"]
      },
      {
        id: "3",
        teamName: "Technology Recovery Team",
        leadName: "Chief Technology Officer",
        members: ["Infrastructure Teams", "Application Teams", "Database Admins", "Network Engineers"],
        responsibilities: ["System recovery", "Data restoration", "Infrastructure failover", "Performance monitoring"],
        currentScenario: null,
        communicationChannel: "Technical war room",
        escalationPath: ["Tech Lead", "CTO", "CEO"]
      }
    ];

    const mockExecutions: TestExecution[] = [
      {
        id: "1",
        scenarioId: "1",
        executionDate: "2024-04-15",
        coordinator: "Chief Information Security Officer",
        realTimeMetrics: {
          responseTime: 25, // minutes
          communicationDelay: 8, // minutes
          decisionsToRestore: 12,
          stakeholdersNotified: 15
        },
        lessons: [
          "Communication delays during initial 30 minutes",
          "Backup authentication system took longer than expected",
          "External vendor coordination was challenging"
        ],
        improvements: [
          "Pre-staged communication templates",
          "Improved backup system automation",
          "Enhanced vendor SLA requirements"
        ],
        status: "completed"
      },
      {
        id: "2",
        scenarioId: "2",
        executionDate: "2024-02-20",
        coordinator: "Head of Business Continuity",
        realTimeMetrics: {
          responseTime: 45,
          communicationDelay: 15,
          decisionsToRestore: 8,
          stakeholdersNotified: 22
        },
        lessons: [
          "Remote work capabilities were sufficient",
          "Customer communication needs improvement",
          "Vendor support was excellent"
        ],
        improvements: [
          "Enhanced customer communication channels",
          "Improved remote access procedures",
          "Better cross-training programs"
        ],
        status: "completed"
      }
    ];

    setScenarios(mockScenarios);
    setTeams(mockTeams);
    setExecutions(mockExecutions);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'scheduled':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'in_progress':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'overdue':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'severe_but_plausible':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'extreme_stress':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'regulatory_mandated':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const completedTests = scenarios.filter(s => s.status === 'completed').length;
  const overdueTests = scenarios.filter(s => s.status === 'overdue').length;
  const avgScore = scenarios
    .filter(s => s.results)
    .reduce((sum, s) => sum + (s.results?.overallScore || 0), 0) / 
    scenarios.filter(s => s.results).length || 0;
  const activeTeams = teams.filter(t => t.currentScenario).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">OSFI E-21 Comprehensive Scenario Testing</h2>
          <p className="text-muted-foreground">
            Severe-but-plausible scenario testing with cross-functional coordination and real-time monitoring
          </p>
        </div>
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
          <Shield className="h-3 w-3 mr-1" />
          E-21 Principle 8
        </Badge>
      </div>

      <Alert>
        <Play className="h-4 w-4" />
        <AlertDescription>
          <strong>OSFI E-21 Principle 8:</strong> FRFIs should test their operational resilience through scenario testing that considers severe-but-plausible scenarios and validates the effectiveness of response and recovery capabilities.
        </AlertDescription>
      </Alert>

      {/* Summary Metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Tests</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{completedTests}</div>
            <p className="text-xs text-muted-foreground">
              scenarios validated this quarter
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue Tests</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{overdueTests}</div>
            <p className="text-xs text-muted-foreground">
              requiring immediate execution
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(avgScore)}%</div>
            <p className="text-xs text-muted-foreground">
              scenario test effectiveness
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Teams</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{activeTeams}</div>
            <p className="text-xs text-muted-foreground">
              currently executing scenarios
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="scenarios" className="space-y-6">
        <TabsList>
          <TabsTrigger value="scenarios">Severe Scenarios</TabsTrigger>
          <TabsTrigger value="coordination">Team Coordination</TabsTrigger>
          <TabsTrigger value="execution">Real-time Monitoring</TabsTrigger>
          <TabsTrigger value="analysis">Post-test Analysis</TabsTrigger>
        </TabsList>

        <TabsContent value="scenarios">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Severe-but-Plausible Scenario Library
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {scenarios.map((scenario) => (
                  <div 
                    key={scenario.id} 
                    className="border rounded-lg p-4 hover:bg-muted/50 cursor-pointer"
                    onClick={() => setSelectedScenario(scenario.id === selectedScenario ? null : scenario.id)}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-medium">{scenario.scenarioName}</h4>
                          <Badge className={getSeverityColor(scenario.severity)}>
                            {scenario.severity.replace('_', ' ').toUpperCase()}
                          </Badge>
                          <Badge className={getStatusColor(scenario.status)}>
                            {scenario.status.replace('_', ' ').toUpperCase()}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {scenario.description}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Duration: {scenario.estimatedDuration}h
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Next: {scenario.nextScheduled}
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {scenario.participatingUnits.length} teams
                          </span>
                          {scenario.results && (
                            <span className="flex items-center gap-1">
                              <BarChart3 className="h-3 w-3" />
                              Score: {scenario.results.overallScore}%
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm">
                          <Play className="h-3 w-3 mr-1" />
                          Execute
                        </Button>
                        <Button variant="outline" size="sm">
                          {selectedScenario === scenario.id ? 'Hide' : 'Details'}
                        </Button>
                      </div>
                    </div>

                    {selectedScenario === scenario.id && (
                      <div className="mt-4 p-4 bg-muted rounded-lg">
                        <div className="grid gap-4 md:grid-cols-2">
                          <div>
                            <h5 className="font-medium mb-2">Impacted Systems</h5>
                            <ul className="text-sm space-y-1">
                              {scenario.impactedSystems.map((system, index) => (
                                <li key={index} className="flex items-center gap-2">
                                  <Zap className="h-3 w-3 text-orange-500" />
                                  {system}
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <h5 className="font-medium mb-2">Participating Units</h5>
                            <ul className="text-sm space-y-1">
                              {scenario.participatingUnits.map((unit, index) => (
                                <li key={index} className="flex items-center gap-2">
                                  <Users className="h-3 w-3 text-blue-500" />
                                  {unit}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                        
                        {scenario.results && (
                          <div className="mt-4">
                            <h5 className="font-medium mb-2">Last Test Results</h5>
                            <div className="grid gap-2 md:grid-cols-4 text-sm">
                              <div className={`p-2 rounded ${scenario.results.rtoMet ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                RTO: {scenario.results.rtoMet ? 'Met' : 'Not Met'}
                              </div>
                              <div className={`p-2 rounded ${scenario.results.rpoMet ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                RPO: {scenario.results.rpoMet ? 'Met' : 'Not Met'}
                              </div>
                              <div className={`p-2 rounded ${scenario.results.communicationEffective ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                Communication: {scenario.results.communicationEffective ? 'Effective' : 'Issues'}
                              </div>
                              <div className={`p-2 rounded ${scenario.results.regulatoryNotificationTimely ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                Regulatory: {scenario.results.regulatoryNotificationTimely ? 'Timely' : 'Delayed'}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="coordination">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Cross-functional Team Coordination
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {teams.map((team) => (
                  <div key={team.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-medium">{team.teamName}</h4>
                          {team.currentScenario && (
                            <Badge className="bg-orange-100 text-orange-800">
                              Active Scenario
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          Lead: {team.leadName}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Communication: {team.communicationChannel}
                        </p>
                      </div>
                      <Button variant="outline" size="sm">
                        <Settings className="h-3 w-3 mr-1" />
                        Configure
                      </Button>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <h5 className="font-medium mb-2">Team Members</h5>
                        <ul className="text-sm space-y-1">
                          {team.members.map((member, index) => (
                            <li key={index} className="flex items-center gap-2">
                              <Users className="h-3 w-3 text-blue-500" />
                              {member}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h5 className="font-medium mb-2">Key Responsibilities</h5>
                        <ul className="text-sm space-y-1">
                          {team.responsibilities.map((responsibility, index) => (
                            <li key={index} className="flex items-center gap-2">
                              <Target className="h-3 w-3 text-green-500" />
                              {responsibility}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <div className="mt-3">
                      <h5 className="font-medium mb-2">Escalation Path</h5>
                      <div className="flex items-center gap-2 text-sm">
                        {team.escalationPath.map((role, index) => (
                          <React.Fragment key={index}>
                            <span className="px-2 py-1 bg-muted rounded">{role}</span>
                            {index < team.escalationPath.length - 1 && <span>→</span>}
                          </React.Fragment>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="execution">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Real-time Scenario Execution Monitoring
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Alert className="mb-4">
                <Zap className="h-4 w-4" />
                <AlertDescription>
                  Live monitoring and coordination during scenario test execution with real-time metrics and communication tracking.
                </AlertDescription>
              </Alert>
              
              <div className="text-center py-8 text-muted-foreground">
                <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Real-time Execution Dashboard</p>
                <p className="text-sm">Live scenario monitoring and coordination tools available during active test execution</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analysis">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Post-test Analysis & Improvement Tracking
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {executions.filter(e => e.status === 'completed').map((execution) => {
                  const scenario = scenarios.find(s => s.id === execution.scenarioId);
                  return (
                    <div key={execution.id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-medium">{scenario?.scenarioName}</h4>
                          <p className="text-sm text-muted-foreground">
                            Executed: {execution.executionDate} | Coordinator: {execution.coordinator}
                          </p>
                        </div>
                        <Button variant="outline" size="sm">
                          <FileText className="h-3 w-3 mr-1" />
                          Full Report
                        </Button>
                      </div>

                      <div className="grid gap-4 md:grid-cols-2">
                        <div>
                          <h5 className="font-medium mb-2">Real-time Metrics</h5>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span>Response Time:</span>
                              <span className="font-medium">{execution.realTimeMetrics.responseTime} minutes</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Communication Delay:</span>
                              <span className="font-medium">{execution.realTimeMetrics.communicationDelay} minutes</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Decisions Made:</span>
                              <span className="font-medium">{execution.realTimeMetrics.decisionsToRestore}</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Stakeholders Notified:</span>
                              <span className="font-medium">{execution.realTimeMetrics.stakeholdersNotified}</span>
                            </div>
                          </div>
                        </div>
                        <div>
                          <h5 className="font-medium mb-2">Key Lessons Learned</h5>
                          <ul className="text-sm space-y-1">
                            {execution.lessons.map((lesson, index) => (
                              <li key={index} className="flex items-start gap-2">
                                <AlertTriangle className="h-3 w-3 text-yellow-500 mt-0.5 flex-shrink-0" />
                                {lesson}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      <div className="mt-4">
                        <h5 className="font-medium mb-2">Improvement Actions</h5>
                        <ul className="text-sm space-y-1">
                          {execution.improvements.map((improvement, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <TrendingUp className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                              {improvement}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}