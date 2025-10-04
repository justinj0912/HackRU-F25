import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ZoomIn, ZoomOut, RotateCcw, Plus, Save, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { MindMapNode, MindMapNodeData } from './MindMapNode';

interface MindMapCanvasProps {
  onSave?: (nodes: MindMapNodeData[]) => void;
  onLoad?: () => MindMapNodeData[];
  onGenerateTopics?: (topic: string) => Promise<MindMapNodeData[]>;
}

export function MindMapCanvas({ onSave, onLoad, onGenerateTopics }: MindMapCanvasProps) {
  const [nodes, setNodes] = useState<MindMapNodeData[]>([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [scale, setScale] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [isGenerating, setIsGenerating] = useState(false);
  const [showTopicInput, setShowTopicInput] = useState(false);
  const [topicInput, setTopicInput] = useState('');
  
  const canvasRef = useRef<HTMLDivElement>(null);

  // Generate initial topic
  const handleGenerateTopics = async (topic: string) => {
    if (!onGenerateTopics) return;
    
    setIsGenerating(true);
    try {
      const newNodes = await onGenerateTopics(topic);
      setNodes(newNodes);
      setShowTopicInput(false);
      setTopicInput('');
    } catch (error) {
      console.error('Failed to generate topics:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  // Node operations
  const updateNode = useCallback((nodeId: string, updates: Partial<MindMapNodeData>) => {
    setNodes(prev => prev.map(node => 
      node.id === nodeId ? { ...node, ...updates } : node
    ));
  }, []);

  const deleteNode = useCallback((nodeId: string) => {
    setNodes(prev => {
      const nodeToDelete = prev.find(n => n.id === nodeId);
      if (!nodeToDelete) return prev;

      // Remove all children recursively
      const removeChildren = (parentId: string): string[] => {
        const children = prev.filter(n => n.parentId === parentId);
        return children.flatMap(child => [child.id, ...removeChildren(child.id)]);
      };

      const idsToRemove = new Set([nodeId, ...removeChildren(nodeId)]);
      return prev.filter(node => !idsToRemove.has(node.id));
    });
  }, []);

  const addChildNode = useCallback((parentId: string) => {
    const parent = nodes.find(n => n.id === parentId);
    if (!parent) return;

    const newId = `node-${Date.now()}`;
    const newLevel = parent.level + 1;
    
    // Position child node near parent
    const siblings = nodes.filter(n => n.parentId === parentId);
    const childX = parent.x + 300 + (siblings.length * 50);
    const childY = parent.y + (siblings.length * 100);

    const newNode: MindMapNodeData = {
      id: newId,
      title: 'New Concept',
      content: 'Click to edit...',
      x: childX,
      y: childY,
      level: newLevel,
      parentId: parentId,
      children: [],
      isExpanded: true,
      isEditing: true,
      isSuggestion: false,
      isMainTopic: false
    };

    setNodes(prev => [
      ...prev,
      newNode
    ]);

    // Update parent's children array
    updateNode(parentId, { 
      children: [...parent.children, newId],
      isExpanded: true 
    });
  }, [nodes, updateNode]);

  const acceptSuggestion = useCallback((suggestionId: string) => {
    const suggestion = nodes.find(n => n.id === suggestionId);
    if (!suggestion) return;

    // Convert suggestion to regular node
    updateNode(suggestionId, { 
      isSuggestion: false,
      isEditing: true
    });
  }, [nodes, updateNode]);

  const rejectSuggestion = useCallback((suggestionId: string) => {
    setNodes(prev => prev.filter(n => n.id !== suggestionId));
  }, []);


  const expandNode = useCallback((nodeId: string) => {
    updateNode(nodeId, { isExpanded: !nodes.find(n => n.id === nodeId)?.isExpanded });
  }, [nodes, updateNode]);

  // Canvas operations
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setScale(prev => Math.max(0.1, Math.min(3, prev * delta)));
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    // Only start panning if clicking on the canvas background, not on nodes
    if (e.target === canvasRef.current) {
      setIsPanning(true);
      setPanStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
      setSelectedNodeId(null);
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isPanning) {
      setPanOffset({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  useEffect(() => {
    if (isPanning) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isPanning, panStart]);

  // Tree-style arrow connections (parent to child only)
  const renderConnections = () => {
    return nodes.map(node => {
      if (!node.parentId || node.isSuggestion) return null;
      
      const parent = nodes.find(n => n.id === node.parentId);
      if (!parent) return null;

      // Calculate connection points (from parent center to child center)
      const parentX = parent.x + 100; // Center of parent node
      const parentY = parent.y + 60;
      const childX = node.x + 100;
      const childY = node.y + 60;

      // Create simple line from parent to child
      const path = `M ${parentX} ${parentY} L ${childX} ${childY}`;

      return (
        <g key={`connection-${node.id}`}>
          <path
            d={path}
            stroke="var(--primary)"
            strokeWidth="2"
            fill="none"
            markerEnd="url(#arrowhead)"
            className="opacity-60"
          />
        </g>
      );
    });
  };

  // Initialize with topic input if no nodes
  useEffect(() => {
    if (nodes.length === 0) {
      setShowTopicInput(true);
    }
  }, [nodes.length]);

  return (
    <div className="h-full bg-background flex flex-col">
      {/* Toolbar */}
      <div className="p-3 border-b border-border bg-card flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => setScale(prev => Math.max(0.1, prev - 0.1))}
            disabled={scale <= 0.1}
          >
            <ZoomOut className="w-4 h-4" />
          </Button>
          
          <span className="text-sm text-muted-foreground min-w-[60px] text-center">
            {Math.round(scale * 100)}%
          </span>
          
          <Button
            size="sm"
            variant="outline"
            onClick={() => setScale(prev => Math.min(3, prev + 0.1))}
            disabled={scale >= 3}
          >
            <ZoomIn className="w-4 h-4" />
          </Button>

          <div className="w-px h-6 bg-border mx-2" />

          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setNodes([]);
              setSelectedNodeId(null);
              setShowTopicInput(true);
            }}
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </Button>

          {onSave && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onSave(nodes)}
            >
              <Save className="w-4 h-4" />
              Save
            </Button>
          )}
        </div>

        <div className="text-sm text-muted-foreground">
          {nodes.length} concepts
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1 relative overflow-hidden">
        {showTopicInput && (
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="bg-card border border-border rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold text-foreground mb-4">
                Create New Mind Map
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Enter a topic to generate an interactive mind map with AI-powered concept branching.
              </p>
              <div className="space-y-4">
                <input
                  type="text"
                  value={topicInput}
                  onChange={(e) => setTopicInput(e.target.value)}
                  placeholder="e.g., Photosynthesis, Machine Learning, World War II..."
                  className="w-full px-3 py-2 bg-input border border-border rounded-md text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && topicInput.trim()) {
                      handleGenerateTopics(topicInput.trim());
                    }
                  }}
                />
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleGenerateTopics(topicInput)}
                    disabled={!topicInput.trim() || isGenerating}
                    className="flex-1"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4 mr-2" />
                        Generate Mind Map
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowTopicInput(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        <div
          ref={canvasRef}
          className="w-full h-full cursor-grab active:cursor-grabbing"
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          style={{
            transform: `translate(${panOffset.x}px, ${panOffset.y}px)`,
            backgroundImage: `
              radial-gradient(circle, var(--border) 1px, transparent 1px)
            `,
            backgroundSize: '20px 20px',
            backgroundPosition: '0 0'
          }}
        >
          {/* SVG for connections */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            style={{ zIndex: 1 }}
          >
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
                  fill="var(--primary)"
                />
              </marker>
            </defs>
            {renderConnections()}
          </svg>

          {/* Nodes */}
          {nodes.map(node => (
            <MindMapNode
              key={node.id}
              node={node}
              isSelected={selectedNodeId === node.id}
              onSelect={setSelectedNodeId}
              onUpdate={updateNode}
              onDelete={deleteNode}
              onAddChild={addChildNode}
              onExpand={expandNode}
              onAcceptSuggestion={acceptSuggestion}
              onRejectSuggestion={rejectSuggestion}
              scale={scale}
            />
          ))}
        </div>
      </div>

      {/* Instructions */}
      <div className="p-2 border-t border-border bg-card">
        <p className="text-xs text-muted-foreground text-center">
          Click nodes to select • Scroll to zoom • Pan to navigate • Accept/reject suggestions
        </p>
      </div>
    </div>
  );
}
