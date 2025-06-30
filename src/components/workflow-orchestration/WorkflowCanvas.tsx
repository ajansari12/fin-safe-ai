
import React, { useCallback, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, Trash2 } from 'lucide-react';
import { WorkflowNode, WorkflowEdge } from '@/services/workflow-orchestration-service';
import WorkflowNodeComponent from './WorkflowNodeComponent';

interface WorkflowCanvasProps {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  selectedNode: WorkflowNode | null;
  onNodeSelect: (node: WorkflowNode | null) => void;
  onNodeAdd: (type: string, position: { x: number; y: number }) => void;
  onNodeUpdate: (nodeId: string, updates: Partial<WorkflowNode>) => void;
  onNodeDelete: (nodeId: string) => void;
  draggedNodeType: string | null;
  onDraggedNodeTypeChange: (type: string | null) => void;
}

const WorkflowCanvas: React.FC<WorkflowCanvasProps> = ({
  nodes,
  edges,
  selectedNode,
  onNodeSelect,
  onNodeAdd,
  onNodeUpdate,
  onNodeDelete,
  draggedNodeType,
  onDraggedNodeTypeChange
}) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleCanvasDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (!draggedNodeType || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const position = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };

    onNodeAdd(draggedNodeType, position);
    onDraggedNodeTypeChange(null);
  }, [draggedNodeType, onNodeAdd, onDraggedNodeTypeChange]);

  const handleCanvasDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleCanvasDragLeave = useCallback((e: React.DragEvent) => {
    if (!canvasRef.current?.contains(e.relatedTarget as Node)) {
      setIsDragging(false);
    }
  }, []);

  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    // Only deselect if clicking on the canvas itself, not on a node
    if (e.target === e.currentTarget) {
      onNodeSelect(null);
    }
  }, [onNodeSelect]);

  return (
    <div className="flex-1 relative overflow-hidden bg-gray-50">
      <div
        ref={canvasRef}
        className={`w-full h-full relative transition-all duration-200 ${
          isDragging ? 'bg-blue-50 border-2 border-dashed border-blue-300' : ''
        }`}
        onDrop={handleCanvasDrop}
        onDragOver={handleCanvasDragOver}
        onDragLeave={handleCanvasDragLeave}
        onClick={handleCanvasClick}
        style={{ 
          backgroundImage: isDragging 
            ? 'radial-gradient(circle, #3b82f6 2px, transparent 2px)'
            : 'radial-gradient(circle, #e5e7eb 1px, transparent 1px)',
          backgroundSize: '20px 20px'
        }}
      >
        {/* Render workflow nodes */}
        {nodes.map(node => (
          <WorkflowNodeComponent
            key={node.id}
            node={node}
            isSelected={selectedNode?.id === node.id}
            onSelect={() => onNodeSelect(node)}
            onUpdate={(updates) => onNodeUpdate(node.id, updates)}
            onDelete={() => onNodeDelete(node.id)}
          />
        ))}

        {/* Render workflow edges (connections) */}
        <svg 
          className="absolute inset-0 pointer-events-none"
          style={{ zIndex: 1 }}
        >
          {edges.map(edge => {
            const sourceNode = nodes.find(n => n.id === edge.source);
            const targetNode = nodes.find(n => n.id === edge.target);
            
            if (!sourceNode || !targetNode) return null;

            return (
              <line
                key={edge.id}
                x1={sourceNode.position.x}
                y1={sourceNode.position.y}
                x2={targetNode.position.x}
                y2={targetNode.position.y}
                stroke="#6b7280"
                strokeWidth="2"
                markerEnd="url(#arrowhead)"
              />
            );
          })}
          
          {/* Arrow marker definition */}
          <defs>
            <marker
              id="arrowhead"
              markerWidth="10"
              markerHeight="7"
              refX="9"
              refY="3.5"
              orient="auto"
            >
              <polygon
                points="0 0, 10 3.5, 0 7"
                fill="#6b7280"
              />
            </marker>
          </defs>
        </svg>

        {/* Empty state */}
        {nodes.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <Card className="p-8 text-center max-w-md">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 justify-center">
                  <Plus className="h-5 w-5" />
                  Start Building Your Workflow
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Drag nodes from the palette on the left to create your workflow. 
                  Start with a "Start" node and build your process step by step.
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
                  <Badge variant="outline">Drag & Drop</Badge>
                  <Badge variant="outline">Connect Nodes</Badge>
                  <Badge variant="outline">Configure Actions</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Drop zone indicator */}
        {isDragging && draggedNodeType && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg">
              Drop to add {draggedNodeType} node
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkflowCanvas;
