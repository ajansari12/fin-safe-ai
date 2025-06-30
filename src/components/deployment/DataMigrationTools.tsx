
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Database, 
  Upload, 
  Download, 
  CheckCircle, 
  AlertTriangle, 
  Clock,
  RefreshCw,
  FileText,
  Settings,
  BarChart3
} from "lucide-react";

interface MigrationJob {
  id: string;
  name: string;
  source: string;
  target: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
  recordsProcessed: number;
  totalRecords: number;
  startTime?: string;
  endTime?: string;
}

const DataMigrationTools: React.FC = () => {
  const [migrationJobs] = useState<MigrationJob[]>([
    {
      id: '1',
      name: 'Legacy Risk Data',
      source: 'Oracle DB',
      target: 'PostgreSQL',
      status: 'completed',
      progress: 100,
      recordsProcessed: 25430,
      totalRecords: 25430,
      startTime: '2024-01-15 09:00:00',
      endTime: '2024-01-15 09:45:00'
    },
    {
      id: '2',
      name: 'User Accounts',
      source: 'LDAP',
      target: 'Supabase Auth',
      status: 'running',
      progress: 67,
      recordsProcessed: 3350,
      totalRecords: 5000,
      startTime: '2024-01-15 10:00:00'
    },
    {
      id: '3',
      name: 'Document Archive',
      source: 'File System',
      target: 'Supabase Storage',
      status: 'pending',
      progress: 0,
      recordsProcessed: 0,
      totalRecords: 12500
    }
  ]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'running': return <Clock className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'failed': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default: return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'default';
      case 'running': return 'secondary';
      case 'failed': return 'destructive';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="jobs" className="w-full">
        <TabsList>
          <TabsTrigger value="jobs">Migration Jobs</TabsTrigger>
          <TabsTrigger value="validation">Data Validation</TabsTrigger>
          <TabsTrigger value="mapping">Data Mapping</TabsTrigger>
          <TabsTrigger value="rollback">Rollback Tools</TabsTrigger>
        </TabsList>

        <TabsContent value="jobs" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="h-5 w-5" />
                    Data Migration Jobs
                  </CardTitle>
                  <CardDescription>
                    Automated data import from legacy systems
                  </CardDescription>
                </div>
                <Button>
                  <Upload className="h-4 w-4 mr-2" />
                  New Migration
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {migrationJobs.map((job) => (
                  <div key={job.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(job.status)}
                        <div>
                          <h3 className="font-medium">{job.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {job.source} → {job.target}
                          </p>
                        </div>
                      </div>
                      <Badge variant={getStatusColor(job.status)}>
                        {job.status}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Progress</span>
                        <span>{job.recordsProcessed.toLocaleString()} / {job.totalRecords.toLocaleString()}</span>
                      </div>
                      <Progress value={job.progress} />
                    </div>

                    <div className="flex items-center justify-between mt-3">
                      <div className="text-sm text-muted-foreground">
                        {job.startTime && (
                          <span>Started: {job.startTime}</span>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <FileText className="h-4 w-4 mr-2" />
                          Logs
                        </Button>
                        {job.status === 'running' && (
                          <Button variant="outline" size="sm">
                            Pause
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Migration Statistics</CardTitle>
              <CardDescription>
                Overall migration progress and statistics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">28,780</div>
                  <div className="text-sm text-muted-foreground">Records Migrated</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">14,720</div>
                  <div className="text-sm text-muted-foreground">Remaining</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">0</div>
                  <div className="text-sm text-muted-foreground">Failed Records</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="validation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Data Validation & Cleansing
              </CardTitle>
              <CardDescription>
                Validate and clean data before migration
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="validation-rules">Validation Rules</Label>
                    <Input id="validation-rules" placeholder="Select validation rules" />
                  </div>
                  <div>
                    <Label htmlFor="cleansing-options">Cleansing Options</Label>
                    <Input id="cleansing-options" placeholder="Select cleansing options" />
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">Validation Results</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center p-2 border rounded">
                      <span>Email Format Validation</span>
                      <Badge>98.5% Pass</Badge>
                    </div>
                    <div className="flex justify-between items-center p-2 border rounded">
                      <span>Date Range Validation</span>
                      <Badge>100% Pass</Badge>
                    </div>
                    <div className="flex justify-between items-center p-2 border rounded">
                      <span>Required Fields Check</span>
                      <Badge variant="destructive">85% Pass</Badge>
                    </div>
                  </div>
                </div>

                <Button>
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Run Validation
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mapping" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Data Mapping & Transformation
              </CardTitle>
              <CardDescription>
                Configure field mappings and data transformations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4 p-4 border rounded-lg">
                  <div>
                    <h4 className="font-medium mb-2">Source Field</h4>
                    <div className="space-y-1 text-sm">
                      <div>customer_id</div>
                      <div>risk_score</div>
                      <div>assessment_date</div>
                      <div>status_code</div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Transformation</h4>
                    <div className="space-y-1 text-sm">
                      <div>UUID conversion</div>
                      <div>Scale 0-100</div>
                      <div>ISO 8601 format</div>
                      <div>Enum mapping</div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Target Field</h4>
                    <div className="space-y-1 text-sm">
                      <div>client_uuid</div>
                      <div>risk_rating</div>
                      <div>evaluated_at</div>
                      <div>current_status</div>
                    </div>
                  </div>
                </div>

                <Button>
                  <Settings className="h-4 w-4 mr-2" />
                  Configure Mapping
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rollback" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RefreshCw className="h-5 w-5" />
                Rollback Procedures
              </CardTitle>
              <CardDescription>
                Rollback capabilities for failed migrations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 border rounded-lg bg-yellow-50">
                  <h4 className="font-medium text-yellow-800 mb-2">Available Rollback Points</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Pre-migration snapshot (2024-01-15 08:00)</span>
                      <Button variant="outline" size="sm">Restore</Button>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Post-validation checkpoint (2024-01-15 09:30)</span>
                      <Button variant="outline" size="sm">Restore</Button>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">Rollback Options</h4>
                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline">
                      <Database className="h-4 w-4 mr-2" />
                      Database Rollback
                    </Button>
                    <Button variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      File System Rollback
                    </Button>
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

export default DataMigrationTools;
