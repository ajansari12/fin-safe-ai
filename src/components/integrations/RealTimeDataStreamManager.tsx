
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { 
  Activity, 
  Database, 
  Wifi, 
  WifiOff, 
  Settings, 
  Plus,
  Play,
  Pause,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { toast } from 'sonner';

interface DataStream {
  id: string;
  name: string;
  source: string;
  type: 'kri' | 'incident' | 'control' | 'market_data' | 'transaction';
  status: 'connected' | 'disconnected' | 'error' | 'paused';
  updateFrequency: number; // seconds
  lastUpdate: Date;
  recordsProcessed: number;
  errorCount: number;
  dataQuality: number; // 0-100
  isActive: boolean;
}

interface StreamMetrics {
  totalStreams: number;
  activeStreams: number;
  errorStreams: number;
  avgDataQuality: number;
  totalRecordsProcessed: number;
}

const RealTimeDataStreamManager: React.FC = () => {
  const [streams, setStreams] = useState<DataStream[]>([
    {
      id: 'stream-1',
      name: 'KRI Live Feed',
      source: 'Core Banking System',
      type: 'kri',
      status: 'connected',
      updateFrequency: 300, // 5 minutes
      lastUpdate: new Date(),
      recordsProcessed: 1247,
      errorCount: 2,
      dataQuality: 94,
      isActive: true
    },
    {
      id: 'stream-2',
      name: 'Incident Stream',
      source: 'Security Management System',
      type: 'incident',
      status: 'connected',
      updateFrequency: 60, // 1 minute
      lastUpdate: new Date(Date.now() - 2 * 60 * 1000),
      recordsProcessed: 89,
      errorCount: 0,
      dataQuality: 98,
      isActive: true
    },
    {
      id: 'stream-3',
      name: 'Control Monitoring',
      source: 'GRC Platform',
      type: 'control',
      status: 'error',
      updateFrequency: 900, // 15 minutes
      lastUpdate: new Date(Date.now() - 30 * 60 * 1000),
      recordsProcessed: 456,
      errorCount: 12,
      dataQuality: 76,
      isActive: false
    }
  ]);

  const [metrics, setMetrics] = useState<StreamMetrics>({
    totalStreams: 0,
    activeStreams: 0,
    errorStreams: 0,
    avgDataQuality: 0,
    totalRecordsProcessed: 0
  });

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newStream, setNewStream] = useState({
    name: '',
    source: '',
    type: 'kri' as const,
    updateFrequency: 300
  });

  useEffect(() => {
    calculateMetrics();
    const interval = setInterval(simulateRealTimeUpdates, 5000);
    return () => clearInterval(interval);
  }, [streams]);

  const calculateMetrics = () => {
    const totalStreams = streams.length;
    const activeStreams = streams.filter(s => s.status === 'connected' && s.isActive).length;
    const errorStreams = streams.filter(s => s.status === 'error').length;
    const avgDataQuality = streams.reduce((sum, s) => sum + s.dataQuality, 0) / totalStreams || 0;
    const totalRecordsProcessed = streams.reduce((sum, s) => sum + s.recordsProcessed, 0);

    setMetrics({
      totalStreams,
      activeStreams,
      errorStreams,
      avgDataQuality,
      totalRecordsProcessed
    });
  };

  const simulateRealTimeUpdates = () => {
    setStreams(prevStreams => 
      prevStreams.map(stream => {
        if (stream.status === 'connected' && stream.isActive) {
          const shouldUpdate = Math.random() > 0.3; // 70% chance of update
          if (shouldUpdate) {
            return {
              ...stream,
              lastUpdate: new Date(),
              recordsProcessed: stream.recordsProcessed + Math.floor(Math.random() * 5) + 1,
              dataQuality: Math.max(85, Math.min(100, stream.dataQuality + (Math.random() - 0.5) * 4))
            };
          }
        }
        return stream;
      })
    );
  };

  const toggleStream = async (streamId: string) => {
    setStreams(prevStreams =>
      prevStreams.map(stream =>
        stream.id === streamId
          ? {
              ...stream,
              isActive: !stream.isActive,
              status: !stream.isActive ? 'connected' : 'paused'
            }
          : stream
      )
    );

    toast.success('Stream status updated');
  };

  const retryErroredStream = async (streamId: string) => {
    setStreams(prevStreams =>
      prevStreams.map(stream =>
        stream.id === streamId
          ? {
              ...stream,
              status: 'connected',
              isActive: true,
              errorCount: 0,
              lastUpdate: new Date()
            }
          : stream
      )
    );

    toast.success('Stream reconnected successfully');
  };

  const createStream = async () => {
    if (!newStream.name || !newStream.source) {
      toast.error('Please fill in all required fields');
      return;
    }

    const stream: DataStream = {
      id: `stream-${Date.now()}`,
      name: newStream.name,
      source: newStream.source,
      type: newStream.type,
      status: 'connected',
      updateFrequency: newStream.updateFrequency,
      lastUpdate: new Date(),
      recordsProcessed: 0,
      errorCount: 0,
      dataQuality: 100,
      isActive: true
    };

    setStreams(prev => [...prev, stream]);
    setIsCreateModalOpen(false);
    setNewStream({ name: '', source: '', type: 'kri', updateFrequency: 300 });
    toast.success('Data stream created successfully');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <Wifi className="h-4 w-4 text-green-500" />;
      case 'disconnected':
      case 'paused':
        return <WifiOff className="h-4 w-4 text-gray-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'default';
      case 'disconnected': return 'secondary';
      case 'paused': return 'outline';
      case 'error': return 'destructive';
      default: return 'outline';
    }
  };

  const formatLastUpdate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ago`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Real-Time Data Streams</h2>
          <p className="text-muted-foreground">
            Monitor and manage live data feeds from integrated systems
          </p>
        </div>
        <Button onClick={() => setIsCreateModalOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Stream
        </Button>
      </div>

      {/* Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Streams</p>
                <p className="text-2xl font-bold">{metrics.totalStreams}</p>
              </div>
              <Database className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Streams</p>
                <p className="text-2xl font-bold text-green-600">{metrics.activeStreams}</p>
              </div>
              <Activity className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Error Streams</p>
                <p className="text-2xl font-bold text-red-600">{metrics.errorStreams}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Quality</p>
                <p className="text-2xl font-bold">{Math.round(metrics.avgDataQuality)}%</p>
              </div>
              <CheckCircle className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Records Processed</p>
                <p className="text-2xl font-bold">{metrics.totalRecordsProcessed.toLocaleString()}</p>
              </div>
              <Activity className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Streams List */}
      <div className="grid gap-4">
        {streams.map((stream) => (
          <Card key={stream.id}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {getStatusIcon(stream.status)}
                  <div>
                    <h3 className="font-semibold">{stream.name}</h3>
                    <p className="text-sm text-muted-foreground">{stream.source}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <Badge variant={getStatusColor(stream.status)} className="capitalize">
                    {stream.status}
                  </Badge>
                  <Badge variant="outline" className="capitalize">
                    {stream.type}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Update Frequency</p>
                  <p className="text-sm">{Math.floor(stream.updateFrequency / 60)}m</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Last Update</p>
                  <p className="text-sm flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatLastUpdate(stream.lastUpdate)}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Records</p>
                  <p className="text-sm">{stream.recordsProcessed.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Data Quality</p>
                  <p className="text-sm">{stream.dataQuality}%</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Errors</p>
                  <p className="text-sm">{stream.errorCount}</p>
                </div>
              </div>

              <div className="flex items-center justify-between mt-4 pt-4 border-t">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={stream.isActive}
                    onCheckedChange={() => toggleStream(stream.id)}
                    disabled={stream.status === 'error'}
                  />
                  <span className="text-sm">Active</span>
                </div>

                <div className="flex gap-2">
                  {stream.status === 'error' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => retryErroredStream(stream.id)}
                    >
                      Retry
                    </Button>
                  )}
                  <Button size="sm" variant="outline">
                    <Settings className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create Stream Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Create Data Stream</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="stream-name">Stream Name</Label>
                <Input
                  id="stream-name"
                  value={newStream.name}
                  onChange={(e) => setNewStream({ ...newStream, name: e.target.value })}
                  placeholder="Enter stream name"
                />
              </div>

              <div>
                <Label htmlFor="stream-source">Data Source</Label>
                <Input
                  id="stream-source"
                  value={newStream.source}
                  onChange={(e) => setNewStream({ ...newStream, source: e.target.value })}
                  placeholder="Enter data source"
                />
              </div>

              <div>
                <Label htmlFor="stream-type">Stream Type</Label>
                <select
                  id="stream-type"
                  value={newStream.type}
                  onChange={(e) => setNewStream({ ...newStream, type: e.target.value as any })}
                  className="w-full p-2 border rounded"
                >
                  <option value="kri">KRI Data</option>
                  <option value="incident">Incident Data</option>
                  <option value="control">Control Data</option>
                  <option value="market_data">Market Data</option>
                  <option value="transaction">Transaction Data</option>
                </select>
              </div>

              <div>
                <Label htmlFor="update-frequency">Update Frequency (seconds)</Label>
                <Input
                  id="update-frequency"
                  type="number"
                  value={newStream.updateFrequency}
                  onChange={(e) => setNewStream({ ...newStream, updateFrequency: parseInt(e.target.value) || 300 })}
                  min="60"
                  max="3600"
                />
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={createStream}>
                  Create Stream
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default RealTimeDataStreamManager;
