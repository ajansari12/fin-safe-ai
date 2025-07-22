import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AnalyticsRequest {
  analysisType: 'predictive' | 'anomaly' | 'correlation' | 'recommendation' | 'insight';
  dataSource: string[];
  timeRange?: { start: string; end: string };
  parameters?: Record<string, any>;
}

interface AIInsight {
  type: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  confidence: number;
  recommendations: string[];
  dataPoints: any[];
  methodology: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: user } = await supabaseClient.auth.getUser(token);

    if (!user.user) {
      throw new Error('Unauthorized');
    }

    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('organization_id')
      .eq('id', user.user.id)
      .single();

    if (!profile?.organization_id) {
      throw new Error('User organization not found');
    }

    const request: AnalyticsRequest = await req.json();
    console.log('AI Analytics request:', request);

    let insights: AIInsight[] = [];

    switch (request.analysisType) {
      case 'predictive':
        insights = await generatePredictiveInsights(supabaseClient, profile.organization_id, openAIApiKey, request);
        break;
      case 'anomaly':
        insights = await detectAnomalies(supabaseClient, profile.organization_id, openAIApiKey, request);
        break;
      case 'correlation':
        insights = await analyzeCorrelations(supabaseClient, profile.organization_id, openAIApiKey, request);
        break;
      case 'recommendation':
        insights = await generateRecommendations(supabaseClient, profile.organization_id, openAIApiKey, request);
        break;
      case 'insight':
        insights = await generateExecutiveInsights(supabaseClient, profile.organization_id, openAIApiKey, request);
        break;
    }

    // Store insights in database
    for (const insight of insights) {
      await supabaseClient
        .from('ai_insights')
        .insert({
          org_id: profile.organization_id,
          insight_type: insight.type,
          title: insight.title,
          description: insight.description,
          severity: insight.severity,
          confidence: insight.confidence,
          data_points: insight.dataPoints,
          recommendations: insight.recommendations,
          methodology: insight.methodology,
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
        });
    }

    return new Response(JSON.stringify({
      success: true,
      insights,
      generatedAt: new Date().toISOString(),
      dataPointsAnalyzed: insights.reduce((sum, insight) => sum + insight.dataPoints.length, 0)
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in AI Analytics:', error);
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function generatePredictiveInsights(
  supabase: any, 
  orgId: string, 
  openAIKey: string, 
  request: AnalyticsRequest
): Promise<AIInsight[]> {
  // Fetch historical KRI data
  const { data: kriData } = await supabase
    .from('kri_definitions')
    .select(`
      *,
      kri_logs:kri_logs(*)
    `)
    .eq('org_id', orgId)
    .limit(100);

  // Fetch recent incidents
  const { data: incidents } = await supabase
    .from('incident_logs')
    .select('*')
    .eq('org_id', orgId)
    .order('created_at', { ascending: false })
    .limit(50);

  const analysisData = {
    kriMetrics: kriData?.map(kri => ({
      name: kri.name,
      category: kri.category,
      currentValue: kri.current_value,
      targetValue: kri.target_value,
      warningThreshold: kri.warning_threshold,
      criticalThreshold: kri.critical_threshold,
      trend: kri.trend,
      recentLogs: kri.kri_logs?.slice(-10)
    })) || [],
    recentIncidents: incidents?.map(incident => ({
      type: incident.incident_type,
      severity: incident.severity,
      impact: incident.business_impact,
      date: incident.created_at
    })) || []
  };

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openAIKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4.1-2025-04-14',
      messages: [
        {
          role: 'system',
          content: `You are an advanced risk analytics AI specializing in predictive analysis for financial institutions. Analyze the provided risk data and generate predictive insights about potential future risks, KRI breaches, and operational challenges.

          Provide insights in JSON format with the following structure:
          {
            "insights": [
              {
                "type": "predictive_alert",
                "title": "Brief insight title",
                "description": "Detailed description of the prediction",
                "severity": "low|medium|high|critical",
                "confidence": 0.85,
                "recommendations": ["actionable recommendation 1", "actionable recommendation 2"],
                "dataPoints": [{"metric": "value", "trend": "direction"}],
                "methodology": "Brief explanation of analysis method"
              }
            ]
          }

          Focus on:
          1. KRI threshold breach predictions
          2. Incident pattern analysis and forecasting
          3. Operational risk trend identification
          4. Early warning signals
          5. Resource allocation recommendations`
        },
        {
          role: 'user',
          content: `Analyze this risk data for predictive insights: ${JSON.stringify(analysisData)}`
        }
      ],
      temperature: 0.3,
      max_tokens: 2000
    }),
  });

  const aiResponse = await response.json();
  const aiInsights = JSON.parse(aiResponse.choices[0].message.content);
  
  return aiInsights.insights || [];
}

async function detectAnomalies(
  supabase: any, 
  orgId: string, 
  openAIKey: string, 
  request: AnalyticsRequest
): Promise<AIInsight[]> {
  // Fetch recent KRI data for anomaly detection
  const { data: recentKriLogs } = await supabase
    .from('kri_logs')
    .select(`
      *,
      kri_definitions!inner(name, category, warning_threshold, critical_threshold)
    `)
    .eq('kri_definitions.org_id', orgId)
    .order('measurement_date', { ascending: false })
    .limit(200);

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openAIKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4.1-2025-04-14',
      messages: [
        {
          role: 'system',
          content: `You are an AI anomaly detection system for operational risk management. Analyze KRI data patterns to identify statistical anomalies, unusual behaviors, and potential data quality issues.

          Return results in JSON format:
          {
            "insights": [
              {
                "type": "anomaly",
                "title": "Anomaly description",
                "description": "Detailed analysis of the anomaly",
                "severity": "low|medium|high|critical",
                "confidence": 0.92,
                "recommendations": ["investigation steps", "corrective actions"],
                "dataPoints": [{"metric": "anomalous_value", "expected": "normal_range"}],
                "methodology": "Statistical method used for detection"
              }
            ]
          }`
        },
        {
          role: 'user',
          content: `Detect anomalies in this KRI data: ${JSON.stringify(recentKriLogs)}`
        }
      ],
      temperature: 0.2,
      max_tokens: 1500
    }),
  });

  const aiResponse = await response.json();
  const aiInsights = JSON.parse(aiResponse.choices[0].message.content);
  
  return aiInsights.insights || [];
}

async function analyzeCorrelations(
  supabase: any, 
  orgId: string, 
  openAIKey: string, 
  request: AnalyticsRequest
): Promise<AIInsight[]> {
  // Fetch multiple data sources for correlation analysis
  const [kriData, incidents, controls] = await Promise.all([
    supabase.from('kri_definitions').select('*').eq('org_id', orgId),
    supabase.from('incident_logs').select('*').eq('org_id', orgId).limit(100),
    supabase.from('controls').select('*').eq('org_id', orgId)
  ]);

  const correlationData = {
    kris: kriData.data || [],
    incidents: incidents.data || [],
    controls: controls.data || []
  };

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openAIKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4.1-2025-04-14',
      messages: [
        {
          role: 'system',
          content: `You are an AI correlation analysis expert for operational risk. Identify relationships between KRIs, incidents, and controls. Look for patterns, dependencies, and causal relationships.

          Return insights in JSON format focusing on:
          1. KRI correlations and interdependencies
          2. Incident pattern relationships
          3. Control effectiveness correlations
          4. Risk propagation pathways`
        },
        {
          role: 'user',
          content: `Analyze correlations in this risk data: ${JSON.stringify(correlationData)}`
        }
      ],
      temperature: 0.3,
      max_tokens: 1500
    }),
  });

  const aiResponse = await response.json();
  const aiInsights = JSON.parse(aiResponse.choices[0].message.content);
  
  return aiInsights.insights || [];
}

async function generateRecommendations(
  supabase: any, 
  orgId: string, 
  openAIKey: string, 
  request: AnalyticsRequest
): Promise<AIInsight[]> {
  // Fetch comprehensive data for recommendations
  const { data: orgProfile } = await supabase
    .from('organizational_profiles')
    .select('*')
    .eq('organization_id', orgId)
    .single();

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openAIKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4.1-2025-04-14',
      messages: [
        {
          role: 'system',
          content: `You are an AI risk management advisor. Generate actionable recommendations for improving operational risk management based on organizational profile and current risk posture.

          Focus on:
          1. KRI optimization recommendations
          2. Control improvement suggestions
          3. Process enhancement opportunities
          4. Regulatory compliance improvements
          5. Resource allocation optimization`
        },
        {
          role: 'user',
          content: `Generate risk management recommendations for organization: ${JSON.stringify(orgProfile)}`
        }
      ],
      temperature: 0.4,
      max_tokens: 1500
    }),
  });

  const aiResponse = await response.json();
  const aiInsights = JSON.parse(aiResponse.choices[0].message.content);
  
  return aiInsights.insights || [];
}

async function generateExecutiveInsights(
  supabase: any, 
  orgId: string, 
  openAIKey: string, 
  request: AnalyticsRequest
): Promise<AIInsight[]> {
  // Fetch high-level data for executive insights
  const { data: dashboardMetrics } = await supabase
    .rpc('get_org_dashboard_metrics', { target_org_id: orgId });

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openAIKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4.1-2025-04-14',
      messages: [
        {
          role: 'system',
          content: `You are an AI executive advisor for operational risk. Generate high-level insights suitable for C-suite and board reporting. Focus on strategic risk implications, business impact, and executive decision support.

          Provide concise, business-focused insights in JSON format.`
        },
        {
          role: 'user',
          content: `Generate executive insights from: ${JSON.stringify(dashboardMetrics)}`
        }
      ],
      temperature: 0.3,
      max_tokens: 1200
    }),
  });

  const aiResponse = await response.json();
  const aiInsights = JSON.parse(aiResponse.choices[0].message.content);
  
  return aiInsights.insights || [];
}