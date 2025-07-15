
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
    orgType?: string | null;
    capitalTier?: string | null;
    regulatoryClassification?: string[] | null;
    geographicScope?: string | null;
  };
  userId?: string;
  orgId?: string;
}

interface KnowledgeResult {
  id: string;
  title: string;
  content: string;
  category: string;
  similarity?: number;
}

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');

// Rate limiting - simple in-memory counter (for production use Redis or similar)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_REQUESTS = 10; // requests per minute
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute in milliseconds

function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const userLimit = rateLimitMap.get(userId);
  
  if (!userLimit || now > userLimit.resetTime) {
    // Reset or create new rate limit window
    rateLimitMap.set(userId, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }
  
  if (userLimit.count >= RATE_LIMIT_REQUESTS) {
    return false; // Rate limit exceeded
  }
  
  userLimit.count++;
  return true;
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

    // Rate limiting check
    if (userId && !checkRateLimit(userId)) {
      return new Response(
        JSON.stringify({ 
          error: 'Rate limit exceeded. Please wait before making more requests.',
          type: 'RATE_LIMIT_EXCEEDED' 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 429,
        }
      );
    }

    // Set up Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    
    // Enhanced knowledge base semantic search
    let knowledgeBaseInfo = null;
    let searchResults: KnowledgeResult[] = [];
    let searchUsed = false;
    
    if (message) {
      const orgId = requestData.orgId || (userId ? await getUserOrgId(userId) : null);
      
      try {
        // Primary: Vector similarity search with embeddings
        const queryEmbedding = await generateQueryEmbedding(message);
        
        if (queryEmbedding && orgId) {
          const { data: vectorResults, error: vectorError } = await supabase.functions.invoke('match-knowledge-base', {
            body: {
              query_embedding: queryEmbedding,
              match_threshold: 0.75,
              match_count: 5,
              org_filter: orgId
            }
          });

          if (!vectorError && vectorResults?.length > 0) {
            searchResults = vectorResults.map((result: any) => ({
              id: result.id,
              title: result.title,
              content: result.content,
              category: result.category,
              similarity: result.similarity
            }));
            searchUsed = true;
          }
        }

        // Fallback 1: Text search with tsvector
        if (searchResults.length === 0 && orgId) {
          const { data: textResults, error: textError } = await supabase
            .from('knowledge_base')
            .select('id, title, content, category, tags')
            .eq('org_id', orgId)
            .textSearch('search_vector', message, { 
              type: 'websearch', 
              config: 'english' 
            })
            .limit(3);

          if (!textError && textResults?.length > 0) {
            searchResults = textResults;
            searchUsed = true;
          }
        }

        // Fallback 2: Keyword matching on title/content
        if (searchResults.length === 0 && orgId) {
          const keywords = message.toLowerCase().split(' ').filter(word => word.length > 3);
          
          let query = supabase
            .from('knowledge_base')
            .select('id, title, content, category, tags')
            .eq('org_id', orgId);

          // Add keyword filters
          keywords.forEach(keyword => {
            query = query.or(`title.ilike.%${keyword}%,content.ilike.%${keyword}%,tags.cs.{${keyword}}`);
          });

          const { data: keywordResults, error: keywordError } = await query.limit(3);

          if (!keywordError && keywordResults?.length > 0) {
            searchResults = keywordResults;
            searchUsed = true;
          }
        }

        // Final fallback: General knowledge base entries for org
        if (searchResults.length === 0 && orgId) {
          const { data: generalResults, error: generalError } = await supabase
            .from('knowledge_base')
            .select('id, title, content, category, tags')
            .eq('org_id', orgId)
            .eq('visibility', 'internal')
            .order('created_at', { ascending: false })
            .limit(2);

          if (!generalError && generalResults?.length > 0) {
            searchResults = generalResults;
          }
        }

        // Format search results for context
        if (searchResults.length > 0) {
          knowledgeBaseInfo = searchResults.map(result => {
            const similarityText = result.similarity ? ` (${Math.round(result.similarity * 100)}% match)` : '';
            return `${result.content}\n\nSource: ${result.title} (${result.category})${similarityText}`;
          }).join('\n\n---\n\n');
        }

      } catch (searchError) {
        console.error("Knowledge base search error:", searchError);
        // Continue without knowledge base info - graceful degradation
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
      // Build role-specific system prompt
      let systemPrompt = buildRoleSpecificPrompt(context?.userRole);
      
      if (context?.module) {
        systemPrompt += `\n\nUser is currently in the ${context.module} module. Focus your response on this area.`;
      }
      
      // Enhanced organization context
      if (context?.orgType || context?.orgSector || context?.capitalTier || context?.regulatoryClassification) {
        systemPrompt += '\n\nORGANIZATION CONTEXT:';
        
        if (context.orgType) {
          systemPrompt += `\n- Organization Type: ${context.orgType}`;
          
          // Schedule II Bank specific context
          if (context.orgType === 'banking-schedule-ii') {
            systemPrompt += `
            \nSCHEDULE II BANK CONTEXT:
            You are assisting a Schedule II bank (foreign bank subsidiary operating in Canada). Focus on:
            - OSFI E-21 operational resilience requirements for foreign bank subsidiaries
            - Basel III capital and liquidity requirements as applied in Canada
            - Cross-border risk management considerations
            - Parent bank oversight and governance requirements
            - Simplified regulatory framework compared to domestic systemically important banks
            - Enhanced focus on liquidity management and funding arrangements
            - Specific attention to outsourcing arrangements with parent entities`;
          }
          
          // Credit Union specific context
          if (context.orgType === 'credit-union') {
            systemPrompt += `
            \nCREDIT UNION CONTEXT:
            You are assisting a credit union. Focus on:
            - Provincial regulatory requirements and oversight
            - Member-focused governance and cooperative principles
            - Community lending and member services priorities
            - Simplified operational risk framework appropriate for smaller institutions
            - Credit risk management for member lending
            - Deposit insurance and member protection considerations`;
          }
          
          // Schedule I Bank specific context  
          if (context.orgType === 'banking-schedule-i') {
            systemPrompt += `
            \nSCHEDULE I BANK CONTEXT:
            You are assisting a Schedule I bank (Canadian domestic bank). Focus on:
            - Comprehensive OSFI supervision and regulatory requirements
            - Full Basel III implementation including D-SIB requirements if applicable
            - Broad range of banking services and complex operational structures
            - Enhanced governance and risk management expectations
            - Detailed stress testing and capital planning requirements
            - Extensive third-party risk management for complex vendor relationships`;
          }
        }
        
        if (context.orgSector) {
          systemPrompt += `\n- Business Sector: ${context.orgSector}`;
        }
        
        if (context.capitalTier) {
          systemPrompt += `\n- Capital Tier: ${context.capitalTier}`;
          
          if (context.capitalTier === 'Tier 1') {
            systemPrompt += ' (Higher capital requirements and enhanced supervisory expectations)';
          }
        }
        
        if (context.regulatoryClassification && context.regulatoryClassification.length > 0) {
          systemPrompt += `\n- Regulatory Frameworks: ${context.regulatoryClassification.join(', ')}`;
          
          if (context.regulatoryClassification.includes('OSFI E-21')) {
            systemPrompt += `
            \nOSFI E-21 COMPLIANCE FOCUS:
            - Operational resilience framework implementation
            - Critical business service identification and impact tolerance setting
            - Comprehensive testing of business continuity arrangements
            - Enhanced third-party risk management
            - Incident management and lessons learned processes
            - Board and senior management oversight requirements`;
          }
          
          if (context.regulatoryClassification.includes('Basel III')) {
            systemPrompt += `
            \nBASEL III CONSIDERATIONS:
            - Capital adequacy and liquidity requirements
            - Operational risk capital calculations
            - Risk governance and three lines of defense
            - Stress testing and scenario analysis
            - Risk appetite framework alignment with capital planning`;
          }
        }
        
        if (context.geographicScope) {
          systemPrompt += `\n- Geographic Scope: ${context.geographicScope}`;
        }
      }
      
      if (knowledgeBaseInfo) {
        systemPrompt += `\n\nRelevant knowledge base information: ${knowledgeBaseInfo}`;
      }

    // Role-specific prompt builder
    function buildRoleSpecificPrompt(userRole?: string | null): string {
      const basePrompt = `You are ResilientFI Assistant, an expert in operational resilience, risk management, and regulatory compliance.`;
      
      switch (userRole?.toLowerCase()) {
        case 'compliance':
        case 'compliance_officer':
          return `${basePrompt}
          
          As a Compliance-focused assistant, you specialize in:
          - Regulatory compliance frameworks (OSFI E-21, Basel III, COSO)
          - Policy development and review processes
          - Regulatory reporting requirements
          - Audit preparation and findings management
          - Compliance gap analysis and remediation
          - Documentation standards and evidence collection
          
          Provide detailed compliance guidance with specific regulatory references and implementation steps.`;
          
        case 'analyst':
        case 'risk_analyst':
          return `${basePrompt}
          
          As an Analyst-focused assistant, you specialize in:
          - Data analysis and trend identification
          - Risk assessment methodologies
          - KRI development and monitoring
          - Quantitative risk modeling
          - Scenario analysis and stress testing
          - Operational metrics and reporting
          
          Provide analytical insights with specific methodologies, calculations, and data interpretation guidance.`;
          
        case 'executive':
        case 'cro':
        case 'ceo':
        case 'cfo':
          return `${basePrompt}
          
          As an Executive-focused assistant, you specialize in:
          - Strategic risk oversight and governance
          - Board reporting and risk communication
          - Regulatory relationship management
          - Enterprise risk appetite setting
          - Crisis management and business continuity
          - Risk culture and organizational change
          
          Provide executive-level insights with strategic context, business impact focus, and stakeholder considerations.`;
          
        default:
          return `${basePrompt}
          
          You specialize in:
          - OSFI guidelines (especially E-21 on operational resilience)
          - ISO 22301 Business Continuity Management
          - Operational risk management frameworks
          - Third-party risk management
          - Business impact analysis and continuity planning
          - Key Risk Indicators (KRIs) and controls
          
          Provide practical, actionable guidance tailored to financial institutions and regulated entities.`;
      }
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
      
      // Organization type specific guidance
      if (context.orgType === 'banking-schedule-ii') {
        response += "\n\n**Schedule II Bank Considerations:** Ensure alignment with OSFI E-21 requirements for foreign bank subsidiaries, including enhanced focus on cross-border risk management and parent bank oversight arrangements.";
      } else if (context.orgType === 'credit-union') {
        response += "\n\n**Credit Union Considerations:** Focus on member-centric governance and ensure compliance with provincial regulatory requirements while maintaining the cooperative principles.";
      } else if (context.orgType === 'banking-schedule-i') {
        response += "\n\n**Schedule I Bank Considerations:** Apply comprehensive OSFI supervisory expectations and full Basel III implementation requirements.";
      }
      
      // Regulatory classification specific guidance
      if (context.regulatoryClassification?.includes('OSFI E-21')) {
        response += "\n\n**OSFI E-21 Compliance:** Remember to document this within your operational resilience framework and ensure appropriate testing and validation procedures are in place.";
      }
      
      if (context.capitalTier === 'Tier 1') {
        response += "\n\n**Tier 1 Institution:** Apply enhanced risk management standards and consider higher regulatory expectations for governance and controls.";
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
