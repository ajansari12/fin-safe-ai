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
import { 
  Database, 
  CheckCircle, 
  XCircle, 
  Clock, 
  RefreshCw, 
  Settings,
  Shield,
  Activity,
  Users,
  CreditCard,
  TrendingUp
} from 'lucide-react';
import { coreBankingService, CoreBankingConfig } from '@/services/integrations/core-banking-service';
import { useToast } from '@/hooks/use-toast';

const CoreBankingConnector: React.FC = () => {
  const [config, setConfig] = useState<Partial<CoreBankingConfig>>({
    platform: 'temenos',
    baseUrl: '',
    authentication: {
      type: 'oauth',
      credentials: {}
    },
    syncSchedule: 'daily',
    dataMapping: {
      customers: true,
      accounts: true,
      transactions: true,
      compliance: true
    }
  });

  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'testing' | 'connected' | 'error'>('disconnected');
  const [lastSyncData, setLastSyncData] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    checkConnectionStatus();
  }, []);

  const checkConnectionStatus = async () => {
    try {
      const status = await coreBankingService.getIntegrationStatus();
      setIsConnected(status.connected);
      setConnectionStatus(status.connected ? 'connected' : 'disconnected');
    } catch (error) {
      console.error('Error checking connection status:', error);
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

  const handleDataMappingUpdate = (field: string, value: boolean) => {
    setConfig(prev => ({
      ...prev,
      dataMapping: {
        ...prev.dataMapping!,
        [field]: value
      }
    }));
  };

  const testConnection = async () => {
    setIsLoading(true);
    setConnectionStatus('testing');
    
    try {
      await coreBankingService.configure(config as CoreBankingConfig);
      const connected = await coreBankingService.testConnection();
      
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
    try {
      const data = await coreBankingService.syncData();
      setLastSyncData(data);
      toast({
        title: "Sync Successful",
        description: `Synced ${data.customers.length} customers, ${data.accounts.length} accounts, ${data.transactions.length} transactions`
      });
    } catch (error) {
      toast({
        title: "Sync Failed",
        description: "Failed to sync data from core banking system",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
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
              <Database className="h-6 w-6 text-blue-600" />
              <div>
                <CardTitle>Core Banking System Integration</CardTitle>
                <CardDescription>
                  Connect and sync data from your core banking platform
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
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="configuration">Configuration</TabsTrigger>
              <TabsTrigger value="data-sync">Data Sync</TabsTrigger>
              <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
            </TabsList>

            <TabsContent value="configuration" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="platform">Banking Platform</Label>
                    <Select
                      value={config.platform}
                      onValueChange={(value) => handleConfigUpdate('platform', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select platform" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="temenos">Temenos T24</SelectItem>
                        <SelectItem value="finastra">Finastra</SelectItem>
                        <SelectItem value="mambu">Mambu</SelectItem>
                        <SelectItem value="custom">Custom/Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="baseUrl">API Endpoint</Label>
                    <Input
                      id="baseUrl"
                      placeholder="https://api.corebanking.com/v1"
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
                        <SelectItem value="basic">Basic Auth</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="clientId">
                      {config.authentication?.type === 'oauth' ? 'Client ID' : 
                       config.authentication?.type === 'api_key' ? 'API Key' : 'Username'}
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
                       config.authentication?.type === 'api_key' ? 'API Secret' : 'Password'}
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
                    <Label htmlFor="syncSchedule">Sync Schedule</Label>
                    <Select
                      value={config.syncSchedule}
                      onValueChange={(value) => handleConfigUpdate('syncSchedule', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select schedule" />
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

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Data Mapping</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Object.entries(config.dataMapping || {}).map(([key, value]) => (
                    <div key={key} className="flex items-center space-x-2">
                      <Switch
                        id={key}
                        checked={value}
                        onCheckedChange={(checked) => handleDataMappingUpdate(key, checked)}
                      />
                      <Label htmlFor={key} className="capitalize">
                        {key.replace(/([A-Z])/g, ' $1').trim()}
                      </Label>
                    </div>
                  ))}
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

            <TabsContent value="data-sync" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center space-x-2">
                      <Users className="h-5 w-5 text-blue-500" />
                      <CardTitle className="text-sm">Customers</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {lastSyncData?.customers?.length || 0}
                    </div>
                    <p className="text-xs text-muted-foreground">Total synced</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center space-x-2">
                      <CreditCard className="h-5 w-5 text-green-500" />
                      <CardTitle className="text-sm">Accounts</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {lastSyncData?.accounts?.length || 0}
                    </div>
                    <p className="text-xs text-muted-foreground">Total synced</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="h-5 w-5 text-purple-500" />
                      <CardTitle className="text-sm">Transactions</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {lastSyncData?.transactions?.length || 0}
                    </div>
                    <p className="text-xs text-muted-foreground">Total synced</p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">Manual Data Sync</h3>
                      <p className="text-sm text-muted-foreground">
                        Trigger immediate data synchronization from core banking system
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Connection Health</CardTitle>
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
                    <CardTitle className="text-sm">Last Sync</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm text-muted-foreground">
                      {lastSyncData ? 'Recent' : 'No sync performed'}
                    </div>
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

export default CoreBankingConnector;