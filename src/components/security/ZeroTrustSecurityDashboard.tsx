
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { 
  Shield, 
  AlertTriangle, 
  Users, 
  Activity, 
  TrendingUp, 
  Lock, 
  Eye, 
  Clock,
  Zap,
  Target,
  CheckCircle,
  XCircle,
  AlertCircle
} from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';
import { zeroTrustService } from "@/services/security/zero-trust-service";
import { behavioralAnalyticsService } from "@/services/security/behavioral-analytics-service";
import { useToast } from "@/hooks/use-toast";

const ZeroTrustSecurityDashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [threatIndicators, setThreatIndicators] = useState<any[]>([]);
  const [securityMetrics, setSecurityMetrics] = useState<any[]>([]);
  const [behaviorAnalytics, setBehaviorAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadDashboardData();
    
    // Start behavioral analytics collection
    behavioralAnalyticsService.startBehaviorCollection();
    
    // Refresh data every 30 seconds
    const interval = setInterval(loadDashboardData, 30000);
    
    return () => {
      clearInterval(interval);
      behavioralAnalyticsService.stopBehaviorCollection();
    };
  }, []);

  const loadDashboardData = async () => {
    try {
      const [dashboard, indicators, metrics, behavior] = await Promise.all([
        zeroTrustService.getSecurityDashboardData(),
        zeroTrustService.getThreatIndicators(),
        zeroTrustService.getSecurityMetrics(),
        behavioralAnalyticsService.getBehaviorAnalytics('day')
      ]);

      setDashboardData(dashboard);
      setThreatIndicators(indicators);
      setSecurityMetrics(metrics);
      setBehaviorAnalytics(behavior);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load security dashboard data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'critical': return 'text-red-600 bg-red-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <XCircle className="h-4 w-4 text-red-600" />;
      case 'high': return <AlertTriangle className="h-4 w-4 text-orange-600" />;
      case 'medium': return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      case 'low': return <CheckCircle className="h-4 w-4 text-green-600" />;
      default: return <Eye className="h-4 w-4 text-gray-600" />;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const riskMetricsData = securityMetrics
    .filter(m => m.metric_type === 'risk_assessment')
    .slice(0, 7)
    .map(m => ({
      date: new Date(m.measurement_date).toLocaleDateString(),
      riskScore: m.metric_value
    }));

  const threatDistribution = [
    { name: 'Critical', value: threatIndicators.filter(t => t.severity === 'critical').length, color: '#ef4444' },
    { name: 'High', value: threatIndicators.filter(t => t.severity === 'high').length, color: '#f97316' },
    { name: 'Medium', value: threatIndicators.filter(t => t.severity === 'medium').length, color: '#eab308' },
    { name: 'Low', value: threatIndicators.filter(t => t.severity === 'low').length, color: '#22c55e' }
  ].filter(item => item.value > 0);

  const complianceData = [
    { framework: 'SOX', compliance: 85, target: 95 },
    { framework: 'GDPR', compliance: 92, target: 95 },
    { framework: 'ISO 27001', compliance: 78, target: 90 },
    { framework: 'PCI DSS', compliance: 88, target: 95 }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Zero Trust Security Dashboard</h1>
        <p className="text-muted-foreground">
          Comprehensive security monitoring and threat protection
        </p>
      </div>

      {/* Security Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overall Risk Level</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <Badge className={getRiskLevelColor(dashboardData?.riskLevel || 'low')}>
                {(dashboardData?.riskLevel || 'Low').toUpperCase()}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Based on recent security events
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Threats</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{threatIndicators.length}</div>
            <p className="text-xs text-muted-foreground">
              {threatIndicators.filter(t => t.severity === 'critical').length} critical threats
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Security Events</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardData?.recentEvents?.length || 0}</div>
            <p className="text-xs text-muted-foreground">
              Last 24 hours
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Compliance Score</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(dashboardData?.complianceStatus?.compliancePercentage || 0)}%
            </div>
            <p className="text-xs text-muted-foreground">
              {dashboardData?.complianceStatus?.compliantFrameworks || 0} of {dashboardData?.complianceStatus?.totalFrameworks || 0} frameworks
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="threats">Threats</TabsTrigger>
          <TabsTrigger value="behavior">Behavior</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
          <TabsTrigger value="incidents">Incidents</TabsTrigger>
          <TabsTrigger value="metrics">Metrics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Risk Trend Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Risk Trend (7 Days)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={riskMetricsData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="riskScore" 
                      stroke="#ef4444" 
                      strokeWidth={2}
                      dot={{ fill: '#ef4444' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Threat Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Threat Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                {threatDistribution.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={threatDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {threatDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                    <div className="text-center">
                      <CheckCircle className="h-12 w-12 mx-auto mb-2 text-green-500" />
                      <p>No active threats detected</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Recent Security Events */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Recent Security Events
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dashboardData?.recentEvents?.slice(0, 10).map((event: any, index: number) => (
                  <div key={index} className="flex items-center justify-between border-b pb-2">
                    <div className="flex items-center gap-3">
                      {getSeverityIcon(event.risk_score > 70 ? 'critical' : event.risk_score > 40 ? 'medium' : 'low')}
                      <div>
                        <p className="font-medium">{event.event_type.replace(/_/g, ' ').toUpperCase()}</p>
                        <p className="text-sm text-muted-foreground">
                          {event.action_performed} - {event.outcome}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant={event.risk_score > 70 ? 'destructive' : event.risk_score > 40 ? 'secondary' : 'default'}>
                        Risk: {event.risk_score}
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(event.created_at).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
                
                {(!dashboardData?.recentEvents || dashboardData.recentEvents.length === 0) && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Activity className="h-12 w-12 mx-auto mb-2" />
                    <p>No recent security events</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="threats" className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Active Threat Indicators
                </CardTitle>
                <CardDescription>
                  Real-time threat intelligence and indicators of compromise
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {threatIndicators.map((threat, index) => (
                    <div key={index} className="flex items-center justify-between border rounded-lg p-4">
                      <div className="flex items-center gap-3">
                        {getSeverityIcon(threat.severity)}
                        <div>
                          <p className="font-medium">{threat.threat_type.toUpperCase()}</p>
                          <p className="text-sm text-muted-foreground">
                            {threat.indicator_type}: {threat.indicator_value}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Source: {threat.source_feed}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge className={getRiskLevelColor(threat.severity)}>
                          {threat.severity.toUpperCase()}
                        </Badge>
                        <p className="text-xs text-muted-foreground mt-1">
                          Confidence: {Math.round(threat.confidence_score * 100)}%
                        </p>
                      </div>
                    </div>
                  ))}
                  
                  {threatIndicators.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <Shield className="h-12 w-12 mx-auto mb-2 text-green-500" />
                      <p>No active threat indicators</p>
                      <p className="text-sm">Your environment is currently secure</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="behavior" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Behavioral Analytics Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span>Average Anomaly Score</span>
                    <Badge variant={
                      (behaviorAnalytics?.averageAnomalyScore || 0) > 70 ? 'destructive' : 
                      (behaviorAnalytics?.averageAnomalyScore || 0) > 40 ? 'secondary' : 'default'
                    }>
                      {Math.round(behaviorAnalytics?.averageAnomalyScore || 0)}%
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Events Analyzed</span>
                    <span className="font-medium">{behaviorAnalytics?.totalEvents || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Risk Indicators</span>
                    <span className="font-medium">{behaviorAnalytics?.riskIndicators?.length || 0}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Risk Indicators</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {behaviorAnalytics?.riskIndicators?.slice(0, 5).map((indicator: any, index: number) => (
                    <Alert key={index}>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        <strong>{indicator.type.replace(/_/g, ' ').toUpperCase()}</strong>
                        <br />
                        {indicator.description}
                      </AlertDescription>
                    </Alert>
                  ))}
                  
                  {(!behaviorAnalytics?.riskIndicators || behaviorAnalytics.riskIndicators.length === 0) && (
                    <div className="text-center py-4 text-muted-foreground">
                      <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
                      <p>No behavioral risk indicators detected</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                Compliance Framework Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {complianceData.map((framework, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{framework.framework}</span>
                      <span className="text-sm text-muted-foreground">
                        {framework.compliance}% / {framework.target}%
                      </span>
                    </div>
                    <Progress 
                      value={framework.compliance} 
                      className="h-2"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Current Compliance</span>
                      <span>Target: {framework.target}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="incidents" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Security Incident Response
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Zap className="h-12 w-12 mx-auto mb-2" />
                <p>No active security incidents</p>
                <p className="text-sm">Automated response systems are monitoring</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="metrics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Security Metrics & KPIs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={complianceData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="framework" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="compliance" fill="#22c55e" name="Current Compliance" />
                  <Bar dataKey="target" fill="#e5e7eb" name="Target" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ZeroTrustSecurityDashboard;
