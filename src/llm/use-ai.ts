import { useRef, useCallback, useState } from 'react';
import { Executor, ExecutionResult } from '@/src/llm';

interface UseAIProps {
  onResult: (result: ExecutionResult) => void;
  onError: (error: string) => void;
}

export function useAI(props: UseAIProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const executorRef = useRef<Executor>(new Executor());

  const processMessage = useCallback(async (
    message: string, 
    chatHistory?: Array<{role: 'user' | 'assistant', content: string}>
  ) => {
    if (isProcessing) return;

    setIsProcessing(true);

    try {
      console.log('🚀 Executing AI System...');
      
      const result = await executorRef.current.processUserMessage(message, chatHistory);

      if (!result.success) {
        console.error('❌ Executor error:', result.response);
        props.onError(result.response || 'Unknown error');
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
  }, [isProcessing, props]);

  return {
    processMessage,
    isProcessing
  };
}

