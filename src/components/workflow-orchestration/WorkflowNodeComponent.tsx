
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Play, 
  Square, 
  Diamond, 
  Settings, 
  GitBranch, 
  GitMerge,
  Clock,
  Zap,
  Trash2,
  Edit3
} from 'lucide-react';
import { WorkflowNode } from '@/services/workflow-orchestration-service';

const NODE_ICONS = {
  start: Play,
  task: Square,
  decision: Diamond,
  integration: Settings,
  parallel: GitBranch,
  merge: GitMerge,
  delay: Clock,
  trigger: Zap,
  end: Square
};

const NODE_COLORS = {
  start: 'bg-green-500 hover:bg-green-600',
  task: 'bg-blue-500 hover:bg-blue-600',
  decision: 'bg-yellow-500 hover:bg-yellow-600',
  integration: 'bg-purple-500 hover:bg-purple-600',
  parallel: 'bg-orange-500 hover:bg-orange-600',
  merge: 'bg-indigo-500 hover:bg-indigo-600',
  delay: 'bg-gray-500 hover:bg-gray-600',
  trigger: 'bg-red-500 hover:bg-red-600',
  end: 'bg-red-600 hover:bg-red-700'
};

interface WorkflowNodeComponentProps {
  node: WorkflowNode;
  isSelected: boolean;
  onSelect: () => void;
  onUpdate: (updates: Partial<WorkflowNode>) => void;
  onDelete: () => void;
}

const WorkflowNodeComponent: React.FC<WorkflowNodeComponentProps> = ({
  node,
  isSelected,
  onSelect,
  onUpdate,
  onDelete
}) => {
  const Icon = NODE_ICONS[node.type as keyof typeof NODE_ICONS] || Square;
  const colorClass = NODE_COLORS[node.type as keyof typeof NODE_COLORS] || 'bg-gray-500 hover:bg-gray-600';

  const handleNodeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect();
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete();
  };

  return (
    <div
      className="absolute z-10 group"
      style={{
        left: node.position.x,
        top: node.position.y,
        transform: 'translate(-50%, -50%)'
      }}
    >
      {/* Node container */}
      <div
        className={`
          relative cursor-pointer border-2 rounded-lg p-3 min-w-[140px] text-center 
          transition-all duration-200 hover:shadow-lg text-white
          ${isSelected 
            ? 'border-blue-400 shadow-lg ring-2 ring-blue-200' 
            : 'border-transparent hover:border-white/50'
          }
          ${colorClass}
        `}
        onClick={handleNodeClick}
      >
        {/* Node icon and title */}
        <div className="flex flex-col items-center gap-1">
          <Icon className="h-5 w-5" />
          <div className="text-sm font-medium truncate max-w-full">
            {node.name}
          </div>
        </div>

        {/* Node details */}
        <div className="mt-2 space-y-1">
          {node.description && (
            <div className="text-xs opacity-90 truncate">
              {node.description}
            </div>
          )}

          {/* Type-specific badges */}
          {node.type === 'decision' && node.conditions && node.conditions.length > 0 && (
            <Badge variant="secondary" className="text-xs">
              {node.conditions.length} rule{node.conditions.length !== 1 ? 's' : ''}
            </Badge>
          )}

          {node.type === 'task' && node.module && (
            <Badge variant="secondary" className="text-xs">
              {node.module}
            </Badge>
          )}

          {node.type === 'integration' && (
            <Badge variant="secondary" className="text-xs">
              External
            </Badge>
          )}

          {node.timeout_minutes && node.timeout_minutes !== 60 && (
            <Badge variant="outline" className="text-xs text-white border-white/50">
              {node.timeout_minutes}m
            </Badge>
          )}
        </div>

        {/* Action buttons (visible on hover/selection) */}
        {isSelected && (
          <div className="absolute -top-2 -right-2 flex gap-1">
            <Button
              size="sm"
              variant="destructive"
              className="h-6 w-6 p-0"
              onClick={handleDeleteClick}
              title="Delete node"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        )}

        {/* Connection points */}
        <div className="absolute inset-0 pointer-events-none">
          {/* Input connection point */}
          {node.type !== 'start' && (
            <div className="absolute -left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 bg-white border-2 border-gray-300 rounded-full"></div>
          )}
          
          {/* Output connection point */}
          {node.type !== 'end' && (
            <div className="absolute -right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 bg-white border-2 border-gray-300 rounded-full"></div>
          )}
        </div>
      </div>

      {/* Node validation indicators */}
      {node.type === 'start' && (
        <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2">
          <Badge variant="outline" className="text-xs bg-white">
            Entry Point
          </Badge>
        </div>
      )}

      {node.type === 'end' && (
        <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2">
          <Badge variant="outline" className="text-xs bg-white">
            Exit Point
          </Badge>
        </div>
      )}
    </div>
  );
};

export default WorkflowNodeComponent;
