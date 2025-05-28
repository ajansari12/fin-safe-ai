
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { FileText, Download, Filter, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface AuditTrail {
  id: string;
  org_id: string;
  module_name: string;
  action_type: string;
  entity_type: string;
  entity_id: string | null;
  entity_name: string | null;
  user_id: string | null;
  user_name: string | null;
  changes_made: any;
  ip_address: string | null;
  user_agent: string | null;
  timestamp: string;
  created_at: string;
}

interface AuditTrailsListProps {
  orgId: string;
}

const AuditTrailsList: React.FC<AuditTrailsListProps> = ({ orgId }) => {
  const [auditTrails, setAuditTrails] = useState<AuditTrail[]>([]);
  const [filteredTrails, setFilteredTrails] = useState<AuditTrail[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedModule, setSelectedModule] = useState<string>("all");
  const [selectedActionType, setSelectedActionType] = useState<string>("all");
  const { toast } = useToast();

  const modules = [
    { value: "all", label: "All Modules" },
    { value: "governance", label: "Governance" },
    { value: "incident", label: "Incident Management" },
    { value: "audit", label: "Audit & Compliance" },
    { value: "risk", label: "Risk Management" },
    { value: "third_party", label: "Third Party Risk" },
    { value: "business_continuity", label: "Business Continuity" },
    { value: "controls", label: "Controls & KRIs" }
  ];

  const actionTypes = [
    { value: "all", label: "All Actions" },
    { value: "create", label: "Create" },
    { value: "update", label: "Update" },
    { value: "delete", label: "Delete" },
    { value: "view", label: "View" },
    { value: "export", label: "Export" }
  ];

  useEffect(() => {
    loadAuditTrails();
  }, [orgId]);

  useEffect(() => {
    applyFilters();
  }, [auditTrails, selectedModule, selectedActionType]);

  const loadAuditTrails = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('audit_trails')
        .select('*')
        .eq('org_id', orgId)
        .order('timestamp', { ascending: false })
        .limit(100);

      if (error) throw error;
      setAuditTrails(data || []);
    } catch (error) {
      console.error('Error loading audit trails:', error);
      toast({
        title: "Error loading audit trails",
        description: "There was an error loading the audit trail data.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = auditTrails;

    if (selectedModule !== "all") {
      filtered = filtered.filter(trail => trail.module_name === selectedModule);
    }

    if (selectedActionType !== "all") {
      filtered = filtered.filter(trail => trail.action_type === selectedActionType);
    }

    setFilteredTrails(filtered);
  };

  const getActionBadgeColor = (actionType: string) => {
    switch (actionType) {
      case 'create': return 'bg-green-100 text-green-800';
      case 'update': return 'bg-blue-100 text-blue-800';
      case 'delete': return 'bg-red-100 text-red-800';
      case 'view': return 'bg-gray-100 text-gray-800';
      case 'export': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading audit trails...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Audit Trails
        </CardTitle>
        <CardDescription>
          Complete audit trail of all system activities and changes.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex gap-4 mb-6">
          <div className="flex-1">
            <label className="text-sm font-medium">Module Filter</label>
            <Select value={selectedModule} onValueChange={setSelectedModule}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {modules.map((module) => (
                  <SelectItem key={module.value} value={module.value}>
                    {module.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex-1">
            <label className="text-sm font-medium">Action Filter</label>
            <Select value={selectedActionType} onValueChange={setSelectedActionType}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {actionTypes.map((actionType) => (
                  <SelectItem key={actionType.value} value={actionType.value}>
                    {actionType.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {filteredTrails.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Audit Trails Found</h3>
            <p className="text-gray-500">No audit activities match the current filters.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>Module</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Entity</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTrails.map((trail) => (
                <TableRow key={trail.id}>
                  <TableCell className="text-sm">
                    {format(new Date(trail.timestamp), 'MMM d, yyyy HH:mm')}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{trail.module_name}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getActionBadgeColor(trail.action_type)}>
                      {trail.action_type}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">
                    <div>
                      <div className="font-medium">{trail.entity_type}</div>
                      {trail.entity_name && (
                        <div className="text-muted-foreground">{trail.entity_name}</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">
                    {trail.user_name || 'System'}
                  </TableCell>
                  <TableCell className="text-sm max-w-xs">
                    {trail.changes_made ? (
                      <div className="truncate">
                        {JSON.stringify(trail.changes_made).substring(0, 50)}...
                      </div>
                    ) : (
                      <span className="text-muted-foreground">No details</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export default AuditTrailsList;
