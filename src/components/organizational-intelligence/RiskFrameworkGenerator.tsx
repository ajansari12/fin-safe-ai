
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Target, 
  Settings, 
  CheckCircle,
  AlertTriangle,
  FileText,
  Download,
  Brain,
  Zap,
  TrendingUp
} from 'lucide-react';
import IntelligentFrameworkGenerator from './IntelligentFrameworkGenerator';
import FrameworkLibrary from './FrameworkLibrary';
import FrameworkImplementationTracker from './FrameworkImplementationTracker';
import AdvancedIntelligenceDashboard from './AdvancedIntelligenceDashboard';

interface RiskFrameworkGeneratorProps {
  orgId: string;
  profileId?: string;
}

const RiskFrameworkGenerator: React.FC<RiskFrameworkGeneratorProps> = ({ orgId, profileId = orgId }) => {
  const [activeTab, setActiveTab] = useState('generator');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Brain className="h-8 w-8 text-blue-500" />
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Intelligent Framework Generator</h2>
            <p className="text-muted-foreground">
              AI-powered risk management framework generation and management
            </p>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="generator" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Generator
          </TabsTrigger>
          <TabsTrigger value="library" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Library
          </TabsTrigger>
          <TabsTrigger value="implementation" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Implementation
          </TabsTrigger>
          <TabsTrigger value="intelligence" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            Intelligence
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Analytics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="generator" className="space-y-4">
          <IntelligentFrameworkGenerator orgId={orgId} profileId={profileId} />
        </TabsContent>

        <TabsContent value="library" className="space-y-4">
          <FrameworkLibrary orgId={orgId} />
        </TabsContent>

        <TabsContent value="implementation" className="space-y-4">
          <FrameworkImplementationTracker orgId={orgId} />
        </TabsContent>

        <TabsContent value="intelligence" className="space-y-4">
          <AdvancedIntelligenceDashboard orgId={orgId} profileId={profileId} />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                Framework Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-blue-600">92%</div>
                    <div className="text-sm text-muted-foreground">Framework Effectiveness</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-green-600">85%</div>
                    <div className="text-sm text-muted-foreground">Implementation Success</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-purple-600">7.8/10</div>
                    <div className="text-sm text-muted-foreground">User Satisfaction</div>
                  </CardContent>
                </Card>
              </div>
              
              <div className="mt-6">
                <h4 className="font-medium mb-4">Recent Improvements</h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <div>
                      <div className="font-medium">Enhanced AI Algorithm</div>
                      <div className="text-sm text-muted-foreground">15% improvement in framework accuracy</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                    <Brain className="h-5 w-5 text-blue-500" />
                    <div>
                      <div className="font-medium">New Sector Templates</div>
                      <div className="text-sm text-muted-foreground">Added fintech and insurance specific frameworks</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                    <TrendingUp className="h-5 w-5 text-purple-500" />
                    <div>
                      <div className="font-medium">Predictive Intelligence Integration</div>
                      <div className="text-sm text-muted-foreground">AI-powered insights now available for framework optimization</div>
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

export default RiskFrameworkGenerator;
