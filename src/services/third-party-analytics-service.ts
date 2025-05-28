
import { supabase } from "@/integrations/supabase/client";

export interface ThirdPartyReview {
  id: string;
  vendor_name: string;
  review_type: string;
  risk_rating: string;
  next_review_date: string;
  status: string;
  days_until_due: number;
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
