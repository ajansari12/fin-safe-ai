import React from 'react';
import { useNavigate } from 'react-router-dom';
import AuthenticatedLayout from '@/components/layout/AuthenticatedLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import FrameworkForm from '@/components/governance/FrameworkForm';
import { toast } from 'sonner';

export default function FrameworkFormPage() {
  const navigate = useNavigate();

  const handleSuccess = () => {
    toast.success('Framework created successfully!');
    navigate('/app/governance');
  };

  return (
    <AuthenticatedLayout>
      <div className="space-y-6">
        <div className="flex items-center space-x-2">
          <Button variant="ghost" onClick={() => navigate('/app/governance')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Governance
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Create New Framework</h1>
            <p className="text-muted-foreground">
              Set up a new governance framework for your organization
            </p>
          </div>
        </div>

        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle>Framework Details</CardTitle>
          </CardHeader>
          <CardContent>
            <FrameworkForm onSuccess={handleSuccess} />
          </CardContent>
        </Card>
      </div>
    </AuthenticatedLayout>
  );
}