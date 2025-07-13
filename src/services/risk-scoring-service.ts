
import { supabase } from "@/integrations/supabase/client";
import { VendorProfile } from "./third-party-service";

export interface VendorRiskScore {
  vendor_id: string;
  vendor_name: string;
  risk_score: number;
  risk_level: 'Low' | 'Medium' | 'High' | 'Critical';
  risk_color: string;
  factors: {
    criticality_score: number;
    assessment_score: number;
    contract_score: number;
    sla_score: number;
    status_score: number;
  };
  recommendations: string[];
}

export function getRiskLevel(score: number): 'Low' | 'Medium' | 'High' | 'Critical' {
  if (score <= 2) return 'Low';
  if (score <= 3) return 'Medium';
  if (score <= 4) return 'High';
  return 'Critical';
}

export function getRiskColor(level: string): string {
  switch (level) {
    case 'Low': return 'text-green-600 bg-green-100';
    case 'Medium': return 'text-yellow-600 bg-yellow-100';
    case 'High': return 'text-orange-600 bg-orange-100';
    case 'Critical': return 'text-red-600 bg-red-100';
    default: return 'text-gray-600 bg-gray-100';
  }
}

export async function calculateVendorRiskScore(vendor: VendorProfile, feedData?: any): Promise<VendorRiskScore> {
  try {
    // Use the database function to calculate risk score
    const { data, error } = await supabase.rpc('calculate_vendor_risk_score', {
      vendor_criticality: vendor.criticality,
      last_assessment_date: vendor.last_assessment_date || null,
      contract_end_date: vendor.contract_end_date || null,
      sla_expiry_date: vendor.sla_expiry_date || null,
      status: vendor.status
    });

    if (error) throw error;

    let riskScore = data || 1;
    const riskLevel = getRiskLevel(riskScore);
    const riskColor = getRiskColor(riskLevel);

    // Enhanced with real-time feed data integration
    if (feedData) {
      riskScore = enhanceRiskScoreWithFeedData(riskScore, feedData);
    }

    // Calculate individual factor scores for detailed breakdown
    const factors = calculateFactorScores(vendor, feedData);
    const recommendations = generateRecommendations(vendor, factors, feedData);

    return {
      vendor_id: vendor.id,
      vendor_name: vendor.vendor_name,
      risk_score: riskScore,
      risk_level: getRiskLevel(riskScore), // Recalculate after enhancement
      risk_color: getRiskColor(getRiskLevel(riskScore)),
      factors,
      recommendations
    };
  } catch (error) {
    console.error('Error calculating vendor risk score:', error);
    
    // Fallback calculation if database function fails
    const fallbackScore = calculateFallbackRiskScore(vendor);
    const riskLevel = getRiskLevel(fallbackScore);
    const riskColor = getRiskColor(riskLevel);
    const factors = calculateFactorScores(vendor, feedData);

    return {
      vendor_id: vendor.id,
      vendor_name: vendor.vendor_name,
      risk_score: fallbackScore,
      risk_level: riskLevel,
      risk_color: riskColor,
      factors,
      recommendations: ['Risk calculation error - please review manually']
    };
  }
}

// Enhanced risk scoring with real-time feed data
function enhanceRiskScoreWithFeedData(baseScore: number, feedData: any): number {
  let enhancedScore = baseScore;
  
  // Credit rating impact
  if (feedData.credit_rating) {
    if (feedData.credit_rating < 50) enhancedScore += 1.5;
    else if (feedData.credit_rating < 70) enhancedScore += 0.5;
  }
  
  // Cybersecurity risk impact
  if (feedData.cyber_risk_score) {
    if (feedData.cyber_risk_score > 85) enhancedScore += 1.0;
    else if (feedData.cyber_risk_score > 70) enhancedScore += 0.5;
  }
  
  // News sentiment impact
  if (feedData.sentiment_score) {
    if (feedData.sentiment_score < -0.7) enhancedScore += 0.8;
    else if (feedData.sentiment_score < -0.5) enhancedScore += 0.3;
  }
  
  return Math.min(5, enhancedScore); // Cap at 5
}

function calculateFactorScores(vendor: VendorProfile, feedData?: any) {
  const now = new Date();
  
  // Criticality score
  let criticalityScore = 0;
  switch (vendor.criticality) {
    case 'critical': criticalityScore = 2; break;
    case 'high': criticalityScore = 1; break;
    case 'medium': criticalityScore = 0; break;
    case 'low': criticalityScore = -1; break;
  }

  // Assessment score
  let assessmentScore = 0;
  if (vendor.last_assessment_date) {
    const daysSinceAssessment = Math.floor((now.getTime() - new Date(vendor.last_assessment_date).getTime()) / (1000 * 60 * 60 * 24));
    if (daysSinceAssessment > 365) assessmentScore = 2;
    else if (daysSinceAssessment > 180) assessmentScore = 1;
  } else {
    assessmentScore = 2; // No assessment = high risk
  }

  // Contract score
  let contractScore = 0;
  if (vendor.contract_end_date) {
    const daysToContractEnd = Math.floor((new Date(vendor.contract_end_date).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (daysToContractEnd <= 30) contractScore = 2;
    else if (daysToContractEnd <= 90) contractScore = 1;
  }

  // SLA score
  let slaScore = 0;
  if (vendor.sla_expiry_date) {
    const daysToSlaExpiry = Math.floor((new Date(vendor.sla_expiry_date).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    if (daysToSlaExpiry <= 30) slaScore = 1;
  }

  // Status score
  let statusScore = 0;
  switch (vendor.status) {
    case 'inactive': statusScore = 1; break;
    case 'under_review': statusScore = 1; break;
    case 'terminated': statusScore = 3; break;
  }

  return {
    criticality_score: criticalityScore,
    assessment_score: assessmentScore,
    contract_score: contractScore,
    sla_score: slaScore,
    status_score: statusScore
  };
}

function calculateFallbackRiskScore(vendor: VendorProfile): number {
  const factors = calculateFactorScores(vendor);
  const totalScore = Object.values(factors).reduce((sum, score) => sum + score, 1);
  return Math.max(1, Math.min(5, totalScore));
}

function generateRecommendations(vendor: VendorProfile, factors: any, feedData?: any): string[] {
  const recommendations: string[] = [];

  if (factors.assessment_score >= 2) {
    recommendations.push('Schedule vendor assessment - overdue by more than 1 year');
  } else if (factors.assessment_score >= 1) {
    recommendations.push('Consider scheduling vendor assessment - overdue by more than 6 months');
  }

  if (factors.contract_score >= 2) {
    recommendations.push('Urgent: Contract expires within 30 days - initiate renewal process');
  } else if (factors.contract_score >= 1) {
    recommendations.push('Contract expires within 90 days - begin renewal discussions');
  }

  if (factors.sla_score >= 1) {
    recommendations.push('SLA expires within 30 days - review and renew');
  }

  if (factors.status_score >= 2) {
    recommendations.push('Review vendor status and determine next steps');
  }

  if (vendor.criticality === 'critical' && factors.assessment_score === 0) {
    recommendations.push('Critical vendor - ensure regular assessments are scheduled');
  }

  // Enhanced recommendations with OSFI E-21/B-10 citations and feed data
  if (feedData) {
    if (feedData.credit_rating && feedData.credit_rating < 70) {
      recommendations.push('Per OSFI E-21 Principle 6 and B-10: Credit rating degradation detected - assess vendor financial stability and concentration risk');
    }
    if (feedData.cyber_risk_score && feedData.cyber_risk_score > 80) {
      recommendations.push('Per OSFI B-10: Elevated cybersecurity risk - review vendor security controls and incident response capabilities');
    }
    if (feedData.sentiment_score && feedData.sentiment_score < -0.5) {
      recommendations.push('Per OSFI E-21 Principle 6: Negative sentiment detected - assess reputational and operational risk implications');
    }
  }

  if (recommendations.length === 0) {
    recommendations.push('Vendor risk is well managed - continue monitoring per OSFI E-21 Principle 6');
  }

  // Add regulatory disclaimer to all recommendations
  recommendations.push('Disclaimer: This analysis is based on OSFI E-21 and B-10 guidelines. This is not regulatory advice. Consult OSFI or qualified professionals for your institution\'s specific requirements.');

  return recommendations;
}

export async function calculateAllVendorRiskScores(): Promise<VendorRiskScore[]> {
  try {
    // Get current user's organization vendors
    const { data: profile } = await supabase
      .from('profiles')
      .select('organization_id')
      .eq('id', (await supabase.auth.getUser()).data.user?.id)
      .single();

    if (!profile?.organization_id) {
      return [];
    }

    const { data: vendors, error } = await supabase
      .from('third_party_profiles')
      .select('*')
      .eq('org_id', profile.organization_id);

    if (error) throw error;

    const riskScores = await Promise.all(
      (vendors || []).map(vendor => calculateVendorRiskScore(vendor as VendorProfile))
    );

    return riskScores.sort((a, b) => b.risk_score - a.risk_score);
  } catch (error) {
    console.error('Error calculating all vendor risk scores:', error);
    return [];
  }
}
