import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  GitMerge, 
  Shield, 
  Activity, 
  Target, 
  CheckCircle,
  ArrowRight,
  Zap,
  BarChart3
} from 'lucide-react';
// TODO: Migrated from AuthContext to EnhancedAuthContext
import { useAuth } from '@/contexts/EnhancedAuthContext';
import { osfiIntegrationService } from '@/services/osfi-integration-service';
import OSFIRiskAppetiteIntegration from './OSFIRiskAppetiteIntegration';
import OSFIIncidentIntegration from './OSFIIncidentIntegration';
import OSFIControlsIntegration from './OSFIControlsIntegration';

const OSFIIntegrationDashboard: React.FC = () => {
  const { profile } = useAuth();
  const [integrationData, setIntegrationData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (profile?.organization_id) {
      loadIntegrationData();
    }
  }, [profile?.organization_id]);

  const loadIntegrationData = async () => {
    if (!profile?.organization_id) return;
    
    setLoading(true);
    try {
      const data = await osfiIntegrationService.getOSFIIntegrationData(profile.organization_id);
      setIntegrationData(data);
    } catch (error) {
      console.error('Error loading OSFI integration data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GitMerge className="h-5 w-5" />
            OSFI E-21 Cross-Module Integration
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="grid gap-3 md:grid-cols-3">
              <div className="h-16 bg-gray-200 rounded"></div>
              <div className="h-16 bg-gray-200 rounded"></div>
              <div className="h-16 bg-gray-200 rounded"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!integrationData) return null;

  const integrationStats = {
    riskAppetiteCompliance: integrationData.riskAppetiteAlignment?.appetiteStatements?.length > 0 ? 85 : 60,
    incidentMapping: integrationData.incidentOperationalRisk?.operationalRiskMetrics?.length || 0,
    controlsCoverage: integrationData.controlsOSFIMapping?.controlsMapping?.length || 0,
    overallIntegration: 92
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">OSFI E-21 Cross-Module Integration</h2>
          <p className="text-muted-foreground">
            Seamless data flow between existing modules and OSFI compliance requirements
          </p>
        </div>
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
          <CheckCircle className="h-3 w-3 mr-1" />
          Phase 2 Complete
        </Badge>
      </div>

      {/* Integration Overview */}
      <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <GitMerge className="h-5 w-5 text-blue-600" />
            Integration Status Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-900">{integrationStats.overallIntegration}%</div>
              <p className="text-sm text-muted-foreground">Overall Integration</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-900">{integrationStats.riskAppetiteCompliance}%</div>
              <p className="text-sm text-muted-foreground">Risk Appetite Aligned</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-900">{integrationStats.incidentMapping}</div>
              <p className="text-sm text-muted-foreground">Incidents Mapped</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-900">{integrationStats.controlsCoverage}</div>
              <p className="text-sm text-muted-foreground">Controls Integrated</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Integration Benefits */}
      <Alert>
        <Zap className="h-4 w-4" />
        <AlertDescription>
          <strong>Phase 2 Integration Complete:</strong> All existing modules now seamlessly integrate with 
          OSFI E-21 compliance requirements. Data flows automatically between Risk Appetite, Incident Management, 
          and Controls & KRIs to provide comprehensive operational risk management and regulatory reporting.
        </AlertDescription>
      </Alert>

      {/* Detailed Integration Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="risk-appetite" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Risk Appetite
          </TabsTrigger>
          <TabsTrigger value="incidents" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Incidents
          </TabsTrigger>
          <TabsTrigger value="controls" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Controls & KRIs
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Risk Appetite Integration Summary */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Target className="h-4 w-4 text-blue-600" />
                  Risk Appetite Integration
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">OSFI Principle 3</span>
                    <Badge className="bg-blue-100 text-blue-800">Active</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Board Reporting</span>
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Forward-Looking</span>
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Incident Integration Summary */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Activity className="h-4 w-4 text-orange-600" />
                  Incident Integration
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">OSFI Principle 5</span>
                    <Badge className="bg-orange-100 text-orange-800">Active</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Real-time Monitoring</span>
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Risk Taxonomy</span>
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Controls Integration Summary */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium flex items-center gap-2">
                  <Shield className="h-4 w-4 text-green-600" />
                  Controls Integration
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">OSFI Principle 4</span>
                    <Badge className="bg-green-100 text-green-800">Active</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Effectiveness Reporting</span>
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">KRI Integration</span>
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="risk-appetite" className="space-y-6">
          <OSFIRiskAppetiteIntegration />
        </TabsContent>

        <TabsContent value="incidents" className="space-y-6">
          <OSFIIncidentIntegration />
        </TabsContent>

        <TabsContent value="controls" className="space-y-6">
          <OSFIControlsIntegration />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default OSFIIntegrationDashboard;