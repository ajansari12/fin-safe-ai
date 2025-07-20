import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Shield, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  Clock,
  Download,
  Calendar,
  Flag,
  Building2,
  Users,
  AlertCircle
} from 'lucide-react';

interface ComplianceRequirement {
  id: string;
  regulation: string;
  requirement: string;
  description: string;
  applicability: 'all_vendors' | 'critical_vendors' | 'technology_vendors' | 'outsourcing_vendors';
  priority: 'high' | 'medium' | 'low';
  status: 'compliant' | 'non_compliant' | 'pending_review' | 'not_applicable';
  lastAssessed: Date;
  nextReview: Date;
  evidence: string[];
  assignedTo: string;
}

interface VendorCompliance {
  id: string;
  vendorName: string;
  vendorType: string;
  overallScore: number;
  requirements: ComplianceRequirement[];
  riskRating: 'low' | 'medium' | 'high' | 'critical';
  lastAudit: Date;
  nextAudit: Date;
  auditFrequency: 'quarterly' | 'semi_annual' | 'annual';
  exceptions: ComplianceException[];
}

interface ComplianceException {
  id: string;
  requirement: string;
  reason: string;
  mitigatingControls: string[];
  approvedBy: string;
  approvalDate: Date;
  expiryDate: Date;
  status: 'active' | 'expired' | 'withdrawn';
}

interface RegulatoryReport {
  id: string;
  reportType: string;
  frequency: string;
  lastSubmitted: Date;
  nextDue: Date;
  status: 'submitted' | 'overdue' | 'in_progress' | 'not_started';
  regulatoryBody: string;
}

const RegulatoryCompliance: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedVendor, setSelectedVendor] = useState<string | null>(null);

  // Mock data
  const complianceRequirements: ComplianceRequirement[] = [
    {
      id: '1',
      regulation: 'OSFI E-21',
      requirement: 'Third Party Risk Management',
      description: 'Comprehensive assessment and ongoing monitoring of third-party arrangements',
      applicability: 'all_vendors',
      priority: 'high',
      status: 'compliant',
      lastAssessed: new Date('2024-01-15'),
      nextReview: new Date('2024-07-15'),
      evidence: ['Risk Assessment Report', 'Monitoring Dashboard', 'Vendor Contracts'],
      assignedTo: 'Risk Management Team'
    },
    {
      id: '2',
      regulation: 'OSFI E-21',
      requirement: 'Operational Resilience',
      description: 'Business continuity and disaster recovery capabilities',
      applicability: 'critical_vendors',
      priority: 'high',
      status: 'pending_review',
      lastAssessed: new Date('2024-01-10'),
      nextReview: new Date('2024-04-10'),
      evidence: ['BCP Documentation', 'Test Results'],
      assignedTo: 'Operations Team'
    },
    {
      id: '3',
      regulation: 'PIPEDA',
      requirement: 'Data Protection',
      description: 'Personal information protection and privacy controls',
      applicability: 'all_vendors',
      priority: 'high',
      status: 'compliant',
      lastAssessed: new Date('2024-01-20'),
      nextReview: new Date('2024-07-20'),
      evidence: ['Privacy Assessment', 'Data Processing Agreement'],
      assignedTo: 'Privacy Officer'
    },
    {
      id: '4',
      regulation: 'SOX',
      requirement: 'Internal Controls',
      description: 'Financial reporting controls and audit requirements',
      applicability: 'critical_vendors',
      priority: 'medium',
      status: 'non_compliant',
      lastAssessed: new Date('2024-01-05'),
      nextReview: new Date('2024-04-05'),
      evidence: ['Control Testing', 'Deficiency Report'],
      assignedTo: 'Internal Audit'
    }
  ];

  const vendorCompliance: VendorCompliance[] = [
    {
      id: '1',
      vendorName: 'CloudTech Solutions',
      vendorType: 'Technology Provider',
      overallScore: 92,
      riskRating: 'medium',
      lastAudit: new Date('2023-12-15'),
      nextAudit: new Date('2024-06-15'),
      auditFrequency: 'semi_annual',
      requirements: complianceRequirements.slice(0, 3),
      exceptions: [
        {
          id: '1',
          requirement: 'SOX Internal Controls',
          reason: 'System upgrade in progress',
          mitigatingControls: ['Enhanced monitoring', 'Manual verification'],
          approvedBy: 'Chief Risk Officer',
          approvalDate: new Date('2024-01-01'),
          expiryDate: new Date('2024-06-01'),
          status: 'active'
        }
      ]
    },
    {
      id: '2',
      vendorName: 'DataFlow Analytics',
      vendorType: 'Data Processing',
      overallScore: 88,
      riskRating: 'high',
      lastAudit: new Date('2023-11-20'),
      nextAudit: new Date('2024-05-20'),
      auditFrequency: 'semi_annual',
      requirements: complianceRequirements,
      exceptions: []
    }
  ];

  const regulatoryReports: RegulatoryReport[] = [
    {
      id: '1',
      reportType: 'Third Party Risk Report',
      frequency: 'Quarterly',
      lastSubmitted: new Date('2024-01-31'),
      nextDue: new Date('2024-04-30'),
      status: 'submitted',
      regulatoryBody: 'OSFI'
    },
    {
      id: '2',
      reportType: 'Operational Resilience Assessment',
      frequency: 'Annual',
      lastSubmitted: new Date('2023-12-31'),
      nextDue: new Date('2024-12-31'),
      status: 'in_progress',
      regulatoryBody: 'OSFI'
    },
    {
      id: '3',
      reportType: 'Privacy Impact Assessment',
      frequency: 'Annual',
      lastSubmitted: new Date('2023-03-31'),
      nextDue: new Date('2024-03-31'),
      status: 'overdue',
      regulatoryBody: 'Privacy Commissioner'
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'compliant':
      case 'submitted':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending_review':
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'non_compliant':
      case 'overdue':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'not_applicable':
      case 'not_started':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const calculateOverallCompliance = () => {
    const compliantCount = complianceRequirements.filter(req => req.status === 'compliant').length;
    return Math.round((compliantCount / complianceRequirements.length) * 100);
  };

  const getUpcomingReviews = () => {
    const upcoming = complianceRequirements.filter(req => {
      const daysUntilReview = Math.ceil((req.nextReview.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
      return daysUntilReview <= 30 && daysUntilReview > 0;
    });
    return upcoming.length;
  };

  const overallCompliance = calculateOverallCompliance();
  const upcomingReviews = getUpcomingReviews();
  const overdueReports = regulatoryReports.filter(report => report.status === 'overdue').length;
  const activeExceptions = vendorCompliance.reduce((total, vendor) => 
    total + vendor.exceptions.filter(ex => ex.status === 'active').length, 0
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Regulatory Compliance</h3>
          <p className="text-sm text-muted-foreground">
            Vendor regulatory compliance tracking and reporting
          </p>
        </div>
        <Button>
          <FileText className="h-4 w-4 mr-2" />
          Generate Report
        </Button>
      </div>

      {/* Overall Metrics */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overall Compliance</CardTitle>
            <Shield className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{overallCompliance}%</div>
            <p className="text-xs text-muted-foreground">
              Across all requirements
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Reviews</CardTitle>
            <Calendar className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{upcomingReviews}</div>
            <p className="text-xs text-muted-foreground">
              Within 30 days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue Reports</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{overdueReports}</div>
            <p className="text-xs text-muted-foreground">
              Require immediate attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Exceptions</CardTitle>
            <Flag className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{activeExceptions}</div>
            <p className="text-xs text-muted-foreground">
              Approved deviations
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="requirements">Requirements</TabsTrigger>
          <TabsTrigger value="vendors">Vendor Compliance</TabsTrigger>
          <TabsTrigger value="reports">Regulatory Reports</TabsTrigger>
          <TabsTrigger value="exceptions">Exceptions</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Compliance Status by Regulation</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {['OSFI E-21', 'PIPEDA', 'SOX', 'PCAOB'].map((regulation) => {
                    const reqs = complianceRequirements.filter(req => req.regulation === regulation);
                    const compliant = reqs.filter(req => req.status === 'compliant').length;
                    const percentage = reqs.length > 0 ? Math.round((compliant / reqs.length) * 100) : 0;
                    
                    return (
                      <div key={regulation} className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-sm">{regulation}</h4>
                          <p className="text-xs text-muted-foreground">{reqs.length} requirements</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full ${
                                percentage >= 90 ? 'bg-green-500' :
                                percentage >= 75 ? 'bg-yellow-500' : 'bg-red-500'
                              }`}
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium">{percentage}%</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Critical Compliance Issues</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {complianceRequirements
                    .filter(req => req.status === 'non_compliant' || req.priority === 'high')
                    .slice(0, 4)
                    .map((req) => (
                    <div key={req.id} className="border-l-4 border-red-500 pl-4 py-2">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-medium text-sm">{req.requirement}</h4>
                        <Badge variant="outline" className={getStatusColor(req.status)}>
                          {req.status.replace('_', ' ')}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mb-1">{req.regulation}</p>
                      <p className="text-xs text-muted-foreground">
                        Next review: {req.nextReview.toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="requirements" className="space-y-4">
          <div className="grid gap-4">
            {complianceRequirements.map((req) => (
              <Card key={req.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{req.requirement}</CardTitle>
                      <CardDescription>{req.regulation} • {req.applicability.replace('_', ' ')}</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={getPriorityColor(req.priority)}>
                        {req.priority}
                      </Badge>
                      <Badge variant="outline" className={getStatusColor(req.status)}>
                        {req.status.replace('_', ' ')}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">{req.description}</p>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <h4 className="font-medium text-sm mb-2">Assessment Details</h4>
                      <div className="space-y-1 text-sm">
                        <div>
                          <span className="font-medium">Assigned to:</span> {req.assignedTo}
                        </div>
                        <div>
                          <span className="font-medium">Last assessed:</span> {req.lastAssessed.toLocaleDateString()}
                        </div>
                        <div>
                          <span className="font-medium">Next review:</span> {req.nextReview.toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium text-sm mb-2">Evidence ({req.evidence.length})</h4>
                      <div className="space-y-1">
                        {req.evidence.map((evidence, index) => (
                          <div key={index} className="flex items-center gap-2 text-sm">
                            <FileText className="h-3 w-3" />
                            <span>{evidence}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="vendors" className="space-y-4">
          <div className="grid gap-4">
            {vendorCompliance.map((vendor) => (
              <Card key={vendor.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{vendor.vendorName}</CardTitle>
                      <CardDescription>{vendor.vendorType}</CardDescription>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-2xl font-bold text-blue-600">{vendor.overallScore}%</div>
                        <p className="text-xs text-muted-foreground">Compliance Score</p>
                      </div>
                      <Badge variant="outline" className={getRiskColor(vendor.riskRating)}>
                        {vendor.riskRating} risk
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-3">
                      <div>
                        <h4 className="font-medium text-sm mb-2">Audit Schedule</h4>
                        <div className="space-y-1 text-sm">
                          <div>
                            <span className="font-medium">Frequency:</span> {vendor.auditFrequency.replace('_', '-')}
                          </div>
                          <div>
                            <span className="font-medium">Last audit:</span> {vendor.lastAudit.toLocaleDateString()}
                          </div>
                          <div>
                            <span className="font-medium">Next audit:</span> {vendor.nextAudit.toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium text-sm mb-2">Requirements Status</h4>
                        <div className="space-y-1">
                          {vendor.requirements.slice(0, 3).map((req) => (
                            <div key={req.id} className="flex items-center justify-between">
                              <span className="text-xs">{req.requirement}</span>
                              <Badge variant="outline" className={getStatusColor(req.status)}>
                                {req.status === 'compliant' ? <CheckCircle2 className="h-3 w-3" /> : 
                                 req.status === 'non_compliant' ? <AlertCircle className="h-3 w-3" /> :
                                 <Clock className="h-3 w-3" />}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <h4 className="font-medium text-sm mb-2">Exceptions ({vendor.exceptions.length})</h4>
                        {vendor.exceptions.length > 0 ? (
                          <div className="space-y-1">
                            {vendor.exceptions.map((exception) => (
                              <div key={exception.id} className="text-xs">
                                <div className="font-medium">{exception.requirement}</div>
                                <div className="text-muted-foreground">
                                  Expires: {exception.expiryDate.toLocaleDateString()}
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-muted-foreground">No active exceptions</p>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="reports" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Regulatory Reporting Schedule</CardTitle>
              <CardDescription>
                Track submission status and deadlines for regulatory reports
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {regulatoryReports.map((report) => (
                  <div key={report.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">{report.reportType}</h4>
                      <p className="text-sm text-muted-foreground">
                        {report.regulatoryBody} • {report.frequency}
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span>Last submitted: {report.lastSubmitted.toLocaleDateString()}</span>
                        <span>Next due: {report.nextDue.toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className={getStatusColor(report.status)}>
                        {report.status.replace('_', ' ')}
                      </Badge>
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="exceptions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Compliance Exceptions</CardTitle>
              <CardDescription>
                Approved deviations from compliance requirements
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {vendorCompliance.flatMap(vendor => 
                  vendor.exceptions.map(exception => ({...exception, vendorName: vendor.vendorName}))
                ).map((exception) => (
                  <div key={exception.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-medium">{exception.vendorName} - {exception.requirement}</h4>
                        <p className="text-sm text-muted-foreground">
                          Approved by {exception.approvedBy} on {exception.approvalDate.toLocaleDateString()}
                        </p>
                      </div>
                      <Badge variant="outline" className={
                        exception.status === 'active' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                        exception.status === 'expired' ? 'bg-red-100 text-red-800 border-red-200' :
                        'bg-gray-100 text-gray-800 border-gray-200'
                      }>
                        {exception.status}
                      </Badge>
                    </div>
                    <div className="grid gap-3 text-sm">
                      <div>
                        <span className="font-medium">Reason:</span> {exception.reason}
                      </div>
                      <div>
                        <span className="font-medium">Mitigating Controls:</span>
                        <ul className="list-disc list-inside ml-4 mt-1">
                          {exception.mitigatingControls.map((control, index) => (
                            <li key={index}>{control}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <span className="font-medium">Expiry Date:</span> {exception.expiryDate.toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RegulatoryCompliance;