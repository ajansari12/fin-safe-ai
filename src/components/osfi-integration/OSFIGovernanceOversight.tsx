import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertTriangle, CheckCircle, Clock, Users, FileText, TrendingUp } from "lucide-react";

const OSFIGovernanceOversight = () => {
  const [activeTab, setActiveTab] = useState("oversight");

  const seniorManagementMetrics = [
    { title: "Risk Appetite Approval", status: "approved", lastReview: "2024-01-15", nextReview: "2024-07-15" },
    { title: "Policy Framework", status: "under_review", lastReview: "2024-02-01", nextReview: "2024-08-01" },
    { title: "Resource Allocation", status: "approved", lastReview: "2024-01-20", nextReview: "2024-07-20" },
    { title: "Culture Assessment", status: "pending", lastReview: "2023-12-15", nextReview: "2024-06-15" }
  ];

  const policyDocumentation = [
    { name: "Operational Risk Policy", version: "2.1", status: "current", expiryDate: "2024-12-31", owner: "CRO" },
    { name: "Business Continuity Policy", version: "1.8", status: "expiring", expiryDate: "2024-08-15", owner: "COO" },
    { name: "Incident Management Policy", version: "3.2", status: "current", expiryDate: "2025-01-30", owner: "CISO" },
    { name: "Third Party Risk Policy", version: "1.5", status: "under_review", expiryDate: "2024-11-20", owner: "CRO" }
  ];

  const resourceAllocation = {
    budgetUtilization: 78,
    staffingLevels: 92,
    trainingCompletion: 85,
    systemsUpgrade: 65
  };

  const independentAssurance = [
    { area: "Operational Risk Framework", lastAudit: "2024-01-10", rating: "Satisfactory", nextAudit: "2024-07-10" },
    { area: "Crisis Management", lastAudit: "2023-11-15", rating: "Needs Improvement", nextAudit: "2024-05-15" },
    { area: "Third Party Management", lastAudit: "2024-02-20", rating: "Strong", nextAudit: "2024-08-20" },
    { area: "Technology Resilience", lastAudit: "2023-12-05", rating: "Satisfactory", nextAudit: "2024-06-05" }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
      case "current":
      case "Strong":
        return "bg-green-100 text-green-800";
      case "under_review":
      case "expiring":
      case "Satisfactory":
        return "bg-yellow-100 text-yellow-800";
      case "pending":
      case "Needs Improvement":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
      case "current":
      case "Strong":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "under_review":
      case "expiring":
      case "Satisfactory":
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case "pending":
      case "Needs Improvement":
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">OSFI E-21 Governance Oversight</h2>
          <p className="text-muted-foreground">
            Senior management accountability and governance framework monitoring
          </p>
        </div>
        <Badge variant="outline" className="text-sm">
          Principle 1: Governance
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
            <h3 className="text-sm font-medium text-blue-900">OSFI E-21 Compliance Notice</h3>
            <p className="text-sm text-blue-700 mt-1">
              This governance framework aligns with OSFI Guideline E-21 Principle 1 requirements for effective governance, 
              senior management oversight, and independent assurance. 
              <br />
              <span className="font-medium">Disclaimer:</span> This tool provides guidance and is not regulatory advice. Consult OSFI directly for official interpretation.
            </p>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="oversight">Management Oversight</TabsTrigger>
          <TabsTrigger value="documentation">Policy Documentation</TabsTrigger>
          <TabsTrigger value="resources">Resource Allocation</TabsTrigger>
          <TabsTrigger value="assurance">Independent Assurance</TabsTrigger>
        </TabsList>

        <TabsContent value="oversight" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Senior Management Accountability
              </CardTitle>
              <CardDescription>
                Track senior management oversight and approval of key operational risk management components
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {seniorManagementMetrics.map((metric, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(metric.status)}
                      <div>
                        <p className="font-medium">{metric.title}</p>
                        <p className="text-sm text-muted-foreground">
                          Last Review: {metric.lastReview}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className={getStatusColor(metric.status)}>
                        {metric.status.replace('_', ' ')}
                      </Badge>
                      <p className="text-sm text-muted-foreground mt-1">
                        Next: {metric.nextReview}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documentation" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Policy Documentation Management
              </CardTitle>
              <CardDescription>
                Central repository for operational risk policies with version control and expiration tracking
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {policyDocumentation.map((policy, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">{policy.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Version {policy.version} • Owner: {policy.owner}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge className={getStatusColor(policy.status)}>
                        {policy.status.replace('_', ' ')}
                      </Badge>
                      <p className="text-sm text-muted-foreground mt-1">
                        Expires: {policy.expiryDate}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 flex gap-2">
                <Button variant="outline" size="sm">
                  Add New Policy
                </Button>
                <Button variant="outline" size="sm">
                  Bulk Review
                </Button>
                <Button variant="outline" size="sm">
                  Generate Report
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="resources" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Resource Allocation Monitoring
              </CardTitle>
              <CardDescription>
                Track budget utilization, staffing levels, and resource adequacy for operational risk management
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Budget Utilization</span>
                      <span>{resourceAllocation.budgetUtilization}%</span>
                    </div>
                    <Progress value={resourceAllocation.budgetUtilization} />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Staffing Levels</span>
                      <span>{resourceAllocation.staffingLevels}%</span>
                    </div>
                    <Progress value={resourceAllocation.staffingLevels} />
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Training Completion</span>
                      <span>{resourceAllocation.trainingCompletion}%</span>
                    </div>
                    <Progress value={resourceAllocation.trainingCompletion} />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Systems Upgrade Progress</span>
                      <span>{resourceAllocation.systemsUpgrade}%</span>
                    </div>
                    <Progress value={resourceAllocation.systemsUpgrade} />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assurance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Independent Assurance Framework
              </CardTitle>
              <CardDescription>
                Track independent audit results and assurance activities for operational risk management
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {independentAssurance.map((audit, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">{audit.area}</p>
                      <p className="text-sm text-muted-foreground">
                        Last Audit: {audit.lastAudit}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge className={getStatusColor(audit.rating)}>
                        {audit.rating}
                      </Badge>
                      <p className="text-sm text-muted-foreground mt-1">
                        Next: {audit.nextAudit}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 flex gap-2">
                <Button variant="outline" size="sm">
                  Schedule Audit
                </Button>
                <Button variant="outline" size="sm">
                  View Audit History
                </Button>
                <Button variant="outline" size="sm">
                  Generate Assurance Report
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default OSFIGovernanceOversight;