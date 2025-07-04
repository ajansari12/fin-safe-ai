import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  TrendingUp, 
  Users, 
  Calendar, 
  AlertTriangle,
  CheckCircle,
  Clock,
  FileText,
  Activity,
  Brain,
  Target,
  Shield,
  Lightbulb,
  BarChart3,
  Settings,
  Zap,
  RefreshCw,
  Database,
  Building,
  Sparkles,
  Loader2
} from "lucide-react";
import { useOnboarding } from "@/contexts/OnboardingContext";
import { useEnhancedAIAssistant } from "@/components/ai-assistant/EnhancedAIAssistantContext";
import { organizationalIntelligenceService } from "@/services/organizational-intelligence-service";
import { templateLibraryService } from "@/services/template-library-service";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useEnhancedOrganizationSetup } from "@/hooks/useEnhancedOrganizationSetup";

interface FrameworkGenerationStatus {
  status: 'not_started' | 'in_progress' | 'completed' | 'error';
  progress: number;
  generatedFrameworks: number;
  selectedFramework?: any;
  lastGenerated?: string;
}

interface OnboardingEffectivenessMetrics {
  completionRate: number;
  timeToValue: number;
  userSatisfaction: number;
  frameworkAdoptionRate: number;
  postOnboardingEngagement: number;
}

const EnhancedOnboardingDashboard = () => {
  const { onboardingStatus, currentSession, steps } = useOnboarding();
  const { generateOrganizationalAnalysis, isAnalyzing } = useEnhancedAIAssistant();
  const { profile } = useAuth();
  const { toast } = useToast();
  const { 
    orgData, 
    handleChange, 
    handleEnrichOrganization, 
    isEnrichingOrganization 
  } = useEnhancedOrganizationSetup();

  const [frameworkStatus, setFrameworkStatus] = useState<FrameworkGenerationStatus>({
    status: 'not_started',
    progress: 0,
    generatedFrameworks: 0
  });

  const [effectivenessMetrics, setEffectivenessMetrics] = useState<OnboardingEffectivenessMetrics>({
    completionRate: 85,
    timeToValue: 12, // minutes
    userSatisfaction: 4.2,
    frameworkAdoptionRate: 78,
    postOnboardingEngagement: 92
  });

  const [optimizationRecommendations, setOptimizationRecommendations] = useState<string[]>([
    "Complete organizational profile assessment for better personalization",
    "Upload existing policies for enhanced framework generation",
    "Schedule stakeholder training sessions",
    "Enable AI assistant for guided setup experience"
  ]);

  // Developer/Admin simulation states
  const [selectedOrgType, setSelectedOrgType] = useState<string>('');
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [currentOrgData, setCurrentOrgData] = useState<any>(null);

  const isAdmin = profile?.role === 'admin' || profile?.role === 'super_admin';

  useEffect(() => {
    loadFrameworkStatus();
    loadOptimizationRecommendations();
    loadCurrentOrgData();
  }, []);

  const loadCurrentOrgData = async () => {
    if (!profile?.organization_id) return;
    
    try {
      const { data, error } = await supabase
        .from('organizations')
        .select('org_type, sub_sector, regulatory_classification, capital_tier')
        .eq('id', profile.organization_id)
        .single();
      
      if (error) throw error;
      
      setCurrentOrgData(data);
      setSelectedOrgType(data?.org_type || '');
    } catch (error) {
      console.error('Error loading organization data:', error);
    }
  };

  const handleOrgTypeChange = async (newOrgType: string) => {
    if (!profile?.organization_id || !isAdmin) return;
    
    setIsRegenerating(true);
    try {
      // First, update the organization type in the database
      const { error: updateError } = await supabase
        .from('organizations')
        .update({ 
          org_type: newOrgType,
          // Set default sub_sector and regulatory_classification based on org_type
          sub_sector: getDefaultSubSector(newOrgType),
          regulatory_classification: getDefaultRegulatoryClassification(newOrgType)
        })
        .eq('id', profile.organization_id);
      
      if (updateError) throw updateError;
      
      // Then, regenerate sample data
      const { data, error: functionError } = await supabase.functions.invoke('generate-sample-data', {
        body: { regenerate: true }
      });
      
      if (functionError) throw functionError;
      
      setSelectedOrgType(newOrgType);
      await loadCurrentOrgData();
      
      toast({
        title: "Organization Type Updated",
        description: "Sample data has been regenerated for the new organization type.",
      });
    } catch (error) {
      console.error('Error updating organization type:', error);
      toast({
        title: "Update Failed",
        description: "Failed to update organization type. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsRegenerating(false);
    }
  };

  const getDefaultSubSector = (orgType: string) => {
    switch (orgType) {
      case 'banking-schedule-i': return 'Retail Banking';
      case 'banking-schedule-ii': return 'Foreign Banking';
      case 'banking-schedule-iii': return 'Cooperative Banking';
      case 'credit-union': return 'Community Banking';
      case 'fintech': return 'Digital Finance';
      default: return 'General Finance';
    }
  };

  const getDefaultRegulatoryClassification = (orgType: string) => {
    switch (orgType) {
      case 'banking-schedule-i': return ['OSFI', 'Basel III', 'CDIC'];
      case 'banking-schedule-ii': return ['OSFI', 'Basel III', 'E-21'];
      case 'banking-schedule-iii': return ['OSFI', 'CDIC'];
      case 'credit-union': return ['Provincial Regulator', 'CUDIC'];
      case 'fintech': return ['FINTRAC', 'Privacy Act'];
      default: return ['General Compliance'];
    }
  };

  const loadFrameworkStatus = async () => {
    // Mock implementation - would integrate with actual framework generation service
    setFrameworkStatus({
      status: 'in_progress',
      progress: 65,
      generatedFrameworks: 3,
      lastGenerated: new Date().toISOString()
    });
  };

  const loadOptimizationRecommendations = async () => {
    try {
      // Generate personalized recommendations based on onboarding progress
      const completedSteps = steps.filter(s => s.completed).length;
      const recommendations = [];

      if (completedSteps < steps.length) {
        recommendations.push("Complete remaining onboarding steps for full platform access");
      }

      if (!currentSession) {
        recommendations.push("Resume onboarding to unlock advanced features");
      }

      recommendations.push("Explore AI-powered organizational insights");
      recommendations.push("Set up automated risk monitoring");

      setOptimizationRecommendations(recommendations);
    } catch (error) {
      console.error('Error loading recommendations:', error);
    }
  };

  const handleGenerateInsights = async () => {
    try {
      await generateOrganizationalAnalysis();
      toast({
        title: "AI Analysis Complete",
        description: "Comprehensive organizational insights have been generated.",
      });
    } catch (error) {
      toast({
        title: "Analysis Failed",
        description: "Failed to generate insights. Please try again.",
        variant: "destructive",
      });
    }
  };

  const completedSteps = steps.filter(s => s.completed).length;
  const totalSteps = steps.length;
  const progressPercentage = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0;

  const recentActivities = [
    {
      id: 1,
      type: "framework_generation",
      description: "AI framework generation completed",
      timestamp: "2 hours ago",
      status: "completed"
    },
    {
      id: 2,
      type: "profile_assessment",
      description: "Organizational profile assessment updated",
      timestamp: "4 hours ago",
      status: "completed"
    },
    {
      id: 3,
      type: "onboarding_step",
      description: "Feature discovery step completed",
      timestamp: "6 hours ago",
      status: "completed"
    },
    {
      id: 4,
      type: "ai_analysis",
      description: "Intelligent recommendations generated",
      timestamp: "1 day ago",
      status: "completed"
    }
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "framework_generation": return <Target className="h-4 w-4 text-green-500" />;
      case "profile_assessment": return <Users className="h-4 w-4 text-blue-500" />;
      case "onboarding_step": return <CheckCircle className="h-4 w-4 text-purple-500" />;
      case "ai_analysis": return <Brain className="h-4 w-4 text-orange-500" />;
      default: return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Onboarding Progress Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Onboarding Progress</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedSteps}/{totalSteps}</div>
            <Progress value={progressPercentage} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              {Math.round(progressPercentage)}% complete
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Framework Generation</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{frameworkStatus.generatedFrameworks}</div>
            <Progress value={frameworkStatus.progress} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              AI-generated frameworks ready
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Time to Value</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{effectivenessMetrics.timeToValue}m</div>
            <p className="text-xs text-muted-foreground">
              Average setup time
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AI Assistance</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Active</div>
            <p className="text-xs text-muted-foreground">
              Intelligent guidance enabled
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Developer/Admin Organization Type Simulation */}
      {isAdmin && (
        <Card className="border-2 border-orange-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-700">
              <Settings className="h-5 w-5" />
              Developer/Admin: Organization Type Simulation
            </CardTitle>
            <CardDescription>
              Switch between different organization types to test templates and sample data generation.
              This will re-seed the organization with appropriate boilerplate data.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Organization Type</label>
                  <Select 
                    value={selectedOrgType} 
                    onValueChange={handleOrgTypeChange}
                    disabled={isRegenerating}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select organization type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="banking-schedule-i">Schedule I Bank</SelectItem>
                      <SelectItem value="banking-schedule-ii">Schedule II Bank</SelectItem>
                      <SelectItem value="banking-schedule-iii">Schedule III Bank</SelectItem>
                      <SelectItem value="credit-union">Credit Union</SelectItem>
                      <SelectItem value="fintech">FinTech</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                {currentOrgData && (
                  <div className="text-sm space-y-1">
                    <div><strong>Sub-sector:</strong> {currentOrgData.sub_sector || 'Not specified'}</div>
                    <div><strong>Regulatory Classification:</strong> {
                      Array.isArray(currentOrgData.regulatory_classification) 
                        ? currentOrgData.regulatory_classification.join(', ') 
                        : 'Not specified'
                    }</div>
                    <div><strong>Capital Tier:</strong> {currentOrgData.capital_tier || 'Not specified'}</div>
                  </div>
                )}
              </div>
              
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Database className="h-4 w-4 text-blue-600" />
                    <div className="font-medium text-blue-800">Sample Data Generation</div>
                  </div>
                  <div className="text-sm text-blue-700">
                    Changing organization type will regenerate:
                    • Business functions and processes
                    • KRI definitions and sample data
                    • Governance policy templates
                    • Third-party vendor profiles
                    • AI assistant context
                  </div>
                </div>
                
                {isRegenerating && (
                  <div className="flex items-center gap-2 text-orange-600">
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span className="text-sm">Regenerating sample data...</span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="progress" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="organization">Organization</TabsTrigger>
          <TabsTrigger value="progress">Progress</TabsTrigger>
          <TabsTrigger value="frameworks">Frameworks</TabsTrigger>
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
          <TabsTrigger value="optimization">Optimization</TabsTrigger>
        </TabsList>

        <TabsContent value="organization" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Organization Setup
              </CardTitle>
              <CardDescription>
                Configure your organization details with AI-powered auto-population
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Organization Name Section */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="orgName">Organization Name</Label>
                    <div className="flex gap-2">
                      <Input
                        id="orgName"
                        value={orgData.name}
                        onChange={(e) => handleChange('name', e.target.value)}
                        placeholder="Enter your organization name"
                        disabled={isEnrichingOrganization}
                      />
                      <Button
                        onClick={() => handleEnrichOrganization()}
                        disabled={!orgData.name.trim() || isEnrichingOrganization}
                        variant="outline"
                        size="sm"
                        className="shrink-0"
                      >
                        {isEnrichingOrganization ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Enriching...
                          </>
                        ) : (
                          <>
                            <Sparkles className="h-4 w-4 mr-2" />
                            Auto-Populate
                          </>
                        )}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Click "Auto-Populate" to automatically fill organization details using AI
                    </p>
                  </div>

                  {isEnrichingOrganization && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />
                        <div className="font-medium text-blue-800">Enrichment in progress...</div>
                      </div>
                      <div className="text-sm text-blue-700">
                        Searching for public information about "{orgData.name}"...
                      </div>
                    </div>
                  )}
                </div>

                {/* Enriched Organization Details */}
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="orgType">Organization Type</Label>
                      <Select
                        value={orgData.orgType || ""}
                        onValueChange={(value) => handleChange('orgType', value)}
                        disabled={isEnrichingOrganization}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="banking-schedule-i">Schedule I Bank</SelectItem>
                          <SelectItem value="banking-schedule-ii">Schedule II Bank</SelectItem>
                          <SelectItem value="banking-schedule-iii">Schedule III Bank</SelectItem>
                          <SelectItem value="credit-union">Credit Union</SelectItem>
                          <SelectItem value="fintech">FinTech</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="subSector">Sub-Sector</Label>
                      <Input
                        id="subSector"
                        value={orgData.subSector || ""}
                        onChange={(e) => handleChange('subSector', e.target.value)}
                        placeholder="e.g., Retail Banking"
                        disabled={isEnrichingOrganization}
                      />
                    </div>

                    <div>
                      <Label htmlFor="geographicScope">Geographic Scope</Label>
                      <Select
                        value={orgData.geographicScope || ""}
                        onValueChange={(value) => handleChange('geographicScope', value)}
                        disabled={isEnrichingOrganization}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select scope" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="local">Local</SelectItem>
                          <SelectItem value="regional">Regional</SelectItem>
                          <SelectItem value="national">National</SelectItem>
                          <SelectItem value="international">International</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="capitalTier">Capital Tier</Label>
                      <Select
                        value={orgData.capitalTier || ""}
                        onValueChange={(value) => handleChange('capitalTier', value)}
                        disabled={isEnrichingOrganization}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select tier" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Tier 1">Tier 1</SelectItem>
                          <SelectItem value="Tier 2">Tier 2</SelectItem>
                          <SelectItem value="Tier 3">Tier 3</SelectItem>
                          <SelectItem value="Not Applicable">Not Applicable</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="employeeCount">Employee Count</Label>
                      <Input
                        id="employeeCount"
                        type="number"
                        value={orgData.employeeCount || ""}
                        onChange={(e) => handleChange('employeeCount', parseInt(e.target.value) || null)}
                        placeholder="Number of employees"
                        disabled={isEnrichingOrganization}
                      />
                    </div>

                    <div>
                      <Label htmlFor="assetSize">Asset Size (CAD Millions)</Label>
                      <Input
                        id="assetSize"
                        type="number"
                        value={orgData.assetSize || ""}
                        onChange={(e) => handleChange('assetSize', parseInt(e.target.value) || null)}
                        placeholder="Total assets in millions"
                        disabled={isEnrichingOrganization}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* AI Enhancement Info */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="h-5 w-5 text-purple-600" />
                  <div className="font-medium text-purple-800">AI-Powered Organization Enrichment</div>
                </div>
                <div className="text-sm text-purple-700">
                  Our AI assistant can automatically populate organization details by analyzing publicly available information.
                  Simply enter your organization name and click "Auto-Populate" to get started.
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="progress" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest onboarding progress and milestones</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentActivities.map((activity) => (
                    <div key={activity.id} className="flex items-start space-x-3">
                      {getActivityIcon(activity.type)}
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium">{activity.description}</p>
                        <p className="text-xs text-muted-foreground">{activity.timestamp}</p>
                      </div>
                      <Badge variant={activity.status === "completed" ? "default" : "secondary"}>
                        {activity.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Onboarding Steps Status */}
            <Card>
              <CardHeader>
                <CardTitle>Setup Steps</CardTitle>
                <CardDescription>Track your onboarding journey</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {steps.map((step, index) => (
                    <div key={step.id} className="flex items-center space-x-3">
                      <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
                        step.completed 
                          ? 'bg-green-500 text-white' 
                          : index === steps.findIndex(s => !s.completed)
                          ? 'bg-primary text-white'
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        {step.completed ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : (
                          <span className="text-xs">{index + 1}</span>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium">{step.name}</div>
                        {step.completed && step.completedAt && (
                          <div className="text-xs text-muted-foreground">
                            Completed {new Date(step.completedAt).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                      {step.completed && (
                        <Badge variant="secondary" className="text-xs">
                          Done
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="frameworks" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Framework Generation Status
              </CardTitle>
              <CardDescription>
                AI-powered framework generation and deployment progress
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-primary">{frameworkStatus.generatedFrameworks}</div>
                  <div className="text-sm text-muted-foreground">Generated Frameworks</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{frameworkStatus.progress}%</div>
                  <div className="text-sm text-muted-foreground">Generation Progress</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">Ready</div>
                  <div className="text-sm text-muted-foreground">Deployment Status</div>
                </div>
              </div>

              {frameworkStatus.status === 'completed' && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                    <div className="font-medium text-green-800">Framework Generation Complete</div>
                  </div>
                  <div className="text-sm text-green-700">
                    Your customized risk management frameworks are ready for deployment. 
                    Review and deploy them to start managing risks effectively.
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Overall Progress</span>
                  <span>{frameworkStatus.progress}%</span>
                </div>
                <Progress value={frameworkStatus.progress} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                AI-Powered Insights
              </CardTitle>
              <CardDescription>
                Intelligent analysis and recommendations for your organization
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="text-center py-8">
                <Brain className="h-16 w-16 text-primary mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Organizational Intelligence Analysis</h3>
                <p className="text-muted-foreground mb-6">
                  Get comprehensive AI-powered insights about your organization's risk posture, 
                  maturity levels, and optimization opportunities.
                </p>
                <Button 
                  onClick={handleGenerateInsights}
                  disabled={isAnalyzing}
                  size="lg"
                >
                  {isAnalyzing ? (
                    <>
                      <TrendingUp className="h-4 w-4 mr-2 animate-pulse" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Brain className="h-4 w-4 mr-2" />
                      Generate AI Insights
                    </>
                  )}
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <Lightbulb className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                  <div className="font-medium">Predictive Analytics</div>
                  <div className="text-sm text-muted-foreground">Risk trend forecasting</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <BarChart3 className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                  <div className="font-medium">Benchmarking</div>
                  <div className="text-sm text-muted-foreground">Industry comparisons</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <Shield className="h-8 w-8 text-green-500 mx-auto mb-2" />
                  <div className="font-medium">Risk Assessment</div>
                  <div className="text-sm text-muted-foreground">Comprehensive scoring</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <Zap className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                  <div className="font-medium">Optimization</div>
                  <div className="text-sm text-muted-foreground">Actionable recommendations</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="optimization" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Post-Onboarding Optimization
              </CardTitle>
              <CardDescription>
                Recommendations to maximize your platform effectiveness
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Effectiveness Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{effectivenessMetrics.completionRate}%</div>
                  <div className="text-sm text-muted-foreground">Completion Rate</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{effectivenessMetrics.userSatisfaction}/5</div>
                  <div className="text-sm text-muted-foreground">User Satisfaction</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">{effectivenessMetrics.postOnboardingEngagement}%</div>
                  <div className="text-sm text-muted-foreground">Platform Engagement</div>
                </div>
              </div>

              {/* Optimization Recommendations */}
              <div>
                <h4 className="font-medium mb-4">Optimization Recommendations</h4>
                <div className="space-y-3">
                  {optimizationRecommendations.map((recommendation, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                      <Lightbulb className="h-5 w-5 text-yellow-500 mt-0.5" />
                      <div className="flex-1">
                        <div className="text-sm font-medium">{recommendation}</div>
                      </div>
                      <Button size="sm" variant="outline">
                        Apply
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div>
                <h4 className="font-medium mb-4">Quick Actions</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button variant="outline" className="justify-start h-auto p-4">
                    <div className="text-left">
                      <div className="font-medium">Enable Advanced Analytics</div>
                      <div className="text-sm text-muted-foreground">Unlock predictive insights</div>
                    </div>
                  </Button>
                  <Button variant="outline" className="justify-start h-auto p-4">
                    <div className="text-left">
                      <div className="font-medium">Schedule Training</div>
                      <div className="text-sm text-muted-foreground">Team knowledge transfer</div>
                    </div>
                  </Button>
                  <Button variant="outline" className="justify-start h-auto p-4">
                    <div className="text-left">
                      <div className="font-medium">Configure Integrations</div>
                      <div className="text-sm text-muted-foreground">Connect external systems</div>
                    </div>
                  </Button>
                  <Button variant="outline" className="justify-start h-auto p-4">
                    <div className="text-left">
                      <div className="font-medium">Deploy Frameworks</div>
                      <div className="text-sm text-muted-foreground">Activate risk management</div>
                    </div>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default EnhancedOnboardingDashboard;