import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Shield, 
  CheckCircle, 
  BarChart3, 
  ArrowRight,
  Target,
  TrendingUp,
  Settings
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { osfiIntegrationService } from '@/services/osfi-integration-service';
import { useNavigate } from 'react-router-dom';

interface OSFIControlsIntegrationProps {
  onNavigateToDetails?: (module: string) => void;
}

const OSFIControlsIntegration: React.FC<OSFIControlsIntegrationProps> = ({ 
  onNavigateToDetails 
}) => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [integrationData, setIntegrationData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile?.organization_id) {
      loadIntegrationData();
    }
  }, [profile?.organization_id]);

  const loadIntegrationData = async () => {
    if (!profile?.organization_id) return;
    
    setLoading(true);
    try {
      const data = await osfiIntegrationService.integrateControlsWithOSFI(profile.organization_id);
      setIntegrationData(data);
    } catch (error) {
      console.error('Error loading OSFI controls integration:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNavigateToControls = () => {
    navigate('/app/controls-and-kri');
  };

  const handleNavigateToOSFI = () => {
    navigate('/app/osfi-compliance?tab=risk-taxonomy');
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            OSFI Controls Integration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-2 bg-gray-200 rounded w-full"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!integrationData) return null;

  const controlsMapping = integrationData.controlsMapping || [];
  const kriMapping = integrationData.kriMapping || [];
  const effectiveControls = controlsMapping.filter((c: any) => c.effectiveness_osfi_compliant).length;
  const overallEffectiveness = controlsMapping.length > 0 ? 
    Math.round((effectiveControls / controlsMapping.length) * 100) : 0;

  return (
    <div className="space-y-4">
      {/* Integration Status Card */}
      <Card className="border-green-200 bg-green-50/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Shield className="h-5 w-5 text-green-600" />
            OSFI E-21 Principle 4: Controls & KRI Integration
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Mapping controls to operational risk categories with OSFI-compliant reporting
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-900">{controlsMapping.length}</div>
              <p className="text-xs text-muted-foreground">Total Controls</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-900">{effectiveControls}</div>
              <p className="text-xs text-muted-foreground">OSFI Compliant</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-900">{kriMapping.length}</div>
              <p className="text-xs text-muted-foreground">KRIs Integrated</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-teal-900">{overallEffectiveness}%</div>
              <p className="text-xs text-muted-foreground">Effectiveness</p>
            </div>
          </div>

          <div className="mt-4">
            <Progress value={overallEffectiveness} className="h-2" />
            <p className="text-xs text-muted-foreground mt-1">
              Overall OSFI compliance effectiveness score
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Operational Risk Categories */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Target className="h-5 w-5" />
            Operational Risk Categories Coverage
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2">
            {integrationData.operationalRiskCategories.map((category: string, index: number) => {
              const categoryControls = controlsMapping.filter((c: any) => 
                c.operational_risk_categories.includes(category)
              ).length;
              
              return (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${
                      categoryControls > 0 ? 'bg-green-500' : 'bg-gray-300'
                    }`}></div>
                    <span className="font-medium text-sm">{category}</span>
                  </div>
                  <Badge variant="outline" className={
                    categoryControls > 0 ? 'border-green-200 text-green-800' : 'border-gray-200 text-gray-600'
                  }>
                    {categoryControls} controls
                  </Badge>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* OSFI Principle Coverage */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            OSFI E-21 Principle Coverage
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((principle) => {
              const coverageControls = controlsMapping.filter((c: any) => 
                c.osfi_principle_coverage.includes(principle)
              ).length;
              
              const principleNames = {
                1: 'Governance',
                2: 'Framework',
                3: 'Risk Appetite',
                4: 'Identification & Assessment',
                5: 'Monitoring & Reporting',
                6: 'Critical Operations',
                7: 'Disruption Tolerances',
                8: 'Scenario Testing'
              };

              return (
                <div key={principle} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                      P{principle}
                    </span>
                    <span className="text-sm">
                      {principleNames[principle as keyof typeof principleNames]}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      {coverageControls} controls
                    </span>
                    {coverageControls > 0 ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <div className="h-4 w-4 border-2 border-gray-300 rounded-full" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Integration Features */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Current Controls & KRI Module
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Control Testing</span>
                <Badge className="bg-green-100 text-green-800">Active</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">KRI Monitoring</span>
                <Badge className="bg-green-100 text-green-800">Enabled</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Effectiveness Scoring</span>
                <Badge className="bg-blue-100 text-blue-800">Enhanced</Badge>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full"
                onClick={handleNavigateToControls}
              >
                View Controls & KRIs
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Shield className="h-4 w-4" />
              OSFI E-21 Enhancement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Operational Risk Mapping</span>
                <Badge className="bg-blue-100 text-blue-800">Integrated</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">OSFI Compliance Reporting</span>
                <Badge className="bg-blue-100 text-blue-800">Active</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Principle Coverage Analysis</span>
                <Badge className="bg-blue-100 text-blue-800">Automated</Badge>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full"
                onClick={handleNavigateToOSFI}
              >
                View OSFI Framework
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Integration Benefits */}
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          <strong>Integration Benefits:</strong> Controls are now mapped to OSFI operational risk categories 
          with automated principle coverage analysis. KRI data flows to OSFI appetite monitoring and 
          control effectiveness reporting meets OSFI E-21 requirements for identification and assessment.
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default OSFIControlsIntegration;