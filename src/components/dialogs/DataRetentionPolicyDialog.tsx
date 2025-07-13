import React, { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Shield, Database, Users, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface DataRetentionPolicyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const DataRetentionPolicyDialog: React.FC<DataRetentionPolicyDialogProps> = ({
  open,
  onOpenChange,
}) => {
  const { toast } = useToast();
  const [policies, setPolicies] = useState([
    { type: "Audit Logs", current: "2 years", recommended: "2 years", status: "compliant" },
    { type: "Incident Records", current: "7 years", recommended: "7 years", status: "compliant" },
    { type: "User Sessions", current: "90 days", recommended: "90 days", status: "compliant" },
    { type: "Performance Data", current: "1 year", recommended: "6 months", status: "review" },
    { type: "Chat Logs", current: "6 months", recommended: "1 year", status: "update" },
  ]);

  const [newPolicy, setNewPolicy] = useState({
    dataType: "",
    retentionPeriod: "",
    unit: "days"
  });

  const handleSavePolicy = () => {
    toast({
      title: "Retention Policy Updated",
      description: "Data retention policies have been successfully updated.",
    });
    onOpenChange(false);
  };

  const handleAddPolicy = () => {
    if (newPolicy.dataType && newPolicy.retentionPeriod) {
      const policy = {
        type: newPolicy.dataType,
        current: `${newPolicy.retentionPeriod} ${newPolicy.unit}`,
        recommended: `${newPolicy.retentionPeriod} ${newPolicy.unit}`,
        status: "compliant"
      };
      setPolicies([...policies, policy]);
      setNewPolicy({ dataType: "", retentionPeriod: "", unit: "days" });
      toast({
        title: "Policy Added",
        description: "New retention policy has been added successfully.",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "compliant":
        return <Badge variant="default" className="bg-green-100 text-green-800">Compliant</Badge>;
      case "review":
        return <Badge variant="secondary">Needs Review</Badge>;
      case "update":
        return <Badge variant="destructive">Needs Update</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Data Retention Policy Configuration
          </DialogTitle>
          <DialogDescription>
            Configure and manage data retention policies to ensure compliance with regulatory requirements.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Current Policies */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Current Retention Policies</CardTitle>
              <CardDescription>
                Review and modify existing data retention policies
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {policies.map((policy, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Database className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="font-medium">{policy.type}</div>
                        <div className="text-sm text-muted-foreground">
                          Current: {policy.current} | Recommended: {policy.recommended}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(policy.status)}
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Add New Policy */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Add New Retention Policy</CardTitle>
              <CardDescription>
                Define retention policy for new data types
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dataType">Data Type</Label>
                  <Input
                    id="dataType"
                    placeholder="e.g., API Logs"
                    value={newPolicy.dataType}
                    onChange={(e) => setNewPolicy({ ...newPolicy, dataType: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="retentionPeriod">Retention Period</Label>
                  <Input
                    id="retentionPeriod"
                    type="number"
                    placeholder="e.g., 30"
                    value={newPolicy.retentionPeriod}
                    onChange={(e) => setNewPolicy({ ...newPolicy, retentionPeriod: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="unit">Time Unit</Label>
                  <Select value={newPolicy.unit} onValueChange={(value) => setNewPolicy({ ...newPolicy, unit: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="days">Days</SelectItem>
                      <SelectItem value="months">Months</SelectItem>
                      <SelectItem value="years">Years</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <Button onClick={handleAddPolicy} className="w-full">
                    Add Policy
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Compliance Warning */}
          <div className="flex items-center gap-2 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <AlertTriangle className="h-5 w-5 text-yellow-600" />
            <div className="text-sm">
              <strong>Compliance Notice:</strong> Ensure retention policies comply with applicable regulations (GDPR, SOX, etc.).
              Consult with legal and compliance teams before making changes.
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSavePolicy}>
            Save Policies
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};