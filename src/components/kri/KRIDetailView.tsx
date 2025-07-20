import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  TrendingUp, 
  TrendingDown, 
  Activity,
  Plus,
  Edit,
  AlertTriangle,
  CheckCircle,
  Calendar,
  BarChart3
} from 'lucide-react';
import { useKRI } from '@/hooks/useKRI';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine } from 'recharts';
import { toast } from 'sonner';

interface KRIDetailViewProps {
  kriId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const KRIDetailView: React.FC<KRIDetailViewProps> = ({
  kriId,
  open,
  onOpenChange
}) => {
  const {
    kris,
    dataPoints,
    breaches,
    loadKRIDataPoints,
    addDataPoint,
    updateKRI,
    getKRIStatus,
    getKRITrend
  } = useKRI();

  const [activeTab, setActiveTab] = useState('overview');
  const [newDataValue, setNewDataValue] = useState('');
  const [newDataSource, setNewDataSource] = useState('');
  const [isAddingData, setIsAddingData] = useState(false);

  const kri = kris.find(k => k.id === kriId);
  const kriDataPoints = dataPoints.filter(dp => dp.kri_id === kriId);
  const kriBreaches = breaches.filter(b => b.kri_id === kriId);

  useEffect(() => {
    if (kriId) {
      loadKRIDataPoints(kriId);
    }
  }, [kriId]);

  if (!kri) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <div className="text-center py-8">
            <p>KRI not found</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const status = getKRIStatus(kri);
  const trend = getKRITrend(kriId);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'warning': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'normal': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTrendIcon = () => {
    switch (trend) {
      case 'improving': return <TrendingDown className="h-4 w-4 text-green-600" />;
      case 'deteriorating': return <TrendingUp className="h-4 w-4 text-red-600" />;
      default: return <Activity className="h-4 w-4 text-blue-600" />;
    }
  };

  const chartData = kriDataPoints
    .sort((a, b) => new Date(a.record_date).getTime() - new Date(b.record_date).getTime())
    .slice(-30) // Last 30 data points
    .map(dp => ({
      date: new Date(dp.record_date).toLocaleDateString(),
      value: dp.value,
      warning: kri.warning_threshold,
      critical: kri.critical_threshold
    }));

  const handleAddDataPoint = async () => {
    if (!newDataValue || isNaN(parseFloat(newDataValue))) {
      toast.error('Please enter a valid numeric value');
      return;
    }

    setIsAddingData(true);
    try {
      await addDataPoint({
        kri_id: kriId,
        value: parseFloat(newDataValue),
        record_date: new Date().toISOString().split('T')[0],
        data_quality: 'high',
        source: newDataSource || 'Manual Entry'
      });
      setNewDataValue('');
      setNewDataSource('');
      toast.success('Data point added successfully');
    } catch (error) {
      console.error('Error adding data point:', error);
    } finally {
      setIsAddingData(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="flex items-center gap-3">
                {kri.name}
                <Badge className={getStatusColor(status)}>{status}</Badge>
              </DialogTitle>
              <DialogDescription className="mt-1">
                {kri.description}
              </DialogDescription>
            </div>
            <Button variant="outline" size="sm">
              <Edit className="h-4 w-4 mr-2" />
              Edit KRI
            </Button>
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="data">Data & Trends</TabsTrigger>
            <TabsTrigger value="breaches">Breaches</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium">Current Value</span>
                  </div>
                  <p className="text-2xl font-bold mt-1">
                    {kri.current_value || 'No data'}
                    {kri.unit && <span className="text-sm ml-1">{kri.unit}</span>}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    {getTrendIcon()}
                    <span className="text-sm font-medium">Trend</span>
                  </div>
                  <p className="text-lg font-semibold mt-1 capitalize">{trend}</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-600" />
                    <span className="text-sm font-medium">Warning</span>
                  </div>
                  <p className="text-lg font-semibold mt-1">
                    {kri.warning_threshold}
                    {kri.unit && <span className="text-sm ml-1">{kri.unit}</span>}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-red-600" />
                    <span className="text-sm font-medium">Critical</span>
                  </div>
                  <p className="text-lg font-semibold mt-1">
                    {kri.critical_threshold}
                    {kri.unit && <span className="text-sm ml-1">{kri.unit}</span>}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* KRI Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>KRI Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Category:</span>
                      <p className="text-muted-foreground capitalize">{kri.category}</p>
                    </div>
                    <div>
                      <span className="font-medium">Frequency:</span>
                      <p className="text-muted-foreground capitalize">{kri.frequency}</p>
                    </div>
                    <div>
                      <span className="font-medium">Owner:</span>
                      <p className="text-muted-foreground">{kri.owner || 'Unassigned'}</p>
                    </div>
                    <div>
                      <span className="font-medium">Status:</span>
                      <p className="text-muted-foreground capitalize">{kri.status}</p>
                    </div>
                    <div>
                      <span className="font-medium">Data Source:</span>
                      <p className="text-muted-foreground">{kri.data_source || 'Not specified'}</p>
                    </div>
                    <div>
                      <span className="font-medium">Last Updated:</span>
                      <p className="text-muted-foreground">
                        {kri.last_updated ? new Date(kri.last_updated).toLocaleDateString() : 'Never'}
                      </p>
                    </div>
                  </div>
                  
                  {kri.tags.length > 0 && (
                    <div>
                      <span className="font-medium text-sm">Tags:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {kri.tags.map((tag) => (
                          <Badge key={tag} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {kriDataPoints.slice(0, 5).map((dp) => (
                      <div key={dp.id} className="flex items-center justify-between p-2 border rounded">
                        <div>
                          <p className="font-medium">{dp.value} {kri.unit}</p>
                          <p className="text-sm text-muted-foreground">{dp.source}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm">{new Date(dp.record_date).toLocaleDateString()}</p>
                          <Badge variant="outline" className="text-xs">
                            {dp.data_quality}
                          </Badge>
                        </div>
                      </div>
                    ))}
                    {kriDataPoints.length === 0 && (
                      <div className="text-center py-4 text-muted-foreground">
                        No data points recorded
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="data" className="space-y-4">
            {/* Add Data Point */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Add Data Point
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4 items-end">
                  <div className="flex-1">
                    <Label htmlFor="value">Value</Label>
                    <Input
                      id="value"
                      type="number"
                      step="any"
                      placeholder="Enter value"
                      value={newDataValue}
                      onChange={(e) => setNewDataValue(e.target.value)}
                    />
                  </div>
                  <div className="flex-1">
                    <Label htmlFor="source">Source</Label>
                    <Input
                      id="source"
                      placeholder="Data source"
                      value={newDataSource}
                      onChange={(e) => setNewDataSource(e.target.value)}
                    />
                  </div>
                  <Button onClick={handleAddDataPoint} disabled={isAddingData}>
                    {isAddingData ? 'Adding...' : 'Add'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Trend Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Trend Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                {chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <ReferenceLine y={kri.warning_threshold} stroke="#f59e0b" strokeDasharray="5 5" label="Warning" />
                      <ReferenceLine y={kri.critical_threshold} stroke="#ef4444" strokeDasharray="5 5" label="Critical" />
                      <Line type="monotone" dataKey="value" stroke="#8884d8" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No data available for trend analysis</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="breaches" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Breach History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {kriBreaches.map((breach) => (
                    <div key={breach.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <Badge className={breach.breach_level === 'critical' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}>
                              {breach.breach_level}
                            </Badge>
                            <span className="font-medium">
                              Value: {breach.breach_value} (Threshold: {breach.threshold_value})
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            Date: {new Date(breach.breach_date).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {breach.status}
                        </Badge>
                      </div>
                      {breach.root_cause && (
                        <div className="mt-3 p-2 bg-muted rounded">
                          <p className="text-sm"><strong>Root Cause:</strong> {breach.root_cause}</p>
                        </div>
                      )}
                    </div>
                  ))}
                  {kriBreaches.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No breaches recorded</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>KRI Configuration</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 text-sm">
                  <div>
                    <span className="font-medium">Calculation Method:</span>
                    <p className="text-muted-foreground mt-1">
                      {kri.calculation_method || 'Not specified'}
                    </p>
                  </div>
                  
                  <div>
                    <span className="font-medium">Escalation Procedure:</span>
                    <p className="text-muted-foreground mt-1">
                      {kri.escalation_procedure || 'Not specified'}
                    </p>
                  </div>

                  {kri.related_controls.length > 0 && (
                    <div>
                      <span className="font-medium">Related Controls:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {kri.related_controls.map((control) => (
                          <Badge key={control} variant="outline" className="text-xs">
                            {control}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};