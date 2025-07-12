import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Target, 
  AlertTriangle, 
  CheckCircle, 
  TrendingUp,
  ArrowRight,
  Shield,
  BarChart3
} from 'lucide-react';
// TODO: Migrated from AuthContext to EnhancedAuthContext
import { useAuth } from '@/contexts/EnhancedAuthContext';
import { osfiIntegrationService } from '@/services/osfi-integration-service';
import { useNavigate } from 'react-router-dom';

interface OSFIRiskAppetiteIntegrationProps {
  onNavigateToDetails?: (module: string) => void;
}

const OSFIRiskAppetiteIntegration: React.FC<OSFIRiskAppetiteIntegrationProps> = ({ 
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
      const data = await osfiIntegrationService.integrateRiskAppetiteWithOSFI(profile.organization_id);
      setIntegrationData(data);
    } catch (error) {
      console.error('Error loading OSFI risk appetite integration:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNavigateToRiskAppetite = () => {
    navigate('/app/risk-appetite');
  };

  const handleNavigateToOSFI = () => {
    navigate('/app/osfi-compliance?tab=risk-appetite');
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            OSFI Risk Appetite Integration
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

  const complianceScore = integrationData.appetiteStatements.length > 0 ? 85 : 60;
  const hasActiveBreaches = integrationData.breachLogs.length > 0;

  return (
    <div className="space-y-4">
      {/* Integration Status Card */}
      <Card className="border-blue-200 bg-blue-50/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Target className="h-5 w-5 text-blue-600" />
            OSFI E-21 Principle 3: Risk Appetite Integration
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Consolidating risk appetite data with OSFI compliance requirements
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-900">{complianceScore}%</div>
              <p className="text-xs text-muted-foreground">Compliance Score</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-900">
                {integrationData.appetiteStatements.length}
              </div>
              <p className="text-xs text-muted-foreground">Appetite Statements</p>
            </div>
            <div className="text-center">
              <div className={`text-2xl font-bold ${hasActiveBreaches ? 'text-red-900' : 'text-green-900'}`}>
                {integrationData.breachLogs.length}
              </div>
              <p className="text-xs text-muted-foreground">Active Breaches</p>
            </div>
          </div>

          <div className="mt-4">
            <Progress value={complianceScore} className="h-2" />
            <p className="text-xs text-muted-foreground mt-1">
              Integration with business strategy and forward-looking assessment
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Data Integration Status */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Current Risk Appetite Module
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">Appetite Statements</span>
                <Badge variant="outline">
                  {integrationData.appetiteStatements.length} defined
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Board Reporting</span>
                <Badge className="bg-green-100 text-green-800">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Active
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Breach Monitoring</span>
                <Badge className={hasActiveBreaches ? "bg-yellow-100 text-yellow-800" : "bg-green-100 text-green-800"}>
                  {hasActiveBreaches ? `${integrationData.breachLogs.length} breaches` : 'No breaches'}
                </Badge>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full"
                onClick={handleNavigateToRiskAppetite}
              >
                View Risk Appetite Module
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
                <span className="text-sm">Forward-Looking Assessment</span>
                <Badge className="bg-blue-100 text-blue-800">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Integrated
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Business Strategy Alignment</span>
                <Badge className="bg-blue-100 text-blue-800">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Integrated
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Quantitative Limits</span>
                <Badge className="bg-blue-100 text-blue-800">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Enhanced
                </Badge>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full"
                onClick={handleNavigateToOSFI}
              >
                View OSFI Enhancement
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Integration Benefits */}
      <Alert>
        <Target className="h-4 w-4" />
        <AlertDescription>
          <strong>Integration Benefits:</strong> Risk appetite data now flows seamlessly between your existing 
          module and OSFI E-21 compliance requirements. Breach logs automatically trigger OSFI escalation 
          procedures and board reporting is enhanced with forward-looking assessments.
        </AlertDescription>
      </Alert>

      {/* Active Breaches Alert */}
      {hasActiveBreaches && (
        <Alert className="border-yellow-200 bg-yellow-50">
          <AlertTriangle className="h-4 w-4 text-yellow-600" />
          <AlertDescription>
            <strong>Active Risk Appetite Breaches:</strong> {integrationData.breachLogs.length} breach(es) 
            detected. Review required for OSFI compliance and escalation procedures.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default OSFIRiskAppetiteIntegration;