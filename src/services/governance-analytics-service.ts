
import { supabase } from "@/integrations/supabase/client";

export interface PolicyReview {
  id: string;
  policy_title: string;
  framework_title: string;
  next_review_date: string;
  days_overdue: number;
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
