
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query, context } = await req.json();
    
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Retrieve relevant knowledge base content based on the query
    const { data: knowledgeData, error: knowledgeError } = await supabase
      .from('knowledge_base')
      .select(`
        title,
        sections
      `);
    
    if (knowledgeError) {
      throw new Error(`Error fetching knowledge base: ${knowledgeError.message}`);
    }
    
    // Process knowledge data to find relevant information
    let relevantInfo = '';
    for (const source of knowledgeData || []) {
      for (const section of source.sections || []) {
        // Simple keyword matching - in a production app, this would use embeddings and vector search
        if (
          section.title?.toLowerCase().includes(query.toLowerCase()) ||
          section.content?.toLowerCase().includes(query.toLowerCase())
        ) {
          relevantInfo += `\n\nFrom ${source.title}, ${section.title}:\n${section.content}`;
        }
      }
    }
    
    // If we don't have the OpenAI API key configured, return a simulated response
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAIApiKey) {
      return simulatedResponse(query, context, relevantInfo);
    }
    
    // Create a system prompt based on context
    let systemPrompt = `You are an AI assistant specialized in operational resilience for financial institutions. 
You provide guidance based on OSFI E-21, ISO 22301, and industry best practices.
You always provide clear, concise, and actionable advice.`;

    // Add context-specific information to system prompt
    if (context.module) {
      systemPrompt += `\nThe user is currently viewing the ${context.module} module.`;
    }
    
    if (context.userRole) {
      systemPrompt += `\nThe user's role is ${context.userRole}. Tailor your response accordingly.`;
    }
    
    if (context.orgSector) {
      systemPrompt += `\nThe user works in the ${context.orgSector} sector. Provide sector-specific guidance when relevant.`;
    }
    
    if (context.orgSize) {
      systemPrompt += `\nThe user's organization is ${context.orgSize}-sized. Adjust your recommendations for their scale.`;
    }
    
    // Add any relevant information from the knowledge base
    if (relevantInfo) {
      systemPrompt += `\n\nRelevant information from the knowledge base: ${relevantInfo}`;
    }
    
    // Call the OpenAI API
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: query }
        ],
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    const data = await response.json();
    
    if (data.error) {
      throw new Error(`OpenAI API error: ${data.error.message}`);
    }
    
    const aiResponse = data.choices[0].message.content;

    return new Response(
      JSON.stringify({ response: aiResponse }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in ai-assistant function:', error);
    
    return new Response(
      JSON.stringify({ 
        error: error.message,
        response: "I'm sorry, I encountered an error processing your request. Please try again later." 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

// Function to generate a simulated response when OpenAI API key is not available
async function simulatedResponse(query: string, context: any, relevantInfo: string) {
  const lowerQuery = query.toLowerCase();
  let simulatedAnswer = "I can help you understand operational resilience concepts and requirements. What specific aspect would you like to know more about?";
  
  // Simulate responses based on query content
  if (lowerQuery.includes("e-21") || lowerQuery.includes("guideline")) {
    simulatedAnswer = "OSFI Guideline E-21 establishes expectations for federally regulated financial institutions (FRFIs) to develop robust approaches to operational risk management. It emphasizes a principles-based approach focusing on sound operational risk governance, management, and assessment.";
  } else if (lowerQuery.includes("iso") || lowerQuery.includes("22301")) {
    simulatedAnswer = "ISO 22301 is the international standard for Business Continuity Management Systems (BCMS). It provides a framework to plan, establish, implement, operate, monitor, review, maintain and continually improve a business continuity management system.";
  } else if (lowerQuery.includes("committee") || lowerQuery.includes("governance")) {
    simulatedAnswer = "Governance committees are essential for operational resilience. OSFI E-21 guidelines recommend establishing a dedicated operational resilience committee with representatives from key business functions. This ensures proper oversight and accountability.";
  } else if (lowerQuery.includes("kri") || lowerQuery.includes("indicator")) {
    simulatedAnswer = "Effective KRIs for operational resilience typically include: system availability percentage, recovery time metrics, incident response times, and third-party service level compliance. These should be regularly monitored and reported.";
  } else if (lowerQuery.includes("impact") || lowerQuery.includes("tolerance")) {
    simulatedAnswer = "Impact tolerances define the maximum acceptable level of disruption to a business service. They should be expressed in terms of maximum tolerable downtime, data loss, or other relevant metrics specific to each critical business function.";
  }
  
  // Add context-specific information
  if (context.userRole === "cro" || context.userRole === "risk officer") {
    simulatedAnswer += "\n\nAs a Risk Officer, you may want to ensure this is properly documented in your risk register and that appropriate controls are implemented.";
  } else if (context.userRole === "ciso") {
    simulatedAnswer += "\n\nFrom a security perspective, you should consider how this relates to your organization's cyber resilience strategy.";
  }
  
  if (context.orgSector === "banking") {
    simulatedAnswer += "\n\nFor banking institutions, this should align with prudential regulatory requirements, particularly OSFI guidelines on operational resilience.";
  }
  
  // Add knowledge base info if available
  if (relevantInfo) {
    simulatedAnswer = `Based on our knowledge base: ${relevantInfo}\n\n${simulatedAnswer}`;
  }
  
  return new Response(
    JSON.stringify({ response: simulatedAnswer }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
  );
}
