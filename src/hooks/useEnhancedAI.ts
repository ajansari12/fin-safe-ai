import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { getCurrentUserProfile } from '@/lib/supabase-utils';

interface AIMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  conversationType?: string;
}

interface AIResponse {
  response: string;
  conversationType: string;
  contextUsed: boolean;
}

export const useEnhancedAI = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<AIMessage[]>([]);
  const { toast } = useToast();

  const sendMessage = useCallback(async (
    message: string, 
    conversationType: string = 'general'
  ): Promise<AIResponse | null> => {
    try {
      setIsLoading(true);
      
      const profile = await getCurrentUserProfile();
      if (!profile?.organization_id) {
        throw new Error('No organization found');
      }

      const userMessage: AIMessage = {
        role: 'user',
        content: message,
        timestamp: new Date(),
        conversationType
      };

      setMessages(prev => [...prev, userMessage]);

      const response = await supabase.functions.invoke('ai-risk-assistant', {
        body: {
          message,
          conversationType,
          userId: profile.id,
          orgId: profile.organization_id,
          conversationHistory: messages.slice(-10)
        }
      });

      if (response.error) {
        throw new Error(response.error.message || 'Failed to get AI response');
      }

      const assistantMessage: AIMessage = {
        role: 'assistant',
        content: response.data.response,
        timestamp: new Date(),
        conversationType
      };

      setMessages(prev => [...prev, assistantMessage]);

      return response.data as AIResponse;

    } catch (error) {
      console.error('Error in AI communication:', error);
      toast({
        title: "AI Assistant Error",
        description: error.message || "Failed to communicate with AI assistant",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [messages, toast]);

  const clearConversation = useCallback(() => {
    setMessages([]);
  }, []);

  const getConversationHistory = useCallback(() => {
    return messages;
  }, [messages]);

  return {
    messages,
    isLoading,
    sendMessage,
    clearConversation,
    getConversationHistory
  };
};