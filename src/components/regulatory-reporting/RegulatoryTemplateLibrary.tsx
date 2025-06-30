
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  FileText, 
  Plus, 
  Edit, 
  Copy, 
  Download, 
  Settings,
  Shield,
  AlertTriangle,
  CheckCircle
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { regulatoryReportingService } from "@/services/regulatory-reporting-service";
import { useToast } from "@/hooks/use-toast";

const RegulatoryTemplateLibrary: React.FC = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<any>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: templates = [], isLoading } = useQuery({
    queryKey: ['regulatory-templates'],
    queryFn: () => regulatoryReportingService.getReportTemplates(),
  });

  const createTemplateMutation = useMutation({
    mutationFn: (templateData: any) => regulatoryReportingService.createReportTemplate(templateData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['regulatory-templates'] });
      setIsCreateDialogOpen(false);
      toast({
        title: "Template created",
        description: "Report template has been created successfully.",
      });
    },
  });

  const generateReportMutation = useMutation({
    mutationFn: (templateId: string) => regulatoryReportingService.generateReport(templateId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['regulatory-report-instances'] });
      toast({
        title: "Report generated",
        description: "Report has been generated successfully.",
      });
    },
  });

  const handleCreateTemplate = (formData: FormData) => {
    const templateData = {
      org_id: '', // Will be set by service
      template_name: formData.get('template_name') as string,
      template_type: formData.get('template_type') as any,
      description: formData.get('description') as string,
      template_config: {},
      data_blocks: [],
      layout_config: {},
      is_system_template: false,
      is_active: true,
      version: 1,
      created_by: null
    };

    createTemplateMutation.mutate(templateData);
  };

  const getTemplateTypeColor = (type: string) => {
    switch (type) {
      case 'osfi_e21': return 'bg-red-100 text-red-800';
      case 'operational_risk': return 'bg-orange-100 text-orange-800';
      case 'compliance_summary': return 'bg-blue-100 text-blue-800';
      case 'custom': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTemplateTypeIcon = (type: string) => {
    switch (type) {
      case 'osfi_e21': return <Shield className="h-4 w-4" />;
      case 'operational_risk': return <AlertTriangle className="h-4 w-4" />;
      case 'compliance_summary': return <CheckCircle className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="h-16 bg-gray-200 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Report Template Library</h2>
          <p className="text-muted-foreground">
            Pre-built and custom templates for regulatory reporting
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Template
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Report Template</DialogTitle>
              <DialogDescription>
                Create a custom report template for your regulatory reporting needs.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={(e) => {
              e.preventDefault();
              handleCreateTemplate(new FormData(e.currentTarget));
            }} className="space-y-4">
              <div>
                <Label htmlFor="template_name">Template Name</Label>
                <Input
                  id="template_name"
                  name="template_name"
                  placeholder="Enter template name"
                  required
                />
              </div>
              <div>
                <Label htmlFor="template_type">Template Type</Label>
                <Select name="template_type" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select template type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="osfi_e21">OSFI E-21 Compliance</SelectItem>
                    <SelectItem value="operational_risk">Operational Risk</SelectItem>
                    <SelectItem value="compliance_summary">Compliance Summary</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Describe the template purpose and usage"
                  rows={3}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreateDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={createTemplateMutation.isPending}>
                  {createTemplateMutation.isPending ? "Creating..." : "Create Template"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((template) => (
          <Card key={template.id} className="relative">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  {getTemplateTypeIcon(template.template_type)}
                  <CardTitle className="text-lg">{template.template_name}</CardTitle>
                </div>
                <div className="flex items-center gap-1">
                  {template.is_system_template && (
                    <Badge variant="secondary" className="text-xs">System</Badge>
                  )}
                  <Badge className={`text-xs ${getTemplateTypeColor(template.template_type)}`}>
                    {template.template_type.replace('_', ' ').toUpperCase()}
                  </Badge>
                </div>
              </div>
              <CardDescription>
                {template.description || 'No description provided'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Version:</span>
                  <span className="font-medium">v{template.version}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Data Blocks:</span>
                  <span className="font-medium">{template.data_blocks.length}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Status:</span>
                  <Badge variant={template.is_active ? "default" : "secondary"}>
                    {template.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button
                    size="sm"
                    onClick={() => generateReportMutation.mutate(template.id)}
                    disabled={generateReportMutation.isPending}
                  >
                    <FileText className="h-4 w-4 mr-1" />
                    Generate
                  </Button>
                  <Button size="sm" variant="outline">
                    <Copy className="h-4 w-4 mr-1" />
                    Clone
                  </Button>
                  <Button size="sm" variant="outline">
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {templates.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No Templates Found</h3>
            <p className="text-muted-foreground mb-4">
              Get started by creating your first report template.
            </p>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Template
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default RegulatoryTemplateLibrary;
