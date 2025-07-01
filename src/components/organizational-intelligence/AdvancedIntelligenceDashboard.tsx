
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Brain, 
  Zap, 
  TrendingUp, 
  Target,
  BarChart3,
  Settings
} from 'lucide-react';
import PredictiveInsightsPanel from './PredictiveInsightsPanel';
import IntelligentAutomationPanel from './IntelligentAutomationPanel';

interface AdvancedIntelligenceDashboardProps {
  orgId: string;
  profileId?: string;
}

const AdvancedIntelligenceDashboard: React.FC<AdvancedIntelligenceDashboardProps> = ({ 
  orgId, 
  profileId = orgId 
}) => {
  const [activeTab, setActiveTab] = useState('insights');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Brain className="h-8 w-8 text-purple-500" />
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Advanced Intelligence Dashboard</h2>
            <p className="text-muted-foreground">
              AI-powered predictive insights and intelligent automation for your organization
            </p>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="insights" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Predictive Insights
          </TabsTrigger>
          <TabsTrigger value="automation" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Automation
          </TabsTrigger>
          <TabsTrigger value="recommendations" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Recommendations
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="insights" className="space-y-4">
          <PredictiveInsightsPanel orgId={orgId} profileId={profileId} />
        </TabsContent>

        <TabsContent value="automation" className="space-y-4">
          <IntelligentAutomationPanel orgId={orgId} />
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-green-500" />
                Strategic Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Enhanced Recommendations Coming Soon</h3>
                <p className="text-muted-foreground">
                  Advanced recommendation engine with strategic insights and action plans
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-blue-500" />
                Intelligence Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-purple-600">94%</div>
                    <div className="text-sm text-muted-foreground">Prediction Accuracy</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-green-600">87%</div>
                    <div className="text-sm text-muted-foreground">Automation Success</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-blue-600">156</div>
                    <div className="text-sm text-muted-foreground">Insights Generated</div>
                  </CardContent>
                </Card>
              </div>
              
              <div className="mt-6">
                <h4 className="font-medium mb-4">Recent Intelligence Activities</h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                    <Brain className="h-5 w-5 text-purple-500" />
                    <div>
                      <div className="font-medium">Risk Trend Analysis Completed</div>
                      <div className="text-sm text-muted-foreground">Identified potential compliance gaps for Q2</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                    <Zap className="h-5 w-5 text-green-500" />
                    <div>
                      <div className="font-medium">Automation Rule Implemented</div>
                      <div className="text-sm text-muted-foreground">KRI breach monitoring now automated</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                    <Target className="h-5 w-5 text-blue-500" />
                    <div>
                      <div className="font-medium">Strategic Recommendation Generated</div>
                      <div className="text-sm text-muted-foreground">Opportunity to improve efficiency by 18%</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdvancedIntelligenceDashboard;
