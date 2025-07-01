
import { supabase } from "@/integrations/supabase/client";
import { getCurrentUserProfile } from "@/lib/supabase-utils";
import type {
  OrganizationalProfile,
  QuestionnaireTemplate,
  QuestionnaireResponse,
  RiskFrameworkTemplate,
  GeneratedFramework,
  ProfileAssessment,
  QuestionnaireSection
} from "@/types/organizational-intelligence";

class OrganizationalIntelligenceService {
  // Profile Management
  async getOrganizationalProfile(orgId?: string): Promise<OrganizationalProfile | null> {
    const profile = await getCurrentUserProfile();
    const organizationId = orgId || profile?.organization_id;
    
    if (!organizationId) return null;

    const { data, error } = await supabase
      .from('organizational_profiles')
      .select('*')
      .eq('org_id', organizationId)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching organizational profile:', error);
      return null;
    }

    return data;
  }

  async createOrUpdateProfile(profileData: Partial<OrganizationalProfile>): Promise<OrganizationalProfile | null> {
    const profile = await getCurrentUserProfile();
    if (!profile?.organization_id) return null;

    const existingProfile = await this.getOrganizationalProfile();
    
    const dataToSave = {
      org_id: profile.organization_id,
      organization_id: profile.organization_id,
      ...profileData
    };

    let result;
    if (existingProfile) {
      const { data, error } = await supabase
        .from('organizational_profiles')
        .update(dataToSave)
        .eq('id', existingProfile.id)
        .select()
        .single();
      
      if (error) throw error;
      result = data;
    } else {
      const { data, error } = await supabase
        .from('organizational_profiles')
        .insert([dataToSave])
        .select()
        .single();
      
      if (error) throw error;
      result = data;
    }

    // Calculate and update profile score
    await this.calculateProfileScore(result.id);
    
    return result;
  }

  // Questionnaire Management
  async getQuestionnaireTemplates(sector?: string, size?: string): Promise<QuestionnaireTemplate[]> {
    // Return mock data for now since we don't have database templates yet
    const mockTemplates: QuestionnaireTemplate[] = [
      {
        id: 'financial-services-template',
        name: 'Financial Services Risk Assessment',
        description: 'Comprehensive assessment for financial institutions',
        version: '1.0',
        target_sector: 'financial-services',
        questions: [
          {
            id: 'section-1',
            section: 'Organization Overview',
            description: 'Basic organizational information',
            questions: [
              {
                id: 'sub_sector',
                text: 'What is your organization\'s sub-sector?',
                type: 'select',
                options: ['banking', 'insurance', 'asset-management', 'fintech'],
                required: true,
                order: 1
              },
              {
                id: 'employee_count',
                text: 'Number of employees',
                type: 'number',
                required: true,
                order: 2
              },
              {
                id: 'asset_size',
                text: 'Total assets under management (in millions)',
                type: 'number',
                required: true,
                order: 3
              }
            ]
          }
        ],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    ];

    return mockTemplates;
  }

  async getQuestionnaireResponse(templateId: string): Promise<QuestionnaireResponse | null> {
    const profile = await getCurrentUserProfile();
    if (!profile?.organization_id) return null;

    // Mock response for now
    return null;
  }

  async saveQuestionnaireResponse(
    templateId: string, 
    responses: Record<string, any>, 
    currentSection?: string
  ): Promise<QuestionnaireResponse> {
    const profile = await getCurrentUserProfile();
    if (!profile?.organization_id) throw new Error('No organization found');

    // For now, just generate profile from responses
    await this.generateProfileFromResponses(responses, null);

    // Return mock response
    return {
      id: 'mock-response',
      organization_id: profile.organization_id,
      template_id: templateId,
      responses,
      completion_percentage: 100,
      current_section: currentSection,
      completed_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  }

  private async getOrganizationalProfileById(profileId: string): Promise<OrganizationalProfile | null> {
    const { data, error } = await supabase
      .from('organizational_profiles')
      .select('*')
      .eq('id', profileId)
      .single();

    if (error) {
      console.error('Error fetching profile by ID:', error);
      return null;
    }

    return data;
  }

  // Framework Generation
  async generateRiskFramework(profileId: string): Promise<GeneratedFramework | null> {
    const profile = await this.getOrganizationalProfileById(profileId);
    if (!profile) return null;

    // Mock framework generation
    const frameworkData = {
      name: 'Custom Risk Management Framework',
      categories: ['Operational Risk', 'Compliance Risk', 'Technology Risk'],
      controls: ['Monthly risk assessments', 'Compliance monitoring', 'Technology audits']
    };

    return {
      id: 'mock-framework',
      profile_id: profileId,
      name: 'Generated Framework',
      description: 'AI-generated risk framework',
      framework_data: frameworkData,
      effectiveness_score: 85,
      implementation_status: 'draft',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  }

  // Profile Assessment and Scoring
  async calculateProfileScore(profileId: string): Promise<number> {
    const profile = await this.getOrganizationalProfileById(profileId);
    if (!profile) return 0;

    let score = 0;
    let maxScore = 0;

    // Risk maturity scoring (0-25 points)
    maxScore += 25;
    if (profile.risk_maturity) {
      const maturityScores = { basic: 10, developing: 15, advanced: 20, sophisticated: 25 };
      score += maturityScores[profile.risk_maturity];
    }

    // Compliance maturity scoring (0-25 points)
    maxScore += 25;
    if (profile.compliance_maturity) {
      const complianceScores = { basic: 10, developing: 15, advanced: 20, sophisticated: 25 };
      score += complianceScores[profile.compliance_maturity];
    }

    // Technology maturity scoring (0-20 points)
    maxScore += 20;
    if (profile.technology_maturity) {
      const techScores = { basic: 8, developing: 12, advanced: 16, sophisticated: 20 };
      score += techScores[profile.technology_maturity];
    }

    // Digital transformation scoring (0-20 points)
    maxScore += 20;
    if (profile.digital_transformation) {
      const digitalScores = { basic: 8, developing: 12, advanced: 16, sophisticated: 20 };
      score += digitalScores[profile.digital_transformation];
    }

    // Completeness scoring (0-10 points)
    maxScore += 10;
    const completeness = this.calculateProfileCompleteness(profile);
    score += (completeness / 100) * 10;

    const finalScore = Math.round((score / maxScore) * 100);

    // Update the profile with the calculated score
    await supabase
      .from('organizational_profiles')
      .update({ 
        profile_score: finalScore,
        completeness_percentage: completeness
      })
      .eq('id', profileId);

    return finalScore;
  }

  private calculateProfileCompleteness(profile: OrganizationalProfile): number {
    const fields = [
      'sub_sector', 'employee_count', 'asset_size', 'geographic_scope',
      'risk_maturity', 'risk_culture', 'compliance_maturity', 'regulatory_history',
      'business_lines', 'technology_maturity', 'digital_transformation',
      'primary_regulators', 'applicable_frameworks', 'growth_strategy',
      'market_position'
    ];

    const completedFields = fields.filter(field => {
      const value = (profile as any)[field];
      return value !== null && value !== undefined && value !== '';
    }).length;

    return Math.round((completedFields / fields.length) * 100);
  }

  async generateProfileAssessment(profileId: string): Promise<ProfileAssessment> {
    const profile = await this.getOrganizationalProfileById(profileId);
    if (!profile) throw new Error('Profile not found');

    const score = await this.calculateProfileScore(profileId);
    const completeness = this.calculateProfileCompleteness(profile);

    const assessment: ProfileAssessment = {
      id: 'mock-assessment',
      profile_id: profileId,
      score,
      completeness,
      strengths: this.identifyStrengths(profile),
      weaknesses: this.identifyWeaknesses(profile),
      recommendations: this.generateRecommendations(profile),
      risk_level: this.determineRiskLevel(profile),
      maturity_level: this.determineMaturityLevel(profile),
      next_steps: this.generateNextSteps(profile),
      created_at: new Date().toISOString()
    };

    return assessment;
  }

  private identifyStrengths(profile: OrganizationalProfile): string[] {
    const strengths = [];

    if (profile.risk_maturity === 'advanced' || profile.risk_maturity === 'sophisticated') {
      strengths.push('Strong risk management maturity');
    }

    if (profile.compliance_maturity === 'advanced' || profile.compliance_maturity === 'sophisticated') {
      strengths.push('Excellent compliance framework');
    }

    if (profile.technology_maturity === 'advanced' || profile.technology_maturity === 'sophisticated') {
      strengths.push('Advanced technology infrastructure');
    }

    if (profile.digital_transformation === 'advanced' || profile.digital_transformation === 'sophisticated') {
      strengths.push('Digital transformation leadership');
    }

    if (profile.regulatory_history === 'clean') {
      strengths.push('Clean regulatory history');
    }

    return strengths.length > 0 ? strengths : ['Basic organizational structure in place'];
  }

  private identifyWeaknesses(profile: OrganizationalProfile): string[] {
    const weaknesses = [];

    if (profile.risk_maturity === 'basic') {
      weaknesses.push('Limited risk management maturity');
    }

    if (profile.compliance_maturity === 'basic') {
      weaknesses.push('Basic compliance framework needs enhancement');
    }

    if (profile.technology_maturity === 'basic') {
      weaknesses.push('Technology infrastructure requires modernization');
    }

    if (profile.regulatory_history === 'significant-issues') {
      weaknesses.push('History of regulatory issues requires attention');
    }

    if (profile.previous_incidents && profile.previous_incidents > 5) {
      weaknesses.push('High number of previous incidents');
    }

    return weaknesses;
  }

  private generateRecommendations(profile: OrganizationalProfile): string[] {
    const recommendations = [];

    if (profile.risk_maturity === 'basic' || profile.risk_maturity === 'developing') {
      recommendations.push('Invest in risk management training and tools');
      recommendations.push('Establish formal risk appetite statements');
    }

    if (profile.compliance_maturity === 'basic') {
      recommendations.push('Implement comprehensive compliance monitoring');
      recommendations.push('Establish regular compliance training programs');
    }

    if (profile.technology_maturity === 'basic') {
      recommendations.push('Develop technology modernization roadmap');
      recommendations.push('Invest in cybersecurity capabilities');
    }

    if (profile.third_party_dependencies && profile.third_party_dependencies > 20) {
      recommendations.push('Implement enhanced third-party risk management');
      recommendations.push('Establish vendor risk assessment protocols');
    }

    return recommendations;
  }

  private determineRiskLevel(profile: OrganizationalProfile): 'low' | 'medium' | 'high' | 'critical' {
    let riskFactors = 0;

    if (profile.risk_maturity === 'basic') riskFactors++;
    if (profile.compliance_maturity === 'basic') riskFactors++;
    if (profile.regulatory_history === 'significant-issues') riskFactors += 2;
    if (profile.previous_incidents && profile.previous_incidents > 10) riskFactors++;
    if (profile.technology_maturity === 'basic') riskFactors++;

    if (riskFactors >= 4) return 'critical';
    if (riskFactors >= 3) return 'high';
    if (riskFactors >= 2) return 'medium';
    return 'low';
  }

  private determineMaturityLevel(profile: OrganizationalProfile): 'basic' | 'developing' | 'advanced' | 'sophisticated' {
    const maturityScores = [];

    if (profile.risk_maturity) {
      const scores = { basic: 1, developing: 2, advanced: 3, sophisticated: 4 };
      maturityScores.push(scores[profile.risk_maturity]);
    }

    if (profile.compliance_maturity) {
      const scores = { basic: 1, developing: 2, advanced: 3, sophisticated: 4 };
      maturityScores.push(scores[profile.compliance_maturity]);
    }

    if (profile.technology_maturity) {
      const scores = { basic: 1, developing: 2, advanced: 3, sophisticated: 4 };
      maturityScores.push(scores[profile.technology_maturity]);
    }

    const avgScore = maturityScores.reduce((sum, score) => sum + score, 0) / maturityScores.length;

    if (avgScore >= 3.5) return 'sophisticated';
    if (avgScore >= 2.5) return 'advanced';
    if (avgScore >= 1.5) return 'developing';
    return 'basic';
  }

  private generateNextSteps(profile: OrganizationalProfile): string[] {
    const nextSteps = [];

    if (this.calculateProfileCompleteness(profile) < 80) {
      nextSteps.push('Complete organizational profile assessment');
    }

    if (!profile.risk_maturity || profile.risk_maturity === 'basic') {
      nextSteps.push('Develop risk management framework');
    }

    if (!profile.applicable_frameworks || profile.applicable_frameworks.length === 0) {
      nextSteps.push('Identify applicable regulatory frameworks');
    }

    nextSteps.push('Generate customized risk management framework');
    nextSteps.push('Schedule regular profile reassessment');

    return nextSteps;
  }

  // Helper method to generate profile from questionnaire responses
  private async generateProfileFromResponses(responses: Record<string, any>, template: QuestionnaireTemplate | null): Promise<void> {
    const profileData: Partial<OrganizationalProfile> = {};

    // Map questionnaire responses to profile fields
    Object.entries(responses).forEach(([key, value]) => {
      switch (key) {
        case 'sub_sector':
          profileData.sub_sector = value;
          break;
        case 'employee_count':
          profileData.employee_count = parseInt(value);
          break;
        case 'asset_size':
          profileData.asset_size = parseInt(value) * 1000000; // Convert millions to actual amount
          break;
        case 'risk_maturity':
          profileData.risk_maturity = value;
          break;
        case 'compliance_maturity':
          profileData.compliance_maturity = value;
          break;
        case 'technology_maturity':
          profileData.technology_maturity = value;
          break;
        case 'digital_transformation':
          profileData.digital_transformation = value;
          break;
        case 'geographic_scope':
          profileData.geographic_scope = value;
          break;
        case 'risk_culture':
          profileData.risk_culture = value;
          break;
        case 'regulatory_history':
          profileData.regulatory_history = value;
          break;
        case 'business_lines':
          profileData.business_lines = Array.isArray(value) ? value : [value];
          break;
        case 'primary_regulators':
          profileData.primary_regulators = Array.isArray(value) ? value : [value];
          break;
        case 'applicable_frameworks':
          profileData.applicable_frameworks = Array.isArray(value) ? value : [value];
          break;
        case 'growth_strategy':
          profileData.growth_strategy = value;
          break;
        case 'market_position':
          profileData.market_position = value;
          break;
      }
    });

    await this.createOrUpdateProfile(profileData);
  }
}

export const organizationalIntelligenceService = new OrganizationalIntelligenceService();
