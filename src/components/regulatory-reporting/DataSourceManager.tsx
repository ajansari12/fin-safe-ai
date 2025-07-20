import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { 
  Plus, 
  Database, 
  ExternalLink, 
  Settings, 
  CheckCircle,
  AlertTriangle,
  Activity,
  MapPin,
  RefreshCw
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface DataSource {
  id: string;
  name: string;
  type: 'kri_data' | 'incident_data' | 'control_data' | 'vendor_data' | 'external_api';
  status: 'connected' | 'disconnected' | 'error';
  lastSync: string;
  recordCount: number;
  dataQuality: number;
  description: string;
}

const DataSourceManager: React.FC = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const { toast } = useToast();

  // Mock data - replace with actual service call
  const dataSources: DataSource[] = [
    {
      id: '1',
      name: 'KRI Management System',
      type: 'kri_data',
      status: 'connected',
      lastSync: '2024-01-20T10:30:00Z',
      recordCount: 1250,
      dataQuality: 95,
      description: 'Key Risk Indicator data from internal KRI management system'
    },
    {
      id: '2',
      name: 'Incident Tracking System',
      type: 'incident_data',
      status: 'connected',
      lastSync: '2024-01-20T09:15:00Z',
      recordCount: 89,
      dataQuality: 92,
      description: 'Operational risk incidents and events data'
    },
    {
      id: '3',
      name: 'Control Framework Database',
      type: 'control_data',
      status: 'connected',
      lastSync: '2024-01-20T08:45:00Z',
      recordCount: 456,
      dataQuality: 88,
      description: 'Risk controls and control testing results'
    },
    {
      id: '4',
      name: 'Vendor Management Portal',
      type: 'vendor_data',
      status: 'error',
      lastSync: '2024-01-19T14:20:00Z',
      recordCount: 123,
      dataQuality: 75,
      description: 'Third-party vendor risk assessment data'
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variant = status === 'connected' ? 'default' : status === 'error' ? 'destructive' : 'secondary';
    return <Badge variant={variant}>{status}</Badge>;
  };

  const getTypeIcon = (type: string) => {
    return <Database className="h-4 w-4 text-blue-500" />;
  };

  const handleCreateDataSource = (formData: FormData) => {
    const sourceData = {
      name: formData.get('name') as string,
      type: formData.get('type') as string,
      description: formData.get('description') as string,
    };

    // Mock creation - replace with actual service call
    toast({
      title: "Data source created",
      description: "New data source has been configured successfully.",
    });
    setIsCreateDialogOpen(false);
  };

  const handleSync = (sourceId: string) => {
    toast({
      title: "Sync initiated",
      description: "Data synchronization has been started.",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Data Source Management</h2>
          <p className="text-muted-foreground">
            Configure and manage data sources for automated report generation
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Data Source
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Data Source</DialogTitle>
              <DialogDescription>
                Configure a new data source for automated report generation.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={(e) => { e.preventDefault(); handleCreateDataSource(new FormData(e.currentTarget)); }} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Data Source Name</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="My Data Source"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Source Type</Label>
                <Select name="type" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select source type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="kri_data">KRI Data</SelectItem>
                    <SelectItem value="incident_data">Incident Data</SelectItem>
                    <SelectItem value="control_data">Control Data</SelectItem>
                    <SelectItem value="vendor_data">Vendor Data</SelectItem>
                    <SelectItem value="external_api">External API</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Describe the data source and its purpose..."
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsCreateDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit">Add Data Source</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Data Source Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sources</CardTitle>
            <Database className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dataSources.length}</div>
            <p className="text-xs text-muted-foreground">
              Active data connections
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Connected</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {dataSources.filter(s => s.status === 'connected').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Operational sources
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Records</CardTitle>
            <Activity className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {dataSources.reduce((sum, s) => sum + s.recordCount, 0).toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              Available data points
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Quality</CardTitle>
            <MapPin className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {Math.round(dataSources.reduce((sum, s) => sum + s.dataQuality, 0) / dataSources.length)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Data quality score
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Data Sources List */}
      <div className="grid gap-4">
        {dataSources.map((source) => (
          <Card key={source.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getTypeIcon(source.type)}
                  <div>
                    <CardTitle className="text-lg">{source.name}</CardTitle>
                    <CardDescription>{source.description}</CardDescription>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {getStatusIcon(source.status)}
                  {getStatusBadge(source.status)}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleSync(source.id)}
                  >
                    <RefreshCw className="h-4 w-4 mr-1" />
                    Sync
                  </Button>
                  <Button size="sm" variant="outline">
                    <Settings className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm font-medium">Source Type</p>
                  <p className="text-xs text-muted-foreground capitalize">
                    {source.type.replace('_', ' ')}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">Record Count</p>
                  <p className="text-xs text-muted-foreground">
                    {source.recordCount.toLocaleString()} records
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">Data Quality</p>
                  <p className="text-xs text-muted-foreground">
                    {source.dataQuality}% quality score
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">Last Sync</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(source.lastSync).toLocaleString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default DataSourceManager;