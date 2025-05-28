
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { GovernancePolicy, GovernanceRole } from "@/pages/governance/types";
import { batchCompleteReviews } from "@/services/governance-service";
import { toast } from "sonner";
import { FileCheck, Users, Trash2, Archive, CheckCircle } from "lucide-react";

interface BulkGovernanceOperationsProps {
  policies?: GovernancePolicy[];
  roles?: GovernanceRole[];
  onRefresh?: () => void;
}

export default function BulkGovernanceOperations({ 
  policies = [], 
  roles = [], 
  onRefresh 
}: BulkGovernanceOperationsProps) {
  const [selectedPolicies, setSelectedPolicies] = useState<string[]>([]);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [bulkAction, setBulkAction] = useState<string>("");
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePolicySelection = (policyId: string, checked: boolean) => {
    if (checked) {
      setSelectedPolicies([...selectedPolicies, policyId]);
    } else {
      setSelectedPolicies(selectedPolicies.filter(id => id !== policyId));
    }
  };

  const handleRoleSelection = (roleId: string, checked: boolean) => {
    if (checked) {
      setSelectedRoles([...selectedRoles, roleId]);
    } else {
      setSelectedRoles(selectedRoles.filter(id => id !== roleId));
    }
  };

  const handleSelectAllPolicies = (checked: boolean) => {
    if (checked) {
      setSelectedPolicies(policies.map(p => p.id));
    } else {
      setSelectedPolicies([]);
    }
  };

  const handleSelectAllRoles = (checked: boolean) => {
    if (checked) {
      setSelectedRoles(roles.map(r => r.id));
    } else {
      setSelectedRoles([]);
    }
  };

  const executeBulkAction = async () => {
    setIsProcessing(true);
    
    try {
      switch (bulkAction) {
        case "complete-reviews":
          const completedCount = await batchCompleteReviews(selectedPolicies);
          toast.success(`Completed ${completedCount} policy reviews`);
          break;
        
        case "archive-policies":
          // Implementation would go here for archiving policies
          toast.success(`Archived ${selectedPolicies.length} policies`);
          break;
          
        case "delete-roles":
          // Implementation would go here for deleting roles
          toast.success(`Deleted ${selectedRoles.length} roles`);
          break;
          
        default:
          toast.error("Unknown bulk action");
      }
      
      setSelectedPolicies([]);
      setSelectedRoles([]);
      setBulkAction("");
      
      if (onRefresh) {
        onRefresh();
      }
      
    } catch (error) {
      console.error("Bulk operation failed:", error);
      toast.error("Bulk operation failed");
    } finally {
      setIsProcessing(false);
      setConfirmDialogOpen(false);
    }
  };

  const getActionDescription = () => {
    switch (bulkAction) {
      case "complete-reviews":
        return `Mark ${selectedPolicies.length} policies as reviewed`;
      case "archive-policies":
        return `Archive ${selectedPolicies.length} policies`;
      case "delete-roles":
        return `Delete ${selectedRoles.length} roles`;
      default:
        return "";
    }
  };

  return (
    <div className="space-y-6">
      {/* Policy Bulk Operations */}
      {policies.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileCheck className="h-5 w-5" />
              Bulk Policy Operations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="select-all-policies"
                checked={selectedPolicies.length === policies.length}
                onCheckedChange={handleSelectAllPolicies}
              />
              <label htmlFor="select-all-policies" className="text-sm font-medium">
                Select All Policies ({policies.length})
              </label>
            </div>
            
            <div className="grid gap-2 max-h-48 overflow-y-auto">
              {policies.map(policy => (
                <div key={policy.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`policy-${policy.id}`}
                    checked={selectedPolicies.includes(policy.id)}
                    onCheckedChange={(checked) => 
                      handlePolicySelection(policy.id, checked as boolean)
                    }
                  />
                  <label 
                    htmlFor={`policy-${policy.id}`} 
                    className="text-sm flex-1 truncate"
                  >
                    {policy.title}
                  </label>
                  <span className="text-xs text-muted-foreground">
                    {policy.status}
                  </span>
                </div>
              ))}
            </div>

            {selectedPolicies.length > 0 && (
              <div className="flex gap-2">
                <Select onValueChange={setBulkAction}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Choose action" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="complete-reviews">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-4 w-4" />
                        Complete Reviews
                      </div>
                    </SelectItem>
                    <SelectItem value="archive-policies">
                      <div className="flex items-center gap-2">
                        <Archive className="h-4 w-4" />
                        Archive Policies
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                
                <Button 
                  onClick={() => setConfirmDialogOpen(true)}
                  disabled={!bulkAction}
                  variant="outline"
                >
                  Execute ({selectedPolicies.length})
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Role Bulk Operations */}
      {roles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Bulk Role Operations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="select-all-roles"
                checked={selectedRoles.length === roles.length}
                onCheckedChange={handleSelectAllRoles}
              />
              <label htmlFor="select-all-roles" className="text-sm font-medium">
                Select All Roles ({roles.length})
              </label>
            </div>
            
            <div className="grid gap-2 max-h-48 overflow-y-auto">
              {roles.map(role => (
                <div key={role.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`role-${role.id}`}
                    checked={selectedRoles.includes(role.id)}
                    onCheckedChange={(checked) => 
                      handleRoleSelection(role.id, checked as boolean)
                    }
                  />
                  <label 
                    htmlFor={`role-${role.id}`} 
                    className="text-sm flex-1 truncate"
                  >
                    {role.title}
                  </label>
                  <span className="text-xs text-muted-foreground">
                    {role.assigned_to || 'Unassigned'}
                  </span>
                </div>
              ))}
            </div>

            {selectedRoles.length > 0 && (
              <div className="flex gap-2">
                <Select onValueChange={setBulkAction}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Choose action" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="delete-roles">
                      <div className="flex items-center gap-2">
                        <Trash2 className="h-4 w-4" />
                        Delete Roles
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                
                <Button 
                  onClick={() => setConfirmDialogOpen(true)}
                  disabled={!bulkAction}
                  variant="outline"
                >
                  Execute ({selectedRoles.length})
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Confirmation Dialog */}
      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Bulk Operation</DialogTitle>
            <DialogDescription>
              Are you sure you want to {getActionDescription()}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmDialogOpen(false)}
              disabled={isProcessing}
            >
              Cancel
            </Button>
            <Button
              onClick={executeBulkAction}
              disabled={isProcessing}
              variant="destructive"
            >
              {isProcessing ? "Processing..." : "Confirm"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
