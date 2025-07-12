import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Activity,
  TrendingUp,
  Clock,
  Target,
  Settings,
  FileText,
  Network
} from 'lucide-react';
// TODO: Migrated from AuthContext to EnhancedAuthContext
import { useAuth } from '@/contexts/EnhancedAuthContext';
import { useToast } from '@/hooks/use-toast';
import OSFIBusinessContinuityIntegration from './OSFIBusinessContinuityIntegration';
import OSFIThirdPartyRiskIntegration from './OSFIThirdPartyRiskIntegration';

interface ResilienceMetrics {
  overall_resilience_score: number;
  business_continuity_compliance: number;
  third_party_risk_coverage: number;
  scenario_test_completion: number;
  recovery_time_alignment: number;
  disruption_tolerance_compliance: number;
}

interface ResilienceAlert {
  id: string;
  type: 'business_continuity' | 'third_party' | 'scenario_testing' | 'compliance';
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  osfi_principle: string;
  created_at: string;
  status: 'open' | 'investigating' | 'resolved';
}

const OSFIResilienceDashboard: React.FC = () => {
  const { profile } = useAuth();
  const [resilienceMetrics, setResilienceMetrics] = useState<ResilienceMetrics | null>(null);
  const [resilienceAlerts, setResilienceAlerts] = useState<ResilienceAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const { toast } = useToast();

  useEffect(() => {
    if (profile?.organization_id) {
      loadResilienceData();
    }
  }, [profile?.organization_id]);

  const loadResilienceData = async () => {
    try {
      setLoading(true);
      
      // Mock resilience metrics data
      const mockMetrics: ResilienceMetrics = {
        overall_resilience_score: 78,
        business_continuity_compliance: 83,
        third_party_risk_coverage: 76,
        scenario_test_completion: 72,
        recovery_time_alignment: 80,
        disruption_tolerance_compliance: 75
      };

      const mockAlerts: ResilienceAlert[] = [
        {
          id: '1',
          type: 'business_continuity',
          severity: 'critical',
          title: 'RTO Target Breach',
          description: 'Payment processing RTO exceeds OSFI tolerance levels',
          osfi_principle: 'Principle 6 - Critical Operations',
          created_at: '2024-01-15T10:30:00Z',
          status: 'open'
        },
        {
          id: '2',
          type: 'third_party',
          severity: 'high',
          title: 'Vendor Risk Assessment Overdue',
          description: 'CloudTech Solutions assessment is 30 days overdue',
          osfi_principle: 'Principle 5 - Operational Risk Management',
          created_at: '2024-01-14T14:20:00Z',
          status: 'investigating'
        },
        {
          id: '3',
          type: 'scenario_testing',
          severity: 'medium',
          title: 'Scenario Test Due',
          description: 'Natural disaster scenario testing required within 7 days',
          osfi_principle: 'Principle 7 - Disruption Tolerance',
          created_at: '2024-01-13T09:15:00Z',
          status: 'open'
        }
      ];

      setResilienceMetrics(mockMetrics);
      setResilienceAlerts(mockAlerts);
    } catch (error) {
      console.error('Error loading resilience data:', error);
      toast({
        title: "Error",
        description: "Failed to load resilience dashboard data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-red-100 text-red-800';
      case 'investigating': return 'bg-yellow-100 text-yellow-800';
      case 'resolved': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid gap-4 md:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!resilienceMetrics) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="h-12 w-12 mx-auto text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Data Available</h3>
        <p className="text-gray-500">Unable to load resilience dashboard data.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">OSFI Resilience Dashboard</h2>
          <p className="text-muted-foreground">
            Business continuity and resilience monitoring aligned with OSFI E-21 principles
          </p>
        </div>
        <Button variant="outline">
          <Settings className="h-4 w-4 mr-2" />
          Configure
        </Button>
      </div>

      {/* Overall Resilience Metrics */}
      <div className="grid gap-4 md:grid-cols-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overall Score</CardTitle>
            <Shield className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getScoreColor(resilienceMetrics.overall_resilience_score)}`}>
              {resilienceMetrics.overall_resilience_score}%
            </div>
            <Progress value={resilienceMetrics.overall_resilience_score} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">BCP Compliance</CardTitle>
            <Target className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getScoreColor(resilienceMetrics.business_continuity_compliance)}`}>
              {resilienceMetrics.business_continuity_compliance}%
            </div>
            <p className="text-xs text-muted-foreground">Principle 6</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">3rd Party Risk</CardTitle>
            <Network className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getScoreColor(resilienceMetrics.third_party_risk_coverage)}`}>
              {resilienceMetrics.third_party_risk_coverage}%
            </div>
            <p className="text-xs text-muted-foreground">Coverage</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Scenario Tests</CardTitle>
            <Activity className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getScoreColor(resilienceMetrics.scenario_test_completion)}`}>
              {resilienceMetrics.scenario_test_completion}%
            </div>
            <p className="text-xs text-muted-foreground">Completion</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">RTO Alignment</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getScoreColor(resilienceMetrics.recovery_time_alignment)}`}>
              {resilienceMetrics.recovery_time_alignment}%
            </div>
            <p className="text-xs text-muted-foreground">On Target</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Disruption Tolerance</CardTitle>
            <TrendingUp className="h-4 w-4 text-teal-600" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getScoreColor(resilienceMetrics.disruption_tolerance_compliance)}`}>
              {resilienceMetrics.disruption_tolerance_compliance}%
            </div>
            <p className="text-xs text-muted-foreground">Principle 7</p>
          </CardContent>
        </Card>
      </div>

      {/* Active Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
            Active Resilience Alerts
          </CardTitle>
          <CardDescription>
            Critical issues requiring immediate attention for OSFI compliance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {resilienceAlerts.map((alert) => (
              <div key={alert.id} className="flex items-start gap-3 p-3 border rounded-lg">
                <div className="flex-shrink-0 mt-1">
                  {alert.severity === 'critical' && <AlertTriangle className="h-4 w-4 text-red-600" />}
                  {alert.severity === 'high' && <AlertTriangle className="h-4 w-4 text-orange-600" />}
                  {alert.severity === 'medium' && <Clock className="h-4 w-4 text-yellow-600" />}
                  {alert.severity === 'low' && <CheckCircle className="h-4 w-4 text-green-600" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-sm font-medium">{alert.title}</h4>
                    <div className="flex gap-2">
                      <Badge className={getSeverityColor(alert.severity)}>
                        {alert.severity}
                      </Badge>
                      <Badge className={getStatusColor(alert.status)}>
                        {alert.status}
                      </Badge>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">{alert.description}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-blue-600">{alert.osfi_principle}</span>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">Investigate</Button>
                      <Button size="sm" variant="outline">Resolve</Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {resilienceAlerts.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
                <h3 className="text-lg font-medium mb-2">All Systems Resilient</h3>
                <p className="text-sm">No active resilience alerts at this time.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="business-continuity">Business Continuity</TabsTrigger>
          <TabsTrigger value="third-party-risk">Third-Party Risk</TabsTrigger>
        </TabsList>

        <TabsContent value="business-continuity" className="space-y-6">
          <OSFIBusinessContinuityIntegration orgId={profile?.organization_id || ''} />
        </TabsContent>

        <TabsContent value="third-party-risk" className="space-y-6">
          <OSFIThirdPartyRiskIntegration orgId={profile?.organization_id || ''} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default OSFIResilienceDashboard;