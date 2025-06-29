import { supabase } from "@/integrations/supabase/client";

export interface MitigationRecommendation {
  strategy: string;
  description: string;
  priority: number;
  expectedImpact: number;
  implementationCost: 'low' | 'medium' | 'high';
  timeframe: string;
  requiredResources: string[];
  successMetrics: string[];
  riskReduction: number;
}

export interface BestPracticeRecommendation {
  title: string;
  description: string;
  category: string;
  maturityLevel: 'basic' | 'intermediate' | 'advanced' | 'expert';
  currentGap: 'none' | 'minor' | 'moderate' | 'significant';
  implementationEffort: 'low' | 'medium' | 'high';
  businessValue: number;
  compliance: string[];
  prerequisites: string[];
}

export interface TrainingRecommendation {
  skillGap: string;
  trainingType: 'workshop' | 'certification' | 'online' | 'mentoring';
  targetAudience: string[];
  priority: 'low' | 'medium' | 'high' | 'critical';
  estimatedDuration: string;
  cost: 'low' | 'medium' | 'high';
  vendor: string | null;
  outcomes: string[];
  assessmentMethod: string;
}

export interface ResourceOptimization {
  resource: string;
  currentAllocation: {
    budget: string;
    personnel: number;
    tools: string[];
  };
  recommendedAllocation: {
    budget: string;
    personnel: number;
    tools: string[];
  };
  rationale: string;
  expectedROI: number;
  riskImpact: 'positive' | 'neutral' | 'negative';
  implementationPlan: string[];
}

class RecommendationsEngineService {
  async generateMitigationRecommendations(
    riskCategory: 'operational' | 'cyber' | 'compliance' | 'financial' | 'reputational',
    severity: 'low' | 'medium' | 'high' | 'critical',
    orgId: string
  ): Promise<MitigationRecommendation[]> {
    try {
      // Get organization data for context
      const [incidents, controls, kris] = await Promise.all([
        this.getRecentIncidents(orgId, riskCategory),
        this.getControlEffectiveness(orgId),
        this.getKRITrends(orgId)
      ]);

      const recommendations: MitigationRecommendation[] = [];

      // Generate category-specific recommendations
      switch (riskCategory) {
        case 'operational':
          recommendations.push(...this.generateOperationalRecommendations(severity, incidents));
          break;
        case 'cyber':
          recommendations.push(...this.generateCyberRecommendations(severity, incidents));
          break;
        case 'compliance':
          recommendations.push(...this.generateComplianceRecommendations(severity, incidents));
          break;
        case 'financial':
          recommendations.push(...this.generateFinancialRecommendations(severity, incidents));
          break;
        case 'reputational':
          recommendations.push(...this.generateReputationalRecommendations(severity, incidents));
          break;
      }

      // Prioritize based on severity and organizational context
      return recommendations
        .sort((a, b) => b.priority - a.priority)
        .slice(0, 10);

    } catch (error) {
      console.error('Error generating mitigation recommendations:', error);
      return [];
    }
  }

  async generateBestPracticeRecommendations(orgId: string): Promise<BestPracticeRecommendation[]> {
    try {
      // Assess current maturity across different areas
      const [controls, frameworks, incidents] = await Promise.all([
        this.getControlsMaturity(orgId),
        this.getGovernanceMaturity(orgId),
        this.getIncidentManagementMaturity(orgId)
      ]);

      const recommendations: BestPracticeRecommendation[] = [];

      // Risk Management Best Practices
      recommendations.push({
        title: 'Implement Risk Heat Mapping',
        description: 'Create visual risk heat maps to better communicate risk exposure across the organization',
        category: 'Risk Management',
        maturityLevel: 'intermediate',
        currentGap: this.assessGap(controls, 'heat_mapping'),
        implementationEffort: 'medium',
        businessValue: 0.75,
        compliance: ['OSFI E-21', 'ISO 31000'],
        prerequisites: ['Risk register', 'Risk categorization']
      });

      // Governance Best Practices
      recommendations.push({
        title: 'Establish Risk Appetite Framework',
        description: 'Define and implement quantitative risk appetite statements with clear thresholds',
        category: 'Governance',
        maturityLevel: 'advanced',
        currentGap: this.assessGap(frameworks, 'risk_appetite'),
        implementationEffort: 'high',
        businessValue: 0.9,
        compliance: ['OSFI E-21', 'COSO ERM'],
        prerequisites: ['Board governance', 'Risk strategy']
      });

      // Operational Resilience Best Practices
      if (incidents.length > 0) {
        recommendations.push({
          title: 'Implement Predictive Analytics',
          description: 'Use machine learning to predict potential operational disruptions',
          category: 'Operational Resilience',
          maturityLevel: 'expert',
          currentGap: 'significant',
          implementationEffort: 'high',
          businessValue: 0.85,
          compliance: ['OSFI E-21'],
          prerequisites: ['Data infrastructure', 'Analytics capabilities']
        });
      }

      return recommendations
        .filter(r => r.currentGap !== 'none')
        .sort((a, b) => b.businessValue - a.businessValue)
        .slice(0, 8);

    } catch (error) {
      console.error('Error generating best practice recommendations:', error);
      return [];
    }
  }

  async generateTrainingRecommendations(orgId: string): Promise<TrainingRecommendation[]> {
    try {
      // Analyze skill gaps based on incident patterns and control weaknesses
      const [incidents, controlTests, profiles] = await Promise.all([
        this.getRecentIncidents(orgId),
        this.getControlTestResults(orgId),
        this.getOrganizationProfiles(orgId)
      ]);

      const recommendations: TrainingRecommendation[] = [];

      // Identify skill gaps from incident analysis
      const incidentSkillGaps = this.analyzeIncidentSkillGaps(incidents);
      recommendations.push(...incidentSkillGaps);

      // Identify skill gaps from control testing
      const controlSkillGaps = this.analyzeControlSkillGaps(controlTests);
      recommendations.push(...controlSkillGaps);

      // Role-specific training recommendations
      const roleBasedTraining = this.generateRoleBasedTraining(profiles);
      recommendations.push(...roleBasedTraining);

      return recommendations
        .sort((a, b) => this.getPriorityScore(b.priority) - this.getPriorityScore(a.priority))
        .slice(0, 6);

    } catch (error) {
      console.error('Error generating training recommendations:', error);
      return [];
    }
  }

  async optimizeResourceAllocation(orgId: string): Promise<ResourceOptimization[]> {
    try {
      // Get current resource allocation data
      const [controlEffectiveness, incidentCosts, riskExposure] = await Promise.all([
        this.getControlEffectiveness(orgId),
        this.calculateIncidentCosts(orgId),
        this.calculateRiskExposure(orgId)
      ]);

      const optimizations: ResourceOptimization[] = [];

      // Analyze control investment efficiency
      const controlOptimizations = this.analyzeControlInvestments(controlEffectiveness, incidentCosts);
      optimizations.push(...controlOptimizations);

      // Analyze staffing efficiency
      const staffingOptimizations = this.analyzeStaffingEfficiency(riskExposure);
      optimizations.push(...staffingOptimizations);

      // Technology investment analysis
      const technologyOptimizations = this.analyzeTechnologyInvestments(orgId);
      optimizations.push(...technologyOptimizations);

      return optimizations
        .filter(opt => opt.expectedROI > 0.1) // Only show optimizations with >10% ROI
        .sort((a, b) => b.expectedROI - a.expectedROI)
        .slice(0, 5);

    } catch (error) {
      console.error('Error optimizing resource allocation:', error);
      return [];
    }
  }

  // Private helper methods
  private async getRecentIncidents(orgId: string, category?: string) {
    let query = supabase
      .from('incident_logs')
      .select('*')
      .eq('org_id', orgId)
      .gte('reported_at', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString());

    if (category) {
      query = query.eq('category', category);
    }

    const { data, error } = await query;
    return data || [];
  }

  private async getControlEffectiveness(orgId: string) {
    const { data, error } = await supabase
      .from('control_tests')
      .select('*')
      .eq('org_id', orgId)
      .gte('test_date', new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);

    return data || [];
  }

  private async getKRITrends(orgId: string) {
    const { data, error } = await supabase
      .from('kri_logs')
      .select(`
        *,
        kri_definitions!inner(org_id, name)
      `)
      .eq('kri_definitions.org_id', orgId)
      .gte('measurement_date', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);

    return data || [];
  }

  private generateOperationalRecommendations(severity: string, incidents: any[]): MitigationRecommendation[] {
    const recommendations: MitigationRecommendation[] = [];

    if (severity === 'critical' || severity === 'high') {
      recommendations.push({
        strategy: 'Implement Real-time Monitoring',
        description: 'Deploy comprehensive monitoring tools to detect operational issues before they escalate',
        priority: severity === 'critical' ? 10 : 8,
        expectedImpact: 0.8,
        implementationCost: 'high',
        timeframe: '3-6 months',
        requiredResources: ['Monitoring tools', 'Technical staff', 'Integration support'],
        successMetrics: ['Mean time to detection', 'Alert accuracy', 'Incident prevention rate'],
        riskReduction: 0.7
      });
    }

    recommendations.push({
      strategy: 'Enhance Process Documentation',
      description: 'Create detailed process documentation with clear escalation procedures',
      priority: 6,
      expectedImpact: 0.6,
      implementationCost: 'low',
      timeframe: '1-2 months',
      requiredResources: ['Process analysts', 'Documentation templates'],
      successMetrics: ['Process adherence rate', 'Training completion', 'Error reduction'],
      riskReduction: 0.4
    });

    return recommendations;
  }

  private generateCyberRecommendations(severity: string, incidents: any[]): MitigationRecommendation[] {
    const recommendations: MitigationRecommendation[] = [];

    recommendations.push({
      strategy: 'Multi-Factor Authentication',
      description: 'Implement MFA across all critical systems and applications',
      priority: severity === 'critical' ? 10 : 7,
      expectedImpact: 0.85,
      implementationCost: 'medium',
      timeframe: '2-3 months',
      requiredResources: ['MFA solution', 'IT support', 'User training'],
      successMetrics: ['MFA adoption rate', 'Security incidents', 'User satisfaction'],
      riskReduction: 0.8
    });

    if (incidents.length > 5) {
      recommendations.push({
        strategy: 'Security Awareness Training',
        description: 'Comprehensive cybersecurity training program for all employees',
        priority: 8,
        expectedImpact: 0.7,
        implementationCost: 'medium',
        timeframe: '1-2 months',
        requiredResources: ['Training platform', 'Security experts', 'Training content'],
        successMetrics: ['Training completion', 'Phishing test results', 'Incident reduction'],
        riskReduction: 0.6
      });
    }

    return recommendations;
  }

  private generateComplianceRecommendations(severity: string, incidents: any[]): MitigationRecommendation[] {
    return [{
      strategy: 'Automated Compliance Monitoring',
      description: 'Implement automated tools to monitor compliance with regulatory requirements',
      priority: severity === 'critical' ? 9 : 6,
      expectedImpact: 0.75,
      implementationCost: 'high',
      timeframe: '4-6 months',
      requiredResources: ['Compliance software', 'Legal expertise', 'Process mapping'],
      successMetrics: ['Compliance score', 'Audit findings', 'Regulatory feedback'],
      riskReduction: 0.7
    }];
  }

  private generateFinancialRecommendations(severity: string, incidents: any[]): MitigationRecommendation[] {
    return [{
      strategy: 'Financial Risk Analytics',
      description: 'Deploy advanced analytics to monitor financial risk indicators in real-time',
      priority: severity === 'critical' ? 10 : 7,
      expectedImpact: 0.8,
      implementationCost: 'high',
      timeframe: '3-6 months',
      requiredResources: ['Analytics platform', 'Risk analysts', 'Data integration'],
      successMetrics: ['Risk prediction accuracy', 'Loss prevention', 'Decision speed'],
      riskReduction: 0.75
    }];
  }

  private generateReputationalRecommendations(severity: string, incidents: any[]): MitigationRecommendation[] {
    return [{
      strategy: 'Crisis Communication Plan',
      description: 'Develop comprehensive crisis communication strategy and response team',
      priority: severity === 'critical' ? 9 : 6,
      expectedImpact: 0.7,
      implementationCost: 'medium',
      timeframe: '2-3 months',
      requiredResources: ['Communications team', 'PR expertise', 'Media templates'],
      successMetrics: ['Response time', 'Message consistency', 'Stakeholder sentiment'],
      riskReduction: 0.6
    }];
  }

  private async getControlsMaturity(orgId: string) {
    const { data, error } = await supabase
      .from('controls')
      .select('*')
      .eq('org_id', orgId);

    return data || [];
  }

  private async getGovernanceMaturity(orgId: string) {
    const { data, error } = await supabase
      .from('governance_frameworks')
      .select('*')
      .eq('org_id', orgId);

    return data || [];
  }

  private async getIncidentManagementMaturity(orgId: string) {
    const { data, error } = await supabase
      .from('incident_logs')
      .select('*')
      .eq('org_id', orgId)
      .gte('reported_at', new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString());

    return data || [];
  }

  private assessGap(data: any[], feature: string): 'none' | 'minor' | 'moderate' | 'significant' {
    // Simplified gap assessment - in reality this would be more sophisticated
    const maturityScore = data.length > 0 ? Math.min(data.length / 10, 1) : 0;
    
    if (maturityScore > 0.8) return 'none';
    if (maturityScore > 0.6) return 'minor';
    if (maturityScore > 0.3) return 'moderate';
    return 'significant';
  }

  private async getControlTestResults(orgId: string) {
    const { data, error } = await supabase
      .from('control_tests')
      .select('*')
      .eq('org_id', orgId)
      .gte('test_date', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]);

    return data || [];
  }

  private async getOrganizationProfiles(orgId: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('organization_id', orgId);

    return data || [];
  }

  private analyzeIncidentSkillGaps(incidents: any[]): TrainingRecommendation[] {
    const recommendations: TrainingRecommendation[] = [];

    // Analyze incident categories to identify skill gaps
    const categoryCount = incidents.reduce((acc, incident) => {
      acc[incident.category] = (acc[incident.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    if (categoryCount.cyber > 3) {
      recommendations.push({
        skillGap: 'Cybersecurity Incident Response',
        trainingType: 'certification',
        targetAudience: ['IT Security', 'Incident Response Team'],
        priority: 'high',
        estimatedDuration: '40 hours',
        cost: 'high',
        vendor: 'SANS Institute',
        outcomes: ['Improved incident response time', 'Better threat detection'],
        assessmentMethod: 'Practical simulation'
      });
    }

    return recommendations;
  }

  private analyzeControlSkillGaps(controlTests: any[]): TrainingRecommendation[] {
    const recommendations: TrainingRecommendation[] = [];

    // Find controls with low effectiveness ratings
    const lowEffectivenessTests = controlTests.filter(test => 
      (test.effectiveness_rating || 0) < 3
    );

    if (lowEffectivenessTests.length > 2) {
      recommendations.push({
        skillGap: 'Control Testing and Assessment',
        trainingType: 'workshop',
        targetAudience: ['Risk Analysts', 'Internal Audit'],
        priority: 'medium',
        estimatedDuration: '16 hours',
        cost: 'medium',
        vendor: 'IIA',
        outcomes: ['Improved control testing quality', 'Better risk assessment'],
        assessmentMethod: 'Case study review'
      });
    }

    return recommendations;
  }

  private generateRoleBasedTraining(profiles: any[]): TrainingRecommendation[] {
    const recommendations: TrainingRecommendation[] = [];

    // Count roles to determine training needs
    const roleCounts = profiles.reduce((acc, profile) => {
      acc[profile.role] = (acc[profile.role] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    if (roleCounts.analyst > 2) {
      recommendations.push({
        skillGap: 'Advanced Risk Analytics',
        trainingType: 'online',
        targetAudience: ['Risk Analysts'],
        priority: 'medium',
        estimatedDuration: '20 hours',
        cost: 'low',
        vendor: 'Coursera',
        outcomes: ['Enhanced analytical capabilities', 'Better risk modeling'],
        assessmentMethod: 'Project-based assessment'
      });
    }

    return recommendations;
  }

  private getPriorityScore(priority: string): number {
    const scores = { critical: 4, high: 3, medium: 2, low: 1 };
    return scores[priority as keyof typeof scores] || 0;
  }

  private async calculateIncidentCosts(orgId: string) {
    // Simplified cost calculation - would be more sophisticated in practice
    const { data: incidents } = await supabase
      .from('incident_logs')
      .select('*')
      .eq('org_id', orgId)
      .gte('reported_at', new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString());

    return incidents?.map(incident => ({
      category: incident.category,
      estimatedCost: this.estimateIncidentCost(incident.severity),
      frequency: 1
    })) || [];
  }

  private estimateIncidentCost(severity: string): number {
    const costs = { low: 1000, medium: 5000, high: 25000, critical: 100000 };
    return costs[severity as keyof typeof costs] || 5000;
  }

  private async calculateRiskExposure(orgId: string) {
    // Simplified risk exposure calculation
    return {
      operational: 0.7,
      cyber: 0.8,
      compliance: 0.5,
      financial: 0.6,
      reputational: 0.4
    };
  }

  private analyzeControlInvestments(controlEffectiveness: any[], incidentCosts: any[]): ResourceOptimization[] {
    const optimizations: ResourceOptimization[] = [];

    // Find controls with low effectiveness but high investment
    const inefficientControls = controlEffectiveness.filter(control => 
      (control.effectiveness_rating || 0) < 3
    );

    if (inefficientControls.length > 0) {
      optimizations.push({
        resource: 'Control Testing Budget',
        currentAllocation: {
          budget: '$50,000',
          personnel: 2,
          tools: ['Manual testing', 'Spreadsheets']
        },
        recommendedAllocation: {
          budget: '$75,000',
          personnel: 3,
          tools: ['Automated testing tools', 'Risk management platform']
        },
        rationale: 'Increase investment in automated testing to improve control effectiveness',
        expectedROI: 0.35,
        riskImpact: 'positive',
        implementationPlan: [
          'Evaluate automated testing tools',
          'Train staff on new procedures',
          'Implement phased rollout'
        ]
      });
    }

    return optimizations;
  }

  private analyzeStaffingEfficiency(riskExposure: any): ResourceOptimization[] {
    return [{
      resource: 'Risk Management Team',
      currentAllocation: {
        budget: '$200,000',
        personnel: 3,
        tools: ['Basic risk tools']
      },
      recommendedAllocation: {
        budget: '$250,000',
        personnel: 4,
        tools: ['Advanced analytics platform', 'Automated reporting']
      },
      rationale: 'Increase staffing to handle growing risk complexity and regulatory requirements',
      expectedROI: 0.25,
      riskImpact: 'positive',
      implementationPlan: [
        'Define new role requirements',
        'Recruit experienced risk professional',
        'Implement advanced tooling'
      ]
    }];
  }

  private async analyzeTechnologyInvestments(orgId: string): Promise<ResourceOptimization[]> {
    return [{
      resource: 'Risk Technology Stack',
      currentAllocation: {
        budget: '$100,000',
        personnel: 1,
        tools: ['Spreadsheets', 'Basic reporting']
      },
      recommendedAllocation: {
        budget: '$150,000',
        personnel: 2,
        tools: ['Integrated risk platform', 'AI/ML analytics', 'Real-time dashboards']
      },
      rationale: 'Modernize technology stack to enable predictive risk management and real-time monitoring',
      expectedROI: 0.4,
      riskImpact: 'positive',
      implementationPlan: [
        'Evaluate integrated risk platforms',
        'Plan data migration strategy',
        'Train team on new tools',
        'Implement in phases'
      ]
    }];
  }
}

export const recommendationsEngineService = new RecommendationsEngineService();
