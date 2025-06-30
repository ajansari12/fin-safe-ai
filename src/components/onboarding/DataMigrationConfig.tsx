
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Database, 
  MapPin, 
  Shield, 
  TestTube,
  AlertTriangle,
  CheckCircle,
  RotateCcw,
  Settings
} from "lucide-react";

const DataMigrationConfig = () => {
  const [selectedMapping, setSelectedMapping] = useState(null);

  const dataSources = [
    {
      id: 1,
      name: "Core Banking System",
      type: "Temenos T24",
      status: "connected",
      recordCount: 1250000,
      tables: ["Accounts", "Customers", "Transactions", "Products"],
      lastSync: "2024-07-01 14:30"
    },
    {
      id: 2,
      name: "Risk Management System",
      type: "SAS Risk Manager",
      status: "mapping",
      recordCount: 85000,
      tables: ["RiskEvents", "Controls", "Assessments"],
      lastSync: "2024-07-01 12:15"
    },
    {
      id: 3,
      name: "Document Management",
      type: "SharePoint",
      status: "pending",
      recordCount: 15000,
      tables: ["Documents", "Policies", "Procedures"],
      lastSync: null
    }
  ];

  const mappingRules = [
    {
      id: 1,
      source: "T24.Customer",
      target: "ResilientFI.BusinessFunction",
      status: "completed",
      confidence: 95,
      records: 1200
    },
    {
      id: 2,
      source: "SAS.RiskEvent",
      target: "ResilientFI.IncidentLog",
      status: "in_progress",
      confidence: 88,
      records: 450
    },
    {
      id: 3,
      source: "SharePoint.Policy",
      target: "ResilientFI.GovernancePolicy",
      status: "review",
      confidence: 75,
      records: 120
    }
  ];

  const validationResults = [
    {
      check: "Data Completeness",
      source: "Core Banking",
      status: "passed",
      details: "99.8% of required fields populated",
      recordsChecked: 1250000
    },
    {
      check: "Data Quality",
      source: "Risk Management",
      status: "warning",
      details: "15 records with missing risk ratings",
      recordsChecked: 85000
    },
    {
      check: "Referential Integrity",
      source: "All Sources",
      status: "passed",
      details: "All foreign key relationships validated",
      recordsChecked: 1350000
    },
    {
      check: "Format Validation",
      source: "Document Management",
      status: "failed",
      details: "Invalid date formats in 8 documents",
      recordsChecked: 15000
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "connected":
      case "completed":
      case "passed": return "text-green-500";
      case "mapping":
      case "in_progress":
      case "warning": return "text-yellow-500";
      case "pending":
      case "review":
      case "failed": return "text-red-500";
      default: return "text-gray-500";
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "connected":
      case "completed":
      case "passed": return <Badge className="bg-green-500">Passed</Badge>;
      case "mapping":
      case "in_progress":
      case "warning": return <Badge className="bg-yellow-500">Warning</Badge>;
      case "pending":
      case "review":
      case "failed": return <Badge variant="destructive">Failed</Badge>;
      default: return <Badge variant="secondary">Unknown</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="mapping" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="mapping">Data Mapping</TabsTrigger>
          <TabsTrigger value="validation">Validation</TabsTrigger>
          <TabsTrigger value="testing">Testing</TabsTrigger>
          <TabsTrigger value="deployment">Deployment</TabsTrigger>
        </TabsList>

        <TabsContent value="mapping" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Data Sources
                </CardTitle>
                <CardDescription>
                  Connected systems and their synchronization status
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {dataSources.map((source) => (
                    <div key={source.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">{source.name}</h4>
                          <p className="text-sm text-muted-foreground">{source.type}</p>
                        </div>
                        <div className={`flex items-center gap-1 ${getStatusColor(source.status)}`}>
                          <div className="w-2 h-2 rounded-full bg-current" />
                          <span className="text-sm capitalize">{source.status}</span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Records:</span>
                          <p className="text-muted-foreground">{source.recordCount.toLocaleString()}</p>
                        </div>
                        <div>
                          <span className="font-medium">Last Sync:</span>
                          <p className="text-muted-foreground">{source.lastSync || "Never"}</p>
                        </div>
                      </div>
                      
                      <div>
                        <span className="font-medium text-sm">Tables:</span>
                        <div className="flex gap-1 mt-1">
                          {source.tables.map((table, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {table}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Mapping Rules
                </CardTitle>
                <CardDescription>
                  Field-level mapping configurations and transformations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mappingRules.map((rule) => (
                    <div key={rule.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <div className="text-sm font-medium">{rule.source}</div>
                          <div className="text-xs text-muted-foreground">↓</div>
                          <div className="text-sm font-medium">{rule.target}</div>
                        </div>
                        {getStatusBadge(rule.status)}
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Confidence Score</span>
                          <span>{rule.confidence}%</span>
                        </div>
                        <Progress value={rule.confidence} className="h-2" />
                      </div>
                      
                      <div className="text-sm text-muted-foreground">
                        {rule.records} records to migrate
                      </div>
                    </div>
                  ))}
                  
                  <Button variant="outline" className="w-full">
                    <MapPin className="h-4 w-4 mr-2" />
                    Add Mapping Rule
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="validation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Data Validation & Quality Checks
              </CardTitle>
              <CardDescription>
                Automated validation results and data quality assessment
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {validationResults.map((result, index) => (
                  <div key={index} className="border rounded-lg p-4 space-y-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-medium">{result.check}</h4>
                        <p className="text-sm text-muted-foreground">{result.source}</p>
                      </div>
                      {getStatusBadge(result.status)}
                    </div>
                    
                    <div className="text-sm text-muted-foreground">
                      {result.details}
                    </div>
                    
                    <div className="flex justify-between items-center text-xs text-muted-foreground">
                      <span>{result.recordsChecked.toLocaleString()} records checked</span>
                      {result.status === "failed" && (
                        <Button variant="outline" size="sm">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          Fix Issues
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="testing" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TestTube className="h-5 w-5" />
                  Sandbox Testing
                </CardTitle>
                <CardDescription>
                  Test environment for validation before production
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Data Migration Test</span>
                      <Badge className="bg-green-500">Passed</Badge>
                    </div>
                    <Progress value={100} className="h-2" />
                    <p className="text-xs text-muted-foreground">
                      All 15,000 test records migrated successfully
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Integration Test</span>
                      <Badge className="bg-blue-500">Running</Badge>
                    </div>
                    <Progress value={65} className="h-2" />
                    <p className="text-xs text-muted-foreground">
                      Testing API connections and data flow
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Performance Test</span>
                      <Badge variant="secondary">Pending</Badge>
                    </div>
                    <Progress value={0} className="h-2" />
                    <p className="text-xs text-muted-foreground">
                      Load testing scheduled for next week
                    </p>
                  </div>
                  
                  <Button className="w-full">
                    <TestTube className="h-4 w-4 mr-2" />
                    Run Full Test Suite
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <RotateCcw className="h-5 w-5" />
                  Rollback Capabilities
                </CardTitle>
                <CardDescription>
                  Data integrity and recovery options
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border rounded-lg p-3 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Backup Created</span>
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Full system backup completed at 2024-07-01 02:00 UTC
                    </p>
                  </div>
                  
                  <div className="border rounded-lg p-3 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Rollback Scripts</span>
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Automated rollback procedures tested and verified
                    </p>
                  </div>
                  
                  <div className="border rounded-lg p-3 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Data Validation</span>
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Checksum verification and integrity checks in place
                    </p>
                  </div>
                  
                  <Button variant="outline" className="w-full">
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Test Rollback Procedure
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="deployment" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Configuration Templates
              </CardTitle>
              <CardDescription>
                Institution-specific configuration based on assessment
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium">Risk Management Configuration</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Risk Categories</span>
                      <Badge variant="outline">15 configured</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">KRI Definitions</span>
                      <Badge variant="outline">42 configured</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Workflow Templates</span>
                      <Badge variant="outline">8 configured</Badge>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h4 className="font-medium">Governance Configuration</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm">Policy Templates</span>
                      <Badge variant="outline">12 configured</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Approval Workflows</span>
                      <Badge variant="outline">6 configured</Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">User Roles</span>
                      <Badge variant="outline">4 configured</Badge>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 flex gap-2">
                <Button>
                  <Settings className="h-4 w-4 mr-2" />
                  Deploy Configuration
                </Button>
                <Button variant="outline">
                  Preview Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DataMigrationConfig;
