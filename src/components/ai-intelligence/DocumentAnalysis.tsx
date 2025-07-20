import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Upload, Search, CheckCircle, AlertTriangle, Clock, FileSearch } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export const DocumentAnalysis = () => {
  const [searchTerm, setSearchTerm] = useState("");

  const processingQueue = [
    {
      id: 1,
      filename: "Risk_Management_Policy_v3.2.pdf",
      status: "processing",
      progress: 67,
      type: "Policy Document",
      uploadedAt: "2024-06-15 10:30"
    },
    {
      id: 2,
      filename: "Vendor_Contract_ABC_Corp.docx",
      status: "completed",
      progress: 100,
      type: "Contract",
      uploadedAt: "2024-06-15 09:15"
    },
    {
      id: 3,
      filename: "Compliance_Report_Q2_2024.xlsx",
      status: "pending",
      progress: 0,
      type: "Report",
      uploadedAt: "2024-06-15 11:45"
    }
  ];

  const analysisResults = [
    {
      id: 1,
      document: "Risk Management Policy v3.2",
      analysisType: "Policy Analysis",
      completedAt: "2024-06-15 14:20",
      findings: {
        riskFactors: 12,
        complianceGaps: 3,
        improvementOpportunities: 7,
        criticalIssues: 1
      },
      keyInsights: [
        "Missing specific cyber risk controls",
        "Outdated regulatory references",
        "Insufficient vendor risk coverage"
      ],
      confidence: 94
    },
    {
      id: 2,
      document: "Vendor Contract - ABC Corp",
      analysisType: "Contract Risk Extraction",
      completedAt: "2024-06-15 13:45",
      findings: {
        riskFactors: 8,
        complianceGaps: 1,
        improvementOpportunities: 4,
        criticalIssues: 0
      },
      keyInsights: [
        "Strong SLA terms",
        "Adequate termination clauses",
        "Minor data protection gaps"
      ],
      confidence: 89
    }
  ];

  const complianceGaps = [
    {
      id: 1,
      document: "Risk Management Policy v3.2",
      regulation: "OSFI E-21",
      section: "Principle 3",
      gap: "Missing operational resilience testing requirements",
      severity: "High",
      recommendation: "Add detailed scenario testing procedures",
      confidence: 91
    },
    {
      id: 2,
      document: "Vendor Contract - ABC Corp",
      regulation: "PIPEDA",
      section: "Data Protection",
      gap: "Insufficient data breach notification timeline",
      severity: "Medium",
      recommendation: "Include 72-hour notification requirement",
      confidence: 87
    }
  ];

  const insights = [
    {
      id: 1,
      type: "Risk Pattern",
      title: "Vendor Risk Concentration",
      description: "Analysis across 23 vendor contracts reveals high concentration risk in cloud services",
      documents: 23,
      confidence: 92,
      impact: "High",
      category: "Third Party Risk"
    },
    {
      id: 2,
      type: "Compliance Trend",
      title: "Regulatory Reference Updates",
      description: "15% of policies contain outdated regulatory references requiring updates",
      documents: 45,
      confidence: 88,
      impact: "Medium",
      category: "Compliance"
    },
    {
      id: 3,
      type: "Control Gap",
      title: "Cyber Security Controls",
      description: "Emerging gap in AI/ML governance across technology policies",
      documents: 12,
      confidence: 85,
      impact: "High",
      category: "Technology Risk"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'processing': return 'text-blue-600 bg-blue-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'High': return 'bg-red-100 text-red-800 border-red-200';
      case 'Medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Intelligent Document Analysis</h2>
          <p className="text-muted-foreground">AI-powered document processing and risk extraction</p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search documents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 w-64"
            />
          </div>
          <Button>
            <Upload className="h-4 w-4 mr-2" />
            Upload Documents
          </Button>
        </div>
      </div>

      <Tabs defaultValue="processing" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="processing">Processing Queue</TabsTrigger>
          <TabsTrigger value="results">Analysis Results</TabsTrigger>
          <TabsTrigger value="compliance">Compliance Gaps</TabsTrigger>
          <TabsTrigger value="insights">AI Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="processing">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="h-5 w-5 mr-2" />
                Document Processing Queue
              </CardTitle>
              <CardDescription>
                Real-time status of document analysis pipeline
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {processingQueue.map((item) => (
                  <div key={item.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <FileText className="h-5 w-5 text-blue-600" />
                        <div>
                          <h4 className="font-medium">{item.filename}</h4>
                          <p className="text-sm text-muted-foreground">{item.type}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge className={getStatusColor(item.status)}>
                          {item.status}
                        </Badge>
                        <span className="text-xs text-muted-foreground">{item.uploadedAt}</span>
                      </div>
                    </div>
                    
                    {item.status === 'processing' && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Processing...</span>
                          <span>{item.progress}%</span>
                        </div>
                        <Progress value={item.progress} className="w-full" />
                      </div>
                    )}
                    
                    {item.status === 'completed' && (
                      <div className="flex justify-end">
                        <Button variant="outline" size="sm">
                          View Analysis
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="results">
          <div className="space-y-4">
            {analysisResults.map((result) => (
              <Card key={result.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center">
                        <FileSearch className="h-5 w-5 mr-2" />
                        {result.document}
                      </CardTitle>
                      <CardDescription>{result.analysisType}</CardDescription>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">{result.confidence}% Confidence</div>
                      <div className="text-xs text-muted-foreground">{result.completedAt}</div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-3 bg-red-50 rounded-lg border border-red-200">
                      <div className="text-2xl font-bold text-red-600">{result.findings.criticalIssues}</div>
                      <div className="text-sm text-red-700">Critical Issues</div>
                    </div>
                    <div className="text-center p-3 bg-orange-50 rounded-lg border border-orange-200">
                      <div className="text-2xl font-bold text-orange-600">{result.findings.complianceGaps}</div>
                      <div className="text-sm text-orange-700">Compliance Gaps</div>
                    </div>
                    <div className="text-center p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="text-2xl font-bold text-blue-600">{result.findings.riskFactors}</div>
                      <div className="text-sm text-blue-700">Risk Factors</div>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg border border-green-200">
                      <div className="text-2xl font-bold text-green-600">{result.findings.improvementOpportunities}</div>
                      <div className="text-sm text-green-700">Opportunities</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h5 className="font-medium">Key Insights:</h5>
                    <ul className="space-y-1">
                      {result.keyInsights.map((insight, index) => (
                        <li key={index} className="flex items-center space-x-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <span>{insight}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex justify-end">
                    <Button variant="outline" size="sm">
                      Download Report
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="compliance">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2" />
                Compliance Gap Analysis
              </CardTitle>
              <CardDescription>
                AI-identified compliance gaps across analyzed documents
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {complianceGaps.map((gap) => (
                  <div key={gap.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <h4 className="font-medium">{gap.document}</h4>
                        <p className="text-sm text-muted-foreground">
                          {gap.regulation} - {gap.section}
                        </p>
                      </div>
                      <Badge variant="outline" className={getSeverityColor(gap.severity)}>
                        {gap.severity}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2">
                      <div>
                        <span className="font-medium text-sm">Gap: </span>
                        <span className="text-sm">{gap.gap}</span>
                      </div>
                      <div>
                        <span className="font-medium text-sm">Recommendation: </span>
                        <span className="text-sm">{gap.recommendation}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="text-sm text-muted-foreground">
                        Confidence: {gap.confidence}%
                      </div>
                      <Button variant="outline" size="sm">
                        Create Action Item
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="insights">
          <div className="space-y-4">
            {insights.map((insight) => (
              <Card key={insight.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center">
                        <FileSearch className="h-5 w-5 mr-2" />
                        {insight.title}
                      </CardTitle>
                      <CardDescription>{insight.type}</CardDescription>
                    </div>
                    <Badge variant="outline">{insight.category}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">{insight.description}</p>
                  
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Documents Analyzed:</span> {insight.documents}
                    </div>
                    <div>
                      <span className="font-medium">Confidence:</span> {insight.confidence}%
                    </div>
                    <div>
                      <span className="font-medium">Impact:</span> 
                      <Badge variant="outline" className={`ml-2 ${getSeverityColor(insight.impact)}`}>
                        {insight.impact}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex justify-end mt-4">
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};