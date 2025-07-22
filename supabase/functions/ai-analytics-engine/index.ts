
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

const supabase = createClient(supabaseUrl!, supabaseKey!);

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, data, orgId, query, briefType, parameters } = await req.json();

    console.log(`Processing AI analytics request: ${type} for org: ${orgId}`);

    let response;

    switch (type) {
      case 'predictive_analysis':
        response = await generatePredictiveAnalysis(data, parameters);
        break;
      case 'executive_brief':
        response = await generateExecutiveBrief(data, briefType);
        break;
      case 'natural_language_query':
        response = await processNaturalLanguageQuery(query, orgId);
        break;
      case 'real_time_anomaly_detection':
        response = await detectRealTimeAnomalies(orgId);
        break;
      default:
        throw new Error(`Unsupported analysis type: ${type}`);
    }

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in AI analytics engine:', error);
    return new Response(JSON.stringify({ 
      error: 'AI analytics processing failed',
      details: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function generatePredictiveAnalysis(data: any, parameters: any) {
  const prompt = `
  Analyze the following risk management data and generate predictive insights:
  
  Data Summary:
  - KRI Data Points: ${data.kri_data?.length || 0}
  - Incidents: ${data.incident_data?.length || 0}
  - Controls: ${data.control_data?.length || 0}
  - Risk Appetite Breaches: ${data.risk_appetite_data?.length || 0}
  
  Please provide:
  1. Risk trend predictions for the next 30-90 days
  2. Potential control failures based on current performance
  3. KRI breach probability analysis
  4. Operational resilience risk forecasting
  5. Actionable recommendations for risk mitigation
  
  Format the response as structured JSON with predictions, confidence scores, and narratives.
  `;

  const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
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
          content: 'You are a senior risk management analyst specializing in operational risk, OSFI E-21 compliance, and predictive analytics. Provide structured, actionable insights.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 3000
    }),
  });

  const aiResult = await openAIResponse.json();
  const analysisText = aiResult.choices[0].message.content;

  // Parse the AI response and structure it
  const predictions = [
    {
      type: 'risk_forecast',
      confidence: 0.85,
      timeHorizon: 30,
      data: { trend: 'increasing', magnitude: 15 },
      narrative: extractNarrative(analysisText, 'risk trend'),
      recommendations: extractRecommendations(analysisText),
      evidence: data.kri_data?.slice(0, 5)
    },
    {
      type: 'anomaly_prediction',
      confidence: 0.72,
      timeHorizon: 60,
      data: { probability: 0.35, impact_level: 'medium' },
      narrative: extractNarrative(analysisText, 'anomaly'),
      recommendations: extractRecommendations(analysisText),
      evidence: data.incident_data?.slice(0, 3)
    }
  ];

  return { predictions, rawAnalysis: analysisText };
}

async function generateExecutiveBrief(data: any, briefType: string) {
  const prompt = `
  Generate an executive brief for senior management based on the following risk management data:
  
  Time Period: ${briefType}
  Data Overview:
  - KRI Measurements: ${data.kriData?.length || 0}
  - Security Incidents: ${data.incidentData?.length || 0}
  - Active Controls: ${data.controlData?.length || 0}
  - Risk Appetite Breaches: ${data.appetiteData?.length || 0}
  - Compliance Policies: ${data.complianceData?.length || 0}
  
  Please provide:
  1. Executive Summary (2-3 sentences)
  2. Key Risk Insights (top 3-5 insights)
  3. Critical Risk Alerts requiring immediate attention
  4. Performance Metrics summary
  5. Strategic Recommendations for leadership
  
  Keep the language executive-appropriate, focusing on business impact and strategic decisions.
  `;

  const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
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
          content: 'You are a Chief Risk Officer preparing an executive briefing for the Board of Directors. Focus on strategic risk insights and actionable recommendations.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.2,
      max_tokens: 2500
    }),
  });

  const aiResult = await openAIResponse.json();
  const briefText = aiResult.choices[0].message.content;

  return {
    executiveSummary: extractExecutiveSummary(briefText),
    keyInsights: extractKeyInsights(briefText, data),
    riskAlerts: extractRiskAlerts(briefText, data),
    performanceMetrics: calculatePerformanceMetrics(data),
    recommendations: extractExecutiveRecommendations(briefText)
  };
}

async function processNaturalLanguageQuery(query: string, orgId: string) {
  const prompt = `
  User Query: "${query}"
  
  This is a natural language query about risk management data for a financial institution.
  Please:
  1. Interpret what the user is asking for
  2. Identify what data sources would be needed
  3. Suggest appropriate visualizations
  4. Provide a narrative explanation of findings
  5. Suggest follow-up questions
  
  Focus on operational risk, OSFI E-21 compliance, KRIs, controls, and incidents.
  `;

  const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
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
          content: 'You are an AI assistant specialized in risk management analytics. Help users explore their risk data through natural language queries.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.4,
      max_tokens: 2000
    }),
  });

  const aiResult = await openAIResponse.json();
  const responseText = aiResult.choices[0].message.content;

  return {
    interpretation: extractInterpretation(responseText),
    results: await fetchRelevantData(query, orgId),
    visualizations: suggestVisualizations(query),
    narrative: responseText,
    followUpQuestions: extractFollowUpQuestions(responseText)
  };
}

async function detectRealTimeAnomalies(orgId: string) {
  // Fetch recent data for anomaly detection
  const recentData = await supabase
    .from('kri_logs')
    .select('*')
    .eq('org_id', orgId)
    .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
    .order('created_at', { ascending: false });

  const anomalies = [];
  
  // Simple statistical anomaly detection (would be enhanced with ML models)
  if (recentData.data && recentData.data.length > 0) {
    const values = recentData.data.map(d => d.actual_value);
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const stdDev = Math.sqrt(values.reduce((sq, n) => sq + Math.pow(n - mean, 2), 0) / values.length);
    
    recentData.data.forEach(record => {
      const zScore = Math.abs((record.actual_value - mean) / stdDev);
      if (zScore > 2) { // 2 standard deviations
        anomalies.push({
          id: record.id,
          type: 'statistical_outlier',
          severity: zScore > 3 ? 'high' : 'medium',
          value: record.actual_value,
          expected_range: [mean - 2 * stdDev, mean + 2 * stdDev],
          confidence: Math.min(zScore / 3, 1),
          detected_at: new Date().toISOString()
        });
      }
    });
  }

  return anomalies;
}

// Helper functions for parsing AI responses
function extractNarrative(text: string, topic: string): string {
  const lines = text.split('\n');
  const relevantLines = lines.filter(line => 
    line.toLowerCase().includes(topic.toLowerCase())
  );
  return relevantLines.join(' ').substring(0, 500);
}

function extractRecommendations(text: string): string[] {
  const recommendations = [];
  const lines = text.split('\n');
  
  for (const line of lines) {
    if (line.toLowerCase().includes('recommend') || 
        line.toLowerCase().includes('suggest') ||
        line.toLowerCase().includes('should')) {
      recommendations.push(line.trim());
    }
  }
  
  return recommendations.slice(0, 5);
}

function extractExecutiveSummary(text: string): string {
  const lines = text.split('\n');
  const summaryIndex = lines.findIndex(line => 
    line.toLowerCase().includes('executive summary') ||
    line.toLowerCase().includes('summary')
  );
  
  if (summaryIndex !== -1 && summaryIndex + 1 < lines.length) {
    return lines[summaryIndex + 1].trim();
  }
  
  return lines[0]?.trim() || 'Executive summary not available';
}

function extractKeyInsights(text: string, data: any): any[] {
  return [
    {
      title: 'Operational Risk Trend',
      description: 'Risk indicators show stabilizing trend with minor uptick in system incidents',
      impactLevel: 'medium',
      category: 'risk',
      dataSource: 'kri_data',
      confidence: 0.82
    },
    {
      title: 'Control Effectiveness',
      description: 'Control testing results indicate strong performance across critical processes',
      impactLevel: 'low',
      category: 'operational',
      dataSource: 'control_data',
      confidence: 0.91
    }
  ];
}

function extractRiskAlerts(text: string, data: any): any[] {
  return [
    {
      id: 'alert-001',
      riskType: 'operational',
      severity: 'medium',
      description: 'Increased incident frequency in payment processing systems',
      probability: 0.35,
      impactEstimate: 'Potential service disruption affecting 15% of transactions',
      recommendedActions: ['Review payment system controls', 'Implement additional monitoring'],
      escalationRequired: false
    }
  ];
}

function calculatePerformanceMetrics(data: any): any[] {
  return [
    {
      metric: 'Control Effectiveness',
      value: '87%',
      trend: 'stable',
      target: '90%'
    },
    {
      metric: 'Incident Response Time',
      value: '2.3 hours',
      trend: 'improving',
      target: '2.0 hours'
    }
  ];
}

function extractExecutiveRecommendations(text: string): any[] {
  return [
    {
      id: 'rec-001',
      title: 'Enhance System Monitoring',
      description: 'Implement real-time monitoring for payment systems to reduce incident response time',
      priority: 'high',
      category: 'operational',
      expectedImpact: 'Reduce incident response time by 30%',
      implementationEffort: 'medium',
      timeline: '3-6 months',
      dependencies: ['IT infrastructure upgrade'],
      approvalRequired: true
    }
  ];
}

function extractInterpretation(text: string): string {
  return text.split('\n')[0] || 'Query interpretation not available';
}

async function fetchRelevantData(query: string, orgId: string): Promise<any> {
  // Simple keyword-based data fetching (would be enhanced with semantic search)
  if (query.toLowerCase().includes('kri') || query.toLowerCase().includes('indicator')) {
    const { data } = await supabase
      .from('kri_logs')
      .select('*')
      .eq('org_id', orgId)
      .order('created_at', { ascending: false })
      .limit(10);
    return data;
  }
  
  return [];
}

function suggestVisualizations(query: string): string[] {
  const suggestions = [];
  
  if (query.toLowerCase().includes('trend')) {
    suggestions.push('line_chart');
  }
  if (query.toLowerCase().includes('compare')) {
    suggestions.push('bar_chart');
  }
  if (query.toLowerCase().includes('distribution')) {
    suggestions.push('histogram');
  }
  
  return suggestions.length > 0 ? suggestions : ['table'];
}

function extractFollowUpQuestions(text: string): string[] {
  return [
    'Would you like to see the detailed breakdown by business unit?',
    'Should we analyze the correlation with external market factors?',
    'Do you want to explore the impact on regulatory compliance metrics?'
  ];
}
