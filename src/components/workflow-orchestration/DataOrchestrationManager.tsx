
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Database, 
  RefreshCw, 
  Download, 
  Upload, 
  Settings, 
  Activity,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react';

interface DataOrchestrationManagerProps {
  orgId: string;
}

const DataOrchestrationManager: React.FC<DataOrchestrationManagerProps> = ({ orgId }) => {
  const [dataSources] = useState([
    {
      id: 'ds-1',
      name: 'Risk Management System',
      type: 'database',
      status: 'connected',
      lastSync: '2 minutes ago',
      recordCount: 1248
    },
    {
      id: 'ds-2',
      name: 'Compliance Database',
      type: 'api',
      status: 'syncing',
      lastSync: 'In progress',
      recordCount: 856
    },
    {
      id: 'ds-3',
      name: 'External Vendor Data',
      type: 'file',
      status: 'error',
      lastSync: '1 hour ago',
      recordCount: 0
    }
  ]);

  const [dataFlows] = useState([
    {
      id: 'df-1',
      name: 'Risk Data Pipeline',
      source: 'Risk Management System',
      destination: 'Analytics Warehouse',
      status: 'running',
      lastExecution: '5 minutes ago'
    },
    {
      id: 'df-2',
      name: 'Compliance Reporting',
      source: 'Compliance Database',
      destination: 'Regulatory Reports',
      status: 'scheduled',
      lastExecution: '1 hour ago'
    }
  ]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
      case 'running':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'syncing':
      case 'scheduled':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
      case 'running':
        return 'success';
      case 'syncing':
      case 'scheduled':
        return 'default';
      case 'error':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Data Orchestration</h3>
          <p className="text-sm text-muted-foreground">
            Manage data sources, flows, and transformations
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Configure
          </Button>
          <Button size="sm">
            <Database className="h-4 w-4 mr-2" />
            Add Source
          </Button>
        </div>
      </div>

      {/* Data Sources */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Data Sources
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {dataSources.map((source) => (
              <div key={source.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  {getStatusIcon(source.status)}
                  <div>
                    <div className="font-medium">{source.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {source.type} • {source.recordCount.toLocaleString()} records
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-sm text-muted-foreground">
                    Last sync: {source.lastSync}
                  </div>
                  <Badge variant={getStatusColor(source.status) as any}>
                    {source.status}
                  </Badge>
                  <Button size="sm" variant="outline">
                    <RefreshCw className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Data Flows */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Data Flows
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {dataFlows.map((flow) => (
              <div key={flow.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  {getStatusIcon(flow.status)}
                  <div>
                    <div className="font-medium">{flow.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {flow.source} → {flow.destination}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-sm text-muted-foreground">
                    Last run: {flow.lastExecution}
                  </div>
                  <Badge variant={getStatusColor(flow.status) as any}>
                    {flow.status}
                  </Badge>
                  <Button size="sm" variant="outline">
                    <Settings className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Data Quality Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Data Quality Score</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">94%</div>
            <p className="text-xs text-muted-foreground">
              +2% from last week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Records Processed</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2.1K</div>
            <p className="text-xs text-muted-foreground">
              Today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed Transfers</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">3</div>
            <p className="text-xs text-muted-foreground">
              Need attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Processing Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2.3s</div>
            <p className="text-xs text-muted-foreground">
              -0.1s from yesterday
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DataOrchestrationManager;
