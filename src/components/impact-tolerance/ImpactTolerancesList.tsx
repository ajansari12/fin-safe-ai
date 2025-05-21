
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { getImpactTolerances } from "@/services/business-functions-service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Edit2, Eye } from "lucide-react";

interface ImpactTolerancesListProps {
  onSelectTolerance: (tolerance: any) => void;
}

const ImpactTolerancesList: React.FC<ImpactTolerancesListProps> = ({ onSelectTolerance }) => {
  const { data: tolerances, isLoading } = useQuery({
    queryKey: ['impactTolerances'],
    queryFn: () => getImpactTolerances(),
  });

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'draft':
        return 'bg-yellow-500';
      case 'published':
        return 'bg-green-500';
      case 'in_review':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  const formatTimeValue = (value: string) => {
    if (!value) return 'N/A';
    // Convert values like "1hour", "4hours" to human-readable format
    if (value === '15min') return '15 minutes';
    if (value === '30min') return '30 minutes';
    if (value === '1hour') return '1 hour';
    if (value === '2hours') return '2 hours';
    if (value === '4hours') return '4 hours';
    if (value === '8hours') return '8 hours';
    if (value === '24hours') return '24 hours';
    if (value === '48hours') return '48 hours';
    if (value === '1week') return '1 week';
    return value;
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!tolerances || tolerances.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Impact Tolerances</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            No impact tolerances defined yet. Select a business function to define a new tolerance.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Impact Tolerances</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px]">
          <div className="space-y-4">
            {tolerances.map((tolerance: any) => (
              <div 
                key={tolerance.id} 
                className="border rounded-md p-4 hover:border-primary transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium">
                    {tolerance.business_functions?.name || 'Unknown Function'}
                  </h3>
                  <Badge className={getStatusColor(tolerance.status)}>
                    {tolerance.status}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                  <div>
                    <span className="font-medium">MTD:</span> {formatTimeValue(tolerance.max_tolerable_downtime)}
                  </div>
                  <div>
                    <span className="font-medium">RTO:</span> {formatTimeValue(tolerance.recovery_time_objective)}
                  </div>
                </div>
                
                <div className="text-sm mb-3">
                  <span className="font-medium">Threshold:</span> {tolerance.quantitative_threshold}
                </div>
                
                <div className="flex justify-end space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => onSelectTolerance(tolerance)}
                    className="flex items-center gap-1"
                  >
                    <Eye className="h-4 w-4" />
                    <span>View</span>
                  </Button>
                  
                  {tolerance.status === 'draft' && (
                    <Button 
                      variant="default" 
                      size="sm"
                      onClick={() => onSelectTolerance(tolerance)}
                      className="flex items-center gap-1"
                    >
                      <Edit2 className="h-4 w-4" />
                      <span>Edit</span>
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default ImpactTolerancesList;
