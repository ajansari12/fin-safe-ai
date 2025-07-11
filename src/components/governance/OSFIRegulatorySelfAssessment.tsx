import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Textarea } from "@/components/ui/textarea";
import { 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  FileText, 
  Download,
  Save,
  Eye,
  Target
} from "lucide-react";

interface OSFIPrinciple {
  id: string;
  number: number;
  title: string;
  description: string;
  requirements: string[];
  complianceStatus: 'compliant' | 'partially-compliant' | 'non-compliant' | 'not-assessed';
  evidenceCount: number;
  lastAssessment: string;
  nextReview: string;
  gaps: string[];
  recommendations: string[];
}

interface ComplianceEvidence {
  id: string;
  principleId: string;
  type: 'policy' | 'procedure' | 'control' | 'report' | 'training';
  title: string;
  description: string;
  dateCreated: string;
  status: 'current' | 'needs-update' | 'expired';
}

export default function OSFIRegulatorySelfAssessment() {
  const [selectedPrinciple, setSelectedPrinciple] = useState<string>("1");
  const [assessmentNotes, setAssessmentNotes] = useState<{[key: string]: string}>({});

  // OSFI E-21 Principles data
  const osfiPrinciples: OSFIPrinciple[] = [
    {
      id: "1",
      number: 1,
      title: "Governance",
      description: "Effective governance with senior management oversight, documentation, resource allocation, culture, and independent assurance",
      requirements: [
        "Board oversight of operational resilience",
        "Senior management accountability",
        "Clear roles and responsibilities",
        "Three lines of defense implementation",
        "Independent assurance framework"
      ],
      complianceStatus: "partially-compliant",
      evidenceCount: 12,
      lastAssessment: "2024-06-15",
      nextReview: "2024-09-15",
      gaps: [
        "Board oversight dashboard needs enhancement",
        "Independent assurance coverage gaps identified"
      ],
      recommendations: [
        "Implement enhanced board reporting dashboard",
        "Increase third-line assurance coverage to 85%"
      ]
    },
    {
      id: "2",
      number: 2,
      title: "Framework", 
      description: "Enterprise-wide framework with policies, risk taxonomy, and regular reviews",
      requirements: [
        "Comprehensive operational risk framework",
        "Risk taxonomy aligned with OSFI definitions",
        "Policy management and lifecycle",
        "Regular framework effectiveness reviews",
        "Integration with business strategy"
      ],
      complianceStatus: "compliant",
      evidenceCount: 18,
      lastAssessment: "2024-06-20",
      nextReview: "2024-09-20", 
      gaps: [],
      recommendations: [
        "Continue quarterly framework effectiveness reviews"
      ]
    },
    {
      id: "3",
      number: 3,
      title: "Risk Appetite",
      description: "Defined appetite statement with qualitative/quantitative limits, forward-looking, integrated framework",
      requirements: [
        "Board-approved risk appetite statement",
        "Quantitative risk limits and thresholds",
        "Forward-looking risk assessment",
        "Integration with business planning",
        "Regular appetite review and calibration"
      ],
      complianceStatus: "partially-compliant",
      evidenceCount: 8,
      lastAssessment: "2024-06-01",
      nextReview: "2024-08-01",
      gaps: [
        "Forward-looking risk appetite metrics need development",
        "Integration with strategic planning requires enhancement"
      ],
      recommendations: [
        "Develop predictive risk appetite indicators",
        "Enhance integration with annual strategic planning cycle"
      ]
    },
    {
      id: "4",
      number: 4,
      title: "Identification & Assessment",
      description: "Use tools like risk/control assessments, KRIs, event data, scenario analysis",
      requirements: [
        "Risk and control self-assessments (RCSA)",
        "Key risk indicators (KRI) framework",
        "Loss event data collection and analysis",
        "Scenario analysis and stress testing",
        "Root cause analysis capabilities"
      ],
      complianceStatus: "compliant",
      evidenceCount: 25,
      lastAssessment: "2024-06-10",
      nextReview: "2024-09-10",
      gaps: [],
      recommendations: [
        "Enhance scenario analysis with AI/ML capabilities"
      ]
    },
    {
      id: "5",
      number: 5,
      title: "Monitoring & Reporting",
      description: "Continuous monitoring, escalation, reporting to board/senior management",
      requirements: [
        "Real-time operational risk monitoring",
        "Automated escalation procedures",
        "Regular management reporting",
        "Board-level operational resilience reporting",
        "Regulatory reporting capabilities"
      ],
      complianceStatus: "partially-compliant",
      evidenceCount: 15,
      lastAssessment: "2024-06-05",
      nextReview: "2024-08-05",
      gaps: [
        "Real-time monitoring needs automation",
        "Board reporting format requires standardization"
      ],
      recommendations: [
        "Implement automated real-time monitoring dashboard",
        "Standardize quarterly board reporting template"
      ]
    },
    {
      id: "6",
      number: 6,
      title: "Critical Operations",
      description: "Identify/map critical operations and dependencies (people, tech, processes)",
      requirements: [
        "Critical operations identification methodology",
        "End-to-end process mapping",
        "Dependency analysis and documentation", 
        "Impact assessment for critical operations",
        "Regular critical operations review"
      ],
      complianceStatus: "compliant",
      evidenceCount: 22,
      lastAssessment: "2024-06-12",
      nextReview: "2024-09-12",
      gaps: [],
      recommendations: [
        "Automate dependency monitoring for critical operations"
      ]
    },
    {
      id: "7",
      number: 7,
      title: "Tolerances for Disruption",
      description: "Set maximum disruption levels for critical operations under severe scenarios",
      requirements: [
        "Recovery time objectives (RTO) for critical operations",
        "Recovery point objectives (RPO) definition",
        "Impact tolerance thresholds",
        "Severe scenario impact analysis",
        "Regular tolerance calibration"
      ],
      complianceStatus: "non-compliant",
      evidenceCount: 6,
      lastAssessment: "2024-05-30",
      nextReview: "2024-07-30",
      gaps: [
        "RTO/RPO not defined for all critical operations",
        "Severe scenario impact analysis incomplete",
        "Tolerance thresholds need board approval"
      ],
      recommendations: [
        "Complete RTO/RPO definition for all critical operations",
        "Conduct comprehensive severe scenario analysis",
        "Obtain board approval for tolerance framework"
      ]
    },
    {
      id: "8",
      number: 8,
      title: "Scenario Testing",
      description: "Regular testing of resilience using severe-but-plausible scenarios",
      requirements: [
        "Severe-but-plausible scenario development",
        "Regular scenario testing schedule",
        "Cross-functional testing coordination",
        "Post-test analysis and improvement",
        "Integration with business continuity planning"
      ],
      complianceStatus: "partially-compliant",
      evidenceCount: 10,
      lastAssessment: "2024-06-08",
      nextReview: "2024-08-08",
      gaps: [
        "Scenario testing frequency needs increase",
        "Cross-functional coordination requires improvement"
      ],
      recommendations: [
        "Implement quarterly scenario testing program",
        "Establish scenario testing steering committee"
      ]
    }
  ];

  const getComplianceColor = (status: string) => {
    switch (status) {
      case 'compliant':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'partially-compliant':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'non-compliant':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'not-assessed':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getComplianceIcon = (status: string) => {
    switch (status) {
      case 'compliant':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'partially-compliant':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'non-compliant':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'not-assessed':
        return <Eye className="h-4 w-4 text-gray-600" />;
      default:
        return null;
    }
  };

  const calculateOverallCompliance = () => {
    const compliant = osfiPrinciples.filter(p => p.complianceStatus === 'compliant').length;
    const partiallyCompliant = osfiPrinciples.filter(p => p.complianceStatus === 'partially-compliant').length;
    const total = osfiPrinciples.length;
    
    return Math.round(((compliant + (partiallyCompliant * 0.5)) / total) * 100);
  };

  const selectedPrincipleData = osfiPrinciples.find(p => p.id === selectedPrinciple);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">OSFI E-21 Self-Assessment</h2>
          <p className="text-muted-foreground">
            Comprehensive self-assessment against OSFI E-21 operational resilience principles
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{calculateOverallCompliance()}%</div>
            <div className="text-sm text-muted-foreground">Overall Compliance</div>
          </div>
          <Button variant="outline" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export Assessment
          </Button>
        </div>
      </div>

      <Alert>
        <FileText className="h-4 w-4" />
        <AlertDescription>
          <strong>Regulatory Self-Assessment:</strong> This assessment tool supports OSFI E-21 compliance monitoring 
          and is designed to help FRFIs evaluate their operational resilience framework. 
          This is not regulatory advice - consult OSFI for official compliance guidance.
        </AlertDescription>
      </Alert>

      <div className="grid gap-6 lg:grid-cols-1 xl:grid-cols-3">
        {/* Principles Overview */}
        <div className="xl:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                OSFI E-21 Principles
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {osfiPrinciples.map((principle) => (
                  <div 
                    key={principle.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-all hover:shadow-sm ${
                      selectedPrinciple === principle.id ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => setSelectedPrinciple(principle.id)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">
                          Principle {principle.number}
                        </span>
                        {getComplianceIcon(principle.complianceStatus)}
                      </div>
                      <Badge className={getComplianceColor(principle.complianceStatus)}>
                        {principle.complianceStatus.replace('-', ' ')}
                      </Badge>
                    </div>
                    <div className="font-medium text-sm mb-1">{principle.title}</div>
                    <div className="text-xs text-muted-foreground">
                      {principle.evidenceCount} evidence items • Next review: {principle.nextReview}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detailed Assessment */}
        <div className="xl:col-span-2">
          {selectedPrincipleData && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span>Principle {selectedPrincipleData.number}: {selectedPrincipleData.title}</span>
                  <Badge className={getComplianceColor(selectedPrincipleData.complianceStatus)}>
                    {selectedPrincipleData.complianceStatus.replace('-', ' ')}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="requirements" className="space-y-4">
                  <TabsList>
                    <TabsTrigger value="requirements">Requirements</TabsTrigger>
                    <TabsTrigger value="gaps">Gaps & Actions</TabsTrigger>
                    <TabsTrigger value="evidence">Evidence</TabsTrigger>
                    <TabsTrigger value="assessment">Assessment Notes</TabsTrigger>
                  </TabsList>

                  <TabsContent value="requirements" className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Principle Description</h4>
                      <p className="text-sm text-muted-foreground mb-4">
                        {selectedPrincipleData.description}
                      </p>
                      
                      <h4 className="font-medium mb-2">Key Requirements</h4>
                      <div className="space-y-2">
                        {selectedPrincipleData.requirements.map((req, index) => (
                          <div key={index} className="flex items-center gap-2 text-sm">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            {req}
                          </div>
                        ))}
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="gaps" className="space-y-4">
                    {selectedPrincipleData.gaps.length > 0 ? (
                      <div>
                        <h4 className="font-medium mb-2 text-red-700">Identified Gaps</h4>
                        <div className="space-y-2 mb-4">
                          {selectedPrincipleData.gaps.map((gap, index) => (
                            <div key={index} className="flex items-start gap-2 text-sm">
                              <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5" />
                              {gap}
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <CheckCircle className="h-8 w-8 text-green-500 mx-auto mb-2" />
                        <div className="font-medium text-green-700">No gaps identified</div>
                        <div className="text-sm text-muted-foreground">
                          This principle is fully compliant with current requirements
                        </div>
                      </div>
                    )}

                    {selectedPrincipleData.recommendations.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2">Recommendations</h4>
                        <div className="space-y-2">
                          {selectedPrincipleData.recommendations.map((rec, index) => (
                            <div key={index} className="flex items-start gap-2 text-sm">
                              <Target className="h-4 w-4 text-blue-500 mt-0.5" />
                              {rec}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="evidence" className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Supporting Evidence</h4>
                      <Badge variant="outline">
                        {selectedPrincipleData.evidenceCount} items
                      </Badge>
                    </div>
                    <div className="text-center py-8 text-muted-foreground">
                      Evidence management system integration coming soon
                    </div>
                  </TabsContent>

                  <TabsContent value="assessment" className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Assessment Notes</h4>
                      <Textarea
                        placeholder="Add detailed assessment notes, observations, and action items..."
                        value={assessmentNotes[selectedPrincipleData.id] || ''}
                        onChange={(e) => 
                          setAssessmentNotes(prev => ({
                            ...prev,
                            [selectedPrincipleData.id]: e.target.value
                          }))
                        }
                        className="min-h-[120px]"
                      />
                      <div className="flex justify-end mt-2">
                        <Button size="sm" className="flex items-center gap-2">
                          <Save className="h-4 w-4" />
                          Save Notes
                        </Button>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="grid gap-4 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {osfiPrinciples.filter(p => p.complianceStatus === 'compliant').length}
              </div>
              <div className="text-sm text-muted-foreground">Fully Compliant</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {osfiPrinciples.filter(p => p.complianceStatus === 'partially-compliant').length}
              </div>
              <div className="text-sm text-muted-foreground">Partially Compliant</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {osfiPrinciples.filter(p => p.complianceStatus === 'non-compliant').length}
              </div>
              <div className="text-sm text-muted-foreground">Non-Compliant</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {osfiPrinciples.reduce((sum, p) => sum + p.evidenceCount, 0)}
              </div>
              <div className="text-sm text-muted-foreground">Evidence Items</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}