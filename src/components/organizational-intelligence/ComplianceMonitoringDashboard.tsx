
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Shield, 
  AlertTriangle,
  CheckCircle,
  Clock,
  FileText,
  Settings,
  Bell,
  TrendingUp
} from 'lucide-react';

interface RegulatoryIntelligence {
  id: string;
  regulation_name: string;
  jurisdiction: string;
  applicable_sectors: string[];
  regulation_type: 'mandatory' | 'recommended' | 'best_practice';
  effective_date?: string;
  last_updated: string;
  auto_identified: boolean;
  confidence_score: number;
  regulatory_body?: string;
  description?: string;
  is_active: boolean;
}

interface ComplianceViolation {
  id: string;
  violation_type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  violation_description: string;
  detected_at: string;
  remediation_status: 'open' | 'in_progress' | 'resolved';
  remediation_deadline?: string;
  assigned_to_name?: string;
}

interface ComplianceMonitoringDashboardProps {
  orgId: string;
}

const ComplianceMonitoringDashboard: React.FC<ComplianceMonitoringDashboardProps> = ({ orgId }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [regulations, setRegulations] = useState<RegulatoryIntelligence[]>([]);
  const [violations, setViolations] = useState<ComplianceViolation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadComplianceData();
  }, [orgId]);

  const loadComplianceData = async () => {
    setLoading(true);
    try {
      // Mock data for now - in production, this would fetch from Supabase
      const mockRegulations: RegulatoryIntelligence[] = [
        {
          id: '1',
          regulation_name: 'OSFI E-21 Operational Resilience',
          jurisdiction: 'Canada',
          applicable_sectors: ['banking', 'insurance'],
          regulation_type: 'mandatory',
          effective_date: '2024-01-01',
          last_updated: '2024-01-15',
          auto_identified: true,
          confidence_score: 0.95,
          regulatory_body: 'OSFI',
          description: 'Operational resilience framework for federally regulated financial institutions',
          is_active: true
        },
        {
          id: '2',
          regulation_name: 'PIPEDA Privacy Requirements',
          jurisdiction: 'Canada',
          applicable_sectors: ['banking', 'fintech', 'insurance'],
          regulation_type: 'mandatory',
          effective_date: '2001-01-01',
          last_updated: '2023-12-01',
          auto_identified: true,
          confidence_score: 0.90,
          regulatory_body: 'Privacy Commissioner of Canada',
          description: 'Personal Information Protection and Electronic Documents Act compliance',
          is_active: true
        }
      ];

      const mockViolations: ComplianceViolation[] = [
        {
          id: '1',
          violation_type: 'Data Retention Policy Gap',
          severity: 'medium',
          violation_description: 'Customer data retention period exceeds regulatory requirements',
          detected_at: '2024-01-18T10:00:00Z',
          remediation_status: 'in_progress',
          remediation_deadline: '2024-02-15',
          assigned_to_name: 'Compliance Team'
        },
        {
          id: '2',
          violation_type: 'Incident Response Time',
          severity: 'high',
          violation_description: 'Critical incident response exceeded 4-hour regulatory requirement',
          detected_at: '2024-01-17T14:30:00Z',
          remediation_status: 'open',
          remediation_deadline: '2024-01-25',
          assigned_to_name: 'Risk Manager'
        }
      ];

      setRegulations(mockRegulations);
      setViolations(mockViolations);
    } catch (error) {
      console.error('Error loading compliance data:', error);
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
      case 'resolved': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'in_progress': return <Clock className="h-4 w-4 text-blue-500" />;
      case 'open': return <AlertTriangle className="h-4 w-4 text-red-500" />;
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
          <Shield className="h-8 w-8 text-blue-500" />
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Compliance Monitoring</h2>
            <p className="text-muted-foreground">
              Automated regulatory compliance monitoring and violation tracking
            </p>
          </div>
        </div>
        <Button className="flex items-center gap-2">
          <Settings className="h-4 w-4" />
          Configure Rules
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Regulations</p>
                <p className="text-2xl font-bold">{regulations.filter(r => r.is_active).length}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Open Violations</p>
                <p className="text-2xl font-bold text-red-600">
                  {violations.filter(v => v.remediation_status === 'open').length}
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
                <p className="text-sm font-medium text-muted-foreground">In Progress</p>
                <p className="text-2xl font-bold text-blue-600">
                  {violations.filter(v => v.remediation_status === 'in_progress').length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Compliance Score</p>
                <p className="text-2xl font-bold text-green-600">87%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="regulations">Regulations</TabsTrigger>
          <TabsTrigger value="violations">Violations</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoring Rules</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Recent Violations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {violations.slice(0, 3).map((violation) => (
                    <div key={violation.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                      {getStatusIcon(violation.remediation_status)}
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{violation.violation_type}</span>
                          <Badge className={getSeverityColor(violation.severity)}>
                            {violation.severity}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {violation.violation_description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Regulatory Coverage</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {regulations.slice(0, 3).map((regulation) => (
                    <div key={regulation.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="font-medium">{regulation.regulation_name}</div>
                        <div className="text-sm text-muted-foreground">{regulation.jurisdiction}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">
                          {(regulation.confidence_score * 100).toFixed(0)}% confidence
                        </Badge>
                        {regulation.auto_identified && (
                          <Badge className="bg-blue-100 text-blue-800">AI Identified</Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="regulations" className="space-y-4">
          <div className="space-y-4">
            {regulations.map((regulation) => (
              <Card key={regulation.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg">{regulation.regulation_name}</CardTitle>
                      <p className="text-muted-foreground mt-1">{regulation.description}</p>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant="outline">{regulation.jurisdiction}</Badge>
                      <Badge className={
                        regulation.regulation_type === 'mandatory' 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-blue-100 text-blue-800'
                      }>
                        {regulation.regulation_type}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Regulatory Body:</span>
                      <div className="font-medium">{regulation.regulatory_body}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Effective Date:</span>
                      <div className="font-medium">
                        {regulation.effective_date ? new Date(regulation.effective_date).toLocaleDateString() : 'N/A'}
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Applicable Sectors:</span>
                      <div className="flex gap-1 mt-1">
                        {regulation.applicable_sectors.map(sector => (
                          <Badge key={sector} variant="outline" className="text-xs">
                            {sector}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">AI Confidence:</span>
                      <div className="font-medium">{(regulation.confidence_score * 100).toFixed(0)}%</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="violations" className="space-y-4">
          <div className="space-y-4">
            {violations.map((violation) => (
              <Card key={violation.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(violation.remediation_status)}
                      <div>
                        <CardTitle className="text-lg">{violation.violation_type}</CardTitle>
                        <p className="text-muted-foreground mt-1">{violation.violation_description}</p>
                      </div>
                    </div>
                    <Badge className={getSeverityColor(violation.severity)}>
                      {violation.severity}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Detected:</span>
                      <div className="font-medium">
                        {new Date(violation.detected_at).toLocaleDateString()}
                      </div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Assigned To:</span>
                      <div className="font-medium">{violation.assigned_to_name || 'Unassigned'}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Deadline:</span>
                      <div className="font-medium">
                        {violation.remediation_deadline 
                          ? new Date(violation.remediation_deadline).toLocaleDateString() 
                          : 'Not set'
                        }
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button size="sm" variant="outline">View Details</Button>
                    <Button size="sm">Update Status</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Monitoring Rules Configuration</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Settings className="h-12 w-12 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Configure Monitoring Rules</h3>
                <p>Set up automated compliance monitoring rules and validation criteria</p>
                <Button className="mt-4">
                  <Bell className="h-4 w-4 mr-2" />
                  Add Monitoring Rule
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ComplianceMonitoringDashboard;
