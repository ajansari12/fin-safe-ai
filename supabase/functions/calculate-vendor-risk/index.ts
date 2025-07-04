import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface VendorRiskRequest {
  vendor_profile_id: string;
  org_id: string;
  assessment_data?: {
    financial_score?: number;
    operational_score?: number;
    security_score?: number;
    compliance_score?: number;
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { vendor_profile_id, org_id, assessment_data }: VendorRiskRequest = await req.json();

    if (!vendor_profile_id || !org_id) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: vendor_profile_id and org_id' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Set up Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get vendor profile data
    const { data: vendor, error: vendorError } = await supabase
      .from('third_party_profiles')
      .select('*')
      .eq('id', vendor_profile_id)
      .eq('org_id', org_id)
      .single();

    if (vendorError || !vendor) {
      return new Response(
        JSON.stringify({ error: 'Vendor not found or access denied' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      );
    }

    // Calculate risk scores if not provided
    const scores = assessment_data || await calculateAutoRiskScores(vendor);
    
    // Calculate overall weighted risk score
    const overallRiskScore = calculateOverallRiskScore(scores, vendor.criticality);

    // Get risk factors and recommendations
    const riskFactors = await identifyRiskFactors(vendor);
    const mitigationRecommendations = generateMitigationRecommendations(vendor, overallRiskScore);

    // Prepare assessment data
    const assessmentData = {
      vendor_profile_id,
      org_id,
      assessment_type: 'automated',
      assessment_date: new Date().toISOString().split('T')[0],
      financial_score: scores.financial_score,
      operational_score: scores.operational_score,
      security_score: scores.security_score,
      compliance_score: scores.compliance_score,
      overall_risk_score: overallRiskScore,
      assessment_methodology: {
        scoring_framework: 'AUTOMATED_RISK_CALCULATOR',
        weighting_factors: {
          financial: 0.25,
          operational: 0.30,
          security: 0.30,
          compliance: 0.15
        },
        criticality_multiplier: getCriticalityMultiplier(vendor.criticality),
        assessment_version: '1.0'
      },
      risk_factors: riskFactors,
      mitigation_recommendations: mitigationRecommendations,
      status: 'completed'
    };

    // Save to database
    const { data: savedAssessment, error: saveError } = await supabase
      .from('vendor_assessments')
      .insert([assessmentData])
      .select()
      .single();

    if (saveError) {
      console.error('Error saving assessment:', saveError);
      return new Response(
        JSON.stringify({ error: 'Failed to save assessment', details: saveError.message }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        assessment: savedAssessment,
        risk_summary: {
          overall_risk_score: overallRiskScore,
          risk_level: getRiskLevel(overallRiskScore),
          scores: scores,
          key_risks: riskFactors,
          recommendations: mitigationRecommendations
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in calculate-vendor-risk function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});

// Helper functions
async function calculateAutoRiskScores(vendor: any) {
  return {
    financial_score: calculateFinancialScore(vendor),
    operational_score: calculateOperationalScore(vendor),
    security_score: calculateSecurityScore(vendor),
    compliance_score: calculateComplianceScore(vendor)
  };
}

function calculateFinancialScore(vendor: any): number {
  let score = 75; // Base score

  // Industry risk adjustment
  const industryRisks: { [key: string]: number } = {
    'technology': -5,
    'financial': -15,
    'healthcare': -10,
    'energy': -20,
    'manufacturing': -8,
    'retail': -3,
    'telecommunications': -7
  };
  
  const industryAdjustment = industryRisks[vendor.industry?.toLowerCase()] || -5;
  score += industryAdjustment;

  // Size/stability adjustment based on vendor details
  if (vendor.vendor_size === 'large') score += 10;
  if (vendor.vendor_size === 'small') score -= 15;

  // Random factor for demonstration (in production, integrate with real financial APIs)
  const randomFactor = (Math.random() - 0.5) * 20;
  score += randomFactor;

  return Math.max(0, Math.min(100, Math.round(score)));
}

function calculateOperationalScore(vendor: any): number {
  let score = 70; // Base score

  // Criticality affects operational requirements
  const criticalityBonus = {
    'critical': -20,
    'high': -10,
    'medium': 0,
    'low': 10
  };
  
  score += criticalityBonus[vendor.criticality] || 0;

  // Geographic risk
  const locationRisk = calculateGeographicRisk(vendor.location);
  score -= locationRisk;

  // Random operational factor
  const randomFactor = (Math.random() - 0.5) * 25;
  score += randomFactor;

  return Math.max(0, Math.min(100, Math.round(score)));
}

function calculateSecurityScore(vendor: any): number {
  let score = 65; // Base score

  // Industry security requirements
  const highSecurityIndustries = ['financial', 'healthcare', 'government'];
  if (highSecurityIndustries.includes(vendor.industry?.toLowerCase())) {
    score += 15;
  }

  // Criticality security requirements
  if (vendor.criticality === 'critical') score += 10;
  if (vendor.criticality === 'high') score += 5;

  // Random security factor
  const randomFactor = (Math.random() - 0.5) * 30;
  score += randomFactor;

  return Math.max(0, Math.min(100, Math.round(score)));
}

function calculateComplianceScore(vendor: any): number {
  let score = 80; // Base score

  // Regulated industries have higher compliance standards
  const regulatedIndustries = ['financial', 'healthcare', 'energy'];
  if (regulatedIndustries.includes(vendor.industry?.toLowerCase())) {
    score += 10;
  }

  // Random compliance factor
  const randomFactor = (Math.random() - 0.5) * 20;
  score += randomFactor;

  return Math.max(0, Math.min(100, Math.round(score)));
}

function calculateOverallRiskScore(scores: any, criticality: string): number {
  const weights = {
    financial: 0.25,
    operational: 0.30,
    security: 0.30,
    compliance: 0.15
  };

  const weightedScore = (
    scores.financial_score * weights.financial +
    scores.operational_score * weights.operational +
    scores.security_score * weights.security +
    scores.compliance_score * weights.compliance
  );

  // Apply criticality multiplier - convert quality score to risk score
  const criticalityMultiplier = getCriticalityMultiplier(criticality);
  const riskScore = (100 - weightedScore) * criticalityMultiplier;
  
  return Math.max(1, Math.min(100, Math.round(riskScore)));
}

function getCriticalityMultiplier(criticality: string): number {
  switch (criticality) {
    case 'critical': return 1.5;
    case 'high': return 1.25;
    case 'medium': return 1.0;
    case 'low': return 0.8;
    default: return 1.0;
  }
}

function calculateGeographicRisk(location: string): number {
  const highRiskCountries = ['CN', 'RU', 'IR', 'KP'];
  const mediumRiskCountries = ['IN', 'BR', 'MX', 'ZA'];
  
  if (highRiskCountries.includes(location)) return 25;
  if (mediumRiskCountries.includes(location)) return 15;
  return 5;
}

function getRiskLevel(score: number): string {
  if (score >= 80) return 'critical';
  if (score >= 60) return 'high';
  if (score >= 40) return 'medium';
  return 'low';
}

async function identifyRiskFactors(vendor: any) {
  const factors = [];
  
  if (vendor.criticality === 'critical') {
    factors.push({
      category: 'operational',
      factor: 'Critical Dependency',
      severity: 'high',
      description: 'Vendor is classified as critical to operations'
    });
  }

  if (['CN', 'RU', 'IR'].includes(vendor.location)) {
    factors.push({
      category: 'geopolitical',
      factor: 'Geographic Risk',
      severity: 'high',
      description: 'Vendor located in high-risk jurisdiction'
    });
  }

  factors.push({
    category: 'data',
    factor: 'Data Access',
    severity: 'medium',
    description: 'Vendor has access to organizational data'
  });

  return factors;
}

function generateMitigationRecommendations(vendor: any, riskScore: number) {
  const recommendations = [];

  if (riskScore > 70) {
    recommendations.push({
      priority: 'high',
      category: 'risk_reduction',
      recommendation: 'Consider vendor diversification or enhanced monitoring',
      timeline: '30 days',
      impact: 'Reduces single point of failure risk'
    });
  }

  if (riskScore > 50) {
    recommendations.push({
      priority: 'medium',
      category: 'monitoring',
      recommendation: 'Implement continuous monitoring for this vendor',
      timeline: '60 days',
      impact: 'Early detection of emerging risks'
    });
  }

  recommendations.push({
    priority: 'low',
    category: 'documentation',
    recommendation: 'Update vendor contracts with enhanced SLA requirements',
    timeline: '90 days',
    impact: 'Improved service level guarantees'
  });

  return recommendations;
}