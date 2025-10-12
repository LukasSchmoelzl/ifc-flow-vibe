// AI Hook - Simplified for IFCFlow

import { useRef, useCallback, useState } from 'react';
import { Executor, BIMResult } from '@/src/llm';

interface UseAIProps {
  onResult: (result: BIMResult) => void;
  onError: (error: string) => void;
}

export function useAI(props: UseAIProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const executorRef = useRef<Executor | null>(null);

  const setupExecutor = useCallback(() => {
    if (executorRef.current) return executorRef.current;
    
    const executor = new Executor();
    executorRef.current = executor;
    
    return executor;
  }, []);

  const processMessage = useCallback(async (
    message: string, 
    chatHistory?: Array<{role: 'user' | 'assistant', content: string}>
  ) => {
    if (isProcessing) return;

    setIsProcessing(true);

    try {
      const executor = setupExecutor();
      if (!executor) {
        throw new Error('Executor could not be initialized');
      }
      
      console.log('🚀 Executing AI System...');
      
      const result = await executor.processUserMessage(message, chatHistory);

      if (!result.success) {
        console.error('❌ Executor error:', result.response);
        props.onError(result.response || 'Unknown error');
        return;
      }

      if (!result.response || result.response.trim() === '') {
        console.error('❌ Empty response received:', result);
        props.onError('AI returned no valid response. Please try again.');
        return;
      }
      
      props.onResult(result);

    } catch (error) {
      console.error('❌ AI Pipeline error:', error);
      props.onError(
        error instanceof Error ? error.message : 'Unknown error'
      );
    } finally {
      setIsProcessing(false);
    }
  }, [isProcessing, setupExecutor, props]);

  return {
    processMessage,
    isProcessing
  };
}

