import * as React from 'react';
import { useState, useRef, useEffect } from 'react';
import { Settings, X, Plus, Edit3, Trash2 } from 'lucide-react';
import { Button } from './ui/button';

export interface MindMapNodeData {
  id: string;
  title: string;
  content: string;
  x: number;
  y: number;
  level: number;
  parentId?: string;
  children: string[];
  isExpanded: boolean;
  isEditing: boolean;
  isSuggestion: boolean;
  isMainTopic: boolean;
}

interface MindMapNodeProps {
  node: MindMapNodeData;
  isSelected: boolean;
  onSelect: (nodeId: string) => void;
  onUpdate: (nodeId: string, updates: Partial<MindMapNodeData>) => void;
  onDelete: (nodeId: string) => void;
  onAddChild: (parentId: string) => void;
  onExpand: (nodeId: string) => void;
  onAcceptSuggestion: (suggestionId: string) => void;
  onRejectSuggestion: (suggestionId: string) => void;
  scale: number;
  onDragStart?: (id: string) => void;
  onDrag?: (id: string, x: number, y: number) => void;
  onDragEnd?: () => void;
}

export function MindMapNode({
  node,
  isSelected,
  onSelect,
  onUpdate,
  onDelete,
  onAddChild,
  onExpand,
  onAcceptSuggestion,
  onRejectSuggestion,
  scale,
  onDragStart,
  onDrag,
  onDragEnd
}: MindMapNodeProps) {
  const nodeRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - node.x,
      y: e.clientY - node.y,
    });
    onDragStart?.(node.id);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      const newX = e.clientX - dragOffset.x;
      const newY = e.clientY - dragOffset.y;
      onDrag?.(node.id, newX, newY);
    }
  };

  const handleMouseUp = () => {
    if (isDragging) {
      setIsDragging(false);
      onDragEnd?.();
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect(node.id);
  };

  const handleTitleEdit = (newTitle: string) => {
    onUpdate(node.id, { title: newTitle, isEditing: false });
  };

  const handleContentEdit = (newContent: string) => {
    onUpdate(node.id, { content: newContent });
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

  // Auto-size based on content - no fixed dimensions
  const [nodeDimensions, setNodeDimensions] = useState({ width: 280, height: 120 });
  
  const measureContent = () => {
    if (nodeRef.current) {
      const contentElement = nodeRef.current.querySelector('.content-area');
      const titleElement = nodeRef.current.querySelector('.title-bar');
      
      if (contentElement && titleElement) {
        const contentRect = contentElement.getBoundingClientRect();
        const titleRect = titleElement.getBoundingClientRect();
        
        // Calculate total dimensions including padding
        const padding = 16; // px-4 = 16px horizontal padding
        const minWidth = node.isSuggestion ? 120 : 200; // Smaller for suggestions
        const minHeight = node.isSuggestion ? 60 : 80; // Smaller for suggestions
        
        // Use the wider of title or content for width
        const contentWidth = Math.max(
          titleRect.width + padding * 2,
          contentRect.width + padding * 2
        );
        
        const totalHeight = titleRect.height + contentRect.height;
        
        setNodeDimensions({
          width: Math.max(minWidth, contentWidth),
          height: Math.max(minHeight, totalHeight)
        });
      }
    }
  };

  React.useEffect(() => {
    // Use a small delay to ensure DOM is updated
    const timer = setTimeout(measureContent, 10);
    return () => clearTimeout(timer);
  }, [node.content, node.title]);

  return (
    <div
      ref={nodeRef}
      className="absolute select-none cursor-move group"
      style={{
        left: `${node.x}px`,
        top: `${node.y}px`,
        transform: 'translate(-50%, -50%)',
        width: `${nodeDimensions.width}px`,
        height: `${nodeDimensions.height}px`,
      }}
      onMouseDown={handleMouseDown}
    >
      <div className="relative h-full">
        {/* Delete button */}
        {onDelete && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(node.id);
            }}
            className="absolute -top-3 -right-3 w-7 h-7 rounded-full bg-gradient-to-br from-primary to-secondary border-2 border-background opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center z-10 hover:scale-110 hover:shadow-lg hover:shadow-primary/50 cursor-pointer"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <X className="w-4 h-4 text-background" strokeWidth={3} />
          </button>
        )}
        
        {/* Main node body */}
        <div 
          className={`relative border-2 border-primary bg-gradient-to-br from-card to-background rounded shadow-2xl overflow-hidden h-full transition-all duration-200 hover:scale-105 hover:shadow-[0_0_30px_rgba(193,122,74,0.4)] ${
            node.isSuggestion ? 'cursor-pointer opacity-60 hover:opacity-90 border-dashed' : ''
          }`}
          onClick={node.isSuggestion ? () => onAcceptSuggestion?.(node.id) : undefined}
        >
          {/* Copper plate texture */}
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_30%_30%,_var(--primary)_0%,transparent_50%)]" />
          
          {/* Top copper bar */}
          <div className="title-bar relative bg-gradient-to-r from-secondary via-primary to-secondary px-4 py-2 border-b border-border">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-full bg-background/50 border border-primary/30 flex-shrink-0">
                <Settings className="w-4 h-4 text-accent" />
              </div>
              <span className={`tracking-wide drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] truncate ${
                node.isSuggestion ? 'text-sm' : 'text-foreground'
              }`}>
                {node.isSuggestion ? '💡 ' : ''}{node.title}
              </span>
            </div>
          </div>
          
          {/* Content area */}
          <div className="content-area px-4 py-3">
            {node.isSuggestion ? (
              <p className="text-foreground text-xs drop-shadow-[0_1px_1px_rgba(0,0,0,0.6)] italic">
                Click to explore this topic
              </p>
            ) : (
              <p className="text-foreground text-sm drop-shadow-[0_1px_1px_rgba(0,0,0,0.6)]" style={{ wordWrap: 'break-word', overflowWrap: 'break-word' }}>
                {node.content}
              </p>
            )}
          </div>
          
          {/* Corner decorations */}
          <div className="absolute top-0 left-0 w-8 h-8 border-t border-l border-primary/20 rounded-tl" />
          <div className="absolute bottom-0 right-0 w-8 h-8 border-b border-r border-primary/20 rounded-br" />
        </div>
        
        {/* Glow effect on hover */}
        <div className="absolute inset-0 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
          <div className="absolute inset-0 rounded bg-primary/10 blur-xl" />
        </div>
      </div>
    </div>
  );
}
