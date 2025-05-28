
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AuditTrailExportProps {
  orgId: string;
}

const AuditTrailExport: React.FC<AuditTrailExportProps> = ({ orgId }) => {
  const [selectedModule, setSelectedModule] = useState<string>("all");
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  const modules = [
    { value: "all", label: "All Modules" },
    { value: "governance", label: "Governance" },
    { value: "incident", label: "Incident Management" },
    { value: "risk", label: "Risk Management" },
    { value: "third_party", label: "Third Party Risk" },
    { value: "business_continuity", label: "Business Continuity" },
    { value: "controls", label: "Controls & KRIs" }
  ];

  const exportAuditTrail = async () => {
    setIsExporting(true);
    try {
      const { auditService } = await import("@/services/audit-service");
      const auditTrail = await auditService.getAuditTrailByModule(orgId, selectedModule === "all" ? undefined : selectedModule);
      
      // Generate CSV content
      const csvHeaders = [
        'Finding Reference',
        'Finding Title',
        'Severity',
        'Module',
        'Status',
        'Created Date',
        'Due Date',
        'Assigned To',
        'Regulator Comments',
        'Internal Response',
        'Corrective Actions',
        'Associated Tasks'
      ];

      const csvRows = auditTrail.map(finding => [
        finding.finding_reference,
        finding.finding_title,
        finding.severity,
        finding.module_affected,
        finding.status,
        new Date(finding.created_at).toLocaleDateString(),
        finding.due_date ? new Date(finding.due_date).toLocaleDateString() : '',
        finding.assigned_to_name || '',
        finding.regulator_comments || '',
        finding.internal_response || '',
        finding.corrective_actions || '',
        finding.audit_tasks?.length || 0
      ]);

      const csvContent = [
        csvHeaders.join(','),
        ...csvRows.map(row => row.map(field => `"${field}"`).join(','))
      ].join('\n');

      // Download file
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `audit-trail-${selectedModule === "all" ? 'all-modules' : selectedModule}-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);

      toast({
        title: "Export completed",
        description: "Audit trail has been exported successfully."
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Export failed",
        description: "There was an error exporting the audit trail. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Export Audit Trail
        </CardTitle>
        <CardDescription>
          Export compliance findings and audit trail by module for regulatory reporting.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Module Filter</label>
            <Select value={selectedModule} onValueChange={setSelectedModule}>
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select module to export" />
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

          <Button onClick={exportAuditTrail} disabled={isExporting} className="w-full">
            <Download className="h-4 w-4 mr-2" />
            {isExporting ? "Exporting..." : "Export to CSV"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default AuditTrailExport;
