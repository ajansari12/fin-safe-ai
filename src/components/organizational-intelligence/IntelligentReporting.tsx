import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  FileText, 
  Download, 
  Send, 
  Calendar, 
  Filter, 
  BarChart3,
  Brain,
  Clock,
  CheckCircle,
  Zap
} from 'lucide-react';

export const IntelligentReporting = () => {
  const [reportType, setReportType] = useState('comprehensive');
  const [frequency, setFrequency] = useState('monthly');

  const reportTemplates = [
    {
      id: 'comprehensive',
      name: 'Comprehensive Risk Report',
      description: 'Complete organizational risk assessment with AI insights',
      sections: ['Executive Summary', 'Risk Analysis', 'Compliance Status', 'Recommendations'],
      estimatedTime: '5-7 minutes',
      complexity: 'High'
    },
    {
      id: 'compliance',
      name: 'Regulatory Compliance Report',
      description: 'Focused compliance status and regulatory requirements',
      sections: ['Compliance Overview', 'Gap Analysis', 'Action Items'],
      estimatedTime: '3-4 minutes',
      complexity: 'Medium'
    },
    {
      id: 'performance',
      name: 'Performance Analytics Report',
      description: 'Operational performance metrics and trends',
      sections: ['KPI Dashboard', 'Trend Analysis', 'Performance Insights'],
      estimatedTime: '2-3 minutes',
      complexity: 'Low'
    },
    {
      id: 'custom',
      name: 'Custom Intelligence Report',
      description: 'Tailored report based on specific requirements',
      sections: ['Custom Sections'],
      estimatedTime: '4-6 minutes',
      complexity: 'Variable'
    }
  ];

  const scheduledReports = [
    {
      id: 1,
      name: 'Weekly Risk Summary',
      type: 'Risk Analysis',
      frequency: 'Weekly',
      recipients: ['risk@company.com', 'executive@company.com'],
      nextRun: '2024-01-15',
      status: 'active'
    },
    {
      id: 2,
      name: 'Monthly Compliance Dashboard',
      type: 'Compliance',
      frequency: 'Monthly',
      recipients: ['compliance@company.com'],
      nextRun: '2024-01-31',
      status: 'active'
    },
    {
      id: 3,
      name: 'Quarterly Board Report',
      type: 'Comprehensive',
      frequency: 'Quarterly',
      recipients: ['board@company.com'],
      nextRun: '2024-03-31',
      status: 'active'
    }
  ];

  const recentReports = [
    {
      id: 1,
      name: 'Q4 2023 Risk Assessment',
      type: 'Comprehensive',
      generated: '2024-01-08',
      size: '2.4 MB',
      downloads: 23,
      status: 'completed'
    },
    {
      id: 2,
      name: 'December Compliance Review',
      type: 'Compliance',
      generated: '2024-01-05',
      size: '1.8 MB',
      downloads: 15,
      status: 'completed'
    },
    {
      id: 3,
      name: 'Year-End Performance Analysis',
      type: 'Performance',
      generated: '2024-01-03',
      size: '3.1 MB',
      downloads: 31,
      status: 'completed'
    }
  ];

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'High': return 'bg-red-500/10 text-red-700 dark:text-red-300';
      case 'Medium': return 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-300';
      case 'Low': return 'bg-green-500/10 text-green-700 dark:text-green-300';
      default: return 'bg-gray-500/10 text-gray-700 dark:text-gray-300';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500/10 text-green-700 dark:text-green-300';
      case 'completed': return 'bg-blue-500/10 text-blue-700 dark:text-blue-300';
      case 'pending': return 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-300';
      default: return 'bg-gray-500/10 text-gray-700 dark:text-gray-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* Report Generation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Brain className="w-5 h-5" />
            <span>AI-Powered Report Generation</span>
          </CardTitle>
          <CardDescription>
            Generate intelligent reports with automated insights and recommendations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Template Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reportTemplates.map((template) => (
              <Card 
                key={template.id} 
                className={`cursor-pointer transition-all hover:shadow-md ${
                  reportType === template.id ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => setReportType(template.id)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base">{template.name}</CardTitle>
                    <Badge className={getComplexityColor(template.complexity)}>
                      {template.complexity}
                    </Badge>
                  </div>
                  <CardDescription className="text-sm">{template.description}</CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Estimated time:</span>
                      <span>{template.estimatedTime}</span>
                    </div>
                    <div className="text-sm">
                      <span className="text-muted-foreground">Sections: </span>
                      <span>{template.sections.join(', ')}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Configuration */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="date-range">Date Range</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select date range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="last-30-days">Last 30 Days</SelectItem>
                    <SelectItem value="last-quarter">Last Quarter</SelectItem>
                    <SelectItem value="last-year">Last Year</SelectItem>
                    <SelectItem value="custom">Custom Range</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="output-format">Output Format</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select format" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pdf">PDF Document</SelectItem>
                    <SelectItem value="excel">Excel Workbook</SelectItem>
                    <SelectItem value="powerpoint">PowerPoint Presentation</SelectItem>
                    <SelectItem value="html">HTML Report</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="recipients">Email Recipients</Label>
                <Textarea 
                  id="recipients"
                  placeholder="Enter email addresses separated by commas"
                  className="min-h-[80px]"
                />
              </div>

              <div className="space-y-3">
                <Label>AI Enhancement Options</Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="insights" defaultChecked />
                    <Label htmlFor="insights" className="text-sm">Generate AI insights</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="recommendations" defaultChecked />
                    <Label htmlFor="recommendations" className="text-sm">Include recommendations</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="predictions" />
                    <Label htmlFor="predictions" className="text-sm">Add predictive analysis</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="benchmarks" />
                    <Label htmlFor="benchmarks" className="text-sm">Industry benchmarks</Label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex space-x-3">
            <Button className="flex-1">
              <Zap className="w-4 h-4 mr-2" />
              Generate Report
            </Button>
            <Button variant="outline">
              <Calendar className="w-4 h-4 mr-2" />
              Schedule
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Scheduled Reports */}
      <Card>
        <CardHeader>
          <CardTitle>Scheduled Reports</CardTitle>
          <CardDescription>Automated report generation and distribution</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {scheduledReports.map((report) => (
              <div key={report.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <h4 className="font-semibold">{report.name}</h4>
                  <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                    <span>{report.type}</span>
                    <span>•</span>
                    <span>{report.frequency}</span>
                    <span>•</span>
                    <span>Next: {report.nextRun}</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Recipients: {report.recipients.join(', ')}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className={getStatusColor(report.status)}>
                    {report.status}
                  </Badge>
                  <Button variant="outline" size="sm">
                    Edit
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Reports */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Reports</CardTitle>
          <CardDescription>Previously generated reports and analytics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentReports.map((report) => (
              <div key={report.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <FileText className="w-8 h-8 text-primary" />
                  <div className="space-y-1">
                    <h4 className="font-semibold">{report.name}</h4>
                    <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                      <span>{report.type}</span>
                      <span>•</span>
                      <span>Generated: {report.generated}</span>
                      <span>•</span>
                      <span>{report.size}</span>
                      <span>•</span>
                      <span>{report.downloads} downloads</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge className={getStatusColor(report.status)}>
                    <CheckCircle className="w-3 h-3 mr-1" />
                    {report.status}
                  </Badge>
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                  <Button variant="outline" size="sm">
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};