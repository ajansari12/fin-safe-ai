
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowRight, FileText, Shield, TrendingUp } from 'lucide-react';
import { RiskAppetiteStatement } from '@/pages/risk-management/types';
import { format } from 'date-fns';

interface RiskAppetiteOverviewProps {
  statements: RiskAppetiteStatement[];
  onViewStatement: (id: string) => void;
  onCreateNew: () => void;
  isLoading: boolean;
}

const RiskAppetiteOverview = ({ statements, onViewStatement, onCreateNew, isLoading }: RiskAppetiteOverviewProps) => {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="animate-pulse space-y-3">
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-3 bg-muted rounded w-1/2"></div>
                <div className="h-3 bg-muted rounded w-1/4"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (statements.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-12">
          <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-medium">No risk appetite statements</h3>
          <p className="mt-2 text-sm text-muted-foreground max-w-sm mx-auto">
            Create your first risk appetite statement to define your organization's tolerance for different types of risk.
          </p>
          <Button className="mt-4" onClick={onCreateNew}>
            <FileText className="mr-2 h-4 w-4" />
            Create Statement
          </Button>
        </CardContent>
      </Card>
    );
  }

  const activeStatements = statements.filter(s => s.status === 'active');
  const draftStatements = statements.filter(s => s.status === 'draft');

  const handleViewDetails = (id: string) => {
    // Use the new detailed view route
    window.location.href = `/app/risk-appetite/detail/${id}`;
  };

  return (
    <div className="space-y-6">
      {/* Active Statements */}
      {activeStatements.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium flex items-center">
              <Shield className="mr-2 h-5 w-5 text-green-600" />
              Active Statements
            </h3>
            <Badge variant="default">{activeStatements.length}</Badge>
          </div>
          <div className="space-y-4">
            {activeStatements.map((statement) => (
              <Card key={statement.id} className="border-green-200">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center">
                        <h4 className="text-lg font-medium">{statement.title}</h4>
                        <Badge className="ml-2 bg-green-100 text-green-800">
                          Version {statement.version}
                        </Badge>
                      </div>
                      {statement.description && (
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {statement.description}
                        </p>
                      )}
                      <div className="flex items-center mt-3 text-xs text-muted-foreground">
                        <TrendingUp className="mr-1 h-3 w-3" />
                        Last updated {format(new Date(statement.updated_at), 'MMM d, yyyy')}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleViewDetails(statement.id)}
                      >
                        View Details
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => onViewStatement(statement.id)}
                      >
                        Edit
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Draft Statements */}
      {draftStatements.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium flex items-center">
              <FileText className="mr-2 h-5 w-5 text-yellow-600" />
              Draft Statements
            </h3>
            <Badge variant="outline">{draftStatements.length}</Badge>
          </div>
          <div className="space-y-4">
            {draftStatements.map((statement) => (
              <Card key={statement.id} className="border-yellow-200">
                <CardContent className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center">
                        <h4 className="text-lg font-medium">{statement.title}</h4>
                        <Badge variant="outline" className="ml-2">
                          Draft
                        </Badge>
                      </div>
                      {statement.description && (
                        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                          {statement.description}
                        </p>
                      )}
                      <div className="text-xs text-muted-foreground mt-3">
                        Created {format(new Date(statement.created_at), 'MMM d, yyyy')}
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => onViewStatement(statement.id)}
                    >
                      Continue Editing
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default RiskAppetiteOverview;
