import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Brain, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  ArrowRight,
  TrendingUp,
  Shield,
  Users,
  FileText,
  Target
} from 'lucide-react';
// TODO: Migrated from AuthContext to EnhancedAuthContext
import { useAuth } from '@/contexts/EnhancedAuthContext';
import { useNavigate } from 'react-router-dom';
import { dataAvailabilityService, type DataAvailabilityStatus, type DataRequirement } from '@/services/data-availability-service';

const PredictiveEmptyState: React.FC = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [dataStatus, setDataStatus] = useState<DataAvailabilityStatus | null>(null);
  const [requirements, setRequirements] = useState<DataRequirement[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (profile?.organization_id) {
      loadDataStatus();
    }
  }, [profile?.organization_id]);

  const loadDataStatus = async () => {
    if (!profile?.organization_id) return;
    
    setIsLoading(true);
    try {
      const status = await dataAvailabilityService.checkDataAvailability(profile.organization_id);
      const reqs = dataAvailabilityService.generateDataRequirements(status);
      
      setDataStatus(status);
      setRequirements(reqs);
    } catch (error) {
      console.error('Error loading data status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'complete': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'partial': return <Clock className="h-4 w-4 text-yellow-500" />;
      default: return <AlertCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'complete': return 'bg-green-100 text-green-800 border-green-200';
      case 'partial': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default: return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  const getModuleIcon = (module: string) => {
    switch (module) {
      case 'incidents': return <AlertCircle className="h-5 w-5" />;
      case 'kris': return <TrendingUp className="h-5 w-5" />;
      case 'vendors': return <Users className="h-5 w-5" />;
      case 'controls': return <Shield className="h-5 w-5" />;
      default: return <FileText className="h-5 w-5" />;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-8">
            <div className="animate-pulse space-y-4">
              <div className="h-6 bg-muted rounded w-1/3"></div>
              <div className="h-4 bg-muted rounded w-2/3"></div>
              <div className="h-8 bg-muted rounded"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!dataStatus) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className="text-muted-foreground">Unable to assess data availability.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Data Readiness Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Brain className="h-6 w-6 text-primary" />
            <div>
              <CardTitle>Predictive Analytics Setup</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {dataStatus.readyForPredictive 
                  ? "Your data is ready for predictive analysis!" 
                  : "Collect operational data to enable AI-powered predictions"}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Data Completeness</span>
              <span className="text-sm text-muted-foreground">{dataStatus.totalDataScore}%</span>
            </div>
            <Progress value={dataStatus.totalDataScore} className="h-2" />
            
            {dataStatus.readyForPredictive ? (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  You have sufficient data for predictive analytics. Refresh the page to see your predictions.
                </AlertDescription>
              </Alert>
            ) : (
              <Alert>
                <Target className="h-4 w-4" />
                <AlertDescription>
                  Complete at least 2 data categories below to unlock predictive capabilities.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Data Requirements Checklist */}
      <Card>
        <CardHeader>
          <CardTitle>Data Collection Guide</CardTitle>
          <p className="text-sm text-muted-foreground">
            Complete these steps to enable predictive analytics for your organization
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {requirements.map((req) => (
              <div key={req.module} className="border rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="flex-shrink-0 mt-1">
                      {getModuleIcon(req.module)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium">{req.title}</h4>
                        {getStatusIcon(req.status)}
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${getStatusColor(req.status)}`}
                        >
                          {req.count}/{req.minimumRequired}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        {req.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="text-xs text-muted-foreground">
                          Current: {req.count} • Minimum needed: {req.minimumRequired}
                        </div>
                        <Button 
                          size="sm" 
                          variant={req.status === 'complete' ? 'outline' : 'default'}
                          onClick={() => navigate(req.actionUrl)}
                          className="flex items-center gap-1"
                        >
                          {req.actionText}
                          <ArrowRight className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* What You'll Get */}
      <Card>
        <CardHeader>
          <CardTitle>What You'll Unlock</CardTitle>
          <p className="text-sm text-muted-foreground">
            Once you have sufficient data, you'll get access to:
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-3">
            <div className="text-center p-4 border rounded-lg">
              <TrendingUp className="h-8 w-8 mx-auto mb-2 text-blue-500" />
              <h4 className="font-medium mb-1">Incident Forecasting</h4>
              <p className="text-xs text-muted-foreground">
                Predict future incidents based on historical patterns
              </p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <AlertCircle className="h-8 w-8 mx-auto mb-2 text-orange-500" />
              <h4 className="font-medium mb-1">Breach Predictions</h4>
              <p className="text-xs text-muted-foreground">
                Early warning for KRI threshold breaches
              </p>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <Brain className="h-8 w-8 mx-auto mb-2 text-purple-500" />
              <h4 className="font-medium mb-1">Real-time Alerts</h4>
              <p className="text-xs text-muted-foreground">
                Intelligent monitoring and anomaly detection
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PredictiveEmptyState;