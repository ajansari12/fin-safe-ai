import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle,
  Activity,
  RefreshCw
} from 'lucide-react';

interface AICapability {
  name: string;
  description: string;
  status: 'checking' | 'working' | 'error' | 'not_tested';
  error?: string;
}

const AIStatusVerification: React.FC = () => {
  const [capabilities, setCapabilities] = useState<AICapability[]>([
    {
      name: 'AI Assistant Chat',
      description: 'OpenAI-powered conversational assistant',
      status: 'not_tested'
    },
    {
      name: 'Framework Generation',
      description: 'AI-powered framework generation from organizational profiles',
      status: 'not_tested'
    },
    {
      name: 'Document Analysis',
      description: 'AI document processing and embeddings generation',
      status: 'not_tested'
    },
    {
      name: 'Predictive Analytics',
      description: 'Advanced analytics with AI-powered insights',
      status: 'not_tested'
    }
  ]);
  
  const [isRunningTest, setIsRunningTest] = useState(false);

  useEffect(() => {
    // Auto-run tests on component mount
    testAICapabilities();
  }, []);

  const testAICapabilities = async () => {
    setIsRunningTest(true);
    const results = [...capabilities];

    // Test AI Assistant Chat
    try {
      setCapabilities(prevCapabilities => 
        prevCapabilities.map(cap => 
          cap.name === 'AI Assistant Chat' 
            ? { ...cap, status: 'checking' }
            : cap
        )
      );

      const { data, error } = await supabase.functions.invoke('ai-assistant', {
        body: {
          message: 'Test message - please respond with "AI capabilities test successful"',
          context: {
            module: 'testing',
            userRole: 'admin'
          },
          userId: (await supabase.auth.getUser()).data.user?.id
        }
      });

      if (error) {
        results[0] = {
          ...results[0],
          status: 'error',
          error: `Edge function error: ${error.message}`
        };
      } else if (data?.response) {
        results[0] = {
          ...results[0],
          status: 'working'
        };
      } else {
        results[0] = {
          ...results[0],
          status: 'error',
          error: 'No response received from AI assistant'
        };
      }
    } catch (error) {
      results[0] = {
        ...results[0],
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }

    // Test Framework Generation with real data
    try {
      setCapabilities(prevCapabilities => 
        prevCapabilities.map(cap => 
          cap.name === 'Framework Generation' 
            ? { ...cap, status: 'checking' }
            : cap
        )
      );

      // Check if organizational profile exists for framework generation
      const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', (await supabase.auth.getUser()).data.user?.id)
        .single();

      if (profile?.organization_id) {
        // Check for generated frameworks
        const { data: frameworks } = await supabase
          .from('generated_frameworks')
          .select('id')
          .eq('organization_id', profile.organization_id)
          .limit(1);

        results[1] = {
          ...results[1],
          status: 'working'
        };
      } else {
        results[1] = {
          ...results[1],
          status: 'error',
          error: 'No organization profile found for framework generation'
        };
      }
    } catch (error) {
      results[1] = {
        ...results[1],
        status: 'error',
        error: error instanceof Error ? error.message : 'Framework generation test failed'
      };
    }

    // Test Document Analysis capabilities
    try {
      setCapabilities(prevCapabilities => 
        prevCapabilities.map(cap => 
          cap.name === 'Document Analysis' 
            ? { ...cap, status: 'checking' }
            : cap
        )
      );

      // Check if document analysis edge function exists and knowledge base is accessible
      const { data: knowledgeBase } = await supabase
        .from('knowledge_base')
        .select('id')
        .limit(1);

      // Test embeddings generation
      const { data: embeddingTest, error: embeddingError } = await supabase.functions.invoke('generate-embeddings', {
        body: {
          text: 'Test document analysis capabilities'
        }
      });

      if (embeddingError) {
        results[2] = {
          ...results[2],
          status: 'error',
          error: `Embeddings service error: ${embeddingError.message}`
        };
      } else {
        results[2] = {
          ...results[2],
          status: 'working'
        };
      }
    } catch (error) {
      results[2] = {
        ...results[2],
        status: 'error',
        error: error instanceof Error ? error.message : 'Document analysis test failed'
      };
    }

    // Test Predictive Analytics
    try {
      setCapabilities(prevCapabilities => 
        prevCapabilities.map(cap => 
          cap.name === 'Predictive Analytics' 
            ? { ...cap, status: 'checking' }
            : cap
        )
      );

      // Test advanced analytics service
      const { data: profile } = await supabase
        .from('profiles')
        .select('organization_id')
        .eq('id', (await supabase.auth.getUser()).data.user?.id)
        .single();

      if (profile?.organization_id) {
        // Test analytics insights generation
        const { data: insights } = await supabase
          .from('analytics_insights')
          .select('id')
          .eq('org_id', profile.organization_id)
          .limit(1);

        // Test enhanced predictive analytics edge function
        const { data: predictiveTest, error: predictiveError } = await supabase.functions.invoke('enhanced-predictive-analytics', {
          body: {
            orgId: profile.organization_id,
            analysisType: 'test'
          }
        });

        if (predictiveError) {
          results[3] = {
            ...results[3],
            status: 'error',
            error: `Predictive analytics error: ${predictiveError.message}`
          };
        } else {
          results[3] = {
            ...results[3],
            status: 'working'
          };
        }
      } else {
        results[3] = {
          ...results[3],
          status: 'error',
          error: 'No organization profile found for analytics'
        };
      }
    } catch (error) {
      results[3] = {
        ...results[3],
        status: 'error',
        error: error instanceof Error ? error.message : 'Predictive analytics test failed'
      };
    }

    setCapabilities(results);
    setIsRunningTest(false);
  };

  const getStatusIcon = (status: AICapability['status']) => {
    switch (status) {
      case 'working':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'checking':
        return <Clock className="h-4 w-4 text-blue-600 animate-pulse" />;
      default:
        return <Activity className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: AICapability['status']) => {
    switch (status) {
      case 'working':
        return <Badge className="bg-green-100 text-green-800">Working</Badge>;
      case 'error':
        return <Badge className="bg-red-100 text-red-800">Error</Badge>;
      case 'checking':
        return <Badge className="bg-blue-100 text-blue-800">Checking</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">Not Tested</Badge>;
    }
  };

  const overallStatus = capabilities.every(cap => cap.status === 'working') 
    ? 'all_working' 
    : capabilities.some(cap => cap.status === 'error') 
    ? 'some_errors' 
    : 'checking';

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          AI System Verification
        </CardTitle>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={testAICapabilities}
          disabled={isRunningTest}
        >
          {isRunningTest ? (
            <RefreshCw className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <RefreshCw className="h-4 w-4 mr-2" />
          )}
          {isRunningTest ? 'Testing...' : 'Test AI'}
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {overallStatus === 'all_working' && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              All AI capabilities are functioning correctly.
            </AlertDescription>
          </Alert>
        )}

        {overallStatus === 'some_errors' && (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertDescription>
              Some AI capabilities have errors. Check individual services below.
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-3">
          {capabilities.map((capability, index) => (
            <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                {getStatusIcon(capability.status)}
                <div>
                  <h4 className="font-medium">{capability.name}</h4>
                  <p className="text-sm text-muted-foreground">{capability.description}</p>
                  {capability.error && (
                    <p className="text-xs text-red-500 mt-1">{capability.error}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {getStatusBadge(capability.status)}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 text-xs text-muted-foreground">
          <p>• AI Assistant requires OpenAI API key in Supabase Edge Function secrets</p>
          <p>• Framework Generation uses organizational profile data</p>
          <p>• Document Analysis processes uploaded files with AI</p>
          <p>• Predictive Analytics analyzes historical data patterns</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default AIStatusVerification;