import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, Play, Video, Download } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { ScrollArea } from './ui/scroll-area';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import type { Chat } from './ChatSidebar';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  hasVideo?: boolean;
  videoUrl?: string;
  videoDuration?: number;
  hasImage?: boolean;
  imageData?: string;
}

type Theme = 'modern' | 'retro' | 'steampunk';

interface ChatInterfaceProps {
  activeChat: Chat | null;
  onSendMessage: (chatId: string, message: string) => void;
  onAddAssistantMessage?: (chatId: string, message: string) => void;
  onSendImageMessage?: (chatId: string, imageData: string) => void;
  onImageAnalysis?: (imageData: string) => void;
  currentTheme?: Theme;
}

export function ChatInterface({ activeChat, onSendMessage, onAddAssistantMessage, onSendImageMessage, onImageAnalysis, currentTheme = 'modern' }: ChatInterfaceProps) {
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [videoMode, setVideoMode] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    if (activeChat) {
      scrollToBottom();
    }
  }, [activeChat?.messages]);


  const handleSend = async () => {
    if (!message.trim() || !activeChat || isLoading) return;

    const userMessage = message.trim();
    setMessage('');
    setIsLoading(true);

    // Send user message
    onSendMessage(activeChat.id, userMessage);

    if (videoMode) {
      // Extract topic from flexible prompts like "can you make a video explaining X"
      let topic = userMessage;
      
      // Handle various video request patterns
      const videoPatterns = [
        /can you make a video explaining (.+)/i,
        /make a video about (.+)/i,
        /show me a video of (.+)/i,
        /create a video explaining (.+)/i,
        /generate a video about (.+)/i,
        /video about (.+)/i,
        /explain (.+) with a video/i,
        /help me learn about (.+)/i,
        /teach me about (.+)/i,
        /i want to learn about (.+)/i,
        /can you teach me (.+)/i
      ];
      
      for (const pattern of videoPatterns) {
        const match = userMessage.match(pattern);
        if (match) {
          topic = match[1].trim();
          break;
        }
      }
      
      console.log('Extracted topic for video:', topic);
      
      try {
        
        // Generate video from the topic
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout
        
        const response = await fetch('http://localhost:8000/render-video', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            question: topic,
            subject: null // Let the AI determine the subject based on the topic
          }),
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);

        if (response.ok) {
          const videoData = await response.json();
          console.log('Video data received:', videoData);
          
          // Add video directly to the chat
          if (onAddAssistantMessage) {
            onAddAssistantMessage(activeChat.id, `VIDEO:${videoData.video_url}`);
          }
        } else {
          // Log the error details
          const errorText = await response.text();
          console.error('Video generation failed:', response.status, errorText);
          
          // Fallback to text response if video generation fails
          if (onAddAssistantMessage) {
            onAddAssistantMessage(activeChat.id, `Sorry, I couldn't generate a video for "${topic}". Let me explain it in words instead!`);
          }
        }
      } catch (error) {
        console.error('Error generating video:', error);
        
        // Handle different types of errors
        let errorMessage = `Sorry, I had trouble generating a video for "${topic}". Let me explain it in words instead!`;
        
        if (error.name === 'AbortError') {
          errorMessage = `Video generation is taking too long for "${topic}". Let me explain it in words instead!`;
        } else if (error.message.includes('fetch')) {
          errorMessage = `I couldn't connect to the video service for "${topic}". Let me explain it in words instead!`;
        }
        
        // Fallback to text response
        if (onAddAssistantMessage) {
          onAddAssistantMessage(activeChat.id, errorMessage);
        }
      }
    } else {
      // AI Tutor response with ELI5 approach when video mode is disabled
      try {
        const response = await fetch('http://localhost:8000/tutor-response', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            question: userMessage,
            subject: null, // Let the AI determine the subject based on the question
            style: 'ELI5' // Explain Like I'm 5
          }),
        });

        if (response.ok) {
          const tutorData = await response.json();
          
          if (onAddAssistantMessage) {
            onAddAssistantMessage(activeChat.id, tutorData.explanation);
          }
        } else {
          // Fallback to simple ELI5 response
          const eli5Responses = [
            `Let me explain "${userMessage}" in simple terms! Think of it like this...`,
            `Great question! Let me break down "${userMessage}" in a way that's easy to understand.`,
            `I'd love to help you understand "${userMessage}"! Here's a simple way to think about it...`,
            `"${userMessage}" is actually simpler than it seems! Let me explain it step by step.`
          ];
          
          const randomResponse = eli5Responses[Math.floor(Math.random() * eli5Responses.length)];
          
          if (onAddAssistantMessage) {
            onAddAssistantMessage(activeChat.id, randomResponse);
          }
        }
      } catch (error) {
        console.error('Error getting tutor response:', error);
        // Fallback to simple ELI5 response
        if (onAddAssistantMessage) {
          onAddAssistantMessage(activeChat.id, `Let me explain "${userMessage}" in simple terms! This is a great question that many students ask.`);
        }
      }
    }
    
    setIsLoading(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleImageAnalysis = async (imageData: string) => {
    if (!activeChat) return;
    
    setIsLoading(true);
    
    try {
      const response = await fetch('http://localhost:8000/analyze-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image_data: imageData,
          question: null
        }),
      });

      if (response.ok) {
        const analysisData = await response.json();
        
        // Add AI response
        if (onAddAssistantMessage) {
          onAddAssistantMessage(activeChat.id, analysisData.explanation);
        }
      } else {
        console.error('Image analysis failed:', response.status);
        if (onAddAssistantMessage) {
          onAddAssistantMessage(activeChat.id, "I had trouble analyzing the image. Please try again or describe what you'd like help with!");
        }
      }
    } catch (error) {
      console.error('Error analyzing image:', error);
      if (onAddAssistantMessage) {
        onAddAssistantMessage(activeChat.id, "I couldn't analyze the image. Please try again or describe what you'd like help with!");
      }
    }
    
    setIsLoading(false);
  };

  const generateVideo = () => {
    // Mock video generation
    alert('Video generation feature would integrate with video creation API. This is a mockup demonstration.');
  };

  // Expose image analysis function to parent
  React.useEffect(() => {
    if (onImageAnalysis) {
      // Store the function reference so parent can call it
      (window as any).triggerImageAnalysis = handleImageAnalysis;
    }
  }, [onImageAnalysis]);

  if (!activeChat) {
    return (
      <div className={`h-full flex items-center justify-center ${
        currentTheme === 'retro' 
          ? 'bg-retro-gray' 
          : currentTheme === 'steampunk'
          ? 'bg-steam-leather'
          : 'bg-gray-800'
      }`}>
        <div className={`text-center ${
          currentTheme === 'retro' 
            ? 'text-black' 
            : currentTheme === 'steampunk'
            ? 'text-steam-cream'
            : 'text-gray-400'
        }`}>
          <Bot className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg mb-2">AI Tutor Ready</h3>
          <p>Select a chat or create a new one to start learning</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`h-full flex flex-col ${
      currentTheme === 'retro' 
        ? 'bg-retro-gray' 
        : currentTheme === 'steampunk'
        ? 'bg-steam-leather'
        : 'bg-gray-800'
    }`}>
      {/* Chat Header */}
      <div className={`p-3 border-b ${
        currentTheme === 'retro'
          ? 'border-retro-dark bg-retro-gray retro-titlebar'
          : currentTheme === 'steampunk'
          ? 'steam-titlebar steam-rivets'
          : 'border-gray-700 bg-gray-900'
      }`}>
        <div className="flex items-center gap-3">
          <div
            className={`w-4 h-4 ${
              currentTheme === 'retro' 
                ? 'border border-black' 
                : currentTheme === 'steampunk'
                ? 'border-2 border-steam-brass rounded-sm'
                : 'rounded-full'
            }`}
            style={{ backgroundColor: activeChat.color }}
          />
          <h2 className={`text-lg ${
            currentTheme === 'retro' 
              ? 'text-white' 
              : currentTheme === 'steampunk'
              ? 'text-steam-cream font-steampunk'
              : 'text-white'
          }`}>
            {activeChat.title}
          </h2>
          <Badge 
            variant="outline" 
            className={
              currentTheme === 'retro'
                ? 'retro-button !text-xs !p-1'
                : currentTheme === 'steampunk'
                ? 'steam-button !text-xs !p-1'
                : 'text-gray-400 border-gray-600'
            }
          >
            {activeChat.messages.length} messages
          </Badge>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className={`flex-1 p-4 ${
        currentTheme === 'retro' 
          ? 'retro-scrollbar' 
          : currentTheme === 'steampunk'
          ? 'steam-scrollbar'
          : ''
      }`} style={{ maxHeight: 'calc(100vh - 200px)' }}>
        <div className="space-y-4">
          {activeChat.messages.map((msg, index) => {
            const message = msg as Message;
            return (
            <div
              key={index}
              className={`flex gap-3 ${
                message.role === 'assistant' ? 'justify-start' : 'justify-end'
              }`}
            >
              {message.role === 'assistant' && (
                <div className={`w-8 h-8 flex items-center justify-center flex-shrink-0 ${
                  currentTheme === 'retro'
                    ? 'bg-retro-blue border-2 border-retro-dark'
                    : currentTheme === 'steampunk'
                    ? 'steam-metal-frame bg-steam-brass'
                    : 'bg-red-700 rounded-full'
                }`}>
                  <Bot className="w-4 h-4 text-white" />
                </div>
              )}
              
              <Card
                className={`max-w-[80%] p-3 ${
                  currentTheme === 'retro'
                    ? (message.role === 'assistant' 
                        ? 'retro-card !bg-retro-light' 
                        : 'retro-card !bg-retro-blue !text-white')
                    : currentTheme === 'steampunk'
                    ? (message.role === 'assistant'
                        ? 'steam-card !bg-steam-copper'
                        : 'steam-card !bg-steam-brass !text-steam-charcoal')
                    : (message.role === 'assistant'
                        ? 'bg-gray-700 border-gray-600'
                        : 'bg-red-700 border-red-600')
                }`}
              >
                {message.hasImage && message.imageData && (
                  <div className="mb-3">
                    <img 
                      src={message.imageData} 
                      alt="User drawing" 
                      className="max-w-full h-auto rounded-lg border border-gray-600"
                      style={{ maxHeight: '300px' }}
                    />
                  </div>
                )}
                
                <p className={`whitespace-pre-wrap ${
                  currentTheme === 'retro'
                    ? (message.role === 'assistant' ? 'text-black' : 'text-white')
                    : currentTheme === 'steampunk'
                    ? (message.role === 'assistant' ? 'text-steam-cream' : 'text-steam-charcoal')
                    : 'text-white'
                }`}>{message.content}</p>
                
        {message.role === 'assistant' && message.content.startsWith('VIDEO:') && (
          <div className="mt-3 pt-3 border-t border-gray-600">
            <video 
              controls 
              className="w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl rounded-lg shadow-lg"
              src={`http://localhost:8000${message.content.replace('VIDEO:', '')}`}
              onError={(e) => console.error('Video load error:', e)}
              onLoadStart={() => console.log('Video loading started')}
              preload="metadata"
            >
              Your browser does not support the video tag.
            </video>
          </div>
        )}
                
                <div className={`text-xs mt-2 ${
                  currentTheme === 'retro'
                    ? (message.role === 'assistant' ? 'text-gray-600' : 'text-gray-200')
                    : currentTheme === 'steampunk'
                    ? (message.role === 'assistant' ? 'text-steam-cream opacity-70' : 'text-steam-charcoal opacity-70')
                    : 'text-gray-400'
                }`}>
                  {message.timestamp.toLocaleTimeString()}
                </div>
              </Card>

              {message.role === 'user' && (
                <div className={`w-8 h-8 flex items-center justify-center flex-shrink-0 ${
                  currentTheme === 'retro'
                    ? 'bg-retro-green border-2 border-retro-dark'
                    : currentTheme === 'steampunk'
                    ? 'steam-metal-frame bg-steam-copper'
                    : 'bg-gray-600 rounded-full'
                }`}>
                  <User className="w-4 h-4 text-white" />
                </div>
              )}
            </div>
            );
          })}

          {isLoading && (
            <div className="flex gap-3 justify-start">
              <div className={`w-8 h-8 flex items-center justify-center flex-shrink-0 ${
                currentTheme === 'retro' 
                  ? 'bg-retro-blue border-2 border-retro-dark' 
                  : 'bg-red-700 rounded-full'
              }`}>
                <Bot className="w-4 h-4 text-white" />
              </div>
              <Card className={`p-3 ${
                currentTheme === 'retro' 
                  ? 'retro-card !bg-retro-light' 
                  : 'bg-gray-700 border-gray-600'
              }`}>
                <div className={`flex items-center gap-2 ${
                  currentTheme === 'retro' ? 'text-black' : 'text-gray-400'
                }`}>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  AI is thinking...
                </div>
              </Card>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className={`p-3 border-t ${
        currentTheme === 'retro' 
          ? 'border-retro-dark bg-retro-gray retro-panel' 
          : 'border-gray-700 bg-gray-900'
      }`}>
        <div className="flex gap-2">
          <Input
            ref={inputRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={videoMode ? "Ask for a video explanation (e.g., 'can you make a video explaining photosynthesis')" : "Ask me anything! I can help with any subject..."}
            className={`flex-1 ${
              currentTheme === 'retro' 
                ? 'retro-input' 
                : 'bg-gray-800 border-gray-600 text-white placeholder-gray-400'
            }`}
            disabled={isLoading}
          />
          <Button
            onClick={handleSend}
            disabled={!message.trim() || isLoading}
            className={currentTheme === 'retro' 
              ? 'retro-button' 
              : 'bg-red-700 hover:bg-red-600 text-white'
            }
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        
        <div className="flex gap-2 mt-2">
          <Button
            size="sm"
            variant={videoMode ? "default" : "outline"}
            className={`text-xs ${
              videoMode 
                ? 'bg-red-600 hover:bg-red-500 text-white' 
                : 'border-gray-600 text-gray-400 hover:text-white hover:border-gray-500'
            }`}
            onClick={() => setVideoMode(!videoMode)}
          >
            🎥 Video Mode
          </Button>
        </div>
      </div>
    </div>
  );
}