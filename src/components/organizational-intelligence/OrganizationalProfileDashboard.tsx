
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  Building2, 
  Shield, 
  TrendingUp, 
  AlertCircle,
  CheckCircle2,
  Target,
  BarChart3,
  FileText,
  Award,
  Lightbulb
} from 'lucide-react';
import { organizationalIntelligenceService } from '@/services/organizational-intelligence-service';
import { toast } from 'sonner';
import type { OrganizationalProfile, ProfileAssessment } from '@/types/organizational-intelligence';

const OrganizationalProfileDashboard: React.FC = () => {
  const [profile, setProfile] = useState<OrganizationalProfile | null>(null);
  const [assessment, setAssessment] = useState<ProfileAssessment | null>(null);
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

  const getRiskLevelColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low': return 'bg-green-500';
      case 'medium': return 'bg-yellow-500';
      case 'high': return 'bg-orange-500';
      case 'critical': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getMaturityColor = (maturity: string) => {
    switch (maturity) {
      case 'basic': return 'text-red-600';
      case 'developing': return 'text-yellow-600';
      case 'advanced': return 'text-blue-600';
      case 'sophisticated': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Users className="h-12 w-12 mx-auto mb-4 text-blue-500 animate-pulse" />
          <p className="text-gray-600">Loading organizational profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="text-center py-12">
          <Building2 className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Profile Available</h3>
          <p className="text-gray-500 mb-4">Complete an organizational assessment to generate your profile.</p>
          <Button onClick={() => window.location.href = '/app/organizational-intelligence'}>
            Take Assessment
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Profile Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-6 w-6 text-blue-500" />
                Organizational Profile
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                Last updated: {new Date(profile.updated_at).toLocaleDateString()}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{profile.profile_score || 0}</div>
                <div className="text-xs text-gray-500">Profile Score</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{profile.completeness_percentage || 0}%</div>
                <div className="text-xs text-gray-500">Complete</div>
              </div>
            </div>
          </div>
          <Progress value={profile.completeness_percentage || 0} className="w-full" />
        </CardHeader>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="assessment">Assessment</TabsTrigger>
          <TabsTrigger value="maturity">Maturity</TabsTrigger>
          <TabsTrigger value="recommendations">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Sub-sector:</span>
                  <Badge variant="outline">
                    {profile.sub_sector?.replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'Not specified'}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Employees:</span>
                  <span className="text-sm font-medium">{profile.employee_count?.toLocaleString() || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Asset Size:</span>
                  <span className="text-sm font-medium">
                    {profile.asset_size ? `$${(profile.asset_size / 1000000).toFixed(0)}M` : 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Geographic Scope:</span>
                  <Badge variant="secondary">
                    {profile.geographic_scope?.replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'N/A'}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Risk Profile */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Risk Profile
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Risk Maturity:</span>
                  <span className={`text-sm font-medium ${getMaturityColor(profile.risk_maturity || '')}`}>
                    {profile.risk_maturity?.replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Compliance Maturity:</span>
                  <span className={`text-sm font-medium ${getMaturityColor(profile.compliance_maturity || '')}`}>
                    {profile.compliance_maturity?.replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Risk Culture:</span>
                  <Badge variant="outline">
                    {profile.risk_culture?.replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'N/A'}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Previous Incidents:</span>
                  <span className="text-sm font-medium">{profile.previous_incidents || 0}</span>
                </div>
              </CardContent>
            </Card>

            {/* Technology Profile */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Technology & Strategy
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Tech Maturity:</span>
                  <span className={`text-sm font-medium ${getMaturityColor(profile.technology_maturity || '')}`}>
                    {profile.technology_maturity?.replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Digital Transform:</span>
                  <span className={`text-sm font-medium ${getMaturityColor(profile.digital_transformation || '')}`}>
                    {profile.digital_transformation?.replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Market Position:</span>
                  <Badge variant="outline">
                    {profile.market_position?.replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'N/A'}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Growth Strategy:</span>
                  <Badge variant="secondary">
                    {profile.growth_strategy?.replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'N/A'}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Regulatory and Business Context */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Regulatory Environment</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Primary Regulators</h4>
                  <div className="flex flex-wrap gap-2">
                    {profile.primary_regulators?.map((regulator, index) => (
                      <Badge key={index} variant="outline">{regulator}</Badge>
                    )) || <span className="text-sm text-gray-500">None specified</span>}
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Applicable Frameworks</h4>
                  <div className="flex flex-wrap gap-2">
                    {profile.applicable_frameworks?.map((framework, index) => (
                      <Badge key={index} variant="secondary">{framework}</Badge>
                    )) || <span className="text-sm text-gray-500">None specified</span>}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Business Context</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Business Lines</h4>
                  <div className="flex flex-wrap gap-2">
                    {profile.business_lines?.map((line, index) => (
                      <Badge key={index} variant="outline">{line}</Badge>
                    )) || <span className="text-sm text-gray-500">None specified</span>}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-gray-600">Geographic Locations:</span>
                    <div className="text-lg font-semibold">{profile.geographic_locations || 1}</div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Third-party Dependencies:</span>
                    <div className="text-lg font-semibold">{profile.third_party_dependencies || 0}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="assessment" className="space-y-6">
          {assessment ? (
            <>
              {/* Risk Assessment Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-6 w-6" />
                    Risk Assessment Summary
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-6 md:grid-cols-3">
                    <div className="text-center">
                      <div className={`w-16 h-16 rounded-full mx-auto mb-2 flex items-center justify-center ${getRiskLevelColor(assessment.risk_level)}`}>
                        <AlertCircle className="h-8 w-8 text-white" />
                      </div>
                      <div className="text-lg font-semibold">{assessment.risk_level?.toUpperCase()}</div>
                      <div className="text-sm text-gray-600">Risk Level</div>
                    </div>
                    <div className="text-center">
                      <div className="w-16 h-16 rounded-full bg-blue-500 mx-auto mb-2 flex items-center justify-center">
                        <Award className="h-8 w-8 text-white" />
                      </div>
                      <div className="text-lg font-semibold">{assessment.maturity_level?.toUpperCase()}</div>
                      <div className="text-sm text-gray-600">Maturity Level</div>
                    </div>
                    <div className="text-center">
                      <div className="w-16 h-16 rounded-full bg-green-500 mx-auto mb-2 flex items-center justify-center">
                        <BarChart3 className="h-8 w-8 text-white" />
                      </div>
                      <div className="text-lg font-semibold">{assessment.score}</div>
                      <div className="text-sm text-gray-600">Overall Score</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Strengths and Weaknesses */}
              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2 text-green-600">
                      <CheckCircle2 className="h-5 w-5" />
                      Strengths
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {assessment.strengths.map((strength, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{strength}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2 text-red-600">
                      <AlertCircle className="h-5 w-5" />
                      Areas for Improvement
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {assessment.weaknesses.map((weakness, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{weakness}</span>
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
                <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Assessment Unavailable</h3>
                <p className="text-gray-500">Complete your organizational profile to generate an assessment.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="maturity" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Maturity Assessment</CardTitle>
              <p className="text-sm text-gray-600">
                Evaluate your organization's maturity across key dimensions
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {[
                { label: 'Risk Management Maturity', value: profile.risk_maturity, icon: Shield },
                { label: 'Compliance Maturity', value: profile.compliance_maturity, icon: FileText },
                { label: 'Technology Maturity', value: profile.technology_maturity, icon: TrendingUp },
                { label: 'Digital Transformation', value: profile.digital_transformation, icon: Target }
              ].map((item, index) => {
                const maturityLevels = ['basic', 'developing', 'advanced', 'sophisticated'];
                const currentIndex = maturityLevels.indexOf(item.value || 'basic');
                const percentage = ((currentIndex + 1) / maturityLevels.length) * 100;
                
                return (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <item.icon className="h-5 w-5 text-blue-500" />
                        <span className="font-medium">{item.label}</span>
                      </div>
                      <Badge variant="outline" className={getMaturityColor(item.value || '')}>
                        {item.value?.replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) || 'N/A'}
                      </Badge>
                    </div>
                    <Progress value={percentage} className="h-2" />
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-6">
          {assessment ? (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lightbulb className="h-6 w-6 text-yellow-500" />
                    Strategic Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {assessment.recommendations.map((recommendation, index) => (
                      <li key={index} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                        <Lightbulb className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{recommendation}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-6 w-6 text-green-500" />
                    Next Steps
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {assessment.next_steps.map((step, index) => (
                      <li key={index} className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                        <div className="w-6 h-6 rounded-full bg-green-500 text-white text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                          {index + 1}
                        </div>
                        <span className="text-sm">{step}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <Lightbulb className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Recommendations Unavailable</h3>
                <p className="text-gray-500">Complete your organizational assessment to receive personalized recommendations.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default OrganizationalProfileDashboard;
