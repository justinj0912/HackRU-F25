import React, { useState } from 'react';
import { Plus, MessageSquare, Edit2, Trash2, Palette } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { ScrollArea } from './ui/scroll-area';
import { Card } from './ui/card';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';

export interface Chat {
  id: string;
  title: string;
  color: string;
  messages: Array<{ 
    role: 'user' | 'assistant'; 
    content: string; 
    timestamp: Date;
    hasImage?: boolean;
    imageData?: string;
  }>;
  createdAt: Date;
}

type Theme = 'modern' | 'retro';

interface ChatSidebarProps {
  chats: Chat[];
  activeChat: string | null;
  onSelectChat: (chatId: string) => void;
  onCreateChat: () => void;
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
    <div className={`h-full border-r flex flex-col ${
      currentTheme === 'retro'
        ? 'bg-retro-gray border-retro-dark retro-panel'
        : 'bg-gray-900 border-gray-700'
    }`}>
      {/* Header */}
      <div className={`p-2 border-b ${
        currentTheme === 'retro'
          ? 'border-retro-dark'
          : 'border-gray-700'
      }`}>
        <Button
          onClick={onCreateChat}
          className={`w-full gap-2 ${
            currentTheme === 'retro'
              ? 'retro-button'
              : 'bg-red-700 hover:bg-red-600 text-white'
          }`}
        >
          <Plus className="w-4 h-4" />
          New Chat
        </Button>
      </div>

      {/* Chat List */}
      <ScrollArea className={`flex-1 p-2 ${
        currentTheme === 'retro' 
          ? 'retro-scrollbar' 
          : ''
      }`}>
        <div className="space-y-1">
          {chats.map((chat) => (
            <Card
              key={chat.id}
              className={`group p-2 cursor-pointer transition-colors ${
                currentTheme === 'retro'
                  ? `retro-card ${activeChat === chat.id ? 'active' : ''}`
                  : `border-gray-700 hover:bg-gray-800 ${
                      activeChat === chat.id
                        ? 'bg-gray-800 border-red-600'
                        : 'bg-gray-900'
                    }`
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
                      className={`h-6 text-sm ${
                        currentTheme === 'retro'
                          ? 'retro-input'
                          : 'bg-gray-800 border-gray-600'
                      }`}
                      autoFocus
                      onClick={(e) => e.stopPropagation()}
                    />
                  ) : (
                    <p className={`text-sm truncate ${
                      currentTheme === 'retro'
                        ? (activeChat === chat.id ? 'text-white' : 'text-black')
                        : 'text-gray-100'
                    }`}>
                      {chat.title}
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        size="sm"
                        variant="ghost"
                        className={`h-6 w-6 p-0 ${
                          currentTheme === 'retro'
                            ? 'retro-button !min-h-[16px] !p-0'
                            : 'hover:bg-gray-700'
                        }`}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Palette className={`w-3 h-3 ${
                          currentTheme === 'retro' 
                            ? 'text-black' 
                            : 'text-gray-400'
                        }`} />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className={`w-40 p-2 ${
                      currentTheme === 'retro'
                        ? 'bg-retro-gray border-retro-dark retro-panel'
                        : 'bg-gray-800 border-gray-700'
                    }`}>
                      <div className="grid grid-cols-5 gap-1">
                        {colors.map((color) => (
                          <button
                            key={color}
                            className="w-6 h-6 rounded-full border border-gray-600 hover:scale-110 transition-transform"
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
                    className={`h-6 w-6 p-0 ${
                      currentTheme === 'retro'
                        ? 'retro-button !min-h-[16px] !p-0'
                        : 'hover:bg-gray-700'
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStartEdit(chat);
                    }}
                  >
                    <Edit2 className={`w-3 h-3 ${
                      currentTheme === 'retro' 
                        ? 'text-black' 
                        : 'text-gray-400'
                    }`} />
                  </Button>

                  <Button
                    size="sm"
                    variant="ghost"
                    className={`h-6 w-6 p-0 ${
                      currentTheme === 'retro'
                        ? 'retro-button !min-h-[16px] !p-0'
                        : 'hover:bg-red-600'
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteChat(chat.id);
                    }}
                  >
                    <Trash2 className={`w-3 h-3 ${
                      currentTheme === 'retro' 
                        ? 'text-black' 
                        : 'text-gray-400'
                    }`} />
                  </Button>
                </div>
              </div>

              {/* Last message preview */}
              {chat.messages.length > 0 && (
                <p className={`text-xs mt-1 truncate ${
                  currentTheme === 'retro'
                    ? (activeChat === chat.id ? 'text-gray-200' : 'text-gray-600')
                    : 'text-gray-500'
                }`}>
                  {chat.messages[chat.messages.length - 1].content}
                </p>
              )}
            </Card>
          ))}

          {chats.length === 0 && (
            <div className={`text-center py-8 ${
              currentTheme === 'retro' 
                ? 'text-black' 
                : 'text-gray-500'
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