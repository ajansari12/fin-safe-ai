import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle,
  Plus,
  BarChart3,
  Activity,
  Timer
} from 'lucide-react';
import { useKRI } from '@/hooks/useKRI';
import { KRICreationForm } from './KRICreationForm';
import { KRIDetailView } from './KRIDetailView';
import { KRIBreachManager } from './KRIBreachManager';
import { KRIMetrics } from './KRIMetrics';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar } from 'recharts';

interface KRIDashboardProps {
  className?: string;
}

export const KRIDashboard: React.FC<KRIDashboardProps> = ({ className }) => {
  const {
    kris,
    dataPoints,
    breaches,
    isLoading,
    loadKRIs,
    loadKRIDataPoints,
    loadKRIBreaches,
    getKRIStatus
  } = useKRI();

  const [activeTab, setActiveTab] = useState('overview');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedKRI, setSelectedKRI] = useState<string | null>(null);

  useEffect(() => {
    loadKRIs();
    loadKRIBreaches();
  }, []);

  const getStatusColor = (status: 'normal' | 'warning' | 'critical') => {
    switch (status) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'warning': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'normal': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving': return <TrendingDown className="h-4 w-4 text-green-600" />;
      case 'deteriorating': return <TrendingUp className="h-4 w-4 text-red-600" />;
      default: return <Activity className="h-4 w-4 text-blue-600" />;
    }
  };

  const getOverviewMetrics = () => {
    const total = kris.length;
    const active = kris.filter(k => k.status === 'active').length;
    const critical = kris.filter(k => getKRIStatus(k) === 'critical').length;
    const warning = kris.filter(k => getKRIStatus(k) === 'warning').length;
    const openBreaches = breaches.filter(b => b.status === 'open').length;

    return { total, active, critical, warning, openBreaches };
  };

  const metrics = getOverviewMetrics();

  if (isLoading) {
    return (
      <Card className={className}>
        <CardContent className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={className}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">KRI Management</h2>
          <p className="text-muted-foreground">Monitor and manage Key Risk Indicators</p>
        </div>
        <Button onClick={() => setShowCreateForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create KRI
        </Button>
      </div>

      {/* Overview Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium">Total KRIs</span>
            </div>
            <p className="text-2xl font-bold mt-1">{metrics.total}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium">Active</span>
            </div>
            <p className="text-2xl font-bold mt-1">{metrics.active}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <span className="text-sm font-medium">Warning</span>
            </div>
            <p className="text-2xl font-bold mt-1">{metrics.warning}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <span className="text-sm font-medium">Critical</span>
            </div>
            <p className="text-2xl font-bold mt-1">{metrics.critical}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Timer className="h-4 w-4 text-red-600" />
              <span className="text-sm font-medium">Open Breaches</span>
            </div>
            <p className="text-2xl font-bold mt-1">{metrics.openBreaches}</p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="metrics">Metrics</TabsTrigger>
          <TabsTrigger value="breaches">Breaches</TabsTrigger>
          <TabsTrigger value="management">Management</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* KRI Status List */}
            <Card>
              <CardHeader>
                <CardTitle>KRI Status Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {kris.slice(0, 10).map((kri) => {
                    const status = getKRIStatus(kri);
                    return (
                      <div 
                        key={kri.id} 
                        className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-muted/50"
                        onClick={() => setSelectedKRI(kri.id)}
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{kri.name}</span>
                            <Badge className={getStatusColor(status)}>
                              {status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            Current: {kri.current_value || 'No data'} | Target: {kri.target_value || 'N/A'}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {getTrendIcon(kri.trend)}
                          <Badge variant="outline" className="text-xs">
                            {kri.category}
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                  {kris.length > 10 && (
                    <Button variant="outline" className="w-full">
                      View All KRIs ({kris.length})
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Recent Breaches */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Breaches</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {breaches.slice(0, 5).map((breach) => {
                    const kri = kris.find(k => k.id === breach.kri_id);
                    return (
                      <div key={breach.id} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{kri?.name || 'Unknown KRI'}</p>
                            <p className="text-sm text-muted-foreground">
                              Value: {breach.breach_value} | Threshold: {breach.threshold_value}
                            </p>
                          </div>
                          <Badge className={breach.breach_level === 'critical' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}>
                            {breach.breach_level}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-muted-foreground">
                            {new Date(breach.breach_date).toLocaleDateString()}
                          </span>
                          <Badge variant="outline" className="text-xs">
                            {breach.status}
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                  {breaches.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No recent breaches</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="metrics" className="space-y-4">
          <KRIMetrics kris={kris} dataPoints={dataPoints} />
        </TabsContent>

        <TabsContent value="breaches" className="space-y-4">
          <KRIBreachManager breaches={breaches} kris={kris} />
        </TabsContent>

        <TabsContent value="management" className="space-y-4">
          <div className="grid grid-cols-1 gap-6">
            {kris.map((kri) => (
              <Card key={kri.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold">{kri.name}</h3>
                        <Badge className={getStatusColor(getKRIStatus(kri))}>
                          {getKRIStatus(kri)}
                        </Badge>
                        <Badge variant="outline">{kri.category}</Badge>
                      </div>
                      <p className="text-muted-foreground mt-1">{kri.description}</p>
                      <div className="flex items-center gap-4 mt-2 text-sm">
                        <span>Frequency: {kri.frequency}</span>
                        <span>Owner: {kri.owner || 'Unassigned'}</span>
                        <span>Updated: {kri.last_updated ? new Date(kri.last_updated).toLocaleDateString() : 'Never'}</span>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      onClick={() => setSelectedKRI(kri.id)}
                    >
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Dialogs */}
      {showCreateForm && (
        <KRICreationForm
          open={showCreateForm}
          onOpenChange={setShowCreateForm}
          onSuccess={() => {
            setShowCreateForm(false);
            loadKRIs();
          }}
        />
      )}

      {selectedKRI && (
        <KRIDetailView
          kriId={selectedKRI}
          open={!!selectedKRI}
          onOpenChange={(open) => !open && setSelectedKRI(null)}
        />
      )}
    </div>
  );
};