
import { supabase } from "@/integrations/supabase/client";

export interface IncidentAnalytics {
  total: number;
  unresolved: number;
  bySeverity: Record<string, number>;
  recent: Array<{
    id: string;
    title: string;
    severity: string;
    status: string;
    reported_at: string;
  }>;
}

export interface KRIBreach {
  date: string;
  breaches: number;
  critical: number;
  warning: number;
}

export interface PolicyReview {
  id: string;
  policy_title: string;
  framework_title: string;
  next_review_date: string;
  days_overdue: number;
}

export interface ThirdPartyReview {
  id: string;
  vendor_name: string;
  review_type: string;
  risk_rating: string;
  next_review_date: string;
  status: string;
  days_until_due: number;
}

export interface SensitiveCBF {
  id: string;
  name: string;
  max_tolerable_downtime: string;
  category: string;
  criticality: string;
}

export async function getIncidentAnalytics(): Promise<IncidentAnalytics> {
  const { data: incidents, error } = await supabase
    .from('incident_logs')
    .select('*')
    .order('reported_at', { ascending: false });

  if (error) {
    console.error('Error fetching incidents:', error);
    throw error;
  }

  const unresolved = incidents?.filter(i => i.status !== 'resolved' && i.status !== 'closed').length || 0;
  
  const bySeverity = incidents?.reduce((acc, incident) => {
    acc[incident.severity] = (acc[incident.severity] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  const recent = incidents?.slice(0, 5).map(incident => ({
    id: incident.id,
    title: incident.title,
    severity: incident.severity,
    status: incident.status,
    reported_at: incident.reported_at
  })) || [];

  return {
    total: incidents?.length || 0,
    unresolved,
    bySeverity,
    recent
  };
}

export async function getKRIBreaches(): Promise<KRIBreach[]> {
  const { data: kriLogs, error } = await supabase
    .from('kri_logs')
    .select('measurement_date, threshold_breached')
    .gte('measurement_date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
    .order('measurement_date', { ascending: true });

  if (error) {
    console.error('Error fetching KRI logs:', error);
    throw error;
  }

  // Group by date and count breaches
  const groupedData = kriLogs?.reduce((acc, log) => {
    const date = log.measurement_date;
    if (!acc[date]) {
      acc[date] = { breaches: 0, critical: 0, warning: 0 };
    }
    
    if (log.threshold_breached === 'critical') {
      acc[date].breaches++;
      acc[date].critical++;
    } else if (log.threshold_breached === 'warning') {
      acc[date].breaches++;
      acc[date].warning++;
    }
    
    return acc;
  }, {} as Record<string, { breaches: number; critical: number; warning: number }>) || {};

  return Object.entries(groupedData).map(([date, data]) => ({
    date,
    ...data
  }));
}

export async function getOverduePolicyReviews(): Promise<PolicyReview[]> {
  try {
    // Get current user's organization
    const { data: profile } = await supabase
      .from('profiles')
      .select('organization_id')
      .eq('id', (await supabase.auth.getUser()).data.user?.id)
      .single();

    if (!profile?.organization_id) {
      return [];
    }

    // Query overdue reviews directly
    const { data: overdueReviews, error } = await supabase
      .from('governance_review_schedule')
      .select(`
        id,
        policy_id,
        next_review_date,
        governance_policies!inner (
          id,
          title,
          framework_id,
          status,
          governance_frameworks!inner (
            title,
            org_id
          )
        )
      `)
      .eq('governance_policies.governance_frameworks.org_id', profile.organization_id)
      .lt('next_review_date', new Date().toISOString())
      .in('governance_policies.status', ['active', 'approved']);

    if (error) {
      throw error;
    }

    return (overdueReviews || []).map(review => ({
      id: review.id,
      policy_title: review.governance_policies.title,
      framework_title: review.governance_policies.governance_frameworks.title,
      next_review_date: review.next_review_date,
      days_overdue: Math.floor((new Date().getTime() - new Date(review.next_review_date).getTime()) / (1000 * 60 * 60 * 24))
    }));
  } catch (error) {
    console.error('Error fetching overdue policy reviews:', error);
    return [];
  }
}

export async function getThirdPartyReviewsDue(): Promise<ThirdPartyReview[]> {
  try {
    const nextMonth = new Date();
    nextMonth.setDate(nextMonth.getDate() + 30);

    const { data: reviews, error } = await supabase
      .from('third_party_reviews')
      .select('*')
      .lte('next_review_date', nextMonth.toISOString().split('T')[0])
      .order('next_review_date', { ascending: true });

    if (error) {
      throw error;
    }

    return reviews?.map(review => ({
      id: review.id,
      vendor_name: review.vendor_name,
      review_type: review.review_type,
      risk_rating: review.risk_rating,
      next_review_date: review.next_review_date,
      status: review.status,
      days_until_due: Math.floor((new Date(review.next_review_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    })) || [];
  } catch (error) {
    console.error('Error fetching third party reviews due:', error);
    return [];
  }
}

export async function getMostSensitiveCBFs(): Promise<SensitiveCBF[]> {
  try {
    const { data: profile } = await supabase
      .from('profiles')
      .select('organization_id')
      .eq('id', (await supabase.auth.getUser()).data.user?.id)
      .single();

    if (!profile?.organization_id) {
      return [];
    }

    const { data, error } = await supabase
      .from('business_functions')
      .select(`
        id,
        name,
        category,
        criticality,
        impact_tolerances!inner (
          max_tolerable_downtime
        )
      `)
      .eq('org_id', profile.organization_id)
      .in('criticality', ['critical', 'high'])
      .limit(10);

    if (error) {
      throw error;
    }

    return data?.map(item => ({
      id: item.id,
      name: item.name,
      category: item.category,
      criticality: item.criticality,
      max_tolerable_downtime: Array.isArray(item.impact_tolerances) 
        ? item.impact_tolerances[0]?.max_tolerable_downtime || 'Unknown'
        : item.impact_tolerances?.max_tolerable_downtime || 'Unknown'
    })) || [];
  } catch (error) {
    console.error('Error fetching most sensitive CBFs:', error);
    return [];
  }
}

// KRI Breaches Chart Data
export async function getKRIBreachesData() {
  try {
    const { data: profile } = await supabase
      .from('profiles')
      .select('organization_id')
      .eq('id', (await supabase.auth.getUser()).data.user?.id)
      .single();

    if (!profile?.organization_id) {
      return [];
    }

    // Get KRI breaches for the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data, error } = await supabase
      .from('kri_logs')
      .select(`
        measurement_date,
        threshold_breached,
        kri_definitions!inner (
          threshold_id,
          risk_thresholds!inner (
            statement_id,
            risk_appetite_statements!inner (
              org_id
            )
          )
        )
      `)
      .eq('kri_definitions.risk_thresholds.risk_appetite_statements.org_id', profile.organization_id)
      .gte('measurement_date', thirtyDaysAgo.toISOString().split('T')[0])
      .not('threshold_breached', 'is', null);

    if (error) {
      throw error;
    }

    // Group by date and count breaches
    const dateMap = new Map();

    data?.forEach(entry => {
      const date = entry.measurement_date;
      if (!dateMap.has(date)) {
        dateMap.set(date, {
          date,
          total: 0,
          critical: 0,
          warning: 0
        });
      }
      
      const dayData = dateMap.get(date);
      dayData.total++;
      
      if (entry.threshold_breached === 'critical') {
        dayData.critical++;
      } else if (entry.threshold_breached === 'warning') {
        dayData.warning++;
      }
    });

    return Array.from(dateMap.values()).sort((a, b) => a.date.localeCompare(b.date));
  } catch (error) {
    console.error('Error fetching KRI breaches data:', error);
    return [];
  }
}

// Unresolved Incidents Count
export async function getUnresolvedIncidentsCount() {
  try {
    const { data, error } = await supabase
      .from('incident_logs')
      .select('id')
      .neq('status', 'resolved');

    if (error) {
      throw error;
    }

    return data?.length || 0;
  } catch (error) {
    console.error('Error fetching unresolved incidents:', error);
    return 0;
  }
}
