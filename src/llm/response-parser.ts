// Response Parser for Claude AI

export interface ToolDecision {
  toolCalls?: Array<{ tool: string; parameters: any }>;
  finalAnswer?: string;
  error?: any;
}

export class ResponseParser {
  // Extract tool decision from Claude API response
  static extractToolDecision(data: any): ToolDecision {
    // Native Claude API format with content array
    if (data.content && Array.isArray(data.content)) {
      const toolUseBlocks = data.content.filter((block: any) => block.type === 'tool_use');
      const textBlocks = data.content.filter((block: any) => block.type === 'text');
      
      // Tool use detected
      if (toolUseBlocks.length > 0) {
        const toolCalls = toolUseBlocks.map((block: any) => ({
          tool: block.name,
          parameters: block.input
        }));
        return { toolCalls };
      }
      
      // Text response (final answer)
      if (textBlocks.length > 0) {
        const finalAnswer = textBlocks.map((block: any) => block.text).join('\n');
        return { finalAnswer };
      }
    }
    
    if (data.error) {
      return { error: data.error };
    }
    
    return { error: 'No response received' };
  }

  // Extract final answer from tool decision
  static extractFinalAnswer(finalAnswer: string): string {
    try {
      const parsed = JSON.parse(finalAnswer);
      if (parsed.finalAnswer) {
        return parsed.finalAnswer;
      }
    } catch {
      // Not JSON, return as-is
    }
    return finalAnswer;
  }
}

