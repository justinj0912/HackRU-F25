import { useState, useRef } from 'react';
import { FlowNode } from './FlowNode';
import { FlowConnection } from './FlowConnection';
import { Button } from './ui/button';
import { Plus, Download, Lightbulb, Edit2, Check } from 'lucide-react';
import { AddNodeDialog } from './AddNodeDialog';

interface Node {
  id: string;
  title: string;
  description?: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

interface Connection {
  from: string;
  to: string;
}

export function FlowDiagram() {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [connectionInProgress, setConnectionInProgress] = useState<{
    from: string;
    isFromOutput: boolean;
  } | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [diagramTitle, setDiagramTitle] = useState('Untitled');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [titleInputValue, setTitleInputValue] = useState('Untitled');
  const nextIdRef = useRef(1);

  const handleDrag = (id: string, x: number, y: number) => {
    setNodes((prev) =>
      prev.map((node) => (node.id === id ? { ...node, x, y } : node))
    );
  };

  const handleAddNode = (title: string, description: string) => {
    const newNode: Node = {
      id: String(nextIdRef.current++),
      title,
      description: description || undefined,
      // Position new nodes in the center of the viewport
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
      width: 240,
      height: 120,
    };
    setNodes((prev) => [...prev, newNode]);
  };

  const handleDeleteNode = (id: string) => {
    setNodes((prev) => prev.filter((node) => node.id !== id));
    // Also remove any connections involving this node
    setConnections((prev) => prev.filter((conn) => conn.from !== id && conn.to !== id));
  };

  const handleConnectionStart = (nodeId: string, isOutput: boolean) => {
    if (!connectionInProgress) {
      // Start new connection from output
      if (isOutput) {
        setConnectionInProgress({ from: nodeId, isFromOutput: true });
      }
    } else {
      // Complete connection to input
      if (!isOutput && connectionInProgress.isFromOutput) {
        // Don't allow self-connections
        if (nodeId !== connectionInProgress.from) {
          // Check if connection already exists
          const exists = connections.some(
            (c) => c.from === connectionInProgress.from && c.to === nodeId
          );
          if (!exists) {
            setConnections((prev) => [
              ...prev,
              { from: connectionInProgress.from, to: nodeId },
            ]);
          }
        }
        setConnectionInProgress(null);
      }
    }
  };

  const handleCanvasClick = () => {
    // Cancel connection in progress when clicking on canvas
    if (connectionInProgress) {
      setConnectionInProgress(null);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (connectionInProgress) {
      setMousePosition({ x: e.clientX, y: e.clientY });
    }
  };

  const handleDeleteConnection = (from: string, to: string) => {
    setConnections((prev) => prev.filter((conn) => !(conn.from === from && conn.to === to)));
  };

  const handleTitleClick = () => {
    setIsEditingTitle(true);
    setTitleInputValue(diagramTitle);
  };

  const handleTitleSave = () => {
    if (titleInputValue.trim()) {
      setDiagramTitle(titleInputValue.trim());
    } else {
      setDiagramTitle('Untitled');
      setTitleInputValue('Untitled');
    }
    setIsEditingTitle(false);
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleTitleSave();
    } else if (e.key === 'Escape') {
      setTitleInputValue(diagramTitle);
      setIsEditingTitle(false);
    }
  };

  const getNodePosition = (id: string) => {
    const node = nodes.find((n) => n.id === id);
    return node ? { x: node.x, y: node.y } : { x: 0, y: 0 };
  };

  return (
    <div className="w-full h-screen bg-[#0f0a07] overflow-hidden relative">
      {/* Background texture */}
      <div className="absolute inset-0 opacity-5 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,#5a3d28_2px,#5a3d28_4px)] bg-[length:100px_100px]" />
      
      {/* Large decorative gears */}
      <div className="absolute top-20 right-20 w-64 h-64 opacity-[0.08]">
        <svg viewBox="0 0 100 100" className="animate-spin" style={{ animationDuration: '40s' }}>
          <circle cx="50" cy="50" r="30" fill="none" stroke="#c17a4a" strokeWidth="4" />
          <circle cx="50" cy="50" r="20" fill="none" stroke="#c17a4a" strokeWidth="2" />
          {[...Array(12)].map((_, i) => (
            <g key={i}>
              <rect
                x="47"
                y="2"
                width="6"
                height="18"
                fill="#c17a4a"
                transform={`rotate(${i * 30} 50 50)`}
              />
              <circle
                cx="50"
                cy="8"
                r="2"
                fill="#8b5a3c"
                transform={`rotate(${i * 30} 50 50)`}
              />
            </g>
          ))}
        </svg>
      </div>
      
      <div className="absolute bottom-32 left-32 w-48 h-48 opacity-[0.08]">
        <svg viewBox="0 0 100 100" className="animate-spin" style={{ animationDuration: '50s', animationDirection: 'reverse' }}>
          <circle cx="50" cy="50" r="25" fill="none" stroke="#c17a4a" strokeWidth="3" />
          <circle cx="50" cy="50" r="15" fill="none" stroke="#c17a4a" strokeWidth="2" />
          {[...Array(16)].map((_, i) => (
            <g key={i}>
              <rect
                x="47.5"
                y="8"
                width="5"
                height="14"
                fill="#c17a4a"
                transform={`rotate(${i * 22.5} 50 50)`}
              />
            </g>
          ))}
        </svg>
      </div>
      
      <div className="absolute top-1/2 left-10 w-40 h-40 opacity-[0.06]">
        <svg viewBox="0 0 100 100" className="animate-spin" style={{ animationDuration: '35s' }}>
          <circle cx="50" cy="50" r="22" fill="none" stroke="#8b5a3c" strokeWidth="3" />
          {[...Array(10)].map((_, i) => (
            <rect
              key={i}
              x="47"
              y="12"
              width="6"
              height="16"
              fill="#8b5a3c"
              transform={`rotate(${i * 36} 50 50)`}
            />
          ))}
        </svg>
      </div>

      {/* Top control panel */}
      <div className="absolute top-8 left-1/2 -translate-x-1/2 z-10">
        {/* Diamond separator above */}
        <div className="flex items-center justify-center mb-3">
          <div className="h-px w-32 bg-gradient-to-r from-transparent via-[#c17a4a] to-transparent" />
          <div className="w-2 h-2 rotate-45 bg-[#c17a4a] mx-2" />
          <div className="h-px w-32 bg-gradient-to-r from-transparent via-[#c17a4a] to-transparent" />
        </div>
        
        <div className="bg-gradient-to-b from-[#2a1c14] to-[#1a0f0a] border-2 border-[#c17a4a] rounded shadow-2xl p-4">
          <div className="flex items-center gap-3">
            {/* Decorative elements */}
            <div className="flex gap-1">
              <div className="w-2 h-2 rounded-full bg-gradient-to-br from-[#c17a4a] to-[#8b5a3c]" />
              <div className="w-2 h-2 rounded-full bg-gradient-to-br from-[#c17a4a] to-[#8b5a3c]" />
            </div>
            
            <div className="flex items-center gap-2 px-3">
              <div className="relative">
                <Lightbulb className="w-5 h-5 text-[#f5b57a]" />
                <div className="absolute inset-0 blur-sm">
                  <Lightbulb className="w-5 h-5 text-[#f5b57a] opacity-50" />
                </div>
              </div>
              {isEditingTitle ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={titleInputValue}
                    onChange={(e) => setTitleInputValue(e.target.value)}
                    onBlur={handleTitleSave}
                    onKeyDown={handleTitleKeyDown}
                    autoFocus
                    className="bg-[#1a0f0a] border border-[#c17a4a] rounded px-2 py-1 text-[#e8d4b8] tracking-wider drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] focus:outline-none focus:ring-1 focus:ring-[#f5b57a] min-w-[200px]"
                    placeholder="Enter diagram title..."
                  />
                  <button
                    onClick={handleTitleSave}
                    className="p-1 rounded hover:bg-[#3d2818] transition-colors"
                  >
                    <Check className="w-4 h-4 text-[#f5b57a]" />
                  </button>
                </div>
              ) : (
                <div 
                  className="flex items-center gap-2 cursor-pointer group"
                  onClick={handleTitleClick}
                >
                  <span className="text-[#e8d4b8] tracking-wider drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]">
                    {diagramTitle}
                  </span>
                  <Edit2 className="w-3.5 h-3.5 text-[#c17a4a] opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              )}
            </div>
            
            <div className="flex gap-2 border-l border-[#5a3d28] pl-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsAddDialogOpen(true)}
                className="border border-[#c17a4a] bg-gradient-to-b from-[#2a1c14] to-[#1a0f0a] text-[#e8d4b8] hover:bg-[#3d2818] hover:text-[#f5b57a] transition-all drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Node
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="border border-[#c17a4a] bg-gradient-to-b from-[#2a1c14] to-[#1a0f0a] text-[#e8d4b8] hover:bg-[#3d2818] hover:text-[#f5b57a] transition-all drop-shadow-[0_1px_2px_rgba(0,0,0,0.6)]"
              >
                <Download className="w-4 h-4 mr-1" />
                Export
              </Button>
            </div>
            
            {/* Decorative elements */}
            <div className="flex gap-1">
              <div className="w-2 h-2 rounded-full bg-gradient-to-br from-[#c17a4a] to-[#8b5a3c]" />
              <div className="w-2 h-2 rounded-full bg-gradient-to-br from-[#c17a4a] to-[#8b5a3c]" />
            </div>
          </div>
          
          {/* Decorative indicators */}
          <div className="flex gap-2 mt-3 pt-3 border-t border-[#5a3d28]">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#f5b57a] animate-pulse shadow-lg shadow-[#c17a4a]/50" />
              <span className="text-xs text-[#c9a579]">Active</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#c17a4a]" />
              <span className="text-xs text-[#c9a579]">{nodes.length} Nodes</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#d9925f]" />
              <span className="text-xs text-[#c9a579]">{connections.length} Connections</span>
            </div>
          </div>
        </div>
        
        {/* Diamond separator below */}
        <div className="flex items-center justify-center mt-3">
          <div className="h-px w-32 bg-gradient-to-r from-transparent via-[#c17a4a] to-transparent" />
          <div className="w-2 h-2 rotate-45 bg-[#c17a4a] mx-2" />
          <div className="h-px w-32 bg-gradient-to-r from-transparent via-[#c17a4a] to-transparent" />
        </div>
      </div>

      {/* Canvas area */}
      <div 
        className="relative w-full h-full pt-40"
        onClick={handleCanvasClick}
        onMouseMove={handleMouseMove}
      >
        <svg className="absolute inset-0 w-full h-full" style={{ pointerEvents: 'none' }}>
          <defs>
            <linearGradient id="pipeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#5a3d28" />
              <stop offset="50%" stopColor="#c17a4a" />
              <stop offset="100%" stopColor="#5a3d28" />
            </linearGradient>
            <linearGradient id="pipeHighlight" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#d9925f" />
              <stop offset="100%" stopColor="transparent" />
            </linearGradient>
          </defs>
          
          {/* Existing connections */}
          {connections.map((conn, index) => {
            const from = getNodePosition(conn.from);
            const to = getNodePosition(conn.to);
            const midY = from.y + 90 + (to.y - 90 - (from.y + 90)) / 2;
            const pathD = `M ${from.x} ${from.y + 90} C ${from.x} ${midY}, ${to.x} ${midY}, ${to.x} ${to.y - 90}`;
            
            return (
              <g key={`${conn.from}-${conn.to}-${index}`}>
                <FlowConnection
                  fromX={from.x}
                  fromY={from.y + 90}
                  toX={to.x}
                  toY={to.y - 90}
                />
                {/* Invisible clickable area for deletion */}
                <path
                  d={pathD}
                  fill="none"
                  stroke="transparent"
                  strokeWidth="20"
                  style={{ pointerEvents: 'auto', cursor: 'pointer' }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteConnection(conn.from, conn.to);
                  }}
                />
              </g>
            );
          })}

          {/* Connection in progress */}
          {connectionInProgress && (() => {
            const fromNode = getNodePosition(connectionInProgress.from);
            return (
              <FlowConnection
                fromX={fromNode.x}
                fromY={fromNode.y + 90}
                toX={mousePosition.x}
                toY={mousePosition.y}
              />
            );
          })()}
        </svg>

        {/* Nodes */}
        {nodes.map((node) => (
          <FlowNode
            key={node.id}
            id={node.id}
            title={node.title}
            description={node.description}
            x={node.x}
            y={node.y}
            width={node.width}
            height={node.height}
            onDrag={handleDrag}
            onDelete={handleDeleteNode}
            onConnectionStart={handleConnectionStart}
            isConnectionSource={connectionInProgress?.from === node.id && connectionInProgress.isFromOutput}
            isConnectionTarget={connectionInProgress !== null && connectionInProgress.from !== node.id}
          />
        ))}
      </div>

      {/* Bottom info panel */}
      <div className="absolute bottom-6 right-6 bg-gradient-to-br from-[#2a1c14]/90 to-[#1a0f0a]/90 border border-[#c17a4a] rounded px-4 py-2 backdrop-blur-sm">
        <p className="text-xs text-[#c9a579]">
          <span className="text-[#f5b57a]">⚙</span> Drag nodes to reposition | 
          <span className="text-[#f5b57a]">⚡</span> {connectionInProgress ? 'Click input point to connect' : 'Click output → input to connect'} |
          <span className="text-[#f5b57a]"> 🔧</span> Click connection to delete
        </p>
      </div>

      {/* Add Node Dialog */}
      <AddNodeDialog
        open={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onAddNode={handleAddNode}
      />
    </div>
  );
}
