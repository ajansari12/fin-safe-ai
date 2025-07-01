import { supabase } from "@/integrations/supabase/client";
import { 
  OrganizationalProfile, 
  SectorThreshold, 
  FrameworkGenerationRule,
  ControlLibraryItem,
  RegulatoryMapping,
  GeneratedFrameworkData,
  FrameworkComponent
} from "@/types/organizational-intelligence";

export interface FrameworkGenerationOptions {
  includeTemplates?: boolean;
  customization?: Record<string, any>;
  priority?: 'speed' | 'thoroughness' | 'compliance';
}

export interface GeneratedFrameworkResult {
  framework: GeneratedFrameworkData;
  components: FrameworkComponent[];
  recommendations: string[];
  implementation_plan: {
    phases: {
      name: string;
      duration: string;
      tasks: string[];
      dependencies: string[];
    }[];
    total_estimated_hours: number;
    success_metrics: string[];
  };
}

class IntelligentFrameworkGenerationService {
  /**
   * Generate a comprehensive governance framework based on organizational profile
   */
  async generateGovernanceFramework(
    profileId: string, 
    options: FrameworkGenerationOptions = {}
  ): Promise<GeneratedFrameworkResult> {
    try {
      // Get organizational profile
      const profile = await this.getOrganizationalProfile(profileId);
      if (!profile) {
        throw new Error('Organizational profile not found');
      }

      // Get applicable generation rules
      const rules = await this.getApplicableRules(profile, 'governance');
      
      // Generate framework based on organization characteristics
      const frameworkData = await this.buildGovernanceStructure(profile, rules);
      
      // Save generated framework
      const framework = await this.saveGeneratedFramework({
        org_id: profile.organization_id,
        profile_id: profileId,
        framework_type: 'governance',
        framework_name: `${profile.name} Governance Framework`,
        framework_data: frameworkData,
        generation_metadata: {
          rules_applied: rules.map(r => r.id),
          generation_date: new Date().toISOString(),
          customization_options: options,
          profile_characteristics: {
            employee_count: profile.employee_count,
            asset_size: profile.asset_size,
            complexity: profile.operational_complexity || 'medium',
            maturity: profile.governance_maturity || 'developing'
          }
        }
      });

      // Generate components
      const components = await this.generateGovernanceComponents(framework.id, frameworkData);
      
      // Create implementation plan
      const implementationPlan = this.createGovernanceImplementationPlan(profile, frameworkData);

      return {
        framework,
        components,
        recommendations: this.generateGovernanceRecommendations(profile, frameworkData),
        implementation_plan: implementationPlan
      };

    } catch (error) {
      console.error('Error generating governance framework:', error);
      throw error;
    }
  }

  /**
   * Generate risk appetite framework with intelligent thresholds
   */
  async generateRiskAppetiteFramework(
    profileId: string,
    options: FrameworkGenerationOptions = {}
  ): Promise<GeneratedFrameworkResult> {
    try {
      const profile = await this.getOrganizationalProfile(profileId);
      if (!profile) {
        throw new Error('Organizational profile not found');
      }

      // Get sector-specific thresholds
      const sectorThresholds = await this.getSectorThresholds(profile.sub_sector);
      
      // Generate risk appetite statements
      const riskAppetiteData = await this.buildRiskAppetiteFramework(profile, sectorThresholds);
      
      const framework = await this.saveGeneratedFramework({
        org_id: profile.organization_id,
        profile_id: profileId,
        framework_type: 'risk_appetite',
        framework_name: `${profile.name} Risk Appetite Framework`,
        framework_data: riskAppetiteData,
        generation_metadata: {
          sector_thresholds_used: sectorThresholds.map(t => t.id),
          generation_date: new Date().toISOString(),
          risk_maturity: profile.risk_maturity,
          complexity_level: profile.operational_complexity || 'medium'
        }
      });

      const components = await this.generateRiskAppetiteComponents(framework.id, riskAppetiteData);
      const implementationPlan = this.createRiskAppetiteImplementationPlan(profile, riskAppetiteData);

      return {
        framework,
        components,
        recommendations: this.generateRiskAppetiteRecommendations(profile, riskAppetiteData),
        implementation_plan: implementationPlan
      };

    } catch (error) {
      console.error('Error generating risk appetite framework:', error);
      throw error;
    }
  }

  /**
   * Generate impact tolerance framework with business function mapping
   */
  async generateImpactToleranceFramework(
    profileId: string,
    options: FrameworkGenerationOptions = {}
  ): Promise<GeneratedFrameworkResult> {
    try {
      const profile = await this.getOrganizationalProfile(profileId);
      if (!profile) {
        throw new Error('Organizational profile not found');
      }

      // Get business functions
      const businessFunctions = await this.getBusinessFunctions(profile.organization_id);
      
      // Get sector thresholds for RTO/RPO
      const sectorThresholds = await this.getSectorThresholds(profile.sub_sector);
      
      // Generate impact tolerance framework
      const impactToleranceData = await this.buildImpactToleranceFramework(
        profile, 
        businessFunctions, 
        sectorThresholds
      );
      
      const framework = await this.saveGeneratedFramework({
        org_id: profile.organization_id,
        profile_id: profileId,
        framework_type: 'impact_tolerance',
        framework_name: `${profile.name} Impact Tolerance Framework`,
        framework_data: impactToleranceData,
        generation_metadata: {
          business_functions_analyzed: businessFunctions.length,
          sector_benchmarks_applied: sectorThresholds.length,
          regulatory_alignment: profile.regulatory_complexity || 'medium'
        }
      });

      const components = await this.generateImpactToleranceComponents(framework.id, impactToleranceData);
      const implementationPlan = this.createImpactToleranceImplementationPlan(profile, impactToleranceData);

      return {
        framework,
        components,
        recommendations: this.generateImpactToleranceRecommendations(profile, impactToleranceData),
        implementation_plan: implementationPlan
      };

    } catch (error) {
      console.error('Error generating impact tolerance framework:', error);
      throw error;
    }
  }

  // Helper methods
  private async getOrganizationalProfile(profileId: string): Promise<OrganizationalProfile | null> {
    const { data, error } = await supabase
      .from('organizational_profiles')
      .select('*')
      .eq('id', profileId)
      .single();

    if (error) {
      console.error('Error fetching organizational profile:', error);
      return null;
    }

    return data as OrganizationalProfile;
  }

  private async getSectorThresholds(sector: string): Promise<SectorThreshold[]> {
    const { data, error } = await supabase
      .from('sector_thresholds')
      .select('*')
      .eq('sector', sector);

    if (error) {
      console.error('Error fetching sector thresholds:', error);
      return [];
    }

    return data.map(item => ({
      ...item,
      metric_name: item.metric_name,
      recommended_value: item.recommended_value
    })) as SectorThreshold[];
  }

  private async getApplicableRules(
    profile: OrganizationalProfile, 
    ruleType: string
  ): Promise<FrameworkGenerationRule[]> {
    const { data, error } = await supabase
      .from('framework_generation_rules')
      .select('*')
      .eq('rule_type', ruleType)
      .eq('is_active', true)
      .order('priority', { ascending: false });

    if (error) {
      console.error('Error fetching generation rules:', error);
      return [];
    }

    // Filter rules based on org criteria
    return data.filter(rule => this.evaluateRuleCriteria(rule.org_criteria, profile)) as FrameworkGenerationRule[];
  }

  private evaluateRuleCriteria(criteria: Record<string, any>, profile: OrganizationalProfile): boolean {
    // Simple criteria evaluation logic
    for (const [key, condition] of Object.entries(criteria)) {
      const profileValue = (profile as any)[key];
      
      if (typeof condition === 'object' && condition !== null) {
        if (condition.min !== undefined && profileValue < condition.min) return false;
        if (condition.max !== undefined && profileValue > condition.max) return false;
        if (condition.equals !== undefined && profileValue !== condition.equals) return false;
      } else if (profileValue !== condition) {
        return false;
      }
    }
    
    return true;
  }

  private async buildGovernanceStructure(
    profile: OrganizationalProfile, 
    rules: FrameworkGenerationRule[]
  ): Promise<Record<string, any>> {
    const complexity = profile.operational_complexity || 'medium';
    const size = profile.employee_count;
    
    return {
      board_structure: this.generateBoardStructure(profile, rules),
      committees: this.generateCommitteeStructure(profile, rules),
      reporting_lines: this.generateReportingStructure(profile),
      policies_required: this.generateRequiredPolicies(profile),
      meeting_schedules: this.generateMeetingSchedules(profile),
      stakeholder_engagement: this.generateStakeholderFramework(profile)
    };
  }

  private generateBoardStructure(profile: OrganizationalProfile, rules: FrameworkGenerationRule[]) {
    const size = profile.employee_count;
    const complexity = profile.operational_complexity || 'medium';
    
    let recommendedSize = 7; // Default
    if (size < 100) recommendedSize = 5;
    else if (size > 1000) recommendedSize = 9;
    
    return {
      recommended_size: recommendedSize,
      independence_ratio: complexity === 'high' ? 0.75 : 0.6,
      required_expertise: this.getRequiredBoardExpertise(profile),
      term_limits: complexity === 'high' ? 6 : 9,
      evaluation_frequency: 'annual'
    };
  }

  private getRequiredBoardExpertise(profile: OrganizationalProfile): string[] {
    const expertise = ['governance', 'risk_management', 'financial'];
    
    if (profile.sub_sector === 'banking') {
      expertise.push('banking_regulation', 'credit_risk');
    }
    
    if (profile.technology_maturity === 'advanced') {
      expertise.push('cybersecurity', 'digital_transformation');
    }
    
    return expertise;
  }

  private generateCommitteeStructure(profile: OrganizationalProfile, rules: FrameworkGenerationRule[]) {
    const committees = ['audit', 'risk'];
    const size = profile.employee_count;
    
    if (size > 500) {
      committees.push('governance', 'technology');
    }
    
    if (profile.sub_sector === 'banking' && size > 1000) {
      committees.push('model_risk', 'credit');
    }
    
    return committees.map(name => ({
      name,
      size: this.getCommitteeSize(name, profile),
      meeting_frequency: this.getCommitteeMeetingFrequency(name, profile),
      charter_requirements: this.getCommitteeCharter(name, profile)
    }));
  }

  private getCommitteeSize(committee: string, profile: OrganizationalProfile): number {
    const baseSize = profile.employee_count > 500 ? 5 : 3;
    return committee === 'audit' ? Math.max(baseSize, 3) : baseSize;
  }

  private getCommitteeMeetingFrequency(committee: string, profile: OrganizationalProfile): string {
    const complexity = profile.regulatory_complexity || 'medium';
    
    if (committee === 'audit') return 'quarterly';
    if (committee === 'risk' && complexity === 'high') return 'monthly';
    
    return 'quarterly';
  }

  private getCommitteeCharter(committee: string, profile: OrganizationalProfile): string[] {
    // Return committee-specific charter requirements
    const baseCharter = ['oversight', 'reporting', 'approval_authority'];
    
    if (committee === 'audit') {
      baseCharter.push('external_auditor_oversight', 'internal_audit_oversight');
    }
    
    return baseCharter;
  }

  private generateReportingStructure(profile: OrganizationalProfile) {
    const size = profile.employee_count;
    const complexity = profile.operational_complexity || 'medium';
    
    if (size > 1000 || complexity === 'high') {
      return {
        model: 'three_lines_of_defense',
        reporting_frequency: 'monthly',
        escalation_thresholds: 'defined',
        independence_required: true
      };
    }
    
    return {
      model: 'simplified',
      reporting_frequency: 'quarterly',
      escalation_thresholds: 'basic',
      independence_required: false
    };
  }

  private generateRequiredPolicies(profile: OrganizationalProfile): string[] {
    const policies = [
      'governance_policy',
      'risk_management_policy',
      'audit_policy',
      'conflict_of_interest_policy'
    ];
    
    if (profile.sub_sector === 'banking') {
      policies.push('credit_policy', 'aml_policy', 'privacy_policy');
    }
    
    return policies;
  }

  private generateMeetingSchedules(profile: OrganizationalProfile) {
    const complexity = profile.regulatory_complexity || 'medium';
    
    return {
      board_meetings: complexity === 'high' ? 'monthly' : 'quarterly',
      committee_meetings: this.getCommitteeMeetingSchedule(profile),
      annual_planning: 'required',
      strategy_sessions: complexity === 'high' ? 'semi_annual' : 'annual'
    };
  }

  private getCommitteeMeetingSchedule(profile: OrganizationalProfile) {
    return {
      audit: 'quarterly',
      risk: profile.regulatory_complexity === 'high' ? 'monthly' : 'quarterly',
      governance: 'semi_annual',
      technology: 'quarterly'
    };
  }

  private generateStakeholderFramework(profile: OrganizationalProfile) {
    const stakeholders = profile.stakeholder_types || ['shareholders', 'customers', 'regulators'];
    
    return {
      stakeholder_mapping: stakeholders,
      engagement_methods: this.getEngagementMethods(stakeholders),
      communication_frequency: this.getCommunicationFrequency(profile),
      feedback_mechanisms: this.getFeedbackMechanisms(stakeholders)
    };
  }

  private getEngagementMethods(stakeholders: string[]): Record<string, string[]> {
    const methods: Record<string, string[]> = {};
    
    stakeholders.forEach(stakeholder => {
      switch (stakeholder) {
        case 'shareholders':
          methods[stakeholder] = ['annual_meeting', 'quarterly_reports', 'investor_calls'];
          break;
        case 'regulators':
          methods[stakeholder] = ['regulatory_reports', 'examination_meetings', 'consultation_responses'];
          break;
        case 'customers':
          methods[stakeholder] = ['surveys', 'feedback_portals', 'service_reviews'];
          break;
        default:
          methods[stakeholder] = ['periodic_updates', 'meetings'];
      }
    });
    
    return methods;
  }

  private getCommunicationFrequency(profile: OrganizationalProfile): Record<string, string> {
    const complexity = profile.regulatory_complexity || 'medium';
    
    return {
      shareholders: 'quarterly',
      regulators: complexity === 'high' ? 'monthly' : 'quarterly',
      customers: 'as_needed',
      employees: 'monthly'
    };
  }

  private getFeedbackMechanisms(stakeholders: string[]): string[] {
    const mechanisms = ['surveys', 'meetings', 'digital_platforms'];
    
    if (stakeholders.includes('customers')) {
      mechanisms.push('customer_portal', 'complaint_system');
    }
    
    return mechanisms;
  }

  private async buildRiskAppetiteFramework(
    profile: OrganizationalProfile,
    sectorThresholds: SectorThreshold[]
  ): Promise<Record<string, any>> {
    return {
      risk_categories: this.generateRiskCategories(profile),
      appetite_statements: this.generateAppetiteStatements(profile, sectorThresholds),
      tolerance_thresholds: this.generateToleranceThresholds(profile, sectorThresholds),
      monitoring_framework: this.generateMonitoringFramework(profile),
      escalation_procedures: this.generateEscalationProcedures(profile)
    };
  }

  private generateRiskCategories(profile: OrganizationalProfile): string[] {
    const categories = ['operational', 'credit', 'market', 'liquidity', 'technology'];
    
    if (profile.sub_sector === 'banking') {
      categories.push('regulatory', 'model_risk');
    }
    
    return categories;
  }

  private generateAppetiteStatements(
    profile: OrganizationalProfile,
    sectorThresholds: SectorThreshold[]
  ): Record<string, any> {
    const statements: Record<string, any> = {};
    
    sectorThresholds.forEach(threshold => {
      statements[threshold.metric_name] = {
        statement: `We maintain ${threshold.metric_name} within ${threshold.recommended_value}% of benchmark`,
        rationale: threshold.rationale,
        measurement: threshold.threshold_type,
        threshold: threshold.recommended_value
      };
    });
    
    return statements;
  }

  private generateToleranceThresholds(
    profile: OrganizationalProfile,
    sectorThresholds: SectorThreshold[]
  ): Record<string, any> {
    const thresholds: Record<string, any> = {};
    
    sectorThresholds.forEach(threshold => {
      thresholds[threshold.metric_name] = {
        green: threshold.recommended_value * 0.8,
        amber: threshold.recommended_value,
        red: threshold.recommended_value * 1.2
      };
    });
    
    return thresholds;
  }

  private generateMonitoringFramework(profile: OrganizationalProfile) {
    return {
      frequency: profile.regulatory_complexity === 'high' ? 'daily' : 'weekly',
      reporting: 'monthly',
      escalation: 'immediate_for_breaches',
      review_cycle: 'quarterly'
    };
  }

  private generateEscalationProcedures(profile: OrganizationalProfile) {
    return {
      level_1: 'risk_manager',
      level_2: 'cro',
      level_3: 'risk_committee',
      level_4: 'board',
      timeframes: {
        level_1: '1_hour',
        level_2: '4_hours',
        level_3: '24_hours',
        level_4: '48_hours'
      }
    };
  }

  private async buildImpactToleranceFramework(
    profile: OrganizationalProfile,
    businessFunctions: any[],
    sectorThresholds: SectorThreshold[]
  ): Promise<Record<string, any>> {
    return {
      business_functions: this.analyzeBusinessFunctions(businessFunctions, profile),
      impact_tolerances: this.generateImpactTolerances(businessFunctions, sectorThresholds),
      recovery_objectives: this.generateRecoveryObjectives(businessFunctions, sectorThresholds),
      dependency_mapping: this.generateDependencyMapping(businessFunctions),
      continuity_strategies: this.generateContinuityStrategies(businessFunctions, profile)
    };
  }

  private analyzeBusinessFunctions(businessFunctions: any[], profile: OrganizationalProfile) {
    return businessFunctions.map(func => ({
      ...func,
      criticality_score: this.calculateCriticalityScore(func, profile),
      impact_assessment: this.assessImpact(func, profile),
      dependencies: this.identifyDependencies(func)
    }));
  }

  private calculateCriticalityScore(businessFunction: any, profile: OrganizationalProfile): number {
    let score = 1;
    
    if (businessFunction.criticality === 'critical') score = 5;
    else if (businessFunction.criticality === 'high') score = 4;
    else if (businessFunction.criticality === 'medium') score = 3;
    
    // Adjust based on organization characteristics
    if (profile.sub_sector === 'banking' && businessFunction.category === 'payments') {
      score = Math.max(score, 4);
    }
    
    return score;
  }

  private assessImpact(businessFunction: any, profile: OrganizationalProfile) {
    return {
      financial: this.assessFinancialImpact(businessFunction, profile),
      operational: this.assessOperationalImpact(businessFunction),
      regulatory: this.assessRegulatoryImpact(businessFunction, profile),
      reputational: this.assessReputationalImpact(businessFunction)
    };
  }

  private assessFinancialImpact(businessFunction: any, profile: OrganizationalProfile): string {
    const assetSize = profile.asset_size;
    
    if (businessFunction.criticality === 'critical') {
      return assetSize > 10000000000 ? 'very_high' : 'high';
    }
    
    return 'medium';
  }

  private assessOperationalImpact(businessFunction: any): string {
    return businessFunction.criticality === 'critical' ? 'high' : 'medium';
  }

  private assessRegulatoryImpact(businessFunction: any, profile: OrganizationalProfile): string {
    if (profile.sub_sector === 'banking' && businessFunction.category === 'payments') {
      return 'high';
    }
    
    return profile.regulatory_complexity || 'medium';
  }

  private assessReputationalImpact(businessFunction: any): string {
    return businessFunction.category === 'customer_facing' ? 'high' : 'medium';
  }

  private identifyDependencies(businessFunction: any): string[] {
    // Simple dependency identification
    const dependencies = ['technology', 'personnel'];
    
    if (businessFunction.category === 'payments') {
      dependencies.push('external_systems', 'network_connectivity');
    }
    
    return dependencies;
  }

  private generateImpactTolerances(
    businessFunctions: any[],
    sectorThresholds: SectorThreshold[]
  ): Record<string, any> {
    const tolerances: Record<string, any> = {};
    
    businessFunctions.forEach(func => {
      tolerances[func.id] = {
        max_downtime: this.calculateMaxDowntime(func, sectorThresholds),
        max_data_loss: this.calculateMaxDataLoss(func, sectorThresholds),
        service_degradation: this.calculateServiceDegradation(func)
      };
    });
    
    return tolerances;
  }

  private calculateMaxDowntime(businessFunction: any, sectorThresholds: SectorThreshold[]): string {
    const rtoThreshold = sectorThresholds.find(t => t.threshold_type === 'rto');
    
    if (businessFunction.criticality === 'critical') {
      return rtoThreshold ? `${rtoThreshold.recommended_value}h` : '4h';
    }
    
    return '24h';
  }

  private calculateMaxDataLoss(businessFunction: any, sectorThresholds: SectorThreshold[]): string {
    const rpoThreshold = sectorThresholds.find(t => t.threshold_type === 'rpo');
    
    if (businessFunction.criticality === 'critical') {
      return rpoThreshold ? `${rpoThreshold.recommended_value}h` : '1h';
    }
    
    return '24h';
  }

  private calculateServiceDegradation(businessFunction: any): Record<string, any> {
    return {
      acceptable_performance_loss: businessFunction.criticality === 'critical' ? '10%' : '25%',
      max_degradation_period: businessFunction.criticality === 'critical' ? '1h' : '4h'
    };
  }

  private generateRecoveryObjectives(
    businessFunctions: any[],
    sectorThresholds: SectorThreshold[]
  ): Record<string, any> {
    const objectives: Record<string, any> = {};
    
    businessFunctions.forEach(func => {
      objectives[func.id] = {
        rto: this.calculateMaxDowntime(func, sectorThresholds),
        rpo: this.calculateMaxDataLoss(func, sectorThresholds),
        minimum_service_level: this.calculateMinimumServiceLevel(func)
      };
    });
    
    return objectives;
  }

  private calculateMinimumServiceLevel(businessFunction: any): string {
    switch (businessFunction.criticality) {
      case 'critical': return '90%';
      case 'high': return '75%';
      default: return '50%';
    }
  }

  private generateDependencyMapping(businessFunctions: any[]): Record<string, any> {
    const mapping: Record<string, any> = {};
    
    businessFunctions.forEach(func => {
      mapping[func.id] = {
        internal_dependencies: this.identifyInternalDependencies(func),
        external_dependencies: this.identifyExternalDependencies(func),
        technology_dependencies: this.identifyTechnologyDependencies(func)
      };
    });
    
    return mapping;
  }

  private identifyInternalDependencies(businessFunction: any): string[] {
    return ['hr', 'it_support', 'facilities'];
  }

  private identifyExternalDependencies(businessFunction: any): string[] {
    const deps = ['internet_provider', 'cloud_services'];
    
    if (businessFunction.category === 'payments') {
      deps.push('payment_networks', 'correspondent_banks');
    }
    
    return deps;
  }

  private identifyTechnologyDependencies(businessFunction: any): string[] {
    return ['core_systems', 'databases', 'network_infrastructure'];
  }

  private generateContinuityStrategies(businessFunctions: any[], profile: OrganizationalProfile) {
    return businessFunctions.map(func => ({
      function_id: func.id,
      primary_strategy: this.getPrimaryStrategy(func),
      backup_strategy: this.getBackupStrategy(func),
      recovery_resources: this.getRecoveryResources(func, profile),
      testing_requirements: this.getTestingRequirements(func)
    }));
  }

  private getPrimaryStrategy(businessFunction: any): string {
    if (businessFunction.criticality === 'critical') {
      return 'hot_site';
    }
    return 'cold_site';
  }

  private getBackupStrategy(businessFunction: any): string {
    return 'manual_procedures';
  }

  private getRecoveryResources(businessFunction: any, profile: OrganizationalProfile): Record<string, any> {
    return {
      personnel: Math.ceil(profile.employee_count * 0.1),
      technology: 'backup_systems',
      facilities: 'alternate_location'
    };
  }

  private getTestingRequirements(businessFunction: any): Record<string, any> {
    return {
      frequency: businessFunction.criticality === 'critical' ? 'quarterly' : 'annually',
      scope: 'full_recovery_test',
      success_criteria: 'meet_rto_rpo'
    };
  }

  private async getBusinessFunctions(orgId: string): Promise<any[]> {
    const { data, error } = await supabase
      .from('business_functions')
      .select('*')
      .eq('org_id', orgId);

    if (error) {
      console.error('Error fetching business functions:', error);
      return [];
    }

    return data || [];
  }

  private async saveGeneratedFramework(frameworkData: Partial<GeneratedFrameworkData>): Promise<GeneratedFrameworkData> {
    const { data, error } = await supabase
      .from('generated_frameworks')
      .insert([frameworkData])
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data as GeneratedFrameworkData;
  }

  private async generateGovernanceComponents(
    frameworkId: string,
    frameworkData: Record<string, any>
  ): Promise<FrameworkComponent[]> {
    const components: Partial<FrameworkComponent>[] = [];
    
    // Generate committee components
    if (frameworkData.committees) {
      frameworkData.committees.forEach((committee: any, index: number) => {
        components.push({
          framework_id: frameworkId,
          component_type: 'committee',
          component_name: `${committee.name} Committee`,
          component_description: `${committee.name} committee with ${committee.size} members meeting ${committee.meeting_frequency}`,
          component_data: committee,
          implementation_priority: index + 1,
          estimated_effort_hours: 40
        });
      });
    }
    
    // Generate policy components
    if (frameworkData.policies_required) {
      frameworkData.policies_required.forEach((policy: string, index: number) => {
        components.push({
          framework_id: frameworkId,
          component_type: 'policy',
          component_name: policy.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
          component_description: `Policy document for ${policy}`,
          component_data: { policy_type: policy },
          implementation_priority: index + 1,
          estimated_effort_hours: 20
        });
      });
    }

    const { data, error } = await supabase
      .from('framework_components')
      .insert(components)
      .select();

    if (error) {
      throw error;
    }

    return data as FrameworkComponent[];
  }

  private async generateRiskAppetiteComponents(
    frameworkId: string,
    frameworkData: Record<string, any>
  ): Promise<FrameworkComponent[]> {
    const components: Partial<FrameworkComponent>[] = [];
    
    // Generate KRI components
    if (frameworkData.appetite_statements) {
      Object.entries(frameworkData.appetite_statements).forEach(([key, statement]: [string, any], index) => {
        components.push({
          framework_id: frameworkId,
          component_type: 'kri',
          component_name: `${key} KRI`,
          component_description: statement.statement,
          component_data: statement,
          implementation_priority: index + 1,
          estimated_effort_hours: 16
        });
      });
    }

    const { data, error } = await supabase
      .from('framework_components')
      .insert(components)
      .select();

    if (error) {
      throw error;
    }

    return data as FrameworkComponent[];
  }

  private async generateImpactToleranceComponents(
    frameworkId: string,
    frameworkData: Record<string, any>
  ): Promise<FrameworkComponent[]> {
    const components: Partial<FrameworkComponent>[] = [];
    
    // Generate business function tolerance components
    if (frameworkData.impact_tolerances) {
      Object.entries(frameworkData.impact_tolerances).forEach(([functionId, tolerance]: [string, any], index) => {
        components.push({
          framework_id: frameworkId,
          component_type: 'procedure',
          component_name: `Impact Tolerance for ${functionId}`,
          component_description: `Impact tolerance definition and monitoring procedures`,
          component_data: tolerance,
          implementation_priority: index + 1,
          estimated_effort_hours: 12
        });
      });
    }

    const { data, error } = await supabase
      .from('framework_components')
      .insert(components)
      .select();

    if (error) {
      throw error;
    }

    return data as FrameworkComponent[];
  }

  private createGovernanceImplementationPlan(
    profile: OrganizationalProfile,
    frameworkData: Record<string, any>
  ) {
    return {
      phases: [
        {
          name: 'Foundation Setup',
          duration: '2-3 months',
          tasks: [
            'Establish board composition',
            'Create committee charters',
            'Define reporting structures'
          ],
          dependencies: []
        },
        {
          name: 'Policy Development',
          duration: '3-4 months',
          tasks: [
            'Develop governance policies',
            'Create committee procedures',
            'Implement reporting frameworks'
          ],
          dependencies: ['Foundation Setup']
        },
        {
          name: 'Implementation & Testing',
          duration: '2-3 months',
          tasks: [
            'Conduct initial committee meetings',
            'Test reporting procedures',
            'Train stakeholders'
          ],
          dependencies: ['Policy Development']
        }
      ],
      total_estimated_hours: this.calculateTotalHours(frameworkData.committees?.length || 2, 60),
      success_metrics: [
        'All committees established and operational',
        'Policies approved and implemented',
        'Reporting procedures functioning',
        'Stakeholder satisfaction > 80%'
      ]
    };
  }

  private createRiskAppetiteImplementationPlan(
    profile: OrganizationalProfile,
    frameworkData: Record<string, any>
  ) {
    return {
      phases: [
        {
          name: 'Framework Design',
          duration: '1-2 months',
          tasks: [
            'Define risk appetite statements',
            'Set tolerance thresholds',
            'Design monitoring procedures'
          ],
          dependencies: []
        },
        {
          name: 'System Implementation',
          duration: '2-3 months',
          tasks: [
            'Implement monitoring systems',
            'Configure alerting mechanisms',
            'Integrate with existing systems'
          ],
          dependencies: ['Framework Design']
        },
        {
          name: 'Validation & Launch',
          duration: '1-2 months',
          tasks: [
            'Validate thresholds',
            'Test escalation procedures',
            'Train users'
          ],
          dependencies: ['System Implementation']
        }
      ],
      total_estimated_hours: this.calculateTotalHours(Object.keys(frameworkData.appetite_statements || {}).length, 20),
      success_metrics: [
        'All KRIs operational',
        'Monitoring systems functional',
        'Escalation procedures tested',
        'Risk appetite adherence > 95%'
      ]
    };
  }

  private createImpactToleranceImplementationPlan(
    profile: OrganizationalProfile,
    frameworkData: Record<string, any>
  ) {
    return {
      phases: [
        {
          name: 'Business Function Analysis',
          duration: '2-3 months',
          tasks: [
            'Map business functions',
            'Assess criticality',
            'Define impact tolerances'
          ],
          dependencies: []
        },
        {
          name: 'Recovery Planning',
          duration: '3-4 months',
          tasks: [
            'Develop recovery procedures',
            'Identify resources',
            'Create contingency plans'
          ],
          dependencies: ['Business Function Analysis']
        },
        {
          name: 'Testing & Validation',
          duration: '2-3 months',
          tasks: [
            'Conduct scenario tests',
            'Validate recovery procedures',
            'Update documentation'
          ],
          dependencies: ['Recovery Planning']
        }
      ],
      total_estimated_hours: this.calculateTotalHours(Object.keys(frameworkData.impact_tolerances || {}).length, 15),
      success_metrics: [
        'All business functions mapped',
        'Recovery procedures tested',
        'Impact tolerances validated',
        'Stakeholder approval obtained'
      ]
    };
  }

  private calculateTotalHours(components: number, hoursPerComponent: number): number {
    return components * hoursPerComponent;
  }

  private generateGovernanceRecommendations(
    profile: OrganizationalProfile,
    frameworkData: Record<string, any>
  ): string[] {
    const recommendations = [
      'Consider establishing a governance office for ongoing coordination',
      'Implement regular effectiveness assessments for all committees',
      'Develop clear communication channels between board and management'
    ];

    if (profile.governance_maturity === 'basic') {
      recommendations.push('Focus on foundational governance practices before advanced frameworks');
    }

    return recommendations;
  }

  private generateRiskAppetiteRecommendations(
    profile: OrganizationalProfile,
    frameworkData: Record<string, any>
  ): string[] {
    const recommendations = [
      'Regularly review and update risk appetite statements',
      'Ensure alignment between risk appetite and business strategy',
      'Implement automated monitoring where possible'
    ];

    if (profile.risk_maturity === 'basic') {
      recommendations.push('Start with simple risk appetite statements and evolve over time');
    }

    return recommendations;
  }

  private generateImpactToleranceRecommendations(
    profile: OrganizationalProfile,
    frameworkData: Record<string, any>
  ): string[] {
    const recommendations = [
      'Regularly test recovery procedures to ensure effectiveness',
      'Update impact tolerances based on business changes',
      'Consider automation for critical business functions'
    ];

    if (profile.operational_complexity === 'high') {
      recommendations.push('Prioritize the most critical business functions for immediate implementation');
    }

    return recommendations;
  }
}

export const intelligentFrameworkGenerationService = new IntelligentFrameworkGenerationService();
