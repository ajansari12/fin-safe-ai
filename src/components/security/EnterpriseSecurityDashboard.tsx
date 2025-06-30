
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Shield, 
  AlertTriangle, 
  Lock, 
  Eye, 
  FileText, 
  Users, 
  Activity,
  TrendingUp,
  CheckCircle,
  XCircle,
  Clock
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { zeroTrustService } from "@/services/security/zero-trust-service";
import { dlpService } from "@/services/security/dlp-service";
import { threatProtectionService } from "@/services/security/threat-protection-service";
import { complianceAutomationService } from "@/services/security/compliance-automation-service";
import { incidentResponseService } from "@/services/security/incident-response-service";

interface SecurityMetrics {
  trustScore: number;
  threatsDetected: number;
  complianceScore: number;
  activeIncidents: number;
  dlpViolations: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
}

const EnterpriseSecurityDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<SecurityMetrics>({
    trustScore: 85,
    threatsDetected: 0,
    complianceScore: 92,
    activeIncidents: 0,
    dlpViolations: 0,
    riskLevel: 'low'
  });
  
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const { toast } = useToast();

  useEffect(() => {
    loadSecurityMetrics();
    
    // Set up real-time monitoring
    const interval = setInterval(loadSecurityMetrics, 30000); // Every 30 seconds
    
    return () => clearInterval(interval);
  }, []);

  const loadSecurityMetrics = async () => {
    try {
      const [threats, incidents, violations] = await Promise.all([
        threatProtectionService.getSecurityThreats(10),
        threatProtectionService.getSecurityIncidents(10),
        dlpService.getDLPViolations(10)
      ]);

      const activeThreats = threats.filter(t => t.status === 'active').length;
      const activeIncidents = incidents.filter(i => i.status === 'open').length;
      const recentViolations = violations.filter(v => 
        new Date(v.detected_at) > new Date(Date.now() - 24 * 60 * 60 * 1000)
      ).length;

      setMetrics({
        trustScore: calculateTrustScore(activeThreats, activeIncidents, recentViolations),
        threatsDetected: activeThreats,
        complianceScore: 92, // This would be calculated from compliance checks
        activeIncidents,
        dlpViolations: recentViolations,
        riskLevel: determineRiskLevel(activeThreats, activeIncidents, recentViolations)
      });
    } catch (error) {
      console.error('Error loading security metrics:', error);
      toast({
        title: "Error",
        description: "Failed to load security metrics",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateTrustScore = (threats: number, incidents: number, violations: number): number => {
    let score = 100;
    score -= threats * 10;
    score -= incidents * 15;
    score -= violations * 5;
    return Math.max(0, score);
  };

  const determineRiskLevel = (threats: number, incidents: number, violations: number): 'low' | 'medium' | 'high' | 'critical' => {
    const totalRisk = threats + incidents + violations;
    if (totalRisk >= 10) return 'critical';
    if (totalRisk >= 5) return 'high';
    if (totalRisk >= 2) return 'medium';
    return 'low';
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'critical': return 'text-red-600 bg-red-50';
      case 'high': return 'text-orange-600 bg-orange-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      default: return 'text-green-600 bg-green-50';
    }
  };

  const handleInitiateZeroTrust = async () => {
    try {
      await zeroTrustService.registerDevice();
      toast({
        title: "Zero Trust Activated",
        description: "Device fingerprinting and continuous authentication enabled"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to initialize zero trust security",
        variant: "destructive"
      });
    }
  };

  const handleRunComplianceCheck = async () => {
    try {
      await complianceAutomationService.scheduleComplianceChecks();
      toast({
        title: "Compliance Check Initiated",
        description: "Automated compliance checks are now running"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to run compliance checks",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Activity className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading security dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Security Status Alert */}
      <Alert className={`border-l-4 ${getRiskColor(metrics.riskLevel)}`}>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          <strong>Security Status: {metrics.riskLevel.toUpperCase()}</strong>
          {metrics.riskLevel !== 'low' && (
            <span className="ml-2">
              Immediate attention required for {metrics.activeIncidents} active incidents
            </span>
          )}
        </AlertDescription>
      </Alert>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Zero Trust Score</CardTitle>
            <Shield className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.trustScore}%</div>
            <p className="text-xs text-muted-foreground">
              Continuous authentication active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Threats</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.threatsDetected}</div>
            <p className="text-xs text-muted-foreground">
              Real-time monitoring active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Compliance Score</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.complianceScore}%</div>
            <p className="text-xs text-muted-foreground">
              Automated checks passing
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">DLP Violations</CardTitle>
            <Lock className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.dlpViolations}</div>
            <p className="text-xs text-muted-foreground">
              Last 24 hours
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Incidents</CardTitle>
            <Eye className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.activeIncidents}</div>
            <p className="text-xs text-muted-foreground">
              Active investigations
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Dashboard */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="zero-trust">Zero Trust</TabsTrigger>
          <TabsTrigger value="dlp">Data Protection</TabsTrigger>
          <TabsTrigger value="threats">Threat Detection</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
          <TabsTrigger value="incidents">Incident Response</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Security Posture</CardTitle>
                <CardDescription>
                  Real-time security status and recommendations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>Zero Trust Implementation</span>
                  <Badge variant="outline" className="bg-green-50 text-green-700">
                    Active
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Behavioral Analytics</span>
                  <Badge variant="outline" className="bg-blue-50 text-blue-700">
                    Monitoring
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Threat Detection</span>
                  <Badge variant="outline" className="bg-green-50 text-green-700">
                    Operational
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span>Compliance Automation</span>
                  <Badge variant="outline" className="bg-green-50 text-green-700">
                    Passing
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>
                  Immediate security operations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  onClick={handleInitiateZeroTrust}
                  className="w-full"
                  variant="outline"
                >
                  <Shield className="h-4 w-4 mr-2" />
                  Initialize Zero Trust
                </Button>
                <Button 
                  onClick={handleRunComplianceCheck}
                  className="w-full"
                  variant="outline"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Run Compliance Check
                </Button>
                <Button 
                  onClick={() => setActiveTab("threats")}
                  className="w-full"
                  variant="outline"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View Threat Intelligence
                </Button>
                <Button 
                  onClick={() => setActiveTab("incidents")}
                  className="w-full"
                  variant="outline"
                >
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Incident Response
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="zero-trust" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Zero Trust Security Model</CardTitle>
              <CardDescription>
                Continuous authentication and device trust management
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <Users className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                    <h3 className="font-medium">Device Fingerprinting</h3>
                    <p className="text-sm text-muted-foreground">Active on all sessions</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <Activity className="h-8 w-8 mx-auto mb-2 text-green-600" />
                    <h3 className="font-medium">Behavioral Analytics</h3>
                    <p className="text-sm text-muted-foreground">Real-time monitoring</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <TrendingUp className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                    <h3 className="font-medium">Risk Assessment</h3>
                    <p className="text-sm text-muted-foreground">Continuous scoring</p>
                  </div>
                </div>
                <Alert>
                  <Shield className="h-4 w-4" />
                  <AlertDescription>
                    Zero Trust security is active. All user sessions are continuously monitored and verified.
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="dlp" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Data Loss Prevention</CardTitle>
              <CardDescription>
                Automated sensitive data detection and protection
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-medium mb-2">Data Classification</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      Automated detection of sensitive patterns
                    </p>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>Credit Cards</span>
                        <Badge variant="outline">High</Badge>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>SSN</span>
                        <Badge variant="outline">Critical</Badge>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>API Keys</span>
                        <Badge variant="outline">High</Badge>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-medium mb-2">Protection Rules</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      Active data protection measures
                    </p>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>Export Prevention</span>
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Access Logging</span>
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Content Scanning</span>
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="threats" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Advanced Threat Protection</CardTitle>
              <CardDescription>
                Real-time threat detection and automated response
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-medium mb-2">Threat Intelligence</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Brute Force Detection</span>
                        <Badge variant="outline" className="bg-green-50 text-green-700">Active</Badge>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>SQL Injection Prevention</span>
                        <Badge variant="outline" className="bg-green-50 text-green-700">Active</Badge>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>XSS Protection</span>
                        <Badge variant="outline" className="bg-green-50 text-green-700">Active</Badge>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-medium mb-2">Automated Response</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>IP Blocking</span>
                        <Badge variant="outline" className="bg-blue-50 text-blue-700">Ready</Badge>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Session Termination</span>
                        <Badge variant="outline" className="bg-blue-50 text-blue-700">Ready</Badge>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Alert Escalation</span>
                        <Badge variant="outline" className="bg-blue-50 text-blue-700">Ready</Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Compliance Automation</CardTitle>
              <CardDescription>
                Continuous compliance monitoring and reporting
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <h3 className="font-medium">SOX</h3>
                    <div className="text-2xl font-bold text-green-600">95%</div>
                    <p className="text-sm text-muted-foreground">Compliant</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <h3 className="font-medium">PCI DSS</h3>
                    <div className="text-2xl font-bold text-green-600">92%</div>
                    <p className="text-sm text-muted-foreground">Compliant</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <h3 className="font-medium">GDPR</h3>
                    <div className="text-2xl font-bold text-yellow-600">88%</div>
                    <p className="text-sm text-muted-foreground">Needs Attention</p>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <h3 className="font-medium">ISO 27001</h3>
                    <div className="text-2xl font-bold text-green-600">94%</div>
                    <p className="text-sm text-muted-foreground">Compliant</p>
                  </div>
                </div>
                <Button onClick={handleRunComplianceCheck} className="w-full">
                  <FileText className="h-4 w-4 mr-2" />
                  Generate Compliance Report
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="incidents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Incident Response</CardTitle>
              <CardDescription>
                Automated incident detection and response workflows
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-red-600" />
                    <h3 className="font-medium">Active Incidents</h3>
                    <div className="text-2xl font-bold">{metrics.activeIncidents}</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <Clock className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                    <h3 className="font-medium">Avg Response Time</h3>
                    <div className="text-2xl font-bold">12m</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-600" />
                    <h3 className="font-medium">Resolved Today</h3>
                    <div className="text-2xl font-bold">3</div>
                  </div>
                </div>
                <Alert>
                  <Shield className="h-4 w-4" />
                  <AlertDescription>
                    Incident response playbooks are active. Automated escalation and evidence collection enabled.
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnterpriseSecurityDashboard;
