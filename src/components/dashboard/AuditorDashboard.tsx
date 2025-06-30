
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { FileCheck, AlertCircle, Calendar, TrendingUp, Eye } from "lucide-react";
import DraggableWidget from "./DraggableWidget";

interface AuditorDashboardProps {
  settings: any;
}

const AuditorDashboard: React.FC<AuditorDashboardProps> = ({ settings }) => {
  const auditMetrics = [
    {
      title: "Active Audits",
      value: "8",
      change: "+2",
      status: "active",
      description: "Currently in progress"
    },
    {
      title: "Findings Open",
      value: "23",
      change: "-5",
      status: "warning",
      description: "Awaiting remediation"
    },
    {
      title: "Compliance Rate",
      value: "94%",
      change: "+3%",
      status: "success",
      description: "Overall compliance score"
    },
    {
      title: "Overdue Items",
      value: "4",
      change: "0",
      status: "error",
      description: "Past due date"
    }
  ];

  const activeAudits = [
    {
      id: "AUD-2024-001",
      name: "Operational Risk Assessment",
      type: "Internal",
      status: "In Progress",
      progress: 65,
      auditor: "Jane Smith",
      startDate: "2024-01-01",
      dueDate: "2024-01-31",
      findings: 3
    },
    {
      id: "AUD-2024-002", 
      name: "IT Security Review",
      type: "External",
      status: "Planning",
      progress: 25,
      auditor: "Bob Johnson",
      startDate: "2024-01-15",
      dueDate: "2024-02-15",
      findings: 0
    },
    {
      id: "AUD-2024-003",
      name: "Third-Party Risk Audit",
      type: "Internal",
      status: "Reporting",
      progress: 90,
      auditor: "Alice Brown",
      startDate: "2023-12-01",
      dueDate: "2024-01-10",
      findings: 7
    }
  ];

  const complianceStatus = [
    { framework: "OSFI E-21", status: "Compliant", score: 96, lastAssessed: "2024-01-01" },
    { framework: "PIPEDA", status: "Compliant", score: 98, lastAssessed: "2023-12-15" },
    { framework: "SOX", status: "Minor Issues", score: 88, lastAssessed: "2024-01-05" },
    { framework: "PCIDSS", status: "Compliant", score: 94, lastAssessed: "2023-12-20" }
  ];

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "compliant":
        return "default";
      case "minor issues":
        return "secondary";
      case "non-compliant":
        return "destructive";
      default:
        return "outline";
    }
  };

  const getAuditStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "in progress":
        return "default";
      case "planning":
        return "secondary";
      case "reporting":
        return "outline";
      case "completed":
        return "default";
      default:
        return "secondary";
    }
  };

  return (
    <div className="space-y-6">
      {/* Audit Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {auditMetrics.map((metric, index) => (
          <DraggableWidget key={`audit-metric-${index}`} id={`audit-metric-${index}`}>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
                <FileCheck className={`h-4 w-4 ${
                  metric.status === "success" ? "text-green-500" :
                  metric.status === "warning" ? "text-yellow-500" :
                  metric.status === "error" ? "text-red-500" : "text-blue-500"
                }`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metric.value}</div>
                <div className="flex items-center text-xs text-muted-foreground">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  <span>{metric.change} from last period</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {metric.description}
                </p>
              </CardContent>
            </Card>
          </DraggableWidget>
        ))}
      </div>

      {/* Active Audits */}
      <DraggableWidget id="active-audits">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Active Audits
              <Badge variant="outline">{activeAudits.length} audits</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activeAudits.map((audit) => (
                <div key={audit.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{audit.id}</Badge>
                        <Badge variant={getAuditStatusColor(audit.status)}>
                          {audit.status}
                        </Badge>
                        <Badge variant="secondary">{audit.type}</Badge>
                      </div>
                      <h4 className="font-medium">{audit.name}</h4>
                    </div>
                    <div className="text-right text-sm text-muted-foreground">
                      <div>Auditor: {audit.auditor}</div>
                      <div>Due: {audit.dueDate}</div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Start Date:</span>
                      <div className="font-medium">{audit.startDate}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Progress:</span>
                      <div className="font-medium">{audit.progress}%</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Findings:</span>
                      <div className="font-medium">{audit.findings}</div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Progress value={audit.progress} className="h-2" />
                  </div>
                  
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">
                      <Eye className="h-3 w-3 mr-1" />
                      View Details
                    </Button>
                    <Button size="sm">
                      Update Status
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </DraggableWidget>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Compliance Status */}
        <DraggableWidget id="compliance-status">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileCheck className="h-5 w-5" />
                Compliance Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {complianceStatus.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{item.framework}</h4>
                        <Badge variant={getStatusColor(item.status)}>
                          {item.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Score: {item.score}% • Last assessed: {item.lastAssessed}
                      </p>
                    </div>
                    <Button size="sm" variant="outline">
                      <Eye className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </DraggableWidget>

        {/* Upcoming Deadlines */}
        <DraggableWidget id="upcoming-deadlines">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Upcoming Deadlines
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <h4 className="font-medium">Q1 Risk Assessment Report</h4>
                    <p className="text-sm text-muted-foreground">Due: Jan 31, 2024</p>
                  </div>
                  <Badge variant="destructive">3 days</Badge>
                </div>
                <div className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <h4 className="font-medium">SOX Testing Documentation</h4>
                    <p className="text-sm text-muted-foreground">Due: Feb 15, 2024</p>
                  </div>
                  <Badge variant="secondary">18 days</Badge>
                </div>
                <div className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <h4 className="font-medium">Vendor Audit Follow-up</h4>
                    <p className="text-sm text-muted-foreground">Due: Mar 1, 2024</p>
                  </div>
                  <Badge variant="outline">32 days</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </DraggableWidget>
      </div>

      {/* Audit Trail Summary */}
      <DraggableWidget id="audit-trail">
        <Card>
          <CardHeader>
            <CardTitle>Recent audit trail activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 border rounded">
                <FileCheck className="h-4 w-4 text-green-500 mt-1" />
                <div>
                  <h4 className="font-medium">Control test completed</h4>
                  <p className="text-sm text-muted-foreground">
                    IT Access Control testing completed by Jane Smith • 2 hours ago
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 border rounded">
                <AlertCircle className="h-4 w-4 text-yellow-500 mt-1" />
                <div>
                  <h4 className="font-medium">Finding identified</h4>
                  <p className="text-sm text-muted-foreground">
                    New medium-priority finding in operational procedures • 4 hours ago
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 border rounded">
                <Calendar className="h-4 w-4 text-blue-500 mt-1" />
                <div>
                  <h4 className="font-medium">Audit scheduled</h4>
                  <p className="text-sm text-muted-foreground">
                    Compliance audit scheduled for next quarter • 1 day ago
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </DraggableWidget>
    </div>
  );
};

export default AuditorDashboard;
