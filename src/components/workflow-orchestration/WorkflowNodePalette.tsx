
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Play, 
  Square, 
  Diamond, 
  Settings, 
  GitBranch, 
  GitMerge,
  Clock,
  Zap
} from 'lucide-react';

interface NodeType {
  type: string;
  label: string;
  description: string;
  icon: React.ComponentType<any>;
  color: string;
  category: string;
}

const NODE_TYPES: NodeType[] = [
  {
    type: 'start',
    label: 'Start',
    description: 'Entry point for the workflow',
    icon: Play,
    color: 'bg-green-500',
    category: 'control'
  },
  {
    type: 'task',
    label: 'Task',
    description: 'Execute a specific action or process',
    icon: Square,
    color: 'bg-blue-500',
    category: 'action'
  },
  {
    type: 'decision',
    label: 'Decision',
    description: 'Branch based on conditions',
    icon: Diamond,
    color: 'bg-yellow-500',
    category: 'logic'
  },
  {
    type: 'integration',
    label: 'Integration',
    description: 'Connect to external systems',
    icon: Settings,
    color: 'bg-purple-500',
    category: 'integration'
  },
  {
    type: 'parallel',
    label: 'Parallel',
    description: 'Execute multiple branches simultaneously',
    icon: GitBranch,
    color: 'bg-orange-500',
    category: 'control'
  },
  {
    type: 'merge',
    label: 'Merge',
    description: 'Combine parallel execution paths',
    icon: GitMerge,
    color: 'bg-indigo-500',
    category: 'control'
  },
  {
    type: 'delay',
    label: 'Delay',
    description: 'Wait for a specified duration',
    icon: Clock,
    color: 'bg-gray-500',
    category: 'control'
  },
  {
    type: 'trigger',
    label: 'Trigger',
    description: 'Fire events or notifications',
    icon: Zap,
    color: 'bg-red-500',
    category: 'action'
  },
  {
    type: 'end',
    label: 'End',
    description: 'Workflow completion point',
    icon: Square,
    color: 'bg-red-600',
    category: 'control'
  }
];

interface WorkflowNodePaletteProps {
  onNodeDragStart: (nodeType: string) => void;
  className?: string;
}

const WorkflowNodePalette: React.FC<WorkflowNodePaletteProps> = ({
  onNodeDragStart,
  className = ''
}) => {
  const categories = Array.from(new Set(NODE_TYPES.map(node => node.category)));

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
                {NODE_TYPES.filter(node => node.category === category).length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-1 gap-2">
              {NODE_TYPES
                .filter(node => node.category === category)
                .map((nodeType) => {
                  const Icon = nodeType.icon;
                  return (
                    <div
                      key={nodeType.type}
                      draggable
                      onDragStart={() => onNodeDragStart(nodeType.type)}
                      className={`
                        p-3 rounded-lg cursor-move text-white transition-all duration-200
                        hover:scale-105 hover:shadow-lg active:scale-95
                        ${nodeType.color}
                      `}
                      title={nodeType.description}
                    >
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium truncate">
                            {nodeType.label}
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
