import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Workflow, GitBranch, Clock, CheckCircle, AlertTriangle, Play } from "lucide-react";

export const AdaptiveWorkflowEngine = () => {
  const [selectedWorkflow, setSelectedWorkflow] = useState(null);

  const workflows = [
    {
      id: 1,
      name: "Risk Assessment Pipeline",
      version: "v2.3",
      status: "active",
      adaptations: 12,
      efficiency: 94,
      totalSteps: 8,
      completedSteps: 6,
      avgExecutionTime: "4.2 hours",
      lastAdaptation: "2024-06-15",
      adaptationReason: "Performance optimization based on historical data"
    },
    {
      id: 2,
      name: "Incident Response Workflow",
      version: "v1.8",
      status: "adapting",
      adaptations: 8,
      efficiency: 89,
      totalSteps: 12,
      completedSteps: 9,
      avgExecutionTime: "2.1 hours",
      lastAdaptation: "2024-06-14",
      adaptationReason: "Route optimization for critical incidents"
    },
    {
      id: 3,
      name: "Compliance Review Process",
      version: "v3.1",
      status: "monitoring",
      adaptations: 15,
      efficiency: 91,
      totalSteps: 10,
      completedSteps: 10,
      avgExecutionTime: "6.8 hours",
      lastAdaptation: "2024-06-13",
      adaptationReason: "Parallel processing implementation"
    }
  ];

  const workflowSteps = [
    {
      id: 1,
      name: "Data Collection",
      status: "completed",
      duration: "25 min",
      optimization: "Automated data validation added",
      efficiency: 95
    },
    {
      id: 2,
      name: "Initial Assessment",
      status: "completed", 
      duration: "1.2 hours",
      optimization: "ML-powered risk scoring",
      efficiency: 92
    },
    {
      id: 3,
      name: "Expert Review",
      status: "in_progress",
      duration: "2.1 hours",
      optimization: "Smart routing to available experts",
      efficiency: 88
    },
    {
      id: 4,
      name: "Documentation",
      status: "pending",
      duration: "45 min",
      optimization: "Auto-generation of reports",
      efficiency: 96
    }
  ];

  const adaptations = [
    {
      id: 1,
      timestamp: "2024-06-15 14:30",
      workflowName: "Risk Assessment Pipeline",
      adaptationType: "Performance Optimization",
      description: "Added parallel processing for vendor assessments",
      impact: "37% reduction in processing time",
      confidence: 94
    },
    {
      id: 2,
      timestamp: "2024-06-14 11:20",
      workflowName: "Incident Response",
      adaptationType: "Routing Optimization",
      description: "Updated expert routing algorithm based on availability and expertise",
      impact: "22% improvement in response time",
      confidence: 89
    },
    {
      id: 3,
      timestamp: "2024-06-13 16:45",
      workflowName: "Compliance Review",
      adaptationType: "Bottleneck Resolution",
      description: "Identified and resolved document processing bottleneck",
      impact: "28% increase in throughput",
      confidence: 91
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'adapting': return 'bg-blue-100 text-blue-800';
      case 'monitoring': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'pending': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStepIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'in_progress': return <Clock className="h-4 w-4 text-blue-600" />;
      case 'pending': return <AlertTriangle className="h-4 w-4 text-gray-400" />;
      default: return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Adaptive Workflow Engine</h2>
          <p className="text-muted-foreground">Self-optimizing workflows with AI-driven adaptations</p>
        </div>
        <Button>
          <Play className="h-4 w-4 mr-2" />
          Create Workflow
        </Button>
      </div>

      {/* Active Workflows */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Workflow className="h-5 w-5 mr-2" />
            Active Workflows
          </CardTitle>
          <CardDescription>
            Self-optimizing workflows with real-time adaptations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {workflows.map((workflow) => (
              <div key={workflow.id} className="border rounded-lg p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-medium">{workflow.name}</h4>
                      <Badge variant="outline">{workflow.version}</Badge>
                      <Badge variant="outline" className={getStatusColor(workflow.status)}>
                        {workflow.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {workflow.adaptations} adaptations • Last: {workflow.lastAdaptation}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">{workflow.efficiency}% Efficiency</div>
                    <div className="text-xs text-muted-foreground">{workflow.avgExecutionTime} avg</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress ({workflow.completedSteps}/{workflow.totalSteps} steps)</span>
                    <span>{Math.round((workflow.completedSteps / workflow.totalSteps) * 100)}%</span>
                  </div>
                  <Progress value={(workflow.completedSteps / workflow.totalSteps) * 100} className="w-full" />
                </div>

                <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                  <h5 className="font-medium text-blue-900 mb-1">Latest Adaptation</h5>
                  <p className="text-sm text-blue-700">{workflow.adaptationReason}</p>
                </div>

                <div className="flex justify-end space-x-2">
                  <Button variant="outline" size="sm">View Details</Button>
                  <Button variant="outline" size="sm">Configure</Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Workflow Step Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <GitBranch className="h-5 w-5 mr-2" />
            Workflow Step Analysis
          </CardTitle>
          <CardDescription>
            Detailed view of workflow step performance and optimizations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {workflowSteps.map((step) => (
              <div key={step.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  {getStepIcon(step.status)}
                  <div>
                    <h4 className="font-medium">{step.name}</h4>
                    <p className="text-sm text-muted-foreground">{step.optimization}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="text-sm font-medium">{step.duration}</div>
                    <div className="text-xs text-muted-foreground">{step.efficiency}% efficient</div>
                  </div>
                  <Badge variant="outline" className={getStatusColor(step.status)}>
                    {step.status.replace('_', ' ')}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Adaptations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="h-5 w-5 mr-2" />
            Recent AI Adaptations
          </CardTitle>
          <CardDescription>
            Latest workflow optimizations applied by the AI engine
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {adaptations.map((adaptation) => (
              <div key={adaptation.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-medium">{adaptation.workflowName}</h4>
                    <p className="text-sm text-muted-foreground">{adaptation.adaptationType}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">{adaptation.confidence}% Confidence</div>
                    <div className="text-xs text-muted-foreground">{adaptation.timestamp}</div>
                  </div>
                </div>
                
                <p className="text-sm mb-2">{adaptation.description}</p>
                
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className="bg-green-50 text-green-700">
                    {adaptation.impact}
                  </Badge>
                  <Button variant="outline" size="sm">
                    View Changes
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