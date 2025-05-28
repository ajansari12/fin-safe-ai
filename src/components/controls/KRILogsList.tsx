import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, AlertTriangle } from "lucide-react";
import { KRILog } from "@/services/kri-logs";

interface KRILogsListProps {
  logs: KRILog[];
  kriName: string;
  onCreateLog: () => void;
  isLoading?: boolean;
}

const KRILogsList: React.FC<KRILogsListProps> = ({
  logs,
  kriName,
  onCreateLog,
  isLoading = false
}) => {
  const getThresholdColor = (threshold?: string) => {
    switch (threshold) {
      case 'warning':
        return 'bg-yellow-500';
      case 'critical':
        return 'bg-red-500';
      default:
        return 'bg-green-500';
    }
  };

  const getThresholdText = (threshold?: string) => {
    switch (threshold) {
      case 'warning':
        return 'Warning';
      case 'critical':
        return 'Critical';
      default:
        return 'Normal';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>KRI Measurements - {kriName}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">Loading measurements...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>KRI Measurements - {kriName} ({logs.length})</CardTitle>
        <Button onClick={onCreateLog} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Log Measurement
        </Button>
      </CardHeader>
      <CardContent>
        {logs.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">No measurements logged yet</p>
            <Button onClick={onCreateLog}>Log your first measurement</Button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Value</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Notes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>
                    {new Date(log.measurement_date).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="font-mono">
                    {log.actual_value}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {log.threshold_breached && (
                        <AlertTriangle className="h-4 w-4 text-yellow-500" />
                      )}
                      <Badge className={getThresholdColor(log.threshold_breached)}>
                        {getThresholdText(log.threshold_breached)}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    {log.notes ? (
                      <span className="text-sm">
                        {log.notes.length > 50 
                          ? `${log.notes.substring(0, 50)}...` 
                          : log.notes}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">No notes</span>
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

export default KRILogsList;
