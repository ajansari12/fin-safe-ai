import React, { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Network, Zap, Eye, RotateCcw } from "lucide-react";
import { EnhancedDependency, DependencyMap } from "@/services/dependency-mapping-service";

interface InteractiveDependencyGraphProps {
  dependencies: EnhancedDependency[];
  maps: DependencyMap[];
  onNodeSelect?: (dependency: EnhancedDependency) => void;
  onEdgeSelect?: (map: DependencyMap) => void;
}

interface GraphNode {
  id: string;
  label: string;
  type: string;
  criticality: string;
  status: string;
  x: number;
  y: number;
  radius: number;
  color: string;
}

interface GraphEdge {
  source: string;
  target: string;
  relationship: string;
  strength: string;
  propagationLikelihood: number;
  color: string;
  width: number;
}

const InteractiveDependencyGraph: React.FC<InteractiveDependencyGraphProps> = ({
  dependencies,
  maps,
  onNodeSelect,
  onEdgeSelect
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterCriticality, setFilterCriticality] = useState<string>('all');
  const [isDragging, setIsDragging] = useState(false);
  const [dragNode, setDragNode] = useState<string | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const getNodeColor = (dependency: EnhancedDependency) => {
    if (dependency.status === 'failed') return '#ef4444';
    if (dependency.status === 'degraded') return '#f59e0b';
    if (dependency.status === 'maintenance') return '#6b7280';
    
    switch (dependency.criticality) {
      case 'critical': return '#dc2626';
      case 'high': return '#ea580c';
      case 'medium': return '#2563eb';
      case 'low': return '#16a34a';
      default: return '#6b7280';
    }
  };

  const getEdgeColor = (map: DependencyMap) => {
    switch (map.relationship_strength) {
      case 'critical': return '#dc2626';
      case 'strong': return '#ea580c';
      case 'medium': return '#2563eb';
      case 'weak': return '#6b7280';
      default: return '#6b7280';
    }
  };

  const getNodeRadius = (dependency: EnhancedDependency) => {
    switch (dependency.criticality) {
      case 'critical': return 20;
      case 'high': return 16;
      case 'medium': return 12;
      case 'low': return 10;
      default: return 8;
    }
  };

  const filterDependencies = (deps: EnhancedDependency[]) => {
    return deps.filter(dep => {
      const typeMatch = filterType === 'all' || dep.dependency_type === filterType;
      const criticalityMatch = filterCriticality === 'all' || dep.criticality === filterCriticality;
      return typeMatch && criticalityMatch;
    });
  };

  const generateLayout = (nodes: GraphNode[], edges: GraphEdge[]) => {
    const width = canvasRef.current?.width || 800;
    const height = canvasRef.current?.height || 600;
    const centerX = width / 2;
    const centerY = height / 2;

    // Simple force-directed layout
    const iterations = 100;
    const k = Math.sqrt((width * height) / nodes.length);
    
    // Initialize positions
    nodes.forEach((node, i) => {
      const angle = (i / nodes.length) * 2 * Math.PI;
      const radius = Math.min(width, height) * 0.3;
      node.x = centerX + Math.cos(angle) * radius;
      node.y = centerY + Math.sin(angle) * radius;
    });

    // Apply forces
    for (let iter = 0; iter < iterations; iter++) {
      // Repulsive forces between nodes
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy) || 1;
          const force = k * k / distance;
          
          const fx = (dx / distance) * force;
          const fy = (dy / distance) * force;
          
          nodes[i].x += fx;
          nodes[i].y += fy;
          nodes[j].x -= fx;
          nodes[j].y -= fy;
        }
      }

      // Attractive forces for connected nodes
      edges.forEach(edge => {
        const source = nodes.find(n => n.id === edge.source);
        const target = nodes.find(n => n.id === edge.target);
        
        if (source && target) {
          const dx = target.x - source.x;
          const dy = target.y - source.y;
          const distance = Math.sqrt(dx * dx + dy * dy) || 1;
          const force = distance / k;
          
          const fx = (dx / distance) * force * 0.1;
          const fy = (dy / distance) * force * 0.1;
          
          source.x += fx;
          source.y += fy;
          target.x -= fx;
          target.y -= fy;
        }
      });

      // Keep nodes within bounds
      nodes.forEach(node => {
        node.x = Math.max(node.radius, Math.min(width - node.radius, node.x));
        node.y = Math.max(node.radius, Math.min(height - node.radius, node.y));
      });
    }
  };

  const drawGraph = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const filteredDeps = filterDependencies(dependencies);
    
    const nodes: GraphNode[] = filteredDeps.map(dep => ({
      id: dep.id,
      label: dep.dependency_name,
      type: dep.dependency_type,
      criticality: dep.criticality,
      status: dep.status,
      x: 0,
      y: 0,
      radius: getNodeRadius(dep),
      color: getNodeColor(dep)
    }));

    const nodeIds = new Set(nodes.map(n => n.id));
    const edges: GraphEdge[] = maps
      .filter(map => nodeIds.has(map.source_dependency_id) && nodeIds.has(map.target_dependency_id))
      .map(map => ({
        source: map.source_dependency_id,
        target: map.target_dependency_id,
        relationship: map.relationship_type,
        strength: map.relationship_strength,
        propagationLikelihood: map.failure_propagation_likelihood || 0,
        color: getEdgeColor(map),
        width: map.relationship_strength === 'critical' ? 3 : 
               map.relationship_strength === 'strong' ? 2 : 1
      }));

    generateLayout(nodes, edges);

    // Draw edges
    edges.forEach(edge => {
      const source = nodes.find(n => n.id === edge.source);
      const target = nodes.find(n => n.id === edge.target);
      
      if (source && target) {
        ctx.strokeStyle = edge.color;
        ctx.lineWidth = edge.width;
        ctx.setLineDash(edge.relationship === 'depends_on' ? [] : [5, 5]);
        
        ctx.beginPath();
        ctx.moveTo(source.x, source.y);
        ctx.lineTo(target.x, target.y);
        ctx.stroke();
        
        // Draw arrow
        const angle = Math.atan2(target.y - source.y, target.x - source.x);
        const arrowLength = 10;
        const arrowAngle = Math.PI / 6;
        
        ctx.beginPath();
        ctx.moveTo(
          target.x - target.radius * Math.cos(angle),
          target.y - target.radius * Math.sin(angle)
        );
        ctx.lineTo(
          target.x - target.radius * Math.cos(angle) - arrowLength * Math.cos(angle - arrowAngle),
          target.y - target.radius * Math.sin(angle) - arrowLength * Math.sin(angle - arrowAngle)
        );
        ctx.moveTo(
          target.x - target.radius * Math.cos(angle),
          target.y - target.radius * Math.sin(angle)
        );
        ctx.lineTo(
          target.x - target.radius * Math.cos(angle) - arrowLength * Math.cos(angle + arrowAngle),
          target.y - target.radius * Math.sin(angle) - arrowLength * Math.sin(angle + arrowAngle)
        );
        ctx.stroke();
      }
    });

    // Draw nodes
    nodes.forEach(node => {
      // Node circle
      ctx.fillStyle = node.color;
      ctx.strokeStyle = selectedNode === node.id ? '#000000' : '#ffffff';
      ctx.lineWidth = selectedNode === node.id ? 3 : 2;
      
      ctx.beginPath();
      ctx.arc(node.x, node.y, node.radius, 0, 2 * Math.PI);
      ctx.fill();
      ctx.stroke();
      
      // Node label
      ctx.fillStyle = '#000000';
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      
      const maxWidth = node.radius * 3;
      const lines = wrapText(ctx, node.label, maxWidth);
      lines.forEach((line, i) => {
        ctx.fillText(line, node.x, node.y + node.radius + 5 + i * 14);
      });
    });
  };

  const wrapText = (ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] => {
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = words[0];

    for (let i = 1; i < words.length; i++) {
      const word = words[i];
      const width = ctx.measureText(currentLine + ' ' + word).width;
      if (width < maxWidth) {
        currentLine += ' ' + word;
      } else {
        lines.push(currentLine);
        currentLine = word;
      }
    }
    lines.push(currentLine);
    return lines;
  };

  const getNodeAt = (x: number, y: number): GraphNode | null => {
    const filteredDeps = filterDependencies(dependencies);
    const nodes: GraphNode[] = filteredDeps.map(dep => ({
      id: dep.id,
      label: dep.dependency_name,
      type: dep.dependency_type,
      criticality: dep.criticality,
      status: dep.status,
      x: 0,
      y: 0,
      radius: getNodeRadius(dep),
      color: getNodeColor(dep)
    }));

    return nodes.find(node => {
      const dx = x - node.x;
      const dy = y - node.y;
      return Math.sqrt(dx * dx + dy * dy) <= node.radius;
    }) || null;
  };

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const clickedNode = getNodeAt(x, y);
    if (clickedNode) {
      setSelectedNode(clickedNode.id);
      const dependency = dependencies.find(d => d.id === clickedNode.id);
      if (dependency && onNodeSelect) {
        onNodeSelect(dependency);
      }
    } else {
      setSelectedNode(null);
    }
  };

  const resetView = () => {
    setSelectedNode(null);
    setSelectedEdge(null);
    drawGraph();
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    
    if (canvas && container) {
      canvas.width = container.clientWidth;
      canvas.height = 600;
      drawGraph();
    }
  }, [dependencies, maps, filterType, filterCriticality, selectedNode]);

  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      
      if (canvas && container) {
        canvas.width = container.clientWidth;
        canvas.height = 600;
        drawGraph();
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Network className="h-5 w-5" />
          Interactive Dependency Graph
        </CardTitle>
        <CardDescription>
          Visualize dependencies and their relationships. Click nodes to select them.
        </CardDescription>
        
        <div className="flex gap-4 pt-4">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">Type:</label>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="vendor">Vendor</SelectItem>
                <SelectItem value="system">System</SelectItem>
                <SelectItem value="staff">Staff</SelectItem>
                <SelectItem value="data">Data</SelectItem>
                <SelectItem value="location">Location</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">Criticality:</label>
            <Select value={filterCriticality} onValueChange={setFilterCriticality}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <Button onClick={resetView} variant="outline" size="sm">
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset View
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        <div ref={containerRef} className="w-full">
          <canvas
            ref={canvasRef}
            onClick={handleCanvasClick}
            className="border rounded-lg cursor-pointer bg-white"
            style={{ display: 'block', width: '100%' }}
          />
        </div>
        
        <div className="flex flex-wrap gap-2 mt-4">
          <div className="text-xs text-gray-600">Legend:</div>
          <Badge variant="outline" className="text-xs">
            <div className="w-3 h-3 bg-red-600 rounded-full mr-1"></div>
            Critical
          </Badge>
          <Badge variant="outline" className="text-xs">
            <div className="w-3 h-3 bg-orange-600 rounded-full mr-1"></div>
            High
          </Badge>
          <Badge variant="outline" className="text-xs">
            <div className="w-3 h-3 bg-blue-600 rounded-full mr-1"></div>
            Medium
          </Badge>
          <Badge variant="outline" className="text-xs">
            <div className="w-3 h-3 bg-green-600 rounded-full mr-1"></div>
            Low
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
};

export default InteractiveDependencyGraph;
