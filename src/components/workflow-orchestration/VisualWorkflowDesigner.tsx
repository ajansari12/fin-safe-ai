
import React, { useState, useCallback, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Play, 
  Save, 
  Download, 
  Upload, 
  Settings, 
  Trash2,
  Plus,
  Eye,
  Brain,
  Zap
} from 'lucide-react';
import { toast } from 'sonner';
import WorkflowCanvas from './WorkflowCanvas';
import WorkflowNodePalette from './WorkflowNodePalette';
import { workflowOrchestrationService, type Workflow, type WorkflowNode } from '@/services/workflow-orchestration-service';
import { intelligentAutomationService } from '@/services/intelligent-automation-service';
import { useAuth } from '@/contexts/AuthContext';

interface VisualWorkflowDesignerProps {
  workflowId?: string;
  onSave?: (workflow: Workflow) => void;
  onExecute?: (executionId: string) => void;
}

const VisualWorkflowDesigner: React.FC<VisualWorkflowDesignerProps> = ({
  workflowId,
  onSave,
  onExecute
}) => {
  const { profile } = useAuth();
  const [workflow, setWorkflow] = useState<Partial<Workflow>>({
    name: '',
    description: '',
    status: 'draft',
    workflow_definition: {
      nodes: [],
      edges: [],
      version: 1
    },
    triggers: {}
  });

  const [nodes, setNodes] = useState<WorkflowNode[]>([]);
  const [edges, setEdges] = useState<any[]>([]);
  const [selectedNode, setSelectedNode] = useState<WorkflowNode | null>(null);
  const [draggedNodeType, setDraggedNodeType] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<any[]>([]);

  // Node management
  const handleNodeAdd = useCallback((nodeType: string, position: { x: number; y: number }) => {
    const newNode: WorkflowNode = {
      id: `node-${Date.now()}`,
      type: nodeType,
      position,
      data: {
        label: `${nodeType.charAt(0).toUpperCase() + nodeType.slice(1)} Node`,
        nodeType,
        configuration: {},
        inputs: {},
        outputs: {}
      }
    };

    setNodes(prev => [...prev, newNode]);
    setSelectedNode(newNode);
  }, []);

  const handleNodeUpdate = useCallback((nodeId: string, updates: Partial<WorkflowNode>) => {
    setNodes(prev => prev.map(node => 
      node.id === nodeId ? { ...node, ...updates } : node
    ));

    if (selectedNode?.id === nodeId) {
      setSelectedNode(prev => prev ? { ...prev, ...updates } : null);
    }
  }, [selectedNode]);

  const handleNodeDelete = useCallback((nodeId: string) => {
    setNodes(prev => prev.filter(node => node.id !== nodeId));
    setEdges(prev => prev.filter(edge => edge.source !== nodeId && edge.target !== nodeId));
    
    if (selectedNode?.id === nodeId) {
      setSelectedNode(null);
    }
  }, [selectedNode]);

  // Workflow operations
  const handleSaveWorkflow = async () => {
    if (!profile?.organization_id) {
      toast.error('Organization not found');
      return;
    }

    if (!workflow.name?.trim()) {
      toast.error('Please enter a workflow name');
      return;
    }

    setIsLoading(true);
    try {
      const workflowData: Omit<Workflow, 'id' | 'created_at' | 'updated_at'> = {
        org_id: profile.organization_id,
        name: workflow.name,
        description: workflow.description || '',
        status: workflow.status || 'draft',
        workflow_definition: {
          nodes,
          edges,
          version: workflow.workflow_definition?.version || 1
        },
        triggers: workflow.triggers || {},
        created_by: profile.id
      };

      let savedWorkflow;
      if (workflowId) {
        await workflowOrchestrationService.updateWorkflow(workflowId, workflowData);
        savedWorkflow = { ...workflowData, id: workflowId, created_at: new Date().toISOString(), updated_at: new Date().toISOString() } as Workflow;
      } else {
        savedWorkflow = await workflowOrchestrationService.createWorkflow(workflowData);
      }

      toast.success('Workflow saved successfully');
      onSave?.(savedWorkflow);
    } catch (error) {
      console.error('Error saving workflow:', error);
      toast.error('Failed to save workflow');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExecuteWorkflow = async () => {
    if (!workflowId) {
      toast.error('Please save the workflow first');
      return;
    }

    setIsLoading(true);
    try {
      const executionId = await workflowOrchestrationService.executeWorkflow(workflowId, {
        initiated_by: profile?.id,
        timestamp: new Date().toISOString()
      });

      toast.success('Workflow execution started');
      onExecute?.(executionId);
    } catch (error) {
      console.error('Error executing workflow:', error);
      toast.error('Failed to execute workflow');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGetAISuggestions = async () => {
    if (!profile?.organization_id) return;

    setIsLoading(true);
    try {
      const suggestions = await intelligentAutomationService.generateWorkflowSuggestions(
        profile.organization_id,
        { module: 'workflow_designer' }
      );
      
      setAiSuggestions(suggestions);
      toast.success(`Found ${suggestions.length} AI suggestions`);
    } catch (error) {
      console.error('Error getting AI suggestions:', error);
      toast.error('Failed to get AI suggestions');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplySuggestion = (suggestion: any) => {
    const template = suggestion.template;
    if (template?.nodes) {
      setNodes(template.nodes);
    }
    if (template?.edges) {
      setEdges(template.edges);
    }
    setWorkflow(prev => ({
      ...prev,
      name: suggestion.title,
      description: suggestion.description
    }));
    toast.success('Template applied successfully');
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="border-b bg-white p-4">
        <div className="flex items-center justify-between">
          <div className="flex-1 max-w-md">
            <Input
              placeholder="Workflow name..."
              value={workflow.name || ''}
              onChange={(e) => setWorkflow(prev => ({ ...prev, name: e.target.value }))}
              className="text-lg font-medium"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              onClick={handleGetAISuggestions}
              variant="outline"
              size="sm"
              disabled={isLoading}
            >
              <Brain className="h-4 w-4 mr-1" />
              AI Suggestions
            </Button>
            
            <Button
              onClick={handleSaveWorkflow}
              variant="outline"
              size="sm"
              disabled={isLoading}
            >
              <Save className="h-4 w-4 mr-1" />
              Save
            </Button>
            
            <Button
              onClick={handleExecuteWorkflow}
              size="sm"
              disabled={isLoading || !workflowId}
            >
              <Play className="h-4 w-4 mr-1" />
              Execute
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Left Sidebar - Node Palette */}
        <div className="w-80 border-r bg-gray-50 overflow-y-auto">
          <Tabs defaultValue="palette" className="h-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="palette">Nodes</TabsTrigger>
              <TabsTrigger value="ai">AI Help</TabsTrigger>
            </TabsList>
            
            <TabsContent value="palette" className="h-full p-4">
              <WorkflowNodePalette
                onNodeDragStart={setDraggedNodeType}
                className="h-full"
              />
            </TabsContent>
            
            <TabsContent value="ai" className="h-full p-4">
              <div className="space-y-4">
                <div className="text-sm font-medium text-gray-700">
                  AI Workflow Suggestions
                </div>
                
                {aiSuggestions.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Brain className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>Click "AI Suggestions" to get intelligent workflow recommendations</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {aiSuggestions.map((suggestion, index) => (
                      <Card key={index} className="cursor-pointer hover:shadow-md transition-shadow">
                        <CardContent className="p-3">
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-medium text-sm">{suggestion.title}</h4>
                            <Badge variant="secondary" className="text-xs">
                              {Math.round(suggestion.confidence * 100)}%
                            </Badge>
                          </div>
                          <p className="text-xs text-gray-600 mb-3">{suggestion.description}</p>
                          <Button
                            onClick={() => handleApplySuggestion(suggestion)}
                            size="sm"
                            className="w-full"
                          >
                            <Zap className="h-3 w-3 mr-1" />
                            Apply Template
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Center - Canvas */}
        <div className="flex-1">
          <WorkflowCanvas
            nodes={nodes}
            edges={edges}
            selectedNode={selectedNode}
            onNodeSelect={setSelectedNode}
            onNodeAdd={handleNodeAdd}
            onNodeUpdate={handleNodeUpdate}
            onNodeDelete={handleNodeDelete}
            draggedNodeType={draggedNodeType}
            onDraggedNodeTypeChange={setDraggedNodeType}
          />
        </div>

        {/* Right Sidebar - Properties */}
        {selectedNode && (
          <div className="w-80 border-l bg-gray-50 overflow-y-auto">
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-medium">Node Properties</h3>
                <Button
                  onClick={() => handleNodeDelete(selectedNode.id)}
                  variant="outline"
                  size="sm"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="node-label">Label</Label>
                  <Input
                    id="node-label"
                    value={selectedNode.data.label}
                    onChange={(e) => handleNodeUpdate(selectedNode.id, {
                      data: { ...selectedNode.data, label: e.target.value }
                    })}
                  />
                </div>
                
                <div>
                  <Label htmlFor="node-type">Type</Label>
                  <Input
                    id="node-type"
                    value={selectedNode.data.nodeType}
                    disabled
                  />
                </div>
                
                <div>
                  <Label>Configuration</Label>
                  <Textarea
                    value={JSON.stringify(selectedNode.data.configuration, null, 2)}
                    onChange={(e) => {
                      try {
                        const config = JSON.parse(e.target.value);
                        handleNodeUpdate(selectedNode.id, {
                          data: { ...selectedNode.data, configuration: config }
                        });
                      } catch (error) {
                        // Invalid JSON, ignore
                      }
                    }}
                    rows={6}
                    className="font-mono text-xs"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VisualWorkflowDesigner;
