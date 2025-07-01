
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Target, 
  TrendingUp, 
  AlertCircle, 
  CheckCircle,
  Clock,
  Zap
} from 'lucide-react';

interface PredictiveModel {
  id: string;
  name: string;
  type: string;
  accuracy: number;
  prediction: string;
  confidence: number;
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  last_updated: string;
  next_update: string;
}

const PredictiveAnalyticsPanel: React.FC = () => {
  const [models, setModels] = useState<PredictiveModel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPredictiveModels();
  }, []);

  const loadPredictiveModels = async () => {
    try {
      // Simulate loading predictive models
      const mockModels: PredictiveModel[] = [
        {
          id: '1',
          name: 'Vendor Risk Prediction',
          type: 'Risk Forecasting',
          accuracy: 0.89,
          prediction: 'High probability of vendor risk increase in financial sector',
          confidence: 0.84,
          risk_level: 'high',
          last_updated: '2024-01-15T10:30:00Z',
          next_update: '2024-01-16T10:30:00Z'
        },
        {
          id: '2',
          name: 'Operational Risk Model',
          type: 'Operational Analytics',
          accuracy: 0.92,
          prediction: 'System performance degradation likely in next 48 hours',
          confidence: 0.78,
          risk_level: 'medium',
          last_updated: '2024-01-15T08:15:00Z',
          next_update: '2024-01-15T20:15:00Z'
        },
        {
          id: '3',
          name: 'Compliance Breach Predictor',
          type: 'Regulatory Analytics',
          accuracy: 0.86,
          prediction: 'Low risk of compliance violations detected',
          confidence: 0.91,
          risk_level: 'low',
          last_updated: '2024-01-15T12:00:00Z',
          next_update: '2024-01-16T00:00:00Z'
        }
      ];

      setModels(mockModels);
    } catch (error) {
      console.error('Error loading predictive models:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRiskIcon = (level: string) => {
    switch (level) {
      case 'critical':
      case 'high':
        return <AlertCircle className="h-4 w-4" />;
      case 'medium':
        return <Clock className="h-4 w-4" />;
      case 'low':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Target className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Predictive Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Predictive Analytics</h3>
          <p className="text-sm text-muted-foreground">
            AI-powered risk predictions and forecasting models
          </p>
        </div>
        <Button className="flex items-center gap-2">
          <Zap className="h-4 w-4" />
          Run All Models
        </Button>
      </div>

      {/* Model Performance Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {(models.reduce((acc, model) => acc + model.accuracy, 0) / models.length * 100).toFixed(1)}%
              </div>
              <div className="text-sm text-muted-foreground">Average Accuracy</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{models.length}</div>
              <div className="text-sm text-muted-foreground">Active Models</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {models.filter(m => m.risk_level === 'high' || m.risk_level === 'critical').length}
              </div>
              <div className="text-sm text-muted-foreground">High Risk Predictions</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Individual Model Cards */}
      <div className="space-y-4">
        {models.map((model) => (
          <Card key={model.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-blue-500" />
                  <CardTitle className="text-base">{model.name}</CardTitle>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{model.type}</Badge>
                  <Badge variant="outline" className={getRiskColor(model.risk_level)}>
                    {getRiskIcon(model.risk_level)}
                    {model.risk_level}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm">{model.prediction}</p>
              
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Model Accuracy</span>
                    <span className="text-sm text-muted-foreground">
                      {(model.accuracy * 100).toFixed(1)}%
                    </span>
                  </div>
                  <Progress value={model.accuracy * 100} className="h-2" />
                </div>
                
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Prediction Confidence</span>
                    <span className="text-sm text-muted-foreground">
                      {(model.confidence * 100).toFixed(1)}%
                    </span>
                  </div>
                  <Progress value={model.confidence * 100} className="h-2" />
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Last updated: {new Date(model.last_updated).toLocaleString()}</span>
                <span>Next update: {new Date(model.next_update).toLocaleString()}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default PredictiveAnalyticsPanel;
