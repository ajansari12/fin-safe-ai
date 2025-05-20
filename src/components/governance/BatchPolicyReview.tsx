
import { useState } from "react";
import { GovernancePolicy } from "@/pages/governance/types";
import { batchCompleteReviews } from "@/services/governance-service";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Clock } from "lucide-react";

interface BatchPolicyReviewProps {
  policies: GovernancePolicy[];
  onCompleted: () => void;
}

export default function BatchPolicyReview({ policies, onCompleted }: BatchPolicyReviewProps) {
  const [selectedPolicies, setSelectedPolicies] = useState<Record<string, boolean>>({});
  const [isProcessing, setIsProcessing] = useState(false);
  
  const handlePolicyToggle = (policyId: string, checked: boolean) => {
    setSelectedPolicies(prev => ({
      ...prev,
      [policyId]: checked
    }));
  };
  
  const handleSelectAll = (checked: boolean) => {
    const newSelection: Record<string, boolean> = {};
    policies.forEach(policy => {
      newSelection[policy.id] = checked;
    });
    setSelectedPolicies(newSelection);
  };
  
  const handleBatchReview = async () => {
    const selectedPolicyIds = Object.entries(selectedPolicies)
      .filter(([_, selected]) => selected)
      .map(([id]) => id);
      
    if (selectedPolicyIds.length === 0) {
      toast.error("Please select at least one policy to review");
      return;
    }
    
    setIsProcessing(true);
    try {
      const successCount = await batchCompleteReviews(selectedPolicyIds);
      if (successCount > 0) {
        onCompleted();
      }
    } finally {
      setIsProcessing(false);
    }
  };
  
  const selectedCount = Object.values(selectedPolicies).filter(Boolean).length;
  
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Batch Policy Review</CardTitle>
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="select-all"
              checked={selectedCount === policies.length && policies.length > 0}
              onCheckedChange={(checked) => handleSelectAll(!!checked)}
            />
            <label htmlFor="select-all" className="text-sm cursor-pointer">
              Select All
            </label>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {policies.length === 0 ? (
          <div className="text-center p-6">
            <Clock className="h-8 w-8 mx-auto mb-2 text-gray-400" />
            <p className="text-gray-500">No policies available for review</p>
          </div>
        ) : (
          <div className="space-y-2">
            {policies.map(policy => (
              <div 
                key={policy.id} 
                className="flex items-center justify-between p-3 rounded border hover:bg-gray-50"
              >
                <div className="flex items-center space-x-3">
                  <Checkbox
                    id={`policy-${policy.id}`}
                    checked={!!selectedPolicies[policy.id]}
                    onCheckedChange={(checked) => handlePolicyToggle(policy.id, !!checked)}
                  />
                  <label htmlFor={`policy-${policy.id}`} className="cursor-pointer">
                    <div className="font-medium">{policy.title}</div>
                    <div className="text-sm text-gray-500">Version {policy.version}</div>
                  </label>
                </div>
                <Badge variant={policy.status === 'active' ? 'default' : 'outline'}>
                  {policy.status}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <div className="text-sm text-gray-500">
          {selectedCount} of {policies.length} selected
        </div>
        <Button 
          onClick={handleBatchReview} 
          disabled={isProcessing || selectedCount === 0}
        >
          {isProcessing 
            ? "Processing..." 
            : `Complete ${selectedCount} Reviews`
          }
        </Button>
      </CardFooter>
    </Card>
  );
}
