import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Users, 
  Cog, 
  Server, 
  ExternalLink, 
  AlertTriangle, 
  CheckCircle,
  TrendingUp,
  Target,
  Activity
} from "lucide-react";

interface RiskCategory {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  subcategories: RiskSubcategory[];
  riskCount: number;
  highRiskCount: number;
  lastAssessment: string;
}

interface RiskSubcategory {
  id: string;
  name: string;
  description: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  controlsInPlace: number;
  totalControls: number;
  lastReview: string;
}

export default function OperationalRiskTaxonomy() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  // OSFI E-21 compliant operational risk taxonomy
  const riskCategories: RiskCategory[] = [
    {
      id: "people",
      name: "People Risk",
      description: "Risks arising from human resources and human error",
      icon: <Users className="h-5 w-5" />,
      riskCount: 24,
      highRiskCount: 3,
      lastAssessment: "2024-06-15",
      subcategories: [
        {
          id: "people-1",
          name: "Key Personnel Risk",
          description: "Risk of losing critical staff or inadequate succession planning",
          riskLevel: "high",
          controlsInPlace: 8,
          totalControls: 12,
          lastReview: "2024-06-01"
        },
        {
          id: "people-2", 
          name: "Operational Error",
          description: "Risk of human error in critical operations",
          riskLevel: "medium",
          controlsInPlace: 15,
          totalControls: 18,
          lastReview: "2024-06-10"
        },
        {
          id: "people-3",
          name: "Fraud and Misconduct",
          description: "Internal fraud or employee misconduct risks",
          riskLevel: "high",
          controlsInPlace: 22,
          totalControls: 24,
          lastReview: "2024-05-28"
        },
        {
          id: "people-4",
          name: "Training and Competency",
          description: "Inadequate training or skill gaps",
          riskLevel: "medium",
          controlsInPlace: 12,
          totalControls: 14,
          lastReview: "2024-06-05"
        }
      ]
    },
    {
      id: "processes",
      name: "Process Risk", 
      description: "Risks from inadequate or failed internal processes",
      icon: <Cog className="h-5 w-5" />,
      riskCount: 31,
      highRiskCount: 5,
      lastAssessment: "2024-06-20",
      subcategories: [
        {
          id: "process-1",
          name: "Business Process Failure",
          description: "Critical business process breakdown or inadequacy", 
          riskLevel: "high",
          controlsInPlace: 18,
          totalControls: 22,
          lastReview: "2024-06-12"
        },
        {
          id: "process-2",
          name: "Change Management",
          description: "Inadequate change management processes",
          riskLevel: "medium",
          controlsInPlace: 10,
          totalControls: 12,
          lastReview: "2024-06-08"
        },
        {
          id: "process-3",
          name: "Data Processing Errors",
          description: "Errors in data processing and reconciliation",
          riskLevel: "medium", 
          controlsInPlace: 14,
          totalControls: 16,
          lastReview: "2024-06-15"
        },
        {
          id: "process-4",
          name: "Settlement and Clearing",
          description: "Settlement and clearing process failures",
          riskLevel: "high",
          controlsInPlace: 20,
          totalControls: 24,
          lastReview: "2024-06-18"
        }
      ]
    },
    {
      id: "systems",
      name: "Systems Risk",
      description: "Technology and system-related operational risks",
      icon: <Server className="h-5 w-5" />,
      riskCount: 28,
      highRiskCount: 4,
      lastAssessment: "2024-06-18",
      subcategories: [
        {
          id: "systems-1",
          name: "System Availability",
          description: "Critical system downtime and availability issues",
          riskLevel: "critical",
          controlsInPlace: 16,
          totalControls: 20,
          lastReview: "2024-06-16"
        },
        {
          id: "systems-2",
          name: "Cyber Security",
          description: "Cybersecurity threats and data breaches",
          riskLevel: "critical",
          controlsInPlace: 25,
          totalControls: 28,
          lastReview: "2024-06-20"
        },
        {
          id: "systems-3",
          name: "Data Integrity",
          description: "Data corruption or integrity issues",
          riskLevel: "high",
          controlsInPlace: 12,
          totalControls: 15,
          lastReview: "2024-06-14"
        },
        {
          id: "systems-4",
          name: "System Integration",
          description: "Integration failures between systems",
          riskLevel: "medium",
          controlsInPlace: 8,
          totalControls: 10,
          lastReview: "2024-06-12"
        }
      ]
    },
    {
      id: "external",
      name: "External Events",
      description: "Risks from external events beyond direct control",
      icon: <ExternalLink className="h-5 w-5" />,
      riskCount: 19,
      highRiskCount: 6,
      lastAssessment: "2024-06-22",
      subcategories: [
        {
          id: "external-1",
          name: "Third-Party Service Failure",
          description: "Critical vendor or service provider failures",
          riskLevel: "high",
          controlsInPlace: 14,
          totalControls: 18,
          lastReview: "2024-06-20"
        },
        {
          id: "external-2",
          name: "Natural Disasters",
          description: "Natural disasters affecting operations",
          riskLevel: "medium",
          controlsInPlace: 8,
          totalControls: 10,
          lastReview: "2024-06-10"
        },
        {
          id: "external-3",
          name: "Regulatory Changes",
          description: "Unexpected regulatory or legal changes",
          riskLevel: "medium",
          controlsInPlace: 6,
          totalControls: 8,
          lastReview: "2024-06-15"
        },
        {
          id: "external-4",
          name: "Market Infrastructure",
          description: "Financial market infrastructure disruptions",
          riskLevel: "high",
          controlsInPlace: 10,
          totalControls: 14,
          lastReview: "2024-06-18"
        }
      ]
    }
  ];

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'critical':
        return 'bg-red-500 text-white';
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const calculateControlsPercentage = (controlsInPlace: number, totalControls: number) => {
    return Math.round((controlsInPlace / totalControls) * 100);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Operational Risk Taxonomy</h2>
          <p className="text-muted-foreground">
            OSFI E-21 compliant classification framework for operational risks
          </p>
        </div>
        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
          OSFI E-21 Framework
        </Badge>
      </div>

      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <strong>OSFI E-21 Compliance:</strong> This taxonomy aligns with OSFI's definition of operational risk as 
          "the risk of loss resulting from people, inadequate or failed internal processes and systems, or from external events."
          This classification supports Principle 2 (Framework) requirements.
        </AlertDescription>
      </Alert>

      <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-4">
        {riskCategories.map((category) => (
          <Card 
            key={category.id} 
            className={`cursor-pointer transition-all hover:shadow-md ${
              selectedCategory === category.id ? 'ring-2 ring-primary' : ''
            }`}
            onClick={() => setSelectedCategory(category.id)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                {category.icon}
                <CardTitle className="text-lg">{category.name}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  {category.description}
                </p>
                <div className="flex items-center justify-between">
                  <div className="text-sm">
                    <div className="font-medium">{category.riskCount} Risks</div>
                    <div className="text-muted-foreground">
                      {category.highRiskCount} High/Critical
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Activity className="h-4 w-4 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      {category.lastAssessment}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedCategory && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {riskCategories.find(c => c.id === selectedCategory)?.icon}
              {riskCategories.find(c => c.id === selectedCategory)?.name} - Detailed View
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {riskCategories
                .find(c => c.id === selectedCategory)
                ?.subcategories.map((subcategory) => (
                <div key={subcategory.id} className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-medium">{subcategory.name}</h4>
                        <Badge className={getRiskLevelColor(subcategory.riskLevel)}>
                          {subcategory.riskLevel.toUpperCase()}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {subcategory.description}
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid gap-4 lg:grid-cols-2">
                    <div>
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span>Control Implementation</span>
                        <span className="font-medium">
                          {subcategory.controlsInPlace}/{subcategory.totalControls}
                        </span>
                      </div>
                      <Progress 
                        value={calculateControlsPercentage(
                          subcategory.controlsInPlace, 
                          subcategory.totalControls
                        )} 
                        className="h-2"
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        Last Review: {subcategory.lastReview}
                      </span>
                      <Button variant="outline" size="sm">
                        <Target className="h-4 w-4 mr-1" />
                        Assess
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Risk Taxonomy Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 lg:grid-cols-3">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {riskCategories.reduce((sum, cat) => sum + cat.riskCount, 0)}
              </div>
              <div className="text-sm text-muted-foreground">Total Risks Identified</div>
            </div>
            
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-red-600">
                {riskCategories.reduce((sum, cat) => sum + cat.highRiskCount, 0)}
              </div>
              <div className="text-sm text-muted-foreground">High/Critical Risks</div>
            </div>
            
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-green-600">95%</div>
              <div className="text-sm text-muted-foreground">Framework Coverage</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}