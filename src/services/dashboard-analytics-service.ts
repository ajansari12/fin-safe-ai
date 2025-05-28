
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
  const { data: reviews, error } = await supabase
    .from('governance_review_schedule')
    .select(`
      id,
      next_review_date,
      governance_policies!inner(title, governance_frameworks!inner(title))
    `)
    .lt('next_review_date', new Date().toISOString())
    .order('next_review_date', { ascending: true });

  if (error) {
    console.error('Error fetching overdue reviews:', error);
    throw error;
  }

  return reviews?.map(review => ({
    id: review.id,
    policy_title: review.governance_policies?.title || 'Unknown Policy',
    framework_title: review.governance_policies?.governance_frameworks?.title || 'Unknown Framework',
    next_review_date: review.next_review_date,
    days_overdue: Math.floor((Date.now() - new Date(review.next_review_date).getTime()) / (1000 * 60 * 60 * 24))
  })) || [];
}

export async function getThirdPartyReviewsDue(): Promise<ThirdPartyReview[]> {
  const { data: reviews, error } = await supabase
    .from('third_party_reviews')
    .select('*')
    .lte('next_review_date', new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
    .order('next_review_date', { ascending: true });

  if (error) {
    console.error('Error fetching third party reviews:', error);
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
}

export async function getMostSensitiveCBFs(): Promise<SensitiveCBF[]> {
  const { data: tolerances, error } = await supabase
    .from('impact_tolerances')
    .select(`
      id,
      max_tolerable_downtime,
      business_functions!inner(id, name, category, criticality)
    `)
    .eq('status', 'published')
    .order('max_tolerable_downtime', { ascending: true });

  if (error) {
    console.error('Error fetching sensitive CBFs:', error);
    throw error;
  }

  return tolerances?.slice(0, 5).map(tolerance => ({
    id: tolerance.business_functions?.id || '',
    name: tolerance.business_functions?.name || 'Unknown Function',
    max_tolerable_downtime: tolerance.max_tolerable_downtime,
    category: tolerance.business_functions?.category || 'Unknown',
    criticality: tolerance.business_functions?.criticality || 'Unknown'
  })) || [];
}
