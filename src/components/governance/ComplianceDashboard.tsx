
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getComplianceMetricsByOrgId } from "@/services/governance-service";
import { ComplianceMetric } from "@/pages/governance/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer,
  Legend,
  Tooltip
} from "recharts";
import { AlertTriangle, CheckCircle, Clock } from "lucide-react";

export default function ComplianceDashboard() {
  const { profile } = useAuth();
  const [metrics, setMetrics] = useState<ComplianceMetric[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    async function loadMetrics() {
      if (!profile?.organization_id) return;
      
      setIsLoading(true);
      try {
        const data = await getComplianceMetricsByOrgId(profile.organization_id);
        setMetrics(data);
      } catch (error) {
        console.error("Error loading compliance metrics:", error);
      } finally {
        setIsLoading(false);
      }
    }
    
    loadMetrics();
  }, [profile]);
  
  // Calculate overall compliance statistics
  const totalPolicies = metrics.reduce((sum, metric) => sum + metric.total_policies, 0);
  const activePolicies = metrics.reduce((sum, metric) => sum + metric.active_policies, 0);
  const policiesNeedingReview = metrics.reduce((sum, metric) => sum + metric.policies_needing_review, 0);
  const policiesUpToDate = metrics.reduce((sum, metric) => sum + metric.policies_up_to_date, 0);
  
  // Calculate compliance percentage
  const compliancePercentage = totalPolicies > 0
    ? Math.round((policiesUpToDate / totalPolicies) * 100)
    : 0;
  
  // Format data for pie chart
  const statusData = [
    { name: "Up to Date", value: policiesUpToDate, color: "#10b981" },
    { name: "Needs Review", value: policiesNeedingReview, color: "#f59e0b" },
    { name: "Inactive", value: totalPolicies - activePolicies, color: "#6b7280" },
  ];
  
  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-gray-200 rounded w-1/3 animate-pulse"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="h-32 bg-gray-100 rounded animate-pulse"></div>
          <div className="h-32 bg-gray-100 rounded animate-pulse"></div>
          <div className="h-32 bg-gray-100 rounded animate-pulse"></div>
        </div>
        <div className="h-64 bg-gray-100 rounded animate-pulse"></div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Governance Compliance Dashboard</h2>
        <p className="text-muted-foreground">
          Monitor and manage your governance policy compliance
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base text-muted-foreground">Overall Compliance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center">
              <div className="text-3xl font-bold mb-2">{compliancePercentage}%</div>
              <Progress value={compliancePercentage} className="w-full" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base text-muted-foreground">Total Policies</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-3xl font-bold">{totalPolicies}</div>
              <div className="flex space-x-4">
                <div className="flex items-center">
                  <div className="h-3 w-3 rounded-full bg-emerald-500 mr-2"></div>
                  <span className="text-sm">{activePolicies} Active</span>
                </div>
                <div className="flex items-center">
                  <div className="h-3 w-3 rounded-full bg-gray-400 mr-2"></div>
                  <span className="text-sm">{totalPolicies - activePolicies} Inactive</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base text-muted-foreground">Review Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-500" />
                <span className="text-sm font-medium">{policiesUpToDate} Up to date</span>
              </div>
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                <span className="text-sm font-medium">{policiesNeedingReview} Need review</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle>Policy Compliance by Framework</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => [`${value} Policies`, '']}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-medium">Framework Breakdown</h4>
              {metrics.map((metric) => (
                <div key={metric.framework_id} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="font-medium">{metric.framework_title}</div>
                    <div className="text-sm text-muted-foreground">
                      {metric.policies_up_to_date} / {metric.total_policies} Compliant
                    </div>
                  </div>
                  <Progress 
                    value={metric.total_policies > 0 
                      ? (metric.policies_up_to_date / metric.total_policies) * 100
                      : 0
                    } 
                    className="h-2"
                  />
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
      
      {metrics.length === 0 && (
        <div className="text-center p-8 border rounded border-dashed">
          <Clock className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-medium mb-1">No compliance data available</h3>
          <p className="text-gray-500 mb-4 max-w-md mx-auto">
            Upload governance policies and set review cycles to start tracking compliance.
          </p>
        </div>
      )}
    </div>
  );
}
