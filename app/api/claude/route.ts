// Claude API Proxy - Simplified for IFCFlow

import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

const CLAUDE_MODEL = "claude-3-5-sonnet-20241022";
const CLAUDE_MAX_TOKENS = 4000;

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error('ANTHROPIC_API_KEY not configured');
    }
    
    const anthropic = new Anthropic({ apiKey });
    
    // Convert tools to Claude API format
    const claudeTools = data.tools?.map((tool: any) => ({
      name: tool.name,
      description: tool.description,
      input_schema: tool.input_schema
    })) || [];
    
    // Claude API Call with native tool support
    const response = await anthropic.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: CLAUDE_MAX_TOKENS,
      messages: data.messages,
      system: data.systemPrompt,
      tools: claudeTools.length > 0 ? claudeTools : undefined
    });
    
    return NextResponse.json({
      content: response.content,
      stop_reason: response.stop_reason,
      usage: response.usage
    });
    
  } catch (error) {
    console.error('❌ Claude API failed:', error);
    
    if (error instanceof Error) {
      console.error('❌ Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
    }
    
    return NextResponse.json(
      { 
        error: 'Claude API request failed', 
        code: 'API_ERROR',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    service: 'Claude AI Integration',
    status: 'ready',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
}

