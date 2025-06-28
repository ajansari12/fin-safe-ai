
import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Clock, Play, Edit, Trash2, Filter, Search } from "lucide-react";
import { getScenarioTests, ScenarioTest } from "@/services/scenario-testing-service";

interface ScenarioTestsListProps {
  onEdit: (scenario: ScenarioTest) => void;
  onExecute: (scenario: ScenarioTest) => void;
}

const ScenarioTestsList: React.FC<ScenarioTestsListProps> = ({
  onEdit,
  onExecute
}) => {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState("all");
  const [typeFilter, setTypeFilter] = React.useState("all");

  const { data: scenarios = [], isLoading } = useQuery({
    queryKey: ['scenarioTests'],
    queryFn: getScenarioTests
  });

  const filteredScenarios = scenarios.filter(scenario => {
    const matchesSearch = scenario.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         scenario.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || scenario.status === statusFilter;
    const matchesType = typeFilter === "all" || scenario.disruption_type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'secondary';
      case 'scheduled': return 'default';
      case 'in_progress': return 'outline';
      case 'completed': return 'default';
      case 'cancelled': return 'destructive';
      default: return 'secondary';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'secondary';
      case 'medium': return 'default';
      case 'high': return 'destructive';
      case 'critical': return 'destructive';
      default: return 'secondary';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
              <div className="h-3 bg-muted rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search scenarios..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="scheduled">Scheduled</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="Cyber Attack">Cyber Attack</SelectItem>
                <SelectItem value="Natural Disaster">Natural Disaster</SelectItem>
                <SelectItem value="System Failure">System Failure</SelectItem>
                <SelectItem value="Third-Party Failure">Third-Party Failure</SelectItem>
                <SelectItem value="Pandemic">Pandemic</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>

            <div className="text-sm text-muted-foreground flex items-center">
              {filteredScenarios.length} of {scenarios.length} scenarios
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Scenarios List */}
      <div className="space-y-4">
        {filteredScenarios.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">
                {scenarios.length === 0 
                  ? "No scenario tests found. Create your first scenario test to get started."
                  : "No scenarios match your current filters."
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredScenarios.map((scenario) => (
            <Card key={scenario.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold">{scenario.title}</h3>
                      <Badge variant={getStatusColor(scenario.status)}>
                        {scenario.status.replace('_', ' ')}
                      </Badge>
                      <Badge variant={getSeverityColor(scenario.severity_level)}>
                        {scenario.severity_level}
                      </Badge>
                    </div>
                    
                    <p className="text-muted-foreground mb-3">
                      {scenario.description}
                    </p>
                    
                    <div className="flex items-center gap-6 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        Created: {new Date(scenario.created_at).toLocaleDateString()}
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        Type: {scenario.disruption_type}
                      </div>
                      
                      {scenario.completed_at && (
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          Completed: {new Date(scenario.completed_at).toLocaleDateString()}
                        </div>
                      )}
                    </div>

                    {scenario.outcome && (
                      <div className="mt-3 p-3 bg-muted rounded-lg">
                        <h4 className="font-medium text-sm mb-1">Test Outcome</h4>
                        <p className="text-sm text-muted-foreground">{scenario.outcome}</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-col gap-2 ml-4">
                    {scenario.status === 'draft' && (
                      <Button size="sm" onClick={() => onEdit(scenario)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                    )}
                    
                    {['draft', 'scheduled'].includes(scenario.status) && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => onExecute(scenario)}
                      >
                        <Play className="h-4 w-4 mr-2" />
                        Execute
                      </Button>
                    )}
                    
                    {scenario.status === 'completed' && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => onEdit(scenario)}
                      >
                        View Results
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};

export default ScenarioTestsList;
