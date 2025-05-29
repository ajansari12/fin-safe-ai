
import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, FileText, Plus } from "lucide-react";
import { ControlTest } from "@/services/control-tests";
import { format } from "date-fns";

interface ControlTestsListProps {
  tests: ControlTest[];
  controlName: string;
  onCreateTest: () => void;
  onBack: () => void;
  isLoading?: boolean;
}

const ControlTestsList: React.FC<ControlTestsListProps> = ({
  tests,
  controlName,
  onCreateTest,
  onBack,
  isLoading = false
}) => {
  const getResultColor = (result: string) => {
    switch (result) {
      case 'pass':
        return 'bg-green-500';
      case 'fail':
        return 'bg-red-500';
      case 'partial':
        return 'bg-yellow-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getRemediationStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'not_required':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Control Tests</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">Loading control tests...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <Button 
          variant="outline" 
          onClick={onBack}
          className="mb-4"
        >
          ← Back to Controls
        </Button>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Control Tests: {controlName}</h2>
            <p className="text-muted-foreground">
              View and manage test history for this control
            </p>
          </div>
          <Button onClick={onCreateTest} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            New Test
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Test History ({tests.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {tests.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">No tests recorded for this control</p>
              <Button onClick={onCreateTest}>Record First Test</Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Test Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Result</TableHead>
                  <TableHead>Effectiveness</TableHead>
                  <TableHead>Risk Reduction</TableHead>
                  <TableHead>Remediation</TableHead>
                  <TableHead>Tested By</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tests.map((test) => (
                  <TableRow key={test.id}>
                    <TableCell>
                      {format(new Date(test.test_date), 'MMM dd, yyyy')}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {test.test_type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {test.test_method}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getResultColor(test.test_result)}>
                        {test.test_result}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {test.effectiveness_rating ? (
                        <div className="flex items-center">
                          <span className="text-sm">{test.effectiveness_rating}/5</span>
                          <div className="ml-2 w-16 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${(test.effectiveness_rating / 5) * 100}%` }}
                            />
                          </div>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {test.risk_reduction_impact ? (
                        <div className="flex items-center">
                          <span className="text-sm">{test.risk_reduction_impact}/10</span>
                          <div className="ml-2 w-16 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-green-600 h-2 rounded-full" 
                              style={{ width: `${(test.risk_reduction_impact / 10) * 100}%` }}
                            />
                          </div>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge className={getRemediationStatusColor(test.remediation_status)}>
                        {test.remediation_status.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {test.tested_by_name || <span className="text-muted-foreground">-</span>}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {tests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Test Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {tests.filter(t => t.test_result === 'pass').length}
                </div>
                <div className="text-sm text-muted-foreground">Passed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {tests.filter(t => t.test_result === 'fail').length}
                </div>
                <div className="text-sm text-muted-foreground">Failed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {tests.filter(t => t.test_result === 'partial').length}
                </div>
                <div className="text-sm text-muted-foreground">Partial</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {tests.length > 0 
                    ? Math.round((tests.filter(t => t.test_result === 'pass').length / tests.length) * 100)
                    : 0}%
                </div>
                <div className="text-sm text-muted-foreground">Success Rate</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ControlTestsList;
