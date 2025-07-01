
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
  Zap,
  UserCheck,
  Bell,
  RefreshCw,
  CheckCircle,
  Brain
} from 'lucide-react';

interface WorkflowNodePaletteProps {
  onNodeDragStart: (nodeType: string) => void;
  className?: string;
}

const NODE_TYPES = [
  {
    type: 'start',
    label: 'Start',
    icon: Play,
    description: 'Workflow entry point',
    category: 'Flow Control'
  },
  {
    type: 'end',
    label: 'End',
    icon: Square,
    description: 'Workflow termination',
    category: 'Flow Control'
  },
  {
    type: 'task',
    label: 'Task',
    icon: Settings,
    description: 'Execute an action',
    category: 'Actions'
  },
  {
    type: 'decision',
    label: 'Decision',
    icon: Diamond,
    description: 'Branch based on condition',
    category: 'Flow Control'
  },
  {
    type: 'parallel',
    label: 'Parallel',
    icon: GitBranch,
    description: 'Execute paths in parallel',
    category: 'Flow Control'
  },
  {
    type: 'merge',
    label: 'Merge',
    icon: GitMerge,
    description: 'Merge parallel paths',
    category: 'Flow Control'
  },
  {
    type: 'delay',
    label: 'Delay',
    icon: Clock,
    description: 'Wait for specified time',
    category: 'Utility'
  },
  {
    type: 'trigger',
    label: 'Trigger',
    icon: Zap,
    description: 'Event-based activation',
    category: 'Triggers'
  },
  {
    type: 'approval',
    label: 'Approval',
    icon: UserCheck,
    description: 'Require human approval',
    category: 'Human Tasks'
  },
  {
    type: 'notification',
    label: 'Notification',
    icon: Bell,
    description: 'Send notifications',
    category: 'Communication'
  },
  {
    type: 'data_transform',
    label: 'Transform',
    icon: RefreshCw,
    description: 'Transform data',
    category: 'Data Processing'
  },
  {
    type: 'validation',
    label: 'Validation',
    icon: CheckCircle,
    description: 'Validate data/conditions',
    category: 'Data Processing'
  },
  {
    type: 'ml_prediction',
    label: 'AI/ML',
    icon: Brain,
    description: 'Machine learning prediction',
    category: 'AI/ML'
  }
];

const CATEGORIES = ['Flow Control', 'Actions', 'Triggers', 'Human Tasks', 'Communication', 'Data Processing', 'AI/ML', 'Utility'];

const WorkflowNodePalette: React.FC<WorkflowNodePaletteProps> = ({ onNodeDragStart, className }) => {
  const handleDragStart = (nodeType: string) => {
    onNodeDragStart(nodeType);
  };

  const groupedNodes = CATEGORIES.reduce((acc, category) => {
    acc[category] = NODE_TYPES.filter(node => node.category === category);
    return acc;
  }, {} as Record<string, typeof NODE_TYPES>);

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="text-sm font-medium text-gray-700 mb-4">
        Drag nodes to canvas to build your workflow
      </div>
      
      {CATEGORIES.map(category => (
        groupedNodes[category].length > 0 && (
          <Card key={category}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">{category}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {groupedNodes[category].map(node => {
                const Icon = node.icon;
                return (
                  <div
                    key={node.type}
                    draggable
                    onDragStart={() => handleDragStart(node.type)}
                    className="flex items-center gap-3 p-2 border rounded-lg cursor-grab hover:bg-gray-50 active:cursor-grabbing transition-colors"
                  >
                    <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                      <Icon className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm">{node.label}</div>
                      <div className="text-xs text-gray-500 truncate">{node.description}</div>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        )
      ))}
    </div>
  );
};

export default WorkflowNodePalette;
