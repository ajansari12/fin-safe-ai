
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  Server, 
  Cloud, 
  Database, 
  Monitor, 
  Smartphone,
  Plus,
  Search,
  Filter,
  MoreVertical,
  AlertTriangle,
  CheckCircle
} from "lucide-react";

const ITAssetInventory = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");

  // Mock IT assets data
  const assets = [
    {
      id: "AST-001",
      name: "Production Web Server",
      type: "hardware",
      classification: "critical",
      owner: "IT Operations",
      location: "Data Center A",
      riskRating: "high",
      vulnerabilities: 3,
      status: "active",
      lastAssessment: "2024-01-10",
      nextAssessment: "2024-04-10"
    },
    {
      id: "AST-002", 
      name: "Customer Database",
      type: "data",
      classification: "critical",
      owner: "Data Management",
      location: "Cloud - AWS",
      riskRating: "medium",
      vulnerabilities: 1,
      status: "active",
      lastAssessment: "2024-01-08",
      nextAssessment: "2024-04-08"
    },
    {
      id: "AST-003",
      name: "CRM Application",
      type: "software",
      classification: "important",
      owner: "Sales Operations",
      location: "Cloud - Azure",
      riskRating: "low",
      vulnerabilities: 0,
      status: "active",
      lastAssessment: "2024-01-05",
      nextAssessment: "2024-07-05"
    },
    {
      id: "AST-004",
      name: "Backup Storage Array",
      type: "hardware",
      classification: "standard",
      owner: "IT Operations",
      location: "Data Center B",
      riskRating: "low",
      vulnerabilities: 2,
      status: "active",
      lastAssessment: "2024-01-01",
      nextAssessment: "2024-04-01"
    }
  ];

  const getAssetIcon = (type: string) => {
    switch (type) {
      case "hardware": return <Server className="h-4 w-4" />;
      case "software": return <Monitor className="h-4 w-4" />;
      case "data": return <Database className="h-4 w-4" />;
      case "cloud_service": return <Cloud className="h-4 w-4" />;
      case "network": return <Smartphone className="h-4 w-4" />;
      default: return <Server className="h-4 w-4" />;
    }
  };

  const getClassificationColor = (classification: string) => {
    switch (classification) {
      case "critical": return "destructive";
      case "important": return "secondary";
      case "standard": return "outline";
      default: return "outline";
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "high": return "bg-red-100 text-red-800";
      case "medium": return "bg-yellow-100 text-yellow-800";
      case "low": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const filteredAssets = assets.filter(asset => {
    const matchesSearch = asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         asset.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = selectedFilter === "all" || 
                         asset.classification === selectedFilter ||
                         asset.type === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">IT Asset Inventory</h2>
          <p className="text-muted-foreground">
            Comprehensive inventory and classification of IT assets
          </p>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add Asset
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Assets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,247</div>
            <div className="text-sm text-muted-foreground">+12 this month</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Critical Assets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">89</div>
            <div className="text-sm text-muted-foreground">7.1% of total</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">High Risk</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">23</div>
            <div className="text-sm text-muted-foreground">Require attention</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Compliance Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">96%</div>
            <div className="text-sm text-muted-foreground">Above target</div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Asset Management</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search assets..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 w-64"
                />
              </div>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4 mr-2" />
                Filter
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredAssets.map((asset) => (
              <div key={asset.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    {getAssetIcon(asset.type)}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <div className="font-medium">{asset.name}</div>
                      <Badge variant={getClassificationColor(asset.classification)}>
                        {asset.classification}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">{asset.id}</div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>Owner: {asset.owner}</span>
                      <span>Location: {asset.location}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className={getRiskColor(asset.riskRating)}>
                        {asset.riskRating} risk
                      </Badge>
                      {asset.vulnerabilities > 0 ? (
                        <Badge variant="destructive" className="flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          {asset.vulnerabilities}
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="flex items-center gap-1">
                          <CheckCircle className="h-3 w-3" />
                          Clean
                        </Badge>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Next assessment: {asset.nextAssessment}
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ITAssetInventory;
