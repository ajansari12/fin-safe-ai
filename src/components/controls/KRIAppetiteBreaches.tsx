
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertTriangle, TrendingUp } from "lucide-react";
import { getKRIAppetiteBreaches, KRIAppetiteVariance } from "@/services/kri-appetite-service";

const KRIAppetiteBreaches: React.FC = () => {
  const [breaches, setBreaches] = useState<KRIAppetiteVariance[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadBreaches = async () => {
      try {
        setIsLoading(true);
        const data = await getKRIAppetiteBreaches();
        setBreaches(data);
      } catch (error) {
        console.error('Error loading appetite breaches:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadBreaches();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'breach':
        return 'bg-red-500';
      case 'warning':
        return 'bg-yellow-500';
      default:
        return 'bg-green-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'breach':
        return <AlertTriangle className="h-4 w-4" />;
      case 'warning':
        return <TrendingUp className="h-4 w-4" />;
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Appetite Breaches</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">Loading breaches...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Recent Appetite Breaches
          {breaches.length > 0 && (
            <Badge variant="destructive">{breaches.length}</Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {breaches.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No appetite breaches in the last 30 days</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>KRI</TableHead>
                <TableHead>Actual Value</TableHead>
                <TableHead>Variance</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {breaches.map((breach) => (
                <TableRow key={breach.id}>
                  <TableCell>
                    {new Date(breach.measurement_date).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">
                      {(breach as any).kri_definitions?.name || 'Unknown KRI'}
                    </div>
                  </TableCell>
                  <TableCell className="font-mono">
                    {breach.actual_value}
                  </TableCell>
                  <TableCell>
                    {breach.variance_percentage ? (
                      <span className={`font-mono ${breach.variance_percentage > 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {breach.variance_percentage > 0 ? '+' : ''}{breach.variance_percentage.toFixed(1)}%
                      </span>
                    ) : (
                      <span className="text-muted-foreground">N/A</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(breach.variance_status)}
                      <Badge className={getStatusColor(breach.variance_status)}>
                        {breach.variance_status.replace('_', ' ')}
                      </Badge>
                    </div>
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

export default KRIAppetiteBreaches;
