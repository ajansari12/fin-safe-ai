
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  AlertTriangle, 
  Plus,
  Search,
  Clock,
  Users,
  FileText,
  CheckCircle,
  XCircle,
  Activity,
  Calendar
} from "lucide-react";

const CyberIncidentResponse = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Mock incident data
  const incidents = [
    {
      id: "INC-2024-001",
      title: "Phishing Email Campaign Detected",
      type: "phishing",
      severity: "high",
      status: "investigating",
      reportedBy: "SOC Analyst",
      assignedTo: "Incident Response Team",
      discoveryDate: "2024-01-15T10:30:00",
      description: "Multiple users reported suspicious emails with malicious attachments",
      affectedSystems: ["Email Server", "User Workstations"],
      businessImpact: "Email service partially disrupted",
      containmentActions: ["Isolated affected systems", "Blocked sender domains"],
      timeline: [
        { time: "10:30", event: "Initial detection by SOC", type: "detection" },
        { time: "10:45", event: "IR team notified", type: "escalation" },
        { time: "11:00", event: "Containment measures activated", type: "response" },
        { time: "11:30", event: "Forensic analysis started", type: "investigation" }
      ]
    },
    {
      id: "INC-2024-002",
      title: "Malware Infection on Production Server",
      type: "malware",
      severity: "critical",
      status: "contained",
      reportedBy: "Network Monitoring",
      assignedTo: "Critical Response Team",
      discoveryDate: "2024-01-14T14:15:00",
      description: "Ransomware detected on production web server",
      affectedSystems: ["Web Server Cluster", "Database Server"],
      businessImpact: "Website unavailable for 2 hours",
      containmentActions: ["Server isolated", "Backup systems activated", "Threat removed"],
      timeline: [
        { time: "14:15", event: "Automated alert triggered", type: "detection" },
        { time: "14:20", event: "Critical team assembled", type: "escalation" },
        { time: "14:30", event: "Systems isolated", type: "response" },
        { time: "16:45", event: "Services restored", type: "recovery" }
      ]
    },
    {
      id: "INC-2024-003",
      title: "Unauthorized Access Attempt",
      type: "unauthorized_access",
      severity: "medium",
      status: "resolved",
      reportedBy: "Security System",
      assignedTo: "Security Team",
      discoveryDate: "2024-01-12T22:00:00",
      description: "Multiple failed login attempts from suspicious IP addresses",
      affectedSystems: ["VPN Gateway", "Authentication Server"],
      businessImpact: "No business impact - blocked successfully",
      containmentActions: ["IP addresses blocked", "Account monitoring enhanced"],
      timeline: [
        { time: "22:00", event: "Suspicious activity detected", type: "detection" },
        { time: "22:05", event: "Automatic blocking activated", type: "response" },
        { time: "08:30", event: "Investigation completed", type: "resolution" }
      ]
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
      case "open": return "bg-red-100 text-red-800";
      case "investigating": return "bg-yellow-100 text-yellow-800";
      case "contained": return "bg-blue-100 text-blue-800";
      case "resolved": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "open": return <AlertTriangle className="h-4 w-4" />;
      case "investigating": return <Activity className="h-4 w-4" />;
      case "contained": return <CheckCircle className="h-4 w-4" />;
      case "resolved": return <CheckCircle className="h-4 w-4" />;
      default: return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const filteredIncidents = incidents.filter(incident =>
    incident.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    incident.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const incidentStats = {
    total: incidents.length,
    open: incidents.filter(i => i.status === "open").length,
    investigating: incidents.filter(i => i.status === "investigating").length,
    contained: incidents.filter(i => i.status === "contained").length,
    resolved: incidents.filter(i => i.status === "resolved").length
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Cyber Incident Response</h2>
          <p className="text-muted-foreground">
            Manage and track cybersecurity incidents and response activities
          </p>
        </div>
        <Button 
          className="flex items-center gap-2"
          onClick={() => setShowCreateForm(true)}
        >
          <Plus className="h-4 w-4" />
          Report Incident
        </Button>
      </div>

      {/* Incident Statistics */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Incidents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{incidentStats.total}</div>
            <div className="text-sm text-muted-foreground">This month</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-red-600">Open</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{incidentStats.open}</div>
            <div className="text-sm text-muted-foreground">Requires attention</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-yellow-600">Investigating</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{incidentStats.investigating}</div>
            <div className="text-sm text-muted-foreground">In progress</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-blue-600">Contained</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{incidentStats.contained}</div>
            <div className="text-sm text-muted-foreground">Under control</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-green-600">Resolved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{incidentStats.resolved}</div>
            <div className="text-sm text-muted-foreground">Completed</div>
          </CardContent>
        </Card>
      </div>

      {/* Incident Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Active Incidents</CardTitle>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search incidents..."
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
            {filteredIncidents.map((incident) => (
              <div key={incident.id} className="border rounded-lg p-4 hover:bg-gray-50">
                <div className="flex items-start justify-between mb-3">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="font-medium">{incident.title}</div>
                      <Badge variant={getSeverityColor(incident.severity)}>
                        {incident.severity.toUpperCase()}
                      </Badge>
                      <Badge className={getStatusColor(incident.status)}>
                        {getStatusIcon(incident.status)}
                        <span className="ml-1">{incident.status.replace('_', ' ')}</span>
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">{incident.id}</div>
                    <div className="text-sm">{incident.description}</div>
                  </div>
                  <div className="text-right text-sm text-muted-foreground">
                    <div className="flex items-center gap-1 mb-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(incident.discoveryDate).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {incident.assignedTo}
                    </div>
                  </div>
                </div>
                
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 text-sm">
                  <div>
                    <div className="font-medium mb-1">Affected Systems</div>
                    <div className="text-muted-foreground">
                      {incident.affectedSystems.join(", ")}
                    </div>
                  </div>
                  <div>
                    <div className="font-medium mb-1">Business Impact</div>
                    <div className="text-muted-foreground">{incident.businessImpact}</div>
                  </div>
                  <div>
                    <div className="font-medium mb-1">Response Actions</div>
                    <div className="text-muted-foreground">
                      {incident.containmentActions.slice(0, 2).join(", ")}
                      {incident.containmentActions.length > 2 && "..."}
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 pt-3 border-t">
                  <div className="font-medium mb-2 text-sm">Timeline</div>
                  <div className="flex items-center gap-4 text-xs">
                    {incident.timeline.slice(-3).map((event, index) => (
                      <div key={index} className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span className="font-medium">{event.time}</span>
                        <span className="text-muted-foreground">{event.event}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="mt-3 flex gap-2">
                  <Button variant="outline" size="sm">
                    <FileText className="h-3 w-3 mr-1" />
                    Details
                  </Button>
                  <Button variant="outline" size="sm">
                    <Activity className="h-3 w-3 mr-1" />
                    Update
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Create Incident Form Modal */}
      {showCreateForm && (
        <Card className="border-2 border-blue-200">
          <CardHeader>
            <CardTitle>Report New Incident</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium mb-2 block">Incident Title</label>
                  <Input placeholder="Brief description of the incident" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Incident Type</label>
                  <select className="w-full p-2 border rounded-md">
                    <option>Select type...</option>
                    <option value="malware">Malware</option>
                    <option value="phishing">Phishing</option>
                    <option value="data_breach">Data Breach</option>
                    <option value="unauthorized_access">Unauthorized Access</option>
                    <option value="ddos">DDoS Attack</option>
                    <option value="insider_threat">Insider Threat</option>
                  </select>
                </div>
              </div>
              
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium mb-2 block">Severity</label>
                  <select className="w-full p-2 border rounded-md">
                    <option>Select severity...</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Assigned To</label>
                  <Input placeholder="Team or individual" />
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Description</label>
                <Textarea 
                  placeholder="Detailed description of the incident..." 
                  rows={3}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium mb-2 block">Affected Systems</label>
                <Input placeholder="List affected systems, separated by commas" />
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button>Create Incident</Button>
                <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CyberIncidentResponse;
