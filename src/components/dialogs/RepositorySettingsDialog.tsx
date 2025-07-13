import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Settings,
  Save,
  Shield,
  Clock,
  Users,
  Trash2,
  AlertTriangle,
} from 'lucide-react';
import { DocumentRepository } from '@/services/document-management-service';
import { toast } from 'sonner';

interface RepositorySettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  repository: DocumentRepository;
  onUpdate?: (repository: DocumentRepository) => void;
}

const RepositorySettingsDialog: React.FC<RepositorySettingsDialogProps> = ({ 
  open, 
  onOpenChange, 
  repository,
  onUpdate 
}) => {
  const [formData, setFormData] = useState({
    name: repository.name,
    description: repository.description || '',
    document_type: repository.document_type,
    access_level: repository.access_level,
    retention_years: repository.retention_years,
    auto_archive: false,
    version_control: true,
    require_approval: false,
    notification_enabled: true,
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      // Simulate API call - replace with actual update logic
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Repository settings updated successfully');
      
      if (onUpdate) {
        onUpdate({
          ...repository,
          name: formData.name,
          description: formData.description,
          document_type: formData.document_type,
          access_level: formData.access_level,
          retention_years: formData.retention_years,
        });
      }
      
      onOpenChange(false);
    } catch (error) {
      toast.error('Failed to update repository settings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      // Simulate API call - replace with actual delete logic
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Repository deleted successfully');
      onOpenChange(false);
    } catch (error) {
      toast.error('Failed to delete repository');
    } finally {
      setIsLoading(false);
    }
  };

  const getAccessLevelColor = (level: string) => {
    switch (level) {
      case 'public': return 'bg-green-100 text-green-800';
      case 'internal': return 'bg-blue-100 text-blue-800';
      case 'confidential': return 'bg-yellow-100 text-yellow-800';
      case 'restricted': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Repository Settings
          </DialogTitle>
          <DialogDescription>
            Configure settings and permissions for {repository.name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Basic Information
            </h3>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Repository Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Repository name"
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Repository description"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="document_type">Document Type</Label>
                  <Select 
                    value={formData.document_type} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, document_type: value as any }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="policy">Policy</SelectItem>
                      <SelectItem value="procedure">Procedure</SelectItem>
                      <SelectItem value="risk_assessment">Risk Assessment</SelectItem>
                      <SelectItem value="audit_report">Audit Report</SelectItem>
                      <SelectItem value="compliance_doc">Compliance Document</SelectItem>
                      <SelectItem value="contract">Contract</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="access_level">Access Level</Label>
                  <Select 
                    value={formData.access_level} 
                    onValueChange={(value) => setFormData(prev => ({ ...prev, access_level: value as any }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="public">Public</SelectItem>
                      <SelectItem value="internal">Internal</SelectItem>
                      <SelectItem value="confidential">Confidential</SelectItem>
                      <SelectItem value="restricted">Restricted</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Retention Policy */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Retention Policy
            </h3>
            
            <div>
              <Label htmlFor="retention_years">Retention Period (Years)</Label>
              <Input
                id="retention_years"
                type="number"
                min="1"
                max="50"
                value={formData.retention_years}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  retention_years: parseInt(e.target.value) || 7 
                }))}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Documents will be automatically archived after this period
              </p>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Auto-archive expired documents</Label>
                <p className="text-xs text-muted-foreground">
                  Automatically move documents to archive when retention period expires
                </p>
              </div>
              <Switch
                checked={formData.auto_archive}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, auto_archive: checked }))}
              />
            </div>
          </div>

          <Separator />

          {/* Document Management */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4" />
              Document Management
            </h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Version Control</Label>
                  <p className="text-xs text-muted-foreground">
                    Enable version tracking for documents
                  </p>
                </div>
                <Switch
                  checked={formData.version_control}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, version_control: checked }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Require Approval</Label>
                  <p className="text-xs text-muted-foreground">
                    Documents require approval before publishing
                  </p>
                </div>
                <Switch
                  checked={formData.require_approval}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, require_approval: checked }))}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Notifications</Label>
                  <p className="text-xs text-muted-foreground">
                    Send notifications for document changes
                  </p>
                </div>
                <Switch
                  checked={formData.notification_enabled}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, notification_enabled: checked }))}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Repository Info */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Repository Information</h3>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <Label className="text-muted-foreground">Created</Label>
                <p>{new Date(repository.created_at).toLocaleDateString()}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Created by</Label>
                <p>{repository.created_by_name || 'Unknown'}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Current Access Level</Label>
                <Badge className={getAccessLevelColor(repository.access_level)}>
                  {repository.access_level}
                </Badge>
              </div>
              <div>
                <Label className="text-muted-foreground">Repository ID</Label>
                <p className="font-mono text-xs">{repository.id}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Danger Zone */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-destructive flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Danger Zone
            </h3>
            
            {!showDeleteConfirm ? (
              <Button 
                variant="destructive" 
                onClick={() => setShowDeleteConfirm(true)}
                className="w-full"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Repository
              </Button>
            ) : (
              <div className="space-y-2">
                <p className="text-sm text-destructive">
                  Are you sure? This action cannot be undone. All documents in this repository will be permanently deleted.
                </p>
                <div className="flex gap-2">
                  <Button 
                    variant="destructive" 
                    onClick={handleDelete}
                    disabled={isLoading}
                    className="flex-1"
                  >
                    Yes, Delete Repository
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setShowDeleteConfirm(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isLoading}>
              <Save className="h-4 w-4 mr-2" />
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default RepositorySettingsDialog;