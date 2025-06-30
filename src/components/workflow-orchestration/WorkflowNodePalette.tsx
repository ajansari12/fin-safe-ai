
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { 
  Play, 
  Square, 
  Diamond, 
  Settings, 
  GitBranch, 
  GitMerge,
  Clock,
  Zap,
  UserCheck,
  Bell,
  RefreshCw,
  CheckCircle,
  Brain
} from 'lucide-react';

interface WorkflowNodeType {
  id: string;
  node_type: string;
  display_name: string;
  description: string;
  category: string;
  icon_name: string;
  color_class: string;
  input_schema: Record<string, any>;
  output_schema: Record<string, any>;
  configuration_schema: Record<string, any>;
  is_system: boolean;
  is_active: boolean;
}

interface WorkflowNodePaletteProps {
  onNodeDragStart: (nodeType: string) => void;
  className?: string;
}

const ICON_MAP: Record<string, React.ComponentType<any>> = {
  Play,
  Square,
  Diamond,
  Settings,
  GitBranch,
  GitMerge,
  Clock,
  Zap,
  UserCheck,
  Bell,
  RefreshCw,
  CheckCircle,
  Brain
};

const WorkflowNodePalette: React.FC<WorkflowNodePaletteProps> = ({
  onNodeDragStart,
  className = ''
}) => {
  const [nodeTypes, setNodeTypes] = useState<WorkflowNodeType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNodeTypes();
  }, []);

  const loadNodeTypes = async () => {
    try {
      const { data, error } = await supabase
        .from('workflow_node_types')
        .select('*')
        .eq('is_active', true)
        .order('category', { ascending: true })
        .order('display_name', { ascending: true });

      if (error) {
        console.error('Error loading node types:', error);
        return;
      }

      setNodeTypes(data || []);
    } catch (error) {
      console.error('Error in loadNodeTypes:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={`space-y-4 ${className}`}>
        <div className="text-sm font-medium text-gray-700 mb-3">
          Loading node types...
        </div>
      </div>
    );
  }

  const categories = Array.from(new Set(nodeTypes.map(node => node.category)));

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="text-sm font-medium text-gray-700 mb-3">
        Drag nodes to the canvas to build your workflow
      </div>
      
      {categories.map(category => (
        <Card key={category} className="overflow-hidden">
          <CardHeader className="py-2">
            <CardTitle className="text-sm capitalize flex items-center gap-2">
              {category}
              <Badge variant="outline" className="text-xs">
                {nodeTypes.filter(node => node.category === category).length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-1 gap-2">
              {nodeTypes
                .filter(node => node.category === category)
                .map((nodeType) => {
                  const Icon = ICON_MAP[nodeType.icon_name] || Square;
                  return (
                    <div
                      key={nodeType.node_type}
                      draggable
                      onDragStart={() => onNodeDragStart(nodeType.node_type)}
                      className={`
                        p-3 rounded-lg cursor-move text-white transition-all duration-200
                        hover:scale-105 hover:shadow-lg active:scale-95
                        ${nodeType.color_class}
                      `}
                      title={nodeType.description}
                    >
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium truncate">
                            {nodeType.display_name}
                          </div>
                          <div className="text-xs opacity-90 truncate">
                            {nodeType.description}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default WorkflowNodePalette;
