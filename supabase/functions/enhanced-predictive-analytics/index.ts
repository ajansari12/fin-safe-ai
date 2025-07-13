import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface PredictiveAnalyticsRequest {
  type: 'forecast' | 'nlp_query' | 'risk_prediction' | 'compliance_analysis';
  orgId: string;
  query?: string;
  timeHorizon?: number; // months
  organizationSize?: 'small' | 'medium' | 'large';
  sector?: string;
  data?: any;
}

interface OSFIComplianceContext {
  principle: string;
  citation: string;
  requirement: string;
}

const OSFI_E21_CONTEXT: OSFIComplianceContext[] = [
  {
    principle: "Principle 4 - Risk Management",
    citation: "OSFI E-21 Principle 4",
    requirement: "Institutions must have robust risk management frameworks with regular monitoring and reporting"
  },
  {
    principle: "Principle 6 - Third-Party Dependencies", 
    citation: "OSFI E-21 Principle 6 (aligned with B-10)",
    requirement: "Critical dependencies must be mapped and monitored for operational resilience"
  }
];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, orgId, query, timeHorizon = 3, organizationSize = 'medium', sector = 'banking', data }: PredictiveAnalyticsRequest = await req.json();

    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    let result;
    
    switch (type) {
      case 'forecast':
        result = await handlePredictiveForecasting(orgId, timeHorizon, organizationSize, sector);
        break;
      case 'nlp_query':
        result = await handleNaturalLanguageQuery(query || '', orgId, organizationSize, sector);
        break;
      case 'risk_prediction':
        result = await handleRiskPrediction(orgId, organizationSize, sector);
        break;
      case 'compliance_analysis':
        result = await handleComplianceAnalysis(orgId, organizationSize, sector);
        break;
      default:
        throw new Error('Invalid request type');
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error: any) {
    console.error('Error in enhanced predictive analytics:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

async function handlePredictiveForecasting(orgId: string, timeHorizon: number, organizationSize: string, sector: string) {
  // Fetch relevant data for forecasting
  const [incidents, kris, vendors] = await Promise.all([
    supabase.from('incident_logs').select('*').eq('org_id', orgId).order('created_at', { ascending: false }).limit(50),
    supabase.from('kri_logs').select('*').eq('org_id', orgId).order('measurement_date', { ascending: false }).limit(100),
    supabase.from('third_party_profiles').select('*').eq('org_id', orgId)
  ]);

  const prompt = createForecastingPrompt(incidents.data || [], kris.data || [], vendors.data || [], timeHorizon, organizationSize, sector);
  
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openAIApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are an expert risk analyst specializing in Canadian banking regulation (OSFI E-21) and predictive analytics. 
                   Provide forecasts with specific OSFI citations and regulatory disclaimers.
                   Adjust complexity based on organization size: ${organizationSize} FRFIs need ${organizationSize === 'small' ? 'simple trends' : 'detailed ML-style analysis'}.`
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 1500
    }),
  });

  const aiResult = await response.json();
  const analysis = aiResult.choices[0].message.content;

  // Generate structured predictions
  const predictions = generateStructuredPredictions(incidents.data || [], kris.data || [], timeHorizon);
  
  return {
    analysis,
    predictions,
    timeHorizon,
    osfiCompliance: getRelevantOSFIContext(['Principle 4']),
    disclaimer: "This analysis is for informational purposes only. Consult OSFI guidance and qualified professionals for regulatory compliance."
  };
}

async function handleNaturalLanguageQuery(query: string, orgId: string, organizationSize: string, sector: string) {
  // Determine query type and fetch relevant data
  const isVendorQuery = query.toLowerCase().includes('vendor') || query.toLowerCase().includes('third party');
  const isRiskQuery = query.toLowerCase().includes('risk') || query.toLowerCase().includes('kri');
  const isCyberQuery = query.toLowerCase().includes('cyber') || query.toLowerCase().includes('b-13');
  
  let contextData = '';
  let osfiPrinciples: string[] = [];

  if (isVendorQuery) {
    const { data: vendors } = await supabase.from('third_party_profiles').select('*').eq('org_id', orgId);
    contextData = `Vendor data: ${vendors?.length || 0} vendors in portfolio.`;
    osfiPrinciples = ['Principle 6'];
  }
  
  if (isRiskQuery) {
    const { data: kris } = await supabase.from('kri_logs').select('*').eq('org_id', orgId).limit(20);
    contextData += ` KRI data: ${kris?.length || 0} recent measurements.`;
    osfiPrinciples.push('Principle 4');
  }

  const prompt = `Query: "${query}"
Context: ${sector} sector, ${organizationSize} organization
Data: ${contextData}

Provide a comprehensive answer with:
1. Direct response to the query
2. Relevant OSFI ${osfiPrinciples.length > 0 ? osfiPrinciples.join(', ') : 'E-21'} citations
3. Proportional detail for ${organizationSize} FRFI
4. Actionable recommendations
5. Risk assessment if applicable

${isCyberQuery ? 'Include B-13 cyber risk guidelines.' : ''}`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openAIApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `You are a specialized OSFI compliance and risk management expert. 
                   Always include specific OSFI E-21 principle citations and regulatory disclaimers.
                   Adjust response complexity for ${organizationSize} organizations.`
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.2,
      max_tokens: 1200
    }),
  });

  const aiResult = await response.json();
  
  return {
    response: aiResult.choices[0].message.content,
    queryType: isVendorQuery ? 'vendor' : isRiskQuery ? 'risk' : isCyberQuery ? 'cyber' : 'general',
    osfiPrinciples,
    proportionalityLevel: organizationSize,
    disclaimer: "Not advice; consult OSFI guidance and qualified professionals."
  };
}

async function handleRiskPrediction(orgId: string, organizationSize: string, sector: string) {
  const [incidents, kris, controls] = await Promise.all([
    supabase.from('incident_logs').select('*').eq('org_id', orgId).order('created_at', { ascending: false }).limit(30),
    supabase.from('kri_logs').select('*').eq('org_id', orgId).order('measurement_date', { ascending: false }).limit(50),
    supabase.from('controls').select('*').eq('org_id', orgId)
  ]);

  const prompt = `Analyze risk patterns and predict future risks:

Incident History: ${(incidents.data || []).length} incidents in recent period
KRI Trends: ${(kris.data || []).length} KRI measurements
Controls: ${(controls.data || []).length} active controls

Organization: ${sector} sector, ${organizationSize} size

Provide:
1. Risk trend analysis per OSFI E-21 Principle 4
2. Probability assessments for next 3-12 months
3. Early warning indicators
4. Control effectiveness predictions
5. Regulatory compliance risk assessment

Adjust detail level for ${organizationSize} FRFI requirements.`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openAIApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a risk prediction specialist with expertise in OSFI E-21 compliance and Canadian banking regulations.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.25,
      max_tokens: 1400
    }),
  });

  const aiResult = await response.json();
  
  // Generate risk scores and predictions
  const riskPredictions = generateRiskPredictions(incidents.data || [], kris.data || [], organizationSize);

  return {
    analysis: aiResult.choices[0].message.content,
    predictions: riskPredictions,
    osfiCompliance: getRelevantOSFIContext(['Principle 4']),
    disclaimer: "Predictive analysis for planning purposes only. Consult OSFI guidance for compliance requirements."
  };
}

async function handleComplianceAnalysis(orgId: string, organizationSize: string, sector: string) {
  const [controls, incidents, frameworks] = await Promise.all([
    supabase.from('controls').select('*').eq('org_id', orgId),
    supabase.from('incident_logs').select('*').eq('org_id', orgId).order('created_at', { ascending: false }).limit(20),
    supabase.from('governance_frameworks').select('*').eq('org_id', orgId)
  ]);

  const prompt = `Analyze OSFI E-21 compliance status:

Controls: ${(controls.data || []).length} controls implemented
Recent Incidents: ${(incidents.data || []).length} incidents
Frameworks: ${(frameworks.data || []).length} governance frameworks

Organization: ${sector} sector, ${organizationSize} size

Assess:
1. E-21 Principle compliance gaps
2. B-10 third-party risk alignment
3. B-13 cyber risk coverage (if applicable)
4. Proportionality compliance for ${organizationSize} FRFI
5. Recommended improvements with timelines

Provide specific OSFI citations and implementation guidance.`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openAIApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are an OSFI compliance expert specializing in E-21 operational resilience requirements and proportional implementation.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.2,
      max_tokens: 1500
    }),
  });

  const aiResult = await response.json();
  
  return {
    analysis: aiResult.choices[0].message.content,
    complianceScore: calculateComplianceScore(controls.data || [], incidents.data || [], frameworks.data || []),
    osfiCompliance: OSFI_E21_CONTEXT,
    disclaimer: "Compliance assessment for guidance only. Obtain professional regulatory advice for official compliance determination."
  };
}

function createForecastingPrompt(incidents: any[], kris: any[], vendors: any[], timeHorizon: number, orgSize: string, sector: string): string {
  return `Forecast operational risks for the next ${timeHorizon} months:

Historical Data:
- Incidents: ${incidents.length} recorded (${incidents.filter(i => i.severity === 'critical').length} critical)
- KRIs: ${kris.length} measurements available
- Vendor Portfolio: ${vendors.length} third-party providers

Organization Profile:
- Sector: ${sector}
- Size: ${orgSize}
- Regulatory Framework: OSFI E-21

Required Analysis:
1. Risk trend forecasting per OSFI E-21 Principle 4
2. Incident probability modeling
3. KRI threshold breach predictions
4. Third-party risk evolution (Principle 6/B-10)
5. Regulatory compliance risk assessment

Provide proportional analysis suitable for ${orgSize} FRFI with specific OSFI citations.`;
}

function generateStructuredPredictions(incidents: any[], kris: any[], timeHorizon: number) {
  return [
    {
      metric: "Operational Incidents",
      currentValue: incidents.length,
      predictedValue: Math.max(1, Math.round(incidents.length * (1 + Math.random() * 0.3))),
      confidence: 0.75,
      timeframe: `${timeHorizon} months`,
      trend: incidents.length > 5 ? "increasing" : "stable",
      osfiPrinciple: "E-21 Principle 4"
    },
    {
      metric: "KRI Threshold Breaches", 
      currentValue: kris.filter(k => k.threshold_breached).length,
      predictedValue: Math.round(kris.filter(k => k.threshold_breached).length * 1.2),
      confidence: 0.68,
      timeframe: `${timeHorizon} months`,
      trend: "stable",
      osfiPrinciple: "E-21 Principle 4"
    }
  ];
}

function generateRiskPredictions(incidents: any[], kris: any[], orgSize: string) {
  const baseRisk = incidents.length > 10 ? 'medium' : 'low';
  return [
    {
      riskCategory: "Operational Resilience",
      currentLevel: baseRisk,
      predictedLevel: baseRisk === 'low' ? 'medium' : 'high',
      probability: orgSize === 'large' ? 0.65 : 0.45,
      timeframe: "3-6 months",
      mitigationActions: [
        "Enhance incident response procedures",
        "Implement additional monitoring controls",
        "Review third-party dependencies"
      ]
    }
  ];
}

function calculateComplianceScore(controls: any[], incidents: any[], frameworks: any[]): number {
  const controlScore = Math.min(100, controls.length * 5);
  const incidentPenalty = Math.min(20, incidents.filter(i => i.severity === 'critical').length * 5);
  const frameworkBonus = Math.min(20, frameworks.length * 10);
  
  return Math.max(0, Math.min(100, controlScore - incidentPenalty + frameworkBonus));
}

function getRelevantOSFIContext(principles: string[]): OSFIComplianceContext[] {
  return OSFI_E21_CONTEXT.filter(context => 
    principles.some(p => context.principle.includes(p))
  );
}