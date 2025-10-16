import { getAllLLMTools } from './tool-registry';
import { LLMCanvasActions } from '@/src/canvas/canvas-actions';

const MAX_ITERATIONS = 10;

const SYSTEM_PROMPT = `
        Du bist ein BIM-Assistent für IFCFlow, eine Node-basierte IFC-Workflow-Anwendung.

        WICHTIGE REGELN:
        - Antworte IMMER in der gleichen Sprache wie die Benutzeranfrage
        - Sei präzise und hilfreich bei IFC/BIM-bezogenen Fragen
        - Wenn Tools verfügbar sind, verwende sie um die Anfrage zu beantworten
        - Gib eine finale Antwort wenn alle Informationen gesammelt sind
        - Toolaufrufe erstellen Nodes. Nodes haben n eingänge und n ausgänge

        Du hilfst Benutzern bei:
        - IFC-Datei Analyse
        - Node-Workflow Erstellung
        - BIM-Daten Verarbeitung
        - 3D-Modell Visualisierung
      `.trim();

export interface ExecutionResult {
  success: boolean;
  response?: string;
}

export class Executor {
  private canvasActions = new LLMCanvasActions();

  async processUserMessage(
    userMessage: string, 
    chatHistory?: Array<{role: 'user' | 'assistant', content: string}>
  ): Promise<ExecutionResult> {
    return this.runToolChain(userMessage, chatHistory || []);
  }

  private async runToolChain(
    userMessage: string,
    chatHistory: Array<{role: 'user' | 'assistant', content: string}>
  ): Promise<ExecutionResult> {
    const messages: Array<{role: 'user' | 'assistant', content: any}> = [];
    this.canvasActions.reset();

    chatHistory.forEach(msg => {
      messages.push({ role: msg.role, content: msg.content });
    });

    messages.push({ role: 'user', content: userMessage });

    const tools = getAllLLMTools();

    console.log('========================================');
    console.log('🤖 SYSTEM PROMPT:');
    console.log('========================================');
    console.log(SYSTEM_PROMPT);
    console.log('========================================');
    console.log('🛠️  AVAILABLE TOOLS:');
    console.log('========================================');
    tools.forEach(tool => {
      console.log(`\n📦 ${tool.name}`);
      console.log(tool.description);
      console.log('Input Schema:', JSON.stringify(tool.input_schema, null, 2));
    });
    console.log('========================================\n');

    let iteration = 0;

    try {
      while (iteration < MAX_ITERATIONS) {
        iteration++;

        console.log(`\n📤 REQUEST TO CLAUDE (Iteration ${iteration}):`);
        console.log('Messages:', JSON.stringify(messages, null, 2));

        const response = await this.sendRequestToClaude(messages, tools, SYSTEM_PROMPT);

        console.log(`\n📥 RESPONSE FROM CLAUDE (Iteration ${iteration}):`);
        console.log('Stop Reason:', response.stop_reason);
        console.log('Content:', JSON.stringify(response.content, null, 2));
        
        if (response.stop_reason === 'end_turn') {
          const textContent = response.content.find((c: any) => c.type === 'text');
          if (textContent) {
            console.log(`✅ Final answer after ${iteration} iterations`);
            return { success: true, response: textContent.text };
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

              console.log(`\n🔧 TOOL USE: ${name}`);
              console.log('Tool Input:', JSON.stringify(input, null, 2));

              const nodeId = this.canvasActions.createNodeFromTool(name, input);
              this.canvasActions.connectToPreviousNode(nodeId);
              const result = await this.canvasActions.executeNode(nodeId);

              const resultStr = JSON.stringify(result);

              toolResults.push({
                type: 'tool_result',
                tool_use_id: id,
                content: resultStr,
              });

              console.log(`✅ TOOL RESULT:`, result);
              console.log(`📤 Sending back to Claude:`, resultStr);
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

      return { 
        success: false,
        response: 'Die Verarbeitung wurde nach maximalen Iterationen beendet.'
      };
      
    } catch (error) {
      console.error('❌ Execution failed:', error);
      return { 
        success: false,
        response: 'Es gab einen Fehler bei der Verarbeitung Ihrer Anfrage.'
      };
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
}


