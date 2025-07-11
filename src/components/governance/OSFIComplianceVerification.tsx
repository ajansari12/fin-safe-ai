import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  CheckCircle, 
  AlertCircle, 
  XCircle, 
  FileText, 
  TrendingUp, 
  Shield, 
  Clock,
  Download,
  Eye,
  RefreshCw
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ComplianceItem {
  id: string;
  principle: string;
  requirement: string;
  status: 'compliant' | 'partial' | 'non_compliant';
  evidence: string;
  lastAssessment: string;
  nextReview: string;
  riskLevel: 'low' | 'medium' | 'high';
}

const OSFIComplianceVerification = () => {
  const [complianceData, setComplianceData] = useState<ComplianceItem[]>([]);
  const [overallScore, setOverallScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [generatingReport, setGeneratingReport] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadComplianceData();
  }, []);

  const loadComplianceData = async () => {
    try {
      // Simulate comprehensive compliance verification
      const mockData: ComplianceItem[] = [
        {
          id: "1",
          principle: "Principle 1",
          requirement: "Senior Management Oversight",
          status: "compliant",
          evidence: "Board resolutions, management policies",
          lastAssessment: "2024-07-01",
          nextReview: "2024-10-01",
          riskLevel: "low"
        },
        {
          id: "2", 
          principle: "Principle 2",
          requirement: "Operational Resilience Management",
          status: "compliant",
          evidence: "Risk management framework, policies",
          lastAssessment: "2024-07-05",
          nextReview: "2024-10-05",
          riskLevel: "low"
        },
        {
          id: "3",
          principle: "Principle 3", 
          requirement: "Business Environment Analysis",
          status: "partial",
          evidence: "Environmental analysis reports",
          lastAssessment: "2024-06-15",
          nextReview: "2024-09-15",
          riskLevel: "medium"
        },
        {
          id: "4",
          principle: "Principle 4",
          requirement: "Risk Identification & Assessment",
          status: "compliant",
          evidence: "Risk registers, assessment reports",
          lastAssessment: "2024-07-10",
          nextReview: "2024-10-10",
          riskLevel: "low"
        },
        {
          id: "5",
          principle: "Principle 5",
          requirement: "Risk Appetite & Tolerance",
          status: "compliant",
          evidence: "Risk appetite statements, metrics",
          lastAssessment: "2024-07-08",
          nextReview: "2024-10-08",
          riskLevel: "low"
        },
        {
          id: "6",
          principle: "Principle 6",
          requirement: "Operational Risk Management",
          status: "compliant",
          evidence: "ORM framework, procedures",
          lastAssessment: "2024-07-12",
          nextReview: "2024-10-12",
          riskLevel: "low"
        },
        {
          id: "7",
          principle: "Principle 7",
          requirement: "Impact Tolerance & Disruption Thresholds",
          status: "compliant",
          evidence: "Tolerance definitions, monitoring",
          lastAssessment: "2024-07-11",
          nextReview: "2024-10-11",
          riskLevel: "low"
        },
        {
          id: "8",
          principle: "Principle 8",
          requirement: "Scenario Testing & Planning",
          status: "compliant",
          evidence: "Testing reports, scenarios",
          lastAssessment: "2024-07-09",
          nextReview: "2024-10-09",
          riskLevel: "low"
        }
      ];

      setComplianceData(mockData);
      
      // Calculate overall compliance score
      const compliantCount = mockData.filter(item => item.status === 'compliant').length;
      const partialCount = mockData.filter(item => item.status === 'partial').length;
      const score = ((compliantCount + (partialCount * 0.5)) / mockData.length) * 100;
      setOverallScore(Math.round(score));
      
    } catch (error) {
      console.error('Error loading compliance data:', error);
      toast({
        title: "Error",
        description: "Failed to load compliance data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const generateComplianceReport = async () => {
    setGeneratingReport(true);
    try {
      // Simulate report generation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Report Generated",
        description: "OSFI E-21 compliance report has been generated successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate compliance report",
        variant: "destructive"
      });
    } finally {
      setGeneratingReport(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'compliant':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'partial':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case 'non_compliant':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      compliant: "default",
      partial: "secondary", 
      non_compliant: "destructive"
    } as const;
    
    return (
      <Badge variant={variants[status as keyof typeof variants] || "outline"}>
        {status.replace('_', ' ')}
      </Badge>
    );
  };

  const getRiskBadge = (risk: string) => {
    const variants = {
      low: "default",
      medium: "secondary",
      high: "destructive"
    } as const;
    
    return (
      <Badge variant={variants[risk as keyof typeof variants] || "outline"}>
        {risk} risk
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">OSFI E-21 Compliance Verification</h2>
          <p className="text-muted-foreground">
            Comprehensive compliance assessment and verification dashboard
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={generateComplianceReport} disabled={generatingReport}>
            {generatingReport ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Download className="h-4 w-4 mr-2" />
            )}
            Generate Report
          </Button>
        </div>
      </div>

      {/* Overall Compliance Score */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Overall Compliance Score
          </CardTitle>
          <CardDescription>
            Current compliance status across all OSFI E-21 principles
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-2xl font-bold">{overallScore}%</span>
            <Badge variant={overallScore >= 90 ? "default" : overallScore >= 70 ? "secondary" : "destructive"}>
              {overallScore >= 90 ? "Excellent" : overallScore >= 70 ? "Good" : "Needs Improvement"}
            </Badge>
          </div>
          <Progress value={overallScore} className="w-full" />
          <div className="grid grid-cols-3 gap-4 pt-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {complianceData.filter(item => item.status === 'compliant').length}
              </div>
              <div className="text-sm text-muted-foreground">Compliant</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {complianceData.filter(item => item.status === 'partial').length}
              </div>
              <div className="text-sm text-muted-foreground">Partial</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {complianceData.filter(item => item.status === 'non_compliant').length}
              </div>
              <div className="text-sm text-muted-foreground">Non-Compliant</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="principles" className="space-y-4">
        <TabsList>
          <TabsTrigger value="principles">Principles Overview</TabsTrigger>
          <TabsTrigger value="evidence">Evidence Repository</TabsTrigger>
          <TabsTrigger value="timeline">Review Timeline</TabsTrigger>
          <TabsTrigger value="actions">Action Items</TabsTrigger>
        </TabsList>

        <TabsContent value="principles" className="space-y-4">
          <div className="grid gap-4">
            {complianceData.map((item) => (
              <Card key={item.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      {getStatusIcon(item.status)}
                      {item.principle}: {item.requirement}
                    </CardTitle>
                    <div className="flex gap-2">
                      {getStatusBadge(item.status)}
                      {getRiskBadge(item.riskLevel)}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Evidence:</span>
                      <p className="text-muted-foreground">{item.evidence}</p>
                    </div>
                    <div>
                      <span className="font-medium">Last Assessment:</span>
                      <p className="text-muted-foreground">{item.lastAssessment}</p>
                    </div>
                    <div>
                      <span className="font-medium">Next Review:</span>
                      <p className="text-muted-foreground">{item.nextReview}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="evidence" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Evidence Repository
              </CardTitle>
              <CardDescription>
                Documentation and evidence supporting compliance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <FileText className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                        <div className="text-2xl font-bold">24</div>
                        <div className="text-sm text-muted-foreground">Policy Documents</div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <TrendingUp className="h-8 w-8 mx-auto mb-2 text-green-500" />
                        <div className="text-2xl font-bold">156</div>
                        <div className="text-sm text-muted-foreground">Assessment Reports</div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-6">
                      <div className="text-center">
                        <Shield className="h-8 w-8 mx-auto mb-2 text-purple-500" />
                        <div className="text-2xl font-bold">89</div>
                        <div className="text-sm text-muted-foreground">Test Results</div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timeline" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Review Timeline
              </CardTitle>
              <CardDescription>
                Upcoming reviews and assessment schedules
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {complianceData
                  .sort((a, b) => new Date(a.nextReview).getTime() - new Date(b.nextReview).getTime())
                  .slice(0, 5)
                  .map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <div className="font-medium">{item.principle}</div>
                        <div className="text-sm text-muted-foreground">{item.requirement}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{item.nextReview}</div>
                        <div className="text-sm text-muted-foreground">Next Review</div>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="actions" className="space-y-4">
          <div className="grid gap-4">
            {complianceData
              .filter(item => item.status !== 'compliant')
              .map((item) => (
                <Alert key={item.id}>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="flex items-center justify-between">
                      <div>
                        <strong>{item.principle}</strong>: {item.requirement} requires attention.
                        <br />
                        <span className="text-sm">Last assessed: {item.lastAssessment}</span>
                      </div>
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                    </div>
                  </AlertDescription>
                </Alert>
              ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default OSFIComplianceVerification;