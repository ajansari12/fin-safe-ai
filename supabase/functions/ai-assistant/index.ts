
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
    
    // Module-specific responses
    if (context?.module === 'impact-tolerances') {
      if (message.toLowerCase().includes('impact tolerance') || message.toLowerCase().includes('tolerance')) {
        response = "Impact tolerances define the maximum tolerable level of disruption to a critical business service. They typically include metrics like Maximum Tolerable Downtime (MTD) and Recovery Time Objective (RTO), along with assessments of financial, reputational, and compliance impacts."
                + "\n\nWhen setting impact tolerances, consider the following:"
                + "\n- Be specific about the duration of acceptable disruption"
                + "\n- Quantify impacts where possible (e.g., financial losses)"
                + "\n- Align with regulatory expectations (e.g., OSFI E-21, FCA regulations)"
                + "\n- Ensure they're measurable for testing scenarios";
      } else if (message.toLowerCase().includes('mtd') || message.toLowerCase().includes('maximum tolerable downtime')) {
        response = "Maximum Tolerable Downtime (MTD) represents the maximum period a business function can be unavailable without causing significant harm to the business."
                + "\n\nMTD should be determined based on:"
                + "\n- Financial impact of downtime"
                + "\n- Customer experience considerations"
                + "\n- Regulatory requirements and obligations"
                + "\n- Reputational damage thresholds"
                + "\n\nMTD helps set appropriate recovery strategies and resource allocation for business continuity planning.";
      } else if (message.toLowerCase().includes('rto') || message.toLowerCase().includes('recovery time')) {
        response = "Recovery Time Objective (RTO) defines the targeted duration within which a business process must be restored after a disaster or disruption to avoid unacceptable consequences."
                + "\n\nRTO is typically shorter than MTD, creating a buffer for recovery operations."
                + "\n\nWhen setting RTO:"
                + "\n- Consider technical recovery capabilities"
                + "\n- Factor in people and process dependencies"
                + "\n- Incorporate testing results and feedback"
                + "\n- Ensure it's achievable with current resources";
      }
    } else if (message.toLowerCase().includes('e-21') || message.toLowerCase().includes('guideline')) {
      response = "OSFI Guideline E-21 establishes expectations for federally regulated financial institutions (FRFIs) to develop robust approaches to operational risk management. It emphasizes a principles-based approach focusing on sound operational risk governance, management, and assessment.";
    } else if (message.toLowerCase().includes('iso') || message.toLowerCase().includes('22301')) {
      response = "ISO 22301 is the international standard for Business Continuity Management Systems (BCMS). It provides a framework to plan, establish, implement, operate, monitor, review, maintain and continually improve a business continuity management system.";
    } else if (message.toLowerCase().includes('operational resilience')) {
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
