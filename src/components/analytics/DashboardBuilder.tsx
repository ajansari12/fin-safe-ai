import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Save, Eye, Grid, Settings } from 'lucide-react';
import { dashboardTemplatesService, type DashboardTemplate } from '@/services/analytics-insights-service';
import { useToast } from '@/hooks/use-toast';

interface WidgetConfig {
  id: string;
  type: string;
  title: string;
  position: { x: number; y: number; w: number; h: number };
  data_source: string;
  config: Record<string, any>;
}

const DashboardBuilder: React.FC = () => {
  const [templates, setTemplates] = useState<DashboardTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<DashboardTemplate | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newTemplate, setNewTemplate] = useState({
    template_name: '',
    description: '',
    template_type: 'custom' as 'custom' | 'shared',
    layout_config: { columns: 12, rows: 8, gaps: 16 },
    widget_configs: [] as WidgetConfig[],
    data_sources: [] as string[],
    filters_config: {},
    refresh_interval_minutes: 15,
    is_public: false,
    is_active: true
  });
  const { toast } = useToast();

  const availableWidgets = [
    { type: 'metric', title: 'Metric Card', data_source: 'incidents' },
    { type: 'chart', title: 'Line Chart', data_source: 'trends' },
    { type: 'bar', title: 'Bar Chart', data_source: 'categories' },
    { type: 'heatmap', title: 'Risk Heatmap', data_source: 'risk_posture' },
    { type: 'table', title: 'Data Table', data_source: 'logs' },
    { type: 'gauge', title: 'Gauge Chart', data_source: 'kri' },
    { type: 'pie', title: 'Pie Chart', data_source: 'distribution' }
  ];

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      const data = await dashboardTemplatesService.getTemplates();
      setTemplates(data);
    } catch (error) {
      console.error('Error loading templates:', error);
      toast({
        title: "Error loading templates",
        description: "Failed to load dashboard templates.",
        variant: "destructive"
      });
    }
  };

  const addWidget = (widgetType: string) => {
    const widget = availableWidgets.find(w => w.type === widgetType);
    if (!widget) return;

    const newWidget: WidgetConfig = {
      id: `widget-${Date.now()}`,
      type: widget.type,
      title: widget.title,
      position: { x: 0, y: 0, w: 4, h: 3 },
      data_source: widget.data_source,
      config: {}
    };

    setNewTemplate(prev => ({
      ...prev,
      widget_configs: [...prev.widget_configs, newWidget],
      data_sources: [...new Set([...prev.data_sources, widget.data_source])]
    }));
  };

  const removeWidget = (widgetId: string) => {
    setNewTemplate(prev => ({
      ...prev,
      widget_configs: prev.widget_configs.filter(w => w.id !== widgetId)
    }));
  };

  const saveTemplate = async () => {
    if (!newTemplate.template_name.trim()) {
      toast({
        title: "Template name required",
        description: "Please enter a name for your dashboard template.",
        variant: "destructive"
      });
      return;
    }

    try {
      await dashboardTemplatesService.createTemplate(newTemplate);
      toast({
        title: "Template saved",
        description: "Dashboard template created successfully."
      });
      setIsCreating(false);
      setNewTemplate({
        template_name: '',
        description: '',
        template_type: 'custom',
        layout_config: { columns: 12, rows: 8, gaps: 16 },
        widget_configs: [],
        data_sources: [],
        filters_config: {},
        refresh_interval_minutes: 15,
        is_public: false,
        is_active: true
      });
      await loadTemplates();
    } catch (error) {
      console.error('Error saving template:', error);
      toast({
        title: "Error saving template",
        description: "Failed to save dashboard template.",
        variant: "destructive"
      });
    }
  };

  const useTemplate = async (template: DashboardTemplate) => {
    await dashboardTemplatesService.updateTemplateUsage(template.id);
    setSelectedTemplate(template);
    toast({
      title: "Template applied",
      description: `Using "${template.template_name}" template configuration.`
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Grid className="h-5 w-5" />
              Dashboard Builder
            </CardTitle>
            <Button onClick={() => setIsCreating(!isCreating)} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Create Template
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {!isCreating ? (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-3">Available Templates</h3>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {templates.map((template) => (
                    <Card key={template.id} className="hover:shadow-md transition-shadow">
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-medium">{template.template_name}</h4>
                            <p className="text-sm text-muted-foreground">
                              {template.description || 'No description'}
                            </p>
                          </div>
                          <Badge variant={template.template_type === 'system' ? 'default' : 'secondary'}>
                            {template.template_type}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="flex items-center justify-between">
                          <div className="flex gap-2">
                            <Badge variant="outline" className="text-xs">
                              {template.widget_configs.length} widgets
                            </Badge>
                            <Badge variant="outline" className="text-xs">
                              {template.usage_count} uses
                            </Badge>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => useTemplate(template)}>
                              <Eye className="h-3 w-3" />
                            </Button>
                            <Button size="sm" onClick={() => useTemplate(template)}>
                              Use
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="template_name">Template Name</Label>
                  <Input
                    id="template_name"
                    value={newTemplate.template_name}
                    onChange={(e) => setNewTemplate(prev => ({ ...prev, template_name: e.target.value }))}
                    placeholder="My Dashboard Template"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="template_type">Template Type</Label>
                  <Select
                    value={newTemplate.template_type}
                    onValueChange={(value: 'custom' | 'shared') => 
                      setNewTemplate(prev => ({ ...prev, template_type: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="custom">Custom</SelectItem>
                      <SelectItem value="shared">Shared</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={newTemplate.description}
                  onChange={(e) => setNewTemplate(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Dashboard template description"
                />
              </div>

              <div>
                <h4 className="font-medium mb-3">Add Widgets</h4>
                <div className="flex flex-wrap gap-2 mb-4">
                  {availableWidgets.map((widget) => (
                    <Button
                      key={widget.type}
                      variant="outline"
                      size="sm"
                      onClick={() => addWidget(widget.type)}
                      className="flex items-center gap-2"
                    >
                      <Plus className="h-3 w-3" />
                      {widget.title}
                    </Button>
                  ))}
                </div>

                {newTemplate.widget_configs.length > 0 && (
                  <div className="space-y-2">
                    <h5 className="font-medium">Current Widgets:</h5>
                    <div className="space-y-2">
                      {newTemplate.widget_configs.map((widget) => (
                        <div key={widget.id} className="flex items-center justify-between p-2 border rounded">
                          <div className="flex items-center gap-2">
                            <Settings className="h-4 w-4" />
                            <span>{widget.title}</span>
                            <Badge variant="secondary">{widget.data_source}</Badge>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeWidget(widget.id)}
                          >
                            Remove
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <Button onClick={saveTemplate} className="flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  Save Template
                </Button>
                <Button variant="outline" onClick={() => setIsCreating(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {selectedTemplate && (
        <Card>
          <CardHeader>
            <CardTitle>Template Preview: {selectedTemplate.template_name}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {selectedTemplate.widget_configs.map((widget, index) => (
                <div key={`${selectedTemplate.id}-widget-${index}`} className="border rounded-lg p-4">
                  <h4 className="font-medium mb-2">{widget.title || 'Widget'}</h4>
                  <div className="text-sm text-muted-foreground">
                    Type: {widget.type || 'unknown'} | Source: {widget.data_source || 'unknown'}
                  </div>
                  <div className="mt-2 h-20 bg-gray-100 rounded flex items-center justify-center text-xs text-muted-foreground">
                    Widget Preview
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DashboardBuilder;
