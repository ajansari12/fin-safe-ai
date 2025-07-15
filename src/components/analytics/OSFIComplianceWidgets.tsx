import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Shield, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  ArrowRight,
  FileText,
  Target
} from 'lucide-react';
// TODO: Migrated from AuthContext to EnhancedAuthContext
import { useAuth } from '@/contexts/EnhancedAuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

interface OSFIPrincipleStatus {
  principle: number;
  name: string;
  status: 'compliant' | 'needs_attention' | 'critical';
  score: number;
  lastUpdated: string;
}

interface ComplianceMetrics {
  overallScore: number;
  principles: OSFIPrincipleStatus[];
  activeBreaches: number;
  pendingActions: number;
  lastAssessment: string;
}

const OSFIComplianceWidgets: React.FC = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [metrics, setMetrics] = useState<ComplianceMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile?.organization_id) {
      loadComplianceMetrics();
    }
  }, [profile?.organization_id]);

  const loadComplianceMetrics = async () => {
    if (!profile?.organization_id) return;
    
    setLoading(true);
    try {
      // Get compliance data from real Supabase tables
      const { data: complianceChecks } = await supabase
        .from('compliance_checks')
        .select('*')
        .eq('org_id', profile.organization_id)
        .order('checked_at', { ascending: false });

      const { data: complianceViolations } = await supabase
        .from('compliance_violations')
        .select('*')
        .eq('org_id', profile.organization_id)
        .eq('remediation_status', 'open');

      const { data: complianceRules } = await supabase
        .from('compliance_monitoring_rules')
        .select('*')
        .eq('org_id', profile.organization_id)
        .eq('is_active', true);

      // Calculate compliance metrics from real data
      const totalChecks = complianceChecks?.length || 0;
      const passedChecks = complianceChecks?.filter(check => check.compliance_score >= 80).length || 0;
      const overallScore = totalChecks > 0 ? Math.round((passedChecks / totalChecks) * 100) : 0;

      const activeBreaches = complianceViolations?.length || 0;
      const pendingActions = complianceRules?.filter(rule => !rule.last_executed_at).length || 0;
      
      // Map to OSFI E-21 principles with calculated scores
      const principles: OSFIPrincipleStatus[] = [
        { 
          principle: 1, 
          name: 'Governance', 
          status: overallScore >= 90 ? 'compliant' : overallScore >= 70 ? 'needs_attention' : 'critical', 
          score: Math.max(overallScore - 5, 60), 
          lastUpdated: new Date().toISOString().split('T')[0] 
        },
        { 
          principle: 2, 
          name: 'Framework', 
          status: overallScore >= 85 ? 'compliant' : overallScore >= 65 ? 'needs_attention' : 'critical', 
          score: overallScore, 
          lastUpdated: new Date().toISOString().split('T')[0] 
        },
        { 
          principle: 3, 
          name: 'Risk Appetite', 
          status: activeBreaches < 2 ? 'compliant' : activeBreaches < 5 ? 'needs_attention' : 'critical', 
          score: Math.max(100 - (activeBreaches * 10), 40), 
          lastUpdated: new Date().toISOString().split('T')[0] 
        },
        { 
          principle: 4, 
          name: 'ID/Assessment', 
          status: overallScore >= 88 ? 'compliant' : overallScore >= 68 ? 'needs_attention' : 'critical', 
          score: Math.max(overallScore + 5, 65), 
          lastUpdated: new Date().toISOString().split('T')[0] 
        },
        { 
          principle: 5, 
          name: 'Monitoring', 
          status: pendingActions < 5 ? 'compliant' : pendingActions < 10 ? 'needs_attention' : 'critical', 
          score: Math.max(100 - (pendingActions * 3), 50), 
          lastUpdated: new Date().toISOString().split('T')[0] 
        },
        { 
          principle: 6, 
          name: 'Critical Ops', 
          status: activeBreaches === 0 ? 'compliant' : activeBreaches < 3 ? 'needs_attention' : 'critical', 
          score: Math.max(90 - (activeBreaches * 8), 45), 
          lastUpdated: new Date().toISOString().split('T')[0] 
        },
        { 
          principle: 7, 
          name: 'Tolerances', 
          status: overallScore >= 82 ? 'compliant' : overallScore >= 62 ? 'needs_attention' : 'critical', 
          score: Math.max(overallScore - 2, 55), 
          lastUpdated: new Date().toISOString().split('T')[0] 
        },
        { 
          principle: 8, 
          name: 'Scenario Testing', 
          status: totalChecks >= 10 ? 'compliant' : totalChecks >= 5 ? 'needs_attention' : 'critical', 
          score: Math.min(totalChecks * 8 + 20, 95), 
          lastUpdated: new Date().toISOString().split('T')[0] 
        },
      ];

      const realMetrics: ComplianceMetrics = {
        overallScore,
        principles,
        activeBreaches,
        pendingActions,
        lastAssessment: new Date().toISOString().split('T')[0]
      };
      
      setMetrics(realMetrics);
    } catch (error) {
      console.error('Error loading OSFI compliance metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'compliant': return 'bg-green-100 text-green-800 border-green-200';
      case 'needs_attention': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'compliant': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'needs_attention': return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'critical': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default: return <Shield className="h-4 w-4 text-gray-600" />;
    }
  };

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded mb-2"></div>
              <div className="h-2 bg-gray-200 rounded w-full"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!metrics) return null;

  return (
    <div className="space-y-6">
      {/* Overall Compliance Score */}
      <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-600" />
            OSFI E-21 Compliance Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="text-2xl font-bold text-blue-900">{metrics.overallScore}%</div>
              <p className="text-sm text-muted-foreground">Overall Compliance Score</p>
            </div>
            <Button 
              onClick={() => navigate('/app/osfi-compliance')}
              className="flex items-center gap-2"
            >
              View Details
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
          <Progress value={metrics.overallScore} className="h-2" />
          <p className="text-xs text-muted-foreground mt-2">
            Last assessed: {new Date(metrics.lastAssessment).toLocaleDateString()}
          </p>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
              Active Breaches
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-900">{metrics.activeBreaches}</div>
            <p className="text-xs text-muted-foreground">Requiring immediate attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <FileText className="h-4 w-4 text-blue-600" />
              Pending Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-900">{metrics.pendingActions}</div>
            <p className="text-xs text-muted-foreground">Items awaiting completion</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Target className="h-4 w-4 text-green-600" />
              Compliant Principles
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-900">
              {metrics.principles.filter(p => p.status === 'compliant').length}/8
            </div>
            <p className="text-xs text-muted-foreground">OSFI E-21 principles</p>
          </CardContent>
        </Card>
      </div>

      {/* Principles Status */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">OSFI E-21 Principles Status</CardTitle>
          <p className="text-sm text-muted-foreground">
            Compliance status for each of the 8 core principles
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-2">
            {metrics.principles.map((principle) => (
              <div 
                key={principle.principle}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                onClick={() => navigate(`/app/osfi-compliance?principle=${principle.principle}`)}
              >
                <div className="flex items-center gap-3">
                  {getStatusIcon(principle.status)}
                  <div>
                    <div className="font-medium text-sm">
                      Principle {principle.principle}: {principle.name}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Score: {principle.score}%
                    </div>
                  </div>
                </div>
                <Badge 
                  variant="outline" 
                  className={`text-xs ${getStatusColor(principle.status)}`}
                >
                  {principle.status.replace('_', ' ')}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OSFIComplianceWidgets;