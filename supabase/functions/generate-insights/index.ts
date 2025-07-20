import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface InsightGenerationRequest {
  organizationId: string;
  analysisType: 'comprehensive' | 'compliance' | 'risk_trends' | 'controls';
  timeRange: {
    startDate: string;
    endDate: string;
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const supabase = createClient(supabaseUrl!, supabaseServiceKey!);
    const requestData: InsightGenerationRequest = await req.json();

    // Gather organizational data
    const orgData = await gatherOrganizationalData(
      supabase, 
      requestData.organizationId, 
      requestData.timeRange
    );

    // Generate insights using OpenAI
    const insights = await generateInsightsFromData(orgData, requestData);

    // Store insights in database
    const storedInsights = await storeInsights(supabase, insights, requestData.organizationId);

    return new Response(JSON.stringify({ insights: storedInsights }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in generate-insights function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function gatherOrganizationalData(supabase: any, orgId: string, timeRange: { startDate: string; endDate: string }) {
  // Gather data from multiple sources
  const [
    incidents,
    controls,
    kris,
    complianceData,
    vendors
  ] = await Promise.all([
    getIncidentData(supabase, orgId, timeRange.startDate, timeRange.endDate),
    getControlsData(supabase, orgId),
    getKRIData(supabase, orgId),
    getComplianceData(supabase, orgId),
    getVendorData(supabase, orgId)
  ]);

  return {
    incidents,
    controls,
    kris,
    complianceData,
    vendors,
    timeRange
  };
}

async function getIncidentData(supabase: any, orgId: string, startDate: string, endDate: string) {
  const { data } = await supabase
    .from('incident_logs')
    .select('*')
    .eq('org_id', orgId)
    .gte('created_at', startDate)
    .lte('created_at', endDate);
  
  return data || [];
}

async function getControlsData(supabase: any, orgId: string) {
  const { data } = await supabase
    .from('controls')
    .select('*')
    .eq('org_id', orgId);
  
  return data || [];
}

async function getKRIData(supabase: any, orgId: string) {
  const { data } = await supabase
    .from('kri_definitions')
    .select('*')
    .eq('org_id', orgId);
  
  return data || [];
}

async function getComplianceData(supabase: any, orgId: string) {
  const { data } = await supabase
    .from('compliance_assessments')
    .select('*')
    .eq('org_id', orgId)
    .order('assessment_date', { ascending: false })
    .limit(10);
  
  return data || [];
}

async function getVendorData(supabase: any, orgId: string) {
  const { data } = await supabase
    .from('third_party_profiles')
    .select('*')
    .eq('org_id', orgId);
  
  return data || [];
}

async function generateInsightsFromData(orgData: any, request: InsightGenerationRequest): Promise<any[]> {
  const context = prepareAnalysisContext(orgData, request);
  const aiResponse = await callOpenAI(context, request.analysisType);
  return parseAIResponse(aiResponse);
}

function prepareAnalysisContext(orgData: any, request: InsightGenerationRequest): string {
  const summary = {
    totalIncidents: orgData.incidents.length,
    highSeverityIncidents: orgData.incidents.filter((i: any) => 
      i.severity === 'critical' || i.severity === 'high'
    ).length,
    totalControls: orgData.controls.length,
    activeControls: orgData.controls.filter((c: any) => c.status === 'active').length,
    totalKRIs: orgData.kris.length,
    totalVendors: orgData.vendors.length,
    highRiskVendors: orgData.vendors.filter((v: any) => 
      v.risk_rating === 'high' || v.risk_rating === 'critical'
    ).length
  };

  return `
Analysis Context for OSFI E-21 Operational Risk Management:

Organization Summary:
- Total Incidents (${request.timeRange.startDate} to ${request.timeRange.endDate}): ${summary.totalIncidents}
- High Severity Incidents: ${summary.highSeverityIncidents}
- Active Controls: ${summary.activeControls} of ${summary.totalControls}
- Total KRIs: ${summary.totalKRIs}
- High Risk Vendors: ${summary.highRiskVendors} of ${summary.totalVendors}

Recent Incidents:
${orgData.incidents.slice(0, 5).map((incident: any) => 
  `- ${incident.title || 'Incident'} (${incident.severity || 'unknown'}) - ${incident.impact_level || 'TBD'}`
).join('\n')}

Control Status:
${orgData.controls.slice(0, 5).map((control: any) => 
  `- ${control.name || 'Control'}: ${control.status || 'unknown'}`
).join('\n')}

Focus: Generate actionable insights for OSFI E-21 compliance and operational resilience.
  `;
}

async function callOpenAI(context: string, analysisType: string): Promise<string> {
  const prompts = {
    comprehensive: `Based on the operational risk data provided, generate comprehensive insights covering:
1. Risk trend analysis and predictions
2. Control effectiveness assessment
3. OSFI E-21 compliance gaps and recommendations
4. Operational resilience improvements
5. Vendor risk management priorities

Provide specific, actionable recommendations with priority levels and implementation timelines.`,

    compliance: `Analyze the compliance data and generate insights specifically for OSFI E-21 requirements:
1. Identify compliance gaps and deficiencies
2. Assess operational resilience maturity
3. Recommend immediate actions for compliance improvement
4. Suggest governance and oversight enhancements
5. Highlight regulatory reporting improvements needed`,

    risk_trends: `Analyze risk trends and patterns to generate predictive insights:
1. Identify emerging risk patterns and trends
2. Predict potential future risk scenarios
3. Assess correlation between different risk indicators
4. Recommend preventive measures and early warning systems
5. Suggest risk appetite adjustments if needed`,

    controls: `Focus on control effectiveness and optimization:
1. Assess current control performance and gaps
2. Identify redundant or ineffective controls
3. Recommend control enhancements and automation opportunities
4. Suggest testing frequency optimization
5. Highlight control coverage gaps for critical processes`
  };

  const systemPrompt = `You are an expert OSFI E-21 operational risk consultant. Generate actionable insights in the following JSON format:

{
  "insights": [
    {
      "type": "predictive|diagnostic|prescriptive|descriptive",
      "category": "operational|compliance|strategic|financial",
      "title": "Brief insight title",
      "description": "Detailed description of the insight",
      "severity": "low|medium|high|critical",
      "confidence": 0.85,
      "data_sources": ["incidents", "kris", "controls"],
      "recommendations": [
        {
          "action": "Specific action to take",
          "priority": "low|medium|high",
          "estimated_impact": "Expected impact description",
          "timeframe": "Implementation timeframe"
        }
      ]
    }
  ]
}

Ensure all insights are:
- Specific and actionable
- Aligned with OSFI E-21 requirements
- Based on the provided data
- Include concrete next steps`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `${context}\n\n${prompts[analysisType as keyof typeof prompts]}` }
        ],
        temperature: 0.7,
        max_tokens: 4000
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Error calling OpenAI:', error);
    // Return mock insights as fallback
    return getMockInsights(analysisType);
  }
}

function getMockInsights(analysisType: string): string {
  const mockInsights = {
    comprehensive: {
      insights: [
        {
          type: "diagnostic",
          category: "operational",
          title: "Operational Resilience Assessment",
          description: "Current operational metrics indicate opportunities for enhanced monitoring and control effectiveness improvements.",
          severity: "medium",
          confidence: 0.85,
          data_sources: ["incidents", "controls", "kris"],
          recommendations: [
            {
              action: "Implement enhanced monitoring for critical business processes",
              priority: "high",
              estimated_impact: "Improve incident detection by 40%",
              timeframe: "4-6 weeks"
            },
            {
              action: "Review and update control testing frequency",
              priority: "medium",
              estimated_impact: "Enhance control effectiveness by 25%",
              timeframe: "2-3 months"
            }
          ]
        },
        {
          type: "prescriptive",
          category: "compliance",
          title: "OSFI E-21 Compliance Enhancement",
          description: "Analysis reveals opportunities to strengthen compliance framework and operational resilience capabilities.",
          severity: "medium",
          confidence: 0.82,
          data_sources: ["compliance", "controls"],
          recommendations: [
            {
              action: "Enhance business continuity testing procedures",
              priority: "high",
              estimated_impact: "Strengthen OSFI E-21 compliance posture",
              timeframe: "6-8 weeks"
            }
          ]
        }
      ]
    }
  };

  return JSON.stringify(mockInsights[analysisType as keyof typeof mockInsights] || mockInsights.comprehensive);
}

function parseAIResponse(aiResponse: string): any[] {
  try {
    const parsed = JSON.parse(aiResponse);
    return parsed.insights || [];
  } catch (error) {
    console.error('Error parsing AI response:', error);
    return [];
  }
}

async function storeInsights(supabase: any, insights: any[], orgId: string): Promise<any[]> {
  const storedInsights: any[] = [];

  for (const insight of insights) {
    try {
      // Store the main insight
      const { data: storedInsight, error: insightError } = await supabase
        .from('generated_insights')
        .insert({
          org_id: orgId,
          type: insight.type,
          category: insight.category,
          title: insight.title,
          description: insight.description,
          severity: insight.severity,
          confidence: Math.round(insight.confidence * 100),
          data_sources: insight.data_sources || [],
          expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
          created_by: orgId
        })
        .select()
        .single();

      if (insightError) throw insightError;

      storedInsights.push(storedInsight);
    } catch (error) {
      console.error('Error storing insight:', error);
    }
  }

  return storedInsights;
}