import React, { useState, useCallback, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Save, Play, Settings, Plus, Trash2, Copy, Eye } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { WorkflowOrchestration, WorkflowNode, WorkflowEdge, workflowOrchestrationService } from "@/services/workflow-orchestration-service";

interface VisualWorkflowDesignerProps {
  workflow?: WorkflowOrchestration;
  onSave: (workflow: Omit<WorkflowOrchestration, 'id' | 'created_at' | 'updated_at'>) => void;
  onCancel: () => void;
}

const nodeTypes = [
  { type: 'start', label: 'Start', icon: '▶️', color: 'bg-green-100 border-green-300' },
  { type: 'task', label: 'Task', icon: '📋', color: 'bg-blue-100 border-blue-300' },
  { type: 'decision', label: 'Decision', icon: '❓', color: 'bg-yellow-100 border-yellow-300' },
  { type: 'integration', label: 'Integration', icon: '🔗', color: 'bg-purple-100 border-purple-300' },
  { type: 'parallel', label: 'Parallel', icon: '⏸️', color: 'bg-orange-100 border-orange-300' },
  { type: 'end', label: 'End', icon: '⏹️', color: 'bg-red-100 border-red-300' }
];

const moduleOptions = [
  'governance', 'incident', 'audit', 'risk', 'third_party', 
  'business_continuity', 'controls', 'compliance', 'documents'
];

const VisualWorkflowDesigner: React.FC<VisualWorkflowDesignerProps> = ({
  workflow,
  onSave,
  onCancel
}) => {
  const { toast } = useToast();
  const [workflowData, setWorkflowData] = useState<Omit<WorkflowOrchestration, 'id' | 'created_at' | 'updated_at'>>({
    name: workflow?.name || "",
    description: workflow?.description || "",
    version: workflow?.version || 1,
    status: workflow?.status || 'draft',
    category: workflow?.category || '',
    trigger_type: workflow?.trigger_type || 'manual',
    trigger_config: workflow?.trigger_config || {},
    nodes: workflow?.nodes || [],
    edges: workflow?.edges || [],
    variables: workflow?.variables || {},
    business_rules: workflow?.business_rules || [],
    org_id: workflow?.org_id || "",
    created_by: workflow?.created_by
  });

  const [selectedNode, setSelectedNode] = useState<WorkflowNode | null>(null);
  const [isNodeDialogOpen, setIsNodeDialogOpen] = useState(false);
  const [draggedNodeType, setDraggedNodeType] = useState<string | null>(null);
  const [canvasPosition, setCanvasPosition] = useState({ x: 0, y: 0 });

  const handleAddNode = useCallback((nodeType: string, position: { x: number; y: number }) => {
    const newNode: WorkflowNode = {
      id: `node_${Date.now()}`,
      type: nodeType as WorkflowNode['type'],
      name: `${nodeType.charAt(0).toUpperCase() + nodeType.slice(1)} Node`,
      position,
      conditions: [],
      assignments: []
    };

    setWorkflowData(prev => ({
      ...prev,
      nodes: [...prev.nodes, newNode]
    }));
  }, []);

  const handleUpdateNode = useCallback((nodeId: string, updates: Partial<WorkflowNode>) => {
    setWorkflowData(prev => ({
      ...prev,
      nodes: prev.nodes.map(node => 
        node.id === nodeId ? { ...node, ...updates } : node
      )
    }));
  }, []);

  const handleDeleteNode = useCallback((nodeId: string) => {
    setWorkflowData(prev => ({
      ...prev,
      nodes: prev.nodes.filter(node => node.id !== nodeId),
      edges: prev.edges.filter(edge => edge.source !== nodeId && edge.target !== nodeId)
    }));
  }, []);

  const handleConnectNodes = useCallback((sourceId: string, targetId: string) => {
    const newEdge: WorkflowEdge = {
      id: `edge_${Date.now()}`,
      source: sourceId,
      target: targetId,
      label: 'Next'
    };

    setWorkflowData(prev => ({
      ...prev,
      edges: [...prev.edges, newEdge]
    }));
  }, []);

  const handleCanvasDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (draggedNodeType) {
      const rect = e.currentTarget.getBoundingClientRect();
      const position = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
      handleAddNode(draggedNodeType, position);
      setDraggedNodeType(null);
    }
  }, [draggedNodeType, handleAddNode]);

  const handleSaveWorkflow = useCallback(() => {
    if (!workflowData.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Workflow name is required",
        variant: "destructive"
      });
      return;
    }

    if (workflowData.nodes.length === 0) {
      toast({
        title: "Validation Error",
        description: "Workflow must have at least one node",
        variant: "destructive"
      });
      return;
    }

    onSave(workflowData);
  }, [workflowData, onSave, toast]);

  const handleExecuteWorkflow = useCallback(async () => {
    if (!workflow?.id) {
      toast({
        title: "Error",
        description: "Save the workflow before executing",
        variant: "destructive"
      });
      return;
    }

    try {
      await workflowOrchestrationService.executeWorkflow(workflow.id, {});
      toast({
        title: "Success",
        description: "Workflow execution started"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to start workflow execution",
        variant: "destructive"
      });
    }
  }, [workflow?.id, toast]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Visual Workflow Designer</h2>
          <p className="text-muted-foreground">
            Design sophisticated workflows with drag-and-drop simplicity
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button variant="outline" onClick={handleExecuteWorkflow} disabled={!workflow?.id}>
            <Play className="h-4 w-4 mr-2" />
            Test Run
          </Button>
          <Button onClick={handleSaveWorkflow}>
            <Save className="h-4 w-4 mr-2" />
            Save Workflow
          </Button>
        </div>
      </div>

      <Tabs defaultValue="designer" className="space-y-4">
        <TabsList>
          <TabsTrigger value="designer">Visual Designer</TabsTrigger>
          <TabsTrigger value="properties">Properties</TabsTrigger>
          <TabsTrigger value="rules">Business Rules</TabsTrigger>
          <TabsTrigger value="variables">Variables</TabsTrigger>
        </TabsList>

        <TabsContent value="designer" className="space-y-4">
          <div className="grid grid-cols-12 gap-4 h-[600px]">
            {/* Node Palette */}
            <div className="col-span-2 space-y-2">
              <h3 className="font-medium">Node Types</h3>
              <div className="space-y-2">
                {nodeTypes.map((nodeType) => (
                  <div
                    key={nodeType.type}
                    draggable
                    onDragStart={() => setDraggedNodeType(nodeType.type)}
                    className={`p-3 rounded border-2 cursor-move hover:shadow-md transition-shadow ${nodeType.color}`}
                  >
                    <div className="flex items-center gap-2">
                      <span>{nodeType.icon}</span>
                      <span className="text-sm font-medium">{nodeType.label}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Canvas */}
            <div className="col-span-8">
              <div
                className="relative w-full h-full border-2 border-dashed border-gray-300 rounded-lg bg-gray-50 overflow-auto"
                onDrop={handleCanvasDrop}
                onDragOver={(e) => e.preventDefault()}
              >
                {workflowData.nodes.map((node) => (
                  <div
                    key={node.id}
                    className={`absolute p-3 rounded border-2 cursor-pointer hover:shadow-md transition-shadow ${
                      nodeTypes.find(nt => nt.type === node.type)?.color || 'bg-gray-100 border-gray-300'
                    }`}
                    style={{
                      left: node.position.x,
                      top: node.position.y,
                      minWidth: '120px'
                    }}
                    onClick={() => {
                      setSelectedNode(node);
                      setIsNodeDialogOpen(true);
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span>{nodeTypes.find(nt => nt.type === node.type)?.icon}</span>
                        <span className="text-sm font-medium">{node.name}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteNode(node.id);
                        }}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                    {node.module && (
                      <Badge variant="outline" className="mt-1 text-xs">
                        {node.module}
                      </Badge>
                    )}
                  </div>
                ))}

                {/* Render connections */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none">
                  {workflowData.edges.map((edge) => {
                    const sourceNode = workflowData.nodes.find(n => n.id === edge.source);
                    const targetNode = workflowData.nodes.find(n => n.id === edge.target);
                    
                    if (!sourceNode || !targetNode) return null;

                    const startX = sourceNode.position.x + 60;
                    const startY = sourceNode.position.y + 20;
                    const endX = targetNode.position.x + 60;
                    const endY = targetNode.position.y + 20;

                    return (
                      <g key={edge.id}>
                        <line
                          x1={startX}
                          y1={startY}
                          x2={endX}
                          y2={endY}
                          stroke="#6b7280"
                          strokeWidth="2"
                          markerEnd="url(#arrowhead)"
                        />
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
                      </g>
                    );
                  })}
                </svg>

                {workflowData.nodes.length === 0 && (
                  <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                    <div className="text-center">
                      <p className="text-lg">Drag nodes from the palette to start building your workflow</p>
                      <p className="text-sm">Connect nodes by clicking and dragging between them</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Properties Panel */}
            <div className="col-span-2 space-y-4">
              <h3 className="font-medium">Workflow Properties</h3>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="workflowName">Name</Label>
                  <Input
                    id="workflowName"
                    value={workflowData.name}
                    onChange={(e) => setWorkflowData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Workflow name"
                  />
                </div>

                <div>
                  <Label htmlFor="workflowCategory">Category</Label>
                  <Select
                    value={workflowData.category}
                    onValueChange={(value) => setWorkflowData(prev => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="governance">Governance</SelectItem>
                      <SelectItem value="incident">Incident Management</SelectItem>
                      <SelectItem value="audit">Audit & Compliance</SelectItem>
                      <SelectItem value="risk">Risk Management</SelectItem>
                      <SelectItem value="continuity">Business Continuity</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="triggerType">Trigger Type</Label>
                  <Select
                    value={workflowData.trigger_type}
                    onValueChange={(value) => setWorkflowData(prev => ({ ...prev, trigger_type: value as any }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select trigger" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="manual">Manual</SelectItem>
                      <SelectItem value="scheduled">Scheduled</SelectItem>
                      <SelectItem value="event">Event-driven</SelectItem>
                      <SelectItem value="api">API Trigger</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="pt-2">
                  <Badge variant={workflowData.status === 'active' ? 'default' : 'secondary'}>
                    {workflowData.status.toUpperCase()}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="properties" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Workflow Properties</CardTitle>
              <CardDescription>
                Configure global workflow settings and metadata
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="workflowNameProp">Name</Label>
                <Input
                  id="workflowNameProp"
                  value={workflowData.name}
                  onChange={(e) => setWorkflowData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Workflow name"
                />
              </div>
              <div>
                <Label htmlFor="workflowDescription">Description</Label>
                <Input
                  id="workflowDescription"
                  value={workflowData.description || ''}
                  onChange={(e) => setWorkflowData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Workflow description"
                />
              </div>
              <div>
                <Label htmlFor="workflowVersion">Version</Label>
                <Input
                  id="workflowVersion"
                  type="number"
                  value={workflowData.version}
                  onChange={(e) => setWorkflowData(prev => ({ ...prev, version: Number(e.target.value) }))}
                  min={1}
                />
              </div>
              <div>
                <Label htmlFor="workflowStatus">Status</Label>
                <Select
                  value={workflowData.status}
                  onValueChange={(value) => setWorkflowData(prev => ({ ...prev, status: value as any }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="deprecated">Deprecated</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rules" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Business Rules</CardTitle>
              <CardDescription>
                Define business rules that govern workflow behavior
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Business rules configuration coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="variables" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Workflow Variables</CardTitle>
              <CardDescription>
                Define variables that can be used throughout the workflow
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Variables configuration coming soon...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Node Configuration Dialog */}
      <Dialog open={isNodeDialogOpen} onOpenChange={setIsNodeDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Configure Node: {selectedNode?.name}</DialogTitle>
            <DialogDescription>
              Set up the properties and behavior for this workflow node
            </DialogDescription>
          </DialogHeader>
          
          {selectedNode && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="nodeName">Node Name</Label>
                <Input
                  id="nodeName"
                  value={selectedNode.name}
                  onChange={(e) => {
                    const updatedNode = { ...selectedNode, name: e.target.value };
                    setSelectedNode(updatedNode);
                    handleUpdateNode(selectedNode.id, { name: e.target.value });
                  }}
                />
              </div>

              <div>
                <Label htmlFor="nodeDescription">Description</Label>
                <Input
                  id="nodeDescription"
                  value={selectedNode.description || ''}
                  onChange={(e) => {
                    const updatedNode = { ...selectedNode, description: e.target.value };
                    setSelectedNode(updatedNode);
                    handleUpdateNode(selectedNode.id, { description: e.target.value });
                  }}
                />
              </div>

              {selectedNode.type === 'task' && (
                <div>
                  <Label htmlFor="nodeModule">Module</Label>
                  <Select
                    value={selectedNode.module || ''}
                    onValueChange={(value) => {
                      const updatedNode = { ...selectedNode, module: value };
                      setSelectedNode(updatedNode);
                      handleUpdateNode(selectedNode.id, { module: value });
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select module" />
                    </SelectTrigger>
                    <SelectContent>
                      {moduleOptions.map((module) => (
                        <SelectItem key={module} value={module}>
                          {module.charAt(0).toUpperCase() + module.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="flex justify-end">
                <Button onClick={() => setIsNodeDialogOpen(false)}>
                  Done
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VisualWorkflowDesigner;
