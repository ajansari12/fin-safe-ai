import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { 
  Settings, 
  CheckCircle, 
  XCircle, 
  Clock, 
  RefreshCw, 
  Shield,
  Activity,
  Users,
  DollarSign,
  AlertTriangle,
  Building
} from 'lucide-react';
import { erpService, ERPConfig } from '@/services/integrations/erp-service';
import { useToast } from '@/hooks/use-toast';

const ERPConnector: React.FC = () => {
  const [config, setConfig] = useState<Partial<ERPConfig>>({
    platform: 'sap',
    baseUrl: '',
    authentication: {
      type: 'oauth',
      credentials: {}
    },
    modules: {
      financials: true,
      procurement: true,
      humanResources: false,
      riskManagement: true
    },
    syncFrequency: 'daily'
  });

  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'testing' | 'connected' | 'error'>('disconnected');
  const [lastSyncData, setLastSyncData] = useState<any>(null);
  const [syncProgress, setSyncProgress] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    checkConnectionStatus();
  }, []);

  const checkConnectionStatus = async () => {
    try {
      const status = await erpService.getIntegrationStatus();
      setIsConnected(status.connected);
      setConnectionStatus(status.connected ? 'connected' : 'disconnected');
    } catch (error) {
      console.error('Error checking ERP connection status:', error);
      setConnectionStatus('error');
    }
  };

  const handleConfigUpdate = (field: string, value: any) => {
    setConfig(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAuthUpdate = (field: string, value: string) => {
    setConfig(prev => ({
      ...prev,
      authentication: {
        ...prev.authentication!,
        credentials: {
          ...prev.authentication!.credentials,
          [field]: value
        }
      }
    }));
  };

  const handleModuleUpdate = (field: string, value: boolean) => {
    setConfig(prev => ({
      ...prev,
      modules: {
        ...prev.modules!,
        [field]: value
      }
    }));
  };

  const testConnection = async () => {
    setIsLoading(true);
    setConnectionStatus('testing');
    
    try {
      await erpService.configure(config as ERPConfig);
      const connected = await erpService.testConnection();
      
      setIsConnected(connected);
      setConnectionStatus(connected ? 'connected' : 'error');
    } catch (error) {
      setConnectionStatus('error');
      setIsConnected(false);
    } finally {
      setIsLoading(false);
    }
  };

  const syncData = async () => {
    if (!isConnected) {
      toast({
        title: "Connection Required",
        description: "Please test and establish connection first",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    setSyncProgress(0);
    
    // Simulate progressive sync
    const progressInterval = setInterval(() => {
      setSyncProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return prev;
        }
        return prev + Math.random() * 20;
      });
    }, 300);

    try {
      const data = await erpService.syncData();
      setSyncProgress(100);
      setLastSyncData(data);
      
      const totalRecords = Object.values(data).reduce((sum: number, arr: any[]) => sum + arr.length, 0);
      toast({
        title: "ERP Sync Successful",
        description: `Synced ${totalRecords} records across all modules`
      });
    } catch (error) {
      toast({
        title: "ERP Sync Failed",
        description: "Failed to sync data from ERP system",
        variant: "destructive"
      });
    } finally {
      clearInterval(progressInterval);
      setIsLoading(false);
      setSyncProgress(0);
    }
  };

  const scheduleSync = async (frequency: string) => {
    try {
      await erpService.scheduleSync(frequency);
      handleConfigUpdate('syncFrequency', frequency);
    } catch (error) {
      toast({
        title: "Schedule Failed",
        description: "Failed to update sync schedule",
        variant: "destructive"
      });
    }
  };

  const getStatusIcon = () => {
    switch (connectionStatus) {
      case 'connected':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'testing':
        return <RefreshCw className="h-5 w-5 text-blue-500 animate-spin" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusBadge = () => {
    switch (connectionStatus) {
      case 'connected':
        return <Badge variant="default" className="bg-green-100 text-green-800">Connected</Badge>;
      case 'testing':
        return <Badge variant="secondary">Testing...</Badge>;
      case 'error':
        return <Badge variant="destructive">Error</Badge>;
      default:
        return <Badge variant="outline">Disconnected</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Building className="h-6 w-6 text-orange-600" />
              <div>
                <CardTitle>ERP System Integration</CardTitle>
                <CardDescription>
                  Connect and sync data from your Enterprise Resource Planning system
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {getStatusIcon()}
              {getStatusBadge()}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="configuration" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="configuration">Configuration</TabsTrigger>
              <TabsTrigger value="modules">Modules</TabsTrigger>
              <TabsTrigger value="data-sync">Data Sync</TabsTrigger>
              <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
            </TabsList>

            <TabsContent value="configuration" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="platform">ERP Platform</Label>
                    <Select
                      value={config.platform}
                      onValueChange={(value) => handleConfigUpdate('platform', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select ERP platform" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sap">SAP ERP</SelectItem>
                        <SelectItem value="oracle">Oracle ERP Cloud</SelectItem>
                        <SelectItem value="microsoft_dynamics">Microsoft Dynamics 365</SelectItem>
                        <SelectItem value="workday">Workday</SelectItem>
                        <SelectItem value="custom">Custom/Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="baseUrl">API Endpoint</Label>
                    <Input
                      id="baseUrl"
                      placeholder="https://api.erp.company.com/v1"
                      value={config.baseUrl}
                      onChange={(e) => handleConfigUpdate('baseUrl', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="authType">Authentication Type</Label>
                    <Select
                      value={config.authentication?.type}
                      onValueChange={(value) => handleConfigUpdate('authentication', {
                        ...config.authentication,
                        type: value
                      })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select auth type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="oauth">OAuth 2.0</SelectItem>
                        <SelectItem value="api_key">API Key</SelectItem>
                        <SelectItem value="saml">SAML</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="clientId">
                      {config.authentication?.type === 'oauth' ? 'Client ID' : 
                       config.authentication?.type === 'api_key' ? 'API Key' : 'Entity ID'}
                    </Label>
                    <Input
                      id="clientId"
                      type={config.authentication?.type === 'api_key' ? 'password' : 'text'}
                      placeholder="Enter credential"
                      value={config.authentication?.credentials?.clientId || ''}
                      onChange={(e) => handleAuthUpdate('clientId', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="clientSecret">
                      {config.authentication?.type === 'oauth' ? 'Client Secret' : 
                       config.authentication?.type === 'api_key' ? 'API Secret' : 'Certificate'}
                    </Label>
                    <Input
                      id="clientSecret"
                      type="password"
                      placeholder="Enter secret"
                      value={config.authentication?.credentials?.clientSecret || ''}
                      onChange={(e) => handleAuthUpdate('clientSecret', e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="syncFrequency">Sync Frequency</Label>
                    <Select
                      value={config.syncFrequency}
                      onValueChange={(value) => scheduleSync(value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select frequency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="realtime">Real-time</SelectItem>
                        <SelectItem value="hourly">Hourly</SelectItem>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="flex space-x-2">
                <Button 
                  onClick={testConnection}
                  disabled={isLoading || !config.baseUrl}
                  className="flex items-center space-x-2"
                >
                  {isLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Shield className="h-4 w-4" />}
                  <span>Test Connection</span>
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="modules" className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">ERP Module Integration</h3>
                <p className="text-sm text-muted-foreground">
                  Select which ERP modules to integrate with your risk management platform
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Object.entries(config.modules || {}).map(([key, value]) => (
                  <Card key={key} className={`transition-all ${value ? 'border-green-200 bg-green-50' : ''}`}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {key === 'financials' && <DollarSign className="h-5 w-5 text-green-600" />}
                          {key === 'procurement' && <Building className="h-5 w-5 text-blue-600" />}
                          {key === 'humanResources' && <Users className="h-5 w-5 text-purple-600" />}
                          {key === 'riskManagement' && <AlertTriangle className="h-5 w-5 text-red-600" />}
                          <CardTitle className="text-sm capitalize">
                            {key.replace(/([A-Z])/g, ' $1').trim()}
                          </CardTitle>
                        </div>
                        <Switch
                          checked={value}
                          onCheckedChange={(checked) => handleModuleUpdate(key, checked)}
                        />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-xs text-muted-foreground">
                        {key === 'financials' && 'General ledger, account balances, financial reporting data'}
                        {key === 'procurement' && 'Vendor management, contract data, procurement risk metrics'}
                        {key === 'humanResources' && 'Employee data, access levels, HR risk indicators'}
                        {key === 'riskManagement' && 'Risk events, compliance data, audit trail information'}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="data-sync" className="space-y-6">
              {syncProgress > 0 && (
                <Card>
                  <CardContent className="pt-6">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Sync Progress</span>
                        <span>{Math.round(syncProgress)}%</span>
                      </div>
                      <Progress value={syncProgress} className="w-full" />
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center space-x-2">
                      <DollarSign className="h-5 w-5 text-green-500" />
                      <CardTitle className="text-sm">Financials</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {lastSyncData?.financials?.length || 0}
                    </div>
                    <p className="text-xs text-muted-foreground">Records synced</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center space-x-2">
                      <Building className="h-5 w-5 text-blue-500" />
                      <CardTitle className="text-sm">Procurement</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {lastSyncData?.procurement?.length || 0}
                    </div>
                    <p className="text-xs text-muted-foreground">Records synced</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center space-x-2">
                      <Users className="h-5 w-5 text-purple-500" />
                      <CardTitle className="text-sm">Employees</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {lastSyncData?.employees?.length || 0}
                    </div>
                    <p className="text-xs text-muted-foreground">Records synced</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="h-5 w-5 text-red-500" />
                      <CardTitle className="text-sm">Risk Events</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {lastSyncData?.riskEvents?.length || 0}
                    </div>
                    <p className="text-xs text-muted-foreground">Records synced</p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">Manual Data Sync</h3>
                      <p className="text-sm text-muted-foreground">
                        Trigger immediate data synchronization from ERP system
                      </p>
                    </div>
                    <Button 
                      onClick={syncData}
                      disabled={isLoading || !isConnected}
                      className="flex items-center space-x-2"
                    >
                      {isLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Activity className="h-4 w-4" />}
                      <span>Sync Now</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {!isConnected && (
                <Alert>
                  <Shield className="h-4 w-4" />
                  <AlertDescription>
                    Connection required before data sync. Please configure and test the connection first.
                  </AlertDescription>
                </Alert>
              )}
            </TabsContent>

            <TabsContent value="monitoring" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Connection Status</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon()}
                      <span className="capitalize">{connectionStatus}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Active Modules</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {Object.values(config.modules || {}).filter(Boolean).length}
                    </div>
                    <p className="text-xs text-muted-foreground">of {Object.keys(config.modules || {}).length}</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Sync Frequency</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm font-medium capitalize">
                      {config.syncFrequency || 'Not set'}
                    </div>
                    <p className="text-xs text-muted-foreground">Current schedule</p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default ERPConnector;