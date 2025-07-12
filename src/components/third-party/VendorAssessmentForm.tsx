
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { 
  Save, 
  Calculator, 
  Shield, 
  DollarSign, 
  Settings, 
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
// TODO: Migrated from AuthContext to EnhancedAuthContext
import { useAuth } from '@/contexts/EnhancedAuthContext';
import { createVendorProfile } from '@/services/third-party-service';
import { toast } from 'sonner';

interface VendorAssessmentFormProps {
  vendorId?: string;
  onSave?: () => void;
  onCancel?: () => void;
}

const VendorAssessmentForm: React.FC<VendorAssessmentFormProps> = ({
  vendorId,
  onSave,
  onCancel
}) => {
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState('financial');
  const [saving, setSaving] = useState(false);
  
  const [assessment, setAssessment] = useState({
    vendor_profile_id: vendorId || '',
    assessment_type: 'annual',
    assessment_date: new Date().toISOString().split('T')[0],
    financial_score: 70,
    operational_score: 75,
    security_score: 80,
    compliance_score: 85,
    assessment_methodology: {
      financial_criteria: [],
      operational_criteria: [],
      security_criteria: [],
      compliance_criteria: []
    },
    risk_factors: {
      financial: [],
      operational: [],
      security: [],
      compliance: []
    },
    mitigation_recommendations: [],
    next_assessment_date: '',
    status: 'draft'
  });

  const handleScoreChange = (category: string, value: number[]) => {
    setAssessment(prev => ({
      ...prev,
      [`${category}_score`]: value[0]
    }));
  };

  const calculateOverallRiskScore = () => {
    const weights = {
      financial: 0.25,
      operational: 0.25,
      security: 0.30,
      compliance: 0.20
    };

    return Math.round(
      assessment.financial_score * weights.financial +
      assessment.operational_score * weights.operational +
      assessment.security_score * weights.security +
      assessment.compliance_score * weights.compliance
    );
  };

  const getRiskLevel = (score: number) => {
    if (score >= 85) return { level: 'Low', color: 'green' };
    if (score >= 70) return { level: 'Medium', color: 'yellow' };
    if (score >= 50) return { level: 'High', color: 'orange' };
    return { level: 'Critical', color: 'red' };
  };

  const handleSave = async () => {
    if (!profile?.organization_id) return;

    setSaving(true);
    try {
      const overallScore = calculateOverallRiskScore();
      
      await createVendorProfile({
        vendor_name: `Assessment-${Date.now()}`,
        service_provided: 'Assessment',
        criticality: 'medium',
        status: 'active'
      } as any);

      toast.success('Vendor assessment saved successfully');
      onSave?.();
    } catch (error) {
      console.error('Error saving assessment:', error);
      toast.error('Failed to save vendor assessment');
    } finally {
      setSaving(false);
    }
  };

  const overallScore = calculateOverallRiskScore();
  const riskLevel = getRiskLevel(overallScore);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Vendor Risk Assessment</h3>
          <p className="text-sm text-muted-foreground">
            Comprehensive evaluation of vendor risk across multiple dimensions
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge 
            variant="outline" 
            className={`bg-${riskLevel.color}-100 text-${riskLevel.color}-800 border-${riskLevel.color}-200`}
          >
            {riskLevel.level} Risk ({overallScore})
          </Badge>
        </div>
      </div>

      {/* Overall Score Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Overall Risk Score
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{assessment.financial_score}</div>
              <div className="text-sm text-muted-foreground">Financial</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{assessment.operational_score}</div>
              <div className="text-sm text-muted-foreground">Operational</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{assessment.security_score}</div>
              <div className="text-sm text-muted-foreground">Security</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{assessment.compliance_score}</div>
              <div className="text-sm text-muted-foreground">Compliance</div>
            </div>
          </div>
          
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="font-medium">Calculated Risk Score:</span>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold">{overallScore}</span>
                <Badge variant="outline" className={`bg-${riskLevel.color}-100 text-${riskLevel.color}-800`}>
                  {riskLevel.level}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="financial" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Financial
          </TabsTrigger>
          <TabsTrigger value="operational" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Operational
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Security
          </TabsTrigger>
          <TabsTrigger value="compliance" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            Compliance
          </TabsTrigger>
        </TabsList>

        <TabsContent value="financial" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Financial Assessment
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label className="text-base font-medium">Financial Score: {assessment.financial_score}</Label>
                <Slider
                  value={[assessment.financial_score]}
                  onValueChange={(value) => handleScoreChange('financial', value)}
                  max={100}
                  min={0}
                  step={5}
                  className="mt-2"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>Poor (0)</span>
                  <span>Excellent (100)</span>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="revenue">Annual Revenue</Label>
                  <Input id="revenue" placeholder="e.g., $10M" />
                </div>
                <div>
                  <Label htmlFor="credit-rating">Credit Rating</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select rating" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="aaa">AAA</SelectItem>
                      <SelectItem value="aa">AA</SelectItem>
                      <SelectItem value="a">A</SelectItem>
                      <SelectItem value="bbb">BBB</SelectItem>
                      <SelectItem value="bb">BB</SelectItem>
                      <SelectItem value="b">B</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="financial-risks">Financial Risk Factors</Label>
                <Textarea 
                  id="financial-risks"
                  placeholder="Describe key financial risks and concerns..."
                  className="mt-1"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="operational" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Operational Assessment
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label className="text-base font-medium">Operational Score: {assessment.operational_score}</Label>
                <Slider
                  value={[assessment.operational_score]}
                  onValueChange={(value) => handleScoreChange('operational', value)}
                  max={100}
                  min={0}
                  step={5}
                  className="mt-2"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>Poor (0)</span>
                  <span>Excellent (100)</span>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="service-uptime">Service Uptime %</Label>
                  <Input id="service-uptime" placeholder="e.g., 99.9%" />
                </div>
                <div>
                  <Label htmlFor="business-continuity">Business Continuity Plan</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="comprehensive">Comprehensive</SelectItem>
                      <SelectItem value="basic">Basic</SelectItem>
                      <SelectItem value="limited">Limited</SelectItem>
                      <SelectItem value="none">None</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="operational-risks">Operational Risk Factors</Label>
                <Textarea 
                  id="operational-risks"
                  placeholder="Describe operational risks, dependencies, and concerns..."
                  className="mt-1"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Security Assessment
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label className="text-base font-medium">Security Score: {assessment.security_score}</Label>
                <Slider
                  value={[assessment.security_score]}
                  onValueChange={(value) => handleScoreChange('security', value)}
                  max={100}
                  min={0}
                  step={5}
                  className="mt-2"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>Poor (0)</span>
                  <span>Excellent (100)</span>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="security-certs">Security Certifications</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select certification" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="iso27001">ISO 27001</SelectItem>
                      <SelectItem value="soc2">SOC 2</SelectItem>
                      <SelectItem value="pci">PCI DSS</SelectItem>
                      <SelectItem value="multiple">Multiple</SelectItem>
                      <SelectItem value="none">None</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="data-protection">Data Protection Level</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="enterprise">Enterprise</SelectItem>
                      <SelectItem value="standard">Standard</SelectItem>
                      <SelectItem value="basic">Basic</SelectItem>
                      <SelectItem value="minimal">Minimal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="security-risks">Security Risk Factors</Label>
                <Textarea 
                  id="security-risks"
                  placeholder="Describe security vulnerabilities, data handling concerns..."
                  className="mt-1"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Compliance Assessment
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <Label className="text-base font-medium">Compliance Score: {assessment.compliance_score}</Label>
                <Slider
                  value={[assessment.compliance_score]}
                  onValueChange={(value) => handleScoreChange('compliance', value)}
                  max={100}
                  min={0}
                  step={5}
                  className="mt-2"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>Poor (0)</span>
                  <span>Excellent (100)</span>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="regulatory-compliance">Regulatory Compliance</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fully-compliant">Fully Compliant</SelectItem>
                      <SelectItem value="mostly-compliant">Mostly Compliant</SelectItem>
                      <SelectItem value="partially-compliant">Partially Compliant</SelectItem>
                      <SelectItem value="non-compliant">Non-Compliant</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="audit-frequency">Audit Frequency</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="annual">Annual</SelectItem>
                      <SelectItem value="biannual">Bi-annual</SelectItem>
                      <SelectItem value="quarterly">Quarterly</SelectItem>
                      <SelectItem value="ad-hoc">Ad-hoc</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="compliance-risks">Compliance Risk Factors</Label>
                <Textarea 
                  id="compliance-risks"
                  placeholder="Describe regulatory compliance gaps and concerns..."
                  className="mt-1"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Mitigation Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Mitigation Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea 
            placeholder="Provide specific recommendations to mitigate identified risks..."
            rows={4}
          />
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-3">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={saving}>
          <Save className="h-4 w-4 mr-2" />
          {saving ? 'Saving...' : 'Save Assessment'}
        </Button>
      </div>
    </div>
  );
};

export default VendorAssessmentForm;
