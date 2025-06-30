
import React, { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { 
  Play, 
  Square, 
  Diamond, 
  Settings, 
  GitBranch, 
  GitMerge,
  Plus,
  Trash2,
  Save,
  X,
  Clock
} from 'lucide-react';
import { WorkflowOrchestration, WorkflowNode, WorkflowEdge, WorkflowCondition, WorkflowAssignment } from '@/services/workflow-orchestration-service';

interface VisualWorkflowDesignerProps {
  workflow?: WorkflowOrchestration;
  onSave: (workflow: Omit<WorkflowOrchestration, 'id' | 'created_at' | 'updated_at'>) => void;
  onCancel: () => void;
}

interface NodePosition {
  x: number;
  y: number;
}

const NODE_TYPES = [
  { type: 'start', label: 'Start', icon: Play, color: 'bg-green-500' },
  { type: 'task', label: 'Task', icon: Square, color: 'bg-blue-500' },
  { type: 'decision', label: 'Decision', icon: Diamond, color: 'bg-yellow-500' },
  { type: 'integration', label: 'Integration', icon: Settings, color: 'bg-purple-500' },
  { type: 'parallel', label: 'Parallel', icon: GitBranch, color: 'bg-orange-500' },
  { type: 'merge', label: 'Merge', icon: GitMerge, color: 'bg-indigo-500' },
  { type: 'end', label: 'End', icon: Square, color: 'bg-red-500' }
];

const VisualWorkflowDesigner: React.FC<VisualWorkflowDesignerProps> = ({
  workflow,
  onSave,
  onCancel
}) => {
  const [workflowData, setWorkflowData] = useState<Omit<WorkflowOrchestration, 'id' | 'created_at' | 'updated_at'>>({
    name: workflow?.name || '',
    description: workflow?.description || '',
    version: workflow?.version || 1,
    status: workflow?.status || 'draft',
    category: workflow?.category || '',
    trigger_type: workflow?.trigger_type || 'manual',
    trigger_config: workflow?.trigger_config || {},
    nodes: workflow?.nodes || [],
    edges: workflow?.edges || [],
    variables: workflow?.variables || {},
    business_rules: workflow?.business_rules || [],
    org_id: workflow?.org_id || '',
    created_by: workflow?.created_by
  });

  const [selectedNode, setSelectedNode] = useState<WorkflowNode | null>(null);
  const [draggedNodeType, setDraggedNodeType] = useState<string | null>(null);
  const [canvasSize] = useState({ width: 1200, height: 800 });

  // Generate unique ID for new nodes
  const generateNodeId = () => `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // Add a new node to the canvas
  const addNode = useCallback((type: string, position: NodePosition) => {
    const newNode: WorkflowNode = {
      id: generateNodeId(),
      type: type as WorkflowNode['type'],
      name: `${type.charAt(0).toUpperCase() + type.slice(1)} Node`,
      description: '',
      position,
      conditions: [],
      assignments: [],
      timeout_minutes: 60,
      retry_config: {
        max_attempts: 3,
        delay_seconds: 30
      }
    };

    setWorkflowData(prev => ({
      ...prev,
      nodes: [...prev.nodes, newNode]
    }));
  }, []);

  // Update a node's properties
  const updateNode = useCallback((nodeId: string, updates: Partial<WorkflowNode>) => {
    setWorkflowData(prev => ({
      ...prev,
      nodes: prev.nodes.map(node => 
        node.id === nodeId ? { ...node, ...updates } : node
      )
    }));
  }, []);

  // Delete a node
  const deleteNode = useCallback((nodeId: string) => {
    setWorkflowData(prev => ({
      ...prev,
      nodes: prev.nodes.filter(node => node.id !== nodeId),
      edges: prev.edges.filter(edge => edge.source !== nodeId && edge.target !== nodeId)
    }));
    setSelectedNode(null);
  }, []);

  // Handle canvas drop for new nodes
  const handleCanvasDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!draggedNodeType) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const position = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };

    addNode(draggedNodeType, position);
    setDraggedNodeType(null);
  }, [draggedNodeType, addNode]);

  // Save workflow
  const handleSave = () => {
    if (!workflowData.name.trim()) {
      alert('Please enter a workflow name');
      return;
    }
    if (!workflowData.category.trim()) {
      alert('Please select a category');
      return;
    }

    onSave(workflowData);
  };

  // Node component
  const NodeComponent: React.FC<{ node: WorkflowNode }> = ({ node }) => {
    const nodeType = NODE_TYPES.find(t => t.type === node.type);
    const Icon = nodeType?.icon || Square;

    return (
      <div
        className={`absolute cursor-pointer border-2 rounded-lg p-3 min-w-[120px] text-center transition-all hover:shadow-lg ${
          selectedNode?.id === node.id 
            ? 'border-blue-500 shadow-lg' 
            : 'border-gray-300 hover:border-gray-400'
        } ${nodeType?.color || 'bg-gray-500'} text-white`}
        style={{
          left: node.position.x,
          top: node.position.y,
          transform: 'translate(-50%, -50%)'
        }}
        onClick={() => setSelectedNode(node)}
      >
        <Icon className="h-4 w-4 mx-auto mb-1" />
        <div className="text-xs font-medium">{node.name}</div>
        {node.type === 'decision' && node.conditions && node.conditions.length > 0 && (
          <Badge variant="secondary" className="text-xs mt-1">
            {node.conditions.length} rule{node.conditions.length !== 1 ? 's' : ''}
          </Badge>
        )}
      </div>
    );
  };

  return (
    <div className="h-full max-h-[90vh] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex-1">
          <Input
            placeholder="Workflow Name"
            value={workflowData.name}
            onChange={(e) => setWorkflowData(prev => ({ ...prev, name: e.target.value }))}
            className="text-lg font-medium"
          />
        </div>
        <div className="flex items-center gap-2 ml-4">
          <Button variant="outline" onClick={onCancel}>
            <X className="h-4 w-4 mr-1" />
            Cancel
          </Button>
          <Button onClick={handleSave}>
            <Save className="h-4 w-4 mr-1" />
            Save Workflow
          </Button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - Node Palette & Properties */}
        <div className="w-80 border-r flex flex-col">
          <Tabs defaultValue="palette" className="flex-1">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="palette">Palette</TabsTrigger>
              <TabsTrigger value="properties">Properties</TabsTrigger>
            </TabsList>
            
            <TabsContent value="palette" className="p-4 space-y-4">
              <div>
                <Label className="text-sm font-medium mb-2 block">Drag nodes to canvas</Label>
                <div className="grid grid-cols-2 gap-2">
                  {NODE_TYPES.map((nodeType) => {
                    const Icon = nodeType.icon;
                    return (
                      <div
                        key={nodeType.type}
                        draggable
                        onDragStart={() => setDraggedNodeType(nodeType.type)}
                        className={`p-3 rounded-lg cursor-move text-white text-center transition-transform hover:scale-105 ${nodeType.color}`}
                      >
                        <Icon className="h-4 w-4 mx-auto mb-1" />
                        <div className="text-xs">{nodeType.label}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={workflowData.category}
                    onValueChange={(value) => setWorkflowData(prev => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="incident_management">Incident Management</SelectItem>
                      <SelectItem value="governance">Governance</SelectItem>
                      <SelectItem value="risk_assessment">Risk Assessment</SelectItem>
                      <SelectItem value="compliance">Compliance</SelectItem>
                      <SelectItem value="business_continuity">Business Continuity</SelectItem>
                      <SelectItem value="audit">Audit</SelectItem>
                      <SelectItem value="third_party">Third Party</SelectItem>
                      <SelectItem value="general">General</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="trigger_type">Trigger Type</Label>
                  <Select
                    value={workflowData.trigger_type}
                    onValueChange={(value) => setWorkflowData(prev => ({ 
                      ...prev, 
                      trigger_type: value as 'manual' | 'scheduled' | 'event' | 'api'
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select trigger" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="manual">Manual</SelectItem>
                      <SelectItem value="scheduled">Scheduled</SelectItem>
                      <SelectItem value="event">Event</SelectItem>
                      <SelectItem value="api">API</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe the workflow purpose..."
                    value={workflowData.description || ''}
                    onChange={(e) => setWorkflowData(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="properties" className="p-4">
              {selectedNode ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">Node Properties</h3>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => deleteNode(selectedNode.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="node-name">Name</Label>
                      <Input
                        id="node-name"
                        value={selectedNode.name}
                        onChange={(e) => updateNode(selectedNode.id, { name: e.target.value })}
                      />
                    </div>

                    <div>
                      <Label htmlFor="node-description">Description</Label>
                      <Textarea
                        id="node-description"
                        value={selectedNode.description || ''}
                        onChange={(e) => updateNode(selectedNode.id, { description: e.target.value })}
                        rows={2}
                      />
                    </div>

                    {selectedNode.type === 'task' && (
                      <>
                        <div>
                          <Label htmlFor="module">Module</Label>
                          <Select
                            value={selectedNode.module || ''}
                            onValueChange={(value) => updateNode(selectedNode.id, { module: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select module" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="incident_management">Incident Management</SelectItem>
                              <SelectItem value="governance">Governance</SelectItem>
                              <SelectItem value="risk_management">Risk Management</SelectItem>
                              <SelectItem value="compliance">Compliance</SelectItem>
                              <SelectItem value="audit">Audit</SelectItem>
                              <SelectItem value="third_party">Third Party</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <div>
                          <Label htmlFor="action">Action</Label>
                          <Input
                            id="action"
                            placeholder="e.g., create_incident, assign_reviewer"
                            value={selectedNode.action || ''}
                            onChange={(e) => updateNode(selectedNode.id, { action: e.target.value })}
                          />
                        </div>
                      </>
                    )}

                    {selectedNode.type === 'integration' && (
                      <div>
                        <Label>Integration Configuration</Label>
                        <Textarea
                          placeholder="Enter JSON configuration..."
                          value={JSON.stringify(selectedNode.integration_config || {}, null, 2)}
                          onChange={(e) => {
                            try {
                              const config = JSON.parse(e.target.value);
                              updateNode(selectedNode.id, { integration_config: config });
                            } catch {
                              // Invalid JSON, ignore
                            }
                          }}
                          rows={4}
                        />
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <Label htmlFor="timeout">Timeout (minutes)</Label>
                    </div>
                    <Input
                      id="timeout"
                      type="number"
                      min="1"
                      value={selectedNode.timeout_minutes || 60}
                      onChange={(e) => updateNode(selectedNode.id, { 
                        timeout_minutes: parseInt(e.target.value) || 60 
                      })}
                    />
                  </div>
                </div>
              ) : (
                <div className="text-center text-muted-foreground py-8">
                  <Settings className="h-8 w-8 mx-auto mb-2" />
                  <p>Select a node to edit its properties</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Main Canvas */}
        <div className="flex-1 relative overflow-hidden bg-gray-50">
          <div
            className="w-full h-full relative"
            onDrop={handleCanvasDrop}
            onDragOver={(e) => e.preventDefault()}
            style={{ 
              backgroundImage: 'radial-gradient(circle, #e5e7eb 1px, transparent 1px)',
              backgroundSize: '20px 20px'
            }}
          >
            {/* Render nodes */}
            {workflowData.nodes.map(node => (
              <NodeComponent key={node.id} node={node} />
            ))}

            {/* Instructions overlay when canvas is empty */}
            {workflowData.nodes.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Card className="p-8 text-center max-w-md">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 justify-center">
                      <Plus className="h-5 w-5" />
                      Start Building Your Workflow
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">
                      Drag nodes from the palette on the left to create your workflow. 
                      Start with a "Start" node and build your process step by step.
                    </p>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Status Bar */}
      <div className="flex items-center justify-between p-2 border-t bg-gray-50 text-sm text-muted-foreground">
        <div className="flex items-center gap-4">
          <span>Nodes: {workflowData.nodes.length}</span>
          <span>Edges: {workflowData.edges.length}</span>
          <span>Status: {workflowData.status}</span>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">Version {workflowData.version}</Badge>
          {workflowData.trigger_type !== 'manual' && (
            <Badge variant="secondary">{workflowData.trigger_type} trigger</Badge>
          )}
        </div>
      </div>
    </div>
  );
};

export default VisualWorkflowDesigner;
