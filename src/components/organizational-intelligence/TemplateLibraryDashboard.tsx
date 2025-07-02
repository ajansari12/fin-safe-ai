
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BookOpen, Search, Filter, Star, Download, Eye, Settings, TrendingUp } from 'lucide-react';
import { templateLibraryService, IndustryTemplate, TemplateCategory, BestPracticeGuide } from '@/services/template-library-service';
import { useToast } from '@/hooks/use-toast';

interface TemplateLibraryDashboardProps {
  orgId: string;
}

const TemplateLibraryDashboard: React.FC<TemplateLibraryDashboardProps> = ({ orgId }) => {
  const [templates, setTemplates] = useState<IndustryTemplate[]>([]);
  const [categories, setCategories] = useState<TemplateCategory[]>([]);
  const [guides, setGuides] = useState<BestPracticeGuide[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [templateType, setTemplateType] = useState<string>('all');
  const [complexityLevel, setComplexityLevel] = useState<string>('all');
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [templatesData, categoriesData, guidesData] = await Promise.all([
        templateLibraryService.getIndustryTemplates(),
        templateLibraryService.getTemplateCategories(),
        templateLibraryService.getBestPracticeGuides()
      ]);

      setTemplates(templatesData);
      setCategories(categoriesData);
      setGuides(guidesData);
    } catch (error) {
      console.error('Error loading template library data:', error);
      toast({
        title: "Error",
        description: "Failed to load template library data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.template_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.template_description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || template.industry_sector === selectedCategory;
    const matchesType = templateType === 'all' || template.template_type === templateType;
    const matchesComplexity = complexityLevel === 'all' || template.complexity_level === complexityLevel;

    return matchesSearch && matchesCategory && matchesType && matchesComplexity;
  });

  const handleTemplateView = async (template: IndustryTemplate) => {
    try {
      await templateLibraryService.trackTemplateUsage(template.id, orgId, undefined, 'view');
      // Here you would typically open a detailed view of the template
      toast({
        title: "Template Viewed",
        description: `Viewing ${template.template_name}`,
      });
    } catch (error) {
      console.error('Error tracking template usage:', error);
    }
  };

  const handleTemplateCustomize = async (template: IndustryTemplate) => {
    try {
      await templateLibraryService.trackTemplateUsage(template.id, orgId, undefined, 'customize');
      // Here you would open the customization interface
      toast({
        title: "Template Customization",
        description: `Customizing ${template.template_name}`,
      });
    } catch (error) {
      console.error('Error starting template customization:', error);
    }
  };

  const getComplexityColor = (level: string) => {
    switch (level) {
      case 'simple': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'complex': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'governance': return 'bg-blue-100 text-blue-800';
      case 'risk_management': return 'bg-red-100 text-red-800';
      case 'compliance': return 'bg-purple-100 text-purple-800';
      case 'operational': return 'bg-orange-100 text-orange-800';
      case 'cybersecurity': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
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
          <h1 className="text-3xl font-bold">Template & Best Practice Library</h1>
          <p className="text-muted-foreground mt-2">
            Industry-specific templates and implementation guides
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <BookOpen className="h-4 w-4 mr-2" />
            Knowledge Base
          </Button>
          <Button>
            <Settings className="h-4 w-4 mr-2" />
            Customize
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search templates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Industry Sector" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sectors</SelectItem>
                <SelectItem value="banking">Banking</SelectItem>
                <SelectItem value="insurance">Insurance</SelectItem>
                <SelectItem value="investment_management">Investment Management</SelectItem>
                <SelectItem value="fintech">FinTech</SelectItem>
              </SelectContent>
            </Select>
            <Select value={templateType} onValueChange={setTemplateType}>
              <SelectTrigger>
                <SelectValue placeholder="Template Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="governance">Governance</SelectItem>
                <SelectItem value="risk_management">Risk Management</SelectItem>
                <SelectItem value="compliance">Compliance</SelectItem>
                <SelectItem value="operational">Operational</SelectItem>
                <SelectItem value="cybersecurity">Cybersecurity</SelectItem>
              </SelectContent>
            </Select>
            <Select value={complexityLevel} onValueChange={setComplexityLevel}>
              <SelectTrigger>
                <SelectValue placeholder="Complexity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="simple">Simple</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="complex">Complex</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs defaultValue="templates" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="featured">Featured</TabsTrigger>
          <TabsTrigger value="guides">Best Practices</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTemplates.map((template) => (
              <Card key={template.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg">{template.template_name}</CardTitle>
                      {template.is_featured && (
                        <Star className="h-4 w-4 text-yellow-500 inline ml-2" />
                      )}
                    </div>
                    <Badge className={getComplexityColor(template.complexity_level)}>
                      {template.complexity_level}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {template.template_description}
                  </p>
                  
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline">{template.industry_sector}</Badge>
                      <Badge className={getTypeColor(template.template_type)}>
                        {template.template_type}
                      </Badge>
                    </div>

                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {template.usage_count}
                        </span>
                        <span className="flex items-center gap-1">
                          <TrendingUp className="h-3 w-3" />
                          {(template.effectiveness_score * 100).toFixed(0)}%
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleTemplateView(template)}
                        className="flex-1"
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        View
                      </Button>
                      <Button 
                        size="sm"
                        onClick={() => handleTemplateCustomize(template)}
                        className="flex-1"
                      >
                        <Settings className="h-3 w-3 mr-1" />
                        Customize
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="featured" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {templates
              .filter(template => template.is_featured)
              .map((template) => (
                <Card key={template.id} className="border-yellow-200 bg-yellow-50">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <Star className="h-5 w-5 text-yellow-500" />
                      <CardTitle className="text-lg">{template.template_name}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">
                      {template.template_description}
                    </p>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="flex-1">
                        <Eye className="h-3 w-3 mr-1" />
                        View Details
                      </Button>
                      <Button size="sm" className="flex-1">
                        <Download className="h-3 w-3 mr-1" />
                        Use Template
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>

        <TabsContent value="guides" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {guides.map((guide) => (
              <Card key={guide.id}>
                <CardHeader>
                  <CardTitle className="text-lg">{guide.guide_title}</CardTitle>
                  <Badge variant="outline">{guide.guide_type}</Badge>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>Difficulty: {guide.difficulty_level}</span>
                      {guide.estimated_completion_time && (
                        <span>{guide.estimated_completion_time}h</span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="flex-1">
                        <BookOpen className="h-3 w-3 mr-1" />
                        Read Guide
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Total Templates</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{templates.length}</div>
                <p className="text-xs text-muted-foreground">
                  Across all industries
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Average Effectiveness</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {templates.length > 0 
                    ? Math.round(templates.reduce((sum, t) => sum + t.effectiveness_score, 0) / templates.length * 100)
                    : 0}%
                </div>
                <p className="text-xs text-muted-foreground">
                  Based on user feedback
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-medium">Total Usage</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {templates.reduce((sum, t) => sum + t.usage_count, 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Template implementations
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TemplateLibraryDashboard;
