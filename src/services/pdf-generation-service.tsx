import React from 'react';
import { pdf } from '@react-pdf/renderer';
import { supabase } from "@/integrations/supabase/client";
import { getCurrentOrgId } from "@/lib/organization-context";
import { ExecutiveSummaryPDF } from "@/components/pdf/ExecutiveSummaryPDF";
import { OSFIAuditReportPDF } from "@/components/pdf/OSFIAuditReportPDF";
import { ThirdPartyRiskAssessmentPDF } from "@/components/pdf/ThirdPartyRiskAssessmentPDF";

export interface ExecutiveSummaryData {
  organizationName: string;
  reportPeriod: string;
  reportDate: string;
  incidents: {
    total: number;
    critical: number;
    high: number;
    resolved: number;
    avgResolutionTime: number;
  };
  kpis: {
    riskScore: number;
    complianceScore: number;
    controlEffectiveness: number;
    vendorRiskScore: number;
    systemAvailability: number;
  };
  topRisks: Array<{
    category: string;
    description: string;
    likelihood: string;
    impact: string;
    mitigation: string;
  }>;
  keyActions: string[];
  nextSteps: string[];
}

export interface OSFIAuditData {
  organizationName: string;
  auditPeriod: string;
  auditDate: string;
  auditScope: string;
  auditObjectives: string[];
  findings: Array<{
    id: string;
    category: string;
    description: string;
    severity: 'Critical' | 'High' | 'Medium' | 'Low';
    recommendation: string;
    managementResponse: string;
    targetDate: string;
    status: string;
  }>;
  complianceRating: string;
  overallAssessment: string;
  keyStrengths: string[];
  areasForImprovement: string[];
  regulatoryRequirements: Array<{
    requirement: string;
    status: 'Compliant' | 'Non-Compliant' | 'Partially Compliant';
    evidence: string;
  }>;
}

export interface ThirdPartyRiskData {
  vendorName: string;
  assessmentDate: string;
  assessmentType: string;
  overallRiskRating: 'Low' | 'Medium' | 'High' | 'Critical';
  serviceCriticality: string;
  riskCategories: Array<{
    category: string;
    rating: 'Low' | 'Medium' | 'High' | 'Critical';
    score: number;
    maxScore: number;
    findings: string[];
    recommendations: string[];
  }>;
  contractDetails: {
    startDate: string;
    endDate: string;
    renewalDate: string;
    financialExposure: string;
    slaRequirements: string[];
  };
  riskMitigation: {
    existingControls: string[];
    additionalControls: string[];
    monitoringPlan: string;
  };
  conclusion: string;
  nextReviewDate: string;
}

class PDFGenerationService {
  async generateExecutiveSummary(data?: Partial<ExecutiveSummaryData>): Promise<Blob> {
    const fullData = await this.getExecutiveSummaryData(data);
    const document = <ExecutiveSummaryPDF data={fullData} />;
    const blob = await pdf(document).toBlob();
    return blob;
  }

  async generateOSFIAuditReport(data?: Partial<OSFIAuditData>): Promise<Blob> {
    const fullData = await this.getOSFIAuditData(data);
    const document = <OSFIAuditReportPDF data={fullData} />;
    const blob = await pdf(document).toBlob();
    return blob;
  }

  async generateThirdPartyRiskAssessment(vendorId?: string, data?: Partial<ThirdPartyRiskData>): Promise<Blob> {
    const fullData = await this.getThirdPartyRiskData(vendorId, data);
    const document = <ThirdPartyRiskAssessmentPDF data={fullData} />;
    const blob = await pdf(document).toBlob();
    return blob;
  }

  private async getExecutiveSummaryData(overrides?: Partial<ExecutiveSummaryData>): Promise<ExecutiveSummaryData> {
    try {
      const orgId = await getCurrentOrgId();
      const currentDate = new Date();
      const reportPeriod = `Q${Math.ceil((currentDate.getMonth() + 1) / 3)} ${currentDate.getFullYear()}`;

      // Fetch organization data
      const { data: orgData } = await supabase
        .from('organizations')
        .select('name')
        .eq('id', orgId)
        .single();

      // Fetch incident statistics
      const { data: incidents } = await supabase
        .from('incident_logs')
        .select('id, severity, status, created_at, resolved_at')
        .eq('org_id', orgId)
        .gte('created_at', new Date(currentDate.getFullYear(), currentDate.getMonth() - 3, 1).toISOString());

      // Fetch KPI data from various sources
      const { data: controls } = await supabase
        .from('controls')
        .select('effectiveness_score')
        .eq('org_id', orgId);

      const { data: vendors } = await supabase
        .from('third_party_profiles')
        .select('risk_rating')
        .eq('org_id', orgId);

      // Calculate statistics
      const incidentStats = {
        total: incidents?.length || 0,
        critical: incidents?.filter(i => i.severity === 'critical').length || 0,
        high: incidents?.filter(i => i.severity === 'high').length || 0,
        resolved: incidents?.filter(i => i.status === 'resolved').length || 0,
        avgResolutionTime: incidents?.filter(i => i.resolved_at)
          .reduce((acc, curr) => {
            const resolution = new Date(curr.resolved_at!).getTime() - new Date(curr.created_at).getTime();
            return acc + (resolution / (1000 * 60 * 60)); // Convert to hours
          }, 0) / (incidents?.filter(i => i.resolved_at).length || 1) || 0
      };

      const kpis = {
        riskScore: 75, // Mock data - would be calculated from actual risk assessments
        complianceScore: 85,
        controlEffectiveness: controls?.reduce((acc, curr) => acc + (curr.effectiveness_score || 0), 0) / (controls?.length || 1) || 80,
        vendorRiskScore: this.calculateVendorRiskScore(vendors || []),
        systemAvailability: 99.2
      };

      const defaultData: ExecutiveSummaryData = {
        organizationName: orgData?.name || 'Organization',
        reportPeriod,
        reportDate: currentDate.toLocaleDateString(),
        incidents: incidentStats,
        kpis,
        topRisks: [
          {
            category: 'Operational Risk',
            description: 'System outage in core banking platform',
            likelihood: 'Medium',
            impact: 'High',
            mitigation: 'Enhanced monitoring and backup systems'
          },
          {
            category: 'Third-Party Risk',
            description: 'Vendor dependency concentration',
            likelihood: 'High',
            impact: 'Medium',
            mitigation: 'Diversification strategy implementation'
          }
        ],
        keyActions: [
          'Complete quarterly risk assessment review',
          'Update business continuity plans',
          'Conduct vendor risk assessments'
        ],
        nextSteps: [
          'Implement enhanced monitoring controls',
          'Review and update risk appetite statements',
          'Schedule board risk committee presentation'
        ]
      };

      return { ...defaultData, ...overrides };
    } catch (error) {
      console.error('Error fetching executive summary data:', error);
      // Return default data if fetch fails
      return {
        organizationName: 'Organization',
        reportPeriod: 'Q4 2024',
        reportDate: new Date().toLocaleDateString(),
        incidents: { total: 0, critical: 0, high: 0, resolved: 0, avgResolutionTime: 0 },
        kpis: { riskScore: 0, complianceScore: 0, controlEffectiveness: 0, vendorRiskScore: 0, systemAvailability: 0 },
        topRisks: [],
        keyActions: [],
        nextSteps: [],
        ...overrides
      };
    }
  }

  private async getOSFIAuditData(overrides?: Partial<OSFIAuditData>): Promise<OSFIAuditData> {
    try {
      const orgId = await getCurrentOrgId();
      
      // Fetch organization data
      const { data: orgData } = await supabase
        .from('organizations')
        .select('name')
        .eq('id', orgId)
        .single();

      const defaultData: OSFIAuditData = {
        organizationName: orgData?.name || 'Organization',
        auditPeriod: 'Annual Review 2024',
        auditDate: new Date().toLocaleDateString(),
        auditScope: 'Operational Resilience Framework Assessment per OSFI Guideline E-21',
        auditObjectives: [
          'Assess compliance with OSFI Guideline E-21',
          'Evaluate operational resilience capabilities',
          'Review business continuity and disaster recovery plans',
          'Assess third-party risk management framework'
        ],
        findings: [],
        complianceRating: 'Satisfactory',
        overallAssessment: 'The organization demonstrates adequate operational resilience capabilities with some areas for enhancement.',
        keyStrengths: [
          'Well-defined governance structure',
          'Comprehensive risk management framework',
          'Regular testing of business continuity plans'
        ],
        areasForImprovement: [
          'Enhanced vendor risk monitoring',
          'Improved incident response procedures',
          'Strengthened data governance controls'
        ],
        regulatoryRequirements: [
          {
            requirement: 'OSFI E-21 - Operational Resilience',
            status: 'Compliant',
            evidence: 'Documented framework and regular testing'
          }
        ]
      };

      return { ...defaultData, ...overrides };
    } catch (error) {
      console.error('Error fetching OSFI audit data:', error);
      return {
        organizationName: 'Organization',
        auditPeriod: 'Annual Review 2024',
        auditDate: new Date().toLocaleDateString(),
        auditScope: '',
        auditObjectives: [],
        findings: [],
        complianceRating: 'Not Assessed',
        overallAssessment: '',
        keyStrengths: [],
        areasForImprovement: [],
        regulatoryRequirements: [],
        ...overrides
      };
    }
  }

  private async getThirdPartyRiskData(vendorId?: string, overrides?: Partial<ThirdPartyRiskData>): Promise<ThirdPartyRiskData> {
    try {
      let vendorData = null;
      
      if (vendorId) {
        const { data } = await supabase
          .from('third_party_profiles')
          .select('*')
          .eq('id', vendorId)
          .single();
        vendorData = data;
      }

      const defaultData: ThirdPartyRiskData = {
        vendorName: vendorData?.vendor_name || 'Vendor Name',
        assessmentDate: new Date().toLocaleDateString(),
        assessmentType: 'Annual Risk Assessment',
        overallRiskRating: (vendorData?.risk_rating as any) || 'Medium',
        serviceCriticality: vendorData?.criticality || 'Medium',
        riskCategories: [
          {
            category: 'Financial Risk',
            rating: 'Low',
            score: 15,
            maxScore: 20,
            findings: ['Strong financial position', 'Stable revenue streams'],
            recommendations: ['Continue monitoring quarterly reports']
          },
          {
            category: 'Operational Risk',
            rating: 'Medium',
            score: 12,
            maxScore: 20,
            findings: ['Limited geographic diversification'],
            recommendations: ['Request business continuity plan updates']
          }
        ],
        contractDetails: {
          startDate: vendorData?.created_at?.split('T')[0] || new Date().toLocaleDateString(),
          endDate: 'TBD',
          renewalDate: 'TBD',
          financialExposure: 'Medium',
          slaRequirements: ['99.5% uptime', '4-hour response time']
        },
        riskMitigation: {
          existingControls: ['Contract terms and conditions', 'Regular performance monitoring'],
          additionalControls: ['Enhanced SLA monitoring', 'Backup vendor identification'],
          monitoringPlan: 'Quarterly review of vendor performance metrics'
        },
        conclusion: 'Vendor poses acceptable risk level with recommended controls implementation.',
        nextReviewDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toLocaleDateString()
      };

      return { ...defaultData, ...overrides };
    } catch (error) {
      console.error('Error fetching third-party risk data:', error);
      return {
        vendorName: 'Vendor Name',
        assessmentDate: new Date().toLocaleDateString(),
        assessmentType: 'Risk Assessment',
        overallRiskRating: 'Medium',
        serviceCriticality: 'Medium',
        riskCategories: [],
        contractDetails: {
          startDate: '',
          endDate: '',
          renewalDate: '',
          financialExposure: '',
          slaRequirements: []
        },
        riskMitigation: {
          existingControls: [],
          additionalControls: [],
          monitoringPlan: ''
        },
        conclusion: '',
        nextReviewDate: '',
        ...overrides
      };
    }
  }

  private calculateVendorRiskScore(vendors: any[]): number {
    if (!vendors.length) return 0;
    
    const riskMap = { 'low': 1, 'medium': 2, 'high': 3, 'critical': 4 };
    const totalRisk = vendors.reduce((acc, vendor) => {
      return acc + (riskMap[vendor.risk_rating as keyof typeof riskMap] || 2);
    }, 0);
    
    return Math.round((totalRisk / vendors.length / 4) * 100);
  }

  downloadPDF(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}

export const pdfGenerationService = new PDFGenerationService();