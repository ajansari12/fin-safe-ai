import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertTriangle, XCircle, Info } from 'lucide-react';
import { useUUIDValidation, useOrgContext } from '@/hooks/useUUIDValidation';

interface UUIDValidationDemoProps {
  onValidationResult?: (isValid: boolean, message: string) => void;
}

const UUIDValidationDemo: React.FC<UUIDValidationDemoProps> = ({ onValidationResult }) => {
  const { validateRequiredUUID, validateUUIDField, isValidUUIDValue } = useUUIDValidation();
  const { orgId, userId, hasContext, isLoading } = useOrgContext();

  const testCases = [
    { label: 'Valid UUID', value: '550e8400-e29b-41d4-a716-446655440000', expected: true },
    { label: 'Invalid UUID (default-org-id)', value: 'default-org-id', expected: false },
    { label: 'Invalid UUID (short)', value: '123-456', expected: false },
    { label: 'Empty string', value: '', expected: false },
    { label: 'Valid uppercase UUID', value: '550E8400-E29B-41D4-A716-446655440000', expected: true }
  ];

  const getStatusIcon = (isValid: boolean, expected: boolean) => {
    if (isValid === expected) {
      return <CheckCircle className="h-4 w-4 text-green-600" />;
    }
    return <XCircle className="h-4 w-4 text-red-600" />;
  };

  const getStatusBadge = (isValid: boolean) => {
    return (
      <Badge variant={isValid ? "default" : "destructive"}>
        {isValid ? 'Valid' : 'Invalid'}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-2">Loading organization context...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Info className="h-5 w-5 mr-2" />
            UUID Validation Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {hasContext ? (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Organization Context Loaded Successfully</strong>
                <div className="mt-2 space-y-1">
                  <div>Organization ID: <code className="bg-muted px-1 rounded">{orgId}</code></div>
                  <div>User ID: <code className="bg-muted px-1 rounded">{userId}</code></div>
                </div>
              </AlertDescription>
            </Alert>
          ) : (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>Organization Context Missing</strong>
                <p>Unable to load valid organization context. This may cause UUID validation errors.</p>
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-3">
            <h4 className="font-medium">UUID Validation Test Cases</h4>
            {testCases.map((test, index) => {
              const isValid = isValidUUIDValue(test.value);
              const testPassed = isValid === test.expected;
              
              return (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(isValid, test.expected)}
                    <div>
                      <div className="font-medium">{test.label}</div>
                      <code className="text-sm text-muted-foreground">{test.value || '(empty)'}</code>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusBadge(isValid)}
                    <Badge variant={testPassed ? "secondary" : "destructive"}>
                      {testPassed ? 'Test Passed' : 'Test Failed'}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Common UUID Issues Fixed</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <h4 className="font-medium text-green-600">✅ Fixed Issues:</h4>
            <ul className="space-y-1 text-sm text-muted-foreground ml-4">
              <li>• Replaced hardcoded 'default-org-id' with dynamic organization IDs</li>
              <li>• Added Zod validation for all UUID inputs</li>
              <li>• Normalized UUID formats (lowercase, trimmed)</li>
              <li>• Added proper error handling for invalid UUIDs</li>
              <li>• Created organization context service for reliable ID management</li>
              <li>• Added validation hooks for React components</li>
            </ul>
          </div>
          
          <div className="space-y-2">
            <h4 className="font-medium text-blue-600">🔧 Validation Features:</h4>
            <ul className="space-y-1 text-sm text-muted-foreground ml-4">
              <li>• UUID format validation with detailed error messages</li>
              <li>• Query parameter parsing with fallback handling</li>
              <li>• Organization access control validation</li>
              <li>• Form field validation with user feedback</li>
              <li>• URL-based entity loading with UUID verification</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UUIDValidationDemo;