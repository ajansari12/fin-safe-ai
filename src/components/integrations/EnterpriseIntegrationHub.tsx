import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Link2, 
  Activity, 
  Settings, 
  Database, 
  Cloud, 
  CheckCircle, 
  AlertTriangle,
  Clock,
  BarChart3,
  RefreshCw,
  Key,
  Globe
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface APIIntegration {
  id: string;
  integration_name: string;
  integration_type: string;
  provider_name: string;
  api_endpoint: string;
  authentication_method: string;
  sync_frequency_hours: number;
  last_sync_at?: string;
  sync_status: 'active' | 'paused' | 'error' | 'disabled';
  data_quality_score: number;
  error_details?: any;
  created_at: string;
}

const EnterpriseIntegrationHub: React.FC = () => {
  const [integrations, setIntegrations] = useState<APIIntegration[]>([]);
  const [selectedIntegration, setSelectedIntegration] = useState<APIIntegration | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [syncingIntegration, setSyncingIntegration] = useState<string | null>(null);
  const { toast } = useToast();

  const integrationTypes = [
    { value: 'risk_data', label: 'Risk Data Feeds', icon: <BarChart3 className="h-4 w-4" />, color: 'text-red-600 bg-red-50' },
    { value: 'regulatory_feeds', label: 'Regulatory Updates', icon: <Globe className="h-4 w-4" />, color: 'text-blue-600 bg-blue-50' },
    { value: 'market_data', label: 'Market Data', icon: <Activity className="h-4 w-4" />, color: 'text-green-600 bg-green-50' },
    { value: 'credit_bureau', label: 'Credit Bureau', icon: <Database className="h-4 w-4" />, color: 'text-purple-600 bg-purple-50' },
    { value: 'payment_processor', label: 'Payment Processing', icon: <Cloud className="h-4 w-4" />, color: 'text-orange-600 bg-orange-50' },
    { value: 'identity_verification', label: 'Identity Verification', icon: <Key className="h-4 w-4" />, color: 'text-cyan-600 bg-cyan-50' }
  ];

  const authMethods = [
    { value: 'api_key', label: 'API Key' },
    { value: 'oauth2', label: 'OAuth 2.0' },
    { value: 'jwt', label: 'JWT Token' },
    { value: 'basic_auth', label: 'Basic Auth' },
    { value: 'certificate', label: 'Certificate' }
  ];

  useEffect(() => {
    loadIntegrations();
  }, []);

  const loadIntegrations = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('api_integrations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setIntegrations(data || []);
    } catch (error) {
      console.error('Error loading integrations:', error);
      toast({
        title: "Error",
        description: "Failed to load API integrations",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const createIntegration = async (integrationData: Partial<APIIntegration>) => {
    try {
      const { error } = await supabase
        .from('api_integrations')
        .insert([{
          ...integrationData,
          authentication_config: {},
          rate_limits: {},
          data_mapping: {},
          data_quality_score: 0,
          sync_status: 'active'
        }]);

      if (error) throw error;

      toast({
        title: "Integration Created",
        description: "New API integration has been configured"
      });

      setShowCreateDialog(false);
      loadIntegrations();
    } catch (error) {
      console.error('Error creating integration:', error);
      toast({
        title: "Error",
        description: "Failed to create integration",
        variant: "destructive"
      });
    }
  };

  const syncIntegration = async (integrationId: string) => {
    try {
      setSyncingIntegration(integrationId);
      
      // Simulate sync process
      await new Promise(resolve => setTimeout(resolve, 2000));

      const syncResults = {
        records_processed: Math.floor(Math.random() * 1000) + 100,
        data_quality_score: Math.floor(Math.random() * 30) + 70,
        errors_count: Math.floor(Math.random() * 5),
        sync_duration_ms: Math.floor(Math.random() * 5000) + 1000
      };

      const { error } = await supabase
        .from('api_integrations')
        .update({
          last_sync_at: new Date().toISOString(),
          data_quality_score: syncResults.data_quality_score,
          sync_status: syncResults.errors_count > 0 ? 'error' : 'active',
          error_details: syncResults.errors_count > 0 ? { error_count: syncResults.errors_count } : null
        })
        .eq('id', integrationId);

      if (error) throw error;

      toast({
        title: "Sync Completed",
        description: `Processed ${syncResults.records_processed} records with ${syncResults.data_quality_score}% quality score`
      });

      loadIntegrations();
    } catch (error) {
      console.error('Error syncing integration:', error);
      toast({
        title: "Error",
        description: "Failed to sync integration",
        variant: "destructive"
      });
    } finally {
      setSyncingIntegration(null);
    }
  };

  const toggleIntegrationStatus = async (integrationId: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'active' ? 'paused' : 'active';
      
      const { error } = await supabase
        .from('api_integrations')
        .update({ sync_status: newStatus })
        .eq('id', integrationId);

      if (error) throw error;

      toast({
        title: "Status Updated",
        description: `Integration ${newStatus === 'active' ? 'activated' : 'paused'}`
      });

      loadIntegrations();
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: "Error",
        description: "Failed to update integration status",
        variant: "destructive"
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'paused': return 'bg-yellow-500';
      case 'error': return 'bg-red-500';
      case 'disabled': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getIntegrationTypeConfig = (type: string) => {
    return integrationTypes.find(it => it.value === type) || integrationTypes[0];
  };

  const getQualityScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (isLoading) {
    return (
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Enterprise Integration Hub</h1>
          <p className="text-muted-foreground">
            Centralized API management and data synchronization
          </p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Link2 className="h-4 w-4 mr-2" />
              New Integration
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create API Integration</DialogTitle>
              <DialogDescription>
                Configure a new external API integration
              </DialogDescription>
            </DialogHeader>
            <IntegrationForm onSubmit={createIntegration} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Overview Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Integrations</CardTitle>
            <Link2 className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{integrations.length}</div>
            <p className="text-xs text-muted-foreground">Active connections</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {integrations.filter(i => i.sync_status === 'active').length}
            </div>
            <p className="text-xs text-muted-foreground">Running integrations</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Errors</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {integrations.filter(i => i.sync_status === 'error').length}
            </div>
            <p className="text-xs text-muted-foreground">Needs attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Quality</CardTitle>
            <BarChart3 className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {integrations.length > 0
                ? Math.round(integrations.reduce((sum, i) => sum + i.data_quality_score, 0) / integrations.length)
                : 0}%
            </div>
            <p className="text-xs text-muted-foreground">Data quality score</p>
          </CardContent>
        </Card>
      </div>

      {/* Integration Types Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Integration Types</CardTitle>
          <CardDescription>Distribution of integration types across your organization</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {integrationTypes.map((type) => {
              const count = integrations.filter(i => i.integration_type === type.value).length;
              return (
                <div key={type.value} className={`p-4 rounded-lg ${type.color} text-center`}>
                  <div className="flex justify-center mb-2">
                    {type.icon}
                  </div>
                  <div className="text-2xl font-bold">{count}</div>
                  <div className="text-xs">{type.label}</div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Integrations List */}
      <Card>
        <CardHeader>
          <CardTitle>API Integrations</CardTitle>
          <CardDescription>Manage and monitor all external API connections</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {integrations.map((integration) => {
              const typeConfig = getIntegrationTypeConfig(integration.integration_type);
              const lastSyncDaysAgo = integration.last_sync_at 
                ? Math.floor((Date.now() - new Date(integration.last_sync_at).getTime()) / (1000 * 60 * 60 * 24))
                : null;

              return (
                <div key={integration.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50">
                  <div className="flex items-center gap-4 flex-1">
                    <div className={`p-3 rounded-lg ${typeConfig.color}`}>
                      {typeConfig.icon}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium">{integration.integration_name}</h4>
                        <Badge className={getStatusColor(integration.sync_status)}>
                          {integration.sync_status}
                        </Badge>
                        {integration.sync_status === 'error' && (
                          <Badge variant="destructive">
                            {integration.error_details?.error_count || 1} errors
                          </Badge>
                        )}
                      </div>
                      
                      <div className="text-sm text-muted-foreground space-y-1">
                        <div className="flex items-center gap-4 flex-wrap">
                          <span>{integration.provider_name}</span>
                          <span>•</span>
                          <span>{typeConfig.label}</span>
                          <span>•</span>
                          <span className="capitalize">{integration.authentication_method.replace('_', ' ')}</span>
                        </div>
                        
                        <div className="flex items-center gap-4 flex-wrap">
                          {integration.last_sync_at ? (
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              Last sync: {lastSyncDaysAgo === 0 ? 'Today' : `${lastSyncDaysAgo} days ago`}
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-orange-600">
                              <Clock className="h-3 w-3" />
                              Never synced
                            </span>
                          )}
                          
                          <span className="flex items-center gap-1">
                            <BarChart3 className="h-3 w-3" />
                            Quality: <span className={getQualityScoreColor(integration.data_quality_score)}>
                              {integration.data_quality_score}%
                            </span>
                          </span>
                          
                          <span>Sync: Every {integration.sync_frequency_hours}h</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 ml-4">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => syncIntegration(integration.id)}
                      disabled={syncingIntegration === integration.id}
                    >
                      {syncingIntegration === integration.id ? (
                        <>
                          <div className="animate-spin h-3 w-3 mr-1 border border-gray-400 border-t-transparent rounded-full" />
                          Syncing...
                        </>
                      ) : (
                        <>
                          <RefreshCw className="h-3 w-3 mr-1" />
                          Sync
                        </>
                      )}
                    </Button>
                    
                    <Button 
                      size="sm" 
                      variant={integration.sync_status === 'active' ? 'destructive' : 'default'}
                      onClick={() => toggleIntegrationStatus(integration.id, integration.sync_status)}
                    >
                      {integration.sync_status === 'active' ? 'Pause' : 'Activate'}
                    </Button>
                    
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => setSelectedIntegration(integration)}
                    >
                      <Settings className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              );
            })}
            
            {integrations.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                <Link2 className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-lg font-medium mb-2">No integrations configured</h3>
                <p className="text-sm mb-4">Connect your first external API to get started.</p>
                <Button onClick={() => setShowCreateDialog(true)}>
                  <Link2 className="h-4 w-4 mr-2" />
                  Create Integration
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Integration Form Component
const IntegrationForm: React.FC<{ onSubmit: (data: any) => void }> = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    integration_name: '',
    integration_type: '',
    provider_name: '',
    api_endpoint: '',
    authentication_method: '',
    sync_frequency_hours: 24
  });

  const integrationTypes = [
    { value: 'risk_data', label: 'Risk Data Feeds' },
    { value: 'regulatory_feeds', label: 'Regulatory Updates' },
    { value: 'market_data', label: 'Market Data' },
    { value: 'credit_bureau', label: 'Credit Bureau' },
    { value: 'payment_processor', label: 'Payment Processing' },
    { value: 'identity_verification', label: 'Identity Verification' }
  ];

  const authMethods = [
    { value: 'api_key', label: 'API Key' },
    { value: 'oauth2', label: 'OAuth 2.0' },
    { value: 'jwt', label: 'JWT Token' },
    { value: 'basic_auth', label: 'Basic Auth' },
    { value: 'certificate', label: 'Certificate' }
  ];

  const handleSubmit = () => {
    onSubmit(formData);
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2">Integration Name</label>
        <Input
          placeholder="e.g., Equifax Credit Bureau"
          value={formData.integration_name}
          onChange={(e) => setFormData(prev => ({ ...prev, integration_name: e.target.value }))}
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Integration Type</label>
          <Select 
            value={formData.integration_type} 
            onValueChange={(value) => setFormData(prev => ({ ...prev, integration_type: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              {integrationTypes.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Provider</label>
          <Input
            placeholder="e.g., Equifax, Moody's"
            value={formData.provider_name}
            onChange={(e) => setFormData(prev => ({ ...prev, provider_name: e.target.value }))}
          />
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-2">API Endpoint</label>
        <Input
          placeholder="https://api.provider.com/v1"
          value={formData.api_endpoint}
          onChange={(e) => setFormData(prev => ({ ...prev, api_endpoint: e.target.value }))}
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Authentication Method</label>
          <Select 
            value={formData.authentication_method} 
            onValueChange={(value) => setFormData(prev => ({ ...prev, authentication_method: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select method" />
            </SelectTrigger>
            <SelectContent>
              {authMethods.map((method) => (
                <SelectItem key={method.value} value={method.value}>
                  {method.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-2">Sync Frequency (hours)</label>
          <Input
            type="number"
            value={formData.sync_frequency_hours}
            onChange={(e) => setFormData(prev => ({ ...prev, sync_frequency_hours: parseInt(e.target.value) }))}
          />
        </div>
      </div>
      
      <div className="flex justify-end">
        <Button onClick={handleSubmit}>Create Integration</Button>
      </div>
    </div>
  );
};

export default EnterpriseIntegrationHub;