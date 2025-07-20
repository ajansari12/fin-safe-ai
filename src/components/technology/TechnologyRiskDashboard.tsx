
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Shield, 
  AlertTriangle, 
  Server, 
  Bug, 
  Activity,
  TrendingUp,
  Users,
  Clock,
  CheckCircle,
  XCircle
} from "lucide-react";
import ITAssetInventory from "./ITAssetInventory";
import VulnerabilityManagement from "./VulnerabilityManagement";
import CyberIncidentResponse from "./CyberIncidentResponse";
import ThreatIntelligence from "./ThreatIntelligence";
import CyberResilienceMetrics from "./CyberResilienceMetrics";

const TechnologyRiskDashboard = () => {
  const [activeTab, setActiveTab] = useState("dashboard");

  // Mock data for dashboard metrics
  const dashboardMetrics = {
    totalAssets: 1247,
    criticalAssets: 89,
    vulnerabilities: {
      critical: 5,
      high: 23,
      medium: 167,
      low: 89
    },
    incidents: {
      open: 3,
      investigating: 2,
      resolved: 45
    },
    complianceScore: 87,
    riskScore: 6.2
  };

  const recentIncidents = [
    {
      id: "INC-2024-001",
      type: "Phishing",
      severity: "High",
      status: "Investigating",
      date: "2024-01-15",
      assignee: "Security Team"
    },
    {
      id: "INC-2024-002", 
      type: "Malware",
      severity: "Critical",
      status: "Contained",
      date: "2024-01-14",
      assignee: "IR Team"
    }
  ];

  const criticalVulnerabilities = [
    {
      id: "CVE-2024-0001",
      title: "Remote Code Execution in Web Server",
      cvssScore: 9.8,
      affectedAssets: 12,
      daysOpen: 3
    },
    {
      id: "CVE-2024-0002",
      title: "SQL Injection in Database Layer", 
      cvssScore: 8.9,
      affectedAssets: 5,
      daysOpen: 7
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Technology & Cyber Risk Management</h1>
          <p className="text-muted-foreground">
            Comprehensive IT asset management, vulnerability assessment, and cyber resilience
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            <Shield className="h-3 w-3 mr-1" />
            Compliance Score: {dashboardMetrics.complianceScore}%
          </Badge>
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            <Activity className="h-3 w-3 mr-1" />
            Risk Score: {dashboardMetrics.riskScore}/10
          </Badge>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="assets" className="flex items-center gap-2">
            <Server className="h-4 w-4" />
            IT Assets
          </TabsTrigger>
          <TabsTrigger value="vulnerabilities" className="flex items-center gap-2">
            <Bug className="h-4 w-4" />
            Vulnerabilities
          </TabsTrigger>
          <TabsTrigger value="incidents" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Incidents
          </TabsTrigger>
          <TabsTrigger value="threats" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Threats
          </TabsTrigger>
          <TabsTrigger value="metrics" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Metrics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-6">
          {/* Key Metrics Cards */}
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Server className="h-4 w-4 text-blue-600" />
                  IT Assets
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardMetrics.totalAssets}</div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span className="text-red-600 font-medium">{dashboardMetrics.criticalAssets}</span>
                  <span>Critical Assets</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Bug className="h-4 w-4 text-orange-600" />
                  Vulnerabilities
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {dashboardMetrics.vulnerabilities.critical}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span className="text-orange-600 font-medium">{dashboardMetrics.vulnerabilities.high}</span>
                  <span>High Severity</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  Open Incidents
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardMetrics.incidents.open}</div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span className="text-blue-600 font-medium">{dashboardMetrics.incidents.investigating}</span>
                  <span>Investigating</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Shield className="h-4 w-4 text-green-600" />
                  Security Score
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {dashboardMetrics.complianceScore}%
                </div>
                <div className="text-sm text-muted-foreground">
                  OSFI E-21 Compliant
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Incidents and Critical Vulnerabilities */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  Recent Security Incidents
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentIncidents.map((incident) => (
                    <div key={incident.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="space-y-1">
                        <div className="font-medium">{incident.id}</div>
                        <div className="text-sm text-muted-foreground">{incident.type}</div>
                        <div className="flex items-center gap-2">
                          <Badge variant={incident.severity === 'Critical' ? 'destructive' : 'secondary'}>
                            {incident.severity}
                          </Badge>
                          <Badge variant="outline">{incident.status}</Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-muted-foreground">{incident.date}</div>
                        <div className="text-sm font-medium">{incident.assignee}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <Button variant="outline" className="w-full mt-4">
                  View All Incidents
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bug className="h-5 w-5 text-orange-600" />
                  Critical Vulnerabilities
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {criticalVulnerabilities.map((vuln) => (
                    <div key={vuln.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="space-y-1">
                        <div className="font-medium">{vuln.id}</div>
                        <div className="text-sm text-muted-foreground">{vuln.title}</div>
                        <div className="flex items-center gap-2">
                          <Badge variant="destructive">CVSS {vuln.cvssScore}</Badge>
                          <Badge variant="outline">{vuln.affectedAssets} Assets</Badge>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {vuln.daysOpen} days
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <Button variant="outline" className="w-full mt-4">
                  View All Vulnerabilities
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Vulnerability Trend Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Vulnerability Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] flex items-center justify-center border-2 border-dashed border-gray-200 rounded-lg">
                <div className="text-center text-muted-foreground">
                  <TrendingUp className="h-12 w-12 mx-auto mb-4" />
                  <p>Vulnerability trend chart will be displayed here</p>
                  <p className="text-sm">Integration with vulnerability scanning tools</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assets" className="space-y-6">
          <ITAssetInventory />
        </TabsContent>

        <TabsContent value="vulnerabilities" className="space-y-6">
          <VulnerabilityManagement />
        </TabsContent>

        <TabsContent value="incidents" className="space-y-6">
          <CyberIncidentResponse />
        </TabsContent>

        <TabsContent value="threats" className="space-y-6">
          <ThreatIntelligence />
        </TabsContent>

        <TabsContent value="metrics" className="space-y-6">
          <CyberResilienceMetrics />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TechnologyRiskDashboard;
