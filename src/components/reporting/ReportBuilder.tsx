
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Save, ArrowLeft, Plus, Trash2, GripVertical } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { reportingService, ReportTemplate, DataBlock } from "@/services/reporting-service";

interface ReportBuilderProps {
  templateId?: string | null;
  onClose: () => void;
}

const ReportBuilder: React.FC<ReportBuilderProps> = ({ templateId, onClose }) => {
  const [template, setTemplate] = useState<Partial<ReportTemplate>>({
    template_name: '',
    template_type: 'custom',
    description: '',
    template_config: {},
    data_blocks: [],
    layout_config: { orientation: 'portrait', margins: { top: 20, bottom: 20, left: 20, right: 20 } },
    is_system_template: false,
    is_active: true
  });
  const [availableBlocks, setAvailableBlocks] = useState<DataBlock[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadAvailableBlocks();
    if (templateId) {
      loadTemplate();
    }
  }, [templateId]);

  const loadAvailableBlocks = () => {
    const blocks = reportingService.getAvailableDataBlocks();
    setAvailableBlocks(blocks);
  };

  const loadTemplate = async () => {
    if (!templateId) return;
    
    try {
      const data = await reportingService.getReportTemplate(templateId);
      if (data) {
        setTemplate(data);
      }
    } catch (error) {
      console.error('Error loading template:', error);
      toast({ title: "Error", description: "Failed to load template", variant: "destructive" });
    }
  };

  const handleSaveTemplate = async () => {
    try {
      setLoading(true);
      
      if (!template.template_name?.trim()) {
        toast({ title: "Error", description: "Template name is required", variant: "destructive" });
        return;
      }

      if (templateId) {
        await reportingService.updateReportTemplate(templateId, template);
        toast({ title: "Success", description: "Template updated successfully" });
      } else {
        await reportingService.createReportTemplate(template as Omit<ReportTemplate, 'id' | 'created_at' | 'updated_at'>);
        toast({ title: "Success", description: "Template created successfully" });
      }
      
      onClose();
    } catch (error) {
      console.error('Error saving template:', error);
      toast({ title: "Error", description: "Failed to save template", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleAddBlock = (blockType: string) => {
    const availableBlock = availableBlocks.find(block => block.type === blockType);
    if (!availableBlock) return;

    const newBlock: DataBlock = {
      id: `${blockType}_${Date.now()}`,
      type: blockType,
      title: availableBlock.title,
      required: false,
      config: {},
      position: { x: 0, y: template.data_blocks?.length || 0 },
      size: { width: 12, height: 4 }
    };

    setTemplate(prev => ({
      ...prev,
      data_blocks: [...(prev.data_blocks || []), newBlock]
    }));
  };

  const handleRemoveBlock = (blockId: string) => {
    setTemplate(prev => ({
      ...prev,
      data_blocks: prev.data_blocks?.filter(block => block.id !== blockId) || []
    }));
  };

  const handleUpdateBlock = (blockId: string, updates: Partial<DataBlock>) => {
    setTemplate(prev => ({
      ...prev,
      data_blocks: prev.data_blocks?.map(block => 
        block.id === blockId ? { ...block, ...updates } : block
      ) || []
    }));
  };

  const handleMoveBlock = (blockId: string, direction: 'up' | 'down') => {
    const blocks = [...(template.data_blocks || [])];
    const index = blocks.findIndex(block => block.id === blockId);
    
    if (index === -1) return;
    
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= blocks.length) return;

    [blocks[index], blocks[newIndex]] = [blocks[newIndex], blocks[index]];
    
    setTemplate(prev => ({
      ...prev,
      data_blocks: blocks
    }));
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onClose}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-3xl font-bold">
              {templateId ? 'Edit Template' : 'Create Report Template'}
            </h1>
            <p className="text-muted-foreground">
              Configure your report template with drag-and-drop data blocks
            </p>
          </div>
        </div>
        <Button onClick={handleSaveTemplate} disabled={loading}>
          <Save className="h-4 w-4 mr-2" />
          {loading ? 'Saving...' : 'Save Template'}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Template Configuration */}
        <div className="lg:col-span-1 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Template Settings</CardTitle>
              <CardDescription>Configure basic template properties</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="template-name">Template Name</Label>
                <Input
                  id="template-name"
                  value={template.template_name || ''}
                  onChange={(e) => setTemplate(prev => ({ ...prev, template_name: e.target.value }))}
                  placeholder="Enter template name"
                />
              </div>

              <div>
                <Label htmlFor="template-type">Template Type</Label>
                <Select
                  value={template.template_type || 'custom'}
                  onValueChange={(value) => setTemplate(prev => ({ ...prev, template_type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="custom">Custom</SelectItem>
                    <SelectItem value="executive_summary">Executive Summary</SelectItem>
                    <SelectItem value="osfi_e21">OSFI E-21</SelectItem>
                    <SelectItem value="department_status">Department Status</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={template.description || ''}
                  onChange={(e) => setTemplate(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe this template"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Available Blocks */}
          <Card>
            <CardHeader>
              <CardTitle>Available Data Blocks</CardTitle>
              <CardDescription>Drag or click to add blocks to your report</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {availableBlocks.map((block) => (
                  <div
                    key={block.id}
                    className="flex items-center justify-between p-2 border rounded hover:bg-muted cursor-pointer"
                    onClick={() => handleAddBlock(block.type)}
                  >
                    <span className="text-sm font-medium">{block.title}</span>
                    <Plus className="h-4 w-4" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Report Layout */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Report Layout</CardTitle>
              <CardDescription>
                Configure the layout and order of your report blocks
              </CardDescription>
            </CardHeader>
            <CardContent>
              {template.data_blocks?.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <p>No data blocks added yet.</p>
                  <p className="text-sm">Add blocks from the sidebar to start building your report.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {template.data_blocks?.map((block, index) => (
                    <div
                      key={block.id}
                      className="flex items-center gap-4 p-4 border rounded-lg bg-muted/50"
                    >
                      <div className="flex flex-col gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleMoveBlock(block.id, 'up')}
                          disabled={index === 0}
                        >
                          ↑
                        </Button>
                        <GripVertical className="h-4 w-4 text-muted-foreground" />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleMoveBlock(block.id, 'down')}
                          disabled={index === (template.data_blocks?.length || 0) - 1}
                        >
                          ↓
                        </Button>
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Input
                            value={block.title}
                            onChange={(e) => handleUpdateBlock(block.id, { title: e.target.value })}
                            className="font-medium"
                          />
                          <Badge variant="outline">{block.type}</Badge>
                          {block.required && <Badge variant="default">Required</Badge>}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>Position: {index + 1}</span>
                          <span>Type: {block.type}</span>
                        </div>
                      </div>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveBlock(block.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ReportBuilder;
