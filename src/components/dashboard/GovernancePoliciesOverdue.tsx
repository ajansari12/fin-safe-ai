
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { getOverduePolicyReviews, PolicyReview } from "@/services/dashboard-analytics-service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, FileCheck2, Clock, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export default function GovernancePoliciesOverdue() {
  const { data: overdueReviews, isLoading } = useQuery<PolicyReview[]>({
    queryKey: ['overduePolicyReviews'],
    queryFn: getOverduePolicyReviews
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileCheck2 className="h-5 w-5" />
            Governance Policies Overdue
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
          <FileCheck2 className="h-5 w-5" />
          Governance Policies Overdue
        </CardTitle>
        <div className="text-sm text-muted-foreground">
          {overdueReviews?.length || 0} policies require review
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {overdueReviews?.length === 0 ? (
            <div className="text-center p-4 text-muted-foreground">
              <FileCheck2 className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">All policies are up to date!</p>
            </div>
          ) : (
            <>
              {overdueReviews?.slice(0, 4).map((review) => (
                <div key={review.id} className="flex items-center justify-between p-3 border rounded">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{review.policy_title}</p>
                    <p className="text-xs text-muted-foreground truncate">{review.framework_title}</p>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                      <Calendar className="h-3 w-3" />
                      Due: {new Date(review.next_review_date).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant="destructive" className="text-xs">
                      {review.days_overdue}d overdue
                    </Badge>
                  </div>
                </div>
              ))}
              
              <Button variant="outline" size="sm" className="w-full" asChild>
                <Link to="/governance-framework">
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
