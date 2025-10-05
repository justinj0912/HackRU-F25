import React, { useState, useRef, useEffect, useCallback } from 'react';
import { ZoomIn, ZoomOut, RotateCcw, Plus, Loader2, Trash2 } from 'lucide-react';
import { Button } from './ui/button';

interface ConceptNode {
  id: string;
  title: string;
  summary?: string;
  x: number;
  y: number;
  expanded: boolean;
  parentId?: string;
  children: string[];
  importance: 'high' | 'medium' | 'low'; // For dynamic sizing
  color?: string; // For color coding
}

interface ConceptMapProps {
  onSave?: (nodes: ConceptNode[]) => void;
  onLoad?: () => ConceptNode[];
}

export function ConceptMap({ onSave, onLoad }: ConceptMapProps) {
  const [nodes, setNodes] = useState<ConceptNode[]>([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [scale, setScale] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [lastPanOffset, setLastPanOffset] = useState({ x: 0, y: 0 });
  const [isGenerating, setIsGenerating] = useState(false);
  const [showTopicInput, setShowTopicInput] = useState(true);
  const [topicInput, setTopicInput] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [draggedNodeId, setDraggedNodeId] = useState<string | null>(null);
  const [showAddNodeInput, setShowAddNodeInput] = useState<string | null>(null);
  const [newNodeTitle, setNewNodeTitle] = useState('');
  const [lockedPanOffset, setLockedPanOffset] = useState<{ x: number; y: number } | null>(null);
  
  // Load saved nodes on mount
  useEffect(() => {
    if (onLoad) {
      const savedNodes = onLoad();
      if (savedNodes && savedNodes.length > 0) {
        setNodes(savedNodes);
        setShowTopicInput(false);
      }
    }
  }, [onLoad]);

  
  const canvasRef = useRef<HTMLDivElement>(null);

  // Generate initial central node with subtopics
  const handleGenerateConceptMap = async (topic: string) => {
    if (!topic.trim()) return;
    
    setIsGenerating(true);
    try {
          // Create central node
          const centralNode: ConceptNode = {
            id: 'central',
            title: topic,
            x: 400,
            y: 300,
            expanded: false,
            children: [],
            importance: 'high',
            color: '#3B82F6' // Blue for main topic
          };

      // Generate subtopics
      const response = await fetch('http://localhost:8000/generate-subtopics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic })
      });
      
      const data = await response.json();
      const subtopics = data.subtopics || [];

          // Create subtopic nodes - positioned below main node in horizontal layout
          const colors = ['#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4']; // Green, Amber, Red, Purple, Cyan
          const subtopicNodes: ConceptNode[] = subtopics.map((subtopic: string, index: number) => {
            const totalWidth = (subtopics.length - 1) * 150; // Total width for all subtopics
            const startX = 400 - (totalWidth / 2); // Center the group
            const x = startX + (index * 150); // Space horizontally
            const y = 500; // Below main node

            return {
              id: `subtopic-${index}`,
              title: subtopic,
              x,
              y,
              expanded: false,
              parentId: 'central',
              children: [],
              importance: 'medium',
              color: colors[index % colors.length]
            };
          });

      // Update central node with children
      centralNode.children = subtopicNodes.map(n => n.id);

      setNodes([centralNode, ...subtopicNodes]);
      setShowTopicInput(false);
      setTopicInput('');
    } catch (error) {
      console.error('Failed to generate concept map:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  // Expand a node (generate summary and new subtopics)
  const handleExpandNode = async (nodeId: string) => {
    const node = nodes.find(n => n.id === nodeId);
    if (!node || node.expanded) return;

    setIsGenerating(true);
    try {
      // Generate summary
      const summaryResponse = await fetch('http://localhost:8000/generate-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: node.title })
      });
      
      const summaryData = await summaryResponse.json();
      const summary = summaryData.summary || '';

      // Check if this is the blue node (central node)
      const isBlueNode = node.color === '#3B82F6';

      if (isBlueNode) {
        // Blue node only gets summary, no new subtopics
        const updatedNode = {
          ...node,
          summary,
          expanded: true
        };

        setNodes(prev => [
          ...prev.filter(n => n.id !== nodeId),
          updatedNode
        ]);
      } else {
        // Other nodes get summary and new subtopics
        const subtopicsResponse = await fetch('http://localhost:8000/generate-subtopics', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ topic: node.title })
        });
        
        const subtopicsData = await subtopicsResponse.json();
        const subtopics = subtopicsData.subtopics || [];

        // Create new subtopic nodes - positioned below parent in horizontal layout
        const colors = ['#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4']; // Green, Amber, Red, Purple, Cyan
        const newSubtopicNodes: ConceptNode[] = subtopics.map((subtopic: string, index: number) => {
          const totalWidth = (subtopics.length - 1) * 150; // Total width for all subtopics
          const startX = node.x - (totalWidth / 2); // Center the group around parent
          const x = startX + (index * 150); // Space horizontally
          const y = node.y + 200; // Below parent

          return {
            id: `${nodeId}-subtopic-${Date.now()}-${index}`,
            title: subtopic,
            x,
            y,
            expanded: false,
            parentId: nodeId,
            children: [],
            importance: 'low',
            color: colors[index % colors.length]
          };
        });

        // Update the expanded node
        const updatedNode = {
          ...node,
          summary,
          expanded: true,
          children: newSubtopicNodes.map(n => n.id)
        };

        setNodes(prev => [
          ...prev.filter(n => n.id !== nodeId),
          updatedNode,
          ...newSubtopicNodes
        ]);
      }
    } catch (error) {
      console.error('Failed to expand node:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  // Delete node and all its descendants
  const handleDeleteNode = (nodeId: string) => {
    const deleteNodeAndChildren = (id: string): string[] => {
      const node = nodes.find(n => n.id === id);
      if (!node) return [];
      
      let toDelete = [id];
      for (const childId of node.children) {
        toDelete = toDelete.concat(deleteNodeAndChildren(childId));
      }
      return toDelete;
    };

    const nodesToDelete = deleteNodeAndChildren(nodeId);
    const updatedNodes = nodes.filter(node => !nodesToDelete.includes(node.id));
    
    // Update parent nodes to remove deleted children
    const finalNodes = updatedNodes.map(node => ({
      ...node,
      children: node.children.filter(childId => !nodesToDelete.includes(childId))
    }));

    setNodes(finalNodes);
    
    // Save the updated nodes
    if (onSave) {
      onSave(finalNodes);
    }
  };

  // Add student-created node
  const handleAddStudentNode = async (parentNodeId: string, title: string) => {
    if (!title.trim()) return;

    const parentNode = nodes.find(n => n.id === parentNodeId);
    if (!parentNode) return;

    setIsGenerating(true);
    try {
      // Generate summary for the student's topic
      const summaryResponse = await fetch('http://localhost:8000/generate-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: title.trim() })
      });
      
      const summaryData = await summaryResponse.json();
      const summary = summaryData.summary || '';

      // Generate suggested subtopics for the new custom node
      const subtopicsResponse = await fetch('http://localhost:8000/generate-subtopics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ topic: title.trim() })
      });
      
      const subtopicsData = await subtopicsResponse.json();
      const subtopics = subtopicsData.subtopics || [];

      // Create new student node
      const studentNode: ConceptNode = {
        id: `student-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        title: title.trim(),
        x: parentNode.x + (Math.random() - 0.5) * 200, // Random position near parent
        y: parentNode.y + 150 + Math.random() * 100, // Below parent with some randomness
        expanded: true, // Start expanded with summary
        parentId: parentNodeId,
        children: [],
        importance: 'low',
        color: '#F97316', // Orange color for student-created nodes
        summary
      };

      // Create suggested subtopic nodes
      const suggestedNodes: ConceptNode[] = subtopics.map((subtopic: string, index: number) => ({
        id: `suggested-${Date.now()}-${index}-${Math.random().toString(36).substr(2, 9)}`,
        title: subtopic,
        x: studentNode.x + (Math.random() - 0.5) * 300, // Random position around the student node
        y: studentNode.y + 150 + Math.random() * 100, // Below student node
        expanded: false,
        parentId: studentNode.id,
        children: [],
        importance: 'low',
        color: '#10B981', // Green color for suggested nodes
        summary: ''
      }));

      // Update parent node to include new child
      const updatedParentNode = {
        ...parentNode,
        children: [...parentNode.children, studentNode.id]
      };

      // Update student node to include suggested children
      const updatedStudentNode = {
        ...studentNode,
        children: suggestedNodes.map(node => node.id)
      };

      // Add all nodes to the state
      setNodes(prev => [
        ...prev.filter(n => n.id !== parentNodeId),
        updatedParentNode,
        updatedStudentNode,
        ...suggestedNodes
      ]);

      // Reset input state
      setShowAddNodeInput(null);
      setNewNodeTitle('');
      setLockedPanOffset(null);
    } catch (error) {
      console.error('Failed to add student node:', error);
    } finally {
      setIsGenerating(false);
    }
  };

      // Node dragging
  const handleNodeMouseDown = useCallback((e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation();
    console.log('🔴 Node mouse down:', {
      nodeId,
      clientX: e.clientX,
      clientY: e.clientY,
      target: e.target,
      targetTagName: (e.target as HTMLElement)?.tagName,
      targetClassName: (e.target as HTMLElement)?.className
    });
    
    console.log('🔴 Setting drag state:', {
      nodeId,
      isDragging: true,
      draggedNodeId: nodeId,
      dragStart: { x: e.clientX, y: e.clientY }
    });
    
    setIsDragging(true);
    setDraggedNodeId(nodeId);
    setDragStart({ x: e.clientX, y: e.clientY });
    setSelectedNodeId(nodeId);
    
    // Prevent default to ensure dragging works
    e.preventDefault();
    
    console.log('🔴 Node mouse down completed for:', nodeId);
  }, []);

  const handleNodeMouseMove = useCallback((e: MouseEvent) => {
    console.log('🟡 Node mouse move:', {
      isDragging,
      draggedNodeId,
      clientX: e.clientX,
      clientY: e.clientY,
      dragStart,
      scale
    });
    
    if (isDragging && draggedNodeId) {
      const deltaX = (e.clientX - dragStart.x) / scale;
      const deltaY = (e.clientY - dragStart.y) / scale;
      
      console.log('🟡 Node dragging:', {
        nodeId: draggedNodeId,
        deltaX,
        deltaY,
        scale,
        clientX: e.clientX,
        clientY: e.clientY,
        dragStart
      });
      
      setNodes(prev => {
        const updatedNodes = prev.map(node => {
          if (node.id === draggedNodeId) {
            const newX = node.x + deltaX;
            const newY = node.y + deltaY;
            console.log('🟡 Updating node position:', {
              nodeId: node.id,
              oldX: node.x,
              oldY: node.y,
              newX,
              newY,
              deltaX,
              deltaY
            });
            return { ...node, x: newX, y: newY };
          }
          return node;
        });
        return updatedNodes;
      });
      
      setDragStart({ x: e.clientX, y: e.clientY });
    } else {
      console.log('🟡 Not dragging - conditions not met:', {
        isDragging,
        draggedNodeId: !!draggedNodeId
      });
    }
  }, [isDragging, draggedNodeId, dragStart, scale]);

  const handleNodeMouseUp = useCallback(() => {
    console.log('🟢 Node mouse up:', {
      wasDragging: isDragging,
      draggedNodeId
    });
    setIsDragging(false);
    setDraggedNodeId(null);
    console.log('🟢 Node mouse up completed');
  }, [isDragging, draggedNodeId]);

  // Canvas operations
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    const newScale = Math.max(0.1, Math.min(5, scale * delta));
    setScale(newScale);
  }, [scale]);

      const handleMouseDown = (e: React.MouseEvent) => {
        
        // Check if clicking on empty canvas area (not on a node)
        // Allow clicks on SVG (connection lines) to trigger panning
        const target = e.target as HTMLElement;
        
        // Check if the click is on a node or node content
        const isNodeClick = target?.closest('[data-node-id]') || 
          target?.closest('.node-wrapper') ||
          target?.closest('.expand-button');
        
        const isCanvasClick = e.currentTarget === e.target || 
          target?.tagName === 'SVG' ||
          target?.classList.contains('canvas-background') ||
          target?.closest('.canvas-background');
        
        
        // Only start panning if it's a canvas click AND not a node click AND canvas is not locked
        if (isCanvasClick && !isNodeClick && !lockedPanOffset) {
          setIsPanning(true);
          setPanStart({ x: e.clientX, y: e.clientY });
          setLastPanOffset({ x: panOffset.x, y: panOffset.y });
          setSelectedNodeId(null);
        } else {
        }
      };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    
    if (isPanning) {
      const deltaX = (e.clientX - panStart.x) / scale;
      const deltaY = (e.clientY - panStart.y) / scale;
      const newOffset = {
        x: lastPanOffset.x + deltaX,
        y: lastPanOffset.y + deltaY,
      };
      setPanOffset(newOffset);
    } else if (isDragging) {
      handleNodeMouseMove(e);
    } else {
    }
  }, [isPanning, panStart, lastPanOffset, scale, isDragging, draggedNodeId, handleNodeMouseMove]);

  const handleMouseUp = useCallback(() => {
    setIsPanning(false);
    handleNodeMouseUp();
  }, [handleNodeMouseUp, isPanning, isDragging, draggedNodeId]);

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp, nodes]);

  // Render connections
  const renderConnections = () => {
    return nodes.map(node => 
      node.children.map(childId => {
        const childNode = nodes.find(n => n.id === childId);
        if (!childNode) return null;

        const opacity = node.expanded ? 0.6 : 0.2;
        const strokeWidth = node.expanded ? 2 : 1;
        const dashArray = node.expanded ? "none" : "5,5";

        // Calculate connection points: bottom of parent to top of child
        const parentBottomY = node.y + 40; // Approximate bottom of parent node
        const childTopY = childNode.y - 40; // Approximate top of child node

        return (
          <line
            key={`${node.id}-${childId}`}
            x1={node.x}
            y1={parentBottomY}
            x2={childNode.x}
            y2={childTopY}
            stroke="var(--primary)"
            strokeWidth={strokeWidth}
            strokeDasharray={dashArray}
            opacity={opacity}
          />
        );
      })
    ).flat().filter(Boolean);
  };

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
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center" style={{ top: '60px' }}>
            <div className="bg-card border border-border rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold text-foreground mb-4">
                Create Concept Map
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Enter a topic to generate a concept map with related subtopics. Click nodes to expand them with summaries and new branches.
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
                      handleGenerateConceptMap(topicInput.trim());
                    }
                  }}
                />
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleGenerateConceptMap(topicInput)}
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
                        Generate Concept Map
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
          className="w-full h-full cursor-grab active:cursor-grabbing relative canvas-background"
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          style={{
            backgroundImage: `
              radial-gradient(circle, var(--border) 1px, transparent 1px)
            `,
            backgroundSize: `${20 * scale}px ${20 * scale}px`,
            backgroundPosition: `${panOffset.x}px ${panOffset.y}px`,
            minWidth: '300vw',
            minHeight: '300vh',
            width: '300vw',
            height: '300vh',
            transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${scale})`,
            transformOrigin: '0 0'
          }}
        >
          {/* Student node input dialog */}
          {showAddNodeInput && (
            <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center" style={{ top: '60px', zIndex: 9999 }}>
              <div className="bg-card border border-border rounded-lg p-6 max-w-md w-full mx-4 shadow-2xl" style={{ zIndex: 10000 }}>
                <h3 className="text-lg font-semibold text-foreground mb-4">
                  Add Your Own Topic
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Enter a topic you'd like to add to this concept map. It will get a summary and suggested subtopics automatically.
                </p>
                <div className="space-y-4">
                  <input
                    type="text"
                    value={newNodeTitle}
                    onChange={(e) => setNewNodeTitle(e.target.value)}
                    placeholder="e.g., My own idea, Additional concept..."
                    className="w-full px-3 py-2 bg-input border border-border rounded-md text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && newNodeTitle.trim()) {
                        handleAddStudentNode(showAddNodeInput, newNodeTitle.trim());
                      }
                      if (e.key === 'Escape') {
                        setShowAddNodeInput(null);
                        setNewNodeTitle('');
                        setLockedPanOffset(null);
                      }
                    }}
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleAddStudentNode(showAddNodeInput, newNodeTitle)}
                      disabled={!newNodeTitle.trim() || isGenerating}
                      className="flex-1"
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Adding...
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4 mr-2" />
                          Add Topic
                        </>
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setShowAddNodeInput(null);
                        setNewNodeTitle('');
                        setLockedPanOffset(null);
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
          {/* SVG for connections */}
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none"
            style={{ zIndex: 1 }}
          >
            {renderConnections()}
          </svg>

          {/* Nodes */}
          {nodes.map(node => (
            <div
              key={node.id}
              data-node-id={node.id}
              className={`absolute select-none cursor-move group node-wrapper z-10 ${
                isDragging && draggedNodeId === node.id ? 'z-30' : ''
              }`}
              style={{
                left: `${node.x}px`,
                top: `${node.y}px`,
                transform: 'translate(-50%, -50%)',
              }}
              onMouseDown={(e) => {
                handleNodeMouseDown(e, node.id);
              }}
              onClick={(e) => {
                e.stopPropagation();
                // Only expand if clicking on the expand button, not the whole node
                if (e.target instanceof HTMLElement && e.target.closest('.expand-button')) {
                  if (!node.expanded && !isDragging) {
                    handleExpandNode(node.id);
                  }
                }
                setSelectedNodeId(node.id);
              }}
            >
                  <div
                    className={`relative border-2 rounded-lg shadow-lg transition-all duration-200 hover:scale-105 ${
                      isDragging && draggedNodeId === node.id ? 'shadow-2xl scale-110' : ''
                    }`}
                    style={{
                      borderColor: node.color || '#3B82F6',
                      backgroundColor: node.color ? `${node.color}20` : '#3B82F620',
                      opacity: node.expanded ? 1 : 0.8,
                      minWidth: '120px',
                      minHeight: '80px',
                      width: 'auto',
                      height: 'auto',
                      maxWidth: '200px'
                    }}
                  >
                {/* Node content */}
                <div className="p-3 flex flex-col items-center justify-center h-full">
                  <h3 className={`font-semibold text-center break-words ${
                    node.expanded ? 'text-sm' : 'text-sm'
                  }`} style={{ color: node.color || '#3B82F6' }}>
                    {node.title}
                  </h3>
                  
                  {node.expanded && node.summary && (
                    <p className="text-xs text-foreground mt-2 text-center leading-relaxed break-words">
                      {node.summary}
                    </p>
                  )}
                  
                  {!node.expanded && (
                    <div className="mt-2 text-center">
                      <button 
                        className="expand-button text-xs underline cursor-pointer"
                        style={{ color: node.color || '#3B82F6' }}
                        onMouseDown={(e) => {
                          e.stopPropagation();
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleExpandNode(node.id);
                        }}
                      >
                        Click to expand
                      </button>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Add student node button */}
              <button
                className="absolute w-8 h-8 bg-orange-500 hover:bg-orange-600 text-white rounded-full text-sm font-bold flex items-center justify-center shadow-lg transition-colors z-50 border-2 border-white"
                style={{
                  right: '-16px',
                  bottom: '-16px'
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  setLockedPanOffset({ x: panOffset.x, y: panOffset.y });
                  setShowAddNodeInput(node.id);
                  setNewNodeTitle('');
                }}
                title="Add your own topic"
              >
                +
              </button>
              
              {/* Delete node button */}
              <button
                className="absolute w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full text-xs font-bold flex items-center justify-center shadow-lg transition-colors z-50 border-2 border-white"
                style={{
                  right: '-16px',
                  top: '-16px'
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  if (window.confirm(`Are you sure you want to delete "${node.title}" and all its subtopics?`)) {
                    handleDeleteNode(node.id);
                  }
                }}
                title="Delete this topic and all subtopics"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      </div>


          {/* Instructions */}
          <div className="p-2 border-t border-primary bg-gradient-to-b from-card to-background">
            <p className="text-xs text-foreground text-center">
              <span className="text-accent">🔍</span> Scroll to zoom • 
              <span className="text-accent">🖱</span> Click empty space + drag to pan • 
              <span className="text-accent">👆</span> Click subtopics to expand • 
              <span className="text-accent">✋</span> Drag nodes to reposition
            </p>
          </div>
    </div>
  );
}
