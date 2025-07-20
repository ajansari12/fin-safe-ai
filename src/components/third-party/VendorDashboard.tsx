
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  AlertTriangle, 
  Clock, 
  TrendingUp,
  Calendar,
  FileText,
  Shield,
  Plus
} from "lucide-react";

const VendorDashboard = () => {
  // Mock data for demonstration
  const dashboardStats = {
    totalVendors: 47,
    criticalVendors: 12,
    contractsExpiring: 5,
    pendingAssessments: 8,
    avgRiskScore: 6.2
  };

  const criticalVendors = [
    {
      id: 1,
      name: "CloudTech Solutions",
      service: "Cloud Infrastructure",
      riskRating: "high",
      contractExpiry: "2024-03-15",
      lastAssessment: "2024-01-10",
      status: "active"
    },
    {
      id: 2,
      name: "DataSecure Inc.",
      service: "Data Processing",
      riskRating: "medium",
      contractExpiry: "2024-06-30",
      lastAssessment: "2024-01-05",
      status: "under_review"
    },
    {
      id: 3,
      name: "PaymentGateway Pro",
      service: "Payment Processing",
      riskRating: "critical",
      contractExpiry: "2024-04-20",
      lastAssessment: "2024-01-12",
      status: "active"
    }
  ];

  const expiringContracts = [
    {
      vendor: "CloudTech Solutions",
      service: "Infrastructure",
      expiryDate: "2024-03-15",
      daysLeft: 45,
      renewalStatus: "in_progress"
    },
    {
      vendor: "SecureComms Ltd",
      service: "Communications",
      expiryDate: "2024-04-01", 
      daysLeft: 62,
      renewalStatus: "pending"
    }
  ];

  const getRiskBadgeColor = (rating: string) => {
    switch (rating) {
      case "critical": return "destructive";
      case "high": return "destructive"; 
      case "medium": return "secondary";
      case "low": return "outline";
      default: return "outline";
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Vendors</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats.totalVendors}</div>
            <p className="text-xs text-muted-foreground">
              Active relationships
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Critical Vendors</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{dashboardStats.criticalVendors}</div>
            <p className="text-xs text-muted-foreground">
              High/Critical risk rating
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Contracts Expiring</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{dashboardStats.contractsExpiring}</div>
            <p className="text-xs text-muted-foreground">
              Next 90 days
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Assessments</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats.pendingAssessments}</div>
            <p className="text-xs text-muted-foreground">
              Due for review
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Risk Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats.avgRiskScore}</div>
            <p className="text-xs text-muted-foreground">
              Out of 10
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Critical Vendors */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Critical Vendors</CardTitle>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Vendor
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {criticalVendors.map((vendor) => (
              <div key={vendor.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-4">
                  <Badge variant={getRiskBadgeColor(vendor.riskRating)}>
                    {vendor.riskRating}
                  </Badge>
                  <div>
                    <h4 className="font-medium">{vendor.name}</h4>
                    <p className="text-sm text-muted-foreground">{vendor.service}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm">Contract expires: {vendor.contractExpiry}</p>
                  <p className="text-sm text-muted-foreground">
                    Last assessed: {vendor.lastAssessment}
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  View Details
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Expiring Contracts */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Expiring Contracts</CardTitle>
          <Button variant="outline">
            <Calendar className="mr-2 h-4 w-4" />
            View Calendar
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {expiringContracts.map((contract, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-medium">{contract.vendor}</h4>
                  <p className="text-sm text-muted-foreground">{contract.service}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium">{contract.daysLeft} days</p>
                  <p className="text-sm text-muted-foreground">until expiry</p>
                </div>
                <div className="text-right">
                  <p className="text-sm">{contract.expiryDate}</p>
                  <Badge variant="outline">
                    {contract.renewalStatus}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Risk Heat Map Placeholder */}
      <Card>
        <CardHeader>
          <CardTitle>Vendor Risk Heat Map</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground">
              Interactive risk heat map visualization will be implemented here
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default VendorDashboard;
