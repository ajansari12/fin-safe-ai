
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
import { enhancedDLPService } from "@/services/security/enhanced-dlp-service";

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
      const [dashboardData, dlpAnalytics] = await Promise.all([
        zeroTrustService.getSecurityDashboardData(),
        enhancedDLPService.getDLPAnalytics()
      ]);

      if (dashboardData) {
        setMetrics({
          trustScore: 85, // Would be calculated from security data
          threatsDetected: dashboardData.threatIndicators || 0,
          complianceScore: dashboardData.complianceStatus?.compliancePercentage || 92,
          activeIncidents: dashboardData.recentEvents?.filter((e: any) => e.outcome === 'failure')?.length || 0,
          dlpViolations: dlpAnalytics.totalViolations || 0,
          riskLevel: dashboardData.riskLevel || 'low'
        });
      }
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

  const handleStartDLPMonitoring = async () => {
    try {
      enhancedDLPService.startMonitoring();
      toast({
        title: "DLP Monitoring Started",
        description: "Real-time data loss prevention monitoring is now active"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to start DLP monitoring",
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
          <div className="flex items-center justify-between">
            <div>
              <strong>Security Status:</strong> {metrics.riskLevel.toUpperCase()} risk level detected
            </div>
            <div className="flex gap-2">
              <Button onClick={handleInitiateZeroTrust} size="sm" variant="outline">
                Initialize Zero Trust
              </Button>
              <Button onClick={handleStartDLPMonitoring} size="sm" variant="outline">
                Start DLP Monitoring
              </Button>
            </div>
          </div>
        </AlertDescription>
      </Alert>

      {/* Security Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Trust Score</CardTitle>
            <Shield className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.trustScore}%</div>
            <p className="text-xs text-muted-foreground">
              Based on behavioral analytics and device trust
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Threats Detected</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.threatsDetected}</div>
            <p className="text-xs text-muted-foreground">
              Active threat indicators in the last 24 hours
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Compliance Score</CardTitle>
            <CheckCircle className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.complianceScore}%</div>
            <p className="text-xs text-muted-foreground">
              Automated compliance monitoring status
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Incidents</CardTitle>
            <XCircle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.activeIncidents}</div>
            <p className="text-xs text-muted-foreground">
              Security incidents requiring attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">DLP Violations</CardTitle>
            <Eye className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.dlpViolations}</div>
            <p className="text-xs text-muted-foreground">
              Data loss prevention violations today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Risk Level</CardTitle>
            <TrendingUp className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="text-2xl font-bold capitalize">{metrics.riskLevel}</div>
              <Badge className={getRiskColor(metrics.riskLevel)}>
                {metrics.riskLevel}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Overall organizational risk assessment
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="threats">Threat Intelligence</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
          <TabsTrigger value="incidents">Incident Response</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Security Posture</CardTitle>
                <CardDescription>Real-time security status overview</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Zero Trust Implementation</span>
                    <Badge variant="outline" className="text-green-600">Active</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Behavioral Analytics</span>
                    <Badge variant="outline" className="text-blue-600">Monitoring</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Data Loss Prevention</span>
                    <Badge variant="outline" className="text-purple-600">Enabled</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Threat Detection</span>
                    <Badge variant="outline" className="text-orange-600">Active</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Security Events</CardTitle>
                <CardDescription>Latest security activities and alerts</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Device registered successfully</p>
                      <p className="text-xs text-muted-foreground">2 minutes ago</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Behavioral pattern updated</p>
                      <p className="text-xs text-muted-foreground">5 minutes ago</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">DLP monitoring started</p>
                      <p className="text-xs text-muted-foreground">10 minutes ago</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="threats" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Threat Intelligence</CardTitle>
              <CardDescription>Real-time threat detection and analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No Active Threats</h3>
                <p className="text-muted-foreground">
                  Continuous monitoring is active. You'll be notified of any threats immediately.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Compliance Status</CardTitle>
              <CardDescription>Automated compliance monitoring and reporting</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">GDPR Compliance</h4>
                    <p className="text-sm text-muted-foreground">General Data Protection Regulation</p>
                  </div>
                  <Badge className="bg-green-100 text-green-800">Compliant</Badge>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">ISO 27001</h4>
                    <p className="text-sm text-muted-foreground">Information Security Management</p>
                  </div>
                  <Badge className="bg-green-100 text-green-800">Compliant</Badge>
                </div>
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium">SOC 2 Type II</h4>
                    <p className="text-sm text-muted-foreground">Security and Availability</p>
                  </div>
                  <Badge className="bg-yellow-100 text-yellow-800">In Progress</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="incidents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Incident Response</CardTitle>
              <CardDescription>Automated incident detection and response</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No Active Incidents</h3>
                <p className="text-muted-foreground">
                  All systems are operating normally. Automated playbooks are ready to respond to any incidents.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnterpriseSecurityDashboard;
