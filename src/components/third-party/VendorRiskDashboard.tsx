
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, TrendingUp, Clock, CheckCircle } from "lucide-react";
import { calculateAllVendorRiskScores, VendorRiskScore } from "@/services/risk-scoring-service";

const VendorRiskDashboard: React.FC = () => {
  const { data: riskScores = [], isLoading } = useQuery({
    queryKey: ['vendorRiskScores'],
    queryFn: calculateAllVendorRiskScores,
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });

  const riskDistribution = riskScores.reduce((acc, vendor) => {
    acc[vendor.risk_level] = (acc[vendor.risk_level] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const averageRiskScore = riskScores.length > 0 
    ? riskScores.reduce((sum, vendor) => sum + vendor.risk_score, 0) / riskScores.length 
    : 0;

  const highRiskVendors = riskScores.filter(v => v.risk_score >= 4);
  const needsAttention = riskScores.filter(v => v.recommendations.length > 1);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="h-20 animate-pulse bg-gray-100 rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Risk Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Vendors</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{riskScores.length}</div>
            <p className="text-xs text-muted-foreground">
              Active vendor profiles
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Risk Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageRiskScore.toFixed(1)}</div>
            <Progress value={(averageRiskScore / 5) * 100} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              Out of 5.0 maximum
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Risk Vendors</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{highRiskVendors.length}</div>
            <p className="text-xs text-muted-foreground">
              Require immediate attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Needs Attention</CardTitle>
            <Clock className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{needsAttention.length}</div>
            <p className="text-xs text-muted-foreground">
              Multiple recommendations
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Risk Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Risk Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {(['Low', 'Medium', 'High', 'Critical'] as const).map((level) => (
              <div key={level} className="text-center">
                <div className={`text-2xl font-bold ${
                  level === 'Low' ? 'text-green-600' :
                  level === 'Medium' ? 'text-yellow-600' :
                  level === 'High' ? 'text-orange-600' : 'text-red-600'
                }`}>
                  {riskDistribution[level] || 0}
                </div>
                <Badge variant={
                  level === 'Low' ? 'secondary' :
                  level === 'Medium' ? 'default' :
                  level === 'High' ? 'default' : 'destructive'
                }>
                  {level} Risk
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Top Risk Vendors */}
      {highRiskVendors.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              High Risk Vendors
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {highRiskVendors.slice(0, 5).map((vendor) => (
                <div key={vendor.vendor_id} className="flex items-center justify-between p-3 border rounded">
                  <div className="flex-1">
                    <p className="font-medium">{vendor.vendor_name}</p>
                    <p className="text-sm text-muted-foreground">
                      {vendor.recommendations[0]}
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge className={vendor.risk_color}>
                      {vendor.risk_level}
                    </Badge>
                    <div className="text-sm text-muted-foreground mt-1">
                      Score: {vendor.risk_score}/5
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default VendorRiskDashboard;
