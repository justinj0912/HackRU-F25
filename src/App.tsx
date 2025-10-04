import React, { useState, useCallback } from 'react';
import { PanelLeft, PanelRight, Monitor, Palette } from 'lucide-react';
import { Button } from './components/ui/button';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from './components/ui/resizable';
import { ChatSidebar, type Chat } from './components/ChatSidebar';
import { ChatInterface } from './components/ChatInterface';
import { Blackboard } from './components/Blackboard';
import { MindMapCanvas, MindMapNodeData } from './components/MindMapCanvas';

type Theme = 'modern' | 'retro';

export default function App() {
  const [chats, setChats] = useState<Chat[]>([]);
  const [activeChat, setActiveChat] = useState<string | null>(null);
  const [isWhiteboardVisible, setIsWhiteboardVisible] = useState(false);
  const [sidebarVisible, setSidebarVisible] = useState(true);
  const [currentTheme, setCurrentTheme] = useState<Theme>('modern');

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

  const createNewMindMap = useCallback(() => {
    const newChat: Chat = {
      id: Date.now().toString(),
      title: `Mind Map ${chats.length + 1}`,
      color: '#8B5A3C', // brown
      type: 'mindmap',
      messages: [],
      createdAt: new Date(),
    };
    
    setChats(prev => [newChat, ...prev]);
    setActiveChat(newChat.id);
  }, [chats.length]);

  const selectChat = useCallback((chatId: string) => {
    setActiveChat(chatId);
  }, []);

  const generateMindMapTopics = async (topic: string): Promise<MindMapNodeData[]> => {
    try {
      const response = await fetch('http://localhost:8000/generate-mind-map', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic: topic,
          depth: 3,
          max_branches: 5
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate mind map');
      }

      const data = await response.json();
      return data.nodes;
    } catch (error) {
      console.error('Error generating mind map:', error);
      
      // Fallback: Create a simple mind map structure when API is unavailable
      const fallbackNodes: MindMapNodeData[] = [
        {
          id: 'main_topic',
          title: topic,
          content: `This is the main topic: ${topic}. This mind map will help you explore and organize concepts related to this subject.`,
          x: 400,
          y: 300,
          level: 0,
          parentId: null,
          children: [],
          isExpanded: true,
          isEditing: false,
          isSuggestion: false,
          isMainTopic: true
        },
        {
          id: 'suggestion_1',
          title: 'Key Concepts',
          content: `Explore the fundamental concepts and principles related to ${topic}.`,
          x: 100,
          y: 150,
          level: 0,
          parentId: null,
          children: [],
          isExpanded: true,
          isEditing: false,
          isSuggestion: true,
          isMainTopic: false
        },
        {
          id: 'suggestion_2',
          title: 'Applications',
          content: `Learn about real-world applications and examples of ${topic}.`,
          x: 450,
          y: 150,
          level: 0,
          parentId: null,
          children: [],
          isExpanded: true,
          isEditing: false,
          isSuggestion: true,
          isMainTopic: false
        },
        {
          id: 'suggestion_3',
          title: 'History & Development',
          content: `Discover the historical context and development of ${topic}.`,
          x: 100,
          y: 350,
          level: 0,
          parentId: null,
          children: [],
          isExpanded: true,
          isEditing: false,
          isSuggestion: true,
          isMainTopic: false
        },
        {
          id: 'suggestion_4',
          title: 'Future Trends',
          content: `Explore emerging trends and future directions in ${topic}.`,
          x: 450,
          y: 350,
          level: 0,
          parentId: null,
          children: [],
          isExpanded: true,
          isEditing: false,
          isSuggestion: true,
          isMainTopic: false
        }
      ];
      
      return fallbackNodes;
    }
  };

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

  const sendMessage = useCallback((chatId: string, message: string) => {
    const newMessage = {
      role: 'user' as const,
      content: message,
      timestamp: new Date(),
    };

    setChats(prev => prev.map(chat => {
      if (chat.id === chatId) {
        return {
          ...chat,
          messages: [...chat.messages, newMessage],
        };
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

  const cycleTheme = useCallback(() => {
    setCurrentTheme(prev => prev === 'modern' ? 'retro' : 'modern');
  }, []);

  const getThemeClasses = () => {
    switch (currentTheme) {
      case 'retro':
        return 'retro-theme bg-retro-gray text-black font-retro';
      default:
        return 'bg-background text-foreground';
    }
  };

  const getThemeIcon = () => {
    switch (currentTheme) {
      case 'retro':
        return <Monitor className="w-4 h-4" />;
      default:
        return <Palette className="w-4 h-4" />;
    }
  };

  const getThemeLabel = () => {
    return currentTheme === 'retro' ? 'Modern' : 'Retro';
  };

  const currentChat = chats.find(chat => chat.id === activeChat);

  return (
    <div className={`h-screen overflow-hidden ${getThemeClasses()}`}>
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
            onCreateMindMap={createNewMindMap}
            onRenameChat={renameChat}
            onDeleteChat={deleteChat}
            onChangeColor={changeColor}
            currentTheme={currentTheme}
          />
        </ResizablePanel>
        
        {sidebarVisible && (
          <ResizableHandle className={`w-1 transition-colors ${
            currentTheme === 'retro' 
              ? 'retro-handle' 
              : 'bg-border hover:bg-muted'
          }`} />
        )}

        {/* Chat Interface */}
        <ResizablePanel 
          defaultSize={sidebarVisible ? (isWhiteboardVisible ? 45 : 75) : (isWhiteboardVisible ? 60 : 100)} 
          minSize={30}
        >
          <div className="h-full flex flex-col">
            {/* Header with controls */}
            <div className={`flex items-center justify-between p-2 border-b ${
              currentTheme === 'retro'
                ? 'bg-retro-gray border-retro-dark retro-inset'
                : 'bg-card border-border'
            }`}>
              <div className="flex items-center gap-2">
                {!sidebarVisible && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setSidebarVisible(true)}
                    className={
                      currentTheme === 'retro' 
                        ? "retro-button" 
                        : "text-muted-foreground hover:text-foreground"
                    }
                  >
                    <PanelLeft className="w-4 h-4" />
                  </Button>
                )}
                <h1 className={`text-lg ${
                  currentTheme === 'retro' 
                    ? 'text-black' 
                    : 'text-foreground'
                }`}>
                  Cognify {currentTheme === 'retro' && '- Windows 98 Edition'}
                </h1>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={cycleTheme}
                  className={`gap-2 ${
                    currentTheme === 'retro'
                      ? 'retro-button'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  {getThemeIcon()}
                  {getThemeLabel()}
                </Button>

                {sidebarVisible && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setSidebarVisible(false)}
                    className={
                      currentTheme === 'retro' 
                        ? "retro-button" 
                        : "text-muted-foreground hover:text-foreground"
                    }
                  >
                    <PanelLeft className="w-4 h-4" />
                  </Button>
                )}
                
                <Button
                  size="sm"
                  variant={isWhiteboardVisible ? "default" : "ghost"}
                  onClick={() => setIsWhiteboardVisible(!isWhiteboardVisible)}
                  className={`gap-2 ${
                    currentTheme === 'retro'
                      ? 'retro-button'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <PanelRight className="w-4 h-4" />
                  Blackboard
                </Button>
              </div>
            </div>

            {/* Chat Interface or Mind Map */}
            <div className="flex-1">
              {currentChat?.type === 'mindmap' ? (
                <MindMapCanvas
                  onGenerateTopics={generateMindMapTopics}
                />
              ) : (
                <ChatInterface
                  activeChat={currentChat || null}
                  onSendMessage={handleSendMessage}
                  onAddAssistantMessage={addAssistantMessage}
                  onImageAnalysis={(imageData) => {
                    // This will be called by the whiteboard
                  }}
                  currentTheme={currentTheme}
                />
              )}
            </div>
          </div>
        </ResizablePanel>

        {/* Whiteboard */}
        {isWhiteboardVisible && (
          <ResizableHandle className={`w-1 transition-colors ${
            currentTheme === 'retro' 
              ? 'retro-handle' 
              : 'bg-border hover:bg-muted'
          }`} />
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
            currentTheme={currentTheme}
          />
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  );
}