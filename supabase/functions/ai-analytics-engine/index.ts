
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';

interface AnalyticsRequest {
  analysisType: 'predictive' | 'anomaly' | 'correlation' | 'recommendation' | 'insight';
  dataSource: string[];
  timeRange?: {
    start: string;
    end: string;
  };
  parameters?: Record<string, any>;
  userId: string;
  orgId: string;
}

interface AIInsight {
  id: string;
  type: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  confidence: number;
  recommendations: string[];
  dataPoints: any[];
  generatedAt: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!OPENAI_API_KEY) {
      throw new Error('OpenAI API key not configured');
    }

    const { analysisType, dataSource, timeRange, parameters, userId, orgId }: AnalyticsRequest = await req.json();
    
    console.log(`AI Analytics request: ${analysisType} for org ${orgId}`);

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch relevant data based on analysis type and data sources
    const analyticsData = await fetchAnalyticsData(supabase, orgId, dataSource, timeRange);
    
    if (!analyticsData || analyticsData.length === 0) {
      return new Response(
        JSON.stringify({ 
          error: 'No data available for analysis',
          insights: []
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Generate AI insights based on analysis type
    const insights = await generateAIInsights(analyticsData, analysisType, parameters);

    // Store insights in database
    await storeInsights(supabase, orgId, userId, insights);

    return new Response(
      JSON.stringify({ 
        success: true,
        insights,
        dataPointsAnalyzed: analyticsData.length,
        generatedAt: new Date().toISOString()
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('AI Analytics error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'AI Analytics processing failed',
        details: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});

async function fetchAnalyticsData(supabase: any, orgId: string, dataSources: string[], timeRange?: any) {
  const data: any = {};
  
  try {
    // Fetch KRI data for predictive analysis
    if (dataSources.includes('kri') || dataSources.includes('all')) {
      const { data: kriData } = await supabase
        .from('kri_logs')
        .select(`
          *,
          kri_definitions (
            kri_name,
            measurement_unit,
            frequency,
            threshold_values
          )
        `)
        .eq('org_id', orgId)
        .gte('measurement_date', timeRange?.start || new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString())
        .lte('measurement_date', timeRange?.end || new Date().toISOString())
        .order('measurement_date', { ascending: false })
        .limit(1000);
      
      data.kri = kriData || [];
    }

    // Fetch incident data for anomaly detection
    if (dataSources.includes('incidents') || dataSources.includes('all')) {
      const { data: incidentData } = await supabase
        .from('incident_logs')
        .select('*')
        .eq('org_id', orgId)
        .gte('created_at', timeRange?.start || new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString())
        .lte('created_at', timeRange?.end || new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(500);
      
      data.incidents = incidentData || [];
    }

    // Fetch control data for effectiveness analysis
    if (dataSources.includes('controls') || dataSources.includes('all')) {
      const { data: controlData } = await supabase
        .from('controls')
        .select(`
          *,
          control_tests (
            test_date,
            test_result,
            effectiveness_rating,
            deficiencies_identified
          )
        `)
        .eq('org_id', orgId)
        .order('created_at', { ascending: false })
        .limit(200);
      
      data.controls = controlData || [];
    }

    // Fetch risk appetite data
    if (dataSources.includes('risk_appetite') || dataSources.includes('all')) {
      const { data: appetiteData } = await supabase
        .from('appetite_breach_logs')
        .select('*')
        .eq('org_id', orgId)
        .gte('created_at', timeRange?.start || new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false })
        .limit(100);
      
      data.riskAppetite = appetiteData || [];
    }

    return data;
  } catch (error) {
    console.error('Error fetching analytics data:', error);
    return {};
  }
}

async function generateAIInsights(data: any, analysisType: string, parameters?: any): Promise<AIInsight[]> {
  const insights: AIInsight[] = [];
  
  try {
    switch (analysisType) {
      case 'predictive':
        const predictiveInsights = await generatePredictiveInsights(data);
        insights.push(...predictiveInsights);
        break;
        
      case 'anomaly':
        const anomalyInsights = await generateAnomalyInsights(data);
        insights.push(...anomalyInsights);
        break;
        
      case 'correlation':
        const correlationInsights = await generateCorrelationInsights(data);
        insights.push(...correlationInsights);
        break;
        
      case 'recommendation':
        const recommendationInsights = await generateRecommendationInsights(data);
        insights.push(...recommendationInsights);
        break;
        
      case 'insight':
        const generalInsights = await generateGeneralInsights(data);
        insights.push(...generalInsights);
        break;
    }
    
    return insights;
  } catch (error) {
    console.error('Error generating AI insights:', error);
    return [];
  }
}

async function generatePredictiveInsights(data: any): Promise<AIInsight[]> {
  const insights: AIInsight[] = [];
  
  if (data.kri && data.kri.length > 10) {
    // Analyze KRI trends for prediction
    const kriTrends = analyzeKRITrends(data.kri);
    
    const prompt = `
      Analyze the following KRI trend data and provide predictive insights:
      ${JSON.stringify(kriTrends, null, 2)}
      
      Focus on:
      1. KRIs showing concerning upward trends
      2. Predicted threshold breaches in the next 30-90 days
      3. Seasonal patterns and cyclical behaviors
      4. Early warning indicators
      
      Provide specific, actionable predictions with confidence levels.
    `;
    
    const aiResponse = await callOpenAI(prompt);
    
    insights.push({
      id: crypto.randomUUID(),
      type: 'predictive_kri',
      title: 'KRI Breach Predictions',
      description: aiResponse,
      severity: 'medium',
      confidence: 75,
      recommendations: [
        'Monitor high-risk KRIs more frequently',
        'Implement preventive controls for predicted breaches',
        'Review threshold settings for trending KRIs'
      ],
      dataPoints: kriTrends,
      generatedAt: new Date().toISOString()
    });
  }
  
  return insights;
}

async function generateAnomalyInsights(data: any): Promise<AIInsight[]> {
  const insights: AIInsight[] = [];
  
  if (data.incidents && data.incidents.length > 5) {
    const incidentPatterns = analyzeIncidentPatterns(data.incidents);
    
    const prompt = `
      Analyze these incident patterns for anomalies:
      ${JSON.stringify(incidentPatterns, null, 2)}
      
      Look for:
      1. Unusual clustering of incidents by time, type, or source
      2. Incidents that deviate from normal patterns
      3. Potential systemic issues or root causes
      4. Hidden correlations between incident types
      
      Highlight specific anomalies with potential impact assessment.
    `;
    
    const aiResponse = await callOpenAI(prompt);
    
    insights.push({
      id: crypto.randomUUID(),
      type: 'anomaly_detection',
      title: 'Incident Pattern Anomalies',
      description: aiResponse,
      severity: 'high',
      confidence: 80,
      recommendations: [
        'Investigate unusual incident clusters',
        'Review controls for anomalous incident types',
        'Enhance monitoring for detected patterns'
      ],
      dataPoints: incidentPatterns,
      generatedAt: new Date().toISOString()
    });
  }
  
  return insights;
}

async function generateCorrelationInsights(data: any): Promise<AIInsight[]> {
  const insights: AIInsight[] = [];
  
  if (data.kri && data.incidents && data.controls) {
    const correlationData = {
      kriBreaches: data.kri.filter((k: any) => k.breach_detected),
      incidents: data.incidents,
      controlDeficiencies: data.controls.filter((c: any) => 
        c.control_tests?.some((t: any) => t.effectiveness_rating < 70)
      )
    };
    
    const prompt = `
      Analyze correlations between these risk management data points:
      ${JSON.stringify(correlationData, null, 2)}
      
      Identify:
      1. Correlations between KRI breaches and incidents
      2. Control deficiencies that correlate with higher incident rates
      3. Leading indicators that predict cascading risk events
      4. Risk interdependencies and systemic vulnerabilities
      
      Provide specific correlation insights with statistical confidence.
    `;
    
    const aiResponse = await callOpenAI(prompt);
    
    insights.push({
      id: crypto.randomUUID(),
      type: 'correlation_analysis',
      title: 'Risk Event Correlations',
      description: aiResponse,
      severity: 'medium',
      confidence: 70,
      recommendations: [
        'Strengthen controls with high correlation to incidents',
        'Create integrated monitoring for correlated risks',
        'Develop early warning systems based on leading indicators'
      ],
      dataPoints: correlationData,
      generatedAt: new Date().toISOString()
    });
  }
  
  return insights;
}

async function generateRecommendationInsights(data: any): Promise<AIInsight[]> {
  const insights: AIInsight[] = [];
  
  const summary = {
    totalKRIs: data.kri?.length || 0,
    breachedKRIs: data.kri?.filter((k: any) => k.breach_detected)?.length || 0,
    totalIncidents: data.incidents?.length || 0,
    criticalIncidents: data.incidents?.filter((i: any) => i.severity === 'critical')?.length || 0,
    totalControls: data.controls?.length || 0,
    ineffectiveControls: data.controls?.filter((c: any) => 
      c.control_tests?.some((t: any) => t.effectiveness_rating < 70)
    )?.length || 0
  };
  
  const prompt = `
    Based on this risk management summary, provide strategic recommendations:
    ${JSON.stringify(summary, null, 2)}
    
    Provide recommendations for:
    1. Immediate actions for high-priority risks
    2. Control enhancements and optimization
    3. Risk monitoring and reporting improvements
    4. Resource allocation and prioritization
    5. Regulatory compliance improvements
    
    Focus on actionable, prioritized recommendations with expected impact.
  `;
  
  const aiResponse = await callOpenAI(prompt);
  
  insights.push({
    id: crypto.randomUUID(),
    type: 'strategic_recommendations',
    title: 'Risk Management Optimization',
    description: aiResponse,
    severity: 'medium',
    confidence: 85,
    recommendations: [
      'Implement AI-driven risk monitoring',
      'Enhance control effectiveness measurement',
      'Develop predictive risk models',
      'Automate regulatory reporting processes'
    ],
    dataPoints: summary,
    generatedAt: new Date().toISOString()
  });
  
  return insights;
}

async function generateGeneralInsights(data: any): Promise<AIInsight[]> {
  const insights: AIInsight[] = [];
  
  const overallSummary = {
    dataAvailability: {
      kri: data.kri?.length || 0,
      incidents: data.incidents?.length || 0,
      controls: data.controls?.length || 0,
      riskAppetite: data.riskAppetite?.length || 0
    },
    riskTrends: analyzeOverallRiskTrends(data),
    complianceStatus: assessComplianceStatus(data)
  };
  
  const prompt = `
    Provide comprehensive risk management insights based on this data:
    ${JSON.stringify(overallSummary, null, 2)}
    
    Generate insights on:
    1. Overall risk posture and trends
    2. Compliance effectiveness and gaps
    3. Operational resilience status
    4. Key areas requiring attention
    5. Success indicators and positive trends
    
    Provide executive-level insights with clear action items.
  `;
  
  const aiResponse = await callOpenAI(prompt);
  
  insights.push({
    id: crypto.randomUUID(),
    type: 'executive_insights',
    title: 'Risk Management Overview',
    description: aiResponse,
    severity: 'medium',
    confidence: 90,
    recommendations: [
      'Review risk appetite settings quarterly',
      'Enhance data quality and completeness',
      'Implement continuous monitoring programs',
      'Strengthen incident response procedures'
    ],
    dataPoints: overallSummary,
    generatedAt: new Date().toISOString()
  });
  
  return insights;
}

async function callOpenAI(prompt: string): Promise<string> {
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14',
        messages: [
          {
            role: 'system',
            content: `You are a senior risk management analyst with expertise in operational risk, regulatory compliance, and financial services. Provide specific, actionable insights based on the data provided. Use professional language appropriate for financial institution executives and risk managers.`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 1000,
        temperature: 0.3
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('OpenAI API call failed:', error);
    return 'AI analysis temporarily unavailable. Please try again later.';
  }
}

// Utility functions for data analysis
function analyzeKRITrends(kriData: any[]): any {
  const trends: any = {};
  
  kriData.forEach(kri => {
    const kriName = kri.kri_definitions?.kri_name || 'Unknown KRI';
    if (!trends[kriName]) {
      trends[kriName] = [];
    }
    trends[kriName].push({
      date: kri.measurement_date,
      value: kri.actual_value,
      threshold: kri.kri_definitions?.threshold_values,
      breach: kri.breach_detected
    });
  });
  
  return trends;
}

function analyzeIncidentPatterns(incidents: any[]): any {
  return {
    totalIncidents: incidents.length,
    severityDistribution: incidents.reduce((acc: any, inc) => {
      acc[inc.severity] = (acc[inc.severity] || 0) + 1;
      return acc;
    }, {}),
    typeDistribution: incidents.reduce((acc: any, inc) => {
      acc[inc.incident_type] = (acc[inc.incident_type] || 0) + 1;
      return acc;
    }, {}),
    monthlyTrend: incidents.reduce((acc: any, inc) => {
      const month = new Date(inc.created_at).toISOString().substring(0, 7);
      acc[month] = (acc[month] || 0) + 1;
      return acc;
    }, {})
  };
}

function analyzeOverallRiskTrends(data: any): any {
  return {
    kriTrendDirection: data.kri?.length > 10 ? 'stable' : 'insufficient_data',
    incidentTrend: data.incidents?.length > 5 ? 'stable' : 'low_volume',
    controlEffectiveness: data.controls?.length > 0 ? 'adequate' : 'needs_assessment'
  };
}

function assessComplianceStatus(data: any): any {
  return {
    riskAppetiteCompliance: data.riskAppetite?.length === 0 ? 'good' : 'needs_attention',
    controlTesting: data.controls?.some((c: any) => c.control_tests?.length > 0) ? 'active' : 'limited',
    incidentReporting: data.incidents?.length > 0 ? 'active' : 'minimal'
  };
}

async function storeInsights(supabase: any, orgId: string, userId: string, insights: AIInsight[]): Promise<void> {
  try {
    for (const insight of insights) {
      await supabase
        .from('ai_insights')
        .insert({
          id: insight.id,
          org_id: orgId,
          created_by: userId,
          insight_type: insight.type,
          title: insight.title,
          description: insight.description,
          severity: insight.severity,
          confidence: insight.confidence,
          recommendations: insight.recommendations,
          data_points: insight.dataPoints,
          generated_at: insight.generatedAt,
          expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
        });
    }
    console.log(`Stored ${insights.length} AI insights`);
  } catch (error) {
    console.error('Error storing insights:', error);
  }
}
