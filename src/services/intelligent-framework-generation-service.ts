import { supabase } from '@/integrations/supabase/client';
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

export interface FrameworkGenerationResult {
  framework: GeneratedFrameworkData;
  components: FrameworkComponent[];
  effectiveness_score: number;
  implementationPlan: {
    total_duration: string;
    phases: Array<{
      name: string;
      duration: string;
      deliverables: string[];
    }>;
    resource_allocation: string;
  };
}

class IntelligentFrameworkGenerationService {
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

  private async getSectorThresholds(sector: string, subSector?: string): Promise<SectorThreshold[]> {
    let query = supabase
      .from('sector_thresholds')
      .select('*')
      .eq('sector', sector);

    if (subSector) {
      query = query.eq('sub_sector', subSector);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching sector thresholds:', error);
      return [];
    }

    return data || [];
  }

  private async getFrameworkGenerationRules(orgCriteria: Record<string, any>): Promise<FrameworkGenerationRule[]> {
    // This is a simplified example. In a real application, you would need a more sophisticated
    // way to match the organization criteria against the rules.
    const { data, error } = await supabase
      .from('framework_generation_rules')
      .select('*');

    if (error) {
      console.error('Error fetching framework generation rules:', error);
      return [];
    }

    // Basic filter - needs to be replaced with a proper matching logic
    const filteredRules = data?.filter(rule => {
      for (const key in orgCriteria) {
        if (rule.org_criteria[key] !== orgCriteria[key]) {
          return false;
        }
      }
      return true;
    }) || [];

    return filteredRules;
  }

  private async getControlLibraryItems(riskCategories: string[]): Promise<ControlLibraryItem[]> {
    const { data, error } = await supabase
      .from('control_libraries')
      .select('*')
      .contains('risk_categories', riskCategories);

    if (error) {
      console.error('Error fetching control library items:', error);
      return [];
    }

    return data || [];
  }

  private async getRegulatoryMappings(sectors: string[]): Promise<RegulatoryMapping[]> {
    const { data, error } = await supabase
      .from('regulatory_mapping')
      .select('*')
      .contains('applicable_sectors', sectors);

    if (error) {
      console.error('Error fetching regulatory mappings:', error);
      return [];
    }

    return data || [];
  }

  private async generateGovernanceFramework(profile: OrganizationalProfile): Promise<any> {
    // Fetch relevant data based on the profile
    const sectorThresholds = await this.getSectorThresholds(profile.sub_sector, profile.sub_sector);
    const frameworkRules = await this.getFrameworkGenerationRules({
      employee_count: profile.employee_count,
      asset_size: profile.asset_size
    });

    // Example: Construct a basic framework
    const frameworkData = {
      name: 'Basic Governance Framework',
      description: 'A basic governance framework tailored for the organization.',
      elements: [
        'Board of Directors',
        'Audit Committee',
        'Risk Management Committee'
      ],
      sector_thresholds: sectorThresholds,
      framework_rules: frameworkRules
    };

    return frameworkData;
  }

  private async generateRiskAppetiteFramework(profile: OrganizationalProfile): Promise<any> {
    // Fetch relevant data based on the profile
    const sectorThresholds = await this.getSectorThresholds(profile.sub_sector, profile.sub_sector);
    const frameworkRules = await this.getFrameworkGenerationRules({
      employee_count: profile.employee_count,
      asset_size: profile.asset_size
    });

    // Example: Construct a basic framework
    const frameworkData = {
      name: 'Basic Risk Appetite Framework',
      description: 'A basic risk appetite framework tailored for the organization.',
      elements: [
        'Risk Identification',
        'Risk Assessment',
        'Risk Response'
      ],
      sector_thresholds: sectorThresholds,
      framework_rules: frameworkRules
    };

    return frameworkData;
  }

  private async generateImpactToleranceFramework(profile: OrganizationalProfile): Promise<any> {
    // Fetch relevant data based on the profile
    const sectorThresholds = await this.getSectorThresholds(profile.sub_sector, profile.sub_sector);
    const frameworkRules = await this.getFrameworkGenerationRules({
      employee_count: profile.employee_count,
      asset_size: profile.asset_size
    });

    // Example: Construct a basic framework
    const frameworkData = {
      name: 'Basic Impact Tolerance Framework',
      description: 'A basic impact tolerance framework tailored for the organization.',
      elements: [
        'Impact Identification',
        'Impact Assessment',
        'Impact Response'
      ],
      sector_thresholds: sectorThresholds,
      framework_rules: frameworkRules
    };

    return frameworkData;
  }

  private async generateControlFramework(profile: OrganizationalProfile): Promise<any> {
    // Fetch relevant data based on the profile
    const sectorThresholds = await this.getSectorThresholds(profile.sub_sector, profile.sub_sector);
    const frameworkRules = await this.getFrameworkGenerationRules({
      employee_count: profile.employee_count,
      asset_size: profile.asset_size
    });
    const controlLibraryItems = await this.getControlLibraryItems(['operational', 'cyber']);

    // Example: Construct a basic framework
    const frameworkData = {
      name: 'Basic Control Framework',
      description: 'A basic control framework tailored for the organization.',
      elements: [
        'Control Identification',
        'Control Assessment',
        'Control Implementation'
      ],
      sector_thresholds: sectorThresholds,
      framework_rules: frameworkRules,
      control_library_items: controlLibraryItems
    };

    return frameworkData;
  }

  private async generateComplianceFramework(profile: OrganizationalProfile): Promise<any> {
    // Fetch relevant data based on the profile
    const sectorThresholds = await this.getSectorThresholds(profile.sub_sector, profile.sub_sector);
    const frameworkRules = await this.getFrameworkGenerationRules({
      employee_count: profile.employee_count,
      asset_size: profile.asset_size
    });
    const regulatoryMappings = await this.getRegulatoryMappings([profile.sub_sector]);

    // Example: Construct a basic framework
    const frameworkData = {
      name: 'Basic Compliance Framework',
      description: 'A basic compliance framework tailored for the organization.',
      elements: [
        'Compliance Identification',
        'Compliance Assessment',
        'Compliance Implementation'
      ],
      sector_thresholds: sectorThresholds,
      framework_rules: frameworkRules,
      regulatory_mappings: regulatoryMappings
    };

    return frameworkData;
  }

  private async generateScenarioTestingFramework(profile: OrganizationalProfile): Promise<any> {
    // Fetch relevant data based on the profile
    const sectorThresholds = await this.getSectorThresholds(profile.sub_sector, profile.sub_sector);
    const frameworkRules = await this.getFrameworkGenerationRules({
      employee_count: profile.employee_count,
      asset_size: profile.asset_size
    });

    // Example: Construct a basic framework
    const frameworkData = {
      name: 'Basic Scenario Testing Framework',
      description: 'A basic scenario testing framework tailored for the organization.',
      elements: [
        'Scenario Identification',
        'Scenario Assessment',
        'Scenario Implementation'
      ],
      sector_thresholds: sectorThresholds,
      framework_rules: frameworkRules
    };

    return frameworkData;
  }

  private async generateGovernanceComponents(profile: OrganizationalProfile, frameworkData: any): Promise<FrameworkComponent[]> {
    const components: FrameworkComponent[] = [
      {
        id: '1',
        framework_id: '', // needs to be updated after framework creation
        component_type: 'committee',
        component_name: 'Audit Committee',
        component_description: 'Responsible for overseeing the financial reporting process.',
        component_data: {
          responsibilities: ['Financial reporting', 'Internal controls', 'External audit']
        },
        dependencies: [],
        implementation_priority: 1,
        estimated_effort_hours: 40,
        created_at: new Date().toISOString()
      },
      {
        id: '2',
        framework_id: '', // needs to be updated after framework creation
        component_type: 'policy',
        component_name: 'Whistleblower Policy',
        component_description: 'Provides a mechanism for employees to report concerns.',
        component_data: {
          reporting_channels: ['Email', 'Phone', 'In-person']
        },
        dependencies: [],
        implementation_priority: 2,
        estimated_effort_hours: 20,
        created_at: new Date().toISOString()
      }
    ];

    return components;
  }

  private async generateRiskAppetiteComponents(profile: OrganizationalProfile, frameworkData: any): Promise<FrameworkComponent[]> {
    const components: FrameworkComponent[] = [
      {
        id: '3',
        framework_id: '', // needs to be updated after framework creation
        component_type: 'policy',
        component_name: 'Risk Appetite Statement',
        component_description: 'Defines the level of risk the organization is willing to accept.',
        component_data: {
          risk_categories: ['Financial', 'Operational', 'Compliance']
        },
        dependencies: [],
        implementation_priority: 1,
        estimated_effort_hours: 40,
        created_at: new Date().toISOString()
      },
      {
        id: '4',
        framework_id: '', // needs to be updated after framework creation
        component_type: 'kri',
        component_name: 'Key Risk Indicators',
        component_description: 'Metrics used to monitor the organization\'s risk exposure.',
        component_data: {
          metrics: ['Revenue', 'Customer Churn', 'Employee Turnover']
        },
        dependencies: [],
        implementation_priority: 2,
        estimated_effort_hours: 20,
        created_at: new Date().toISOString()
      }
    ];

    return components;
  }

  private async generateImpactToleranceComponents(profile: OrganizationalProfile, frameworkData: any): Promise<FrameworkComponent[]> {
    const components: FrameworkComponent[] = [
      {
        id: '5',
        framework_id: '', // needs to be updated after framework creation
        component_type: 'policy',
        component_name: 'Business Continuity Plan',
        component_description: 'Defines how the organization will continue to operate during a disruption.',
        component_data: {
          recovery_time_objective: '4 hours',
          recovery_point_objective: '1 hour'
        },
        dependencies: [],
        implementation_priority: 1,
        estimated_effort_hours: 40,
        created_at: new Date().toISOString()
      },
      {
        id: '6',
        framework_id: '', // needs to be updated after framework creation
        component_type: 'procedure',
        component_name: 'Disaster Recovery Plan',
        component_description: 'Defines how the organization will recover from a disaster.',
        component_data: {
          recovery_location: 'Offsite',
          backup_frequency: 'Daily'
        },
        dependencies: [],
        implementation_priority: 2,
        estimated_effort_hours: 20,
        created_at: new Date().toISOString()
      }
    ];

    return components;
  }

  private async generateControlComponents(profile: OrganizationalProfile, frameworkData: any): Promise<FrameworkComponent[]> {
    const components: FrameworkComponent[] = [
      {
        id: '7',
        framework_id: '', // needs to be updated after framework creation
        component_type: 'control',
        component_name: 'Multi-Factor Authentication',
        component_description: 'Requires users to provide multiple factors of authentication.',
        component_data: {
          authentication_factors: ['Password', 'One-Time Password']
        },
        dependencies: [],
        implementation_priority: 1,
        estimated_effort_hours: 40,
        created_at: new Date().toISOString()
      },
      {
        id: '8',
        framework_id: '', // needs to be updated after framework creation
        component_type: 'control',
        component_name: 'Data Encryption',
        component_description: 'Encrypts data at rest and in transit.',
        component_data: {
          encryption_algorithm: 'AES-256'
        },
        dependencies: [],
        implementation_priority: 2,
        estimated_effort_hours: 20,
        created_at: new Date().toISOString()
      }
    ];

    return components;
  }

  private async generateComplianceComponents(profile: OrganizationalProfile, frameworkData: any): Promise<FrameworkComponent[]> {
    const components: FrameworkComponent[] = [
      {
        id: '9',
        framework_id: '', // needs to be updated after framework creation
        component_type: 'procedure',
        component_name: 'Compliance Monitoring',
        component_description: 'Monitors the organization\'s compliance with regulations.',
        component_data: {
          monitoring_frequency: 'Monthly',
          reporting_requirements: ['Annual Report']
        },
        dependencies: [],
        implementation_priority: 1,
        estimated_effort_hours: 40,
        created_at: new Date().toISOString()
      },
      {
        id: '10',
        framework_id: '', // needs to be updated after framework creation
        component_type: 'procedure',
        component_name: 'Regulatory Reporting',
        component_description: 'Reports the organization\'s compliance with regulations.',
        component_data: {
          reporting_frequency: 'Annually',
          reporting_format: 'XML'
        },
        dependencies: [],
        implementation_priority: 2,
        estimated_effort_hours: 20,
        created_at: new Date().toISOString()
      }
    ];

    return components;
  }

  private async generateScenarioTestingComponents(profile: OrganizationalProfile, frameworkData: any): Promise<FrameworkComponent[]> {
    const components: FrameworkComponent[] = [
      {
        id: '11',
        framework_id: '', // needs to be updated after framework creation
        component_type: 'scenario',
        component_name: 'Cyber Attack Scenario',
        component_description: 'Tests the organization\'s ability to respond to a cyber attack.',
        component_data: {
          attack_vector: 'Phishing',
          impact: 'Data Breach'
        },
        dependencies: [],
        implementation_priority: 1,
        estimated_effort_hours: 40,
        created_at: new Date().toISOString()
      },
      {
        id: '12',
        framework_id: '', // needs to be updated after framework creation
        component_type: 'scenario',
        component_name: 'Natural Disaster Scenario',
        component_description: 'Tests the organization\'s ability to respond to a natural disaster.',
        component_data: {
          disaster_type: 'Hurricane',
          impact: 'Loss of Facilities'
        },
        dependencies: [],
        implementation_priority: 2,
        estimated_effort_hours: 20,
        created_at: new Date().toISOString()
      }
    ];

    return components;
  }

  /**
   * Main method to generate frameworks based on organizational profile
   */
  async generateFrameworks(request: FrameworkGenerationRequest): Promise<FrameworkGenerationResult[]> {
    const { profileId, frameworkTypes, customizations = {} } = request;
    
    // Get organizational profile
    const profile = await this.getOrganizationalProfile(profileId);
    if (!profile) {
      throw new Error('Organizational profile not found');
    }

    // Generate frameworks for each requested type
    const results: FrameworkGenerationResult[] = [];
    
    for (const frameworkType of frameworkTypes) {
      try {
        const result = await this.generateSingleFramework(profile, frameworkType, customizations);
        results.push(result);
      } catch (error) {
        console.error(`Error generating ${frameworkType} framework:`, error);
        // Continue with other frameworks even if one fails
      }
    }

    return results;
  }

  /**
   * Generate a single framework based on type and profile
   */
  private async generateSingleFramework(
    profile: OrganizationalProfile, 
    frameworkType: string, 
    customizations: Record<string, any>
  ): Promise<FrameworkGenerationResult> {
    let frameworkData: any;
    let components: FrameworkComponent[] = [];
    
    switch (frameworkType) {
      case 'governance':
        frameworkData = await this.generateGovernanceFramework(profile);
        components = await this.generateGovernanceComponents(profile, frameworkData);
        break;
      case 'risk_appetite':
        frameworkData = await this.generateRiskAppetiteFramework(profile);
        components = await this.generateRiskAppetiteComponents(profile, frameworkData);
        break;
      case 'impact_tolerance':
        frameworkData = await this.generateImpactToleranceFramework(profile);
        components = await this.generateImpactToleranceComponents(profile, frameworkData);
        break;
      case 'control':
        frameworkData = await this.generateControlFramework(profile);
        components = await this.generateControlComponents(profile, frameworkData);
        break;
      case 'compliance':
        frameworkData = await this.generateComplianceFramework(profile);
        components = await this.generateComplianceComponents(profile, frameworkData);
        break;
      case 'scenario_testing':
        frameworkData = await this.generateScenarioTestingFramework(profile);
        components = await this.generateScenarioTestingComponents(profile, frameworkData);
        break;
      default:
        throw new Error(`Unknown framework type: ${frameworkType}`);
    }

    // Save framework to database
    const { data: savedFramework, error } = await supabase
      .from('generated_frameworks')
      .insert({
        organization_id: profile.organization_id,
        profile_id: profile.id,
        framework_type: frameworkType,
        framework_name: frameworkData.name,
        framework_version: '1.0',
        generation_metadata: {
          generated_at: new Date().toISOString(),
          profile_characteristics: {
            sector: profile.sub_sector,
            size: profile.employee_count,
            maturity: profile.risk_maturity
          }
        },
        framework_data: frameworkData,
        customization_options: customizations,
        implementation_status: 'generated'
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to save framework: ${error.message}`);
    }

    // Save components
    const componentsWithFrameworkId = components.map(component => ({
      ...component,
      framework_id: savedFramework.id
    }));

    const { error: componentsError } = await supabase
      .from('framework_components')
      .insert(componentsWithFrameworkId);

    if (componentsError) {
      console.error('Error saving components:', componentsError);
    }

    // Calculate effectiveness score
    const effectivenessScore = this.calculateFrameworkEffectiveness(profile, frameworkData, components);

    // Generate implementation plan
    const implementationPlan = this.generateImplementationPlan(frameworkType, components);

    return {
      framework: savedFramework,
      components: componentsWithFrameworkId,
      effectiveness_score: effectivenessScore,
      implementationPlan
    };
  }

  /**
   * Calculate framework effectiveness based on profile alignment
   */
  private calculateFrameworkEffectiveness(
    profile: OrganizationalProfile, 
    frameworkData: any, 
    components: FrameworkComponent[]
  ): number {
    let score = 70; // Base score

    // Sector alignment
    if (profile.sub_sector && frameworkData.sector_alignment) {
      score += 10;
    }

    // Maturity alignment
    if (profile.risk_maturity === 'sophisticated') {
      score += 10;
    } else if (profile.risk_maturity === 'advanced') {
      score += 7;
    } else if (profile.risk_maturity === 'developing') {
      score += 5;
    }

    // Component completeness
    const componentScore = Math.min(components.length * 2, 20);
    score += componentScore;

    return Math.min(score, 100);
  }

  /**
   * Generate implementation plan based on framework type and components
   */
  private generateImplementationPlan(frameworkType: string, components: FrameworkComponent[]): {
    total_duration: string;
    phases: Array<{
      name: string;
      duration: string;
      deliverables: string[];
    }>;
    resource_allocation: string;
  } {
    const totalHours = components.reduce((sum, component) => sum + (component.estimated_effort_hours || 40), 0);
    const totalWeeks = Math.ceil(totalHours / 40);
    
    const phases = [
      {
        name: 'Planning & Design',
        duration: `${Math.ceil(totalWeeks * 0.3)} weeks`,
        deliverables: [
          'Framework architecture design',
          'Implementation roadmap',
          'Resource allocation plan'
        ]
      },
      {
        name: 'Core Implementation',
        duration: `${Math.ceil(totalWeeks * 0.5)} weeks`,
        deliverables: components.slice(0, Math.ceil(components.length / 2)).map(c => c.component_name)
      },
      {
        name: 'Integration & Testing',
        duration: `${Math.ceil(totalWeeks * 0.2)} weeks`,
        deliverables: [
          'Component integration',
          'Framework testing',
          'Performance validation'
        ]
      }
    ];

    return {
      total_duration: `${totalWeeks} weeks`,
      phases,
      resource_allocation: totalHours < 200 ? 'Small team (2-3 people)' : 
                          totalHours < 500 ? 'Medium team (4-6 people)' : 
                          'Large team (7+ people)'
    };
  }
}

export const intelligentFrameworkGenerationService = new IntelligentFrameworkGenerationService();
