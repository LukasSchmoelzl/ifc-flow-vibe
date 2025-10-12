"use client";

import React from 'react';
import ReactMarkdown from 'react-markdown';
import { User, Bot } from 'lucide-react';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  isError?: boolean;
}

interface ChatMessageProps {
  message: ChatMessage;
}

export function ChatMessageComponent({ message }: ChatMessageProps) {
  return (
    <div className={`mb-4 w-full ${message.role === 'user' ? 'text-right' : 'text-left'}`}>
      <div
        className="inline-flex items-center justify-center w-8 h-8 rounded-full mb-2"
        style={{
          background: message.role === 'user' ? 'hsl(var(--primary))' : 'hsl(var(--accent))',
          color: 'white'
        }}
      >
        {message.role === 'user' ? <User size={16} /> : <Bot size={16} />}
      </div>
      <br />
      <div
        className={`inline-block p-3 rounded-lg border ${
          message.isError 
            ? 'bg-destructive/10 border-destructive' 
            : 'bg-card border-border'
        } max-w-full break-words text-left`}
      >
        <div className="prose prose-sm dark:prose-invert max-w-none">
          <ReactMarkdown>{message.content}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
}

export function LoadingMessage() {
  return (
    <div className="flex flex-col items-start gap-2 w-full">
      <div
        className="flex items-center justify-center w-8 h-8 rounded-full"
        style={{
          background: 'hsl(var(--accent))',
          color: 'white'
        }}
      >
        <Bot size={16} />
      </div>
      <div className="p-3 rounded-lg border bg-card border-border w-full flex items-center gap-1">
        <div className="w-2 h-2 rounded-full bg-muted-foreground animate-pulse" style={{ animationDelay: '0s' }} />
        <div className="w-2 h-2 rounded-full bg-muted-foreground animate-pulse" style={{ animationDelay: '0.2s' }} />
        <div className="w-2 h-2 rounded-full bg-muted-foreground animate-pulse" style={{ animationDelay: '0.4s' }} />
      </div>
    </div>
  );
}

