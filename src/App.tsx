import React, { useState, useCallback, useEffect } from 'react';
import { PanelLeft, PanelRight, Monitor, Palette } from 'lucide-react';
import { Button } from './components/ui/button';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from './components/ui/resizable';
import { ChatSidebar, type Chat } from './components/ChatSidebar';
import { ChatInterface } from './components/ChatInterface';
import { Blackboard } from './components/Blackboard';
import { ConceptMap, ConceptNode } from './components/ConceptMap';

type Theme = 'modern';

export default function App() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [isWhiteboardVisible, setIsWhiteboardVisible] = useState(false);
  const [sidebarVisible, setSidebarVisible] = useState(true);

  // Load chats from localStorage on mount
  useEffect(() => {
    const savedChats = localStorage.getItem('ai-tutor-chats');
    if (savedChats) {
      try {
        const parsedChats = JSON.parse(savedChats).map((chat: any) => ({
          ...chat,
          createdAt: new Date(chat.createdAt),
          messages: chat.messages.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          }))
        }));
        setChats(parsedChats);
      } catch (error) {
        console.error('Failed to load saved chats:', error);
      }
    }
  }, []);

  // Save chats to localStorage whenever chats change
  useEffect(() => {
    if (chats.length > 0) {
      localStorage.setItem('ai-tutor-chats', JSON.stringify(chats));
    }
  }, [chats]);

  const createNewChat = useCallback(() => {
    const newChat: Chat = {
      id: Date.now().toString(),
      title: `Chat ${chats.length + 1}`,
      color: '#DC2626', // red-600
      type: 'chat',
      messages: [],
      createdAt: new Date(),
    };
    
    setChats(prev => [newChat, ...prev]);
    setActiveChat(newChat.id);
  }, [chats.length]);

  const createNewConceptMap = useCallback(() => {
    const newChat: Chat = {
      id: Date.now().toString(),
      title: `Concept Map ${chats.length + 1}`,
      color: '#8B5A3C', // brown
      type: 'conceptmap',
      messages: [],
      createdAt: new Date(),
    };
    
    setChats(prev => [newChat, ...prev]);
    setActiveChat(newChat.id);
  }, [chats.length]);

  const selectChat = useCallback((chatId: string) => {
    setActiveChat(chatId);
  }, []);


  const renameChat = useCallback((chatId: string, newTitle: string) => {
    setChats(prev => prev.map(chat => 
      chat.id === chatId ? { ...chat, title: newTitle } : chat
    ));
  }, []);

  const deleteChat = useCallback((chatId: string) => {
    setChats(prev => prev.filter(chat => chat.id !== chatId));
    if (activeChat === chatId) {
      setActiveChat(null);
    }
  }, [activeChat]);

  const changeColor = useCallback((chatId: string, color: string) => {
    setChats(prev => prev.map(chat => 
      chat.id === chatId ? { ...chat, color } : chat
    ));
  }, []);

  // Save concept map nodes
  const saveConceptMap = useCallback((chatId: string, nodes: ConceptNode[]) => {
    setChats(prev => prev.map(chat => 
      chat.id === chatId ? { ...chat, conceptMapNodes: nodes } : chat
    ));
  }, []);

  // Load concept map nodes
  const loadConceptMap = useCallback((chatId: string): ConceptNode[] => {
    const chat = chats.find(c => c.id === chatId);
    return chat?.conceptMapNodes || [];
  }, [chats]);


  const sendMessage = useCallback((chatId: string, message: string) => {
    const newMessage = {
      role: 'user' as const,
      content: message,
      timestamp: new Date(),
    };

    setChats(prev => prev.map(chat => {
      if (chat.id === chatId) {
        return { ...chat, messages: [...chat.messages, newMessage] };
      }
      return chat;
    }));
  }, []);

  const addAssistantMessage = useCallback((chatId: string, message: string, narrationAudioUrl?: string) => {
    const assistantMessage = {
      role: 'assistant' as const,
      content: message,
      timestamp: new Date(),
      narrationAudioUrl: narrationAudioUrl,
    };

    setChats(prev => prev.map(chat => {
      if (chat.id === chatId) {
        return {
          ...chat,
          messages: [...chat.messages, assistantMessage],
        };
      }
      return chat;
    }));
  }, []);


  const handleSendMessage = useCallback((chatId: string, message: string) => {
    sendMessage(chatId, message);
  }, [sendMessage]);


  const currentChat = chats.find(chat => chat.id === activeChat);

  return (
    <div className="h-screen overflow-hidden bg-background text-foreground">
      {/* Main Layout */}
      <ResizablePanelGroup direction="horizontal" className="h-full">
        {/* Sidebar */}
        <ResizablePanel 
          defaultSize={sidebarVisible ? 25 : 0} 
          minSize={sidebarVisible ? 20 : 0} 
          maxSize={sidebarVisible ? 40 : 0}
          className={sidebarVisible ? "" : "hidden"}
        >
          <ChatSidebar
            chats={chats}
            activeChat={activeChat}
            onSelectChat={selectChat}
            onCreateChat={createNewChat}
            onCreateConceptMap={createNewConceptMap}
            onRenameChat={renameChat}
            onDeleteChat={deleteChat}
            onChangeColor={changeColor}
          />
        </ResizablePanel>
        
        {sidebarVisible && (
          <ResizableHandle className="w-1 transition-colors bg-border hover:bg-muted" />
        )}

        {/* Chat Interface */}
        <ResizablePanel 
          defaultSize={sidebarVisible ? (isWhiteboardVisible ? 45 : 75) : (isWhiteboardVisible ? 60 : 100)} 
          minSize={30}
        >
          <div className="h-full flex flex-col">
            {/* Header with controls */}
            <div className="flex items-center justify-between p-2 border-b bg-card border-border">
              <div className="flex items-center gap-2">
                {!sidebarVisible && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setSidebarVisible(true)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <PanelLeft className="w-4 h-4" />
                  </Button>
                )}
                <h1 className="text-lg text-foreground">
                  Cognify
                </h1>
              </div>

              <div className="flex items-center gap-2">

                {sidebarVisible && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setSidebarVisible(false)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <PanelLeft className="w-4 h-4" />
                  </Button>
                )}
                
                <Button
                  size="sm"
                  variant={isWhiteboardVisible ? "default" : "ghost"}
                  onClick={() => setIsWhiteboardVisible(!isWhiteboardVisible)}
                  className="gap-2 text-gray-400 hover:text-white"
                >
                  <PanelRight className="w-4 h-4" />
                  Blackboard
                </Button>
              </div>
            </div>

            {/* Chat Interface or Concept Map */}
            <div className="flex-1">
              {currentChat?.type === 'conceptmap' ? (
                <ConceptMap 
                  onSave={currentChat ? (nodes) => saveConceptMap(currentChat.id, nodes) : undefined}
                  onLoad={currentChat ? () => loadConceptMap(currentChat.id) : undefined}
                />
              ) : (
                <ChatInterface
                  activeChat={currentChat || null}
                  onSendMessage={handleSendMessage}
                  onAddAssistantMessage={addAssistantMessage}
                  onImageAnalysis={(imageData) => {
                    // This will be called by the whiteboard
                  }}
                />
              )}
            </div>
          </div>
        </ResizablePanel>

        {/* Whiteboard */}
        {isWhiteboardVisible && (
          <ResizableHandle className="w-1 transition-colors bg-border hover:bg-muted" />
        )}
        
        <ResizablePanel 
          defaultSize={isWhiteboardVisible ? 30 : 0} 
          minSize={isWhiteboardVisible ? 25 : 0} 
          maxSize={isWhiteboardVisible ? 50 : 0}
          className={isWhiteboardVisible ? "" : "hidden"}
        >
          <Blackboard
            isVisible={isWhiteboardVisible}
            onToggle={() => setIsWhiteboardVisible(!isWhiteboardVisible)}
            onSendToChat={(imageData) => {
              if (currentChat) {
                // Trigger image analysis directly
                setTimeout(() => {
                  if ((window as any).triggerImageAnalysis) {
                    (window as any).triggerImageAnalysis(imageData);
                  }
                }, 100);
              }
            }}
          />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}