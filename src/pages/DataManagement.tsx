import React, { useState } from "react";
import AuthenticatedLayout from "@/components/layout/AuthenticatedLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Database, 
  Download, 
  Upload, 
  Trash2, 
  Shield, 
  FileText, 
  Users,
  Clock,
  AlertTriangle
} from "lucide-react";
import { RoleAwareComponent } from "@/components/ui/RoleAwareComponent";
import { DataExportDialog } from "@/components/dialogs/DataExportDialog";
import { DataImportDialog } from "@/components/dialogs/DataImportDialog";
import { DataRetentionPolicyDialog } from "@/components/dialogs/DataRetentionPolicyDialog";
import { SecurityReportDialog } from "@/components/dialogs/SecurityReportDialog";
import { DataCleanupDialog } from "@/components/dialogs/DataCleanupDialog";
import { useToast } from "@/hooks/use-toast";

const DataManagement = () => {
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [retentionDialogOpen, setRetentionDialogOpen] = useState(false);
  const [securityReportDialogOpen, setSecurityReportDialogOpen] = useState(false);
  const [cleanupDialogOpen, setCleanupDialogOpen] = useState(false);
  const [cleanupType, setCleanupType] = useState<'sessions' | 'logs' | 'archive' | 'purge'>('sessions');
  const [exportType, setExportType] = useState<'json' | 'schema' | 'users'>('json');
  const [importType, setImportType] = useState<'json' | 'csv'>('json');
  const { toast } = useToast();

  const handleExportClick = (type: 'json' | 'schema' | 'users') => {
    setExportType(type);
    setExportDialogOpen(true);
  };

  const handleImportClick = (type: 'json' | 'csv') => {
    setImportType(type);
    setImportDialogOpen(true);
  };

  const handleCleanupClick = (type: 'sessions' | 'logs' | 'archive' | 'purge') => {
    setCleanupType(type);
    setCleanupDialogOpen(true);
  };

  const handleConfigurePolicies = () => {
    setRetentionDialogOpen(true);
  };

  const handleSecurityReport = () => {
    setSecurityReportDialogOpen(true);
  };

  return (
    <AuthenticatedLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Data Management</h1>
          <p className="text-muted-foreground">
            Manage organizational data, exports, and retention policies
          </p>
        </div>

        <Alert>
          <Shield className="h-4 w-4" />
          <AlertDescription>
            Data management operations require administrator privileges and should be performed with caution.
          </AlertDescription>
        </Alert>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5" />
                Data Export
              </CardTitle>
              <CardDescription>Export organizational data for backup or migration</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => handleExportClick('json')}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Export All Data (JSON)
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => handleExportClick('schema')}
                >
                  <Database className="mr-2 h-4 w-4" />
                  Export Database Schema
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => handleExportClick('users')}
                >
                  <Users className="mr-2 h-4 w-4" />
                  Export User Data
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Data Import
              </CardTitle>
              <CardDescription>Import data from external sources or backups</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => handleImportClick('json')}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Import JSON Data
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => handleImportClick('csv')}
                >
                  <Database className="mr-2 h-4 w-4" />
                  Import CSV Files
                </Button>
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription className="text-xs">
                    Data imports will overwrite existing data. Ensure you have backups.
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Data Retention
              </CardTitle>
              <CardDescription>Configure data retention and cleanup policies</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Audit Logs</span>
                  <Badge variant="secondary">2 years</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Incident Records</span>
                  <Badge variant="secondary">7 years</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">User Sessions</span>
                  <Badge variant="secondary">90 days</Badge>
                </div>
                <Button variant="outline" size="sm" className="w-full" onClick={handleConfigurePolicies}>
                  Configure Policies
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Storage Statistics
              </CardTitle>
              <CardDescription>Current data storage and usage statistics</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Total Records</span>
                  <Badge variant="outline">12,543</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Storage Used</span>
                  <Badge variant="outline">2.1 GB</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Active Users</span>
                  <Badge variant="outline">47</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Last Backup</span>
                  <Badge variant="outline">2 hours ago</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trash2 className="h-5 w-5" />
                Data Cleanup
              </CardTitle>
              <CardDescription>Remove old or unused data to optimize performance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start" onClick={() => handleCleanupClick('sessions')}>
                  <Clock className="mr-2 h-4 w-4" />
                  Clean Old Sessions
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={() => handleCleanupClick('logs')}>
                  <FileText className="mr-2 h-4 w-4" />
                  Archive Old Logs
                </Button>
                <RoleAwareComponent superAdminOnly>
                  <Button variant="destructive" className="w-full justify-start" onClick={() => handleCleanupClick('purge')}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Purge Deleted Data
                  </Button>
                </RoleAwareComponent>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Data Security
              </CardTitle>
              <CardDescription>Security settings and compliance status</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Encryption</span>
                  <Badge variant="default">Enabled</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Access Logging</span>
                  <Badge variant="default">Active</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Compliance</span>
                  <Badge variant="default">SOC 2</Badge>
                </div>
                <Button variant="outline" size="sm" className="w-full" onClick={handleSecurityReport}>
                  Security Report
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Recent Data Operations</CardTitle>
            <CardDescription>Log of recent data management activities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between py-2 border-b">
                <span>Data export requested by admin@company.com</span>
                <Badge variant="outline">2 hours ago</Badge>
              </div>
              <div className="flex items-center justify-between py-2 border-b">
                <span>Automated cleanup completed - 1,243 old sessions removed</span>
                <Badge variant="outline">1 day ago</Badge>
              </div>
              <div className="flex items-center justify-between py-2 border-b">
                <span>Data retention policy updated</span>
                <Badge variant="outline">3 days ago</Badge>
              </div>
              <div className="flex items-center justify-between py-2">
                <span>Full system backup completed</span>
                <Badge variant="outline">1 week ago</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Data Management Dialogs */}
        <DataExportDialog 
          open={exportDialogOpen}
          onOpenChange={setExportDialogOpen}
          exportType={exportType}
        />
        
        <DataImportDialog 
          open={importDialogOpen}
          onOpenChange={setImportDialogOpen}
          importType={importType}
        />
        
        <DataRetentionPolicyDialog 
          open={retentionDialogOpen}
          onOpenChange={setRetentionDialogOpen}
        />
        
        <SecurityReportDialog 
          open={securityReportDialogOpen}
          onOpenChange={setSecurityReportDialogOpen}
        />
        
        <DataCleanupDialog 
          open={cleanupDialogOpen}
          onOpenChange={setCleanupDialogOpen}
          cleanupType={cleanupType}
        />
      </div>
    </AuthenticatedLayout>
  );
};

export default DataManagement;