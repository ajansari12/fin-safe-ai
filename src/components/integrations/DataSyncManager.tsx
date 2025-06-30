
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { 
  RefreshCw, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  Settings, 
  Play,
  Pause,
  RotateCcw,
  MapPin
} from "lucide-react";
import { dataSyncService, SyncConfig, SyncResult, ConflictInfo } from "@/services/integrations/data-sync-service";

interface SyncJob {
  id: string;
  name: string;
  integration: string;
  type: 'realtime' | 'batch';
  status: 'running' | 'scheduled' | 'paused' | 'error';
  lastRun: string | null;
  nextRun: string | null;
  recordsProcessed: number;
  successRate: number;
  conflicts: number;
}

const DataSyncManager: React.FC = () => {
  const [syncJobs, setSyncJobs] = useState<SyncJob[]>([]);
  const [conflicts, setConflicts] = useState<ConflictInfo[]>([]);
  const [activeTab, setActiveTab] = useState("jobs");
  const [newSyncConfig, setNewSyncConfig] = useState<Partial<SyncConfig>>({
    syncType: 'batch',
    conflictResolution: 'timestamp',
    fieldMappings: {}
  });
  const { toast } = useToast();

  useEffect(() => {
    loadSyncJobs();
    loadConflicts();
  }, []);

  const loadSyncJobs = () => {
    // Mock data for demonstration
    setSyncJobs([
      {
        id: '1',
        name: 'Core Banking Customer Sync',
        integration: 'Temenos T24',
        type: 'batch',
        status: 'running',
        lastRun: '2024-01-15T10:30:00Z',
        nextRun: '2024-01-15T14:30:00Z',
        recordsProcessed: 15240,
        successRate: 98.5,
        conflicts: 3
      },
      {
        id: '2',
        name: 'ERP Financial Data Sync',
        integration: 'SAP ERP',
        type: 'realtime',
        status: 'scheduled',
        lastRun: '2024-01-15T09:15:00Z',
        nextRun: null,
        recordsProcessed: 8750,
        successRate: 99.2,
        conflicts: 1
      },
      {
        id: '3',
        name: 'HR Employee Data Sync',
        integration: 'Workday',
        type: 'batch',
        status: 'error',
        lastRun: '2024-01-15T08:00:00Z',
        nextRun: '2024-01-15T16:00:00Z',
        recordsProcessed: 450,
        successRate: 95.8,
        conflicts: 8
      }
    ]);
  };

  const loadConflicts = () => {
    // Mock conflicts data
    setConflicts([
      {
        recordId: 'CUST-12345',
        field: 'email',
        sourceValue: 'john.doe@example.com',
        targetValue: 'j.doe@example.com',
        resolution: 'pending'
      },
      {
        recordId: 'EMP-67890',
        field: 'department',
        sourceValue: 'Information Technology',
        targetValue: 'IT',
        resolution: 'pending'
      },
      {
        recordId: 'ACC-11111',
        field: 'balance',
        sourceValue: 15000.50,
        targetValue: 15000.00,
        resolution: 'pending'
      }
    ]);
  };

  const handleRunSync = async (jobId: string) => {
    try {
      toast({
        title: "Sync Started",
        description: "Data synchronization job has been started"
      });
      
      // Update job status
      setSyncJobs(prev => prev.map(job => 
        job.id === jobId ? { ...job, status: 'running' as const } : job
      ));
      
      // Simulate sync process
      setTimeout(() => {
        setSyncJobs(prev => prev.map(job => 
          job.id === jobId ? { 
            ...job, 
            status: 'scheduled' as const,
            lastRun: new Date().toISOString(),
            recordsProcessed: job.recordsProcessed + Math.floor(Math.random() * 100)
          } : job
        ));
        
        toast({
          title: "Sync Completed",
          description: "Data synchronization completed successfully"
        });
      }, 3000);
    } catch (error) {
      toast({
        title: "Sync Failed",
        description: "Data synchronization encountered an error",
        variant: "destructive"
      });
    }
  };

  const handlePauseSync = (jobId: string) => {
    setSyncJobs(prev => prev.map(job => 
      job.id === jobId ? { ...job, status: 'paused' as const } : job
    ));
    
    toast({
      title: "Sync Paused",
      description: "Data synchronization job has been paused"
    });
  };

  const handleResolveConflict = async (conflictIndex: number, resolution: 'source' | 'target') => {
    try {
      const conflict = conflicts[conflictIndex];
      
      await dataSyncService.resolveConflict(
        `conflict-${conflictIndex}`, 
        resolution
      );
      
      setConflicts(prev => prev.filter((_, i) => i !== conflictIndex));
      
      toast({
        title: "Conflict Resolved",
        description: `Data conflict resolved using ${resolution} value`
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to resolve data conflict",
        variant: "destructive"
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running':
        return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'scheduled':
        return <Clock className="h-4 w-4 text-green-500" />;
      case 'paused':
        return <Pause className="h-4 w-4 text-yellow-500" />;
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <CheckCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      running: 'default',
      scheduled: 'secondary',
      paused: 'outline',
      error: 'destructive'
    } as const;
    
    return (
      <Badge variant={variants[status as keyof typeof variants] || 'outline'}>
        {status}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Data Synchronization Manager</h1>
        <p className="text-muted-foreground">
          Manage real-time and batch data synchronization across integrated systems
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="jobs">Sync Jobs</TabsTrigger>
          <TabsTrigger value="conflicts">Data Conflicts</TabsTrigger>
          <TabsTrigger value="mapping">Field Mapping</TabsTrigger>
          <TabsTrigger value="schedule">Scheduling</TabsTrigger>
        </TabsList>

        <TabsContent value="jobs" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Active Synchronization Jobs</CardTitle>
              <CardDescription>
                Monitor and manage all data synchronization processes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {syncJobs.map((job) => (
                  <div key={job.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(job.status)}
                        <div>
                          <h3 className="font-medium">{job.name}</h3>
                          <p className="text-sm text-muted-foreground">{job.integration}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(job.status)}
                        <Badge variant="outline">{job.type}</Badge>
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Records Processed</p>
                        <p className="font-medium">{job.recordsProcessed.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Success Rate</p>
                        <p className="font-medium text-green-600">{job.successRate}%</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Conflicts</p>
                        <p className="font-medium text-yellow-600">{job.conflicts}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Last Run</p>
                        <p className="font-medium">
                          {job.lastRun ? new Date(job.lastRun).toLocaleString() : 'Never'}
                        </p>
                      </div>
                    </div>

                    {job.status === 'running' && (
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm text-muted-foreground">Progress</span>
                          <span className="text-sm text-muted-foreground">75%</span>
                        </div>
                        <Progress value={75} className="h-2" />
                      </div>
                    )}

                    <div className="flex gap-2">
                      {job.status !== 'running' && (
                        <Button 
                          size="sm" 
                          onClick={() => handleRunSync(job.id)}
                        >
                          <Play className="h-3 w-3 mr-1" />
                          Run Now
                        </Button>
                      )}
                      
                      {job.status === 'running' && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handlePauseSync(job.id)}
                        >
                          <Pause className="h-3 w-3 mr-1" />
                          Pause
                        </Button>
                      )}
                      
                      <Button size="sm" variant="outline">
                        <Settings className="h-3 w-3 mr-1" />
                        Configure
                      </Button>
                      
                      {job.conflicts > 0 && (
                        <Button size="sm" variant="outline">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          View Conflicts
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="conflicts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Data Conflicts Resolution</CardTitle>
              <CardDescription>
                Resolve data conflicts that require manual intervention
              </CardDescription>
            </CardHeader>
            <CardContent>
              {conflicts.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <h3 className="text-lg font-medium">No Conflicts</h3>
                  <p className="text-muted-foreground">All data synchronization is running smoothly</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {conflicts.map((conflict, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-medium">Record ID: {conflict.recordId}</h3>
                        <Badge variant="outline">Field: {conflict.field}</Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="border rounded p-3">
                          <p className="text-sm text-muted-foreground mb-1">Source System Value</p>
                          <p className="font-medium">{String(conflict.sourceValue)}</p>
                        </div>
                        <div className="border rounded p-3">
                          <p className="text-sm text-muted-foreground mb-1">Target System Value</p>
                          <p className="font-medium">{String(conflict.targetValue)}</p>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button 
                          size="sm"
                          onClick={() => handleResolveConflict(index, 'source')}
                        >
                          Use Source Value
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleResolveConflict(index, 'target')}
                        >
                          Use Target Value
                        </Button>
                        <Button size="sm" variant="outline">
                          Custom Value
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mapping" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Field Mapping Configuration</CardTitle>
              <CardDescription>
                Configure how data fields are mapped between different systems
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="mapping-template">Select Mapping Template</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a pre-configured mapping template" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="core-banking">Core Banking Customer Mapping</SelectItem>
                      <SelectItem value="erp-employee">ERP Employee Mapping</SelectItem>
                      <SelectItem value="document-mgmt">Document Management Mapping</SelectItem>
                      <SelectItem value="custom">Create Custom Mapping</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="border rounded-lg p-4">
                  <h4 className="font-medium mb-3">Field Mappings</h4>
                  <div className="space-y-3">
                    <div className="grid grid-cols-3 gap-4 items-center">
                      <div>
                        <Label>Source Field</Label>
                        <Input placeholder="customer_id" />
                      </div>
                      <div className="text-center">
                        <MapPin className="h-4 w-4 mx-auto text-muted-foreground" />
                      </div>
                      <div>
                        <Label>Target Field</Label>
                        <Input placeholder="id" />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 items-center">
                      <div>
                        <Input placeholder="customer_name" />
                      </div>
                      <div className="text-center">
                        <MapPin className="h-4 w-4 mx-auto text-muted-foreground" />
                      </div>
                      <div>
                        <Input placeholder="full_name" />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 items-center">
                      <div>
                        <Input placeholder="account_number" />
                      </div>
                      <div className="text-center">
                        <MapPin className="h-4 w-4 mx-auto text-muted-foreground" />
                      </div>
                      <div>
                        <Input placeholder="primary_account" />
                      </div>
                    </div>
                  </div>
                  
                  <Button className="mt-4" variant="outline">
                    Add Field Mapping
                  </Button>
                </div>

                <div className="flex gap-2">
                  <Button>Save Mapping</Button>
                  <Button variant="outline">Test Mapping</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="schedule" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Synchronization Scheduling</CardTitle>
              <CardDescription>
                Configure when and how often data synchronization should occur
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="sync-type">Synchronization Type</Label>
                    <Select 
                      value={newSyncConfig.syncType} 
                      onValueChange={(value: any) => setNewSyncConfig(prev => ({ ...prev, syncType: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="realtime">Real-time</SelectItem>
                        <SelectItem value="batch">Batch Processing</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="conflict-resolution">Conflict Resolution</Label>
                    <Select 
                      value={newSyncConfig.conflictResolution} 
                      onValueChange={(value: any) => setNewSyncConfig(prev => ({ ...prev, conflictResolution: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="source_wins">Source System Wins</SelectItem>
                        <SelectItem value="target_wins">Target System Wins</SelectItem>
                        <SelectItem value="timestamp">Latest Timestamp Wins</SelectItem>
                        <SelectItem value="manual">Manual Resolution</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {newSyncConfig.syncType === 'batch' && (
                  <div>
                    <Label htmlFor="batch-schedule">Batch Schedule (Cron Expression)</Label>
                    <Input
                      id="batch-schedule"
                      placeholder="0 */4 * * *"
                      value={newSyncConfig.schedule || ''}
                      onChange={(e) => setNewSyncConfig(prev => ({ ...prev, schedule: e.target.value }))}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Example: "0 */4 * * *" runs every 4 hours
                    </p>
                  </div>
                )}

                <div>
                  <Label htmlFor="batch-size">Batch Size</Label>
                  <Input
                    id="batch-size"
                    type="number"
                    placeholder="1000"
                    value={newSyncConfig.batchSize || ''}
                    onChange={(e) => setNewSyncConfig(prev => ({ ...prev, batchSize: parseInt(e.target.value) }))}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Number of records to process in each batch
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch id="auto-retry" />
                  <Label htmlFor="auto-retry">Enable automatic retry on failure</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch id="notifications" defaultChecked />
                  <Label htmlFor="notifications">Send notifications on sync completion</Label>
                </div>

                <Button>Create Sync Job</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DataSyncManager;
