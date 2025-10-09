# Node Template Guide

## Minimale Boilerplate mit `createNode()`

### 1. Einfache Node (nur Content)

```tsx
import { FileText } from "lucide-react";
import { createNode } from "../base-node";
import { BaseNodeData } from "../node-types";

interface MyNodeData extends BaseNodeData {
  isLoading?: boolean;
  error?: string | null;
  // Deine spezifischen Properties
}

export const MyNode = createNode<MyNodeData>(
  {
    icon: FileText,
    color: "blue",
    loadingMessage: "Processing...",
  },
  (data) => (
    <div className="p-3 text-xs">
      Dein Content hier
    </div>
  )
);

MyNode.displayName = "MyNode";
```

### 2. Node mit Custom Handles

```tsx
import { Position } from "reactflow";

export const MyNode = createNode<MyNodeData>(
  {
    icon: FileText,
    color: "purple",
    width: "w-64", // Custom width
    handles: [
      { type: "target", position: Position.Left, id: "input" },
      { type: "source", position: Position.Right, id: "output1" },
      { type: "source", position: Position.Right, id: "output2" },
    ],
  },
  (data) => <YourContent />
);
```

### 3. Node mit voller Kontrolle (BaseNodeComponent)

```tsx
import { BaseNodeComponent } from "../base-node";

export const MyNode = memo(({ data, isConnectable }: NodeProps<MyNodeData>) => {
  return (
    <BaseNodeComponent 
      data={data} 
      isConnectable={isConnectable}
      config={{
        icon: FileText,
        color: "green",
      }}
    >
      <div className="p-3">
        Dein komplexer Content mit State, Hooks, etc.
      </div>
    </BaseNodeComponent>
  );
});
```

## Verfügbare Farben

- `blue` (default)
- `green`
- `purple`
- `orange`
- `red`

## Node Data Interface

```tsx
interface MyNodeData extends BaseNodeData {
  isLoading?: boolean;  // Zeigt Loading Indicator
  error?: string | null; // Zeigt Error Message
  // Deine Properties
  myCustomProp?: string;
}
```

## Executor erstellen

```tsx
// src/nodes/my-node/executor.ts
import type { NodeProcessor, ProcessorContext } from '@/src/lib/workflow-executor';

export class MyNodeProcessor implements NodeProcessor {
  async process(node: any, inputValues: any, context: ProcessorContext): Promise<any> {
    // Deine Logik
    return result;
  }
}
```

## Registrierung

1. **In `src/nodes/index.ts`:**
```tsx
import { MyNode } from "./my-node/my-node"

export const nodeTypes: NodeTypes = {
  myNode: MyNode,
  // ...
}
```

2. **In `src/lib/workflow-executor.ts`:**
```tsx
import { MyNodeProcessor } from "@/src/nodes/my-node/executor";

const NODE_PROCESSORS = {
  myNode: new MyNodeProcessor(),
  // ...
}
```

3. **In `src/components/sidebar.tsx`:**
```tsx
{
  id: "myNode",
  label: "My Node",
  icon: <FileText className="h-4 w-4 mr-2" />,
  status: "working",
}
```

