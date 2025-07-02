
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { 
  BookOpen, 
  CheckCircle, 
  Clock, 
  AlertTriangle, 
  Users, 
  Target, 
  Lightbulb,
  FileText,
  TrendingUp,
  Wrench
} from 'lucide-react';
import { templateLibraryService, BestPracticeGuide } from '@/services/template-library-service';
import { useToast } from '@/hooks/use-toast';

interface ImplementationGuideSystemProps {
  orgId: string;
  templateId?: string;
}

const ImplementationGuideSystem: React.FC<ImplementationGuideSystemProps> = ({ orgId, templateId }) => {
  const [loading, setLoading] = useState(true);
  const [guides, setGuides] = useState<BestPracticeGuide[]>([]);
  const [selectedGuide, setSelectedGuide] = useState<BestPracticeGuide | null>(null);
  const [implementationProgress, setImplementationProgress] = useState<Record<string, number>>({});

  const { toast } = useToast();

  useEffect(() => {
    loadImplementationGuides();
  }, [templateId]);

  const loadImplementationGuides = async () => {
    try {
      setLoading(true);
      const data = await templateLibraryService.getBestPracticeGuides(templateId);
      setGuides(data);
      
      if (data.length > 0 && !selectedGuide) {
        setSelectedGuide(data[0]);
      }
    } catch (error) {
      console.error('Error loading implementation guides:', error);
      toast({
        title: "Error",
        description: "Failed to load implementation guides",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getGuideTypeIcon = (type: string) => {
    switch (type) {
      case 'implementation': return <Target className="h-4 w-4" />;
      case 'customization': return <Wrench className="h-4 w-4" />;
      case 'troubleshooting': return <AlertTriangle className="h-4 w-4" />;
      case 'optimization': return <TrendingUp className="h-4 w-4" />;
      default: return <BookOpen className="h-4 w-4" />;
    }
  };

  const updateProgress = (guideId: string, progress: number) => {
    setImplementationProgress(prev => ({
      ...prev,
      [guideId]: progress
    }));
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Implementation Guide System</h1>
          <p className="text-muted-foreground mt-2">
            Step-by-step guidance for successful template implementation
          </p>
        </div>
        <Button>
          <FileText className="h-4 w-4 mr-2" />
          Create Custom Guide
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Guides List */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Available Guides</h2>
          {guides.map((guide) => (
            <Card 
              key={guide.id} 
              className={`cursor-pointer transition-all ${
                selectedGuide?.id === guide.id ? 'ring-2 ring-blue-500' : 'hover:shadow-md'
              }`}
              onClick={() => setSelectedGuide(guide)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    {getGuideTypeIcon(guide.guide_type)}
                    {guide.guide_title}
                  </CardTitle>
                  <Badge className={getDifficultyColor(guide.difficulty_level)}>
                    {guide.difficulty_level}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {guide.estimated_completion_time}h estimated
                  </div>
                  
                  {guide.target_audience && guide.target_audience.length > 0 && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Users className="h-3 w-3" />
                      {guide.target_audience.slice(0, 2).join(', ')}
                      {guide.target_audience.length > 2 && ` +${guide.target_audience.length - 2}`}
                    </div>
                  )}
                  
                  {implementationProgress[guide.id] !== undefined && (
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span>Progress</span>
                        <span>{implementationProgress[guide.id]}%</span>
                      </div>
                      <Progress value={implementationProgress[guide.id]} className="h-1" />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Guide Content */}
        {selectedGuide && (
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {getGuideTypeIcon(selectedGuide.guide_type)}
                  {selectedGuide.guide_title}
                </CardTitle>
                <div className="flex gap-2">
                  <Badge className={getDifficultyColor(selectedGuide.difficulty_level)}>
                    {selectedGuide.difficulty_level}
                  </Badge>
                  <Badge variant="outline">
                    {selectedGuide.estimated_completion_time}h duration
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="overview" className="w-full">
                  <TabsList className="grid w-full grid-cols-5">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="steps">Steps</TabsTrigger>
                    <TabsTrigger value="challenges">Challenges</TabsTrigger>
                    <TabsTrigger value="tips">Tips</TabsTrigger>
                    <TabsTrigger value="success">Success</TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview" className="space-y-4">
                    {selectedGuide.prerequisites && selectedGuide.prerequisites.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2">Prerequisites</h4>
                        <ul className="list-disc list-inside text-sm space-y-1">
                          {selectedGuide.prerequisites.map((prereq, index) => (
                            <li key={index}>{prereq}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {selectedGuide.tools_required && selectedGuide.tools_required.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2">Required Tools</h4>
                        <div className="flex flex-wrap gap-2">
                          {selectedGuide.tools_required.map((tool, index) => (
                            <Badge key={index} variant="secondary">{tool}</Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {selectedGuide.target_audience && selectedGuide.target_audience.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-2">Target Audience</h4>
                        <div className="flex flex-wrap gap-2">
                          {selectedGuide.target_audience.map((audience, index) => (
                            <Badge key={index} variant="outline">{audience}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="steps" className="space-y-4">
                    {selectedGuide.step_by_step_instructions && (
                      <Accordion type="single" collapsible className="w-full">
                        {selectedGuide.step_by_step_instructions.map((step: any, index: number) => (
                          <AccordionItem key={index} value={`step-${index}`}>
                            <AccordionTrigger className="text-left">
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center">
                                  {index + 1}
                                </div>
                                {step.title || `Step ${index + 1}`}
                              </div>
                            </AccordionTrigger>
                            <AccordionContent>
                              <div className="pl-8 space-y-2">
                                <p className="text-sm">{step.description}</p>
                                {step.substeps && (
                                  <ul className="list-disc list-inside text-sm space-y-1 ml-4">
                                    {step.substeps.map((substep: string, subIndex: number) => (
                                      <li key={subIndex}>{substep}</li>
                                    ))}
                                  </ul>
                                )}
                                <div className="flex gap-2 mt-3">
                                  <Button size="sm" variant="outline">
                                    <CheckCircle className="h-3 w-3 mr-1" />
                                    Mark Complete
                                  </Button>
                                </div>
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                      </Accordion>
                    )}
                  </TabsContent>

                  <TabsContent value="challenges" className="space-y-4">
                    {selectedGuide.common_challenges && selectedGuide.common_challenges.length > 0 && (
                      <div className="space-y-4">
                        {selectedGuide.common_challenges.map((challenge: any, index: number) => (
                          <Card key={index}>
                            <CardContent className="pt-4">
                              <div className="flex items-start gap-3">
                                <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                                <div className="flex-1">
                                  <h4 className="font-medium text-sm">{challenge.title}</h4>
                                  <p className="text-sm text-muted-foreground mt-1">{challenge.description}</p>
                                  {challenge.mitigation && (
                                    <div className="mt-2 p-2 bg-blue-50 rounded text-sm">
                                      <strong>Mitigation:</strong> {challenge.mitigation}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="tips" className="space-y-4">
                    {selectedGuide.troubleshooting_tips && selectedGuide.troubleshooting_tips.length > 0 && (
                      <div className="space-y-4">
                        {selectedGuide.troubleshooting_tips.map((tip: any, index: number) => (
                          <Card key={index}>
                            <CardContent className="pt-4">
                              <div className="flex items-start gap-3">
                                <Lightbulb className="h-5 w-5 text-blue-600 mt-0.5" />
                                <div className="flex-1">
                                  <h4 className="font-medium text-sm">{tip.title}</h4>
                                  <p className="text-sm text-muted-foreground mt-1">{tip.description}</p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="success" className="space-y-4">
                    {selectedGuide.success_factors && selectedGuide.success_factors.length > 0 && (
                      <div className="space-y-4">
                        {selectedGuide.success_factors.map((factor: any, index: number) => (
                          <Card key={index}>
                            <CardContent className="pt-4">
                              <div className="flex items-start gap-3">
                                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                                <div className="flex-1">
                                  <h4 className="font-medium text-sm">{factor.title}</h4>
                                  <p className="text-sm text-muted-foreground mt-1">{factor.description}</p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}

                    {selectedGuide.case_studies && selectedGuide.case_studies.length > 0 && (
                      <div>
                        <h4 className="font-medium mb-3">Case Studies</h4>
                        <div className="space-y-3">
                          {selectedGuide.case_studies.map((study: any, index: number) => (
                            <Card key={index}>
                              <CardContent className="pt-4">
                                <h5 className="font-medium text-sm">{study.title}</h5>
                                <p className="text-sm text-muted-foreground mt-1">{study.summary}</p>
                                {study.outcome && (
                                  <div className="mt-2 p-2 bg-green-50 rounded text-sm">
                                    <strong>Outcome:</strong> {study.outcome}
                                  </div>
                                )}
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {guides.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No implementation guides available</h3>
            <p className="text-muted-foreground">
              Implementation guides will appear here once templates are selected
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ImplementationGuideSystem;
