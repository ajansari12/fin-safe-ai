import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, FileText, Shield, Zap, Building2, Users, Globe } from "lucide-react";
import { ScenarioTemplate } from "@/services/scenario-templates-service";

interface LibraryTemplate {
  id: string;
  title: string;
  description: string;
  disruption_type: string;
  severity_level: string;
  estimated_duration: string;
  compliance_frameworks: string[];
  icon: React.ReactNode;
}

interface ScenarioTemplateLibraryProps {
  onUseTemplate: (template: ScenarioTemplate) => void;
}

const ScenarioTemplateLibrary: React.FC<ScenarioTemplateLibraryProps> = ({ onUseTemplate }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedSeverity, setSelectedSeverity] = useState<string>("all");

  const templates: LibraryTemplate[] = [
    {
      id: "cyber-ransomware",
      title: "Ransomware Attack",
      description: "Comprehensive ransomware attack scenario targeting critical systems and data encryption",
      disruption_type: "cyber_attack",
      severity_level: "critical",
      estimated_duration: "4-8 hours",
      compliance_frameworks: ["OSFI E-21", "ISO 27001", "NIST"],
      icon: <Shield className="h-6 w-6" />
    },
    {
      id: "natural-flood",
      title: "Flood at Primary Data Center",
      description: "Natural disaster scenario simulating flood damage to primary data center facility",
      disruption_type: "natural_disaster",
      severity_level: "high",
      estimated_duration: "2-4 hours",
      compliance_frameworks: ["OSFI E-21", "BCM Standards"],
      icon: <Globe className="h-6 w-6" />
    },
    {
      id: "pandemic-workforce",
      title: "Pandemic Workforce Reduction",
      description: "Pandemic scenario with 30-50% workforce unavailability affecting operations",
      disruption_type: "pandemic",
      severity_level: "high",
      estimated_duration: "6-12 hours",
      compliance_frameworks: ["OSFI E-21", "WHO Guidelines"],
      icon: <Users className="h-6 w-6" />
    },
    {
      id: "system-core-failure",
      title: "Core Banking System Failure",
      description: "Critical system failure affecting primary banking operations and customer services",
      disruption_type: "system_failure",
      severity_level: "critical",
      estimated_duration: "3-6 hours",
      compliance_frameworks: ["OSFI E-21", "FFIEC"],
      icon: <Building2 className="h-6 w-6" />
    },
    {
      id: "vendor-cloud-outage",
      title: "Major Cloud Provider Outage",
      description: "Third-party vendor scenario with major cloud service provider regional outage",
      disruption_type: "vendor_failure",
      severity_level: "high",
      estimated_duration: "2-4 hours",
      compliance_frameworks: ["OSFI E-21", "Cloud Security"],
      icon: <Zap className="h-6 w-6" />
    },
    {
      id: "power-grid-failure",
      title: "Regional Power Grid Failure",
      description: "Extended power outage affecting primary and backup facilities in the region",
      disruption_type: "power_outage",
      severity_level: "medium",
      estimated_duration: "4-8 hours",
      compliance_frameworks: ["OSFI E-21", "Infrastructure"],
      icon: <Zap className="h-6 w-6" />
    },
    {
      id: "key-personnel-cro",
      title: "Sudden Loss of Chief Risk Officer",
      description: "Key personnel scenario involving sudden unavailability of senior risk management",
      disruption_type: "key_personnel",
      severity_level: "medium",
      estimated_duration: "1-2 hours",
      compliance_frameworks: ["OSFI E-21", "Succession Planning"],
      icon: <Users className="h-6 w-6" />
    },
    {
      id: "cyber-ddos",
      title: "Distributed Denial of Service Attack",
      description: "Cyber attack scenario with coordinated DDoS targeting customer-facing services",
      disruption_type: "cyber_attack",
      severity_level: "medium",
      estimated_duration: "2-4 hours",
      compliance_frameworks: ["OSFI E-21", "NIST Cybersecurity"],
      icon: <Shield className="h-6 w-6" />
    }
  ];

  const disruptionTypes = [
    { value: "all", label: "All Types" },
    { value: "cyber_attack", label: "Cyber Attack" },
    { value: "natural_disaster", label: "Natural Disaster" },
    { value: "pandemic", label: "Pandemic" },
    { value: "system_failure", label: "System Failure" },
    { value: "vendor_failure", label: "Vendor Failure" },
    { value: "power_outage", label: "Power Outage" },
    { value: "key_personnel", label: "Key Personnel" }
  ];

  const severityLevels = [
    { value: "all", label: "All Severities" },
    { value: "low", label: "Low" },
    { value: "medium", label: "Medium" },
    { value: "high", label: "High" },
    { value: "critical", label: "Critical" }
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const convertToScenarioTemplate = (libTemplate: LibraryTemplate): ScenarioTemplate => ({
    id: libTemplate.id,
    org_id: '',
    template_name: libTemplate.title,
    template_description: libTemplate.description,
    crisis_type: libTemplate.disruption_type,
    severity_level: libTemplate.severity_level,
    template_steps: [],
    affected_functions: [],
    estimated_duration_hours: parseInt(libTemplate.estimated_duration.split('-')[0]) || 2,
    recovery_objectives: {},
    success_criteria: `Complete recovery within ${libTemplate.estimated_duration}`,
    is_predefined: true,
    created_by: undefined,
    created_by_name: 'System',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  });

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === "all" || template.disruption_type === selectedType;
    const matchesSeverity = selectedSeverity === "all" || template.severity_level === selectedSeverity;
    
    return matchesSearch && matchesType && matchesSeverity;
  });

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search templates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Select value={selectedType} onValueChange={setSelectedType}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {disruptionTypes.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={selectedSeverity} onValueChange={setSelectedSeverity}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {severityLevels.map((level) => (
              <SelectItem key={level.value} value={level.value}>
                {level.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredTemplates.map((template) => (
          <Card key={template.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    {template.icon}
                  </div>
                  <div>
                    <CardTitle className="text-lg">{template.title}</CardTitle>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline">
                        {template.disruption_type.replace('_', ' ')}
                      </Badge>
                      <Badge className={getSeverityColor(template.severity_level)}>
                        {template.severity_level}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="mb-4">
                {template.description}
              </CardDescription>
              
              <div className="space-y-3">
                <div>
                  <span className="text-sm font-medium">Duration: </span>
                  <span className="text-sm text-muted-foreground">{template.estimated_duration}</span>
                </div>
                
                <div>
                  <span className="text-sm font-medium">Compliance: </span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {template.compliance_frameworks.map((framework) => (
                      <Badge key={framework} variant="secondary" className="text-xs">
                        {framework}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
              
              <Button 
                className="w-full mt-4" 
                onClick={() => onUseTemplate(convertToScenarioTemplate(template))}
              >
                <FileText className="h-4 w-4 mr-2" />
                Use This Template
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredTemplates.length === 0 && (
        <div className="text-center py-12">
          <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Templates Found</h3>
          <p className="text-muted-foreground">
            Try adjusting your search criteria or browse all available templates.
          </p>
        </div>
      )}
    </div>
  );
};

export default ScenarioTemplateLibrary;