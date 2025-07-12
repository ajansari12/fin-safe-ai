
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Globe, 
  Shield, 
  UserPlus, 
  Mail, 
  Calendar, 
  FileText,
  Eye,
  Edit,
  Trash2,
  Clock,
  CheckCircle
} from 'lucide-react';
// TODO: Migrated from AuthContext to EnhancedAuthContext
import { useAuth } from '@/contexts/EnhancedAuthContext';
import { collaborationService, type ExternalStakeholder } from '@/services/collaboration-service';
import { toast } from 'sonner';

const ExternalStakeholderPortal: React.FC = () => {
  const { profile } = useAuth();
  const [stakeholders, setStakeholders] = useState<ExternalStakeholder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showInviteDialog, setShowInviteDialog] = useState(false);

  const [inviteForm, setInviteForm] = useState({
    email: '',
    name: '',
    organization: '',
    role: '',
    accessLevel: 'view' as ExternalStakeholder['access_level'],
    permittedModules: [] as string[],
    expiresInDays: 30
  });

  const availableModules = [
    { id: 'risk_management', name: 'Risk Management' },
    { id: 'compliance', name: 'Compliance' },
    { id: 'audit', name: 'Audit & Assurance' },
    { id: 'documents', name: 'Document Management' },
    { id: 'reporting', name: 'Reporting' },
    { id: 'analytics', name: 'Analytics' }
  ];

  useEffect(() => {
    loadStakeholders();
  }, []);

  const loadStakeholders = async () => {
    try {
      const data = await collaborationService.getExternalStakeholders();
      setStakeholders(data);
    } catch (error) {
      console.error('Error loading stakeholders:', error);
      toast.error('Failed to load external stakeholders');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInviteStakeholder = async () => {
    if (!inviteForm.email || !inviteForm.name || !inviteForm.organization) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      await collaborationService.inviteExternalStakeholder(
        inviteForm.email,
        inviteForm.name,
        inviteForm.organization,
        inviteForm.role,
        inviteForm.accessLevel,
        inviteForm.permittedModules,
        inviteForm.expiresInDays
      );

      setInviteForm({
        email: '',
        name: '',
        organization: '',
        role: '',
        accessLevel: 'view',
        permittedModules: [],
        expiresInDays: 30
      });

      setShowInviteDialog(false);
      loadStakeholders();
      toast.success('Invitation sent successfully');
    } catch (error) {
      console.error('Error inviting stakeholder:', error);
      toast.error('Failed to send invitation');
    }
  };

  const getAccessLevelColor = (level: ExternalStakeholder['access_level']) => {
    switch (level) {
      case 'view': return 'bg-green-100 text-green-800 border-green-200';
      case 'comment': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'edit': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (stakeholder: ExternalStakeholder) => {
    if (!stakeholder.is_active) return 'bg-red-100 text-red-800 border-red-200';
    if (stakeholder.access_expires_at && new Date(stakeholder.access_expires_at) < new Date()) {
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    }
    return 'bg-green-100 text-green-800 border-green-200';
  };

  const getStatusText = (stakeholder: ExternalStakeholder) => {
    if (!stakeholder.is_active) return 'Inactive';
    if (stakeholder.access_expires_at && new Date(stakeholder.access_expires_at) < new Date()) {
      return 'Expired';
    }
    return 'Active';
  };

  const toggleModuleAccess = (moduleId: string) => {
    setInviteForm(prev => ({
      ...prev,
      permittedModules: prev.permittedModules.includes(moduleId)
        ? prev.permittedModules.filter(id => id !== moduleId)
        : [...prev.permittedModules, moduleId]
    }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">External Stakeholder Portal</h2>
          <p className="text-muted-foreground">
            Manage secure collaboration with external auditors, consultants, and vendors
          </p>
        </div>
        <Dialog open={showInviteDialog} onOpenChange={setShowInviteDialog}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="h-4 w-4 mr-2" />
              Invite Stakeholder
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Invite External Stakeholder</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium mb-1 block">Email Address *</label>
                  <Input
                    type="email"
                    placeholder="stakeholder@company.com"
                    value={inviteForm.email}
                    onChange={(e) => setInviteForm(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Full Name *</label>
                  <Input
                    placeholder="John Smith"
                    value={inviteForm.name}
                    onChange={(e) => setInviteForm(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium mb-1 block">Organization *</label>
                  <Input
                    placeholder="External Audit Firm"
                    value={inviteForm.organization}
                    onChange={(e) => setInviteForm(prev => ({ ...prev, organization: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Role</label>
                  <Input
                    placeholder="Senior Auditor"
                    value={inviteForm.role}
                    onChange={(e) => setInviteForm(prev => ({ ...prev, role: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm font-medium mb-1 block">Access Level</label>
                  <Select value={inviteForm.accessLevel} onValueChange={(value) => setInviteForm(prev => ({ ...prev, accessLevel: value as ExternalStakeholder['access_level'] }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="view">View Only</SelectItem>
                      <SelectItem value="comment">View & Comment</SelectItem>
                      <SelectItem value="edit">View, Comment & Edit</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Access Expires (Days)</label>
                  <Input
                    type="number"
                    value={inviteForm.expiresInDays}
                    onChange={(e) => setInviteForm(prev => ({ ...prev, expiresInDays: parseInt(e.target.value) || 30 }))}
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Permitted Modules</label>
                <div className="grid gap-2 md:grid-cols-2">
                  {availableModules.map((module) => (
                    <div key={module.id} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id={module.id}
                        checked={inviteForm.permittedModules.includes(module.id)}
                        onChange={() => toggleModuleAccess(module.id)}
                        className="rounded border-gray-300"
                      />
                      <label htmlFor={module.id} className="text-sm">
                        {module.name}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowInviteDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleInviteStakeholder}>
                  <Mail className="h-4 w-4 mr-2" />
                  Send Invitation
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Security Notice */}
      <Card className="border-l-4 border-l-blue-500 bg-blue-50">
        <CardContent className="pt-4">
          <div className="flex items-start gap-3">
            <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-900">Secure Collaboration</h4>
              <p className="text-sm text-blue-700">
                All external access is encrypted, audited, and time-limited. 
                Stakeholders only see permitted modules and data relevant to their role.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Active Stakeholders */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Active External Stakeholders</h3>
        
        {stakeholders.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <Globe className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground mb-2">No external stakeholders invited</p>
              <p className="text-sm text-muted-foreground">
                Invite external auditors, consultants, or vendors to collaborate securely
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {stakeholders.map((stakeholder) => (
              <Card key={stakeholder.id}>
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div>
                          <h4 className="font-medium">{stakeholder.name}</h4>
                          <p className="text-sm text-muted-foreground">
                            {stakeholder.role} at {stakeholder.organization}
                          </p>
                        </div>
                        <Badge className={getStatusColor(stakeholder)}>
                          {getStatusText(stakeholder)}
                        </Badge>
                        <Badge className={getAccessLevelColor(stakeholder.access_level)}>
                          {stakeholder.access_level}
                        </Badge>
                      </div>

                      <div className="grid gap-2 md:grid-cols-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4" />
                          {stakeholder.email}
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          Invited {new Date(stakeholder.created_at).toLocaleDateString()}
                        </div>
                        {stakeholder.last_login_at && (
                          <div className="flex items-center gap-2">
                            <CheckCircle className="h-4 w-4" />
                            Last login {new Date(stakeholder.last_login_at).toLocaleDateString()}
                          </div>
                        )}
                        {stakeholder.access_expires_at && (
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            Expires {new Date(stakeholder.access_expires_at).toLocaleDateString()}
                          </div>
                        )}
                      </div>

                      <div className="mt-3">
                        <p className="text-sm font-medium mb-1">Permitted Modules:</p>
                        <div className="flex flex-wrap gap-1">
                          {stakeholder.permitted_modules.map((moduleId) => {
                            const module = availableModules.find(m => m.id === moduleId);
                            return (
                              <Badge key={moduleId} variant="outline" className="text-xs">
                                {module?.name || moduleId}
                              </Badge>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Access Analytics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            External Access Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stakeholders.length}</div>
              <div className="text-sm text-muted-foreground">Total Stakeholders</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {stakeholders.filter(s => s.is_active).length}
              </div>
              <div className="text-sm text-muted-foreground">Active Access</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {stakeholders.filter(s => s.last_login_at).length}
              </div>
              <div className="text-sm text-muted-foreground">Have Logged In</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {stakeholders.filter(s => 
                  s.access_expires_at && 
                  new Date(s.access_expires_at) > new Date() &&
                  new Date(s.access_expires_at) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
                ).length}
              </div>
              <div className="text-sm text-muted-foreground">Expiring Soon</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ExternalStakeholderPortal;
