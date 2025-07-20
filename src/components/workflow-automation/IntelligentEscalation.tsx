import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertTriangle, Users, Clock, TrendingUp, Bell, Settings } from "lucide-react";

export const IntelligentEscalation = () => {
  const [selectedSeverity, setSelectedSeverity] = useState("all");

  const escalationRules = [
    {
      id: 1,
      name: "Critical Risk Alert",
      trigger: "Risk score > 85",
      severity: "Critical",
      escalationPath: ["Risk Manager", "CRO", "CEO"],
      timeThresholds: ["Immediate", "15 min", "30 min"],
      isActive: true,
      triggered: 12,
      avgResponseTime: "8 minutes"
    },
    {
      id: 2,
      name: "Incident Response Delay",
      trigger: "Response time > 2 hours",
      severity: "High",
      escalationPath: ["Team Lead", "Department Head", "CTO"],
      timeThresholds: ["2 hours", "4 hours", "8 hours"],
      isActive: true,
      triggered: 8,
      avgResponseTime: "3.2 hours"
    },
    {
      id: 3,
      name: "Compliance Deadline",
      trigger: "Deadline in 48 hours",
      severity: "Medium",
      escalationPath: ["Compliance Officer", "Legal Team", "CCO"],
      timeThresholds: ["48 hours", "24 hours", "12 hours"],
      isActive: true,
      triggered: 5,
      avgResponseTime: "1.8 hours"
    }
  ];

  const activeEscalations = [
    {
      id: 1,
      title: "Vendor Risk Assessment Overdue",
      severity: "High",
      triggeredAt: "2024-06-15 14:30",
      currentLevel: 2,
      maxLevel: 3,
      assignedTo: "Department Head",
      context: "ABC Corp vendor assessment 3 days overdue",
      aiRecommendation: "Assign to backup reviewer due to primary reviewer absence",
      timeRemaining: "2 hours"
    },
    {
      id: 2,
      title: "Critical System Alert",
      severity: "Critical",
      triggeredAt: "2024-06-15 15:45",
      currentLevel: 1,
      maxLevel: 3,
      assignedTo: "Risk Manager",
      context: "Customer data platform experiencing performance degradation",
      aiRecommendation: "Activate incident response team immediately",
      timeRemaining: "5 minutes"
    },
    {
      id: 3,
      title: "Regulatory Submission Deadline",
      severity: "Medium",
      triggeredAt: "2024-06-15 09:15",
      currentLevel: 1,
      maxLevel: 3,
      assignedTo: "Compliance Officer",
      context: "OSFI E-21 compliance report due in 36 hours",
      aiRecommendation: "Prioritize document review and allocate additional resources",
      timeRemaining: "36 hours"
    }
  ];

  const escalationMetrics = [
    {
      title: "Avg Response Time",
      value: "1.8 hours",
      change: "-23%",
      trend: "down"
    },
    {
      title: "Escalation Rate", 
      value: "12.3%",
      change: "-8%",
      trend: "down"
    },
    {
      title: "Resolution Rate",
      value: "94.7%",
      change: "+5%", 
      trend: "up"
    },
    {
      title: "Auto-Resolved",
      value: "67%",
      change: "+12%",
      trend: "up"
    }
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'Critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'High': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getEscalationLevelColor = (current: number, max: number) => {
    const percentage = (current / max) * 100;
    if (percentage >= 75) return 'text-red-600';
    if (percentage >= 50) return 'text-orange-600';
    return 'text-green-600';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Intelligent Escalation Management</h2>
          <p className="text-muted-foreground">AI-powered escalation and notification system</p>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={selectedSeverity} onValueChange={setSelectedSeverity}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Configure Rules
          </Button>
        </div>
      </div>

      {/* Escalation Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {escalationMetrics.map((metric, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
              <TrendingUp className={`h-4 w-4 ${metric.trend === 'up' ? 'text-green-600' : 'text-red-600'}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              <p className={`text-xs ${metric.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                {metric.change} from last month
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Active Escalations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Bell className="h-5 w-5 mr-2" />
            Active Escalations
          </CardTitle>
          <CardDescription>
            Current escalations requiring attention
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {activeEscalations.map((escalation) => (
              <div key={escalation.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-medium">{escalation.title}</h4>
                      <Badge variant="outline" className={getSeverityColor(escalation.severity)}>
                        {escalation.severity}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Triggered: {escalation.triggeredAt}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className={`text-sm font-medium ${getEscalationLevelColor(escalation.currentLevel, escalation.maxLevel)}`}>
                      Level {escalation.currentLevel}/{escalation.maxLevel}
                    </div>
                    <div className="text-xs text-muted-foreground">{escalation.timeRemaining} remaining</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div>
                    <span className="text-sm font-medium">Context: </span>
                    <span className="text-sm">{escalation.context}</span>
                  </div>
                  <div>
                    <span className="text-sm font-medium">Assigned to: </span>
                    <span className="text-sm">{escalation.assignedTo}</span>
                  </div>
                </div>

                <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                  <div className="flex items-start space-x-2">
                    <AlertTriangle className="h-4 w-4 text-blue-600 mt-0.5" />
                    <div>
                      <h5 className="font-medium text-blue-900">AI Recommendation</h5>
                      <p className="text-sm text-blue-700">{escalation.aiRecommendation}</p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button variant="outline" size="sm">
                    Update Status
                  </Button>
                  <Button size="sm">
                    Take Action
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Escalation Rules */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Users className="h-5 w-5 mr-2" />
            Escalation Rules
          </CardTitle>
          <CardDescription>
            Configured escalation paths and triggers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {escalationRules.map((rule) => (
              <div key={rule.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-medium">{rule.name}</h4>
                      <Badge variant="outline" className={getSeverityColor(rule.severity)}>
                        {rule.severity}
                      </Badge>
                      <Badge variant={rule.isActive ? "default" : "secondary"}>
                        {rule.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Trigger: {rule.trigger}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">{rule.triggered} times triggered</div>
                    <div className="text-xs text-muted-foreground">Avg response: {rule.avgResponseTime}</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-sm font-medium">Escalation Path:</div>
                  <div className="flex items-center space-x-2">
                    {rule.escalationPath.map((role, index) => (
                      <React.Fragment key={index}>
                        <Badge variant="secondary" className="text-xs">
                          {role}
                        </Badge>
                        {index < rule.escalationPath.length - 1 && (
                          <span className="text-xs text-muted-foreground">→</span>
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-sm font-medium">Time Thresholds:</div>
                  <div className="flex items-center space-x-2">
                    {rule.timeThresholds.map((threshold, index) => (
                      <React.Fragment key={index}>
                        <Badge variant="outline" className="text-xs">
                          {threshold}
                        </Badge>
                        {index < rule.timeThresholds.length - 1 && (
                          <span className="text-xs text-muted-foreground">→</span>
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button variant="outline" size="sm">
                    Edit Rule
                  </Button>
                  <Button variant="outline" size="sm">
                    Test Escalation
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};