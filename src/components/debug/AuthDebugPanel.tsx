import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useEnhancedAuth } from '@/contexts/EnhancedAuthContext';
import { useProgressiveAuth } from '@/hooks/useProgressiveAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  User, 
  Shield, 
  Database, 
  AlertTriangle, 
  CheckCircle, 
  XCircle,
  RefreshCw,
  Bug
} from 'lucide-react';

interface AuthDebugPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthDebugPanel: React.FC<AuthDebugPanelProps> = ({ isOpen, onClose }) => {
  const { 
    user, 
    session, 
    profile, 
    userContext, 
    isLoading,
    refreshUserContext 
  } = useEnhancedAuth();
  
  const { authState, checkAuthState, getNextSetupStep } = useProgressiveAuth();
  const [validationResult, setValidationResult] = useState<any>(null);
  const [isValidating, setIsValidating] = useState(false);

  const validateUserData = async () => {
    if (!user?.id) {
      toast.error('No user ID available for validation');
      return;
    }

    setIsValidating(true);
    try {
      const { data, error } = await supabase.rpc('validate_user_org_relationship', {
        user_id: user.id
      });

      if (error) {
        console.error('Validation error:', error);
        toast.error('Validation failed: ' + error.message);
        return;
      }

      setValidationResult(data);
      
      if (data.valid) {
        toast.success('User data validation passed');
      } else {
        toast.warning(`Validation issues found: ${data.issues.length}`);
      }
    } catch (error) {
      console.error('Validation error:', error);
      toast.error('Validation failed');
    } finally {
      setIsValidating(false);
    }
  };

  const repairUserData = async () => {
    if (!user?.id) {
      toast.error('No user ID available for repair');
      return;
    }

    try {
      const { data, error } = await supabase.rpc('repair_user_data', {
        user_id: user.id
      });

      if (error) {
        console.error('Repair error:', error);
        toast.error('Repair failed: ' + error.message);
        return;
      }

      toast.success(`Repair completed: ${data.actions.length} actions taken`);
      
      // Refresh user context after repair
      await refreshUserContext();
      
      // Re-run validation
      await validateUserData();
    } catch (error) {
      console.error('Repair error:', error);
      toast.error('Repair failed');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Bug className="h-5 w-5" />
            Authentication Debug Panel
          </CardTitle>
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
        </CardHeader>
        
        <CardContent>
          <Tabs defaultValue="overview" className="h-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="user">User Data</TabsTrigger>
              <TabsTrigger value="permissions">Permissions</TabsTrigger>
              <TabsTrigger value="validation">Validation</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Authentication Status</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-center gap-2">
                      {user ? <CheckCircle className="h-4 w-4 text-green-500" /> : <XCircle className="h-4 w-4 text-red-500" />}
                      <span className="text-sm">User Authenticated</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {session ? <CheckCircle className="h-4 w-4 text-green-500" /> : <XCircle className="h-4 w-4 text-red-500" />}
                      <span className="text-sm">Valid Session</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {profile ? <CheckCircle className="h-4 w-4 text-green-500" /> : <XCircle className="h-4 w-4 text-red-500" />}
                      <span className="text-sm">Profile Loaded</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {profile?.organization_id ? <CheckCircle className="h-4 w-4 text-green-500" /> : <XCircle className="h-4 w-4 text-red-500" />}
                      <span className="text-sm">Organization Access</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Auth Level</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Badge variant={authState.authLevel === 'full' ? 'default' : 'secondary'}>
                      {authState.authLevel.toUpperCase()}
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-2">
                      Next step: {getNextSetupStep() || 'Complete'}
                    </p>
                  </CardContent>
                </Card>
              </div>

              {!authState.isFullyAuthenticated && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Incomplete authentication detected. Some features may not be available.
                  </AlertDescription>
                </Alert>
              )}
            </TabsContent>

            <TabsContent value="user" className="space-y-4">
              <ScrollArea className="h-80">
                <div className="space-y-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <User className="h-4 w-4" />
                        User Object
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <pre className="text-xs bg-muted p-2 rounded overflow-auto">
                        {JSON.stringify(user, null, 2)}
                      </pre>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Database className="h-4 w-4" />
                        Profile Data
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <pre className="text-xs bg-muted p-2 rounded overflow-auto">
                        {JSON.stringify(profile, null, 2)}
                      </pre>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm">User Context</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <pre className="text-xs bg-muted p-2 rounded overflow-auto">
                        {JSON.stringify(userContext, null, 2)}
                      </pre>
                    </CardContent>
                  </Card>
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="permissions" className="space-y-4">
              <div className="space-y-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Shield className="h-4 w-4" />
                      Roles ({userContext?.roles?.length || 0})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {userContext?.roles?.map(role => (
                        <Badge key={role} variant="outline">{role}</Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">
                      Permissions ({userContext?.permissions?.length || 0})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ScrollArea className="h-40">
                      <div className="grid grid-cols-2 gap-1">
                        {userContext?.permissions?.map(permission => (
                          <Badge key={permission} variant="secondary" className="text-xs">
                            {permission}
                          </Badge>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="validation" className="space-y-4">
              <div className="flex gap-2 mb-4">
                <Button 
                  onClick={validateUserData} 
                  disabled={isValidating}
                  size="sm"
                >
                  {isValidating ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : null}
                  Validate Data
                </Button>
                <Button 
                  onClick={repairUserData} 
                  variant="outline"
                  size="sm"
                >
                  Repair Data
                </Button>
                <Button 
                  onClick={refreshUserContext} 
                  variant="outline"
                  size="sm"
                >
                  Refresh Context
                </Button>
              </div>

              {validationResult && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2">
                      {validationResult.valid ? 
                        <CheckCircle className="h-4 w-4 text-green-500" /> : 
                        <XCircle className="h-4 w-4 text-red-500" />
                      }
                      Validation Result
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {validationResult.valid ? (
                      <p className="text-sm text-green-600">✅ All validation checks passed</p>
                    ) : (
                      <div className="space-y-2">
                        <p className="text-sm text-red-600">❌ Validation issues found:</p>
                        <ul className="text-xs space-y-1 ml-4">
                          {validationResult.issues?.map((issue: string, index: number) => (
                            <li key={index} className="text-red-600">• {issue}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};