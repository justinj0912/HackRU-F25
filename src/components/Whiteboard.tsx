import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Pencil, Eraser, Square, Circle, Type, Save, Trash2, Undo, Redo, Palette, Send } from 'lucide-react';
import { Button } from './ui/button';
import { Separator } from './ui/separator';
import { Slider } from './ui/slider';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';

interface DrawingPoint {
  x: number;
  y: number;
  color: string;
  size: number;
  tool: 'pen' | 'eraser';
}

interface DrawingStroke {
  points: DrawingPoint[];
  tool: 'pen' | 'eraser' | 'rectangle' | 'circle' | 'text';
  color: string;
  size: number;
  id: string;
}

interface WhiteboardProps {
  isVisible: boolean;
  onToggle: () => void;
  onSendToChat?: (imageData: string) => void;
}

const colors = [
  '#FFFFFF', // white
  '#EF4444', // red
  '#F97316', // orange
  '#EAB308', // yellow
  '#22C55E', // green
  '#3B82F6', // blue
  '#8B5CF6', // purple
  '#EC4899', // pink
  '#000000', // black
];

export function Whiteboard({ isVisible, onToggle, onSendToChat }: WhiteboardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState<'pen' | 'eraser' | 'rectangle' | 'circle' | 'text'>('pen');
  const [color, setColor] = useState('#FFFFFF');
  const [brushSize, setBrushSize] = useState(3);
  const [strokes, setStrokes] = useState<DrawingStroke[]>([]);
  const [currentStroke, setCurrentStroke] = useState<DrawingPoint[]>([]);
  const [history, setHistory] = useState<DrawingStroke[][]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  const saveToHistory = useCallback((newStrokes: DrawingStroke[]) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push([...newStrokes]);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  }, [history, historyIndex]);

  const getMousePos = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  }, []);

  const drawPoint = useCallback((ctx: CanvasRenderingContext2D, point: DrawingPoint) => {
    ctx.globalCompositeOperation = point.tool === 'eraser' ? 'destination-out' : 'source-over';
    ctx.fillStyle = point.color;
    ctx.beginPath();
    ctx.arc(point.x, point.y, point.size / 2, 0, Math.PI * 2);
    ctx.fill();
  }, []);

  const drawStroke = useCallback((ctx: CanvasRenderingContext2D, stroke: DrawingStroke) => {
    if (stroke.points.length === 0) return;

    ctx.globalCompositeOperation = stroke.tool === 'eraser' ? 'destination-out' : 'source-over';
    ctx.strokeStyle = stroke.color;
    ctx.lineWidth = stroke.size;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    ctx.beginPath();
    ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
    
    for (let i = 1; i < stroke.points.length; i++) {
      ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
    }
    
    ctx.stroke();
  }, []);

  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    // Clear canvas with dark background
    ctx.fillStyle = '#1F2937'; // gray-800
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw all strokes
    strokes.forEach(stroke => {
      drawStroke(ctx, stroke);
    });

    // Draw current stroke
    if (currentStroke.length > 0) {
      const tempStroke: DrawingStroke = {
        points: currentStroke,
        tool,
        color,
        size: brushSize,
        id: 'temp'
      };
      drawStroke(ctx, tempStroke);
    }
  }, [strokes, currentStroke, tool, color, brushSize, drawStroke]);

  useEffect(() => {
    redrawCanvas();
  }, [redrawCanvas]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleResize = () => {
      const container = canvas.parentElement;
      if (container) {
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;
        redrawCanvas();
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [redrawCanvas]);

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const pos = getMousePos(e);
    setIsDrawing(true);
    setCurrentStroke([{ ...pos, color, size: brushSize, tool }]);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    
    const pos = getMousePos(e);
    setCurrentStroke(prev => [...prev, { ...pos, color, size: brushSize, tool }]);
  };

  const handleMouseUp = () => {
    if (!isDrawing || currentStroke.length === 0) return;

    const newStroke: DrawingStroke = {
      points: currentStroke,
      tool,
      color,
      size: brushSize,
      id: Date.now().toString()
    };

    const newStrokes = [...strokes, newStroke];
    setStrokes(newStrokes);
    saveToHistory(newStrokes);
    setCurrentStroke([]);
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    setStrokes([]);
    setCurrentStroke([]);
    saveToHistory([]);
  };

  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setStrokes(history[historyIndex - 1] || []);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setStrokes(history[historyIndex + 1] || []);
    }
  };

  const saveWhiteboard = () => {
    // Mock save functionality
    localStorage.setItem('whiteboard-data', JSON.stringify(strokes));
    alert('Whiteboard saved! In a full implementation, this would sync with your backend.');
  };

  const sendToChat = () => {
    const canvas = canvasRef.current;
    if (!canvas || !onSendToChat) return;

    // Check if there's any content on the canvas
    if (strokes.length === 0) {
      alert('Please draw something on the whiteboard before sending to chat.');
      return;
    }

    // Convert canvas to image data
    const imageData = canvas.toDataURL('image/png');
    onSendToChat(imageData);
  };

  // Load saved data on mount
  useEffect(() => {
    const saved = localStorage.getItem('whiteboard-data');
    if (saved) {
      try {
        const loadedStrokes = JSON.parse(saved);
        setStrokes(loadedStrokes);
        saveToHistory(loadedStrokes);
      } catch (e) {
        console.error('Failed to load whiteboard data:', e);
      }
    }
  }, []);

  if (!isVisible) return null;

  return (
    <div className="h-full bg-gray-900 border-l border-gray-700 flex flex-col">
      {/* Toolbar */}
      <div className="p-3 border-b border-gray-700 bg-gray-800">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Drawing Tools */}
          <Button
            size="sm"
            variant={tool === 'pen' ? 'default' : 'outline'}
            onClick={() => setTool('pen')}
            className="gap-1"
          >
            <Pencil className="w-4 h-4" />
          </Button>
          
          <Button
            size="sm"
            variant={tool === 'eraser' ? 'default' : 'outline'}
            onClick={() => setTool('eraser')}
            className="gap-1"
          >
            <Eraser className="w-4 h-4" />
          </Button>

          <Separator orientation="vertical" className="h-6" />

          {/* Color Picker */}
          <Popover>
            <PopoverTrigger asChild>
              <Button size="sm" variant="outline" className="gap-1">
                <Palette className="w-4 h-4" />
                <div
                  className="w-3 h-3 rounded border"
                  style={{ backgroundColor: color }}
                />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-40 p-2 bg-gray-800 border-gray-700">
              <div className="grid grid-cols-3 gap-1">
                {colors.map((c) => (
                  <button
                    key={c}
                    className="w-8 h-8 rounded border-2 border-gray-600 hover:scale-110 transition-transform"
                    style={{ backgroundColor: c }}
                    onClick={() => setColor(c)}
                  />
                ))}
              </div>
            </PopoverContent>
          </Popover>

          {/* Brush Size */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">Size:</span>
            <div className="w-20">
              <Slider
                value={[brushSize]}
                onValueChange={(value) => setBrushSize(value[0])}
                min={1}
                max={20}
                step={1}
                className="w-full"
              />
            </div>
            <span className="text-xs text-gray-400 w-6">{brushSize}</span>
          </div>

          <Separator orientation="vertical" className="h-6" />

          {/* Actions */}
          <Button
            size="sm"
            variant="outline"
            onClick={undo}
            disabled={historyIndex <= 0}
            className="gap-1"
          >
            <Undo className="w-4 h-4" />
          </Button>
          
          <Button
            size="sm"
            variant="outline"
            onClick={redo}
            disabled={historyIndex >= history.length - 1}
            className="gap-1"
          >
            <Redo className="w-4 h-4" />
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={saveWhiteboard}
            className="gap-1 text-green-400 hover:text-green-300"
          >
            <Save className="w-4 h-4" />
          </Button>

          <Button
            size="sm"
            variant="outline"
            onClick={clearCanvas}
            className="gap-1 text-red-400 hover:text-red-300"
          >
            <Trash2 className="w-4 h-4" />
          </Button>

          <Separator orientation="vertical" className="h-6" />

          {/* Send to Chat */}
          <Button
            size="sm"
            variant="default"
            onClick={sendToChat}
            disabled={strokes.length === 0}
            className="gap-1 bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Send className="w-4 h-4" />
            Send to Chat
          </Button>
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1 relative">
        <canvas
          ref={canvasRef}
          className="absolute inset-0 cursor-crosshair"
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        />
      </div>

      {/* Instructions */}
      <div className="p-2 border-t border-gray-700 bg-gray-800">
        <p className="text-xs text-gray-400 text-center">
          Draw equations and diagrams. The AI can read your handwriting when implemented.
        </p>
      </div>
    </div>
  );
}