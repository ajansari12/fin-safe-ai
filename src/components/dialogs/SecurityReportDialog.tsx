import React, { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Shield, 
  Download, 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  Users, 
  Database, 
  Lock,
  Eye,
  Activity,
  Key
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SecurityReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const SecurityReportDialog: React.FC<SecurityReportDialogProps> = ({
  open,
  onOpenChange,
}) => {
  const { toast } = useToast();
  const [generating, setGenerating] = useState(false);

  const securityMetrics = {
    overallScore: 87,
    encryption: { status: "enabled", score: 95 },
    accessControl: { status: "active", score: 82 },
    authentication: { status: "enforced", score: 90 },
    compliance: { status: "compliant", score: 85 },
  };

  const vulnerabilities = [
    { id: 1, severity: "medium", title: "Password Policy Weakness", description: "Some users have passwords older than 90 days", affected: 12 },
    { id: 2, severity: "low", title: "Inactive Sessions", description: "Found 5 sessions inactive for more than 30 days", affected: 5 },
    { id: 3, severity: "high", title: "Privileged Access Review", description: "Admin access review overdue by 15 days", affected: 3 },
  ];

  const auditTrail = [
    { timestamp: "2024-01-15 14:30", user: "admin@company.com", action: "Password policy updated", result: "success" },
    { timestamp: "2024-01-15 13:45", user: "security@company.com", action: "Security scan initiated", result: "success" },
    { timestamp: "2024-01-15 12:15", user: "analyst@company.com", action: "Access granted to incident data", result: "success" },
    { timestamp: "2024-01-15 11:30", user: "unknown", action: "Failed login attempt", result: "blocked" },
  ];

  const handleGenerateReport = async () => {
    setGenerating(true);
    try {
      // Simulate report generation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Security Report Generated",
        description: "Comprehensive security report has been generated and downloaded.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate security report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setGenerating(false);
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "high":
        return <Badge variant="destructive">High</Badge>;
      case "medium":
        return <Badge variant="secondary">Medium</Badge>;
      case "low":
        return <Badge variant="outline">Low</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "blocked":
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security Compliance Report
          </DialogTitle>
          <DialogDescription>
            Comprehensive security analysis and compliance status for your organization
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="vulnerabilities">Vulnerabilities</TabsTrigger>
            <TabsTrigger value="compliance">Compliance</TabsTrigger>
            <TabsTrigger value="audit">Audit Trail</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Security Score */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Overall Security Score
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <div className="text-4xl font-bold text-green-600">
                    {securityMetrics.overallScore}%
                  </div>
                  <div className="flex-1">
                    <Progress value={securityMetrics.overallScore} className="h-3" />
                    <p className="text-sm text-muted-foreground mt-2">
                      Your organization has a strong security posture
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Security Categories */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Lock className="h-4 w-4" />
                    Encryption
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <Badge variant="default">Enabled</Badge>
                    <span className="text-2xl font-bold text-green-600">95%</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Eye className="h-4 w-4" />
                    Access Control
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <Badge variant="default">Active</Badge>
                    <span className="text-2xl font-bold text-green-600">82%</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Key className="h-4 w-4" />
                    Authentication
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <Badge variant="default">Enforced</Badge>
                    <span className="text-2xl font-bold text-green-600">90%</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    Compliance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <Badge variant="default">SOC 2</Badge>
                    <span className="text-2xl font-bold text-green-600">85%</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="vulnerabilities" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Security Vulnerabilities</CardTitle>
                <CardDescription>
                  Issues that require attention to maintain security posture
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {vulnerabilities.map((vuln) => (
                    <div key={vuln.id} className="flex items-start gap-4 p-4 border rounded-lg">
                      <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-medium">{vuln.title}</h4>
                          {getSeverityBadge(vuln.severity)}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {vuln.description}
                        </p>
                        <div className="text-xs text-muted-foreground">
                          Affects {vuln.affected} users/items
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        Remediate
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="compliance" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Compliance Status</CardTitle>
                <CardDescription>
                  Current compliance status across security frameworks
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2">SOC 2 Type II</h4>
                      <Badge variant="default">Compliant</Badge>
                      <p className="text-xs text-muted-foreground mt-2">
                        Last audit: Dec 2023
                      </p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2">ISO 27001</h4>
                      <Badge variant="secondary">In Progress</Badge>
                      <p className="text-xs text-muted-foreground mt-2">
                        Target completion: Q2 2024
                      </p>
                    </div>
                    <div className="p-4 border rounded-lg">
                      <h4 className="font-medium mb-2">GDPR</h4>
                      <Badge variant="default">Compliant</Badge>
                      <p className="text-xs text-muted-foreground mt-2">
                        Data processing agreement active
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="audit" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Recent Security Events</CardTitle>
                <CardDescription>
                  Audit trail of recent security-related activities
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {auditTrail.map((event, index) => (
                    <div key={index} className="flex items-center gap-4 p-3 border rounded-lg">
                      {getStatusIcon(event.result)}
                      <div className="flex-1">
                        <div className="font-medium">{event.action}</div>
                        <div className="text-sm text-muted-foreground">
                          {event.user} • {event.timestamp}
                        </div>
                      </div>
                      <Badge variant={event.result === "success" ? "default" : "destructive"}>
                        {event.result}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-between items-center pt-4 border-t">
          <div className="text-sm text-muted-foreground">
            Report generated on {new Date().toLocaleDateString()}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
            <Button onClick={handleGenerateReport} disabled={generating}>
              <Download className="h-4 w-4 mr-2" />
              {generating ? "Generating..." : "Download Full Report"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};