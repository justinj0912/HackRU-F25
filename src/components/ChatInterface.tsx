import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, Play, Video, Download, Volume2, VolumeX, Upload, Image } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { ScrollArea } from './ui/scroll-area';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import ReactMarkdown from 'react-markdown';
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

type Theme = 'modern' | 'steampunk';

interface ChatInterfaceProps {
  activeChat: Chat | null;
  onSendMessage: (chatId: string, message: string) => void;
  onAddAssistantMessage?: (chatId: string, message: string, narrationAudioUrl?: string) => void;
  onImageAnalysis?: (imageData: string) => void;
  currentTheme?: Theme;
}

export function ChatInterface({ activeChat, onSendMessage, onAddAssistantMessage, onImageAnalysis, currentTheme = 'modern' }: ChatInterfaceProps) {
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [videoMode, setVideoMode] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState<string>('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [playingAudio, setPlayingAudio] = useState<string | null>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    if ((!message.trim() && !uploadedImage) || !activeChat || isLoading) return;

    const userMessage = message.trim();
    setMessage('');
    setIsLoading(true);

    // If there's an uploaded image, analyze it
    if (uploadedImage) {
      // Analyze the image
      if (onImageAnalysis) {
        onImageAnalysis(uploadedImage);
      }
      
      clearUploadedImage();
      setIsLoading(false);
      return; // Exit early to prevent text processing
    }

    // Send user message only if no image
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
          console.log('Video URL:', videoData.video_url);
          
          // Add video directly to the chat
          if (onAddAssistantMessage) {
            console.log('Adding video to chat with URL:', videoData.video_url);
            onAddAssistantMessage(activeChat.id, videoData.video_url, videoData.narration_audio_url);
          } else {
            console.error('onAddAssistantMessage is not available');
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
        console.error('Error name:', error.name);
        console.error('Error message:', error.message);
        
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
      // Cognify response with ELI5 approach when video mode is disabled
      try {
        setIsStreaming(true);
        setStreamingMessage('');

        const response = await fetch('http://localhost:8000/tutor-response-stream', {
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
          const reader = response.body?.getReader();
          const decoder = new TextDecoder();
          let accumulatedText = '';

          if (reader) {
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;

              const chunk = decoder.decode(value);
              const lines = chunk.split('\n');
              
              for (const line of lines) {
                if (line.startsWith('data: ')) {
                  const text = line.slice(6);
                  if (text.trim()) {
                    accumulatedText += text;
                    setStreamingMessage(accumulatedText);
                    // Add a small delay to make streaming more readable
                    await new Promise(resolve => setTimeout(resolve, 50));
                  }
                }
              }
            }
          }

          // Add the final message to chat
          if (onAddAssistantMessage && accumulatedText) {
            onAddAssistantMessage(activeChat.id, accumulatedText);
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
      } finally {
        setIsStreaming(false);
        setStreamingMessage('');
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
      if (videoMode) {
        // Video mode: Generate Manim animation from image
        const response = await fetch('http://localhost:8000/render-video-from-image', {
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
          const result = await response.json();
          console.log('Video generation response:', result);
          
          if (result.video_url && onAddAssistantMessage) {
            console.log('Video URL found:', result.video_url);
            onAddAssistantMessage(activeChat.id, result.video_url, result.narration_audio_url);
          } else {
            console.log('No video URL in response:', result);
            // Fallback to text response
            if (onAddAssistantMessage) {
              onAddAssistantMessage(activeChat.id, "Sorry, I couldn't generate a video from the image. Let me explain it in words instead!");
            }
          }
        } else {
          console.log('Video generation failed with status:', response.status);
          const errorText = await response.text();
          console.log('Error response:', errorText);
          // Fallback to text response
          if (onAddAssistantMessage) {
            onAddAssistantMessage(activeChat.id, "Sorry, I couldn't generate a video from the image. Let me explain it in words instead!");
          }
        }
      } else {
        // Normal mode: Analyze image and provide text explanation
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
      }
    } catch (error) {
      console.error('Error processing image:', error);
      if (onAddAssistantMessage) {
        onAddAssistantMessage(activeChat.id, "I couldn't process the image. Please try again or describe what you'd like help with!");
      }
    }
    
    setIsLoading(false);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Check if it's an image file
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file.');
      return;
    }

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('Image file is too large. Please select an image smaller than 10MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const imageData = e.target?.result as string;
      setUploadedImage(imageData);
    };
    reader.readAsDataURL(file);
  };

  const clearUploadedImage = () => {
    setUploadedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const generateVideo = () => {
    // Mock video generation
    alert('Video generation feature would integrate with video creation API. This is a mockup demonstration.');
  };

  const handleTextToSpeech = async (text: string, messageId: string) => {
    try {
      // Stop any currently playing audio
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }

      const response = await fetch('http://localhost:8000/text-to-speech', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: text,
          voice_id: "21m00Tcm4TlvDq8ikWAM" // Rachel voice
        }),
      });

      if (response.ok) {
        const result = await response.json();
        
        // Create audio element and play
        const audio = new Audio(`http://localhost:8000${result.audio_url}`);
        audioRef.current = audio;
        setPlayingAudio(messageId);
        
        audio.onended = () => {
          setPlayingAudio(null);
          audioRef.current = null;
        };
        
        audio.onerror = () => {
          setPlayingAudio(null);
          audioRef.current = null;
        };
        
        await audio.play();
      }
    } catch (error) {
      console.error('Error generating speech:', error);
      setPlayingAudio(null);
    }
  };

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setPlayingAudio(null);
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
        currentTheme === 'steampunk'
          ? 'bg-steam-leather'
          : 'bg-card'
      }`}>
        <div className={`text-center ${
          currentTheme === 'steampunk'
            ? 'text-steam-cream'
            : 'text-muted-foreground'
        }`}>
          <Bot className="w-16 h-16 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg mb-2">Cognify Ready</h3>
          <p>Select a chat or create a new one to start learning</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`h-full flex flex-col ${
      currentTheme === 'steampunk'
        ? 'bg-steam-leather'
        : 'bg-gray-800'
    }`}>
      {/* Chat Header */}
      <div className={`p-3 border-b ${
        currentTheme === 'steampunk'
          ? 'steam-titlebar steam-rivets'
          : 'border-border bg-background'
      }`}>
        <div className="flex items-center gap-3">
          <div
            className={`w-4 h-4 ${
              currentTheme === 'steampunk'
                ? 'border-2 border-steam-brass rounded-sm'
                : 'rounded-full'
            }`}
            style={{ backgroundColor: activeChat.color }}
          />
          <h2 className={`text-lg ${
            currentTheme === 'steampunk'
              ? 'text-steam-cream font-steampunk'
              : 'text-white'
          }`}>
            {activeChat.title}
          </h2>
          <Badge 
            variant="outline" 
            className={
              currentTheme === 'steampunk'
                ? 'steam-button !text-xs !p-1'
                : 'text-muted-foreground border-border'
            }
          >
            {activeChat.messages.length} messages
          </Badge>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className={`flex-1 p-4 ${
        currentTheme === 'steampunk'
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
                  currentTheme === 'steampunk'
                    ? 'steam-metal-frame bg-steam-brass'
                    : 'bg-red-700 rounded-full'
                }`}>
                  <Bot className="w-4 h-4 text-white" />
                </div>
              )}
              
              <Card
                className={`max-w-[80%] p-3 ${
                  currentTheme === 'steampunk'
                    ? (message.role === 'assistant'
                        ? 'steam-card !bg-steam-copper'
                        : 'steam-card !bg-steam-brass !text-steam-charcoal')
                    : (message.role === 'assistant'
                        ? 'bg-muted border-border'
                        : 'bg-red-700 border-red-600')
                }`}
              >
                
                {message.role === 'assistant' && !message.content.startsWith('/videos/') ? (
                  <div className={`prose prose-sm max-w-none ${
                    currentTheme === 'steampunk'
                      ? 'prose-steam'
                      : 'prose-invert'
                  }`}>
                    <ReactMarkdown
                      components={{
                        p: ({ children }) => <p className="mb-2 last:mb-0 text-white">{children}</p>,
                        ul: ({ children }) => <ul className="list-disc list-inside mb-2 space-y-1 text-white">{children}</ul>,
                        ol: ({ children }) => <ol className="list-decimal list-inside mb-2 space-y-1 text-white">{children}</ol>,
                        li: ({ children }) => <li className="text-sm text-white">{children}</li>,
                        strong: ({ children }) => <strong className="font-semibold text-white">{children}</strong>,
                        em: ({ children }) => <em className="italic text-white">{children}</em>,
                        code: ({ children }) => <code className="bg-muted px-1 py-0.5 rounded text-xs font-mono text-foreground">{children}</code>,
                        pre: ({ children }) => <pre className="bg-card p-2 rounded text-xs font-mono overflow-x-auto mb-2 text-foreground">{children}</pre>,
                        h1: ({ children }) => <h1 className="text-lg font-bold mb-2 text-white">{children}</h1>,
                        h2: ({ children }) => <h2 className="text-base font-bold mb-2 text-white">{children}</h2>,
                        h3: ({ children }) => <h3 className="text-sm font-bold mb-1 text-white">{children}</h3>,
                        blockquote: ({ children }) => <blockquote className="border-l-4 border-border pl-3 italic mb-2 text-foreground">{children}</blockquote>,
                      }}
                    >
                      {message.content}
                    </ReactMarkdown>
                  </div>
                ) : message.role === 'user' ? (
                  <p className={`whitespace-pre-wrap ${
                    currentTheme === 'steampunk'
                      ? 'text-steam-charcoal'
                      : 'text-white'
                  }`}>{message.content}</p>
                ) : null}
                
                {/* Text-to-Speech button for assistant messages */}
                {message.role === 'assistant' && !message.content.startsWith('/videos/') && (
                  <div className="mt-2 flex justify-end">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        if (playingAudio === `msg-${index}`) {
                          stopAudio();
                        } else {
                          handleTextToSpeech(message.content, `msg-${index}`);
                        }
                      }}
                      className="h-8 w-8 p-0 hover:bg-muted"
                    >
                      {playingAudio === `msg-${index}` ? (
                        <VolumeX className="h-4 w-4 text-white" />
                      ) : (
                        <Volume2 className="h-4 w-4 text-white" />
                      )}
                    </Button>
                  </div>
                )}
                
        {message.role === 'assistant' && message.content.startsWith('/videos/') && (
          <div className="mt-3 pt-3 border-t border-border">
            <video 
              controls 
              className="w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl rounded-lg shadow-lg"
              src={`http://localhost:8000${message.content}`}
              onError={(e) => console.error('Video load error:', e)}
              onLoadStart={() => console.log('Video loading started')}
              preload="metadata"
            >
              Your browser does not support the video tag.
            </video>
            
                  </div>
                )}
                
                <div className={`text-xs mt-2 ${
                  currentTheme === 'steampunk'
                    ? (message.role === 'assistant' ? 'text-steam-cream opacity-70' : 'text-steam-charcoal opacity-70')
                    : 'text-muted-foreground'
                }`}>
                  {message.timestamp.toLocaleTimeString()}
                </div>
              </Card>

              {message.role === 'user' && (
                <div className={`w-8 h-8 flex items-center justify-center flex-shrink-0 ${
                  currentTheme === 'steampunk'
                    ? 'steam-metal-frame bg-steam-copper'
                    : 'bg-muted rounded-full'
                }`}>
                  <User className="w-4 h-4 text-white" />
                </div>
              )}
            </div>
            );
          })}

          {/* Streaming message display */}
          {isStreaming && streamingMessage && (
            <div className="flex gap-3 justify-start">
              <div className={`w-8 h-8 flex items-center justify-center flex-shrink-0 ${
                currentTheme === 'steampunk'
                  ? 'steam-metal-frame bg-steam-brass'
                  : 'bg-red-700 rounded-full'
              }`}>
                <Bot className="w-4 h-4 text-white" />
              </div>
              
              <Card className={`max-w-[80%] p-3 ${
                currentTheme === 'steampunk'
                  ? 'steam-card !bg-steam-copper'
                  : 'bg-muted border-border'
              }`}>
                <div className={`prose prose-sm max-w-none ${
                  currentTheme === 'steampunk'
                    ? 'prose-steam'
                    : 'prose-invert'
                }`}>
                  <ReactMarkdown
                    components={{
                      p: ({ children }) => <p className="mb-2 last:mb-0 text-white">{children}</p>,
                      ul: ({ children }) => <ul className="list-disc list-inside mb-2 space-y-1 text-white">{children}</ul>,
                      ol: ({ children }) => <ol className="list-decimal list-inside mb-2 space-y-1 text-white">{children}</ol>,
                      li: ({ children }) => <li className="text-sm text-white">{children}</li>,
                      strong: ({ children }) => <strong className="font-semibold text-white">{children}</strong>,
                      em: ({ children }) => <em className="italic text-white">{children}</em>,
                      code: ({ children }) => <code className="bg-gray-700 px-1 py-0.5 rounded text-xs font-mono text-white">{children}</code>,
                      pre: ({ children }) => <pre className="bg-gray-800 p-2 rounded text-xs font-mono overflow-x-auto mb-2 text-white">{children}</pre>,
                      h1: ({ children }) => <h1 className="text-lg font-bold mb-2 text-white">{children}</h1>,
                      h2: ({ children }) => <h2 className="text-base font-bold mb-2 text-white">{children}</h2>,
                      h3: ({ children }) => <h3 className="text-sm font-bold mb-1 text-white">{children}</h3>,
                      blockquote: ({ children }) => <blockquote className="border-l-4 border-gray-500 pl-3 italic mb-2 text-white">{children}</blockquote>,
                    }}
                  >
                    {streamingMessage}
                  </ReactMarkdown>
                </div>
                <div className="flex items-center mt-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {isLoading && !isStreaming && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 flex items-center justify-center flex-shrink-0 bg-red-700 rounded-full">
                <Bot className="w-4 h-4 text-white" />
              </div>
              <Card className="p-3 bg-muted border-border">
                <div className="flex items-center gap-2 text-muted-foreground">
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
      <div className="p-3 border-t border-border bg-background">
        <div className="flex gap-2">
          {uploadedImage && (
            <div className="flex items-center gap-2 p-2 border border-border rounded-lg bg-muted/50">
              <img 
                src={uploadedImage} 
                alt="Uploaded" 
                className="w-8 h-8 object-cover rounded border border-border"
              />
              <Button
                size="sm"
                variant="ghost"
                className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
                onClick={clearUploadedImage}
              >
                ×
              </Button>
            </div>
          )}
          
          <Input
            ref={inputRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={videoMode ? "Ask for a video explanation (e.g., 'can you make a video explaining photosynthesis')" : "Ask me anything! I can help with any subject..."}
            className="flex-1 bg-card border-border text-foreground placeholder-muted-foreground"
            disabled={isLoading}
          />
          <Button
            onClick={handleSend}
            disabled={(!message.trim() && !uploadedImage) || isLoading}
            className="bg-red-700 hover:bg-red-600 text-white"
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
                : 'border-border text-muted-foreground hover:text-foreground hover:border-primary'
            }`}
            onClick={() => setVideoMode(!videoMode)}
          >
            🎥 Video Mode
          </Button>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
          
          <Button
            size="sm"
            variant="outline"
            className="text-xs border-border text-muted-foreground hover:text-foreground hover:border-primary"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="w-3 h-3 mr-1" />
            Upload Image
          </Button>

        </div>
      </div>

    </div>
  );
}