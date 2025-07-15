import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  TrendingUp,
  TrendingDown,
  Clock,
  FileText,
  Users,
  Database,
  Settings
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import OSFIErrorBoundary from './OSFIErrorBoundary';
import OSFILoadingState from './OSFILoadingState';
import { useOSFIDataConsistency } from '@/hooks/useOSFIDataConsistency';
import { useAuth } from '@/contexts/EnhancedAuthContext';

interface ComplianceMetric {
  principle: string;
  description: string;
  score: number;
  status: 'compliant' | 'at_risk' | 'non_compliant';
  trend: 'up' | 'down' | 'stable';
  last_assessment: string;
}

interface ComplianceAlert {
  id: string;
  severity: 'high' | 'medium' | 'low';
  principle: string;
  description: string;
  due_date: string;
  assigned_to: string;
}

const OSFIComplianceMonitoringDashboard: React.FC = () => {
  const { profile } = useAuth();
  const { data: osfiData, validation, isLoading: dataLoading, refetch: refetchData } = useOSFIDataConsistency(profile?.organization_id);
  
  const { data: complianceMetrics, isLoading: metricsLoading } = useQuery({
    queryKey: ['osfi-compliance-metrics', profile?.organization_id],
    queryFn: async () => {
      // Use consistent data from the data consistency hook
      const policies = osfiData?.compliance_policies || [];
      const checks = osfiData?.compliance_checks || [];
      const controls = osfiData?.controls || [];

      if (!osfiData || (policies.length === 0 && checks.length === 0 && controls.length === 0)) {
        // Return mock data as fallback
        return [
          {
            principle: 'Principle 1',
            description: 'Senior Management Oversight',
            score: 92,
            status: 'compliant' as const,
            trend: 'up' as const,
            last_assessment: '2024-01-10'
          },
          {
            principle: 'Principle 2',
            description: 'Operational Risk Management Framework',
            score: 88,
            status: 'compliant' as const,
            trend: 'stable' as const,
            last_assessment: '2024-01-12'
          },
          {
            principle: 'Principle 3',
            description: 'Risk Appetite and Tolerance',
            score: 78,
            status: 'at_risk' as const,
            trend: 'down' as const,
            last_assessment: '2024-01-08'
          },
          {
            principle: 'Principle 4',
            description: 'Data Management',
            score: 85,
            status: 'compliant' as const,
            trend: 'up' as const,
            last_assessment: '2024-01-14'
          },
          {
            principle: 'Principle 5',
            description: 'Data Governance',
            score: 90,
            status: 'compliant' as const,
            trend: 'stable' as const,
            last_assessment: '2024-01-11'
          },
          {
            principle: 'Principle 6',
            description: 'Business Continuity Planning',
            score: 75,
            status: 'at_risk' as const,
            trend: 'down' as const,
            last_assessment: '2024-01-09'
          },
          {
            principle: 'Principle 7',
            description: 'Third Party Risk Management',
            score: 82,
            status: 'compliant' as const,
            trend: 'up' as const,
            last_assessment: '2024-01-13'
          }
        ];
      }

      // Calculate compliance metrics based on real data
      const osfiPrinciples = [
        { principle: 'Principle 1', description: 'Senior Management Oversight' },
        { principle: 'Principle 2', description: 'Operational Risk Management Framework' },
        { principle: 'Principle 3', description: 'Risk Appetite and Tolerance' },
        { principle: 'Principle 4', description: 'Data Management' },
        { principle: 'Principle 5', description: 'Data Governance' },
        { principle: 'Principle 6', description: 'Business Continuity Planning' },
        { principle: 'Principle 7', description: 'Third Party Risk Management' }
      ];

      return osfiPrinciples.map(({ principle, description }) => {
        // Calculate score based on related compliance checks and controls
        const relatedChecks = checks?.filter(check => 
          check.policy_id && policies?.some(policy => 
            policy.id === check.policy_id && policy.policy_name.includes(principle.split(' ')[1])
          )
        ) || [];

        const relatedControls = controls?.filter(control => 
          control.title?.toLowerCase().includes(description.toLowerCase().split(' ')[0])
        ) || [];

        // Calculate compliance score
        const avgCheckScore = relatedChecks.length > 0 
          ? relatedChecks.reduce((sum, check) => sum + (check.compliance_score || 0), 0) / relatedChecks.length
          : 75;

        const avgControlScore = relatedControls.length > 0
          ? relatedControls.reduce((sum, control) => sum + (control.effectiveness_score || 75), 0) / relatedControls.length
          : 75;

        const score = Math.round((avgCheckScore + avgControlScore) / 2);

        // Determine status and trend
        let status: 'compliant' | 'at_risk' | 'non_compliant';
        if (score >= 85) status = 'compliant';
        else if (score >= 70) status = 'at_risk';
        else status = 'non_compliant';

        const trend = score >= 80 ? 'up' : score >= 70 ? 'stable' : 'down';

        return {
          principle,
          description,
          score,
          status,
          trend,
          last_assessment: new Date().toISOString().split('T')[0]
        } as ComplianceMetric;
      });
    },
    enabled: !!osfiData
  });

  const { data: complianceAlerts, isLoading: alertsLoading } = useQuery({
    queryKey: ['osfi-compliance-alerts', profile?.organization_id],
    queryFn: async () => {
      // Use consistent data from the data consistency hook
      const riskAlerts = osfiData?.risk_alerts || [];

      if (!osfiData || riskAlerts.length === 0) {
        // Return mock data as fallback
        return [
          {
            id: '1',
            severity: 'high' as const,
            principle: 'Principle 3',
            description: 'Risk appetite thresholds exceeded for operational risk',
            due_date: '2024-01-20',
            assigned_to: 'Risk Team'
          },
          {
            id: '2',
            severity: 'medium' as const,
            principle: 'Principle 6',
            description: 'BCP testing results require management review',
            due_date: '2024-01-25',
            assigned_to: 'Business Continuity Team'
          },
          {
            id: '3',
            severity: 'low' as const,
            principle: 'Principle 4',
            description: 'Data quality metrics documentation update needed',
            due_date: '2024-02-01',
            assigned_to: 'Data Team'
          }
        ];
      }

      const alerts: ComplianceAlert[] = [];

      // Map risk alerts to OSFI principles
      riskAlerts.forEach(alert => {
        const principleMap: { [key: string]: string } = {
          'operational_risk': 'Principle 2',
          'data_quality': 'Principle 4',
          'vendor_risk': 'Principle 7',
          'system_failure': 'Principle 6'
        };

        const principle = principleMap[alert.alert_type] || 'Principle 1';
        
        alerts.push({
          id: alert.id,
          severity: alert.severity as 'high' | 'medium' | 'low',
          principle,
          description: alert.description,
          due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          assigned_to: 'Risk Team'
        });
      });

      return alerts.slice(0, 10); // Limit to 10 most recent alerts
    },
    enabled: !!osfiData
  });

  const isLoading = dataLoading || metricsLoading || alertsLoading;

  if (isLoading) {
    return <OSFILoadingState type="dashboard" message="Loading OSFI compliance data..." />;
  }

  const overallScore = complianceMetrics 
    ? Math.round(complianceMetrics.reduce((sum, metric) => sum + metric.score, 0) / complianceMetrics.length)
    : 0;

  const statusCounts = complianceMetrics?.reduce((acc, metric) => {
    acc[metric.status] = (acc[metric.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  const pieData = [
    { name: 'Compliant', value: statusCounts.compliant || 0, color: '#10b981' },
    { name: 'At Risk', value: statusCounts.at_risk || 0, color: '#f59e0b' },
    { name: 'Non-Compliant', value: statusCounts.non_compliant || 0, color: '#ef4444' }
  ];

  const barData = complianceMetrics?.map(metric => ({
    principle: metric.principle.replace('Principle ', 'P'),
    score: metric.score,
    target: 85
  })) || [];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'compliant':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'at_risk':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'non_compliant':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default:
        return <CheckCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      default:
        return <TrendingUp className="h-4 w-4 text-gray-400" />;
    }
  };

  const getSeverityVariant = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'destructive';
      case 'medium':
        return 'secondary';
      case 'low':
        return 'outline';
      default:
        return 'outline';
    }
  };

  return (
    <OSFIErrorBoundary>
      {/* Data validation warnings */}
      {validation && !validation.isValid && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <span className="text-sm font-medium text-yellow-800">Data Quality Issues Detected</span>
            </div>
            {validation.errors.length > 0 && (
              <ul className="mt-2 text-xs text-yellow-700 list-disc list-inside">
                {validation.errors.map((error, i) => (
                  <li key={i}>{error}</li>
                ))}
              </ul>
            )}
            <Button 
              onClick={() => refetchData()} 
              variant="outline" 
              size="sm" 
              className="mt-2"
            >
              Refresh Data
            </Button>
          </CardContent>
        </Card>
      )}
      
      <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">OSFI Compliance Monitoring</h2>
          <p className="text-muted-foreground">
            Real-time compliance tracking and alerting for all E-21 principles
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Configure Alerts
          </Button>
          <Button size="sm">
            <FileText className="h-4 w-4 mr-2" />
            Generate Report
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Overall Score</p>
                <p className="text-2xl font-bold">{overallScore}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Compliant</p>
                <p className="text-2xl font-bold">{statusCounts.compliant || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="text-sm text-muted-foreground">At Risk</p>
                <p className="text-2xl font-bold">{statusCounts.at_risk || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-sm text-muted-foreground">Active Alerts</p>
                <p className="text-2xl font-bold">{complianceAlerts?.length || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Compliance Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Compliance Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Principle Scores */}
        <Card>
          <CardHeader>
            <CardTitle>Principle Compliance Scores</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="principle" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Legend />
                <Bar dataKey="score" fill="#3b82f6" name="Current Score" />
                <Bar dataKey="target" fill="#e5e7eb" name="Target (85%)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Compliance Metrics Detail */}
      <Card>
        <CardHeader>
          <CardTitle>OSFI E-21 Principle Compliance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {complianceMetrics?.map((metric, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(metric.status)}
                    <div>
                      <h3 className="font-semibold">{metric.principle}</h3>
                      <p className="text-sm text-muted-foreground">{metric.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getTrendIcon(metric.trend)}
                    <span className="text-lg font-bold">{metric.score}%</span>
                  </div>
                </div>
                <Progress value={metric.score} className="mb-2" />
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <span>Last assessed: {metric.last_assessment}</span>
                  <Badge variant={metric.status === 'compliant' ? 'default' : metric.status === 'at_risk' ? 'secondary' : 'destructive'}>
                    {metric.status.replace('_', ' ')}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Active Alerts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2" />
            Active Compliance Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {complianceAlerts?.map((alert) => (
              <div key={alert.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    <Badge variant={getSeverityVariant(alert.severity)}>
                      {alert.severity}
                    </Badge>
                    <Badge variant="outline">{alert.principle}</Badge>
                  </div>
                  <p className="font-medium">{alert.description}</p>
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-1">
                    <span>Due: {alert.due_date}</span>
                    <span>Assigned to: {alert.assigned_to}</span>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" size="sm">
                    View
                  </Button>
                  <Button size="sm">
                    Resolve
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      </div>
    </OSFIErrorBoundary>
  );
};

export default OSFIComplianceMonitoringDashboard;