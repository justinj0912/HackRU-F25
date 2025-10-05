import React, { useState } from 'react';
import { Plus, MessageSquare, Edit2, Trash2, Palette, Network, ChevronDown } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { ScrollArea } from './ui/scroll-area';
import { Card } from './ui/card';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';

export interface Chat {
  id: string;
  title: string;
  color: string;
  type: 'chat' | 'conceptmap';
  messages: Array<{ 
    role: 'user' | 'assistant'; 
    content: string; 
    timestamp: Date;
    hasImage?: boolean;
    imageData?: string;
    narrationAudioUrl?: string;
  }>;
  createdAt: Date;
  conceptMapNodes?: Array<{
    id: string;
    title: string;
    summary?: string;
    x: number;
    y: number;
    expanded: boolean;
    parentId?: string;
    children: string[];
    importance: 'high' | 'medium' | 'low';
    color?: string;
  }>;
}

type Theme = 'modern';

interface ChatSidebarProps {
  chats: Chat[];
  activeChat: string | null;
  onSelectChat: (chatId: string) => void;
  onCreateChat: () => void;
  onCreateConceptMap: () => void;
  onRenameChat: (chatId: string, newTitle: string) => void;
  onDeleteChat: (chatId: string) => void;
  onChangeColor: (chatId: string, color: string) => void;
  currentTheme?: Theme;
}

const colors = [
  '#DC2626', // red-600
  '#EA580C', // orange-600
  '#D97706', // amber-600
  '#65A30D', // lime-600
  '#059669', // emerald-600
  '#0891B2', // cyan-600
  '#2563EB', // blue-600
  '#7C3AED', // violet-600
  '#C026D3', // fuchsia-600
  '#DC2626', // rose-600
];

export function ChatSidebar({
  chats,
  activeChat,
  onSelectChat,
  onCreateChat,
  onCreateConceptMap,
  onRenameChat,
  onDeleteChat,
  onChangeColor,
  currentTheme = 'modern',
}: ChatSidebarProps) {
  const [editingChat, setEditingChat] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  const handleStartEdit = (chat: Chat) => {
    setEditingChat(chat.id);
    setEditTitle(chat.title);
  };

  const handleSaveEdit = () => {
    if (editingChat && editTitle.trim()) {
      onRenameChat(editingChat, editTitle.trim());
    }
    setEditingChat(null);
    setEditTitle('');
  };

  const handleCancelEdit = () => {
    setEditingChat(null);
    setEditTitle('');
  };

  return (
    <div className="h-full border-r flex flex-col bg-background border-border">
      {/* Header */}
      <div className="p-2 border-b border-border">
        <div className="space-y-2">
          <Button
            onClick={onCreateChat}
            className="w-full gap-2 bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            <MessageSquare className="w-4 h-4" />
            New Chat
          </Button>
          
          <Button
            onClick={onCreateConceptMap}
            className="w-full gap-2 bg-secondary hover:bg-secondary/90 text-secondary-foreground"
          >
            <Network className="w-4 h-4" />
            New Concept Map
          </Button>
        </div>
      </div>

      {/* Chat List */}
      <ScrollArea className="flex-1 p-2">
        <div className="space-y-1">
          {chats.map((chat) => (
            <Card
              key={chat.id}
              className={`group p-2 cursor-pointer transition-colors border-border hover:bg-card ${
                activeChat === chat.id
                  ? 'bg-card border-primary'
                  : 'bg-background'
              }`}
              onClick={() => onSelectChat(chat.id)}
            >
              <div className="flex items-center gap-2">
                {/* Color indicator */}
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: chat.color }}
                />

                {/* Chat title */}
                <div className="flex-1 min-w-0">
                  {editingChat === chat.id ? (
                    <Input
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveEdit();
                        if (e.key === 'Escape') handleCancelEdit();
                      }}
                      onBlur={handleSaveEdit}
                      className="h-6 text-sm bg-card border-border"
                      autoFocus
                      onClick={(e) => e.stopPropagation()}
                    />
                  ) : (
                    <div className="flex items-center gap-1">
                      {chat.type === 'conceptmap' ? (
                        <Network className="w-3 h-3 text-muted-foreground" />
                      ) : (
                        <MessageSquare className="w-3 h-3 text-muted-foreground" />
                      )}
                      <p className={`text-sm truncate ${
                        false
                          ? (activeChat === chat.id ? 'text-white' : 'text-black')
                          : 'text-foreground'
                      }`}>
                        {chat.title}
                      </p>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0 hover:bg-muted"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Palette className="w-3 h-3 text-muted-foreground" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-40 p-2 bg-card border-border">
                      <div className="grid grid-cols-5 gap-1">
                        {colors.map((color) => (
                          <button
                            key={color}
                            className="w-6 h-6 rounded-full border border-border hover:scale-110 transition-transform"
                            style={{ backgroundColor: color }}
                            onClick={() => {
                              onChangeColor(chat.id, color);
                            }}
                          />
                        ))}
                      </div>
                    </PopoverContent>
                  </Popover>

                  <Button
                    size="sm"
                    variant="ghost"
                        className="h-6 w-6 p-0 hover:bg-gray-700"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStartEdit(chat);
                    }}
                  >
                        <Edit2 className="w-3 h-3 text-muted-foreground" />
                  </Button>

                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-6 w-6 p-0 hover:bg-red-600"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteChat(chat.id);
                    }}
                  >
                        <Trash2 className="w-3 h-3 text-muted-foreground" />
                  </Button>
                </div>
              </div>

              {/* Last message preview */}
              {chat.messages.length > 0 && (
                <p className="text-xs mt-1 truncate text-muted-foreground">
                  {chat.messages[chat.messages.length - 1].content}
                </p>
              )}
            </Card>
          ))}

          {chats.length === 0 && (
            <div className={`text-center py-8 ${
              false 
                ? 'text-black' 
                : 'text-muted-foreground'
            }`}>
              <MessageSquare className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No chats yet</p>
              <p className="text-xs">Click "New Chat" to get started</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}