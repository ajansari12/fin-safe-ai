import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { FrameworkProgressService } from '@/services/framework-progress-service';
import { supabase } from '@/integrations/supabase/client';
import { TestTube, Activity, CheckCircle } from 'lucide-react';

interface FrameworkProgressTesterProps {
  framework: any;
  onUpdate?: () => void;
}

const FrameworkProgressTester: React.FC<FrameworkProgressTesterProps> = ({ 
  framework, 
  onUpdate 
}) => {
  const { toast } = useToast();
  const [selectedComponent, setSelectedComponent] = useState<string>('');
  const [isUpdating, setIsUpdating] = useState(false);

  const updateProgress = async (percentage: number) => {
    if (!selectedComponent) {
      toast({
        title: "No Component Selected",
        description: "Please select a component to update",
        variant: "destructive"
      });
      return;
    }

    setIsUpdating(true);
    try {
      await FrameworkProgressService.updateComponentProgress(selectedComponent, {
        completion_percentage: percentage,
        status: percentage === 100 ? 'completed' : percentage > 0 ? 'in_progress' : 'not_started'
      });

      toast({
        title: "Progress Updated",
        description: `Component progress set to ${percentage}%`
      });

      onUpdate?.();
    } catch (error) {
      console.error('Error updating progress:', error);
      toast({
        title: "Update Failed",
        description: "Failed to update component progress",
        variant: "destructive"
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const components = framework.framework_components || [];

  if (components.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="py-6 text-center">
          <TestTube className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground">No components available for testing</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TestTube className="h-5 w-5" />
          Progress Testing Tool
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Select Component</label>
          <Select value={selectedComponent} onValueChange={setSelectedComponent}>
            <SelectTrigger>
              <SelectValue placeholder="Choose a component..." />
            </SelectTrigger>
            <SelectContent>
              {components.map((component: any) => (
                <SelectItem key={component.id} value={component.id}>
                  {component.component_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Test Progress Update</label>
          <div className="flex gap-2 flex-wrap">
            <Button
              size="sm"
              variant="outline"
              onClick={() => updateProgress(0)}
              disabled={isUpdating || !selectedComponent}
            >
              0%
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => updateProgress(25)}
              disabled={isUpdating || !selectedComponent}
            >
              25%
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => updateProgress(50)}
              disabled={isUpdating || !selectedComponent}
            >
              50%
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => updateProgress(75)}
              disabled={isUpdating || !selectedComponent}
            >
              75%
            </Button>
            <Button
              size="sm"
              onClick={() => updateProgress(100)}
              disabled={isUpdating || !selectedComponent}
              className="bg-green-600 hover:bg-green-700"
            >
              <CheckCircle className="h-4 w-4 mr-1" />
              100%
            </Button>
          </div>
        </div>

        <div className="p-3 bg-muted rounded-lg">
          <div className="flex items-center gap-2 text-sm">
            <Activity className="h-4 w-4 text-blue-500" />
            <span className="font-medium">Current Framework Progress:</span>
            <Badge variant="outline">
              {framework.overall_completion_percentage || 0}%
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            This will update automatically when you change component progress
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default FrameworkProgressTester;