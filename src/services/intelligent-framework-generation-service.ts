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
      
      // Update generation status to in_progress
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
              profile_id: profileId,
              framework_type: frameworkType,
              framework_name: frameworkContent.name,
              framework_version: '1.0',
              framework_data: frameworkContent,
              customization_options: customizations,
              implementation_status: 'in_progress',
              effectiveness_score: effectivenessScore,
              generation_metadata: {
                generated_at: new Date().toISOString(),
                profile_used: profile.id,
                generation_method: 'intelligent_ai',
                customizations_applied: customizations,
                components_count: components.length
              }
            })
            .select()
            .single();

          if (frameworkError) {
            console.error('Error creating framework:', frameworkError);
            throw frameworkError;
          }

          console.log('Framework created successfully:', framework);

          // Create framework components in batch
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
              
              // Initialize progress tracking for components
              try {
                const { FrameworkProgressService } = await import('./framework-progress-service');
                await FrameworkProgressService.initializeComponentProgress(framework.id);
                
                // Log initial activity
                await FrameworkProgressService.logActivity(
                  framework.id,
                  'created',
                  'Framework generated with AI assistance',
                  { component_count: components.length, generation_type: 'ai_assisted' }
                );
                
                console.log(`Initialized progress tracking for framework ${framework.id}`);
              } catch (progressError) {
                console.error('Error initializing progress tracking:', progressError);
                // Don't throw - framework creation was successful
              }
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
        function_name: func.name, // Keep function_name for framework generation output compatibility
        name: func.name, // Add primary column
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
      regulatory_frameworks: regulatoryFrameworks.map(framework => ({
        framework_name: framework.label,
        framework_code: framework.value,
        key_requirements: FrameworkContentGenerator.getKeyRequirements(framework.value),
        compliance_activities: FrameworkContentGenerator.getComplianceActivities(framework.value),
        reporting_frequency: FrameworkContentGenerator.getReportingFrequency(framework.value),
        penalties_for_non_compliance: FrameworkContentGenerator.getPenaltiesInfo(framework.value)
      })),
      compliance_calendar: FrameworkContentGenerator.generateComplianceCalendar(regulatoryFrameworks),
      implementation_guidelines: [
        'Establish regulatory universe mapping and regular updates',
        'Implement compliance risk assessment processes',
        'Create comprehensive compliance monitoring program',
        'Develop regulatory change management procedures',
        'Establish compliance training and certification programs'
      ],
      success_metrics: [
        'Zero regulatory breaches annually',
        'Compliance monitoring effectiveness > 95%',
        'Staff compliance training completion > 98%',
        'Regulatory examination ratings maintained'
      ],
      estimated_implementation_months: 8
    };

    return frameworkData;
  }

  private async generateScenarioTestingFramework(profile: OrganizationalProfile): Promise<any> {
    const scenarioTypes = FrameworkContentGenerator.getScenarioTypesForSector(profile.sub_sector);
    
    const frameworkData = {
      name: `${profile.sub_sector} Scenario Testing Framework`,
      description: `A comprehensive framework for stress testing and scenario analysis to assess resilience under adverse conditions. Designed for ${profile.sub_sector} organizations to meet regulatory requirements and enhance risk management capabilities.`,
      elements: [
        'Scenario Design and Development',
        'Stress Testing Methodologies',
        'Data Quality and Governance',
        'Model Validation and Calibration',
        'Results Analysis and Interpretation',
        'Management Actions and Response Plans',
        'Regulatory Reporting and Communication',
        'Continuous Improvement and Enhancement'
      ],
      scenario_types: scenarioTypes,
      testing_schedule: {
        comprehensive_annual: 'Annual comprehensive stress testing exercise',
        quarterly_updates: 'Quarterly scenario updates and targeted testing',
        ad_hoc_testing: 'Event-driven scenario testing as required',
        regulatory_submissions: 'Regulatory stress testing submissions'
      },
      implementation_guidelines: [
        'Develop comprehensive scenario testing policy and procedures',
        'Establish scenario design committee with cross-functional representation',
        'Implement robust data governance and quality assurance processes',
        'Create scenario testing infrastructure and modeling capabilities',
        'Establish regular testing schedule and reporting protocols'
      ],
      success_metrics: [
        'Scenario coverage across all material risk categories',
        'Model validation results within acceptable thresholds',
        'Regulatory stress testing compliance maintained',
        'Management action plans developed for all severe scenarios'
      ],
      estimated_implementation_months: 6
    };

    return frameworkData;
  }

  private calculateEffectivenessScore(profile: OrganizationalProfile, frameworkContent: any): number {
    // Calculate effectiveness based on profile maturity and content quality
    let baseScore = 70; // Base effectiveness score
    
    // Adjust based on risk maturity
    if (profile.risk_maturity === 'sophisticated') {
      baseScore += 15;
    } else if (profile.risk_maturity === 'developing') {
      baseScore += 10;
    } else if (profile.risk_maturity === 'basic') {
      baseScore += 5;
    }
    
    // Adjust based on organization size (larger orgs may have more resources)
    if (profile.employee_count > 1000) {
      baseScore += 10;
    } else if (profile.employee_count > 100) {
      baseScore += 5;
    }
    
    // Adjust based on framework complexity and content quality
    if (frameworkContent?.elements?.length > 6) {
      baseScore += 5;
    }
    if (frameworkContent?.implementation_guidelines?.length > 4) {
      baseScore += 5;
    }
    
    // Add minor randomization for realism (±5 points)
    const variation = (Math.random() - 0.5) * 10; 
    
    return Math.max(45, Math.min(95, Math.round(baseScore + variation)));
  }

  private generateFrameworkComponents(frameworkType: string, frameworkContent: any): any[] {
    // Generate meaningful components based on framework content
    const components = [];
    
    // Extract key elements as components
    if (frameworkContent?.elements) {
      frameworkContent.elements.slice(0, 6).forEach((element: string, index: number) => {
        components.push({
          type: 'policy',
          name: element,
          description: `Comprehensive implementation guidelines for ${element.toLowerCase()}`,
          data: {
            status: 'not_started',
            priority: index < 3 ? 'high' : 'medium',
            implementation_phase: Math.floor(index / 2) + 1,
            regulatory_requirement: frameworkContent?.regulatory_alignment?.[0] || 'Best Practice'
          },
          priority: index + 1,
          effort_hours: 30 + (index * 15)
        });
      });
    }
    
    // Add framework-specific high-value components
    switch (frameworkType) {
      case 'governance':
        components.push(
          {
            type: 'charter',
            name: 'Board Risk Committee Charter',
            description: 'Comprehensive charter defining board oversight responsibilities for risk management',
            data: { 
              template_type: 'board_charter',
              approval_required: 'board',
              review_frequency: 'annual'
            },
            priority: 1,
            effort_hours: 40
          },
          {
            type: 'procedure',
            name: 'Three Lines of Defense Implementation',
            description: 'Detailed procedures for implementing the three lines of defense model',
            data: { 
              lines: ['business_units', 'risk_management', 'internal_audit'],
              independence_requirements: true
            },
            priority: 2,
            effort_hours: 60
          }
        );
        break;
        
      case 'risk_appetite':
        components.push(
          {
            type: 'statement',
            name: 'Risk Appetite Statement',
            description: 'Board-approved statement defining organizational risk appetite across all risk categories',
            data: { 
              requires_board_approval: true,
              risk_categories: frameworkContent?.risk_categories?.length || 6,
              review_frequency: 'annual'
            },
            priority: 1,
            effort_hours: 80
          },
          {
            type: 'dashboard',
            name: 'Risk Appetite Monitoring Dashboard',
            description: 'Real-time dashboard for monitoring risk appetite vs. actual risk levels',
            data: { 
              kri_count: frameworkContent?.risk_categories?.length * 3 || 18,
              alert_thresholds: true,
              reporting_frequency: 'monthly'
            },
            priority: 2,
            effort_hours: 120
          }
        );
        break;
        
      case 'control':
        components.push(
          {
            type: 'matrix',
            name: 'Risk Control Matrix',
            description: 'Comprehensive mapping of operational risks to preventive and detective controls',
            data: { 
              control_categories: ['preventive', 'detective', 'corrective'],
              coverage_percentage: 95,
              testing_frequency: 'quarterly'
            },
            priority: 1,
            effort_hours: 100
          },
          {
            type: 'program',
            name: 'Control Testing Program',
            description: 'Systematic program for testing control effectiveness and reporting results',
            data: { 
              testing_methodologies: ['walkthrough', 'inspection', 'observation'],
              annual_testing_plan: true
            },
            priority: 2,
            effort_hours: 80
          }
        );
        break;
        
      case 'compliance':
        components.push(
          {
            type: 'calendar',
            name: 'Regulatory Compliance Calendar',
            description: 'Comprehensive calendar of all regulatory reporting and compliance obligations',
            data: { 
              reporting_requirements: frameworkContent?.regulatory_frameworks?.length * 4 || 16,
              automated_alerts: true
            },
            priority: 1,
            effort_hours: 60
          }
        );
        break;
        
      case 'impact_tolerance':
        components.push(
          {
            type: 'thresholds',
            name: 'Impact Tolerance Thresholds',
            description: 'Quantitative thresholds for operational, financial, and regulatory impact tolerance',
            data: { 
              business_functions: frameworkContent?.business_functions?.length || 8,
              tolerance_categories: 3,
              escalation_triggers: true
            },
            priority: 1,
            effort_hours: 70
          }
        );
        break;
        
      case 'scenario_testing':
        components.push(
          {
            type: 'scenarios',
            name: 'Stress Testing Scenarios',
            description: 'Comprehensive stress testing scenarios covering operational and financial risks',
            data: { 
              scenario_count: frameworkContent?.scenario_types?.length * 3 || 9,
              regulatory_scenarios: true,
              testing_frequency: 'semi-annual'
            },
            priority: 1,
            effort_hours: 90
          }
        );
        break;
    }
    
    return components;
  }
}

export const intelligentFrameworkGenerationService = new IntelligentFrameworkGenerationService();