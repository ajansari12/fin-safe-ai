
import React, { useEffect, useState } from "react";
import AuthenticatedLayout from "@/components/layout/AuthenticatedLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Settings, 
  FileText, 
  Target, 
  BarChart3, 
  Shield, 
  CheckCircle,
  Plus,
  Edit,
  Eye
} from "lucide-react";
import { useEnhancedAIAssistant } from "@/components/ai-assistant/EnhancedAIAssistantContext";
import { useIsMobile } from "@/hooks/use-mobile";

const FrameworkManagementPage = () => {
  const { setCurrentModule } = useEnhancedAIAssistant();
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    setCurrentModule("framework_management");
  }, [setCurrentModule]);

  // Mock data for demonstration
  const frameworkOverview = {
    version: "2.1.0",
    lastUpdated: "2024-01-15",
    status: "active",
    compliance: "OSFI E-21",
    categories: 8,
    methodologies: 12,
    policies: 45
  };

  const riskCategories = [
    {
      id: 1,
      name: "Operational Risk",
      subcategories: 5,
      methodology: "Scenario-based Assessment",
      owner: "Risk Management",
      lastReview: "2024-01-10"
    },
    {
      id: 2,
      name: "Credit Risk", 
      subcategories: 3,
      methodology: "Statistical Modeling",
      owner: "Credit Risk Team",
      lastReview: "2024-01-12"
    },
    {
      id: 3,
      name: "Market Risk",
      subcategories: 4,
      methodology: "VaR Analysis",
      owner: "Market Risk Team", 
      lastReview: "2024-01-08"
    }
  ];

  const methodologies = [
    {
      name: "Risk Assessment",
      type: "assessment",
      applicable: "All Risk Types",
      steps: 6,
      tools: 3,
      status: "active"
    },
    {
      name: "Impact Analysis",
      type: "measurement", 
      applicable: "Operational Risk",
      steps: 4,
      tools: 2,
      status: "active"
    },
    {
      name: "Control Testing",
      type: "monitoring",
      applicable: "Control Framework",
      steps: 5,
      tools: 4,
      status: "active"
    }
  ];

  const getOverviewContent = () => (
    <div className="space-y-6">
      {/* Framework Status Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Framework Version</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{frameworkOverview.version}</div>
            <p className="text-xs text-muted-foreground">
              Updated: {frameworkOverview.lastUpdated}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Risk Categories</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{frameworkOverview.categories}</div>
            <p className="text-xs text-muted-foreground">
              With 24 subcategories
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Methodologies</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{frameworkOverview.methodologies}</div>
            <p className="text-xs text-muted-foreground">
              All validated and approved
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Compliance Status</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">98%</div>
            <p className="text-xs text-muted-foreground">
              OSFI E-21 compliant
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Framework Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Framework Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div>
                <h4 className="font-medium">Risk Management Framework v{frameworkOverview.version}</h4>
                <p className="text-sm text-muted-foreground">
                  {frameworkOverview.compliance} compliant framework
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="text-green-600">
                  <CheckCircle className="mr-1 h-3 w-3" />
                  Active
                </Badge>
                <Button variant="outline" size="sm">
                  <Edit className="mr-1 h-3 w-3" />
                  Configure
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const getRiskTaxonomyContent = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Risk Taxonomy</h2>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Category
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Risk Categories</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {riskCategories.map((category) => (
              <div key={category.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium">{category.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    {category.subcategories} subcategories | Owner: {category.owner}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm">{category.methodology}</p>
                  <p className="text-sm text-muted-foreground">Last review: {category.lastReview}</p>
                </div>
                <Button variant="outline" size="sm">
                  <Eye className="mr-1 h-3 w-3" />
                  View
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const getMethodologiesContent = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Methodologies</h2>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Methodology
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Assessment Methodologies</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {methodologies.map((methodology, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium">{methodology.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    Type: {methodology.type} | Applicable: {methodology.applicable}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm">{methodology.steps} steps</p>
                  <p className="text-sm text-muted-foreground">{methodology.tools} tools</p>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="text-green-600">
                    {methodology.status}
                  </Badge>
                  <Button variant="outline" size="sm">
                    <Edit className="mr-1 h-3 w-3" />
                    Edit
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const getAssessmentCriteriaContent = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Assessment Criteria</h2>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Criteria
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Risk Rating Matrix</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground">
              Risk rating matrix configuration will be implemented here
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const getEnforcementContent = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Framework Enforcement</h2>

      <Card>
        <CardHeader>
          <CardTitle>Compliance Monitoring</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground">
              Framework enforcement monitoring will be implemented here
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const getAnalyticsContent = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Framework Analytics</h2>

      <Card>
        <CardHeader>
          <CardTitle>Performance Metrics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground">
              Framework analytics and performance metrics will be implemented here
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
          <h1 className="text-3xl font-bold tracking-tight">Risk Management Framework</h1>
          <p className="text-muted-foreground">
            Configure and manage organizational risk framework methodologies and taxonomies
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className={isMobile ? "grid w-full grid-cols-3" : "grid w-full grid-cols-6"}>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="taxonomy">Taxonomy</TabsTrigger>
            <TabsTrigger value="methodologies">Methods</TabsTrigger>
            {!isMobile && <TabsTrigger value="criteria">Criteria</TabsTrigger>}
            {!isMobile && <TabsTrigger value="enforcement">Enforcement</TabsTrigger>}
            {!isMobile && <TabsTrigger value="analytics">Analytics</TabsTrigger>}
          </TabsList>

          <TabsContent value="overview">
            {getOverviewContent()}
          </TabsContent>

          <TabsContent value="taxonomy">
            {getRiskTaxonomyContent()}
          </TabsContent>

          <TabsContent value="methodologies">
            {getMethodologiesContent()}
          </TabsContent>

          <TabsContent value="criteria">
            {getAssessmentCriteriaContent()}
          </TabsContent>

          <TabsContent value="enforcement">
            {getEnforcementContent()}
          </TabsContent>

          <TabsContent value="analytics">
            {getAnalyticsContent()}
          </TabsContent>
        </Tabs>
      </div>
    </AuthenticatedLayout>
  );
};

export default FrameworkManagementPage;
