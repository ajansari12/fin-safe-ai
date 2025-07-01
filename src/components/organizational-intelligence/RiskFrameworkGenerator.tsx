
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Target, 
  Settings, 
  CheckCircle2, 
  AlertCircle,
  Download,
  FileText,
  BarChart3,
  Shield,
  Lightbulb
} from 'lucide-react';
import { organizationalIntelligenceService } from '@/services/organizational-intelligence-service';
import { toast } from 'sonner';
import type { OrganizationalProfile, GeneratedFramework, RiskFrameworkTemplate } from '@/types/organizational-intelligence';

interface RiskFrameworkGeneratorProps {
  profile: OrganizationalProfile;
}

const RiskFrameworkGenerator: React.FC<RiskFrameworkGeneratorProps> = ({ profile }) => {
  const [frameworks, setFrameworks] = useState<GeneratedFramework[]>([]);
  const [templates, setTemplates] = useState<RiskFrameworkTemplate[]>([]);
  const [generating, setGenerating] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFrameworkData();
  }, [profile]);

  const loadFrameworkData = async () => {
    try {
      setLoading(true);
      // Load existing generated frameworks and available templates
      // This would be implemented when the service methods are available
      setFrameworks([]);
      setTemplates([]);
    } catch (error) {
      console.error('Error loading framework data:', error);
      toast.error('Failed to load framework data');
    } finally {
      setLoading(false);
    }
  };

  const generateFramework = async () => {
    try {
      setGenerating(true);
      
      const generatedFramework = await organizationalIntelligenceService.generateRiskFramework(profile.id);
      
      if (generatedFramework) {
        setFrameworks(prev => [...prev, generatedFramework]);
        toast.success('Risk framework generated successfully!');
      }
    } catch (error) {
      console.error('Error generating framework:', error);
      toast.error('Failed to generate risk framework');
    } finally {
      setGenerating(false);
    }
  };

  const getFrameworkScore = (framework: GeneratedFramework) => {
    return framework.effectiveness_score || 0;
  };

  const getImplementationStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-500';
      case 'in-progress': return 'bg-blue-500';
      case 'implemented': return 'bg-green-500';
      case 'under-review': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <Settings className="h-12 w-12 mx-auto mb-4 text-blue-500 animate-spin" />
            <p>Loading framework generator...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Framework Generator Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-6 w-6 text-purple-500" />
            AI-Powered Risk Framework Generator
          </CardTitle>
          <p className="text-sm text-gray-600">
            Generate customized risk management frameworks based on your organizational profile
          </p>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <h3 className="font-medium">Framework Readiness</h3>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  {profile.profile_score && profile.profile_score > 60 ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-yellow-500" />
                  )}
                  <span className="text-sm">Profile Score: {profile.profile_score || 0}/100</span>
                </div>
                <div className="flex items-center gap-2">
                  {profile.completeness_percentage && profile.completeness_percentage > 70 ? (
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-yellow-500" />
                  )}
                  <span className="text-sm">Completeness: {profile.completeness_percentage || 0}%</span>
                </div>
              </div>
            </div>
            <Button 
              onClick={generateFramework}
              disabled={generating || (profile.completeness_percentage || 0) < 50}
              className="flex items-center gap-2"
            >
              {generating ? (
                <>
                  <Settings className="h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Target className="h-4 w-4" />
                  Generate Framework
                </>
              )}
            </Button>
          </div>
          
          {(profile.completeness_percentage || 0) < 50 && (
            <Alert className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Complete at least 50% of your organizational profile to generate a customized risk framework.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Generated Frameworks */}
      {frameworks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Generated Frameworks
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {frameworks.map((framework, index) => (
              <div key={framework.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-medium">Risk Framework {index + 1}</h3>
                    <p className="text-sm text-gray-600">
                      Generated on {new Date(framework.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant="outline" 
                      className={`${getImplementationStatusColor(framework.implementation_status)} text-white`}
                    >
                      {framework.implementation_status?.replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </Badge>
                    <Button size="sm" variant="outline">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <span className="text-sm text-gray-600">Effectiveness Score</span>
                    <div className="flex items-center gap-2 mt-1">
                      <Progress value={getFrameworkScore(framework)} className="flex-1" />
                      <span className="text-sm font-medium">{getFrameworkScore(framework)}%</span>
                    </div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Risk Categories</span>
                    <div className="text-lg font-semibold">
                      {framework.framework_data?.risk_categories?.length || 0}
                    </div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Controls</span>
                    <div className="text-lg font-semibold">
                      {framework.framework_data?.controls?.length || 0}
                    </div>
                  </div>
                </div>

                {framework.framework_data?.risk_categories && (
                  <div className="mt-4">
                    <h4 className="font-medium text-sm mb-2">Risk Categories</h4>
                    <div className="flex flex-wrap gap-2">
                      {framework.framework_data.risk_categories.slice(0, 5).map((category: any, idx: number) => (
                        <Badge key={idx} variant="secondary">
                          {category.name} ({Math.round(category.weight * 100)}%)
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Framework Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-yellow-500" />
            Framework Preview
          </CardTitle>
          <p className="text-sm text-gray-600">
            Based on your organizational profile, here's what your custom framework will include:
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-3">
              <h4 className="font-medium flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Risk Categories
              </h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Operational Risk</span>
                  <span className="text-gray-600">25-35%</span>
                </div>
                <div className="flex justify-between">
                  <span>Compliance Risk</span>
                  <span className="text-gray-600">20-30%</span>
                </div>
                <div className="flex justify-between">
                  <span>Technology Risk</span>
                  <span className="text-gray-600">15-25%</span>
                </div>
                <div className="flex justify-between">
                  <span>Third-Party Risk</span>
                  <span className="text-gray-600">10-20%</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="font-medium flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Key Risk Indicators
              </h4>
              <div className="space-y-2 text-sm">
                {profile.sub_sector === 'retail-banking' && (
                  <>
                    <div>• Non-Performing Loan Ratio</div>
                    <div>• Capital Adequacy Ratio</div>
                    <div>• Liquidity Coverage Ratio</div>
                  </>
                )}
                <div>• Operational Loss Events</div>
                <div>• Compliance Violations</div>
                <div>• System Availability</div>
                {profile.third_party_dependencies && profile.third_party_dependencies > 10 && (
                  <div>• Vendor Risk Score</div>
                )}
              </div>
            </div>
          </div>

          <div className="pt-4 border-t">
            <h4 className="font-medium mb-2">Customization Factors</h4>
            <div className="grid gap-2 md:grid-cols-2 text-sm text-gray-600">
              <div>• Sub-sector: {profile.sub_sector || 'General'}</div>
              <div>• Risk Maturity: {profile.risk_maturity || 'Not specified'}</div>
              <div>• Asset Size: {profile.asset_size ? `$${(profile.asset_size / 1000000).toFixed(0)}M` : 'Not specified'}</div>
              <div>• Geographic Scope: {profile.geographic_scope || 'Not specified'}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RiskFrameworkGenerator;
