
import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Shield, 
  AlertTriangle, 
  Zap, 
  Globe, 
  Network, 
  Building, 
  Users, 
  Search,
  Download,
  Star,
  Clock
} from "lucide-react";
import { getScenarioTemplates, getPredefinedTemplates } from "@/services/scenario-templates-service";

interface ScenarioTemplateLibraryProps {
  onUseTemplate: (template: any) => void;
}

const PREDEFINED_TEMPLATES = [
  {
    id: 'cyber-ransomware',
    name: 'Ransomware Attack Response',
    description: 'Comprehensive ransomware attack simulation covering detection, containment, and recovery',
    type: 'Cyber Attack',
    severity: 'critical',
    duration: '4-8 hours',
    icon: Shield,
    tags: ['OSFI E-21', 'Cyber Security', 'Critical'],
    steps: [
      'Incident Detection and Analysis',
      'Isolation and Containment',
      'Stakeholder Notification',
      'Recovery Planning',
      'System Restoration',
      'Post-Incident Review'
    ],
    affectedSystems: ['Trading Systems', 'Customer Portals', 'Internal Networks'],
    successCriteria: 'Systems restored within RTO, no data loss, all stakeholders notified',
    estimatedParticipants: 8,
    regulatoryFocus: 'OSFI E-21 Section 4.2 - Cyber Resilience'
  },
  {
    id: 'natural-disaster',
    name: 'Natural Disaster Site Recovery',
    description: 'Major natural disaster affecting primary business location',
    type: 'Natural Disaster',
    severity: 'high',
    duration: '24-72 hours',
    icon: AlertTriangle,
    tags: ['OSFI E-21', 'Business Continuity', 'Site Recovery'],
    steps: [
      'Emergency Response Activation',
      'Personnel Safety Assessment',
      'Facility Damage Evaluation',
      'Alternate Site Activation',
      'Critical Operations Migration',
      'Customer Communication'
    ],
    affectedSystems: ['Primary Data Center', 'Office Facilities', 'Communications'],
    successCriteria: 'Operations resumed at alternate site within 24 hours',
    estimatedParticipants: 12,
    regulatoryFocus: 'OSFI E-21 Section 4.1 - Operational Resilience'
  },
  {
    id: 'system-failure',
    name: 'Core System Failure Recovery',
    description: 'Critical system failure requiring immediate failover procedures',
    type: 'System Failure',
    severity: 'high',
    duration: '2-6 hours',
    icon: Zap,
    tags: ['OSFI E-21', 'Technology', 'System Recovery'],
    steps: [
      'System Health Assessment',
      'Failure Root Cause Analysis',
      'Failover Activation',
      'Data Integrity Verification',
      'Service Restoration',
      'Performance Monitoring'
    ],
    affectedSystems: ['Core Banking', 'Payment Processing', 'Risk Systems'],
    successCriteria: 'System restored with zero data loss within RTO',
    estimatedParticipants: 6,
    regulatoryFocus: 'OSFI E-21 Section 4.3 - Technology Risk Management'
  },
  {
    id: 'pandemic-response',
    name: 'Pandemic Business Continuity',
    description: 'Pandemic scenario affecting workforce availability and operations',
    type: 'Pandemic',
    severity: 'medium',
    duration: '2-4 weeks',
    icon: Globe,
    tags: ['OSFI E-21', 'Workforce', 'Long-term'],
    steps: [
      'Workforce Impact Assessment',
      'Remote Work Activation',
      'Service Level Adjustment',
      'Vendor Management',
      'Customer Communication',
      'Regulatory Reporting'
    ],
    affectedSystems: ['Workforce', 'Operations', 'Customer Service'],
    successCriteria: 'Maintain 80% service levels with reduced workforce',
    estimatedParticipants: 15,
    regulatoryFocus: 'OSFI E-21 Section 4.4 - Third Party Risk Management'
  },
  {
    id: 'third-party-failure',
    name: 'Critical Third-Party Service Failure',
    description: 'Major third-party service provider outage affecting operations',
    type: 'Third-Party Failure',
    severity: 'high',
    duration: '6-12 hours',
    icon: Network,
    tags: ['OSFI E-21', 'Third-Party', 'Dependencies'],
    steps: [
      'Service Impact Assessment',
      'Alternative Provider Activation',
      'Workaround Implementation',
      'Customer Impact Mitigation',
      'Vendor Communication',
      'Service Level Monitoring'
    ],
    affectedSystems: ['Payment Processing', 'Data Services', 'Cloud Infrastructure'],
    successCriteria: 'Alternative services activated within 2 hours',
    estimatedParticipants: 10,
    regulatoryFocus: 'OSFI E-21 Section 4.4 - Third Party Risk Management'
  },
  {
    id: 'regulatory-action',
    name: 'Regulatory Intervention Response',
    description: 'Response to regulatory action or investigation',
    type: 'Regulatory Action',
    severity: 'medium',
    duration: '1-3 days',
    icon: Building,
    tags: ['OSFI E-21', 'Compliance', 'Regulatory'],
    steps: [
      'Regulatory Notice Assessment',
      'Legal Team Activation',
      'Documentation Gathering',
      'Response Strategy Development',
      'Implementation Coordination',
      'Ongoing Monitoring'
    ],
    affectedSystems: ['Compliance Systems', 'Reporting', 'Documentation'],
    successCriteria: 'Full compliance response within regulatory timeline',
    estimatedParticipants: 8,
    regulatoryFocus: 'OSFI E-21 Section 3 - Governance and Risk Management'
  }
];

const ScenarioTemplateLibrary: React.FC<ScenarioTemplateLibraryProps> = ({
  onUseTemplate
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [severityFilter, setSeverityFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("predefined");

  const { data: customTemplates = [] } = useQuery({
    queryKey: ['scenarioTemplates'],
    queryFn: getScenarioTemplates
  });

  const filteredTemplates = PREDEFINED_TEMPLATES.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = typeFilter === "all" || template.type === typeFilter;
    const matchesSeverity = severityFilter === "all" || template.severity === severityFilter;
    
    return matchesSearch && matchesType && matchesSeverity;
  });

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'secondary';
      case 'medium': return 'default';
      case 'high': return 'destructive';
      case 'critical': return 'destructive';
      default: return 'secondary';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Cyber Attack': return Shield;
      case 'Natural Disaster': return AlertTriangle;
      case 'System Failure': return Zap;
      case 'Pandemic': return Globe;
      case 'Third-Party Failure': return Network;
      case 'Regulatory Action': return Building;
      default: return AlertTriangle;
    }
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Template Library</CardTitle>
          <CardDescription>
            Choose from pre-built scenario templates or browse custom templates
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search templates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="Cyber Attack">Cyber Attack</SelectItem>
                <SelectItem value="Natural Disaster">Natural Disaster</SelectItem>
                <SelectItem value="System Failure">System Failure</SelectItem>
                <SelectItem value="Third-Party Failure">Third-Party Failure</SelectItem>
                <SelectItem value="Pandemic">Pandemic</SelectItem>
                <SelectItem value="Regulatory Action">Regulatory Action</SelectItem>
              </SelectContent>
            </Select>

            <Select value={severityFilter} onValueChange={setSeverityFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Severities" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severities</SelectItem>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>

            <div className="text-sm text-muted-foreground flex items-center">
              {filteredTemplates.length} templates found
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Template Categories */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="predefined">OSFI E-21 Templates</TabsTrigger>
          <TabsTrigger value="custom">Custom Templates</TabsTrigger>
          <TabsTrigger value="favorites">Favorites</TabsTrigger>
        </TabsList>

        <TabsContent value="predefined" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredTemplates.map((template) => {
              const IconComponent = template.icon;
              return (
                <Card key={template.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <IconComponent className="h-6 w-6 text-primary" />
                        <div>
                          <CardTitle className="text-lg">{template.name}</CardTitle>
                          <CardDescription className="mt-1">
                            {template.description}
                          </CardDescription>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onUseTemplate(template)}
                      >
                        Use Template
                      </Button>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    {/* Template Badges */}
                    <div className="flex flex-wrap gap-2">
                      <Badge variant={getSeverityColor(template.severity)}>
                        {template.severity}
                      </Badge>
                      <Badge variant="outline">{template.type}</Badge>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {template.duration}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Users className="h-3 w-3" />
                        {template.estimatedParticipants} participants
                      </div>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1">
                      {template.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>

                    {/* Test Steps Preview */}
                    <div>
                      <h4 className="font-medium text-sm mb-2">Test Steps ({template.steps.length})</h4>
                      <div className="text-xs text-muted-foreground space-y-1">
                        {template.steps.slice(0, 3).map((step, index) => (
                          <div key={index}>• {step}</div>
                        ))}
                        {template.steps.length > 3 && (
                          <div>... and {template.steps.length - 3} more</div>
                        )}
                      </div>
                    </div>

                    {/* Affected Systems */}
                    <div>
                      <h4 className="font-medium text-sm mb-2">Affected Systems</h4>
                      <div className="flex flex-wrap gap-1">
                        {template.affectedSystems.slice(0, 3).map((system, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {system}
                          </Badge>
                        ))}
                        {template.affectedSystems.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{template.affectedSystems.length - 3} more
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Regulatory Focus */}
                    <div className="p-3 bg-muted rounded-lg">
                      <h4 className="font-medium text-sm mb-1">Regulatory Focus</h4>
                      <p className="text-xs text-muted-foreground">{template.regulatoryFocus}</p>
                    </div>

                    {/* Success Criteria */}
                    <div>
                      <h4 className="font-medium text-sm mb-1">Success Criteria</h4>
                      <p className="text-xs text-muted-foreground">{template.successCriteria}</p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="custom">
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">
                No custom templates found. Create your first custom template to get started.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="favorites">
          <Card>
            <CardContent className="p-8 text-center">
              <div className="flex flex-col items-center gap-3">
                <Star className="h-12 w-12 text-muted-foreground" />
                <p className="text-muted-foreground">
                  No favorite templates yet. Star templates to add them to your favorites.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ScenarioTemplateLibrary;
