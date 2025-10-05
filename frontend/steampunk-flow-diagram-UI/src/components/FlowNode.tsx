import { Settings, X } from 'lucide-react';
import { useState } from 'react';

interface FlowNodeProps {
  id: string;
  title: string;
  description?: string;
  x: number;
  y: number;
  width: number;
  height: number;
  onDragStart?: (id: string) => void;
  onDrag?: (id: string, x: number, y: number) => void;
  onDragEnd?: () => void;
  onDelete?: (id: string) => void;
  onConnectionStart?: (nodeId: string, isOutput: boolean) => void;
  isConnectionSource?: boolean;
  isConnectionTarget?: boolean;
}

export function FlowNode({ 
  id, 
  title, 
  description, 
  x, 
  y,
  width,
  height,
  onDragStart,
  onDrag,
  onDragEnd,
  onDelete,
  onConnectionStart,
  isConnectionSource = false,
  isConnectionTarget = false
}: FlowNodeProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - x,
      y: e.clientY - y,
    });
    onDragStart?.(id);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      const newX = e.clientX - dragOffset.x;
      const newY = e.clientY - dragOffset.y;
      onDrag?.(id, newX, newY);
    }
  };

  const handleMouseUp = () => {
    if (isDragging) {
      setIsDragging(false);
      onDragEnd?.();
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete?.(id);
  };

  const handleConnectionPointClick = (e: React.MouseEvent, isOutput: boolean) => {
    e.stopPropagation();
    onConnectionStart?.(id, isOutput);
  };

  React.useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragOffset]);

  return (
    <div
      className="absolute select-none cursor-move group"
      style={{
        left: `${x}px`,
        top: `${y}px`,
        transform: 'translate(-50%, -50%)',
        width: `${width}px`,
        height: `${height}px`,
      }}
      onMouseDown={handleMouseDown}
    >
      <div className="relative h-full">
        {/* Delete button */}
        {onDelete && (
          <button
            onClick={handleDelete}
            className="absolute -top-3 -right-3 w-7 h-7 rounded-full bg-gradient-to-br from-[#c17a4a] to-[#8b5a3c] border-2 border-[#1a0f0a] opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center z-10 hover:scale-110 hover:shadow-lg hover:shadow-[#c17a4a]/50 cursor-pointer"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <X className="w-4 h-4 text-[#1a0f0a]" strokeWidth={3} />
          </button>
        )}
        
        {/* Main node body */}
        <div className="relative border-2 border-[#c17a4a] bg-gradient-to-br from-[#2a1c14] to-[#1a0f0a] rounded shadow-2xl overflow-hidden h-full transition-all duration-200 hover:scale-105 hover:shadow-[0_0_30px_rgba(193,122,74,0.4)]">
          {/* Copper plate texture */}
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_30%_30%,_#c17a4a_0%,transparent_50%)]" />
          
          {/* Top copper bar */}
          <div className="relative bg-gradient-to-r from-[#8b5a3c] via-[#c17a4a] to-[#8b5a3c] px-4 py-2 border-b border-[#5a3d28]">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-full bg-[#1a0f0a]/50 border border-[#c17a4a]/30 flex-shrink-0">
                <Settings className="w-4 h-4 text-[#f5b57a]" />
              </div>
              <span className="text-[#e8d4b8] tracking-wide drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] truncate">{title}</span>
            </div>
          </div>
          
          {/* Content area */}
          <div className="px-4 py-3 overflow-hidden">
            {description && (
              <p className="text-[#c9a579] text-sm drop-shadow-[0_1px_1px_rgba(0,0,0,0.6)]" style={{ wordWrap: 'break-word', overflowWrap: 'break-word' }}>{description}</p>
            )}
          </div>
          
          {/* Corner decorations */}
          <div className="absolute top-0 left-0 w-8 h-8 border-t border-l border-[#c17a4a]/20 rounded-tl" />
          <div className="absolute bottom-0 right-0 w-8 h-8 border-b border-r border-[#c17a4a]/20 rounded-br" />
        </div>
        
        {/* Glow effect on hover */}
        <div className="absolute inset-0 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
          <div className="absolute inset-0 rounded bg-[#c17a4a]/10 blur-xl" />
        </div>
      </div>
      
      {/* Connection points */}
      {/* Input (top) */}
      <button
        onClick={(e) => handleConnectionPointClick(e, false)}
        onMouseDown={(e) => e.stopPropagation()}
        className={`absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-gradient-to-br from-[#c17a4a] to-[#8b5a3c] border-2 border-[#1a0f0a] shadow-lg cursor-pointer hover:scale-125 transition-all z-20 ${
          isConnectionTarget ? 'ring-2 ring-[#f5b57a] ring-offset-2 ring-offset-[#0f0a07] scale-125 animate-pulse' : ''
        }`}
        title="Input connection point"
      />
      {/* Output (bottom) */}
      <button
        onClick={(e) => handleConnectionPointClick(e, true)}
        onMouseDown={(e) => e.stopPropagation()}
        className={`absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-gradient-to-br from-[#c17a4a] to-[#8b5a3c] border-2 border-[#1a0f0a] shadow-lg cursor-pointer hover:scale-125 transition-all z-20 ${
          isConnectionSource ? 'ring-2 ring-[#f5b57a] ring-offset-2 ring-offset-[#0f0a07] scale-125 animate-pulse' : ''
        }`}
        title="Output connection point"
      />
    </div>
  );
}

// Add React import
import * as React from 'react';
