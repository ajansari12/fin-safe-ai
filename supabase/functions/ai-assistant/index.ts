
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RequestData {
  message: string;
  context: {
    module?: string | null;
    userRole?: string | null;
    orgSector?: string | null;
    orgSize?: string | null;
  };
  userId?: string;
}

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the request data
    const requestData: RequestData = await req.json();
    const { message, context, userId } = requestData;

    // Set up Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Search knowledge base for relevant information using vector search
    let knowledgeBaseInfo = null;
    let searchResults = [];
    
    if (message) {
      try {
        // First try vector search
        const { data: vectorResults, error: vectorError } = await supabase.functions.invoke('match-knowledge-base', {
          body: {
            query_embedding: await generateQueryEmbedding(message),
            match_threshold: 0.7,
            match_count: 3,
            org_filter: userId ? await getUserOrgId(userId) : null
          }
        });

        if (!vectorError && vectorResults && vectorResults.length > 0) {
          searchResults = vectorResults;
        } else {
          // Fallback to text search
          const { data: textResults, error: textError } = await supabase
            .from('knowledge_base')
            .select('*')
            .textSearch('search_vector', message)
            .limit(3);

          if (!textError && textResults) {
            searchResults = textResults;
          }
        }

        // Format search results
        if (searchResults.length > 0) {
          knowledgeBaseInfo = searchResults.map(result => 
            `${result.content}\n\nSource: ${result.title} (${result.category})`
          ).join('\n\n---\n\n');
        }
      } catch (searchError) {
        console.error("Knowledge base search error:", searchError);
        // Continue without knowledge base info
      }
    }

    // Helper function to generate query embedding
    async function generateQueryEmbedding(query) {
      if (!OPENAI_API_KEY) return null;
      
      try {
        const embeddingResponse = await fetch('https://api.openai.com/v1/embeddings', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${OPENAI_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'text-embedding-3-small',
            input: query,
          }),
        });

        if (!embeddingResponse.ok) return null;
        
        const embeddingData = await embeddingResponse.json();
        return embeddingData.data[0].embedding;
      } catch (error) {
        console.error('Error generating query embedding:', error);
        return null;
      }
    }

    // Helper function to get user's org ID
    async function getUserOrgId(userId) {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('organization_id')
          .eq('id', userId)
          .single();
        
        return error ? null : data?.organization_id;
      } catch (error) {
        return null;
      }
    }
    
    // Use OpenAI for intelligent responses
    let response = "";
    
    if (!OPENAI_API_KEY) {
      response = "I'm your ResilientFI assistant. I can help you understand operational resilience requirements and provide guidance based on regulatory standards. However, OpenAI integration is not configured.";
    } else {
      // Build context for OpenAI
      let systemPrompt = `You are ResilientFI Assistant, an expert in operational resilience, risk management, and regulatory compliance. 
      
      You specialize in:
      - OSFI guidelines (especially E-21 on operational resilience)
      - ISO 22301 Business Continuity Management
      - Operational risk management frameworks
      - Third-party risk management
      - Business impact analysis and continuity planning
      - Key Risk Indicators (KRIs) and controls
      
      Provide practical, actionable guidance tailored to financial institutions and regulated entities.`;
      
      if (context?.module) {
        systemPrompt += `\n\nUser is currently in the ${context.module} module. Focus your response on this area.`;
      }
      
      if (context?.orgSector) {
        systemPrompt += `\n\nUser's organization is in the ${context.orgSector} sector.`;
      }
      
      if (knowledgeBaseInfo) {
        systemPrompt += `\n\nRelevant knowledge base information: ${knowledgeBaseInfo}`;
      }

      try {
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
              { role: 'user', content: message }
            ],
            temperature: 0.7,
            max_tokens: 1000,
          }),
        });

        if (!openAIResponse.ok) {
          throw new Error(`OpenAI API error: ${openAIResponse.status}`);
        }

        const openAIData = await openAIResponse.json();
        response = openAIData.choices[0].message.content;
        
      } catch (openAIError) {
        console.error('OpenAI error:', openAIError);
        // Fallback to basic responses
        response = "I'm your ResilientFI assistant. I can help you understand operational resilience requirements and provide guidance based on regulatory standards.";
        
        if (message.toLowerCase().includes('impact tolerance') || message.toLowerCase().includes('tolerance')) {
          response = "Impact tolerances define the maximum tolerable level of disruption to a critical business service. They typically include metrics like Maximum Tolerable Downtime (MTD) and Recovery Time Objective (RTO), along with assessments of financial, reputational, and compliance impacts.";
        } else if (message.toLowerCase().includes('e-21') || message.toLowerCase().includes('guideline')) {
          response = "OSFI Guideline E-21 establishes expectations for federally regulated financial institutions (FRFIs) to develop robust approaches to operational risk management.";
        }
      }
    }
    
    // Add knowledge base information if available
    if (knowledgeBaseInfo) {
      response = `Based on our knowledge base:\n\n${knowledgeBaseInfo}\n\n${response}`;
    }
    
    // Add context-specific advice based on the user's role and organization
    if (context) {
      if (context.userRole === 'risk officer' || context.userRole === 'cro') {
        response += "\n\nAs a Risk Officer, you should ensure this is properly documented in your risk register and that appropriate controls are implemented.";
      }
      
      if (context.orgSector === 'banking') {
        response += "\n\nFor banking institutions, this should align with prudential regulatory requirements, particularly OSFI guidelines on operational resilience.";
      }
    }

    return new Response(
      JSON.stringify({ response, knowledgeBaseUsed: !!knowledgeBaseInfo }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    );

  } catch (error) {
    console.error('AI Assistant error:', error);

    return new Response(
      JSON.stringify({ 
        error: 'Internal Server Error', 
        details: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    );
  }
});
