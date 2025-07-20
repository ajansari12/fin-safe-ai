
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Shield, 
  Search,
  TrendingUp,
  Globe,
  AlertTriangle,
  Eye,
  Activity,
  Calendar,
  MapPin
} from "lucide-react";

const ThreatIntelligence = () => {
  const [searchTerm, setSearchTerm] = useState("");

  // Mock threat intelligence data
  const threats = [
    {
      id: "THR-2024-001",
      name: "APT29 Cozy Bear",
      type: "apt",
      severity: "critical",
      likelihood: "high",
      description: "Russian state-sponsored group targeting financial institutions",
      firstSeen: "2024-01-10",
      lastSeen: "2024-01-14",
      affectedSectors: ["Financial Services", "Government"],
      indicators: [
        { type: "IP", value: "192.168.1.100", confidence: "high" },
        { type: "Domain", value: "malicious-domain.com", confidence: "medium" },
        { type: "Hash", value: "d41d8cd98f00b204e9800998ecf8427e", confidence: "high" }
      ],
      mitigations: ["Monitor for IOCs", "Update threat signatures", "Enhance email filtering"],
      source: "Government Intelligence",
      status: "active"
    },
    {
      id: "THR-2024-002", 
      name: "Ransomware Campaign - LockBit 3.0",
      type: "malware",
      severity: "high",
      likelihood: "medium",
      description: "Latest variant of LockBit ransomware targeting healthcare and finance",
      firstSeen: "2024-01-08",
      lastSeen: "2024-01-12",
      affectedSectors: ["Healthcare", "Financial Services"],
      indicators: [
        { type: "Hash", value: "e3b0c44298fc1c149afbf4c8996fb924", confidence: "high" },
        { type: "Registry", value: "HKEY_LOCAL_MACHINE\\Software\\LockBit", confidence: "high" }
      ],
      mitigations: ["Backup verification", "Patch management", "Network segmentation"],
      source: "Threat Research Team",
      status: "monitoring"
    },
    {
      id: "THR-2024-003",
      name: "Phishing Campaign - Bank Impersonation",
      type: "phishing",
      severity: "medium",
      likelihood: "high",
      description: "Sophisticated phishing emails impersonating major banks",
      firstSeen: "2024-01-05",
      lastSeen: "2024-01-15",
      affectedSectors: ["Financial Services", "Retail"],
      indicators: [
        { type: "Domain", value: "secure-bank-login.net", confidence: "high" },
        { type: "Email", value: "security@fake-bank.com", confidence: "medium" }
      ],
      mitigations: ["User awareness training", "Email filtering", "Domain blocking"],
      source: "External Feed",
      status: "mitigated"
    }
  ];

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical": return "destructive";
      case "high": return "secondary"; 
      case "medium": return "outline";
      case "low": return "outline";
      default: return "outline";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-red-100 text-red-800";
      case "monitoring": return "bg-yellow-100 text-yellow-800";
      case "mitigated": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getThreatIcon = (type: string) => {
    switch (type) {
      case "apt": return <Shield className="h-4 w-4" />;
      case "malware": return <AlertTriangle className="h-4 w-4" />;
      case "phishing": return <Globe className="h-4 w-4" />;
      default: return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const filteredThreats = threats.filter(threat =>
    threat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    threat.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const threatStats = {
    total: threats.length,
    critical: threats.filter(t => t.severity === "critical").length,
    high: threats.filter(t => t.severity === "high").length,
    active: threats.filter(t => t.status === "active").length,
    monitoring: threats.filter(t => t.status === "monitoring").length
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Threat Intelligence</h2>
          <p className="text-muted-foreground">
            Monitor and analyze current threat landscape and indicators
          </p>
        </div>
        <Button className="flex items-center gap-2">
          <Activity className="h-4 w-4" />
          Refresh Feeds
        </Button>
      </div>

      {/* Threat Statistics */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Threats</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{threatStats.total}</div>
            <div className="text-sm text-muted-foreground">Tracked threats</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-red-600">Critical</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{threatStats.critical}</div>
            <div className="text-sm text-muted-foreground">High priority</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-orange-600">High</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{threatStats.high}</div>
            <div className="text-sm text-muted-foreground">Significant risk</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-red-600">Active</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{threatStats.active}</div>
            <div className="text-sm text-muted-foreground">Current threats</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-blue-600">Monitoring</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{threatStats.monitoring}</div>
            <div className="text-sm text-muted-foreground">Under watch</div>
          </CardContent>
        </Card>
      </div>

      {/* Threat Landscape Map */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Global Threat Landscape
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center border-2 border-dashed border-gray-200 rounded-lg">
            <div className="text-center text-muted-foreground">
              <MapPin className="h-12 w-12 mx-auto mb-4" />
              <p>Threat intelligence world map will be displayed here</p>
              <p className="text-sm">Integration with threat intelligence feeds</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Threat Intelligence Feed */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Current Threats</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search threats..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 w-64"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredThreats.map((threat) => (
              <div key={threat.id} className="border rounded-lg p-4 hover:bg-gray-50">
                <div className="flex items-start justify-between mb-3">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="p-1 bg-red-100 rounded">
                        {getThreatIcon(threat.type)}
                      </div>
                      <div className="font-medium">{threat.name}</div>
                      <Badge variant={getSeverityColor(threat.severity)}>
                        {threat.severity.toUpperCase()}
                      </Badge>
                      <Badge className={getStatusColor(threat.status)}>
                        {threat.status.replace('_', ' ')}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">{threat.id}</div>
                    <div className="text-sm">{threat.description}</div>
                  </div>
                  <div className="text-right text-sm text-muted-foreground">
                    <div className="flex items-center gap-1 mb-1">
                      <Calendar className="h-3 w-3" />
                      Last seen: {threat.lastSeen}
                    </div>
                    <div className="flex items-center gap-1">
                      <Eye className="h-3 w-3" />
                      {threat.source}
                    </div>
                  </div>
                </div>
                
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 text-sm mb-4">
                  <div>
                    <div className="font-medium mb-1">Affected Sectors</div>
                    <div className="text-muted-foreground">
                      {threat.affectedSectors.join(", ")}
                    </div>
                  </div>
                  <div>
                    <div className="font-medium mb-1">Key Indicators</div>
                    <div className="text-muted-foreground">
                      {threat.indicators.length} IOCs identified
                    </div>
                  </div>
                  <div>
                    <div className="font-medium mb-1">Likelihood</div>
                    <Badge variant="outline">{threat.likelihood}</Badge>
                  </div>
                </div>
                
                <div className="mb-4">
                  <div className="font-medium mb-2 text-sm">Indicators of Compromise</div>
                  <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
                    {threat.indicators.map((indicator, index) => (
                      <div key={index} className="p-2 bg-gray-50 rounded text-xs">
                        <div className="font-medium">{indicator.type}</div>
                        <div className="text-muted-foreground font-mono truncate">
                          {indicator.value}
                        </div>
                        <Badge variant="outline" className="mt-1 text-xs">
                          {indicator.confidence}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="mb-4">
                  <div className="font-medium mb-2 text-sm">Recommended Mitigations</div>
                  <div className="flex flex-wrap gap-1">
                    {threat.mitigations.map((mitigation, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {mitigation}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Eye className="h-3 w-3 mr-1" />
                    View Details
                  </Button>
                  <Button variant="outline" size="sm">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    Track Indicators
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

export default ThreatIntelligence;
