
import { supabase } from "@/integrations/supabase/client";
import { getCurrentUserProfile, getUserOrganization } from "@/lib/supabase-utils";

export interface IntelligentRiskScore {
  riskId: string;
  riskName: string;
  currentScore: number;
  historicalScore: number;
  trendDirection: 'increasing' | 'decreasing' | 'stable';
  confidence: number;
  factors: Array<{
    name: string;
    weight: number;
    currentValue: number;
    contribution: number;
  }>;
  benchmarkComparison: {
    industry: number;
    size: number;
    region: number;
  };
  explanation: string;
}

export interface RiskAssessmentSuggestion {
  riskCategory: string;
  suggestedScore: number;
  reasoning: string[];
  similarOrganizations: Array<{
    sector: string;
    size: string;
    avgScore: number;
    keyFactors: string[];
  }>;
  historicalPatterns: string[];
  recommendedActions: string[];
}

export interface DynamicRiskAdjustment {
  riskId: string;
  originalScore: number;
  adjustedScore: number;
  adjustmentFactors: Array<{
    factor: string;
    impact: number;
    timeframe: string;
  }>;
  context: {
    businessEnvironment: string;
    marketConditions: string;
    regulatoryChanges: string[];
  };
  validUntil: Date;
}

class IntelligentRiskAssessmentService {
  async generateIntelligentRiskScores(orgId: string): Promise<IntelligentRiskScore[]> {
    try {
      const [org, incidents, kriData, controls] = await Promise.all([
        getUserOrganization(),
        this.getIncidentData(orgId),
        this.getKRIData(orgId),
        this.getControlData(orgId)
      ]);

      const riskScores: IntelligentRiskScore[] = [];
      const riskCategories = this.identifyRiskCategories(incidents, kriData);

      for (const category of riskCategories) {
        const score = await this.calculateIntelligentScore(category, orgId, org, incidents, kriData, controls);
        riskScores.push(score);
      }

      return riskScores;
    } catch (error) {
      console.error('Error generating intelligent risk scores:', error);
      return [];
    }
  }

  async generateAssessmentSuggestions(
    riskCategory: string, 
    orgId: string
  ): Promise<RiskAssessmentSuggestion> {
    try {
      const [org, similarOrgs, historicalData] = await Promise.all([
        getUserOrganization(),
        this.findSimilarOrganizations(orgId),
        this.getHistoricalRiskData(orgId, riskCategory)
      ]);

      const suggestedScore = this.calculateSuggestedScore(riskCategory, org, similarOrgs, historicalData);
      const reasoning = this.generateReasoning(riskCategory, suggestedScore, historicalData);

      return {
        riskCategory,
        suggestedScore,
        reasoning,
        similarOrganizations: similarOrgs,
        historicalPatterns: this.analyzeHistoricalPatterns(historicalData),
        recommendedActions: this.generateRecommendedActions(riskCategory, suggestedScore)
      };
    } catch (error) {
      console.error('Error generating assessment suggestions:', error);
      return {
        riskCategory,
        suggestedScore: 5,
        reasoning: ['Unable to generate detailed assessment due to insufficient data'],
        similarOrganizations: [],
        historicalPatterns: [],
        recommendedActions: ['Conduct comprehensive risk assessment']
      };
    }
  }

  async generateDynamicAdjustments(orgId: string): Promise<DynamicRiskAdjustment[]> {
    try {
      const [currentRisks, marketData, regulatoryData] = await Promise.all([
        this.getCurrentRiskScores(orgId),
        this.getMarketConditions(),
        this.getRegulatoryChanges()
      ]);

      const adjustments: DynamicRiskAdjustment[] = [];

      for (const risk of currentRisks) {
        const adjustment = this.calculateDynamicAdjustment(risk, marketData, regulatoryData);
        if (adjustment.adjustedScore !== adjustment.originalScore) {
          adjustments.push(adjustment);
        }
      }

      return adjustments;
    } catch (error) {
      console.error('Error generating dynamic adjustments:', error);
      return [];
    }
  }

  private async getIncidentData(orgId: string) {
    const { data, error } = await supabase
      .from('incident_logs')
      .select('*')
      .eq('org_id', orgId)
      .gte('reported_at', new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString())
      .order('reported_at', { ascending: false });

    return data || [];
  }

  private async getKRIData(orgId: string) {
    const { data, error } = await supabase
      .from('kri_logs')
      .select(`
        *,
        kri_definitions!inner(org_id, name, category)
      `)
      .eq('kri_definitions.org_id', orgId)
      .gte('measurement_date', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
      .order('measurement_date', { ascending: false });

    return data || [];
  }

  private async getControlData(orgId: string) {
    const { data, error } = await supabase
      .from('control_tests')
      .select('*')
      .eq('org_id', orgId)
      .gte('test_date', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
      .order('test_date', { ascending: false });

    return data || [];
  }

  private identifyRiskCategories(incidents: any[], kriData: any[]): string[] {
    const categories = new Set<string>();
    
    // Add incident categories
    incidents.forEach(incident => {
      if (incident.category) categories.add(incident.category);
    });
    
    // Add KRI categories
    kriData.forEach(kri => {
      if (kri.kri_definitions?.category) categories.add(kri.kri_definitions.category);
    });
    
    // Add default categories if none found
    if (categories.size === 0) {
      categories.add('operational');
      categories.add('cyber');
      categories.add('compliance');
    }
    
    return Array.from(categories);
  }

  private async calculateIntelligentScore(
    category: string,
    orgId: string,
    org: any,
    incidents: any[],
    kriData: any[],
    controls: any[]
  ): Promise<IntelligentRiskScore> {
    const categoryIncidents = incidents.filter(i => i.category === category);
    const categoryKRIs = kriData.filter(k => k.kri_definitions?.category === category);
    
    // Calculate base score from incidents
    const incidentScore = this.calculateIncidentScore(categoryIncidents);
    
    // Calculate KRI score
    const kriScore = this.calculateKRIScore(categoryKRIs);
    
    // Calculate control effectiveness score
    const controlScore = this.calculateControlScore(controls, category);
    
    // Weighted combination
    const currentScore = (incidentScore * 0.4 + kriScore * 0.4 + controlScore * 0.2);
    
    // Calculate historical score for comparison
    const historicalScore = this.calculateHistoricalScore(categoryIncidents, categoryKRIs);
    
    // Determine trend
    const trendDirection = this.determineTrend(currentScore, historicalScore);
    
    // Calculate confidence based on data quality
    const confidence = this.calculateConfidence(categoryIncidents, categoryKRIs, controls);
    
    // Generate factors
    const factors = this.generateScoreFactors(incidentScore, kriScore, controlScore);
    
    // Benchmark comparison (simulated)
    const benchmarkComparison = this.generateBenchmarkComparison(org, category, currentScore);
    
    return {
      riskId: `risk-${category}`,
      riskName: `${category} Risk`,
      currentScore: Math.round(currentScore * 10) / 10,
      historicalScore: Math.round(historicalScore * 10) / 10,
      trendDirection,
      confidence,
      factors,
      benchmarkComparison,
      explanation: this.generateScoreExplanation(category, currentScore, factors, trendDirection)
    };
  }

  private calculateIncidentScore(incidents: any[]): number {
    if (incidents.length === 0) return 2;
    
    const severityWeights = { low: 1, medium: 2, high: 3, critical: 4 };
    const totalSeverity = incidents.reduce((sum, incident) => {
      return sum + (severityWeights[incident.severity as keyof typeof severityWeights] || 2);
    }, 0);
    
    // Normalize to 1-10 scale
    const avgSeverity = totalSeverity / incidents.length;
    const frequencyMultiplier = Math.min(2, incidents.length / 10);
    
    return Math.min(10, avgSeverity * frequencyMultiplier);
  }

  private calculateKRIScore(kriData: any[]): number {
    if (kriData.length === 0) return 5;
    
    const breachScores = kriData.map(kri => {
      const thresholdBreached = kri.threshold_breached;
      if (thresholdBreached === 'critical') return 8;
      if (thresholdBreached === 'warning') return 6;
      return 3;
    });
    
    return breachScores.reduce((sum, score) => sum + score, 0) / breachScores.length;
  }

  private calculateControlScore(controls: any[], category: string): number {
    const relevantControls = controls.filter(c => 
      c.test_description?.toLowerCase().includes(category.toLowerCase()) ||
      c.findings?.toLowerCase().includes(category.toLowerCase())
    );
    
    if (relevantControls.length === 0) return 5;
    
    const avgEffectiveness = relevantControls.reduce((sum, control) => {
      return sum + (control.effectiveness_rating || 5);
    }, 0) / relevantControls.length;
    
    // Invert score - higher effectiveness = lower risk
    return 10 - avgEffectiveness;
  }

  private calculateHistoricalScore(incidents: any[], kriData: any[]): number {
    const oneMonthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    
    const historicalIncidents = incidents.filter(i => 
      new Date(i.reported_at) < oneMonthAgo
    );
    
    const historicalKRIs = kriData.filter(k => 
      new Date(k.measurement_date) < oneMonthAgo
    );
    
    const historicalIncidentScore = this.calculateIncidentScore(historicalIncidents);
    const historicalKRIScore = this.calculateKRIScore(historicalKRIs);
    
    return (historicalIncidentScore + historicalKRIScore) / 2;
  }

  private determineTrend(current: number, historical: number): 'increasing' | 'decreasing' | 'stable' {
    const change = (current - historical) / historical;
    if (change > 0.1) return 'increasing';
    if (change < -0.1) return 'decreasing';
    return 'stable';
  }

  private calculateConfidence(incidents: any[], kriData: any[], controls: any[]): number {
    const dataPoints = incidents.length + kriData.length + controls.length;
    const recency = this.calculateRecency(incidents, kriData);
    const consistency = this.calculateConsistency(incidents, kriData);
    
    return Math.min(1, (dataPoints / 20) * recency * consistency);
  }

  private calculateRecency(incidents: any[], kriData: any[]): number {
    const now = Date.now();
    const avgAge = [...incidents, ...kriData].reduce((sum, item) => {
      const date = new Date(item.reported_at || item.measurement_date).getTime();
      return sum + (now - date);
    }, 0) / (incidents.length + kriData.length);
    
    const daysOld = avgAge / (24 * 60 * 60 * 1000);
    return Math.max(0.1, 1 - (daysOld / 90)); // Decay over 90 days
  }

  private calculateConsistency(incidents: any[], kriData: any[]): number {
    // Simple consistency measure based on data distribution
    if (incidents.length < 2 && kriData.length < 2) return 0.5;
    
    const incidentConsistency = this.calculateVarianceConsistency(
      incidents.map(i => ({ low: 1, medium: 2, high: 3, critical: 4 })[i.severity] || 2)
    );
    
    const kriConsistency = this.calculateVarianceConsistency(
      kriData.map(k => k.actual_value)
    );
    
    return (incidentConsistency + kriConsistency) / 2;
  }

  private calculateVarianceConsistency(values: number[]): number {
    if (values.length < 2) return 0.5;
    
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    const coefficientOfVariation = Math.sqrt(variance) / mean;
    
    return Math.max(0.1, 1 - Math.min(1, coefficientOfVariation));
  }

  private generateScoreFactors(incidentScore: number, kriScore: number, controlScore: number) {
    return [
      {
        name: 'Incident Frequency & Severity',
        weight: 0.4,
        currentValue: incidentScore,
        contribution: incidentScore * 0.4
      },
      {
        name: 'Key Risk Indicator Performance',
        weight: 0.4,
        currentValue: kriScore,
        contribution: kriScore * 0.4
      },
      {
        name: 'Control Effectiveness',
        weight: 0.2,
        currentValue: controlScore,
        contribution: controlScore * 0.2
      }
    ];
  }

  private generateBenchmarkComparison(org: any, category: string, currentScore: number) {
    // Simulated benchmark data - in reality, this would come from industry databases
    const industryAvg = this.getIndustryBenchmark(org?.sector, category);
    const sizeAvg = this.getSizeBenchmark(org?.size, category);
    
    return {
      industry: industryAvg,
      size: sizeAvg,
      region: industryAvg * 0.95 // Simplified regional adjustment
    };
  }

  private getIndustryBenchmark(sector: string, category: string): number {
    const benchmarks: Record<string, Record<string, number>> = {
      banking: {
        operational: 6.2,
        cyber: 7.1,
        compliance: 5.8,
        credit: 6.5
      },
      insurance: {
        operational: 5.9,
        cyber: 6.8,
        compliance: 6.1,
        underwriting: 6.3
      },
      fintech: {
        operational: 6.5,
        cyber: 7.8,
        compliance: 6.2,
        technology: 7.2
      }
    };
    
    return benchmarks[sector]?.[category] || 6.0;
  }

  private getSizeBenchmark(size: string, category: string): number {
    const sizeMultipliers: Record<string, number> = {
      small: 1.1,
      medium: 1.0,
      large: 0.9,
      enterprise: 0.8
    };
    
    return 6.0 * (sizeMultipliers[size] || 1.0);
  }

  private generateScoreExplanation(
    category: string,
    score: number,
    factors: any[],
    trend: string
  ): string {
    const trendText = trend === 'increasing' ? 'increasing' : trend === 'decreasing' ? 'improving' : 'stable';
    const primaryFactor = factors.reduce((max, factor) => 
      factor.contribution > max.contribution ? factor : max
    );
    
    return `${category} risk score of ${score.toFixed(1)} is primarily driven by ${primaryFactor.name.toLowerCase()} ` +
           `(contributing ${primaryFactor.contribution.toFixed(1)} points). The trend is ${trendText} compared to historical levels.`;
  }

  private async findSimilarOrganizations(orgId: string) {
    // Simulated similar organizations - in reality, this would query a database
    const currentOrg = await getUserOrganization();
    
    return [
      {
        sector: currentOrg?.sector || 'banking',
        size: currentOrg?.size || 'medium',
        avgScore: 6.2,
        keyFactors: ['Strong incident response', 'Regular control testing', 'Proactive monitoring']
      },
      {
        sector: currentOrg?.sector || 'banking',
        size: 'large',
        avgScore: 5.8,
        keyFactors: ['Comprehensive frameworks', 'Advanced technology', 'Dedicated risk teams']
      }
    ];
  }

  private async getHistoricalRiskData(orgId: string, riskCategory: string) {
    // This would fetch historical risk assessment data
    return {
      assessments: [],
      trends: [],
      patterns: []
    };
  }

  private calculateSuggestedScore(
    category: string,
    org: any,
    similarOrgs: any[],
    historicalData: any
  ): number {
    const industryAvg = this.getIndustryBenchmark(org?.sector, category);
    const sizeAvg = this.getSizeBenchmark(org?.size, category);
    const peerAvg = similarOrgs.reduce((sum, peer) => sum + peer.avgScore, 0) / similarOrgs.length;
    
    return Math.round(((industryAvg + sizeAvg + peerAvg) / 3) * 10) / 10;
  }

  private generateReasoning(category: string, score: number, historicalData: any): string[] {
    const reasoning = [];
    
    reasoning.push(`Based on industry benchmarks for ${category} risk management`);
    reasoning.push(`Considers organizational size and complexity factors`);
    reasoning.push(`Incorporates peer organization performance data`);
    
    if (score > 7) {
      reasoning.push(`Higher score reflects elevated risk exposure typical in this category`);
    } else if (score < 4) {
      reasoning.push(`Lower score indicates mature risk management practices`);
    }
    
    return reasoning;
  }

  private analyzeHistoricalPatterns(historicalData: any): string[] {
    return [
      'Risk levels typically increase during market volatility periods',
      'Seasonal patterns show higher risks during year-end reporting periods',
      'Technology upgrades historically correlate with temporary risk elevation'
    ];
  }

  private generateRecommendedActions(category: string, score: number): string[] {
    const actions = [];
    
    if (score > 7) {
      actions.push(`Implement enhanced monitoring for ${category} risks`);
      actions.push(`Conduct comprehensive risk assessment`);
      actions.push(`Review and strengthen existing controls`);
      actions.push(`Consider additional risk mitigation strategies`);
    } else if (score > 5) {
      actions.push(`Maintain current risk management practices`);
      actions.push(`Regular monitoring and periodic reviews`);
      actions.push(`Update risk assessments annually`);
    } else {
      actions.push(`Continue effective risk management practices`);
      actions.push(`Share best practices with other risk areas`);
      actions.push(`Consider optimizing resource allocation`);
    }
    
    return actions;
  }

  private async getCurrentRiskScores(orgId: string) {
    // This would fetch current risk scores from the database
    return [
      { riskId: 'operational', score: 6.5 },
      { riskId: 'cyber', score: 7.2 },
      { riskId: 'compliance', score: 5.8 }
    ];
  }

  private async getMarketConditions() {
    // This would fetch current market conditions from external sources
    return {
      volatility: 'high',
      interestRates: 'rising',
      regulatoryActivity: 'increased'
    };
  }

  private async getRegulatoryChanges() {
    // This would fetch recent regulatory changes
    return [
      'New cybersecurity reporting requirements',
      'Enhanced operational resilience guidelines',
      'Updated third-party risk management standards'
    ];
  }

  private calculateDynamicAdjustment(
    risk: any,
    marketData: any,
    regulatoryData: any[]
  ): DynamicRiskAdjustment {
    let adjustmentFactor = 1.0;
    const adjustmentFactors = [];
    
    // Market condition adjustments
    if (marketData.volatility === 'high') {
      adjustmentFactor *= 1.1;
      adjustmentFactors.push({
        factor: 'High Market Volatility',
        impact: 0.1,
        timeframe: '3 months'
      });
    }
    
    // Regulatory change adjustments
    if (regulatoryData.length > 0) {
      adjustmentFactor *= 1.05;
      adjustmentFactors.push({
        factor: 'Recent Regulatory Changes',
        impact: 0.05,
        timeframe: '6 months'
      });
    }
    
    const adjustedScore = Math.min(10, risk.score * adjustmentFactor);
    
    return {
      riskId: risk.riskId,
      originalScore: risk.score,
      adjustedScore: Math.round(adjustedScore * 10) / 10,
      adjustmentFactors,
      context: {
        businessEnvironment: marketData.volatility,
        marketConditions: `Interest rates ${marketData.interestRates}`,
        regulatoryChanges: regulatoryData
      },
      validUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) // 90 days
    };
  }
}

export const intelligentRiskAssessmentService = new IntelligentRiskAssessmentService();
