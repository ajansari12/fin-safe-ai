import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Search, AlertCircle, TrendingDown, TrendingUp } from 'lucide-react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { aiAnalyticsService, AIInsight } from '@/services/ai-analytics-service';
import { useToast } from '@/hooks/use-toast';

interface AnomalyPoint {
  id: string;
  timestamp: string;
  value: number;
  expected: number;
  deviation: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  metric: string;
}

const AnomalyDetectionDashboard: React.FC = () => {
  const [anomalies, setAnomalies] = useState<AIInsight[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastScan, setLastScan] = useState<Date | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadStoredAnomalies();
  }, []);

  const loadStoredAnomalies = async () => {
    try {
      const storedInsights = await aiAnalyticsService.getStoredInsights();
      const anomalyInsights = storedInsights.filter(insight => 
        insight.type === 'anomaly'
      );
      setAnomalies(anomalyInsights);
    } catch (error) {
      console.error('Error loading anomalies:', error);
    }
  };

  const runAnomalyDetection = async () => {
    setIsLoading(true);
    try {
      const result = await aiAnalyticsService.detectAnomalies();
      
      if (result.success) {
        setAnomalies(prev => [...result.insights, ...prev]);
        setLastScan(new Date());
        toast({
          title: "Anomaly Detection Complete",
          description: `Detected ${result.insights.length} anomalies from ${result.dataPointsAnalyzed} data points`,
        });
      } else {
        toast({
          title: "Detection Error",
          description: result.error || "Failed to detect anomalies",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to run anomaly detection",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'default';
      default: return 'default';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
      case 'high':
        return <AlertCircle className="h-4 w-4" />;
      case 'medium':
        return <TrendingUp className="h-4 w-4" />;
      default:
        return <TrendingDown className="h-4 w-4" />;
    }
  };

  // Mock data for anomaly visualization
  const anomalyScatterData = anomalies.slice(0, 10).map((anomaly, index) => ({
    x: index,
    y: anomaly.confidence * 100,
    severity: anomaly.severity,
    name: anomaly.title
  }));

  const anomalyTrendData = [
    { time: '00:00', normal: 45, anomalous: 48 },
    { time: '04:00', normal: 42, anomalous: 44 },
    { time: '08:00', normal: 55, anomalous: 72 }, // anomaly
    { time: '12:00', normal: 58, anomalous: 59 },
    { time: '16:00', normal: 52, anomalous: 53 },
    { time: '20:00', normal: 47, anomalous: 89 }, // anomaly
  ];

  const anomalyStats = {
    total: anomalies.length,
    critical: anomalies.filter(a => a.severity === 'critical').length,
    high: anomalies.filter(a => a.severity === 'high').length,
    medium: anomalies.filter(a => a.severity === 'medium').length,
    low: anomalies.filter(a => a.severity === 'low').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Anomaly Detection</h2>
          <p className="text-muted-foreground">
            AI-powered detection of unusual patterns and outliers
          </p>
        </div>
        <Button 
          onClick={runAnomalyDetection} 
          disabled={isLoading}
          className="bg-primary hover:bg-primary/90"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Scanning...
            </>
          ) : (
            <>
              <Search className="mr-2 h-4 w-4" />
              Run Detection
            </>
          )}
        </Button>
      </div>

      {/* Status Alert */}
      {lastScan && (
        <Alert>
          <Search className="h-4 w-4" />
          <AlertDescription>
            Last anomaly scan completed at {lastScan.toLocaleString()}.
            Found {anomalyStats.total} anomalies ({anomalyStats.critical + anomalyStats.high} high priority).
          </AlertDescription>
        </Alert>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-center">{anomalyStats.total}</div>
            <div className="text-sm text-muted-foreground text-center">Total Anomalies</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-center text-destructive">{anomalyStats.critical}</div>
            <div className="text-sm text-muted-foreground text-center">Critical</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-center text-destructive">{anomalyStats.high}</div>
            <div className="text-sm text-muted-foreground text-center">High</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-center text-warning">{anomalyStats.medium}</div>
            <div className="text-sm text-muted-foreground text-center">Medium</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-center">{anomalyStats.low}</div>
            <div className="text-sm text-muted-foreground text-center">Low</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="detected" className="space-y-4">
        <TabsList>
          <TabsTrigger value="detected">Detected Anomalies</TabsTrigger>
          <TabsTrigger value="patterns">Pattern Analysis</TabsTrigger>
          <TabsTrigger value="timeline">Timeline View</TabsTrigger>
        </TabsList>

        <TabsContent value="detected" className="space-y-4">
          {anomalies.length === 0 ? (
            <Card>
              <CardContent className="py-8">
                <div className="text-center text-muted-foreground">
                  <Search className="mx-auto h-12 w-12 mb-4 opacity-50" />
                  <p>No anomalies detected. Run detection to scan for unusual patterns.</p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {anomalies.map((anomaly) => (
                <Card key={anomaly.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {getSeverityIcon(anomaly.severity)}
                        <CardTitle className="text-lg">{anomaly.title}</CardTitle>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={getSeverityColor(anomaly.severity)}>
                          {anomaly.severity.toUpperCase()}
                        </Badge>
                        <Badge variant="outline">
                          {Math.round(anomaly.confidence * 100)}% confidence
                        </Badge>
                      </div>
                    </div>
                    <CardDescription>{anomaly.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Data Points */}
                      {anomaly.dataPoints.length > 0 && (
                        <div>
                          <h4 className="font-medium mb-2">Anomalous Data Points:</h4>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                            {anomaly.dataPoints.slice(0, 4).map((point, index) => (
                              <div key={index} className="text-xs bg-muted p-2 rounded">
                                {typeof point === 'object' ? 
                                  Object.entries(point).map(([key, value]) => (
                                    <div key={key}><strong>{key}:</strong> {String(value)}</div>
                                  )) : 
                                  String(point)
                                }
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Recommendations */}
                      {anomaly.recommendations.length > 0 && (
                        <div>
                          <h4 className="font-medium mb-2">Investigation Steps:</h4>
                          <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                            {anomaly.recommendations.map((rec, index) => (
                              <li key={index}>{rec}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <div className="text-xs text-muted-foreground">
                        Detected: {new Date(anomaly.generatedAt).toLocaleString()}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="patterns" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Anomaly Distribution</CardTitle>
              <CardDescription>
                Confidence vs. occurrence pattern for detected anomalies
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart data={anomalyScatterData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="x" name="Occurrence" />
                    <YAxis dataKey="y" name="Confidence %" />
                    <Tooltip 
                      cursor={{ strokeDasharray: '3 3' }}
                      content={({ active, payload }) => {
                        if (active && payload && payload[0]) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-background border border-border p-2 rounded shadow-lg">
                              <p><strong>{data.name}</strong></p>
                              <p>Confidence: {data.y}%</p>
                              <p>Severity: {data.severity}</p>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Scatter 
                      dataKey="y" 
                      fill="hsl(var(--primary))"
                    />
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timeline" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Real-time Anomaly Detection</CardTitle>
              <CardDescription>
                Normal vs. anomalous values over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={anomalyTrendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="normal" 
                      stroke="hsl(var(--primary))" 
                      name="Normal Range"
                      strokeWidth={2}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="anomalous" 
                      stroke="hsl(var(--destructive))" 
                      name="Detected Values"
                      strokeWidth={2}
                      strokeDasharray="5 5"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AnomalyDetectionDashboard;