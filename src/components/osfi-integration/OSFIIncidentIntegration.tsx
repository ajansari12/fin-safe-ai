import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  AlertTriangle, 
  Activity, 
  Shield, 
  ArrowRight,
  TrendingUp,
  Clock,
  Target
} from 'lucide-react';
// TODO: Migrated from AuthContext to EnhancedAuthContext
import { useAuth } from '@/contexts/EnhancedAuthContext';
import { osfiIntegrationService } from '@/services/osfi-integration-service';
import { useNavigate } from 'react-router-dom';

interface OSFIIncidentIntegrationProps {
  onNavigateToDetails?: (module: string) => void;
}

const OSFIIncidentIntegration: React.FC<OSFIIncidentIntegrationProps> = ({ 
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
      const data = await osfiIntegrationService.integrateIncidentsWithOSFI(profile.organization_id);
      setIntegrationData(data);
    } catch (error) {
      console.error('Error loading OSFI incident integration:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNavigateToIncidents = () => {
    navigate('/app/incident-log');
  };

  const handleNavigateToOSFI = () => {
    navigate('/app/osfi-compliance?tab=monitoring');
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            OSFI Incident Integration
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

  const operationalRiskMetrics = integrationData.operationalRiskMetrics || [];
  const criticalIncidents = integrationData.criticalIncidents || 0;
  const totalIncidents = integrationData.totalIncidents || 0;

  return (
    <div className="space-y-4">
      {/* Integration Status Card */}
      <Card className="border-orange-200 bg-orange-50/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Activity className="h-5 w-5 text-orange-600" />
            OSFI E-21 Principle 5: Incident Monitoring Integration
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Mapping incident data to operational risk taxonomy and real-time monitoring
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-900">{totalIncidents}</div>
              <p className="text-xs text-muted-foreground">Total Incidents</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-900">{criticalIncidents}</div>
              <p className="text-xs text-muted-foreground">Critical Incidents</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-900">{operationalRiskMetrics.length}</div>
              <p className="text-xs text-muted-foreground">Risk Mappings</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-900">
                {integrationData.realTimeMonitoring ? '✓' : '✗'}
              </div>
              <p className="text-xs text-muted-foreground">Real-time Monitoring</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Operational Risk Mapping */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Target className="h-5 w-5" />
            Operational Risk Taxonomy Mapping
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {operationalRiskMetrics.slice(0, 5).map((metric: any, index: number) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${
                    metric.resilience_impact === 'critical' ? 'bg-red-500' :
                    metric.resilience_impact === 'high' ? 'bg-orange-500' :
                    metric.resilience_impact === 'medium' ? 'bg-yellow-500' :
                    'bg-green-500'
                  }`}></div>
                  <div>
                    <div className="font-medium text-sm">{metric.operational_risk_category}</div>
                    <div className="text-xs text-muted-foreground">
                      OSFI Principles: {metric.osfi_principle_breach.join(', ')}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge 
                    variant="outline"
                    className={
                      metric.resilience_impact === 'critical' ? 'border-red-200 text-red-800' :
                      metric.resilience_impact === 'high' ? 'border-orange-200 text-orange-800' :
                      metric.resilience_impact === 'medium' ? 'border-yellow-200 text-yellow-800' :
                      'border-green-200 text-green-800'
                    }
                  >
                    {metric.resilience_impact}
                  </Badge>
                  {metric.disruption_tolerance_exceeded && (
                    <Badge className="bg-red-100 text-red-800">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      Tolerance Exceeded
                    </Badge>
                  )}
                </div>
              </div>
            ))}
            
            {operationalRiskMetrics.length > 5 && (
              <div className="text-center">
                <Button variant="ghost" size="sm" onClick={handleNavigateToIncidents}>
                  View all {operationalRiskMetrics.length} mappings
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Integration Features */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Current Incident Module
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm">SLA Breach Escalation</span>
                <Badge className="bg-green-100 text-green-800">Active</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Real-time Monitoring</span>
                <Badge className="bg-green-100 text-green-800">Enabled</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Incident Categorization</span>
                <Badge className="bg-blue-100 text-blue-800">Enhanced</Badge>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full"
                onClick={handleNavigateToIncidents}
              >
                View Incident Log
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
                <span className="text-sm">Principle 5 Monitoring</span>
                <Badge className="bg-blue-100 text-blue-800">Active</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Resilience Impact Assessment</span>
                <Badge className="bg-blue-100 text-blue-800">Automated</Badge>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full"
                onClick={handleNavigateToOSFI}
              >
                View OSFI Monitoring
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Integration Benefits */}
      <Alert>
        <Activity className="h-4 w-4" />
        <AlertDescription>
          <strong>Integration Benefits:</strong> Incident data now automatically flows to OSFI operational 
          risk taxonomy. SLA breaches trigger OSFI escalation procedures and incidents are categorized 
          according to OSFI E-21 operational risk framework for enhanced regulatory reporting.
        </AlertDescription>
      </Alert>

      {/* Critical Incidents Alert */}
      {criticalIncidents > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription>
            <strong>Critical Incidents Detected:</strong> {criticalIncidents} critical incident(s) 
            require immediate OSFI compliance review and may impact operational resilience tolerances.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default OSFIIncidentIntegration;