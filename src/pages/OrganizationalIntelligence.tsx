
import React, { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/components/layout/AuthenticatedLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Brain, 
  FileText, 
  Building2, 
  Target,
  TrendingUp,
  Users,
  ArrowRight
} from 'lucide-react';
import AdaptiveQuestionnaire from '@/components/organizational-intelligence/AdaptiveQuestionnaire';
import OrganizationalProfileDashboard from '@/components/organizational-intelligence/OrganizationalProfileDashboard';
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
              AI-powered organizational profiling and customized risk framework generation
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Brain className="h-8 w-8 text-blue-500" />
            <span className="text-sm font-medium text-blue-600">Powered by AI</span>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
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
            <TabsTrigger value="questionnaire" className="flex items-center gap-2">
              <Brain className="h-4 w-4" />
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
                    Welcome to Organizational Intelligence
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-6 md:grid-cols-3">
                    <div className="text-center">
                      <FileText className="h-12 w-12 mx-auto mb-2 text-blue-500" />
                      <h3 className="font-medium mb-1">Smart Assessment</h3>
                      <p className="text-sm text-gray-600">
                        Adaptive questionnaire that learns about your organization
                      </p>
                    </div>
                    <div className="text-center">
                      <Users className="h-12 w-12 mx-auto mb-2 text-green-500" />
                      <h3 className="font-medium mb-1">AI Profiling</h3>
                      <p className="text-sm text-gray-600">
                        Multi-dimensional organizational analysis and scoring
                      </p>
                    </div>
                    <div className="text-center">
                      <Target className="h-12 w-12 mx-auto mb-2 text-purple-500" />
                      <h3 className="font-medium mb-1">Custom Frameworks</h3>
                      <p className="text-sm text-gray-600">
                        Tailored risk management frameworks for your organization
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

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setActiveTab('assessment')}
                    className="w-full justify-start"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Take Assessment
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setActiveTab('profile')}
                    className="w-full justify-start"
                    disabled={!profile}
                  >
                    <Users className="h-4 w-4 mr-2" />
                    View Profile
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full justify-start"
                    disabled={!profile}
                  >
                    <Target className="h-4 w-4 mr-2" />
                    Generate Framework
                  </Button>
                </CardContent>
              </Card>

              {/* Intelligence Features */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Intelligence Features</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                      <span className="text-sm">Adaptive Questioning</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full" />
                      <span className="text-sm">Risk Pattern Recognition</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full" />
                      <span className="text-sm">Framework Customization</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-orange-500 rounded-full" />
                      <span className="text-sm">Maturity Assessment</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-pink-500 rounded-full" />
                      <span className="text-sm">Continuous Learning</span>
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
