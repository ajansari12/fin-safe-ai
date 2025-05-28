
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { getMostSensitiveCBFs } from "@/services/dashboard-analytics-service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Shield, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const getCriticalityColor = (criticality: string) => {
  switch (criticality) {
    case 'critical': return 'bg-red-500';
    case 'high': return 'bg-orange-500';
    case 'medium': return 'bg-yellow-500';
    case 'low': return 'bg-green-500';
    default: return 'bg-gray-500';
  }
};

export default function MostSensitiveCBFs() {
  const { data: sensitiveCBFs, isLoading } = useQuery({
    queryKey: ['sensitiveCBFs'],
    queryFn: getMostSensitiveCBFs
  });

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Most Sensitive CBFs
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
          <Shield className="h-5 w-5" />
          Most Sensitive CBFs
        </CardTitle>
        <div className="text-sm text-muted-foreground">
          Lowest Maximum Tolerable Downtime
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {sensitiveCBFs?.length === 0 ? (
            <div className="text-center p-4 text-muted-foreground">
              <Shield className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No impact tolerances defined yet</p>
            </div>
          ) : (
            <>
              {sensitiveCBFs?.map((cbf, index) => (
                <div key={cbf.id} className="flex items-center justify-between p-3 border rounded">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{cbf.name}</p>
                      <p className="text-xs text-muted-foreground">{cbf.category}</p>
                    </div>
                  </div>
                  <div className="text-right space-y-1">
                    <Badge className={getCriticalityColor(cbf.criticality)}>
                      {cbf.criticality}
                    </Badge>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {cbf.max_tolerable_downtime} MTD
                    </div>
                  </div>
                </div>
              ))}
              
              <Button variant="outline" size="sm" className="w-full" asChild>
                <Link to="/impact-tolerances">
                  View All CBFs <ChevronRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
