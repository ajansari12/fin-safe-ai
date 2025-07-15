import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface VendorRiskRequest {
  vendorId: string;
  orgId: string;
  analysisType: 'individual' | 'concentration' | 'portfolio';
  includeFeeds?: boolean;
  includeBreachPrediction?: boolean;
}

interface VendorRiskAnalysis {
  vendorId: string;
  vendorName: string;
  riskScore: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  concentrationRisk: number;
  impactAssessment: {
    operationalImpact: string;
    financialImpact: string;
    reputationalImpact: string;
    complianceImpact: string;
  };
  recommendations: string[];
  osfiCitations: string[];
  analysisTimestamp: string;
  aiInsights?: string;
  confidenceScore?: number;
}

interface ConcentrationRiskAssessment {
  totalVendors: number;
  criticalVendors: number;
  concentrationThreshold: number;
  currentConcentration: number;
  exceedsThreshold: boolean;
  riskFactors: string[];
  mitigationStrategies: string[];
  osfiCompliance: {
    e21Principle6: boolean;
    b10Requirements: boolean;
    citations: string[];
  };
  aiRecommendations?: string;
}

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

// Rate limiting - simple in-memory counter
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_REQUESTS = 10; // requests per minute per org
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute

function checkRateLimit(orgId: string): boolean {
  const now = Date.now();
  const orgLimit = rateLimitMap.get(orgId);
  
  if (!orgLimit || now > orgLimit.resetTime) {
    rateLimitMap.set(orgId, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }
  
  if (orgLimit.count >= RATE_LIMIT_REQUESTS) {
    return false;
  }
  
  orgLimit.count++;
  return true;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { vendorId, orgId, analysisType, includeFeeds = false, includeBreachPrediction = false }: VendorRiskRequest = await req.json();

    // Rate limiting check
    if (!checkRateLimit(orgId)) {
      return new Response(
        JSON.stringify({ 
          error: 'Rate limit exceeded. Please wait before making more requests.',
          type: 'RATE_LIMIT_EXCEEDED' 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 429,
        }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    let result;
    switch (analysisType) {
      case 'individual':
        result = await analyzeIndividualVendor(supabase, vendorId, orgId, includeFeeds, includeBreachPrediction);
        break;
      case 'concentration':
        result = await analyzeConcentrationRisk(supabase, orgId);
        break;
      case 'portfolio':
        result = await analyzeVendorPortfolio(supabase, orgId);
        break;
      default:
        throw new Error('Invalid analysis type');
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Error in vendor risk analysis:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

async function analyzeIndividualVendor(
  supabase: any, 
  vendorId: string, 
  orgId: string, 
  includeFeeds: boolean,
  includeBreachPrediction: boolean
): Promise<VendorRiskAnalysis> {
  // Get vendor data
  const { data: vendor, error } = await supabase
    .from('third_party_profiles')
    .select('*')
    .eq('id', vendorId)
    .eq('org_id', orgId)
    .single();

  if (error) throw new Error(`Vendor not found: ${error.message}`);

  // Get additional context data
  const [contractsResult, monitoringResult, kriResult] = await Promise.all([
    supabase.from('vendor_contracts').select('*').eq('vendor_profile_id', vendorId),
    supabase.from('vendor_monitoring_feeds').select('*').eq('vendor_profile_id', vendorId),
    supabase.from('kri_logs').select('*').eq('org_id', orgId).order('measurement_date', { ascending: false }).limit(10)
  ]);

  const contracts = contractsResult.data || [];
  const monitoringData = monitoringResult.data || [];
  const recentKRIs = kriResult.data || [];

  // Calculate base risk score using existing vendor data
  const baseRiskScore = calculateBaseRiskScore(vendor, contracts, monitoringData);

  // Get AI-powered insights if OpenAI is configured
  let aiInsights = '';
  let confidenceScore = 0.7; // Default confidence without AI
  
  if (OPENAI_API_KEY) {
    try {
      const aiAnalysis = await generateVendorAIInsights(vendor, contracts, monitoringData, recentKRIs, includeBreachPrediction);
      aiInsights = aiAnalysis.insights;
      confidenceScore = aiAnalysis.confidence;
    } catch (aiError) {
      console.error('AI analysis failed, using fallback:', aiError);
      aiInsights = 'AI analysis unavailable. Using rule-based assessment.';
    }
  }

  // Calculate concentration risk
  const { data: allVendors } = await supabase
    .from('third_party_profiles')
    .select('criticality')
    .eq('org_id', orgId);

  const criticalVendors = allVendors?.filter(v => v.criticality === 'critical').length || 0;
  const concentrationRisk = criticalVendors > 0 ? (1 / criticalVendors) * 100 : 0;

  const analysis: VendorRiskAnalysis = {
    vendorId,
    vendorName: vendor.vendor_name,
    riskScore: baseRiskScore,
    riskLevel: determineRiskLevel(baseRiskScore),
    concentrationRisk,
    impactAssessment: generateImpactAssessment(vendor, baseRiskScore),
    recommendations: generateRecommendations(vendor, contracts, baseRiskScore),
    osfiCitations: [
      'OSFI E-21 Principle 6: Mapping dependencies and understanding interconnectedness',
      'OSFI B-10: Third-party risk management framework',
      ...(baseRiskScore > 75 ? ['OSFI E-21 Principle 7: Tolerance for disruption'] : [])
    ],
    analysisTimestamp: new Date().toISOString(),
    aiInsights,
    confidenceScore
  };

  return analysis;
}

async function analyzeConcentrationRisk(supabase: any, orgId: string): Promise<ConcentrationRiskAssessment> {
  const { data: vendors, error } = await supabase
    .from('third_party_profiles')
    .select('*')
    .eq('org_id', orgId);

  if (error) throw new Error(`Error fetching vendors: ${error.message}`);

  const totalVendors = vendors?.length || 0;
  const criticalVendors = vendors?.filter(v => v.criticality === 'critical').length || 0;
  const concentrationThreshold = 20; // 20% threshold per OSFI guidelines
  const currentConcentration = totalVendors > 0 ? (criticalVendors / totalVendors) * 100 : 0;

  let aiRecommendations = '';
  if (OPENAI_API_KEY && vendors) {
    try {
      aiRecommendations = await generateConcentrationAIRecommendations(vendors, currentConcentration, concentrationThreshold);
    } catch (aiError) {
      console.error('AI recommendations failed:', aiError);
      aiRecommendations = 'AI recommendations unavailable. Using standard OSFI guidance.';
    }
  }

  const assessment: ConcentrationRiskAssessment = {
    totalVendors,
    criticalVendors,
    concentrationThreshold,
    currentConcentration,
    exceedsThreshold: currentConcentration > concentrationThreshold,
    riskFactors: currentConcentration > concentrationThreshold ? [
      'High dependency on critical vendors',
      'Limited supplier diversification',
      'Potential single points of failure',
      'Concentrated operational risk exposure'
    ] : [
      'Balanced vendor portfolio',
      'Diversified supplier base'
    ],
    mitigationStrategies: [
      'Diversify supplier base across business functions',
      'Implement backup service providers for critical services',
      'Regular dependency mapping reviews per OSFI E-21',
      'Enhanced due diligence for critical vendors',
      'Establish vendor exit strategies'
    ],
    osfiCompliance: {
      e21Principle6: currentConcentration <= concentrationThreshold,
      b10Requirements: currentConcentration <= concentrationThreshold,
      citations: [
        'OSFI E-21 Principle 6: Institutions should map their dependencies',
        'OSFI B-10: Third-party risk management framework',
        'OSFI E-21 Principle 7: Setting tolerance for disruption'
      ]
    },
    aiRecommendations
  };

  return assessment;
}

async function analyzeVendorPortfolio(supabase: any, orgId: string) {
  const { data: vendors, error } = await supabase
    .from('third_party_profiles')
    .select('*')
    .eq('org_id', orgId);

  if (error) throw new Error(`Error fetching vendor portfolio: ${error.message}`);

  // Analyze each vendor individually (limited to top 10 critical vendors)
  const criticalVendors = vendors?.filter(v => v.criticality === 'critical').slice(0, 10) || [];
  const portfolioAnalyses = [];

  for (const vendor of criticalVendors) {
    try {
      const analysis = await analyzeIndividualVendor(supabase, vendor.id, orgId, false, false);
      portfolioAnalyses.push(analysis);
    } catch (error) {
      console.error(`Error analyzing vendor ${vendor.id}:`, error);
    }
  }

  // Generate portfolio-level AI insights
  let portfolioInsights = '';
  if (OPENAI_API_KEY && portfolioAnalyses.length > 0) {
    try {
      portfolioInsights = await generatePortfolioAIInsights(portfolioAnalyses, vendors || []);
    } catch (aiError) {
      console.error('Portfolio AI analysis failed:', aiError);
      portfolioInsights = 'Portfolio AI analysis unavailable.';
    }
  }

  return {
    portfolioSummary: {
      totalVendors: vendors?.length || 0,
      criticalVendors: criticalVendors.length,
      analyzedVendors: portfolioAnalyses.length,
      averageRiskScore: portfolioAnalyses.reduce((sum, a) => sum + a.riskScore, 0) / portfolioAnalyses.length || 0,
      highRiskVendors: portfolioAnalyses.filter(a => a.riskLevel === 'high' || a.riskLevel === 'critical').length
    },
    individualAnalyses: portfolioAnalyses,
    portfolioInsights,
    timestamp: new Date().toISOString()
  };
}

function calculateBaseRiskScore(vendor: any, contracts: any[], monitoringData: any[]): number {
  let score = 50; // Base score

  // Risk rating adjustment
  switch (vendor.risk_rating) {
    case 'critical': score += 40; break;
    case 'high': score += 25; break;
    case 'medium': score += 0; break;
    case 'low': score -= 15; break;
  }

  // Criticality adjustment
  switch (vendor.criticality) {
    case 'critical': score += 20; break;
    case 'high': score += 10; break;
    case 'medium': score += 0; break;
    case 'low': score -= 10; break;
  }

  // Contract status adjustment
  const activeContracts = contracts.filter(c => c.status === 'active');
  if (activeContracts.length === 0) score += 15; // No active contracts is risky

  // Monitoring data adjustment
  if (monitoringData.length === 0) score += 10; // No monitoring data

  return Math.max(0, Math.min(100, score));
}

function determineRiskLevel(score: number): 'low' | 'medium' | 'high' | 'critical' {
  if (score >= 80) return 'critical';
  if (score >= 65) return 'high';
  if (score >= 40) return 'medium';
  return 'low';
}

function generateImpactAssessment(vendor: any, riskScore: number) {
  return {
    operationalImpact: `${vendor.criticality} impact on business operations - potential ${riskScore > 70 ? 'severe' : 'moderate'} service disruption`,
    financialImpact: `Estimated impact: ${riskScore * 100} CAD/hour during service disruption`,
    reputationalImpact: vendor.criticality === 'critical' ? 'High reputational risk due to customer-facing services' : 'Moderate reputational risk',
    complianceImpact: `Subject to OSFI E-21 Principle 6 and B-10 requirements${riskScore > 75 ? ' - enhanced monitoring required' : ''}`
  };
}

function generateRecommendations(vendor: any, contracts: any[], riskScore: number): string[] {
  const recommendations = [
    'Implement continuous monitoring per OSFI B-10',
    'Review SLA terms quarterly',
    'Maintain updated business continuity plans'
  ];

  if (riskScore > 70) {
    recommendations.push(
      'Establish backup suppliers for critical services',
      'Enhanced due diligence and monitoring',
      'Board-level oversight consideration per OSFI E-21'
    );
  }

  if (contracts.filter(c => c.status === 'active').length === 0) {
    recommendations.push('Establish formal service agreements');
  }

  return recommendations;
}

async function generateVendorAIInsights(
  vendor: any, 
  contracts: any[], 
  monitoringData: any[], 
  recentKRIs: any[],
  includeBreachPrediction: boolean
): Promise<{ insights: string; confidence: number }> {
  const prompt = `Analyze this vendor risk profile for OSFI E-21 compliance:

VENDOR PROFILE:
- Name: ${vendor.vendor_name}
- Risk Rating: ${vendor.risk_rating}
- Criticality: ${vendor.criticality}
- Service Category: ${vendor.service_category || 'General'}
- Status: ${vendor.status}

CONTRACTS: ${contracts.length} contracts (${contracts.filter(c => c.status === 'active').length} active)
MONITORING: ${monitoringData.length} monitoring feeds
RECENT KRIs: ${recentKRIs.length} measurements

${includeBreachPrediction ? 'Include breach probability assessment for next 6 months.' : ''}

Provide:
1. Risk assessment with OSFI E-21 Principle 6 context
2. Specific compliance gaps or strengths
3. Actionable recommendations with timelines
4. Integration with broader risk management framework

Keep response focused and regulatory-compliant.`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are an expert in OSFI E-21 operational resilience and B-10 third-party risk management. Provide practical, compliance-focused analysis.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 1000
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.status}`);
  }

  const data = await response.json();
  return {
    insights: data.choices[0].message.content,
    confidence: 0.85 // High confidence with AI analysis
  };
}

async function generateConcentrationAIRecommendations(
  vendors: any[], 
  currentConcentration: number, 
  threshold: number
): Promise<string> {
  const prompt = `Analyze vendor concentration risk for OSFI compliance:

CONCENTRATION ANALYSIS:
- Total Vendors: ${vendors.length}
- Critical Vendors: ${vendors.filter(v => v.criticality === 'critical').length}
- Current Concentration: ${currentConcentration.toFixed(1)}%
- OSFI Threshold: ${threshold}%
- Exceeds Threshold: ${currentConcentration > threshold ? 'YES' : 'NO'}

VENDOR BREAKDOWN:
${vendors.slice(0, 10).map(v => `- ${v.vendor_name}: ${v.criticality} risk, ${v.service_category || 'General'}`).join('\n')}

Per OSFI E-21 Principle 6 and B-10 guidelines, provide:
1. Concentration risk assessment
2. Regulatory compliance implications
3. Specific mitigation strategies with priorities
4. Diversification recommendations

Focus on actionable, OSFI-compliant recommendations.`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are an OSFI compliance expert specializing in third-party risk management and concentration risk analysis.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.2,
      max_tokens: 800
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.status}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

async function generatePortfolioAIInsights(analyses: VendorRiskAnalysis[], allVendors: any[]): Promise<string> {
  const prompt = `Analyze vendor portfolio risk for OSFI E-21 compliance:

PORTFOLIO SUMMARY:
- Total Portfolio: ${allVendors.length} vendors
- Analyzed Critical Vendors: ${analyses.length}
- Average Risk Score: ${(analyses.reduce((sum, a) => sum + a.riskScore, 0) / analyses.length).toFixed(1)}
- High/Critical Risk: ${analyses.filter(a => a.riskLevel === 'high' || a.riskLevel === 'critical').length}

TOP RISK VENDORS:
${analyses.slice(0, 5).map(a => `- ${a.vendorName}: ${a.riskScore}/100 (${a.riskLevel})`).join('\n')}

Provide portfolio-level insights:
1. Overall risk posture assessment
2. Portfolio diversification analysis
3. Systemic risk identification
4. Strategic recommendations for risk optimization
5. OSFI E-21 compliance status and gaps

Focus on strategic, executive-level insights.`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a senior risk management advisor specializing in vendor portfolio optimization and OSFI compliance.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 1200
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.status}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}