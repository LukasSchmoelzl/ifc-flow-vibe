// Claude Executor - Simplified for IFCFlow

import { BIMResult, createBIMResult } from './bim-result';
import { PromptBuilder } from './prompt-builder';
import { ResponseParser } from './response-parser';

const MAX_ITERATIONS = 5;

export class Executor {
  // Process user message and execute tool chain
  async processUserMessage(
    userMessage: string, 
    chatHistory?: Array<{role: 'user' | 'assistant', content: string}>
  ): Promise<BIMResult> {
    return this.runToolChain(userMessage, chatHistory || []);
  }

  // Run the tool execution chain with native Claude API
  private async runToolChain(
    userMessage: string, 
    chatHistory: Array<{role: 'user' | 'assistant', content: string}>
  ): Promise<BIMResult> {
    const messages: Array<{role: 'user' | 'assistant', content: any}> = [];
    let iteration = 0;
    
    // Add chat history
    chatHistory.forEach(msg => {
      messages.push({ role: msg.role, content: msg.content });
    });
    
    // Add user message
    messages.push({ role: 'user', content: userMessage });
    
    try {
      while (iteration < MAX_ITERATIONS) {
        iteration++;
        
        const systemPrompt = PromptBuilder.createSystemPrompt();
        
        // Send request to Claude (no tools for now)
        const response = await this.sendRequestToClaude(messages, [], systemPrompt);
        
        // Parse response
        const toolDecision = ResponseParser.extractToolDecision(response);

        if (toolDecision.error) {
          return this.buildErrorResponse();
        }

        // Handle final answer
        if (toolDecision.finalAnswer) {
          console.log(`✅ Final answer after ${iteration} iterations`);
          return this.buildSuccessResponse(toolDecision.finalAnswer);
        }
        
        // No final answer
        console.warn(`⚠️ No final answer in iteration ${iteration}`);
        break;
      }

      return this.buildMaxIterationsResponse();
      
    } catch (error) {
      console.error('❌ Execution failed:', error);
      return this.buildErrorResponse();
    }
  }

  // Send request to Claude API
  private async sendRequestToClaude(
    messages: Array<{role: 'user' | 'assistant', content: any}>,
    tools: any[],
    systemPrompt: string
  ): Promise<any> {
    const response = await fetch('/api/claude', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages,
        tools,
        systemPrompt
      }),
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    return await response.json();
  }

  // Response builders
  private buildSuccessResponse(response: string): BIMResult {
    return createBIMResult({
      response,
      success: true
    });
  }

  private buildErrorResponse(): BIMResult {
    return createBIMResult({
      response: 'Es gab einen Fehler bei der Verarbeitung Ihrer Anfrage.',
      success: false
    });
  }

  private buildMaxIterationsResponse(): BIMResult {
    return createBIMResult({
      response: 'Die Verarbeitung wurde nach maximalen Iterationen beendet.',
      success: false
    });
  }
}

