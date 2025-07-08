import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
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
  Download
} from "lucide-react";
import { toast } from "sonner";

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
}

const GeneratedFrameworksDisplay: React.FC = () => {
  const { profile } = useAuth();
  const [frameworks, setFrameworks] = useState<GeneratedFramework[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFramework, setSelectedFramework] = useState<GeneratedFramework | null>(null);

  useEffect(() => {
    if (profile?.organization_id) {
      loadGeneratedFrameworks();
    }
  }, [profile?.organization_id]);

  const loadGeneratedFrameworks = async () => {
    try {
      const { data: frameworkData, error } = await supabase
        .from('generated_frameworks')
        .select('*')
        .eq('organization_id', profile?.organization_id)
        .order('created_at', { ascending: false });

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
          <Button 
            variant="outline"
            onClick={() => window.location.reload()}
          >
            Refresh Page
          </Button>
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
        <Badge variant="outline" className="flex items-center gap-2">
          <Brain className="h-4 w-4" />
          {frameworks.length} Frameworks Generated
        </Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {frameworks.map((framework) => (
          <Card key={framework.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getFrameworkIcon(framework.framework_type)}
                  <span className="text-sm font-medium">
                    {formatFrameworkType(framework.framework_type)}
                  </span>
                </div>
                <Badge variant="outline" className={getStatusColor(framework.implementation_status)}>
                  {framework.implementation_status}
                </Badge>
              </div>
              <CardTitle className="text-lg">{framework.framework_name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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

              <div className="text-xs text-muted-foreground">
                Generated: {new Date(framework.created_at).toLocaleDateString()}
              </div>

              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => setSelectedFramework(framework)}
                >
                  <Eye className="h-4 w-4 mr-1" />
                  View
                </Button>
                {framework.implementation_status === 'generated' && (
                  <Button 
                    size="sm" 
                    className="flex-1"
                    onClick={() => updateFrameworkStatus(framework.id, 'in_progress')}
                  >
                    Start Implementation
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
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
                      
                      <div className="flex gap-2">
                        <Button 
                          onClick={() => updateFrameworkStatus(selectedFramework.id, 'in_progress')}
                          disabled={selectedFramework.implementation_status !== 'generated'}
                        >
                          Start Implementation
                        </Button>
                        <Button 
                          variant="outline"
                          onClick={() => updateFrameworkStatus(selectedFramework.id, 'implemented')}
                          disabled={selectedFramework.implementation_status !== 'in_progress'}
                        >
                          Mark as Implemented
                        </Button>
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