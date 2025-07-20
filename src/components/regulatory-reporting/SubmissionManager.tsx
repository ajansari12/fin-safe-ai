import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { 
  Plus, 
  Send, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  Settings,
  ExternalLink,
  RefreshCw,
  Shield,
  Archive
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SubmissionConfig {
  id: string;
  name: string;
  targetSystem: 'osfi_portal' | 'cdic_portal' | 'email' | 'api_endpoint';
  status: 'active' | 'inactive' | 'error';
  lastSubmission: string;
  successRate: number;
  totalSubmissions: number;
  format: 'xml' | 'excel' | 'pdf' | 'json';
  autoRetry: boolean;
  confirmationRequired: boolean;
  description: string;
}

interface SubmissionHistory {
  id: string;
  configName: string;
  reportName: string;
  submittedAt: string;
  status: 'success' | 'failed' | 'pending';
  targetSystem: string;
  reference?: string;
  errorMessage?: string;
}

const SubmissionManager: React.FC = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'configs' | 'history'>('configs');
  const { toast } = useToast();

  // Mock data - replace with actual service calls
  const submissionConfigs: SubmissionConfig[] = [
    {
      id: '1',
      name: 'OSFI E-21 Portal',
      targetSystem: 'osfi_portal',
      status: 'active',
      lastSubmission: '2024-01-20T14:30:00Z',
      successRate: 95.2,
      totalSubmissions: 42,
      format: 'xml',
      autoRetry: true,
      confirmationRequired: true,
      description: 'Automated submission to OSFI regulatory portal'
    },
    {
      id: '2',
      name: 'CDIC Data Portal',
      targetSystem: 'cdic_portal',
      status: 'active',
      lastSubmission: '2024-01-19T10:15:00Z',
      successRate: 88.7,
      totalSubmissions: 31,
      format: 'excel',
      autoRetry: true,
      confirmationRequired: false,
      description: 'CDIC deposit data reporting system'
    },
    {
      id: '3',
      name: 'Executive Email Reports',
      targetSystem: 'email',
      status: 'active',
      lastSubmission: '2024-01-20T09:00:00Z',
      successRate: 100,
      totalSubmissions: 156,
      format: 'pdf',
      autoRetry: false,
      confirmationRequired: false,
      description: 'Weekly executive summary reports via email'
    }
  ];

  const submissionHistory: SubmissionHistory[] = [
    {
      id: '1',
      configName: 'OSFI E-21 Portal',
      reportName: 'Q4 2023 Operational Risk Report',
      submittedAt: '2024-01-20T14:30:00Z',
      status: 'success',
      targetSystem: 'osfi_portal',
      reference: 'OSFI-2024-001-456'
    },
    {
      id: '2',
      configName: 'Executive Email Reports',
      reportName: 'Weekly Risk Summary - Week 3',
      submittedAt: '2024-01-20T09:00:00Z',
      status: 'success',
      targetSystem: 'email',
      reference: 'EMAIL-2024-789'
    },
    {
      id: '3',
      configName: 'CDIC Data Portal',
      reportName: 'Monthly Deposit Report - December 2023',
      submittedAt: '2024-01-19T10:15:00Z',
      status: 'failed',
      targetSystem: 'cdic_portal',
      errorMessage: 'Connection timeout to CDIC portal'
    }
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    let variant: "default" | "destructive" | "secondary";
    switch (status) {
      case 'active':
      case 'success':
        variant = 'default';
        break;
      case 'failed':
      case 'error':
        variant = 'destructive';
        break;
      default:
        variant = 'secondary';
    }
    return <Badge variant={variant}>{status}</Badge>;
  };

  const getSystemIcon = (system: string) => {
    switch (system) {
      case 'osfi_portal':
      case 'cdic_portal':
        return <ExternalLink className="h-4 w-4 text-blue-500" />;
      case 'email':
        return <Send className="h-4 w-4 text-green-500" />;
      case 'api_endpoint':
        return <Settings className="h-4 w-4 text-purple-500" />;
      default:
        return <Send className="h-4 w-4 text-gray-500" />;
    }
  };

  const handleCreateConfig = (formData: FormData) => {
    const configData = {
      name: formData.get('name') as string,
      targetSystem: formData.get('targetSystem') as string,
      format: formData.get('format') as string,
      description: formData.get('description') as string,
      autoRetry: formData.get('autoRetry') === 'on',
      confirmationRequired: formData.get('confirmationRequired') === 'on',
    };

    // Mock creation - replace with actual service call
    toast({
      title: "Submission configuration created",
      description: "New submission configuration has been created successfully.",
    });
    setIsCreateDialogOpen(false);
  };

  const handleTestSubmission = (configId: string) => {
    toast({
      title: "Test submission initiated",
      description: "Testing submission configuration with sample data.",
    });
  };

  const handleRetrySubmission = (historyId: string) => {
    toast({
      title: "Retrying submission",
      description: "Attempting to resubmit the failed report.",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Submission Management</h2>
          <p className="text-muted-foreground">
            Configure and monitor automated report submissions
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setActiveTab(activeTab === 'configs' ? 'history' : 'configs')}>
            <Archive className="h-4 w-4 mr-2" />
            {activeTab === 'configs' ? 'View History' : 'View Configs'}
          </Button>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Configuration
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create Submission Configuration</DialogTitle>
                <DialogDescription>
                  Configure a new submission endpoint for automated report delivery.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={(e) => { e.preventDefault(); handleCreateConfig(new FormData(e.currentTarget)); }} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Configuration Name</Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="OSFI Portal Configuration"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="targetSystem">Target System</Label>
                    <Select name="targetSystem" required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select target system" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="osfi_portal">OSFI Portal</SelectItem>
                        <SelectItem value="cdic_portal">CDIC Portal</SelectItem>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="api_endpoint">API Endpoint</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="format">Submission Format</Label>
                    <Select name="format" required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select format" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="xml">XML</SelectItem>
                        <SelectItem value="excel">Excel</SelectItem>
                        <SelectItem value="pdf">PDF</SelectItem>
                        <SelectItem value="json">JSON</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    name="description"
                    placeholder="Describe the submission configuration..."
                  />
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">Configuration Options</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                      <Switch id="autoRetry" name="autoRetry" defaultChecked />
                      <Label htmlFor="autoRetry">Auto Retry on Failure</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Switch id="confirmationRequired" name="confirmationRequired" defaultChecked />
                      <Label htmlFor="confirmationRequired">Require Confirmation</Label>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsCreateDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">Create Configuration</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Submission Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Configs</CardTitle>
            <Settings className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{submissionConfigs.filter(c => c.status === 'active').length}</div>
            <p className="text-xs text-muted-foreground">
              Operational configurations
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {Math.round(submissionConfigs.reduce((sum, c) => sum + c.successRate, 0) / submissionConfigs.length)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Average submission success
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Submissions</CardTitle>
            <Send className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {submissionConfigs.reduce((sum, c) => sum + c.totalSubmissions, 0)}
            </div>
            <p className="text-xs text-muted-foreground">
              Reports submitted
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed Today</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {submissionHistory.filter(h => h.status === 'failed').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Require attention
            </p>
          </CardContent>
        </Card>
      </div>

      {activeTab === 'configs' ? (
        /* Submission Configurations */
        <div className="grid gap-4">
          {submissionConfigs.map((config) => (
            <Card key={config.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getSystemIcon(config.targetSystem)}
                    <div>
                      <CardTitle className="text-lg">{config.name}</CardTitle>
                      <CardDescription>{config.description}</CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(config.status)}
                    {getStatusBadge(config.status)}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleTestSubmission(config.id)}
                    >
                      Test
                    </Button>
                    <Button size="sm" variant="outline">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm font-medium">Target System</p>
                      <p className="text-xs text-muted-foreground capitalize">
                        {config.targetSystem.replace('_', ' ')}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Format</p>
                      <p className="text-xs text-muted-foreground uppercase">
                        {config.format}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Total Submissions</p>
                      <p className="text-xs text-muted-foreground">
                        {config.totalSubmissions} reports
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Last Submission</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(config.lastSubmission).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Success Rate</span>
                      <span className="text-sm text-muted-foreground">{config.successRate}%</span>
                    </div>
                    <Progress value={config.successRate} className="h-2" />
                  </div>
                  <div className="flex gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <Shield className="h-4 w-4 text-muted-foreground" />
                      <span>Auto Retry: {config.autoRetry ? 'Enabled' : 'Disabled'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-muted-foreground" />
                      <span>Confirmation: {config.confirmationRequired ? 'Required' : 'Not Required'}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        /* Submission History */
        <div className="grid gap-4">
          {submissionHistory.map((submission) => (
            <Card key={submission.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getSystemIcon(submission.targetSystem)}
                    <div>
                      <CardTitle className="text-lg">{submission.reportName}</CardTitle>
                      <CardDescription>
                        via {submission.configName} • {new Date(submission.submittedAt).toLocaleString()}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(submission.status)}
                    {getStatusBadge(submission.status)}
                    {submission.status === 'failed' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRetrySubmission(submission.id)}
                      >
                        <RefreshCw className="h-4 w-4 mr-1" />
                        Retry
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm font-medium">Target System</p>
                    <p className="text-xs text-muted-foreground capitalize">
                      {submission.targetSystem.replace('_', ' ')}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Status</p>
                    <p className="text-xs text-muted-foreground capitalize">
                      {submission.status}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Reference</p>
                    <p className="text-xs text-muted-foreground">
                      {submission.reference || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Submitted At</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(submission.submittedAt).toLocaleString()}
                    </p>
                  </div>
                </div>
                {submission.errorMessage && (
                  <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                    <p className="text-sm font-medium text-destructive">Error Details:</p>
                    <p className="text-xs text-destructive/80">{submission.errorMessage}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default SubmissionManager;