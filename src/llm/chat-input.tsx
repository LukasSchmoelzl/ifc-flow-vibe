"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Send } from 'lucide-react';
import { Button } from '@/src/shared/ui/button';
import { useAI } from '@/src/llm/use-ai';

const PLACEHOLDER_TEXT = 'Frage nach BIM Daten, Eigenschaften oder lade ein Model hoch...';

interface ChatInputProps {
  placeholder?: string;
  disabled?: boolean;
  variant?: 'default' | 'desktop';
}

export function ChatInput({ 
  placeholder = PLACEHOLDER_TEXT,
  disabled = false,
  variant = 'desktop',
}: ChatInputProps) {
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [inputValue, setInputValue] = useState('');
  const [chatHistory, setChatHistory] = useState<Array<{role: 'user' | 'assistant', content: string}>>([]);

  const { processMessage, isProcessing } = useAI({
    onResult: (result) => {
      console.log('✅ AI Response:', result.response);
      if (result.success && result.response) {
        setChatHistory(prev => [...prev, {
          role: 'assistant',
          content: result.response!
        }]);
      }
    },
    onError: (error) => {
      console.error('❌ AI Error:', error);
    }
  });

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputValue.trim() || disabled || isProcessing) return;

    const message = inputValue.trim();
    console.log('💬 User:', message);

    setChatHistory(prev => [...prev, {
      role: 'user',
      content: message
    }]);

    setInputValue('');

    const lastTen = chatHistory.slice(-10);
    await processMessage(message, lastTen);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (inputValue.trim() && !disabled && !isProcessing) {
        handleSubmit();
      }
    }
  };

  const containerStyle: React.CSSProperties = {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    height: '100%',
    maxWidth: variant === 'desktop' ? '1000px' : '100%',
    margin: variant === 'desktop' ? '0 auto' : '0',
    background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.3), rgba(124, 58, 237, 0.3)), rgba(255, 255, 255, 0.15)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.3)',
    borderRadius: '12px',
    padding: '1rem'
  };

  const wrapperStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    position: 'relative',
    display: 'flex',
    alignItems: 'stretch'
  };

  const textareaStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    resize: 'none',
    padding: '0.75rem',
    paddingRight: '3rem',
    border: 'none',
    borderRadius: '8px',
    background: 'white',
    color: 'black',
    fontSize: '0.875rem',
    lineHeight: '1.5',
    outline: 'none',
    overflow: 'auto',
    overflowY: 'scroll'
  };

  const buttonStyle: React.CSSProperties = {
    position: 'absolute',
    right: '0.5rem',
    top: '50%',
    transform: 'translateY(-50%)',
    zIndex: 10
  };

  return (
    <form 
      onSubmit={handleSubmit} 
      style={containerStyle}
    >
      <div style={wrapperStyle}>
        <textarea
          ref={textareaRef}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={isProcessing ? 'AI is processing...' : placeholder}
          style={textareaStyle}
          disabled={disabled || isProcessing}
        />

        <div style={buttonStyle}>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={!inputValue.trim() || disabled || isProcessing}
            size="icon"
            className="h-10 w-10"
          >
            <Send size={16} />
          </Button>
        </div>
      </div>
    </form>
  );
}

