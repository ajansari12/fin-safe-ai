import React, { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/components/layout/AuthenticatedLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Brain, 
  FileText, 
  Building2, 
  Target,
  TrendingUp,
  Users,
  ArrowRight,
  Activity,
  Workflow,
  Zap
} from 'lucide-react';
import AdaptiveQuestionnaire from '@/components/organizational-intelligence/AdaptiveQuestionnaire';
import OrganizationalProfileDashboard from '@/components/organizational-intelligence/OrganizationalProfileDashboard';
import AdvancedIntelligenceDashboard from '@/components/organizational-intelligence/AdvancedIntelligenceDashboard';
import IntelligentAutomationPanel from '@/components/organizational-intelligence/IntelligentAutomationPanel';
import WorkflowOrchestrationPanel from '@/components/organizational-intelligence/WorkflowOrchestrationPanel';
import RealTimeIntelligenceHub from '@/components/organizational-intelligence/RealTimeIntelligenceHub';
import { organizationalIntelligenceService } from '@/services/organizational-intelligence-service';
import { getCurrentUserProfile } from '@/lib/supabase-utils';
import { toast } from 'sonner';
import type { QuestionnaireTemplate, OrganizationalProfile } from '@/types/organizational-intelligence';

const OrganizationalIntelligence: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [templates, setTemplates] = useState<QuestionnaireTemplate[]>([]);
  const [profile, setProfile] = useState<OrganizationalProfile | null>(null);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [userOrg, setUserOrg] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      
      // Load user profile and organization
      const userProfile = await getCurrentUserProfile();
      setUserOrg(userProfile);

      // Load organizational profile
      const orgProfile = await organizationalIntelligenceService.getOrganizationalProfile();
      setProfile(orgProfile);

      // Load questionnaire templates
      const questionnaires = await organizationalIntelligenceService.getQuestionnaireTemplates();
      setTemplates(questionnaires);

      // If no profile exists, show questionnaire tab
      if (!orgProfile && questionnaires.length > 0) {
        setActiveTab('assessment');
      }
    } catch (error) {
      console.error('Error loading initial data:', error);
      toast.error('Failed to load organizational intelligence data');
    } finally {
      setLoading(false);
    }
  };

  const handleQuestionnaireComplete = async (responses: Record<string, any>) => {
    toast.success('Assessment completed! Generating organizational profile...');
    
    // Reload profile after completion
    setTimeout(async () => {
      const updatedProfile = await organizationalIntelligenceService.getOrganizationalProfile();
      setProfile(updatedProfile);
      setActiveTab('profile');
    }, 1000);
  };

  const startAssessment = (templateId: string) => {
    setSelectedTemplateId(templateId);
    setActiveTab('questionnaire');
  };

  if (loading) {
    return (
      <AuthenticatedLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <Brain className="h-12 w-12 mx-auto mb-4 text-blue-500 animate-pulse" />
            <p className="text-gray-600">Loading Organizational Intelligence Engine...</p>
          </div>
        </div>
      </AuthenticatedLayout>
    );
  }

  return (
    <AuthenticatedLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Organizational Intelligence</h1>
            <p className="text-muted-foreground">
              Advanced AI-powered organizational profiling, predictive analytics, and intelligent automation
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Brain className="h-8 w-8 text-blue-500" />
            <span className="text-sm font-medium text-blue-600">Enhanced AI Engine v2.0</span>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-8">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="assessment" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Assessment
            </TabsTrigger>
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Profile
            </TabsTrigger>
            <TabsTrigger value="intelligence" className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
              AI Intelligence
            </TabsTrigger>
            <TabsTrigger value="realtime" className="flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Real-Time Hub
            </TabsTrigger>
            <TabsTrigger value="workflows" className="flex items-center gap-2">
              <Workflow className="h-4 w-4" />
              Workflows
            </TabsTrigger>
            <TabsTrigger value="automation" className="flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Automation
            </TabsTrigger>
            <TabsTrigger value="questionnaire" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Questionnaire
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {/* Welcome Card */}
              <Card className="md:col-span-2 lg:col-span-3">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-6 w-6 text-blue-500" />
                    Welcome to Advanced Organizational Intelligence
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-6 md:grid-cols-4">
                    <div className="text-center">
                      <FileText className="h-12 w-12 mx-auto mb-2 text-blue-500" />
                      <h3 className="font-medium mb-1">Smart Assessment</h3>
                      <p className="text-sm text-gray-600">
                        Adaptive questionnaire with AI-powered analysis
                      </p>
                    </div>
                    <div className="text-center">
                      <Activity className="h-12 w-12 mx-auto mb-2 text-green-500" />
                      <h3 className="font-medium mb-1">Real-Time Intelligence</h3>
                      <p className="text-sm text-gray-600">
                        Live monitoring and predictive insights
                      </p>
                    </div>
                    <div className="text-center">
                      <Workflow className="h-12 w-12 mx-auto mb-2 text-purple-500" />
                      <h3 className="font-medium mb-1">Workflow Orchestration</h3>
                      <p className="text-sm text-gray-600">
                        Automated workflow management and execution
                      </p>
                    </div>
                    <div className="text-center">
                      <Zap className="h-12 w-12 mx-auto mb-2 text-orange-500" />
                      <h3 className="font-medium mb-1">Intelligent Automation</h3>
                      <p className="text-sm text-gray-600">
                        AI-driven process automation and optimization
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Profile Status */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Profile Status</CardTitle>
                </CardHeader>
                <CardContent>
                  {profile ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Completeness</span>
                        <span className="text-sm font-medium">{profile.completeness_percentage || 0}%</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Profile Score</span>
                        <span className="text-sm font-medium">{profile.profile_score || 0}/100</span>
                      </div>
                      <Button 
                        size="sm" 
                        onClick={() => setActiveTab('profile')}
                        className="w-full flex items-center gap-2"
                      >
                        View Profile
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center">
                      <p className="text-sm text-gray-600 mb-3">No profile created yet</p>
                      <Button 
                        size="sm" 
                        onClick={() => setActiveTab('assessment')}
                        className="w-full flex items-center gap-2"
                      >
                        Start Assessment
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Advanced Features */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Advanced Features</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setActiveTab('realtime')}
                    className="w-full justify-start"
                  >
                    <Activity className="h-4 w-4 mr-2" />
                    Real-Time Intelligence
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setActiveTab('workflows')}
                    className="w-full justify-start"
                  >
                    <Workflow className="h-4 w-4 mr-2" />
                    Workflow Orchestration
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setActiveTab('automation')}
                    className="w-full justify-start"
                    disabled={!profile}
                  >
                    <Zap className="h-4 w-4 mr-2" />
                    Intelligent Automation
                  </Button>
                </CardContent>
              </Card>

              {/* Intelligence Features */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Intelligence Capabilities</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                      <span className="text-sm">Predictive Risk Analytics</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full" />
                      <span className="text-sm">Intelligent Recommendations</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full" />
                      <span className="text-sm">Maturity Progression Analysis</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-orange-500 rounded-full" />
                      <span className="text-sm">Automated Workflow Orchestration</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-pink-500 rounded-full" />
                      <span className="text-sm">Real-Time Intelligence Hub</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="assessment" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {templates.map((template) => (
                <Card key={template.id} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-base">{template.name}</CardTitle>
                    <p className="text-sm text-gray-600">{template.description}</p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span>Target Sector:</span>
                        <Badge variant="outline">
                          {template.target_sector?.replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'General'}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span>Version:</span>
                        <span className="text-gray-600">{template.version}</span>
                      </div>
                      <Button 
                        onClick={() => startAssessment(template.id)}
                        className="w-full flex items-center gap-2"
                      >
                        Start Assessment
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {templates.length === 0 && (
              <Card>
                <CardContent className="text-center py-12">
                  <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Assessments Available</h3>
                  <p className="text-gray-500">Assessment templates will be available soon.</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="profile" className="space-y-6">
            <OrganizationalProfileDashboard />
          </TabsContent>

          <TabsContent value="intelligence" className="space-y-6">
            {profile ? (
              <AdvancedIntelligenceDashboard profile={profile} />
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <Brain className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">AI Intelligence Unavailable</h3>
                  <p className="text-gray-500 mb-4">Complete your organizational profile to unlock AI-powered insights.</p>
                  <Button onClick={() => setActiveTab('assessment')}>
                    Complete Assessment
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="realtime" className="space-y-6">
            {profile && userOrg ? (
              <RealTimeIntelligenceHub 
                orgId={userOrg.organization_id} 
                profileId={profile.id} 
              />
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <Activity className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Real-Time Intelligence Unavailable</h3>
                  <p className="text-gray-500 mb-4">Complete your organizational profile to access real-time intelligence.</p>
                  <Button onClick={() => setActiveTab('assessment')}>
                    Complete Assessment
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="workflows" className="space-y-6">
            {userOrg ? (
              <WorkflowOrchestrationPanel orgId={userOrg.organization_id} />
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <Workflow className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Workflow Orchestration Unavailable</h3>
                  <p className="text-gray-500 mb-4">Organization profile required for workflow management.</p>
                  <Button onClick={() => setActiveTab('assessment')}>
                    Complete Assessment
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="automation" className="space-y-6">
            {profile ? (
              <IntelligentAutomationPanel orgId={profile.org_id} />
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <Zap className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Automation Unavailable</h3>
                  <p className="text-gray-500 mb-4">Complete your organizational profile to enable intelligent automation.</p>
                  <Button onClick={() => setActiveTab('assessment')}>
                    Complete Assessment
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="questionnaire" className="space-y-6">
            {selectedTemplateId ? (
              <AdaptiveQuestionnaire
                templateId={selectedTemplateId}
                onComplete={handleQuestionnaireComplete}
                onSave={() => {}}
              />
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <Brain className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Questionnaire Selected</h3>
                  <p className="text-gray-500 mb-4">Please select an assessment from the Assessment tab to begin.</p>
                  <Button onClick={() => setActiveTab('assessment')}>
                    Browse Assessments
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AuthenticatedLayout>
  );
};

export default OrganizationalIntelligence;
