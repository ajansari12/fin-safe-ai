
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { 
  Plus, Edit, Trash2, Copy, Eye, Send, FileText, 
  Mail, MessageSquare, Smartphone, Settings
} from 'lucide-react';
import { enhancedNotificationService, type NotificationTemplate } from '@/services/notifications/enhanced-notification-service';
import { useAuth } from '@/contexts/EnhancedAuthContext';
import { toast } from 'sonner';

interface TemplateFormData {
  template_name: string;
  template_type: string;
  channel_type: string;
  subject_template?: string;
  body_template: string;
  variables: string[];
  is_system_template: boolean;
}

const TEMPLATE_VARIABLES = [
  '{{user_name}}', '{{organization_name}}', '{{alert_title}}', '{{alert_description}}',
  '{{severity}}', '{{timestamp}}', '{{source}}', '{{action_required}}',
  '{{escalation_level}}', '{{assigned_to}}', '{{due_date}}', '{{link}}'
];

export const NotificationTemplateManager: React.FC = () => {
  const { profile } = useAuth();
  const [templates, setTemplates] = useState<NotificationTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState<NotificationTemplate | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<TemplateFormData>({
    template_name: '',
    template_type: 'alert',
    channel_type: 'email',
    subject_template: '',
    body_template: '',
    variables: [],
    is_system_template: false
  });
  const [previewMode, setPreviewMode] = useState(false);
  const [previewData, setPreviewData] = useState<Record<string, string>>({});

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    if (!profile?.organization_id) return;

    setLoading(true);
    try {
      const data = await enhancedNotificationService.getNotificationTemplates(profile.organization_id);
      setTemplates(data);
    } catch (error) {
      console.error('Failed to load templates:', error);
      toast.error('Failed to load templates');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveTemplate = async () => {
    if (!profile?.organization_id) return;

    try {
      if (selectedTemplate) {
        await enhancedNotificationService.updateNotificationTemplate(selectedTemplate.id, formData);
        toast.success('Template updated successfully');
      } else {
        await enhancedNotificationService.createNotificationTemplate({
          ...formData,
          org_id: profile.organization_id
        });
        toast.success('Template created successfully');
      }
      
      await loadTemplates();
      handleCloseDialog();
    } catch (error) {
      console.error('Failed to save template:', error);
      toast.error('Failed to save template');
    }
  };

  const handleDeleteTemplate = async (templateId: string) => {
    try {
      await enhancedNotificationService.deleteNotificationTemplate(templateId);
      toast.success('Template deleted successfully');
      await loadTemplates();
    } catch (error) {
      console.error('Failed to delete template:', error);
      toast.error('Failed to delete template');
    }
  };

  const handleCloseDialog = () => {
    setSelectedTemplate(null);
    setIsEditing(false);
    setPreviewMode(false);
    setFormData({
      template_name: '',
      template_type: 'alert',
      channel_type: 'email',
      subject_template: '',
      body_template: '',
      variables: [],
      is_system_template: false
    });
  };

  const handleEditTemplate = (template: NotificationTemplate) => {
    setSelectedTemplate(template);
    setFormData({
      template_name: template.template_name,
      template_type: template.template_type,
      channel_type: template.channel_type,
      subject_template: template.subject_template || '',
      body_template: template.body_template,
      variables: template.variables,
      is_system_template: template.is_system_template
    });
    setIsEditing(true);
  };

  const insertVariable = (variable: string) => {
    const textarea = document.getElementById('body_template') as HTMLTextAreaElement;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const currentValue = formData.body_template;
      const newValue = currentValue.substring(0, start) + variable + currentValue.substring(end);
      
      setFormData(prev => ({ ...prev, body_template: newValue }));
      
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + variable.length, start + variable.length);
      }, 0);
    }
  };

  const generatePreview = () => {
    let preview = formData.body_template;
    Object.entries(previewData).forEach(([key, value]) => {
      preview = preview.replace(new RegExp(`{{${key}}}`, 'g'), value);
    });
    return preview;
  };

  const getChannelIcon = (channelType: string) => {
    switch (channelType) {
      case 'email': return <Mail className="h-4 w-4" />;
      case 'sms': return <Smartphone className="h-4 w-4" />;
      case 'slack': return <MessageSquare className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Notification Templates</h1>
          <p className="text-muted-foreground">Manage and customize notification templates</p>
        </div>
        <Dialog open={isEditing} onOpenChange={setIsEditing}>
          <DialogTrigger asChild>
            <Button onClick={() => setIsEditing(true)}>
              <Plus className="h-4 w-4 mr-2" />
              New Template
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {selectedTemplate ? 'Edit Template' : 'Create New Template'}
              </DialogTitle>
            </DialogHeader>

            <Tabs defaultValue="editor" className="space-y-4">
              <TabsList>
                <TabsTrigger value="editor">Editor</TabsTrigger>
                <TabsTrigger value="preview">Preview</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>

              <TabsContent value="editor" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="template_name">Template Name</Label>
                      <Input
                        id="template_name"
                        value={formData.template_name}
                        onChange={(e) => setFormData(prev => ({ ...prev, template_name: e.target.value }))}
                        placeholder="Enter template name"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label htmlFor="template_type">Template Type</Label>
                        <Select 
                          value={formData.template_type} 
                          onValueChange={(value) => setFormData(prev => ({ ...prev, template_type: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="alert">Alert</SelectItem>
                            <SelectItem value="reminder">Reminder</SelectItem>
                            <SelectItem value="escalation">Escalation</SelectItem>
                            <SelectItem value="notification">Notification</SelectItem>
                            <SelectItem value="report">Report</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="channel_type">Channel</Label>
                        <Select 
                          value={formData.channel_type} 
                          onValueChange={(value) => setFormData(prev => ({ ...prev, channel_type: value }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="email">Email</SelectItem>
                            <SelectItem value="sms">SMS</SelectItem>
                            <SelectItem value="slack">Slack</SelectItem>
                            <SelectItem value="teams">Teams</SelectItem>
                            <SelectItem value="webhook">Webhook</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {formData.channel_type === 'email' && (
                      <div>
                        <Label htmlFor="subject_template">Subject Template</Label>
                        <Input
                          id="subject_template"
                          value={formData.subject_template}
                          onChange={(e) => setFormData(prev => ({ ...prev, subject_template: e.target.value }))}
                          placeholder="Enter email subject template"
                        />
                      </div>
                    )}
                  </div>

                  <div>
                    <Label>Available Variables</Label>
                    <div className="grid grid-cols-3 gap-1 max-h-32 overflow-y-auto p-2 border rounded">
                      {TEMPLATE_VARIABLES.map((variable) => (
                        <Button
                          key={variable}
                          variant="ghost"
                          size="sm"
                          className="h-6 text-xs justify-start"
                          onClick={() => insertVariable(variable)}
                        >
                          {variable}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="body_template">Message Template</Label>
                  <Textarea
                    id="body_template"
                    value={formData.body_template}
                    onChange={(e) => setFormData(prev => ({ ...prev, body_template: e.target.value }))}
                    placeholder="Enter your notification message template here..."
                    className="min-h-[200px] font-mono text-sm"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Use variables like {{user_name}} in your template. Click on variables above to insert them.
                  </p>
                </div>
              </TabsContent>

              <TabsContent value="preview" className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <Label>Preview Data (for testing)</Label>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {TEMPLATE_VARIABLES.slice(0, 6).map((variable) => {
                        const key = variable.replace(/[{}]/g, '');
                        return (
                          <Input
                            key={key}
                            placeholder={variable}
                            value={previewData[key] || ''}
                            onChange={(e) => setPreviewData(prev => ({ ...prev, [key]: e.target.value }))}
                          />
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <Label>Preview</Label>
                    <Card>
                      <CardContent className="p-4">
                        {formData.channel_type === 'email' && formData.subject_template && (
                          <div className="mb-4">
                            <Label className="text-sm font-medium">Subject:</Label>
                            <p className="text-sm bg-muted p-2 rounded">
                              {formData.subject_template.replace(/{{(\w+)}}/g, (match, key) => previewData[key] || match)}
                            </p>
                          </div>
                        )}
                        <Label className="text-sm font-medium">Message:</Label>
                        <div className="text-sm bg-muted p-4 rounded whitespace-pre-wrap">
                          {generatePreview()}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="settings" className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>System Template</Label>
                      <p className="text-sm text-muted-foreground">
                        System templates are available to all organizations
                      </p>
                    </div>
                    <Switch
                      checked={formData.is_system_template}
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_system_template: checked }))}
                    />
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={handleCloseDialog}>
                Cancel
              </Button>
              <Button onClick={handleSaveTemplate}>
                {selectedTemplate ? 'Update' : 'Create'} Template
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map((template) => (
          <Card key={template.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  {getChannelIcon(template.channel_type)}
                  <CardTitle className="text-lg">{template.template_name}</CardTitle>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEditTemplate(template)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteTemplate(template.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{template.template_type}</Badge>
                  <Badge variant="outline">{template.channel_type}</Badge>
                  {template.is_system_template && (
                    <Badge variant="secondary">System</Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {template.body_template.substring(0, 100)}...
                </p>
                <div className="text-xs text-muted-foreground">
                  Variables: {template.variables.length}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {templates.length === 0 && !loading && (
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">No templates found</h3>
            <p className="text-muted-foreground mb-4">
              Create your first notification template to get started
            </p>
            <Button onClick={() => setIsEditing(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Template
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
