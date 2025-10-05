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
    
    // Position child node near parent - use dynamic spacing
    const siblings = nodes.filter(n => n.parentId === parentId);
    const childX = parent.x + 200 + (siblings.length * 50); // Reduced from 320 to 200 for auto-sized nodes
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

  const acceptSuggestion = useCallback(async (suggestionId: string) => {
    const suggestion = nodes.find(n => n.id === suggestionId);
    if (!suggestion || !onGenerateTopics) return;

    try {
      // Generate new content for the suggestion topic
      const newNodes = await onGenerateTopics(suggestion.title);
      if (newNodes.length > 0) {
        // Replace the suggestion with the new main topic
        const newNode = newNodes[0]; // Should be the main topic
        updateNode(suggestionId, {
          title: newNode.title,
          content: newNode.content,
          isSuggestion: false,
          isMainTopic: true,
          isEditing: false
        });
        
        // Add the new suggestions from the generated content
        const newSuggestions = newNodes.slice(1); // Skip the main topic
        newSuggestions.forEach((newSuggestion, index) => {
          const newId = `suggestion-${Date.now()}-${index}`;
          const newSuggestionNode: MindMapNodeData = {
            id: newId,
            title: newSuggestion.title,
            content: newSuggestion.content,
            x: suggestion.x + (index * 100), // Position near the new main topic
            y: suggestion.y + (index * 50),
            level: 0,
            parentId: suggestionId,
            children: [],
            isExpanded: false,
            isEditing: false,
            isSuggestion: true,
            isMainTopic: false
          };
          
          setNodes(prev => [...prev, newSuggestionNode]);
        });
      }
    } catch (error) {
      console.error('Failed to generate topic for suggestion:', error);
    }
  }, [nodes, updateNode, onGenerateTopics]);

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

  // Render all connections (parent-child and suggestion lines)
  const renderConnections = () => {
    const connections = [];
    
    // Regular parent-child connections
    nodes.forEach(node => {
      if (!node.parentId || node.isSuggestion) return;
      
      const parent = nodes.find(n => n.id === node.parentId);
      if (!parent) return;

      // Calculate connection points (from parent center to child center)
      const parentX = parent.x;
      const parentY = parent.y;
      const childX = node.x;
      const childY = node.y;

      // Create simple line from parent to child
      const path = `M ${parentX} ${parentY} L ${childX} ${childY}`;

      connections.push(
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

    // Suggestion lines from complete nodes to their suggestions
    nodes.forEach(node => {
      if (!node.isSuggestion) { // Only complete nodes (not suggestions themselves)
        const suggestions = nodes.filter(n => n.isSuggestion && n.parentId === node.id);
        suggestions.forEach(suggestion => {
          const path = `M ${node.x} ${node.y} L ${suggestion.x} ${suggestion.y}`;
          
          connections.push(
            <g key={`suggestion-${suggestion.id}`}>
              <path
                d={path}
                stroke="var(--primary)"
                strokeWidth="1"
                fill="none"
                strokeDasharray="3,3"
                className="opacity-20"
              />
            </g>
          );
        });
      }
    });

    return connections;
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
      <div className="p-3 border-b border-primary bg-gradient-to-b from-card to-background flex items-center justify-between">
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
          {nodes.length} node{nodes.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1 relative overflow-hidden">
        {showTopicInput && (
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="bg-card border border-border rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold text-foreground mb-4">
                Create New Flowchart
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Enter a topic to generate a single comprehensive node with AI summary. You can then expand it into a flowchart by adding child concepts.
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
                        Generate Flowchart
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
        </div>

        {/* Nodes - rendered outside canvas to avoid event conflicts */}
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
            onDragStart={(id) => setSelectedNodeId(id)}
            onDrag={(id, x, y) => updateNode(id, { x, y })}
            onDragEnd={() => {}}
          />
        ))}
      </div>

      {/* Instructions */}
      <div className="p-2 border-t border-primary bg-gradient-to-b from-card to-background">
        <p className="text-xs text-foreground text-center">
          <span className="text-accent">⚙</span> Drag nodes to reposition • 
          <span className="text-accent">🔍</span> Scroll to zoom • 
          <span className="text-accent">🖱</span> Pan to navigate • 
          <span className="text-accent">➕</span> Click + to add child concepts
        </p>
      </div>
    </div>
  );
}
