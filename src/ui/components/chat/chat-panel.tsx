"use client";

import React, { useState, useEffect, useRef } from 'react';
import { ChatMessageComponent, LoadingMessage } from './chat-message';
import { ChatInput } from './chat-input';
import { useAI } from '@/src/hooks/use-ai';
import { MessageSquare } from 'lucide-react';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  isError?: boolean;
}

export function ChatPanel() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    if (messages.length > 0) {
      scrollToBottom();
    }
  }, [messages]);

  useEffect(() => {
    if (isProcessing) {
      setTimeout(scrollToBottom, 100);
    }
  }, [isProcessing]);

  const { processMessage } = useAI({
    onResult: (result) => {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: result.success ? (result.response || 'Response received') : 'Sorry, I could not process your request.',
        timestamp: new Date().toISOString(),
        isError: !result.success,
      }]);
      setIsProcessing(false);
    },
    onError: (error) => {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `Error: ${error}`,
        timestamp: new Date().toISOString(),
        isError: true,
      }]);
      setIsProcessing(false);
    }
  });

  const handleSendMessage = (message: string) => {
    if (!message.trim() || isProcessing) return;

    setMessages(prev => [...prev, {
      role: 'user',
      content: message.trim(),
      timestamp: new Date().toISOString(),
    }]);
    
    setIsProcessing(true);
    
    const lastTen = messages.slice(-10).map(msg => ({
      role: msg.role as 'user' | 'assistant',
      content: msg.content
    }));
    processMessage(message.trim(), lastTen);
  };

  return (
    <div className="flex flex-col h-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border rounded-lg">
      {/* Header */}
      <div className="flex items-center gap-2 p-4 border-b">
        <MessageSquare className="h-5 w-5" />
        <h3 className="font-semibold">AI Assistant</h3>
      </div>

      {/* Messages */}
      <div 
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4"
      >
        {messages.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Start a conversation about your IFC model</p>
          </div>
        ) : (
          <>
            {messages.map((message, index) => (
              <ChatMessageComponent key={index} message={message} />
            ))}
            {isProcessing && <LoadingMessage />}
          </>
        )}
      </div>

      {/* Input */}
      <div className="p-4 border-t">
        <ChatInput 
          onSend={handleSendMessage} 
          disabled={isProcessing}
        />
      </div>
    </div>
  );
}

