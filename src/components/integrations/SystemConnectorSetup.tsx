
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { 
  Building2, 
  Database, 
  FileText, 
  Users, 
  Settings,
  TestTube,
  Shield,
  Key
} from "lucide-react";
import { coreBankingService, CoreBankingConfig } from "@/services/integrations/core-banking-service";
import { erpService } from "@/services/integrations/erp-service";

const SystemConnectorSetup: React.FC = () => {
  const [activeConnector, setActiveConnector] = useState("core-banking");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Core Banking Configuration
  const [coreBankingConfig, setCoreBankingConfig] = useState<Partial<CoreBankingConfig>>({
    platform: 'temenos',
    baseUrl: '',
    authentication: {
      type: 'oauth',
      credentials: {}
    },
    endpoints: {
      customers: '/api/customers',
      accounts: '/api/accounts',
      transactions: '/api/transactions',
      loans: '/api/loans'
    },
    dataMapping: {}
  });

  // ERP Configuration
  const [erpConfig, setERPConfig] = useState({
    platform: 'sap',
    baseUrl: '',
    authentication: {
      type: 'oauth',
      credentials: {}
    },
    modules: {
      financials: true,
      hr: true,
      procurement: false
    }
  });

  const handleCoreBankingSetup = async () => {
    try {
      setIsLoading(true);
      await coreBankingService.createCoreBankingIntegration(coreBankingConfig as CoreBankingConfig);
      toast({
        title: "Success",
        description: "Core banking integration configured successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to configure core banking integration",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleERPSetup = async () => {
    try {
      setIsLoading(true);
      await erpService.createERPIntegration(erpConfig);
      toast({
        title: "Success",
        description: "ERP integration configured successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to configure ERP integration",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestConnection = async (type: string) => {
    try {
      toast({
        title: "Testing Connection",
        description: "Attempting to connect to the system..."
      });
      
      // Simulate connection test
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Connection Successful",
        description: "Successfully connected to the external system"
      });
    } catch (error) {
      toast({
        title: "Connection Failed",
        description: "Unable to connect to the external system",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">System Connector Setup</h1>
        <p className="text-muted-foreground">
          Configure pre-built connectors for common financial institution systems
        </p>
      </div>

      <Tabs value={activeConnector} onValueChange={setActiveConnector}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="core-banking" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Core Banking
          </TabsTrigger>
          <TabsTrigger value="erp" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            ERP Systems
          </TabsTrigger>
          <TabsTrigger value="document-mgmt" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Document Mgmt
          </TabsTrigger>
          <TabsTrigger value="hr-systems" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            HR Systems
          </TabsTrigger>
        </TabsList>

        <TabsContent value="core-banking" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Core Banking System Integration
              </CardTitle>
              <CardDescription>
                Connect to popular core banking platforms like Temenos, FIS, and Jack Henry
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="banking-platform">Banking Platform</Label>
                  <Select 
                    value={coreBankingConfig.platform} 
                    onValueChange={(value: any) => setCoreBankingConfig(prev => ({ ...prev, platform: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="temenos">Temenos T24/Transact</SelectItem>
                      <SelectItem value="fis">FIS Profile/Horizon</SelectItem>
                      <SelectItem value="jack_henry">Jack Henry SilverLake/CIF 20/20</SelectItem>
                      <SelectItem value="custom">Custom/Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="banking-url">Base URL</Label>
                  <Input
                    id="banking-url"
                    placeholder="https://api.yourbank.com"
                    value={coreBankingConfig.baseUrl}
                    onChange={(e) => setCoreBankingConfig(prev => ({ ...prev, baseUrl: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <Label>Authentication Method</Label>
                <Select 
                  value={coreBankingConfig.authentication?.type} 
                  onValueChange={(value: any) => setCoreBankingConfig(prev => ({ 
                    ...prev, 
                    authentication: { ...prev.authentication!, type: value }
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="oauth">OAuth 2.0</SelectItem>
                    <SelectItem value="basic">Basic Authentication</SelectItem>
                    <SelectItem value="api_key">API Key</SelectItem>
                    <SelectItem value="certificate">Client Certificate</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {coreBankingConfig.authentication?.type === 'oauth' && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="client-id">Client ID</Label>
                    <Input id="client-id" placeholder="Your OAuth Client ID" />
                  </div>
                  <div>
                    <Label htmlFor="client-secret">Client Secret</Label>
                    <Input id="client-secret" type="password" placeholder="Your OAuth Client Secret" />
                  </div>
                </div>
              )}

              <div>
                <Label>API Endpoints Configuration</Label>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <div>
                    <Label htmlFor="customers-endpoint">Customers Endpoint</Label>
                    <Input
                      id="customers-endpoint"
                      placeholder="/api/customers"
                      value={coreBankingConfig.endpoints?.customers}
                      onChange={(e) => setCoreBankingConfig(prev => ({ 
                        ...prev, 
                        endpoints: { ...prev.endpoints!, customers: e.target.value }
                      }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="accounts-endpoint">Accounts Endpoint</Label>
                    <Input
                      id="accounts-endpoint"
                      placeholder="/api/accounts"
                      value={coreBankingConfig.endpoints?.accounts}
                      onChange={(e) => setCoreBankingConfig(prev => ({ 
                        ...prev, 
                        endpoints: { ...prev.endpoints!, accounts: e.target.value }
                      }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="transactions-endpoint">Transactions Endpoint</Label>
                    <Input
                      id="transactions-endpoint"
                      placeholder="/api/transactions"
                      value={coreBankingConfig.endpoints?.transactions}
                      onChange={(e) => setCoreBankingConfig(prev => ({ 
                        ...prev, 
                        endpoints: { ...prev.endpoints!, transactions: e.target.value }
                      }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="loans-endpoint">Loans Endpoint</Label>
                    <Input
                      id="loans-endpoint"
                      placeholder="/api/loans"
                      value={coreBankingConfig.endpoints?.loans}
                      onChange={(e) => setCoreBankingConfig(prev => ({ 
                        ...prev, 
                        endpoints: { ...prev.endpoints!, loans: e.target.value }
                      }))}
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button 
                  onClick={() => handleTestConnection('core-banking')}
                  variant="outline"
                >
                  <TestTube className="h-4 w-4 mr-2" />
                  Test Connection
                </Button>
                <Button 
                  onClick={handleCoreBankingSetup}
                  disabled={isLoading}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Configure Integration
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="erp" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                ERP System Integration
              </CardTitle>
              <CardDescription>
                Connect to SAP, Oracle, Microsoft Dynamics, and other ERP systems
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="erp-platform">ERP Platform</Label>
                  <Select 
                    value={erpConfig.platform} 
                    onValueChange={(value) => setERPConfig(prev => ({ ...prev, platform: value as any }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sap">SAP ERP/S4HANA</SelectItem>
                      <SelectItem value="oracle">Oracle ERP Cloud</SelectItem>
                      <SelectItem value="dynamics">Microsoft Dynamics 365</SelectItem>
                      <SelectItem value="custom">Custom ERP</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="erp-url">ERP System URL</Label>
                  <Input
                    id="erp-url"
                    placeholder="https://erp.yourcompany.com"
                    value={erpConfig.baseUrl}
                    onChange={(e) => setERPConfig(prev => ({ ...prev, baseUrl: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <Label>Authentication Method</Label>
                <Select 
                  value={erpConfig.authentication.type} 
                  onValueChange={(value: any) => setERPConfig(prev => ({ 
                    ...prev, 
                    authentication: { ...prev.authentication, type: value }
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="oauth">OAuth 2.0</SelectItem>
                    <SelectItem value="basic">Username/Password</SelectItem>
                    <SelectItem value="api_key">API Key</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>ERP Modules to Sync</Label>
                <div className="space-y-3 mt-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Label htmlFor="financials-module">Financial Management</Label>
                      <Badge variant="outline">GL, AP, AR</Badge>
                    </div>
                    <Switch
                      id="financials-module"
                      checked={erpConfig.modules.financials}
                      onCheckedChange={(checked) => setERPConfig(prev => ({ 
                        ...prev, 
                        modules: { ...prev.modules, financials: checked }
                      }))}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Label htmlFor="hr-module">Human Resources</Label>
                      <Badge variant="outline">Employees, Org Structure</Badge>
                    </div>
                    <Switch
                      id="hr-module"
                      checked={erpConfig.modules.hr}
                      onCheckedChange={(checked) => setERPConfig(prev => ({ 
                        ...prev, 
                        modules: { ...prev.modules, hr: checked }
                      }))}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Label htmlFor="procurement-module">Procurement</Label>
                      <Badge variant="outline">PO, Vendors, Contracts</Badge>
                    </div>
                    <Switch
                      id="procurement-module"
                      checked={erpConfig.modules.procurement}
                      onCheckedChange={(checked) => setERPConfig(prev => ({ 
                        ...prev, 
                        modules: { ...prev.modules, procurement: checked }
                      }))}
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button 
                  onClick={() => handleTestConnection('erp')}
                  variant="outline"
                >
                  <TestTube className="h-4 w-4 mr-2" />
                  Test Connection
                </Button>
                <Button 
                  onClick={handleERPSetup}
                  disabled={isLoading}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Configure Integration
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="document-mgmt" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Document Management Integration
              </CardTitle>
              <CardDescription>
                Connect to SharePoint, Documentum, and other document management systems
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="dms-platform">DMS Platform</Label>
                  <Select defaultValue="sharepoint">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sharepoint">Microsoft SharePoint</SelectItem>
                      <SelectItem value="documentum">OpenText Documentum</SelectItem>
                      <SelectItem value="alfresco">Alfresco</SelectItem>
                      <SelectItem value="custom">Custom DMS</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="dms-url">Site/Server URL</Label>
                  <Input
                    id="dms-url"
                    placeholder="https://yourcompany.sharepoint.com"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="document-types">Document Types to Sync</Label>
                <Textarea
                  id="document-types"
                  placeholder="Policies, Procedures, Audit Reports, Compliance Documents..."
                  className="mt-1"
                />
              </div>

              <div className="flex gap-2">
                <Button 
                  onClick={() => handleTestConnection('dms')}
                  variant="outline"
                >
                  <TestTube className="h-4 w-4 mr-2" />
                  Test Connection
                </Button>
                <Button disabled={isLoading}>
                  <Settings className="h-4 w-4 mr-2" />
                  Configure Integration
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="hr-systems" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                HR System Integration
              </CardTitle>
              <CardDescription>
                Sync employee data and organizational structure from HR systems
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="hr-platform">HR Platform</Label>
                  <Select defaultValue="workday">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="workday">Workday</SelectItem>
                      <SelectItem value="successfactors">SAP SuccessFactors</SelectItem>
                      <SelectItem value="adp">ADP Workforce Now</SelectItem>
                      <SelectItem value="bamboohr">BambooHR</SelectItem>
                      <SelectItem value="custom">Custom HR System</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="hr-url">HR System URL</Label>
                  <Input
                    id="hr-url"
                    placeholder="https://hr.yourcompany.com"
                  />
                </div>
              </div>

              <div>
                <Label>Data to Synchronize</Label>
                <div className="space-y-3 mt-2">
                  <div className="flex items-center space-x-2">
                    <Switch id="employee-data" defaultChecked />
                    <Label htmlFor="employee-data">Employee Master Data</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="org-structure" defaultChecked />
                    <Label htmlFor="org-structure">Organizational Structure</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="job-roles" />
                    <Label htmlFor="job-roles">Job Roles & Responsibilities</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="reporting-lines" defaultChecked />
                    <Label htmlFor="reporting-lines">Reporting Relationships</Label>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button 
                  onClick={() => handleTestConnection('hr')}
                  variant="outline"
                >
                  <TestTube className="h-4 w-4 mr-2" />
                  Test Connection
                </Button>
                <Button disabled={isLoading}>
                  <Settings className="h-4 w-4 mr-2" />
                  Configure Integration
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SystemConnectorSetup;
