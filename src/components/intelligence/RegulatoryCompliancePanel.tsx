
import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Shield, 
  AlertTriangle, 
  CheckCircle, 
  Search, 
  Download,
  Clock,
  FileCheck,
  Database
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface ComplianceCheck {
  id: string;
  vendor_name: string;
  check_type: 'sanctions' | 'regulatory_actions' | 'licensing' | 'certifications';
  status: 'compliant' | 'non_compliant' | 'under_review' | 'expired';
  last_checked: string;
  next_check_due: string;
  findings: string[];
  regulatory_body: string;
  reference_number?: string;
}

interface SanctionsScreening {
  id: string;
  entity_name: string;
  screening_date: string;
  lists_checked: string[];
  matches_found: number;
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  match_details: any[];
  false_positive_review: boolean;
}

const RegulatoryCompliancePanel: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVendor, setSelectedVendor] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // Mock compliance checks data
  const { data: complianceChecks = [], isLoading } = useQuery({
    queryKey: ['complianceChecks', searchTerm],
    queryFn: async () => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockChecks: ComplianceCheck[] = [
        {
          id: '1',
          vendor_name: 'Global Financial Services Corp',
          check_type: 'sanctions',
          status: 'compliant',
          last_checked: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          next_check_due: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
          findings: [],
          regulatory_body: 'FinCEN',
          reference_number: 'FC-2024-001'
        },
        {
          id: '2',
          vendor_name: 'TechFlow Solutions Ltd',
          check_type: 'regulatory_actions',
          status: 'under_review',
          last_checked: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          next_check_due: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          findings: ['Pending regulatory investigation - Q4 2024'],
          regulatory_body: 'SEC',
          reference_number: 'SEC-INV-2024-078'
        },
        {
          id: '3',
          vendor_name: 'Secure Cloud Hosting Inc',
          check_type: 'certifications',
          status: 'expired',
          last_checked: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          next_check_due: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(),
          findings: ['SOC 2 Type II certification expired', 'ISO 27001 renewal pending'],
          regulatory_body: 'AICPA',
          reference_number: 'SOC2-2024-156'
        }
      ];

      return mockChecks.filter(check => 
        !searchTerm || check.vendor_name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    },
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });

  const { data: sanctionsScreening = [] } = useQuery({
    queryKey: ['sanctionsScreening'],
    queryFn: async () => {
      const mockScreening: SanctionsScreening[] = [
        {
          id: '1',
          entity_name: 'TechFlow Solutions Ltd',
          screening_date: new Date().toISOString(),
          lists_checked: ['OFAC SDN', 'EU Sanctions', 'UN Security Council', 'UK HMT'],
          matches_found: 1,
          risk_level: 'medium',
          match_details: [{
            list: 'OFAC SDN',
            match_percentage: 85,
            entity_details: 'Similar name - requires manual review',
            review_status: 'pending'
          }],
          false_positive_review: false
        }
      ];
      return mockScreening;
    }
  });

  const runComplianceCheck = useMutation({
    mutationFn: async (vendorName: string) => {
      // Simulate compliance check
      await new Promise(resolve => setTimeout(resolve, 2000));
      return { success: true, vendor: vendorName };
    },
    onSuccess: (data) => {
      toast({
        title: "Compliance Check Complete",
        description: `Updated compliance status for ${data.vendor}`,
      });
      queryClient.invalidateQueries({ queryKey: ['complianceChecks'] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to run compliance check",
        variant: "destructive",
      });
    }
  });

  const runSanctionsScreening = useMutation({
    mutationFn: async (entityName: string) => {
      await new Promise(resolve => setTimeout(resolve, 3000));
      return { success: true, entity: entityName, matches: Math.floor(Math.random() * 3) };
    },
    onSuccess: (data) => {
      toast({
        title: "Sanctions Screening Complete",
        description: `Screened ${data.entity} - ${data.matches} potential matches found`,
      });
      queryClient.invalidateQueries({ queryKey: ['sanctionsScreening'] });
    }
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'compliant': return 'bg-green-100 text-green-800';
      case 'non_compliant': return 'bg-red-100 text-red-800';
      case 'under_review': return 'bg-yellow-100 text-yellow-800';
      case 'expired': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Statistics
  const totalChecks = complianceChecks.length;
  const compliantCount = complianceChecks.filter(c => c.status === 'compliant').length;
  const issuesCount = complianceChecks.filter(c => c.status === 'non_compliant' || c.status === 'expired').length;
  const pendingCount = complianceChecks.filter(c => c.status === 'under_review').length;

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="h-20 animate-pulse bg-gray-100 rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Checks</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalChecks}</div>
            <p className="text-xs text-muted-foreground">
              Compliance assessments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Compliant</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{compliantCount}</div>
            <p className="text-xs text-muted-foreground">
              {totalChecks > 0 ? ((compliantCount / totalChecks) * 100).toFixed(0) : 0}% of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Issues</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{issuesCount}</div>
            <p className="text-xs text-muted-foreground">
              Require attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Under Review</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{pendingCount}</div>
            <p className="text-xs text-muted-foreground">
              Pending assessment
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="compliance" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="compliance">Compliance Checks</TabsTrigger>
          <TabsTrigger value="sanctions">Sanctions Screening</TabsTrigger>
          <TabsTrigger value="monitoring">Continuous Monitoring</TabsTrigger>
        </TabsList>

        <TabsContent value="compliance" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Regulatory Compliance Status</CardTitle>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search vendors..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8 w-64"
                    />
                  </div>
                  <Button
                    onClick={() => runComplianceCheck.mutate('All Vendors')}
                    disabled={runComplianceCheck.isPending}
                  >
                    {runComplianceCheck.isPending ? 'Checking...' : 'Run All Checks'}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {complianceChecks.map((check) => (
                  <div key={check.id} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-medium">{check.vendor_name}</h4>
                        <p className="text-sm text-muted-foreground capitalize">
                          {check.check_type.replace('_', ' ')} • {check.regulatory_body}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(check.status)}>
                          {check.status.replace('_', ' ')}
                        </Badge>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => runComplianceCheck.mutate(check.vendor_name)}
                          disabled={runComplianceCheck.isPending}
                        >
                          Recheck
                        </Button>
                      </div>
                    </div>

                    {check.findings.length > 0 && (
                      <Alert className="mb-3">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                          <ul className="list-disc list-inside">
                            {check.findings.map((finding, index) => (
                              <li key={index}>{finding}</li>
                            ))}
                          </ul>
                        </AlertDescription>
                      </Alert>
                    )}

                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Last checked: {new Date(check.last_checked).toLocaleDateString()}</span>
                      <span>Next due: {new Date(check.next_check_due).toLocaleDateString()}</span>
                      {check.reference_number && (
                        <span>Ref: {check.reference_number}</span>
                      )}
                    </div>
                  </div>
                ))}

                {complianceChecks.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileCheck className="h-12 w-12 mx-auto mb-4" />
                    <p>No compliance checks found</p>
                    {searchTerm && <p>Try adjusting your search terms</p>}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sanctions" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Sanctions List Screening</CardTitle>
                <Button
                  onClick={() => runSanctionsScreening.mutate('All Entities')}
                  disabled={runSanctionsScreening.isPending}
                >
                  {runSanctionsScreening.isPending ? 'Screening...' : 'Run Full Screening'}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sanctionsScreening.map((screening) => (
                  <div key={screening.id} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-medium">{screening.entity_name}</h4>
                        <p className="text-sm text-muted-foreground">
                          Screened: {new Date(screening.screening_date).toLocaleString()}
                        </p>
                      </div>
                      <Badge className={getRiskLevelColor(screening.risk_level)}>
                        {screening.risk_level.toUpperCase()} RISK
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-3">
                      <div>
                        <p className="text-sm font-medium">Lists Checked:</p>
                        <p className="text-xs text-muted-foreground">
                          {screening.lists_checked.join(', ')}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Matches Found:</p>
                        <p className="text-xs text-muted-foreground">
                          {screening.matches_found} potential matches
                        </p>
                      </div>
                    </div>

                    {screening.match_details.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-sm font-medium">Match Details:</p>
                        {screening.match_details.map((match, index) => (
                          <Alert key={index} className="py-2">
                            <AlertDescription className="text-sm">
                              <strong>{match.list}:</strong> {match.entity_details} 
                              ({match.match_percentage}% match)
                              <Badge variant="outline" className="ml-2">
                                {match.review_status}
                              </Badge>
                            </AlertDescription>
                          </Alert>
                        ))}
                      </div>
                    )}
                  </div>
                ))}

                {sanctionsScreening.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Shield className="h-12 w-12 mx-auto mb-4" />
                    <p>No sanctions screening results</p>
                    <Button
                      className="mt-2"
                      onClick={() => runSanctionsScreening.mutate('Sample Entity')}
                    >
                      Run Sample Screening
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Continuous Monitoring Setup</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Continuous monitoring ensures real-time updates on regulatory changes and sanctions list updates.
                  </AlertDescription>
                </Alert>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Sanctions List Monitoring</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Real-time updates from major sanctions databases
                    </p>
                    <div className="flex items-center justify-between">
                      <Badge variant="outline">Every 15 minutes</Badge>
                      <Button size="sm" variant="outline">Configure</Button>
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Regulatory Actions</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Monitor enforcement actions and regulatory changes
                    </p>
                    <div className="flex items-center justify-between">
                      <Badge variant="outline">Daily</Badge>
                      <Button size="sm" variant="outline">Configure</Button>
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">Certification Expiry</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Track certification and license expiration dates
                    </p>
                    <div className="flex items-center justify-between">
                      <Badge variant="outline">Weekly</Badge>
                      <Button size="sm" variant="outline">Configure</Button>
                    </div>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <h4 className="font-medium mb-2">News & Media</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Monitor news mentions and reputational risks
                    </p>
                    <div className="flex items-center justify-between">
                      <Badge variant="outline">Real-time</Badge>
                      <Button size="sm" variant="outline">Configure</Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RegulatoryCompliancePanel;
