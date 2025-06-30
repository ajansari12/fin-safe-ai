
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Shield, 
  Activity,
  Brain,
  Database,
  CheckCircle,
  Clock
} from "lucide-react";
import { riskIntelligenceService } from "@/services/intelligence/risk-intelligence-service";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";

interface IntelligenceDashboardProps {
  vendorId?: string;
}

const IntelligenceDashboard: React.FC<IntelligenceDashboardProps> = ({ vendorId }) => {
  const [selectedTimeframe, setSelectedTimeframe] = useState('7d');

  const { data: intelligence = [], isLoading: intelligenceLoading } = useQuery({
    queryKey: ['riskIntelligence', vendorId],
    queryFn: () => riskIntelligenceService.getRiskIntelligence(vendorId),
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });

  const { data: alerts = [], isLoading: alertsLoading } = useQuery({
    queryKey: ['riskAlerts'],
    queryFn: () => riskIntelligenceService.getRiskAlerts(false),
    refetchInterval: 60 * 1000, // Refetch every minute for alerts
  });

  const { data: enhancedRisk } = useQuery({
    queryKey: ['enhancedRisk', vendorId],
    queryFn: () => vendorId ? riskIntelligenceService.calculateEnhancedRiskScore(vendorId, 5) : null,
    enabled: !!vendorId,
  });

  // Process intelligence data for visualizations
  const intelligenceByType = intelligence.reduce((acc, intel) => {
    if (!acc[intel.intelligence_type]) {
      acc[intel.intelligence_type] = [];
    }
    acc[intel.intelligence_type].push(intel);
    return acc;
  }, {} as Record<string, any[]>);

  const riskTrendData = intelligence
    .slice(0, 30)
    .reverse()
    .map((intel, index) => ({
      date: new Date(intel.collected_at).toLocaleDateString(),
      score: intel.risk_score,
      confidence: intel.confidence_score * 100,
      source: intel.attribution
    }));

  const alertsByType = alerts.reduce((acc, alert) => {
    acc[alert.alert_type] = (acc[alert.alert_type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const criticalAlerts = alerts.filter(alert => alert.severity === 'critical');
  const averageRiskScore = intelligence.length > 0 
    ? intelligence.reduce((sum, intel) => sum + intel.risk_score, 0) / intelligence.length 
    : 0;

  const handleAcknowledgeAlert = async (alertId: string) => {
    await riskIntelligenceService.acknowledgeAlert(alertId);
    // Refresh alerts after acknowledgment
    window.location.reload();
  };

  if (intelligenceLoading || alertsLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="h-20 animate-pulse bg-gray-100 rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Alert Banner */}
      {criticalAlerts.length > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>{criticalAlerts.length} Critical Risk Alert{criticalAlerts.length > 1 ? 's' : ''}</strong>
            {criticalAlerts.length === 1 && (
              <span> - {criticalAlerts[0].description}</span>
            )}
          </AlertDescription>
        </Alert>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Risk Intelligence Sources</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Object.keys(intelligenceByType).length}</div>
            <p className="text-xs text-muted-foreground">
              Active data sources
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Risk Score</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageRiskScore.toFixed(1)}</div>
            <Progress value={(averageRiskScore / 10) * 100} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              Out of 10.0 maximum
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{alerts.length}</div>
            <p className="text-xs text-muted-foreground">
              {criticalAlerts.length} critical, {alerts.filter(a => a.severity === 'high').length} high
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Data Freshness</CardTitle>
            <Clock className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {intelligence.length > 0 ? Math.min(...intelligence.map(i => i.data_freshness_hours)) : 0}h
            </div>
            <p className="text-xs text-muted-foreground">
              Most recent update
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="trends">Risk Trends</TabsTrigger>
          <TabsTrigger value="alerts">Alerts</TabsTrigger>
          <TabsTrigger value="sources">Data Sources</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Enhanced Risk Score */}
          {enhancedRisk && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  Enhanced Risk Assessment
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">
                      {enhancedRisk.enhancedScore}/10
                    </div>
                    <p className="text-sm text-muted-foreground">Enhanced Score</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">
                      {(enhancedRisk.confidence * 100).toFixed(0)}%
                    </div>
                    <p className="text-sm text-muted-foreground">Confidence</p>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600">
                      {enhancedRisk.contributors.length}
                    </div>
                    <p className="text-sm text-muted-foreground">Data Sources</p>
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  <h4 className="font-medium">Risk Contributors:</h4>
                  {enhancedRisk.contributors.map((contributor, index) => (
                    <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <span className="text-sm">{contributor.source}</span>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{contributor.score}/10</Badge>
                        <span className="text-xs text-muted-foreground">
                          {(contributor.weight * 100).toFixed(0)}% weight
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Intelligence by Type */}
          <Card>
            <CardHeader>
              <CardTitle>Intelligence Sources</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(intelligenceByType).map(([type, data]) => (
                  <div key={type} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium capitalize">{type.replace('_', ' ')}</h4>
                      <Badge variant="secondary">{data.length}</Badge>
                    </div>
                    
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <div>Avg Score: {(data.reduce((sum, d) => sum + d.risk_score, 0) / data.length).toFixed(1)}</div>
                      <div>Confidence: {(data.reduce((sum, d) => sum + d.confidence_score, 0) / data.length * 100).toFixed(0)}%</div>
                      <div>Last Update: {new Date(data[0]?.collected_at).toLocaleDateString()}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Risk Score Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={riskTrendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis domain={[0, 10]} />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="score" 
                      stroke="#2563eb" 
                      strokeWidth={2}
                      name="Risk Score"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="confidence" 
                      stroke="#16a34a" 
                      strokeWidth={2}
                      name="Confidence %"
                      yAxisId="right"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Risk Alerts
                <Badge variant="destructive">{alerts.length} Active</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {alerts.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
                    <p>No active alerts - all systems normal</p>
                  </div>
                ) : (
                  alerts.map((alert) => (
                    <div key={alert.id} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant={
                              alert.severity === 'critical' ? 'destructive' :
                              alert.severity === 'high' ? 'default' : 'secondary'
                            }
                          >
                            {alert.severity}
                          </Badge>
                          <span className="font-medium capitalize">
                            {alert.alert_type.replace('_', ' ')}
                          </span>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleAcknowledgeAlert(alert.id)}
                        >
                          Acknowledge
                        </Button>
                      </div>
                      
                      <p className="text-sm mb-2">{alert.description}</p>
                      
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>Source: {alert.source_attribution}</span>
                        <span>{new Date(alert.triggered_at).toLocaleString()}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sources" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Data Source Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(intelligenceByType).map(([type, data]) => {
                  const avgFreshness = data.reduce((sum, d) => sum + d.data_freshness_hours, 0) / data.length;
                  const avgConfidence = data.reduce((sum, d) => sum + d.confidence_score, 0) / data.length;
                  
                  return (
                    <div key={type} className="p-4 border rounded-lg">
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="font-medium capitalize">{type.replace('_', ' ')}</h4>
                        <Badge 
                          variant={avgFreshness < 24 ? 'default' : avgFreshness < 72 ? 'secondary' : 'destructive'}
                        >
                          {avgFreshness.toFixed(0)}h old
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <div className="text-muted-foreground">Data Points</div>
                          <div className="font-medium">{data.length}</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Avg Confidence</div>
                          <div className="font-medium">{(avgConfidence * 100).toFixed(0)}%</div>
                        </div>
                        <div>
                          <div className="text-muted-foreground">Quality Score</div>
                          <div className="font-medium">
                            {avgFreshness < 24 && avgConfidence > 0.8 ? 'Excellent' :
                             avgFreshness < 72 && avgConfidence > 0.6 ? 'Good' : 'Needs Attention'}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default IntelligenceDashboard;
