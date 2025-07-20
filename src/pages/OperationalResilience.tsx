
import React, { useEffect, useState } from "react";
import AuthenticatedLayout from "@/components/layout/AuthenticatedLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Shield, 
  Target, 
  AlertTriangle, 
  Clock, 
  Network, 
  TrendingUp,
  Plus,
  Calendar,
  CheckCircle,
  XCircle
} from "lucide-react";
import { useEnhancedAIAssistant } from "@/components/ai-assistant/EnhancedAIAssistantContext";
import { useIsMobile } from "@/hooks/use-mobile";

const OperationalResiliencePage = () => {
  const { setCurrentModule } = useEnhancedAIAssistant();
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState("dashboard");

  useEffect(() => {
    setCurrentModule("operational_resilience");
  }, [setCurrentModule]);

  // Mock data for demonstration
  const criticalOperations = [
    {
      id: 1,
      name: "Customer Payment Processing",
      criticality: "critical",
      status: "active",
      rto: "15 minutes",
      rpo: "5 minutes",
      lastTest: "2024-01-15",
      nextTest: "2024-04-15"
    },
    {
      id: 2,
      name: "ATM Network Operations",
      criticality: "critical", 
      status: "active",
      rto: "30 minutes",
      rpo: "10 minutes",
      lastTest: "2024-01-20",
      nextTest: "2024-04-20"
    },
    {
      id: 3,
      name: "Digital Banking Platform",
      criticality: "important",
      status: "active",
      rto: "1 hour",
      rpo: "15 minutes",
      lastTest: "2024-01-10",
      nextTest: "2024-04-10"
    }
  ];

  const impactTolerances = [
    {
      operation: "Payment Processing",
      type: "Downtime",
      tolerance: "15 minutes",
      current: "12 minutes",
      status: "within_tolerance"
    },
    {
      operation: "ATM Network",
      type: "Service Degradation", 
      tolerance: "5%",
      current: "3%",
      status: "within_tolerance"
    },
    {
      operation: "Digital Banking",
      type: "Transaction Delay",
      tolerance: "30 seconds",
      current: "45 seconds", 
      status: "breach"
    }
  ];

  const upcomingTests = [
    {
      id: 1,
      name: "Cyber Attack Simulation",
      date: "2024-02-15",
      type: "cyber_attack",
      scope: "Payment Systems",
      status: "scheduled"
    },
    {
      id: 2,
      name: "Data Center Failure",
      date: "2024-02-28",
      type: "infrastructure_failure",
      scope: "Core Banking",
      status: "planning"
    }
  ];

  const getDashboardContent = () => (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical Operations</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">
              8 tested this quarter
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tolerance Breaches</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">3</div>
            <p className="text-xs text-muted-foreground">
              Down from 5 last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Recovery Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">28 min</div>
            <p className="text-xs text-muted-foreground">
              Target: 30 minutes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Dependencies</CardTitle>
            <Network className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">47</div>
            <p className="text-xs text-muted-foreground">
              15 third-party, 32 internal
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Critical Operations Status */}
      <Card>
        <CardHeader>
          <CardTitle>Critical Operations Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {criticalOperations.map((operation) => (
              <div key={operation.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <Badge variant={operation.criticality === "critical" ? "destructive" : "secondary"}>
                    {operation.criticality}
                  </Badge>
                  <div>
                    <h4 className="font-medium">{operation.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      RTO: {operation.rto} | RPO: {operation.rpo}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm">Last Test: {operation.lastTest}</p>
                  <p className="text-sm text-muted-foreground">Next: {operation.nextTest}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Impact Tolerance Monitoring */}
      <Card>
        <CardHeader>
          <CardTitle>Impact Tolerance Monitoring</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {impactTolerances.map((tolerance, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium">{tolerance.operation}</h4>
                  <p className="text-sm text-muted-foreground">{tolerance.type}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm">Current: {tolerance.current}</p>
                  <p className="text-sm text-muted-foreground">Tolerance: {tolerance.tolerance}</p>
                </div>
                <div className="flex items-center">
                  {tolerance.status === "within_tolerance" ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-600" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const getCriticalOperationsContent = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Critical Operations</h2>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Operation
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Operations Mapping</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Network className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground">
              Interactive operations mapping will be implemented here
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const getImpactTolerancesContent = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Impact Tolerances</h2>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Define Tolerance
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tolerance Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground">
              Impact tolerance configuration interface will be implemented here
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const getScenarioTestingContent = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Scenario Testing</h2>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Schedule Test
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upcoming Tests</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {upcomingTests.map((test) => (
              <div key={test.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium">{test.name}</h4>
                  <p className="text-sm text-muted-foreground">{test.scope}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm">{test.date}</p>
                  <Badge variant="outline">{test.status}</Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const getRecoveryPlanningContent = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Recovery Planning</h2>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create Plan
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recovery Strategies</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground">
              Recovery planning interface will be implemented here
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <AuthenticatedLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Operational Resilience</h1>
          <p className="text-muted-foreground">
            Critical operations management and scenario testing for operational resilience
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className={isMobile ? "grid w-full grid-cols-2" : "grid w-full grid-cols-5"}>
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="operations">Operations</TabsTrigger>
            {!isMobile && <TabsTrigger value="tolerances">Tolerances</TabsTrigger>}
            {!isMobile && <TabsTrigger value="testing">Testing</TabsTrigger>}
            {!isMobile && <TabsTrigger value="recovery">Recovery</TabsTrigger>}
          </TabsList>

          <TabsContent value="dashboard">
            {getDashboardContent()}
          </TabsContent>

          <TabsContent value="operations">
            {getCriticalOperationsContent()}
          </TabsContent>

          <TabsContent value="tolerances">
            {getImpactTolerancesContent()}
          </TabsContent>

          <TabsContent value="testing">
            {getScenarioTestingContent()}
          </TabsContent>

          <TabsContent value="recovery">
            {getRecoveryPlanningContent()}
          </TabsContent>
        </Tabs>
      </div>
    </AuthenticatedLayout>
  );
};

export default OperationalResiliencePage;
