import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface RiskFeedRequest {
  feedType: 'cyber_threats' | 'regulatory_updates' | 'market_risks' | 'operational_incidents';
  region?: string;
  sector?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { feedType, region = 'global', sector = 'financial' }: RiskFeedRequest = await req.json();

    // Set up Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Simulate external risk feed data (in production, integrate with real APIs)
    const riskData = await generateRiskFeedData(feedType, region, sector);

    // Store risk intelligence data
    for (const item of riskData.items) {
      await supabase.from('risk_intelligence_feeds').insert({
        feed_type: feedType,
        region,
        sector,
        title: item.title,
        description: item.description,
        severity: item.severity,
        source: item.source,
        published_at: item.published_at,
        risk_category: item.risk_category,
        tags: item.tags,
        created_at: new Date().toISOString()
      });
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        feedType,
        itemCount: riskData.items.length,
        lastUpdated: new Date().toISOString(),
        data: riskData
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    );

  } catch (error) {
    console.error('Risk feed error:', error);

    return new Response(
      JSON.stringify({ 
        error: 'Failed to fetch risk feed data', 
        details: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    );
  }
});

async function generateRiskFeedData(feedType: string, region: string, sector: string) {
  // In production, this would integrate with real risk intelligence APIs
  // such as FireEye, IBM X-Force, Recorded Future, etc.
  
  const baseData = {
    feedType,
    region,
    sector,
    timestamp: new Date().toISOString(),
    items: [] as any[]
  };

  switch (feedType) {
    case 'cyber_threats':
      baseData.items = [
        {
          title: "New Banking Trojan Targeting Financial Institutions",
          description: "Security researchers have identified a new banking trojan specifically targeting financial institutions in North America. The malware uses sophisticated social engineering techniques to bypass multi-factor authentication.",
          severity: "high",
          source: "Cyber Threat Intelligence",
          published_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
          risk_category: "cybersecurity",
          tags: ["malware", "banking", "social-engineering", "mfa-bypass"]
        },
        {
          title: "Critical Vulnerability in Popular Banking Software",
          description: "A critical vulnerability has been discovered in widely-used core banking software that could allow unauthorized access to customer data. Immediate patching is recommended.",
          severity: "critical",
          source: "Security Advisory",
          published_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
          risk_category: "technology",
          tags: ["vulnerability", "core-banking", "data-breach", "patch-required"]
        },
        {
          title: "Ransomware Campaign Targeting Financial Services",
          description: "A coordinated ransomware campaign is actively targeting financial services organizations, with several institutions already affected. The attackers are demanding cryptocurrency payments.",
          severity: "high",
          source: "Industry Alert",
          published_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), // 12 hours ago
          risk_category: "cybersecurity",
          tags: ["ransomware", "financial-services", "cryptocurrency", "extortion"]
        }
      ];
      break;

    case 'regulatory_updates':
      baseData.items = [
        {
          title: "OSFI Updates Operational Resilience Guidelines",
          description: "The Office of the Superintendent of Financial Institutions has published updated guidance on operational resilience expectations, with new requirements for business continuity testing and third-party risk management.",
          severity: "medium",
          source: "OSFI",
          published_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
          risk_category: "regulatory",
          tags: ["osfi", "operational-resilience", "business-continuity", "third-party-risk"]
        },
        {
          title: "New Capital Requirements for Operational Risk",
          description: "Financial regulators have announced new capital requirement calculations for operational risk, requiring enhanced data collection and reporting capabilities.",
          severity: "high",
          source: "Regulatory Authority",
          published_at: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(), // 2 days ago
          risk_category: "regulatory",
          tags: ["capital-requirements", "operational-risk", "data-collection", "reporting"]
        }
      ];
      break;

    case 'market_risks':
      baseData.items = [
        {
          title: "Market Volatility Increases Operational Risk Exposure",
          description: "Recent market volatility has led to increased trading volumes and system stress, potentially exposing financial institutions to operational risks including system failures and settlement delays.",
          severity: "medium",
          source: "Market Intelligence",
          published_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
          risk_category: "market",
          tags: ["market-volatility", "trading-volume", "system-stress", "settlement-risk"]
        },
        {
          title: "Interest Rate Changes Impact Risk Models",
          description: "Significant interest rate movements are affecting risk model performance, requiring institutions to review and potentially recalibrate their operational risk assessments.",
          severity: "medium",
          source: "Risk Analytics",
          published_at: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(), // 18 hours ago
          risk_category: "market",
          tags: ["interest-rates", "risk-models", "model-risk", "recalibration"]
        }
      ];
      break;

    case 'operational_incidents':
      baseData.items = [
        {
          title: "Major Cloud Provider Outage Affects Financial Services",
          description: "A significant outage at a major cloud service provider has disrupted operations for multiple financial institutions, highlighting the importance of cloud resilience and backup strategies.",
          severity: "high",
          source: "Industry Monitor",
          published_at: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(), // 8 hours ago
          risk_category: "technology",
          tags: ["cloud-outage", "service-disruption", "vendor-risk", "business-continuity"]
        },
        {
          title: "Payment System Disruption in Financial Network",
          description: "A technical issue in a major payment processing network caused transaction delays and failures, affecting customer services across multiple institutions.",
          severity: "medium",
          source: "Payment Networks",
          published_at: new Date(Date.now() - 14 * 60 * 60 * 1000).toISOString(), // 14 hours ago
          risk_category: "operational",
          tags: ["payment-system", "transaction-delays", "customer-impact", "network-failure"]
        }
      ];
      break;
  }

  return baseData;
}