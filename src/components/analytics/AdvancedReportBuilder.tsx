
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Calendar, 
  Filter, 
  BarChart3, 
  Download, 
  Mail, 
  Settings,
  Plus,
  X
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface ReportTemplate {
  id: string;
  name: string;
  type: 'executive' | 'operational' | 'compliance' | 'custom';
  description: string;
  sections: string[];
  frequency?: string;
}

interface ReportFilter {
  field: string;
  operator: string;
  value: string;
}

const AdvancedReportBuilder: React.FC = () => {
  const [selectedTemplate, setSelectedTemplate] = useState<ReportTemplate | null>(null);
  const [reportName, setReportName] = useState('');
  const [reportDescription, setReportDescription] = useState('');
  const [selectedSections, setSelectedSections] = useState<string[]>([]);
  const [filters, setFilters] = useState<ReportFilter[]>([]);
  const [distributionEmails, setDistributionEmails] = useState<string[]>([]);
  const [newEmail, setNewEmail] = useState('');

  const reportTemplates: ReportTemplate[] = [
    {
      id: 'executive',
      name: 'Executive Risk Summary',
      type: 'executive',
      description: 'High-level risk overview for board and senior management',
      sections: ['Risk Overview', 'Key Metrics', 'Trend Analysis', 'Critical Issues', 'Recommendations'],
      frequency: 'monthly'
    },
    {
      id: 'operational',
      name: 'Operational Risk Report',
      type: 'operational',
      description: 'Detailed operational risk analysis and metrics',
      sections: ['Incident Summary', 'Control Effectiveness', 'KRI Status', 'Vendor Risks', 'Action Items'],
      frequency: 'weekly'
    },
    {
      id: 'compliance',
      name: 'Regulatory Compliance Report',
      type: 'compliance',
      description: 'Compliance status and regulatory requirements',
      sections: ['Compliance Status', 'Policy Updates', 'Audit Findings', 'Remediation Plans', 'Certifications'],
      frequency: 'quarterly'
    },
    {
      id: 'custom',
      name: 'Custom Report',
      type: 'custom',
      description: 'Build your own report with selected components',
      sections: []
    }
  ];

  const availableSections = [
    'Executive Summary',
    'Risk Overview',
    'Key Metrics',
    'Trend Analysis',
    'Incident Summary',
    'Control Effectiveness',
    'KRI Status',
    'Vendor Risks',
    'Compliance Status',
    'Policy Updates',
    'Audit Findings',
    'Remediation Plans',
    'Action Items',
    'Recommendations',
    'Appendices'
  ];

  const filterFields = [
    'Severity',
    'Category',
    'Department',
    'Status',
    'Date Range',
    'Risk Rating',
    'Assignee'
  ];

  const filterOperators = [
    'equals',
    'contains',
    'greater than',
    'less than',
    'between',
    'in list'
  ];

  const handleTemplateSelect = (template: ReportTemplate) => {
    setSelectedTemplate(template);
    setReportName(template.name);
    setReportDescription(template.description);
    setSelectedSections(template.sections);
  };

  const handleSectionToggle = (section: string) => {
    setSelectedSections(prev => 
      prev.includes(section)
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  const addFilter = () => {
    setFilters(prev => [...prev, { field: '', operator: '', value: '' }]);
  };

  const updateFilter = (index: number, field: keyof ReportFilter, value: string) => {
    setFilters(prev => prev.map((filter, i) => 
      i === index ? { ...filter, [field]: value } : filter
    ));
  };

  const removeFilter = (index: number) => {
    setFilters(prev => prev.filter((_, i) => i !== index));
  };

  const addEmail = () => {
    if (newEmail && !distributionEmails.includes(newEmail)) {
      setDistributionEmails(prev => [...prev, newEmail]);
      setNewEmail('');
    }
  };

  const removeEmail = (email: string) => {
    setDistributionEmails(prev => prev.filter(e => e !== email));
  };

  const generateReport = () => {
    console.log('Generating report:', {
      name: reportName,
      description: reportDescription,
      sections: selectedSections,
      filters,
      distribution: distributionEmails
    });
    // Implementation would generate and download the report
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Advanced Report Builder
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Create custom reports with automated generation and distribution
          </p>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="template" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="template">Template</TabsTrigger>
              <TabsTrigger value="content">Content</TabsTrigger>
              <TabsTrigger value="filters">Filters</TabsTrigger>
              <TabsTrigger value="distribution">Distribution</TabsTrigger>
            </TabsList>

            <TabsContent value="template" className="space-y-4">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label>Report Templates</Label>
                  <div className="grid gap-3 md:grid-cols-2">
                    {reportTemplates.map((template) => (
                      <Card 
                        key={template.id}
                        className={`cursor-pointer transition-colors ${
                          selectedTemplate?.id === template.id ? 'border-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                        }`}
                        onClick={() => handleTemplateSelect(template)}
                      >
                        <CardContent className="p-4">
                          <h4 className="font-medium">{template.name}</h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            {template.description}
                          </p>
                          {template.frequency && (
                            <Badge variant="secondary" className="mt-2">
                              {template.frequency}
                            </Badge>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="reportName">Report Name</Label>
                    <Input
                      id="reportName"
                      value={reportName}
                      onChange={(e) => setReportName(e.target.value)}
                      placeholder="Enter report name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reportDescription">Description</Label>
                    <Input
                      id="reportDescription"
                      value={reportDescription}
                      onChange={(e) => setReportDescription(e.target.value)}
                      placeholder="Enter report description"
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="content" className="space-y-4">
              <div className="space-y-4">
                <div>
                  <Label>Report Sections</Label>
                  <p className="text-sm text-muted-foreground mb-3">
                    Select the sections to include in your report
                  </p>
                  <div className="grid gap-2 md:grid-cols-2">
                    {availableSections.map((section) => (
                      <div key={section} className="flex items-center space-x-2">
                        <Checkbox
                          id={section}
                          checked={selectedSections.includes(section)}
                          onCheckedChange={() => handleSectionToggle(section)}
                        />
                        <Label htmlFor={section} className="text-sm font-normal">
                          {section}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border rounded-lg p-4 bg-gray-50">
                  <h4 className="font-medium mb-2">Selected Sections ({selectedSections.length})</h4>
                  <div className="flex flex-wrap gap-2">
                    {selectedSections.map((section) => (
                      <Badge key={section} variant="secondary">
                        {section}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="filters" className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Report Filters</Label>
                  <Button size="sm" onClick={addFilter} className="flex items-center gap-1">
                    <Plus className="h-3 w-3" />
                    Add Filter
                  </Button>
                </div>

                {filters.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Filter className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No filters applied. Report will include all data.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filters.map((filter, index) => (
                      <div key={index} className="flex items-center gap-2 p-3 border rounded">
                        <Select
                          value={filter.field}
                          onValueChange={(value) => updateFilter(index, 'field', value)}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue placeholder="Field" />
                          </SelectTrigger>
                          <SelectContent>
                            {filterFields.map((field) => (
                              <SelectItem key={field} value={field}>
                                {field}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        <Select
                          value={filter.operator}
                          onValueChange={(value) => updateFilter(index, 'operator', value)}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue placeholder="Operator" />
                          </SelectTrigger>
                          <SelectContent>
                            {filterOperators.map((operator) => (
                              <SelectItem key={operator} value={operator}>
                                {operator}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        <Input
                          value={filter.value}
                          onChange={(e) => updateFilter(index, 'value', e.target.value)}
                          placeholder="Value"
                          className="flex-1"
                        />

                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => removeFilter(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="distribution" className="space-y-4">
              <div className="space-y-4">
                <div>
                  <Label>Email Distribution</Label>
                  <p className="text-sm text-muted-foreground mb-3">
                    Configure automated report delivery
                  </p>
                  <div className="flex gap-2">
                    <Input
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      placeholder="Enter email address"
                      onKeyPress={(e) => e.key === 'Enter' && addEmail()}
                    />
                    <Button onClick={addEmail}>Add</Button>
                  </div>
                </div>

                {distributionEmails.length > 0 && (
                  <div className="space-y-2">
                    <Label>Recipients ({distributionEmails.length})</Label>
                    <div className="space-y-1">
                      {distributionEmails.map((email) => (
                        <div key={email} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                          <span className="text-sm">{email}</span>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => removeEmail(email)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Schedule</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select frequency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="manual">Manual only</SelectItem>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="quarterly">Quarterly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Format</Label>
                    <Select defaultValue="pdf">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pdf">PDF</SelectItem>
                        <SelectItem value="excel">Excel</SelectItem>
                        <SelectItem value="powerpoint">PowerPoint</SelectItem>
                        <SelectItem value="html">HTML</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end gap-2 mt-6 pt-6 border-t">
            <Button variant="outline">
              <Settings className="h-4 w-4 mr-2" />
              Save Template
            </Button>
            <Button onClick={generateReport}>
              <Download className="h-4 w-4 mr-2" />
              Generate Report
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdvancedReportBuilder;
