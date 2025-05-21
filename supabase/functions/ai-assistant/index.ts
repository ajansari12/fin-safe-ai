
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
    
    // Search knowledge base for relevant information
    let knowledgeBaseInfo = null;
    if (message) {
      const normalizedQuery = message.toLowerCase();
      
      // Query the knowledge_base table
      const { data: knowledgeBase, error } = await supabase
        .from('knowledge_base')
        .select('*');
        
      if (error) {
        console.error("Error querying knowledge base:", error);
      }
      
      if (knowledgeBase && knowledgeBase.length > 0) {
        // Search through the knowledge base sections
        for (const source of knowledgeBase) {
          const sections = source.sections || [];
          for (const section of sections) {
            if (
              section.title.toLowerCase().includes(normalizedQuery) ||
              section.content.toLowerCase().includes(normalizedQuery)
            ) {
              knowledgeBaseInfo = `${section.content}\n\nSource: ${source.title}, ${section.title}`;
              break;
            }
          }
          if (knowledgeBaseInfo) break;
        }
      }
    }
    
    // Generate a response based on the message and context
    let response = "I'm your ResilientFI assistant. I can help you understand operational resilience requirements and provide guidance based on regulatory standards.";
    
    // This is where we would integrate with an AI service like OpenAI
    // For now, we'll use some predefined responses based on message content
    if (message.toLowerCase().includes("e-21") || message.toLowerCase().includes("guideline")) {
      response = "OSFI Guideline E-21 establishes expectations for federally regulated financial institutions (FRFIs) to develop robust approaches to operational risk management. It emphasizes a principles-based approach focusing on sound operational risk governance, management, and assessment.";
    } else if (message.toLowerCase().includes("iso") || message.toLowerCase().includes("22301")) {
      response = "ISO 22301 is the international standard for Business Continuity Management Systems (BCMS). It provides a framework to plan, establish, implement, operate, monitor, review, maintain and continually improve a business continuity management system.";
    } else if (message.toLowerCase().includes("operational resilience")) {
      response = "Operational resilience is the ability of an organization to deliver critical operations through disruption. This includes identifying and protecting against threats, responding to and recovering from incidents, and learning from disruptive events.";
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
