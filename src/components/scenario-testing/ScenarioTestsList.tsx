
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Edit, Trash2, Download, Play, FileDown } from "lucide-react";
import { getScenarioTests, ScenarioTest } from "@/services/scenario-testing-service";
import { generateScenarioTestPDF } from "@/services/scenario-pdf-service";
import { format } from "date-fns";
import { toast } from "sonner";

const SEVERITY_COLORS = {
  low: 'secondary',
  medium: 'default',
  high: 'destructive',
  critical: 'destructive'
} as const;

const STATUS_COLORS = {
  draft: 'secondary',
  in_progress: 'default',
  completed: 'default',
  archived: 'outline'
} as const;

const OUTCOME_COLORS = {
  successful: 'default',
  partial: 'secondary',
  failed: 'destructive'
} as const;

interface ScenarioTestsListProps {
  onEdit: (scenario: ScenarioTest) => void;
  onDelete: (id: string) => void;
  onContinue: (scenario: ScenarioTest) => void;
}

const ScenarioTestsList: React.FC<ScenarioTestsListProps> = ({
  onEdit,
  onDelete,
  onContinue
}) => {
  const { data: scenarios = [], isLoading } = useQuery({
    queryKey: ['scenarioTests'],
    queryFn: getScenarioTests
  });

  const handleExport = async (scenario: ScenarioTest) => {
    try {
      await generateScenarioTestPDF(scenario);
      toast.success("Scenario test report exported successfully");
    } catch (error) {
      console.error("Export failed:", error);
      toast.error("Failed to export scenario test report");
    }
  };

  const handleExportAll = async () => {
    try {
      for (const scenario of scenarios.slice(0, 5)) { // Limit to first 5
        await generateScenarioTestPDF(scenario);
        await new Promise(resolve => setTimeout(resolve, 1000)); // Add delay
      }
      toast.success(`Exported ${Math.min(scenarios.length, 5)} scenario test reports`);
    } catch (error) {
      console.error("Bulk export failed:", error);
      toast.error("Failed to export scenario test reports");
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Scenario Tests</CardTitle>
            <CardDescription>
              Manage and review your scenario testing activities.
            </CardDescription>
          </div>
          {scenarios.length > 0 && (
            <Button variant="outline" onClick={handleExportAll} className="flex items-center gap-2">
              <FileDown className="h-4 w-4" />
              Export All
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        {scenarios.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground">No scenario tests created yet.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Disruption Type</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Outcome</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {scenarios.map((scenario) => (
                <TableRow key={scenario.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{scenario.title}</div>
                      {scenario.description && (
                        <div className="text-sm text-muted-foreground truncate max-w-xs">
                          {scenario.description}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{scenario.disruption_type}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={SEVERITY_COLORS[scenario.severity_level as keyof typeof SEVERITY_COLORS]}>
                      {scenario.severity_level}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={STATUS_COLORS[scenario.status as keyof typeof STATUS_COLORS]}>
                      {scenario.status.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      Step {scenario.current_step} of 6
                    </div>
                  </TableCell>
                  <TableCell>
                    {scenario.outcome && (
                      <Badge variant={OUTCOME_COLORS[scenario.outcome as keyof typeof OUTCOME_COLORS]}>
                        {scenario.outcome}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {format(new Date(scenario.created_at), 'MMM dd, yyyy')}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      {scenario.status !== 'completed' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onContinue(scenario)}
                        >
                          <Play className="h-3 w-3" />
                          <span className="sr-only">Continue</span>
                        </Button>
                      )}
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(scenario)}
                      >
                        <Edit className="h-3 w-3" />
                        <span className="sr-only">Edit</span>
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleExport(scenario)}
                      >
                        <Download className="h-3 w-3" />
                        <span className="sr-only">Export PDF</span>
                      </Button>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDelete(scenario.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                        <span className="sr-only">Delete</span>
                      </Button>
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

export default ScenarioTestsList;
