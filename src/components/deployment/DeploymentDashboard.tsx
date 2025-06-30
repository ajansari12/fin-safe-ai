
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Cloud, 
  Database, 
  GitBranch, 
  Monitor, 
  Users, 
  BookOpen, 
  MessageSquare,
  TrendingUp,
  CheckCircle,
  AlertCircle,
  PlayCircle,
  Pause,
  RefreshCw
} from "lucide-react";
import DeploymentPipeline from "./DeploymentPipeline";
import DataMigrationTools from "./DataMigrationTools";
import TrainingCenter from "./TrainingCenter";
import GoLiveSupport from "./GoLiveSupport";
import ContinuousImprovement from "./ContinuousImprovement";

const DeploymentDashboard: React.FC = () => {
  const [deploymentStatus, setDeploymentStatus] = useState<'idle' | 'deploying' | 'success' | 'error'>('idle');
  const [migrationProgress, setMigrationProgress] = useState(0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Deployment & Go-Live Center</h1>
          <p className="text-muted-foreground">
            Comprehensive deployment strategy and go-live support system
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Monitor className="h-4 w-4 mr-2" />
            System Status
          </Button>
          <Button>
            <PlayCircle className="h-4 w-4 mr-2" />
            Start Deployment
          </Button>
        </div>
      </div>

      {/* Quick Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Deployment Status</CardTitle>
            <GitBranch className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <Badge variant={deploymentStatus === 'success' ? 'default' : 'secondary'}>
                {deploymentStatus === 'success' ? 'Live' : 'Staging'}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Last deployed 2 hours ago
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Migration Progress</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{migrationProgress}%</div>
            <Progress value={migrationProgress} className="mt-2" />
            <p className="text-xs text-muted-foreground">
              85,432 records migrated
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Users Trained</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">124</div>
            <p className="text-xs text-muted-foreground">
              78% completion rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Support Tickets</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">
              3 active, 5 resolved
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Deployment Alerts */}
      <div className="space-y-4">
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            Production deployment scheduled for tomorrow at 2:00 AM EST. All pre-deployment checks passed.
          </AlertDescription>
        </Alert>
        
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Migration test for legacy system ABC failed. Review required before proceeding.
          </AlertDescription>
        </Alert>
      </div>

      <Tabs defaultValue="pipeline" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="pipeline">Deployment Pipeline</TabsTrigger>
          <TabsTrigger value="migration">Data Migration</TabsTrigger>
          <TabsTrigger value="training">Training Center</TabsTrigger>
          <TabsTrigger value="support">Go-Live Support</TabsTrigger>
          <TabsTrigger value="improvement">Continuous Improvement</TabsTrigger>
        </TabsList>

        <TabsContent value="pipeline" className="space-y-4">
          <DeploymentPipeline />
        </TabsContent>

        <TabsContent value="migration" className="space-y-4">
          <DataMigrationTools />
        </TabsContent>

        <TabsContent value="training" className="space-y-4">
          <TrainingCenter />
        </TabsContent>

        <TabsContent value="support" className="space-y-4">
          <GoLiveSupport />
        </TabsContent>

        <TabsContent value="improvement" className="space-y-4">
          <ContinuousImprovement />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DeploymentDashboard;
