
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
  Brain,
  Trash2,
  MoreVertical
} from 'lucide-react';
import { WorkflowNode } from '@/services/workflow-orchestration-service';

interface WorkflowNodeComponentProps {
  node: WorkflowNode;
  isSelected: boolean;
  onSelect: () => void;
  onUpdate: (updates: Partial<WorkflowNode>) => void;
  onDelete: () => void;
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

const NODE_COLORS: Record<string, string> = {
  start: 'bg-green-500',
  task: 'bg-blue-500',
  decision: 'bg-yellow-500',
  integration: 'bg-purple-500',
  parallel: 'bg-orange-500',
  merge: 'bg-indigo-500',
  delay: 'bg-gray-500',
  trigger: 'bg-red-500',
  end: 'bg-red-600',
  approval: 'bg-cyan-500',
  notification: 'bg-pink-500',
  data_transform: 'bg-teal-500',
  validation: 'bg-emerald-500',
  ml_prediction: 'bg-violet-500'
};

const WorkflowNodeComponent: React.FC<WorkflowNodeComponentProps> = ({
  node,
  isSelected,
  onSelect,
  onUpdate,
  onDelete
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const Icon = ICON_MAP[node.data.nodeType] || Square;
  const bgColor = NODE_COLORS[node.data.nodeType] || 'bg-gray-500';

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.detail === 2) { // Double click
      onSelect();
      return;
    }

    const rect = e.currentTarget.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
    setIsDragging(true);
    onSelect();
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;

    const canvas = e.currentTarget.closest('.workflow-canvas');
    if (!canvas) return;

    const canvasRect = canvas.getBoundingClientRect();
    const newPosition = {
      x: e.clientX - canvasRect.left - dragOffset.x,
      y: e.clientY - canvasRect.top - dragOffset.y
    };

    onUpdate({ position: newPosition });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const getStatusColor = () => {
    // This would come from execution status in a real implementation
    return 'bg-gray-200';
  };

  return (
    <div
      className={`absolute cursor-move select-none transition-all duration-200 ${
        isSelected ? 'ring-2 ring-blue-500 ring-offset-2' : ''
      } ${isDragging ? 'z-50 scale-105' : 'z-10'}`}
      style={{
        left: node.position.x,
        top: node.position.y,
        transform: isDragging ? 'rotate(5deg)' : 'none'
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <Card className={`w-48 shadow-lg hover:shadow-xl transition-shadow ${
        isDragging ? 'shadow-2xl' : ''
      }`}>
        <div className={`p-3 text-white ${bgColor} rounded-t-lg`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Icon className="h-4 w-4" />
              <div className="font-medium text-sm truncate">
                {node.data.label}
              </div>
            </div>
            
            {isSelected && (
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 text-white hover:bg-white/20"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>
        
        <div className="p-3">
          <div className="flex items-center justify-between mb-2">
            <Badge variant="outline" className="text-xs">
              {node.data.nodeType}
            </Badge>
            
            {/* Status indicator */}
            <div className={`w-2 h-2 rounded-full ${getStatusColor()}`} />
          </div>
          
          {/* Configuration preview */}
          {Object.keys(node.data.configuration).length > 0 && (
            <div className="text-xs text-gray-600 mt-2">
              <div className="truncate">
                {Object.keys(node.data.configuration).length} config{Object.keys(node.data.configuration).length !== 1 ? 's' : ''}
              </div>
            </div>
          )}
          
          {/* Connection points */}
          <div className="flex justify-between items-center mt-3">
            {/* Input connection point */}
            {node.data.nodeType !== 'start' && (
              <div className="w-3 h-3 rounded-full bg-gray-300 border-2 border-gray-500 -ml-1" />
            )}
            
            <div className="flex-1" />
            
            {/* Output connection point */}
            {node.data.nodeType !== 'end' && (
              <div className="w-3 h-3 rounded-full bg-gray-300 border-2 border-gray-500 -mr-1" />
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default WorkflowNodeComponent;
