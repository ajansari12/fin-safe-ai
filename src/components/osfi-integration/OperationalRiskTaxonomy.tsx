import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Settings, Monitor, AlertTriangle, TrendingUp, BarChart3 } from "lucide-react";

const OperationalRiskTaxonomy = () => {
  const [activeTab, setActiveTab] = useState("people");

  const riskCategories = {
    people: [
      { name: "Key Person Dependency", level: "High", incidents: 3, controls: 5, impact: "Critical" },
      { name: "Employee Misconduct", level: "Medium", incidents: 1, controls: 8, impact: "Significant" },
      { name: "Unauthorized Activity", level: "Low", incidents: 0, controls: 6, impact: "Minor" },
      { name: "Training & Competency", level: "Medium", incidents: 2, controls: 4, impact: "Moderate" },
      { name: "Succession Planning", level: "High", incidents: 1, controls: 3, impact: "Critical" }
    ],
    process: [
      { name: "Transaction Processing", level: "Medium", incidents: 4, controls: 12, impact: "Significant" },
      { name: "Model Risk", level: "High", incidents: 2, controls: 7, impact: "Critical" },
      { name: "Legal & Regulatory", level: "Medium", incidents: 1, controls: 9, impact: "Significant" },
      { name: "Financial Reporting", level: "Low", incidents: 0, controls: 15, impact: "Minor" },
      { name: "Product Development", level: "Medium", incidents: 3, controls: 6, impact: "Moderate" }
    ],
    systems: [
      { name: "Cyber Security", level: "High", incidents: 5, controls: 18, impact: "Critical" },
      { name: "Technology Failures", level: "Medium", incidents: 8, controls: 14, impact: "Significant" },
      { name: "Data Management", level: "Medium", incidents: 3, controls: 10, impact: "Moderate" },
      { name: "System Integration", level: "Low", incidents: 1, controls: 8, impact: "Minor" },
      { name: "Business Continuity", level: "High", incidents: 2, controls: 12, impact: "Critical" }
    ],
    external: [
      { name: "Natural Disasters", level: "Medium", incidents: 0, controls: 8, impact: "Critical" },
      { name: "Regulatory Changes", level: "High", incidents: 3, controls: 6, impact: "Significant" },
      { name: "Third Party Failures", level: "Medium", incidents: 4, controls: 11, impact: "Significant" },
      { name: "Market Disruption", level: "Low", incidents: 1, controls: 5, impact: "Moderate" },
      { name: "Reputational Risk", level: "Medium", incidents: 2, controls: 7, impact: "Significant" }
    ]
  };

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case "High":
        return "bg-red-100 text-red-800";
      case "Medium":
        return "bg-yellow-100 text-yellow-800";
      case "Low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case "Critical":
        return "bg-red-100 text-red-800";
      case "Significant":
        return "bg-orange-100 text-orange-800";
      case "Moderate":
        return "bg-yellow-100 text-yellow-800";
      case "Minor":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTabIcon = (tab: string) => {
    switch (tab) {
      case "people":
        return <Users className="h-4 w-4" />;
      case "process":
        return <Settings className="h-4 w-4" />;
      case "systems":
        return <Monitor className="h-4 w-4" />;
      case "external":
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const calculateCategoryStats = (risks: any[]) => {
    const totalIncidents = risks.reduce((sum, risk) => sum + risk.incidents, 0);
    const totalControls = risks.reduce((sum, risk) => sum + risk.controls, 0);
    const highRisks = risks.filter(risk => risk.level === "High").length;
    const criticalImpact = risks.filter(risk => risk.impact === "Critical").length;
    
    return { totalIncidents, totalControls, highRisks, criticalImpact };
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">OSFI E-21 Operational Risk Taxonomy</h2>
          <p className="text-muted-foreground">
            Enterprise-wide operational risk categorization aligned with E-21 framework
          </p>
        </div>
        <Badge variant="outline" className="text-sm">
          Principle 2: Framework
        </Badge>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-medium text-blue-900">OSFI E-21 Risk Taxonomy</h3>
            <p className="text-sm text-blue-700 mt-1">
              This taxonomy aligns with OSFI E-21 requirements for enterprise-wide operational risk framework 
              covering people, processes, systems, and external events.
              <br />
              <span className="font-medium">Disclaimer:</span> This tool provides guidance and is not regulatory advice. Consult OSFI directly for official interpretation.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {Object.entries(riskCategories).map(([category, risks]) => {
          const stats = calculateCategoryStats(risks);
          return (
            <Card key={category}>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex items-center gap-2 capitalize">
                  {getTabIcon(category)}
                  {category} Risks
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Total Incidents:</span>
                  <span className="font-medium">{stats.totalIncidents}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Controls:</span>
                  <span className="font-medium">{stats.totalControls}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>High Risk:</span>
                  <span className="font-medium text-red-600">{stats.highRisks}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Critical Impact:</span>
                  <span className="font-medium text-red-600">{stats.criticalImpact}</span>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="people" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            People Risks
          </TabsTrigger>
          <TabsTrigger value="process" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Process Risks
          </TabsTrigger>
          <TabsTrigger value="systems" className="flex items-center gap-2">
            <Monitor className="h-4 w-4" />
            Systems Risks
          </TabsTrigger>
          <TabsTrigger value="external" className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            External Events
          </TabsTrigger>
        </TabsList>

        {Object.entries(riskCategories).map(([category, risks]) => (
          <TabsContent key={category} value={category} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 capitalize">
                  {getTabIcon(category)}
                  {category} Risk Categories
                </CardTitle>
                <CardDescription>
                  Detailed breakdown of {category} operational risks as defined in OSFI E-21 framework
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {risks.map((risk, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <p className="font-medium">{risk.name}</p>
                        <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                          <span>Incidents: {risk.incidents}</span>
                          <span>Controls: {risk.controls}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Risk Level</p>
                          <Badge className={getRiskLevelColor(risk.level)}>
                            {risk.level}
                          </Badge>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">Impact</p>
                          <Badge className={getImpactColor(risk.impact)}>
                            {risk.impact}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 flex gap-2">
                  <Button variant="outline" size="sm">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    View Trends
                  </Button>
                  <Button variant="outline" size="sm">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Risk Assessment
                  </Button>
                  <Button variant="outline" size="sm">
                    Add New Risk
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default OperationalRiskTaxonomy;