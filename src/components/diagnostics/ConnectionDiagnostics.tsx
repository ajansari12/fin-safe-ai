import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Wifi, 
  WifiOff, 
  Database, 
  RefreshCw, 
  Activity,
  AlertCircle,
  CheckCircle,
  Timer,
  TrendingUp,
  Zap
} from 'lucide-react';
import { useConnectionMonitor } from '@/hooks/useConnectionMonitor';
import { useResilientQuery } from '@/hooks/useResilientQuery';

export const ConnectionDiagnostics: React.FC = () => {
  const [showDetails, setShowDetails] = useState(false);
  const [testResults, setTestResults] = useState<any[]>([]);
  const [isRunningTests, setIsRunningTests] = useState(false);
  
  const { connectionState, isOnline, isConnected, latency, forceReconnect, performHealthCheck } = useConnectionMonitor();
  const { getCacheStatus, clearCache } = useResilientQuery();

  const runConnectionTests = async () => {
    setIsRunningTests(true);
    setTestResults([]);
    
    const tests = [
      {
        name: 'Internet Connectivity',
        test: async () => {
          try {
            const response = await fetch('https://www.google.com/favicon.ico', { 
              method: 'HEAD',
              mode: 'no-cors'
            });
            return { success: true, message: 'Internet connection active' };
          } catch (error) {
            return { success: false, message: 'No internet connection' };
          }
        }
      },
      {
        name: 'Supabase Connection',
        test: async () => {
          try {
            await performHealthCheck();
            return { 
              success: isConnected, 
              message: isConnected ? 'Database connection active' : 'Database connection failed'
            };
          } catch (error) {
            return { success: false, message: 'Database connection test failed' };
          }
        }
      },
      {
        name: 'Cache Status',
        test: async () => {
          const cacheStatus = getCacheStatus();
          return { 
            success: true, 
            message: `${cacheStatus.size} cached items`,
            details: cacheStatus 
          };
        }
      },
      {
        name: 'Latency Test',
        test: async () => {
          const startTime = Date.now();
          try {
            await performHealthCheck();
            const testLatency = Date.now() - startTime;
            return { 
              success: testLatency < 2000, 
              message: `${testLatency}ms response time`,
              details: { latency: testLatency }
            };
          } catch (error) {
            return { success: false, message: 'Latency test failed' };
          }
        }
      }
    ];

    const results = [];
    for (const test of tests) {
      try {
        const result = await test.test();
        results.push({
          name: test.name,
          ...result,
          timestamp: new Date()
        });
      } catch (error) {
        results.push({
          name: test.name,
          success: false,
          message: 'Test execution failed',
          timestamp: new Date()
        });
      }
      setTestResults([...results]);
    }
    
    setIsRunningTests(false);
  };

  const getConnectionStatus = () => {
    if (!isOnline) return { status: 'offline', color: 'bg-red-500', text: 'Offline' };
    if (!isConnected) return { status: 'disconnected', color: 'bg-yellow-500', text: 'Disconnected' };
    if (latency && latency > 2000) return { status: 'slow', color: 'bg-orange-500', text: 'Slow' };
    return { status: 'connected', color: 'bg-green-500', text: 'Connected' };
  };

  const connectionStatus = getConnectionStatus();

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Connection Diagnostics
          <Badge variant="outline" className="ml-2">
            <div className={`w-2 h-2 rounded-full ${connectionStatus.color} mr-2`} />
            {connectionStatus.text}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Connection Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="border-2">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                {isOnline ? (
                  <Wifi className="h-8 w-8 text-green-500" />
                ) : (
                  <WifiOff className="h-8 w-8 text-red-500" />
                )}
                <div>
                  <p className="font-semibold">Internet</p>
                  <p className="text-sm text-muted-foreground">
                    {isOnline ? 'Connected' : 'Disconnected'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                {isConnected ? (
                  <Database className="h-8 w-8 text-green-500" />
                ) : (
                  <Database className="h-8 w-8 text-red-500" />
                )}
                <div>
                  <p className="font-semibold">Database</p>
                  <p className="text-sm text-muted-foreground">
                    {isConnected ? 'Connected' : 'Disconnected'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                {latency ? (
                  <Timer className="h-8 w-8 text-blue-500" />
                ) : (
                  <Timer className="h-8 w-8 text-gray-400" />
                )}
                <div>
                  <p className="font-semibold">Latency</p>
                  <p className="text-sm text-muted-foreground">
                    {latency ? `${latency}ms` : 'Unknown'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 flex-wrap">
          <Button onClick={forceReconnect} disabled={isRunningTests}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Force Reconnect
          </Button>
          <Button onClick={runConnectionTests} disabled={isRunningTests}>
            <Zap className={`h-4 w-4 mr-2 ${isRunningTests ? 'animate-spin' : ''}`} />
            Run Tests
          </Button>
          <Button variant="outline" onClick={() => setShowDetails(!showDetails)}>
            {showDetails ? 'Hide' : 'Show'} Details
          </Button>
          <Button variant="outline" onClick={() => clearCache()}>
            Clear Cache
          </Button>
        </div>

        {/* Test Results */}
        {testResults.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-semibold">Test Results</h3>
            {testResults.map((result, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  {result.success ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-red-500" />
                  )}
                  <div>
                    <p className="font-medium">{result.name}</p>
                    <p className="text-sm text-muted-foreground">{result.message}</p>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground">
                  {result.timestamp.toLocaleTimeString()}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Detailed Status */}
        {showDetails && (
          <div className="space-y-3">
            <h3 className="font-semibold">Connection Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <p><strong>Online Status:</strong> {isOnline ? 'Online' : 'Offline'}</p>
                <p><strong>Database Connected:</strong> {isConnected ? 'Yes' : 'No'}</p>
                <p><strong>Retry Count:</strong> {connectionState.retryCount}</p>
                <p><strong>Max Retries:</strong> {connectionState.maxRetries}</p>
              </div>
              <div className="space-y-2">
                <p><strong>Last Ping:</strong> {connectionState.lastPingTime ? new Date(connectionState.lastPingTime).toLocaleTimeString() : 'Never'}</p>
                <p><strong>Latency:</strong> {latency ? `${latency}ms` : 'Unknown'}</p>
                <p><strong>Cache Items:</strong> {getCacheStatus().size}</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};