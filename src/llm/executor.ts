import { BIMResult, createBIMResult } from './bim-result';
import { PromptBuilder } from './prompt-builder';
import { getAllLLMTools } from './tool-registry';
import { LLMCanvasActions } from './canvas-actions';

const MAX_ITERATIONS = 10;

export class Executor {
  private canvasActions = new LLMCanvasActions();

  async processUserMessage(
    userMessage: string, 
    chatHistory?: Array<{role: 'user' | 'assistant', content: string}>
  ): Promise<BIMResult> {
    return this.runToolChain(userMessage, chatHistory || []);
  }

  private async runToolChain(
    userMessage: string, 
    chatHistory: Array<{role: 'user' | 'assistant', content: string}>
  ): Promise<BIMResult> {
    const messages: Array<{role: 'user' | 'assistant', content: any}> = [];
    this.canvasActions.reset();
    
    chatHistory.forEach(msg => {
      messages.push({ role: msg.role, content: msg.content });
    });
    
    messages.push({ role: 'user', content: userMessage });
    
    const tools = getAllLLMTools();
    let iteration = 0;
    
    try {
      while (iteration < MAX_ITERATIONS) {
        iteration++;
        
        const systemPrompt = PromptBuilder.createSystemPrompt();
        const response = await this.sendRequestToClaude(messages, tools, systemPrompt);
        
        if (response.stop_reason === 'end_turn') {
          const textContent = response.content.find((c: any) => c.type === 'text');
          if (textContent) {
            console.log(`✅ Final answer after ${iteration} iterations`);
            return this.buildSuccessResponse(textContent.text);
          }
          break;
        }

        if (response.stop_reason === 'tool_use') {
          messages.push({
            role: 'assistant',
            content: response.content,
          });
          
          const toolResults: any[] = [];
          
          for (const content of response.content) {
            if (content.type === 'tool_use') {
              const { name, input, id } = content;
              
              console.log(`🔧 Tool: ${name}`, input);
              
              const nodeId = this.canvasActions.createNodeFromTool(name, input);
              this.canvasActions.connectToPreviousNode(nodeId);
              const result = await this.canvasActions.executeNode(nodeId);
              this.canvasActions.updateContext(nodeId);
              
              toolResults.push({
                type: 'tool_result',
                tool_use_id: id,
                content: JSON.stringify(result),
              });
              
              console.log(`✅ Result:`, result);
            }
          }
          
          messages.push({
            role: 'user',
            content: toolResults,
          });
          
          continue;
        }
        
        break;
      }

      return this.buildMaxIterationsResponse();
      
    } catch (error) {
      console.error('❌ Execution failed:', error);
      return this.buildErrorResponse();
    }
  }

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

