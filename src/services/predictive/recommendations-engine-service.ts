
import { supabase } from "@/integrations/supabase/client";
import { getCurrentUserProfile, getUserOrganization } from "@/lib/supabase-utils";

export interface MitigationRecommendation {
  id: string;
  riskCategory: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  strategy: string;
  description: string;
  implementationSteps: string[];
  expectedImpact: number; // 0-1 scale
  implementationCost: 'low' | 'medium' | 'high';
  timeframe: string;
  priority: number; // 1-10 scale
  successMetrics: string[];
  prerequisites: string[];
  resources: string[];
}

export interface BestPracticeRecommendation {
  id: string;
  title: string;
  category: string;
  description: string;
  industryBenchmark: string;
  currentGap: string;
  implementationGuidance: string[];
  expectedBenefits: string[];
  kpiTargets: Array<{
    metric: string;
    currentValue: string;
    targetValue: string;
  }>;
  maturityLevel: 'basic' | 'intermediate' | 'advanced' | 'leading';
}

export interface ResourceOptimization {
  area: string;
  currentAllocation: {
    budget: number;
    personnel: number;
    tools: number;
  };
  recommendedAllocation: {
    budget: number;
    personnel: number;
    tools: number;
  };
  reallocationPlan: Array<{
    action: string;
    impact: string;
    timeline: string;
  }>;
  expectedROI: number;
  riskReduction: number;
}

export interface TrainingRecommendation {
  id: string;
  targetAudience: string[];
  skillGap: string;
  trainingType: 'online' | 'workshop' | 'certification' | 'mentoring';
  priority: 'urgent' | 'high' | 'medium' | 'low';
  description: string;
  learningObjectives: string[];
  suggestedProviders: string[];
  estimatedDuration: string;
  cost: string;
  competencyMapping: Array<{
    skill: string;
    currentLevel: number;
    targetLevel: number;
  }>;
}

class RecommendationsEngineService {
  async generateMitigationRecommendations(
    riskCategory: string,
    riskLevel: 'low' | 'medium' | 'high' | 'critical',
    orgId: string
  ): Promise<MitigationRecommendation[]> {
    try {
      const [org, currentControls, recentIncidents] = await Promise.all([
        getUserOrganization(),
        this.getCurrentControls(orgId, riskCategory),
        this.getRecentIncidents(orgId, riskCategory)
      ]);

      const recommendations = [];
      const mitigationStrategies = this.getMitigationStrategies(riskCategory, riskLevel);

      for (const strategy of mitigationStrategies) {
        const recommendation = await this.buildMitigationRecommendation(
          strategy,
          riskCategory,
          riskLevel,
          org,
          currentControls,
          recentIncidents
        );
        recommendations.push(recommendation);
      }

      // Sort by priority
      return recommendations.sort((a, b) => b.priority - a.priority);
    } catch (error) {
      console.error('Error generating mitigation recommendations:', error);
      return [];
    }
  }

  async generateBestPracticeRecommendations(orgId: string): Promise<BestPracticeRecommendation[]> {
    try {
      const [org, maturityAssessment, industryBenchmarks] = await Promise.all([
        getUserOrganization(),
        this.assessOrganizationalMaturity(orgId),
        this.getIndustryBenchmarks(orgId)
      ]);

      const recommendations = [];
      const practiceAreas = [
        'risk_governance',
        'incident_management',
        'business_continuity',
        'third_party_risk',
        'cyber_security',
        'compliance_management'
      ];

      for (const area of practiceAreas) {
        const recommendation = this.buildBestPracticeRecommendation(
          area,
          maturityAssessment[area],
          industryBenchmarks[area],
          org
        );
        recommendations.push(recommendation);
      }

      return recommendations.filter(r => r.currentGap !== 'none');
    } catch (error) {
      console.error('Error generating best practice recommendations:', error);
      return [];
    }
  }

  async optimizeResourceAllocation(orgId: string): Promise<ResourceOptimization[]> {
    try {
      const [currentSpending, riskExposure, effectiveness] = await Promise.all([
        this.getCurrentResourceAllocation(orgId),
        this.getRiskExposureByArea(orgId),
        this.getControlEffectiveness(orgId)
      ]);

      const optimizations = [];
      const riskAreas = Object.keys(currentSpending);

      for (const area of riskAreas) {
        const optimization = this.calculateOptimalAllocation(
          area,
          currentSpending[area],
          riskExposure[area],
          effectiveness[area]
        );
        
        if (this.isSignificantOptimization(optimization)) {
          optimizations.push(optimization);
        }
      }

      return optimizations;
    } catch (error) {
      console.error('Error optimizing resource allocation:', error);
      return [];
    }
  }

  async generateTrainingRecommendations(orgId: string): Promise<TrainingRecommendation[]> {
    try {
      const [skillGaps, roleCompetencies, trainingHistory] = await Promise.all([
        this.identifySkillGaps(orgId),
        this.getRoleCompetencies(orgId),
        this.getTrainingHistory(orgId)
      ]);

      const recommendations = [];

      for (const gap of skillGaps) {
        const recommendation = this.buildTrainingRecommendation(
          gap,
          roleCompetencies,
          trainingHistory
        );
        recommendations.push(recommendation);
      }

      return recommendations.sort((a, b) => {
        const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      });
    } catch (error) {
      console.error('Error generating training recommendations:', error);
      return [];
    }
  }

  private async getCurrentControls(orgId: string, riskCategory: string) {
    const { data, error } = await supabase
      .from('controls')
      .select('*')
      .eq('org_id', orgId)
      .ilike('control_description', `%${riskCategory}%`);

    return data || [];
  }

  private async getRecentIncidents(orgId: string, riskCategory: string) {
    const { data, error } = await supabase
      .from('incident_logs')
      .select('*')
      .eq('org_id', orgId)
      .eq('category', riskCategory)
      .gte('reported_at', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString())
      .order('reported_at', { ascending: false });

    return data || [];
  }

  private getMitigationStrategies(riskCategory: string, riskLevel: string) {
    const strategies: Record<string, Record<string, any[]>> = {
      operational: {
        low: [
          { name: 'Process Documentation', type: 'preventive' },
          { name: 'Regular Reviews', type: 'detective' }
        ],
        medium: [
          { name: 'Automated Monitoring', type: 'detective' },
          { name: 'Backup Procedures', type: 'corrective' },
          { name: 'Staff Training', type: 'preventive' }
        ],
        high: [
          { name: 'Redundant Systems', type: 'preventive' },
          { name: 'Real-time Monitoring', type: 'detective' },
          { name: 'Incident Response Team', type: 'corrective' }
        ],
        critical: [
          { name: 'Business Continuity Plan', type: 'corrective' },
          { name: 'Crisis Management', type: 'corrective' },
          { name: 'Emergency Procedures', type: 'corrective' }
        ]
      },
      cyber: {
        low: [
          { name: 'Security Awareness Training', type: 'preventive' },
          { name: 'Basic Firewalls', type: 'preventive' }
        ],
        medium: [
          { name: 'Multi-Factor Authentication', type: 'preventive' },
          { name: 'Security Monitoring', type: 'detective' },
          { name: 'Regular Patching', type: 'preventive' }
        ],
        high: [
          { name: 'Advanced Threat Detection', type: 'detective' },
          { name: 'Incident Response Plan', type: 'corrective' },
          { name: 'Security Operations Center', type: 'detective' }
        ],
        critical: [
          { name: 'Zero Trust Architecture', type: 'preventive' },
          { name: 'Cyber Insurance', type: 'corrective' },
          { name: 'Threat Intelligence', type: 'detective' }
        ]
      }
    };

    return strategies[riskCategory]?.[riskLevel] || [];
  }

  private async buildMitigationRecommendation(
    strategy: any,
    riskCategory: string,
    riskLevel: string,
    org: any,
    currentControls: any[],
    recentIncidents: any[]
  ): Promise<MitigationRecommendation> {
    const strategyDetails = this.getStrategyDetails(strategy.name, riskCategory);
    const priority = this.calculatePriority(strategy, riskLevel, recentIncidents);
    const expectedImpact = this.calculateExpectedImpact(strategy, riskCategory, riskLevel);

    return {
      id: `${riskCategory}-${strategy.name.toLowerCase().replace(/\s+/g, '-')}`,
      riskCategory,
      riskLevel,
      strategy: strategy.name,
      description: strategyDetails.description,
      implementationSteps: strategyDetails.steps,
      expectedImpact,
      implementationCost: strategyDetails.cost,
      timeframe: strategyDetails.timeframe,
      priority,
      successMetrics: strategyDetails.metrics,
      prerequisites: strategyDetails.prerequisites,
      resources: strategyDetails.resources
    };
  }

  private getStrategyDetails(strategyName: string, riskCategory: string) {
    const strategyMap: Record<string, any> = {
      'Process Documentation': {
        description: 'Establish comprehensive documentation of critical processes to reduce operational risk',
        steps: [
          'Identify critical business processes',
          'Document current state processes',
          'Define process ownership and responsibilities',
          'Create process flow diagrams',
          'Establish review and update procedures'
        ],
        cost: 'low',
        timeframe: '2-3 months',
        metrics: ['Process documentation coverage %', 'Process compliance rate', 'Error reduction %'],
        prerequisites: ['Process mapping tools', 'Subject matter experts'],
        resources: ['Process analysts', 'Documentation tools', 'Training materials']
      },
      'Automated Monitoring': {
        description: 'Implement automated monitoring systems to detect operational issues early',
        steps: [
          'Define monitoring requirements',
          'Select monitoring tools',
          'Configure alerting thresholds',
          'Set up dashboards',
          'Train monitoring team'
        ],
        cost: 'medium',
        timeframe: '3-4 months',
        metrics: ['Alert response time', 'False positive rate', 'Issue detection rate'],
        prerequisites: ['Monitoring infrastructure', 'Technical expertise'],
        resources: ['Monitoring tools', 'Technical staff', 'Infrastructure']
      },
      'Multi-Factor Authentication': {
        description: 'Implement MFA to strengthen access controls and reduce cyber risk',
        steps: [
          'Assess current authentication methods',
          'Select MFA solution',
          'Deploy MFA infrastructure',
          'Configure user enrollment',
          'Train users and support staff'
        ],
        cost: 'low',
        timeframe: '1-2 months',
        metrics: ['MFA adoption rate', 'Authentication success rate', 'Security incidents reduction'],
        prerequisites: ['Identity management system', 'User devices'],
        resources: ['MFA solution', 'IT support', 'User training']
      }
    };

    return strategyMap[strategyName] || {
      description: `Implement ${strategyName} to mitigate ${riskCategory} risks`,
      steps: ['Assess current state', 'Plan implementation', 'Execute plan', 'Monitor results'],
      cost: 'medium',
      timeframe: '2-3 months',
      metrics: ['Risk reduction', 'Implementation success'],
      prerequisites: ['Management approval', 'Resource allocation'],
      resources: ['Project team', 'Budget', 'Tools']
    };
  }

  private calculatePriority(strategy: any, riskLevel: string, recentIncidents: any[]): number {
    let priority = 5; // Base priority
    
    // Adjust for risk level
    const riskLevelMultiplier = { low: 1, medium: 1.2, high: 1.5, critical: 2 };
    priority *= riskLevelMultiplier[riskLevel as keyof typeof riskLevelMultiplier];
    
    // Adjust for recent incidents
    if (recentIncidents.length > 0) {
      priority *= 1.3;
    }
    
    // Adjust for strategy type
    if (strategy.type === 'preventive') {
      priority *= 1.2; // Preventive measures get higher priority
    }
    
    return Math.min(10, Math.round(priority));
  }

  private calculateExpectedImpact(strategy: any, riskCategory: string, riskLevel: string): number {
    const baseImpact = 0.3; // 30% base impact
    
    // Adjust for risk level
    const riskLevelMultiplier = { low: 0.8, medium: 1.0, high: 1.2, critical: 1.5 };
    const adjustedImpact = baseImpact * riskLevelMultiplier[riskLevel as keyof typeof riskLevelMultiplier];
    
    // Adjust for strategy effectiveness
    const strategyEffectiveness: Record<string, number> = {
      'Business Continuity Plan': 0.8,
      'Zero Trust Architecture': 0.9,
      'Automated Monitoring': 0.7,
      'Multi-Factor Authentication': 0.6,
      'Process Documentation': 0.5
    };
    
    const effectiveness = strategyEffectiveness[strategy.name] || 0.6;
    
    return Math.min(1, adjustedImpact * effectiveness);
  }

  private async assessOrganizationalMaturity(orgId: string) {
    // This would assess maturity across different areas
    // For now, we'll simulate based on available data
    const [controls, incidents, policies] = await Promise.all([
      this.getControlsCount(orgId),
      this.getIncidentsCount(orgId),
      this.getPoliciesCount(orgId)
    ]);

    return {
      risk_governance: this.calculateMaturityLevel(policies, 'policies'),
      incident_management: this.calculateMaturityLevel(incidents, 'incidents'),
      business_continuity: this.calculateMaturityLevel(controls, 'controls'),
      third_party_risk: 'intermediate',
      cyber_security: 'intermediate',
      compliance_management: 'intermediate'
    };
  }

  private async getIndustryBenchmarks(orgId: string) {
    const org = await getUserOrganization();
    
    // Industry benchmarks based on sector
    const benchmarks: Record<string, any> = {
      banking: {
        risk_governance: 'advanced',
        incident_management: 'intermediate',
        business_continuity: 'advanced',
        third_party_risk: 'intermediate',
        cyber_security: 'advanced',
        compliance_management: 'advanced'
      },
      insurance: {
        risk_governance: 'intermediate',
        incident_management: 'intermediate',
        business_continuity: 'intermediate',
        third_party_risk: 'basic',
        cyber_security: 'intermediate',
        compliance_management: 'intermediate'
      }
    };

    return benchmarks[org?.sector || 'banking'];
  }

  private buildBestPracticeRecommendation(
    area: string,
    currentMaturity: string,
    benchmarkMaturity: string,
    org: any
  ): BestPracticeRecommendation {
    const areaDetails = this.getBestPracticeDetails(area);
    const gap = this.calculateMaturityGap(currentMaturity, benchmarkMaturity);

    return {
      id: `bp-${area}`,
      title: areaDetails.title,
      category: area,
      description: areaDetails.description,
      industryBenchmark: benchmarkMaturity,
      currentGap: gap,
      implementationGuidance: areaDetails.guidance,
      expectedBenefits: areaDetails.benefits,
      kpiTargets: areaDetails.kpiTargets,
      maturityLevel: benchmarkMaturity as any
    };
  }

  private getBestPracticeDetails(area: string) {
    const details: Record<string, any> = {
      risk_governance: {
        title: 'Risk Governance Framework',
        description: 'Establish comprehensive risk governance with clear roles, responsibilities, and oversight',
        guidance: [
          'Define risk governance structure',
          'Establish risk committee',
          'Create risk policies and procedures',
          'Implement risk reporting framework'
        ],
        benefits: [
          'Improved risk oversight',
          'Clear accountability',
          'Better decision making',
          'Regulatory compliance'
        ],
        kpiTargets: [
          { metric: 'Risk Committee Meetings', currentValue: '4/year', targetValue: '12/year' },
          { metric: 'Risk Policy Coverage', currentValue: '60%', targetValue: '95%' }
        ]
      },
      incident_management: {
        title: 'Incident Management Excellence',
        description: 'Implement world-class incident management processes and capabilities',
        guidance: [
          'Establish incident response team',
          'Define incident classification',
          'Create response procedures',
          'Implement lessons learned process'
        ],
        benefits: [
          'Faster incident resolution',
          'Reduced business impact',
          'Improved customer satisfaction',
          'Better regulatory compliance'
        ],
        kpiTargets: [
          { metric: 'Mean Time to Response', currentValue: '2 hours', targetValue: '30 minutes' },
          { metric: 'Incident Resolution Rate', currentValue: '85%', targetValue: '95%' }
        ]
      }
    };

    return details[area] || {
      title: `${area} Best Practices`,
      description: `Implement industry best practices for ${area}`,
      guidance: ['Assess current state', 'Define target state', 'Create implementation plan'],
      benefits: ['Improved performance', 'Better risk management'],
      kpiTargets: []
    };
  }

  private calculateMaturityGap(current: string, benchmark: string): string {
    const levels = ['basic', 'intermediate', 'advanced', 'leading'];
    const currentIndex = levels.indexOf(current);
    const benchmarkIndex = levels.indexOf(benchmark);
    
    if (currentIndex >= benchmarkIndex) return 'none';
    if (benchmarkIndex - currentIndex === 1) return 'minor';
    if (benchmarkIndex - currentIndex === 2) return 'moderate';
    return 'significant';
  }

  private async getControlsCount(orgId: string): Promise<number> {
    const { count, error } = await supabase
      .from('controls')
      .select('*', { count: 'exact', head: true })
      .eq('org_id', orgId);

    return count || 0;
  }

  private async getIncidentsCount(orgId: string): Promise<number> {
    const { count, error } = await supabase
      .from('incident_logs')
      .select('*', { count: 'exact', head: true })
      .eq('org_id', orgId);

    return count || 0;
  }

  private async getPoliciesCount(orgId: string): Promise<number> {
    const { count, error } = await supabase
      .from('governance_policies')
      .select('*', { count: 'exact', head: true })
      .eq('org_id', orgId);

    return count || 0;
  }

  private calculateMaturityLevel(count: number, type: string): string {
    const thresholds: Record<string, number[]> = {
      policies: [5, 15, 30], // basic, intermediate, advanced
      controls: [10, 25, 50],
      incidents: [20, 50, 100] // More incidents = better tracking (mature)
    };

    const levels = ['basic', 'intermediate', 'advanced', 'leading'];
    const threshold = thresholds[type] || [5, 15, 30];

    if (count >= threshold[2]) return 'leading';
    if (count >= threshold[1]) return 'advanced';
    if (count >= threshold[0]) return 'intermediate';
    return 'basic';
  }

  private async getCurrentResourceAllocation(orgId: string) {
    // This would fetch actual budget and resource data
    // For now, simulate based on organization data
    return {
      operational: { budget: 100000, personnel: 5, tools: 3 },
      cyber: { budget: 150000, personnel: 3, tools: 5 },
      compliance: { budget: 80000, personnel: 2, tools: 2 }
    };
  }

  private async getRiskExposureByArea(orgId: string) {
    // Calculate risk exposure based on incidents and assessments
    return {
      operational: 0.7,
      cyber: 0.8,
      compliance: 0.5
    };
  }

  private async getControlEffectiveness(orgId: string) {
    // Calculate control effectiveness by area
    return {
      operational: 0.75,
      cyber: 0.65,
      compliance: 0.85
    };
  }

  private calculateOptimalAllocation(
    area: string,
    currentAllocation: any,
    riskExposure: number,
    effectiveness: number
  ): ResourceOptimization {
    const riskAdjustment = riskExposure * 1.2;
    const effectivenessGap = 1 - effectiveness;
    
    const budgetMultiplier = riskAdjustment + effectivenessGap;
    const recommendedBudget = Math.round(currentAllocation.budget * budgetMultiplier);
    
    return {
      area,
      currentAllocation,
      recommendedAllocation: {
        budget: recommendedBudget,
        personnel: Math.round(currentAllocation.personnel * budgetMultiplier),
        tools: Math.round(currentAllocation.tools * budgetMultiplier)
      },
      reallocationPlan: [
        {
          action: `${budgetMultiplier > 1 ? 'Increase' : 'Decrease'} budget allocation`,
          impact: `${Math.abs(budgetMultiplier - 1) * 100}% change in resources`,
          timeline: '3-6 months'
        }
      ],
      expectedROI: this.calculateROI(riskExposure, effectiveness, budgetMultiplier),
      riskReduction: Math.min(0.5, riskExposure * 0.3 * budgetMultiplier)
    };
  }

  private calculateROI(riskExposure: number, effectiveness: number, budgetMultiplier: number): number {
    const riskReduction = Math.min(0.5, riskExposure * 0.3 * budgetMultiplier);
    const costIncrease = Math.abs(budgetMultiplier - 1);
    
    return costIncrease > 0 ? riskReduction / costIncrease : riskReduction;
  }

  private isSignificantOptimization(optimization: ResourceOptimization): boolean {
    const budgetChange = Math.abs(
      optimization.recommendedAllocation.budget - optimization.currentAllocation.budget
    ) / optimization.currentAllocation.budget;
    
    return budgetChange > 0.1; // 10% threshold
  }

  private async identifySkillGaps(orgId: string) {
    // This would analyze current skills vs required skills
    // For now, simulate common gaps
    return [
      {
        skill: 'Advanced Risk Analytics',
        gap: 'high',
        affectedRoles: ['Risk Analyst', 'Risk Manager'],
        businessImpact: 'high'
      },
      {
        skill: 'Cybersecurity Incident Response',
        gap: 'medium',
        affectedRoles: ['IT Staff', 'Security Team'],
        businessImpact: 'critical'
      },
      {
        skill: 'Regulatory Compliance',
        gap: 'low',
        affectedRoles: ['Compliance Officer'],
        businessImpact: 'medium'
      }
    ];
  }

  private async getRoleCompetencies(orgId: string) {
    // This would fetch role competency requirements
    return {
      'Risk Analyst': ['Risk Assessment', 'Data Analysis', 'Reporting'],
      'Risk Manager': ['Risk Strategy', 'Team Leadership', 'Stakeholder Management'],
      'Compliance Officer': ['Regulatory Knowledge', 'Audit Management', 'Policy Development']
    };
  }

  private async getTrainingHistory(orgId: string) {
    // This would fetch training completion history
    return {
      completedTraining: [],
      plannedTraining: [],
      budget: 50000
    };
  }

  private buildTrainingRecommendation(
    gap: any,
    competencies: any,
    history: any
  ): TrainingRecommendation {
    const priority = this.getTrainingPriority(gap.businessImpact, gap.gap);
    
    return {
      id: `training-${gap.skill.toLowerCase().replace(/\s+/g, '-')}`,
      targetAudience: gap.affectedRoles,
      skillGap: gap.skill,
      trainingType: this.getTrainingType(gap.skill),
      priority,
      description: `Address ${gap.skill} skill gap to improve ${gap.businessImpact} business impact areas`,
      learningObjectives: this.getLearningObjectives(gap.skill),
      suggestedProviders: this.getSuggestedProviders(gap.skill),
      estimatedDuration: this.getEstimatedDuration(gap.skill),
      cost: this.getTrainingCost(gap.skill),
      competencyMapping: this.getCompetencyMapping(gap.skill, gap.affectedRoles)
    };
  }

  private getTrainingPriority(businessImpact: string, gapLevel: string): 'urgent' | 'high' | 'medium' | 'low' {
    if (businessImpact === 'critical' && gapLevel === 'high') return 'urgent';
    if (businessImpact === 'critical' || gapLevel === 'high') return 'high';
    if (businessImpact === 'high' || gapLevel === 'medium') return 'medium';
    return 'low';
  }

  private getTrainingType(skill: string): 'online' | 'workshop' | 'certification' | 'mentoring' {
    if (skill.includes('Analytics') || skill.includes('Data')) return 'online';
    if (skill.includes('Leadership') || skill.includes('Management')) return 'workshop';
    if (skill.includes('Cybersecurity') || skill.includes('Compliance')) return 'certification';
    return 'workshop';
  }

  private getLearningObjectives(skill: string): string[] {
    const objectives: Record<string, string[]> = {
      'Advanced Risk Analytics': [
        'Master statistical analysis techniques',
        'Implement predictive risk models',
        'Create advanced risk visualizations',
        'Interpret complex risk data'
      ],
      'Cybersecurity Incident Response': [
        'Develop incident response procedures',
        'Master forensic analysis techniques',
        'Implement threat hunting capabilities',
        'Coordinate multi-team responses'
      ]
    };

    return objectives[skill] || [`Develop ${skill} capabilities`, `Apply ${skill} in practice`];
  }

  private getSuggestedProviders(skill: string): string[] {
    const providers: Record<string, string[]> = {
      'Advanced Risk Analytics': ['Coursera', 'edX', 'Risk Management Association'],
      'Cybersecurity Incident Response': ['SANS Institute', 'Cybrary', 'ISC2'],
      'Regulatory Compliance': ['Thomson Reuters', 'PwC Academy', 'Deloitte University']
    };

    return providers[skill] || ['Industry associations', 'Professional training companies'];
  }

  private getEstimatedDuration(skill: string): string {
    const durations: Record<string, string> = {
      'Advanced Risk Analytics': '6-8 weeks',
      'Cybersecurity Incident Response': '3-4 weeks',
      'Regulatory Compliance': '2-3 weeks'
    };

    return durations[skill] || '4-6 weeks';
  }

  private getTrainingCost(skill: string): string {
    const costs: Record<string, string> = {
      'Advanced Risk Analytics': '$2,500-$5,000',
      'Cybersecurity Incident Response': '$3,000-$6,000',
      'Regulatory Compliance': '$1,500-$3,000'
    };

    return costs[skill] || '$2,000-$4,000';
  }

  private getCompetencyMapping(skill: string, roles: string[]) {
    return roles.map(role => ({
      skill: skill,
      currentLevel: Math.floor(Math.random() * 3) + 1, // Simulate current level 1-3
      targetLevel: Math.floor(Math.random() * 2) + 4 // Target level 4-5
    }));
  }
}

export const recommendationsEngineService = new RecommendationsEngineService();
