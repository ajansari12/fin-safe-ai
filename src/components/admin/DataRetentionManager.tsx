import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Database, Plus, Trash2 } from "lucide-react";
import {
  getDataRetentionPolicies,
  createDataRetentionPolicy,
  updateDataRetentionPolicy,
  type DataRetentionPolicy
} from "@/services/admin-service";

const DataRetentionManager: React.FC = () => {
  const [policies, setPolicies] = useState<DataRetentionPolicy[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newPolicy, setNewPolicy] = useState({
    tableName: "",
    retentionDays: 365,
    autoDelete: false,
    description: ""
  });
  const { toast } = useToast();

  const availableTables = [
    "incident_logs",
    "audit_trails",
    "kri_logs",
    "scenario_results",
    "dependency_logs",
    "third_party_reviews",
    "compliance_findings",
    "governance_change_logs"
  ];

  useEffect(() => {
    loadPolicies();
  }, []);

  const loadPolicies = async () => {
    try {
      const data = await getDataRetentionPolicies();
      setPolicies(data);
    } catch (error) {
      console.error("Failed to load policies:", error);
      toast({
        title: "Error",
        description: "Failed to load data retention policies",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePolicy = async () => {
    if (!newPolicy.tableName || !newPolicy.retentionDays) return;

    try {
      await createDataRetentionPolicy(
        newPolicy.tableName,
        newPolicy.retentionDays,
        newPolicy.autoDelete,
        newPolicy.description || undefined
      );
      await loadPolicies();
      setNewPolicy({
        tableName: "",
        retentionDays: 365,
        autoDelete: false,
        description: ""
      });
      setShowAddForm(false);
      toast({
        title: "Policy Created",
        description: "Data retention policy has been created successfully",
      });
    } catch (error) {
      console.error("Failed to create policy:", error);
      toast({
        title: "Error",
        description: "Failed to create data retention policy",
        variant: "destructive",
      });
    }
  };

  const handleUpdatePolicy = async (
    policyId: string,
    retentionDays: number,
    autoDelete: boolean,
    description?: string
  ) => {
    try {
      await updateDataRetentionPolicy(policyId, retentionDays, autoDelete, description);
      await loadPolicies();
      toast({
        title: "Policy Updated",
        description: "Data retention policy has been updated successfully",
      });
    } catch (error) {
      console.error("Failed to update policy:", error);
      toast({
        title: "Error",
        description: "Failed to update data retention policy",
        variant: "destructive",
      });
    }
  };

  const getRetentionBadgeColor = (days: number) => {
    if (days <= 90) return "bg-red-100 text-red-800";
    if (days <= 365) return "bg-yellow-100 text-yellow-800";
    return "bg-green-100 text-green-800";
  };

  if (loading) {
    return <div>Loading data retention policies...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Add New Policy */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Data Retention Policies
          </CardTitle>
          <CardDescription>
            Configure how long data is retained in different tables
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!showAddForm ? (
            <Button onClick={() => setShowAddForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Retention Policy
            </Button>
          ) : (
            <div className="space-y-4 border rounded-lg p-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="table-name">Table Name</Label>
                  <Select
                    value={newPolicy.tableName}
                    onValueChange={(value) => setNewPolicy(prev => ({ ...prev, tableName: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select table" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableTables
                        .filter(table => !policies.some(p => p.table_name === table))
                        .map(table => (
                          <SelectItem key={table} value={table}>
                            {table}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="retention-days">Retention Period (days)</Label>
                  <Input
                    id="retention-days"
                    type="number"
                    value={newPolicy.retentionDays}
                    onChange={(e) => setNewPolicy(prev => ({ ...prev, retentionDays: parseInt(e.target.value) }))}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  placeholder="Optional description"
                  value={newPolicy.description}
                  onChange={(e) => setNewPolicy(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="auto-delete"
                  checked={newPolicy.autoDelete}
                  onCheckedChange={(checked) => setNewPolicy(prev => ({ ...prev, autoDelete: checked }))}
                />
                <Label htmlFor="auto-delete">Enable Auto-Delete</Label>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleCreatePolicy}>Create Policy</Button>
                <Button variant="outline" onClick={() => setShowAddForm(false)}>Cancel</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Existing Policies */}
      <Card>
        <CardHeader>
          <CardTitle>Current Retention Policies</CardTitle>
          <CardDescription>
            Manage existing data retention policies
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Table Name</TableHead>
                <TableHead>Retention Period</TableHead>
                <TableHead>Auto-Delete</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {policies.map((policy) => (
                <TableRow key={policy.id}>
                  <TableCell className="font-medium">{policy.table_name}</TableCell>
                  <TableCell>
                    <Badge className={getRetentionBadgeColor(policy.retention_period_days)}>
                      {policy.retention_period_days} days
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={policy.auto_delete ? "destructive" : "secondary"}>
                      {policy.auto_delete ? "Enabled" : "Disabled"}
                    </Badge>
                  </TableCell>
                  <TableCell>{policy.description || "No description"}</TableCell>
                  <TableCell>
                    {new Date(policy.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm">
                      Edit
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Policy Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Retention Summary</CardTitle>
          <CardDescription>
            Overview of data retention across your organization
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{policies.length}</div>
              <div className="text-sm text-muted-foreground">Total Policies</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">
                {policies.filter(p => p.auto_delete).length}
              </div>
              <div className="text-sm text-muted-foreground">Auto-Delete Enabled</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">
                {Math.round(policies.reduce((acc, p) => acc + p.retention_period_days, 0) / policies.length) || 0}
              </div>
              <div className="text-sm text-muted-foreground">Avg. Retention (days)</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DataRetentionManager;
