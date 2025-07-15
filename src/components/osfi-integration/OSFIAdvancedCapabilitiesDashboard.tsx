import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import OSFIModelRiskManagement from './OSFIModelRiskManagement';
import OSFIAdvancedAnalytics from './OSFIAdvancedAnalytics';
import { 
  Calculator, 
  Brain, 
  TrendingUp, 
  Target,
  Zap,
  BarChart3,
  FileText,
  Settings
} from 'lucide-react';

interface OSFIAdvancedCapabilitiesDashboardProps {
  orgId: string;
}

const OSFIAdvancedCapabilitiesDashboard: React.FC<OSFIAdvancedCapabilitiesDashboardProps> = ({ orgId }) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">OSFI Advanced Capabilities</h2>
          <p className="text-muted-foreground">
            Model Risk Management, AI Analytics, and Predictive Insights
          </p>
        </div>
      </div>

      {/* Capability Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="hover-scale">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Calculator className="h-8 w-8 text-blue-600" />
              <div>
                <h3 className="font-semibold">Model Risk</h3>
                <p className="text-sm text-muted-foreground">Validation & Testing</p>
                <Badge variant="default" className="mt-1">Active</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover-scale">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Brain className="h-8 w-8 text-purple-600" />
              <div>
                <h3 className="font-semibold">AI Analytics</h3>
                <p className="text-sm text-muted-foreground">Intelligent Insights</p>
                <Badge variant="secondary" className="mt-1">Enhanced</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover-scale">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <Zap className="h-8 w-8 text-yellow-600" />
              <div>
                <h3 className="font-semibold">Predictive Alerts</h3>
                <p className="text-sm text-muted-foreground">Early Warning</p>
                <Badge variant="outline" className="mt-1">Real-time</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="hover-scale">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <BarChart3 className="h-8 w-8 text-green-600" />
              <div>
                <h3 className="font-semibold">Stress Testing</h3>
                <p className="text-sm text-muted-foreground">Scenario Analysis</p>
                <Badge variant="default" className="mt-1">Automated</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="model-risk" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="model-risk" className="flex items-center space-x-2">
            <Calculator className="h-4 w-4" />
            <span>Model Risk Management</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center space-x-2">
            <Brain className="h-4 w-4" />
            <span>AI Analytics & Insights</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="model-risk">
          <OSFIModelRiskManagement orgId={orgId} />
        </TabsContent>

        <TabsContent value="analytics">
          <OSFIAdvancedAnalytics />
        </TabsContent>
      </Tabs>

      {/* OSFI E-21 Advanced Requirements Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            OSFI E-21 Advanced Requirements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-semibold flex items-center">
                <Calculator className="h-4 w-4 mr-2 text-blue-600" />
                Model Risk Management (Principle 2)
              </h4>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li className="flex items-start">
                  <Target className="h-3 w-3 mt-1 mr-2 text-blue-600" />
                  Model validation and performance monitoring
                </li>
                <li className="flex items-start">
                  <Target className="h-3 w-3 mt-1 mr-2 text-blue-600" />
                  Backtesting and stress testing of models
                </li>
                <li className="flex items-start">
                  <Target className="h-3 w-3 mt-1 mr-2 text-blue-600" />
                  Model risk appetite and tolerance limits
                </li>
                <li className="flex items-start">
                  <Target className="h-3 w-3 mt-1 mr-2 text-blue-600" />
                  Regular model recalibration processes
                </li>
              </ul>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold flex items-center">
                <Brain className="h-4 w-4 mr-2 text-purple-600" />
                Advanced Analytics & Automation
              </h4>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li className="flex items-start">
                  <Zap className="h-3 w-3 mt-1 mr-2 text-purple-600" />
                  Predictive risk analytics and early warning systems
                </li>
                <li className="flex items-start">
                  <Zap className="h-3 w-3 mt-1 mr-2 text-purple-600" />
                  AI-powered compliance monitoring and reporting
                </li>
                <li className="flex items-start">
                  <Zap className="h-3 w-3 mt-1 mr-2 text-purple-600" />
                  Automated scenario analysis and stress testing
                </li>
                <li className="flex items-start">
                  <Zap className="h-3 w-3 mt-1 mr-2 text-purple-600" />
                  Real-time risk aggregation and reporting
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Implementation Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Settings className="h-5 w-5 mr-2" />
            Implementation Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center space-x-3">
                <Calculator className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="font-medium">Model Risk Management Framework</p>
                  <p className="text-sm text-muted-foreground">Core validation and monitoring capabilities</p>
                </div>
              </div>
              <Badge variant="default">Implemented</Badge>
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center space-x-3">
                <Brain className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="font-medium">AI-Powered Analytics</p>
                  <p className="text-sm text-muted-foreground">Predictive insights and automated recommendations</p>
                </div>
              </div>
              <Badge variant="default">Implemented</Badge>
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center space-x-3">
                <BarChart3 className="h-5 w-5 text-green-600" />
                <div>
                  <p className="font-medium">Stress Testing Automation</p>
                  <p className="text-sm text-muted-foreground">Scenario-based risk assessment capabilities</p>
                </div>
              </div>
              <Badge variant="default">Implemented</Badge>
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center space-x-3">
                <TrendingUp className="h-5 w-5 text-orange-600" />
                <div>
                  <p className="font-medium">Regulatory Reporting Automation</p>
                  <p className="text-sm text-muted-foreground">Automated OSFI submission preparation</p>
                </div>
              </div>
              <Badge variant="secondary">Enhanced</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OSFIAdvancedCapabilitiesDashboard;