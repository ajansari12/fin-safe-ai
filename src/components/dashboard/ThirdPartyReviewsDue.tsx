
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { getThirdPartyReviewsDue } from "@/services/dashboard-analytics-service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Users, Clock, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const getRiskColor = (risk: string) => {
  switch (risk) {
    case 'critical': return 'bg-red-500';
    case 'high': return 'bg-orange-500';
    case 'medium': return 'bg-yellow-500';
    case 'low': return 'bg-green-500';
    default: return 'bg-gray-500';
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case 'overdue': return 'destructive';
    case 'pending': return 'secondary';
    case 'in_progress': return 'default';
    case 'completed': return 'outline';
    default: return 'secondary';
  }
};

export default function ThirdPartyReviewsDue() {
  const { data: reviews, isLoading } = useQuery({
    queryKey: ['thirdPartyReviewsDue'],
    queryFn: getThirdPartyReviewsDue
  });

  const overdueCount = reviews?.filter(r => r.days_until_due < 0).length || 0;
  const upcomingCount = reviews?.filter(r => r.days_until_due >= 0 && r.days_until_due <= 7).length || 0;

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Third-Party Reviews Due
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="h-32 animate-pulse bg-gray-100 rounded" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Third-Party Reviews Due
        </CardTitle>
        <div className="flex gap-4 text-sm">
          <span className="text-red-600">{overdueCount} overdue</span>
          <span className="text-amber-600">{upcomingCount} this week</span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {reviews?.length === 0 ? (
            <div className="text-center p-4 text-muted-foreground">
              <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No reviews due in the next 30 days</p>
            </div>
          ) : (
            <>
              {reviews?.slice(0, 4).map((review) => (
                <div key={review.id} className="flex items-center justify-between p-3 border rounded">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-medium truncate">{review.vendor_name}</p>
                      <Badge className={getRiskColor(review.risk_rating)} variant="secondary">
                        {review.risk_rating}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{review.review_type}</p>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(review.next_review_date).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="text-right space-y-1">
                    <Badge variant={getStatusColor(review.status)}>
                      {review.status.replace('_', ' ')}
                    </Badge>
                    <div className="text-xs text-muted-foreground">
                      {review.days_until_due < 0 
                        ? `${Math.abs(review.days_until_due)}d overdue`
                        : `${review.days_until_due}d left`
                      }
                    </div>
                  </div>
                </div>
              ))}
              
              <Button variant="outline" size="sm" className="w-full" asChild>
                <Link to="/third-party-risk">
                  Manage Reviews <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
