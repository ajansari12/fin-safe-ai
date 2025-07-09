import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { intelligentFrameworkGenerationService } from "@/services/intelligent-framework-generation-service";
import { 
  Brain, 
  CheckCircle, 
  Clock, 
  Users, 
  Target, 
  Shield, 
  FileText,
  Settings,
  Eye,
  Download,
  RefreshCw,
  Plus,
  Trash2,
  Archive,
  Activity,
  Calendar,
  TrendingUp,
  AlertTriangle
} from "lucide-react";
import { toast } from "sonner";
import { testFrameworkGeneration } from "@/utils/test-framework-generation";
import FrameworkProgressTracker from "./FrameworkProgressTracker";
import FrameworkProgressTester from "./FrameworkProgressTester";
import { formatDistanceToNow } from "date-fns";

interface GeneratedFramework {
  id: string;
  framework_type: string;
  framework_name: string;
  implementation_status: string;
  effectiveness_score?: number;
  framework_data: any;
  generation_metadata: any;
  created_at: string;
  components?: any[];
  overall_completion_percentage?: number;
  last_activity_at?: string;
  is_stagnant?: boolean;
  stagnant_since?: string | null;
  framework_components?: any[];
  framework_assignments?: any[];
  framework_activities?: any[];
}

interface GenerationStatus {
  id: string;
  status: 'in_progress' | 'completed' | 'failed';
  current_step: string;
  progress: number;
  error_details?: string;
}

const GeneratedFrameworksDisplay: React.FC = () => {
  const { profile } = useAuth();
  const [frameworks, setFrameworks] = useState<GeneratedFramework[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFramework, setSelectedFramework] = useState<GeneratedFramework | null>(null);
  const [selectedProgressFramework, setSelectedProgressFramework] = useState<string | null>(null);
  const [generationStatus, setGenerationStatus] = useState<GenerationStatus | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (profile?.organization_id) {
      loadGeneratedFrameworks();
      loadGenerationStatus();
    }
  }, [profile?.organization_id]);

  const loadGeneratedFrameworks = async () => {
    try {
      const { data: frameworkData, error } = await supabase
        .from('generated_frameworks')
        .select(`
          *,
          framework_assignments(assigned_to_name, role),
          framework_activities(activity_type, created_at)
        `)
        .eq('organization_id', profile?.organization_id)
        .order('last_activity_at', { ascending: false });

      if (error) throw error;

      // Load components separately if needed
      const frameworksWithComponents = frameworkData ? await Promise.all(
        frameworkData.map(async (framework) => {
          const { data: components } = await supabase
            .from('framework_components')
            .select('*')
            .eq('framework_id', framework.id);
          
          return {
            ...framework,
            components: components || []
          };
        })
      ) : [];

      setFrameworks(frameworksWithComponents);
    } catch (error) {
      console.error('Error loading frameworks:', error);
      toast.error('Failed to load generated frameworks');
    } finally {
      setLoading(false);
    }
  };

  const loadGenerationStatus = async () => {
    try {
      const { data, error } = await supabase
        .from('framework_generation_status')
        .select('*')
        .eq('organization_id', profile?.organization_id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;
      
      setGenerationStatus(data);
    } catch (error) {
      console.error('Error loading generation status:', error);
    }
  };

  const getFrameworkIcon = (type: string) => {
    switch (type) {
      case 'governance': return <Shield className="h-5 w-5" />;
      case 'risk_appetite': return <Target className="h-5 w-5" />;
      case 'impact_tolerance': return <Clock className="h-5 w-5" />;
      case 'control': return <FileText className="h-5 w-5" />;
      case 'compliance': return <CheckCircle className="h-5 w-5" />;
      case 'scenario_testing': return <Brain className="h-5 w-5" />;
      default: return <Settings className="h-5 w-5" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'generated': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'implemented': return 'bg-green-100 text-green-800 border-green-200';
      case 'archived': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 50) return 'text-yellow-600';
    if (percentage >= 25) return 'text-orange-600';
    return 'text-red-600';
  };

  const formatFrameworkType = (type: string) => {
    return type.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const updateFrameworkStatus = async (frameworkId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('generated_frameworks')
        .update({ implementation_status: status })
        .eq('id', frameworkId);

      if (error) throw error;

      setFrameworks(prev => prev.map(fw => 
        fw.id === frameworkId ? { ...fw, implementation_status: status } : fw
      ));

      toast.success(`Framework status updated to ${status}`);
    } catch (error) {
      console.error('Error updating framework status:', error);
      toast.error('Failed to update framework status');
    }
  };

  const generateAdditionalFrameworks = async () => {
    if (!profile?.organization_id) return;

    setIsGenerating(true);
    try {
      const { data: orgProfile } = await supabase
        .from('organizational_profiles')
        .select('id')
        .eq('organization_id', profile.organization_id)
        .single();

      if (!orgProfile) {
        toast.error('Organization profile not found');
        return;
      }

      toast.success('Additional framework generation started...');
      
      await intelligentFrameworkGenerationService.generateFrameworks({
        profileId: orgProfile.id,
        frameworkTypes: ['scenario_testing', 'impact_tolerance'],
        customizations: {}
      });

      toast.success('Additional frameworks generated successfully!');
      loadGeneratedFrameworks();
    } catch (error) {
      console.error('Error generating additional frameworks:', error);
      toast.error('Failed to generate additional frameworks');
    } finally {
      setIsGenerating(false);
    }
  };

  const regenerateFramework = async (frameworkId: string, frameworkType: string) => {
    if (!profile?.organization_id) return;

    try {
      const { data: orgProfile } = await supabase
        .from('organizational_profiles')
        .select('id')
        .eq('organization_id', profile.organization_id)
        .single();

      if (!orgProfile) {
        toast.error('Organization profile not found');
        return;
      }

      // Archive old framework
      await supabase
        .from('generated_frameworks')
        .update({ implementation_status: 'archived' })
        .eq('id', frameworkId);

      toast.success('Regenerating framework...');

      await intelligentFrameworkGenerationService.generateFrameworks({
        profileId: orgProfile.id,
        frameworkTypes: [frameworkType],
        customizations: {}
      });

      toast.success('Framework regenerated successfully!');
      loadGeneratedFrameworks();
    } catch (error) {
      console.error('Error regenerating framework:', error);
      toast.error('Failed to regenerate framework');
    }
  };

  const deleteFramework = async (frameworkId: string) => {
    try {
      await supabase
        .from('generated_frameworks')
        .delete()
        .eq('id', frameworkId);

      toast.success('Framework deleted successfully');
      loadGeneratedFrameworks();
    } catch (error) {
      console.error('Error deleting framework:', error);
      toast.error('Failed to delete framework');
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-2">Loading generated frameworks...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show generation progress if in progress
  if (generationStatus?.status === 'in_progress') {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center mb-4">
              <RefreshCw className="h-8 w-8 animate-spin text-primary mr-2" />
              <span className="text-lg font-medium">Generating AI Frameworks</span>
            </div>
            <Progress value={generationStatus.progress} className="w-full max-w-md mx-auto" />
            <p className="text-sm text-muted-foreground">{generationStatus.current_step}</p>
            <p className="text-xs text-muted-foreground">
              Progress: {generationStatus.progress}% Complete
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (frameworks.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Brain className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Generated Frameworks</h3>
          <p className="text-gray-500 mb-4">
            Frameworks are automatically generated during organization setup. If you don't see any frameworks, 
            they may still be generating or the generation process may have encountered an issue.
          </p>
          <div className="flex gap-2 justify-center">
            <Button 
              variant="outline"
              onClick={() => window.location.reload()}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Page
            </Button>
            <Button 
              onClick={generateAdditionalFrameworks}
              disabled={isGenerating}
            >
              <Plus className="h-4 w-4 mr-2" />
              Generate Frameworks
            </Button>
            <Button 
              variant="outline"
              onClick={testFrameworkGeneration}
              disabled={isGenerating}
            >
              <Brain className="h-4 w-4 mr-2" />
              Test Generation
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Generated Frameworks</h2>
          <p className="text-muted-foreground">
            AI-generated risk management frameworks tailored to your organization
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            {frameworks.length} Frameworks Generated
          </Badge>
          <Button 
            variant="outline" 
            size="sm"
            onClick={generateAdditionalFrameworks}
            disabled={isGenerating}
          >
            <Plus className="h-4 w-4 mr-2" />
            Generate More
          </Button>
        </div>
      </div>

      {selectedProgressFramework && (
        <FrameworkProgressTracker
          framework={frameworks.find(f => f.id === selectedProgressFramework)!}
          onProgressUpdate={loadGeneratedFrameworks}
        />
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {frameworks.map((framework) => {
          const progressPercentage = (framework as any).overall_completion_percentage || 0;
          const isStagnant = (framework as any).is_stagnant;
          const lastActivity = (framework as any).last_activity_at;
          const assignments = (framework as any).framework_assignments || [];
          const owner = assignments.find((a: any) => a.role === 'owner');

          return (
          <Card key={framework.id} className={`hover:shadow-md transition-shadow ${isStagnant ? 'border-orange-300 bg-orange-50' : ''}`}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getFrameworkIcon(framework.framework_type)}
                  <span className="text-sm font-medium">
                    {formatFrameworkType(framework.framework_type)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {isStagnant && (
                    <Badge variant="destructive" className="text-xs">
                      Stagnant
                    </Badge>
                  )}
                  <Badge variant="outline" className={getStatusColor(framework.implementation_status)}>
                    {framework.implementation_status}
                  </Badge>
                </div>
              </div>
              <CardTitle className="text-lg">{framework.framework_name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Progress Section */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <Activity className="h-4 w-4" />
                    Progress
                  </span>
                  <span className={`font-medium ${getProgressColor(progressPercentage)}`}>
                    {progressPercentage}%
                  </span>
                </div>
                <Progress value={progressPercentage} className="h-2" />
              </div>

              {/* Key Metrics */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Components:</span>
                  <div className="font-medium">{framework.components?.length || 0}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Effectiveness:</span>
                  <div className="font-medium">
                    {framework.effectiveness_score ? `${framework.effectiveness_score}%` : 'N/A'}
                  </div>
                </div>
              </div>

              {/* Assignment and Activity */}
              <div className="space-y-2 text-sm">
                {owner && (
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-blue-500" />
                    <span className="text-muted-foreground">Owner:</span>
                    <span className="font-medium">{owner.assigned_to_name}</span>
                  </div>
                )}
                
                {lastActivity && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-green-500" />
                    <span className="text-muted-foreground">Last activity:</span>
                    <span className="font-medium">
                      {formatDistanceToNow(new Date(lastActivity), { addSuffix: true })}
                    </span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  variant={selectedProgressFramework === framework.id ? "default" : "outline"}
                  className="flex-1"
                  onClick={() => setSelectedProgressFramework(
                    selectedProgressFramework === framework.id ? null : framework.id
                  )}
                >
                  <TrendingUp className="h-4 w-4 mr-1" />
                  {selectedProgressFramework === framework.id ? 'Hide' : 'Progress'}
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => setSelectedFramework(framework)}
                >
                  <Eye className="h-4 w-4" />
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => regenerateFramework(framework.id, framework.framework_type)}
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => deleteFramework(framework.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              {framework.implementation_status === 'generated' && (
                <Button 
                  size="sm" 
                  className="w-full mt-2"
                  onClick={() => updateFrameworkStatus(framework.id, 'in_progress')}
                >
                  Start Implementation
                </Button>
              )}
            </CardContent>
          </Card>
        );
        })}
      </div>

      {/* Framework Detail Modal/Dialog would go here */}
      {selectedFramework && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-4xl max-h-[90vh] overflow-auto m-4">
            <Card>
              <CardHeader className="border-b">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    {getFrameworkIcon(selectedFramework.framework_type)}
                    {selectedFramework.framework_name}
                  </CardTitle>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setSelectedFramework(null)}
                  >
                    ×
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <Tabs defaultValue="overview">
                  <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="components">Components</TabsTrigger>
                    <TabsTrigger value="implementation">Implementation</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="overview" className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Framework Description</h4>
                      <p className="text-sm text-muted-foreground">
                        {selectedFramework.framework_data?.description || 'No description available'}
                      </p>
                    </div>
                    
                    <div>
                      <h4 className="font-medium mb-2">Key Elements</h4>
                      <div className="grid gap-2">
                        {selectedFramework.framework_data?.elements?.map((element: string, index: number) => (
                          <div key={index} className="flex items-center gap-2 text-sm">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            {element}
                          </div>
                        ))}
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="components" className="space-y-4">
                    {selectedFramework.components?.map((component: any, index: number) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h5 className="font-medium">{component.component_name}</h5>
                          <Badge variant="outline">{component.component_type}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {component.component_description}
                        </p>
                        <div className="text-xs text-muted-foreground">
                          Priority: {component.implementation_priority} • 
                          Effort: {component.estimated_effort_hours}h
                        </div>
                      </div>
                    ))}
                  </TabsContent>
                  
                  <TabsContent value="implementation" className="space-y-4">
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-2">Current Status</h4>
                        <Badge className={getStatusColor(selectedFramework.implementation_status)}>
                          {selectedFramework.implementation_status}
                        </Badge>
                      </div>
                      
                      <div className="flex flex-col gap-3">
                        <div className="space-y-2">
                          <h5 className="text-sm font-medium">Implementation Actions</h5>
                          <div className="grid grid-cols-1 gap-2">
                            <Button 
                              onClick={() => updateFrameworkStatus(selectedFramework.id, 'in_progress')}
                              disabled={selectedFramework.implementation_status !== 'generated'}
                              className="w-full"
                            >
                              Start Implementation
                            </Button>
                            <Button 
                              variant="outline"
                              onClick={() => updateFrameworkStatus(selectedFramework.id, 'implemented')}
                              disabled={selectedFramework.implementation_status !== 'in_progress'}
                              className="w-full"
                            >
                              Mark as Implemented
                            </Button>
                          </div>
                        </div>
                        
                        {/* Progress Testing Tool */}
                        <div className="space-y-2">
                          <h5 className="text-sm font-medium">Progress Testing</h5>
                          <FrameworkProgressTester 
                            framework={selectedFramework}
                            onUpdate={loadGeneratedFrameworks}
                          />
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default GeneratedFrameworksDisplay;