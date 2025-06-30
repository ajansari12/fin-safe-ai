
import { riskIntelligenceService } from "./risk-intelligence-service";
import { calculateVendorRiskScore } from "@/services/risk-scoring-service";
import { VendorProfile } from "@/services/third-party-service";

export interface EnhancedRiskAssessment {
  vendorId: string;
  baseRiskScore: number;
  enhancedRiskScore: number;
  confidenceLevel: number;
  riskComponents: RiskComponent[];
  lastUpdated: string;
  recommendations: string[];
  alerts: string[];
}

export interface RiskComponent {
  source: string;
  type: 'internal' | 'credit_rating' | 'regulatory' | 'cyber_threat' | 'economic' | 'industry';
  score: number;
  weight: number;
  confidence: number;
  lastUpdated: string;
  status: 'current' | 'stale' | 'unavailable';
}

class EnhancedRiskScoringService {
  private riskWeights = {
    internal: 0.35,
    credit_rating: 0.25,
    regulatory: 0.20,
    cyber_threat: 0.10,
    economic: 0.05,
    industry: 0.05
  };

  private freshnessThresholds = {
    excellent: 24,   // hours
    good: 72,
    fair: 168,       // 1 week
    stale: 720       // 1 month
  };

  async calculateEnhancedRisk(vendor: VendorProfile): Promise<EnhancedRiskAssessment> {
    // Get base internal risk score
    const baseRisk = await calculateVendorRiskScore(vendor);
    
    // Collect external intelligence
    const intelligence = await riskIntelligenceService.getRiskIntelligence(vendor.id);
    
    // Calculate enhanced risk components
    const riskComponents: RiskComponent[] = [
      {
        source: 'Internal Assessment',
        type: 'internal',
        score: baseRisk.risk_score,
        weight: this.riskWeights.internal,
        confidence: 0.9,
        lastUpdated: new Date().toISOString(),
        status: 'current'
      }
    ];

    // Add external intelligence components
    for (const intel of intelligence) {
      const freshness = this.calculateFreshnessFactor(intel.data_freshness_hours);
      const component: RiskComponent = {
        source: intel.attribution,
        type: intel.intelligence_type as any,
        score: intel.risk_score,
        weight: this.riskWeights[intel.intelligence_type as keyof typeof this.riskWeights] || 0.05,
        confidence: intel.confidence_score * freshness,
        lastUpdated: intel.collected_at,
        status: this.determineDataStatus(intel.data_freshness_hours)
      };
      riskComponents.push(component);
    }

    // Calculate weighted enhanced score
    const enhancedScore = this.calculateWeightedScore(riskComponents);
    const confidenceLevel = this.calculateOverallConfidence(riskComponents);

    // Generate recommendations and alerts
    const recommendations = this.generateRecommendations(riskComponents, baseRisk.risk_score, enhancedScore);
    const alerts = this.generateAlerts(riskComponents, enhancedScore);

    return {
      vendorId: vendor.id,
      baseRiskScore: baseRisk.risk_score,
      enhancedRiskScore: enhancedScore,
      confidenceLevel,
      riskComponents,
      lastUpdated: new Date().toISOString(),
      recommendations,
      alerts
    };
  }

  private calculateFreshnessFactor(freshnessHours: number): number {
    if (freshnessHours <= this.freshnessThresholds.excellent) return 1.0;
    if (freshnessHours <= this.freshnessThresholds.good) return 0.9;
    if (freshnessHours <= this.freshnessThresholds.fair) return 0.7;
    if (freshnessHours <= this.freshnessThresholds.stale) return 0.5;
    return 0.3;
  }

  private determineDataStatus(freshnessHours: number): 'current' | 'stale' | 'unavailable' {
    if (freshnessHours <= this.freshnessThresholds.fair) return 'current';
    if (freshnessHours <= this.freshnessThresholds.stale) return 'stale';
    return 'unavailable';
  }

  private calculateWeightedScore(components: RiskComponent[]): number {
    let totalWeightedScore = 0;
    let totalWeight = 0;

    for (const component of components) {
      const adjustedWeight = component.weight * component.confidence;
      totalWeightedScore += component.score * adjustedWeight;
      totalWeight += adjustedWeight;
    }

    return totalWeight > 0 ? totalWeightedScore / totalWeight : 5;
  }

  private calculateOverallConfidence(components: RiskComponent[]): number {
    const totalWeight = components.reduce((sum, comp) => sum + comp.weight, 0);
    const weightedConfidence = components.reduce((sum, comp) => 
      sum + (comp.confidence * comp.weight), 0
    );
    
    return totalWeight > 0 ? weightedConfidence / totalWeight : 0.5;
  }

  private generateRecommendations(
    components: RiskComponent[], 
    baseScore: number, 
    enhancedScore: number
  ): string[] {
    const recommendations = [];

    // Check if enhanced score significantly differs from base score
    const scoreDifference = Math.abs(enhancedScore - baseScore);
    if (scoreDifference > 1.5) {
      if (enhancedScore > baseScore) {
        recommendations.push(`External intelligence indicates higher risk (+${scoreDifference.toFixed(1)}) than internal assessment`);
      } else {
        recommendations.push(`External intelligence suggests lower risk (-${scoreDifference.toFixed(1)}) than internal assessment`);
      }
    }

    // Check for stale data
    const staleComponents = components.filter(comp => comp.status === 'stale');
    if (staleComponents.length > 0) {
      recommendations.push(`Update external data sources: ${staleComponents.map(c => c.source).join(', ')}`);
    }

    // Check for high-risk components
    const highRiskComponents = components.filter(comp => comp.score >= 8);
    if (highRiskComponents.length > 0) {
      recommendations.push(`Review high-risk indicators: ${highRiskComponents.map(c => c.source).join(', ')}`);
    }

    // Check for low confidence
    const lowConfidenceComponents = components.filter(comp => comp.confidence < 0.6);
    if (lowConfidenceComponents.length > 0) {
      recommendations.push(`Improve data quality for: ${lowConfidenceComponents.map(c => c.source).join(', ')}`);
    }

    // Overall risk level recommendations
    if (enhancedScore >= 8) {
      recommendations.push('Consider immediate risk mitigation measures or vendor replacement');
    } else if (enhancedScore >= 6) {
      recommendations.push('Implement enhanced monitoring and control measures');
    } else if (enhancedScore >= 4) {
      recommendations.push('Continue standard monitoring with periodic review');
    }

    return recommendations;
  }

  private generateAlerts(components: RiskComponent[], enhancedScore: number): string[] {
    const alerts = [];

    // Critical risk alert
    if (enhancedScore >= 9) {
      alerts.push('CRITICAL: Vendor risk score exceeds acceptable thresholds');
    }

    // Regulatory alerts
    const regulatoryComp = components.find(comp => comp.type === 'regulatory');
    if (regulatoryComp && regulatoryComp.score >= 8) {
      alerts.push('REGULATORY: Significant regulatory risk detected');
    }

    // Credit rating alerts
    const creditComp = components.find(comp => comp.type === 'credit_rating');
    if (creditComp && creditComp.score >= 7) {
      alerts.push('CREDIT: Credit rating deterioration detected');
    }

    // Cyber threat alerts
    const cyberComp = components.find(comp => comp.type === 'cyber_threat');
    if (cyberComp && cyberComp.score >= 7) {
      alerts.push('CYBER: Elevated cyber threat indicators');
    }

    // Data quality alerts
    const lowQualityData = components.filter(comp => 
      comp.status === 'stale' && comp.weight > 0.1
    );
    if (lowQualityData.length > 0) {
      alerts.push('DATA: Critical data sources require updating');
    }

    return alerts;
  }

  async getBenchmarkingData(vendor: VendorProfile): Promise<{
    industryAverage: number;
    sizeAverage: number;
    regionalAverage: number;
    percentileRanking: number;
  }> {
    // In production, this would query industry databases and benchmarking services
    // For now, we'll simulate benchmarking data
    
    const sectorRiskAverages = {
      'Financial Services': 4.2,
      'Technology': 3.8,
      'Healthcare': 4.5,
      'Manufacturing': 3.9,
      'Retail': 4.1,
      'Government': 3.2
    };

    const sizeRiskAverages = {
      'Small': 4.8,
      'Medium': 4.2,
      'Large': 3.6,
      'Enterprise': 3.2
    };

    // Simulate industry average based on vendor service type
    const industryAverage = sectorRiskAverages[vendor.service_provided as keyof typeof sectorRiskAverages] || 4.0;
    
    // Simulate size-based average
    const estimatedSize = this.estimateVendorSize(vendor);
    const sizeAverage = sizeRiskAverages[estimatedSize];
    
    // Regional average (simulate based on location)
    const regionalAverage = 4.1; // Default regional average
    
    // Calculate percentile ranking
    const vendorRisk = await this.calculateEnhancedRisk(vendor);
    const percentileRanking = this.calculatePercentileRanking(
      vendorRisk.enhancedRiskScore, 
      industryAverage
    );

    return {
      industryAverage,
      sizeAverage,
      regionalAverage,
      percentileRanking
    };
  }

  private estimateVendorSize(vendor: VendorProfile): 'Small' | 'Medium' | 'Large' | 'Enterprise' {
    const annualSpend = vendor.annual_spend || 0;
    
    if (annualSpend > 10000000) return 'Enterprise';
    if (annualSpend > 1000000) return 'Large';
    if (annualSpend > 100000) return 'Medium';
    return 'Small';
  }

  private calculatePercentileRanking(vendorScore: number, industryAverage: number): number {
    // Simplified percentile calculation
    // In production, this would use statistical models based on large datasets
    const standardDeviation = 1.2;
    const zScore = (vendorScore - industryAverage) / standardDeviation;
    
    // Convert z-score to percentile (approximate)
    let percentile = 50 + (zScore * 15);
    return Math.max(1, Math.min(99, Math.round(percentile)));
  }

  async generateRiskTrendAnalysis(vendorId: string, days: number = 30): Promise<{
    trend: 'improving' | 'stable' | 'deteriorating';
    changeRate: number;
    keyDrivers: string[];
    projectedScore: number;
  }> {
    const intelligence = await riskIntelligenceService.getRiskIntelligence(vendorId);
    
    // Sort by collection date
    const sortedIntelligence = intelligence
      .filter(intel => {
        const collectedDate = new Date(intel.collected_at);
        const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
        return collectedDate >= cutoffDate;
      })
      .sort((a, b) => new Date(a.collected_at).getTime() - new Date(b.collected_at).getTime());

    if (sortedIntelligence.length < 2) {
      return {
        trend: 'stable',
        changeRate: 0,
        keyDrivers: ['Insufficient historical data for trend analysis'],
        projectedScore: sortedIntelligence[0]?.risk_score || 5
      };
    }

    // Calculate trend
    const firstScore = sortedIntelligence[0].risk_score;
    const lastScore = sortedIntelligence[sortedIntelligence.length - 1].risk_score;
    const changeRate = ((lastScore - firstScore) / firstScore) * 100;

    let trend: 'improving' | 'stable' | 'deteriorating';
    if (changeRate > 10) trend = 'deteriorating';
    else if (changeRate < -10) trend = 'improving';
    else trend = 'stable';

    // Identify key drivers
    const keyDrivers = this.identifyTrendDrivers(sortedIntelligence);

    // Simple linear projection
    const projectedScore = lastScore + (changeRate / 100 * lastScore * 0.1);

    return {
      trend,
      changeRate,
      keyDrivers,
      projectedScore: Math.max(1, Math.min(10, projectedScore))
    };
  }

  private identifyTrendDrivers(intelligence: any[]): string[] {
    const drivers = [];
    
    // Group by intelligence type and analyze changes
    const byType = intelligence.reduce((acc, intel) => {
      if (!acc[intel.intelligence_type]) {
        acc[intel.intelligence_type] = [];
      }
      acc[intel.intelligence_type].push(intel);
      return acc;
    }, {} as Record<string, any[]>);

    for (const [type, data] of Object.entries(byType)) {
      if (Array.isArray(data) && data.length >= 2) {
        const firstScore = data[0].risk_score;
        const lastScore = data[data.length - 1].risk_score;
        const change = lastScore - firstScore;
        
        if (Math.abs(change) > 1) {
          drivers.push(`${type.replace('_', ' ')} trend: ${change > 0 ? 'increasing' : 'decreasing'} risk`);
        }
      }
    }

    if (drivers.length === 0) {
      drivers.push('No significant trend drivers identified');
    }

    return drivers;
  }
}

export const enhancedRiskScoringService = new EnhancedRiskScoringService();
