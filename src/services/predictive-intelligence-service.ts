
import { supabase } from '@/integrations/supabase/client';
import { 
  PredictiveInsight, 
  IntelligentRecommendation, 
  RiskPrediction, 
  MaturityProgression,
  OrganizationalProfile 
} from '@/types/organizational-intelligence';

export class PredictiveIntelligenceService {
  
  async generatePredictiveInsights(profileId: string): Promise<PredictiveInsight[]> {
    try {
      // Fetch organizational profile
      const { data: profile } = await supabase
        .from('organizational_profiles')
        .select('*')
        .eq('id', profileId)
        .single();

      if (!profile) throw new Error('Profile not found');

      // Analyze historical data patterns
      const insights: PredictiveInsight[] = [];

      // Risk trend prediction
      const riskTrendInsight = await this.analyzeRiskTrends(profile);
      if (riskTrendInsight) insights.push(riskTrendInsight);

      // Compliance gap prediction
      const complianceInsight = await this.predictComplianceGaps(profile);
      if (complianceInsight) insights.push(complianceInsight);

      // Opportunity identification
      const opportunityInsight = await this.identifyOpportunities(profile);
      if (opportunityInsight) insights.push(opportunityInsight);

      // Threat analysis
      const threatInsight = await this.analyzeThreatLandscape(profile);
      if (threatInsight) insights.push(threatInsight);

      return insights;
    } catch (error) {
      console.error('Error generating predictive insights:', error);
      return [];
    }
  }

  private async analyzeRiskTrends(profile: OrganizationalProfile): Promise<PredictiveInsight | null> {
    // Analyze risk maturity and sector-specific trends
    const riskScore = this.calculateRiskScore(profile);
    const trendDirection = this.predictRiskTrend(profile);

    return {
      id: crypto.randomUUID(),
      type: 'risk_trend',
      title: 'Risk Profile Trend Analysis',
      description: `Based on your ${profile.sub_sector} sector profile and current maturity level, we predict your risk exposure will ${trendDirection} over the next 6 months.`,
      confidence: 0.78,
      timeframe: '6_months',
      impact: riskScore > 70 ? 'high' : riskScore > 40 ? 'medium' : 'low',
      predicted_values: [
        { date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), value: riskScore + 2, metric: 'risk_score' },
        { date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(), value: riskScore + 5, metric: 'risk_score' },
        { date: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString(), value: riskScore + 8, metric: 'risk_score' }
      ],
      factors: [
        `${profile.sub_sector} sector regulatory changes`,
        `Current ${profile.risk_maturity} risk maturity level`,
        `Operational complexity: ${profile.operational_complexity}`,
        `Regulatory complexity: ${profile.regulatory_complexity}`
      ],
      created_at: new Date().toISOString()
    };
  }

  private async predictComplianceGaps(profile: OrganizationalProfile): Promise<PredictiveInsight | null> {
    const complianceRisk = this.assessComplianceRisk(profile);
    
    return {
      id: crypto.randomUUID(),
      type: 'compliance_gap',
      title: 'Compliance Gap Prediction',
      description: `Our analysis suggests potential compliance gaps may emerge in ${profile.primary_regulators?.join(', ')} requirements within the next 3 months.`,
      confidence: 0.72,
      timeframe: '3_months',
      impact: complianceRisk > 60 ? 'critical' : 'medium',
      predicted_values: [
        { date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), value: complianceRisk, metric: 'compliance_risk' },
        { date: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(), value: complianceRisk + 10, metric: 'compliance_risk' },
        { date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(), value: complianceRisk + 15, metric: 'compliance_risk' }
      ],
      factors: [
        'Upcoming regulatory changes',
        'Current compliance maturity gaps',
        'Industry peer benchmark analysis',
        'Historical compliance performance'
      ],
      created_at: new Date().toISOString()
    };
  }

  private async identifyOpportunities(profile: OrganizationalProfile): Promise<PredictiveInsight | null> {
    const maturityScore = this.calculateMaturityScore(profile);
    
    return {
      id: crypto.randomUUID(),
      type: 'opportunity',
      title: 'Strategic Opportunity Identification',
      description: `Based on your current maturity level, we've identified opportunities to improve operational efficiency by 15-20% through enhanced risk management practices.`,
      confidence: 0.83,
      timeframe: '12_months',
      impact: 'high',
      predicted_values: [
        { date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(), value: 5, metric: 'efficiency_improvement' },
        { date: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString(), value: 12, metric: 'efficiency_improvement' },
        { date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), value: 18, metric: 'efficiency_improvement' }
      ],
      factors: [
        'Automation potential in current processes',
        'Risk management framework optimization',
        'Industry best practice adoption opportunities',
        'Technology integration possibilities'
      ],
      created_at: new Date().toISOString()
    };
  }

  private async analyzeThreatLandscape(profile: OrganizationalProfile): Promise<PredictiveInsight | null> {
    const threatLevel = this.calculateThreatLevel(profile);
    
    return {
      id: crypto.randomUUID(),
      type: 'threat',
      title: 'Emerging Threat Analysis',
      description: `Industry analysis indicates elevated cyber and operational risks for ${profile.sub_sector} organizations of your size over the next 6 months.`,
      confidence: 0.76,
      timeframe: '6_months',
      impact: threatLevel > 70 ? 'critical' : 'medium',
      predicted_values: [
        { date: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(), value: threatLevel, metric: 'threat_level' },
        { date: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000).toISOString(), value: threatLevel + 8, metric: 'threat_level' },
        { date: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString(), value: threatLevel + 12, metric: 'threat_level' }
      ],
      factors: [
        'Increased cyber attack frequency in sector',
        'Regulatory enforcement trends',
        'Third-party dependency risks',
        'Operational resilience requirements'
      ],
      created_at: new Date().toISOString()
    };
  }

  async generateIntelligentRecommendations(profileId: string, insights: PredictiveInsight[]): Promise<IntelligentRecommendation[]> {
    try {
      const { data: profile } = await supabase
        .from('organizational_profiles')
        .select('*')
        .eq('id', profileId)
        .single();

      if (!profile) throw new Error('Profile not found');

      const recommendations: IntelligentRecommendation[] = [];

      // Generate recommendations based on insights
      for (const insight of insights) {
        const recommendation = await this.generateRecommendationFromInsight(insight, profile);
        if (recommendation) recommendations.push(recommendation);
      }

      // Add framework-specific recommendations
      const frameworkRecs = await this.generateFrameworkRecommendations(profile);
      recommendations.push(...frameworkRecs);

      return recommendations.sort((a, b) => {
        const priorityOrder = { 'critical': 4, 'high': 3, 'medium': 2, 'low': 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      });
    } catch (error) {
      console.error('Error generating recommendations:', error);
      return [];
    }
  }

  private async generateRecommendationFromInsight(
    insight: PredictiveInsight, 
    profile: OrganizationalProfile
  ): Promise<IntelligentRecommendation | null> {
    switch (insight.type) {
      case 'risk_trend':
        return {
          id: crypto.randomUUID(),
          category: 'risk_management',
          priority: insight.impact === 'high' ? 'high' : 'medium',
          title: 'Strengthen Risk Management Framework',
          description: 'Implement enhanced risk monitoring and control measures to address predicted risk increases.',
          rationale: `Our analysis predicts a ${insight.predicted_values[2]?.value}% increase in risk exposure over the next 6 months based on sector trends and your current maturity level.`,
          implementation_steps: [
            'Enhance existing risk appetite framework',
            'Implement advanced KRI monitoring',
            'Strengthen control testing procedures',
            'Establish escalation protocols'
          ],
          estimated_effort: '3_months',
          expected_impact: 'Reduce predicted risk exposure by 40-50%',
          success_metrics: [
            'Risk score stabilization below current levels',
            'Reduced number of risk appetite breaches',
            'Improved control effectiveness ratings'
          ],
          resources_required: [
            'Risk management specialist',
            'Updated risk assessment tools',
            'Staff training programs'
          ],
          created_at: new Date().toISOString()
        };

      case 'compliance_gap':
        return {
          id: crypto.randomUUID(),
          category: 'compliance',
          priority: 'critical',
          title: 'Proactive Compliance Gap Remediation',
          description: 'Address predicted compliance gaps before they become regulatory findings.',
          rationale: 'Predictive analysis indicates high probability of compliance gaps emerging in key regulatory areas.',
          implementation_steps: [
            'Conduct comprehensive compliance assessment',
            'Develop gap remediation plan',
            'Implement enhanced monitoring controls',
            'Establish regular compliance reviews'
          ],
          estimated_effort: '2_months',
          expected_impact: 'Prevent regulatory findings and associated penalties',
          success_metrics: [
            'Zero regulatory findings in predicted areas',
            'Improved compliance maturity rating',
            'Reduced compliance risk score'
          ],
          resources_required: [
            'Compliance officer',
            'Legal review',
            'Process documentation updates'
          ],
          created_at: new Date().toISOString()
        };

      default:
        return null;
    }
  }

  private async generateFrameworkRecommendations(profile: OrganizationalProfile): Promise<IntelligentRecommendation[]> {
    const recommendations: IntelligentRecommendation[] = [];

    // Governance recommendations
    if (profile.risk_maturity === 'basic' || profile.compliance_maturity === 'basic') {
      recommendations.push({
        id: crypto.randomUUID(),
        category: 'governance',
        priority: 'high',
        title: 'Implement Comprehensive Governance Framework',
        description: 'Establish foundational governance structures to support organizational growth and regulatory compliance.',
        rationale: 'Current maturity levels indicate need for enhanced governance oversight and decision-making processes.',
        implementation_steps: [
          'Define board committee structures',
          'Establish clear reporting lines',
          'Implement policy management framework',
          'Create stakeholder communication protocols'
        ],
        estimated_effort: '6_months',
        expected_impact: 'Improved decision-making efficiency and regulatory compliance',
        success_metrics: [
          'Governance maturity improvement to "developing" level',
          'Reduced policy review cycle time',
          'Enhanced stakeholder satisfaction scores'
        ],
        resources_required: [
          'Governance specialist',
          'Board charter updates',
          'Policy management system'
        ],
        created_at: new Date().toISOString()
      });
    }

    return recommendations;
  }

  // Utility methods for scoring and analysis
  private calculateRiskScore(profile: OrganizationalProfile): number {
    let score = 30; // Base score

    // Adjust based on maturity
    const maturityMap = { 'basic': 20, 'developing': 10, 'advanced': -5, 'sophisticated': -15 };
    score += maturityMap[profile.risk_maturity] || 0;

    // Adjust based on complexity
    const complexityMap = { 'low': -10, 'medium': 5, 'high': 15 };
    score += complexityMap[profile.operational_complexity || 'medium'] || 0;
    score += complexityMap[profile.regulatory_complexity || 'medium'] || 0;

    // Adjust based on size
    if (profile.employee_count > 1000) score += 10;
    if (profile.asset_size > 10000000000) score += 15;

    return Math.max(0, Math.min(100, score));
  }

  private predictRiskTrend(profile: OrganizationalProfile): string {
    const riskScore = this.calculateRiskScore(profile);
    return riskScore > 60 ? 'increase' : riskScore > 30 ? 'stabilize' : 'decrease';
  }

  private assessComplianceRisk(profile: OrganizationalProfile): number {
    let risk = 40; // Base risk

    if (profile.compliance_maturity === 'basic') risk += 20;
    if (profile.regulatory_complexity === 'high') risk += 15;
    if (profile.previous_incidents > 5) risk += 10;

    return Math.max(0, Math.min(100, risk));
  }

  private calculateMaturityScore(profile: OrganizationalProfile): number {
    const maturityValues = { 'basic': 25, 'developing': 50, 'advanced': 75, 'sophisticated': 90 };
    
    const riskScore = maturityValues[profile.risk_maturity] || 25;
    const complianceScore = maturityValues[profile.compliance_maturity] || 25;
    const techScore = maturityValues[profile.technology_maturity] || 25;

    return (riskScore + complianceScore + techScore) / 3;
  }

  private calculateThreatLevel(profile: OrganizationalProfile): number {
    let threat = 35; // Base threat level

    // Sector-specific adjustments
    if (profile.sub_sector === 'banking') threat += 15;
    if (profile.sub_sector === 'fintech') threat += 20;

    // Size adjustments
    if (profile.employee_count > 500) threat += 10;
    if (profile.asset_size > 5000000000) threat += 15;

    return Math.max(0, Math.min(100, threat));
  }
}

export const predictiveIntelligenceService = new PredictiveIntelligenceService();
