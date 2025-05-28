
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Edit, Trash2, Copy, Search, Filter, Plus, Play } from "lucide-react";
import { WorkflowTemplate } from "@/services/workflow-service";

interface WorkflowTemplatesListProps {
  templates: WorkflowTemplate[];
  onEdit: (template: WorkflowTemplate) => void;
  onDelete: (id: string) => void;
  onDuplicate: (template: WorkflowTemplate) => void;
  onCreateInstance: (template: WorkflowTemplate) => void;
  onCreateNew: () => void;
  loading?: boolean;
}

const modules = [
  { value: "all", label: "All Modules" },
  { value: "governance", label: "Governance" },
  { value: "incident", label: "Incident Management" },
  { value: "audit", label: "Audit & Compliance" },
  { value: "risk", label: "Risk Management" },
  { value: "third_party", label: "Third Party Risk" },
  { value: "business_continuity", label: "Business Continuity" },
  { value: "controls", label: "Controls & KRIs" },
  { value: "compliance", label: "Compliance" }
];

const WorkflowTemplatesList: React.FC<WorkflowTemplatesListProps> = ({
  templates,
  onEdit,
  onDelete,
  onDuplicate,
  onCreateInstance,
  onCreateNew,
  loading
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedModule, setSelectedModule] = useState("all");

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesModule = selectedModule === "all" || template.module === selectedModule;
    return matchesSearch && matchesModule;
  });

  const getModuleLabel = (module: string) => {
    const moduleInfo = modules.find(m => m.value === module);
    return moduleInfo?.label || module;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Workflow Templates</CardTitle>
          <CardDescription>Loading templates...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">Loading workflow templates...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Workflow Templates</CardTitle>
            <CardDescription>
              Manage reusable workflow templates across all modules
            </CardDescription>
          </div>
          <Button onClick={onCreateNew}>
            <Plus className="h-4 w-4 mr-2" />
            Create Template
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search templates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="w-48">
            <Select value={selectedModule} onValueChange={setSelectedModule}>
              <SelectTrigger>
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue />
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
        </div>

        {filteredTemplates.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {templates.length === 0 ? (
              <div>
                <p className="mb-4">No workflow templates found.</p>
                <Button onClick={onCreateNew}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Template
                </Button>
              </div>
            ) : (
              <p>No templates match your search criteria.</p>
            )}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Template Name</TableHead>
                <TableHead>Module</TableHead>
                <TableHead>Steps</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTemplates.map((template) => (
                <TableRow key={template.id}>
                  <TableCell className="font-medium">{template.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {getModuleLabel(template.module)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {template.steps?.length || 0} steps
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-xs truncate">
                    {template.description || 'No description'}
                  </TableCell>
                  <TableCell>
                    {new Date(template.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onCreateInstance(template)}
                        title="Create Instance"
                      >
                        <Play className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(template)}
                        title="Edit Template"
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDuplicate(template)}
                        title="Duplicate Template"
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDelete(template.id)}
                        title="Delete Template"
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-3 w-3" />
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

export default WorkflowTemplatesList;
