import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Settings } from 'lucide-react';

interface AddNodeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddNode: (title: string, description: string) => void;
}

export function AddNodeDialog({ open, onOpenChange, onAddNode }: AddNodeDialogProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      onAddNode(title, description);
      // Reset form
      setTitle('');
      setDescription('');
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gradient-to-b from-[#2a1c14] to-[#1a0f0a] border-2 border-[#c17a4a] text-[#e8d4b8] w-[448px] max-w-[calc(100vw-2rem)]">
        <DialogHeader>
          <DialogTitle className="text-[#e8d4b8] flex items-center gap-2">
            <div className="p-2 rounded-full bg-[#c17a4a]/20 border border-[#c17a4a]">
              <Settings className="w-5 h-5 text-[#f5b57a]" />
            </div>
            Configure New Node
          </DialogTitle>
          <DialogDescription className="text-[#c9a579]">
            Add a new node to your flow diagram
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4 w-full">
          <div className="space-y-2 w-full">
            <Label htmlFor="title" className="text-[#e8d4b8]">
              Title
            </Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter node title..."
              className="bg-[#1a0f0a] border-[#c17a4a] text-[#e8d4b8] placeholder:text-[#9b7d5f] focus:ring-[#c17a4a] w-full"
              required
            />
          </div>

          <div className="space-y-2 w-full">
            <Label htmlFor="description" className="text-[#e8d4b8]">
              Description (Optional)
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter node description..."
              className="bg-[#1a0f0a] border-[#c17a4a] text-[#e8d4b8] placeholder:text-[#9b7d5f] focus:ring-[#c17a4a] resize-none w-full max-w-full"
              rows={3}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 border-[#c17a4a] bg-transparent text-[#c9a579] hover:bg-[#3d2818] hover:text-[#f5b57a]"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-gradient-to-r from-[#c17a4a] to-[#d9925f] text-[#1a0f0a] hover:from-[#d9925f] hover:to-[#c17a4a] border-0"
            >
              Add Node
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
