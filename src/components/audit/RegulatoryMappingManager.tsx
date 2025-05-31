
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, MapPin, AlertTriangle, CheckCircle, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { enhancedAuditService, RegulatoryMapping } from "@/services/enhanced-audit-service";
import RegulatoryMappingForm from "./RegulatoryMappingForm";

interface RegulatoryMappingManagerProps {
  orgId: string;
}

const RegulatoryMappingManager: React.FC<RegulatoryMappingManagerProps> = ({ orgId }) => {
  const { toast } = useToast();
  const [mappings, setMappings] = useState<RegulatoryMapping[]>([]);
  const [filteredMappings, setFilteredMappings] = useState<RegulatoryMapping[]>([]);
  const [activeFramework, setActiveFramework] = useState<string>("all");
  const [showForm, setShowForm] = useState(false);
  const [selectedMapping, setSelectedMapping] = useState<RegulatoryMapping | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMappings();
  }, [orgId]);

  useEffect(() => {
    if (activeFramework === "all") {
      setFilteredMappings(mappings);
    } else {
      setFilteredMappings(mappings.filter(m => m.regulatory_framework === activeFramework));
    }
  }, [mappings, activeFramework]);

  const loadMappings = async () => {
    try {
      const data = await enhancedAuditService.getRegulatoryMappings(orgId);
      setMappings(data);
    } catch (error) {
      console.error('Error loading regulatory mappings:', error);
      toast({
        title: "Error",
        description: "Failed to load regulatory mappings",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMappingSuccess = () => {
    setShowForm(false);
    setSelectedMapping(null);
    loadMappings();
    toast({
      title: "Success",
      description: "Regulatory mapping saved successfully"
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'compliant':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'non_compliant':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'partial':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'compliant': return 'default';
      case 'non_compliant': return 'destructive';
      case 'partial': return 'outline';
      default: return 'secondary';
    }
  };

  const getSeverityBadgeVariant = (severity: string) => {
    switch (severity) {
      case 'high': return 'destructive';
      case 'medium': return 'outline';
      case 'low': return 'secondary';
      default: return 'outline';
    }
  };

  const frameworkCounts = {
    OSFI_B10: mappings.filter(m => m.regulatory_framework === 'OSFI_B10').length,
    OSFI_B13: mappings.filter(m => m.regulatory_framework === 'OSFI_B13').length,
    OSFI_E21: mappings.filter(m => m.regulatory_framework === 'OSFI_E21').length,
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading regulatory mappings...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Regulatory Mapping</h3>
          <p className="text-sm text-muted-foreground">
            Map audit findings to regulatory requirements
          </p>
        </div>
        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogTrigger asChild>
            <Button onClick={() => setSelectedMapping(null)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Mapping
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>
                {selectedMapping ? 'Edit Regulatory Mapping' : 'Create Regulatory Mapping'}
              </DialogTitle>
              <DialogDescription>
                Map findings to specific regulatory requirements for compliance tracking.
              </DialogDescription>
            </DialogHeader>
            <RegulatoryMappingForm
              orgId={orgId}
              mapping={selectedMapping}
              onSuccess={handleMappingSuccess}
              onCancel={() => setShowForm(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Framework Overview
          </CardTitle>
          <CardDescription>
            Compliance status across regulatory frameworks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{frameworkCounts.OSFI_B10}</div>
              <div className="text-sm text-muted-foreground">OSFI B-10</div>
              <div className="text-xs text-muted-foreground">Outsourcing</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-green-600">{frameworkCounts.OSFI_B13}</div>
              <div className="text-sm text-muted-foreground">OSFI B-13</div>
              <div className="text-xs text-muted-foreground">Technology Risk</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-purple-600">{frameworkCounts.OSFI_E21}</div>
              <div className="text-sm text-muted-foreground">OSFI E-21</div>
              <div className="text-xs text-muted-foreground">Operational Risk</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Regulatory Mappings</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeFramework} onValueChange={setActiveFramework}>
            <TabsList>
              <TabsTrigger value="all">All Frameworks</TabsTrigger>
              <TabsTrigger value="OSFI_B10">OSFI B-10</TabsTrigger>
              <TabsTrigger value="OSFI_B13">OSFI B-13</TabsTrigger>
              <TabsTrigger value="OSFI_E21">OSFI E-21</TabsTrigger>
            </TabsList>

            <TabsContent value={activeFramework} className="mt-4">
              {filteredMappings.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Framework</TableHead>
                      <TableHead>Section</TableHead>
                      <TableHead>Requirement</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Severity</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Target Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredMappings.map((mapping) => (
                      <TableRow key={mapping.id}>
                        <TableCell>
                          <Badge variant="outline">
                            {mapping.regulatory_framework.replace('_', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">
                          {mapping.requirement_section}
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{mapping.requirement_title}</div>
                            {mapping.requirement_description && (
                              <div className="text-xs text-muted-foreground line-clamp-2">
                                {mapping.requirement_description}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(mapping.compliance_status)}
                            <Badge variant={getStatusBadgeVariant(mapping.compliance_status)}>
                              {mapping.compliance_status.replace('_', ' ')}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getSeverityBadgeVariant(mapping.gap_severity)}>
                            {mapping.gap_severity}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getSeverityBadgeVariant(mapping.remediation_priority)}>
                            {mapping.remediation_priority}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {mapping.target_completion_date ? 
                            new Date(mapping.target_completion_date).toLocaleDateString() : 
                            'Not set'
                          }
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedMapping(mapping);
                              setShowForm(true);
                            }}
                          >
                            Edit
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No regulatory mappings found for {activeFramework === 'all' ? 'any framework' : activeFramework.replace('_', ' ')}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default RegulatoryMappingManager;
