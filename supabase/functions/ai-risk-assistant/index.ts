import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.5';

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// OSFI E-21 Knowledge Base
const OSFI_E21_KNOWLEDGE = `
OSFI E-21 Operational Risk Management Guideline Knowledge Base:

1. OPERATIONAL RISK FRAMEWORK REQUIREMENTS:
- Institutions must maintain a comprehensive operational risk management framework
- Framework must be proportional to size, complexity, and risk profile
- Must include governance, risk appetite, identification, assessment, monitoring, and reporting
- Three lines of defense model implementation required

2. RISK APPETITE STATEMENT REQUIREMENTS:
- Clear articulation of acceptable operational risk levels
- Quantitative and qualitative metrics
- Alignment with business strategy and risk capacity
- Regular review and Board approval required
- Integration with capital planning process

3. KEY RISK INDICATORS (KRI) REQUIREMENTS:
- Forward-looking indicators that provide early warning
- Appropriate thresholds and escalation procedures
- Regular monitoring and reporting to senior management
- Integration with risk appetite framework
- Validation and backtesting of KRI effectiveness

4. INCIDENT MANAGEMENT REQUIREMENTS:
- Comprehensive data collection and analysis
- Root cause analysis for significant events
- Timely reporting to appropriate stakeholders
- Lessons learned and control improvements
- Integration with business continuity planning

5. CAPITAL ADEQUACY REQUIREMENTS:
- Operational risk capital calculation methodologies
- Standardized Approach, Alternative Standardized Approach, or Advanced Measurement Approach
- Loss data collection and analysis requirements
- Scenario analysis and stress testing
- Model validation and governance

6. GOVERNANCE AND OVERSIGHT:
- Board and senior management responsibilities
- Independent risk management function
- Regular risk reporting and escalation
- Audit and validation requirements
- Staff competency and training programs

7. BUSINESS CONTINUITY PLANNING:
- Comprehensive business continuity plans
- Regular testing and validation
- Recovery time and point objectives
- Communication plans and procedures
- Third-party service provider considerations

8. THIRD-PARTY RISK MANAGEMENT:
- Due diligence and ongoing monitoring
- Contractual arrangements and SLAs
- Concentration risk management
- Exit strategies and contingency plans
- Regulatory notification requirements
`;

const SPECIALIZED_PROMPTS = {
  risk_appetite: {
    system: `You are an OSFI E-21 compliance expert specializing in risk appetite frameworks. You help Canadian financial institutions develop compliant risk appetite statements that meet regulatory requirements.`,
    context: `Focus on quantitative limits, qualitative statements, tolerance levels, and Board governance requirements per OSFI E-21.`
  },
  kri_management: {
    system: `You are an OSFI E-21 expert in Key Risk Indicators. You help institutions design effective KRI frameworks that provide early warning of operational risk issues.`,
    context: `Emphasize forward-looking indicators, appropriate thresholds, escalation procedures, and integration with risk appetite per OSFI E-21.`
  },
  incident_management: {
    system: `You are an OSFI E-21 incident management specialist. You help institutions develop comprehensive incident management processes that meet regulatory requirements.`,
    context: `Focus on data collection, root cause analysis, reporting requirements, and control improvements per OSFI E-21.`
  },
  compliance_gap: {
    system: `You are an OSFI E-21 compliance assessor. You help institutions identify and address gaps in their operational risk management frameworks.`,
    context: `Analyze current state against OSFI E-21 requirements and provide specific remediation recommendations.`
  },
  general: {
    system: `You are an expert OSFI E-21 operational risk management consultant for Canadian financial institutions. You provide specialized guidance on regulatory compliance and best practices.`,
    context: `Draw from comprehensive OSFI E-21 knowledge to provide practical, implementable advice.`
  }
};

async function getUserContext(userId: string, orgId: string) {
  const supabase = createClient(supabaseUrl!, supabaseServiceKey!);
  
  try {
    // Get user's current risk appetite statements
    const { data: riskStatements } = await supabase
      .from('risk_appetite_statements')
      .select('*')
      .eq('org_id', orgId)
      .eq('is_active', true);

    // Get KRI definitions and recent logs
    const { data: kriData } = await supabase
      .from('kri_definitions')
      .select(`
        *,
        kri_logs(actual_value, measurement_date, threshold_breached)
      `)
      .eq('org_id', orgId)
      .limit(5);

    // Get recent incidents
    const { data: incidents } = await supabase
      .from('incident_logs')
      .select('severity, category, status, created_at')
      .eq('org_id', orgId)
      .order('created_at', { ascending: false })
      .limit(10);

    // Get organizational profile
    const { data: orgProfile } = await supabase
      .from('organizational_profiles')
      .select('*')
      .eq('organization_id', orgId)
      .single();

    return {
      riskStatements: riskStatements || [],
      kriData: kriData || [],
      incidents: incidents || [],
      orgProfile: orgProfile || null
    };
  } catch (error) {
    console.error('Error fetching user context:', error);
    return null;
  }
}

function buildContextualPrompt(userContext: any, conversationType: string) {
  const prompt = SPECIALIZED_PROMPTS[conversationType] || SPECIALIZED_PROMPTS.general;
  
  let contextualInfo = `
CURRENT ORGANIZATIONAL CONTEXT:
`;

  if (userContext?.orgProfile) {
    contextualInfo += `
- Organization Type: ${userContext.orgProfile.sub_sector || 'Not specified'}
- Asset Size: ${userContext.orgProfile.asset_size || 'Not specified'}
- Employee Count: ${userContext.orgProfile.employee_count || 'Not specified'}
- Risk Maturity: ${userContext.orgProfile.risk_maturity || 'Not specified'}
- Compliance Maturity: ${userContext.orgProfile.compliance_maturity || 'Not specified'}
`;
  }

  if (userContext?.riskStatements?.length > 0) {
    contextualInfo += `
CURRENT RISK APPETITE STATEMENTS:
${userContext.riskStatements.map(stmt => 
  `- ${stmt.statement_name}: ${stmt.appetite_level} appetite for ${stmt.risk_category}`
).join('\n')}
`;
  }

  if (userContext?.kriData?.length > 0) {
    contextualInfo += `
CURRENT KRI STATUS:
${userContext.kriData.map(kri => 
  `- ${kri.name}: Target ${kri.target_value}, Warning ${kri.warning_threshold}, Critical ${kri.critical_threshold}`
).join('\n')}
`;
  }

  if (userContext?.incidents?.length > 0) {
    const recentIncidents = userContext.incidents.slice(0, 5);
    contextualInfo += `
RECENT INCIDENTS (Last 5):
${recentIncidents.map(incident => 
  `- ${incident.severity} ${incident.category} incident (${incident.status})`
).join('\n')}
`;
  }

  return {
    system: `${prompt.system}

${OSFI_E21_KNOWLEDGE}

${contextualInfo}

INSTRUCTIONS:
- Provide specific, actionable advice based on OSFI E-21 requirements
- Reference the organization's current context when relevant
- Suggest concrete next steps for compliance improvement
- Highlight any regulatory gaps or risks
- Be concise but comprehensive in your responses
- Always ground recommendations in OSFI E-21 requirements`,
    context: prompt.context
  };
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      message, 
      conversationType = 'general', 
      userId, 
      orgId,
      conversationHistory = [] 
    } = await req.json();

    if (!openAIApiKey) {
      throw new Error('OpenAI API key not configured');
    }

    // Get user context for personalized responses
    const userContext = await getUserContext(userId, orgId);
    
    // Build contextual prompt
    const promptConfig = buildContextualPrompt(userContext, conversationType);

    // Prepare conversation history
    const messages = [
      { role: 'system', content: promptConfig.system },
      ...conversationHistory.map(msg => ({
        role: msg.role,
        content: msg.content
      })),
      { role: 'user', content: message }
    ];

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: messages,
        max_tokens: 1500,
        temperature: 0.7,
        stream: false
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;

    // Log conversation for learning (optional)
    if (supabaseUrl && supabaseServiceKey && orgId) {
      const supabase = createClient(supabaseUrl, supabaseServiceKey);
      await supabase
        .from('ai_chat_logs')
        .insert({
          org_id: orgId,
          user_id: userId,
          conversation_type: conversationType,
          user_message: message,
          ai_response: aiResponse,
          context_used: userContext ? JSON.stringify(userContext) : null
        });
    }

    return new Response(JSON.stringify({ 
      response: aiResponse,
      conversationType,
      contextUsed: !!userContext
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in AI risk assistant function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      details: 'Failed to generate AI response'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});