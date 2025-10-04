import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, ChevronRight, Plus, Edit3, Trash2 } from 'lucide-react';
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
  scale
}: MindMapNodeProps) {
  const nodeRef = useRef<HTMLDivElement>(null);

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

  const getNodeSize = () => {
    // TinkFlow-style sizing - compact and clean
    const maxWidth = 280;
    const minWidth = 200;
    const minHeight = 80;
    
    // Calculate based on content length
    const contentWidth = Math.min(maxWidth, Math.max(minWidth, Math.max(node.title.length * 8, node.content.length * 3) + 40));
    const contentHeight = Math.max(minHeight, (node.content.split('\n').length * 14) + 60);
    
    return {
      width: contentWidth,
      height: contentHeight
    };
  };

  const { width, height } = getNodeSize();

  return (
    <div
      ref={nodeRef}
      className={`absolute select-none transition-all duration-200 ${
        isSelected ? 'z-50' : 'z-10'
      }`}
      style={{
        left: node.x,
        top: node.y,
        width: width,
        height: height,
        transform: `scale(${scale})`,
        transformOrigin: 'top left'
      }}
      onClick={handleClick}
    >
      <div
        className={`node-content bg-background border rounded-lg shadow-sm p-4 h-full flex flex-col ${
          node.isMainTopic 
            ? 'border-accent shadow-accent/10 bg-accent/5' 
            : node.isSuggestion
            ? 'border-secondary shadow-secondary/10 bg-secondary/5'
            : isSelected 
            ? 'border-primary shadow-primary/10 bg-primary/5' 
            : 'border-border hover:border-primary/30 hover:shadow-md'
        }`}
      >
        {/* Title */}
        <div className="flex items-center justify-between mb-3">
          {node.isEditing ? (
            <input
              type="text"
              value={node.title}
              onChange={(e) => onUpdate(node.id, { title: e.target.value })}
              onBlur={() => onUpdate(node.id, { isEditing: false })}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleTitleEdit(node.title);
                }
              }}
              className="bg-transparent border-none outline-none text-foreground font-semibold text-base flex-1"
              autoFocus
            />
          ) : (
            <h3 
              className={`font-semibold text-base flex-1 cursor-pointer ${
                node.isMainTopic ? 'text-accent' : 
                node.isSuggestion ? 'text-secondary' : 'text-foreground'
              }`}
              onClick={() => onUpdate(node.id, { isEditing: true })}
            >
              {node.title}
            </h3>
          )}

          <div className="flex items-center gap-1">
            {node.isSuggestion ? (
              <>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 w-6 p-0 hover:bg-green-500/20 text-green-600"
                  onClick={(e) => {
                    e.stopPropagation();
                    onAcceptSuggestion(node.id);
                  }}
                >
                  ✓
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 w-6 p-0 hover:bg-red-500/20 text-red-600"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRejectSuggestion(node.id);
                  }}
                >
                  ✕
                </Button>
              </>
            ) : (
              <>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 w-6 p-0 hover:bg-muted"
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddChild(node.id);
                  }}
                >
                  <Plus className="w-3 h-3" />
                </Button>
                
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 w-6 p-0 hover:bg-muted"
                  onClick={(e) => {
                    e.stopPropagation();
                    onUpdate(node.id, { isEditing: true });
                  }}
                >
                  <Edit3 className="w-3 h-3" />
                </Button>
                
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 w-6 p-0 hover:bg-muted text-destructive hover:text-destructive/80"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(node.id);
                  }}
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="text-muted-foreground text-sm leading-relaxed whitespace-pre-wrap break-words overflow-hidden flex-1">
          {node.content}
        </div>

        {/* Type indicator */}
        {node.isMainTopic && (
          <div className="absolute -top-2 -left-2 w-5 h-5 bg-accent rounded-full border-2 border-background text-xs flex items-center justify-center text-accent-foreground font-bold">
            M
          </div>
        )}
        {node.isSuggestion && (
          <div className="absolute -top-2 -left-2 w-5 h-5 bg-secondary rounded-full border-2 border-background text-xs flex items-center justify-center text-secondary-foreground font-bold">
            ?
          </div>
        )}
      </div>
    </div>
  );
}
