
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { getBusinessFunctions } from "@/services/business-functions-service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

interface BusinessFunctionSelectProps {
  onSelect: (functionId: string) => void;
  selectedId?: string;
}

const BusinessFunctionSelect: React.FC<BusinessFunctionSelectProps> = ({ onSelect, selectedId }) => {
  const { data: businessFunctions, isLoading } = useQuery({
    queryKey: ['businessFunctions'],
    queryFn: getBusinessFunctions
  });

  const getCriticalityColor = (criticality: string) => {
    switch (criticality.toLowerCase()) {
      case 'critical':
        return 'bg-red-500';
      case 'high':
        return 'bg-amber-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'low':
        return 'bg-green-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Select Critical Business Function</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Select 
            onValueChange={onSelect}
            value={selectedId}
            disabled={isLoading}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a business function" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {businessFunctions?.map((func) => (
                  <SelectItem key={func.id} value={func.id}>
                    <div className="flex items-center justify-between w-full">
                      <span>{func.name}</span>
                      <Badge className={getCriticalityColor(func.criticality)}>
                        {func.criticality}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          
          {selectedId && businessFunctions?.find(f => f.id === selectedId) && (
            <div className="rounded-md border p-4 bg-muted/50">
              <h4 className="font-medium">
                {businessFunctions.find(f => f.id === selectedId)?.name}
              </h4>
              <p className="text-sm text-muted-foreground mt-1">
                {businessFunctions.find(f => f.id === selectedId)?.description}
              </p>
              <div className="text-sm mt-2">
                <span className="font-medium">Category:</span> {businessFunctions.find(f => f.id === selectedId)?.category}
              </div>
              <div className="text-sm">
                <span className="font-medium">Owner:</span> {businessFunctions.find(f => f.id === selectedId)?.owner}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default BusinessFunctionSelect;
