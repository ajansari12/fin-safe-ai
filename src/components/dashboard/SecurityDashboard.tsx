import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  TrendingUp, 
  TrendingDown,
  Activity,
  Eye,
  RefreshCw
} from "lucide-react";
import { useSecurityDashboard } from "@/hooks/useSecurityDashboard";
import { useAuth } from "@/contexts/EnhancedAuthContext";
import { formatDistanceToNow } from "date-fns";
import { useState } from "react";

export function SecurityDashboard() {
  const { user, profile } = useAuth();
  const orgId = profile?.organization_id;
  const {
    metrics,
    activeIncidents,
    validationResults,
    loading,
    error,
    refreshData,
    resolveIncident,
    getSecurityScore,
    getSecurityStatus,
    getCriticalIssues,
    getRecommendations
  } = useSecurityDashboard(orgId);

  const [resolving, setResolving] = useState<string | null>(null);

  const handleResolveIncident = async (incidentId: string, status: 'resolved' | 'false_positive') => {
    setResolving(incidentId);
    try {
      await resolveIncident(incidentId, {
        status,
        notes: `Resolved via security dashboard`,
        resolved_by: user?.id || 'unknown'
      });
    } catch (error) {
      console.error('Error resolving incident:', error);
    } finally {
      setResolving(null);
    }
  };

  const securityScore = getSecurityScore();
  const securityStatus = getSecurityStatus();
  const criticalIssues = getCriticalIssues();
  const recommendations = getRecommendations();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'text-green-600';
      case 'good': return 'text-blue-600';
      case 'warning': return 'text-yellow-600';
      case 'critical': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'excellent': return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'good': return <Shield className="h-5 w-5 text-blue-600" />;
      case 'warning': return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case 'critical': return <XCircle className="h-5 w-5 text-red-600" />;
      default: return <Shield className="h-5 w-5 text-gray-600" />;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing': return <TrendingUp className="h-4 w-4 text-red-500" />;
      case 'decreasing': return <TrendingDown className="h-4 w-4 text-green-500" />;
      default: return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Security Dashboard</h1>
          <Button variant="outline" size="sm" disabled>
            <RefreshCw className="h-4 w-4 mr-2" />
            Loading...
          </Button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Security Dashboard</h1>
          <Button variant="outline" size="sm" onClick={refreshData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </div>
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Failed to load security data: {error}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Security Dashboard</h1>
        <Button variant="outline" size="sm" onClick={refreshData}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Security Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Security Score</p>
                <div className="flex items-center space-x-2">
                  <span className="text-2xl font-bold">{securityScore}%</span>
                  {getStatusIcon(securityStatus)}
                </div>
              </div>
              <Shield className="h-8 w-8 text-muted-foreground" />
            </div>
            <Progress value={securityScore} className="mt-2" />
            <p className={`text-xs mt-1 capitalize ${getStatusColor(securityStatus)}`}>
              {securityStatus}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Incidents</p>
                <p className="text-2xl font-bold">{activeIncidents.length}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className="flex items-center space-x-1 mt-2">
              <span className="text-xs text-muted-foreground">Critical:</span>
              <Badge variant="destructive" className="text-xs">
                {activeIncidents.filter(i => i.severity === 'critical').length}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Resolved (7d)</p>
                <p className="text-2xl font-bold">{metrics.resolved_incidents}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className="flex items-center space-x-1 mt-2">
              <span className="text-xs text-muted-foreground">Avg Resolution:</span>
              <span className="text-xs">{Math.round(metrics.average_resolution_time)}h</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Incident Trend</p>
                <div className="flex items-center space-x-2">
                  <span className="text-2xl font-bold capitalize">{metrics.incident_trend}</span>
                  {getTrendIcon(metrics.incident_trend)}
                </div>
              </div>
              <Activity className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Based on 7-day trend
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Critical Issues Alert */}
      {criticalIssues.length > 0 && (
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Critical security issues detected:</strong> {criticalIssues.length} issues require immediate attention.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Active Incidents */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5" />
              <span>Active Incidents</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {activeIncidents.length === 0 ? (
                <p className="text-sm text-muted-foreground">No active incidents</p>
              ) : (
                activeIncidents.slice(0, 5).map((incident) => (
                  <div key={incident.id} className="flex items-center justify-between p-3 border rounded">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <Badge variant={incident.severity === 'critical' ? 'destructive' : 'outline'}>
                          {incident.severity}
                        </Badge>
                        <span className="text-sm font-medium">{incident.type.replace('_', ' ')}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDistanceToNow(new Date(incident.timestamp), { addSuffix: true })}
                      </p>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleResolveIncident(incident.id, 'resolved')}
                        disabled={resolving === incident.id}
                      >
                        {resolving === incident.id ? 'Resolving...' : 'Resolve'}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleResolveIncident(incident.id, 'false_positive')}
                        disabled={resolving === incident.id}
                      >
                        False Positive
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Security Validation Results */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Eye className="h-5 w-5" />
              <span>Security Validation</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {validationResults.length === 0 ? (
                <p className="text-sm text-muted-foreground">No validation results available</p>
              ) : (
                validationResults.slice(0, 5).map((result, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <Badge variant={result.status === 'pass' ? 'default' : result.status === 'warning' ? 'secondary' : 'destructive'}>
                          {result.status}
                        </Badge>
                        <span className="text-sm font-medium">{result.test}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {result.category}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>Security Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {recommendations.map((recommendation, index) => (
              <div key={index} className="flex items-start space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-sm">{recommendation}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}