import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Shield, 
  AlertTriangle, 
  Users, 
  Activity,
  TrendingUp,
  Eye,
  Settings,
  FileText,
  Network,
  Clock
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface OSFIThirdPartyRiskProps {
  orgId: string;
}

interface ThirdPartyRisk {
  id: string;
  vendor_name: string;
  risk_category: string;
  osfi_category: string;
  risk_level: 'critical' | 'high' | 'medium' | 'low';
  operational_impact: string;
  last_assessment: string;
  next_assessment: string;
  compliance_status: 'compliant' | 'monitoring' | 'action_required';
  dependency_criticality: number;
  resilience_requirements: string[];
  incident_count: number;
}

interface SupplyChainExposure {
  vendor_id: string;
  concentration_risk: number;
  geographic_risk: string;
  systemic_risk: boolean;
  substitutability: 'high' | 'medium' | 'low';
  osfi_alignment: boolean;
}

const OSFIThirdPartyRiskIntegration: React.FC<OSFIThirdPartyRiskProps> = ({ orgId }) => {
  const [thirdPartyRisks, setThirdPartyRisks] = useState<ThirdPartyRisk[]>([]);
  const [supplyChainExposures, setSupplyChainExposures] = useState<SupplyChainExposure[]>([]);
  const [riskMetrics, setRiskMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedRisk, setSelectedRisk] = useState<ThirdPartyRisk | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadOSFIThirdPartyRiskData();
  }, [orgId]);

  const loadOSFIThirdPartyRiskData = async () => {
    try {
      setLoading(true);
      
      // Load third-party risks mapped to OSFI operational risk categories
      const mockThirdPartyRisks: ThirdPartyRisk[] = [
        {
          id: '1',
          vendor_name: 'CloudTech Solutions',
          risk_category: 'Technology Services',
          osfi_category: 'Systems & Technology Failures',
          risk_level: 'critical',
          operational_impact: 'Core payment processing systems',
          last_assessment: '2024-01-15',
          next_assessment: '2024-04-15',
          compliance_status: 'action_required',
          dependency_criticality: 95,
          resilience_requirements: ['24/7 Support', 'Disaster Recovery', 'Security Monitoring'],
          incident_count: 2
        },
        {
          id: '2',
          vendor_name: 'DataSecure Inc',
          risk_category: 'Data Management',
          osfi_category: 'External Fraud',
          risk_level: 'high',
          operational_impact: 'Customer data storage and backup',
          last_assessment: '2024-01-20',
          next_assessment: '2024-07-20',
          compliance_status: 'compliant',
          dependency_criticality: 88,
          resilience_requirements: ['Encryption', 'Access Controls', 'Audit Trails'],
          incident_count: 0
        },
        {
          id: '3',
          vendor_name: 'RegTech Analytics',
          risk_category: 'Regulatory Technology',
          osfi_category: 'Business Process Disruption',
          risk_level: 'medium',
          operational_impact: 'Regulatory reporting and compliance monitoring',
          last_assessment: '2024-01-10',
          next_assessment: '2024-06-10',
          compliance_status: 'monitoring',
          dependency_criticality: 72,
          resilience_requirements: ['Real-time Monitoring', 'Compliance Updates'],
          incident_count: 1
        }
      ];

      const mockSupplyChainExposures: SupplyChainExposure[] = [
        {
          vendor_id: '1',
          concentration_risk: 85,
          geographic_risk: 'High - Single Location',
          systemic_risk: true,
          substitutability: 'low',
          osfi_alignment: false
        },
        {
          vendor_id: '2',
          concentration_risk: 65,
          geographic_risk: 'Medium - Multi-Regional',
          systemic_risk: false,
          substitutability: 'medium',
          osfi_alignment: true
        },
        {
          vendor_id: '3',
          concentration_risk: 45,
          geographic_risk: 'Low - Distributed',
          systemic_risk: false,
          substitutability: 'high',
          osfi_alignment: true
        }
      ];

      const mockRiskMetrics = {
        total_third_parties: 25,
        critical_dependencies: 8,
        high_risk_vendors: 5,
        osfi_compliant_vendors: 18,
        concentration_risk_score: 72,
        average_dependency_criticality: 76.8,
        systemic_risk_vendors: 3,
        substitutability_risk: 68
      };

      setThirdPartyRisks(mockThirdPartyRisks);
      setSupplyChainExposures(mockSupplyChainExposures);
      setRiskMetrics(mockRiskMetrics);
    } catch (error) {
      console.error('Error loading OSFI third-party risk data:', error);
      toast({
        title: "Error",
        description: "Failed to load OSFI third-party risk data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getComplianceColor = (status: string) => {
    switch (status) {
      case 'compliant': return 'bg-green-100 text-green-800';
      case 'monitoring': return 'bg-yellow-100 text-yellow-800';
      case 'action_required': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSubstitutabilityColor = (level: string) => {
    switch (level) {
      case 'high': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid gap-4 md:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold">OSFI Third-Party Risk Integration</h3>
          <p className="text-muted-foreground">
            Third-party risk monitoring aligned with OSFI operational risk framework
          </p>
        </div>
        <Button variant="outline">
          <Settings className="h-4 w-4 mr-2" />
          Configure
        </Button>
      </div>

      {/* OSFI Risk Metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical Dependencies</CardTitle>
            <Users className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{riskMetrics?.critical_dependencies}</div>
            <p className="text-xs text-muted-foreground">
              of {riskMetrics?.total_third_parties} total vendors
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Concentration Risk</CardTitle>
            <Network className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{riskMetrics?.concentration_risk_score}%</div>
            <Progress value={riskMetrics?.concentration_risk_score} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">OSFI Compliant</CardTitle>
            <Shield className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{riskMetrics?.osfi_compliant_vendors}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round((riskMetrics?.osfi_compliant_vendors / riskMetrics?.total_third_parties) * 100)}% compliance rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Systemic Risk</CardTitle>
            <AlertTriangle className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{riskMetrics?.systemic_risk_vendors}</div>
            <p className="text-xs text-muted-foreground">Vendors with systemic impact</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="vendor-risks" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="vendor-risks">Vendor Risks</TabsTrigger>
          <TabsTrigger value="supply-chain">Supply Chain Exposure</TabsTrigger>
          <TabsTrigger value="incident-integration">Incident Integration</TabsTrigger>
        </TabsList>

        <TabsContent value="vendor-risks" className="space-y-4">
          <div className="grid gap-4">
            {thirdPartyRisks.map((risk) => (
              <Card key={risk.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{risk.vendor_name}</CardTitle>
                      <CardDescription>{risk.risk_category} • {risk.osfi_category}</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Badge className={getRiskColor(risk.risk_level)}>
                        {risk.risk_level.toUpperCase()}
                      </Badge>
                      <Badge className={getComplianceColor(risk.compliance_status)}>
                        {risk.compliance_status.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                      <div className="text-sm font-medium">Operational Impact</div>
                      <p className="text-sm text-muted-foreground">{risk.operational_impact}</p>
                      <div className="text-sm">
                        <span className="font-medium">Dependency Criticality: </span>
                        <span className="text-blue-600 font-bold">{risk.dependency_criticality}%</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="text-sm font-medium">Assessment Status</div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>Last Assessment:</span>
                          <span>{format(new Date(risk.last_assessment), 'MMM dd, yyyy')}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Next Due:</span>
                          <span className={new Date(risk.next_assessment) < new Date() ? 'text-red-600' : 'text-muted-foreground'}>
                            {format(new Date(risk.next_assessment), 'MMM dd, yyyy')}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="text-sm font-medium">Risk Indicators</div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span>Incidents (12m):</span>
                          <span className={risk.incident_count > 0 ? 'text-red-600 font-medium' : 'text-green-600'}>
                            {risk.incident_count}
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {risk.resilience_requirements.slice(0, 2).join(', ')}
                          {risk.resilience_requirements.length > 2 && ' +more'}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 mt-4 pt-4 border-t">
                    <Button size="sm" variant="outline" onClick={() => setSelectedRisk(risk)}>
                      <Eye className="h-3 w-3 mr-1" />
                      Details
                    </Button>
                    <Button size="sm" variant="outline">
                      <Activity className="h-3 w-3 mr-1" />
                      Monitor
                    </Button>
                    <Button size="sm" variant="outline">
                      <FileText className="h-3 w-3 mr-1" />
                      Assess
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="supply-chain" className="space-y-4">
          <div className="grid gap-4">
            {supplyChainExposures.map((exposure, index) => {
              const vendor = thirdPartyRisks.find(v => v.id === exposure.vendor_id);
              if (!vendor) return null;

              return (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{vendor.vendor_name}</span>
                      <div className="flex gap-2">
                        {exposure.systemic_risk && (
                          <Badge className="bg-purple-100 text-purple-800">Systemic Risk</Badge>
                        )}
                        {exposure.osfi_alignment ? (
                          <Badge className="bg-green-100 text-green-800">OSFI Aligned</Badge>
                        ) : (
                          <Badge className="bg-red-100 text-red-800">Action Required</Badge>
                        )}
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-3">
                      <div className="space-y-3">
                        <div>
                          <div className="text-sm font-medium">Concentration Risk</div>
                          <div className="flex items-center gap-2">
                            <Progress value={exposure.concentration_risk} className="flex-1" />
                            <span className="text-sm font-bold">{exposure.concentration_risk}%</span>
                          </div>
                        </div>
                        <div>
                          <div className="text-sm font-medium">Geographic Risk</div>
                          <div className="text-sm text-muted-foreground">{exposure.geographic_risk}</div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <div className="text-sm font-medium">Substitutability</div>
                          <Badge className={getSubstitutabilityColor(exposure.substitutability)}>
                            {exposure.substitutability.toUpperCase()}
                          </Badge>
                        </div>
                        <div>
                          <div className="text-sm font-medium">Systemic Impact</div>
                          <div className="flex items-center gap-2">
                            {exposure.systemic_risk ? (
                              <AlertTriangle className="h-4 w-4 text-red-600" />
                            ) : (
                              <Shield className="h-4 w-4 text-green-600" />
                            )}
                            <span className={exposure.systemic_risk ? 'text-red-600' : 'text-green-600'}>
                              {exposure.systemic_risk ? 'High Impact' : 'Contained'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div>
                          <div className="text-sm font-medium">OSFI Alignment</div>
                          <div className="flex items-center gap-2">
                            {exposure.osfi_alignment ? (
                              <Shield className="h-4 w-4 text-green-600" />
                            ) : (
                              <AlertTriangle className="h-4 w-4 text-red-600" />
                            )}
                            <span className={exposure.osfi_alignment ? 'text-green-600' : 'text-red-600'}>
                              {exposure.osfi_alignment ? 'Compliant' : 'Needs Review'}
                            </span>
                          </div>
                        </div>
                        <div>
                          <div className="text-sm font-medium">Risk Mitigation</div>
                          <Button size="sm" variant="outline" className="w-full">
                            <Settings className="h-3 w-3 mr-1" />
                            Configure
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="incident-integration" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Third-Party Incident Integration with OSFI Monitoring</CardTitle>
              <CardDescription>
                Real-time integration of third-party incidents with operational risk monitoring
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-sm font-medium">CloudTech Solutions - Service Outage</div>
                      <Badge className="bg-red-100 text-red-800">Critical</Badge>
                    </div>
                    <div className="text-xs text-muted-foreground mb-2">Detected: 2 hours ago</div>
                    <div className="text-sm">
                      <span className="font-medium">OSFI Category: </span>
                      Systems & Technology Failures
                    </div>
                    <div className="flex gap-2 mt-2">
                      <Button size="sm" variant="outline">Escalate</Button>
                      <Button size="sm" variant="outline">Monitor</Button>
                    </div>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-sm font-medium">DataSecure Inc - Security Alert</div>
                      <Badge className="bg-yellow-100 text-yellow-800">Medium</Badge>
                    </div>
                    <div className="text-xs text-muted-foreground mb-2">Detected: 4 hours ago</div>
                    <div className="text-sm">
                      <span className="font-medium">OSFI Category: </span>
                      External Fraud
                    </div>
                    <div className="flex gap-2 mt-2">
                      <Button size="sm" variant="outline">Review</Button>
                      <Button size="sm" variant="outline">Acknowledge</Button>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <Card className="border-0 bg-blue-50">
                    <CardContent className="p-4">
                      <div className="text-sm font-medium mb-2">OSFI Integration Status</div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Real-time Monitoring:</span>
                          <span className="text-green-600 font-medium">Active</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Auto-categorization:</span>
                          <span className="text-green-600 font-medium">Enabled</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Risk Appetite Integration:</span>
                          <span className="text-green-600 font-medium">Connected</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Board Reporting:</span>
                          <span className="text-orange-600 font-medium">Configured</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-0 bg-green-50">
                    <CardContent className="p-4">
                      <div className="text-sm font-medium mb-2">Automated Actions</div>
                      <div className="space-y-1 text-xs text-muted-foreground">
                        <div>• Incident classification by OSFI category</div>
                        <div>• Automated risk appetite breach detection</div>
                        <div>• Real-time dashboard updates</div>
                        <div>• Stakeholder notification triggers</div>
                        <div>• Regulatory reporting preparation</div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Risk Details Dialog */}
      {selectedRisk && (
        <Dialog open={!!selectedRisk} onOpenChange={() => setSelectedRisk(null)}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>{selectedRisk.vendor_name} - OSFI Risk Assessment</DialogTitle>
              <DialogDescription>
                Detailed third-party risk analysis aligned with OSFI operational risk framework
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Risk Profile</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span>Risk Level:</span>
                        <Badge className={getRiskColor(selectedRisk.risk_level)}>
                          {selectedRisk.risk_level.toUpperCase()}
                        </Badge>
                      </div>
                      <div className="flex justify-between">
                        <span>OSFI Category:</span>
                        <span className="font-medium">{selectedRisk.osfi_category}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Dependency Criticality:</span>
                        <span className="font-medium">{selectedRisk.dependency_criticality}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Incident Count (12m):</span>
                        <span className="font-medium">{selectedRisk.incident_count}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Resilience Requirements</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {selectedRisk.resilience_requirements.map((req, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <Shield className="h-4 w-4 text-green-600" />
                          <span className="text-sm">{req}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default OSFIThirdPartyRiskIntegration;