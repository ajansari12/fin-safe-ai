import { enhancedOrganizationalIntelligenceService } from './enhanced-organizational-intelligence-service';
import { organizationalIntelligenceService } from './organizational-intelligence-service';
import type { 
  OrganizationalProfile, 
  PredictiveInsight, 
  IntelligentRecommendation,
  AIAnalysisResult,
  IntelligenceDashboardData
} from '@/types/organizational-intelligence';

export interface AIIntelligenceContext {
  profileId: string;
  orgId: string;
  currentMaturityLevel: string;
  riskScore: number;
  completeness: number;
}

class AIOrganizationalIntelligenceIntegration {
  // Enhanced AI-powered organizational analysis
  async generateComprehensiveAnalysis(profileId: string): Promise<AIAnalysisResult> {
    try {
      console.log('Generating comprehensive AI analysis for profile:', profileId);
      
      const [insights, recommendations, riskPredictions, maturityAnalysis] = await Promise.all([
        enhancedOrganizationalIntelligenceService.generatePredictiveInsights(profileId),
        enhancedOrganizationalIntelligenceService.generateIntelligentRecommendations(profileId),
        enhancedOrganizationalIntelligenceService.predictRiskEvolution(profileId),
        enhancedOrganizationalIntelligenceService.analyzeMaturityProgression(profileId)
      ]);

      const confidenceScore = this.calculateOverallConfidence(insights, recommendations);

      return {
        analysis_id: `analysis-${Date.now()}`,
        analysis_type: 'predictive', // Changed from 'comprehensive' to valid type
        insights,
        recommendations,
        risk_predictions: riskPredictions,
        maturity_analysis: maturityAnalysis,
        confidence_score: confidenceScore,
        generated_at: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error generating comprehensive analysis:', error);
      throw error;
    }
  }

  // Generate contextual AI responses based on organizational profile
  async generateContextualResponse(
    query: string, 
    context: AIIntelligenceContext
  ): Promise<string> {
    try {
      // Get current profile data
      const profile = await organizationalIntelligenceService.getOrganizationalProfile(context.orgId);
      if (!profile) return "I need more information about your organization to provide relevant insights.";

      // Generate context-aware response based on query type
      if (this.isRiskQuery(query)) {
        return this.generateRiskResponse(query, profile, context);
      } else if (this.isMaturityQuery(query)) {
        return this.generateMaturityResponse(query, profile, context);
      } else if (this.isComplianceQuery(query)) {
        return this.generateComplianceResponse(query, profile, context);
      } else if (this.isRecommendationQuery(query)) {
        return this.generateRecommendationResponse(query, profile, context);
      }

      return this.generateGeneralResponse(query, profile, context);
    } catch (error) {
      console.error('Error generating contextual response:', error);
      return "I'm experiencing some technical difficulties. Please try again later.";
    }
  }

  // Real-time intelligence dashboard data
  async getIntelligenceDashboardData(orgId: string): Promise<IntelligenceDashboardData> {
    try {
      const profile = await organizationalIntelligenceService.getOrganizationalProfile(orgId);
      if (!profile) throw new Error('Profile not found');

      const [insights, recommendations] = await Promise.all([
        enhancedOrganizationalIntelligenceService.generatePredictiveInsights(profile.id),
        enhancedOrganizationalIntelligenceService.generateIntelligentRecommendations(profile.id)
      ]);

      return {
        profile_health_score: profile.profile_score || 0,
        risk_trend_direction: this.calculateRiskTrend(profile),
        key_insights: insights.slice(0, 5),
        priority_recommendations: recommendations.filter(r => r.priority === 'high').slice(0, 3),
        automation_status: {
          rules_active: 0, // TODO: Implement automation rules tracking
          actions_executed: 0,
          efficiency_gained: 0
        },
        maturity_trajectory: [
          {
            dimension: 'risk_management',
            current_score: this.getMaturityScore(profile.risk_maturity),
            projected_score: this.getMaturityScore(profile.risk_maturity) + 10,
            improvement_rate: 5
          },
          {
            dimension: 'compliance',
            current_score: this.getMaturityScore(profile.compliance_maturity),
            projected_score: this.getMaturityScore(profile.compliance_maturity) + 8,
            improvement_rate: 4
          },
          {
            dimension: 'technology',
            current_score: this.getMaturityScore(profile.technology_maturity),
            projected_score: this.getMaturityScore(profile.technology_maturity) + 12,
            improvement_rate: 6
          }
        ]
      };
    } catch (error) {
      console.error('Error getting intelligence dashboard data:', error);
      throw error;
    }
  }

  // Private helper methods
  private calculateOverallConfidence(
    insights: PredictiveInsight[], 
    recommendations: IntelligentRecommendation[]
  ): number {
    if (insights.length === 0 && recommendations.length === 0) return 0;
    
    const avgInsightConfidence = insights.length > 0 
      ? insights.reduce((sum, insight) => sum + insight.confidence, 0) / insights.length
      : 0;
    
    const recommendationConfidence = recommendations.length > 0 ? 0.8 : 0;
    
    return Math.round(((avgInsightConfidence + recommendationConfidence) / 2) * 100) / 100;
  }

  private isRiskQuery(query: string): boolean {
    const riskKeywords = ['risk', 'threat', 'vulnerability', 'exposure', 'impact'];
    return riskKeywords.some(keyword => query.toLowerCase().includes(keyword));
  }

  private isMaturityQuery(query: string): boolean {
    const maturityKeywords = ['maturity', 'capability', 'sophistication', 'advancement'];
    return maturityKeywords.some(keyword => query.toLowerCase().includes(keyword));
  }

  private isComplianceQuery(query: string): boolean {
    const complianceKeywords = ['compliance', 'regulation', 'regulatory', 'audit', 'requirement'];
    return complianceKeywords.some(keyword => query.toLowerCase().includes(keyword));
  }

  private isRecommendationQuery(query: string): boolean {
    const recommendationKeywords = ['recommend', 'suggest', 'improve', 'enhance', 'optimize'];
    return recommendationKeywords.some(keyword => query.toLowerCase().includes(keyword));
  }

  private async generateRiskResponse(
    query: string, 
    profile: OrganizationalProfile, 
    context: AIIntelligenceContext
  ): Promise<string> {
    const riskPredictions = await enhancedOrganizationalIntelligenceService.predictRiskEvolution(profile.id);
    
    return `**Risk Analysis for ${profile.name}:**\n\n` +
           `Current Risk Score: ${context.riskScore}/100\n\n` +
           `**Key Risk Areas:**\n` +
           riskPredictions.map(prediction => 
             `• **${prediction.risk_category}**: Current score ${prediction.current_score}, ` +
             `predicted to ${prediction.predicted_scores[0]?.score > prediction.current_score ? 'increase' : 'decrease'} ` +
             `to ${prediction.predicted_scores[0]?.score || 'N/A'} in the next month\n`
           ).join('') +
           `\n**Immediate Actions:**\n` +
           `• Focus on ${profile.risk_maturity === 'basic' ? 'establishing basic risk management processes' : 'enhancing existing risk controls'}\n` +
           `• Regular risk assessment and monitoring\n` +
           `• Consider implementing advanced risk analytics`;
  }

  private async generateMaturityResponse(
    query: string, 
    profile: OrganizationalProfile, 
    context: AIIntelligenceContext
  ): Promise<string> {
    const maturityAnalysis = await enhancedOrganizationalIntelligenceService.analyzeMaturityProgression(profile.id);
    
    return `**Maturity Assessment for ${profile.name}:**\n\n` +
           `**Current Maturity Levels:**\n` +
           `• Risk Management: ${profile.risk_maturity || 'Not assessed'}\n` +
           `• Compliance: ${profile.compliance_maturity || 'Not assessed'}\n` +
           `• Technology: ${profile.technology_maturity || 'Not assessed'}\n\n` +
           `**Maturity Progression Path:**\n` +
           maturityAnalysis.map(analysis => 
             `**${analysis.dimension}**: ${analysis.current_level} → ${analysis.target_level}\n` +
             `Next steps: ${analysis.progression_path[0]?.requirements.join(', ') || 'Assessment needed'}\n`
           ).join('\n') +
           `\n**Overall Recommendation:** Focus on ${this.getTopMaturityPriority(profile)} as your next maturity enhancement area.`;
  }

  private async generateComplianceResponse(
    query: string, 
    profile: OrganizationalProfile, 
    context: AIIntelligenceContext
  ): Promise<string> {
    return `**Compliance Analysis for ${profile.name}:**\n\n` +
           `Current Compliance Maturity: **${profile.compliance_maturity || 'Not assessed'}**\n\n` +
           `**Applicable Frameworks:**\n` +
           (profile.applicable_frameworks || []).map(framework => `• ${framework}`).join('\n') +
           `\n\n**Primary Regulators:**\n` +
           (profile.primary_regulators || []).map(regulator => `• ${regulator}`).join('\n') +
           `\n\n**Regulatory History:** ${profile.regulatory_history || 'Not specified'}\n\n` +
           `**Recommendations:**\n` +
           `• ${profile.compliance_maturity === 'basic' ? 'Establish comprehensive compliance management system' : 'Enhance existing compliance monitoring'}\n` +
           `• Regular compliance assessments and gap analysis\n` +
           `• Implement automated compliance reporting where possible`;
  }

  private async generateRecommendationResponse(
    query: string, 
    profile: OrganizationalProfile, 
    context: AIIntelligenceContext
  ): Promise<string> {
    const recommendations = await enhancedOrganizationalIntelligenceService.generateIntelligentRecommendations(profile.id);
    
    const priorityRecs = recommendations.filter(r => r.priority === 'high' || r.priority === 'critical');
    
    return `**Personalized Recommendations for ${profile.name}:**\n\n` +
           `Based on your current profile (${context.completeness}% complete, score: ${context.riskScore}/100):\n\n` +
           priorityRecs.map((rec, index) => 
             `**${index + 1}. ${rec.title}** (${rec.priority} priority)\n` +
             `${rec.description}\n` +
             `Expected Impact: ${rec.expected_impact}\n` +
             `Timeline: ${rec.estimated_effort}\n\n`
           ).join('') +
           `**Next Steps:**\n` +
           `1. Start with the highest priority recommendation\n` +
           `2. Allocate necessary resources\n` +
           `3. Set up regular progress monitoring\n` +
           `4. Schedule reassessment in 3 months`;
  }

  private generateGeneralResponse(
    query: string, 
    profile: OrganizationalProfile, 
    context: AIIntelligenceContext
  ): string {
    return `**Analysis for ${profile.name}:**\n\n` +
           `Profile Completeness: ${context.completeness}%\n` +
           `Current Risk Score: ${context.riskScore}/100\n` +
           `Maturity Level: ${context.currentMaturityLevel}\n\n` +
           `I can help you with:\n` +
           `• Risk assessment and management strategies\n` +
           `• Maturity enhancement planning\n` +
           `• Compliance framework guidance\n` +
           `• Personalized recommendations\n\n` +
           `Please ask me about specific areas like "What are my main risk concerns?" or "How can I improve my compliance maturity?"`;
  }

  private calculateRiskTrend(profile: OrganizationalProfile): 'improving' | 'stable' | 'deteriorating' {
    // Simplified risk trend calculation
    const riskFactors = [
      profile.risk_maturity === 'basic' ? 1 : 0,
      profile.compliance_maturity === 'basic' ? 1 : 0,
      profile.technology_maturity === 'basic' ? 1 : 0,
      profile.regulatory_history === 'violations' ? 2 : 0
    ].reduce((sum, factor) => sum + factor, 0);

    if (riskFactors >= 3) return 'deteriorating';
    if (riskFactors <= 1) return 'improving';
    return 'stable';
  }

  private getMaturityScore(maturity?: string): number {
    const scores = { basic: 25, developing: 50, advanced: 75, sophisticated: 100 };
    return scores[maturity as keyof typeof scores] || 0;
  }

  private getTopMaturityPriority(profile: OrganizationalProfile): string {
    const priorities = [
      { area: 'risk management', level: profile.risk_maturity },
      { area: 'compliance', level: profile.compliance_maturity },
      { area: 'technology', level: profile.technology_maturity }
    ];

    const lowest = priorities.reduce((min, current) => 
      this.getMaturityScore(current.level) < this.getMaturityScore(min.level) ? current : min
    );

    return lowest.area;
  }
}

export const aiOrganizationalIntelligenceIntegration = new AIOrganizationalIntelligenceIntegration();
