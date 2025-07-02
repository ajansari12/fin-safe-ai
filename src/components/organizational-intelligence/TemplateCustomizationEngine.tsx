
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Settings, Zap, Download, Eye, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';
import { templateLibraryService, IndustryTemplate } from '@/services/template-library-service';
import { useToast } from '@/hooks/use-toast';

interface TemplateCustomizationEngineProps {
  orgId: string;
  templateId?: string;
  onTemplateGenerated?: (template: IndustryTemplate) => void;
}

const TemplateCustomizationEngine: React.FC<TemplateCustomizationEngineProps> = ({ 
  orgId, 
  templateId, 
  onTemplateGenerated 
}) => {
  const [loading, setLoading] = useState(false);
  const [template, setTemplate] = useState<IndustryTemplate | null>(null);
  const [customizedTemplate, setCustomizedTemplate] = useState<IndustryTemplate | null>(null);
  const [customizationProgress, setCustomizationProgress] = useState(0);
  
  // Organizational Profile Parameters
  const [orgProfile, setOrgProfile] = useState({
    sector: 'banking',
    size: 'medium',
    complexity: 'medium',
    regulatory_focus: 'osfi',
    risk_appetite: 'moderate',
    technology_maturity: 'intermediate',
    geographic_scope: 'national',
    employee_count: 500,
    asset_size: 1000000000
  });

  // Customization Preferences
  const [customizationPrefs, setCustomizationPrefs] = useState({
    automation_level: 'balanced',
    detail_level: 'standard',
    compliance_strictness: 'standard',
    integration_requirements: true,
    performance_optimization: true,
    regulatory_alignment: true
  });

  const { toast } = useToast();

  useEffect(() => {
    if (templateId) {
      loadTemplate();
    }
  }, [templateId]);

  const loadTemplate = async () => {
    if (!templateId) return;
    
    try {
      setLoading(true);
      const data = await templateLibraryService.getTemplateById(templateId);
      setTemplate(data);
    } catch (error) {
      console.error('Error loading template:', error);
      toast({
        title: "Error",
        description: "Failed to load template",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const generateCustomizedTemplate = async () => {
    if (!templateId) {
      toast({
        title: "No Template Selected",
        description: "Please select a template to customize",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);
      setCustomizationProgress(0);

      // Simulate customization progress
      const progressInterval = setInterval(() => {
        setCustomizationProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const customized = await templateLibraryService.getCustomizedTemplate({
        orgId,
        templateId,
        organizationalProfile: orgProfile,
        customizationPreferences: customizationPrefs
      });

      clearInterval(progressInterval);
      setCustomizationProgress(100);
      setCustomizedTemplate(customized);

      if (onTemplateGenerated) {
        onTemplateGenerated(customized);
      }

      toast({
        title: "Template Customized",
        description: "Your personalized template has been generated successfully",
      });

    } catch (error) {
      console.error('Error customizing template:', error);
      toast({
        title: "Customization Error",
        description: "Failed to customize template. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
      setCustomizationProgress(0);
    }
  };

  const resetCustomization = () => {
    setCustomizedTemplate(null);
    setCustomizationProgress(0);
  };

  const handleProfileChange = (field: string, value: any) => {
    setOrgProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePreferenceChange = (field: string, value: any) => {
    setCustomizationPrefs(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Template Customization Engine</h1>
          <p className="text-muted-foreground mt-2">
            AI-powered template customization based on your organizational profile
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={resetCustomization}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Reset
          </Button>
          <Button onClick={generateCustomizedTemplate} disabled={loading || !template}>
            <Zap className="h-4 w-4 mr-2" />
            {loading ? 'Customizing...' : 'Generate Custom Template'}
          </Button>
        </div>
      </div>

      {/* Template Selection */}
      {template && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Selected Template
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">{template.template_name}</h3>
                <p className="text-sm text-muted-foreground">
                  {template.template_description}
                </p>
                <div className="flex gap-2 mt-2">
                  <Badge>{template.industry_sector}</Badge>
                  <Badge>{template.template_type}</Badge>
                  <Badge>{template.complexity_level}</Badge>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-muted-foreground">Effectiveness</div>
                <div className="text-2xl font-bold">
                  {(template.effectiveness_score * 100).toFixed(0)}%
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Customization Progress */}
      {loading && customizationProgress > 0 && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Customizing Template</span>
                <span>{customizationProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${customizationProgress}%` }}
                ></div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Organizational Profile */}
        <Card>
          <CardHeader>
            <CardTitle>Organizational Profile</CardTitle>
            <p className="text-sm text-muted-foreground">
              Configure your organization's characteristics for personalized customization
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Industry Sector</Label>
                <Select value={orgProfile.sector} onValueChange={(value) => handleProfileChange('sector', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="banking">Banking</SelectItem>
                    <SelectItem value="insurance">Insurance</SelectItem>
                    <SelectItem value="investment_management">Investment Management</SelectItem>
                    <SelectItem value="fintech">FinTech</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Organization Size</Label>
                <Select value={orgProfile.size} onValueChange={(value) => handleProfileChange('size', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="small">Small (&lt; 100 employees)</SelectItem>
                    <SelectItem value="medium">Medium (100-1000)</SelectItem>
                    <SelectItem value="large">Large (&gt; 1000)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Employee Count: {orgProfile.employee_count}</Label>
              <Slider
                value={[orgProfile.employee_count]}
                onValueChange={([value]) => handleProfileChange('employee_count', value)}
                min={10}
                max={10000}
                step={50}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label>Risk Appetite</Label>
              <Select value={orgProfile.risk_appetite} onValueChange={(value) => handleProfileChange('risk_appetite', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="conservative">Conservative</SelectItem>
                  <SelectItem value="moderate">Moderate</SelectItem>
                  <SelectItem value="aggressive">Aggressive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Technology Maturity</Label>
              <Select value={orgProfile.technology_maturity} onValueChange={(value) => handleProfileChange('technology_maturity', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="basic">Basic</SelectItem>
                  <SelectItem value="intermediate">Intermediate</SelectItem>
                  <SelectItem value="advanced">Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Customization Preferences */}
        <Card>
          <CardHeader>
            <CardTitle>Customization Preferences</CardTitle>
            <p className="text-sm text-muted-foreground">
              Fine-tune how the template should be customized for your needs
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label>Automation Level</Label>
              <Select value={customizationPrefs.automation_level} onValueChange={(value) => handlePreferenceChange('automation_level', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="minimal">Minimal Automation</SelectItem>
                  <SelectItem value="balanced">Balanced Automation</SelectItem>
                  <SelectItem value="maximum">Maximum Automation</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Detail Level</Label>
              <Select value={customizationPrefs.detail_level} onValueChange={(value) => handlePreferenceChange('detail_level', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="summary">Summary</SelectItem>
                  <SelectItem value="standard">Standard</SelectItem>
                  <SelectItem value="detailed">Detailed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Integration Requirements</Label>
                <Switch
                  checked={customizationPrefs.integration_requirements}
                  onCheckedChange={(value) => handlePreferenceChange('integration_requirements', value)}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label>Performance Optimization</Label>
                <Switch
                  checked={customizationPrefs.performance_optimization}
                  onCheckedChange={(value) => handlePreferenceChange('performance_optimization', value)}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label>Regulatory Alignment</Label>
                <Switch
                  checked={customizationPrefs.regulatory_alignment}
                  onCheckedChange={(value) => handlePreferenceChange('regulatory_alignment', value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Customized Template Result */}
      {customizedTemplate && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              Customized Template Generated
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label className="text-sm font-medium">Template Name</Label>
                  <p className="text-sm">{customizedTemplate.template_name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Complexity Level</Label>
                  <Badge>{customizedTemplate.complexity_level}</Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium">Customization Applied</Label>
                  <div className="flex items-center gap-1 text-sm text-green-600">
                    <CheckCircle className="h-3 w-3" />
                    Optimized for your organization
                  </div>
                </div>
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button className="flex-1">
                  <Download className="h-4 w-4 mr-2" />
                  Download Template
                </Button>
                <Button variant="outline" className="flex-1">
                  <Eye className="h-4 w-4 mr-2" />
                  Preview Changes
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TemplateCustomizationEngine;
