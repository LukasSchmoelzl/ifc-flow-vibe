# AI Chat System Integration

Simplified Claude AI integration for IFCFlow based on frag2-langChain.

## Structure

```
src/llm/
├── executor.ts         # Main AI orchestration
├── prompt-builder.ts   # System prompts
├── response-parser.ts  # Response parsing
├── bim-result.ts      # Result types
└── index.ts           # Exports

app/api/claude/
└── route.ts           # Next.js API proxy

src/hooks/
└── use-ai.ts         # React hook for AI

src/ui/components/chat/
├── chat-panel.tsx    # Main chat UI
├── chat-input.tsx    # Input component
├── chat-message.tsx  # Message display
└── index.ts         # Exports
```

## Setup

1. Install dependencies:
```bash
npm install
```

2. Add Claude API key to `.env.local`:
```
ANTHROPIC_API_KEY=your_key_here
```

Get your key from: https://console.anthropic.com/settings/keys

## Usage

### In Your Component

```tsx
import { ChatPanel } from '@/src/ui/components/chat';

export function MyComponent() {
  return (
    <div className="h-screen">
      <ChatPanel />
    </div>
  );
}
```

### Custom Hook Usage

```tsx
import { useAI } from '@/src/hooks/use-ai';

function MyComponent() {
  const { processMessage, isProcessing } = useAI({
    onResult: (result) => console.log(result),
    onError: (error) => console.error(error)
  });

  const handleChat = async () => {
    await processMessage("Explain this IFC model");
  };

  return <button onClick={handleChat}>Ask AI</button>;
}
```

## Features

- ✅ Claude AI integration (Sonnet 3.5)
- ✅ Markdown response formatting
- ✅ Chat history (last 10 messages)
- ✅ Error handling
- ✅ Loading states
- ✅ Keyboard shortcuts (Enter to send)

## Future Enhancements

- [ ] Tool system for IFC-specific queries
- [ ] Model context injection
- [ ] Multi-modal support (images)
- [ ] Chat history persistence
- [ ] Export chat to file

