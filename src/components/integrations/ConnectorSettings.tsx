
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Settings, Database, Users, FileText, Shield } from "lucide-react";

const ConnectorSettings: React.FC = () => {
  const [connectors, setConnectors] = useState([
    {
      id: 'crm',
      name: 'CRM Integration',
      type: 'Salesforce',
      status: 'connected',
      lastSync: '2024-01-15T10:30:00Z',
      enabled: true,
      config: {
        apiUrl: 'https://your-org.salesforce.com',
        clientId: 'your-client-id',
        syncFrequency: 'hourly'
      }
    },
    {
      id: 'dms',
      name: 'Document Management',
      type: 'SharePoint',
      status: 'disconnected',
      lastSync: null,
      enabled: false,
      config: {
        siteUrl: '',
        tenantId: '',
        syncFrequency: 'daily'
      }
    },
    {
      id: 'siem',
      name: 'SIEM Integration',
      type: 'Splunk',
      status: 'error',
      lastSync: '2024-01-14T15:45:00Z',
      enabled: true,
      config: {
        splunkUrl: 'https://your-splunk.com',
        token: 'your-token',
        syncFrequency: 'realtime'
      }
    }
  ]);

  const { toast } = useToast();

  const connectorTypes = [
    { value: 'salesforce', label: 'Salesforce', icon: <Users className="h-4 w-4" /> },
    { value: 'sharepoint', label: 'SharePoint', icon: <FileText className="h-4 w-4" /> },
    { value: 'splunk', label: 'Splunk', icon: <Shield className="h-4 w-4" /> },
    { value: 'servicenow', label: 'ServiceNow', icon: <Settings className="h-4 w-4" /> },
    { value: 'azure_ad', label: 'Azure AD', icon: <Users className="h-4 w-4" /> },
    { value: 'oracle', label: 'Oracle Database', icon: <Database className="h-4 w-4" /> }
  ];

  const syncFrequencies = [
    { value: 'realtime', label: 'Real-time' },
    { value: 'hourly', label: 'Hourly' },
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'manual', label: 'Manual Only' }
  ];

  const handleToggleConnector = (connectorId: string) => {
    setConnectors(prev => prev.map(connector => 
      connector.id === connectorId 
        ? { ...connector, enabled: !connector.enabled }
        : connector
    ));

    toast({
      title: "Connector Updated",
      description: "Connector status has been updated successfully",
    });
  };

  const handleTestConnection = (connectorId: string) => {
    // Simulate connection test
    setTimeout(() => {
      const success = Math.random() > 0.3; // 70% success rate for demo
      
      toast({
        title: success ? "Connection Successful" : "Connection Failed",
        description: success 
          ? "Connector is working correctly" 
          : "Unable to connect - check configuration",
        variant: success ? "default" : "destructive"
      });

      if (success) {
        setConnectors(prev => prev.map(connector => 
          connector.id === connectorId 
            ? { ...connector, status: 'connected', lastSync: new Date().toISOString() }
            : connector
        ));
      }
    }, 2000);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'connected':
        return <Badge className="bg-green-100 text-green-800">Connected</Badge>;
      case 'disconnected':
        return <Badge variant="secondary">Disconnected</Badge>;
      case 'error':
        return <Badge variant="destructive">Error</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            External Connector Settings
          </CardTitle>
          <CardDescription>
            Configure connections to external CRM, DMS, and other enterprise systems
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {connectors.map((connector) => (
            <div key={connector.id} className="border rounded-lg p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-muted rounded">
                    {connectorTypes.find(t => t.value === connector.type.toLowerCase())?.icon || <Settings className="h-4 w-4" />}
                  </div>
                  <div>
                    <h3 className="font-medium">{connector.name}</h3>
                    <p className="text-sm text-muted-foreground">{connector.type}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {getStatusBadge(connector.status)}
                  <Switch
                    checked={connector.enabled}
                    onCheckedChange={() => handleToggleConnector(connector.id)}
                  />
                </div>
              </div>

              {connector.enabled && (
                <div className="space-y-4 pl-11">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor={`${connector.id}-url`}>Service URL</Label>
                      <Input
                        id={`${connector.id}-url`}
                        placeholder="https://your-service.com"
                        defaultValue={connector.config.apiUrl || connector.config.siteUrl || connector.config.splunkUrl}
                      />
                    </div>
                    <div>
                      <Label htmlFor={`${connector.id}-frequency`}>Sync Frequency</Label>
                      <Select defaultValue={connector.config.syncFrequency}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {syncFrequencies.map((freq) => (
                            <SelectItem key={freq.value} value={freq.value}>
                              {freq.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor={`${connector.id}-auth`}>Authentication</Label>
                      <Input
                        id={`${connector.id}-auth`}
                        type="password"
                        placeholder="API Key / Token"
                        defaultValue={connector.config.clientId || connector.config.token}
                      />
                    </div>
                    <div>
                      <Label>Last Sync</Label>
                      <div className="text-sm text-muted-foreground pt-2">
                        {connector.lastSync 
                          ? new Date(connector.lastSync).toLocaleString()
                          : 'Never'
                        }
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleTestConnection(connector.id)}
                    >
                      Test Connection
                    </Button>
                    <Button variant="outline" size="sm">
                      Save Configuration
                    </Button>
                    <Button variant="outline" size="sm">
                      Sync Now
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Add New Connector</CardTitle>
          <CardDescription>
            Connect to additional external services
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {connectorTypes.map((type) => (
              <Button
                key={type.value}
                variant="outline"
                className="h-20 flex-col gap-2"
                onClick={() => toast({
                  title: "Coming Soon",
                  description: `${type.label} connector will be available soon`,
                })}
              >
                {type.icon}
                <span className="text-sm">{type.label}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ConnectorSettings;
