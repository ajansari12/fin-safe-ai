import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { 
  Activity, 
  Clock, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle,
  XCircle,
  RefreshCw
} from 'lucide-react';

interface AIMetrics {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  rateLimitHits: number;
  lastError?: string;
  lastSuccessfulRequest?: string;
}

interface AIHealthStatus {
  status: 'healthy' | 'degraded' | 'down';
  uptime: number;
  responseTime: number;
  errorRate: number;
}

const AIHealthMonitor: React.FC = () => {
  const [metrics, setMetrics] = useState<AIMetrics>({
    totalRequests: 0,
    successfulRequests: 0,
    failedRequests: 0,
    averageResponseTime: 0,
    rateLimitHits: 0
  });
  
  const [healthStatus, setHealthStatus] = useState<AIHealthStatus>({
    status: 'healthy',
    uptime: 99.9,
    responseTime: 0,
    errorRate: 0
  });
  
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [lastCheck, setLastCheck] = useState<Date | null>(null);

  useEffect(() => {
    checkAIHealth();
    const interval = setInterval(checkAIHealth, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const checkAIHealth = async () => {
    try {
      setIsMonitoring(true);
      const startTime = Date.now();

      // Test AI Assistant endpoint
      const { data, error } = await supabase.functions.invoke('ai-assistant', {
        body: {
          message: 'Health check - please respond briefly',
          context: { module: 'health_check' },
          userId: (await supabase.auth.getUser()).data.user?.id
        }
      });

      const responseTime = Date.now() - startTime;
      setLastCheck(new Date());

      if (error) {
        // Handle different types of errors
        let status: AIHealthStatus['status'] = 'down';
        
        if (error.message.includes('rate limit') || error.message.includes('429')) {
          status = 'degraded';
          setMetrics(prev => ({ ...prev, rateLimitHits: prev.rateLimitHits + 1 }));
        }

        setHealthStatus(prev => ({
          ...prev,
          status,
          responseTime,
          errorRate: (prev.errorRate + 1) / 2, // Simple moving average
          lastError: error.message
        }));

        setMetrics(prev => ({
          ...prev,
          totalRequests: prev.totalRequests + 1,
          failedRequests: prev.failedRequests + 1,
          lastError: error.message
        }));
      } else if (data?.response) {
        setHealthStatus(prev => ({
          ...prev,
          status: responseTime < 5000 ? 'healthy' : 'degraded',
          responseTime,
          errorRate: Math.max(0, prev.errorRate - 0.1) // Improve error rate on success
        }));

        setMetrics(prev => ({
          ...prev,
          totalRequests: prev.totalRequests + 1,
          successfulRequests: prev.successfulRequests + 1,
          averageResponseTime: (prev.averageResponseTime + responseTime) / 2,
          lastSuccessfulRequest: new Date().toISOString()
        }));
      }
    } catch (error) {
      console.error('Health check failed:', error);
      setHealthStatus(prev => ({
        ...prev,
        status: 'down',
        errorRate: Math.min(100, prev.errorRate + 10)
      }));
    } finally {
      setIsMonitoring(false);
    }
  };

  const getStatusColor = (status: AIHealthStatus['status']) => {
    switch (status) {
      case 'healthy': return 'text-green-600 bg-green-50';
      case 'degraded': return 'text-yellow-600 bg-yellow-50';
      case 'down': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = (status: AIHealthStatus['status']) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="h-4 w-4" />;
      case 'degraded': return <AlertTriangle className="h-4 w-4" />;
      case 'down': return <XCircle className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const successRate = metrics.totalRequests > 0 
    ? ((metrics.successfulRequests / metrics.totalRequests) * 100).toFixed(1)
    : '0';

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          AI System Health Monitor
        </CardTitle>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={checkAIHealth}
          disabled={isMonitoring}
        >
          {isMonitoring ? (
            <RefreshCw className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <RefreshCw className="h-4 w-4 mr-2" />
          )}
          {isMonitoring ? 'Checking...' : 'Check Now'}
        </Button>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Overall Status */}
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex items-center gap-3">
            {getStatusIcon(healthStatus.status)}
            <div>
              <h3 className="font-semibold">System Status</h3>
              <p className="text-sm text-muted-foreground">
                {lastCheck ? `Last checked: ${lastCheck.toLocaleTimeString()}` : 'Not checked yet'}
              </p>
            </div>
          </div>
          <Badge className={getStatusColor(healthStatus.status)}>
            {healthStatus.status.toUpperCase()}
          </Badge>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 border rounded-lg">
            <div className="text-2xl font-bold text-green-600">{successRate}%</div>
            <div className="text-xs text-muted-foreground">Success Rate</div>
          </div>
          
          <div className="text-center p-3 border rounded-lg">
            <div className="text-2xl font-bold">{Math.round(healthStatus.responseTime)}ms</div>
            <div className="text-xs text-muted-foreground">Response Time</div>
          </div>
          
          <div className="text-center p-3 border rounded-lg">
            <div className="text-2xl font-bold">{metrics.totalRequests}</div>
            <div className="text-xs text-muted-foreground">Total Requests</div>
          </div>
          
          <div className="text-center p-3 border rounded-lg">
            <div className="text-2xl font-bold text-red-600">{metrics.rateLimitHits}</div>
            <div className="text-xs text-muted-foreground">Rate Limits</div>
          </div>
        </div>

        {/* Detailed Metrics */}
        <div className="space-y-3">
          <h4 className="font-medium">Detailed Statistics</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Successful Requests:</span>
                <span className="font-medium text-green-600">{metrics.successfulRequests}</span>
              </div>
              <div className="flex justify-between">
                <span>Failed Requests:</span>
                <span className="font-medium text-red-600">{metrics.failedRequests}</span>
              </div>
              <div className="flex justify-between">
                <span>Average Response Time:</span>
                <span className="font-medium">{Math.round(metrics.averageResponseTime)}ms</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>Uptime:</span>
                <span className="font-medium">{healthStatus.uptime}%</span>
              </div>
              <div className="flex justify-between">
                <span>Error Rate:</span>
                <span className="font-medium">{healthStatus.errorRate.toFixed(1)}%</span>
              </div>
              <div className="flex justify-between">
                <span>Rate Limit Hits:</span>
                <span className="font-medium">{metrics.rateLimitHits}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Alerts */}
        {healthStatus.status === 'down' && (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertDescription>
              AI services are currently down. {metrics.lastError && `Error: ${metrics.lastError}`}
            </AlertDescription>
          </Alert>
        )}

        {healthStatus.status === 'degraded' && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              AI services are experiencing degraded performance. Response times may be slower than usual.
            </AlertDescription>
          </Alert>
        )}

        {metrics.rateLimitHits > 5 && (
          <Alert>
            <Clock className="h-4 w-4" />
            <AlertDescription>
              Multiple rate limit hits detected. Consider implementing request queuing or reducing request frequency.
            </AlertDescription>
          </Alert>
        )}

        {/* System Information */}
        <div className="text-xs text-muted-foreground border-t pt-4">
          <p>• Health checks run every 30 seconds</p>
          <p>• Rate limiting: 10 requests per minute per user</p>
          <p>• OpenAI GPT-4.1 model with 1000 token limit</p>
          <p>• Knowledge base search with semantic embeddings</p>
          {metrics.lastSuccessfulRequest && (
            <p>• Last successful request: {new Date(metrics.lastSuccessfulRequest).toLocaleString()}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AIHealthMonitor;