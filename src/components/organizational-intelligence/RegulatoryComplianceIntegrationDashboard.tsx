
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Shield, AlertTriangle, CheckCircle, FileText, Clock, TrendingUp, Globe, Building } from 'lucide-react';
import { templateLibraryService, IndustryTemplate } from '@/services/template-library-service';
import { useToast } from '@/hooks/use-toast';

interface RegulatoryComplianceIntegrationDashboardProps {
  orgId: string;
}

const RegulatoryComplianceIntegrationDashboard: React.FC<RegulatoryComplianceIntegrationDashboardProps> = ({ orgId }) => {
  const [loading, setLoading] = useState(true);
  const [templates, setTemplates] = useState<IndustryTemplate[]>([]);
  const [selectedRegulation, setSelectedRegulation] = useState<string>('all');
  const [selectedJurisdiction, setSelectedJurisdiction] = useState<string>('all');
  const [complianceOverview, setComplianceOverview] = useState({
    totalTemplates: 0,
    compliantTemplates: 0,
    pendingReview: 0,
    requiresUpdate: 0
  });

  const { toast } = useToast();

  useEffect(() => {
    loadRegulatoryTemplates();
  }, [selectedRegulation, selectedJurisdiction]);

  const loadRegulatoryTemplates = async () => {
    try {
      setLoading(true);
      
      let regulatoryTemplates: IndustryTemplate[] = [];
      
      if (selectedRegulation !== 'all') {
        regulatoryTemplates = await templateLibraryService.getTemplatesForRegulation(
          selectedRegulation,
          selectedJurisdiction === 'all' ? 'canada' : selectedJurisdiction
        );
      } else {
        regulatoryTemplates = await templateLibraryService.getIndustryTemplates();
      }

      setTemplates(regulatoryTemplates);
      
      // Calculate compliance overview
      setComplianceOverview({
        totalTemplates: regulatoryTemplates.length,
        compliantTemplates: regulatoryTemplates.filter(t => t.effectiveness_score > 0.8).length,
        pendingReview: regulatoryTemplates.filter(t => t.effectiveness_score < 0.6).length,
        requiresUpdate: regulatoryTemplates.filter(t => {
          const lastUpdated = new Date(t.last_updated_date);
          const sixMonthsAgo = new Date();
          sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
          return lastUpdated < sixMonthsAgo;
        }).length
      });

    } catch (error) {
      console.error('Error loading regulatory templates:', error);
      toast({
        title: "Error",
        description: "Failed to load regulatory compliance templates",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const regulatoryFrameworks = [
    { value: 'osfi-e21', label: 'OSFI E-21', jurisdiction: 'Canada' },
    { value: 'basel-iii', label: 'Basel III', jurisdiction: 'International' },
    { value: 'ffiec', label: 'FFIEC Guidance', jurisdiction: 'United States' },
    { value: 'nist-csf', label: 'NIST Cybersecurity Framework', jurisdiction: 'United States' },
    { value: 'iso-27001', label: 'ISO 27001', jurisdiction: 'International' },
    { value: 'sox', label: 'Sarbanes-Oxley', jurisdiction: 'United States' },
    { value: 'gdpr', label: 'GDPR', jurisdiction: 'European Union' }
  ];

  const getComplianceStatus = (template: IndustryTemplate) => {
    if (template.effectiveness_score >= 0.8) return 'compliant';
    if (template.effectiveness_score >= 0.6) return 'partial';
    return 'non-compliant';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'compliant': return 'bg-green-100 text-green-800';
      case 'partial': return 'bg-yellow-100 text-yellow-800';
      case 'non-compliant': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'compliant': return <CheckCircle className="h-4 w-4" />;
      case 'partial': return <Clock className="h-4 w-4" />;
      case 'non-compliant': return <AlertTriangle className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <Card key={i} className="animate-pulse">
              <CardContent className="pt-6">
                <div className="h-8 bg-gray-200 rounded mb-2"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
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
          <h1 className="text-3xl font-bold">Regulatory Compliance Integration</h1>
          <p className="text-muted-foreground mt-2">
            Intelligent mapping of templates to regulatory requirements
          </p>
        </div>
        <Button>
          <Shield className="h-4 w-4 mr-2" />
          Generate Compliance Report
        </Button>
      </div>

      {/* Compliance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Templates</p>
                <p className="text-2xl font-bold">{complianceOverview.totalTemplates}</p>
              </div>
              <Building className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Compliant</p>
                <p className="text-2xl font-bold text-green-600">{complianceOverview.compliantTemplates}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Pending Review</p>
                <p className="text-2xl font-bold text-yellow-600">{complianceOverview.pendingReview}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Requires Update</p>
                <p className="text-2xl font-bold text-red-600">{complianceOverview.requiresUpdate}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Regulatory Framework</label>
              <Select value={selectedRegulation} onValueChange={setSelectedRegulation}>
                <SelectTrigger>
                  <SelectValue placeholder="Select regulation" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Regulations</SelectItem>
                  {regulatoryFrameworks.map(framework => (
                    <SelectItem key={framework.value} value={framework.value}>
                      {framework.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Jurisdiction</label>
              <Select value={selectedJurisdiction} onValueChange={setSelectedJurisdiction}>
                <SelectTrigger>
                  <SelectValue placeholder="Select jurisdiction" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Jurisdictions</SelectItem>
                  <SelectItem value="canada">Canada</SelectItem>
                  <SelectItem value="united-states">United States</SelectItem>
                  <SelectItem value="international">International</SelectItem>
                  <SelectItem value="european-union">European Union</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Templates List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {templates.map((template) => {
          const status = getComplianceStatus(template);
          return (
            <Card key={template.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg flex-1">{template.template_name}</CardTitle>
                  <Badge className={getStatusColor(status)}>
                    <div className="flex items-center gap-1">
                      {getStatusIcon(status)}
                      {status.replace('-', ' ')}
                    </div>
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    {template.template_description}
                  </p>
                  
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">{template.industry_sector}</Badge>
                    <Badge variant="outline">{template.template_type}</Badge>
                    <Badge variant="outline">{template.complexity_level}</Badge>
                  </div>
                  
                  {template.regulatory_basis && template.regulatory_basis.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-muted-foreground">Regulatory Basis:</p>
                      <div className="flex flex-wrap gap-1">
                        {template.regulatory_basis.map((reg, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {reg}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4" />
                      <span>Effectiveness: {(template.effectiveness_score * 100).toFixed(0)}%</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      <span>Usage: {template.usage_count}</span>
                    </div>
                  </div>
                  
                  <Progress value={template.effectiveness_score * 100} className="w-full" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {templates.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No compliance templates found</h3>
            <p className="text-muted-foreground">
              Try adjusting your filters or check back later for new regulatory templates
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default RegulatoryComplianceIntegrationDashboard;
