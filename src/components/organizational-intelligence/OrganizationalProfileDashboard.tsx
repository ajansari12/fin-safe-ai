
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Building2, 
  TrendingUp, 
  Shield, 
  Users, 
  Globe, 
  Target,
  AlertTriangle,
  CheckCircle2,
  Brain,
  FileText,
  Settings,
  BarChart3
} from 'lucide-react';
import { organizationalIntelligenceService } from '@/services/organizational-intelligence-service';
import { toast } from 'sonner';
import type { 
  OrganizationalProfile, 
  ProfileAssessment,
  GeneratedFramework 
} from '@/types/organizational-intelligence';

const OrganizationalProfileDashboard: React.FC = () => {
  const [profile, setProfile] = useState<OrganizationalProfile | null>(null);
  const [assessment, setAssessment] = useState<ProfileAssessment | null>(null);
  const [frameworks, setFrameworks] = useState<GeneratedFramework[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    try {
      setLoading(true);
      
      const profileData = await organizationalIntelligenceService.getOrganizationalProfile();
      setProfile(profileData);

      if (profileData) {
        const assessmentData = await organizationalIntelligenceService.generateProfileAssessment(profileData.id);
        setAssessment(assessmentData);
      }
    } catch (error) {
      console.error('Error loading profile data:', error);
      toast.error('Failed to load organizational profile');
    } finally {
      setLoading(false);
    }
  };

  const generateFramework = async () => {
    if (!profile) return;

    try {
      toast.loading('Generating customized risk framework...');
      
      const framework = await organizationalIntelligenceService.generateRiskFramework(profile.id);
      if (framework) {
        setFrameworks([...frameworks, framework]);
        toast.success('Risk framework generated successfully!');
      }
    } catch (error) {
      console.error('Error generating framework:', error);
      toast.error('Failed to generate risk framework');
    }
  };

  const getMaturityColor = (maturity?: string) => {
    switch (maturity) {
      case 'sophisticated': return 'bg-green-100 text-green-800 border-green-200';
      case 'advanced': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'developing': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'basic': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRiskLevelColor = (level?: string) => {
    switch (level) {
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Brain className="h-12 w-12 mx-auto mb-4 text-blue-500 animate-pulse" />
          <p className="text-gray-600">Analyzing organizational profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <Building2 className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Profile Found</h3>
          <p className="text-gray-500 mb-4">Complete the organizational assessment to see your profile</p>
          <Button className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Start Assessment
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Organizational Intelligence</h2>
          <p className="text-muted-foreground">
            AI-powered organizational profiling and risk framework generation
          </p>
        </div>
        <Button onClick={generateFramework} className="flex items-center gap-2">
          <Brain className="h-4 w-4" />
          Generate Framework
        </Button>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Profile Score</p>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold">{profile.profile_score || 0}</span>
                  <span className="text-sm text-gray-500">/ 100</span>
                </div>
              </div>
              <BarChart3 className="h-8 w-8 text-blue-500" />
            </div>
            <Progress value={profile.profile_score || 0} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completeness</p>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold">{profile.completeness_percentage || 0}</span>
                  <span className="text-sm text-gray-500">%</span>
                </div>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-500" />
            </div>
            <Progress value={profile.completeness_percentage || 0} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Risk Maturity</p>
                <Badge variant="outline" className={getMaturityColor(profile.risk_maturity)}>
                  {profile.risk_maturity?.replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Not Set'}
                </Badge>
              </div>
              <Shield className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Risk Level</p>
                <Badge variant="outline" className={getRiskLevelColor(assessment?.risk_level)}>
                  {assessment?.risk_level?.replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Analyzing'}
                </Badge>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="risk">Risk Profile</TabsTrigger>
          <TabsTrigger value="operations">Operations</TabsTrigger>
          <TabsTrigger value="assessment">Assessment</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Organization Summary
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Sub-Sector:</span>
                  <span className="text-sm">
                    {profile.sub_sector?.replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Not specified'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Employee Count:</span>
                  <span className="text-sm">{profile.employee_count?.toLocaleString() || 'Not specified'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Asset Size:</span>
                  <span className="text-sm">
                    {profile.asset_size ? `$${(profile.asset_size / 1000000).toLocaleString()}M` : 'Not specified'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Geographic Scope:</span>
                  <span className="text-sm">
                    {profile.geographic_scope?.replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Not specified'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Customer Base:</span>
                  <span className="text-sm">
                    {profile.customer_base?.replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Not specified'}
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Strategic Profile
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Growth Strategy:</span>
                  <Badge variant="outline">
                    {profile.growth_strategy?.replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Not set'}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Digital Strategy:</span>
                  <Badge variant="outline">
                    {profile.digital_strategy?.replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Not set'}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Market Position:</span>
                  <Badge variant="outline">
                    {profile.market_position?.replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Not set'}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Competitive Strategy:</span>
                  <Badge variant="outline">
                    {profile.competitive_strategy?.replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Not set'}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="basic" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <span className="text-sm font-medium">Sub-Sector</span>
                <p className="text-sm text-gray-600">
                  {profile.sub_sector?.replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Not specified'}
                </p>
              </div>
              <div className="space-y-2">
                <span className="text-sm font-medium">Employee Count</span>
                <p className="text-sm text-gray-600">{profile.employee_count?.toLocaleString() || 'Not specified'}</p>
              </div>
              <div className="space-y-2">
                <span className="text-sm font-medium">Asset Size</span>
                <p className="text-sm text-gray-600">
                  {profile.asset_size ? `$${(profile.asset_size / 1000000).toLocaleString()}M` : 'Not specified'}
                </p>
              </div>
              <div className="space-y-2">
                <span className="text-sm font-medium">Geographic Scope</span>
                <p className="text-sm text-gray-600">
                  {profile.geographic_scope?.replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Not specified'}
                </p>
              </div>
              <div className="space-y-2">
                <span className="text-sm font-medium">Customer Base</span>
                <p className="text-sm text-gray-600">
                  {profile.customer_base?.replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Not specified'}
                </p>
              </div>
              <div className="space-y-2">
                <span className="text-sm font-medium">Business Lines</span>
                <div className="flex flex-wrap gap-1">
                  {profile.business_lines?.map((line, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {line.replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </Badge>
                  )) || <p className="text-sm text-gray-600">Not specified</p>}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="risk" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Risk Profile</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <span className="text-sm font-medium">Risk Maturity</span>
                <Badge variant="outline" className={getMaturityColor(profile.risk_maturity)}>
                  {profile.risk_maturity?.replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Not Set'}
                </Badge>
              </div>
              <div className="space-y-2">
                <span className="text-sm font-medium">Compliance Maturity</span>
                <Badge variant="outline" className={getMaturityColor(profile.compliance_maturity)}>
                  {profile.compliance_maturity?.replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Not Set'}
                </Badge>
              </div>
              <div className="space-y-2">
                <span className="text-sm font-medium">Risk Culture</span>
                <p className="text-sm text-gray-600">
                  {profile.risk_culture?.replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Not specified'}
                </p>
              </div>
              <div className="space-y-2">
                <span className="text-sm font-medium">Regulatory History</span>
                <p className="text-sm text-gray-600">
                  {profile.regulatory_history?.replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Not specified'}
                </p>
              </div>
              <div className="space-y-2">
                <span className="text-sm font-medium">Previous Incidents</span>
                <p className="text-sm text-gray-600">{profile.previous_incidents || 0}</p>
              </div>
              <div className="space-y-2">
                <span className="text-sm font-medium">Primary Regulators</span>
                <div className="flex flex-wrap gap-1">
                  {profile.primary_regulators?.map((regulator, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {regulator}
                    </Badge>
                  )) || <p className="text-sm text-gray-600">Not specified</p>}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="operations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Operational Complexity</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <span className="text-sm font-medium">Technology Maturity</span>
                <Badge variant="outline" className={getMaturityColor(profile.technology_maturity)}>
                  {profile.technology_maturity?.replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Not Set'}
                </Badge>
              </div>
              <div className="space-y-2">
                <span className="text-sm font-medium">Digital Transformation</span>
                <Badge variant="outline">
                  {profile.digital_transformation?.replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Not Set'}
                </Badge>
              </div>
              <div className="space-y-2">
                <span className="text-sm font-medium">Geographic Locations</span>
                <p className="text-sm text-gray-600">{profile.geographic_locations || 1}</p>
              </div>
              <div className="space-y-2">
                <span className="text-sm font-medium">Third Party Dependencies</span>
                <p className="text-sm text-gray-600">{profile.third_party_dependencies || 0}</p>
              </div>
              <div className="space-y-2">
                <span className="text-sm font-medium">International Exposure</span>
                <Badge variant="outline">
                  {profile.international_exposure ? 'Yes' : 'No'}
                </Badge>
              </div>
              <div className="space-y-2">
                <span className="text-sm font-medium">Applicable Frameworks</span>
                <div className="flex flex-wrap gap-1">
                  {profile.applicable_frameworks?.map((framework, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {framework}
                    </Badge>
                  )) || <p className="text-sm text-gray-600">Not specified</p>}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="assessment" className="space-y-6">
          {assessment ? (
            <>
              <div className="grid gap-4 md:grid-cols-3">
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-3xl font-bold text-blue-600 mb-2">{assessment.score}</div>
                    <div className="text-sm text-gray-600">Overall Score</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <Badge variant="outline" className={getRiskLevelColor(assessment.risk_level)}>
                      {assessment.risk_level.replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </Badge>
                    <div className="text-sm text-gray-600 mt-2">Risk Level</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <Badge variant="outline" className={getMaturityColor(assessment.maturity_level)}>
                      {assessment.maturity_level.replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </Badge>
                    <div className="text-sm text-gray-600 mt-2">Maturity Level</div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-green-500" />
                      Strengths
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {assessment.strengths.map((strength, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm">
                          <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                          {strength}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-orange-500" />
                      Areas for Improvement
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {assessment.weaknesses.map((weakness, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm">
                          <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0" />
                          {weakness}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5 text-blue-500" />
                      Recommendations
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {assessment.recommendations.map((recommendation, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                          {recommendation}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="h-5 w-5 text-purple-500" />
                      Next Steps
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {assessment.next_steps.map((step, index) => (
                        <li key={index} className="flex items-start gap-2 text-sm">
                          <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0" />
                          {step}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <Brain className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <p className="text-gray-500">Assessment data not available</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default OrganizationalProfileDashboard;
