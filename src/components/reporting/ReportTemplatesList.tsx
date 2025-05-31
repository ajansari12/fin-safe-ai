
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Edit, Trash2, Copy, Search, Play } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { reportingService, ReportTemplate } from "@/services/reporting-service";

interface ReportTemplatesListProps {
  onEditTemplate: (templateId: string) => void;
}

const ReportTemplatesList: React.FC<ReportTemplatesListProps> = ({ onEditTemplate }) => {
  const [templates, setTemplates] = useState<ReportTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const data = await reportingService.getReportTemplates();
      setTemplates(data);
    } catch (error) {
      console.error('Error loading templates:', error);
      toast({ title: "Error", description: "Failed to load report templates", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTemplate = async (id: string) => {
    try {
      await reportingService.deleteReportTemplate(id);
      toast({ title: "Success", description: "Template deleted successfully" });
      loadTemplates();
    } catch (error) {
      console.error('Error deleting template:', error);
      toast({ title: "Error", description: "Failed to delete template", variant: "destructive" });
    }
  };

  const handleDuplicateTemplate = async (template: ReportTemplate) => {
    try {
      const duplicateTemplate = {
        template_name: `${template.template_name} (Copy)`,
        template_type: template.template_type,
        description: template.description,
        template_config: template.template_config,
        data_blocks: template.data_blocks,
        layout_config: template.layout_config,
        is_system_template: false,
        is_active: true
      };

      await reportingService.createReportTemplate(duplicateTemplate);
      toast({ title: "Success", description: "Template duplicated successfully" });
      loadTemplates();
    } catch (error) {
      console.error('Error duplicating template:', error);
      toast({ title: "Error", description: "Failed to duplicate template", variant: "destructive" });
    }
  };

  const handleGenerateReport = async (template: ReportTemplate) => {
    try {
      const reportData = await reportingService.generateReportData(template.id);
      const instance = {
        template_id: template.id,
        instance_name: `${template.template_name} - ${new Date().toLocaleDateString()}`,
        report_data: reportData,
        generated_by: null,
        generated_by_name: null,
        generation_date: new Date().toISOString(),
        report_period_start: null,
        report_period_end: null,
        status: 'generated',
        file_path: null,
        file_size: null,
        scheduled_delivery: null,
        email_recipients: []
      };
      
      await reportingService.createReportInstance(instance);
      toast({ title: "Success", description: "Report generated successfully" });
    } catch (error) {
      console.error('Error generating report:', error);
      toast({ title: "Error", description: "Failed to generate report", variant: "destructive" });
    }
  };

  const filteredTemplates = templates.filter(template =>
    template.template_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    template.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getTemplateTypeLabel = (type: string) => {
    switch (type) {
      case 'executive_summary': return 'Executive Summary';
      case 'osfi_e21': return 'OSFI E-21';
      case 'department_status': return 'Department Status';
      default: return 'Custom';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Report Templates</CardTitle>
          <CardDescription>Loading templates...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">Loading report templates...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Report Templates</CardTitle>
        <CardDescription>
          Manage report templates including system templates and custom templates
        </CardDescription>
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
        </div>

        {filteredTemplates.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No templates found.</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Template Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Data Blocks</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTemplates.map((template) => (
                <TableRow key={template.id}>
                  <TableCell className="font-medium">{template.template_name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {getTemplateTypeLabel(template.template_type)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {template.data_blocks?.length || 0} blocks
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-xs truncate">
                    {template.description || 'No description'}
                  </TableCell>
                  <TableCell>
                    <Badge variant={template.is_system_template ? "default" : "outline"}>
                      {template.is_system_template ? "System" : "Custom"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleGenerateReport(template)}
                        title="Generate Report"
                      >
                        <Play className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEditTemplate(template.id)}
                        title="Edit Template"
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDuplicateTemplate(template)}
                        title="Duplicate Template"
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                      {!template.is_system_template && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteTemplate(template.id)}
                          title="Delete Template"
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      )}
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

export default ReportTemplatesList;
