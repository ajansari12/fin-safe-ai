import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface VendorRiskRequest {
  vendor_id: string;
  org_id: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { vendor_id, org_id }: VendorRiskRequest = await req.json();

    if (!vendor_id || !org_id) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: vendor_id and org_id' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Set up Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('Calculating risk for vendor:', vendor_id, 'in org:', org_id);

    // Get vendor profile data
    const { data: vendor, error: vendorError } = await supabase
      .from('third_party_profiles')
      .select('*')
      .eq('id', vendor_id)
      .eq('org_id', org_id)
      .single();

    if (vendorError || !vendor) {
      console.error('Vendor fetch error:', vendorError);
      return new Response(
        JSON.stringify({ error: 'Vendor not found or access denied' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      );
    }

    // Get latest vendor assessment data
    const { data: assessments } = await supabase
      .from('vendor_assessments')
      .select('*')
      .eq('vendor_profile_id', vendor_id)
      .order('assessment_date', { ascending: false })
      .limit(1);

    // Get SLA breach history from incident logs
    const { data: incidents } = await supabase
      .from('incident_logs')
      .select('severity, status, created_at')
      .ilike('description', `%${vendor.vendor_name}%`)
      .eq('org_id', org_id);

    // Get contract data
    const { data: contracts } = await supabase
      .from('vendor_contracts')
      .select('*')
      .eq('vendor_profile_id', vendor_id);

    // Calculate risk score
    const riskScore = calculateVendorRiskScore(vendor, assessments?.[0], incidents || [], contracts || []);
    const riskRating = getRiskRating(riskScore);

    console.log('Calculated risk score:', riskScore, 'rating:', riskRating);

    // Update vendor assessments with new risk rating
    if (assessments?.[0]) {
      const { error: updateError } = await supabase
        .from('vendor_assessments')
        .update({ 
          risk_rating: riskRating,
          overall_risk_score: riskScore,
          updated_at: new Date().toISOString()
        })
        .eq('id', assessments[0].id);

      if (updateError) {
        console.error('Error updating assessment:', updateError);
      }
    } else {
      // Create new assessment if none exists
      const { error: insertError } = await supabase
        .from('vendor_assessments')
        .insert({
          vendor_profile_id: vendor_id,
          org_id,
          assessment_type: 'automated',
          assessment_date: new Date().toISOString().split('T')[0],
          risk_rating: riskRating,
          overall_risk_score: riskScore,
          status: 'completed'
        });

      if (insertError) {
        console.error('Error creating assessment:', insertError);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        vendor_id,
        risk_score: riskScore,
        risk_rating: riskRating,
        factors_analyzed: {
          vendor_criticality: vendor.criticality,
          incident_count: incidents?.length || 0,
          contract_count: contracts?.length || 0,
          has_assessment: !!assessments?.[0]
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in calculate-vendor-risk function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});

// Helper functions
function calculateVendorRiskScore(vendor: any, assessment: any, incidents: any[], contracts: any[]): number {
  let totalScore = 0;
  
  // Base score from vendor criticality (30 points)
  const criticalityScores = {
    'critical': 30,
    'high': 20,
    'medium': 10,
    'low': 5
  };
  totalScore += criticalityScores[vendor.criticality] || 10;

  // Risk exposure from assessment data (30 points)
  if (assessment) {
    // Check for high-risk tags/responses
    const riskTags = assessment.risk_exposure_tags || [];
    if (riskTags.includes('cloud')) totalScore += 5;
    if (riskTags.includes('pii')) totalScore += 8;
    if (riskTags.includes('financial_integration')) totalScore += 10;
    if (riskTags.includes('critical_infrastructure')) totalScore += 7;
    
    // Assessment scores (if available)
    if (assessment.security_score && assessment.security_score < 70) totalScore += 10;
    if (assessment.compliance_score && assessment.compliance_score < 70) totalScore += 8;
  }

  // SLA breach history (40 points)
  const criticalIncidents = incidents.filter(i => i.severity === 'critical').length;
  const highIncidents = incidents.filter(i => i.severity === 'high').length;
  
  totalScore += criticalIncidents * 15; // 15 points per critical incident
  totalScore += highIncidents * 8; // 8 points per high incident
  
  // Recent incidents (last 6 months) get higher weight
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  const recentIncidents = incidents.filter(i => new Date(i.created_at) > sixMonthsAgo);
  totalScore += recentIncidents.length * 5;

  // Contract risk factors
  if (contracts.length > 0) {
    const contract = contracts[0];
    // Check contract expiry
    if (contract.end_date) {
      const daysToExpiry = Math.ceil((new Date(contract.end_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
      if (daysToExpiry <= 30) totalScore += 10; // Contract expiring soon
      else if (daysToExpiry <= 90) totalScore += 5;
    }
  }

  // Cap the score at 100
  return Math.min(totalScore, 100);
}

function getRiskRating(score: number): string {
  if (score >= 70) return 'High';
  if (score >= 40) return 'Medium';
  return 'Low';
}