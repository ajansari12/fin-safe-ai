
import React from "react";
import { Table, TableBody, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AppetiteBreachLog } from "@/services/appetite-breach-service";
import BreachAlertRow from "./BreachAlertRow";

interface BreachAlertsTableProps {
  breaches: AppetiteBreachLog[];
  onEscalate: (breachId: string, currentLevel: number) => void;
  onAcknowledge: (breachId: string) => void;
  onResolve: (breach: AppetiteBreachLog) => void;
}

const BreachAlertsTable: React.FC<BreachAlertsTableProps> = ({
  breaches,
  onEscalate,
  onAcknowledge,
  onResolve,
}) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Date</TableHead>
          <TableHead>Category</TableHead>
          <TableHead>Severity</TableHead>
          <TableHead>Variance</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Escalation</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {breaches.map((breach) => (
          <BreachAlertRow
            key={breach.id}
            breach={breach}
            onEscalate={onEscalate}
            onAcknowledge={onAcknowledge}
            onResolve={onResolve}
          />
        ))}
      </TableBody>
    </Table>
  );
};

export default BreachAlertsTable;
