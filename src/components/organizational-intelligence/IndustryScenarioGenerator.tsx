
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TestTube, 
  Zap,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Clock,
  PlayCircle,
  Settings,
  Brain
} from 'lucide-react';

interface IndustryScenario {
  id: string;
  scenario_name: string;
  sector: string;
  scenario_type: 'operational' | 'cyber' | 'financial' | 'regulatory';
  severity_level: 'low' | 'medium' | 'high' | 'critical';
  scenario_description: string;
  scenario_parameters: Record<string, any>;
  expected_outcomes: string[];
  testing_procedures: string[];
  success_criteria: string[];
  regulatory_basis?: string;
  frequency: 'monthly' | 'quarterly' | 'annual';
  last_executed_at?: string;
  next_execution_date?: string;
  is_active: boolean;
}

interface EmergingRiskScenario {
  id: string;
  scenario_name: string;
  risk_category: string;
  emergence_indicators: string[];
  scenario_description: string;
  ai_generated: boolean;
  confidence_score: number;
  scenario_parameters: Record<string, any>;
  potential_impact_assessment: Record<string, any>;
  recommended_responses: string[];
  monitoring_metrics: string[];
  trigger_conditions: string[];
  review_frequency: 'weekly' | 'monthly' | 'quarterly';
  last_reviewed_at?: string;
  status: 'draft' | 'active' | 'archived';
}

interface IndustryScenarioGeneratorProps {
  orgId: string;
}

const IndustryScenarioGenerator: React.FC<IndustryScenarioGeneratorProps> = ({ orgId }) => {
  const [activeTab, setActiveTab] = useState('industry');
  const [industryScenarios, setIndustryScenarios] = useState<IndustryScenario[]>([]);
  const [emergingScenarios, setEmergingScenarios] = useState<EmergingRiskScenario[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadScenarioData();
  }, [orgId]);

  const loadScenarioData = async () => {
    setLoading(true);
    try {
      // Mock data for industry scenarios
      const mockIndustryScenarios: IndustryScenario[] = [
        {
          id: '1',
          scenario_name: 'Core Banking System Outage',
          sector: 'banking',
          scenario_type: 'operational',
          severity_level: 'critical',
          scenario_description: 'Complete failure of core banking system affecting all customer transactions',
          scenario_parameters: {
            duration: '4 hours',
            affected_systems: ['core_banking', 'atm_network', 'mobile_app'],
            customer_impact: 'high'
          },
          expected_outcomes: [
            'Transaction processing halted',
            'Customer complaints increase',
            'Regulatory reporting required'
          ],
          testing_procedures: [
            'Simulate system failure',
            'Activate backup systems',
            'Test customer communication',
            'Verify regulatory notifications'
          ],
          success_criteria: [
            'Backup system activated within 30 minutes',
            'Customer notification sent within 15 minutes',
            'Regulatory notification within 1 hour'
          ],
          regulatory_basis: 'OSFI E-21 Section 4.2',
          frequency: 'quarterly',
          last_executed_at: '2024-01-10T09:00:00Z',
          next_execution_date: '2024-04-10',
          is_active: true
        },
        {
          id: '2',
          scenario_name: 'Cyber Security Breach',
          sector: 'banking',
          scenario_type: 'cyber',
          severity_level: 'high',
          scenario_description: 'Unauthorized access to customer data through phishing attack',
          scenario_parameters: {
            attack_vector: 'phishing',
            data_compromised: 'customer_pii',
            breach_scope: '10000_customers'
          },
          expected_outcomes: [
            'Data breach notification required',
            'Privacy regulator contact needed',
            'Customer impact assessment'
          ],
          testing_procedures: [
            'Simulate phishing attack',
            'Test incident response team',
            'Verify data breach protocols',
            'Test customer notification system'
          ],
          success_criteria: [
            'Incident detected within 2 hours',
            'Response team activated within 1 hour',
            'Privacy commissioner notified within 72 hours'
          ],
          regulatory_basis: 'PIPEDA Section 10.1',
          frequency: 'quarterly',
          is_active: true
        }
      ];

      const mockEmergingScenarios: EmergingRiskScenario[] = [
        {
          id: '1',
          scenario_name: 'Quantum Computing Threat to Encryption',
          risk_category: 'technology',
          emergence_indicators: [
            'Quantum computing advancements',
            'Cryptographic vulnerability reports',
            'Industry security bulletins'
          ],
          scenario_description: 'Quantum computing breakthrough renders current encryption methods vulnerable',
          ai_generated: true,
          confidence_score: 0.75,
          scenario_parameters: {
            threat_timeline: '5-10 years',
            affected_systems: 'all_encrypted_data',
            mitigation_complexity: 'high'
          },
          potential_impact_assessment: {
            financial_impact: 'very_high',
            operational_impact: 'critical',
            regulatory_impact: 'high',
            reputational_impact: 'high'
          },
          recommended_responses: [
            'Monitor quantum computing developments',
            'Evaluate post-quantum cryptography',
            'Develop migration timeline',
            'Engage with security vendors'
          ],
          monitoring_metrics: [
            'Quantum computing research progress',
            'Cryptographic standard updates',
            'Vendor solution availability'
          ],
          trigger_conditions: [
            'Major quantum breakthrough announced',
            'NIST post-quantum standards finalized',
            'First commercial quantum threat detected'
          ],
          review_frequency: 'quarterly',
          last_reviewed_at: '2024-01-15T10:00:00Z',
          status: 'active'
        },
        {
          id: '2',
          scenario_name: 'Climate-Related Supply Chain Disruption',
          risk_category: 'environmental',
          emergence_indicators: [
            'Extreme weather events increasing',
            'Supply chain vendor locations',
            'Climate risk assessments'
          ],
          scenario_description: 'Major climate event disrupts critical technology suppliers',
          ai_generated: true,
          confidence_score: 0.85,
          scenario_parameters: {
            event_type: 'extreme_weather',
            affected_regions: ['asia_pacific'],
            duration: '2-6 weeks'
          },
          potential_impact_assessment: {
            financial_impact: 'high',
            operational_impact: 'medium',
            regulatory_impact: 'low',
            reputational_impact: 'medium'
          },
          recommended_responses: [
            'Diversify supplier base',
            'Build inventory buffers',
            'Develop alternative sourcing',
            'Monitor climate risks'
          ],
          monitoring_metrics: [
            'Supplier geographic concentration',
            'Climate risk scores',
            'Inventory levels'
          ],
          trigger_conditions: [
            'Major weather event forecast',
            'Supplier region risk alert',
            'Supply chain disruption detected'
          ],
          review_frequency: 'monthly',
          status: 'draft'
        }
      ];

      setIndustryScenarios(mockIndustryScenarios);
      setEmergingScenarios(mockEmergingScenarios);
    } catch (error) {
      console.error('Error loading scenario data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'draft': return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'archived': return <AlertTriangle className="h-4 w-4 text-gray-500" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
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
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <TestTube className="h-8 w-8 text-purple-500" />
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Scenario Testing Framework</h2>
            <p className="text-muted-foreground">
              Industry-specific and AI-generated scenario testing for comprehensive risk assessment
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            Generate AI Scenario
          </Button>
          <Button className="flex items-center gap-2">
            <PlayCircle className="h-4 w-4" />
            Execute Test
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Industry Scenarios</p>
                <p className="text-2xl font-bold">{industryScenarios.filter(s => s.is_active).length}</p>
              </div>
              <TestTube className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">AI-Generated</p>
                <p className="text-2xl font-bold">{emergingScenarios.filter(s => s.ai_generated).length}</p>
              </div>
              <Brain className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Critical Severity</p>
                <p className="text-2xl font-bold text-red-600">
                  {industryScenarios.filter(s => s.severity_level === 'critical').length}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Scheduled Tests</p>
                <p className="text-2xl font-bold">8</p>
              </div>
              <Calendar className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="industry">Industry Scenarios</TabsTrigger>
          <TabsTrigger value="emerging">Emerging Risks</TabsTrigger>
          <TabsTrigger value="osfi">OSFI E-21</TabsTrigger>
          <TabsTrigger value="execution">Execution Schedule</TabsTrigger>
        </TabsList>

        <TabsContent value="industry" className="space-y-4">
          <div className="space-y-4">
            {industryScenarios.map((scenario) => (
              <Card key={scenario.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{scenario.scenario_name}</CardTitle>
                      <p className="text-muted-foreground mt-1">{scenario.scenario_description}</p>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant="outline">{scenario.sector}</Badge>
                      <Badge className={getSeverityColor(scenario.severity_level)}>
                        {scenario.severity_level}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Scenario Type:</span>
                      <div className="font-medium capitalize">{scenario.scenario_type}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Testing Frequency:</span>
                      <div className="font-medium capitalize">{scenario.frequency}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Regulatory Basis:</span>
                      <div className="font-medium">{scenario.regulatory_basis || 'Internal'}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Next Execution:</span>
                      <div className="font-medium">
                        {scenario.next_execution_date 
                          ? new Date(scenario.next_execution_date).toLocaleDateString() 
                          : 'Not scheduled'
                        }
                      </div>
                    </div>
                  </div>

                  <div>
                    <span className="text-sm text-muted-foreground">Success Criteria:</span>
                    <div className="mt-2 space-y-1">
                      {scenario.success_criteria.map((criteria, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm">
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          {criteria}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">View Details</Button>
                    <Button size="sm" className="flex items-center gap-2">
                      <PlayCircle className="h-4 w-4" />
                      Execute Now
                    </Button>
                    <Button size="sm" variant="outline">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="emerging" className="space-y-4">
          <div className="space-y-4">
            {emergingScenarios.map((scenario) => (
              <Card key={scenario.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Brain className="h-6 w-6 text-purple-500" />
                      <div>
                        <CardTitle className="text-lg">{scenario.scenario_name}</CardTitle>
                        <p className="text-muted-foreground mt-1">{scenario.scenario_description}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {getStatusIcon(scenario.status)}
                      <Badge className="bg-purple-100 text-purple-800">
                        AI Generated
                      </Badge>
                      <Badge variant="outline">
                        {(scenario.confidence_score * 100).toFixed(0)}% confidence
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Risk Category:</span>
                      <div className="font-medium capitalize">{scenario.risk_category}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Review Frequency:</span>
                      <div className="font-medium capitalize">{scenario.review_frequency}</div>
                    </div>
                  </div>

                  <div>
                    <span className="text-sm text-muted-foreground">Emergence Indicators:</span>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {scenario.emergence_indicators.map((indicator, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {indicator}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <span className="text-sm text-muted-foreground">Recommended Responses:</span>
                    <div className="mt-2 space-y-1">
                      {scenario.recommended_responses.slice(0, 3).map((response, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm">
                          <Zap className="h-4 w-4 text-blue-500" />
                          {response}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">Review Scenario</Button>
                    <Button size="sm">Activate Monitoring</Button>
                    <Button size="sm" variant="outline">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="osfi" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>OSFI E-21 Compliance Scenarios</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <TestTube className="h-12 w-12 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">OSFI E-21 Scenario Library</h3>
                <p>Regulatory-compliant scenario testing for Canadian financial institutions</p>
                <Button className="mt-4">
                  Load OSFI Scenarios
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="execution" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Scenario Execution Schedule</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Automated Execution Schedule</h3>
                <p>Configure and monitor automated scenario testing schedules</p>
                <Button className="mt-4">
                  <Calendar className="h-4 w-4 mr-2" />
                  Configure Schedule
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default IndustryScenarioGenerator;
