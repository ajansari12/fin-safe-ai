import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');

interface DocumentAnalysisRequest {
  documentContent: string;
  analysisType: 'policy_review' | 'risk_assessment' | 'compliance_gap' | 'control_mapping';
  framework?: string;
  userId: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { documentContent, analysisType, framework, userId }: DocumentAnalysisRequest = await req.json();

    if (!OPENAI_API_KEY) {
      throw new Error('OpenAI API key not configured');
    }

    // Set up Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Generate analysis prompt based on type
    const systemPrompt = getAnalysisPrompt(analysisType, framework);
    
    // Call OpenAI for document analysis
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1-2025-04-14',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Please analyze the following document:\n\n${documentContent}` }
        ],
        temperature: 0.3,
        max_tokens: 2000,
      }),
    });

    if (!openAIResponse.ok) {
      throw new Error(`OpenAI API error: ${openAIResponse.status}`);
    }

    const openAIData = await openAIResponse.json();
    const analysis = openAIData.choices[0].message.content;

    // Store analysis results
    const { data: analysisRecord, error: insertError } = await supabase
      .from('document_analysis_logs')
      .insert({
        user_id: userId,
        analysis_type: analysisType,
        framework: framework,
        analysis_content: analysis,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error storing analysis:', insertError);
    }

    // Extract structured data from analysis
    const structuredData = extractStructuredData(analysis, analysisType);

    return new Response(
      JSON.stringify({ 
        success: true,
        analysis,
        structuredData,
        analysisId: analysisRecord?.id
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    );

  } catch (error) {
    console.error('Document analysis error:', error);

    return new Response(
      JSON.stringify({ 
        error: 'Failed to analyze document', 
        details: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    );
  }
});

function getAnalysisPrompt(analysisType: string, framework?: string): string {
  const basePrompt = `You are an expert in operational risk management and regulatory compliance. Analyze documents with precision and provide actionable insights.`;
  
  switch (analysisType) {
    case 'policy_review':
      return `${basePrompt}
      
      Review the policy document and provide:
      1. Policy completeness assessment
      2. Regulatory alignment (focus on ${framework || 'OSFI guidelines'})
      3. Gap identification and recommendations
      4. Implementation feasibility
      5. Review frequency recommendations
      
      Format your response with clear sections and actionable recommendations.`;
      
    case 'risk_assessment':
      return `${basePrompt}
      
      Analyze the document for risk management content and provide:
      1. Risk identification and categorization
      2. Risk assessment methodology evaluation
      3. Control effectiveness assessment
      4. Risk appetite alignment
      5. Mitigation strategy recommendations
      
      Focus on operational risks and regulatory requirements.`;
      
    case 'compliance_gap':
      return `${basePrompt}
      
      Perform a compliance gap analysis against ${framework || 'regulatory requirements'} and provide:
      1. Compliance status assessment
      2. Gap identification (critical, moderate, minor)
      3. Regulatory requirement mapping
      4. Remediation priority ranking
      5. Implementation timeline recommendations
      
      Be specific about regulatory citations and requirements.`;
      
    case 'control_mapping':
      return `${basePrompt}
      
      Map controls and procedures in the document and provide:
      1. Control identification and categorization
      2. Control effectiveness assessment
      3. Control testing recommendations
      4. Key Risk Indicator (KRI) suggestions
      5. Control matrix mapping
      
      Focus on operational controls and their regulatory relevance.`;
      
    default:
      return `${basePrompt} Provide a comprehensive analysis of the document with actionable insights for operational risk management.`;
  }
}

function extractStructuredData(analysis: string, analysisType: string): any {
  // Extract key findings, recommendations, and risk ratings from the analysis
  // This would use more sophisticated parsing in a production environment
  
  const lines = analysis.split('\n');
  const sections: Record<string, string[]> = {};
  let currentSection = '';
  
  for (const line of lines) {
    if (line.match(/^\d+\./)) {
      currentSection = line.replace(/^\d+\.\s*/, '').toLowerCase();
      sections[currentSection] = [];
    } else if (currentSection && line.trim()) {
      sections[currentSection].push(line.trim());
    }
  }
  
  return {
    analysisType,
    sections,
    keyFindings: extractKeyFindings(analysis),
    riskRating: extractRiskRating(analysis),
    recommendations: extractRecommendations(analysis)
  };
}

function extractKeyFindings(analysis: string): string[] {
  const findings: string[] = [];
  const lines = analysis.split('\n');
  
  for (const line of lines) {
    if (line.includes('finding') || line.includes('identified') || line.includes('gap')) {
      findings.push(line.trim());
    }
  }
  
  return findings.slice(0, 5); // Top 5 findings
}

function extractRiskRating(analysis: string): string {
  const riskKeywords = ['critical', 'high', 'medium', 'low'];
  const text = analysis.toLowerCase();
  
  for (const risk of ['critical', 'high', 'medium', 'low']) {
    if (text.includes(`${risk} risk`)) {
      return risk;
    }
  }
  
  return 'medium'; // default
}

function extractRecommendations(analysis: string): string[] {
  const recommendations: string[] = [];
  const lines = analysis.split('\n');
  
  for (const line of lines) {
    if (line.includes('recommend') || line.includes('should') || line.includes('implement')) {
      recommendations.push(line.trim());
    }
  }
  
  return recommendations.slice(0, 5); // Top 5 recommendations
}