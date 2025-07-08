// Framework Content Generation Helpers
// Provides sector-specific content for intelligent framework generation

import { CANADIAN_CONTROL_EXAMPLES, REGULATORY_FRAMEWORKS, BUSINESS_FUNCTIONS, RISK_CATEGORIES, getContextualDefaults } from '@/lib/canadian-banking-defaults';

export class FrameworkContentGenerator {
  static getContextualDefaults(subSector: string) {
    return getContextualDefaults(subSector);
  }

  static getSectorSpecificRequirements(subSector: string): string[] {
    const requirements = {
      banking: [
        'OSFI E-21 operational risk management requirements',
        'Basel III capital adequacy compliance',
        'FINTRAC anti-money laundering procedures',
        'PIPEDA privacy protection measures'
      ],
      credit_union: [
        'Provincial regulatory compliance',
        'OSFI guidance adoption',
        'Member protection protocols',
        'Cooperative governance principles'
      ],
      fintech: [
        'Innovation sandbox compliance',
        'Consumer protection requirements',
        'Data security standards',
        'Partnership risk management'
      ],
      default: [
        'Industry-specific regulatory compliance',
        'Risk management best practices',
        'Operational resilience requirements',
        'Stakeholder protection measures'
      ]
    };

    return requirements[subSector as keyof typeof requirements] || requirements.default;
  }

  static getRiskCategoriesForSector(subSector: string) {
    if (subSector === 'banking') {
      return RISK_CATEGORIES;
    }
    return RISK_CATEGORIES.filter(cat => 
      ['operational', 'strategic', 'reputation', 'compliance', 'cybersecurity'].includes(cat.value)
    );
  }

  static getKeyMetricsForCategory(category: string): string[] {
    const metrics = {
      operational: ['System uptime %', 'Processing error rate', 'SLA compliance %'],
      credit: ['Default rate %', 'Loss given default', 'Credit concentration ratio'],
      market: ['VaR (Value at Risk)', 'Interest rate sensitivity', 'Currency exposure'],
      liquidity: ['Liquidity coverage ratio', 'Net stable funding ratio', 'Cash flow projections'],
      strategic: ['ROE variance', 'Market share change', 'Strategic initiative success rate'],
      reputation: ['Customer satisfaction score', 'Media sentiment analysis', 'Complaint resolution time'],
      compliance: ['Regulatory breach count', 'Audit findings', 'Training completion rate'],
      cybersecurity: ['Security incidents count', 'Mean time to detection', 'Patch compliance %']
    };

    return metrics[category as keyof typeof metrics] || ['Generic metric 1', 'Generic metric 2'];
  }

  static getToleranceThresholds(category: string, maturity: string) {
    const baseThresholds = {
      operational: { green: '< 0.1%', yellow: '0.1-0.5%', red: '> 0.5%' },
      cybersecurity: { green: '0 incidents', yellow: '1-2 incidents', red: '> 2 incidents' },
      compliance: { green: '0 breaches', yellow: '1 minor breach', red: '> 1 breach' },
      default: { green: 'Low', yellow: 'Medium', red: 'High' }
    };

    const thresholds = baseThresholds[category as keyof typeof baseThresholds] || baseThresholds.default;
    
    // Adjust for maturity
    if (maturity === 'advanced') {
      return { ...thresholds, note: 'Thresholds adjusted for advanced risk maturity' };
    }
    
    return thresholds;
  }

  static getBusinessFunctionsForSector(subSector: string) {
    if (subSector === 'banking') {
      return BUSINESS_FUNCTIONS;
    }
    
    return [
      { name: "Core Operations", criticality: "critical" },
      { name: "Customer Service", criticality: "high" },
      { name: "IT Infrastructure", criticality: "critical" },
      { name: "Risk Management", criticality: "high" },
      { name: "Compliance", criticality: "high" },
      { name: "Human Resources", criticality: "medium" },
      { name: "Finance & Accounting", criticality: "high" },
      { name: "Marketing", criticality: "low" }
    ];
  }

  static getMaxDowntime(criticality: string): string {
    const downtimes = {
      critical: '< 1 hour',
      high: '< 4 hours',
      medium: '< 24 hours',
      low: '< 72 hours'
    };
    return downtimes[criticality as keyof typeof downtimes] || '< 24 hours';
  }

  static getRTO(criticality: string): string {
    const rtos = {
      critical: '30 minutes',
      high: '2 hours',
      medium: '8 hours',
      low: '24 hours'
    };
    return rtos[criticality as keyof typeof rtos] || '8 hours';
  }

  static getRPO(criticality: string): string {
    const rpos = {
      critical: '15 minutes',
      high: '1 hour',
      medium: '4 hours',
      low: '24 hours'
    };
    return rpos[criticality as keyof typeof rpos] || '4 hours';
  }

  static getMinServiceLevel(criticality: string): string {
    const levels = {
      critical: '99.9%',
      high: '99.5%',
      medium: '99%',
      low: '95%'
    };
    return levels[criticality as keyof typeof levels] || '99%';
  }

  static getOperationalThresholds(subSector: string) {
    return {
      no_impact: '< 15 minutes downtime',
      minor_impact: '15 minutes - 1 hour downtime',
      moderate_impact: '1-4 hours downtime',
      severe_impact: '4-24 hours downtime',
      extreme_impact: '> 24 hours downtime'
    };
  }

  static getFinancialThresholds(assetSize: number) {
    const baseThresholds = {
      negligible: '< $10K',
      minor: '$10K - $100K',
      moderate: '$100K - $1M',
      major: '$1M - $10M',
      catastrophic: '> $10M'
    };

    // Adjust based on asset size
    if (assetSize > 10000000000) { // > $10B
      return {
        negligible: '< $100K',
        minor: '$100K - $1M',
        moderate: '$1M - $10M',
        major: '$10M - $100M',
        catastrophic: '> $100M'
      };
    }

    return baseThresholds;
  }

  static getRegulatoryThresholds(subSector: string) {
    return {
      no_breach: 'Full compliance',
      minor_breach: 'Technical violation, no customer impact',
      material_breach: 'Customer impact, regulatory notification required',
      significant_breach: 'Material customer harm, formal regulatory action'
    };
  }

  static getControlExamplesForSector(subSector: string) {
    if (subSector === 'banking') {
      return CANADIAN_CONTROL_EXAMPLES;
    }

    return [
      {
        title: "Access Control Management",
        description: "Role-based access controls for all critical systems",
        framework: "iso_27001",
        frequency: "continuous",
        type: "preventive"
      },
      {
        title: "Data Backup Verification",
        description: "Regular testing of data backup and recovery procedures",
        framework: "iso_27001",
        frequency: "monthly",
        type: "detective"
      },
      {
        title: "Incident Response Procedures",
        description: "Comprehensive incident response and recovery procedures",
        framework: "nist",
        frequency: "as_needed",
        type: "corrective"
      }
    ];
  }

  static getRegulatoryFrameworksForSector(subSector: string) {
    if (subSector === 'banking') {
      return REGULATORY_FRAMEWORKS.filter(f => 
        ['osfi_e21', 'basel_iii', 'pipeda', 'fintrac', 'ifrs'].includes(f.value)
      );
    }

    return REGULATORY_FRAMEWORKS.filter(f => 
      ['pipeda', 'csa', 'ifrs'].includes(f.value)
    );
  }

  static getKeyRequirements(frameworkValue: string): string[] {
    const requirements = {
      osfi_e21: [
        'Operational risk identification and assessment',
        'Three lines of defense implementation',
        'Board and senior management oversight',
        'Regular operational risk reporting'
      ],
      basel_iii: [
        'Capital adequacy maintenance',
        'Liquidity risk management',
        'Stress testing implementation',
        'Risk-weighted asset calculation'
      ],
      pipeda: [
        'Personal information collection consent',
        'Privacy policy disclosure',
        'Data breach notification procedures',
        'Individual access rights provision'
      ],
      fintrac: [
        'Customer due diligence procedures',
        'Suspicious transaction reporting',
        'Record keeping requirements',
        'Compliance program implementation'
      ]
    };

    return requirements[frameworkValue as keyof typeof requirements] || [
      'Regulatory compliance monitoring',
      'Policy implementation',
      'Regular reporting',
      'Audit and validation'
    ];
  }

  static getComplianceActivities(frameworkValue: string): string[] {
    const activities = {
      osfi_e21: [
        'Quarterly operational risk assessments',
        'Annual board reporting',
        'Monthly KRI monitoring',
        'Tri-annual framework review'
      ],
      pipeda: [
        'Privacy impact assessments',
        'Annual privacy policy review',
        'Quarterly staff training',
        'Incident response testing'
      ],
      fintrac: [
        'Daily transaction monitoring',
        'Monthly suspicious activity review',
        'Annual AML program audit',
        'Quarterly staff certification'
      ]
    };

    return activities[frameworkValue as keyof typeof activities] || [
      'Regular monitoring activities',
      'Periodic assessments',
      'Training and awareness',
      'Audit and validation'
    ];
  }

  static getReportingFrequency(frameworkValue: string): string {
    const frequencies = {
      osfi_e21: 'Quarterly to regulator, Monthly to board',
      basel_iii: 'Quarterly capital reporting',
      pipeda: 'Annual privacy report, Immediate breach notification',
      fintrac: 'Monthly STR submissions, Annual compliance report'
    };

    return frequencies[frameworkValue as keyof typeof frequencies] || 'As required by regulation';
  }

  static getPenaltiesInfo(frameworkValue: string): string {
    const penalties = {
      osfi_e21: 'OSFI supervisory action, potential restrictions on business activities',
      pipeda: 'Privacy Commissioner investigation, potential federal court action',
      fintrac: 'Administrative penalties up to $2M per violation',
      basel_iii: 'Capital add-ons, restrictions on distributions'
    };

    return penalties[frameworkValue as keyof typeof penalties] || 'Regulatory sanctions and penalties';
  }

  static generateComplianceCalendar(frameworks: any[]) {
    return [
      { month: 'January', activities: ['Annual AML program review', 'Q4 operational risk reporting'] },
      { month: 'April', activities: ['Q1 regulatory submissions', 'Annual privacy policy review'] },
      { month: 'July', activities: ['Q2 stress testing', 'Mid-year compliance assessment'] },
      { month: 'October', activities: ['Q3 reporting', 'Annual framework effectiveness review'] }
    ];
  }

  static getScenarioTypesForSector(subSector: string) {
    const bankingScenarios = [
      {
        category: 'Economic Stress Scenarios',
        scenarios: ['Severe recession', 'Interest rate shock', 'Credit market disruption'],
        frequency: 'Annual',
        regulatory_requirement: 'OSFI stress testing guidelines',
        key_metrics: ['Credit losses', 'Capital ratios', 'Liquidity positions']
      },
      {
        category: 'Operational Risk Scenarios',
        scenarios: ['Cyber attack', 'Key system failure', 'Major fraud event'],
        frequency: 'Semi-annual',
        regulatory_requirement: 'OSFI E-21 operational risk management',
        key_metrics: ['Recovery time', 'Financial impact', 'Customer impact']
      }
    ];

    const generalScenarios = [
      {
        category: 'Business Continuity Scenarios',
        scenarios: ['IT system failure', 'Natural disaster', 'Pandemic response'],
        frequency: 'Annual',
        regulatory_requirement: 'Industry best practices',
        key_metrics: ['Service availability', 'Recovery time', 'Cost impact']
      }
    ];

    return subSector === 'banking' ? bankingScenarios : generalScenarios;
  }
}