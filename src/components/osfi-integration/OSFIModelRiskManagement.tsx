import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Calculator, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle,
  Clock,
  FileText,
  BarChart3,
  Settings,
  RefreshCw,
  Download
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

interface ModelRiskData {
  id: string;
  model_name: string;
  model_type: string;
  risk_rating: 'low' | 'medium' | 'high' | 'critical';
  validation_status: 'current' | 'due' | 'overdue';
  last_validation: string;
  next_validation: string;
  performance_score: number;
  regulatory_approval: boolean;
  osfi_principle: string;
}

interface StressTestScenario {
  id: string;
  scenario_name: string;
  scenario_type: string;
  severity: string;
  impact_assessment: number;
  last_run: string;
  status: 'passed' | 'failed' | 'warning';
  regulatory_requirement: string;
}

const OSFIModelRiskManagement: React.FC = () => {
  const { data: modelRiskData, refetch } = useQuery({
    queryKey: ['osfi-model-risk'],
    queryFn: async () => {
      const mockData: ModelRiskData[] = [
        {
          id: '1',
          model_name: 'Credit Risk Model',
          model_type: 'Risk Assessment',
          risk_rating: 'medium',
          validation_status: 'current',
          last_validation: '2024-01-10',
          next_validation: '2024-07-10',
          performance_score: 92,
          regulatory_approval: true,
          osfi_principle: 'Principle 2'
        },
        {
          id: '2',
          model_name: 'Operational Loss Model',
          model_type: 'Loss Forecasting',
          risk_rating: 'high',
          validation_status: 'due',
          last_validation: '2023-12-15',
          next_validation: '2024-01-20',
          performance_score: 85,
          regulatory_approval: true,
          osfi_principle: 'Principle 2'
        },
        {
          id: '3',
          model_name: 'Stress Testing Model',
          model_type: 'Scenario Analysis',
          risk_rating: 'critical',
          validation_status: 'overdue',
          last_validation: '2023-11-01',
          next_validation: '2024-01-15',
          performance_score: 78,
          regulatory_approval: false,
          osfi_principle: 'Principle 3'
        }
      ];
      return mockData;
    }
  });

  const { data: stressTestData } = useQuery({
    queryKey: ['osfi-stress-tests'],
    queryFn: async () => {
      const mockData: StressTestScenario[] = [
        {
          id: '1',
          scenario_name: 'Economic Downturn',
          scenario_type: 'Macroeconomic',
          severity: 'Severe',
          impact_assessment: 15.2,
          last_run: '2024-01-10',
          status: 'warning',
          regulatory_requirement: 'OSFI E-21 Principle 3'
        },
        {
          id: '2',
          scenario_name: 'Cyber Attack',
          scenario_type: 'Operational',
          severity: 'Extreme',
          impact_assessment: 8.7,
          last_run: '2024-01-12',
          status: 'passed',
          regulatory_requirement: 'OSFI E-21 Principle 6'
        },
        {
          id: '3',
          scenario_name: 'Third Party Failure',
          scenario_type: 'Vendor Risk',
          severity: 'Moderate',
          impact_assessment: 12.1,
          last_run: '2024-01-08',
          status: 'failed',
          regulatory_requirement: 'OSFI E-21 Principle 7'
        }
      ];
      return mockData;
    }
  });

  // Mock performance data for charts
  const performanceData = [
    { month: 'Jul', accuracy: 94, backtesting: 92 },
    { month: 'Aug', accuracy: 93, backtesting: 91 },
    { month: 'Sep', accuracy: 95, backtesting: 94 },
    { month: 'Oct', accuracy: 92, backtesting: 89 },
    { month: 'Nov', accuracy: 91, backtesting: 88 },
    { month: 'Dec', accuracy: 93, backtesting: 90 },
    { month: 'Jan', accuracy: 94, backtesting: 92 }
  ];

  const stressTestResults = [
    { scenario: 'Base', impact: 2.1 },
    { scenario: 'Mild Stress', impact: 5.8 },
    { scenario: 'Moderate Stress', impact: 9.2 },
    { scenario: 'Severe Stress', impact: 15.2 },
    { scenario: 'Extreme Stress', impact: 22.7 }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'current':
      case 'passed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'due':
      case 'warning':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'overdue':
      case 'failed':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default:
        return <CheckCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getRiskRatingVariant = (rating: string) => {
    switch (rating) {
      case 'low':
        return 'default';
      case 'medium':
        return 'secondary';
      case 'high':
        return 'destructive';
      case 'critical':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  const criticalModels = modelRiskData?.filter(model => 
    model.validation_status === 'overdue' || model.risk_rating === 'critical'
  ) || [];

  const failedStressTests = stressTestData?.filter(test => test.status === 'failed') || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">OSFI Model Risk Management</h2>
          <p className="text-muted-foreground">
            Principle 2 - Model Validation and Risk Assessment
          </p>
        </div>
        <div className="flex space-x-2">
          <Button onClick={() => refetch()} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Configure
          </Button>
          <Button size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Calculator className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Total Models</p>
                <p className="text-2xl font-bold">{modelRiskData?.length || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Validated</p>
                <p className="text-2xl font-bold">
                  {modelRiskData?.filter(m => m.validation_status === 'current').length || 0}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              <div>
                <p className="text-sm text-muted-foreground">Critical Issues</p>
                <p className="text-2xl font-bold">{criticalModels.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm text-muted-foreground">Avg Performance</p>
                <p className="text-2xl font-bold">
                  {modelRiskData ? Math.round(modelRiskData.reduce((sum, m) => sum + m.performance_score, 0) / modelRiskData.length) : 0}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Model Performance Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis domain={[80, 100]} />
                <Tooltip />
                <Line type="monotone" dataKey="accuracy" stroke="#3b82f6" name="Accuracy %" />
                <Line type="monotone" dataKey="backtesting" stroke="#10b981" name="Backtesting %" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Stress Test Impact Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <AreaChart data={stressTestResults}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="scenario" />
                <YAxis />
                <Tooltip formatter={(value) => [`${value}%`, 'Loss Impact']} />
                <Area type="monotone" dataKey="impact" stroke="#ef4444" fill="#ef4444" fillOpacity={0.3} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Model Risk Details */}
      <Card>
        <CardHeader>
          <CardTitle>Model Risk Inventory</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {modelRiskData?.map((model) => (
              <div key={model.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      {getStatusIcon(model.validation_status)}
                      <h3 className="font-semibold">{model.model_name}</h3>
                      <Badge variant="outline">{model.osfi_principle}</Badge>
                      <Badge variant={getRiskRatingVariant(model.risk_rating)}>
                        {model.risk_rating} risk
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-3">
                      <div>
                        <p className="text-sm text-muted-foreground">Type</p>
                        <p className="font-medium">{model.model_type}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Performance</p>
                        <p className="font-medium">{model.performance_score}%</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Last Validation</p>
                        <p className="font-medium">{model.last_validation}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Next Due</p>
                        <p className="font-medium">{model.next_validation}</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Performance Score</span>
                        <span className="text-sm font-medium">{model.performance_score}%</span>
                      </div>
                      <Progress value={model.performance_score} className="h-2" />
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                          OSFI Approval: {model.regulatory_approval ? 'Yes' : 'No'}
                        </span>
                        <Badge variant={model.validation_status === 'current' ? 'default' : 'destructive'}>
                          {model.validation_status}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="flex space-x-2 ml-4">
                    <Button variant="outline" size="sm">
                      <FileText className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm">
                      <BarChart3 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Stress Test Results */}
      <Card>
        <CardHeader>
          <CardTitle>Stress Testing Results</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {stressTestData?.map((test) => (
              <div key={test.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      {getStatusIcon(test.status)}
                      <h3 className="font-semibold">{test.scenario_name}</h3>
                      <Badge variant="outline">{test.scenario_type}</Badge>
                      <Badge variant={test.severity === 'Extreme' ? 'destructive' : test.severity === 'Severe' ? 'secondary' : 'default'}>
                        {test.severity}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Impact Assessment</p>
                        <p className="font-medium">{test.impact_assessment}% loss</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Last Run</p>
                        <p className="font-medium">{test.last_run}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Regulatory Requirement</p>
                        <p className="font-medium">{test.regulatory_requirement}</p>
                      </div>
                    </div>
                  </div>

                  <Badge variant={test.status === 'passed' ? 'default' : test.status === 'warning' ? 'secondary' : 'destructive'}>
                    {test.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Action Items */}
      {(criticalModels.length > 0 || failedStressTests.length > 0) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2" />
              Urgent Actions Required
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {criticalModels.map((model) => (
                <div key={model.id} className="flex items-center justify-between p-3 border border-red-200 rounded-lg bg-red-50">
                  <div>
                    <p className="font-medium text-red-900">{model.model_name}</p>
                    <p className="text-sm text-red-700">
                      {model.validation_status === 'overdue' ? 'Validation overdue' : 'Critical risk rating'}
                    </p>
                  </div>
                  <Badge variant="destructive">Critical</Badge>
                </div>
              ))}
              {failedStressTests.map((test) => (
                <div key={test.id} className="flex items-center justify-between p-3 border border-orange-200 rounded-lg bg-orange-50">
                  <div>
                    <p className="font-medium text-orange-900">{test.scenario_name}</p>
                    <p className="text-sm text-orange-700">Stress test failed - review required</p>
                  </div>
                  <Badge variant="destructive">Failed</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default OSFIModelRiskManagement;