
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { AlertTriangle, CheckCircle, Clock, TrendingUp, Activity, Bell } from "lucide-react";

interface ToleranceStatus {
  id: string;
  operationName: string;
  classification: 'critical' | 'high' | 'medium' | 'low';
  status: 'operational' | 'degraded' | 'breach' | 'offline';
  currentRTO: number;
  maxRTO: number;
  currentRPO: number;
  maxRPO: number;
  serviceLevel: number;
  serviceThreshold: number;
  lastUpdate: string;
  incidentCount: number;
  uptime: number;
}

const ToleranceMonitoring = () => {
  const [toleranceStatuses, setToleranceStatuses] = useState<ToleranceStatus[]>([
    {
      id: '1',
      operationName: 'Core Banking System',
      classification: 'critical',
      status: 'operational',
      currentRTO: 45,
      maxRTO: 60,
      currentRPO: 12,
      maxRPO: 15,
      serviceLevel: 98.5,
      serviceThreshold: 95,
      lastUpdate: '2024-01-20T14:30:00Z',
      incidentCount: 0,
      uptime: 99.9
    },
    {
      id: '2',
      operationName: 'Online Banking Portal',
      classification: 'high',
      status: 'degraded',
      currentRTO: 90,
      maxRTO: 120,
      currentRPO: 25,
      maxRPO: 30,
      serviceLevel: 87,
      serviceThreshold: 90,
      lastUpdate: '2024-01-20T14:25:00Z',
      incidentCount: 2,
      uptime: 97.8
    },
    {
      id: '3',
      operationName: 'ATM Network',
      classification: 'high',
      status: 'breach',
      currentRTO: 180,
      maxRTO: 120,
      currentRPO: 45,
      maxRPO: 30,
      serviceLevel: 78,
      serviceThreshold: 85,
      lastUpdate: '2024-01-20T14:20:00Z',
      incidentCount: 5,
      uptime: 94.2
    }
  ]);

  const [refreshTime, setRefreshTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setRefreshTime(new Date());
      // Simulate real-time updates
      setToleranceStatuses(prev => prev.map(status => ({
        ...status,
        lastUpdate: new Date().toISOString(),
        serviceLevel: Math.max(75, status.serviceLevel + (Math.random() - 0.5) * 2)
      })));
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational': return 'bg-green-100 text-green-800';
      case 'degraded': return 'bg-yellow-100 text-yellow-800';
      case 'breach': return 'bg-red-100 text-red-800';
      case 'offline': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'operational': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'degraded': return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'breach': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'offline': return <Clock className="h-4 w-4 text-gray-500" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const getClassificationColor = (classification: string) => {
    switch (classification) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRTOProgress = (current: number, max: number) => {
    return Math.min(100, (current / max) * 100);
  };

  const operationalCount = toleranceStatuses.filter(t => t.status === 'operational').length;
  const degradedCount = toleranceStatuses.filter(t => t.status === 'degraded').length;
  const breachCount = toleranceStatuses.filter(t => t.status === 'breach').length;
  const totalIncidents = toleranceStatuses.reduce((sum, t) => sum + t.incidentCount, 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Real-time Tolerance Monitoring</h2>
          <p className="text-muted-foreground">
            Live status of all critical operations - Last updated: {refreshTime.toLocaleTimeString()}
          </p>
        </div>
        <Button variant="outline" onClick={() => setRefreshTime(new Date())}>
          <Activity className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Operational</p>
                <p className="text-2xl font-bold text-green-600">{operationalCount}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Degraded</p>
                <p className="text-2xl font-bold text-yellow-600">{degradedCount}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Breached</p>
                <p className="text-2xl font-bold text-red-600">{breachCount}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Incidents</p>
                <p className="text-2xl font-bold">{totalIncidents}</p>
              </div>
              <Bell className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Status Cards */}
      <div className="grid gap-4">
        {toleranceStatuses.map((tolerance) => (
          <Card key={tolerance.id} className={tolerance.status === 'breach' ? 'border-red-200' : ''}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    {getStatusIcon(tolerance.status)}
                    {tolerance.operationName}
                    <Badge className={getClassificationColor(tolerance.classification)}>
                      {tolerance.classification}
                    </Badge>
                    <Badge className={getStatusColor(tolerance.status)}>
                      {tolerance.status}
                    </Badge>
                  </CardTitle>
                  <CardDescription>
                    Last updated: {new Date(tolerance.lastUpdate).toLocaleString()}
                  </CardDescription>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">Uptime</p>
                  <p className="text-lg font-bold">{tolerance.uptime}%</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* RTO Meter */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Recovery Time (RTO)</span>
                    <span className="text-sm text-muted-foreground">
                      {tolerance.currentRTO}/{tolerance.maxRTO} min
                    </span>
                  </div>
                  <Progress 
                    value={getRTOProgress(tolerance.currentRTO, tolerance.maxRTO)} 
                    className={`h-2 ${tolerance.currentRTO > tolerance.maxRTO ? 'bg-red-100' : 'bg-green-100'}`}
                  />
                  {tolerance.currentRTO > tolerance.maxRTO && (
                    <p className="text-xs text-red-600">⚠️ RTO tolerance exceeded</p>
                  )}
                </div>

                {/* RPO Meter */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Recovery Point (RPO)</span>
                    <span className="text-sm text-muted-foreground">
                      {tolerance.currentRPO}/{tolerance.maxRPO} min
                    </span>
                  </div>
                  <Progress 
                    value={getRTOProgress(tolerance.currentRPO, tolerance.maxRPO)} 
                    className={`h-2 ${tolerance.currentRPO > tolerance.maxRPO ? 'bg-red-100' : 'bg-green-100'}`}
                  />
                  {tolerance.currentRPO > tolerance.maxRPO && (
                    <p className="text-xs text-red-600">⚠️ RPO tolerance exceeded</p>
                  )}
                </div>

                {/* Service Level Meter */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium">Service Level</span>
                    <span className="text-sm text-muted-foreground">
                      {tolerance.serviceLevel.toFixed(1)}%
                    </span>
                  </div>
                  <Progress 
                    value={tolerance.serviceLevel} 
                    className={`h-2 ${tolerance.serviceLevel < tolerance.serviceThreshold ? 'bg-red-100' : 'bg-green-100'}`}
                  />
                  {tolerance.serviceLevel < tolerance.serviceThreshold && (
                    <p className="text-xs text-red-600">⚠️ Below service threshold ({tolerance.serviceThreshold}%)</p>
                  )}
                </div>
              </div>

              {tolerance.incidentCount > 0 && (
                <div className="mt-4 pt-4 border-t">
                  <div className="flex items-center gap-2">
                    <Bell className="h-4 w-4 text-orange-500" />
                    <span className="text-sm font-medium">
                      {tolerance.incidentCount} active incident{tolerance.incidentCount > 1 ? 's' : ''}
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ToleranceMonitoring;
