
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import AuthenticatedLayout from "@/components/layout/AuthenticatedLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, FileText, AlertTriangle, Check, ArrowRightCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { getRiskAppetiteStatements } from "@/services/risk-management-service";
import { RiskAppetiteStatement } from "./types";
import { format } from "date-fns";

export default function RiskAppetite() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [statements, setStatements] = useState<RiskAppetiteStatement[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadStatements = async () => {
      setIsLoading(true);
      if (user?.org_id) {
        const data = await getRiskAppetiteStatements(user.org_id);
        setStatements(data);
      }
      setIsLoading(false);
    };
    
    loadStatements();
  }, [user?.org_id]);

  const handleCreateNew = () => {
    navigate("/risk-appetite/create");
  };

  const handleViewStatement = (id: string) => {
    navigate(`/risk-appetite/edit/${id}`);
  };

  return (
    <AuthenticatedLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Risk Appetite</h1>
            <p className="text-muted-foreground">
              Define and manage your organization's risk appetite statements and thresholds.
            </p>
          </div>
          <Button onClick={handleCreateNew}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Create New Statement
          </Button>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Risk Appetite Statements</CardTitle>
            <CardDescription>
              View and manage your organization's risk appetite statements.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">Loading statements...</div>
            ) : statements.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-medium">No risk appetite statements</h3>
                <p className="mt-2 text-sm text-muted-foreground max-w-sm mx-auto">
                  Create your first risk appetite statement to define your organization's tolerance for different types of risk.
                </p>
                <Button className="mt-4" onClick={handleCreateNew}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Create Statement
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {statements.map((statement) => (
                  <div 
                    key={statement.id} 
                    className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                    onClick={() => handleViewStatement(statement.id)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center">
                          <h3 className="text-lg font-medium">{statement.title}</h3>
                          <Badge className="ml-2" variant={
                            statement.status === 'draft' ? 'outline' :
                            statement.status === 'active' ? 'default' : 'secondary'
                          }>
                            {statement.status === 'draft' ? (
                              <span className="flex items-center">
                                <AlertTriangle className="mr-1 h-3 w-3" />
                                Draft
                              </span>
                            ) : statement.status === 'active' ? (
                              <span className="flex items-center">
                                <Check className="mr-1 h-3 w-3" />
                                Active
                              </span>
                            ) : (
                              'Archived'
                            )}
                          </Badge>
                        </div>
                        {statement.description && (
                          <p className="text-sm text-muted-foreground mt-1">{statement.description}</p>
                        )}
                        <div className="text-xs text-muted-foreground mt-2">
                          Version {statement.version} • Last updated {format(new Date(statement.updated_at), 'PPP')}
                        </div>
                      </div>
                      <Button variant="ghost" size="icon">
                        <ArrowRightCircle className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>About Risk Appetite</CardTitle>
              <CardDescription>
                Understanding risk appetite and its importance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm">
                A risk appetite statement defines the amount and type of risk an organization is 
                willing to accept in pursuit of its strategic objectives. It serves as a guide 
                for decision-making throughout the organization.
              </p>
              
              <Separator className="my-4" />
              
              <h4 className="font-medium mb-2">Risk Appetite Process:</h4>
              <ol className="list-decimal list-inside text-sm space-y-1">
                <li>Define risk categories relevant to your organization</li>
                <li>Establish tolerance thresholds for each category</li>
                <li>Set clear escalation triggers for when risks exceed tolerance</li>
                <li>Define KRIs to monitor risk levels effectively</li>
                <li>Review and update regularly</li>
              </ol>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Risk Appetite Framework</CardTitle>
              <CardDescription>
                How your risk appetite statement fits into your governance
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <p>
                Your risk appetite statement is a key component of your overall operational 
                resilience framework. It connects to your governance structures, policies, 
                and controls.
              </p>
              
              <div>
                <h4 className="font-medium mb-1">Related Components:</h4>
                <ul className="list-disc list-inside space-y-1">
                  <li>Governance frameworks</li>
                  <li>Business functions mapping</li>
                  <li>Controls and KRIs</li>
                  <li>Impact tolerances</li>
                </ul>
              </div>
              
              <p>
                When integrated properly, your risk appetite statement helps create a 
                consistent approach to risk management across your organization.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
