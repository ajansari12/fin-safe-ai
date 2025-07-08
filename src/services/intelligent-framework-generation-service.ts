import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { FrameworkContentGenerator } from './framework-content-generators';
import { 
  OrganizationalProfile, 
  GeneratedFrameworkData, 
  FrameworkComponent,
  SectorThreshold,
  FrameworkGenerationRule,
  ControlLibraryItem,
  RegulatoryMapping
} from '@/types/organizational-intelligence';

export interface FrameworkGenerationRequest {
  profileId: string;
  frameworkTypes: string[];
  customizations?: Record<string, any>;
}

class IntelligentFrameworkGenerationService {
  async generateFrameworks(request: FrameworkGenerationRequest): Promise<any[]> {
    const { profileId, frameworkTypes, customizations = {} } = request;
    
    console.log('Starting framework generation with request:', request);
    
    try {
      // Get organizational profile
      const profile = await this.getOrganizationalProfile(profileId);
      if (!profile) {
        throw new Error('Organizational profile not found');
      }

      console.log('Using organizational profile:', profile);

      // Get organization ID from profile
      const organizationId = profile.organization_id;
      if (!organizationId) {
        throw new Error('Organization ID not found in profile');
      }

      const results = [];
      
      // Update generation status
      await this.updateGenerationStatus(organizationId, profileId, 'in_progress', 'Generating frameworks');

      // Generate frameworks for each requested type
      for (let i = 0; i < frameworkTypes.length; i++) {
        const frameworkType = frameworkTypes[i];
        const progress = Math.round(((i + 1) / frameworkTypes.length) * 100);
        
        try {
          console.log(`Generating ${frameworkType} framework...`);
          
          // Update progress
          await this.updateGenerationStatus(
            organizationId, 
            profileId, 
            'in_progress', 
            `Generating ${frameworkType} framework`,
            progress
          );

          // Generate framework content using AI or templates
          const frameworkContent = await this.generateFrameworkContent(frameworkType, profile);
          
          // Calculate effectiveness score based on profile maturity and content quality
          const effectivenessScore = this.calculateEffectivenessScore(profile, frameworkContent);
          
          // Generate framework components
          const components = this.generateFrameworkComponents(frameworkType, frameworkContent);

          const { data: framework, error: frameworkError } = await supabase
            .from('generated_frameworks')
            .insert({
              organization_id: organizationId,
              framework_type: frameworkType,
              framework_name: frameworkContent.name,
              framework_version: '1.0',
              framework_data: frameworkContent,
              implementation_status: 'generated',
              effectiveness_score: effectivenessScore,
              generation_metadata: {
                generated_at: new Date().toISOString(),
                profile_used: profile.id,
                generation_method: 'intelligent_ai',
                customizations_applied: customizations
              }
            })
            .select()
            .single();

          if (frameworkError) {
            console.error('Error creating framework:', frameworkError);
            throw frameworkError;
          }

          console.log('Framework created successfully:', framework);

          // Create framework components
          if (components && components.length > 0) {
            const { error: componentsError } = await supabase
              .from('framework_components')
              .insert(
                components.map(component => ({
                  framework_id: framework.id,
                  component_type: component.type,
                  component_name: component.name,
                  component_description: component.description,
                  component_data: component.data || {},
                  implementation_priority: component.priority || 1,
                  estimated_effort_hours: component.effort_hours || 40
                }))
              );

            if (componentsError) {
              console.error('Error creating framework components:', componentsError);
              // Don't throw here - framework was created successfully
            } else {
              console.log(`Created ${components.length} components for framework ${framework.id}`);
            }
          }

          results.push(framework);
        } catch (error) {
          console.error(`Error generating ${frameworkType} framework:`, error);
          // Continue with other frameworks even if one fails
        }
      }
      
      // Mark generation as completed
      await this.updateGenerationStatus(organizationId, profileId, 'completed', 'Framework generation completed', 100);
      
      console.log('Framework generation completed. Total frameworks generated:', results.length);
      return results;
      
    } catch (error) {
      console.error('Framework generation failed:', error);
      toast.error(`Framework generation failed: ${error.message}`);
      throw error;
    }
  }

  private async getOrganizationalProfile(profileId: string): Promise<OrganizationalProfile | null> {
    try {
      const { data, error } = await supabase
        .from('organizational_profiles')
        .select('*')
        .eq('id', profileId)
        .single();

      if (error) {
        console.error('Error fetching organizational profile:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error fetching organizational profile:', error);
      return null;
    }
  }

  private async updateGenerationStatus(
    organizationId: string, 
    profileId: string, 
    status: string, 
    currentStep?: string, 
    progress?: number
  ) {
    try {
      await supabase
        .from('framework_generation_status')
        .upsert({
          organization_id: organizationId,
          profile_id: profileId,
          status,
          current_step: currentStep,
          progress: progress || 0,
          completed_at: status === 'completed' ? new Date().toISOString() : null
        });
    } catch (error) {
      console.error('Error updating generation status:', error);
    }
  }

  private async generateFrameworkContent(frameworkType: string, profile: OrganizationalProfile): Promise<any> {
    switch (frameworkType) {
      case 'governance':
        return this.generateGovernanceFramework(profile);
      case 'risk_appetite':
        return this.generateRiskAppetiteFramework(profile);
      case 'impact_tolerance':
        return this.generateImpactToleranceFramework(profile);
      case 'control':
        return this.generateControlFramework(profile);
      case 'compliance':
        return this.generateComplianceFramework(profile);
      case 'scenario_testing':
        return this.generateScenarioTestingFramework(profile);
      default:
        throw new Error(`Unknown framework type: ${frameworkType}`);
    }
  }

  private async generateGovernanceFramework(profile: OrganizationalProfile): Promise<any> {
    const contextualDefaults = FrameworkContentGenerator.getContextualDefaults(profile.sub_sector);
    
    const frameworkData = {
      name: `${profile.sub_sector === 'banking' ? 'OSFI E-21 Compliant ' : ''}Governance Framework`,
      description: `A comprehensive governance framework tailored for ${profile.sub_sector} organizations with ${profile.employee_count} employees. This framework ensures robust oversight, clear accountability, and effective risk management aligned with Canadian regulatory requirements.`,
      elements: [
        'Board of Directors Oversight and Accountability',
        'Senior Management Risk Governance',
        'Three Lines of Defense Model',
        'Risk Appetite and Tolerance Framework',
        'Governance Policies and Procedures',
        'Regulatory Reporting and Compliance',
        'Performance Monitoring and KPIs',
        'Stakeholder Communication Framework'
      ],
      implementation_guidelines: [
        'Establish clear roles and responsibilities for board and management',
        'Implement quarterly board risk committee meetings',
        'Define risk appetite statements aligned with business strategy',
        'Create governance policy library with annual review cycles',
        'Establish independent risk management function',
        'Implement comprehensive reporting dashboards'
      ],
      regulatory_alignment: contextualDefaults.primaryFrameworks,
      maturity_level: profile.risk_maturity,
      sector_specific_requirements: FrameworkContentGenerator.getSectorSpecificRequirements(profile.sub_sector),
      estimated_implementation_months: profile.employee_count > 500 ? 12 : 8
    };

    return frameworkData;
  }

  private async generateRiskAppetiteFramework(profile: OrganizationalProfile): Promise<any> {
    const riskCategories = FrameworkContentGenerator.getRiskCategoriesForSector(profile.sub_sector);
    const contextualDefaults = FrameworkContentGenerator.getContextualDefaults(profile.sub_sector);
    
    const frameworkData = {
      name: `${profile.sub_sector} Risk Appetite Framework`,
      description: `A comprehensive risk appetite framework defining the organization's willingness to accept risk in pursuit of strategic objectives. Tailored for ${profile.sub_sector} with ${profile.employee_count} employees and ${profile.risk_maturity} risk maturity.`,
      elements: [
        'Risk Appetite Statement and Philosophy',
        'Risk Categories and Definitions',
        'Quantitative Risk Limits and Thresholds',
        'Qualitative Risk Tolerance Guidelines',
        'Early Warning Indicators and Triggers',
        'Escalation Procedures and Governance',
        'Risk Appetite Monitoring and Reporting',
        'Annual Review and Calibration Process'
      ],
      risk_categories: riskCategories.map(cat => ({
        category: cat.label,
        appetite_level: profile.risk_maturity === 'advanced' ? 'moderate' : 'conservative',
        key_metrics: FrameworkContentGenerator.getKeyMetricsForCategory(cat.value),
        tolerance_thresholds: FrameworkContentGenerator.getToleranceThresholds(cat.value, profile.risk_maturity)
      })),
      implementation_guidelines: [
        'Board approval required for risk appetite statement',
        'Quarterly risk appetite vs. actual risk reporting',
        'Monthly monitoring of key risk indicators',
        'Semi-annual stress testing against appetite limits',
        'Annual comprehensive framework review'
      ],
      regulatory_alignment: contextualDefaults.primaryFrameworks,
      estimated_implementation_months: 6,
      success_metrics: [
        'Risk appetite breaches < 5% annually',
        'Management reporting accuracy > 95%',
        'Regulatory compliance score > 90%'
      ]
    };

    return frameworkData;
  }

  private async generateImpactToleranceFramework(profile: OrganizationalProfile): Promise<any> {
    const businessFunctions = FrameworkContentGenerator.getBusinessFunctionsForSector(profile.sub_sector);
    
    const frameworkData = {
      name: `${profile.sub_sector} Impact Tolerance Framework`,
      description: `A comprehensive framework defining maximum acceptable levels of disruption to critical business functions. Designed for ${profile.sub_sector} organizations to ensure business continuity and regulatory compliance.`,
      elements: [
        'Critical Business Function Identification',
        'Impact Tolerance Thresholds Definition',
        'Recovery Time Objectives (RTO)',
        'Recovery Point Objectives (RPO)',
        'Minimum Service Level Requirements',
        'Escalation and Decision-Making Protocols',
        'Impact Assessment Methodologies',
        'Continuous Monitoring and Testing'
      ],
      business_functions: businessFunctions.map(func => ({
        function_name: func.name,
        criticality: func.criticality,
        maximum_downtime: FrameworkContentGenerator.getMaxDowntime(func.criticality),
        recovery_time_objective: FrameworkContentGenerator.getRTO(func.criticality),
        recovery_point_objective: FrameworkContentGenerator.getRPO(func.criticality),
        minimum_service_level: FrameworkContentGenerator.getMinServiceLevel(func.criticality)
      })),
      tolerance_categories: [
        {
          category: 'Operational Disruption',
          tolerance_levels: ['No Impact', 'Minor Impact', 'Moderate Impact', 'Severe Impact', 'Extreme Impact'],
          thresholds: FrameworkContentGenerator.getOperationalThresholds(profile.sub_sector)
        },
        {
          category: 'Financial Impact',
          tolerance_levels: ['Negligible', 'Minor', 'Moderate', 'Major', 'Catastrophic'],
          thresholds: FrameworkContentGenerator.getFinancialThresholds(profile.asset_size)
        },
        {
          category: 'Regulatory Impact',
          tolerance_levels: ['No Breach', 'Minor Breach', 'Material Breach', 'Significant Breach'],
          thresholds: FrameworkContentGenerator.getRegulatoryThresholds(profile.sub_sector)
        }
      ],
      implementation_guidelines: [
        'Conduct business impact analysis for all critical functions',
        'Define clear impact tolerance statements for each function',
        'Establish monitoring systems for real-time impact assessment',
        'Implement automated alerting for tolerance threshold breaches',
        'Conduct quarterly tolerance threshold reviews and updates'
      ],
      estimated_implementation_months: 4
    };

    return frameworkData;
  }

  private async generateControlFramework(profile: OrganizationalProfile): Promise<any> {
    const contextualDefaults = FrameworkContentGenerator.getContextualDefaults(profile.sub_sector);
    const controlExamples = FrameworkContentGenerator.getControlExamplesForSector(profile.sub_sector);
    
    const frameworkData = {
      name: `${profile.sub_sector === 'banking' ? 'OSFI-Compliant ' : ''}Control Framework`,
      description: `A comprehensive internal control framework ensuring operational effectiveness, reliable financial reporting, and regulatory compliance. Designed for ${profile.sub_sector} organizations with ${profile.employee_count} employees.`,
      elements: [
        'Control Environment and Governance',
        'Risk Assessment and Control Design',
        'Control Activities and Procedures',
        'Information Systems and Communication',
        'Monitoring and Continuous Improvement',
        'Three Lines of Defense Implementation',
        'Control Testing and Validation',
        'Remediation and Corrective Actions'
      ],
      control_categories: [
        {
          category: 'Preventive Controls',
          description: 'Controls designed to prevent errors, fraud, or compliance violations',
          examples: controlExamples.filter(c => c.type === 'preventive').slice(0, 3)
        },
        {
          category: 'Detective Controls',
          description: 'Controls designed to identify issues after they occur',
          examples: controlExamples.filter(c => c.type === 'detective').slice(0, 3)
        },
        {
          category: 'Corrective Controls',
          description: 'Controls designed to address identified issues and prevent recurrence',
          examples: controlExamples.filter(c => c.type === 'corrective').slice(0, 2)
        }
      ],
      regulatory_frameworks: contextualDefaults.primaryFrameworks,
      implementation_phases: [
        {
          phase: 'Phase 1: Foundation',
          duration_months: 2,
          activities: ['Control environment assessment', 'Governance structure design', 'Policy framework development']
        },
        {
          phase: 'Phase 2: Design',
          duration_months: 3,
          activities: ['Risk assessment', 'Control design', 'Process documentation']
        },
        {
          phase: 'Phase 3: Implementation',
          duration_months: 4,
          activities: ['Control deployment', 'Training delivery', 'System integration']
        },
        {
          phase: 'Phase 4: Testing & Validation',
          duration_months: 2,
          activities: ['Control testing', 'Effectiveness validation', 'Continuous monitoring setup']
        }
      ],
      success_metrics: [
        'Control effectiveness rating > 85%',
        'Audit findings reduction of 40%',
        'Regulatory compliance score > 95%',
        'Operational risk incidents reduction of 30%'
      ],
      estimated_implementation_months: 11
    };

    return frameworkData;
  }

  private async generateComplianceFramework(profile: OrganizationalProfile): Promise<any> {
    const contextualDefaults = FrameworkContentGenerator.getContextualDefaults(profile.sub_sector);
    const regulatoryFrameworks = FrameworkContentGenerator.getRegulatoryFrameworksForSector(profile.sub_sector);
    
    const frameworkData = {
      name: `${profile.sub_sector} Regulatory Compliance Framework`,
      description: `A comprehensive compliance management framework ensuring adherence to all applicable regulatory requirements. Tailored for ${profile.sub_sector} organizations operating in Canada with focus on proactive compliance monitoring and risk mitigation.`,
      elements: [
        'Regulatory Universe and Obligations Mapping',
        'Compliance Risk Assessment and Monitoring',
        'Policies, Procedures, and Controls',
        'Compliance Training and Awareness',
        'Regulatory Change Management',
        'Compliance Testing and Validation',
        'Regulatory Reporting and Communication',
        'Issue Management and Remediation'
      ],
      regulatory_obligations: regulatoryFrameworks.map(framework => ({
        framework: framework.label,
        key_requirements: FrameworkContentGenerator.getKeyRequirements(framework.value),
        compliance_activities: FrameworkContentGenerator.getComplianceActivities(framework.value),
        reporting_frequency: FrameworkContentGenerator.getReportingFrequency(framework.value),
        penalties_for_breach: FrameworkContentGenerator.getPenaltiesInfo(framework.value)
      })),
      compliance_calendar: FrameworkContentGenerator.generateComplianceCalendar(regulatoryFrameworks),
      monitoring_framework: {
        key_compliance_indicators: [
          'Regulatory submission timeliness (target: 100%)',
          'Compliance training completion (target: 95%)',
          'Policy review currency (target: 100%)',
          'Regulatory breach incidents (target: 0)'
        ],
        reporting_structure: [
          'Monthly compliance dashboard to management',
          'Quarterly board compliance reports',
          'Annual compliance effectiveness assessment'
        ]
      },
      implementation_roadmap: [
        {
          milestone: 'Regulatory Mapping Complete',
          timeline: '6 weeks',
          deliverables: ['Obligation register', 'Gap analysis', 'Risk assessment']
        },
        {
          milestone: 'Framework Design',
          timeline: '8 weeks', 
          deliverables: ['Policies and procedures', 'Control framework', 'Monitoring system']
        },
        {
          milestone: 'Implementation',
          timeline: '12 weeks',
          deliverables: ['Training delivery', 'System deployment', 'Process integration']
        },
        {
          milestone: 'Validation',
          timeline: '4 weeks',
          deliverables: ['Testing results', 'Effectiveness validation', 'Continuous monitoring']
        }
      ],
      estimated_implementation_months: 7,
      success_metrics: [
        'Zero material regulatory breaches',
        'Compliance training completion > 95%',
        'Regulatory submissions 100% on-time',
        'Compliance audit findings < 5 annually'
      ]
    };

    return frameworkData;
  }

  private async generateScenarioTestingFramework(profile: OrganizationalProfile): Promise<any> {
    const scenarioTypes = FrameworkContentGenerator.getScenarioTypesForSector(profile.sub_sector);
    
    const frameworkData = {
      name: `${profile.sub_sector} Scenario Testing & Stress Testing Framework`,
      description: `A comprehensive framework for conducting scenario analysis and stress testing to assess organizational resilience under adverse conditions. Designed for ${profile.sub_sector} organizations to meet regulatory requirements and enhance risk management capabilities.`,
      elements: [
        'Scenario Design and Development',
        'Stress Testing Methodologies',
        'Data Collection and Validation',
        'Model Implementation and Execution',
        'Results Analysis and Interpretation',
        'Management Reporting and Action Plans',
        'Regulatory Submission Requirements',
        'Continuous Framework Enhancement'
      ],
      scenario_categories: scenarioTypes.map(type => ({
        category: type.category,
        scenarios: type.scenarios,
        frequency: type.frequency,
        regulatory_requirement: type.regulatory_requirement,
        key_metrics: type.key_metrics
      })),
      testing_schedule: {
        baseline_scenarios: 'Quarterly',
        stress_scenarios: 'Semi-annually',
        adverse_scenarios: 'Annually',
        regulatory_scenarios: 'As required by regulators',
        ad_hoc_scenarios: 'As needed for major decisions'
      },
      implementation_components: [
        {
          component: 'Scenario Library Development',
          description: 'Build comprehensive library of relevant scenarios',
          timeline: '6 weeks'
        },
        {
          component: 'Testing Infrastructure',
          description: 'Implement systems and processes for scenario execution',
          timeline: '8 weeks'
        },
        {
          component: 'Model Validation',
          description: 'Validate models and methodologies used in testing',
          timeline: '4 weeks'
        },
        {
          component: 'Governance and Controls',
          description: 'Establish oversight and control framework',
          timeline: '3 weeks'
        }
      ],
      deliverables: [
        'Scenario testing policy and procedures',
        'Comprehensive scenario library',
        'Testing execution infrastructure',
        'Reporting templates and dashboards',
        'Model validation documentation',
        'Regulatory submission templates'
      ],
      success_criteria: [
        'Scenario coverage meets regulatory requirements',
        'Testing execution within defined timelines',
        'Results provide actionable insights',
        'Management reporting effectiveness > 90%',
        'Regulatory approval of stress testing approach'
      ],
      estimated_implementation_months: 5
    };

    return frameworkData;
  }

  private calculateEffectivenessScore(profile: OrganizationalProfile, content: any): number {
    let score = 50; // Base score
    
    // Adjust based on risk maturity
    if (profile.risk_maturity === 'advanced') score += 20;
    else if (profile.risk_maturity === 'developing') score += 10;
    
    // Adjust based on content richness
    if (content.elements && content.elements.length > 5) score += 15;
    if (content.implementation_guidelines) score += 10;
    if (content.regulatory_alignment) score += 5;
    
    return Math.min(score, 100);
  }

  private generateFrameworkComponents(frameworkType: string, content: any) {
    const components = [];

    // Generate components based on framework elements
    if (content.elements) {
      content.elements.forEach((element: string, index: number) => {
        components.push({
          type: this.getComponentType(frameworkType, element),
          name: element,
          description: this.getComponentDescription(frameworkType, element),
          priority: index + 1,
          effort_hours: this.estimateEffortHours(frameworkType, element),
          data: {
            implementation_steps: this.getImplementationSteps(element),
            success_criteria: this.getSuccessCriteria(element),
            dependencies: []
          }
        });
      });
    }

    // Add framework-specific components
    if (frameworkType === 'governance') {
      components.push({
        type: 'policy',
        name: 'Board Risk Oversight Policy',
        description: 'Comprehensive policy defining board responsibilities for risk oversight',
        priority: 1,
        effort_hours: 60,
        data: {
          implementation_steps: ['Draft policy', 'Stakeholder review', 'Board approval'],
          success_criteria: ['Board approval obtained', 'Policy distributed', 'Training completed'],
          dependencies: []
        }
      });
    }

    return components;
  }

  private getComponentType(frameworkType: string, element: string): string {
    if (element.toLowerCase().includes('policy') || element.toLowerCase().includes('governance')) {
      return 'policy';
    }
    if (element.toLowerCase().includes('procedure') || element.toLowerCase().includes('process')) {
      return 'procedure';
    }
    if (element.toLowerCase().includes('control') || element.toLowerCase().includes('monitoring')) {
      return 'control';
    }
    if (element.toLowerCase().includes('assessment') || element.toLowerCase().includes('analysis')) {
      return 'assessment';
    }
    return 'documentation';
  }

  private getComponentDescription(frameworkType: string, element: string): string {
    const descriptions = {
      'Risk Governance': 'Establish clear risk governance structure with defined roles and responsibilities',
      'Board Oversight': 'Implement board-level oversight mechanisms for effective risk management',
      'Management Structure': 'Define management structure and accountability for risk management',
      'Risk Appetite Definition': 'Develop comprehensive risk appetite statements aligned with business strategy',
      'Risk Tolerance Levels': 'Establish specific risk tolerance levels and thresholds',
      'Risk Monitoring': 'Implement continuous risk monitoring and reporting mechanisms'
    };

    return descriptions[element as keyof typeof descriptions] || `Implementation of ${element} component`;
  }

  private estimateEffortHours(frameworkType: string, element: string): number {
    const baseHours = {
      governance: 80,
      risk_appetite: 60,
      impact_tolerance: 50,
      control: 70,
      compliance: 90,
      scenario_testing: 100
    };

    const multipliers = {
      policy: 1.2,
      procedure: 1.0,
      control: 1.1,
      assessment: 1.3,
      documentation: 0.8
    };

    const base = baseHours[frameworkType as keyof typeof baseHours] || 60;
    const type = this.getComponentType(frameworkType, element);
    const multiplier = multipliers[type as keyof typeof multipliers] || 1.0;

    return Math.round(base * multiplier);
  }

  private getImplementationSteps(element: string): string[] {
    const steps = {
      'Risk Governance': ['Define governance structure', 'Assign roles and responsibilities', 'Create governance charter', 'Implement oversight processes'],
      'Board Oversight': ['Establish board risk committee', 'Define reporting requirements', 'Create board risk dashboard', 'Implement regular review cycles'],
      'Management Structure': ['Define management roles', 'Create accountability framework', 'Establish reporting lines', 'Implement performance metrics']
    };

    return steps[element as keyof typeof steps] || [
      'Analyze current state',
      'Design target state',
      'Develop implementation plan',
      'Execute implementation',
      'Validate and test',
      'Deploy and monitor'
    ];
  }

  private getSuccessCriteria(element: string): string[] {
    return [
      'Implementation completed on time',
      'All stakeholders trained',
      'Documentation approved',
      'Quality assurance passed',
      'Operational readiness achieved'
    ];
  }
}

export const intelligentFrameworkGenerationService = new IntelligentFrameworkGenerationService();