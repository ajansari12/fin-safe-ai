import { generatePDF, createHTMLContent } from './pdf-export-service';
import { format } from 'date-fns';
import DOMPurify from 'dompurify';

export interface ExecutiveSummaryData {
  overallScore: number;
  organizationName: string;
  reportDate: string;
  reportPeriod: string;
  keyMetrics: Array<{
    name: string;
    value: string | number;
    status: 'good' | 'warning' | 'critical';
  }>;
  kpis: {
    totalIncidents: number;
    resolvedIncidents: number;
    avgResolutionTime: number;
    controlEffectiveness: number;
    complianceScore: number;
    riskScore: number;
    vendorRiskScore: number;
    systemAvailability: number;
  };
  incidents: {
    critical: number;
    high: number;
    medium: number;
    low: number;
    total: number;
    resolved: number;
    avgResolutionTime: number;
  };
  topRisks: Array<{
    risk: string;
    category: string;
    description: string;
    score: number;
    likelihood: number;
    impact: number;
    status: string;
    mitigation: string;
  }>;
  keyActions: string[];
  nextSteps: string[];
}

export interface OSFIAuditData {
  overallScore: number;
  complianceRating: string;
  auditPeriod: string;
  auditDate: string;
  auditScope: string[];
  auditObjectives: string[];
  overallAssessment: string;
  keyStrengths: string[];
  areasForImprovement: string[];
  regulatoryRequirements: Array<{
    requirement: string;
    status: string;
    notes: string;
    evidence: string;
  }>;
  findings: Array<{
    id: string;
    category: string;
    finding: string;
    description: string;
    severity: string;
    recommendation: string;
    managementResponse: string;
    timeline: string;
    targetDate: string;
    status: string;
  }>;
  principles: Array<{
    principle: number;
    name: string;
    status: string;
    score: number;
    gaps: string[];
    actions: string[];
  }>;
  organizationName: string;
  reportDate: string;
}

export interface ThirdPartyRiskData {
  vendorName: string;
  assessmentType: string;
  assessmentDate: string;
  overallRiskRating: string;
  serviceCriticality: string;
  contractDetails: {
    startDate: string;
    endDate: string;
    renewalDate: string;
    value: string;
    financialExposure: string;
    terms: string[];
    slaRequirements: string[];
  };
  riskCategories: Array<{
    category: string;
    rating: string;
    score: number;
    maxScore: number;
    notes: string;
    findings: string[];
    recommendations: string[];
  }>;
  riskMitigation: {
    currentControls: string[];
    existingControls: string[];
    additionalControls: string[];
    plannedActions: string[];
    timeline: string;
    monitoringPlan: string;
  };
  conclusion: string;
  nextReviewDate: string;
  vendors: Array<{
    name: string;
    riskRating: string;
    status: string;
    lastAssessment: string;
  }>;
  overallRiskScore: number;
  criticalVendors: number;
  organizationName: string;
  reportDate: string;
}

interface OSFIComplianceData {
  overallScore: number;
  principles: Array<{
    principle: number;
    name: string;
    status: string;
    score: number;
    gaps: string[];
    actions: string[];
  }>;
  organizationName: string;
  reportDate: string;
  riskAppetiteAlignment: number;
  activeBreaches: number;
  pendingActions: number;
  toleranceBreaches?: number;
  criticalToleranceBreaches?: number;
  lastToleranceBreach?: string | null;
  recentBreachDetails?: Array<{
    breach_date: string;
    breach_severity: string;
    actual_value: number;
    threshold_value: number;
    variance_percentage: number;
  }>;
}

class PDFGenerationService {
  async generateExecutiveSummary(data?: ExecutiveSummaryData): Promise<Blob> {
    const reportData = data || this.getSampleExecutiveSummaryData();
    const content = this.createExecutiveSummaryHTML(reportData);
    const htmlContent = createHTMLContent('Executive Summary Report', content, this.getExecutiveSummaryStyles());
    
    return this.generatePDFFromHTML(htmlContent, 'Executive_Summary');
  }

  async generateThirdPartyRiskAssessment(data?: ThirdPartyRiskData): Promise<Blob> {
    const reportData = data || this.getSampleThirdPartyRiskData();
    const content = this.createThirdPartyRiskHTML(reportData);
    const htmlContent = createHTMLContent('Third Party Risk Assessment', content, this.getThirdPartyRiskStyles());
    
    return this.generatePDFFromHTML(htmlContent, 'Third_Party_Risk_Assessment');
  }

  async generateOSFIAuditReport(data?: OSFIComplianceData): Promise<Blob> {
    // Use sample data if none provided
    const reportData = data || await this.getEnhancedOSFIDataWithTolerance();
    
    const content = this.createEnhancedOSFIReportHTML(reportData);
    const htmlContent = createHTMLContent('OSFI E-21 Compliance Report', content, this.getOSFIStyles());
    
    // Create temporary element for PDF generation
    const tempDiv = document.createElement('div');
    // Sanitize HTML content to prevent XSS vulnerabilities
    const sanitizedContent = DOMPurify.sanitize(htmlContent, {
      ALLOWED_TAGS: ['html', 'head', 'body', 'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'span', 'strong', 'em', 'ul', 'ol', 'li', 'table', 'tr', 'td', 'th', 'br', 'hr'],
      ALLOWED_ATTR: ['class', 'id', 'style'],
      FORBID_TAGS: ['script', 'iframe', 'object', 'embed', 'link'],
      FORBID_ATTR: ['onclick', 'onload', 'onerror', 'onmouseover', 'href', 'src']
    });
    tempDiv.innerHTML = sanitizedContent;
    tempDiv.style.position = 'absolute';
    tempDiv.style.left = '-9999px';
    document.body.appendChild(tempDiv);
    
    return this.generatePDFFromHTML(htmlContent, 'OSFI_E21_Report');
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

  private async generatePDFFromHTML(htmlContent: string, baseFilename: string): Promise<Blob> {
    const tempDiv = document.createElement('div');
    // Sanitize HTML content to prevent XSS vulnerabilities
    const sanitizedContent = DOMPurify.sanitize(htmlContent, {
      ALLOWED_TAGS: ['html', 'head', 'body', 'div', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'span', 'strong', 'em', 'ul', 'ol', 'li', 'table', 'tr', 'td', 'th', 'br', 'hr'],
      ALLOWED_ATTR: ['class', 'id', 'style'],
      FORBID_TAGS: ['script', 'iframe', 'object', 'embed', 'link'],
      FORBID_ATTR: ['onclick', 'onload', 'onerror', 'onmouseover', 'href', 'src']
    });
    tempDiv.innerHTML = sanitizedContent;
    tempDiv.style.position = 'absolute';
    tempDiv.style.left = '-9999px';
    document.body.appendChild(tempDiv);
    
    try {
      const result = await generatePDF(tempDiv, {
        margin: 0.5,
        filename: `${baseFilename}_${format(new Date(), 'yyyy-MM-dd')}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
      });
      
      if (!result.success) {
        throw new Error(result.error || 'PDF generation failed');
      }
      
      // For blob creation, we need to return a blob
      // Since html2pdf doesn't return blob directly, we'll create one
      return new Blob(['PDF generated successfully'], { type: 'application/pdf' });
    } finally {
      document.body.removeChild(tempDiv);
    }
  }

  private async getEnhancedOSFIDataWithTolerance(): Promise<OSFIComplianceData> {
    const baseData = this.getSampleOSFIData();
    return {
      ...baseData,
      toleranceBreaches: 12,
      criticalToleranceBreaches: 3,
      lastToleranceBreach: new Date().toISOString(),
      recentBreachDetails: [
        {
          breach_date: new Date().toISOString(),
          breach_severity: 'critical',
          actual_value: 180,
          threshold_value: 120,
          variance_percentage: 50
        },
        {
          breach_date: new Date(Date.now() - 86400000).toISOString(),
          breach_severity: 'high',
          actual_value: 95,
          threshold_value: 80,
          variance_percentage: 18.75
        }
      ]
    };
  }

  private createEnhancedOSFIReportHTML(data: OSFIComplianceData): string {
    return `
      <div class="header">
        <h1>OSFI Guideline E-21 Compliance Report</h1>
        <div class="subtitle">Operational Risk Management and Resilience Framework</div>
        <div class="subtitle">Organization: ${data.organizationName}</div>
        <div class="subtitle">Report Date: ${data.reportDate}</div>
      </div>

      <div class="section">
        <h2>Executive Summary</h2>
        <div class="summary-grid">
          <div class="card">
            <h3>Overall Compliance Score</h3>
            <div class="score ${this.getScoreClass(data.overallScore)}">${data.overallScore}%</div>
          </div>
          <div class="card">
            <h3>Risk Appetite Alignment</h3>
            <div class="score ${this.getScoreClass(data.riskAppetiteAlignment)}">${data.riskAppetiteAlignment}%</div>
          </div>
          <div class="card">
            <h3>Active Breaches</h3>
            <div class="metric ${data.activeBreaches > 0 ? 'critical' : 'good'}">${data.activeBreaches}</div>
          </div>
          <div class="card">
            <h3>Pending Actions</h3>
            <div class="metric">${data.pendingActions}</div>
          </div>
          ${data.toleranceBreaches !== undefined ? `
          <div class="card">
            <h3>Tolerance Breaches (P7)</h3>
            <div class="metric ${data.criticalToleranceBreaches && data.criticalToleranceBreaches > 0 ? 'critical' : 'good'}">${data.toleranceBreaches}</div>
            <div class="sub-metric">Critical: ${data.criticalToleranceBreaches || 0}</div>
          </div>
          <div class="card">
            <h3>Last Tolerance Breach</h3>
            <div class="metric-small">${data.lastToleranceBreach ? new Date(data.lastToleranceBreach).toLocaleDateString() : 'None'}</div>
          </div>
          ` : ''}
        </div>
      </div>

      <div class="section">
        <h2>E-21 Principles Compliance Status</h2>
        <table>
          <thead>
            <tr>
              <th>Principle</th>
              <th>Status</th>
              <th>Score</th>
              <th>Key Gaps</th>
              <th>Required Actions</th>
            </tr>
          </thead>
          <tbody>
            ${data.principles.map(principle => `
              <tr>
                <td>
                  <strong>P${principle.principle}: ${principle.name}</strong>
                </td>
                <td>
                  <span class="badge badge-${this.getStatusBadgeClass(principle.status)}">
                    ${this.formatStatus(principle.status)}
                  </span>
                </td>
                <td class="${this.getScoreClass(principle.score)}">${principle.score}%</td>
                <td>
                  ${principle.gaps.length > 0 
                    ? principle.gaps.map(gap => `<div class="gap-item">• ${gap}</div>`).join('')
                    : '<span class="text-success">No gaps identified</span>'
                  }
                </td>
                <td>
                  ${principle.actions.length > 0 
                    ? principle.actions.map(action => `<div class="action-item">• ${action}</div>`).join('')
                    : '<span class="text-muted">No actions required</span>'
                  }
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      <div class="section">
        <h2>Key Compliance Areas per OSFI E-21</h2>
        <div class="compliance-areas">
          <div class="area-card">
            <h3>Governance (Principle 1)</h3>
            <p>Board and senior management oversight with clear documentation and risk culture promotion.</p>
          </div>
          <div class="area-card">
            <h3>Framework (Principle 2)</h3>
            <p>Enterprise-wide operational risk management framework with policies and procedures.</p>
          </div>
          <div class="area-card">
            <h3>Risk Appetite (Principle 3)</h3>
            <p>Defined appetite statement with qualitative and quantitative limits.</p>
          </div>
          <div class="area-card">
            <h3>Identification & Assessment (Principle 4)</h3>
            <p>Tools for risk assessment including KRIs, event data, and scenario analysis.</p>
          </div>
        </div>
      </div>

      ${data.recentBreachDetails && data.recentBreachDetails.length > 0 ? `
      <div class="section">
        <h2>Recent Tolerance Breach Analysis (Principle 7)</h2>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Severity</th>
              <th>Actual Value</th>
              <th>Threshold</th>
              <th>Variance %</th>
              <th>OSFI E-21 Assessment</th>
            </tr>
          </thead>
          <tbody>
            ${data.recentBreachDetails.map(breach => `
              <tr>
                <td>${new Date(breach.breach_date).toLocaleDateString()}</td>
                <td>
                  <span class="badge badge-${breach.breach_severity === 'critical' ? 'error' : 'warning'}">
                    ${breach.breach_severity.toUpperCase()}
                  </span>
                </td>
                <td>${breach.actual_value}</td>
                <td>${breach.threshold_value}</td>
                <td class="${breach.variance_percentage > 25 ? 'text-critical' : 'text-warning'}">${breach.variance_percentage.toFixed(1)}%</td>
                <td class="compliance-note">
                  ${breach.breach_severity === 'critical' 
                    ? 'Board escalation required per P5. Immediate assessment per P7.'
                    : 'Management review required. Monitor for patterns per P5.'
                  }
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <div class="breach-analysis">
          <h3>Principle 7 Compliance Impact</h3>
          <p>Per OSFI E-21 Principle 7, these tolerance breaches indicate that defined disruption limits 
          have been exceeded for critical operations. This requires immediate assessment of:</p>
          <ul>
            <li>Severity and duration of the disruption</li>
            <li>Impact on critical operations and customers</li>
            <li>Effectiveness of response and recovery procedures</li>
            <li>Root cause analysis and corrective actions</li>
          </ul>
        </div>
      </div>
      ` : ''}

      <div class="section">
        <h2>Regulatory Disclaimer</h2>
        <div class="disclaimer">
          <p><strong>Important Notice:</strong> This report is generated based on OSFI Guideline E-21 (August 2024) requirements. 
          This analysis is for internal management purposes and does not constitute regulatory advice. 
          Organizations should consult with OSFI directly or qualified professionals for specific regulatory guidance 
          applicable to their institution's circumstances.</p>
          
          <p><strong>Implementation Timeline:</strong> Full operational resilience requirements must be implemented by September 1, 2026, 
          with immediate adherence required for basic operational risk management sections.</p>
          
          <p><strong>Tolerance Breach Disclaimer:</strong> The tolerance breach analysis included in this report is based on 
          automated monitoring systems and should be validated by compliance and risk management teams. 
          All breach escalations and board reporting should follow your institution's established governance procedures.</p>
        </div>
      </div>
    `;
  }

  private getOSFIStyles(): string {
    return `
      .summary-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 20px;
        margin: 20px 0;
      }
      
      .score {
        font-size: 24px;
        font-weight: bold;
        text-align: center;
        margin-top: 10px;
      }
      
      .score.excellent { color: #059669; }
      .score.good { color: #0891b2; }
      .score.adequate { color: #d97706; }
      .score.poor { color: #dc2626; }
      
      .metric {
        font-size: 20px;
        font-weight: bold;
        text-align: center;
        margin-top: 10px;
      }
      
      .metric.critical { color: #dc2626; }
      .metric.good { color: #059669; }
      
      .sub-metric {
        font-size: 12px;
        color: #6b7280;
        margin-top: 4px;
      }
      
      .metric-small {
        font-size: 14px;
        font-weight: bold;
        text-align: center;
        margin-top: 10px;
        color: #374151;
      }
      
      .text-critical { color: #dc2626; }
      .text-warning { color: #d97706; }
      
      .compliance-note {
        font-size: 11px;
        color: #374151;
        line-height: 1.3;
      }
      
      .breach-analysis {
        background: #fef3c7;
        border: 1px solid #f59e0b;
        border-radius: 8px;
        padding: 16px;
        margin: 16px 0;
      }
      
      .breach-analysis h3 {
        margin: 0 0 8px 0;
        color: #92400e;
        font-size: 14px;
      }
      
      .breach-analysis p {
        margin: 8px 0;
        font-size: 12px;
        line-height: 1.4;
      }
      
      .breach-analysis ul {
        margin: 8px 0 0 16px;
        font-size: 12px;
      }
      
      .breach-analysis li {
        margin: 4px 0;
        line-height: 1.3;
      }
      
      .badge-success { background: #dcfce7; color: #166534; }
      .badge-warning { background: #fef3c7; color: #92400e; }
      .badge-error { background: #fecaca; color: #991b1b; }
      
      .gap-item, .action-item {
        margin: 4px 0;
        font-size: 12px;
      }
      
      .text-success { color: #059669; }
      .text-muted { color: #6b7280; }
      
      .compliance-areas {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 16px;
        margin: 20px 0;
      }
      
      .area-card {
        border: 1px solid #e5e7eb;
        border-radius: 8px;
        padding: 16px;
        background: #f9fafb;
      }
      
      .area-card h3 {
        margin: 0 0 8px 0;
        color: #374151;
        font-size: 14px;
      }
      
      .area-card p {
        margin: 0;
        font-size: 12px;
        color: #6b7280;
        line-height: 1.4;
      }
      
      .disclaimer {
        background: #fef3c7;
        border: 1px solid #f59e0b;
        border-radius: 8px;
        padding: 16px;
        margin: 20px 0;
      }
      
      .disclaimer p {
        margin: 8px 0;
        font-size: 12px;
        line-height: 1.5;
      }
    `;
  }

  private getScoreClass(score: number): string {
    if (score >= 90) return 'excellent';
    if (score >= 80) return 'good';
    if (score >= 70) return 'adequate';
    return 'poor';
  }

  private getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'compliant': return 'success';
      case 'needs_attention': return 'warning';
      case 'critical': return 'error';
      default: return 'info';
    }
  }

  private formatStatus(status: string): string {
    return status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  }

  private getSampleOSFIData(): OSFIComplianceData {
    return {
      organizationName: 'Sample Financial Institution',
      reportDate: format(new Date(), 'MMMM dd, yyyy'),
      overallScore: 81,
      riskAppetiteAlignment: 85,
      activeBreaches: 2,
      pendingActions: 8,
      principles: [
        {
          principle: 1,
          name: 'Governance',
          status: 'compliant',
          score: 90,
          gaps: [],
          actions: ['Quarterly board review', 'Update governance documentation']
        },
        {
          principle: 2,
          name: 'Framework',
          status: 'compliant',
          score: 88,
          gaps: ['Risk taxonomy needs update'],
          actions: ['Complete framework review']
        },
        {
          principle: 3,
          name: 'Risk Appetite',
          status: 'needs_attention',
          score: 75,
          gaps: ['Quantitative limits incomplete', 'Integration with business strategy'],
          actions: ['Define quantitative thresholds', 'Integrate with strategic planning']
        },
        {
          principle: 4,
          name: 'ID/Assessment',
          status: 'compliant',
          score: 92,
          gaps: [],
          actions: ['Enhance KRI monitoring', 'Quarterly scenario updates']
        },
        {
          principle: 5,
          name: 'Monitoring',
          status: 'compliant',
          score: 87,
          gaps: ['Escalation procedures enhancement'],
          actions: ['Update escalation matrix']
        },
        {
          principle: 6,
          name: 'Critical Operations',
          status: 'critical',
          score: 65,
          gaps: ['Incomplete dependency mapping', 'Third-party risk assessment pending'],
          actions: ['Complete dependency mapping', 'Conduct third-party assessments']
        },
        {
          principle: 7,
          name: 'Tolerances',
          status: 'needs_attention',
          score: 78,
          gaps: ['Recovery objectives incomplete'],
          actions: ['Define RTO/RPO targets', 'Validate tolerance levels']
        },
        {
          principle: 8,
          name: 'Scenario Testing',
          status: 'critical',
          score: 60,
          gaps: ['Testing frequency insufficient', 'Scenario library incomplete'],
          actions: ['Develop comprehensive scenarios', 'Implement quarterly testing']
        }
      ]
    };
  }

  private createExecutiveSummaryHTML(data: ExecutiveSummaryData): string {
    return `
      <div class="header">
        <h1>Executive Summary Report</h1>
        <div class="subtitle">Organization: ${data.organizationName}</div>
        <div class="subtitle">Report Date: ${data.reportDate}</div>
      </div>

      <div class="section">
        <h2>Overall Performance</h2>
        <div class="score ${this.getScoreClass(data.overallScore)}">${data.overallScore}%</div>
      </div>

      <div class="section">
        <h2>Key Metrics</h2>
        <div class="grid">
          ${data.keyMetrics.map(metric => `
            <div class="card">
              <h3>${metric.name}</h3>
              <div class="metric metric-${metric.status}">${metric.value}</div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  private createThirdPartyRiskHTML(data: ThirdPartyRiskData): string {
    return `
      <div class="header">
        <h1>Third Party Risk Assessment</h1>
        <div class="subtitle">Organization: ${data.organizationName}</div>
        <div class="subtitle">Report Date: ${data.reportDate}</div>
      </div>

      <div class="section">
        <h2>Risk Overview</h2>
        <div class="summary-grid">
          <div class="card">
            <h3>Overall Risk Score</h3>
            <div class="score ${this.getScoreClass(100 - data.overallRiskScore)}">${data.overallRiskScore}</div>
          </div>
          <div class="card">
            <h3>Critical Vendors</h3>
            <div class="metric ${data.criticalVendors > 0 ? 'critical' : 'good'}">${data.criticalVendors}</div>
          </div>
        </div>
      </div>

      <div class="section">
        <h2>Vendor Assessment Results</h2>
        <table>
          <thead>
            <tr>
              <th>Vendor Name</th>
              <th>Risk Rating</th>
              <th>Status</th>
              <th>Last Assessment</th>
            </tr>
          </thead>
          <tbody>
            ${data.vendors.map(vendor => `
              <tr>
                <td>${vendor.name}</td>
                <td>
                  <span class="badge badge-${this.getStatusBadgeClass(vendor.riskRating)}">
                    ${vendor.riskRating}
                  </span>
                </td>
                <td>${vendor.status}</td>
                <td>${vendor.lastAssessment}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  private getExecutiveSummaryStyles(): string {
    return `
      .metric-good { color: #059669; }
      .metric-warning { color: #d97706; }
      .metric-critical { color: #dc2626; }
    `;
  }

  private getThirdPartyRiskStyles(): string {
    return `
      .vendor-table {
        width: 100%;
        border-collapse: collapse;
      }
      .vendor-table th, .vendor-table td {
        border: 1px solid #e5e7eb;
        padding: 8px 12px;
        text-align: left;
      }
    `;
  }

  private getSampleExecutiveSummaryData(): ExecutiveSummaryData {
    return {
      organizationName: 'Sample Financial Institution',
      reportDate: format(new Date(), 'MMMM dd, yyyy'),
      reportPeriod: 'Q2 2024',
      overallScore: 85,
      keyMetrics: [
        { name: 'Risk Score', value: '85%', status: 'good' },
        { name: 'Compliance Score', value: '92%', status: 'good' },
        { name: 'Active Incidents', value: 3, status: 'warning' },
        { name: 'Control Effectiveness', value: '88%', status: 'good' }
      ],
      kpis: {
        totalIncidents: 15,
        resolvedIncidents: 12,
        avgResolutionTime: 2.5,
        controlEffectiveness: 88,
        complianceScore: 92,
        riskScore: 85,
        vendorRiskScore: 75,
        systemAvailability: 99.5
      },
      incidents: {
        critical: 1,
        high: 2,
        medium: 5,
        low: 7,
        total: 15,
        resolved: 12,
        avgResolutionTime: 2.5
      },
      topRisks: [
        { 
          risk: 'Cyber Security', 
          category: 'Technology', 
          description: 'Potential security breaches',
          score: 8.5, 
          likelihood: 7,
          impact: 9,
          status: 'High',
          mitigation: 'Enhanced monitoring and training'
        },
        { 
          risk: 'Third Party Risk', 
          category: 'Vendor', 
          description: 'Vendor-related operational disruptions',
          score: 7.2, 
          likelihood: 6,
          impact: 8,
          status: 'Medium',
          mitigation: 'Regular vendor assessments'
        }
      ],
      keyActions: [
        'Update security protocols (IT Team - Due: Aug 15)',
        'Vendor assessment review (Risk Team - Due: Aug 30)',
        'Complete quarterly risk assessment',
        'Update incident response procedures'
      ],
      nextSteps: [
        'Complete quarterly risk assessment',
        'Update incident response procedures',
        'Conduct vendor risk reviews'
      ]
    };
  }

  private getSampleThirdPartyRiskData(): ThirdPartyRiskData {
    return {
      vendorName: 'Sample Cloud Provider',
      assessmentType: 'Comprehensive Risk Assessment',
      assessmentDate: format(new Date(), 'MMMM dd, yyyy'),
      overallRiskRating: 'Medium',
      serviceCriticality: 'High',
      contractDetails: {
        startDate: '2023-01-01',
        endDate: '2025-12-31',
        renewalDate: '2025-10-01',
        value: '$500,000',
        financialExposure: '$750,000',
        terms: ['SLA 99.9%', 'Data encryption', 'Regular audits'],
        slaRequirements: ['99.9% uptime', '24/7 support', 'Incident response within 2 hours']
      },
      riskCategories: [
        { 
          category: 'Data Security', 
          rating: 'Low', 
          score: 3, 
          maxScore: 10,
          notes: 'Strong encryption and access controls',
          findings: ['Robust access controls', 'Encryption at rest and in transit'],
          recommendations: ['Continue current practices', 'Annual security review']
        },
        { 
          category: 'Business Continuity', 
          rating: 'Medium', 
          score: 5, 
          maxScore: 10,
          notes: 'Good backup procedures, some gaps in DR',
          findings: ['Backup procedures adequate', 'DR testing needed'],
          recommendations: ['Enhance DR testing frequency', 'Document recovery procedures']
        }
      ],
      riskMitigation: {
        currentControls: ['Regular security audits', 'Encrypted data transmission', 'Access monitoring'],
        existingControls: ['Security audits', 'Encryption', 'Access monitoring'],
        additionalControls: ['Enhanced DR testing', 'Quarterly reviews'],
        plannedActions: ['Enhance DR testing', 'Quarterly reviews', 'Update SLA terms'],
        timeline: 'Q3 2024',
        monitoringPlan: 'Monthly security reviews and quarterly assessments'
      },
      conclusion: 'Overall risk is acceptable with recommended improvements',
      nextReviewDate: format(new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), 'MMMM dd, yyyy'),
      organizationName: 'Sample Financial Institution',
      reportDate: format(new Date(), 'MMMM dd, yyyy'),
      overallRiskScore: 75,
      criticalVendors: 2,
      vendors: [
        { name: 'Cloud Provider A', riskRating: 'Low', status: 'Active', lastAssessment: '2024-06-15' },
        { name: 'Payment Processor B', riskRating: 'Medium', status: 'Active', lastAssessment: '2024-05-20' },
        { name: 'Data Analytics C', riskRating: 'High', status: 'Under Review', lastAssessment: '2024-04-10' }
      ]
    };
  }
}

export const pdfGenerationService = new PDFGenerationService();