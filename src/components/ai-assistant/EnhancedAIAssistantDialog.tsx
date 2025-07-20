
import React from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { EnhancedAIAssistant } from '@/components/ai/EnhancedAIAssistant';
import { Brain, Sparkles } from 'lucide-react';

interface EnhancedAIAssistantDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EnhancedAIAssistantDialog({ 
  open, 
  onOpenChange 
}: EnhancedAIAssistantDialogProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent 
        side="right" 
        className="w-full sm:max-w-2xl p-0 overflow-hidden"
      >
        <SheetHeader className="p-6 pb-0">
          <SheetTitle className="flex items-center gap-2">
            <Brain className="h-6 w-6 text-primary" />
            OSFI E-21 AI Assistant
            <Sparkles className="h-4 w-4 text-yellow-500" />
          </SheetTitle>
          <SheetDescription>
            Get specialized guidance on operational risk management and compliance
          </SheetDescription>
        </SheetHeader>
        
        <div className="h-[calc(100vh-120px)] p-6 pt-4">
          <div className="h-full">
            <EnhancedAIAssistant />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
