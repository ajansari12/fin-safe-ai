
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  GitBranch, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  Play, 
  Pause, 
  RotateCcw,
  Monitor,
  Database,
  Shield,
  Zap
} from "lucide-react";

interface PipelineStage {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'success' | 'failed';
  duration?: string;
  description: string;
}

const DeploymentPipeline: React.FC = () => {
  const [selectedEnvironment, setSelectedEnvironment] = useState('staging');
  
  const pipelineStages: PipelineStage[] = [
    {
      id: 'build',
      name: 'Build & Test',
      status: 'success',
      duration: '2m 34s',
      description: 'Compile code, run unit tests, and create artifacts'
    },
    {
      id: 'security',
      name: 'Security Scan',
      status: 'success',
      duration: '1m 12s',
      description: 'Vulnerability assessment and dependency check'
    },
    {
      id: 'staging',
      name: 'Deploy to Staging',
      status: 'running',
      description: 'Deploy to staging environment for testing'
    },
    {
      id: 'integration',
      name: 'Integration Tests',
      status: 'pending',
      description: 'Run end-to-end and integration tests'
    },
    {
      id: 'production',
      name: 'Production Deploy',
      status: 'pending',
      description: 'Blue-green deployment to production'
    }
  ];

  const environments = [
    { id: 'development', name: 'Development', status: 'healthy', url: 'dev.riskmgmt.local' },
    { id: 'staging', name: 'Staging', status: 'deploying', url: 'staging.riskmgmt.local' },
    { id: 'production', name: 'Production', status: 'healthy', url: 'app.riskmgmt.com' }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'running': return <Clock className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'failed': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default: return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'default';
      case 'deploying': return 'secondary';
      case 'error': return 'destructive';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="pipeline" className="w-full">
        <TabsList>
          <TabsTrigger value="pipeline">Pipeline Status</TabsTrigger>
          <TabsTrigger value="environments">Environments</TabsTrigger>
          <TabsTrigger value="config">Configuration</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
        </TabsList>

        <TabsContent value="pipeline" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <GitBranch className="h-5 w-5" />
                    Deployment Pipeline
                  </CardTitle>
                  <CardDescription>
                    Automated deployment with blue-green strategy
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Rollback
                  </Button>
                  <Button size="sm">
                    <Play className="h-4 w-4 mr-2" />
                    Deploy
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pipelineStages.map((stage, index) => (
                  <div key={stage.id} className="flex items-center gap-4 p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(stage.status)}
                      <div>
                        <h3 className="font-medium">{stage.name}</h3>
                        <p className="text-sm text-muted-foreground">{stage.description}</p>
                      </div>
                    </div>
                    <div className="ml-auto flex items-center gap-2">
                      {stage.duration && (
                        <Badge variant="outline">{stage.duration}</Badge>
                      )}
                      <Badge variant={stage.status === 'success' ? 'default' : 'secondary'}>
                        {stage.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Deployment Configuration</CardTitle>
              <CardDescription>
                Current deployment settings and strategies
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium">Strategy</h4>
                  <Badge>Blue-Green Deployment</Badge>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">Rollback Policy</h4>
                  <Badge variant="outline">Automatic on failure</Badge>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">Health Checks</h4>
                  <Badge>Enabled</Badge>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">Migration Strategy</h4>
                  <Badge variant="outline">Zero-downtime</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="environments" className="space-y-4">
          <div className="grid gap-4">
            {environments.map((env) => (
              <Card key={env.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>{env.name}</CardTitle>
                      <CardDescription>{env.url}</CardDescription>
                    </div>
                    <Badge variant={getStatusColor(env.status)}>
                      {env.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4">
                    <Button variant="outline" size="sm">
                      <Monitor className="h-4 w-4 mr-2" />
                      View Logs
                    </Button>
                    <Button variant="outline" size="sm">
                      <Database className="h-4 w-4 mr-2" />
                      Database Status
                    </Button>
                    <Button variant="outline" size="sm">
                      <Shield className="h-4 w-4 mr-2" />
                      Security Check
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="config" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Environment Configuration</CardTitle>
              <CardDescription>
                Manage configuration for different deployment environments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium mb-2">Database Configuration</h4>
                    <div className="space-y-2 text-sm">
                      <div>Connection Pool: 20 connections</div>
                      <div>Timeout: 30 seconds</div>
                      <div>SSL: Enabled</div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Application Settings</h4>
                    <div className="space-y-2 text-sm">
                      <div>Log Level: INFO</div>
                      <div>Session Timeout: 8 hours</div>
                      <div>API Rate Limit: 1000/hour</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Deployment Monitoring</CardTitle>
              <CardDescription>
                Real-time monitoring and alerting for deployments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <h4 className="font-medium">Performance Metrics</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Response Time</span>
                      <span>245ms</span>
                    </div>
                    <Progress value={25} />
                    <div className="flex justify-between">
                      <span>CPU Usage</span>
                      <span>45%</span>
                    </div>
                    <Progress value={45} />
                    <div className="flex justify-between">
                      <span>Memory Usage</span>
                      <span>67%</span>
                    </div>
                    <Progress value={67} />
                  </div>
                </div>
                <div className="space-y-4">
                  <h4 className="font-medium">Alert Configuration</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Deployment Failures</span>
                      <Badge>Enabled</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Performance Degradation</span>
                      <Badge>Enabled</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Security Issues</span>
                      <Badge>Enabled</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DeploymentPipeline;
